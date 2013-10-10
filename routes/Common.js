if (typeof($) === 'undefined') {
    console.log("requiring jquery");
    $ = require('jquery');
}

if (typeof(btoa) === 'undefined') {
    console.log("requiring btoa");
    btoa = require('btoa');
}


exports.ndexGet = function (host, route, userName, userPassword, queryArgs, callback, errorHandler) {

    $.ajax({
        type: "GET",
        /*
         password: credentials.password,
         username: credentials.username,
         xhrFields: {
         withCredentials: true
         },
         */
        beforeSend: function(xhr){
            xhr.setRequestHeader("Authorization", "Basic " + btoa(userName + ":" + userPassword));
        },
        url: host + route,
        data: queryArgs,
        dataType: "JSON",
        success: callback,
        error: errorHandler || exports.defaultNDExErrorHandler
    });
}

exports.ndexPost = function (host, route, userName, userPassword, postData, callback, errorHandler) {
    $.ajax({
        type: "POST",
        /*
         password: credentials.password,
         username: credentials.username,
         xhrFields: {
         withCredentials: true
         },
         */
        beforeSend: function(xhr){
            xhr.setRequestHeader("Authorization", "Basic " + btoa(userName + ":" + userPassword));
        },
        url: host + route,
        data: JSON.stringify(postData),
        dataType: "JSON",
        contentType: 'application/json',
        success: callback,
        error: errorHandler || exports.defaultNDExErrorHandler
    });
}


exports.init = function(orient, callback) {
    module.db = orient;   
};

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

exports.classMatch = function(specifiedClass, actualClass){
	if (specifiedClass == actualClass) return true;
	//  workaround to deal with superclasses used in the API
	if (specifiedClass == "xAccount" && (actualClass == "xUser" || actualClass == "xGroup")) return true;
	return false;
}

exports.ridCheck = function (checklist, res, callback){
	if (checklist && checklist.length > 0){
		// query about all ids on checklist. IDs have already been converted to RID format
		var queryIds = [];
		for (k in checklist){
			var spec = checklist[k];
			queryIds.push(spec.rid);
		}
		var cmd = "select @rid as rid, @class as objectClass from [" + queryIds.join(", ") + "];";
		console.log("ridCheck : " + cmd);
		module.db.command(cmd, function(err, results){
			if (err){
				console.log('error verifying ids : ' + err);
				res.send(500, {error : 'error verifying ids : ' + err});
			} else {
		
				var errors = [];
			
				for (i in results){
					var result = results[i];
					for (j in checklist){
						spec = checklist[j];
						if (result.rid == spec.rid){
							// ok, found an object by that RID
							if (exports.classMatch(spec.objectClass,result.objectClass)){
								spec.status = "ok";
							} else {
								spec.status = "for " + result.rid + ", unexpected class " + result.objectClass + " instead of expected class " + spec.objectClass;
							}
						}
					}
				}

				for (j in checklist){
					var spec = checklist[j];
					if (typeof(spec.status) == 'undefined'){
						// not found
						errors.push(spec.rid + " not found");
					} else if (spec.status != "ok"){
						errors.push(spec.status);
					}
				}
			
				if (errors.length > 0){
					console.log("Error(s) in ID verification: "  + errors.join(", "));
					res.send(404, {error : "Error(s) in ID verification: "  + errors.join(", ")});
				} else {
					//console.log("passed ridCheck, going to callback");
					callback();
					return true;
				}
			}
		});
	} else {
				callback();
				return true;
	}
}

exports.checkJID = function(jid){
	if (jid){
		var jidPattern=/^C{1}[0-9]{2}R[0-9]+$/g;
		return jidPattern.test(jid);
	}
	return false;
};

