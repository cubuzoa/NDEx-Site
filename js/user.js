//TODO: Update notifications div to use bootstrap collapse css
//TODO: Work on modal css
//TODO: Update href relative urls for networks
var User =
{
    ViewModel:
    {
        UserId: ko.observable(),
        User: ko.observable()
    },

    /****************************************************************************
    * Initialization.
    ****************************************************************************/
    _init: function()
    {
        ko.applyBindings(this.ViewModel, $("#divUser")[0]);

        this.autoSelectTab();
        this.loadUser();
        this.wireEvents();
    },

    /****************************************************************************
    * Auto-selects the tab based on the hash of the browser location.
    * Additionally adds some logic to ensure the tab stays selected on reload.
    ****************************************************************************/
    autoSelectTab: function()
    {
        //TODO: Test this - does it work?
        var selectedTab = document.location.hash;

        if (selectedTab)
            $("ul.nav-tabs a[href='" + selectedTab.replace("#", "#div") + "']").tab("show");

        $(".nav-tabs a").on("shown", function(e)
        {
            window.location.hash = e.target.hash.replace("#", "#" + prefix);
        });
    },

    /****************************************************************************
    * Loads the user's information.
    ****************************************************************************/
    loadUser: function()
    {
        NdexWeb.get("/users/" + encodeURIComponent(User.ViewModel.UserId()),
            null,
            function (userData)
            {
                userData = ko.mapping.fromJS(userData);
                User.ViewModel.User(userData.user);
            });
    },

    /****************************************************************************
    * Requests group access.
    ****************************************************************************/
    requestGroupAccess: function()
    {
        //TODO:
    },

    /****************************************************************************
    * Requests network access.
    ****************************************************************************/
    requestNetworkAccess: function()
    {
        //TODO:
    },

    /****************************************************************************
    * Wires event-handlers to elements on the page.
    ****************************************************************************/
    wireEvents: function()
    {
    }
};

$(document).ready(function()
{
    User._init();
});