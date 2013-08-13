/*

Create the site.js script

Right now, this is trivial, we may later dispense with this step

*/

var fs = require('fs');

var sitePath = "../";
var testPath = "../";

var lines = fs.readFileSync('./site_header.js').toString().split("\n");				

var connect_to_db_lines = fs.readFileSync('./generate_connect_to_db.js').toString().split("\n");

lines = lines.concat(connect_to_db_lines);

// close off the initialization
lines.push("});");


// add the footer, including the call to run the server
var footer_lines = fs.readFileSync('./site_footer.js').toString().split("\n");

lines = lines.concat(footer_lines);

// echo to the console
for (index in lines){
	console.log(lines[index]);
}
				
var siteContent = lines.join("\n");

var sitePath = sitePath + "site.js";
console.log("outputting to " + sitePath);

// write the file	
fs.writeFile(sitePath, siteContent, function(writeErr){
	if (writeErr){
		console.log("error writing file " + err.toString);
	} else {
		console.log("wrote file");
	}
});
