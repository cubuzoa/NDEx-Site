/*

Create the rest.js script, generating the REST API handlers from the API specification

Read the header and footer files for the script

Read the API specification as a JSON document

Generate the javascript to implement the server side of the API

Output the merged result as rest.js

*/

var fs = require('fs');

//var argv = require('optimist').demand(['d']).argv;

// get the operations and entities
specs = require("./api_spec.js");

//console.log(specs.basic);

//eyes.inspect(oe.operations);

var restPath = "../";
var testPath = "../";

var lines = fs.readFileSync('./rest_header.js').toString().split("\n");				

for (n in specs.resourceTypes){
	resourceType = specs.resourceTypes[n];
	console.log(resourceType);
	lines.push("var " + resourceType + " = require('./routes/" + resourceType + ".js');");
}

function indentedLine(string, indentLevel){
    var indentString = "  ";
    var outputString = string;
    for(i = 0; i < indentLevel; i++){
        outputString = indentString + outputString;
    }
    return outputString;
}

function ndexJavaLines(spec, parameters, indent){
    var lines = [];
    if (spec.method == "POST" || spec.method == "DELETE" ){
        lines.push(indentedLine("var postData = {", indent));
    } else if (spec.method == "GET"){
        lines.push(indentedLine("var queryArgs = {", indent));
    } else {
        throw new Error("Unknown request method " + spec.method);
    }

    for (key in parameters ){
       var val = parameters[key];
       lines.push(indentedLine(key + " : " + val + ",", indent+1));
    }
    lines.push(indentedLine("};", indent));

    // Now format the ajax query
/*
 common.ndexPost(module.dbHost, "ndexUpdateUserProfile/" + module.dbName, module.dbUser, module.dbPassword, postData,
 function (result) {
 callback({status: 200, profile: profile});
 },
 function (err) {callback({error: JSON.stringify(err), status: (err.status)?err.status:500});});
 */
    if (spec.method == "POST" || spec.method == "DELETE" ){
        lines.push(indentedLine("common.ndexPost(dbHost, '" + spec.ndexjava + "/' + dbName, dbUser, dbPassword, postData,", indent));
        lines.push(indentedLine("function (result) { res.send(200, result); },", indent+1));
        lines.push(indentedLine("function (err) {res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}", indent+1));
        lines.push(indentedLine(");", indent));
    } else if (spec.method == "GET"){
        lines.push(indentedLine("common.ndexGet(dbHost, '" + spec.ndexjava + "/' + dbName, dbUser, dbPassword, queryArgs,", indent));
        lines.push(indentedLine("function (result) { res.send(200, result); },", indent+1));
        lines.push(indentedLine("function (err) { res.send((err.status)?err.status:500, {error: JSON.stringify(err)} )}", indent+1));
        lines.push(indentedLine(");", indent));
    }

    return lines;
}

/*

The handlers in rest.js communicate to the ndex-java module using "JID" format ids.

These ids are translated and, as necessary, checked vs. the database within ndex-java

 */
for (n in specs.resourceTypes){
	resourceType = specs.resourceTypes[n];
	resourceSpecs = specs[resourceType];
	for (i in resourceSpecs){
		var spec = resourceSpecs[i];
		if (spec.status === "active"){
			if (spec.doc){
				lines.push("");
				lines.push("// " + spec.doc);
			}
			var arguments = [];
			var errorCheckLines = [];
            var parameters = {};
			
			for (n in spec.routeParams){
				arguments.push(n);
				//argumentLines.push("    var " + n + " = req.params['" + n + "'];");
				var param = spec.routeParams[n];
				parameters[n] = "req.params['" + n + "']";
			}
			for (n in spec.queryParams){
				arguments.push(n);
				//argumentLines.push("    var " + n + " = req.query['" + n + "'];");
				var param = spec.queryParams[n];
                parameters[n] = "req.query['" + n + "']";
				var defaultVal = param.default;
				var type = param.type;
				if (defaultVal === undefined){
					errorCheckLines.push(indentedLine("if(queryArgs[" + n + "] === undefined){res.send(400, { error: 'value for " + n + " is required' })};", 2));
				} else {
					if (type == "string"){
						defaultVal = "'" + defaultVal + "'";
					}
                    errorCheckLines.push(indentedLine("queryArgs[" + n + "] = queryArgs[" + n + "] || " + defaultVal + ";", 2));
				}
				
			}
			for (n in spec.postData){
				arguments.push(n);
				//argumentLines.push("    var " + n + " = req.body['" + n + "'];");
				var param = spec.postData[n];
                parameters[n] = "req.body['" + n + "']";
			}
      /*
			for (n in spec.files){
                var fileArg = "file_" + n;
				arguments.push(fileArg);
				argumentLines.push("    var " + fileArg + " = req.files['" + n + "'];");
				if(spec.maxsize){
					argumentLines.push("     if (" + fileArg + ".size > " + spec.maxsize + "){res.send(400, { error: 'file size too large, max allowed = " + spec.maxsize + "' });");
				}
			}
	*/

			var authenticator = ", passport.authenticate('basic', { session: false }) ";
			
			lines = lines.concat(
								
						[
						"app." + spec.method.toLowerCase() + "('" + spec.route + "'" + authenticator + ", function(req, res) {",
						indentedLine("try {", 1)
						],

                        errorCheckLines,
						
						ndexJavaLines(spec, parameters, 2),
						[
						indentedLine("}", 1),
						indentedLine("catch (e){", 1),
                        indentedLine("console.log('error in handler for " + spec.fn + " : ' + e); ", 2),
                        indentedLine("res.send(500, {error : 'error in handler for " + spec.fn + " : ' + e}); ", 2),
                        indentedLine("}", 1),
						"});",
						]);
		}
	}
}

/*
var connect_to_db_lines = [
    "var server = new orientdb.Server(serverConfig);",
    "var db = new orientdb.GraphDb(ndexDatabaseName, server, dbConfig); ",
    "db.open(function(err) {  ",
    "    if (err)  throw err; ",
    "    console.log('Successfully connected to OrientDB');",
    "  });"
    //"routes.init(db, function(err) {if (err) {throw err;}});"
    ];


lines = lines.concat(connect_to_db_lines);
 */
/*
// init the resource types

lines.push("common.init(db, function(err) {if (err) {throw err;}});");
for (n in specs.resourceTypes){
	resourceType = specs.resourceTypes[n];
	lines.push("	" + resourceType + ".init(db, function(err) {if (err) {throw err;}});");
}


// close off the initialization
lines.push("});");

 */

// add the footer, including the call to run the server
var footer_lines = fs.readFileSync('./rest_footer.js').toString().split("\n");

lines = lines.concat(footer_lines);

// echo to the console
for (index in lines){
	console.log(lines[index]);
}
				
var restContent = lines.join("\n");

var restPath = restPath + "rest2.js";
console.log("outputting to " + restPath);

// write the file	
fs.writeFile(restPath, restContent, function(writeErr){
	if (writeErr){
		console.log("error writing file " + err.toString);
	} else {
		console.log("wrote file");
	}
});
