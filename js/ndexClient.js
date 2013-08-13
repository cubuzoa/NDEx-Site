/*

ndexClient can be used either as an node.js module or as a client library

JQuery is passed to the closure as $.

Expected to be a global for the client, expected to be undefined and then required for node.js

*/



(function(exports){

	if (typeof($) === 'undefined'){
		console.log("requiring jQuery");
		$ = require('jQuery');
	}
	
	exports.host = "http://localhost:3333";
	
	exports.defaultNDExErrorHandler = function(data){
		console.log("Error : " + JSON.stringify(data));
		//alert("Error : " + JSON.stringify(data));
	}

	exports.ndexGet = function (route, queryArgs, callback, errorHandler){
		$.ajax({
			   type: "GET",
			   url: exports.host + route,
			   data: queryArgs,
			   dataType: "JSON",
			   success: callback,
			   error: errorHandler || exports.defaultNDExErrorHandler
		});
	}

	exports.ndexPost = function(route, postData, callback, errorHandler){
		$.ajax({
			   type: "POST",
			   url: exports.host + route,
			   data: postData,
			   dataType: "JSON",
			   success: callback,
			   error: errorHandler || exports.defaultNDExErrorHandler
		});
	}

	exports.ndexDelete = function(route, callback, errorHandler){
		$.ajax({
			   type: "DELETE",
			   url: exports.host + route,
			   success: callback,
			   error: errorHandler || exports.defaultNDExErrorHandler
		});
	}



// GET server description
    exports.index = function(callback, errorHandler){
        var mergedRoute = '/';
        exports.ndexGet(mergedRoute, {},callback, errorHandler);
    }


// GET status
    exports.status = function(callback, errorHandler){
        var mergedRoute = '/status';
        exports.ndexGet(mergedRoute, {},callback, errorHandler);
    }


// Create a User Account
    exports.createUser = function(username, password, recoveryEmail, callback, errorHandler){
        var mergedRoute = '/users';
        exports.ndexPost(mergedRoute, {username: username, password: password, recoveryEmail: recoveryEmail}, callback, errorHandler);
    }


// Set new profile for user. Requester must be user or have admin permissions.
    exports.updateUserProfile = function(userid, profile, callback, errorHandler){
        var mergedRoute = '/users/' + encodeURIComponent(userid) + '/profile';
        exports.ndexPost(mergedRoute, {userid: userid, profile: profile}, callback, errorHandler);
    }


// Find users matching search expression
    exports.findUsers = function(searchExpression, limit, offset, callback, errorHandler){
        var mergedRoute = '/users';
        exports.ndexGet(mergedRoute, {searchExpression: searchExpression, limit: limit, offset: offset}, callback, errorHandler);
    }


// Get a user by userid. Content returned depends on requester permissions.
    exports.getUser = function(userid, callback, errorHandler){
        var mergedRoute = '/users/' + encodeURIComponent(userid) + '';
        exports.ndexGet(mergedRoute, {},callback, errorHandler);
    }


// Delete a user by user id. Requester must be user or have admin permissions.
    exports.deleteUser = function(userid, callback, errorHandler){
        var mergedRoute = '/users/' + encodeURIComponent(userid) + '';
        exports.ndexDelete(mergedRoute, callback, errorHandler);
    }


// Get the user's workspace. Requester must be user or have admin permissions.
    exports.getUserWorkspace = function(userid, callback, errorHandler){
        var mergedRoute = '/users/' + encodeURIComponent(userid) + '/workspace';
        exports.ndexGet(mergedRoute, {},callback, errorHandler);
    }


// Add a network to the user's workspace. Requester must be user or have admin permissions. User must have permission to access network
    exports.addNetworkToUserWorkspace = function(userid, networkid, profile, callback, errorHandler){
        var mergedRoute = '/users/' + encodeURIComponent(userid) + '/workspace';
        exports.ndexPost(mergedRoute, {networkid: networkid, profile: profile}, callback, errorHandler);
    }


// Delete a network from the user's workspace. Requester must be user or have admin permissions
    exports.deleteNetworkFromUserWorkspace = function(userid, networkid, callback, errorHandler){
        var mergedRoute = '/users/' + encodeURIComponent(userid) + '/workspace/' + encodeURIComponent(networkid) + '';
        exports.ndexDelete(mergedRoute, callback, errorHandler);
    }


// Add a programmatic access account, generate credentials
    exports.createAgent = function(name, owner, callback, errorHandler){
        var mergedRoute = '/agents';
        exports.ndexPost(mergedRoute, {name: name, owner: owner}, callback, errorHandler);
    }


// Get information about an Agent
    exports.getAgent = function(agentid, callback, errorHandler){
        var mergedRoute = '/agents/' + encodeURIComponent(agentid) + '';
        exports.ndexGet(mergedRoute, {},callback, errorHandler);
    }


// Get Agents belonging to the user
    exports.getUserAgents = function(userid, limit, offset, callback, errorHandler){
        var mergedRoute = '/users/' + encodeURIComponent(userid) + '/agents';
        exports.ndexGet(mergedRoute, {limit: limit, offset: offset}, callback, errorHandler);
    }


// Get Agents belonging to the group
    exports.getGroupAgents = function(groupid, limit, offset, callback, errorHandler){
        var mergedRoute = '/groups/' + encodeURIComponent(groupid) + '/agents';
        exports.ndexGet(mergedRoute, {limit: limit, offset: offset}, callback, errorHandler);
    }


// Update the activity status for an Agent

        var mergedRoute = '/agents/' + encodeURIComponent(agentid) + '/active';

    }


// Add a group account
    exports.createGroup = function(userid, groupName, callback, errorHandler){
        var mergedRoute = '/groups';
        exports.ndexPost(mergedRoute, {userid: userid, groupName: groupName}, callback, errorHandler);
    }


// Set new group profile information. Requester must be group owner or have admin permissions.
    exports.updateGroupProfile = function(groupid, profile, callback, errorHandler){
        var mergedRoute = '/groups/' + encodeURIComponent(groupid) + '/profile';
        exports.ndexPost(mergedRoute, {groupid: groupid, profile: profile}, callback, errorHandler);
    }


// Find groups by search expression
    exports.findGroups = function(searchExpression, limit, offset, callback, errorHandler){
        var mergedRoute = '/groups';
        exports.ndexGet(mergedRoute, {searchExpression: searchExpression, limit: limit, offset: offset}, callback, errorHandler);
    }


// Get a group by group id. Information returned depends on whether requester is group owner.
    exports.getGroup = function(groupid, callback, errorHandler){
        var mergedRoute = '/groups/' + encodeURIComponent(groupid) + '';
        exports.ndexGet(mergedRoute, {},callback, errorHandler);
    }


// Delete a group by group id. Requester must be group owner or have admin permissions.
    exports.deleteGroup = function(groupid, callback, errorHandler){
        var mergedRoute = '/groups/' + encodeURIComponent(groupid) + '';
        exports.ndexDelete(mergedRoute, callback, errorHandler);
    }


// Find Users who are members of a group, optionally filter by search expression. Group owners see all members, non-owners see only members who allow themselves to be visible.
    exports.getGroupMembers = function(groupid, searchExpression, limit, offset, callback, errorHandler){
        var mergedRoute = '/groups/' + encodeURIComponent(groupid) + '/members';
        exports.ndexGet(mergedRoute, {searchExpression: searchExpression, limit: limit, offset: offset}, callback, errorHandler);
    }


// Create a new network in the specified account
    exports.createNetwork = function(network, accountid, callback, errorHandler){
        var mergedRoute = '/networks';
        exports.ndexPost(mergedRoute, {network: network, accountid: accountid}, callback, errorHandler);
    }


// delete a network
    exports.deleteNetwork = function(networkid, callback, errorHandler){
        var mergedRoute = '/networks/' + encodeURIComponent(networkid) + '';
        exports.ndexDelete(mergedRoute, callback, errorHandler);
    }


// Returns the Network JDEx
    exports.getNetwork = function(networkid, callback, errorHandler){
        var mergedRoute = '/networks/' + encodeURIComponent(networkid) + '';
        exports.ndexGet(mergedRoute, {},callback, errorHandler);
    }


// Find Networks by search expression
    exports.findNetworks = function(searchExpression, limit, offset, callback, errorHandler){
        var mergedRoute = '/networks';
        exports.ndexGet(mergedRoute, {searchExpression: searchExpression, limit: limit, offset: offset}, callback, errorHandler);
    }



})(typeof exports === 'undefined'? this['ndexClient']={}: exports);

