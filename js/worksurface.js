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
        ko.applyBindings(this.ViewModel, $("#divSidebar")[0]);
        this.loadWorkSurface();
        this.wireEvents();
    },

    /****************************************************************************
    * Adds a network to the work surface.
    ****************************************************************************/
    addNetwork: function()
    {
        ndexClient.addNetworkToUserWorkSurface(NdexWeb.ViewModel.User().jId,
            this.jid(),
            function (workSurface)
            {
                if (workSurface.networks)
                {
                    var updatedNetworks = ko.mapping.fromJS(workSurface.networks);
                    WorkSurface.ViewModel.Networks(updatedNetworks());
                    //TODO: Change the button for add to work surface to remove from work surface
                }
            });
    },

    /****************************************************************************
    * Compares two networks.
    ****************************************************************************/
    compareNetworks: function()
    {
        if ($("#divTools input:checked").length < 2)
        {
            $.gritter.add({ title: "Error", text: "Two networks must be selected." });
            return;
        }

        $(this).attr("href", "/network/" + $("#divTools input:checked")[0].value + "/compare/" + $("#divTools input:checked")[1].value);
    },

    /****************************************************************************
    * Determines whether a network is on the Work Surface or not.
    ****************************************************************************/
    isOnWorkSurface: function(networkId)
    {
        for (var networkIndex = 0; networkIndex < WorkSurface.ViewModel.Networks().length; networkIndex++)
        {
            if (WorkSurface.ViewModel.Networks()[networkIndex].jid() == networkId)
                return true;
        }

        return false;
    },

    /****************************************************************************
    * Loads the user's Work Surface.
    ****************************************************************************/
    loadWorkSurface: function()
    {
        ndexClient.getUserWorkSurface(NdexWeb.ViewModel.User().jId,
            function(workSurface)
            {
                if (workSurface.networks)
                {
                    var updatedNetworks = ko.mapping.fromJS(workSurface.networks);
                    WorkSurface.ViewModel.Networks(updatedNetworks());
                    //TODO: Change the button for add to work surface to remove from work surface
                }
            });
    },

    /****************************************************************************
    * Removes a network from the work surface.
    ****************************************************************************/
    removeNetwork: function()
    {
        ndexClient.deleteNetworkFromUserWorkSurface(NdexWeb.ViewModel.User().jId,
            this.jid(),
            function (workSurface)
            {
                if (workSurface.networks)
                {
                    var updatedNetworks = ko.mapping.fromJS(workSurface.networks);
                    WorkSurface.ViewModel.Networks(updatedNetworks());
                    //TODO: Change the button for add to work surface to remove from work surface
                }
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
    viewNetwork: function()
    {
        if ($("#divTools input:checked").length < 1)
        {
            $.gritter.add({ title: "Error", text: "No network selected." });
            return;
        }

        $(this).attr("href", "/network/" + $("#divTools input:checked").val());
    },

    /****************************************************************************
    * Visualizes a network.
    ****************************************************************************/
    visualizeNetwork: function()
    {
        if ($("#divTools input:checked").length < 1)
        {
            $.gritter.add({ title: "Error", text: "No network selected." });
            return;
        }

        $(this).attr("href", "/network/" + $("#divTools input:checked").val() + "/visualize");
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