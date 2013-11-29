var SearchResults = [];
var NetworkSearch =
{
    ViewModel:
    {
        Networks: ko.observable(),
        SearchString: ko.observable(),
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
    postNetworkSearch: function(pageNumber)
    {
        console.log("doing postNetworkSearch '" + NetworkSearch.ViewModel.SearchString() + "'");
        var skip =  Math.max(pageNumber - 1, 0);
        NdexWeb.post(
            "/networks/search",
            {
                searchString : NetworkSearch.ViewModel.SearchString(),
                limit: NetworkSearch.ViewModel.PageSize(),
                skip: skip
            },
            function(networkSearchResult)
            {
                var page =  networkSearchResult.skip + 1;
                console.log("Got page " + page + " with " + networkSearchResult.networks.length + " networks");
                NetworkSearch.ViewModel.PageIndex(page);
                NetworkSearch.ViewModel.Networks(networkSearchResult.networks);
            });
    },

    firstPageSearch: function()
    {
        NetworkSearch.postNetworkSearch(1);
    },

    nextPageSearch: function()
    {
        NetworkSearch.postNetworkSearch(NetworkSearch.ViewModel.PageIndex() + 1);
    },

    previousPageSearch: function()
    {
        NetworkSearch.postNetworkSearch(NetworkSearch.ViewModel.PageIndex() - 1);
    },

    resultsVisible: function()
    {
       if  (NetworkSearch.ViewModel.Networks() && NetworkSearch.ViewModel.Networks().length > 0) {
            return true;
        }
        return false;
    },

    previousVisible: function()
    {
        console.log("PageIndex() = " + NetworkSearch.ViewModel.PageIndex() + " is a " + typeof NetworkSearch.ViewModel.PageIndex() );
        if  (NetworkSearch.ViewModel.PageIndex()  > 1) {
            return true;
        }

        return false;
    },

    nextVisible: function()
    {
        console.log("PageSize() = " + NetworkSearch.ViewModel.PageSize() + " is a " + typeof NetworkSearch.ViewModel.PageSize() );
        console.log("Networks() = " + NetworkSearch.ViewModel.Networks() + " is a " + typeof NetworkSearch.ViewModel.Networks() );
        if  (NetworkSearch.ViewModel.Networks()) {
            if (NetworkSearch.ViewModel.Networks().length < NetworkSearch.ViewModel.PageSize()){
                console.log("There are " + NetworkSearch.ViewModel.Networks().length + " networks which is less than page size");
                return false;
            } else {
                console.log("There are " + NetworkSearch.ViewModel.Networks().length + " networks");
                return true;
            }
        }

        return false
    },
    /****************************************************************************
     * Wires event-handlers to elements on the page.
     ****************************************************************************/
    wireEvents: function()
    {
        $("#btnSearch").click({ handler: this.firstPageSearch });
        $("#btnPrev").click({ handler: this.previousPageSearch });
        $("#btnNext").click({ handler: this.nextPageSearch });
    }
};

$(document).ready(function()
{
    NetworkSearch._init();
});

