module.db = null;

exports.init = function(orient, common, callback) {
    module.db = orient;
    module.common = common;
}

/*

"Requests" are transactions between accounts, proposed by one account and processed (approved / disapproved) by another.

They persist until they are processed

Requests of different types will be displayed to the users with different language, 
such as "invitations", "offer", "request", but the underlying objects are shared.

*/

/*

createRequest

fromAccount creates a request to toAccount

POST /requests

Post Data Parameters:

fromAccountId (JID)
toAccountId (JID)
requestDescription

*/


/*

getRequest

Get the parameters and status of a request

Only accessible by fromAccount, toAccount, and Admin

GET /requests/:requestid

Route Parameters:

requestid (JID)

*/

/*

findRequest

Get the requests either made by the user or that can be processed by the user (including those for which they are group admin)

GET /users/:userid/requests

Route Parameters:

userid (JID)

*/

/*

processRequest

toAccount approves or disapproves a request.

Effects: 
	- some action dependent on requestDescription
	- deletion of the request

Supported action types:
	add user as member of group

POST /requests/:requestid

Route Parameters:

requestid (JID) 

*/
