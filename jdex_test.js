var jdex = require("./js/jdex.js");
var fs = require('fs');
var $ = require("jquery");
var DOMParser = require('xmldom').DOMParser;

//var sif_data = fs.readFileSync('./pc_sif_1.txt').toString().split("\n");	

//var sif_graph = jdex.createGraphFromSIF(sif_data);

//console.log(sif_graph.serializeJDEx());

//var xml_text = fs.readFileSync('./xbel_test.xbel.xml').toString();

var xml_text = fs.readFileSync('./small_corpus.xbel.xml').toString();

var graph = jdex.createGraphFromXBEL(xml_text);
               
//console.log(graph.serializeJDEx());

/*
fs.writeFile("/tmp/test", "Hey there!", function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
}); 
*/

//fs.writeFile('./xbel_test.json', graph.serializeJDEx());

fs.writeFile('./small_corput.json', graph.serializeJDEx());

console.log("done");