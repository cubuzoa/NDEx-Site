

//-----------------------------------------------------------
//
//				Authentication Functions
//
//-----------------------------------------------------------

function findByUsername(username, fn) {
	var cmd = "select from xUser where username = '" + username + "'";
	db.command(cmd, fn);
}

// TODO - check that result is an instance of xUser
function findById(id, fn) {
  var cmd = "select from " + id;
  db.command(cmd, fn);
}

//-----------------------------------------------------------
//
//				Launch the Site
//
//-----------------------------------------------------------

app.listen(port);
console.log('NDEx Site server listening on port ' + port + '...');