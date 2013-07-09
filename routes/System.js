module.db = null;

exports.init = function(orient, callback) {
    module.db = orient;
};

exports.index = function(callback){
	callback({description: "REST Server"});
}

exports.status = function(callback){
	console.log("about to execute callback for basics.status");
	callback({description: "REST Server"});
}