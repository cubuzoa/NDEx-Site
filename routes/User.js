module.db = null;

var common = require("./Common.js");
var fs = require('fs');

exports.init = function (orient, callback) {
    module.db = orient;
};

exports.createUser = function (username, password, recoveryEmail, callback) {
    console.log("calling createUser with arguments: '" + username + "' '" + password + "'");
    var selectUserByUserNameCmd = "select from xUser where username = '" + username + "'";
    var insertUserCmd = "insert into xUser (username, password) values('" + username + "', '" + password + "')";
    //console.log("first checking that username is not taken");
    module.db.command(selectUserByUserNameCmd, function (err, users) {
        if (err) {
            callback({error: err, status: 500});
        } else {
            //console.log("Existing users: " + JSON.stringify(users));
            if (users && users.length > 0) {
                callback({error: "username '" + username + "' is already in use", status: 500});
            } else {
                //console.log("now inserting the new user");
                //console.log(insertUserCmd);
                module.db.command(insertUserCmd, function (err, results) {
                    if (err) {
                        console.log("insert of new user yields error : " + err);
                        callback({error: err});
                    } else {
                        var user = results[0];
                        //console.log(JSON.stringify(user));
                        callback({status: 200, error: err, jid: user['@rid'], username: user['username']});
                    }

                });
            }
        }
    });
};

/*
 uploadImg(profile.foregroundImg,'account_img/users/foreground/', user.username, function(err, results){
 if (common.checkErr(err, "uploading foreground image", callback)){
 profile.foregroundImg = results.name;

 uploadImg(profile.backgroundImg,'account_img/users/background/', user.username, function(err, results){
 if (common.checkErr(err, "uploading foreground image", callback)){
 profile.backgroundImg = results.name;
 */
exports.updateUserProfile = function (userRID, profile, callback) {
    //TODO add uploader for background img
    var cmd = "select from xUser where @rid = " + userRID + "";
    console.log(cmd);
    module.db.command(cmd, function (err, users) {
        if (common.checkErr(err, "finding user", callback)) {
            var user = users[0];
            var profileStrings = [
                    "firstName = '" + profile.firstName + "'",
                    "lastName = '" + profile.lastName + "'",
                    "website = '" + profile.website + "'",
                    "description = '" + profile.description + "'"],
                setString = profileStrings.join(", "),
                updateCmd = "update " + userRID + " set " + setString;

            console.log(updateCmd);
            module.db.command(updateCmd, function (err, result) {
                callback({profile: profile, error: err, status: 200})
            });
        }
    });
};

exports.findUsers = function (searchExpression, limit, offset, callback) {
    console.log("calling findUsers with arguments: " + searchExpression + " " + limit + " " + offset);
    var start = (offset)*limit;
	var descriptors = " username as username, @rid as jid ";
    var cmd = "select" + descriptors + "from xUser where username.toUpperCase()  like  '%" + searchExpression + "%' order by creation_date desc skip " +  start + " limit " + limit;
    console.log(cmd);
    module.db.command(cmd, function (err, users) {
		for (i in users){
			var user = users[i];
			user.jid = common.convertFromRID(user.jid);
		}
        callback({users: users, error: err});
    });
};

exports.getUserByName = function (username, callback) {
    console.log("calling getUserByName with username = '" + username + "'");
    var cmd = "select @rid as jid from xUser where username = '" + username + "'";
    console.log(cmd);
    module.db.command(cmd, function (err, users) {
        // TODO - case where more than one user returned...
        if (err) {
            console.log("caught orient db error " + e);
            callback({user: null, error: err, status: 500});
        } else {
            try {
                if (!users || users.length < 1) {
                    console.log("found no users by '" + username + "'");
                    callback({status: 404});
                } else {
                    console.log("found " + users.length + " users, first one is " + users[0].inspect);
                    callback({user: users[0]});
                }
            }
            catch (e) {
                console.log("caught error " + e);
                callback({user: null, error: e.toString(), status: 500});
            }
        }
    });
};

exports.getUser = function (userRID, callback) {
    console.log("calling getUser with userRID = '" + userRID + "'");
    module.db.loadRecord(userRID, function (err, user) {

        if (common.checkErr(err, "finding user", callback)) {
            try {
                if (!user) {
                    console.log("found no users by id = '" + userRID + "'");
                    callback({status: 404});
                } else {

                    var profile = {};

                    if (user["@class"] !== "xUser")
                        throw new Error("Document " + userRID + " is not a user. (actual class is '" + user["@class"] + "')");

                    console.log("found user " + user["@rid"]);

                    if (user.firstName) profile.firstName = user.firstName;
                    if (user.lastName) profile.lastName = user.lastName;
                    if (user.website) profile.website = user.website;
                    if (user.foregroundImg) profile.foregroundImg = user.foregroundImg;
                    if (user.backgroundImg) profile.backgroundImg = user.backgroundImg;
                    if (user.description) profile.description = user.description;

                    var result = {username: user.username, profile: profile, ownedNetworks: {}, ownedGroups: {}};



                    // get owned networks
                    var networkDescriptors = "properties.title as title, @rid as jid, nodesCount as nodeCount, edgesCount as edgeCount";
                    var traverseExpression = "select flatten(out(xOwnsNetwork)) from " + userRID;

                    var networks_cmd = "select " + networkDescriptors + " from (" + traverseExpression + ") where  @class = 'xNetwork'";
                    module.db.command(networks_cmd, function (err, networks) {
                        if (common.checkErr(err, "getting owned networks", callback)) {

                            // process the networks
                            for (i in networks) {
                                var network = networks[i];
                                network.jid = common.convertFromRID(network.jid);
                            }
                            result.ownedNetworks = networks;


                            // get owned groups
                            var groupDescriptors = "organizationName as organizationName, @rid as jid";
                            var traverseExpression = "select flatten(out(xOwnsGroup)) from " + userRID;
                            var groups_cmd = "select " + groupDescriptors + " from (" + traverseExpression + ") where @class = 'xGroup'";
                            console.log("groups_cmd = " + groups_cmd);
                            module.db.command(groups_cmd, function (err, groups) {
                                if (common.checkErr(err, "getting owned groups", callback)) {

                                    // process the groups
                                    for (i in groups) {
                                        var group = groups[i];
                                        group.jid = common.convertFromRID(group.jid);
                                    }
                                    result.ownedGroups = groups;
                                }
                                console.log("callback: " + JSON.stringify(result));
                                callback({user: result, error: err});

                            });

                        }
                    });
                }
            }

            catch (e) {
                console.log("caught error " + e);
                callback({network: null, error: e.toString(), status: 500});
            }
        }
    });
};



function getWorkSurfaceInternal(userRID, callback){
    var networkDescriptors = "properties.title as title, @rid as rid, nodesCount as nodeCount, edgesCount as edgeCount";
    var traverseExpression = "select flatten(workspace) from " + userRID;
    var networks_cmd = "select " + networkDescriptors + " from (" + traverseExpression + ") where  @class = 'xNetwork'";

    console.log(networks_cmd);
    module.db.command(networks_cmd, function (err, worksurface_networks) {
        callback(err, worksurface_networks);
    });
}

exports.getUserWorkSurface = function (userRID, callback) {
    console.log("calling getUserWorkSurface with userRID = '" + userRID + "'");
    getWorkSurfaceInternal(userRID, function(err, worksurface_networks){
        if (common.checkErr(err, "getting user worksurface networks", callback)) {
        // process the worksurface_networks
            for (i in worksurface_networks) {
                var network = worksurface_networks[i];
                network.jid = common.convertFromRID(network.rid);
            }
            callback({networks: worksurface_networks, error: err});
        }
    });
}

exports.addNetworkToUserWorkSurface = function (userRID, networkRID, callback) {
    console.log("calling addNetworkToUserWorkSurface with userRID = '" + userRID + "' and networkRID = '" + networkRID + "'");
    getWorkSurfaceInternal(userRID, function(err, worksurface_networks){
        if (common.checkErr(err, "getting user worksurface networks", callback)) {
            // return error if networkRID already on workSurface
            for (i in worksurface_networks) {
                var network = worksurface_networks[i];
                if (network.rid == networkRID){
                    callback({status: 400, error: "network " + networkRID + " already in user worksurface"});
                }
            }

            // Otherwise, update the workSurface
            var updateCmd = "update " + userRID + " add workspace = " + networkRID;
            console.log(updateCmd);
            module.db.command(updateCmd, function (err, worksurface) {
                if (common.checkErr(err, "adding network " + networkRID + " to worksurface of user " + userRID, callback)) {
                    getWorkSurfaceInternal(userRID, function(err, worksurface_networks){
                        // return the worksurface if successful
                        for (i in worksurface_networks) {
                            var network = worksurface_networks[i];
                            network.jid = common.convertFromRID(network.rid);
                        }
                        callback({networks: worksurface_networks, error: err});

                    });
                }
            });
        }
    });
}

exports.deleteNetworkFromUserWorkSurface = function (userRID, networkRID, callback) {
    console.log("calling deleteNetworkFromUserWorkSurface with userRID = '" + userRID + "' and networkRID = '" + networkRID + "'");
    getWorkSurfaceInternal(userRID, function(err, worksurface_networks){
        if (common.checkErr(err, "getting user worksurface networks", callback)) {
            // return error if networkRID already on workSurface
            var missing = true;
            for (i in worksurface_networks) {
                var network = worksurface_networks[i];
                if (network.rid == networkRID){
                    missing = false;
                }
            }
            if (missing) callback({status: 400, error: "network " + networkRID + " not in user worksurface"});

            // Otherwise, update the workSurface
            var updateCmd = "update " + userRID + " remove workspace = " + networkRID;
            console.log(updateCmd);
            module.db.command(updateCmd, function (err, worksurface) {
                if (common.checkErr(err, "removing network " + networkRID + " from worksurface of user " + userRID, callback)){
                    getWorkSurfaceInternal(userRID, function(err, worksurface_networks){
                        // return the worksurface if successful
                        for (i in worksurface_networks) {
                            var network = worksurface_networks[i];
                            network.jid = common.convertFromRID(network.rid);
                        }
                        callback({networks: worksurface_networks, error: err});

                    });
                }
            });
        }
    });
}

//
// TODO: clean up links from user.
// This is a hard problem since the user may be the owner of groups and networks
// What do we want the behavior to be?
// 
exports.deleteUser = function (userRID, callback) {
    console.log("calling delete user with userRID = '" + userRID + "'");

    //checking if user exists
    var cmd = "select from xUser where @rid = " + userRID + "";
    module.db.command(cmd, function (err, users) {
        if (common.checkErr(err, "checking existence of user " + userRID, callback)) {
            console.log("users found " + users.length);
            if (!users || users.length < 1) {
                console.log("found no users by id = '" + userRID + "'");
                callback({status: 404, error: "Found no user by id = '" + userRID + "'"});
            }
            else {
                //deleting user
                var updateCmd = "delete from " + userRID + " where @class = 'xUser'";
                console.log(updateCmd);
                module.db.command(updateCmd, function (err) {
                    if (common.checkErr(err, "deleting user " + userRID, callback)) {
                        callback({status: 200});
                    }
                });
            }
        }
    });
};

exports.uploadAccountImage = function(accountId, type, imageFile, callback) {
    console.log('File uploaded to: ' + imageFile.path + ' - ' + imageFile.size + ' bytes');

    // First, find accountName for accountId
    var accountName;
    module.db.loadRecord(accountId, function (err, account) {

        if (common.checkErr(err, "finding account", callback)) {
            try {
                if (!account) {
                    console.log("found no account by id = '" + accountId + "'");
                    callback({status: 404});
                } else {

                    var profile = {};

                    if (user["@class"] == "xUser") accountName = account.username;
                    if (user["@class"] == "xGroup") accountName = account.groupname;
                    if (!accountName)  callback({error: "account is neither a user or a group"});

                    var storagePath = "./img/" + type + "/" + accountName + "." + imageFile.type;

                    var results = { name: storagePath + '.jpg', filesize: ''};

                    fs.rename(imageFile.path, storagePath, function(){
                        fs.stat(storagePath, function (err, stats) {
                            results.filesize = stats.size;
                            console.log('File copied to: ' + storagePath + ' with storage size of ' + stats.size + ' bytes');
                            callback(err, results);
                        });
                    });
                }
            }
            catch (e) {
                console.log("caught error " + e);
                callback({user: null, error: e.toString(), status: 500});
            }
        }
    });
}


