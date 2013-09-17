var flash = require('connect-flash')
  , express = require('express')
  , passport = require('passport')
  , BasicStrategy = require('passport-http').BasicStrategy;

//-----------------------------------------------------------
//
//				configure OrientDB
//
//-----------------------------------------------------------

var ndexDatabaseName = process.argv[2] || 'ndex';

var orientdb = require('orientdb');

var dbConfig = {
	user_name: 'admin',
	user_password: 'admin'
};

var serverConfig = {
	host: 'localhost',
	port: 2424
};

//-----------------------------------------------------------
//
//				create the App
//              Specify the REST API port
//
//-----------------------------------------------------------

var app = express();
var port = 3333;

//-----------------------------------------------------------
//
//				configure Express
//
//-----------------------------------------------------------

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

app.configure(function(){

  app.use(express.static(__dirname + '/public'));
});
 
app.configure(function() {
  
  app.use(allowCrossDomain);
  
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  // Initialize Passport!
  // REST API not using sessions
  // No need to use session middleware when each
  // request carries authentication credentials, as is the case with HTTP Basic.
    app.use(passport.initialize());

    //
    // app.use(express.session({ secret: 'keyboard cat' }));
    // Not using flash messaging
    // app.use(flash());

    // Not using passport.session() middleware
    // app.use(passport.session());

  
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

// Use the BasicStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.
passport.use(new BasicStrategy({
    },
    function(username, password, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            // Find the user by username.  If there is no user with the given
            // username, or the password is not correct, set the user to `false` to
            // indicate failure.  Otherwise, return the authenticated `user`.
            console.log("About to authenticate " + username + ":" + password);
            if(username == "guest" && password == "guestpassword"){
                console.log("authenticating guest user");
                return done(null, {username: "guest", jid: 'guestjid'});
            } else findByUsername(username, function (err, users) {
                console.log("found users " + JSON.stringify(users));
                if (err) {
                    return done(err);
                }
                if (!users || users.length == 0) {
                    return done(null, false);
                }
                var user = users[0];
                if (user.password != password) {
                    return done(null, false);
                }
                return done(null, user);
            })
        });
    }
));


/*
// Passport session setup.
//
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  
//
//   Typically, this will be as simple as storing the user ID when serializing, 
//   and finding the user by ID when deserializing.
//
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

//   Use the LocalStrategy within Passport.
//
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.
//
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

*/

app.get('/', function(req, res){
  res.redirect('/authenticate');
});

// curl -v -I http://127.0.0.1:3000/
// curl -v -I --user public:public_password http://127.0.0.1:3000/
app.get('/authenticate',
    // Authenticate using HTTP Basic credentials, with session support disabled.
    passport.authenticate('basic', { session: false }),
    function(req, res){
        res.json({ username: req.user.username,
                    password: req.user.password,
                   jid: convertFromRID(req.user.rid)
                   });
    });

/*
// Simple route middleware checks passport flags to ensure user is authenticated.
//
//   (works with passport session)
//
//   Use this route middleware on API resources that need to be protected.
//
//   If the request is authenticated the request will proceed.
//
//   Otherwise, respond with a 401 indicating that authentication is required
//
function apiEnsureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.send(401, {error: "authentication required"});
}
*/

/*
// POST /authenticate  example used with sessions and LocalStrategy
//
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3330/authenticate
//
app.post('/authenticate', 
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  });
*/
  


//-----------------------------------------------------------
//
//				Utilities
//
//-----------------------------------------------------------

function convertToRID(JID){
	return JID.replace("C","#").replace("R", ":");
}

function convertFromRID(RID){
	return RID.replace("#","C").replace(":", "R");
}

var routes = require('./routes');

var common = require('./routes/Common.js');

//-----------------------------------------------------------
//
//				The REST API
//
//				Generated REST API functions
//
//-----------------------------------------------------------