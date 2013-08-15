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


/*
getTask

Get the parameters and status of a task

GET /tasks/:taskid

Route Parameters:

taskid (JID)
*/

/*
updateTask

Set the status and potentially other parameters of a task. Can inactivate an active task or activate an inactive task

POST /tasks/:taskid

Route Parameters:

taskid (JID) 

Post data Parameters:
status (string)

*/

/*
deleteTask

Delete an inactive or completed task

DELETE /tasks/:taskid

Route Parameters:

taskid (JID)

*/