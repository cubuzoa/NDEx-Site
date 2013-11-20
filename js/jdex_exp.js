/*

exports.test = function(x){ 
	return x + 2;
}

*/

var jdex = require("./jdex.js");
var fs = require('fs');
//var $ = require("jquery");
//var DOMParser = require('xmldom').DOMParser;

// pc_sif_1.txt
// PD_map_130712

exports.loadSIFString = function(filename){
	return fs.readFileSync('./networks/' + filename + '.txt').toString();
}

exports.loadSIF = function(filename){
	return jdex.createGraphFromSIF(exports.loadSIFString(filename).split("\n"));
}

exports.loadXBELString = function(filename){
	return fs.readFileSync('./networks/' + filename + '.xbel').toString();
}

exports.loadXBEL = function(filename){
    var xml_text =  exports.loadXBELString(filename);
    var doc = $.parseXML(xml_text);

    return jdex.createGraphFromXBEL(doc);
}

exports.writeJDEx = function(graph, filename){
	fs.writeFile('./' + filename + '.jdex', graph.serializeJDEx());
	console.log("done");
}

