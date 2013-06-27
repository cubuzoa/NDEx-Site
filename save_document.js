var orientdb = require('orientdb');

var dbConfig = {
	user_name: 'admin',
	user_password: 'admin'
};

var serverConfig = {
	host: 'localhost',
	port: 2424
};


var server = new orientdb.Server(serverConfig);
var db = new orientdb.GraphDb('ndex', server, dbConfig);


var name1 = "IIIIIIIIIIIIIII",
    name2 = "OOOOOOOOOOOOOOO",
    clazz = "xNetwork";
/*
var document = {
    "@class": "xNetwork",
    name: "bob",
    nodes: [ {"@class":"xNode", "@type":"d", name: "fred" } ]
};
*/

var document = {
	"@class":"xNetwork",
	"@type":"d",
	"namespaces":[],
	"terms":[
		{"@type":"d","@class":"xBaseTerm","id":"0","name":"REACTS_WITH"},
		{"@type":"d","@class":"xBaseTerm","id":"1","name":"COMPONENT_OF"},
		{"@type":"d","@class":"xBaseTerm","id":"2","name":"IN_SAME_COMPONENT"}
		],
	"properties":[],
	"nodes":[
		{"@type":"d","@class":"xNode","id":"0","name":"http://identifiers.org/uniprot/P51587"},
		{"@type":"d","@class":"xNode","id":"1","name":"http://identifiers.org/uniprot/Q06609"},
		{"@type":"d","@class":"xNode","id":"2","name":"http://biopax.org/generated/group/1564220789"},
		{"@type":"d","@class":"xNode","id":"3","name":"http://biopax.org/generated/group/1584958623"},
		{"@type":"d","@class":"xNode","id":"4","name":"http://biopax.org/generated/group/1508169272"},
		{"@type":"d","@class":"xNode","id":"5","name":"http://identifiers.org/uniprot/P27694"},
		{"@type":"d","@class":"xNode","id":"6","name":"http://identifiers.org/uniprot/P43351"},
		{"@type":"d","@class":"xNode","id":"7","name":"http://biopax.org/generated/group/1432795275"},
		{"@type":"d","@class":"xNode","id":"8","name":"http://identifiers.org/uniprot/P35244"},
		{"@type":"d","@class":"xNode","id":"9","name":"http://biopax.org/generated/group/1548852886"},
		{"@type":"d","@class":"xNode","id":"10","name":"http://identifiers.org/uniprot/P15927"}
		]
	};

/*
var document = {
    "@class": clazz,
    name: name1,
    birthday: new Date(),
    fingers: 20,
    //fav_binary_number: binary_data,
    like_it: true,
    linked_to: "#4:0",
    last_time_in: { name: "Turin", when: new Date() },
    known_os_list: [ "linux" ],
    zero_is: null
};
*/

db.open(function(err, result) {



    // save the first version of the document
    db.cascadingSave(document, function(err, doc) {

        console.log("Saved document: " + JSON.stringify(doc));

    });
    
    
});
