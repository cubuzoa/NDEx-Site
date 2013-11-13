/*

Create HTML REST API Doc:

Read the API specification as a JSON document

Generate the HTML markup for the API - tabular format similar to JavaDOC

Output the result as rest_wiki.txt

*/

var fs = require('fs');

specs = require("./api_spec.js");

var outputPath = "../public/ndex_api_spec.html";

var lines = [
    "<html>",
    "<head></head>",
    "<body>"];

// document the API operations
for (n in specs.resourceTypes){
	resourceType = specs.resourceTypes[n];
	lines.push("");
    lines.push("<table>");
    lines.push("");
	lines.push("###" + resourceType);
	resourceSpecs = specs[resourceType];
	for (i in resourceSpecs){
		var spec = resourceSpecs[i];
		if (true || spec.status === "active"){
			lines.push("");
			lines.push("##### " + spec.fn);
			if (spec.doc){
				lines.push("_" + spec.doc + "_");
				lines.push("");
			}
			
			lines.push(spec.method.toUpperCase() + " " + spec.route);
			lines.push("");
			
			if (spec.routeParams){
                lines.push("");
				lines.push("Route Parameters:");
				for (n in spec.routeParams){
					var param = spec.routeParams[n];
					lines.push("* " + n + " (" + param.type + ")");
				}
			}
			
			if (spec.queryParams){
                lines.push("");
				lines.push("Query Parameters:");
				for (n in spec.queryParams){
					var param = spec.queryParams[n];
					var defaultVal = spec.queryParams[n].default;
					lines.push("* " + n + " (" + param.type + ")");
				}
			}
			
			if (spec.postData){
                lines.push("");
				lines.push("Post Data Parameters:");
				for (n in spec.postData){
					var param = spec.postData[n];
					var defaultVal = spec.postData[n].default;
					lines.push("* " + n + " (" + param.type + ")");
				}
			}

            if (spec.exceptions){
                lines.push("");
                lines.push("Exceptions:");
                for (n in spec.exceptions){
                    var exception = spec.exceptions[n];
                    lines.push("* " + exception);
                }
            }

		}
	}
}

// echo to the console
for (index in lines){
	console.log(lines[index]);
}
				
var htmlContent = lines.join("\n");

console.log("outputting to " + outputPath);

// write the file	
fs.writeFile(outputPath, htmlContent, function(writeErr){
	if (writeErr){
		console.log("error writing file " + err.toString);
	} else {
		console.log("wrote file");
	}
});
