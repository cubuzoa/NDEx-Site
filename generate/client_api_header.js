/*

ndexClient can be used either as an node.js module or as a client library

JQuery is passed to the closure as $.

Expected to be a global for the client, expected to be undefined and then required for node.js

*/



(function(exports, $){

	typeof $ === 'undefined'? $ = require('jQuery'): $;
	
	exports.host = "http://localhost:9999";
	
	exports.defaultNDExErrorHandler = function(data){
		console.log("Error : " + JSON.stringify(data));
		//alert("Error : " + JSON.stringify(data));
	}

	exports.ndexGet = function (route, queryArgs, callback, errorHandler){
		$.ajax({
			   type: "GET",
			   url: exports.host + route,
			   data: queryArgs,
			   dataType: "JSON",
			   success: callback,
			   error: errorHandler || exports.defaultNDExErrorHandler
		});
	}

	exports.ndexPost = function(route, postData, callback, errorHandler){
		$.ajax({
			   type: "POST",
			   url: exports.host + route,
			   data: postData,
			   dataType: "JSON",
			   success: callback,
			   error: errorHandler || exports.defaultNDExErrorHandler
		});
	}

	exports.ndexDelete = function(route, callback, errorHandler){
		$.ajax({
			   type: "DELETE",
			   url: exports.host + route,
			   success: callback,
			   error: errorHandler || exports.defaultNDExErrorHandler
		});
	}

