module.db = null;

exports.init = function(orient, callback) {
    module.db = orient;
}

function convertFromRID(RID){
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

exports.createNetworkEdge = function(networkRID, edge){
	// Get the predicate term
	var termCmd = "select from (traverse terms from " + networkRID + " while $depth < 2) where $depth = 1 and id = " + edge.p;
	//console.log("index " + index + " edge " + edge.s + " " + edge.o);
	
	module.db.command(termCmd, function(err1, results1){
	
			if (err1){
				console.log("error in finding term for edge: " + err1);
			} else {

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
				//console.log("ran " + cmd);
				if (err2) {
					console.log("error in creating edge: " + err2);
				} else {
				//console.log("got " + Object.keys(results2[0]).join(", "));
		
					// TODO:
					// After each edge is created, link it to its supports (if any)
		
					// now link the edge to the network, not just the nodes
					var newEdge = results2[0],
						updateCmd = "update " + networkRID + " add edges = " + newEdge["@rid"];
						module.db.command(updateCmd, function (err3, results3){
							//console.log("ran " + updateCmd);
							if (err3) console.log("error: " + err3);
						});
				}
			
			});
		}
	});
}

exports.linkNodesToTerms = function(networkJDEx, network){
	console.log("------------- link nodes to terms ------------------");
	var networkRID = network["@rid"];
	var nodeCmd = "select from (traverse nodes from " + networkRID + " while $depth < 2) where $depth = 1";
	console.log(nodeCmd);
	module.db.command(nodeCmd, function(err, nodes){		
			
		if (err){
			console.log("error in finding nodes of network: " + err);
		} else {
			for (i in nodes){
				var node = nodes[i];
				// look up the term id that the node represents
				if (node.id){
					var jnode = networkJDEx.nodes[node.id];
					if (jnode && jnode.represents){
						// IF we found the node in the jdex 
						// AND it has a 'represents' property
						// THEN link it to the xTerm in orient
						exports.linkNodeToTerm(node['@rid'], networkRID, jnode.represents);
						

					}
				}
			}
			
		}
	});

};

exports.linkNodeToTerm = function(nodeRID, networkRID, termId){
	var termCmd= "select from (traverse terms from " + networkRID + " while $depth < 2) where $depth = 1 and id = " + termId;
	module.db.command(termCmd, function(err, terms){
		if (err){
			console.log("error in finding represented term : " + err);
		} else {
			var term = terms[0];
			updateCmd = "update " + nodeRID + " set represents = " + term['@rid'];
			console.log("Represents: " + updateCmd);
			module.db.command(updateCmd, function(err2){
				if (err2){
					console.log("error in setting represented term : " + err2);
				}
			});
		}
	});
};

// Create a new network in the specified account
exports.createNetwork = function(networkJDEx, accountRID, callback){
	var title = "untitled";
	if (networkJDEx.properties && networkJDEx.properties.title){
		title = networkJDEx.properties.title;
	}
	console.log("calling createNetwork for " + title + " owned by account: " + accountRID);
	
	// First create a document to load which will create all of the Vertices
	// including their JDEx IDs, but not the cross-links between the objects.
	// (in some cases, such as functional terms, the JDEx ID is the *only* property they have at this time)
	
	var initialDocument = exports.createInitialDocument(networkJDEx);
	// console.log(JSON.stringify(initialDocument));
	
		
	// The initial network will be created by the db.cascadingSave facility
	// db.save works for documents without links
	// where as cascadingSave creates embedded documents and links them
	module.db.cascadingSave(initialDocument, function (err, document){
	
		if (err){
			console.log("error saving initial network: " + err);
		}
		
		if (document && document["@rid"]){
		
			var networkRID = document["@rid"];
	
			//console.log("Saved initial document: " + JSON.stringify(document));
		
			// assert ownership of network - can be asynch since both network and account exist
			var ownsEdgeCMD = "create edge xOwnsNetwork from " + accountRID + " to " + networkRID;
			module.db.command(ownsEdgeCMD, function(err){
			});
		
			// create all the Edges with their JDEx IDs.
			// This can be asynchronous because the nodes already exist.	
			exports.createNetworkEdges(networkJDEx, document);
		
			// TODO link nodes to terms via represents
			exports.linkNodesToTerms(networkJDEx, document);
		
			callback({jid: networkRID, ownedBy: accountRID, error : err});
		} else {
			console.log("initial document is null, even though no error signaled");
		}
	});
		
};	

//
// Temporary: searchExpression is only used to match substrings in title and description fields of network
//
exports.findNetworks = function (searchExpression, limit, offset, callback){
	console.log("calling findNetworks with arguments: '" + searchExpression + "' " + limit + " " + offset);
	
	var where_clause = "";

	if (searchExpression.length > 0){
		where_clause = " where properties.title.toUpperCase() like '%" + searchExpression + "%' OR properties.description.toUpperCase() like '%" + searchExpression + "%'";
	} else {
		console.log("searchExpression.length = " + searchExpression.length);
	}
		
	var descriptors = "properties.title as title, @rid as jid, nodes.size() as nodeCount, edges.size() as edgeCount",
		cmd = "select " + descriptors + " from xNetwork" + where_clause + " order by creation_date desc limit " + limit;
		
	console.log(cmd);
	module.db.command(cmd, function(err, networks) {
		for (i in networks){
			var network = networks[i];
			network.jid = convertFromRID(network.jid);
		}
        callback({networks : networks, error : err});
    });
};

// get an entire network
exports.getNetwork = function(networkRID, callback){
	console.log("calling getNetwork with networkRID = '" + networkRID + "'");
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
										result.terms[term.id] = {name: term.name, jid: convertFromRID(term.rid), ns: term.nsid};
									}
							
									// get the nodes
									// TODO - get the defining terms...
									var node_cmd = "select id, name, represents.id as represents, @rid as rid from (traverse nodes from " + networkRID + ") where $depth = 1";
									module.db.command(node_cmd, function(err, nodes) {
										if (exports.checkErr(err, "getting nodes", callback)){
						
											// process the nodes
											for (i in nodes){
												var node = nodes[i];
												result.nodes[node.id] = {name: node.name, jid: convertFromRID(node.rid), represents: node.represents};
											}
											// get the edges
											var edge_cmd = "select  in.id as s, p.id as p, out.id as o, @rid as rid from (traverse edges from " + networkRID + ") where $depth = 1)";
											module.db.command(edge_cmd, function(err, edges) {
												if (exports.checkErr(err, "getting edges", callback)){
										
													// process the edges
													for (i in edges){
														var edge = edges[i];
														result.edges[i] = {s: edge.s, p: edge.p, o: edge.o, jid: convertFromRID(edge.rid)};
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


// delete a network
exports.deleteNetwork = function (networkRID, callback){
	console.log("calling delete network with id = '" + networkRID + "'");
	var cmd = "delete from " + networkRID;
	console.log(cmd);
	module.db.command(cmd, function(err) {
        callback({error : err});
    });
};