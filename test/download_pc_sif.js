/*
	This script uses the Pathway Commons REST API to find 
	networks and then download them in SIF format
	
*/

// http://www.pathwaycommons.org/pc/webservice.do?cmd=get_record_by_cpath_id&version=3.0&q=96460,496994&output=binary_sif&output_id_type=BIOPAX

var $ = require("jquery");
var request = require('request');
var DOMParser = require('xmldom').DOMParser;
var jdex = require("../js/jdex.js");
var fs = require('fs');

var pc_service_base_url = "http://www.pathwaycommons.org/pc/webservice.do?";

function makeSIFurl(identifiers){
	return pc_service_base_url + "cmd=get_record_by_cpath_id&version=3.0&q=" + identifiers + "&output=binary_sif&output_id_type=CPATH_ID";
}

function makeGetPathwaysURL(identifiers){
	return pc_service_base_url + "cmd=get_pathways&version=2.0&q=" + identifiers + "&input_id_type=GENE_SYMBOL";
}

function makeSIFNameURL(pathIds){
	var identifiers = pathIds.join(",");
	//console.log(identifiers);
	return pc_service_base_url + "cmd=get_record_by_cpath_id&version=3.0&q=" + identifiers + "&output=biopax";
}

function getUniqueCPathIds(lines){
	var ids = [];
	for (i=1; i < lines.length; i++){
		var tokens = lines[i].split("\t")
			subject = tokens[0],
			object = tokens[2];
		if (isValidCpathId(subject) && isValidCpathId(object)){
		
    		if($.inArray(subject, ids) === -1) ids.push(subject);
			if($.inArray(object, ids) === -1) ids.push(object);
		} else {
			console.log("problem with SIF line: " + lines[i]);
		}	
	}	
	return ids;
}

function isValidCpathId(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function getSIF(line){
	var items = line.split("\t"),
		pathwayCpathId = items[3],
		pathwaySource = items[2],
		pathwayName = items[1],
		url = makeSIFurl(pathwayCpathId);
	// for each record returned, we get the CPATH_ID and retrieve the result as SIF
	request(url, function (err, res, sif){
		var lines = sif.split("\n"),
			cpathIds = getUniqueCPathIds(lines);

		getSIFWithNames(cpathIds, pathwayCpathId, lines, pathwayName, pathwaySource, function(graph){
		
			console.log(graph.toJDEx());
			var filename = pathwaySource + "." + pathwayName + "." + pathwayCpathId + ".jdex";
			filename = filename.replace("/", " ");
			console.log("writing file : " + filename);
			fs.writeFileSync("./test_networks/pc_sif/" + filename, graph.serializeJDEx());
		});		
	});
}

function getSIFWithNames(cpathIds, pathwayCpathId, lines, pathwayName, pathwaySource, callback){
	var url = makeSIFNameURL(cpathIds);
	console.log(url);
	request(url, function(err, res, body){
		//console.log(body);
		graph = new jdex.Graph();
		var cpathIdToName = parseBioPAXElements(body);
		console.log("cpathIdToName:" + JSON.stringify(cpathIdToName));
		graph.name = pathwayName;
		graph.properties.source = pathwaySource;
		graph.properties.title = pathwaySource + ":" + pathwayName;
		graph.format = "PC SIF";
		
		for (i=1; i < lines.length; i++){
			var line = lines[i];
			if (line.trim().length != 0){
				var tokens = lines[i].split("\t"),
					subjectCpathId = tokens[0],
					predicateIdentifier = tokens[1],
					objectCpathId = tokens[2],
					subjectName = cpathIdToName[subjectCpathId],
					objectName = cpathIdToName[objectCpathId];
		
				var predicate = graph.findOrCreateTerm(predicateIdentifier);
			
				var subjectTerm = graph.findOrCreateTerm(subjectName);
				var subjectNode = graph.findOrCreateNodeByIdentifier(subjectCpathId);
				subjectNode.represents = subjectTerm;
			
				var objectTerm = graph.findOrCreateTerm(objectName);
				var objectNode = graph.findOrCreateNodeByIdentifier(objectCpathId);
				objectNode.represents = objectTerm;
			
				graph.findOrCreateEdge(subjectNode, predicate, objectNode);
			}
		}
	
		callback(graph);
	});	
}


// parse the xml to get to the elements that correspond to the cpathIds

// we are looking for NAME or SHORT-NAME elements
// and we are looking for the CPATH id that we can get out of the elements rdf:ID
// we create a hash of the cpathId to the name
// then we output the original SIF, substituting names
		
function parseBioPAXElements(xml_text){
	
	var cpathIdToName = {};
	var doc = new DOMParser().parseFromString(xml_text,'text/xml');
	
	$.each(doc.documentElement.childNodes, function(index, element){
		if (element.tagName != undefined){
			console.log("tag = " + element.tagName);
			var rdfId = element.getAttribute('rdf:ID');
			if (rdfId){
				var components = rdfId.split('-'),
				prefix = components[0],
				cpathId = components[1],
				name, shortName;
				$.each(element.childNodes, function(i, item){
					if (item.tagName == "bp:NAME"){
						name = item.textContent;
					} else if (item.tagName == "bp:SHORT-NAME"){
						shortName = item.textContent;
					}
				});
				
				cpathIdToName[cpathId] = shortName || name;
			}
		}
	}); 
	
	return cpathIdToName;
}	


// Search for networks containing the identifiers, get results as tab-delimited, 4 column:
// 
// Database Pathway_Name Pathway_Database_Name CPATH_ID
//

console.log(makeGetPathwaysURL("RBL2"));

request( makeGetPathwaysURL("RBL2"), function (err, res, body) {
    if (err){
    	console.log("error = " + err);
    } else {
    	if (res.statusCode == 200){
    
			var lines = body.split("\n");
		
			for (i = 1; i < lines.length; i++){
			//for (i = 1; i < 2; i++){
				// (note that we skip the first line since it just has the headers.
				getSIF(lines[i]);
			}
    
    	} else {
    		console.log("status = " + res.statusCode);
    	}
    }
});