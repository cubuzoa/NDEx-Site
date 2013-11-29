var SearchResults = [];
var GroupSearch =
{
    ViewModel:
    {
        Groups: ko.observable(),
        SearchString: ko.observable(),
        PageIndex: ko.observable(1),
        PageSize: ko.observable(15)
    },

    /****************************************************************************
     * Initialization.
     ****************************************************************************/
    _init: function()
    {
        ko.applyBindings(GroupSearch.ViewModel, $("#divGroups")[0]);
        ko.applyBindings(GroupSearch.ViewModel, $("#divSearch")[0]);

        this.wireEvents();
    },

    /****************************************************************************
     * Posts a Group search, returns an array of Groups
     ****************************************************************************/

    postGroupSearch: function(pageNumber)
    {
        console.log("doing postGroupSearch '" + GroupSearch.ViewModel.SearchString() + "'");
        var skip =  Math.max(pageNumber - 1, 0);
        NdexWeb.post(
            "/groups/search",
            {
                searchString : GroupSearch.ViewModel.SearchString(),
                limit: GroupSearch.ViewModel.PageSize(),
                skip: skip
            },
            function(groupSearchResult)
            {
                var page =  groupSearchResult.skip + 1;
                console.log("Got page " + page + " with " + groupSearchResult.groups.length + " groups");
                GroupSearch.ViewModel.PageIndex(page);
                GroupSearch.ViewModel.Groups(groupSearchResult.groups);
            });
    },

    firstPageSearch: function()
    {
        GroupSearch.postGroupSearch(1);
    },

    nextPageSearch: function()
    {
        GroupSearch.postGroupSearch(GroupSearch.ViewModel.PageIndex() + 1);
    },

    previousPageSearch: function()
    {
        GroupSearch.postGroupSearch(GroupSearch.ViewModel.PageIndex() - 1);
    },

    resultsVisible: function()
    {
        if  (GroupSearch.ViewModel.Groups() && GroupSearch.ViewModel.Groups().length > 0) {
            return true;
        }
        return false;
    },

    previousVisible: function()
    {
        console.log("PageIndex() = " + GroupSearch.ViewModel.PageIndex() + " is a " + typeof GroupSearch.ViewModel.PageIndex() );
        if  (GroupSearch.ViewModel.PageIndex()  > 1) {
            return true;
        }

        return false;
    },

    nextVisible: function()
    {
        console.log("PageSize() = " + GroupSearch.ViewModel.PageSize() + " is a " + typeof GroupSearch.ViewModel.PageSize() );
        console.log("Groups() = " + GroupSearch.ViewModel.Groups() + " is a " + typeof GroupSearch.ViewModel.Groups() );
        if  (GroupSearch.ViewModel.Groups()) {
            if (GroupSearch.ViewModel.Groups().length < GroupSearch.ViewModel.PageSize()){
                console.log("There are " + GroupSearch.ViewModel.Groups().length + " groups which is less than page size");
                return false;
            } else {
                console.log("There are " + GroupSearch.ViewModel.Groups().length + " groups");
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
        console.log("view model: " + GroupSearch.ViewModel);
        $("#btnSearch").click({ handler: this.postGroupSearch });
    }
};

$(document).ready(function()
{
    GroupSearch._init();
});


