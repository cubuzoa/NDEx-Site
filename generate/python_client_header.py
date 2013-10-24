import requests

baseRoute = "http://localhost:3333"

def setBaseRoute (route)
    baseRoute = route

guest = {username: 'guest', password: 'guestpassword'}

def get = function(route, params, user, callback, debug){
    url = baseRoute + route
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

    requests.get(url,
            url: url,
            qs: qs,
            auth: auth,
            json: true
        },
        callback
        );
}

def post = function(route, params, user, debug){
    url = baseRoute + route,
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
    requests.post({
            method: 'POST',
            url: url,
            auth: auth,
            json: json
        )

    )
}

def delete  = function(route, user, debug){

    url = baseRoute + route
    auth =  {
            username: user.username,
            password: user.password,
            sendImmediately: true
        } ;

    if (debug){
        console.log("making DELETE request to " + url);
        console.log("auth params: " + JSON.stringify(auth));
    }

    requests.post ({
            method: 'DELETE',
            url: url,
            auth: auth
        })
}