module.db = null;

var common = require("./Common.js");

exports.init = function(orient, callback) {
    module.db = orient;   
};

/*
createTask

User creates a Task

POST /tasks

Post Data Parameters:

task (JSON)
userid (JID)
*/
exports.createTask = function( task, userid, callback, errorHandler ) {
	console.log("calling createTask with arguments '" + task + "' '" + userid + "'");
	
	var cmd = "insert into xTask (owner, status, startTime) values( '" + userid + "', '" + "'active'" + "', sysdate('yyMMddHHmmssSSS'))";
	
	module.db.command(cmd, function(err, results) {
		if (common.checkErr(err, "insert of new task causes : " + err, callback)){
			var task = results[0];
			var updateCmd = "update " + userid + " add task = " + task['@rid'];
			module.db.command(updateCmd, function(err, results) {
				if (common.checkErr(err, "update of task causes : " + err, callback)){
					callback({status: 200, error : err, jid: task['@rid']});
				}
			});//close update command
		}
					
	});  // close insert command
};

/*
getTask

Get the parameters and status of a task

GET /tasks/:taskid

Route Parameters:

taskid (JID)
*/
exports.getTask = function( taskid, callback, errorHandler ) {
	console.log("calling getTask with RID = '" + taskid + "'");
	var cmd = "select from xTask where @rid = " + taskid + "";
	console.log(cmd);
	module.db.command(cmd, function(err, requests) {

		if (common.checkErr(err, "finding task", callback)){
			var task = requests[0];
			//console.log(JSON.stringify(request));
			callback({	status: 200, 
					error : err, 
					task : task	});
		}
	});
};

/*
updateTask

Set the status and potentially other parameters of a task. Can inactivate an active task or activate an inactive task

POST /tasks/:taskid

Route Parameters:

taskid (JID) 

Post data Parameters:
status (string)

*/
exports.updateTask = function( taskid, taskStatus, callback, errorHandler ) {
	console.log("calling updateTask with arguments " + "'" + taskid + "' " + "'" + taskStatus + "'");
	var setString = "status = '" + taskStatus + "'";
	var updateCmd = "update " + taskid + " set " + setString;
	
	module.db.command(updateCmd, function(err, result){
		if (common.checkErr(err, "updating task", callback)){
			callback({error: err, status : 200});
		}
	});
};

/*
deleteTask

Delete an inactive or completed task

DELETE /tasks/:taskid

Route Parameters:

taskid (JID)

*/
exports.deleteTask = function( taskid, callback, errorHandler ) {
	console.log("calling deleteTask for  " + taskid);
	var cmd = "delete from " + taskid + " where @class = 'xTask' ";
	console.log(cmd);
	module.db.command(cmd, function(err, requests) {
		if (common.checkErr(err, "deleting task", callback)){
			callback({status: 200, error : err});
		}
	});
};
