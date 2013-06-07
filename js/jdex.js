var $ = require("jquery");
var DOMParser = require('xmldom').DOMParser;

/*
------------------------------------
	JDEx Graph Format

//
// Predicates are assumed to take nodes as their subject and object.
// A predicate with objecttypes : ["string"] or "integer" or "number"... can be used as 
// a predicate in a property list
// a predicate with subjecttypes : ["node"] can be used in a node property list	
	
{
	name : "<string>",
	version : "<string>",
	format : "<string>",
	
	namespaces : {<namespace id> : {
								uri : <string>,
								prefix : <string>,
								properties : {<predicate id> : value}
							}
				},

	predicates : {<predicate id> : {
								name : <string>,
								identifier : <string>,
								namespace : <namespace id>,
								properties : {<predicate id> : value}
							}
				},
	
	nodeTypes : {<type id> : {
								name : <string>,
								identifier : <string>,
								namespace : <namespace id>,
								properties : {<predicate id> : value}
							}
				},
	
	nodes : { <node id> : {
							namespace : <namespace id>,
							identifier : <string>,
							type : <nodeType id>,
							properties : {<predicate id> : value}
						},
	
			},
	
	edges : {	<edge id> : {
						s : <node id>, 
						p : <predicate id>, 
						o : <node id>,
						properties : {<predicate id> : value}
				}
			},
			
	paths : { 	<path id> : {
						edges : [id, id, id...]
						properties : {<predicateId> : value}
						}
			},

// TODO: consider issues of hierarchical subnetworks
			
	subnetworks :
		{	<subnetwork id> : {
						nodes : [ <array of node ids>],
						edges : [<array of edge ids>],
						properties : {<predicateId> : <value>}
						layouts :
		},	

// TODO: layouts / graphic properties.		

	
}

------------------------------------
*/

module.Graph = function(){
	this.namespaces = {};
	this.maxNamespaceId = 0;
	this.namespacePrefixMap = {};
	
	this.terms = {};
	this.maxTermId = 0;
	
	this.nodeTypes = {};
	this.maxNodeTypeId = 0;
	
	this.nodes = {};
	this.maxNodeId = 0;
	
	this.edges = {};
	this.maxEdgeId = 0;
	
	this.nodeIdentifierMap = {};
	
	this.paths = {};
	
	this.subnetworks = {};

	this.citations = {};
	this.maxCitationId = 0;
	
	this.supports = {};
	this.maxSupportId = 0;
	
	this.properties = {};
};

module.Graph.prototype = {

	constructor : module.Graph,

//---------------Node Methods -------------------------------------------
	
	
	// id within the graph
	nodeById : function (id){
		return this.nodes[id];
	},
	
	// id across graphs 
	// (a given application is responsible for assigning unique identifiers
	// for nodes in the graphs that it loads)
	nodeByIdentifier : function(identifier){
		if (identifier) return this.nodeIdentifierMap[identifier];
		return false;
	},
	
	nodesByProperty : function(predicateIdentifier, value){
		var foundNodes = [];
		$.each(this.nodes, function(index, node){
			if (node.properties[predicateIdentifier] == value){
				foundNodes.push(node);
			}	
		});
		return foundNodes;
	},
	
	findOrCreateNodeByTerm : function(term, name){
		var node = this.nodeByIdentifier(term.identifier());
		if (node) return node;
		node = new module.Node(name, term);
		this.addNode(node)
		return node;
	},
	
	addNode : function (node){
		node.id = this.maxNodeId++;
		this.nodes[node.id] = node;
		if (node.represents) {
			this.nodeIdentifierMap[node.represents.identifier()] = node;
		} else {
			this.nodeIdentifierMap[node.name] = node;
		}
		node.graph = this;		
	},
	
	copyExternalNode : function (externalNode){
		var internalNode = this.nodeByIdentifier(externalNode.identifier);
		if (internalNode) return internalNode;
		internalNode = new module.Node();
		internalNode.identifier = externalNode.identifier;
		internalNode.type = externalNode.type;
		/*
		if (externalNode.properties.label){
			internalNode.properties.label = externalNode.properties.label;
		}
		
		$.each(externalNode.properties, function(predicate, value){
			internalNode.setLiteral(predicate, value);
		});
		*/
		this.addNode(internalNode);
		return internalNode;
	
	},

	getOutgoing : function(node){
		var outgoing = [];
		$.each(this.edges, function(index, edge){
			if(edge.from == node && outgoing.indexOf(edge) == -1){
				outgoing.push(edge);
			}
		});
		return outgoing;
	},
	
	getIncoming : function(node){
		var incoming = [];
		$.each(this.edges, function(index, edge){
			if(edge.to == node && incoming.indexOf(edge) == -1){
				incoming.push(edge);
			}
		});
		return incoming;
	},
	
	getEdges : function(node){
		var allEdges = [];
		$.each(this.edges, function(index, edge){
			if((edge.from == node || edge.to == node) && allEdges.indexOf(edge) == -1){
				allEdges.push(edge);
			}
		});
		return allEdges;
	},

	isSink : function(node){
		var isSink = true;
		$.each(this.edges, function(index, edge){
			if (node == edge.from){
				isSink = false;
				return;
			}
		});
		return isSink;
	},
	
	isSource : function(node){
		var isSource = true;
		$.each(this.edges, function(index, edge){
			if (node == edge.to){
				isSource = false;
				return;
			}
		});
		return isSource;
	},

//---------------Edge Methods -------------------------------------------
	
	addEdge : function (edge){
		edge.id = this.maxEdgeId++;
		this.edges[edge.id] = edge;
		edge.graph = this;
		return edge;
	},

	findEdge : function (subjectNode, predicate, objectNode){
		for (var i = 0; i < this.edges.length; i++){
			var edge = this.edges[i];
			if (subjectNode == edge.s && objectNode == edge.o && relationship == edge.p){
				
				return edge;
			}
		}
		return false;
	},
	
	findOrCreateEdge : function(subjectNode, predicate, objectNode){
		var edge = this.findEdge(subjectNode, predicate, objectNode);
		if (edge) return edge;
		edge = new module.Edge(subjectNode, predicate, objectNode);
		this.addEdge(edge);
		return edge;
	},
	
	copyExternalEdge : function(edge){
		var predicate = this.findOrCreateTerm(edge.p.identifier);
		var subjectNode = this.copyExternalNode(edge.s);
		var objectNode = this.copyExternalNode(edge.o);
		var internalEdge = this.findEdge(subjectNode, predicate, objectNode);
		if (internalEdge) return internalEdge;
		internalEdge = new module.Edge(subjectNode, predicate, objectNode);
		this.addEdge(internalEdge);
		return internalEdge;
	},

//---------------Term Methods -------------------------------------------
	
	termByNameAndNamespace : function (name, ns){
		if (ns){
			$.each(this.terms, function(index, term){
				if (term.ns && ns.id == term.ns.id && name == term.name){
					return term;
				}
			});
		} else {
			$.each(this.terms, function(index, term){
				if (!term.ns && name == term.name){
					return term;
				}
			});
		}
		console.log("term not found for " + name + " in " + ns.uri);		
		return false;
	},
	
	findOrCreateTerm : function (name, ns){
		var term = this.termByNameAndNamespace(name, ns);
		if (term) return term;
		term = new module.Term(name, ns);
		return this.addTerm(term);
	},

	functionTermByFunctionAndParameters : function (fn, parameters){
		$.each(this.terms, function(index, term){
			if (term.termFunction && fn == term.termFunction){
				if (term.parameters && term.parameters.length == parameters.length){
					var match = true;
					$.each(parameters, function(index, param){
						if (param != term.parameters[index]) match = false;
					});
					if (match) return term;	
				}		
			}
		});
		
		console.log("function term not found for function " + fn.identifier() + " and parameters TBD");		
		return false;
	},

	findOrCreateFunctionTerm : function (fn, parameters){
		var term = this.functionTermByFunctionAndParameters(fn, parameters);
		if (term) return term;
		term = new module.FunctionTerm(fn, parameters);
		return this.addTerm(term);
	},
	
	addTerm : function (term){
		term.id = this.maxTermId++;
		this.terms[term.id] = term;
		return term;
	},
	
//---------------Namespace Methods --------------------------------------

	namespaceByURI : function (uri){
		for (id in this.namespaces){
			if (uri == this.namespaces[id].uri){
				return this.namespaces[id];
			}
		}
		return false;
	},
	
	namespaceByPrefix : function (prefix){
		return this.namespacePrefixMap[prefix];
	},
	
	findOrCreateNamespace : function (uri, prefix){
		var ns = this.namespaceByURI(uri);
		if (ns) return ns;
		console.log("creating namespace for " + uri);
		ns = new module.Namespace(uri, prefix);
		return this.addNamespace(ns)
	},

	addNamespace : function (ns){
		ns.id = this.maxNamespaceId++;
		this.namespaces[ns.id] = ns;
		if (ns.prefix){
			this.namespacePrefixMap[ns.prefix] = ns;
		}
		return ns;
	},
		


//---------------Citation Methods ----------------------------------------

	addCitation : function (citation){
		citation.id = this.maxCitationId++;
		this.citations[citation.id] = citation;
		citation.graph = this;
		return citation;
	},
	

//---------------Suport Methods -----------------------------------------

	addSupport : function (support){
		support.id = this.maxSupportId++;
		this.supports[support.id] = support;
		support.graph = this;
		return support;
	},	

//---------------Whole Graph Methods -------------------------------------


	setProperty : function (predicate, value){
		this.properties[predicate.identifier()] = value;
	},
	
// TODO: other graph elements need to be copied
	
	addGraph : function (graph){
		var internalGraph = this;
		$.each(graph.nodes, function(index, node){
			internalGraph.copyExternalNode(node);	
		});
		
		$.each(graph.edges, function(index, edge){
			internalGraph.copyExternalEdge(edge);
		});
		
		return internalGraph;
	
	},
	
	mappedClone : function(){
		var originalGraph = this;
		var mappedGraph = new module.Graph();
		$.each(originalGraph.nodes, function(index, node){
			var mappedNode = mappedGraph.copyExternalNode(node);	
			mappedNode.mapsTo = node;
		});
		
		$.each(originalGraph.edges, function(index, edge){
			var mappedEdge = mappedGraph.copyExternalEdge(edge);
			mappedEdge.mapsTo = edge;
		});
		
		return mappedGraph;
	
	},
	
	getSinks : function(){
		var sinks = [];
		$.each(this.nodes, function(index, node){
			if (node.isSink()){
				sinks.push(node);
			}
		});
		return sinks;
	},

	getSources : function(){
		var sources = [];
		$.each(this.nodes, function(index, node){
			if (node.isSource(node)){
				sources.push(node);
			}
		});
		return sources;
	},
	
	serializeJDEx : function(){
		var s_nodes = {},
			s_namespaces = {},
			s_nodeTypes = {},
			s_edges = {},
			s_terms = {},
			s_properties = {},
			s_supports = {},
			s_citations = {};

		$.each(this.namespaces, function(index, ns){
			s_namespaces[index] = ns.serializeJDEx();
		});

		$.each(this.terms, function(index, term){
			s_terms[index] = term.serializeJDEx();
		});

		$.each(this.properties, function(identifier, value){
			s_properties[identifier] = value;
		});
									
		$.each(this.nodes, function(index, node){
			s_nodes[index] = node.serializeJDEx();
		});
		
		$.each(this.edges, function(index, edge){
			s_edges[index] = edge.serializeJDEx();
		});

		$.each(this.supports, function(index, support){
			s_supports[index] = support.serializeJDEx();
		});
		
		$.each(this.citations, function(index, citation){
			s_citations[index] = citation.serializeJDEx();
		});		
/*
		$.each(this.nodeTypes, function(index, nodeType){
			s_nodeTypes[index] = nodeType.serializeJDEx();
		});	

*/		
		return JSON.stringify({
				format: this.format, 
				nodes: s_nodes, 
				edges: s_edges, 
				namespaces: s_namespaces,
				terms: s_terms,
				nodeTypes: s_nodeTypes,
				properties : s_properties,
				citations : s_citations,
				supports : s_supports
				});
		}
};


/*
------------------------------------
	Node
------------------------------------
*/

module.Node = function(name, representedTerm){

	this.properties = {};
	this.id = id; 					// id within the graph
	this.name = name; 
	if (representedTerm){				
		this.represents = representedTerm;
	} 
	this.type = null;				// primary type of node
	
};

module.Node.prototype = {

	constructor : module.Node,
	
	serializeJDEx : function(){
		return { name: this.name, represents: this.represents.id};
	},
	
	getOutgoing : function(){
		return this.graph.getOutgoing(this);
	},
	
	getIncoming : function(){
		return this.graph.getIncoming(this);
	},
	
	getEdges : function(){
		return this.graph.getEdges(this);
	},
	
	getChildren : function(){
		var children = [];
		$.each(this.getOutgoing(), function(index, edge){
			if (children.indexOf(edge.o) == -1){
				children.push(edge.o);
			}
		});
		return children;
	},
	
	getParents : function(){
		var parents = [];
		$.each(this.getIncoming(), function(index, edge){
			var parent = edge.s;
			if (parents.indexOf(parent) == -1){
				parents.push(parent);
			}
		});
		return parents;
	
	},
	
	isSource : function(){
		return this.graph.isSource(this); 
	},
	
	isSink : function(){
		return this.graph.isSink(this); 
	},
		
};

/*
------------------------------------
	Edge
------------------------------------
*/

module.Edge = function(subject, predicate, object){
	console.log("creating edge with " + subject.name + " " + predicate.identifier() + " " + object.name);
	this.s = subject;
	this.o = object;
	this.p = predicate;
	this.properties = {};
	this.id = null;

};

module.Edge.prototype = {

	constructor : module.Edge,

	serializeJDEx : function(){
		return {s: this.s.id, p: this.p.id, o: this.o.id};
	},
	
	reverse : function(){
		var temp = this.s;
		this.s = this.o;
		this.o = temp;
	},
	
};


/*
------------------------------------
	Namespace
------------------------------------
*/

module.Namespace = function(uri, prefix){

	this.uri = uri;
	if (prefix){
		this.prefix = prefix;
	}
	this.properties = {};
	
};

module.Namespace.prototype = {

	constructor : module.Namespace,
	
	serializeJDEx : function(){
		if (this.prefix){
			return {uri: this.uri, prefix: this.prefix};
		} else {
			return {uri: this.uri};
		}
	
	}

};

/*
------------------------------------
	Term
------------------------------------
*/

module.Term = function(name, ns){

	if (name){
		this.name = name;
	}
	if (ns){
		console.log("creating term " + name + " in " + ns.uri);
		this.ns = ns;
	} else {
		console.log("creating term for " + name + " with no namespace");
	}
	
};

module.Term.prototype = {

	constructor : module.Term,
	
	serializeJDEx : function(){
		if (this.ns){
			return {name : this.name, namespace: this.ns.id};
		} else {
			return {name : this.name};
		}
	
	},
	
	identifier : function(){
		if (this.ns){
			if (this.ns.prefix){
				return this.ns.prefix + ":" + this.name;
			} else {
				return this.ns.uri + this.name;
			}
		} else {
			return this.name;
		}
	}

};

module.FunctionTerm = function(fn, parameters){

	console.log("creating function term using " + fn.name);
	
	this.termFunction = fn;
	this.parameters = parameters;	
};

module.FunctionTerm.prototype = {

	constructor : module.Term,
	
	serializeJDEx : function(){
		var params = {};
		$.each(this.parameters, function(key, value){
			if (typeof(value) == 'object'){
				params[key] = {term: value.id};
			} else { 
				params[key] = value;
			}
		});
		return {termFunction : this.termFunction.id, parameters: params};	
	},
	
	identifier : function(){
		var params =[];
		$.each(this.parameters, function(index, parameter){
			if (parameter.fn || parameter.name){
				params.push(parameter.identifier());
			} else { 
				params.push(parameter);
			}
		});
		return this.termFunction.identifier() + "(" + params.join(', ') + ")";
	}

};


/*
------------------------------------
	Citation
------------------------------------
*/

module.Citation = function(citationType, referenceIdentifier, bibliographicCitation, title){

	this.type = citationType;
	this.identifier = referenceIdentifier;
	this.properties = {};
	this.contributors = [];
	if (bibliographicCitation){
		this.citation = bibliographicCitation;
	}
	if (title){
		console.log("creating citation " + this.identifier + " titled " + title);
		this.title = title;
	}
	
};

module.Citation.prototype = {

	constructor : module.Citation,
	
	addContributor : function(contributor_name){
		this.contributors.push(contributor_name);
	},
	
	serializeJDEx : function(){
		var jdex = {identifier : this.identifier, type: this.type};
		if (this.title) jdex['title'] = this.title;
		if (this.citation) jdex['citation'] = this.citation;
		jdex['contributors'] = [];
		$.each(this.contributors, function(index, contributors){
			jdex.contributors.push(contributors);
		});
		return jdex;
	}

};


/*
------------------------------------
	Support
------------------------------------
*/

module.Support = function(text){

	this.text = text;
	console.log("creating Support: " + text);
	this.properties = {};
	
};

module.Support.prototype = {

	constructor : module.Support,
	
	serializeJDEx : function(){
		if (this.citation){
			return ({text: this.text, citation: this.citation.id});
		} else {
			return {text: this.text};	
		}
	}

};


/*
------------------------------------
	Translating from Other Formats
------------------------------------
*/

exports.createGraphFromSIF = function (data){
	var graph = new module.Graph();
	
	// data is assumed to be an array of lines
	$.each(data, function(index, line){
		var tokens = line.split("\t"),
			subjectIdentifier = tokens[0],
			predicateIdentifier = tokens[1],
			objectIdentifier = tokens[2];
		
		var predicate = graph.findOrCreateTerm(predicateIdentifier);
		var subjectNode = graph.findOrCreateNodeByIdentifier(subjectIdentifier);
		var objectNode = graph.findOrCreateNodeByIdentifier(objectIdentifier);
		graph.findOrCreateEdge(subjectNode, predicate, objectNode);
	
	});
}

exports.createGraphFromXBEL = function (xml_text){
	var graph = new module.Graph();
	var doc = new DOMParser().parseFromString(xml_text,'text/xml');
	
	// Process the header
	var header = doc.documentElement.getElementsByTagName('bel:header').item(0);
	module.processXBELHeader(graph, header);
	
	// Process the namespace group
	var namespaceGroup = doc.documentElement.getElementsByTagName('bel:namespaceGroup').item(0);
	module.processXBELNamespaceGroup(graph, namespaceGroup);
	
	// Process the annotation definition
	var annotationDefinitionGroup = doc.documentElement.getElementsByTagName('bel:annotationDefinitionGroup').item(0);
	module.processXBELAnnotationDefinitionGroup(graph, annotationDefinitionGroup);
		
	// Process the statementGroups
	
	$.each(doc.documentElement.childNodes, function(index, statementGroup){
		if (statementGroup.tagName == 'bel:statementGroup'){
			var context = {annotations: {}};
			module.processXBELStatementGroup(graph, statementGroup, context);
		}
	}); 
	
	return graph;
	
}	

/*

Header Example:

        <bel:name>BEL Framework Small Corpus Document</bel:name>
        <bel:description>Approximately 2000 hand curated statements drawn from 57 PubMeds</bel:description>
        <bel:version>1.2</bel:version>
        <bel:copyright>Copyright (c) 2011, Selventa. All Rights Reserved.</bel:copyright>
        <bel:contactInfo>support@belframework.org</bel:contactInfo>
        <bel:authorGroup>
            <bel:author>Selventa</bel:author>
        </bel:authorGroup>
        <bel:licenseGroup>
            <bel:license>Creative Commons Attribution-Non-Commercial-ShareAlike 3.0 Unported License</bel:license>
        </bel:licenseGroup>
        
        
               @values["title"] = title if title
        @values["authors"] = authors if authors  
        @values["version"] = version if version  
        @values["copyright"] = copyright if copyright
        @values["description"] = description if description
*/


module.processXBELHeader = function (graph, header){
	// Add DublinCore namespace
	var dc_namespace_uri = graph.findOrCreateNamespace("http://purl.org/dc/terms/", "DC");

	// Unary properties mapped from BEL to DC
	var Unary_Properties_XBEL_to_DC = {
			"bel:name" : {identifier : "DC:title", term : "title"},
			"bel:description" : {identifier : "DC:description", term : "description"},
			"bel:version" : {identifier : "DC:version", term : "version"},
			"bel:copyright" : {identifier : "DC:copyright", term : "copyright"}
			};
			
	$.each(Unary_Properties_XBEL_to_DC, function(tag, dc_info){
		// For each tag that we can translate, check to see
		// if it is set in the xbel header
		var elements = header.getElementsByTagName(tag);
		if (elements && elements.length > 0){
			var header_element = elements[0],
				value = header_element.textContent,
				predicate = graph.findOrCreateTerm(dc_info.term, dc_namespace_uri);
			console.log("adding graph property: " + predicate.identifier() + " : " + value);
			graph.setProperty(predicate, value);
		}
	
	});
}	

module.processXBELNamespaceGroup = function(graph, namespaceGroup){
	$.each(namespaceGroup.getElementsByTagName('bel:namespace'), function(index, ns_info){
		var uri = ns_info.getAttribute('bel:resourceLocation'),
			prefix =  ns_info.getAttribute('bel:prefix');
		graph.findOrCreateNamespace(uri, prefix);
	});
}

module.processXBELAnnotationDefinitionGroup = function(graph, AnnotationDefinitionGroup){
	$.each(AnnotationDefinitionGroup.getElementsByTagName('bel:externalAnnotationDefinition'), function(index, extDef_info){
		var uri = extDef_info.getAttribute('bel:url'),
			prefix =  extDef_info.getAttribute('bel:id'),
			belNS = graph.findOrCreateNamespace('http://resource.belframework.org/belframework/1.0/schema/', 'bel');
		graph.findOrCreateNamespace(uri, prefix);
		graph.findOrCreateTerm(prefix, belNS);
	});
}

module.processXBELStatementGroup = function(graph, statementGroup, context){
	console.log('\n----------------------\n');

	// process the annotation group		
	$.each(statementGroup.childNodes, function(index, element){
		if (element.tagName == 'bel:annotationGroup'){
			console.log("processing annotationGroup");
			module.processXBELAnnotationGroup(graph, element, context);
		}
	});

	// process statements, using the annotations
	$.each(statementGroup.childNodes, function(index, statement){
		if (statement.tagName == 'bel:statement'){
			module.processXBELStatement(graph, statement, context);
		}
	});
		
	// recurse into any statement groups	
	$.each(statementGroup.childNodes, function(index, innerGroup){
		if (innerGroup.tagName == 'bel:statementGroup'){
			var innerContext = {citation: context.citation, support: context.support, annotations:{}};
			$.each(context.annotations, function(index, value){
				innerContext[index] = value;
			});
			module.processXBELStatementGroup(graph, innerGroup, innerContext);
		}
	}); 

}

module.processXBELAnnotationGroup = function(graph, annotationGroup, context){
	$.each(annotationGroup.childNodes, function(index, element){
		if (element.tagName != undefined){
			
			if (element.tagName == 'bel:annotation'){
				var propertyName = element.getAttribute('bel:refID'),
					value = element.textContent,
					ns = graph.namespaceByPrefix(propertyName);
				
				console.log("processing annotation " + );	
				if (ns) {
					var valueTerm = graph.findOrCreateTerm(value, ns),
						propertyTerm = graph.termByNameAndNamespace(propertyName, belNS);
					context.annotations[propertyTerm.identifier()] = valueTerm;
					
				} else {
					console.log("did not find namespace for " + propertyName);
				}
			
			} else if (element.tagName == 'bel:citation'){
				console.log("processing citation");
				context.citation = module.processXBELCitation(graph, element);
				
			} else if (element.tagName == 'bel:evidence'){
				console.log("processing evidence");
				context.support = module.processXBELEvidence(graph, element, context.citation);
				
			} else {
				console.log("annotationGroup unknown tagname = " + element.tagName + " " + element.tagName.length);
			}
		}
	});
}

module.processXBELStatement = function(graph, statement, annotations, citation, support){
	console.log("processing statement");
	// get the BEL relationship namespace
	var belNS = graph.findOrCreateNamespace('http://resource.belframework.org/belframework/1.0/schema/', 'bel');
	
	// find or create the predicate	
	var relationshipName = statement.getAttribute('bel:relationship'),
		p = graph.findOrCreateTerm(relationshipName, belNS),
		s, o;
	
	$.each(statement.childNodes, function(index, nodeElement){
		if (nodeElement.tagName == 'bel:subject'){
			// find or create the subject node
			s = module.processXBELNodeElement(graph, nodeElement, belNS);
		} else if (nodeElement.tagName == 'bel:object') {
			// find or create the object node
			o = module.processXBELNodeElement(graph, nodeElement, belNS);
		}
	});
	// create the edge (because this is a BEL document, not a model, each statement creates a unique edge)
	var edge = new module.Edge(s, p, o);
	
	// if there is a citation, add the edge
	
	// if there is a support, add the edge
	
	// for each annotation, add it to the edge
	
	graph.addEdge(edge);
}

module.processXBELNodeElement = function(graph, nodeElement, belNS){

	var termElement = nodeElement.childNodes[1];
	
	// find or create the term function
	var functionName = termElement.getAttribute('bel:function'),
		fn = graph.findOrCreateTerm(functionName, belNS),
		parameters = [];
	

	$.each(termElement.childNodes, function (index, parameter){
		if (parameter.tagName == 'bel:parameter'){
			var nsPrefix = parameter.getAttribute('bel:ns')
				name = parameter.textContent,
				ns = graph.namespaceByPrefix(nsPrefix),
				term = graph.findOrCreateTerm(name, ns);
			parameters.push(term);	
		}
	});
	
	var term = graph.findOrCreateFunctionTerm(fn, parameters),
		node = graph.findOrCreateNodeByTerm(term, term.identifier());
		
	return node;
}

module.processXBELCitation = function(graph, citationElement){
	var title, bibliographicCitation, authorGroups, authorGroup, 
		citationType, referenceIdentifier; 
	// Get the type from the attribute
	citationType = citationElement.getAttribute('bel:type');
	
	// Get the reference identifier, if any
	var referenceElements = citationElement.getElementsByTagName('bel:reference');
	if (referenceElements) referenceIdentifier = referenceElements[0].textContent;
	
	// Get the bibliographic citation, if any
	
	// Get the title
	var nameElements = citationElement.getElementsByTagName('bel:name');
	if (nameElements) title = nameElements[0].textContent;
	
	// TODO - "find or create"
	var citation = new module.Citation(citationType, referenceIdentifier, bibliographicCitation, title);
	
	graph.addCitation(citation);
	
	// process the authors, if listed
	var authorGroups = citationElement.getElementsByTagName('bel:authorGroup');
	if (authorGroups){
		$.each(authorGroups[0].getElementsByTagName('bel:author'), function(index, authorElement){
			citation.addContributor(authorElement.textContent);
		});
	}
	
	return citation;

}

module.processXBELEvidence = function(graph, evidenceElement, citation){

	var text = evidenceElement.textContent;
	// TODO - "find or create"
	
	var support = new module.Support(text);
	
	
	if (citation){
		console.log("citation = " + citation.id + " for support");
		support.citation = citation;
	} else {
		console.log("citation = " + citation + " for support");
	}
	
	graph.addSupport(support);

	return support;
}


/*
exports.createGraphFromRDF = function (data){
	var graph = new module.Graph();
	
	// The data elements in the schema are sections and
	// attributes. 
	// The semantics of a section are controlled by its 'name'
	// property, essentially its type. 
	
	$(data).find('"rdf\\:rdf"').each(function(){
		// The namespaces are held in the attributes of the RDF element
		//graph.nsMap = $(this).xmlns();
		
		$(this).find('"rdf\\:description"').each(function(){
		
			// for each description element, find or create the subject node
			// based either on the about or nodeID attributes 
			var subjectIdentifier, subjectNode;
			
			if (subjectIdentifier = $(this).attr('rdf:about')){
			
				// rdf:about identifies a node corresponding to an external resource by its uri
				subjectNode = graph.findOrCreateNodeByIdentifier(subjectIdentifier);
				subjectNode.rdfURI = "<" + subjectIdentifier + ">";
				subjectNode.label = subjectIdentifier;
				
			} else if (subjectIdentifier = $(this).attr('rdf:nodeID')){
			
				// rdf:nodeId identifies a blank node in the graph
				subjectNode = graph.findOrCreateNodeByIdentifier(subjectIdentifier);
				subjectNode.rdfNodeId = "_:" + subjectIdentifier;
				subjectNode.label = subjectIdentifier;
			}
			
			// If we have successfully found / created the subject node,
			// we can then find the predicate and the object node
			if (subjectNode){
				$(this).find('*').each(function(){
					var tagName = $(this)[0].tagName;
					if (tagName == "rdf:type"){
						// treat type specially
						if (objectIdentifier = $(this).attr('rdf:resource')){
							subjectNode.type = objectIdentifier;
						}
					} else {
						var predicate = graph.findOrCreateTerm(tagName);
						var literalValue = $(this).text();
						var objectNode, objectIdentifier;
						if (literalValue){
						
							// if the element has a value, that is a literal value. 
							// We assign it to the node as a literalValue
							subjectNode.properties[tagName] = literalValue;
							
						} else {
							if (objectIdentifier = $(this).attr('rdf:nodeID')){
							
								// if the element has an rdf:nodeId attribute, 
								// that identifies a blank node in the graph
								objectNode = graph.findOrCreateNodeByIdentifier(objectIdentifier);
								objectNode.properties['rdfNodeId'] = "_:" + objectIdentifier;
								objectNode.properties['label'] = objectIdentifier;
								
							} else if (objectIdentifier = $(this).attr('rdf:resource')){
							
								// if the element has an rdf:resource attribute, 
								// that identifies an graph node by an external resource
								objectNode = graph.findOrCreateNodeByIdentifier(objectIdentifier);
								objectNode.properties['rdfURI'] = "<" + objectIdentifier + ">";
								objectNode.properties['label']  = objectIdentifier;
							}			
							// Now we can find or create the graph edge
							if (subjectNode && predicate && objectNode){
								graph.findOrCreateEdge(subjectNode, predicate, objectNode);
							}
						}
					}
				
				});
			
			}	
		
		});

	});
	
	return graph;
	
}

*/
