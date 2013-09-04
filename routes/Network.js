module.db = null;

var common = require("./Common.js");

exports.init = function(orient, callback) {
    module.db = orient;   
};

function xferProperties(from, to, propertyNames){
	for (i in propertyNames){
		var prop = propertyNames[i];
		if (from[prop]){
			to[prop] = from[prop];
		}
	}
}

// Create a new network from JDEx, owned by the specified account
exports.createNetwork = function(networkJDEx, accountRID, callback){
	
	var title = "untitled";

	if (networkJDEx.properties && networkJDEx.properties.title){
		title = networkJDEx.properties.title;
	}
	
	console.log("calling createNetwork for " + title + " owned by account: " + accountRID);
	
	// First create a document to load which will create all of the Vertices
	// including their JDEx IDs, but not the cross-links between the objects.
	// (in some cases, such as functional terms, the JDEx ID is the *only* 
	// property they have at this time)
	
	var initialDocument = createNetworkDocument(networkJDEx);
	// console.log(JSON.stringify(initialDocument));
	
		
	// The initial network will be created by the db.cascadingSave facility
	// db.save works for documents without links
	// where as cascadingSave creates embedded documents and links them
	module.db.cascadingSave(initialDocument, function (err, document){
	
		if(common.checkErr(err, "Saving initial network", callback)){		
			if (document && document["@rid"]){
		
				var networkRID = document["@rid"],
					// create lookup table indexing the created Vertices by their
					// JDEx IDs so that we can efficiently create relationships and edges
					// cross-linking the Vertices.
					networkIndex = indexNetworkDocument(document);
				
				// assert ownership of network - can be asynch since both network and account exist
				var ownsEdgeCMD = "create edge xOwnsNetwork from " + accountRID + " to " + networkRID;
				module.db.command(ownsEdgeCMD, function(err){
					if (err) throw("Failed to create xOwnsNetwork edge : " + err);
				});
			
				// create xEdge edges between xNodes
				for(index in networkJDEx.edges){
					createNetworkEdgeAsync(networkRID, networkJDEx.edges[index], networkIndex);
				}
			
				// link xFunctionTerms to the their Parameter xTerms
				linkFunctionTerms(networkJDEx, networkIndex);
		
				// link xNodes to xTerms via represents
				linkNodesToTerms(networkJDEx, networkIndex);			
		
				callback({jid: networkRID, ownedBy: accountRID, error : err, status : 200});
			
			} else {
				callback({network : null, "initial network created is null, even though db did not error" : err, status : 500});
			}
		}
	});
};	


function createNetworkDocument(networkJDEx){
		var o_nodes = [],
		o_namespaces = [],
		o_terms = [],
		o_properties = {},
		o_supports = {},
		o_citations = {};

		for(index in networkJDEx.namespaces){
			var ns = networkJDEx.namespaces[index];
			o_namespaces.push({"@type": "d", "@class": "xNameSpace",id: index, prefix: ns.prefix, uri: ns.uri});
		}

		// for each term, create xTerm with appropriate type, id and name, 
		// link to namespace later,
		// link xFunctionTerm vertices to their parameters later
		for(index in networkJDEx.terms){
			var term = networkJDEx.terms[index];
			if (term.name){
				var o_term = {"@type": "d", "@class": "xBaseTerm", id: index, name: term.name};
				o_terms.push(o_term);
			}
		}

		// Copy the graph properties
		for(index in networkJDEx.properties){
			var value = networkJDEx.properties[index];
			o_properties[index] = value;
		}

		// For each node, create an xNode with id and name
		// link to represented term later									
		for(index in networkJDEx.nodes){
			var node = networkJDEx.nodes[index],
				o_node = {"@type": "d", "@class": "xNode", id: index};
			if (node.name) o_node["name"] = node.name;
			o_nodes.push(o_node);
		}
		
		// for each support, create with id and text, 
		// link to edges and citation later									
		for(index in networkJDEx.supports){
			var support = networkJDEx.supports[index],
				o_support = {"@type": "d", "@class": "xSupport", id: index};
			xferProperties(support, o_support, ["text"]);
			o_supports.push(o_node);
		}

		// for each citation, create xCitation with id and other properties, 
		// link to xEdges and xSupports later									
		for(index in networkJDEx.citations){
			var citation = networkJDEx.citations[index],
				o_citation = {"@type": "d", "@class": "xCitation", id: index};
			xferProperties(citation, o_citation, ["identifier", "type", "title", "contributors"]);
			o_citations.push(o_citation);
		}			

		return {
				"@class": "xNetwork",
				"@type": "d",
				format: networkJDEx.format, 
				namespaces: o_namespaces,
				terms: o_terms,
				properties : o_properties,
				nodes: o_nodes, 
				edges: [], 
				//nodeTypes: o_nodeTypes,
				citations : o_citations,
				supports : o_supports
				};
		

}

function indexNetworkDocument(document){
	var networkIndex = {};
	for(index in document.namespaces){
		var ns = document.namespaces[index];
		networkIndex[ns.id] = ns["@rid"];
	}
	for(index in document.terms){
		var term = document.terms[index];
		networkIndex[term.id] = term["@rid"];
	}						
	for(index in document.nodes){
		var node = document.nodes[index];
		networkIndex[node.id] = node["@rid"];
	}									
	for(index in document.supports){
		var support = document.supports[index];
		networkIndex[support.id] = support["@rid"];
	}									
	for(index in document.citations){
		var citation = document.citations[index];
		networkIndex[citation.id] = citation["@rid"];
	}			
	return networkIndex;
};

//
// TODO : errors thrown in callbacks are useless.
// They are NOT caught by the API catch so they will crash the server instead of aborting the network creation
function createNetworkEdgeAsync(networkRID, edge, networkIndex){
	// Get the RIDs for the subject node, object node, and predicate term
	var subjectRID = networkIndex[edge.s],
		objectRID = networkIndex[edge.o],
		predicateRID = networkIndex[edge.p];
	
	if (subjectRID && objectRID && predicateRID){
		var	cmd = "create edge xEdge from " + subjectRID + " to " + objectRID + " set p = " + predicateRID + ", n = " + networkRID ;
		
		// TODO : 	if the edge has citations or supports, find their ids 
		// 			and add them to the create command
			 
		module.db.command(cmd, function (err, results){
			//console.log("ran " + cmd);
			if (err) {
				throw("Failed to create xEdge via [ " + cmd + " ] with error: "+ err);
			} else {
				// Add the new xEdge to the edges field of the xNetwork
				var newEdge = results[0],
					updateCmd = "update " + networkRID + " add edges = " + newEdge["@rid"];
				module.db.command(updateCmd, function (err2, results2){
					//console.log("ran " + updateCmd);
					if (err2) throw("Failed to add xEdge to xNetwork " + err2);
				});
			}
		});
	} else {
		throw ("Failed to find RIDs to make xEdge: Subject: " + edge.s + " = " + subjectRID + " Object: " + edge.o + " = " + objectRID + " Predicate: " + edge.p + " = " + predicateRID);
	}
}

// The semantics of a node are defined by the term to which the node is linked
// There are use cases for *both* finding nodes based on terms *and* finding terms based on nodes
//
function linkNodesToTerms(networkJDEx, networkIndex){
	for (nodeId in networkJDEx.nodes){
		var node = networkJDEx.nodes[nodeId];
		if (node.represents){
			// the node is linked to the term, so we attempt to find corresponding RIDs
			var xNodeRID = networkIndex[nodeId],
				xTermRID = networkIndex[node.represents];
			if (xNodeRID && xTermRID){
				// insert the link asynchronously
				var updateCmd = "update " + xNodeRID + " set represents = " + xTermRID;
				console.log("Represents: " + updateCmd);
				module.db.command(updateCmd, function(err2){
					if (err2){
						throw ("Failed to set represents for xNode to xTerm pair : " + err2);
					}
				});
			} else {
				throw ("Failed to find RIDs: Node " + nodeId + " = " + xNodeRID + " Term " + node.represents + " = " + xTermRID);
			}
		}
	}
}

//
// Function Terms are defined by reference to:
// 1. a function term  (so far, always a Basic Term)
// 2. parameters that are terms (either Basic Terms *or* FunctionTerms
// 3. parameters that are literal values
//
function linkFunctionTerms(networkJDEx, networkIndex){
	for (termId in networkJDEx.terms){
		var term = networkJDEx.terms[termId],
			xTermRID = networkIndex[termId];
		if (!xTermRID) throw "Failed to find RID for term id = " + termId;
		
		if (term.function && term.parameters){
			// This is a function term
			// First, get the RID of the function and link it
			var functionRID = networkIndex[term.function];
			if (!functionRID) throw("Failed to find RID for function term " + term.function);
			
			// create the parameter expression
			var params = [];
			// Find RIDs for parameters that are terms
			for (parameterId in term.parameters){
				var param = term.parameters[parameterId];
				if (param.term){
					var paramRID = networkIndex[param.term];
					if (!paramRID) throw("Failed to find RID for functional term parameter id = " + param.term);
					params.push(paramRID);
				} else {
					// if param doesn't have a term, its a literal
					params.push(param);
				}
			}
			var parameterExpression = params.join(", ");
			var cmd = "update " + xTermRID + " set function = " + functionRID + " , parameters = [" + parameterExpression + "]";
			
			module.db.command(cmd, function(err){
				if (err) throw ("Failed to set function for xTerm to xTerm pair : " + err);
			});
		}	
	}
}


//
// Temporary: searchExpression is only used to match substrings in title and description fields of network
// TODO : Redesign API to allow for more complex search expressions, including search based on network content
exports.findNetworks = function (searchExpression, limit, offset, callback){
	//TODO : determine size of search results in order to compute block size
	console.log("calling findNetworks with arguments: '" + searchExpression + "' " + limit + " " + offset);
	var start = (offset)*limit;
	var where_clause = "";

	if (searchExpression.length > 0){
		where_clause = " where properties.title.toUpperCase() like '%" + searchExpression + "%' OR properties.description.toUpperCase() like '%" + searchExpression + "%'";
	} else {
		console.log("searchExpression.length = " + searchExpression.length);
	}
		
	var descriptors = "properties.title as title, @rid as jid, nodes.size() as nodeCount, edges.size() as edgeCount",
		cmd = "select " + descriptors + " from xNetwork" + where_clause + " order by creation_date desc skip " +  start + " limit " + limit;
		
	console.log(cmd);
	module.db.command(cmd, function(err, networks) {
		for (i in networks){
			var network = networks[i];
			network.jid = common.convertFromRID(network.jid);
		}
		
        callback({networks : networks, blockAmount: 5, error : err});
    });
};

// get an entire network
// TODO: handle all components of network, such as citations, supports, etc.
exports.getNetwork = function(networkRID, callback){
	console.log("calling getNetwork with networkRID = '" + networkRID + "'");
	var cmd = "select from " + networkRID + "";
	console.log(cmd);
	module.db.command(cmd, function(err, networks) {
		if (common.checkErr(err, "finding network", callback)){
			try {
				if (!networks || networks.length < 1){
					console.log("found no networks by id = '" + networkRID + "'");
					callback({status : 404});
				} else {
					console.log("found " + networks.length + " networks, first one is " + networks[0]["@rid"]);
					var properties = networks[0]["properties"];
					var result = {title : properties.title, namespaces : {}, terms: {}, nodes: {}, edges: {}};
					
					// get the namespaces
					var ns_cmd = "select id, prefix, uri, @rid as rid from (traverse namespaces from " + networkRID + ") where $depth = 1";
					module.db.command(ns_cmd, function(err, namespaces) {
						if(common.checkErr(err, "getting namespaces", callback)){
						
							// process the namespaces
							for (i in namespaces){
								var ns = namespaces[i];
								result.namespaces[ns.id] = {prefix: ns.prefix, rid: module.common.convertFromRID(ns.rid), uri: ns.uri};
							}
							
							// get the terms
							var term_cmd = "select id, name, ns.id as nsid, @rid as rid from (traverse terms from " + networkRID + ") where $depth = 1";
							module.db.command(term_cmd, function(err, terms) {
								if (common.checkErr(err, "getting terms", callback)){
						
									// process the terms
									for (i in terms){
										var term = terms[i];
										result.terms[term.id] = {name: term.name, jid: common.convertFromRID(term.rid), ns: term.nsid};
									}
							
									// get the nodes
									// TODO - get the defining terms...
									var node_cmd = "select id, name, represents.id as represents, @rid as rid from (traverse nodes from " + networkRID + ") where $depth = 1";
									module.db.command(node_cmd, function(err, nodes) {
										if (common.checkErr(err, "getting nodes", callback)){
						
											// process the nodes
											for (i in nodes){
												var node = nodes[i];
												result.nodes[node.id] = {name: node.name, jid: common.convertFromRID(node.rid), represents: node.represents};
											}
											// get the edges
											var edge_cmd = "select  in.id as s, p.id as p, out.id as o, @rid as rid from (traverse edges from " + networkRID + ") where $depth = 1";
											module.db.command(edge_cmd, function(err, edges) {
												if (common.checkErr(err, "getting edges", callback)){
										
													// process the edges
													for (i in edges){
														var edge = edges[i];
														result.edges[i] = {s: edge.s, p: edge.p, o: edge.o, jid: common.convertFromRID(edge.rid)};
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

// get a network via its edges
exports.getNetworkByEdges = function(networkid, typeFilter, propertyFilter, subjectNodeFilter, objectNodeFilter, limit, offset, callback, errorHandler){
	console.log("calling get network by edges with arguments: " + limit + ', ' + offset);
	//TODO: implement filters
	//assuming offset acting as start indicator, lowest value can be 1 for page 1
	//implement get terms and nodes via edge links, currently getting all terms and nodes
	//TODO: include other network components referenced by the edges - i.e. return a coherent subnetwork
	
	var result = {title : '', blockAmount: '', namespaces : {}, terms: {}, nodes: {}, edges: {}};
	
	// get the terms
	var term_cmd = "select id, name, ns.id as nsid, @rid as rid from (traverse terms from " + networkid + ") where $depth = 1";
	module.db.command(term_cmd, function(err, terms) {
		if (common.checkErr(err, "getting terms", callback)){
						
			// process the terms
			for (i in terms){
				var term = terms[i];
				result.terms[term.id] = {name: term.name, jid: common.convertFromRID(term.rid), ns: term.nsid};
			}
							
			// get the nodes
			// TODO - get the defining terms...
			var node_cmd = "select id, name, represents.id as represents, @rid as rid from (traverse nodes from " + networkid + ") where $depth = 1";
			module.db.command(node_cmd, function(err, nodes) {
				if (common.checkErr(err, "getting nodes", callback)){
						
					// process the nodes
					for (i in nodes){
						var node = nodes[i];
							result.nodes[node.id] = {name: node.name, jid: common.convertFromRID(node.rid), represents: node.represents};
					}
					
					//get desired amount of edges
					//intialization
					var edgeCount = 0,
						start = 0;
	
					var cmd = "select properties.title as title, edges.size() as edges from " + networkid; // 

					module.db.command(cmd, function(err, networks){
						var network = networks[0];
						
						result.title = network.title;//fix
						edgeCount = network.edges;
						result.blockAmount = Math.ceil(edgeCount/limit);// needs to be returned for pagination module 
						start = (offset)*limit;
						
						var getEdgeCmd = "select  in.id as s, p.id as p, out.id as o, @rid as rid from (traverse edges from " + networkid + ") where $depth = 1 skip " + start + " limit " + limit;
	
						module.db.command(getEdgeCmd, function(err, edges) {
							if (common.checkErr(err, "getting edges", callback)){		
								// process the edges
								for (i in edges){
									var edge = edges[i];
									result.edges[i] = {s: edge.s, p: edge.p, o: edge.o, jid: common.convertFromRID(edge.rid)};
								}
										
								callback({network : result, status : 200});
							}
						});
					});//close network query
				
				}
			});//close node query
		}
	});//close term query
				
	
};
//get a network via its nodes
exports.getNetworkByNodes = function(networkid, typeFilter, propertyFilter, limit, offset, callback, errorHandler){
	console.log("calling get network by nodes with arguments: " + limit + ', ' + offset);
	//TODO: implement filters
	//assuming offset acting as start indicator, lowest value can be 1 for page 1
	//implement get terms and nodes via edge links, currently getting all terms and nodes
	//TODO: include other network components referenced by the nodes - i.e. return a coherent subnetwork

    var result = {title : '', blockAmount: '', namespaces : {}, terms: {}, nodes: {}, edges: {}};
	
	// get the terms
	var term_cmd = "select id, name, ns.id as nsid, @rid as rid from (traverse terms from " + networkid + ") where $depth = 1";
	module.db.command(term_cmd, function(err, terms) {
		if (common.checkErr(err, "getting terms", callback)){
						
			// process the terms
			for (i in terms){
				var term = terms[i];
				result.terms[term.id] = {name: term.name, jid: common.convertFromRID(term.rid), ns: term.nsid};
			}
			
			var nodeCount = 0,
				start = 0;
	
			var cmd = "select properties.title as title, nodes.size() as nodes from " + networkid; // 

			module.db.command(cmd, function(err, networks){
				var network = networks[0];
						
				result.title = network.title;//fix
				nodeCount = network.nodes;
				result.blockAmount = Math.ceil(nodeCount/limit);// needs to be returned for pagination module 
				start = (offset)*limit;
				
				var getNodeCmd = "select  id, name, represents.id as represents, @rid as rid from (traverse nodes from " + networkid + ") where $depth = 1 skip " + start + " limit " + limit;
				
				module.db.command(getNodeCmd, function(err, nodes) {
					if (common.checkErr(err, "getting nodes", callback)){
						
						// process the nodes
						for (i in nodes){
							var node = nodes[i];
							result.nodes[node.id] = {name: node.name, jid: common.convertFromRID(node.rid), represents: node.represents};
						}
						callback({network : result, status : 200});
					}
				});
			});
		}
	});
};

// delete a network
exports.deleteNetwork = function (networkRID, callback){
	console.log("calling delete network with id = '" + networkRID + "'");
	// TODO: existence of network now handled by ridCheck function in Common.js, can remove check from this method
    // TODO: determine whether this simple delete will delete dependent objects or if we need a more sophisticated delete method
	module.db.command("select @rid as rid from " + networkRID + " where @class = 'xNetwork'", function(err, network_ids){
		if(common.checkErr(err, "checking network before adding to workspace ", callback)){
			if (!network_ids || network_ids.length < 1){
				callback({status : 404, error : "Found no network by id = '" + networkRID + "'"});
			} else {
				var cmd = "delete from " + networkRID;
				console.log(cmd);
				module.db.command(cmd, function(err) {
					callback({error : err, status : 200});
			    	});
			 }
		}
	});
};
