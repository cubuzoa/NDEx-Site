
***

###System

##### index
_GET server description_

GET /


Query Parameters:

Exceptions:

##### status
_GET status_

GET /status


Query Parameters:

Exceptions:

***

###User

##### createUser
_Create a User Account_

POST /users


Post Data Parameters:
* username (string)
* password (string)
* recoveryEmail (string)

Exceptions:
* 400 user name already used
* 400 invalid name
* 400 invalid password

##### updateUserProfile
_Set new profile for user. Requester must be user or have admin permissions._

POST /users/:userid/profile


Route Parameters:
* userid (JID)

Post Data Parameters:
* profile (JSON)

Exceptions:
* 404 unknown user id
* 401 Requester not authorized

##### uploadUserImage
_Set a new foreground image for user. Requester must be user or have admin permissions._

POST /users/:userid/images


Route Parameters:
* userid (JID)

Post Data Parameters:
* type (string)

Exceptions:
* 404 unknown user id
* 401 Requester not authorized

##### setUserPassword
_Set a user's password. Requester must be user or have admin permissions._

PUT /users/:userid/password


Route Parameters:
* userid (JID)

Query Parameters:
* newPassword (string)
* oldPassword (string)

Exceptions:
* 404 unknown user id
* 400 incorrect old password
* 400 invalid new password
* 401 Requester not authorized

##### findUsers
_Find users matching search expression_

GET /users


Query Parameters:
* searchExpression (string)
* limit (integer)
* offset (integer)

Exceptions:
* 400 invalid search expression
* 400 invalid limit
* 400 invalid offset

##### getUser
_Get a user by userid. Content returned depends on requester permissions._

GET /users/:userid


Route Parameters:
* userid (JID)

Exceptions:
* 404 unknown user id
* 401 Requester not authorized

##### deleteUser
_Delete a user by user id. Requester must be user or have admin permissions._

DELETE /users/:userid


Route Parameters:
* userid (JID)

Exceptions:
* 404 unknown user id
* 401 Requester not authorized

##### getUserWorkspace
_Get the user's workspace. Requester must be user or have admin permissions._

GET /users/:userid/workspace


Route Parameters:
* userid (JID)

Exceptions:
* 404 unknown user id
* 401 Requester not authorized

##### addNetworkToUserWorkspace
_Add a network to the user's workspace. Requester must be user or have admin permissions. User must have permission to access network_

POST /users/:userid/workspace


Route Parameters:
* userid (JID)

Post Data Parameters:
* networkid (JID)

Exceptions:
* 404 unknown user id
* 401 Requester not authorized

##### deleteNetworkFromUserWorkspace
_Delete a network from the user's workspace. Requester must be user or have admin permissions_

DELETE /users/:userid/workspace/:networkid


Route Parameters:
* userid (JID)
* networkid (JID)

Exceptions:
* 404 unknown user id
* 404 unknown network id
* 401 Requester not authorized

***

###Agent

##### createAgent
_Add a programmatic access account, generate credentials_

POST /agents


Route Parameters:

Post Data Parameters:
* name (string)
* owner (JID)

Exceptions:
* 400 Agent name already used for this owner
* 400 invalid name
* 401 Requester not authorized

##### getAgent
_Get information about an Agent_

GET /agents/:agentid


Route Parameters:
* agentid (JID)

Exceptions:
* 404 unknown Agent
* 401 Requester not authorized

##### getUserAgents
_Get Agents belonging to the user_

GET /users/:userid/agents


Route Parameters:
* userid (JID)

Query Parameters:
* limit (integer)
* offset (integer)

Exceptions:
* 404 unknown user
* 400 invalid limit
* 400 invalid offset
* 401 Requester not authorized

##### getGroupAgents
_Get Agents belonging to the group_

GET /groups/:groupid/agents


Route Parameters:
* groupid (JID)

Query Parameters:
* limit (integer)
* offset (integer)

Exceptions:
* 404 unknown group
* 400 invalid limit
* 400 invalid offset
* 401 Requester not authorized

##### updateAgent
_Update the credentials and/or status for an Agent_

POST /agents/:agentid


Route Parameters:
* agentId (JID)

Post Data Parameters:
* credentials (string)
* status (string)
* name (string)

Exceptions:
* 401 Requester not authorized
* 404 unknown Agent

***

###Group

##### createGroup
_Add a group account_

POST /groups


Post Data Parameters:
* userid (JID)
* groupName (string)

Exceptions:
* 404 unknown user id
* 401 Requester not authorized
* 400 group name already used
* 400 invalid group name

##### updateGroupProfile
_Set new group profile information. Requester must be group owner or have admin permissions._

POST /groups/:groupid/profile


Post Data Parameters:
* groupid (JID)
* profile (JSON)

Exceptions:
* 404 unknown group id
* 401 Requester not authorized

##### uploadGroupImage
_Set a new foreground image for group. Requester must be group owner or have admin permissions._

POST /groups/:groupid/images


Post Data Parameters:
* groupid (JID)
* type (string)

Exceptions:
* 404 unknown group id
* 401 Requester not authorized

##### findGroups
_Find groups by search expression_

GET /groups


Query Parameters:
* searchExpression (string)
* limit (integer)
* offset (integer)

Exceptions:
* 400 invalid search expression
* 400 invalid limit
* 400 invalid offset

##### getGroup
_Get a group by group id. Information returned depends on whether requester is group owner._

GET /groups/:groupid


Route Parameters:
* groupid (JID)

Exceptions:
* 404 unknown group id
* 401 Requester not authorized

##### deleteGroup
_Delete a group by group id. Requester must be group owner or have admin permissions._

DELETE /groups/:groupid


Route Parameters:
* groupid (JID)

Exceptions:
* 404 unknown group id
* 401 Requester not authorized

##### getGroupMembers
_Find Users who are members of a group, optionally filter by search expression. Group owners see all members, non-owners see only members who allow themselves to be visible._

GET /groups/:groupid/members


Route Parameters:
* groupid (JID)

Query Parameters:
* searchExpression (string)
* limit (integer)
* offset (integer)

Exceptions:
* 400 invalid search expression
* 400 invalid limit
* 400 invalid offset

##### updateGroupMember
_Update a User's membership in a group_

POST /groups/:groupid/members/:userid


Route Parameters:
* groupname (JID)
* username (JID)

Post Data Parameters:
* active (boolean)

Exceptions:
* 400 user is not a member of the group
* 400 unknown user
* 400 unknown group
* 401 Requester not authorized - must be group owner or member

##### deleteGroupMember
_Remove User's membership in a group_

DELETE /groups/:groupid/members/:userid


Route Parameters:
* groupid (JID)
* userid (JID)

Exceptions:
* 400 user is not a member of the group
* 400 unknown user
* 400 unknown group
* 401 Requester not authorized - must be group owner or member

***

###Request

##### createRequest
_toAccount creates a request to fromAccount._

POST /requests


Post Data Parameters:
* toid (JID)
* fromid (JID)
* requestType (string)
* message (string)
* aboutid (JID)

Exceptions:
* 400 unknown account
* 400 request already satisfied
* 401 Requester not authorized - requester must match user

##### getRequest
_Get the parameters of a request_

GET /requests/:requestid


Route Parameters:
* requestid (JID)

Exceptions:
* 404 unknown request
* 401 Requester not authorized - requester must match user or be group owner

##### processRequest
_toAccount approves or disapproves a request. Approval causes requested action. Processing deletes request_

POST /requests/:requestid


Route Parameters:
* requestid (JID)

Post Data Parameters:
* approval (string)

Exceptions:
* 404 unknown request
* 401 Requester not authorized - requester must match user or be group owner
* 400 requestStatus already set

##### findRequests
_find requests that were made by the user or can be processed by the user_

GET /users/:userid/requests


Route Parameters:
* userid (JID)

Exceptions:
* 404 unknown request
* 401 Requester not authorized - requester must match account or be account owner

***

###Network

##### createNetwork
_Create a new network in the specified account_

POST /networks


Post Data Parameters:
* network (JDEx)
* accountid (JID)

Exceptions:
* 404 unknown account
* 400 network content error
* 401 requester not authorized - requester must match or own account

##### deleteNetwork
_delete a network_

DELETE /networks/:networkid


Route Parameters:
* networkid (JID)

Exceptions:
* 404 unknown network
* 401 requester not authorized - requester must own network

##### getNetworkByEdges
_Returns all or part of a Network based on edge parameters_

GET /networks/:networkid/edge


Route Parameters:
* networkid (JID)

Query Parameters:
* typeFilter (JSON)
* propertyFilter (JSON)
* subjectNodeFilter (JSON)
* objectNodeFilter (JSON)
* limit (integer)
* offset (integer)

Exceptions:
* 404 unknown network
* 401 requester not authorized - requester must meet Network Permission Criteria
* Invalid query parameters

##### getNetworkByNodes
_Returns nodes and meta information of a Network based on node parameters_

GET /networks/:networkid/node


Route Parameters:
* networkid (JID)

Query Parameters:
* typeFilter (JSON)
* propertyFilter (JSON)
* limit (integer)
* offset (integer)

Exceptions:
* 404 unknown network
* 401 requester not authorized - requester must meet Network Permission Criteria
* Invalid query parameters

##### getNetworkMetaInfo
_Returns the Network JSON structure with only the meta information_

HEAD /networks/:networkid


Route Parameters:
* networkid (JID)

Exceptions:
* 404 unknown network
* 401 requester not authorized - requester must meet Network Permission Criteria

##### getNetwork
_Returns the Network JDEx_

GET /networks/:networkid


Route Parameters:
* networkid (JID)

Exceptions:
* 404 unknown network
* 401 requester not authorized - requester must meet Network Permission Criteria

##### findNetworks
_Find Networks by search expression_

GET /networks


Query Parameters:
* searchExpression (string)
* limit (integer)
* offset (integer)

Exceptions:
* 400 invalid search expression
* 400 invalid limit
* 400 invalid offset

##### createNetworkPermission
_Create a new Permission for the Network_

POST /networks/:networkid/permissions


Route Parameters:
* networkid (JID)

Post Data Parameters:
* accountid (JID)

Exceptions:
* 404 unknown network
* 400 unknown account
* 401 requester not authorized - requester must own Network

##### deleteNetworkPermission
_Delete a Permission for the Network_

DELETE /networks/:networkid/permissions/:permissionid


Route Parameters:
* networkid (JID)
* permissionid (JID)

Exceptions:
* 404 unknown network
* 404 unknown permission
* 401 requester not authorized - requester must own Network

##### setNetworkMetadata
_Update metadata structure for a network_

POST /network/:networkid/metadata


Route Parameters:
* networkid (JID)

Post Data Parameters:
* network (JDEx)

Exceptions:
* user does not have permission to modify network
* no network by that id

##### updateNetwork
_Update a Network based on the posted network JDEx structure._

POST /network/:networkid


Route Parameters:
* networkid (JID)

Post Data Parameters:
* network (JDEx)

Exceptions:
* Invalid Update Network
* 404 unknown network
* 401 requester not authorized - requester must own Network

***

###Task

##### createTask
_User creates a Task_

POST /tasks


Post Data Parameters:
* task (JSON)
* userid (JID)

Exceptions:
* 400 error in task specification
* 400 unknown user
* 401 Requester not authorized - requester must match user

##### getTask
_Get the parameters and status of a task_

GET /tasks/:taskid


Route Parameters:
* taskid (JID)

Exceptions:
* 404 unknown task
* 401 Requester not authorized - requester must be task owner

##### updateTask
_Set the parameters (such as status) of a task. Can inactivate an active task or activate an inactive task_

POST /tasks/:taskid


Route Parameters:
* taskid (JID)

Post Data Parameters:
* status (string)

Exceptions:
* 404 unknown task
* 401 Requester not authorized - requester must be task owner
* Unknown status type
* Task complete

##### deleteTask
_Delete an inactive or completed task_

DELETE /tasks/:taskid


Route Parameters:
* taskid (JID)

Exceptions:
* 404 unknown task
* 401 Requester not authorized - requester must be task owner
* Task must be inactive or complete