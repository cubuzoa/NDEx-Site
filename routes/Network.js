module.db = null;

exports.init = function(orient, callback) {
    module.db = orient;
}

module.convertToRID = function(id){
	return id.replace("C","#").replace("R", ":");
}

module.convertFromRID = function(RID){
	return RID.replace("#","C").replace(":", "R");
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
		exports.createNetworkEdge(network["@rid"], networkJDEx.edges[index]);
	}
}

exports.createNetworkEdge = function(networkJID, edge){
	var networkRID = convertToRID(networkJID);
	// Get the predicate term
	var termCmd = "select from (traverse terms from " + networkRID + " while $depth < 2) where $depth = 1 and id = " + edge.p;
	console.log("index " + index + " edge " + edge.s + " " + edge.o);
	
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
		
		callback({networkId: module.convertFromRID(document["@rid"]), error : err});
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
	
	var descriptors = "properties.title as title, @rid as rid, nodes.size() as nodeCount, edges.size() as edgeCount";
		cmd = "select " + descriptors + " from xNetwork order by creation_date desc limit " + limit;
	console.log(cmd);
	module.db.command(cmd, function(err, networks) {
		for (i in networks){
			var network = networks[i];
			network.rid = module.convertFromRID(network.rid);
		}
		// for each network, summarize the key facts
        callback({networks : networks, error : err});
    });
};

// get an entire network
exports.getNetwork = function(networkJID, callback){
	var networkRID = module.convertToRID(networkJID);
	console.log("calling getNetwork with networkId = '" + networkRID + "'");
	var cmd = "select from " + networkRID + "";
	console.log(cmd);
	module.db.command(cmd, function(err, networks) {
		if (exports.checkErr(err, "finding network", callback)){
			try {
				if (!networks || networks.length < 1){
					console.log("found no networks by id = '" + networkRID + "'");
					callback({status : 404});
				} else {
					console.log("found " + networks.length + " networks, first one is " + networks[0]["@rid"]);
					
					var result = {namespaces : {}, terms: {}, nodes: {}, edges: {}};
					
					// get the namespaces
					var ns_cmd = "select id, prefix, uri, @rid as rid from (traverse namespaces from " + networkRID + ") where $depth = 1";
					module.db.command(ns_cmd, function(err, namespaces) {
						if(exports.checkErr(err, "getting namespaces", callback)){
						
							// process the namespaces
							for (i in namespaces){
								var ns = namespaces[i];
								result.namespaces[ns.id] = {prefix: ns.prefix, rid: module.convertFromRID(ns.rid), uri: ns.uri};
							}
							
							// get the terms
							var term_cmd = "select id, name, ns.id as nsid, @rid as rid from (traverse terms from " + networkRID + ") where $depth = 1";
							module.db.command(term_cmd, function(err, terms) {
								if (exports.checkErr(err, "getting terms", callback)){
						
									// process the terms
									for (i in terms){
										var term = terms[i];
										result.terms[term.id] = {name: term.name, rid: module.convertFromRID(term.rid), ns: term.nsid};
									}
							
									// get the nodes
									// TODO - get the defining terms...
									var node_cmd = "select id, name, @rid as rid from (traverse nodes from " + networkRID + ") where $depth = 1";
									module.db.command(node_cmd, function(err, nodes) {
										if (exports.checkErr(err, "getting nodes", callback)){
						
											// process the nodes
											for (i in nodes){
												var node = nodes[i];
												result.nodes[node.id] = {name: node.name, rid: module.convertFromRID(node.rid)};
											}
											// get the edges
											var edge_cmd = "select  in.id as s, p.id as p, out.id as o, @rid as rid from (traverse edges from " + networkRID + ") where $depth = 1)";
											module.db.command(edge_cmd, function(err, edges) {
												if (exports.checkErr(err, "getting edges", callback)){
										
													// process the edges
													for (i in edges){
														var edge = edges[i];
														result.edges[i] = {s: edge.s, p: edge.p, o: edge.o, rid: module.convertFromRID(edge.rid)};
													}
										
													callback({network : result});
												}
											}); // close edge query
										}
									}); // close node query
								}
							}); // close term query
						}
					}); // close namespace query
					
				}
			}
			catch (e){
				console.log("caught error " + e);
				callback({network : null, error : e.toString(), status : 500});	
			}
		}
    }); // close find network query
};

exports.checkErr = function(err, where, callback){
	if (err){
			console.log("DB error, " + where + " : " + err);
			callback({network : null, error : err, status : 500});
			return false;
	}
	return true;
};

exports.networkToJDEx = function(network){
		var o_nodes = [],
		o_namespaces = [],
		//s_nodeTypes = [],
		o_edges = [],
		o_terms = [],
		o_properties = {};
		//s_supports = {},
		//s_citations = {};
		
		console.log("networkToJDEx: " + network);

		for(index in network.namespaces){
			var ns = network.namespaces[index];
			o_namespaces.push({id: ns.id, prefix: ns.prefix, uri: ns.uri, rid: ns['@rid']});
		}

		// for each base term, create with id and name, link to namespace later
		for(index in network.terms){
			var term = network.terms[index];
			if (term.name){
				console.log("term: " + term.id);
				var o_term = {type: "b", id: term.id, name: term.name, rid: term['@rid']};
				if (term.ns){
					o_term.ns = term.ns.id;
				}
				o_terms.push(o_term);
			}
		}

		// just copy the graph properties
		for(index in network.properties){
			var value = network.properties[index];
			o_properties[index] = value;
		}

		// for each node, create with id and name, link to defining term later									
		for(index in network.nodes){
			var node = network.nodes[index],
				o_node = {id: node.id, rid: node['@rid']};
			if (node.name) o_node.name = node.name;
			o_nodes.push(o_node);
		}

		// for each node, create with id and name, link to defining term later									
		for(index in network.nodes){
			var node = network.nodes[index],
				o_node = {id: node.id, rid: node['@rid']};
			if (node.name) o_node.name = node.name;
			o_nodes.push(o_node);
		}	

		// for each node, create with id and name, link to defining term later									
		for(index in network.edges){
			var edge = network.edges[index],
				o_edge = {id: edge.id, rid: edge['@rid'], s: edge.s.id, o: edge.o.id};
			if (edge.p) o_edge.p = edge.p.id;
			o_edges.push(o_edge);
		}
			
		return {

				format: network.format, 
				namespaces: o_namespaces,
				terms: o_terms,
				properties : o_properties,
				nodes: o_nodes, 
				edges: o_edges, 
				//nodeTypes: s_nodeTypes,
				//citations : s_citations,
				//supports : s_supports
			};
}

// delete a network
exports.deleteNetwork = function (networkJID, callback){
	var networkRID = module.convertToRID(networkJID);
	console.log("calling delete network with id = '" + networkRID + "'");
	var cmd = "delete from Network where id =  '" + networkRID + "'";
	console.log(cmd);
	module.db.command(cmd, function(err) {
        callback({error : err});
    });
};