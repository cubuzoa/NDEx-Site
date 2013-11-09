
exports.init = function(orient, callback) {
   // no op
};

exports.index = function(callback){
	callback({description: "REST Server"});
}

exports.status = function(callback){
	console.log("about to execute callback for basics.status");
	callback({description: "REST Server"});
}