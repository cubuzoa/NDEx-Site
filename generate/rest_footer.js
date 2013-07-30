

//-----------------------------------------------------------
//
//				Authentication Functions
//
//-----------------------------------------------------------

function findByUsername(username, fn) {
	var cmd = "select from xUser where username = '" + username + "'";
	db.command(cmd, fn);
}

function findById(id, fn) {
  var cmd = "select from " + id + " where @class = xUser";
  db.command(cmd, fn);
}

//-----------------------------------------------------------
//
//				Launch the Site
//
//-----------------------------------------------------------

app.listen(port);
console.log('NDEx REST server listening on port ' + port + '...');