/******************************************************************************
* ndexClient can be used either as an node.js module or as a client library
* JQuery is passed to the closure as $.
* Expected to be a global for the client, expected to be undefined and then
* required for node.js
******************************************************************************/

(function(exports)
{
  if (typeof($) === "undefined")
  {
    console.log("jQuery is required");
    $ = require("jquery");
  }

  if (typeof(btoa) === "undefined")
  {
    console.log("btoa is required");
    btoa = require("btoa");
  }

  exports.host = "http://localhost:3333";

  /****************************************************************************
  * Retrieves the user's credentials from local storage (if they exist).
  ****************************************************************************/
  function currentCredentials()
  {
    try
    {
      //Can't use normal detection of localStorage, it can throw an exception
      if (localStorage.password && localStorage.username)
        return { password: localStorage.password, username: localStorage.username };
    }
    catch (e)
    {
      return null;
    }

    return null;
  }

  /****************************************************************************
  * Returns a user's credentials as required by Basic Authentication base64
  * encoded.
  ****************************************************************************/
  function encodedCredentials(credentials)
  {
    if (!credentials)
      credentials = currentCredentials();

    if (credentials)
      return btoa(credentials.username + ":" + credentials.password);
    else
      return null;
  }

  /****************************************************************************
  * Authenticates credentials entered by a user.
  ****************************************************************************/
  exports.authenticate = function (username, password, callback, errorHandler)
  {
    //TODO: This should be using HTTPS since it's Basic Auth
    $.ajax(
    {
      type: "GET",
      url: exports.host + "/authenticate",
      dataType: "JSON",
      beforeSend: function (xhr)
      {
        xhr.setRequestHeader("Authorization", "Basic " + encodedCredentials(
          {
            username: username,
            password: password
          }));
      },
      success: callback,
      error: errorHandler || exports.defaultNDExErrorHandler
    });
  }

  /****************************************************************************
  * Default error handling.
  ****************************************************************************/
  exports.defaultNDExErrorHandler = function(data)
  {
    console.log("Error in ndexClient caught by default handler : " + JSON.stringify(data));
    //alert("Error : " + JSON.stringify(data));
  }

  /****************************************************************************
  * AJAX GET request.
  ****************************************************************************/
  exports.ndexGet = function (route, queryArgs, callback, errorHandler)
  {
    $.ajax(
    {
      type: "GET",
      url: exports.host + route,
      data: queryArgs,
      dataType: "JSON",
      beforeSend: function (xhr)
      {
        xhr.setRequestHeader("Authorization", "Basic " + encodedCredentials());
      },
      success: callback,
      error: errorHandler || exports.defaultNDExErrorHandler
    });
  }

  /****************************************************************************
  * AJAX DELETE request.
  ****************************************************************************/
  exports.ndexDelete = function(route, callback, errorHandler)
  {
    $.ajax(
    {
      type: "DELETE",
      url: exports.host + route,
      beforeSend: function (xhr)
      {
        xhr.setRequestHeader("Authorization", "Basic " + encodedCredentials());
      },
      success: callback,
      error: errorHandler || exports.defaultNDExErrorHandler
    });
  }

  /****************************************************************************
  * AJAX POST request.
  ****************************************************************************/
  exports.ndexPost = function (route, postData, callback, errorHandler)
  {
    $.ajax(
    {
      type: "POST",
      url: exports.host + route,
      data: JSON.stringify(postData),
      dataType: "JSON",
      contentType: 'application/json',
      beforeSend: function (xhr)
      {
        xhr.setRequestHeader("Authorization", "Basic " + encodedCredentials());
      },
      success: callback,
      error: errorHandler || exports.defaultNDExErrorHandler
    });
  }

  /****************************************************************************
  * AJAX PUT request.
  ****************************************************************************/
  exports.ndexPut = function(route, putData, callback, errorHandler)
  {
    $.ajax(
    {
      type: "PUT",
      url: NdexClient.ApiHost + route,
      contentType: "application/json",
      data: JSON.stringify(putData),
      dataType: "JSON",
      beforeSend: function(xhr)
      {
        xhr.setRequestHeader("Authorization", "Basic " + encodedCredentials());
      },
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


// Delete an Agent by Agent id. Requester must be agent owner, owner of group owning agent, or have admin permissions.
    exports.deleteAgent = function(agentid, callback, errorHandler){
        var mergedRoute = '/agents/' + encodeURIComponent(agentid) + '';
        exports.ndexDelete(mergedRoute, callback, errorHandler);
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


// toAccount creates a request to fromAccount. Requests mediate communication between accounts.  The current use cases are request/invitation to add a user to a group and request/grant of authorization for access to a network.  Actions happen when the recipient of the request processes the request.
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


// Find requests that were made by the user or can be processed by the user
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


// Returns the Network JSON structure with only the meta data  - properties and format
    exports.getNetworkMetadata = function(networkid, callback, errorHandler){
        var mergedRoute = '/networks/' + encodeURIComponent(networkid) + '/metadata';
        exports.ndexGet(mergedRoute, {},callback, errorHandler);
    }


// Update network properties
    exports.setNetworkMetadata = function(networkid, network, callback, errorHandler){
        var mergedRoute = '/network/' + encodeURIComponent(networkid) + '/metadata';
        exports.ndexPost(mergedRoute, {network: network}, callback, errorHandler);
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

