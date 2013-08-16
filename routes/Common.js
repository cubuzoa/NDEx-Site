


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


exports.ridCheck = function (checkList, res, callback){
	// query about all ids on checklist
	// scan results for errors
	// if errors, summarize and respond
	// otherwise continue with callback
	
	callback();
	return true;
}

exports.checkJID = function(jid){
	if (jid){
		var jidPattern=/^C{1}[0-9]{2}R[0-9]+$/g;
		return jidPattern.test(jid);
	}
	return false;
};
