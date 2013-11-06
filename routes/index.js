module.db = null;

// Ensure that we find or create the required classes:
//
//	xUser
//	xGroup
//	xNetwork
//
function ensureSchemaIsSetup(callback) {
	ensureClass("xPermission", "V");
	ensureClass("xOwnsGroup", "E");
	ensureClass("xOwnsAgent", "E");
    ensureClass("xRequest", "V");
	callback();
}

function ensureClass(className, parentName, callback){
    if (module.db.getClassByName(className) === null) {
    	console.log("creating " + className);
        module.db.createClass(className, parentName, function(err) {
            if (err)
                throw new Error("Unexpected error " + err);
            else if (callback)
                callback()
        });
    } else {
    	console.log(className + " exists");
    	if (callback) callback();
    }

}

exports.init = function(orient, callback) {
    module.db = orient;
    ensureSchemaIsSetup(callback);
};