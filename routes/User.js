module.db = null;

var common = require("./Common.js");
var fs = require('fs');

function uploadImg( path, destination, name, callback) {
	//TODO read comments on here and where used
	//add name check for filename to avoid overwrite, maybe include jid?
	//fs.readFile and fs.writeFile may be replaced by fs.rename
	var tempPath = path; //hardwired for now
	var targetPath =  destination + name + '.jpg';
	var results = { name : name + '.jpg', filesize : ''};
	fs.readFile('img/foreground/treyideker.jpg', function (err, data) {
		// ...
		if (err){
        	callback(err);
        } else {
			fs.writeFile(targetPath, data, function (err) {
				if (err){
					callback(err);
				} else {
					// delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
					fs.unlink(tempPath, function() {
						if (err) {
							callback( err);
						} else {
							fs.stat(targetPath, function (err, stats) {
								results.filesize = stats.size;
					 			console.log('File uploaded to: ' + targetPath + ' - ' + stats.size + ' bytes');
					 			callback(err, results);
							});
						}
					});
				}
			});
		}
	});
}

exports.init = function(orient, callback) {
    module.db = orient;   
};

exports.createUser = function(username, password, recoveryEmail, callback){
	console.log("calling createUser with arguments: '" + username + "' '" + password + "'");
	var selectUserByUserNameCmd = "select from xUser where username = '" + username + "'";
	var insertUserCmd = "insert into xUser (username, password) values('" + username + "', '" + password + "')";
	//console.log("first checking that username is not taken");
	module.db.command(selectUserByUserNameCmd, function(err, users) {
		if (err) {
			callback( {error : err, status : 500});
		} else {
			//console.log("Existing users: " + JSON.stringify(users));
			if (users && users.length > 0){
				callback({error : "username '" + username + "' is already in use", status : 500});
			} else {
				//console.log("now inserting the new user");
				//console.log(insertUserCmd);
				module.db.command(insertUserCmd, function(err, results) {
					if (err){
						console.log("insert of new user yields error : " + err);
						callback({error : err});
					} else {
						var user = results[0];
						//console.log(JSON.stringify(user));
						callback({status: 200, error : err, jid: user['@rid'], username: user['username']});
					}
					
				});
			}
    	}
    });
};

exports.updateUserProfile = function(userRID, profile, callback){
	uploadImg(profile.foregroundImg,'img/foreground/', 'name', function(err, results){
		if (common.checkErr(err, "uploading foreground image", callback)){
			profile.foregroundImg = results.name;
			//TODO add uploader for background img
			var profileStrings = [
					"firstName = '" + profile.firstName + "'",
					"lastName = '" + profile.lastName + "'",
					"website = '" + profile.website + "'",
					"foregroundImg = '" + profile.foregroundImg + "'",
					"backgroundImg = '" + profile.backgroundImg + "'",
					"description = '" + profile.description + "'"],
				setString = profileStrings.join(", "),
				updateCmd = "update " + userRID + " set " + setString;
				console.log(updateCmd);
			module.db.command(updateCmd, function(err, result){
				callback({profile : profile, error: err, status : 200})
			});
		}
	});
};

exports.findUsersByUserName = function (nameExpression, limit, offset, callback){
	console.log("calling findUsersByUserName with arguments: " + nameExpression + " " + limit + " " + offset);
	var cmd = "select from xUser where username like " + nameExpression + " order by creation_date desc limit " + limit;
	console.log(cmd);
	module.db.command(cmd, function(err, users) {
        callback({users : users, error : err});
    });
};

exports.getUserByName = function(username, callback){
	console.log("calling getUserByName with username = '" + username + "'");
	var cmd = "select from xUser where username = '" + username + "'";
	console.log(cmd);
	module.db.command(cmd, function(err, users) {
		// TODO - case where more than one user returned...
		if (err){
			console.log("caught orient db error " + e);
			callback({user : null, error : err, status : 500});
		} else {
			try {
				if (!users || users.length < 1){
					console.log("found no users by '" + username + "'");
					callback({status : 404});
				} else {
					console.log("found " + users.length + " users, first one is " + users[0].inspect);
					callback({user : users[0]});
				}
			}
			catch (e){
				console.log("caught error " + e);
				callback({user : null, error : e.toString(), status : 500});	
			}
		}
    });
};

exports.getUser = function(userRID, callback){
	console.log("calling getUser with userRID = '" + userRID + "'");
	var cmd = "select from xUser where @rid = " + userRID + "";
	console.log(cmd);
	module.db.command(cmd, function(err, users) {

		if (common.checkErr(err, "finding user", callback)){
			try {
				if (!users || users.length < 1){
					console.log("found no users by id = '" + userRID + "'");
					callback({status : 404});
				} else {
				
					var user = users[0], 
						profile = {};
					
					console.log("found " + users.length + " users, first one is " + user["@rid"]);
					
					if (user.firstName) profile.firstName = user.firstName; 
					if (user.lastName) profile.lastName = user.lastName; 
					if (user.website) profile.website = user.website; 
					if (user.foregroundImg) profile.foregroundImg = user.foregroundImg; 
					if (user.backgroundImg) profile.backgroundImg = user.backgroundImg; 
					if (user.description) profile.description = user.description;
					
					result = {username: user.username, profile : profile, ownedNetworks: {}, ownedGroups: {}};
					
					// get owned networks
					var networkDescriptors = "properties.title as title, @rid as jid, nodes.size() as nodeCount, edges.size() as edgeCount";
					var traverseExpression = "traverse V.out, E.in from " + userRID + " while $depth <= 2"
			 
					var networks_cmd = "select " + networkDescriptors + " from (" + traverseExpression + ") where  @class = 'xNetwork'";
					module.db.command(networks_cmd, function(err, networks) {
						if(common.checkErr(err, "getting owned networks", callback)){
						
								// process the networks
							for (i in networks){
								var network = networks[i];
								network.jid = common.convertFromRID(network.jid);
							}
							result.ownedNetworks = networks;

									
							// get owned groups
							var groupDescriptors = "organizationName as organizationName, @rid as jid";
							var traverseExpression = "traverse V.out, E.in from " + userRID + " while $depth <= 2"		 
							var groups_cmd = "select " + groupDescriptors + " from (" + traverseExpression + ") where @class = 'xGroup'";
							module.db.command(groups_cmd, function(err, groups) {
								if(common.checkErr(err, "getting owned groups", callback)){
						
									// process the groups
									for (i in groups){
										var group = groups[i];
										group.jid = common.convertFromRID(group.jid);
									}
									result.ownedGroups = groups;
								}
									
								callback({user : result, error: err});
							
							});
							
						}
					});	
				}
			}
			
			catch (e){
					console.log("caught error " + e);
					callback({network : null, error : e.toString(), status : 500});	
			}
		}
	});
};

exports.getUserWorkspace = function(userRID, callback){
	console.log("calling getUserWorkspace with userRID = '" + userRID + "'");
	
	// TODO : check that requester has permission
	
	var cmd = "select from xUser where @rid = " + userRID + "";
		console.log(cmd);
	//checking that user exists
	module.db.command(cmd, function(err, users) {
		if (common.checkErr(err, "finding user", callback)){
			if (!users || users.length < 1){
				console.log("found no users by id = '" + userRID + "'");
				callback({status : 404});
			} else {
				//user exists
				// when getting the workspace networks,
				// we return network descriptors back for each 
				// network ID found so the interface can display without further queries
	
				var networkDescriptors = "properties.title as title, @rid as jid, nodes.size() as nodeCount, edges.size() as edgeCount";
				var traverseExpression = "traverse workspace from " + userRID + " while $depth <= 2"
				var networks_cmd = "select " + networkDescriptors + " from (" + traverseExpression + ") where  @class = 'xNetwork'";
	
				console.log(networks_cmd);
				module.db.command(networks_cmd, function(err, workspace_networks) {
					if(common.checkErr(err, "getting user workspace networks", callback)){	
						// process the workspace_networks
						for (i in workspace_networks){
							var network = workspace_networks[i];
							network.jid = common.convertFromRID(network.jid);
						}
					}
					callback({networks : workspace_networks, error: err});		
				});
			}
		}
	});
}

exports.addNetworkToUserWorkspace = function(userRID, networkRID, callback){
	console.log("calling addNetworkToUserWorkspace with userRID = '" + userRID + "' and networkRID = '" + networkRID + "'");
	
	// TODO : check that requester has permission
	
	module.db.command("select username, workspace from " + userRID + " where @class = 'xUser'", function(err, results){
		
		if(common.checkErr(err, "checking user before adding to workspace ", callback)){
			if (!results || results.length < 1){
				console.log("found no users by id = '" + userRID + "'");
				callback({status : 404, error : "Found no user by id = '" + userRID + "'"});
			} else {
				var user_data = results[0];
				
				if (user_data.workspace && common.contains(user_data.workspace, networkRID)){
					// aborting, already contains this network
					callback({status : 400, error : "network " + networkRID + " already in user workspace"});
				
				} else {
					// Check that network exists
					module.db.command("select @rid as rid from " + networkRID + " where @class = 'xNetwork'", function(err, network_ids){
						if(common.checkErr(err, "checking network before adding to workspace ", callback)){
							if (!network_ids || network_ids.length < 1){
								callback({status : 404, error : "Found no network by id = '" + networkRID + "'"});
							} else {
								//
								// User and Network exist, do the update:
								var updateCmd = "update " + userRID + " add workspace = " + networkRID;
								console.log(updateCmd);
								module.db.command(updateCmd, function(err, workspace) {
									if (common.checkErr(err, "adding network " + networkRID + " to workspace of user " + userRID, callback)){
										callback({status : 200});
									}
								});
							}
						
						}
					});
					
				}
			}
					
		}
	});	

}


exports.deleteNetworkFromUserWorkspace = function(userRID, networkRID, callback){
	console.log("calling deleteNetworkFromUserWorkspace with userRID = '" + userRID + "' and networkRID = '" + networkRID + "'");
	
	// TODO : check that user exists, that requester has permission
	
	module.db.command("select username, workspace from " + userRID + " where @class = 'xUser'", function(err, results){
		if(common.checkErr(err, "checking user before adding to workspace ", callback)){
			if (!results || results.length < 1){
				console.log("found no users by id = '" + userRID + "'");
				callback({status : 404, error : "Found no user by id = '" + userRID + "'"});
			} else {
				var user_data = results[0];
			
				if (!user_data.workspace || !common.contains(user_data.workspace, networkRID)){
					// aborting, does not contain this network
					callback({status : 404, error : "network " + networkRID + " not in user workspace"});
				
				} else {
					// User exists and networkRID is in the workspace, do the update:
					var updateCmd = "update " + userRID + " remove workspace = " + networkRID;
					console.log(updateCmd);
					module.db.command(updateCmd, function(err, workspace) {
						if(common.checkErr(err, "removing network " + networkRID + " from workspace of user " + userRID, callback)){
							callback({status : 200});
						}
					});
				}
						
			}
					
		}
	});	

}

//
// TODO: clean up links from user.
// This is a hard problem since the user may be the owner of groups and networks
// What do we want the behavior to be?
// 
exports.deleteUser = function (userRID, callback){
	console.log("calling delete user with userRID = '" + userRID + "'");
	
	//checking if user exists
	var cmd = "select from xUser where @rid = " + userRID + "";
	module.db.command(cmd,function(err,users){
		if(common.checkErr(err, "checking existence of user " + userRID, callback)){
			console.log("users found " + users.length);
			if (!users || users.length < 1){
				console.log("found no users by id = '" + userRID + "'");
				callback({status : 404, error : "Found no user by id = '" + userRID + "'"});
			} 
			else {
			//deleting user
				var updateCmd = "delete from " + userRID + " where @class = 'xUser'";
				console.log(updateCmd);
				module.db.command(updateCmd, function(err) {
					if (common.checkErr(err, "deleting user " + userRID, callback)){
						callback({status : 200});
					}
			    	});
			    }
		}
	});
};
