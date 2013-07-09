/*

	Create a test database by loading it into a scratch copy of NDEx, then exporting it.
	
	To run this script, you need to run the NDEx server pointing it to a scratch db
	
	The NDEx server will initialize the required classes 
	
*/

var fs = require('fs');
var ndex = require('../js/ndexClient.js')

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
	ndex.createUser(username, password, function(userData){

		// update the user's profile information
		ndex.updateUserProfile(userData.jid, profile, function(profileResult){
		
		});	
		
		console.log("getting networks: " + userJSON.networkFilenames);
				
		// create networks owned by user
		for (i in userJSON.networkFilenames){
			var networkJDEx = readJSONFile(userJSON.networkFilenames[i], "./test_networks/pc_sif/");
			if (networkJDEx){
				ndex.createNetwork(networkJDEx, userData.jid, function (networkData){
					console.log("Created network " + networkData.jid + " for user " + userData.jid);
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
			ndex.createGroup(groupname, userData.jid, function (groupData){

				// update the group's profile information
				ndex.updateGroupProfile(groupData.jid, groupJSON.profile, function(groupProfileResult, groupProfileError){
		
				});	
							
				// create networks owned by group
				for (i in groupJSON.networkFilenames){
					var networkJDEx = readJSONFile(groupJSON.networkFilenames[i], "./test_networks/pc_sif/");
					ndex.createNetwork(networkJDEx, groupData.jid, function (networkData){
						console.log("Created network " + networkData.jid + " for group " + groupData.jid);
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




