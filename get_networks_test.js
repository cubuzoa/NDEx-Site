//var jdex = require("./js/jdex.js");
var $ = require('jQuery');
var ndex = require('./js/ndexClient.js')

var searchExpression = "*";
var limit = 100;
var offset = 0;

ndex.findNetworks(searchExpression, limit, offset, function(data){
		$.each(data.networks, function(index, descriptor){
			console.log("Search returned descriptor: " + JSON.stringify(descriptor));
			console.log("About to query by rid = " + descriptor["@rid"]);
			ndex.getNetwork(descriptor["@rid"], function(data){
				
				console.log("Query by ID returned: ")
				console.log(JSON.stringify(data.network));
			});
		});
	});

/*
var sif_data = fs.readFileSync('./pc_sif_1.txt').toString().split("\n");	

var graph = jdex.createGraphFromSIF(sif_data);

graph.properties.title = 'The Graph Who Would be King';

var jgraph = graph.toJDEx();

jgraph.name = "pc sif 1 test2";

ndex.createNetwork(jgraph, "fake", function(data){
		console.log("Created Network");
		console.log("Network Id = " + data.networkId);
	});
*/