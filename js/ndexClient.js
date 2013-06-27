/*

ndexClient can be used either as an node.js module or as a client library

JQuery is passed to the closure as $.

Expected to be a global for the client, expected to be undefined and then required for node.js

*/



(function(exports, $){

	typeof $ === 'undefined'? $ = require('jQuery'): $;
	
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
    exports.index = function(callback){
        var mergedRoute = '/';
        exports.ndexGet(mergedRoute, {},callback);
    }


// GET status
    exports.status = function(callback){
        var mergedRoute = '/status';
        exports.ndexGet(mergedRoute, {},callback);
    }


// Create a User Account
    exports.createUser = function(username, password, callback){
        var mergedRoute = '/users';
        exports.ndexPost(mergedRoute, {username: username, password: password}, callback);
    }


// Find users matching search expression
    exports.findUsers = function(searchExpression, limit, offset, callback){
        var mergedRoute = '/users';
        exports.ndexGet(mergedRoute, {searchExpression: searchExpression, limit: limit, offset: offset}, callback);
    }


// Get a user by username
    exports.getUser = function(username, callback){
        var mergedRoute = '/users/' + encodeURIComponent(username) + '';
        exports.ndexGet(mergedRoute, {},callback);
    }


// Delete a user by username
    exports.deleteUser = function(username, callback){
        var mergedRoute = '/users/' + encodeURIComponent(username) + '';
        exports.ndexDelete(mergedRoute, callback);
    }


// Add a group account
    exports.createGroup = function(username, callback){
        var mergedRoute = '/groups';
        exports.ndexPost(mergedRoute, {username: username}, callback);
    }


// Find groups by search expression
    exports.findGroups = function(searchExpression, limit, offset, callback){
        var mergedRoute = '/groups';
        exports.ndexGet(mergedRoute, {searchExpression: searchExpression, limit: limit, offset: offset}, callback);
    }


// Get a group by groupname
    exports.getGroupInfo = function(username, callback){
        var mergedRoute = '/groups/' + encodeURIComponent(groupname) + '';
        exports.ndexGet(mergedRoute, {},callback);
    }


// Delete a group by groupname
    exports.deleteGroup = function(groupname, callback){
        var mergedRoute = '/groups/' + encodeURIComponent(groupname) + '';
        exports.ndexDelete(mergedRoute, callback);
    }


// Find Users who are members of a group, optionally filter by search expression
    exports.getGroupMembers = function(groupname, searchExpression, limit, offset, callback){
        var mergedRoute = '/groups/' + encodeURIComponent(groupname) + '/members';
        exports.ndexGet(mergedRoute, {searchExpression: searchExpression, limit: limit, offset: offset}, callback);
    }


// Create a new network in the specified account
    exports.createNetwork = function(network, accountURI, callback){
        var mergedRoute = '/networks';
        exports.ndexPost(mergedRoute, {network: network, accountURI: accountURI}, callback);
    }


// delete a network
    exports.deleteNetwork = function(networkId, callback){
        var mergedRoute = '/networks/' + encodeURIComponent(networkId) + '';
        exports.ndexDelete(mergedRoute, callback);
    }


// Returns the Network JDEx
    exports.getNetwork = function(networkId, callback){
        var mergedRoute = '/networks/' + encodeURIComponent(networkId) + '';
        exports.ndexGet(mergedRoute, {},callback);
    }


// Find Networks by search expression
    exports.findNetworks = function(searchExpression, limit, offset, callback){
        var mergedRoute = '/networks';
        exports.ndexGet(mergedRoute, {searchExpression: searchExpression, limit: limit, offset: offset}, callback);
    }



})(typeof exports === 'undefined'? this['ndexClient']={}: exports);

