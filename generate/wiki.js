
###System

##### index
_GET server description_

GET /

Query Parameters:

##### status
_GET status_

GET /status

Query Parameters:

###User

##### createUser
_Create a User Account_

POST /users

Post Data Parameters:
* username (string)
* password (string)
* recoveryEmail (string)

##### updateUserProfile
_Set new profile for user. Requester must be user or have admin permissions._

POST /users/:userid/profile

Post Data Parameters:
* userid (JID)
* profile (JSON)

##### setUserPassword
_Set a user's password. Requester must be user or have admin permissions._

PUT /users/:userid/password

Route Parameters:
* userid (JID)
Query Parameters:
* newPassword (string)
* oldPassword (string)

##### findUsers
_Find users matching search expression_

GET /users

Query Parameters:
* searchExpression (string)
* limit (integer)
* offset (integer)

##### getUser
_Get a user by userid. Content returned depends on requester permissions._

GET /users/:userid

Route Parameters:
* userid (JID)

##### deleteUser
_Delete a user by user id. Requester must be user or have admin permissions._

DELETE /users/:userid

Route Parameters:
* userid (JID)

##### getUserWorkspace
_Get the user's workspace. Requester must be user or have admin permissions._

GET /users/:userid/workspace

Route Parameters:
* userid (JID)

##### addNetworkToUserWorkspace
_Add a network to the user's workspace. Requester must be user or have admin permissions. User must have permission to access network_

POST /users/:userid/workspace

Route Parameters:
* userid (JID)
Post Data Parameters:
* networkid (JID)
* profile (JSON)

##### deleteNetworkFromUserWorkspace
_Delete a network from the user's workspace. Requester must be user or have admin permissions_

DELETE /users/:userid/workspace/:networkid

Route Parameters:
* userid (JID)
* networkid (JID)

###Agent

##### createAgent
_Add a programmatic access account, generate credentials_

POST /agents

Route Parameters:
Post Data Parameters:
* name (string)
* owner (JID)

##### getAgent
_Get information about an Agent_

GET /agents/:agentid

Route Parameters:
* agentid (JID)

##### getUserAgents
_Get Agents belonging to the user_

GET /users/:userid/agents

Route Parameters:
* userid (JID)
Query Parameters:
* limit (integer)
* offset (integer)

##### getGroupAgents
_Get Agents belonging to the group_

GET /groups/:groupid/agents

Route Parameters:
* groupid (JID)
Query Parameters:
* limit (integer)
* offset (integer)

##### setAgentActive
_Update the activity status for an Agent_

PUT /agents/:agentid/active

Route Parameters:
* agentId (JID)

##### updateAgentCredentials
_Update the credentials for an Agent, default is to reset them_

POST /agents/:agentid/credentials

Route Parameters:
* agentId (JID)
Post Data Parameters:
* action (string)

###Group

##### createGroup
_Add a group account_

POST /groups

Post Data Parameters:
* userid (JID)
* groupName (string)

##### updateGroupProfile
_Set new group profile information. Requester must be group owner or have admin permissions._

POST /groups/:groupid/profile

Post Data Parameters:
* groupid (JID)
* profile (JSON)

##### findGroups
_Find groups by search expression_

GET /groups

Query Parameters:
* searchExpression (string)
* limit (integer)
* offset (integer)

##### getGroup
_Get a group by group id. Information returned depends on whether requester is group owner._

GET /groups/:groupid

Route Parameters:
* groupid (JID)

##### deleteGroup
_Delete a group by group id. Requester must be group owner or have admin permissions._

DELETE /groups/:groupid

Route Parameters:
* groupid (JID)

##### getGroupMembers
_Find Users who are members of a group, optionally filter by search expression. Group owners see all members, non-owners see only members who allow themselves to be visible._

GET /groups/:groupid/members

Route Parameters:
* groupid (JID)
Query Parameters:
* searchExpression (string)
* limit (integer)
* offset (integer)

##### updateGroupMember
_Update a User's membership in a group_

POST /groups/:groupid/members/:userid

Route Parameters:
* groupname (JID)
* username (JID)
Post Data Parameters:
* active (boolean)

##### deleteGroupMember
_Remove User's membership in a group_

DELETE /groups/:groupid/members/:userid

Route Parameters:
* groupname (JID)
* username (JID)

###MemberRequest

##### createMemberRequest
_User creates a request to join a group._

POST /memberRequests

Post Data Parameters:
* groupname (JID)
* username (JID)

##### getMemberRequestInfo
_Get the parameters and status of a member request_

GET /memberRequests/:memberRequestid

Route Parameters:
* memberRequestid (JID)

##### processMemberRequest
_group owner approves or denies a request to join a group, has the side effect to update the user's membership_

POST /memberRequests/:memberRequestid

Route Parameters:
* memberRequestid (JID)
Post Data Parameters:
* requestStatus (string)

###MemberInvitation

##### createMemberinvitation
_Group owner creates a invitation for a User to join the group._

POST /memberInvitations

Post Data Parameters:
* groupname (string)
* username (string)

##### getMemberInvitationInfo
_Get the parameters and status of a member invitation_

GET /memberInvitations/:memberInvitationid

Route Parameters:
* memberInvitationId (JID)

##### processMemberInvitation
_User approves or denies a invitation to join a group, has the side effect to update the user's membership_

POST /memberInvitations/:memberinvitationid

Route Parameters:
* memberInvitationId (JID)
Post Data Parameters:
* invitationStatus (string)

###Network

##### createNetwork
_Create a new network in the specified account_

POST /networks

Post Data Parameters:
* network (JDEx)
* accountid (JID)

##### deleteNetwork
_delete a network_

DELETE /networks/:networkid

Route Parameters:
* networkid (JID)

##### getNetworkByEdges
_Returns all or part of a Network based on edge parameters_

GET /networks/:networkid/edge

Route Parameters:
* networkid (JID)
Query Parameters:
* typeFilter (string)
* propertyFilter (string)
* sourceFilter (string)
* targetFilter (string)
* limit (integer)
* offset (integer)

##### getNetworkByNodes
_Returns nodes and meta information of a Network based on node parameters_

GET /networks/:networkid/node

Route Parameters:
* networkid (JID)
Query Parameters:
* typeFilter (string)
* propertyFilter (string)
* limit (integer)
* offset (integer)

##### getNetworkMetaInfo
_Returns the Network JSON structure with only the meta information_

HEAD /networks/:networkid

Route Parameters:
* networkid (JID)

##### getNetwork
_Returns the Network JDEx_

GET /networks/:networkid

Route Parameters:
* networkid (JID)

##### findNetworks
_Find Networks by search expression_

GET /networks

Query Parameters:
* searchExpression (string)
* limit (integer)
* offset (integer)

##### createNetworkPermission
_Create a new Permission for the Network_

POST /networks/:networkid/permissions

Route Parameters:
* networkid (JID)
Post Data Parameters:
* accountid (JID)

##### deleteNetworkPermission
_Delete a Permission for the Network_

DELETE /networks/:networkid/permissions/:permissionid

Route Parameters:
* networkid (JID)
* permissionid (JID)

##### setNetworkMetadata
_Update metadata structure for a network_

POST /network/:networkid/metadata

Route Parameters:
* networkid (JID)
Post Data Parameters:
* network (JDEx)

##### updateNetwork
_Update a Network based on the posted network JDEx structure._

POST /network/:networkid

Route Parameters:
* networkid (JID)
Post Data Parameters:
* network (JDEx)

###Task

##### createTask
_User creates a Task_

POST /tasks

Post Data Parameters:
* task (JSON)
* userid (JID)

##### getTask
_Get the parameters and status of a task_

GET /tasks/:taskid

Route Parameters:
* taskid (JID)

##### setTaskStatus
_Set the status of a task. Can inactivate an active task or activate an inactive task_

PUT /tasks/:taskid/status

Route Parameters:
* taskid (JID)
Query Parameters:
* status (string)

##### deleteTask
_Delete an inactive or completed task_

DELETE /tasks/:taskid

Route Parameters:
* taskid (JID)