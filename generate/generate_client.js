/*
	Generate the client javascript library to access NDEx via the API
*/

var fs = require('fs');

// get the operations and entities
specs = require("./api_spec.js");

var sitePath = "../../site/";

// read in the base functions for API access
var lines = fs.readFileSync('./client_api_header.js').toString().split("\n");				

/*
	Pattern for creating the library:
	
	For method = POST
	
		var <fn> = function(<route_params>, json, callback){ 
			var merged_route = <merged route expression >;
			ndex_post(merged_route, route_params, callback);
		}
		
	For method = GET
		
		var <fn> = function(<route_params>, json, callback){ 
			var merged_route = <merged route expression >;
			ndex_get(<route>, <route_params>, query_params, callback);
		}

	For method = DELETE
		
		var <fn> = function(<route_params>, json, callback){ 
			var merged_route = <merged route expression >;
			ndex_get(<route>, <route_params>, query_params, callback);
		}
*/

/*
	"/networks/:networkId/edge"
	
	becomes
	
	"/networks/" + routeParams.networkId + "/edge"
*/

var makeRouteExpression = function(route){
	var components = route.split("/"),
		newComponents = ["'"];

	for(index = 1; index<components.length; index++){
		var component = components[index];
		//console.log(component);
			
		if (component.substring(0,1) == ":"){
			newComponents.push("/' + encodeURIComponent(" + component.substring(1) + ") + '");
		} else {
			newComponents.push("/" + component);
		}
	}
	newComponents.push("'");
	
	//console.log(newComponents.join(""));
	return newComponents.join("");
	
}

var makeArgsFromParams = function(params){
	var paramNames = [];
	for (index in params){
		paramNames.push(index);
	}

	if (paramNames.length > 0){
		return paramNames.join(", ") + ", ";
	} else {
		return "";
	}
}

var makeHashStringFromParams = function(params){
	var paramNames = [];
	for (index in params){
		paramNames.push(index + ": " + index);
	}

	if (paramNames.length > 0){
		return "{" + paramNames.join(", ") + "}, ";
	} else {
		return "{},";
	}
}

// create the library 
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
						
			var functionLine = null, 
				actionLine = null, 
				routeLine = "        var mergedRoute = " + makeRouteExpression(spec.route) + ";";
			
			console.log("method = " + spec.method);
				
			if (spec.method === "POST"){
			
				functionLine = "    exports." + spec.fn + " = function(" + makeArgsFromParams(spec.routeParams) + 
																makeArgsFromParams(spec.postData) +
																"callback, errorHandler){";
				actionLine = "        exports.ndexPost(mergedRoute, " + makeHashStringFromParams(spec.postData) + "callback, errorHandler);";
				
			} else if (spec.method === "GET"){
				var routeArgs = makeArgsFromParams(spec.routeParams),
					queryArgs = makeArgsFromParams(spec.queryParams),
					args = routeArgs + queryArgs;

				functionLine = "    exports." + spec.fn + " = function(" + routeArgs + queryArgs + "callback, errorHandler){";
				actionLine = "        exports.ndexGet(mergedRoute, " + makeHashStringFromParams(spec.queryParams) + "callback, errorHandler);";
	
			} else if (spec.method === "DELETE"){
			
				functionLine = "    exports." + spec.fn + " = function(" + makeArgsFromParams(spec.routeParams) + "callback, errorHandler){";
				actionLine = "        exports.ndexDelete(mergedRoute, callback, errorHandler);";

			} else {
				console.log("Error, no handler for method " + spec.method);
			}
			
			lines.push(functionLine);
			lines.push(routeLine);
			lines.push(actionLine);
			lines.push("    }");
			lines.push("");

		}
	}
}

// read in the code for the end of the file
var footerLines = fs.readFileSync('./client_api_footer.js').toString().split("\n");	

for (index in footerLines){
	lines.push(footerLines[index]);
}

// echo to the console
for (index in lines){
	console.log(lines[index]);
}
				
var clientContent = lines.join("\n");

var clientPath = sitePath + "js/ndexClient.js";

console.log("outputting to " + clientPath);

// write the file	
fs.writeFile(clientPath, clientContent, function(writeErr){
	if (writeErr){
		console.log("error writing file " + err.toString);
	} else {
		console.log("wrote file");
	}
});
