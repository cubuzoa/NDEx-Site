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
 
function readJSONFile(filename){
	var data = fs.readFileSync("./test_accounts/" + filename, 'utf8'); 
	console.log("JSON data: " + data);
 	data = JSON.parse(data);
	return data;
}

function processUserFile(filename){

	console.log("processing: " + filename);
	
	var userJSON = readJSONFile(filename),
		username = userJSON.username,
		password = userJSON.password,
		profile	= userJSON.profile;
		
	ndex.createUser(username, password, function(userData, error){

		if (error){
			console.log("Error creating user: " + error);
			return;
		}

		// update the user's profile information
		ndex.updateUserProfile(userData.jid, profile, function(profileResult, profileError){
		
		});	
				
		// create networks owned by user
		for (i in userJSON.networkFilenames){
			var networkJDEx = readJSONFile(networkFilenames[i]);
			ndex.createNetwork(networkJDEx, userData.jid, function (networkData, userNetworkError){
				console.log("Created network " + networkData.jid + " for user " + networkData.ownedBy);
			});
		}
		
		// create groups owned by user
		for (i in userJSON.ownedGroups){
			var groupJSON = userJSON.ownedGroups[i];
			ndex.createGroup(groupJSON.name, userData.jid, function (groupData, groupError){

				// update the group's profile information
				ndex.updateGroupProfile(groupData.jid, groupJSON.profile, function(groupProfileResult, groupProfileError){
		
				});	
							
				// create networks owned by group
				for (i in groupJSON.networkFilenames){
					var networkJDEx = readJSONFile(groupJSON.networkFilenames[i]);
					ndex.createNetwork(networkJDEx, groupData.rid, function (networkData, groupNetworkError){
						console.log("Created network " + networkData.networkId + " for group " + networkData.ownedBy);
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




