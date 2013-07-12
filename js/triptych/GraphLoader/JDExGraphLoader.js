
TRIPTYCH.JDExGraphLoader = function(){

	this.typeFilter = "none";

};

TRIPTYCH.JDExGraphLoader.prototype = new TRIPTYCH.GraphLoader();

TRIPTYCH.JDExGraphLoader.prototype.constructor = TRIPTYCH.BasicGraphLoader;

TRIPTYCH.JDExGraphLoader.prototype.load = function(jdex){
	var graph = new TRIPTYCH.Graph();

	$.each(jdex.nodes, function(index, jNode){
	
		node = new TRIPTYCH.Node(index);
		//node.type = type || "unknown";
		if (jNode.represents && jdex.terms[jNode.represents]){
			var term = jdex.terms[jNode.represents];
			node.label = term.name;
		} else {
			node.label = jNode.name
		}
		node.identifier = jNode.name;
		graph.addNode(node);
	
	});

	$.each(jdex.edges, function(index, jEdge){

		var fromNode = graph.nodeById(jEdge.s),
			toNode = graph.nodeById(jEdge.o),
			relTerm = jdex.terms[jEdge.p],
			relType = relTerm.name;
				
		if (fromNode && toNode){
						
			var rel = graph.findOrCreateRelationship(relType);
			
			var edge = graph.findEdge(fromNode, rel, toNode);
			
			if (!edge){
				edge = graph.addEdge(new TRIPTYCH.Edge(fromNode, rel, toNode));
				edge.edgeId = index;
			}
		}	
	});	
	
	return graph;
};

