var express = require('express');
var app = express();
var port = 9999;

app.configure(function(){
  app.use('/img', express.static(__dirname + '/img'));
  app.use(express.static(__dirname + '/public'));
});

app.use(express.bodyParser());

var orientdb = require('orientdb');

var dbConfig = {
	user_name: 'admin',
	user_password: 'admin'
};

var serverConfig = {
	host: 'localhost',
	port: 2424
};

var routes = require('./routes');
