//var jdex = require("./js/jdex.js");
//var fs = require('fs');
var ndex = require('./js/ndexClient.js')


ndex.findNetworks("*", 100, 0, function(data){
		console.log("Got results from findNetworks");
		console.log(data);
		for (i in data.networks){
			var network = data.networks[i];
			console.log(network.title);
		}
	},
	function(error){
		console.log("Got Error");
	});

