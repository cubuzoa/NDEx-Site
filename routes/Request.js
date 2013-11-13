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

exports.createRequest = function(fromAccountRID, toAccountRID, requestType, message, aboutRID, callback){
	console.log("calling createRequest with arguments fromAccountRID = '" + fromAccountRID + "' toAccountRID = '" + toAccountRID + "'");
	
	var msg = message || "";
	
	// TODO:	
	// Check that requestType is one of known types
	// Ensure that message is properly escaped for storage	
	// Ensure that aboutRID is non-null when required
	

	var cmd = "insert into xRequest (toAccount, fromAccount, requestType, message, about) " 
						+ "values('" + toAccountRID + "', '" + fromAccountRID + "', '" + requestType + "', '" + aboutRID + "', '" + message + "')";

	//console.log(cmd);
	module.db.command(cmd, function(err, results) {
		if (common.checkErr(err, "insert of new request causes : " + err, callback)){
			var request = results[0];
			//console.log(JSON.stringify(request));
			callback({status: 200, error : err, jid: request['@rid']});
		}
					
	});  // close insert command

};


/*

getRequest

Get the parameters and status of a request

Only accessible by fromAccount, toAccount, and Admin

GET /requests/:requestid

Route Parameters:

requestid (JID)

*/

exports.getRequest = function(requestRID, callback){
	console.log("calling getRequest with RID = '" + requestRID + "'");
	var cmd = "select from xRequest where @rid = " + requestRID + "";
	console.log(cmd);
	module.db.command(cmd, function(err, requests) {

		if (common.checkErr(err, "finding request", callback)){
			var request = requests[0];
			//console.log(JSON.stringify(request));
			callback({	status: 200, 
						error : err, 
						jid: request['@rid'], 
						fromAccount: request.fromAccount,
						toAccount: request.toAccount,
						requestType: request.requestType,
						about: request.about,
						message: request.message
					});
		}
	});
};

exports.processRequest = function(requestid, approval, callback, errorHandler){
	console.log("calling processRequest for request " + requestid);
	var cmd = "delete from " +  requestid + " where @class = 'xRequest' ";
	console.log(cmd);
	module.db.command(cmd, function(err, requests) {
		if (common.checkErr(err, "deleting request", callback)){
			callback({	status: 200, error : err});
		}
	});
};

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
