


exports.convertFromRID = function (RID){
	return RID.replace("#","C").replace(":", "R");
}

exports.contains = function (a, obj) {
	
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
    
  
}

exports.checkErr = function(err, where, callback){
	if (err){
			console.log("DB error, " + where + " : " + err);
			callback({network : null, error : err, status : 500});
			return false;
	}
	return true;
};


