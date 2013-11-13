module.db = null;

// Schema initialization now in ndex-java
//
// This code will be completely eliminated as soon as Requests are handled there.
//
//	xUser
//	xGroup
//	xNetwork
//
// ensureClass("xPermission", "V");
// ensureClass("xOwnsGroup", "E");
// ensureClass("xOwnsAgent", "E");

function ensureSchemaIsSetup(callback) {

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