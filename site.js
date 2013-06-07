
var flash = require('connect-flash')
  , express = require('express')
  , passport = require('passport')
//  , util = require('util')
  , LocalStrategy = require('passport-local').Strategy;
  
//-----------------------------------------------------------
// Temporary hack user database
//-----------------------------------------------------------
/*
var users = [
    { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' }
  , { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com' }
];

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}


function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}
*/



//	console.log("calling getUser with username = '" + username + "'");
//	console.log(cmd);

//-----------------------------------------------------------

var app = express();
var port = 9999;

//-----------------------------------------------------------
//
//				configure Express
//
//-----------------------------------------------------------

app.configure(function(){

  app.use(express.static(__dirname + '/public'));
});


// 
app.configure(function() {

  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  
  
  //app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  
  // Initialize Passport!  
  // Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  //
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  
  // Setup static directories
  //
  app.use('/css', express.static(__dirname + '/css'));
  app.use('/img', express.static(__dirname + '/img'));
  app.use('/js', express.static(__dirname + '/js'));
  app.use(express.static(__dirname + '/public'));
});



//-----------------------------------------------------------
//
//				Passport Authentication
//
//-----------------------------------------------------------

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, users) {
  	if (err) {
  		console.log("error while querying for user" + err);
  		done(err, null);
  	} else {
		if (!users || users.length < 1){
			console.log("no user found for id = " + id);
			done("no user found for id = " + id);
		} else {
			var user = users[0],
			u = {id: user['@rid'], username: user.username, password: user.password};
			console.log("found user : " + JSON.stringify(user));
			console.log("deserializing as: " + JSON.stringify(u));
			done(err, u);
		}
	}
  });
});


// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, users) {
      	console.log("authenticating " + username + " found " + users.length + " users");
        if (err) { return done(err); }
        if (!users || users.length < 1) { return done(null, false, { message: 'Sorry, unknown user ' + username }); }
        if (users.length > 1){
        	return done(null, 
        				false,
        				{ message: "Unexpected Error: " + users.length + " users with username = " + username });
        }
        var u = users[0],
        	user =  { id: u["@rid"], username: u.username, password: u.password };
        if (user.password != password) { return done(null, false, { message: 'Sorry, invalid password' }); }
        return done(null, user);
      })
    });
  }
));

app.get('/', function(req, res){
  res.render('home', { user: req.user, 
  						title: "Home"});
});

// example page to use for testing login
app.get('/test_login', ensureAuthenticated, function(req, res){
  res.render('test_login', { user: req.user,
  							 title: "Authentication Test Page" });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user, message: req.flash('error'), title: "Login" });
});

// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3330/login
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  });
  
// POST /login
//   This is an alternative implementation that uses a custom callback to
//   acheive the same functionality.
/*
app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/login')
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/users/' + user.username);
    });
  })(req, res, next);
});
*/


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


app.get('/join', function(req, res){
  res.render('join', { title: "Join", user: req.user, message: req.flash('error')});
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

//-----------------------------------------------------------
//
//				Main Navigation Destinations
//
//-----------------------------------------------------------

app.get('/my_account', ensureAuthenticated, function(req, res) {
  res.render('my_account', {title: "My Account", 
  							user: req.user });
});

app.get('/networks', function(req, res) {
  res.render('search_networks', {title: "Networks", 
  								 user: req.user });
});

app.get('/users', function(req, res) {
  res.render('search_users', {title: "Users",
  							  user: req.user });
});

app.get('/groups', function(req, res) {
  res.render('search_groups', {title: "Groups",
  							   user: req.user });
});

app.get('/tasks', ensureAuthenticated, function(req, res) {
  res.render('manage_tasks', {title: "Tasks",
  							  user: req.user });
});

app.get('/upload', ensureAuthenticated, function(req, res) {
  res.render('upload_network', {title: "Upload Network",
  								user: req.user });
});

//-----------------------------------------------------------
//
//				Utility Navigation Destinations
//
//-----------------------------------------------------------

// Utility navigation also links to login page, see authentication section above

// These destinations do not require an authenticated user

app.get('/policies', function(req, res) {
  res.render('policies', {title: "Login"});
});

app.get('/contact', function(req, res) {
  res.render('contact', {title: "Contact Information"});
});

app.get('/about', function(req, res) {
  res.render('about', {title: "About NDEx"});
});


//-----------------------------------------------------------
//
//				View / Edit Resource Pages
//
//-----------------------------------------------------------

app.get('/view_user/:userId', function(req, res) {
  res.render('search_users', 
  			{	title: "Users", 
  				userId: req.params['userId']
  			});
});


//-----------------------------------------------------------
//
//				The REST API
//
//				Generated REST API functions
//				Would be better to serve separately, 
//				but don't know how authentication would work
//
//-----------------------------------------------------------


var orientdb = require('orientdb');

var dbConfig = {
	user_name: 'admin',
	user_password: 'admin'
};

var serverConfig = {
	host: 'localhost',
	port: 2424
};

var routes = require('./rest/routes');

var System = require('./rest/routes/System.js');
var User = require('./rest/routes/User.js');
var NPA = require('./rest/routes/NPA.js');
var Group = require('./rest/routes/Group.js');
var MemberRequest = require('./rest/routes/MemberRequest.js');
var MemberInvitation = require('./rest/routes/MemberInvitation.js');
var Network = require('./rest/routes/Network.js');
var Task = require('./rest/routes/Task.js');

// GET server description
app.get('/', function(req, res) {
	try {
		System.index(function(result){
			var status = result.status || 200;
			res.send(status, result);
		});
	}
	catch (e){
		res.send(500, {error : e}); 
	}
});

// GET status
app.get('/status', function(req, res) {
	try {
		System.status(function(result){
			var status = result.status || 200;
			res.send(status, result);
		});
	}
	catch (e){
		res.send(500, {error : e}); 
	}
});

// Create a User Account
app.post('/users', function(req, res) {
    var username = req.body['username'];
    var password = req.body['password'];
	try {
		User.createUser(username, password, function(result){
			var status = result.status || 200;
			console.log("status = " + status + " result = " + JSON.stringify(result));
			res.send(status, result);
		});
	}
	catch (e){
		res.send(500, {error : e}); 
	}
});

// Find users matching search expression
app.get('/users', function(req, res) {
    var searchExpression = req.query['searchExpression'];
    searchExpression = searchExpression || '*';
    var limit = req.query['limit'];
    limit = limit || 100;
    var offset = req.query['offset'];
    offset = offset || 0;
	try {
		User.findUsers(searchExpression, limit, offset, function(result){
			var status = result.status || 200;
			res.send(status, result);
		});
	}
	catch (e){
		res.send(500, {error : e}); 
	}
});

// Get a user by username
app.get('/users/:username', function(req, res) {
    var username = req.params['username'];
	try {
		User.getUser(username, function(result){
			var status = result.status || 200;
			res.send(status, result);
		});
	}
	catch (e){
		res.send(500, {error : e}); 
	}
});

// Delete a user by username
app.delete('/users/:username', function(req, res) {
    var username = req.params['username'];
	try {
		User.deleteUser(username, function(result){
			var status = result.status || 200;
			res.send(status, result);
		});
	}
	catch (e){
		res.send(500, {error : e}); 
	}
});

// Add a group account
app.post('/groups', function(req, res) {
    var username = req.body['username'];
	try {
		Group.createGroup(username, function(result){
			var status = result.status || 200;
			res.send(status, result);
		});
	}
	catch (e){
		res.send(500, {error : e}); 
	}
});

// Find groups by search expression
app.get('/groups', function(req, res) {
    var searchExpression = req.query['searchExpression'];
    searchExpression = searchExpression || '*';
    var limit = req.query['limit'];
    limit = limit || 100;
    var offset = req.query['offset'];
    offset = offset || 0;
	try {
		Group.findGroups(searchExpression, limit, offset, function(result){
			var status = result.status || 200;
			res.send(status, result);
		});
	}
	catch (e){
		res.send(500, {error : e}); 
	}
});

// Get a group by groupname
app.get('/groups/:groupname', function(req, res) {
    var username = req.params['username'];
	try {
		Group.getGroupInfo(username, function(result){
			var status = result.status || 200;
			res.send(status, result);
		});
	}
	catch (e){
		res.send(500, {error : e}); 
	}
});

// Delete a group by groupname
app.delete('/groups/:groupname', function(req, res) {
    var groupname = req.params['groupname'];
	try {
		Group.deleteGroup(groupname, function(result){
			var status = result.status || 200;
			res.send(status, result);
		});
	}
	catch (e){
		res.send(500, {error : e}); 
	}
});

// Find Users who are members of a group, optionally filter by search expression
app.get('/groups/:groupname/members', function(req, res) {
    var groupname = req.params['groupname'];
    var searchExpression = req.query['searchExpression'];
    searchExpression = searchExpression || '*';
    var limit = req.query['limit'];
    limit = limit || 100;
    var offset = req.query['offset'];
    offset = offset || 0;
	try {
		Group.getGroupMembers(groupname, searchExpression, limit, offset, function(result){
			var status = result.status || 200;
			res.send(status, result);
		});
	}
	catch (e){
		res.send(500, {error : e}); 
	}
});


var server = new orientdb.Server(serverConfig);
var db = new orientdb.GraphDb('ndex', server, dbConfig);

db.open(function(err) {
    if (err) {
        throw err;
    }
	console.log('Successfully connected to OrientDB');
	routes.init(db, function(err) {if (err) {throw err;}});
	System.init(db, function(err) {if (err) {throw err;}});
	User.init(db, function(err) {if (err) {throw err;}});
	NPA.init(db, function(err) {if (err) {throw err;}});
	Group.init(db, function(err) {if (err) {throw err;}});
	MemberRequest.init(db, function(err) {if (err) {throw err;}});
	MemberInvitation.init(db, function(err) {if (err) {throw err;}});
	Network.init(db, function(err) {if (err) {throw err;}});
	Task.init(db, function(err) {if (err) {throw err;}});
});

function findByUsername(username, fn) {
	var cmd = "select from NDExUser where username = '" + username + "'";
	db.command(cmd, fn);
}

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