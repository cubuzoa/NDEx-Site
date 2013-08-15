module.db = null;

// Ensure that we find or create the required classes:
//
//	xUser
//	xGroup
//	xNetwork
//
function ensureSchemaIsSetup(callback) {
	ensureClass("xAccount", "V", function(){
		ensureClass("xUser", "xAccount");
		ensureClass("xGroup", "xAccount");
		ensureClass("xAgent", "xAccount");
	});
	
	ensureClass("xNetwork", "V");
	ensureClass("xNode", "V");
	ensureClass("xTask", "V");
	ensureClass("xRequest", "V");
	ensureClass("xEdge", "E");
	ensureClass("xOwnsNetwork", "E");
	ensureClass("xTerm", "V", function(){
		ensureClass("xBaseTerm", "xTerm");
		ensureClass("xFunctionTerm", "xTerm");
	});
	
	ensureClass("xCitation", "V");
	ensureClass("xSupport", "V");
	ensureClass("xPermission", "V");
	ensureClass("xRequest", "V");
	ensureClass("xOwnsGroup", "E");
	ensureClass("xOwnsAgent", "E");
	callback();
}

function ensureClass(className, parentName, callback){
    if (module.db.getClassByName(className) === null) {
    	console.log("creating " + className);
    	var cmd = "create class " + className + " extends " + parentName;
        module.db.command(cmd, function(err){
        	if (callback) callback();
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