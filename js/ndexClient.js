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
	
	exports.host = "http://localhost:9999";
	
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
    exports.createUser = function(username, password, callback, errorHandler){
        var mergedRoute = '/users';
        exports.ndexPost(mergedRoute, {username: username, password: password}, callback, errorHandler);
    }


// Add a group account
    exports.updateUserProfile = function(userid, profile, callback, errorHandler){
        var mergedRoute = '/users/' + encodeURIComponent(userid) + '/profile';
        exports.ndexPost(mergedRoute, {userid: userid, profile: profile}, callback, errorHandler);
    }


// Find users matching search expression
    exports.findUsers = function(searchExpression, limit, offset, callback, errorHandler){
        var mergedRoute = '/users';
        exports.ndexGet(mergedRoute, {searchExpression: searchExpression, limit: limit, offset: offset}, callback, errorHandler);
    }


// Get a user by userid
    exports.getUser = function(userid, callback, errorHandler){
        var mergedRoute = '/users/' + encodeURIComponent(userid) + '';
        exports.ndexGet(mergedRoute, {},callback, errorHandler);
    }


// Delete a user by username
    exports.deleteUser = function(username, callback, errorHandler){
        var mergedRoute = '/users/' + encodeURIComponent(userid) + '';
        exports.ndexDelete(mergedRoute, callback, errorHandler);
    }


// Add a group account
    exports.createGroup = function(userid, groupName, callback, errorHandler){
        var mergedRoute = '/groups';
        exports.ndexPost(mergedRoute, {userid: userid, groupName: groupName}, callback, errorHandler);
    }


// Add a group account
    exports.updateGroupProfile = function(groupid, profile, callback, errorHandler){
        var mergedRoute = '/groups/' + encodeURIComponent(groupid) + '/profile';
        exports.ndexPost(mergedRoute, {groupid: groupid, profile: profile}, callback, errorHandler);
    }


// Find groups by search expression
    exports.findGroups = function(searchExpression, limit, offset, callback, errorHandler){
        var mergedRoute = '/groups';
        exports.ndexGet(mergedRoute, {searchExpression: searchExpression, limit: limit, offset: offset}, callback, errorHandler);
    }


// Get a group by groupname
    exports.getGroup = function(groupid, callback, errorHandler){
        var mergedRoute = '/groups/' + encodeURIComponent(groupid) + '';
        exports.ndexGet(mergedRoute, {},callback, errorHandler);
    }


// Delete a group by groupname
    exports.deleteGroup = function(groupid, callback, errorHandler){
        var mergedRoute = '/groups/' + encodeURIComponent(groupid) + '';
        exports.ndexDelete(mergedRoute, callback, errorHandler);
    }


// Find Users who are members of a group, optionally filter by search expression
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

