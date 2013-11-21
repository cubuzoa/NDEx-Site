var WorkSurface =
{
    ViewModel:
    {
        Networks: ko.observableArray()
    },

    /****************************************************************************
    * Initialization.
    ****************************************************************************/
    _init: function()
    {
        if (NdexWeb.ViewModel.User())
            this.ViewModel.Networks(NdexWeb.ViewModel.User().WorkSurface());

        ko.applyBindings(this.ViewModel, $("#divSidebar")[0]);
        this.wireEvents();
    },

    /****************************************************************************
    * Adds a network to the work surface.
    ****************************************************************************/
    addNetwork: function()
    {
        NdexWeb.put("/users/" + encodeURIComponent(NdexWeb.ViewModel.User().Id) + "/work-surface",
            { networkid: this.Id() },
            function(workSurface)
            {
                var updatedNetworks = ko.mapping.fromJS(workSurface.networks);
                WorkSurface.ViewModel.Networks(updatedNetworks());
            });
    },

    /****************************************************************************
    * Compares two networks.
    ****************************************************************************/
    compareNetworks: function(viewModel, event)
    {
        var checkedNetworks = $("#divWorkSurface ul input:checked");
        if (checkedNetworks.length < 2)
        {
            $.gritter.add({ title: "Error", text: "Two networks must be selected." });
            return;
        }

        var clickedLink = (event.target.tagName.toLowerCase() === "a") ? $(event.target) : $(event.target).parent();
        clickedLink.attr("href",
            "/networks/" + encodeURIComponent(checkedNetworks[0].value)
          + "/compare/" + encodeURIComponent(checkedNetworks[1].value));
    },

    /****************************************************************************
    * Determines whether a network is on the Work Surface or not.
    ****************************************************************************/
    isOnWorkSurface: function(networkId)
    {
        for (var networkIndex = 0; networkIndex < WorkSurface.ViewModel.Networks().length; networkIndex++)
        {
            if (WorkSurface.ViewModel.Networks()[networkIndex].Id() == networkId)
                return true;
        }

        return false;
    },

    /****************************************************************************
    * Removes a network from the work surface.
    ****************************************************************************/
    removeNetwork: function()
    {
        NdexWeb.delete("/users/" + encodeURIComponent(NdexWeb.ViewModel.User().Id) + "/work-surface/" + encodeURIComponent(this.Id()),
            function(workSurface)
            {
                var updatedNetworks = ko.mapping.fromJS(workSurface.networks);
                WorkSurface.ViewModel.Networks(updatedNetworks());
            });
    },

    /****************************************************************************
    * Toggles display of the sidebar.
    ****************************************************************************/
    toggleSidebar: function()
    {
        if(parseInt($("#divSidebar").css("width")) > 0)
        {
            $("#divSidebar").css("width", 0);
            $("#btnSidebar").attr("class", "icon-chevron-left");
        }
        else
        {
            $("#divSidebar").css("width", "170px");
            $("#btnSidebar").attr("class", "icon-chevron-right");
        }
    },

    /****************************************************************************
    * Views a network.
    ****************************************************************************/
    viewNetwork: function(viewModel, event)
    {
        var checkedNetworks = $("#divWorkSurface ul input:checked");
        if (checkedNetworks.length < 1)
        {
            $.gritter.add({ title: "Error", text: "No network selected." });
            return;
        }

        var clickedLink = (event.target.tagName.toLowerCase() === "a") ? $(event.target) : $(event.target).parent();
        clickedLink.attr("href", "/networks/" + encodeURIComponent(checkedNetworks[0].value));
    },

    /****************************************************************************
    * Visualizes a network.
    ****************************************************************************/
    visualizeNetwork: function(viewModel, event)
    {
        var checkedNetworks = $("#divWorkSurface ul input:checked");
        if (checkedNetworks.length < 1)
        {
            $.gritter.add({ title: "Error", text: "No network selected." });
            return;
        }

        var clickedLink = (event.target.tagName.toLowerCase() === "a") ? $(event.target) : $(event.target).parent();
        clickedLink.attr("href", "/networks/" + encodeURIComponent(checkedNetworks[0].value) + "/visualize");
    },

    /****************************************************************************
    * Wires event-handlers to elements on the page.
    ****************************************************************************/
    wireEvents: function()
    {
        $("#divSidebar > a:first-child").click(this.toggleSidebar);
    }
};

$(document).ready(function()
{
   WorkSurface._init();
});