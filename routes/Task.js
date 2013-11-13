module.db = null;

module.dbHost = "http://localhost:2480/";
module.dbUser = "admin";
module.dbPassword = "admin";
module.dbName = "ndex";


var common = require("./Common.js");

exports.init = function (orient, callback) {
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
exports.createTask = function (task, userid, callback, errorHandler) {
    console.log("calling createTask with arguments '" + task + "' '" + userid + "'");

    userid = common.convertFromRID(userid);
    var postData = {
        "userJid": userid
    };

    common.ndexPost(module.dbHost, "ndexTaskCreate/" + module.dbName, module.dbUser, module.dbPassword, postData,
        function (result) {
            callback({jid: result.taskJid, status: 200});
        },
        function (err) {
            callback({error: JSON.stringify(err), status: (err.status) ? err.status : 500});
        });
};

/*
 getTask

 Get the parameters and status of a task

 GET /tasks/:taskid

 Route Parameters:

 taskid (JID)
 */
exports.getTask = function (taskid, callback, errorHandler) {
    console.log("calling getTask with RID = '" + taskid + "'");

    taskid = common.convertFromRID(taskid);

    common.ndexGet(module.dbHost, "ndexTaskGet/" + module.dbName, module.dbUser, module.dbPassword, {taskJid: taskid},
        function (result) {
            callback({task: result});
        },
        function (err) {
            callback({error: JSON.stringify(err), status: (err.status) ? err.status : 500});
        }
    );
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
exports.updateTask = function (taskid, taskStatus, callback, errorHandler) {
    console.log("calling updateTask with arguments " + "'" + taskid + "' " + "'" + taskStatus + "'");

    taskid = common.convertFromRID(taskid);

    var postData = {
        "taskJid": taskid,
        "taskStatus": taskStatus
    };

    common.ndexPost(module.dbHost, "ndexTaskUpdate/" + module.dbName, module.dbUser, module.dbPassword, postData,
        function (result) {
            callback({status: 200});
        },
        function (err) {
            callback({error: JSON.stringify(err), status: (err.status) ? err.status : 500});
        });
};

/*
 deleteTask

 Delete an inactive or completed task

 DELETE /tasks/:taskid

 Route Parameters:

 taskid (JID)

 */
exports.deleteTask = function (taskid, callback, errorHandler) {
    console.log("calling deleteTask for  " + taskid);
    taskid = common.convertFromRID(taskid);

    var postData = {
        "taskJid": taskid,
    };

    common.ndexPost(module.dbHost, "ndexTaskDelete/" + module.dbName, module.dbUser, module.dbPassword, postData,
        function (result) {
            callback({status: 200});
        },
        function (err) {
            callback({error: JSON.stringify(err), status: (err.status) ? err.status : 500});
        });
};
