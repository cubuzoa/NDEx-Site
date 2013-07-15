module.db = null;

exports.init = function(orient, callback) {
    module.db = orient;
};

function convertFromRID(RID){
	return RID.replace("#","C").replace(":", "R");
}

exports.createUser = function(username, password, callback){
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
						callback({error : err, jid: user['@rid'], username: user['username']});
					}
					
				});
			}
    	}
    });
};

exports.updateUserProfile = function(userRID, profile, callback){
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
	var cmd = "select from " + userRID + "";
	console.log(cmd);
	module.db.command(cmd, function(err, users) {

		if (exports.checkErr(err, "finding user", callback)){
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
						if(exports.checkErr(err, "getting owned networks", callback)){
						
							// process the networks
							for (i in networks){
								var network = networks[i];
								network.jid = convertFromRID(network.jid);
							}
							result.ownedNetworks = networks;
						}
									
						// get owned groups
						var groupDescriptors = "organizationName as organizationName, @rid as jid";
						var traverseExpression = "traverse V.out, E.in from " + userRID + " while $depth <= 2"		 
						var groups_cmd = "select " + groupDescriptors + " from (" + traverseExpression + ") where @class = 'xGroup'";
						module.db.command(groups_cmd, function(err, groups) {
							if(exports.checkErr(err, "getting owned groups", callback)){
						
								// process the groups
								for (i in groups){
									var group = groups[i];
									group.jid = convertFromRID(group.jid);
								}
								result.ownedGroups = groups;
							}
							callback({user : result, error: err});
							
						});
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

exports.checkErr = function(err, where, callback){
	if (err){
			console.log("DB error, " + where + " : " + err);
			callback({network : null, error : err, status : 500});
			return false;
	}
	return true;
};

exports.deleteUser = function (userRID, callback){
	console.log("calling delete user with userRID = '" + userRID + "'");
	var cmd = "delete from " + userRID;
	console.log(cmd);
	module.db.command(cmd, function(err) {
        callback({error : err});
    });
};
