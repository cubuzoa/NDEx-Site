exports.resourceTypes = [
				"System", 
				"User", 
				"Agent", 
				"Group", 
				"Request",  
				"Network", 
				"Task"
];
	
// All responses are JSON structures.
// They implicitly have a list of exceptions under the key "exception":
// {exceptions : [<e1>, <e2>, ...]}	

// Successful creation operations will return HTTP code 201

exports.System = [

	{	fn : "index",
		status : "active",
		doc : "GET server description",
		method: "GET",
		route: "/",
		queryParams: {},
		response: { doc : "server description"},
		exceptions: []
	},
	
	{	fn : "status",
		status : "active",
		doc : "GET status",
		method: "GET",
		route: "/status",
		queryParams: {},
		response: { status : "server status description"},
		exceptions: []
	},

];

exports.User = [

	{	fn : "createUser",
		status : "active",
		doc : "Create a User Account",
		method : "POST",
		route : "/users",
		postData: {
				username : {	doc : "username", 
								type : "string",
							},
				password : {	doc : "password",
								type : "string"
							},
				recoveryEmail : {	doc : "email address for password recovery, default email for account",
								type : "string"
							}
				},
		response: {
			jid : {doc : "the id of the new user", type : "JID", class : "xUser"}
			},
		exceptions: [
				"400 user name already used", 
				"400 invalid name", 
				"400 invalid password"]
	},

	{	fn : "updateUserProfile",
		status : "active",
		doc : "Set new profile for user. Requester must be user or have admin permissions.",
		method : "POST",
		route : "/users/:userid/profile",
		postData: {
				userid : {	doc : "user id", type : "JID", required : true, class : "xUser"},
				profile : {	doc : "group profile", type : "JSON"}
				},
		response: {
			},
		exceptions: ["404 unknown user id",
					"401 Requester not authorized"]
	},	
	
	{	fn : "setUserPassword",
		status : "inactive",
		doc : "Set a user's password. Requester must be user or have admin permissions.",
		method : "PUT",
		route : "/users/:userid/password",
		routeParams: {userid : {doc : "user id", type : "JID", class : "xUser"}},
		queryParams: {
				newPassword : { doc : "new password",
								type : "string",
								}, 
				oldPassword : { doc : "old password",
								type : "string",
								}
							},
		response: {},
		exceptions: [
				"404 unknown user id", 
				"400 incorrect old password", 
				"400 invalid new password",
				"401 Requester not authorized"]
	},	

	{	fn : "findUsers",
		status : "active",
		doc : "Find users matching search expression",
		method : "GET",
		route : "/users",
		queryParams: {	
				searchExpression : { doc : "string to match vs user",
							type : "string",
							default : "*"}, 
				limit : { 	doc : "maximum number of users to return", 
							type : "integer",
							default : 100,
							min : 0,
							max : 1000},	
				offset : {	doc : "offset into array of returned users",
							type : "integer",
							min : 0,
							default : 0}
					},
		response: {users : "list of user descriptors, may be empty"},
		exceptions: [
				"400 invalid search expression", 
				"400 invalid limit", 
				"400 invalid offset"]
	},	
	
	{	fn : "getUser",
		status : "active",
		doc : "Get a user by userid. Content returned depends on requester permissions.",
		method : "GET",
		route : "/users/:userid",
		routeParams: {	
				userid : { doc : "user id", type : "JID", class : "xUser"}
					},
		response: {user : "user descriptor"},
		exceptions: ["404 unknown user id",
					"401 Requester not authorized"]
	},	
	
	{	fn : "deleteUser",
		status : "active",
		doc : "Delete a user by user id. Requester must be user or have admin permissions.",
		method : "DELETE",
		route : "/users/:userid",
		routeParams: {	
				userid : { doc : "user id", type : "JID", class : "xUser"}
					},
		response: {},
		exceptions: ["404 unknown user id",
					"401 Requester not authorized"]
	},

	{	fn : "getUserWorkspace",
		status : "active",
		//requiresAuthentication : true,
		doc : "Get the user's workspace. Requester must be user or have admin permissions.",
		method : "GET",
		route : "/users/:userid/workspace",
		routeParams: {	
				userid : { doc : "user id", type : "JID", class : "xUser"}
					},
		response: {user : "user descriptor"},
		exceptions: ["404 unknown user id",
					"401 Requester not authorized"]
	},

	{	fn : "addNetworkToUserWorkspace",
		status : "active",
		//requiresAuthentication : true,
		doc : "Add a network to the user's workspace. Requester must be user or have admin permissions. User must have permission to access network",
		method : "POST",
		route : "/users/:userid/workspace",
		routeParams: {	
				userid : { doc : "user id", type : "JID", class : "xUser"}
					},
		postData: {
				networkid : {	doc : "user id", type : "JID", required : true, class : "xNetwork"},
				},
		response: {user : "user descriptor"},
		exceptions: ["404 unknown user id",
					"401 Requester not authorized"]
	},

	{	fn : "deleteNetworkFromUserWorkspace",
		status : "active",
		//requiresAuthentication : true,
		doc : "Delete a network from the user's workspace. Requester must be user or have admin permissions",
		method : "DELETE",
		route : "/users/:userid/workspace/:networkid",
		routeParams: {	
				userid : { doc : "user id", type : "JID", class : "xUser"},
				networkid : { doc : "network id", type : "JID", class : "xNetwork"}
					},
		response: {user : "user descriptor"},
		exceptions: ["404 unknown user id",
					 "404 unknown network id",
					"401 Requester not authorized"]
	},	
	
];

// Note :  Agent parameters may eventually include controls for load management, throttling.	
exports.Agent = [

	{	fn : "createAgent",
		status : "active",
		doc : "Add a programmatic access account, generate credentials",
		method : "POST",
		route : "/agents",
		routeParams: {},
		postData: {
				name : {	doc : "Agent name, will be generated if not supplied",
							type : "string",
							default : "AUTO",
				}, 
				owner : {	doc : "Owner Id", type : "JID", class : "xAccount"}
				},
		response: { 
				name : "Agent name",
				id : {doc : "id for Agent", type : "JID", class : "xAgent"}
				
				},
		exceptions: [
				"400 Agent name already used for this owner", 
				"400 invalid name",
				"401 Requester not authorized"]
	},

	{	fn : "getAgent",
		status : "active",
		doc : "Get information about an Agent",
		method : "GET",
		route : "/agents/:agentid",
		routeParams: {
						agentid : {	doc : "agent id", type : "JID", class : "xAgent"}
					},
		response: { 
				name : "Agent name",
				id : {doc : "id for Agent", type : "JID"},
				active : "true or false",
				credentials : "credential structure"},
		exceptions: ["404 unknown Agent",
					"401 Requester not authorized"]
	},

	{	fn : "getUserAgents",
		status : "inactive",
		doc : "Get Agents belonging to the user",
		method : "GET",
		route : "/users/:userid/agents",
		routeParams: {
						userid : {	doc : "User id", type : "JID", class : "xUser"}
					},
		queryParams: {	
				limit : {	doc : "maximum number of Agents to return",
							type : "integer",
							default : 100,
							min : 0,
							max : 1000},
				offset : {	doc : "offset into array of returned Agents",
							type : "integer",
							min : 0,
							default : 0}
						},
		response: { 
				agents : "list of Agent descriptors, may be empty"},
		exceptions: [
				"404 unknown user",
				"400 invalid limit", 
				"400 invalid offset",
				"401 Requester not authorized"]
	},	

	{	fn : "getGroupAgents",
		status : "inactive",
		doc : "Get Agents belonging to the group",
		method : "GET",
		route : "/groups/:groupid/agents",
		routeParams: {
						groupid : {	doc : "Group id", type : "JID", class : "xGroup"}
					},
		queryParams: {	
				limit : {	doc : "maximum number of Agents to return",
							type : "integer",
							default : 100,
							min : 0,
							max : 1000},
				offset : {	doc : "offset into array of returned Agents",
							type : "integer",
							min : 0,
							default : 0}
						},
		response: { 
				agents : "list of Agent descriptors, may be empty"},
		exceptions: [
				"404 unknown group",
				"400 invalid limit", 
				"400 invalid offset",
				"401 Requester not authorized"]
	},	

	{	fn : "updateAgent",
		status : "active",
		doc : "Update the credentials and/or status for an Agent",
		method : "POST",
		route : "/agents/:agentid",
		routeParams: {
				agentId : {	doc : "Agent id", type : "JID", class : "xAgent"},
					},
		postData : {
					credentials : { doc : "action to perform on credentials",
								type : "string",
								default : "reset"
								},
					status : { doc : "status to set for agent",
								type : "string",
								default : "active"
								},
					name : { doc : "name for for agent",
								type : "string"
								}
					},
		response: {
				name : "Agent name",
				URI : "URI for Agent",
				active : "true or false",
				credentials : "credential structure"
				},
		exceptions: [
				"401 Requester not authorized",
				"404 unknown Agent"]
	}		

];

exports.Group = [

	{	fn : "createGroup",
		status : "active",
		doc : "Add a group account",
		method : "POST",
		route : "/groups",
		postData: {
				userid : {		doc : "User Id of the group owner",
								type : "JID",
								class : "xUser",
								required : true},
								
				groupName : {	doc : "group name", type : "string"}
				},
		response: {
			jid : {doc : "the id of the new group", type : "JID", class : "xGroup"}
			},
		exceptions: [
				"404 unknown user id",
				"401 Requester not authorized",
				"400 group name already used", 
				"400 invalid group name"]
	},	

	{	fn : "updateGroupProfile",
		status : "active",
		doc : "Set new group profile information. Requester must be group owner or have admin permissions.",
		method : "POST",
		route : "/groups/:groupid/profile",
		postData: {
				groupid : {		doc : "group id",
								type : "JID",
								class : "xGroup",
								required : true},
								
				profile : {	doc : "group profile", type : "JSON"}
				},
		response: {
			},
		exceptions: ["404 unknown group id",
					"401 Requester not authorized"]
	},	


	{	fn : "findGroups",
		status : "active",
		doc : "Find groups by search expression",
		method : "GET",
		route : "/groups",
		queryParams: {	
				searchExpression : { doc : "string to specify search",
							type : "string",
							default : "*"}, 
				limit : { 	doc : "maximum number of groups to return", 
							type : "integer",
							default : 100,
							min : 0,
							max : 1000},	
				offset : {	doc : "offset into array of returned groups",
							type : "integer",
							min : 0,
							default : 0}
					},
		response: {groups : "list of group descriptors, may be empty"},
		exceptions: [
				"400 invalid search expression", 
				"400 invalid limit", 
				"400 invalid offset"]
	},	
	
	{	fn : "getGroup",
		status : "active",
		doc : "Get a group by group id. Information returned depends on whether requester is group owner.",
		method : "GET",
		route : "/groups/:groupid",
		routeParams: {	
				groupid : { doc : "group id", type : "JID", class : "xGroup"}
					},
		response: {group : "group descriptor"},
		exceptions: ["404 unknown group id",
					"401 Requester not authorized"]
	},	
	
	{	fn : "deleteGroup",
		status : "active",
		doc : "Delete a group by group id. Requester must be group owner or have admin permissions.",
		method : "DELETE",
		route : "/groups/:groupid",
		routeParams: {	
				groupid : { doc : "group id", type : "JID", class : "xGroup"}
					},
		response: {},
		exceptions: ["404 unknown group id",
					"401 Requester not authorized"]
	},
	
	{	fn : "getGroupMembers",
		status : "active",
		doc : "Find Users who are members of a group, optionally filter by search expression. Group owners see all members, non-owners see only members who allow themselves to be visible.",
		method : "GET",
		route : "/groups/:groupid/members",
		routeParams: {	
				groupid : { doc : "group id",type : "JID", class : "xGroup"}
					},
		queryParams: {	
				searchExpression : { doc : "search parameters to match vs users",
							type : "string",
							default : "*"}, 
				limit : { 	doc : "maximum number of users to return", 
							type : "integer",
							default : 100,
							min : 0,
							max : 1000},	
				offset : {	doc : "offset into array of returned users",
							type : "integer",
							min : 0,
							default : 0}
					},
		response: {groups : "list of user descriptors, may be empty"},
		exceptions: [
				"400 invalid search expression", 
				"400 invalid limit", 
				"400 invalid offset"]
	},		

// Should this be a PUT specific to status instead?

	{	fn : "updateGroupMember",
		status : "inactive",
		doc : "Update a User's membership in a group",
		method : "POST",
		route : "/groups/:groupid/members/:userid",
		routeParams: {	
				groupname : { doc : "id of the group", type : "JID", class : "xGroup" },		
				username : {  doc : "id of the user", type : "JID", class : "xUser"}
					},
		postData : {
				active : { doc : "active status of membership",
							type : "boolean",
							default : true
							}
					},
		response: {},
		exceptions: [
				"400 user is not a member of the group",
				"400 unknown user",
				"400 unknown group",
				"401 Requester not authorized - must be group owner or member"]
	},

	{	fn : "deleteGroupMember",
		status : "inactive",
		doc : "Remove User's membership in a group",
		method : "DELETE",
		route : "/groups/:groupid/members/:userid",
		routeParams: {	
				groupid : { doc : "id of the group", type : "JID", class : "xGroup"},		
				userid : {  doc : "id of the user", type : "JID", class : "xUser"}
				},
		response: {},
		exceptions: [
				"400 user is not a member of the group",
				"400 unknown user",
				"400 unknown group",
				"401 Requester not authorized - must be group owner or member"]
	},

// TODO Group Ownership Permissions
	
];

// fromAccountRID, toAccountRID, requestType, message, aboutRID, callback
exports.Request = [

	{	fn : "createRequest",
		status : "active",
		doc : "toAccount creates a request to fromAccount.",
		method : "POST",
		route : "/requests",
		postData: {	
				toid : { doc : "id of the recipient", type : "JID", class: "xAccount"},		
				fromid : {  doc : "id of the requester", type : "JID", class: "xAccount"},
				requestType : { doc : "type of the request", type : "string"},
				message : { doc : "a human-readable text message to accompany the request", type: "string"},
				aboutid : { doc : "id of the resource that the request is about", type : "JID", class: "xGroup"}
						},
		response: { 
				jid : {doc : "id of the request", type : "JID", class: "xRequest"}
				},
		exceptions: [
				"400 unknown account",
				"400 request already satisfied",
				"401 Requester not authorized - requester must match user"]
	},		

	{	fn : "getRequest",
		status : "active",
		doc : "Get the parameters of a request",
		method : "GET",
		route : "/requests/:requestid",
		routeParams: {	
				requestid : {doc : "id of the request", type : "JID", class : "xRequest"}
				},
		response: { 
				request : { doc : "request parameters", type : "JSON"}
				},
		exceptions: [
				"404 unknown request",
				"401 Requester not authorized - requester must match user or be group owner"]
	},	
	
	{	fn : "processRequest",
		status : "active",
		doc : "toAccount approves or disapproves a request. Approval causes requested action. Processing deletes request",
		method : "POST",
		route : "/requests/:requestid",
		routeParams: {	
				requestid : {doc : "id of the request", type : "JID", class : "xRequest"}
				},
		postData: {		
				approval : { doc : "yes or no", type : "string"}
					},							
		response: {},
		exceptions: [
				"404 unknown request",
				"401 Requester not authorized - requester must match user or be group owner",
				"400 requestStatus already set"]
	},
	
	{	fn : "findRequests",
		status : "active",
		doc : "find requests that were made by the user or can be processed by the user",
		method : "GET",
		route : "/users/:userid/requests",
		routeParams: {	
				userid : {doc : "id of the user", type : "JID", class : "xUser"}
				},
		response: { 
				requests : { doc : "set of request descriptors where each descriptor includes the id and parameters of the request", type : "JSON"}
				},
		exceptions: [
				"404 unknown request",
				"401 Requester not authorized - requester must match account or be account owner"]
	},	
		
];			

	
// TODO : error checking has to cope with networks owned by Groups	
exports.Network = [

	{	fn : "createNetwork",
		status : "active",
		doc : "Create a new network in the specified account",
		method : "POST",
		route : "/networks",
		postData: {	
				network : { 	doc : "network structure",
							  	type : "JDEx",
							  	required : true}, 
				accountid : {		doc : "Account Id - User, Group, Agent",
									type : "JID",
									required : true,
									class : "xUser"
							}
					},
		response: { 
				jid : {doc : "the Id of the new network", type : "JID", class: "xNetwork"}
				},
		exceptions: [
				"404 unknown account",
				"400 network content error",
				"401 requester not authorized - requester must match or own account"]
	},

	//TODO: determine correct behavior in case of published network
	//TODO: dependent resource cleanup? Permissions?
	
	{	fn : "deleteNetwork",
		status : "active",
		doc : "delete a network",
		method : "DELETE",
		route : "/networks/:networkid",
		routeParams: {	
				networkid : { doc : "id of the network", type : "JID", class: "xNetwork"}
					},
		response: {},
		exceptions: [
				"404 unknown network",
				"401 requester not authorized - requester must own network"]
	},	
			
	{	fn : "getNetworkByEdges",
		status : "inactive",
		doc : "Returns all or part of a Network based on edge parameters",
		method : "GET",
		route : "/networks/:networkid/edge",
		routeParams: {	
				networkid : {doc : "id of the network", type: "JID", class: "xNetwork"}
				},
		queryParams: {
						typeFilter : { doc : "filter expression for Edge type",
										type : "string"},
						propertyFilter : { doc : "filter expression for Edge properties",
											type : "string"},
						sourceFilter : { doc : "filter expression for source Nodes",
										type : "string"},
						targetFilter : { doc : "filter expression for target Nodes",
											type : "string"},
						limit : { doc : "number of edges to return",
									type : "integer"},
						offset : { doc : "offset into edges by internal ordering",
									type : "integer"}
					},
		response: { 
				network : { doc : "All or portion of queried Network",
							type : "JDEx"}
				},
		exceptions: [
				"404 unknown network",
				"401 requester not authorized - requester must meet Network Permission Criteria",
				"Invalid query parameters"]
	},	


	{	fn : "getNetworkByNodes",
		status : "inactive",
		doc : "Returns nodes and meta information of a Network based on node parameters",
		method : "GET",
		route : "/networks/:networkid/node",
		routeParams: {	
				networkid : {doc : "id of the network", type: "JID", class: "xNetwork"}
				},
		queryParams: {
						typeFilter : { doc : "filter expression for Node type",
										type : "string"},
						propertyFilter : { doc : "filter expression for Node properties",
											type : "string"},
						limit : { doc : "number of nodes to return",
									type : "integer"},
						offset : { doc : "offset into nodes by internal ordering",
									type : "integer"}
					},
		response: { 
				network : { doc : "nodes and meta information of queried Network as a network",
							type : "JDEx"}
				},
		exceptions: [
				"404 unknown network",
				"401 requester not authorized - requester must meet Network Permission Criteria",
				"Invalid query parameters"]
	},	
	
	{	fn : "getNetworkMetaInfo",
		status : "inactive",
		doc : "Returns the Network JSON structure with only the meta information",
		method : "HEAD",
		route : "/networks/:networkid",
		routeParams: {	
				networkid : {doc : "id of the network", type : "JID", class: "xNetwork"}
				},
		response: { 
				networkMetadata : { doc : "Network, only containing metadata",
									type : "JDEx"}
				},
		exceptions: [
				"404 unknown network",
				"401 requester not authorized - requester must meet Network Permission Criteria"]
	},	
	

	{	fn : "getNetwork",
		status : "active",
		doc : "Returns the Network JDEx",
		method : "GET",
		route : "/networks/:networkid",
		routeParams: {	
				networkid : {doc : "id of the network", type: "JID", class: "xNetwork"}
				},
		response: { 
				network : { doc : "Network", type : "JDEx"}
				},
		exceptions: [
				"404 unknown network",
				"401 requester not authorized - requester must meet Network Permission Criteria"]
	},
			
	// Find Networks
	// by generic elements and edges
	// by network attributes
	// by owners
	// by text in name or description
	{	fn : "findNetworks",
		status : "active",
		doc : "Find Networks by search expression",
		method : "GET",
		route : "/networks",
		queryParams: {	
				searchExpression : { doc : "search specification",
							type : "string",
							default : ""}, 
				limit : { 	doc : "maximum number of networks to return", 
							type : "integer",
							default : 100,
							min : 0,
							max : 1000},	
				offset : {	doc : "offset into array of returned networks",
							type : "integer",
							min : 0,
							default : 0}
					},
		response: {networks : "list of network descriptors, may be empty"},
		exceptions: [
				"400 invalid search expression", 
				"400 invalid limit", 
				"400 invalid offset"]
	},	

	{	fn : "createNetworkPermission",
		status : "inactive",
		doc : "Create a new Permission for the Network",
		method : "POST",
		route : "/networks/:networkid/permissions",
		routeParams: {	
				networkid : { doc : "id of the network", type: "JID"}
				},
		postData: {	
				accountid : { 	doc : "permitted account",
							  	type : "JID",
							  	required : true}, 
					},
		response: { },
		exceptions: [
				"404 unknown network",
				"400 unknown account",
				"401 requester not authorized - requester must own Network"]
	},		

	{	fn : "deleteNetworkPermission",
		status : "inactive",
		doc : "Delete a Permission for the Network",
		method : "DELETE",
		route : "/networks/:networkid/permissions/:permissionid",
		routeParams: {	
				networkid : { doc : "id of the network", type: "JID"},
				permissionid : {doc: "id of the permission", type: "JID"}
				},
		response: { },
		exceptions: [
				"404 unknown network",
				"404 unknown permission",
				"401 requester not authorized - requester must own Network"]
	},	

	{	fn : "setNetworkMetadata",
		status : "inactive",
		doc : "Update metadata structure for a network",
		method : "POST",
		route : "/network/:networkid/metadata",
		routeParams: {	
				networkid : { doc : "id of the network", type : "JID"}
					},
		postData: {
				network : { doc : "network containing metadata to update in the target network",
							type : "JDEx"}
					},
		response: { },
		exceptions: [
				"user does not have permission to modify network",
				"no network by that id"]
	},		

// TODO: define details of update Network. 
// Elements can be added, deleted, or altered.
// This could be used to incrementally create a large network.
	{	fn : "updateNetwork",
		status : "inactive",
		doc : "Update a Network based on the posted network JDEx structure.",
		method : "POST",
		route : "/network/:networkid",
		routeParams: {	
				networkid : { doc : "id of the network", type : "JID"}
					},
		postData: {	
				network : { 	doc : "Update Network",
							  	type : "JDEx",
							  	required : true} 
					},
		response: { },
		exceptions: [
				"Invalid Update Network", 
				"404 unknown network",
				"401 requester not authorized - requester must own Network"]
	},
		
];


//--------------------------------
//
// TASKS
//
//--------------------------------

// Find nodes or edges
// Create nodes or edges
// Alter node or edge attributes
// Remove (and perhaps hide) nodes or edges

// Node and edge annotation operations
// Mapping of data to network elements
// Assignment of layouts to networks
// Association of review and comment annotations
// Filtering based on annotations	
// layouts, data mapped to nodes, etc: all are stored as networks.
// Annotations from one network can be mapped to another

// Copy networks, make versions

// Transform between formats
// Orthology translations
// Merge, subtract, intersect networks in the same format
// Assemble large networks from overlapping, potentially redundant networks of diverse provenance.

// Pathfinding operations that return subnetworks (with paths as edge sequences)

// some references for task systems with REST interfaces:
// https://developers.google.com/appengine/docs/java/taskqueue/rest/
// http://zurmo.org/wiki/rest-api-specification-tasks

exports.Task = [

	{	fn : "createTask",
		status : "inactive",
		doc : "User creates a Task",
		method : "POST",
		route : "/tasks",
		postData: {	
				task : { doc : "task specification",
								type : "JSON"
							},		
				userid : {  doc : "Id of the user",
								type : "JID", class : "xUser"}
						},
		response: { 
				id : {doc : "id of the task", type : "JID", class : "xTask"}
				},
		exceptions: [
				"400 error in task specification",
				"400 unknown user",
				"401 Requester not authorized - requester must match user"]
	},		

	{	fn : "getTask",
		status : "inactive",
		doc : "Get the parameters and status of a task",
		method : "GET",
		route : "/tasks/:taskid",
		routeParams: {	
				taskid : {doc : "id of the task", type : "JID", class : "xTask"}
				},
		response: { 
				task : { doc : "parameters and status of the task",
							type : "JSON"}
				},
		exceptions: [
				"404 unknown task",
				"401 Requester not authorized - requester must be task owner"]
	},	


	{	fn : "updateTask",
		status : "inactive",
		doc : "Set the parameters (such as status) of a task. Can inactivate an active task or activate an inactive task",
		method : "POST",
		route : "/tasks/:taskid",
		routeParams: {	
				taskid : {doc : "id of the task", type : "JID", class : "xTask"}
				},
		postData: {
				status : { doc : "activity status, either active or inactive",
							type : "string"
						}
					},
		response: { 
				task : { doc : "parameters and status of the task",
							type : "JSON"}
				},
		exceptions: [
				"404 unknown task",
				"401 Requester not authorized - requester must be task owner",
				"Unknown status type",
				"Task complete"]
	},	
	
	{	fn : "deleteTask",
		status : "inactive",
		doc : "Delete an inactive or completed task",
		method : "DELETE",
		route : "/tasks/:taskid",
		routeParams: {	
				taskid : {doc : "id of the task", type : "JID", class : "xTask"}
				},
		response: { 
				task : { doc : "parameters and status of the task",
							type : "JSON"}
				},
		exceptions: [
				"404 unknown task",
				"401 Requester not authorized - requester must be task owner",
				"Task must be inactive or complete"]
	},	
		
];




