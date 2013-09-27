var express = require('express')
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
 
app.configure(function() {

  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  
  
  //app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());

/*
  app.use(express.session({ secret: 'keyboard cat' }));
  
  // Initialize Passport!  
  // Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  //
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
*/

  // Setup static directories
  //
  app.use('/css', express.static(__dirname + '/css'));
  app.use('/img', express.static(__dirname + '/img'));
  app.use('/account_img', express.static(__dirname + '/account_img'));
  app.use('/js', express.static(__dirname + '/js'));
  app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res){
  res.render('home', { user: req.user, title: "Home"});
});

/*
// example page to use for testing login
app.get('/test_login',  function(req, res){
  res.render('test_login', { user: req.user,
  							 title: "Authentication Test Page" });
});
*/

app.get('/login', function(req, res){
  res.render('login', { user: req.user, title: "Login" });
});


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


app.get('/join', function(req, res){
  res.render('join', { title: "Join", user: req.user});
});


//-----------------------------------------------------------
//
//				Main Navigation Destinations
//
//-----------------------------------------------------------

app.get('/myAccount',  function(req, res) {
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

app.get('/showTasks',  function(req, res) {
  res.render('show_tasks', {title: "Tasks",
  							  user: req.user });
});

app.get('/uploadNetwork',  function(req, res) {
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
  res.render('policy', {title: "Policies",
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
  res.render('view_user', 
  			{	title: "User", 
  				userId: req.params['userId'],
  				user: req.user 
  			});
});

app.get('/viewGroup/:groupId', function(req, res) {
  res.render('view_group', 
  			{	title: "Group", 
  				groupId: req.params['groupId'],
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

app.get('/compareNetworks/:network1Id/:network2Id', function(req, res) {
  res.render('triptych_compare_networks', 
  			{	title: "Network", 
  				network1Id: req.params['network1Id'],
  				network2Id: req.params['network2Id'],
  				user: req.user 
  			});
});

app.get('/newGroup', function(req, res) {
  res.render('create_group', 
  			{	title: "New Group", 
  				user: req.user 
  			});
});

app.get('/sendRequest', function(req, res) {
  res.render('request', 
  			{	title: "Send Request", 
  				user: req.user 
  			});
});

app.get('/newTask', function(req, res) {
  res.render('new_task', 
  			{	title: "New Task", 
  				user: req.user 
  			});
});

app.get('/editProfile', function(req, res) {
  res.render('edit_profile', 
  			{	title: "Edit Profile", 
  				user: req.user 
  			});
});

app.get('/editGroupProfile/:groupId', function(req, res) {
  res.render('edit_group_profile', 
  			{	title: "Edit Group Profile", 
  				user: req.user,
                groupId: req.params['groupId']
  			});
});

app.get('/editAgent', function(req, res) {
  res.render('edit_agent', 
  			{	title: "Edit Agent", 
  				user: req.user 
  			});
});

app.get('/editNetworkMetadata', function(req, res) {
  res.render('edit_network_metadata', 
  			{	title: "Edit Network Metadata", 
  				user: req.user 
  			});
});

/*
function convertToRID(JID){
	return JID.replace("C","#").replace("R", ":");
}

function convertFromRID(RID){
	return RID.replace("#","C").replace(":", "R");
}
*/

var server = new orientdb.Server(serverConfig);


//-----------------------------------------------------------
//
//				Launch the Site
//
//-----------------------------------------------------------

app.listen(port);
console.log('NDEx Site server listening on port ' + port + '...');
