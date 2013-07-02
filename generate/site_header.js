var flash = require('connect-flash')
  , express = require('express')
  , passport = require('passport')
//  , util = require('util')
  , LocalStrategy = require('passport-local').Strategy;
  

var orientdb = require('orientdb');

var dbConfig = {
	user_name: 'admin',
	user_password: 'admin'
};

var serverConfig = {
	host: 'localhost',
	port: 2424
};

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

app.get('/myAccount', ensureAuthenticated, function(req, res) {
  res.render('my_account', {title: "My Account", 
  							user: req.user });
});

app.get('/searchNetworks', function(req, res) {
  res.render('search_networks', {title: "Networks", 
  								 user: req.user });
});

app.get('/searchUsers', function(req, res) {
  res.render('search_users', {title: "Users",
  							  user: req.user });
});

app.get('/searchGroups', function(req, res) {
  res.render('search_groups', {title: "Groups",
  							   user: req.user });
});

app.get('/manageTasks', ensureAuthenticated, function(req, res) {
  res.render('manage_tasks', {title: "Tasks",
  							  user: req.user });
});

app.get('/uploadNetwork', ensureAuthenticated, function(req, res) {
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
  res.render('policies', {title: "Policies",
  							user: req.user });
});

app.get('/contact', function(req, res) {
  res.render('contact', {title: "Contact Information",
  							user: req.user });
});

app.get('/about', function(req, res) {
  res.render('about', {title: "About NDEx",
  						user: req.user });
});


//-----------------------------------------------------------
//
//				View / Edit Resource Pages
//
//-----------------------------------------------------------

app.get('/viewUser/:userId', function(req, res) {
  res.render('search_users', 
  			{	title: "Users", 
  				userId: req.params['userId'],
  				user: req.user 
  			});
});

app.get('/viewNetwork/:networkId', function(req, res) {
  res.render('view_network', 
  			{	title: "Network", 
  				networkId: req.params['networkId'],
  				user: req.user 
  			});
});

app.get('/visualizeNetwork/:networkId', function(req, res) {
  res.render('cyjs_visualize_network', 
  			{	title: "Network", 
  				networkId: req.params['networkId'],
  				user: req.user 
  			});
});


app.get('/visNet/:networkId', function(req, res) {
  res.render('search_networks', {title: "Networks", 
  								 networkId: req.params['networkId'],
  								 user: req.user });
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

var routes = require('./routes');