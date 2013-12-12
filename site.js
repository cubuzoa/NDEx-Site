var fs = require('fs');
var site_config_dir = '../config/';
var config = {};
var welcomeMessage = "<h2>NDEx Site Server</h2>";

if (fs.existsSync(site_config_dir + "site_config.json"))
{
    console.log("Found site_config.json, will take NDEx Site Configuration from that file.");

    var config_text = fs.readFileSync(site_config_dir + "site_config.json");
    config = JSON.parse(config_text);
}
else
    console.log("Using Default NDEx Site Configuration.");

console.log("NDEX Site Configuration: " + JSON.stringify(config));

if (fs.existsSync(site_config_dir + "welcomeMessage.html"))
{
    console.log("Found welcomeMessage.html, will replace default welcomeMessage");
    welcomeMessage = fs.readFileSync(site_config_dir + "welcomeMessage.html");
    console.log("Using Custom NDEx Site Welcome Message.\n" + welcomeMessage);
}
else
    console.log("Using Default NDEx Site Welcome Message.\n" + welcomeMessage);


//-----------------------------------------------------------
//
//	NDEx site.js uses the express.js framework
//
//-----------------------------------------------------------
var express = require("express");

var app = express();
var port = 9999;

/******************************************************************************
 * Configure Express.
 ******************************************************************************/

var dirnameElements = __dirname.split("/");
dirnameElements.pop()
var higherDirname = dirnameElements.join("/");

app.configure(function()
{
    app.use(express.static(__dirname + "/public"));
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    //Setup static directories
    app.use("/css", express.static(__dirname + "/css"));
    app.use("/img", express.static(__dirname + "/img"));
    app.use("/js", express.static(__dirname + "/js"));
    app.use(express.static(__dirname + "/public"));

    //Setup the folder to views and the view engine
    app.set("views", __dirname + "/views");
    app.set("view engine", "ejs");
});

/******************************************************************************
 * URL routing.
 ******************************************************************************/
app.get("/", function(httpRequest, httpResponse)
{
    httpResponse.render("home",
        {
            user: httpRequest.user,
            title: "Home",
            welcomeMessage: welcomeMessage
        });
});

app.get("/login", function(httpRequest, httpResponse)
{
    httpResponse.render("login", { user: httpRequest.user, title: "Login" });
});

app.get("/logout", function(httpRequest, httpResponse)
{
    httpRequest.logout();
    httpResponse.redirect("/");
});

app.get("/join", function(httpRequest, httpResponse)
{
    httpResponse.render("join", { title: "Join", user: httpRequest.user });
});

app.get("/search/:searchType", function(httpRequest, httpResponse)
{
    httpResponse.render("search", {
        title: "Search" + httpRequest.searchType,
        searchType: httpRequest.params["searchType"],
        user: httpRequest.user
    });
});

app.get("/showTasks", function(httpRequest, httpResponse)
{
    httpResponse.render("show_tasks", { title: "Tasks", user: httpRequest.user });
});

app.get("/uploadNetwork", function(httpRequest, httpResponse)
{
    httpResponse.render("upload_network", { title: "Upload Network", user: httpRequest.user });
});

app.get("/policies", function(httpRequest, httpResponse)
{
    httpResponse.render("policy", { title: "Policies", user: httpRequest.user });
});

app.get("/contact", function(httpRequest, httpResponse)
{
    httpResponse.render("contact", { title: "Contact Information", user: httpRequest.user });
});

app.get("/about", function(httpRequest, httpResponse)
{
    httpResponse.render("about", { title: "About NDEx", user: httpRequest.user });
});

app.get("/feedback", function(httpRequest, httpResponse)
{
    httpResponse.render("feedback", { title: "Feedback", user: httpRequest.user });
});

app.get("/network/:networkId/triptych", function(httpRequest, httpResponse)
{
    httpResponse.render("triptych", {
        title: "Checking Triptych Graphic Requirements",
        networkId: httpRequest.params["networkId"],
        user: httpRequest.user
    });
});

app.get("/network/:networkId/triptychView", function(httpRequest, httpResponse)
{
    var useCanvas = httpRequest.query["useCanvas"] || 'no';
    httpResponse.render("triptychView", {
        title: "Testing Triptych",
        canvas: httpRequest.query["canvas"],
        webGL: httpRequest.query["webGL"],
        useCanvas: useCanvas,
        networkId: httpRequest.params["networkId"],
        user: httpRequest.user
    });
});

app.get("/user/:userId", function(httpRequest, httpResponse)
{
    httpResponse.render("user",
        {
            title: "User",
            userId: httpRequest.params["userId"],
            user: httpRequest.user
        });
});

app.get("/group/:groupId", function(httpRequest, httpResponse)
{
    httpResponse.render("group",
        {
            title: "Group",
            groupId: httpRequest.params["groupId"],
            user: httpRequest.user
        });
});

app.get("/network/:networkId", function(httpRequest, httpResponse)
{
    httpResponse.render("network",
        {
            title: "Network",
            networkId: httpRequest.params["networkId"],
            user: httpRequest.user
        });
});

app.get("/network/:networkId/visualize", function(httpRequest, httpResponse)
{
    httpResponse.render("cyjs_visualize_network",
        {
            title: "Network",
            networkId: httpRequest.params["networkId"],
            user: httpRequest.user
        });
});

app.get("/network/:network1Id/compare/:network2Id", function(httpRequest, httpResponse)
{
    httpResponse.render("triptych_compare_networks",
        {
            title: "Network",
            network1Id: httpRequest.params["network1Id"],
            network2Id: httpRequest.params["network2Id"],
            user: httpRequest.user
        });
});

app.get("/newGroup", function(httpRequest, httpResponse)
{
    httpResponse.render("create_group", { title: "New Group", user: httpRequest.user });
});

app.get("/sendRequest", function(httpRequest, httpResponse)
{
    httpResponse.render("request", { title: "Send Request", user: httpRequest.user });
});

app.get("/newTask", function(httpRequest, httpResponse)
{
    httpResponse.render("new_task", { title: "New Task", user: httpRequest.user });
});

app.get("/editProfile", function(httpRequest, httpResponse)
{
    httpResponse.render("edit_profile", { title: "Edit Profile", user: httpRequest.user });
});

app.get("/editGroupProfile/:groupId", function(httpRequest, httpResponse)
{
    httpResponse.render("edit_group_profile",
        {
            title: "Edit Group Profile",
            user: httpRequest.user,
            groupId: httpRequest.params["groupId"]
        });
});

app.get("/editAgent", function(httpRequest, httpResponse)
{
    httpResponse.render("edit_agent", { title: "Edit Agent", user: httpRequest.user });
});

app.get("/editNetworkMetadata/:networkId", function(httpRequest, httpResponse)
{
    httpResponse.render("edit_network_metadata",
        {
            title: "Edit Network Metadata",
            user: httpRequest.user,
            networkId: httpRequest.params["networkId"]
        });
});

/******************************************************************************
 * Start the web site.
 ******************************************************************************/
app.listen(port);
console.log("NDEx Site server listening on port " + port + "...");
