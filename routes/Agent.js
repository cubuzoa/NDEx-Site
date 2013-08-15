module.db = null;

var common = require("./Common.js");

exports.init = function(orient, callback) {
    module.db = orient;   
};

/*

createAgent

Add a programmatic access account, generate credentials

POST /agents

Route Parameters: Post Data Parameters:

name (string)
owner (JID)

*/


/*
getAgent

Get information about an Agent

GET /agents/:agentid

Route Parameters:

agentid (JID)

*/

/*

updateAgent

Update the status and/or credentials for an Agent

POST /agents/:agentid

Route Parameters:

agentId (JID)

Post Data Parameters

status
credentials

*/


/*
? Do we really need this or should this just be part of getting the user?

getUserAgents

Get Agents belonging to the user

GET /users/:userid/agents

Route Parameters:

userid (JID) Query Parameters:
limit (integer)
offset (integer)

*/


/*
? Do we really need this or should this just be part of getting the group?

getGroupAgents

Get Agents belonging to the group

GET /groups/:groupid/agents

Route Parameters:

groupid (JID) Query Parameters:
limit (integer)
offset (integer)

*/



