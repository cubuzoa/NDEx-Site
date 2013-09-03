/*

 ndexClient can be used either as an node.js module or as a client library

 JQuery is passed to the closure as $.

 Expected to be a global for the client, expected to be undefined and then required for node.js

 */


(function (exports) {

    if (typeof($) === 'undefined') {
        console.log("requiring jQuery");
        $ = require('jQuery');
    }

    exports.host = "http://localhost:3333";

    exports.guest = {username: 'guest', password: 'guestpassword'}

    function currentCredentials() {
        if (typeof(localStorage) != 'undefined' && localStorage) {
            if (localStorage.password, localStorage.username) {
                return {password: localStorage.ndexPassword, username: localStorage.ndexUsername};
            } else {
                return exports.guest;
            }
        }
        return exports.guest;

    }

    function encodedCredentials(){
        var credentials = currentCredentials();
        return btoa(credentials.username + ":" + credentials.password);
    }


    exports.defaultNDExErrorHandler = function (data) {
        console.log("Error : " + JSON.stringify(data));
        //alert("Error : " + JSON.stringify(data));
    }

    exports.ndexGet = function (route, queryArgs, callback, errorHandler) {

        $.ajax({
            type: "GET",
            /*
             password: credentials.password,
             username: credentials.username,
             xhrFields: {
             withCredentials: true
             },
             */
            beforeSend: function(xhr){
                xhr.setRequestHeader("Authorization", "Basic " + encodedCredentials());
            },
            url: exports.host + route,
            data: queryArgs,
            dataType: "JSON",
            success: callback,
            error: errorHandler || exports.defaultNDExErrorHandler
        });
    }

    exports.ndexPost = function (route, postData, callback, errorHandler) {
        $.ajax({
            type: "POST",
/*
            password: credentials.password,
            username: credentials.username,
            xhrFields: {
                withCredentials: true
            },
*/
            beforeSend: function(xhr){
                xhr.setRequestHeader("Authorization", "Basic " + encodedCredentials());
            },
            url: exports.host + route,
            data: postData,
            dataType: "JSON",
            success: callback,
            error: errorHandler || exports.defaultNDExErrorHandler
        });
    }

    exports.ndexDelete = function (route, callback, errorHandler) {
        $.ajax({
            type: "DELETE",
            /*
             password: credentials.password,
             username: credentials.username,
             xhrFields: {
             withCredentials: true
             },
             */
            beforeSend: function(xhr){
                xhr.setRequestHeader("Authorization", "Basic " + encodedCredentials());
            },
            url: exports.host + route,
            success: callback,
            error: errorHandler || exports.defaultNDExErrorHandler
        });
    }

