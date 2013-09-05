var check = require('validator').check;

module.db = null;

var common = require("./Common.js");

exports.init = function(orient, callback) {
    module.db = orient;   
};

exports.createGroup = function(userRID, groupname, callback){
	//checks for invalid group name
	try{
		check(groupname,'Invalid groupname').is(/^[A-Za-z0-9]+$/).len(6);
	}
	catch(e){
		console.log(e.message);
		return callback( {error : e.message, status : 400} );
	}
	
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

				var password = "password";
				console.log("calling createGroup with arguments: '" + groupname + "' '" + userRID + "'");
				var selectGroupByGroupNameCmd = "select from xGroup where groupname = '" + groupname + "'";
				var insertGroupCmd = "insert into xGroup (groupname) values('" + groupname + "')";
				//console.log("first checking that groupname is not taken");
				module.db.command(selectGroupByGroupNameCmd, function(err, groups) {
					if (err) {
						callback( {error : err, status : 500});
					} else {
						//console.log("Existing groups: " + JSON.stringify(groups));
						if (groups && groups.length > 0 ){
							callback({error : "groupname '" + groupname + "' is already in use",
										status : 500});
						} else {
							console.log("now inserting the new group");
							//console.log(insertGroupCmd);
							module.db.command(insertGroupCmd, function(err, groups) {
								if (err){
									var description = ("insert of new group (" + groupname + ") owned by " + userid + " yields error : " + err);
									console.log(description);
									callback({error : err, description : description});
								} else {
									var group = groups[0],
										groupRID = group['@rid'];
							
									// assert ownership of group
									var ownsGroupCMD = "create edge xOwnsGroup from " + userRID + " to " + groupRID;
									module.db.command(ownsGroupCMD, function(err){
										callback({error : err, jid: groupRID, groupname: group.groupname});
									});						
								}
					
							});
						}
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
		callback({profile : profile, error: err, status : 200})
	});

};

exports.findGroups = function (nameExpression, limit, offset, callback){
    var start = (offset)*limit;
    var cmd = "select from xGroup where groupname like '%" + searchExpression + "%'  order by creation_date desc skip " +  start + " limit " + limit;
    console.log("calling findGroups with arguments: " + searchExpression + " " + limit + " " + offset);
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
		if (common.checkErr(err, "finding group", callback)){
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
					if (group.backgroundImg) profile.backgroundImg = group.backgroundImg; 
					if (group.description) profile.description = group.description;
					
					console.log("found " + groups.length + " groups, first one is " + group["@rid"]);
					
					var result = {groupname: group.groupname, profile : profile, ownedNetworks: {}};
					
					// get owned networks
					var networkDescriptors = "properties.title as title, @rid as jid, nodes.size() as nodeCount, edges.size() as edgeCount";
					var traverseExpression = "traverse V.out, E.in from " + groupRID + " while $depth <= 2"
			 
					var networks_cmd = "select " + networkDescriptors + " from (" + traverseExpression + ") where  @class = 'xNetwork'";
					module.db.command(networks_cmd, function(err, networks) {
						if(common.checkErr(err, "getting owned networks", callback)){
					
						// process the networks
							for (i in networks){
								var network = networks[i];
								network.jid = common.convertFromRID(network.jid);
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

exports.deleteGroup = function (groupRID, callback){
	console.log("calling delete group with groupRID = '" + groupRID + "'");
	var cmd = "select from " + groupRID + "";
	console.log(cmd);
	module.db.command(cmd, function(err, groups) {

		if (common.checkErr(err, "finding group", callback)){
			try {
				if (!groups || groups.length < 1){
					console.log("found no groups by id = '" + groupRID + "'");
					callback({status : 404});
				} else {
					var updateCmd = "delete from " + groupRID;
					console.log(updateCmd);
					module.db.command(updateCmd, function(err) {
						callback({error : err});
					});
				}
			}
			catch(e) {
				console.log("caught error " + e);
				callback({network : null, error : e.toString(), status : 500});	
			}
		}
	});
};

