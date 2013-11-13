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

for (n in specs.resourceTypes)
{
    resourceType = specs.resourceTypes[n];
    console.log(resourceType);
    lines.push("var " + resourceType + " = require('./routes/" + resourceType + ".js');");
}


// create the handlers
for (n in specs.resourceTypes)
{
    resourceType = specs.resourceTypes[n];
    resourceSpecs = specs[resourceType];
    for (i in resourceSpecs)
    {
        var spec = resourceSpecs[i];
        if (spec.status === "active")
        {
            if (spec.doc)
            {
                lines.push("");
                lines.push("// " + spec.doc);
            }
            var arguments = [];
            var argumentLines = [];
            var ridCheckLines = [];
            var handleJIDParam = function (param)
            {
                if (param.type && param.type == "JID")
                {
                    argumentLines.push("    if(!common.checkJID(" + n + ")) res.send(400, { error: 'bad JID : ' + " + n + "});");

                    argumentLines.push("    " + n + " = convertToRID(" + n + ");");
                    ridCheckLines.push("            { rid: " + n + " , objectClass: '" + param.class + "'},");
                }
            };

            for (n in spec.routeParams)
            {
                arguments.push(n);
                argumentLines.push("    var " + n + " = req.params['" + n + "'];");
                var param = spec.routeParams[n];
                //handleJIDParam(param);
            }
            for (n in spec.queryParams)
            {
                arguments.push(n);
                argumentLines.push("    var " + n + " = req.query['" + n + "'];");
                var param = spec.queryParams[n];
                var defaultVal = param.default;
                var type = param.type;
                if (defaultVal === undefined)
                {
                    argumentLines.push("    if(" + n + " === undefined){res.send(400, { error: 'value for " + n + " is required' })};");
                }
                else
                {
                    if (type == "string")
                    {
                        defaultVal = "'" + defaultVal + "'";
                    }
                    argumentLines.push("    " + n + " = " + n + " || " + defaultVal + ";");
                }
                //handleJIDParam(param);

            }
            for (n in spec.postData)
            {
                arguments.push(n);
                argumentLines.push("    var " + n + " = req.body['" + n + "'];");
                var param = spec.postData[n];
                //handleJIDParam(param);
            }

            for (n in spec.files)
            {
                var fileArg = "file_" + n;
                arguments.push(fileArg);
                argumentLines.push("    var " + fileArg + " = req.files['" + n + "'];");
                if (spec.maxsize)
                {
                    argumentLines.push("     if (" + fileArg + ".size > " + spec.maxsize + "){res.send(400, { error: 'file size too large, max allowed = " + spec.maxsize + "' });");
                }
            }

            var argumentString = "";
            if (arguments.length > 0)
            {
                argumentString = arguments.join(", ") + ", ";
            }

            var responseModifierLines = [];
            responseModifierLines.push("          if(status && status == 200){");
            for (n in spec.response)
            {
                var responseParams = spec.response[n];
                if (responseParams.type && responseParams.type == "JID")
                {
                    responseModifierLines.push("            data." + n + " = convertFromRID(data." + n + ");");
                }
            }
            responseModifierLines.push("          }");

            var authenticator = ", passport.authenticate('basic', { session: false }) ";

            lines = lines.concat(

                [
                    "app." + spec.method.toLowerCase() + "('" + spec.route + "'" + authenticator + ", function(req, res) {",
                    "  try {",
                ],

                argumentLines,

                [
                    "    common.ridCheck(",
                    "      ["
                ],

                ridCheckLines,

                [
                    "      ], ",
                    "      res,",
                    "      function(){",
                    "        " + resourceType + "." + spec.fn + "(" + argumentString + "function(data){",
                    "            var status = data.status || 200;"
                ],

                responseModifierLines,

                [
                    "            res.send(status, data);",
                    "",
                    "        }) // close the route function",
                    "",
                    "      } // close the ridCheck callback",
                    "",
                    "    ); // close the ridCheck",
                    "",
                    "  // now catch random errors",
                    "  }",
                    "  catch (e){",
                    "          console.log('error in handler for " + spec.fn + " : ' + e); ",
                    "          res.send(500, {error : 'error in handler for " + spec.fn + " : ' + e}); ",
                    "  }",

                    "}); // close handler"
                ]);
        }
    }
}


var connect_to_db_lines = [
    "var server = new orientdb.Server(serverConfig);",
    "var db = new orientdb.GraphDb(ndexDatabaseName, server, dbConfig); ",
    "db.open(function(err) {  ",
    "    if (err)  throw err; ",
    "console.log('Successfully connected to OrientDB');",
    "routes.init(db, function(err) {if (err) {throw err;}});"
];

lines = lines.concat(connect_to_db_lines);

// init the resource types

lines.push("common.init(db, function(err) {if (err) {throw err;}});");
for (n in specs.resourceTypes)
{
    resourceType = specs.resourceTypes[n];
    lines.push("	" + resourceType + ".init(db, function(err) {if (err) {throw err;}});");
}

// close off the initialization
lines.push("});");


// add the footer, including the call to run the server
var footer_lines = fs.readFileSync('./rest_footer.js').toString().split("\n");

lines = lines.concat(footer_lines);

// echo to the console
for (index in lines)
{
    console.log(lines[index]);
}

var restContent = lines.join("\n");

var restPath = restPath + "rest.js";
console.log("outputting to " + restPath);

// write the file	
fs.writeFile(restPath, restContent, function (writeErr)
{
    if (writeErr)
    {
        console.log("error writing file " + err.toString);
    }
    else
    {
        console.log("wrote file");
    }
});
