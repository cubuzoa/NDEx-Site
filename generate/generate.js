//eyes = require('eyes');

var fs = require('fs');

//var argv = require('optimist').demand(['d']).argv;

// get the operations and entities
specs = require("./api_spec.js");

//console.log(specs.basic);

//eyes.inspect(oe.operations);

var restPath = "../";
var testPath = "../";

var lines = fs.readFileSync('./generate_header.js').toString().split("\n");				

for (n in specs.resourceTypes){
	resourceType = specs.resourceTypes[n];
	console.log(resourceType);
	lines.push("var " + resourceType + " = require('./routes/" + resourceType + ".js');");
}

// create the handlers
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
			var argumentLines = [];
			for (n in spec.routeParams){
				arguments.push(n);
				argumentLines.push("    var " + n + " = req.params['" + n + "'];");
			}
			for (n in spec.queryParams){
				arguments.push(n);
				argumentLines.push("    var " + n + " = req.query['" + n + "'];");
				var defaultVal = spec.queryParams[n].default;
				var type = spec.queryParams[n].type;
				if (defaultVal === undefined){
					argumentLines.push("    if(" + n + " === undefined){res.send(500, { error: 'value for " + n + " is required' });");
				} else {
					if (type == "string"){
						defaultVal = "'" + defaultVal + "'";
					}
					argumentLines.push("    " + n + " = " + n + " || " + defaultVal + ";");
				}
				
			}
			for (n in spec.postData){
				arguments.push(n);
				argumentLines.push("    var " + n + " = req.body['" + n + "'];");
			}
			
			var argumentString = "";
			if (arguments.length > 0){
				argumentString = arguments.join(", ") + ", ";
			}
			
			lines = lines.concat([	
						"app." + spec.method.toLowerCase() + "('" + spec.route + "', function(req, res) {"],
					
						argumentLines,
					
						[
						"	try {",
						"		" + resourceType + "." + spec.fn + "(" + argumentString + "function(result){",
						"			var status = result.status || 200;",
						"			res.send(status, result);",
						"		});",
						"	}",
						"	catch (e){",
						"		res.send(500, {error : e}); ",
						"	}",
						"});"
						]);
		}
	}
}

var connect_to_db_lines = fs.readFileSync('./generate_connect_to_db.js').toString().split("\n");

lines = lines.concat(connect_to_db_lines);

// init the resource types
for (n in specs.resourceTypes){
	resourceType = specs.resourceTypes[n];
	lines.push("	" + resourceType + ".init(db, function(err) {if (err) {throw err;}});");
}

lines.push("});");
lines.push("");
lines.push("app.listen(port);");
lines.push("console.log('REST server listening on port ' + port + '...');");

// echo to the console
for (index in lines){
	console.log(lines[index]);
}
				
var serverContent = lines.join("\n");

var serverPath = restPath + "rest.js";
console.log("outputting to " + serverPath);

// write the file	
fs.writeFile(serverPath, serverContent, function(writeErr){
	if (writeErr){
		console.log("error writing file " + err.toString);
	} else {
		console.log("wrote file");
	}
});
