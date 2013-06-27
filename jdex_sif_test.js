var jdex = require("./js/jdex.js");
var fs = require('fs');
var $ = require("jquery");
var DOMParser = require('xmldom').DOMParser;

var sif_data = fs.readFileSync('./pc_sif_1.txt').toString().split("\n");	

var sif_graph = jdex.createGraphFromSIF(sif_data);

//console.log(sif_graph.serializeJDEx());

fs.writeFile('./sif_test.json', sif_graph.serializeJDEx());

console.log("done");