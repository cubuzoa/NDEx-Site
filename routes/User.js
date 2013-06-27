module.db = null;

exports.init = function(orient, callback) {
    module.db = orient;
};

exports.createUser = function(username, password, callback){
	console.log("calling createUser with arguments: '" + username + "' '" + password + "'");
	var selectUserByUserNameCmd = "select from User where username = '" + username + "'";
	var insertUserCmd = "insert into User (username, password) values('" + username + "', '" + password + "')";
	console.log("first checking that username is not taken");
	module.db.command(selectUserByUserNameCmd, function(err, users) {
		if (err) {
			callback( {error : err, status : 500});
		} else {
			console.log("Existing users: " + JSON.stringify(users));
			if (users && users.length > 0){
				callback({error : "username '" + username + "' is already in use",
							status : 500});
			} else {
				console.log("now inserting the new user");
				console.log(insertUserCmd);
				module.db.command(insertUserCmd, function(err) {
					if (err){
						console.log("insert yields error : " + err);
					} else {
						console.log("no error on insert");
					}
					callback({error : err, username: username});
				});
			}
    	}
    });
};

exports.findUsersByUserName = function (nameExpression, limit, offset, callback){
	console.log("calling findUsersByUserName with arguments: " + nameExpression + " " + limit + " " + offset);
	var cmd = "select from User where username like " + nameExpression + " order by creation_date desc limit " + limit;
	console.log(cmd);
	module.db.command(cmd, function(err, users) {
        callback({users : users, error : err});
    });
};

exports.getUser = function(username, callback){
	console.log("calling getUser with username = '" + username + "'");
	var cmd = "select from User where username = '" + username + "'";
	console.log(cmd);
	module.db.command(cmd, function(err, users) {
		// TODO - case where more than one user returned...
		if (err){
			console.log("caught orient db error " + e);
			callback({user : null, error : err, status : 500});
		} else {
			try {
				if (!users || users.length < 1){
					console.log("found no users by '" + username + "'");
					callback({status : 404});
				} else {
					console.log("found " + users.length + " users, first one is " + users[0].inspect);
					callback({user : users[0]});
				}
			}
			catch (e){
				console.log("caught error " + e);
				callback({user : null, error : e.toString(), status : 500});	
			}
		}
    });
};

exports.deleteUser = function (username, callback){
	console.log("calling delete user with username = '" + username + "'");
	var cmd = "delete from User where username =  '" + username + "'";
	console.log(cmd);
	module.db.command(cmd, function(err) {
        callback({error : err});
    });
};
