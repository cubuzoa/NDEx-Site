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

  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  
  app.use(allowCrossDomain);
  
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

app.get('/', function(req, res){
  res.render('home', { user: req.user, title: "Home"});
});

// POST /authenticate
//
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3330/authenticate
//
app.post('/authenticate', 
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
  	// TODO - change to make a simple success response - and pass back token?
    res.redirect('/');
  });
  
  
// Simple route middleware to ensure user is authenticated.

//   Use this route middleware on API resources that need to be protected.  
//
//   If the request is authenticated (typically via a persistent login session),
//   the request will proceed.
//
//   Otherwise, respond with a 401 indicating that authentication is required
//
function apiEnsureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.send(401, {error: "authentication required"});
}

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
var System = require('./routes/System.js');
var User = require('./routes/User.js');
var Agent = require('./routes/Agent.js');
var Group = require('./routes/Group.js');
var Request = require('./routes/Request.js');
var Network = require('./routes/Network.js');
var Task = require('./routes/Task.js');

// GET server description
app.get('/', function(req, res) {
  try {
    common.ridCheck(
      [
      ], 
      function(){
        System.index(function(data){
            var status = data.status || 200;
          if(status && status == 200){
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for index : ' + e}); 
  }
}); // close handler

// GET status
app.get('/status', function(req, res) {
  try {
    common.ridCheck(
      [
      ], 
      function(){
        System.status(function(data){
            var status = data.status || 200;
          if(status && status == 200){
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for status : ' + e}); 
  }
}); // close handler

// Create a User Account
app.post('/users', function(req, res) {
  try {
    var username = req.body['username'];
    var password = req.body['password'];
    var recoveryEmail = req.body['recoveryEmail'];
    common.ridCheck(
      [
      ], 
      function(){
        User.createUser(username, password, recoveryEmail, function(data){
            var status = data.status || 200;
          if(status && status == 200){
            data.jid = convertFromRID(data.jid);
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for createUser : ' + e}); 
  }
}); // close handler

// Set new profile for user. Requester must be user or have admin permissions.
app.post('/users/:userid/profile', function(req, res) {
  try {
    var userid = req.body['userid'];
    if(!common.checkJID(userid)) res.send(400, { error: 'bad JID : ' + userid});
    userid = convertToRID(userid);
    var profile = req.body['profile'];
    common.ridCheck(
      [
            { rid: userid, class: 'xUser'},
      ], 
      function(){
        User.updateUserProfile(userid, profile, function(data){
            var status = data.status || 200;
          if(status && status == 200){
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for updateUserProfile : ' + e}); 
  }
}); // close handler

// Find users matching search expression
app.get('/users', function(req, res) {
  try {
    var searchExpression = req.query['searchExpression'];
    searchExpression = searchExpression || '*';
    var limit = req.query['limit'];
    limit = limit || 100;
    var offset = req.query['offset'];
    offset = offset || 0;
    common.ridCheck(
      [
      ], 
      function(){
        User.findUsers(searchExpression, limit, offset, function(data){
            var status = data.status || 200;
          if(status && status == 200){
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for findUsers : ' + e}); 
  }
}); // close handler

// Get a user by userid. Content returned depends on requester permissions.
app.get('/users/:userid', function(req, res) {
  try {
    var userid = req.params['userid'];
    if(!common.checkJID(userid)) res.send(400, { error: 'bad JID : ' + userid});
    userid = convertToRID(userid);
    common.ridCheck(
      [
            { rid: userid, class: 'xUser'},
      ], 
      function(){
        User.getUser(userid, function(data){
            var status = data.status || 200;
          if(status && status == 200){
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for getUser : ' + e}); 
  }
}); // close handler

// Delete a user by user id. Requester must be user or have admin permissions.
app.delete('/users/:userid', function(req, res) {
  try {
    var userid = req.params['userid'];
    if(!common.checkJID(userid)) res.send(400, { error: 'bad JID : ' + userid});
    userid = convertToRID(userid);
    common.ridCheck(
      [
            { rid: userid, class: 'xUser'},
      ], 
      function(){
        User.deleteUser(userid, function(data){
            var status = data.status || 200;
          if(status && status == 200){
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for deleteUser : ' + e}); 
  }
}); // close handler

// Get the user's workspace. Requester must be user or have admin permissions.
app.get('/users/:userid/workspace', function(req, res) {
  try {
    var userid = req.params['userid'];
    if(!common.checkJID(userid)) res.send(400, { error: 'bad JID : ' + userid});
    userid = convertToRID(userid);
    common.ridCheck(
      [
            { rid: userid, class: 'xUser'},
      ], 
      function(){
        User.getUserWorkspace(userid, function(data){
            var status = data.status || 200;
          if(status && status == 200){
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for getUserWorkspace : ' + e}); 
  }
}); // close handler

// Add a network to the user's workspace. Requester must be user or have admin permissions. User must have permission to access network
app.post('/users/:userid/workspace', function(req, res) {
  try {
    var userid = req.params['userid'];
    if(!common.checkJID(userid)) res.send(400, { error: 'bad JID : ' + userid});
    userid = convertToRID(userid);
    var networkid = req.body['networkid'];
    if(!common.checkJID(networkid)) res.send(400, { error: 'bad JID : ' + networkid});
    networkid = convertToRID(networkid);
    common.ridCheck(
      [
            { rid: userid, class: 'xUser'},
            { rid: networkid, class: 'xNetwork'},
      ], 
      function(){
        User.addNetworkToUserWorkspace(userid, networkid, function(data){
            var status = data.status || 200;
          if(status && status == 200){
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for addNetworkToUserWorkspace : ' + e}); 
  }
}); // close handler

// Delete a network from the user's workspace. Requester must be user or have admin permissions
app.delete('/users/:userid/workspace/:networkid', function(req, res) {
  try {
    var userid = req.params['userid'];
    if(!common.checkJID(userid)) res.send(400, { error: 'bad JID : ' + userid});
    userid = convertToRID(userid);
    var networkid = req.params['networkid'];
    if(!common.checkJID(networkid)) res.send(400, { error: 'bad JID : ' + networkid});
    networkid = convertToRID(networkid);
    common.ridCheck(
      [
            { rid: userid, class: 'xUser'},
            { rid: networkid, class: 'xNetwork'},
      ], 
      function(){
        User.deleteNetworkFromUserWorkspace(userid, networkid, function(data){
            var status = data.status || 200;
          if(status && status == 200){
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for deleteNetworkFromUserWorkspace : ' + e}); 
  }
}); // close handler

// Add a programmatic access account, generate credentials
app.post('/agents', function(req, res) {
  try {
    var name = req.body['name'];
    var owner = req.body['owner'];
    if(!common.checkJID(owner)) res.send(400, { error: 'bad JID : ' + owner});
    owner = convertToRID(owner);
    common.ridCheck(
      [
            { rid: owner, class: 'xAccount'},
      ], 
      function(){
        Agent.createAgent(name, owner, function(data){
            var status = data.status || 200;
          if(status && status == 200){
            data.id = convertFromRID(data.id);
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for createAgent : ' + e}); 
  }
}); // close handler

// Get information about an Agent
app.get('/agents/:agentid', function(req, res) {
  try {
    var agentid = req.params['agentid'];
    if(!common.checkJID(agentid)) res.send(400, { error: 'bad JID : ' + agentid});
    agentid = convertToRID(agentid);
    common.ridCheck(
      [
            { rid: agentid, class: 'xAgent'},
      ], 
      function(){
        Agent.getAgent(agentid, function(data){
            var status = data.status || 200;
          if(status && status == 200){
            data.id = convertFromRID(data.id);
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for getAgent : ' + e}); 
  }
}); // close handler

// Update the credentials and/or status for an Agent
app.post('/agents/:agentid', function(req, res) {
  try {
    var agentId = req.params['agentId'];
    if(!common.checkJID(agentId)) res.send(400, { error: 'bad JID : ' + agentId});
    agentId = convertToRID(agentId);
    var credentials = req.body['credentials'];
    var status = req.body['status'];
    var name = req.body['name'];
    common.ridCheck(
      [
            { rid: agentId, class: 'xAgent'},
      ], 
      function(){
        Agent.updateAgent(agentId, credentials, status, name, function(data){
            var status = data.status || 200;
          if(status && status == 200){
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for updateAgent : ' + e}); 
  }
}); // close handler

// Add a group account
app.post('/groups', function(req, res) {
  try {
    var userid = req.body['userid'];
    if(!common.checkJID(userid)) res.send(400, { error: 'bad JID : ' + userid});
    userid = convertToRID(userid);
    var groupName = req.body['groupName'];
    common.ridCheck(
      [
            { rid: userid, class: 'xUser'},
      ], 
      function(){
        Group.createGroup(userid, groupName, function(data){
            var status = data.status || 200;
          if(status && status == 200){
            data.jid = convertFromRID(data.jid);
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for createGroup : ' + e}); 
  }
}); // close handler

// Set new group profile information. Requester must be group owner or have admin permissions.
app.post('/groups/:groupid/profile', function(req, res) {
  try {
    var groupid = req.body['groupid'];
    if(!common.checkJID(groupid)) res.send(400, { error: 'bad JID : ' + groupid});
    groupid = convertToRID(groupid);
    var profile = req.body['profile'];
    common.ridCheck(
      [
            { rid: groupid, class: 'xGroup'},
      ], 
      function(){
        Group.updateGroupProfile(groupid, profile, function(data){
            var status = data.status || 200;
          if(status && status == 200){
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for updateGroupProfile : ' + e}); 
  }
}); // close handler

// Find groups by search expression
app.get('/groups', function(req, res) {
  try {
    var searchExpression = req.query['searchExpression'];
    searchExpression = searchExpression || '*';
    var limit = req.query['limit'];
    limit = limit || 100;
    var offset = req.query['offset'];
    offset = offset || 0;
    common.ridCheck(
      [
      ], 
      function(){
        Group.findGroups(searchExpression, limit, offset, function(data){
            var status = data.status || 200;
          if(status && status == 200){
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for findGroups : ' + e}); 
  }
}); // close handler

// Get a group by group id. Information returned depends on whether requester is group owner.
app.get('/groups/:groupid', function(req, res) {
  try {
    var groupid = req.params['groupid'];
    if(!common.checkJID(groupid)) res.send(400, { error: 'bad JID : ' + groupid});
    groupid = convertToRID(groupid);
    common.ridCheck(
      [
            { rid: groupid, class: 'xGroup'},
      ], 
      function(){
        Group.getGroup(groupid, function(data){
            var status = data.status || 200;
          if(status && status == 200){
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for getGroup : ' + e}); 
  }
}); // close handler

// Delete a group by group id. Requester must be group owner or have admin permissions.
app.delete('/groups/:groupid', function(req, res) {
  try {
    var groupid = req.params['groupid'];
    if(!common.checkJID(groupid)) res.send(400, { error: 'bad JID : ' + groupid});
    groupid = convertToRID(groupid);
    common.ridCheck(
      [
            { rid: groupid, class: 'xGroup'},
      ], 
      function(){
        Group.deleteGroup(groupid, function(data){
            var status = data.status || 200;
          if(status && status == 200){
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for deleteGroup : ' + e}); 
  }
}); // close handler

// Find Users who are members of a group, optionally filter by search expression. Group owners see all members, non-owners see only members who allow themselves to be visible.
app.get('/groups/:groupid/members', function(req, res) {
  try {
    var groupid = req.params['groupid'];
    if(!common.checkJID(groupid)) res.send(400, { error: 'bad JID : ' + groupid});
    groupid = convertToRID(groupid);
    var searchExpression = req.query['searchExpression'];
    searchExpression = searchExpression || '*';
    var limit = req.query['limit'];
    limit = limit || 100;
    var offset = req.query['offset'];
    offset = offset || 0;
    common.ridCheck(
      [
            { rid: groupid, class: 'xGroup'},
      ], 
      function(){
        Group.getGroupMembers(groupid, searchExpression, limit, offset, function(data){
            var status = data.status || 200;
          if(status && status == 200){
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for getGroupMembers : ' + e}); 
  }
}); // close handler

// toAccount creates a request to fromAccount.
app.post('/requests', function(req, res) {
  try {
    var toid = req.body['toid'];
    if(!common.checkJID(toid)) res.send(400, { error: 'bad JID : ' + toid});
    toid = convertToRID(toid);
    var fromid = req.body['fromid'];
    if(!common.checkJID(fromid)) res.send(400, { error: 'bad JID : ' + fromid});
    fromid = convertToRID(fromid);
    common.ridCheck(
      [
            { rid: toid, class: 'xAccount'},
            { rid: fromid, class: 'xAccount'},
      ], 
      function(){
        Request.createRequest(toid, fromid, function(data){
            var status = data.status || 200;
          if(status && status == 200){
            data.jid = convertFromRID(data.jid);
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for createRequest : ' + e}); 
  }
}); // close handler

// Get the parameters of a request
app.get('/requests/:requestid', function(req, res) {
  try {
    var requestid = req.params['requestid'];
    if(!common.checkJID(requestid)) res.send(400, { error: 'bad JID : ' + requestid});
    requestid = convertToRID(requestid);
    common.ridCheck(
      [
            { rid: requestid, class: 'xRequest'},
      ], 
      function(){
        Request.getRequest(requestid, function(data){
            var status = data.status || 200;
          if(status && status == 200){
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for getRequest : ' + e}); 
  }
}); // close handler

// toAccount approves or disapproves a request. Approval causes requested action. Processing deletes request
app.post('/requests/:requestid', function(req, res) {
  try {
    var requestid = req.params['requestid'];
    if(!common.checkJID(requestid)) res.send(400, { error: 'bad JID : ' + requestid});
    requestid = convertToRID(requestid);
    var approval = req.body['approval'];
    common.ridCheck(
      [
            { rid: requestid, class: 'xRequest'},
      ], 
      function(){
        Request.processRequest(requestid, approval, function(data){
            var status = data.status || 200;
          if(status && status == 200){
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for processRequest : ' + e}); 
  }
}); // close handler

// find requests that were made by the user or can be processed by the user
app.get('/users/:userid/requests', function(req, res) {
  try {
    var userid = req.params['userid'];
    if(!common.checkJID(userid)) res.send(400, { error: 'bad JID : ' + userid});
    userid = convertToRID(userid);
    common.ridCheck(
      [
            { rid: userid, class: 'xUser'},
      ], 
      function(){
        Request.findRequests(userid, function(data){
            var status = data.status || 200;
          if(status && status == 200){
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for findRequests : ' + e}); 
  }
}); // close handler

// Create a new network in the specified account
app.post('/networks', function(req, res) {
  try {
    var network = req.body['network'];
    var accountid = req.body['accountid'];
    if(!common.checkJID(accountid)) res.send(400, { error: 'bad JID : ' + accountid});
    accountid = convertToRID(accountid);
    common.ridCheck(
      [
            { rid: accountid, class: 'undefined'},
      ], 
      function(){
        Network.createNetwork(network, accountid, function(data){
            var status = data.status || 200;
          if(status && status == 200){
            data.jid = convertFromRID(data.jid);
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for createNetwork : ' + e}); 
  }
}); // close handler

// delete a network
app.delete('/networks/:networkid', function(req, res) {
  try {
    var networkid = req.params['networkid'];
    if(!common.checkJID(networkid)) res.send(400, { error: 'bad JID : ' + networkid});
    networkid = convertToRID(networkid);
    common.ridCheck(
      [
            { rid: networkid, class: 'xNetwork'},
      ], 
      function(){
        Network.deleteNetwork(networkid, function(data){
            var status = data.status || 200;
          if(status && status == 200){
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for deleteNetwork : ' + e}); 
  }
}); // close handler

// Returns the Network JDEx
app.get('/networks/:networkid', function(req, res) {
  try {
    var networkid = req.params['networkid'];
    if(!common.checkJID(networkid)) res.send(400, { error: 'bad JID : ' + networkid});
    networkid = convertToRID(networkid);
    common.ridCheck(
      [
            { rid: networkid, class: 'xNetwork'},
      ], 
      function(){
        Network.getNetwork(networkid, function(data){
            var status = data.status || 200;
          if(status && status == 200){
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for getNetwork : ' + e}); 
  }
}); // close handler

// Find Networks by search expression
app.get('/networks', function(req, res) {
  try {
    var searchExpression = req.query['searchExpression'];
    searchExpression = searchExpression || '';
    var limit = req.query['limit'];
    limit = limit || 100;
    var offset = req.query['offset'];
    offset = offset || 0;
    common.ridCheck(
      [
      ], 
      function(){
        Network.findNetworks(searchExpression, limit, offset, function(data){
            var status = data.status || 200;
          if(status && status == 200){
          }
            res.send(status, data);

        }) // close the route function

      } // close the ridCheck callback

    ); // close the ridCheck

  // now catch random errors
  }
  catch (e){
          res.send(500, {error : 'error in handler for findNetworks : ' + e}); 
  }
}); // close handler


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
	Agent.init(db, function(err) {if (err) {throw err;}});
	Group.init(db, function(err) {if (err) {throw err;}});
	Request.init(db, function(err) {if (err) {throw err;}});
	Network.init(db, function(err) {if (err) {throw err;}});
	Task.init(db, function(err) {if (err) {throw err;}});
});


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