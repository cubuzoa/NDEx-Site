module.db = null;

exports.init = function(orient, callback) {
    module.db = orient;
};

function convertFromRID(RID){
	return RID.replace("#","C").replace(":", "R");
}

exports.createGroup = function(groupname, password, callback){
	console.log("calling createGroup with arguments: '" + groupname + "' '" + password + "'");
	var selectGroupByGroupNameCmd = "select from xGroup where groupname = '" + groupname + "'";
	var insertGroupCmd = "insert into xGroup (groupname, password) values('" + groupname + "', '" + password + "')";
	//console.log("first checking that groupname is not taken");
	module.db.command(selectGroupByGroupNameCmd, function(err, groups) {
		if (err) {
			callback( {error : err, status : 500});
		} else {
			//console.log("Existing groups: " + JSON.stringify(groups));
			if (groups && groups.length > 0){
				callback({error : "groupname '" + groupname + "' is already in use",
							status : 500});
			} else {
				//console.log("now inserting the new group");
				//console.log(insertGroupCmd);
				module.db.command(insertGroupCmd, function(err, groups) {
					if (err){
						console.log("insert of new group yields error : " + err);
						callback({error : err});
					} else {
						var group = groups[0];
						callback({error : err, jid: group['@rid'], groupname: group.groupname});
					}
					
				});
			}
    	}
    });
};


exports.updateGroupProfile = function(groupRID, profile, callback){
	var profileStrings = [
			"organizationName = '" + profile.organizationName + "'",
			"website = '" + profile.website + "'",
			"foregroundImg = '" + profile.foregroundImg + "'",
			"backgroundImg = '" + profile.backgroundImg + "'",
			"description = '" + profile.description + "'"],
		setString = profileStrings.join(", "),
		updateCmd = "update " + groupRID + " set " + setString;
		console.log(updateCmd);
	module.db.command(updateCmd, function(err, result){
	
	});

};

exports.findGroupsByGroupName = function (nameExpression, limit, offset, callback){
	console.log("calling findGroupsByGroupName with arguments: " + nameExpression + " " + limit + " " + offset);
	var cmd = "select from xGroup where groupname like " + nameExpression + " order by creation_date desc limit " + limit;
	console.log(cmd);
	module.db.command(cmd, function(err, groups) {
        callback({groups : groups, error : err});
    });
};

exports.getGroupByName = function(groupname, callback){
	console.log("calling getGroupByName with groupname = '" + groupname + "'");
	var cmd = "select from xGroup where groupname = '" + groupname + "'";
	console.log(cmd);
	module.db.command(cmd, function(err, groups) {
		// TODO - case where more than one group returned...
		if (err){
			console.log("caught orient db error " + e);
			callback({group : null, error : err, status : 500});
		} else {
			try {
				if (!groups || groups.length < 1){
					console.log("found no groups by '" + groupname + "'");
					callback({status : 404});
				} else {
					console.log("found " + groups.length + " groups, first one is " + groups[0].inspect);
					callback({group : groups[0]});
				}
			}
			catch (e){
				console.log("caught error " + e);
				callback({group : null, error : e.toString(), status : 500});	
			}
		}
    });
};

exports.getGroup = function(groupRID, callback){
	console.log("calling getGroup with groupRID = '" + groupRID + "'");
	var cmd = "select from " + groupRID + "";
	console.log(cmd);
	module.db.command(cmd, function(err, groups) {

		if (exports.checkErr(err, "finding group", callback)){
			try {
				if (!groups || groups.length < 1){
					console.log("found no groups by id = '" + groupRID + "'");
					callback({status : 404});
				} else {
				
					var group = groups[0],
						profile = {};
					
					if (group.organizationName) profile.organizationName = group.organizationName;  
					if (group.website) profile.website = group.website; 
					if (group.foregroundImg) profile.foregroundImg = group.foregroundImg; 
					if (group.foregroundImg) profile.foregroundImg = group.foregroundImg; 
					if (group.description) profile.description = group.description;
					
					console.log("found " + groups.length + " groups, first one is " + group["@rid"]);
					
					var result = {groupname: group.groupname, profile : profile, ownedNetworks: {}};
					
					// get owned networks
					var networkDescriptors = "properties.title as title, @rid as jid, nodes.size() as nodeCount, edges.size() as edgeCount";
					var traverseExpression = "traverse V.out, E.in from " + groupRID + " while $depth <= 2"
		 
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
						
						callback({error : err, group : result});			
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

exports.deleteGroup = function (groupRID, callback){
	console.log("calling delete group with groupRID = '" + groupRID + "'");
	var cmd = "delete from " + groupRID;
	console.log(cmd);
	module.db.command(cmd, function(err) {
        callback({error : err});
    });
};

