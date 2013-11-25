var express = require("express");
var passport = require("passport");
var orientdb = require("orientdb");

var dbConfig =
{
    user_name: "admin",
    user_password: "admin"
};

var serverConfig =
{
    host: "localhost",
    port: 2424
};

var server = new orientdb.Server(serverConfig);

var app = express();
var port = 9999;

/******************************************************************************
* Configure Express.
******************************************************************************/
app.configure(function ()
{
    app.use(express.static(__dirname + "/public"));
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    //Setup static directories
    app.use("/css", express.static(__dirname + "/css"));
    app.use("/img", express.static(__dirname + "/img"));
    app.use("/account_img", express.static(__dirname + "/account_img"));
    app.use("/js", express.static(__dirname + "/js"));
    app.use(express.static(__dirname + "/public"));

    //Setup the folder to views and the view engine
    app.set("views", __dirname + "/views");
    app.set("view engine", "ejs");
});

/******************************************************************************
* URL routing.
******************************************************************************/
app.get("/", function (httpRequest, httpResponse)
{
    httpResponse.render("home", { user: httpRequest.user, title: "Home" });
});

app.get("/login", function (httpRequest, httpResponse)
{
    httpResponse.render("login", { user: httpRequest.user, title: "Login" });
});

app.get("/logout", function (httpRequest, httpResponse)
{
    httpRequest.logout();
    httpResponse.redirect("/");
});

app.get("/join", function (httpRequest, httpResponse)
{
    httpResponse.render("join", { title: "Join", user: httpRequest.user });
});

app.get("/searchNetworks", function (httpRequest, httpResponse)
{
    httpResponse.render("search_networks", { title: "Networks", user: httpRequest.user });
});

app.get("/searchUsers", function (httpRequest, httpResponse)
{
    httpResponse.render("search_users", { title: "Users", user: httpRequest.user });
});

app.get("/searchGroups", function (httpRequest, httpResponse)
{
    httpResponse.render("search_groups", { title: "Groups", user: httpRequest.user });
});

app.get("/showTasks", function (httpRequest, httpResponse)
{
    httpResponse.render("show_tasks", { title: "Tasks", user: httpRequest.user });
});

app.get("/uploadNetwork", function (httpRequest, httpResponse)
{
    httpResponse.render("upload_network", { title: "Upload Network", user: httpRequest.user });
});

app.get("/policies", function (httpRequest, httpResponse)
{
    httpResponse.render("policy", { title: "Policies", user: httpRequest.user });
});

app.get("/contact", function (httpRequest, httpResponse)
{
    httpResponse.render("contact", { title: "Contact Information", user: httpRequest.user });
});

app.get("/about", function (httpRequest, httpResponse)
{
    httpResponse.render("about", { title: "About NDEx", user: httpRequest.user });
});

app.get("/feedback", function (httpRequest, httpResponse)
{
    httpResponse.render("feedback", { title: "Feedback", user: httpRequest.user });
});

app.get("/user/:userId", function (httpRequest, httpResponse)
{
    httpResponse.render("user",
    {
        title: "User",
        userId: httpRequest.params["userId"],
        user: httpRequest.user
    });
});

app.get("/group/:groupId", function (httpRequest, httpResponse)
{
    httpResponse.render("group",
    {
        title: "Group",
        groupId: httpRequest.params["groupId"],
        user: httpRequest.user
    });
});

app.get("/network/:networkId", function (httpRequest, httpResponse)
{
    httpResponse.render("network",
    {
        title: "Network",
        networkId: httpRequest.params["networkId"],
        user: httpRequest.user
    });
});

app.get("/network/:networkId/visualize", function (httpRequest, httpResponse)
{
    httpResponse.render("cyjs_visualize_network",
    {
        title: "Network",
        networkId: httpRequest.params["networkId"],
        user: httpRequest.user
    });
});

app.get("/network/:network1Id/compare/:network2Id", function (httpRequest, httpResponse)
{
    httpResponse.render("triptych_compare_networks",
    {
        title: "Network",
        network1Id: httpRequest.params["network1Id"],
        network2Id: httpRequest.params["network2Id"],
        user: httpRequest.user
    });
});

app.get("/newGroup", function (httpRequest, httpResponse)
{
    httpResponse.render("create_group", { title: "New Group", user: httpRequest.user });
});

app.get("/sendRequest", function (httpRequest, httpResponse)
{
    httpResponse.render("request", { title: "Send Request", user: httpRequest.user });
});

app.get("/newTask", function (httpRequest, httpResponse)
{
    httpResponse.render("new_task", { title: "New Task", user: httpRequest.user });
});

app.get("/editProfile", function (httpRequest, httpResponse)
{
    httpResponse.render("edit_profile", { title: "Edit Profile", user: httpRequest.user });
});

app.get("/editGroupProfile/:groupId", function (httpRequest, httpResponse)
{
    httpResponse.render("edit_group_profile",
    {
        title: "Edit Group Profile",
        user: httpRequest.user,
        groupId: httpRequest.params["groupId"]
    });
});

app.get("/editAgent", function (httpRequest, httpResponse)
{
    httpResponse.render("edit_agent", { title: "Edit Agent", user: httpRequest.user });
});

app.get("/editNetworkMetadata/:networkId", function (httpRequest, httpResponse)
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
