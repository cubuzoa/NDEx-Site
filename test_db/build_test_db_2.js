/*

	Create a test database by loading it into a scratch copy of NDEx, then exporting it.
	
	To run this script, you need to run the NDEx server pointing it to a scratch db
	
	The NDEx server will initialize the required classes 
	
*/



var fs = require('fs');
var ndex = require('../js/ndexClient.js');
var ndex = require('./ndex_modules/ndex-request.js');

// load the user specifications as json files from test_accounts

// each file corresponds to one user plus all the groups that they own

// for each user, 
//		create the user
//		create the networks that they own (from jdex files in test_networks)
//		create the groups that they own
//		for each group
//			create the networks that they own

function getUserFilenames(){
	return fs.readdirSync("./test_accounts");
}
 
function readJSONFile(filename, directory){
	var data = fs.readFileSync(directory + filename, 'utf8'); 
	//
 	data = JSON.parse(data);
 	console.log("JSON data: " + data);
	return data;
}

function processUserFile(filename){

	console.log("processing: " + filename);
	
	var userJSON = readJSONFile(filename, "./test_accounts/"),
		username = userJSON.username,
		password = userJSON.password,
		profile	= userJSON.profile;
	
	// TODO add error handler to call	
	ndex.post('/users', {username : username, password : password}, ndex.guest, function(err,res,body){
		var userData = res.body;
		var user = {username : username, password: password};
		// update the user's profile information
		ndex.post('/users/' + userData.jid + '/profile', {profile: profile}, user, function(err,res,body){});
		console.log("getting networks: " + userJSON.networkFilenames);
				
		// create networks owned by user
		for (i in userJSON.networkFilenames){
			var networkJDEx = readJSONFile(userJSON.networkFilenames[i], "./test_networks/pc_sif/");
			if (networkJDEx){
				ndex.post('/networks', {network : networkJDEx, accountid : userData.jid}, user, function(err, res, body){
					console.log("Created network " + res.body.jid + " for user " + userData.jid);
				});
			} else {
				console.log("No network for " + userJSON.networkFilenames[i]);
			}
		}
		
		// create groups owned by user
		for (i in userJSON.ownedGroups){
			var groupJSON = userJSON.ownedGroups[i],
				groupname = groupJSON.groupname;
			console.log("Processing Group: " + groupname);
			ndex.post('/groups/', {userid : userData.jid , groupName : groupname}, user, function(err,res,body){
				var groupData = res.body;
				// update the group's profile information
				ndex.post('/groups/' + groupData.jid + '/profile', {groupid: groupData.jid, profile: groupJSON.profile}, user, function(err,res,body){
				
				});	
							
				// create networks owned by group
				for (i in groupJSON.networkFilenames){
					var networkJDEx = readJSONFile(groupJSON.networkFilenames[i], "./test_networks/pc_sif/");
					ndex.post('/networks', {network : networkJDEx, accountid : groupData.jid}, user, function(err, res, body){
						console.log("Created network " + res.body.jid + " for group " + groupData.jid);
					});
				}
			});
		}		
		
	});
	
	return true;
	
}

var userFilenames = getUserFilenames();

for (i in userFilenames){
	if (userFilenames[i].substring(0, 1) != "."){
		processUserFile(userFilenames[i]);
	}
}

// We can then log directly into the OrientDB server via the console:
//		- export the database
//		- drop the database

// (I'd like to fully automate this, we need a plan for dealing with both API and direct access)




