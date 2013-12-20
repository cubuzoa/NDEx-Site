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
    * Determines if the user has write-access to the group.
    ****************************************************************************/
    canEdit: function()
    {
        for (var groupIndex = 0; groupIndex < NdexWeb.ViewModel.User().groups().length; groupIndex++)
        {
            var group = NdexWeb.ViewModel.User().groups()[groupIndex];
            if (group.resourceId() === Group.ViewModel.Group().id() && group.permissions() != "READ")
                return true;
        }

        return false;
    },

    /****************************************************************************
    * Changes the member's permissions.
    ****************************************************************************/
    changeMemberPermissions: function(groupMember, event)
    {
        NdexWeb.post("/groups/" + Group.ViewModel.Group().id() + "/member",
            ko.mapping.toJS(groupMember),
            function()
            {
                $.gritter.add({ title: "Group Updated", text: groupMember.resourceName + "'s permissions have been changed." });
            });
    },

    /****************************************************************************
    * Loads the group.
    ****************************************************************************/
    loadGroup: function()
    {
        NdexWeb.get("/groups/" + Group.ViewModel.GroupId(),
            null,
            function (group)
            {
                group = ko.mapping.fromJS(group);
                Group.ViewModel.Group(group);
            });
    },

    /****************************************************************************
    * Removes a member from the group.
    ****************************************************************************/
    removeMember: function(groupMember, event)
    {
        NdexWeb.confirmAction("Are you sure you want to remove this member?", function()
        {
            NdexWeb.delete("/groups/" + Group.ViewModel.Group().id() + "/member/" + groupMember.resourceId(),
                function()
                {
                    $.gritter.add({ title: "Group Updated", text: groupMember.resourceName() + "'s permissions have been changed." });
                });
        });
    },

    /****************************************************************************
    * Updates the group.
    ****************************************************************************/
    updateGroup: function()
    {
        NdexWeb.post("/groups",
            ko.mapping.toJS(Group.ViewModel.Group()));
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
