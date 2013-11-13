//-----------------------------------------------------------
//
//				Load rest.js configuration from ./config/rest_config.json
//
//              if not found, configuration is set to default
//
//-----------------------------------------------------------

var fs = require('fs');
var rest_config = './config/rest_config.json';
var config = {};

fs.exists(rest_config, function (exists) {
    if (exists){
        console.log("Found rest_config.json, will take NDEx REST Configuration from that file.");
        var config_text = fs.readFileSync(rest_config);
        config = JSON.parse(config_text);
    } else {
        console.log("Using Default NDEx REST Configuration.");
        config = {nodetime: 'disabled'}
    }
});

console.log("NDEX REST Configuration: " + JSON.stringify(config));

//-----------------------------------------------------------
//
//				Nodetime
//
//-----------------------------------------------------------

/*
if (config.nodetime == 'enabled'){
    require('nodetime').profile({
        // TODO - make this a config param
        accountKey: '9a4972a10721812f0c8185a8712a117e53af605f',
        appName: 'NDEx REST Server'
    });
    console.log("Nodetime enabled!");
} else {
    console.log("Nodetime NOT enabled");
}
*/

//var flash = require('connect-flash')
var express = require('express')
  , passport = require('passport')
  , BasicStrategy = require('passport-http').BasicStrategy;

//-----------------------------------------------------------
//
//				configure OrientDB
//
//-----------------------------------------------------------

var ndexDatabaseName = process.argv[2] || 'ndex';

/*
var orientdb = require('orientdb');

var dbConfig = {
	user_name: 'admin',
	user_password: 'admin'
};

var serverConfig = {
	host: 'localhost',
	port: 2424
};
*/
var dbHost = "http://localhost:2480/";
var dbUser = "admin";
var dbPassword = "admin";
var dbName = "ndex";

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
            } else findByUsername(username, password, function (err, users) {
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
                   jid: req.user.jid
                   });
    });

app.get('/status', function(req, res){
    res.send(200, null);
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
/*
function convertToRID(JID){
	return JID.replace("C","#").replace("R", ":");
}

function convertFromRID(RID){
	return RID.replace("#","C").replace(":", "R");
}
*/

var routes = require('./routes');

var common = require('./routes/Common.js');

//-----------------------------------------------------------
//
//				The REST API
//
//				Generated REST API functions
//
//-----------------------------------------------------------
var System = require('./routes/System.js');
var User = require('./routes/User.js');
var Agent = require('./routes/Agent.js');
var Group = require('./routes/Group.js');
var Request = require('./routes/Request.js');
var Network = require('./routes/Network.js');
var Task = require('./routes/Task.js');

// Create a User Account
app.post('/users', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var postData = {
      username : req.body['username'],
      password : req.body['password'],
      recoveryEmail : req.body['recoveryEmail'],
    };
    common.ndexPost(dbHost, 'ndexCreateUser/' + dbName, dbUser, dbPassword, postData,
      function (result) { res.send(200, result); },
      function (err) {res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for createUser : ' + e); 
    res.send(500, {error : 'error in handler for createUser : ' + e}); 
  }
});

// Set new profile for user. Requester must be user or have admin permissions.
app.post('/users/:userid/profile', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var postData = {
      userid : req.params['userid'],
      profile : req.body['profile'],
    };
    common.ndexPost(dbHost, 'ndexUpdateUserProfile/' + dbName, dbUser, dbPassword, postData,
      function (result) { res.send(200, result); },
      function (err) {res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for updateUserProfile : ' + e); 
    res.send(500, {error : 'error in handler for updateUserProfile : ' + e}); 
  }
});

// Find users matching search expression
app.get('/users', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    queryArgs[searchExpression] = queryArgs[searchExpression] || '';
    queryArgs[limit] = queryArgs[limit] || 100;
    queryArgs[offset] = queryArgs[offset] || 0;
    var queryArgs = {
      searchExpression : req.query['searchExpression'],
      limit : req.query['limit'],
      offset : req.query['offset'],
    };
    common.ndexGet(dbHost, 'ndexFindUsers/' + dbName, dbUser, dbPassword, queryArgs,
      function (result) { res.send(200, result); },
      function (err) { res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for findUsers : ' + e); 
    res.send(500, {error : 'error in handler for findUsers : ' + e}); 
  }
});

// Get a user by userid. Content returned depends on requester permissions.
app.get('/users/:userid', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var queryArgs = {
      userid : req.params['userid'],
    };
    common.ndexGet(dbHost, 'ndexGetUserById/' + dbName, dbUser, dbPassword, queryArgs,
      function (result) { res.send(200, result); },
      function (err) { res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for getUser : ' + e); 
    res.send(500, {error : 'error in handler for getUser : ' + e}); 
  }
});

// Delete a user by user id. Requester must be user or have admin permissions.
app.delete('/users/:userid', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var postData = {
      userid : req.params['userid'],
    };
    common.ndexPost(dbHost, 'ndexDeleteUser/' + dbName, dbUser, dbPassword, postData,
      function (result) { res.send(200, result); },
      function (err) {res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for deleteUser : ' + e); 
    res.send(500, {error : 'error in handler for deleteUser : ' + e}); 
  }
});

// Get the user's WorkSurface. Requester must be user or have admin permissions.
app.get('/users/:userid/worksurface', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var queryArgs = {
      userid : req.params['userid'],
    };
    common.ndexGet(dbHost, 'ndexGetUserWorksurface/' + dbName, dbUser, dbPassword, queryArgs,
      function (result) { res.send(200, result); },
      function (err) { res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for getUserWorkSurface : ' + e); 
    res.send(500, {error : 'error in handler for getUserWorkSurface : ' + e}); 
  }
});

// Add a network to the user's WorkSurface. Requester must be user or have admin permissions. User must have permission to access network
app.post('/users/:userid/worksurface', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var postData = {
      userid : req.params['userid'],
      networkid : req.body['networkid'],
    };
    common.ndexPost(dbHost, 'ndexAddNetworkToUserWorkSurface/' + dbName, dbUser, dbPassword, postData,
      function (result) { res.send(200, result); },
      function (err) {res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for addNetworkToUserWorkSurface : ' + e); 
    res.send(500, {error : 'error in handler for addNetworkToUserWorkSurface : ' + e}); 
  }
});

// Delete a network from the user's WorkSurface. Requester must be user or have admin permissions
app.delete('/users/:userid/worksurface/:networkid', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var postData = {
      userid : req.params['userid'],
      networkid : req.params['networkid'],
    };
    common.ndexPost(dbHost, 'ndexDeleteNetworkFromUserWorkSurface/' + dbName, dbUser, dbPassword, postData,
      function (result) { res.send(200, result); },
      function (err) {res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for deleteNetworkFromUserWorkSurface : ' + e); 
    res.send(500, {error : 'error in handler for deleteNetworkFromUserWorkSurface : ' + e}); 
  }
});

// Add a group account
app.post('/groups', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var postData = {
      userid : req.body['userid'],
      groupName : req.body['groupName'],
    };
    common.ndexPost(dbHost, 'ndexGroupCreate/' + dbName, dbUser, dbPassword, postData,
      function (result) { res.send(200, result); },
      function (err) {res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for createGroup : ' + e); 
    res.send(500, {error : 'error in handler for createGroup : ' + e}); 
  }
});

// Set new group profile information. Requester must be group owner or have admin permissions.
app.post('/groups/:groupid/profile', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var postData = {
      groupid : req.body['groupid'],
      profile : req.body['profile'],
    };
    common.ndexPost(dbHost, 'ndexGroupUpdateProfile/' + dbName, dbUser, dbPassword, postData,
      function (result) { res.send(200, result); },
      function (err) {res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for updateGroupProfile : ' + e); 
    res.send(500, {error : 'error in handler for updateGroupProfile : ' + e}); 
  }
});

// Find groups by search expression
app.get('/groups', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    queryArgs[searchExpression] = queryArgs[searchExpression] || '';
    queryArgs[limit] = queryArgs[limit] || 100;
    queryArgs[offset] = queryArgs[offset] || 0;
    var queryArgs = {
      searchExpression : req.query['searchExpression'],
      limit : req.query['limit'],
      offset : req.query['offset'],
    };
    common.ndexGet(dbHost, 'ndexFindGroups/' + dbName, dbUser, dbPassword, queryArgs,
      function (result) { res.send(200, result); },
      function (err) { res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for findGroups : ' + e); 
    res.send(500, {error : 'error in handler for findGroups : ' + e}); 
  }
});

// Get a group by group id. Information returned depends on whether requester is group owner.
app.get('/groups/:groupid', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var queryArgs = {
      groupid : req.params['groupid'],
    };
    common.ndexGet(dbHost, 'ndexGetGroup/' + dbName, dbUser, dbPassword, queryArgs,
      function (result) { res.send(200, result); },
      function (err) { res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for getGroup : ' + e); 
    res.send(500, {error : 'error in handler for getGroup : ' + e}); 
  }
});

// Delete a group by group id. Requester must be group owner or have admin permissions.
app.delete('/groups/:groupid', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var postData = {
      groupid : req.params['groupid'],
    };
    common.ndexPost(dbHost, 'ndexGroupDelete/' + dbName, dbUser, dbPassword, postData,
      function (result) { res.send(200, result); },
      function (err) {res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for deleteGroup : ' + e); 
    res.send(500, {error : 'error in handler for deleteGroup : ' + e}); 
  }
});

// toAccount creates a request to fromAccount. Requests mediate communication between accounts.  The current use cases are request/invitation to add a user to a group and request/grant of authorization for access to a network.  Actions happen when the recipient of the request processes the request.
app.post('/requests', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var postData = {
      toid : req.body['toid'],
      fromid : req.body['fromid'],
      requestType : req.body['requestType'],
      message : req.body['message'],
      aboutid : req.body['aboutid'],
    };
    common.ndexPost(dbHost, 'ndexCreateRequest/' + dbName, dbUser, dbPassword, postData,
      function (result) { res.send(200, result); },
      function (err) {res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for createRequest : ' + e); 
    res.send(500, {error : 'error in handler for createRequest : ' + e}); 
  }
});

// Get the parameters of a request
app.get('/requests/:requestid', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var queryArgs = {
      requestid : req.params['requestid'],
    };
    common.ndexGet(dbHost, 'ndexGetRequest/' + dbName, dbUser, dbPassword, queryArgs,
      function (result) { res.send(200, result); },
      function (err) { res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for getRequest : ' + e); 
    res.send(500, {error : 'error in handler for getRequest : ' + e}); 
  }
});

// toAccount approves or disapproves a request. Approval causes requested action. Processing deletes request
app.post('/requests/:requestid', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var postData = {
      requestid : req.params['requestid'],
      approval : req.body['approval'],
    };
    common.ndexPost(dbHost, 'ndexProcessRequest/' + dbName, dbUser, dbPassword, postData,
      function (result) { res.send(200, result); },
      function (err) {res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for processRequest : ' + e); 
    res.send(500, {error : 'error in handler for processRequest : ' + e}); 
  }
});

// Find requests that were made by the user or can be processed by the user
app.get('/users/:userid/requests', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var queryArgs = {
      userid : req.params['userid'],
    };
    common.ndexGet(dbHost, 'ndexFindRequests/' + dbName, dbUser, dbPassword, queryArgs,
      function (result) { res.send(200, result); },
      function (err) { res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for findRequests : ' + e); 
    res.send(500, {error : 'error in handler for findRequests : ' + e}); 
  }
});

// Create a new network in the specified account
app.post('/networks', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var postData = {
      network : req.body['network'],
      accountid : req.body['accountid'],
    };
    common.ndexPost(dbHost, 'ndexNetworkCreate/' + dbName, dbUser, dbPassword, postData,
      function (result) { res.send(200, result); },
      function (err) {res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for createNetwork : ' + e); 
    res.send(500, {error : 'error in handler for createNetwork : ' + e}); 
  }
});

// delete a network
app.delete('/networks/:networkid', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var postData = {
      networkid : req.params['networkid'],
    };
    common.ndexPost(dbHost, 'ndexNetworkDelete/' + dbName, dbUser, dbPassword, postData,
      function (result) { res.send(200, result); },
      function (err) {res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for deleteNetwork : ' + e); 
    res.send(500, {error : 'error in handler for deleteNetwork : ' + e}); 
  }
});

// Returns all or part of a Network based on edge parameters
app.get('/networks/:networkid/edge', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    queryArgs[typeFilter] = queryArgs[typeFilter] || {};
    queryArgs[propertyFilter] = queryArgs[propertyFilter] || {};
    queryArgs[subjectNodeFilter] = queryArgs[subjectNodeFilter] || {};
    queryArgs[objectNodeFilter] = queryArgs[objectNodeFilter] || {};
    queryArgs[limit] = queryArgs[limit] || 100;
    queryArgs[offset] = queryArgs[offset] || 0;
    var queryArgs = {
      networkid : req.params['networkid'],
      typeFilter : req.query['typeFilter'],
      propertyFilter : req.query['propertyFilter'],
      subjectNodeFilter : req.query['subjectNodeFilter'],
      objectNodeFilter : req.query['objectNodeFilter'],
      limit : req.query['limit'],
      offset : req.query['offset'],
    };
    common.ndexGet(dbHost, 'ndexNetworkGetByEdges/' + dbName, dbUser, dbPassword, queryArgs,
      function (result) { res.send(200, result); },
      function (err) { res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for getNetworkByEdges : ' + e); 
    res.send(500, {error : 'error in handler for getNetworkByEdges : ' + e}); 
  }
});

// Returns nodes and meta information of a Network based on node parameters
app.get('/networks/:networkid/node', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    queryArgs[typeFilter] = queryArgs[typeFilter] || {};
    queryArgs[propertyFilter] = queryArgs[propertyFilter] || {};
    queryArgs[limit] = queryArgs[limit] || 100;
    queryArgs[offset] = queryArgs[offset] || 0;
    var queryArgs = {
      networkid : req.params['networkid'],
      typeFilter : req.query['typeFilter'],
      propertyFilter : req.query['propertyFilter'],
      limit : req.query['limit'],
      offset : req.query['offset'],
    };
    common.ndexGet(dbHost, 'ndexNetworkGetByNodes/' + dbName, dbUser, dbPassword, queryArgs,
      function (result) { res.send(200, result); },
      function (err) { res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for getNetworkByNodes : ' + e); 
    res.send(500, {error : 'error in handler for getNetworkByNodes : ' + e}); 
  }
});

// Returns the Network JSON structure with only the meta data  - properties and format
app.get('/networks/:networkid/metadata', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var queryArgs = {
      networkid : req.params['networkid'],
    };
    common.ndexGet(dbHost, 'ndexGetNetworkMetadata/' + dbName, dbUser, dbPassword, queryArgs,
      function (result) { res.send(200, result); },
      function (err) { res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for getNetworkMetadata : ' + e); 
    res.send(500, {error : 'error in handler for getNetworkMetadata : ' + e}); 
  }
});

// Update network properties
app.post('/network/:networkid/metadata', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var postData = {
      networkid : req.params['networkid'],
      network : req.body['network'],
    };
    common.ndexPost(dbHost, 'ndexSetNetworkMetadata/' + dbName, dbUser, dbPassword, postData,
      function (result) { res.send(200, result); },
      function (err) {res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for setNetworkMetadata : ' + e); 
    res.send(500, {error : 'error in handler for setNetworkMetadata : ' + e}); 
  }
});

// Returns the Network JDEx
app.get('/networks/:networkid', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var queryArgs = {
      networkid : req.params['networkid'],
    };
    common.ndexGet(dbHost, 'ndexNetworkGet/' + dbName, dbUser, dbPassword, queryArgs,
      function (result) { res.send(200, result); },
      function (err) { res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for getNetwork : ' + e); 
    res.send(500, {error : 'error in handler for getNetwork : ' + e}); 
  }
});

// Find Networks by search expression
app.get('/networks', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    queryArgs[searchExpression] = queryArgs[searchExpression] || '';
    queryArgs[limit] = queryArgs[limit] || 100;
    queryArgs[offset] = queryArgs[offset] || 0;
    var queryArgs = {
      searchExpression : req.query['searchExpression'],
      limit : req.query['limit'],
      offset : req.query['offset'],
    };
    common.ndexGet(dbHost, 'ndexNetworkFind/' + dbName, dbUser, dbPassword, queryArgs,
      function (result) { res.send(200, result); },
      function (err) { res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for findNetworks : ' + e); 
    res.send(500, {error : 'error in handler for findNetworks : ' + e}); 
  }
});

// User creates a Task
app.post('/tasks', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var postData = {
      task : req.body['task'],
      userid : req.body['userid'],
    };
    common.ndexPost(dbHost, 'ndexTaskCreate/' + dbName, dbUser, dbPassword, postData,
      function (result) { res.send(200, result); },
      function (err) {res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for createTask : ' + e); 
    res.send(500, {error : 'error in handler for createTask : ' + e}); 
  }
});

// Get the parameters and status of a task
app.get('/tasks/:taskid', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var queryArgs = {
      taskid : req.params['taskid'],
    };
    common.ndexGet(dbHost, 'ndexTaskGet/' + dbName, dbUser, dbPassword, queryArgs,
      function (result) { res.send(200, result); },
      function (err) { res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for getTask : ' + e); 
    res.send(500, {error : 'error in handler for getTask : ' + e}); 
  }
});

// Set the parameters (such as status) of a task. Can inactivate an active task or activate an inactive task
app.post('/tasks/:taskid', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var postData = {
      taskid : req.params['taskid'],
      status : req.body['status'],
    };
    common.ndexPost(dbHost, 'ndexTaskUpdate/' + dbName, dbUser, dbPassword, postData,
      function (result) { res.send(200, result); },
      function (err) {res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for updateTask : ' + e); 
    res.send(500, {error : 'error in handler for updateTask : ' + e}); 
  }
});

// Delete an inactive or completed task
app.delete('/tasks/:taskid', passport.authenticate('basic', { session: false }) , function(req, res) {
  try {
    var postData = {
      taskid : req.params['taskid'],
    };
    common.ndexPost(dbHost, 'ndexTaskDelete/' + dbName, dbUser, dbPassword, postData,
      function (result) { res.send(200, result); },
      function (err) {res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}
    );
  }
  catch (e){
    console.log('error in handler for deleteTask : ' + e); 
    res.send(500, {error : 'error in handler for deleteTask : ' + e}); 
  }
});


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