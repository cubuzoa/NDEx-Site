module.db = null;

function ensureSchemaIsSetup(callback) {
    if (module.db.getClassByName("NDExUser") === null) {
    	console.log("creating NDExUser");
        module.db.createClass("NDExUser", "OGraphVertex", callback);
    } else {
    	console.log("NDExUser exists");
    
    }
}

exports.init = function(orient, callback) {
    module.db = orient;
    ensureSchemaIsSetup(callback);
};