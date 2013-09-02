var request = require('request'),
    assert = require('assert'),
    should = require('should');

var baseRoute = "http://localhost:3333"

exports.setBaseRoute = function(route) {
    baseRoute = route;
}

exports.guest = {username: 'guest', password: 'guestpassword'}

exports.get = function(route, params, user, callback, debug){
    var url = baseRoute + route,
        qs =  params || {},
        auth =  {
            username: user.username,
            password: user.password,
            sendImmediately: true
        } ;

    if (debug){
        console.log("making GET request to " + url);
        console.log("query string params: " + JSON.stringify(qs));
        console.log("auth params: " + JSON.stringify(auth));
    }

    request({
            method : 'GET',
            url: url,
            qs: qs,
            auth: auth,
            json: true
        },
        callback
        );
}

exports.post = function(route, params, user, callback, debug){
    var url = baseRoute + route,
        json =  params || {},
        auth =  {
            username: user.username,
            password: user.password,
            sendImmediately: true
        } ;

    if (debug){
        console.log("making POST request to " + url);
        console.log("post data params: " + JSON.stringify(json));
        console.log("auth params: " + JSON.stringify(auth));
    }
    request({
            method: 'POST',
            url: url,
            auth: auth,
            json: json
        },
        callback
    );
}

exports.delete  = function(route, user, callback, debug){

    var url = baseRoute + route,
        auth =  {
            username: user.username,
            password: user.password,
            sendImmediately: true
        } ;

    if (debug){
        console.log("making DELETE request to " + url);
        console.log("auth params: " + JSON.stringify(auth));
    }

    request({
            method: 'DELETE',
            url: url,
            auth: auth
        },
        callback
    );
}