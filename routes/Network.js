module.db = null;
module.dbHost = "http://localhost:2480/";
module.dbUser = "admin";
module.dbPassword = "admin";

var common = require("./Common.js");
var extend = require('util')._extend;

exports.init = function (orient, callback) {
    module.db = orient;
};

// Create a new network from JDEx, owned by the specified account
exports.createNetwork = function (networkJDEx, accountRID, callback) {
    console.log("calling createNetwork with accountRID = '" + accountRID + "'");
    var postData = {
        "network": networkJDEx,
        "accountid": accountRID
    };
    common.ndexPost(module.dbHost, "ndexNetworkCreate/ndex", module.dbUser, module.dbPassword, postData,
        function (result) {
            callback({jid: result.jid, ownedBy: result.ownedBy, error: null, status: 200});
        },
        function (err) {
            callback({network: null, error: err.toString(), status: 500});
        });
};


exports.getNetwork = function (networkRID, callback) {
    console.log("calling getNetwork with networkRID = '" + networkRID + "'");
    common.ndexGet(module.dbHost, "ndexNetworkGet/ndex", module.dbUser, module.dbPassword, {networkid: networkRID},
        function (result) {
            callback({network: result});
        },
        function (err) {
            callback({network: null, error: err.toString(), status: 500});
        }
    );
};

// get the properties and other metadata of a network
exports.setNetworkMetadata = function(networkRID, metadata, callback){
    console.log("calling setNetworkMetadata with networkRID = '" + networkRID + "' and metadata = " + JSON.stringify(metadata));

    // get the existing properties
    var cmd = "select properties from " + networkRID + "";
    console.log(cmd);
    module.db.command(cmd, function(err, propertyList) {
        if (common.checkErr(err, "finding network properties while updating", callback)){
            try {
                if (!propertyList || propertyList.length < 1){
                    console.log("found no properties for network with id = '" + networkRID + "'");
                    callback({status : 404});
                } else {
                    var properties = propertyList[0];
                    console.log("about to update current properties = " + JSON.stringify(properties) + " for " + networkRID);

                    var newProperties = extend({}, metadata.properties, properties);
                    // merge the new properties with the existing properties
                    var updateCmd = "update " + networkRID + " set properties = " + JSON.stringify(newProperties);
                    console.log("property update command = " + updateCmd);
                    module.db.command(updateCmd, function(err) {
                        // update the properties
                        if (err) {
                            console.log("about to throw error " + err);
                            throw ("Failed to update properties : " + err);
                        }
                        callback({jid: networkRID, error : err, status : 200});
                        });
                }
            }
            catch (e){
                console.log("caught error " + e);
                callback({network : null, error : e.toString(), status : 500});
            }
        }
    }); // close getNetworkMetadata query
};

// get the properties and other metadata of a network
exports.getNetworkMetadata = function(networkRID, callback){
    console.log("calling getNetworkMetadata with networkRID = '" + networkRID + "'");
    var cmd = "select properties, format from " + networkRID + "";
    console.log(cmd);
    module.db.command(cmd, function(err, metadataList) {
        if (common.checkErr(err, "finding network metadata", callback)){
            try {
                if (!metadataList || metadataList.length < 1){
                    console.log("found no metadata for network with id = '" + networkRID + "'");
                    callback({status : 404});
                } else {
                    var metadata = metadataList[0];
                    console.log("found format = " + metadata.format + " and " + JSON.stringify(metadata.properties) + " for " + networkRID);
                    callback({network : metadata});
                }
            }
            catch (e){
                console.log("caught error " + e);
                callback({network : null, error : e.toString(), status : 500});
            }
        }
    }); // close getNetworkMetadata query
};



// get a network via its edges
exports.getNetworkByEdges = function (networkid, typeFilter, propertyFilter, subjectNodeFilter, objectNodeFilter, limit, offset, callback, errorHandler) {
    console.log("calling get network by edges with arguments: " + limit + ', ' + offset);
    common.ndexGet(module.dbHost, "ndexNetworkGetByEdges/ndex", module.dbUser, module.dbPassword,
        {networkid: networkid, limit: limit, offset: offset},
        function (result) {
            callback({network: result});
        },
        function (err) {
            callback({network: null, error: err.toString(), status: 500});
        }
    );
};

//get a network via its nodes
exports.getNetworkByNodes = function (networkid, typeFilter, propertyFilter, limit, offset, callback, errorHandler) {
    console.log("calling get network by nodes with arguments: " + limit + ', ' + offset);
    common.ndexGet(module.dbHost, "ndexNetworkGetByNodes/ndex", module.dbUser, module.dbPassword,
        {networkid: networkid, limit: limit, offset: offset},
        function (result) {
            callback({network: result});
        },
        function (err) {
            callback({network: null, error: err.toString(), status: 500});
        }
    );
};

// delete a network
exports.deleteNetwork = function (networkRID, callback) {
    console.log("calling delete network with id = '" + networkRID + "'");
    var postData = {
        "networkid": networkRID
    };

    common.ndexPost(module.dbHost, "ndexNetworkDelete/ndex", module.dbUser, module.dbPassword, postData,
        function (result) {
            if (result.deleted)
                callback({error: null, status: 200});
            else
                callback({error: null, status: 404});
        },
        function (err) {
            callback({error: err.toString(), status: 500});
        });
};
