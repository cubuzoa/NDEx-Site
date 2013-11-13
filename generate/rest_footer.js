

//-----------------------------------------------------------
//
//				Authentication Functions
//
//-----------------------------------------------------------

function findByUsername(username, callback) {
    db.command("select username, password, @rid as rid from xUser where username = '" + username + "'", callback);
}

function findById(userRID, callback) {
  db.command("select from xUser where @rid = " + userRID + "", callback);
}

//-----------------------------------------------------------
//
//				Launch the Site
//
//-----------------------------------------------------------

app.listen(port);
console.log('NDEx REST server listening on port ' + port + '...');