var SearchResults = [];
var UserSearch =
{
    ViewModel:
    {
        Users: ko.observable(),
        SearchString: ko.observable(),
        PageIndex: ko.observable(1),
        PageSize: ko.observable(15)
    },

    /****************************************************************************
     * Initialization.
     ****************************************************************************/
    _init: function()
    {
        ko.applyBindings(UserSearch.ViewModel, $("#divUsers")[0]);
        ko.applyBindings(UserSearch.ViewModel, $("#divSearch")[0]);

        this.wireEvents();
    },

    /****************************************************************************
     * Posts a User search, returns an array of Users
     ****************************************************************************/
    postUserSearch: function(pageNumber)
    {
        console.log("doing postUserSearch '" + UserSearch.ViewModel.SearchString() + "'");
        var skip =  Math.max(pageNumber - 1, 0);
        NdexWeb.post(
            "/users/search",
            {
                searchString : UserSearch.ViewModel.SearchString(),
                limit: UserSearch.ViewModel.PageSize(),
                skip: skip
            },
            function(userSearchResult)
            {
                var page =  userSearchResult.skip + 1;
                console.log("Got page " + page + " with " + userSearchResult.users.length + " users");
                UserSearch.ViewModel.PageIndex(page);
                UserSearch.ViewModel.Users(userSearchResult.users);
            });
    },

    firstPageSearch: function()
    {
        UserSearch.postUserSearch(1);
    },

    nextPageSearch: function()
    {
        UserSearch.postUserSearch(UserSearch.ViewModel.PageIndex() + 1);
    },

    previousPageSearch: function()
    {
        UserSearch.postUserSearch(UserSearch.ViewModel.PageIndex() - 1);
    },

    resultsVisible: function()
    {
        if  (UserSearch.ViewModel.Users() && UserSearch.ViewModel.Users().length > 0) {
            return true;
        }
        return false;
    },

    previousVisible: function()
    {
        console.log("PageIndex() = " + UserSearch.ViewModel.PageIndex() + " is a " + typeof UserSearch.ViewModel.PageIndex() );
        if  (UserSearch.ViewModel.PageIndex()  > 1) {
            return true;
        }

        return false;
    },

    nextVisible: function()
    {
        console.log("PageSize() = " + UserSearch.ViewModel.PageSize() + " is a " + typeof UserSearch.ViewModel.PageSize() );
        console.log("Users() = " + UserSearch.ViewModel.Users() + " is a " + typeof UserSearch.ViewModel.Users() );
        if  (UserSearch.ViewModel.Users()) {
            if (UserSearch.ViewModel.Users().length < UserSearch.ViewModel.PageSize()){
                console.log("There are " + UserSearch.ViewModel.Users().length + " users which is less than page size");
                return false;
            } else {
                console.log("There are " + UserSearch.ViewModel.Users().length + " users");
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
        console.log("view model: " + UserSearch.ViewModel);
        $("#btnSearch").click({ handler: this.postUserSearch });
    }
};

$(document).ready(function()
{
    UserSearch._init();
});



