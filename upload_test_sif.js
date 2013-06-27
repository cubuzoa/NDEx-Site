var jdex = require("./js/jdex.js");
var fs = require('fs');
var ndex = require('./js/ndexClient.js')

var sif_data = fs.readFileSync('./pc_sif_1.txt').toString().split("\n");	

var graph = jdex.createGraphFromSIF(sif_data);

graph.properties.title = 'The Graph Who Would be King';

// Serialize the graph to JSON, using the ORIENTDB mode which specifies
// That some structures are to be translated to documents and linked.
var jgraph = graph.toJDEx();

jgraph.name = "pc sif 1 test2";

jgraph.format = "SIF";

//console.log(jgraph);

ndex.createNetwork(jgraph, "fake", function(data){
		console.log("Created Network");
		console.log("About to call getNetwork on Network Id = " + data.networkId);
		
		ndex.getNetwork(data.networkId, function(data2){
			console.log("getNetwork = " + JSON.stringify(data2.network));
		});
	});


/*
var url = 'http://localhost:9999/networks/';
var jsonToSend = {accountURI: "fake", network: jdex};

console.log(jsonToSend);
request({
		method : 'POST',
		url : url, 
		json : jsonToSend
		},
		function(err, res, body){
			if (err){
				console.log("Got Error: " + err);
			} else {
				console.log("response = " + res.statusCode); 
				if (body){
					console.log(body);
					
					// If we loaded, get id from body.
					// Then get network by id
					
					var id = body.networkId;
					
				}
			}
		}
);	

*/
