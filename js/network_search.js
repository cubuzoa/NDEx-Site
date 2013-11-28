var SearchResults = [];
var NetworkSearch =
{
    ViewModel:
    {
        Networks: ko.observable(),
        SearchString: ko.observable("r"),
        PageIndex: ko.observable(1),
        PageSize: ko.observable(15)
    },

    /****************************************************************************
     * Initialization.
     ****************************************************************************/
    _init: function()
    {
        ko.applyBindings(NetworkSearch.ViewModel, $("#divNetworks")[0]);
        ko.applyBindings(NetworkSearch.ViewModel, $("#divSearch")[0]);

        this.wireEvents();
    },

    /****************************************************************************
     * Posts a network search, returns an array of networks
     ****************************************************************************/
    postNetworkSearch: function()
    {
        console.log("doing postNetworkSearch '" + NetworkSearch.ViewModel.SearchString() + "'");
        NdexWeb.post(
            "/networks/search",
            {
                searchString : NetworkSearch.ViewModel.SearchString(),
                limit: NetworkSearch.ViewModel.PageSize(),
                skip: NetworkSearch.ViewModel.PageIndex() - 1
            },
            function(networks)
            {
                console.log("search results: " + networks);
                SearchResults = networks;
                //networks = ko.mapping.fromJS(networks);
                NetworkSearch.ViewModel.Networks(networks);
            });
    },

    /****************************************************************************
     * Wires event-handlers to elements on the page.
     ****************************************************************************/
    wireEvents: function()
    {
        console.log("view model: " + NetworkSearch.ViewModel);
        $("#btnSearch").click({ handler: this.postNetworkSearch });
    }
};

$(document).ready(function()
{
    NetworkSearch._init();
});

