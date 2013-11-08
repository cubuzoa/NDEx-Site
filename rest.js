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

if (fs.existsSync(rest_config)) {
    console.log("Found rest_config.json, will take NDEx REST Configuration from that file.");
    var config_text = fs.readFileSync(rest_config);
    config = JSON.parse(config_text);
} else {
    console.log("Using Default NDEx REST Configuration.");
    config = {nodetime: 'disabled'}
}


console.log("NDEX REST Configuration: " + JSON.stringify(config));

//-----------------------------------------------------------
//
//				Nodetime
//
//-----------------------------------------------------------

if (config.nodetime == 'enabled') {
    require('nodetime').profile({
        accountKey: '9a4972a10721812f0c8185a8712a117e53af605f',
        appName: 'NDEx REST Server'
    });
    console.log("Nodetime enabled!");
} else {
    console.log("Nodetime NOT enabled");
}

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

var allowCrossDomain = function (req, res, next) {
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

app.configure(function () {

    app.use(express.static(__dirname + '/public'));
});

app.configure(function () {

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
    function (username, password, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            // Find the user by username.  If there is no user with the given
            // username, or the password is not correct, set the user to `false` to
            // indicate failure.  Otherwise, return the authenticated `user`.
            console.log("About to authenticate " + username + ":" + password);
            if (username == "guest" && password == "guestpassword") {
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

app.get('/', function (req, res) {
    res.redirect('/authenticate');
});

// curl -v -I http://127.0.0.1:3000/
// curl -v -I --user public:public_password http://127.0.0.1:3000/
app.get('/authenticate',
    // Authenticate using HTTP Basic credentials, with session support disabled.
    passport.authenticate('basic', { session: false }),
    function (req, res) {
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

function convertToRID(JID) {
    return JID.replace("C", "#").replace("R", ":");
}

function convertFromRID(RID) {
    return RID.replace("#", "C").replace(":", "R");
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
app.get('/', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        common.ridCheck(
            [
            ],
            res,
            function () {
                System.index(function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for index : ' + e);
        res.send(500, {error: 'error in handler for index : ' + e});
    }
}); // close handler

// GET status
app.get('/status', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        common.ridCheck(
            [
            ],
            res,
            function () {
                System.status(function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for status : ' + e);
        res.send(500, {error: 'error in handler for status : ' + e});
    }
}); // close handler

// Create a User Account
app.post('/users', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var username = req.body['username'];
        var password = req.body['password'];
        var recoveryEmail = req.body['recoveryEmail'];
        common.ridCheck(
            [
            ],
            res,
            function () {
                User.createUser(username, password, recoveryEmail, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                        data.jid = convertFromRID(data.jid);
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for createUser : ' + e);
        res.send(500, {error: 'error in handler for createUser : ' + e});
    }
}); // close handler

// Set new profile for user. Requester must be user or have admin permissions.
app.post('/users/:userid/profile', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var userid = req.params['userid'];
        if (!common.checkJID(userid)) res.send(400, { error: 'bad JID : ' + userid});
        userid = convertToRID(userid);
        var profile = req.body['profile'];
        common.ridCheck(
            [
                { rid: userid, objectClass: 'xUser'},
            ],
            res,
            function () {
                User.updateUserProfile(userid, profile, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for updateUserProfile : ' + e);
        res.send(500, {error: 'error in handler for updateUserProfile : ' + e});
    }
}); // close handler

// Set a new foreground image for user. Requester must be user or have admin permissions.
app.post('/users/:userid/images', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var userid = req.params['userid'];
        if (!common.checkJID(userid)) res.send(400, { error: 'bad JID : ' + userid});
        userid = convertToRID(userid);
        var type = req.body['type'];
        var file_imageFile = req.files['imageFile'];
        common.ridCheck(
            [
                { rid: userid, objectClass: 'xUser'},
            ],
            res,
            function () {
                User.uploadUserImage(userid, type, file_imageFile, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for uploadUserImage : ' + e);
        res.send(500, {error: 'error in handler for uploadUserImage : ' + e});
    }
}); // close handler

// Find users matching search expression
app.get('/users', passport.authenticate('basic', { session: false }), function (req, res) {
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
            res,
            function () {
                User.findUsers(searchExpression, limit, offset, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for findUsers : ' + e);
        res.send(500, {error: 'error in handler for findUsers : ' + e});
    }
}); // close handler

// Get a user by userid. Content returned depends on requester permissions.
app.get('/users/:userid', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var userid = req.params['userid'];
        if (!common.checkJID(userid)) res.send(400, { error: 'bad JID : ' + userid});
        userid = convertToRID(userid);
        common.ridCheck(
            [
                { rid: userid, objectClass: 'xUser'},
            ],
            res,
            function () {
                User.getUser(userid, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for getUser : ' + e);
        res.send(500, {error: 'error in handler for getUser : ' + e});
    }
}); // close handler

// Delete a user by user id. Requester must be user or have admin permissions.
app.delete('/users/:userid', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var userid = req.params['userid'];
        if (!common.checkJID(userid)) res.send(400, { error: 'bad JID : ' + userid});
        userid = convertToRID(userid);
        common.ridCheck(
            [
                { rid: userid, objectClass: 'xUser'},
            ],
            res,
            function () {
                User.deleteUser(userid, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for deleteUser : ' + e);
        res.send(500, {error: 'error in handler for deleteUser : ' + e});
    }
}); // close handler

// Get the user's WorkSurface. Requester must be user or have admin permissions.
app.get('/users/:userid/worksurface', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var userid = req.params['userid'];
        if (!common.checkJID(userid)) res.send(400, { error: 'bad JID : ' + userid});
        User.getUserWorkSurface(userid, function (data) {
            var status = data.status || 200;
            if (status && status == 200) {
            }
            res.send(status, data);

        }) // close the route function


        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for getUserWorkSurface : ' + e);
        res.send(500, {error: 'error in handler for getUserWorkSurface : ' + e});
    }
}); // close handler

// Add a network to the user's WorkSurface. Requester must be user or have admin permissions. User must have permission to access network
app.post('/users/:userid/worksurface', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var userid = req.params['userid'];
        if (!common.checkJID(userid)) res.send(400, { error: 'bad JID : ' + userid});
        var networkid = req.body['networkid'];
        if (!common.checkJID(networkid)) res.send(400, { error: 'bad JID : ' + networkid});

        User.addNetworkToUserWorkSurface(userid, networkid, function (data) {
                var status = data.status || 200;
                if (status && status == 200) {
                }
                res.send(status, data);

            } // close the route function

        );

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for addNetworkToUserWorkSurface : ' + e);
        res.send(500, {error: 'error in handler for addNetworkToUserWorkSurface : ' + e});
    }
}); // close handler

// Delete a network from the user's WorkSurface. Requester must be user or have admin permissions
app.delete('/users/:userid/worksurface/:networkid', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var userid = req.params['userid'];
        if (!common.checkJID(userid)) res.send(400, { error: 'bad JID : ' + userid});
        var networkid = req.params['networkid'];
        if (!common.checkJID(networkid)) res.send(400, { error: 'bad JID : ' + networkid});
        User.deleteNetworkFromUserWorkSurface(userid, networkid, function (data) {
            var status = data.status || 200;
            if (status && status == 200) {
            }
            res.send(status, data);

        }) // close the route function

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for deleteNetworkFromUserWorkSurface : ' + e);
        res.send(500, {error: 'error in handler for deleteNetworkFromUserWorkSurface : ' + e});
    }
}); // close handler

// Add a programmatic access account, generate credentials
app.post('/agents', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var name = req.body['name'];
        var owner = req.body['owner'];
        if (!common.checkJID(owner)) res.send(400, { error: 'bad JID : ' + owner});
        owner = convertToRID(owner);
        common.ridCheck(
            [
                { rid: owner, objectClass: 'xAccount'},
            ],
            res,
            function () {
                Agent.createAgent(name, owner, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                        data.id = convertFromRID(data.id);
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for createAgent : ' + e);
        res.send(500, {error: 'error in handler for createAgent : ' + e});
    }
}); // close handler

// Get information about an Agent
app.get('/agents/:agentid', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var agentid = req.params['agentid'];
        if (!common.checkJID(agentid)) res.send(400, { error: 'bad JID : ' + agentid});
        agentid = convertToRID(agentid);
        common.ridCheck(
            [
                { rid: agentid, objectClass: 'xAgent'},
            ],
            res,
            function () {
                Agent.getAgent(agentid, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                        data.id = convertFromRID(data.id);
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for getAgent : ' + e);
        res.send(500, {error: 'error in handler for getAgent : ' + e});
    }
}); // close handler

// Update the credentials and/or status for an Agent
app.post('/agents/:agentid', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var agentId = req.params['agentId'];
        if (!common.checkJID(agentId)) res.send(400, { error: 'bad JID : ' + agentId});
        agentId = convertToRID(agentId);
        var credentials = req.body['credentials'];
        var status = req.body['status'];
        var name = req.body['name'];
        common.ridCheck(
            [
                { rid: agentId, objectClass: 'xAgent'},
            ],
            res,
            function () {
                Agent.updateAgent(agentId, credentials, status, name, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for updateAgent : ' + e);
        res.send(500, {error: 'error in handler for updateAgent : ' + e});
    }
}); // close handler

// Delete an Agent by Agent id. Requester must be agent owner, owner of group owning agent, or have admin permissions.
app.delete('/agents/:agentid', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var agentid = req.params['agentid'];
        if (!common.checkJID(agentid)) res.send(400, { error: 'bad JID : ' + agentid});
        agentid = convertToRID(agentid);
        common.ridCheck(
            [
                { rid: agentid, objectClass: 'xAgent'},
            ],
            res,
            function () {
                Agent.deleteAgent(agentid, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for deleteAgent : ' + e);
        res.send(500, {error: 'error in handler for deleteAgent : ' + e});
    }
}); // close handler

// Add a group account
app.post('/groups', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var userid = req.body['userid'];
        if (!common.checkJID(userid)) res.send(400, { error: 'bad JID : ' + userid});
        userid = convertToRID(userid);
        var groupName = req.body['groupName'];
        common.ridCheck(
            [
                { rid: userid, objectClass: 'xUser'},
            ],
            res,
            function () {
                Group.createGroup(userid, groupName, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                        data.jid = convertFromRID(data.jid);
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for createGroup : ' + e);
        res.send(500, {error: 'error in handler for createGroup : ' + e});
    }
}); // close handler

// Set new group profile information. Requester must be group owner or have admin permissions.
app.post('/groups/:groupid/profile', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var groupid = req.body['groupid'];
        if (!common.checkJID(groupid)) res.send(400, { error: 'bad JID : ' + groupid});
        groupid = convertToRID(groupid);
        var profile = req.body['profile'];
        common.ridCheck(
            [
                { rid: groupid, objectClass: 'xGroup'},
            ],
            res,
            function () {
                Group.updateGroupProfile(groupid, profile, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for updateGroupProfile : ' + e);
        res.send(500, {error: 'error in handler for updateGroupProfile : ' + e});
    }
}); // close handler

// Set a new foreground image for group. Requester must be group owner or have admin permissions.
app.post('/groups/:groupid/images', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var groupid = req.body['groupid'];
        if (!common.checkJID(groupid)) res.send(400, { error: 'bad JID : ' + groupid});
        groupid = convertToRID(groupid);
        var type = req.body['type'];
        var file_image = req.files['image'];
        common.ridCheck(
            [
                { rid: groupid, objectClass: 'xGroup'},
            ],
            res,
            function () {
                Group.uploadGroupImage(groupid, type, file_image, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for uploadGroupImage : ' + e);
        res.send(500, {error: 'error in handler for uploadGroupImage : ' + e});
    }
}); // close handler

// Find groups by search expression
app.get('/groups', passport.authenticate('basic', { session: false }), function (req, res) {
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
            res,
            function () {
                Group.findGroups(searchExpression, limit, offset, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for findGroups : ' + e);
        res.send(500, {error: 'error in handler for findGroups : ' + e});
    }
}); // close handler

// Get a group by group id. Information returned depends on whether requester is group owner.
app.get('/groups/:groupid', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var groupid = req.params['groupid'];
        if (!common.checkJID(groupid)) res.send(400, { error: 'bad JID : ' + groupid});
        groupid = convertToRID(groupid);
        common.ridCheck(
            [
                { rid: groupid, objectClass: 'xGroup'},
            ],
            res,
            function () {
                Group.getGroup(groupid, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for getGroup : ' + e);
        res.send(500, {error: 'error in handler for getGroup : ' + e});
    }
}); // close handler

// Delete a group by group id. Requester must be group owner or have admin permissions.
app.delete('/groups/:groupid', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var groupid = req.params['groupid'];
        if (!common.checkJID(groupid)) res.send(400, { error: 'bad JID : ' + groupid});
        groupid = convertToRID(groupid);
        common.ridCheck(
            [
                { rid: groupid, objectClass: 'xGroup'},
            ],
            res,
            function () {
                Group.deleteGroup(groupid, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for deleteGroup : ' + e);
        res.send(500, {error: 'error in handler for deleteGroup : ' + e});
    }
}); // close handler

// Find Users who are members of a group, optionally filter by search expression. Group owners see all members, non-owners see only members who allow themselves to be visible.
app.get('/groups/:groupid/members', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var groupid = req.params['groupid'];
        if (!common.checkJID(groupid)) res.send(400, { error: 'bad JID : ' + groupid});
        groupid = convertToRID(groupid);
        var searchExpression = req.query['searchExpression'];
        searchExpression = searchExpression || '*';
        var limit = req.query['limit'];
        limit = limit || 100;
        var offset = req.query['offset'];
        offset = offset || 0;
        common.ridCheck(
            [
                { rid: groupid, objectClass: 'xGroup'},
            ],
            res,
            function () {
                Group.getGroupMembers(groupid, searchExpression, limit, offset, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for getGroupMembers : ' + e);
        res.send(500, {error: 'error in handler for getGroupMembers : ' + e});
    }
}); // close handler

// toAccount creates a request to fromAccount. Requests mediate communication between accounts.  The current use cases are request/invitation to add a user to a group and request/grant of authorization for access to a network.  Actions happen when the recipient of the request processes the request.
app.post('/requests', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var toid = req.body['toid'];
        if (!common.checkJID(toid)) res.send(400, { error: 'bad JID : ' + toid});
        toid = convertToRID(toid);
        var fromid = req.body['fromid'];
        if (!common.checkJID(fromid)) res.send(400, { error: 'bad JID : ' + fromid});
        fromid = convertToRID(fromid);
        var requestType = req.body['requestType'];
        var message = req.body['message'];
        var aboutid = req.body['aboutid'];
        if (!common.checkJID(aboutid)) res.send(400, { error: 'bad JID : ' + aboutid});
        aboutid = convertToRID(aboutid);
        common.ridCheck(
            [
                { rid: toid, objectClass: 'xAccount'},
                { rid: fromid, objectClass: 'xAccount'},
                { rid: aboutid, objectClass: 'xGroup'},
            ],
            res,
            function () {
                Request.createRequest(toid, fromid, requestType, message, aboutid, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                        data.jid = convertFromRID(data.jid);
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for createRequest : ' + e);
        res.send(500, {error: 'error in handler for createRequest : ' + e});
    }
}); // close handler

// Get the parameters of a request
app.get('/requests/:requestid', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var requestid = req.params['requestid'];
        if (!common.checkJID(requestid)) res.send(400, { error: 'bad JID : ' + requestid});
        requestid = convertToRID(requestid);
        common.ridCheck(
            [
                { rid: requestid, objectClass: 'xRequest'},
            ],
            res,
            function () {
                Request.getRequest(requestid, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for getRequest : ' + e);
        res.send(500, {error: 'error in handler for getRequest : ' + e});
    }
}); // close handler

// toAccount approves or disapproves a request. Approval causes requested action. Processing deletes request
app.post('/requests/:requestid', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var requestid = req.params['requestid'];
        if (!common.checkJID(requestid)) res.send(400, { error: 'bad JID : ' + requestid});
        requestid = convertToRID(requestid);
        var approval = req.body['approval'];
        common.ridCheck(
            [
                { rid: requestid, objectClass: 'xRequest'},
            ],
            res,
            function () {
                Request.processRequest(requestid, approval, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for processRequest : ' + e);
        res.send(500, {error: 'error in handler for processRequest : ' + e});
    }
}); // close handler

// Find requests that were made by the user or can be processed by the user
app.get('/users/:userid/requests', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var userid = req.params['userid'];
        if (!common.checkJID(userid)) res.send(400, { error: 'bad JID : ' + userid});
        userid = convertToRID(userid);
        common.ridCheck(
            [
                { rid: userid, objectClass: 'xUser'},
            ],
            res,
            function () {
                Request.findRequests(userid, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for findRequests : ' + e);
        res.send(500, {error: 'error in handler for findRequests : ' + e});
    }
}); // close handler

// Create a new network in the specified account
app.post('/networks', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var network = req.body['network'];
        var accountid = req.body['accountid'];

        if (!common.checkJID(accountid)) res.send(400, { error: 'bad JID : ' + accountid});
        accountid = convertToRID(accountid);
        common.ridCheck(
            [
                { rid: accountid, objectClass: 'xAccount'},
            ],
            res,
            function () {
                Network.createNetwork(network, req.body['accountid'], function (data) {
                    var status = data.status || 200;
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for createNetwork : ' + e);
        res.send(500, {error: 'error in handler for createNetwork : ' + e});
    }
}); // close handler

// delete a network
app.delete('/networks/:networkid', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var networkid = req.params['networkid'];
        if (!common.checkJID(networkid)) res.send(400, { error: 'bad JID : ' + networkid});
        networkid = convertToRID(networkid);
        common.ridCheck(
            [
                { rid: networkid, objectClass: 'xNetwork'},
            ],
            res,
            function () {
                Network.deleteNetwork(req.params['networkid'], function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for deleteNetwork : ' + e);
        res.send(500, {error: 'error in handler for deleteNetwork : ' + e});
    }
}); // close handler

// Returns all or part of a Network based on edge parameters
app.get('/networks/:networkid/edge', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var networkid = req.params['networkid'];
        if (!common.checkJID(networkid)) res.send(400, { error: 'bad JID : ' + networkid});
        networkid = convertToRID(networkid);
        var typeFilter = req.query['typeFilter'];
        typeFilter = typeFilter || {};
        var propertyFilter = req.query['propertyFilter'];
        propertyFilter = propertyFilter || {};
        var subjectNodeFilter = req.query['subjectNodeFilter'];
        subjectNodeFilter = subjectNodeFilter || {};
        var objectNodeFilter = req.query['objectNodeFilter'];
        objectNodeFilter = objectNodeFilter || {};
        var limit = req.query['limit'];
        limit = limit || 100;
        var offset = req.query['offset'];
        offset = offset || 0;
        common.ridCheck(
            [
                { rid: networkid, objectClass: 'xNetwork'},
            ],
            res,
            function () {
                Network.getNetworkByEdges(req.params['networkid'], typeFilter, propertyFilter, subjectNodeFilter, objectNodeFilter, limit, offset, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for getNetworkByEdges : ' + e);
        res.send(500, {error: 'error in handler for getNetworkByEdges : ' + e});
    }
}); // close handler

// Returns nodes and meta information of a Network based on node parameters
app.get('/networks/:networkid/node', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var networkid = req.params['networkid'];
        if (!common.checkJID(networkid)) res.send(400, { error: 'bad JID : ' + networkid});
        networkid = convertToRID(networkid);
        var typeFilter = req.query['typeFilter'];
        typeFilter = typeFilter || {};
        var propertyFilter = req.query['propertyFilter'];
        propertyFilter = propertyFilter || {};
        var limit = req.query['limit'];
        limit = limit || 100;
        var offset = req.query['offset'];
        offset = offset || 0;
        common.ridCheck(
            [
                { rid: networkid, objectClass: 'xNetwork'},
            ],
            res,
            function () {
                Network.getNetworkByNodes(req.params['networkid'], typeFilter, propertyFilter, limit, offset, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for getNetworkByNodes : ' + e);
        res.send(500, {error: 'error in handler for getNetworkByNodes : ' + e});
    }
}); // close handler

// Returns the Network JSON structure with only the meta data  - properties and format
app.get('/networks/:networkid/metadata', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var networkid = req.params['networkid'];
        if (!common.checkJID(networkid)) res.send(400, { error: 'bad JID : ' + networkid});
        networkid = convertToRID(networkid);
        common.ridCheck(
            [
                { rid: networkid, objectClass: 'xNetwork'},
            ],
            res,
            function () {
                Network.getNetworkMetadata(networkid, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for getNetworkMetadata : ' + e);
        res.send(500, {error: 'error in handler for getNetworkMetadata : ' + e});
    }
}); // close handler

// Update network properties
app.post('/network/:networkid/metadata', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var networkid = req.params['networkid'];
        if (!common.checkJID(networkid)) res.send(400, { error: 'bad JID : ' + networkid});
        networkid = convertToRID(networkid);
        var network = req.body['network'];
        common.ridCheck(
            [
                { rid: networkid, objectClass: 'xNetwork'},
            ],
            res,
            function () {
                Network.setNetworkMetadata(networkid, network, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for setNetworkMetadata : ' + e);
        res.send(500, {error: 'error in handler for setNetworkMetadata : ' + e});
    }
}); // close handler

// Returns the Network JDEx
app.get('/networks/:networkid', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var networkid = req.params['networkid'];
        if (!common.checkJID(networkid)) res.send(400, { error: 'bad JID : ' + networkid});
        networkid = convertToRID(networkid);
        common.ridCheck(
            [
                { rid: networkid, objectClass: 'xNetwork'},
            ],
            res,
            function () {
                Network.getNetwork(req.params['networkid'], function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for getNetwork : ' + e);
        res.send(500, {error: 'error in handler for getNetwork : ' + e});
    }
}); // close handler

// Find Networks by search expression
app.get('/networks', passport.authenticate('basic', { session: false }), function (req, res) {
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
            res,
            function () {
                Network.findNetworks(searchExpression, limit, offset, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for findNetworks : ' + e);
        res.send(500, {error: 'error in handler for findNetworks : ' + e});
    }
}); // close handler

// User creates a Task
app.post('/tasks', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var task = req.body['task'];
        var userid = req.body['userid'];
        if (!common.checkJID(userid)) res.send(400, { error: 'bad JID : ' + userid});
        userid = convertToRID(userid);
        common.ridCheck(
            [
                { rid: userid, objectClass: 'xUser'},
            ],
            res,
            function () {
                Task.createTask(task, userid, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                        data.jid = convertFromRID(data.jid);
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for createTask : ' + e);
        res.send(500, {error: 'error in handler for createTask : ' + e});
    }
}); // close handler

// Get the parameters and status of a task
app.get('/tasks/:taskid', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var taskid = req.params['taskid'];
        if (!common.checkJID(taskid)) res.send(400, { error: 'bad JID : ' + taskid});
        taskid = convertToRID(taskid);
        common.ridCheck(
            [
                { rid: taskid, objectClass: 'xTask'},
            ],
            res,
            function () {
                Task.getTask(taskid, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for getTask : ' + e);
        res.send(500, {error: 'error in handler for getTask : ' + e});
    }
}); // close handler

// Set the parameters (such as status) of a task. Can inactivate an active task or activate an inactive task
app.post('/tasks/:taskid', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var taskid = req.params['taskid'];
        if (!common.checkJID(taskid)) res.send(400, { error: 'bad JID : ' + taskid});
        taskid = convertToRID(taskid);
        var status = req.body['status'];
        common.ridCheck(
            [
                { rid: taskid, objectClass: 'xTask'},
            ],
            res,
            function () {
                Task.updateTask(taskid, status, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for updateTask : ' + e);
        res.send(500, {error: 'error in handler for updateTask : ' + e});
    }
}); // close handler

// Delete an inactive or completed task
app.delete('/tasks/:taskid', passport.authenticate('basic', { session: false }), function (req, res) {
    try {
        var taskid = req.params['taskid'];
        if (!common.checkJID(taskid)) res.send(400, { error: 'bad JID : ' + taskid});
        taskid = convertToRID(taskid);
        common.ridCheck(
            [
                { rid: taskid, objectClass: 'xTask'},
            ],
            res,
            function () {
                Task.deleteTask(taskid, function (data) {
                    var status = data.status || 200;
                    if (status && status == 200) {
                    }
                    res.send(status, data);

                }) // close the route function

            } // close the ridCheck callback

        ); // close the ridCheck

        // now catch random errors
    }
    catch (e) {
        console.log('error in handler for deleteTask : ' + e);
        res.send(500, {error: 'error in handler for deleteTask : ' + e});
    }
}); // close handler
var server = new orientdb.Server(serverConfig);
var db = new orientdb.GraphDb(ndexDatabaseName, server, dbConfig);
db.open(function (err) {
    if (err)  throw err;
    console.log('Successfully connected to OrientDB');
    routes.init(db, function (err) {
        if (err) {
            throw err;
        }
    });
    common.init(db, function (err) {
        if (err) {
            throw err;
        }
    });
    System.init(db, function (err) {
        if (err) {
            throw err;
        }
    });
    User.init(db, function (err) {
        if (err) {
            throw err;
        }
    });
    Agent.init(db, function (err) {
        if (err) {
            throw err;
        }
    });
    Group.init(db, function (err) {
        if (err) {
            throw err;
        }
    });
    Request.init(db, function (err) {
        if (err) {
            throw err;
        }
    });
    Network.init(db, function (err) {
        if (err) {
            throw err;
        }
    });
    Task.init(db, function (err) {
        if (err) {
            throw err;
        }
    });
});


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