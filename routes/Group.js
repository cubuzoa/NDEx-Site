var check = require('validator').check;

module.db = null;

module.dbHost = "http://localhost:2480/";
module.dbUser = "admin";
module.dbPassword = "admin";
module.dbName = "ndex";

var common = require("./Common.js");

exports.init = function (orient, callback) {
    module.db = orient;
};

exports.createGroup = function (userRID, groupname, callback) {
    console.log("calling createGroup with userRID = '" + userRID + "' and groupname = '" + groupname + "'");

    userRID = common.convertFromRID(userRID);

    var postData = {
        "userJid": userRID,
        "groupname": groupname
    };
    common.ndexPost(module.dbHost, "ndexGroupCreate/" + module.dbName, module.dbUser, module.dbPassword, postData,
        function (result) {
            callback({jid: result.jid, groupname: result.groupname, error: null, status: 200});
        },
        function (err) {
            callback({error: JSON.stringify(err), status: (err.status) ? err.status : 500});
        });
};


exports.updateGroupProfile = function (groupRID, profile, callback) {
    console.log("calling updateGroupProfile for group " + groupRID + " with " + JSON.stringify(profile));

    groupRID = common.convertFromRID(groupRID);

    var postData = {
        "groupJid": groupRID,
        "profile": profile
    };
    common.ndexPost(module.dbHost, "ndexGroupUpdateProfile/" + module.dbName, module.dbUser, module.dbPassword, postData,
        function (result) {
            callback({profile: result.profile, error: null, status: 200});
        },
        function (err) {
            callback({error: JSON.stringify(err), status: (err.status) ? err.status : 500});
        });
};

exports.findGroups = function (searchExpression, limit, offset, callback) {
    console.log("calling findGroups with arguments: " + searchExpression + " " + limit + " " + offset);

    var parameters = {
        "searchExpression": searchExpression,
        "limit": limit,
        "offset": offset
    };
    common.ndexGet(module.dbHost, "ndexFindGroups/" + module.dbName, module.dbUser, module.dbPassword, parameters,
        function (result) {
            callback({groups: result.groups, error: null, status: 200});
        },
        function (err) {
            callback({error: JSON.stringify(err), status: (err.status) ? err.status : 500});
        });
};

exports.getGroupByName = function (groupname, callback) {
    console.log("calling getGroupByName with groupname = '" + groupname + "'");

    var parameters = {
        "groupname": groupname
    };
    common.ndexGet(module.dbHost, "ndexGetGroupByName/" + module.dbName, module.dbUser, module.dbPassword, parameters,
        function (result) {
            callback({group: result.group, error: null, status: 200});
        },
        function (err) {
            callback({error: JSON.stringify(err), status: (err.status) ? err.status : 500});
        });
};

exports.getGroup = function (groupRID, callback) {
    console.log("calling getGroup with groupRID = '" + groupRID + "'");

    groupRID = common.convertFromRID(groupRID);

    var parameters = {
        "groupJid": groupRID
    };
    common.ndexGet(module.dbHost, "ndexGetGroup/" + module.dbName, module.dbUser, module.dbPassword, parameters,
        function (result) {
            callback({group: result.group, error: null, status: 200});
        },
        function (err) {
            callback({error: JSON.stringify(err), status: (err.status) ? err.status : 500});
        });
};

exports.deleteGroup = function (groupRID, callback) {
    console.log("calling delete group with groupRID = '" + groupRID + "'");

    groupRID = common.convertFromRID(groupRID);

    var postData = {
        "groupJid": groupRID
    };
    common.ndexPost(module.dbHost, "ndexGroupDelete/" + module.dbName, module.dbUser, module.dbPassword, postData,
        function (result) {
            callback({error: null, status: 200});
        },
        function (err) {
            callback({error: JSON.stringify(err), status: (err.status) ? err.status : 500});
        });
};

