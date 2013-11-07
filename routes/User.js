module.db = null;

var common = require("./Common.js");
var fs = require('fs');

module.dbHost = "http://localhost:2480/";
module.dbUser = "admin";
module.dbPassword = "admin";
module.dbName = "ndex";

exports.init = function (orient, callback) {
    module.db = orient;
};

exports.createUser = function (username, password, recoveryEmail, callback) {
    console.log("calling createUser with arguments: '" + username + "' '" + password + "'");

    var postData = {
        "username": username,
        "password": password
    };

    common.ndexPost(module.dbHost, "ndexCreateUser/" + module.dbName, module.dbUser, module.dbPassword, postData,
        function (result) {
            callback({status: 200, jid: result.jid, username: result.username});
        },
        function (err) {
            callback({error: err.toString(), status: 500});
        });
};

exports.updateUserProfile = function (userRID, profile, callback) {
    var postData = {
        "profile": profile,
        "userJid": userRID
    };

    common.ndexPost(module.dbHost, "ndexUpdateUserProfile/" + module.dbName, module.dbUser, module.dbPassword, postData,
        function (result) {
            callback({status: 200, profile: profile});
        },
        function (err) {
            callback({error: err.toString(), status: 500});
        });
};

exports.findUsers = function (searchExpression, limit, offset, callback) {
    console.log("calling findUsers with arguments: " + searchExpression + " " + limit + " " + offset);

    common.ndexGet(module.dbHost, "ndexFindUsers/" + module.dbName, module.dbUser, module.dbPassword,
        {searchExpression: searchExpression, limit: limit, offset: offset},
        function (result) {
            callback({users: result.users});
        },
        function (err) {
            callback({error: err.toString(), status: 500});
        }
    );
};

exports.getUser = function (userRID, callback) {
    userRID = common.convertFromRID(userRID);

    console.log("calling getUser with userRID = '" + userRID + "'");

    common.ndexGet(module.dbHost, "ndexGetUserById/" + module.dbName, module.dbUser, module.dbPassword,
        {userJid: userRID},
        function (result) {
            callback({user: result.user});
        },
        function (err) {
            callback({error: err.toString(), status: 500});
        }
    );
};


exports.getUserWorkSurface = function (userRID, callback) {
    console.log("calling getUserWorkSurface with userRID = '" + userRID + "'");

    common.ndexGet(module.dbHost, "ndexGetUserWorkSurface/" + module.dbName, module.dbUser, module.dbPassword,
        {userJid: userRID},
        function (result) {
            callback({networks: result.networks});
        },
        function (err) {
            callback({error: err.toString(), status: 500});
        }
    );
};

exports.addNetworkToUserWorkSurface = function (userRID, networkRID, callback) {
    console.log("calling addNetworkToUserWorkSurface with userRID = '" + userRID + "' and networkRID = '" + networkRID + "'");
    var postData = {
        "networkJid": networkRID,
        "userJid": userRID
    };

    common.ndexPost(module.dbHost, "ndexAddNetworkToUserWorkSurface/" + module.dbName, module.dbUser, module.dbPassword, postData,
        function (result) {
            exports.getUserWorkSurface(userRID, callback);
        },
        function (err) {
            callback({error: err.toString(), status: 500});
        });
};


exports.deleteNetworkFromUserWorkSurface = function (userRID, networkRID, callback) {
    console.log("calling deleteNetworkFromUserWorkSurface with userRID = '" + userRID + "' and networkRID = '" + networkRID + "'");

    var postData = {
        "networkJid": networkRID,
        "userJid": userRID
    };

    common.ndexPost(module.dbHost, "ndexDeleteNetworkFromUserWorkSurface/" + module.dbName, module.dbUser, module.dbPassword, postData,
        function (result) {
            exports.getUserWorkSurface(userRID, callback);
        },
        function (err) {
            callback({error: err.toString(), status: 500});
        });
};

//
// TODO: clean up links from user.
// This is a hard problem since the user may be the owner of groups and networks
// What do we want the behavior to be?
// 
exports.deleteUser = function (userRID, callback) {
    console.log("calling delete user with userRID = '" + userRID + "'");
    userRID = common.convertFromRID(userRID);

    var postData = {
        "userJid": userRID
    };

    common.ndexPost(module.dbHost, "ndexDeleteUser/" + module.dbName, module.dbUser, module.dbPassword, postData,
        function (result) {
            callback({status: 200});
        },
        function (err) {
            callback({error: err.toString(), status: 500});
        });
};

exports.uploadAccountImage = function (accountId, type, imageFile, callback) {
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

                    fs.rename(imageFile.path, storagePath, function () {
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


