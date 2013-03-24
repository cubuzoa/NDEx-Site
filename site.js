var express = require('express');
var app = express();
var port = 3330;

app.set('view engine', 'ejs');

app.configure(function(){
  app.use('/css', express.static(__dirname + '/css'));
  app.use('/img', express.static(__dirname + '/img'));
  app.use('/js', express.static(__dirname + '/js'));
  app.use(express.static(__dirname + '/public'));
});

// Index Page
//
// TODO: setup authentication and access control
// TODO" links to each of the documents
//
app.get('/', function(req, res) {
  res.render('index', {title: "Home"});
});

app.get('/networks', function(req, res) {
  res.render('networks', {title: "Networks"});
});

app.get('/groups', function(req, res) {
  res.render('groups', {title: "Groups"});
});

app.get('/bench', function(req, res) {
  res.render('bench', {title: "Bench"});
});

app.get('/search_results', function(req, res) {
  res.render('search_results', {title: "Search Results"});
});

app.listen(port);
console.log('REST server listening on port ' + port + '...');