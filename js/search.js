var Search =
{
    IsLoadingNextPage: true,
    PageIndex: 1,
    PageSize: 25,
    SearchType: null,
    ViewModel:
    {
        Results: ko.observable()
    },

    /****************************************************************************
    * Initialization.
    ****************************************************************************/
    _init: function()
    {
        this.ViewModel.Results(ko.mapping.fromJSON(localStorage[Search.SearchType + " Search"])());
        ko.applyBindings(this.ViewModel, $("#tblSearchResults")[0]);
        this.wireEvents();
    },

    /****************************************************************************
    * Checks to see if the user scrolled near the bottom of the page, which
    * triggers a request for the next page of data.
    ****************************************************************************/
    infiniteScroll: function()
    {
        //TODO: Right now it's dumb, it just keeps adding elements to the DOM.
        //This needs to be updated such that next/previous DOM elements are
        //replaced with a single DOM element of the same height so the scrollbar
        //continues to be accurate.
        if ($(window).scrollTop() > parseInt(($(document).height() - $(window).height()) * .67))
        {
            if (Search.IsLoadingNextPage === false)
            {
                Search.IsLoadingNextPage = true;
                Search.PageIndex++;
                Search.performSearch();
            }
        }
    },

    /****************************************************************************
    * Performs the search.
    ****************************************************************************/
    performSearch: function()
    {
        NdexWeb.post("/" + Search.SearchType.toLowerCase() + "/search",
            {
                searchString : $("#frmSearch input[type='search']").val(),
                top: Search.PageSize,
                skip: Search.PageIndex - 1
            },
            function(searchResults)
            {
                Search.IsLoadingNextPage = false;

                if (!searchResults || searchResults.length < 1)
                {
                    $(window).unbind("scroll");

                    if (Search.PageIndex === 1)
                        Search.ViewModel.Results([]);

                    return;
                }

                if (Search.PageIndex === 1)
                    localStorage[Search.SearchType + " Search"] = JSON.stringify(searchResults);
                else
                {
                    var storedResults = JSON.parse(localStorage[Search.SearchType + " Search"]);
                    storedResults.push.apply(searchResults);
                    localStorage[Search.SearchType + " Search"] = JSON.stringify(storedResults);
                }

                Search.ViewModel.Results(ko.mapping.fromJSON(localStorage[Search.SearchType + " Search"])());
            },
            function(jqXHR, textStatus, errorThrown)
            {
                Search.IsLoadingNextPage = false;
                NdexWeb.errorHandler(jqXHR, textStatus, errorThrown);
            });
    },

    /****************************************************************************
    * Starts a new search.
    ****************************************************************************/
    startSearch: function(event)
    {
        event.preventDefault();
        Search.PageIndex = 1;
        Search.performSearch();
        $(window).scroll(this.infiniteScroll);
    },

    /****************************************************************************
    * Wires event-handlers to elements on the page.
    ****************************************************************************/
    wireEvents: function()
    {
        $("#frmSearch").submit(this.startSearch);
    }
};

$(document).ready(function()
{
    Search._init();
})
