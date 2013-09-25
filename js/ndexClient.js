/*

 ndexClient can be used either as an node.js module or as a client library

 JQuery is passed to the closure as $.

 Expected to be a global for the client, expected to be undefined and then required for node.js

 */


(function (exports) {

    if (typeof($) === 'undefined') {
        console.log("requiring jquery");
        $ = require('jquery');
    }

    if (typeof(btoa) === 'undefined') {
        console.log("requiring btoa");
        btoa = require('btoa');
    }

    exports.host = "http://localhost:3333";

    exports.guest = {username: 'guest', password: 'guestpassword'}

    function currentCredentials() {
        if (typeof(localStorage) != 'undefined' && localStorage) {
            if (localStorage.password, localStorage.username) {
                return {password: localStorage.ndexPassword, username: localStorage.ndexUsername};
            } else {
                return exports.guest;
            }
        }
        return exports.guest;

    }

    function encodedCredentials(credentials){
        if (!credentials) credentials = currentCredentials();
        return btoa(credentials.username + ":" + credentials.password);
    }


    exports.defaultNDExErrorHandler = function (data) {
        console.log("Error in ndexClient caught by default handler : " + JSON.stringify(data));
        //alert("Error : " + JSON.stringify(data));
    }

    exports.ndexGet = function (route, queryArgs, callback, errorHandler) {

        $.ajax({
            type: "GET",
            /*
             password: credentials.password,
             username: credentials.username,
             xhrFields: {
             withCredentials: true
             },
             */
            beforeSend: function(xhr){
                xhr.setRequestHeader("Authorization", "Basic " + encodedCredentials());
            },
            url: exports.host + route,
            data: queryArgs,
            dataType: "JSON",
            success: callback,
            error: errorHandler || exports.defaultNDExErrorHandler
        });
    }

    exports.ndexPost = function (route, postData, callback, errorHandler) {
        $.ajax({
            type: "POST",
/*
            password: credentials.password,
            username: credentials.username,
            xhrFields: {
                withCredentials: true
            },
*/
            beforeSend: function(xhr){
                xhr.setRequestHeader("Authorization", "Basic " + encodedCredentials());
            },
            url: exports.host + route,
            data: JSON.stringify(postData),
            dataType: "JSON",
            contentType: 'application/json',
            success: callback,
            error: errorHandler || exports.defaultNDExErrorHandler
        });
    }

    exports.ndexDelete = function (route, callback, errorHandler) {
        $.ajax({
            type: "DELETE",
            /*
             password: credentials.password,
             username: credentials.username,
             xhrFields: {
             withCredentials: true
             },
             */
            beforeSend: function(xhr){
                xhr.setRequestHeader("Authorization", "Basic " + encodedCredentials());
            },
            url: exports.host + route,
            success: callback,
            error: errorHandler || exports.defaultNDExErrorHandler
        });
    }

    exports.authenticate = function(username, password, callback, errorHandler){
        var route = '/authenticate';

        $.ajax({
            type: "GET",

            beforeSend: function(xhr){
                xhr.setRequestHeader(
                    "Authorization",
                    "Basic " + encodedCredentials({username: username, password: password}));
            },
            url: exports.host + route,
            dataType: "JSON",
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
        exports.ndexPost(mergedRoute, {profile: profile}, callback, errorHandler);
    }


// Set a new foreground image for user. Requester must be user or have admin permissions.
    exports.uploadUserImage = function(userid, type, callback, errorHandler){
        var mergedRoute = '/users/' + encodeURIComponent(userid) + '/images';
        exports.ndexPost(mergedRoute, {type: type}, callback, errorHandler);
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


// Get the user's WorkSurface. Requester must be user or have admin permissions.
    exports.getUserWorkSurface = function(userid, callback, errorHandler){
        var mergedRoute = '/users/' + encodeURIComponent(userid) + '/worksurface';
        exports.ndexGet(mergedRoute, {},callback, errorHandler);
    }


// Add a network to the user's WorkSurface. Requester must be user or have admin permissions. User must have permission to access network
    exports.addNetworkToUserWorkSurface = function(userid, networkid, callback, errorHandler){
        var mergedRoute = '/users/' + encodeURIComponent(userid) + '/worksurface';
        exports.ndexPost(mergedRoute, {networkid: networkid}, callback, errorHandler);
    }


// Delete a network from the user's WorkSurface. Requester must be user or have admin permissions
    exports.deleteNetworkFromUserWorkSurface = function(userid, networkid, callback, errorHandler){
        var mergedRoute = '/users/' + encodeURIComponent(userid) + '/worksurface/' + encodeURIComponent(networkid) + '';
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


// Update the credentials and/or status for an Agent
    exports.updateAgent = function(agentId, credentials, status, name, callback, errorHandler){
        var mergedRoute = '/agents/' + encodeURIComponent(agentid) + '';
        exports.ndexPost(mergedRoute, {credentials: credentials, status: status, name: name}, callback, errorHandler);
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


// Set a new foreground image for group. Requester must be group owner or have admin permissions.
    exports.uploadGroupImage = function(groupid, type, callback, errorHandler){
        var mergedRoute = '/groups/' + encodeURIComponent(groupid) + '/images';
        exports.ndexPost(mergedRoute, {groupid: groupid, type: type}, callback, errorHandler);
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


// toAccount creates a request to fromAccount.
    exports.createRequest = function(toid, fromid, requestType, message, aboutid, callback, errorHandler){
        var mergedRoute = '/requests';
        exports.ndexPost(mergedRoute, {toid: toid, fromid: fromid, requestType: requestType, message: message, aboutid: aboutid}, callback, errorHandler);
    }


// Get the parameters of a request
    exports.getRequest = function(requestid, callback, errorHandler){
        var mergedRoute = '/requests/' + encodeURIComponent(requestid) + '';
        exports.ndexGet(mergedRoute, {},callback, errorHandler);
    }


// toAccount approves or disapproves a request. Approval causes requested action. Processing deletes request
    exports.processRequest = function(requestid, approval, callback, errorHandler){
        var mergedRoute = '/requests/' + encodeURIComponent(requestid) + '';
        exports.ndexPost(mergedRoute, {approval: approval}, callback, errorHandler);
    }


// find requests that were made by the user or can be processed by the user
    exports.findRequests = function(userid, callback, errorHandler){
        var mergedRoute = '/users/' + encodeURIComponent(userid) + '/requests';
        exports.ndexGet(mergedRoute, {},callback, errorHandler);
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


// Returns all or part of a Network based on edge parameters
    exports.getNetworkByEdges = function(networkid, typeFilter, propertyFilter, subjectNodeFilter, objectNodeFilter, limit, offset, callback, errorHandler){
        var mergedRoute = '/networks/' + encodeURIComponent(networkid) + '/edge';
        exports.ndexGet(mergedRoute, {typeFilter: typeFilter, propertyFilter: propertyFilter, subjectNodeFilter: subjectNodeFilter, objectNodeFilter: objectNodeFilter, limit: limit, offset: offset}, callback, errorHandler);
    }


// Returns nodes and meta information of a Network based on node parameters
    exports.getNetworkByNodes = function(networkid, typeFilter, propertyFilter, limit, offset, callback, errorHandler){
        var mergedRoute = '/networks/' + encodeURIComponent(networkid) + '/node';
        exports.ndexGet(mergedRoute, {typeFilter: typeFilter, propertyFilter: propertyFilter, limit: limit, offset: offset}, callback, errorHandler);
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


// User creates a Task
    exports.createTask = function(task, userid, callback, errorHandler){
        var mergedRoute = '/tasks';
        exports.ndexPost(mergedRoute, {task: task, userid: userid}, callback, errorHandler);
    }


// Get the parameters and status of a task
    exports.getTask = function(taskid, callback, errorHandler){
        var mergedRoute = '/tasks/' + encodeURIComponent(taskid) + '';
        exports.ndexGet(mergedRoute, {},callback, errorHandler);
    }


// Set the parameters (such as status) of a task. Can inactivate an active task or activate an inactive task
    exports.updateTask = function(taskid, status, callback, errorHandler){
        var mergedRoute = '/tasks/' + encodeURIComponent(taskid) + '';
        exports.ndexPost(mergedRoute, {status: status}, callback, errorHandler);
    }


// Delete an inactive or completed task
    exports.deleteTask = function(taskid, callback, errorHandler){
        var mergedRoute = '/tasks/' + encodeURIComponent(taskid) + '';
        exports.ndexDelete(mergedRoute, callback, errorHandler);
    }



})(typeof exports === 'undefined'? this['ndexClient']={}: exports);

