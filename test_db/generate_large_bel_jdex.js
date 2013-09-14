/*

Create a large BEL network that reflects an approximation of typical network structure

Hypothesis: start with the large corpus and add simulated transcriptional control experiments

controllers: nodes causally upstream of r(x) nodes, separated by species

rna nodes:   all r(x) nodes in large corpus, separated by species

OR - get all human, rat, mouse symbols

For each species,

Randomly create statement groups in which one controller affects between 40 and 1000 rna nodes

Create a fake support and citation for each statement group

keep creating these until total edge count > 1M



 */

if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

var startingFile = process.argv[2];

var jdex = require("../js/jdex.js");

jdex.Graph.prototype.addFakeCitation

var network = jdex.loadJDEX(file);



// Fake citation

function addFakeCitation(network){

}





// Fake support

