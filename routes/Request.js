module.db = null;

var common = require("./Common.js");

exports.init = function(orient, callback) {
    module.db = orient;   
};

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
exports.createRequest = function(fromAccountRID, toAccountRID, requestDescription, callback){
	console.log("calling createRequest with arguments fromAccountRID = '" + fromAccountRID + "' toAccountRID = '" + toAccountRID + "'");
	module.common.checkAccount(
	var selectUserByUserNameCmd = "select from xUser where username = '" + username + "'";
	var insertUserCmd = "insert into xUser (username, password) values('" + username + "', '" + password + "')";
	//console.log("first checking that username is not taken");
	module.db.command(selectUserByUserNameCmd, function(err, users) {
		if (err) {
			callback( {error : err, status : 500});
		} else {
			//console.log("Existing users: " + JSON.stringify(users));
			if (users && users.length > 0){
				callback({error : "username '" + username + "' is already in use", status : 500});
			} else {
				//console.log("now inserting the new user");
				//console.log(insertUserCmd);
				module.db.command(insertUserCmd, function(err, results) {
					if (err){
						console.log("insert of new user yields error : " + err);
						callback({error : err});
					} else {
						var user = results[0];
						//console.log(JSON.stringify(user));
						callback({status: 200, error : err, jid: user['@rid'], username: user['username']});
					}
					
				});
			}
    	}
    });
};
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
