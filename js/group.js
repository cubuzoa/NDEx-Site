var Group =
{
    ViewModel:
    {
        GroupId: ko.observable(),
        Group: ko.observable()
    },

    /****************************************************************************
    * Initialization.
    ****************************************************************************/
    _init: function()
    {
        ko.applyBindings(this.ViewModel, $("#divGroup")[0]);

        this.autoSelectTab();
        this.loadGroup();
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
    * Loads the group.
    ****************************************************************************/
    loadGroup: function()
    {
        NdexWeb.get("/groups/" + encodeURIComponent(Group.ViewModel.GroupId()),
            null,
            function (groupData)
            {
                groupData = ko.mapping.fromJS(groupData);
                Group.ViewModel.Group(groupData.group);
            });
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
   Group._init();
});
