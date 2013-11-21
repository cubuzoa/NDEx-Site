/*

	Create a test database by loading it into a scratch copy of NDEx, then exporting it.

	To run this script, you need to run the NDEx server pointing it to a scratch db

	The NDEx server will initialize the required classes

*/

//TODO: Migrate this into ndex-rest

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
	return data;
}

function processUserFile(filename){

	console.log("processing: " + filename);

	var userJSON = readJSONFile(filename, "./test_accounts/"),
		username = userJSON.username,
		password = userJSON.password,
        email = userJSON.recoveryEmail,
		profile	= userJSON.profile;
	console.log("Creating User: " + username + " pwd: " + password + " email: " + email);
	ndex.createUser(username, password, email,
        function(userData){  // success handler for create user
            console.log("user created: " + username + " with id = " + userData.jid);
            doUpdateProfile(userData, profile);
            doCreateNetworks(userData,userJSON);
            doCreateGroups(userData, userJSON);
	    },
        function(error){      // error handler for create user
            console.log("Error in create user: " + JSON.stringify(error));
        });

	return true;
}

function doUpdateProfile(userData, profile){
    console.log("started async update of profile for User: " + userData.jid);
    ndex.updateUserProfile(userData.jid, profile,
        function(result){
            console.log("updated profile for User: " + userData.jid);
        },
        function(error){
            console.log("Error while updating user profile: " + JSON.stringify(error));
        });
}

function doUpdateGroupProfile(groupData, profile){
    console.log("starting async update of profile for Group: " + groupData.jid);
    ndex.updateGroupProfile(groupData.jid, profile,
        function(result){      // success handler
            console.log("updated profile for Group: " + groupData.jid);
        },
        function(error){             // error handler
            console.log("Error while updating group profile: " + JSON.stringify(error));
        });
}

function doCreateNetworks(accountData, accountJSON){
    console.log("getting networks: " + JSON.stringify(accountJSON.networkFilenames));

    // create networks owned by account
    for (i in accountJSON.networkFilenames){
        var networkJDEx = readJSONFile(accountJSON.networkFilenames[i], "./test_networks/");

        if (networkJDEx){
            console.log("started async creation of network from file: " + accountJSON.networkFilenames[i]);
            ndex.createNetwork(networkJDEx, accountData.jid,
                function (networkData){     // success handler
                    console.log("Created network " + networkData.jid + " for Account: " + accountData.jid);
                },
                function (error){
                    console.log("Error creating network: " + JSON.stringify(error));
                });
        } else {
            console.log("No network found for " + accountJSON.networkFilenames[i]);
        }
    }
}

function doCreateGroups(userData, userJSON){
    // create groups owned by user
    for (i in userJSON.ownedGroups){
        var groupJSON = userJSON.ownedGroups[i],
            groupname = groupJSON.groupname;
        console.log("started async creation of group: " + groupname);
        ndex.createGroup(userData.jid, groupname,
            function (groupData){
                console.log("created group with id: " + groupData.jid);
                doUpdateGroupProfile(groupData, groupJSON.profile);
                doCreateNetworks(userData, groupJSON);
            },
            function (error){
                console.log("Error creating group: " + error);
            });
    }
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




