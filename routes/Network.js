module.db = null;

exports.init = function(orient, callback) {
    module.db = orient;
}

exports.createInitialDocument = function(networkJDEx){
		var o_nodes = [],
		o_namespaces = [],
		//s_nodeTypes = [],
		//s_edges = {},
		o_terms = [],
		o_properties = {};
		//s_supports = {},
		//s_citations = {};

		for(index in networkJDEx.namespaces){
			var ns = networkJDEx.namespaces[index];
			o_namespaces.push({"@type": "d", "@class": "xNameSpace",id: index, prefix: ns.prefix, uri: ns.uri});
		}

		// for each base term, create with id and name, link to namespace later
		for(index in networkJDEx.terms){
			var term = networkJDEx.terms[index];
			if (term.name){
				var o_term = {"@type": "d", "@class": "xBaseTerm", id: index, name: term.name};
				o_terms.push(o_term);
			}
		}

		// just copy the graph properties
		for(index in networkJDEx.properties){
			var value = networkJDEx.properties[index];
			o_properties[index] = value;
		}

		// for each node, create with id and name, link to defining term later									
		for(index in networkJDEx.nodes){
			var node = networkJDEx.nodes[index],
				o_node = {"@type": "d", "@class": "xNode", id: index};
			if (node.name) o_node["name"] = node.name;
			o_nodes.push(o_node);
		}

/*		
		$.each(this.edges, function(index, edge){
			s_edges[index] = edge.serializeJDEx();
		});

		$.each(this.supports, function(index, support){
			s_supports[index] = support.serializeJDEx();
		});
		
		$.each(this.citations, function(index, citation){
			s_citations[index] = citation.serializeJDEx();
		});		

		$.each(this.nodeTypes, function(index, nodeType){
			s_nodeTypes[index] = nodeType.serializeJDEx();
		});	

*/		

		return {
				"@class": "xNetwork",
				"@type": "d",
				format: networkJDEx.format, 
				namespaces: o_namespaces,
				terms: o_terms,
				properties : o_properties,
				nodes: o_nodes, 
				edges: [], 
				//nodeTypes: s_nodeTypes,
				//citations : s_citations,
				//supports : s_supports
				};
		

}

exports.createNetworkEdges = function(networkJDEx, network){
	for(index in networkJDEx.edges){
		// Get the predicate term
		var edge = networkJDEx.edges[index],
			networkRID = network["@rid"],
			termCmd = "select from (traverse terms from " + networkRID + " while $depth < 2) where $depth = 1 and id = " + edge.p;
		   
		module.db.command(termCmd, function(err1, results1){

			//
			// Finding nodes and predicate term referenced by the edge, use traverse to search terms in this network:
			//
			// select from (traverse terms from #18:7 while $depth < 2) where $depth = 1 and id = 2
			//
			var	term = results1[0],
				fromExp = "select from (traverse nodes from " + networkRID + " while $depth < 2) where $depth = 1 and id = " + edge.s,
				toExp = "select from (traverse nodes from " + networkRID + " while $depth < 2) where $depth = 1 and id = " + edge.o,
				 cmd = "create edge xEdge from (" + fromExp + ") to (" + toExp + ") set p = " + term["@rid"] + ", n = " + networkRID ;
				 
			module.db.command(cmd, function (err2, results2){
				console.log("ran " + cmd);
				console.log("got " + Object.keys(results2[0]).join(", "));
			
			
				// now link the edge to the network, not just the nodes
				var newEdge = results2[0],
					updateCmd = "update " + networkRID + " add edges = " + newEdge["@rid"];
					module.db.command(updateCmd, function (err3, results3){
						console.log("ran " + updateCmd);
						if (err3) console.log("error: " + err3);
					});
			
				if (err2) console.log("error: " + err2);
			});
		});
	}
}

exports.linkNodesToTerms = function(networkJDEx, networkRID){

}

// Create a new network in the specified account
exports.createNetwork = function(networkJDEx, accountURI, callback){
	console.log("calling createNetwork " + networkJDEx.name + " currently ignoring account: " + accountURI);

	/*
	console.log("JDEx keys: " + Object.keys(networkJDEx).join(", "));
	var propertyNames = [],
		propertyValues = [];
		
	console.log(networkJDEx.properties.title);
	
	console.log("properties size = " + Object.keys(networkJDEx.properties).length);
	

	
	if (networkJDEx.properties && Object.keys(networkJDEx.properties).length > 0){
		for (key in networkJDEx.properties){
			var value = networkJDEx.properties[key];
			console.log("JDEx has property " + key + " with value " + value);
			propertyNames.push(key);
			propertyValues.push(value);
		}
	} else {
		console.log("No properties in JDEx");
	}
	*/
	
	// First create a document to load which will create all of the Vertices
	// including their JDEx IDs, but not the cross-links between the objects.
	// (in some cases, such as functional terms, the JDEx ID is the *only* property they have at this time)
	
	var initialDocument = exports.createInitialDocument(networkJDEx);
		
	// The initial network will be created by the db.cascadingSave facility
	// db.save works for documents without links
	// where as cascadingSave creates embedded documents and links them
	console.log(JSON.stringify(initialDocument));
	
	module.db.cascadingSave(initialDocument, function (err, document){
	
		console.log("Saved initial document: " + JSON.stringify(document));
		
		
		// Then, in the first callback, create all the Edges with their JDEx IDs.
		// This can be asynchronous because the nodes will exist.
		// As each edge is created, it is linked to its supports (if any)
		//exports.createNetworkEdges(networkJDEx, document["@rid"]);
		
		exports.createNetworkEdges(networkJDEx, document);
		
		callback({networkId: document["@rid"], error : err});
/*		
		function(err){
		
			// TODO check for error
			
			// Finally, in the third callback, remaining links can be inserted asynchronously, 
			// selecting the objects via their JDEx IDs
			// (All the objects should exist by then)
			exports.linkNodesToTerms(networkJDEx, function(err){
			
			});
*/		
		});
		

/*	
	// Create the the network with its properties
	var insertNetworkCmd = "insert into Network (" + propertyNames.join(", ") + ") values('" + propertyValues.join(", ") + "')";
	console.log(insertNetworkCmd)
	module.db.command(insertNetworkCmd, function(err) {
		if (err){
			console.log("Network insert yields error : " + err);
		} else {
			console.log("Network inserted without error");
			
			// Create Terms used in the network
			
		}
		callback({error : err});
	});
*/
}	

// returns network descriptors - 
exports.findNetworks = function (searchExpression, limit, offset, callback){
	console.log("calling findNetworks with arguments: " + searchExpression + " " + limit + " " + offset);
	// Temporary: ignore search expression and offset, just get the first n networks
	var cmd = "select from Network order by creation_date desc limit " + limit;
	console.log(cmd);
	module.db.command(cmd, function(err, networks) {
        callback({networks : networks, error : err});
    });
};

// get an entire network
exports.getNetwork = function(networkId, callback){
	console.log("calling getNetwork with networkId = '" + networkId + "'");
	var cmd = "select from " + networkId + "";
	console.log(cmd);
	module.db.command(cmd, function(err, networks) {
		if (err){
			console.log("caught orient db error " + err);
			callback({network : null, error : err, status : 500});
		} else {
			try {
				if (!networks || networks.length < 1){
					console.log("found no networks by id = '" + networkId + "'");
					callback({status : 404});
				} else {
					console.log("found " + networks.length + " networks, first one is " + JSON.stringify(networks[0]));
					callback({network : networks[0]});
				}
			}
			catch (e){
				console.log("caught error " + e);
				callback({network : null, error : e.toString(), status : 500});	
			}
		}
    });
};

// delete a network
exports.deleteNetwork = function (networkId, callback){
	console.log("calling delete network with id = '" + networkId + "'");
	var cmd = "delete from Network where id =  '" + id + "'";
	console.log(cmd);
	module.db.command(cmd, function(err) {
        callback({error : err});
    });
};