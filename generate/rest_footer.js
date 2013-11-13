

//-----------------------------------------------------------
//
//				Authentication Functions
//
//-----------------------------------------------------------

function findByUsername(username, password, callback) {
    //db.command("select username, password, @rid as rid from xUser where username = '" + username + "'", callback);
    var users = [];
    /*
    try {
        var queryArgs = {
            username : username
        };
        common.ndexGet(dbHost, 'ndexGetUsersByUsername/' + dbName, dbUser, dbPassword, queryArgs,
            function (users) {
                callback(users);
            },
            function (err) {
                console.log("Error checking username : " + JSON.stringify(err));
            }
        );
    }
    catch (e){
        return users;
    }
   */
    // fake a user for authentication purposes until we add function to ndex-java
    callback(null, [{username: username, jid: 'guestjid', password : password}]);
    //return users;
}

/*
function findById(userRID, callback) {
  db.command("select from xUser where @rid = " + userRID + "", callback);
}
*/

//-----------------------------------------------------------
//
//				Launch the Site
//
//-----------------------------------------------------------

app.listen(port);
console.log('NDEx REST server listening on port ' + port + '...');