//TODO: Refactor after refactoring of Java NetworkService is complete
var Network =
{
    ViewModel:
    {
        NetworkId: ko.observable(),
        Network: ko.observable(),
        Search:
        {
            Direction: ko.observable("BOTH"),
            Fuzziness: ko.observable("STRICT"),
            Keywords: ko.observable(""),
            MaxDepth: ko.observable(1),
            MaxEdges: ko.observable(10),
            MaxNodes: ko.observable(10),
            MaxPaths: ko.observable(10),
            RetainPaths: ko.observable(false),
            TermFunctions:
            {
                Excluded: ko.observableArray(),
                Included: ko.observableArray()
            },
            Terms:
            {
                Excluded: ko.observableArray(),
                Included: ko.observableArray(),
                Starting: ko.observableArray(),
                Target: ko.observableArray()
            }
        },
        PageIndex: ko.observable(1),
        PageSize: ko.observable(25)
    },

    /****************************************************************************
    * Initialization.
    ****************************************************************************/
    _init: function()
    {
        $("#divSearch input[type='search']").autocomplete(
        {
            delay: 500,
            minLength: 3,
            source: Network.autoSuggestTerms
        });

        ko.applyBindings(Network.ViewModel, $("#divNetwork")[0]);

        this.getNetwork();
        this.wireEvents();
    },

    /**************************************************************************
    * Retrieves terms that start with whatever is typed into the search box.
    **************************************************************************/
    autoSuggestTerms: function(request, response)
    {
        NdexWeb.get("/networks/" + Network.ViewModel.NetworkId() + "/autosuggest/" + request.term,
            null,
            function(matchingTerms)
            {
                response(matchingTerms);
            });
    },

    /**************************************************************************
    * Builds the subnetwork.
    **************************************************************************/
    buildSubnetwork: function(subnetwork)
    {
        var networkCitations = ko.mapping.fromJS(subnetwork.citations);
        var networkSupports = ko.mapping.fromJS(subnetwork.supports);

        if (typeof(networkCitations) === "function")
            Network.ViewModel.Network().citations(networkCitations());
        else
            Network.ViewModel.Network().citations(networkCitations);

        if (typeof(networkSupports) === "function")
            Network.ViewModel.Network().citations(networkSupports());
        else
            Network.ViewModel.Network().citations(networkSupports);

        Network.buildEdges(subnetwork);
        Network.buildNodes(subnetwork);
        Network.buildTerms(subnetwork);
    },

    /**************************************************************************
    * Maps the edges of the subnetwork into an array. This is done by
    * recursively traversing the edges, nodes, and terms dictionaries to get
    * references to the subject, predicate, and object.
    **************************************************************************/
    buildEdges: function(subnetwork)
    {
        var edgeArray = [];
        for (var edge in subnetwork.edges)
        {
            var newEdge = {};
            newEdge.id = edge;
            newEdge.subject = subnetwork.nodes[subnetwork.edges[edge].s];
            newEdge.subject.term = subnetwork.terms[newEdge.subject.represents];
            newEdge.predicate = subnetwork.terms[subnetwork.edges[edge].p];
            newEdge.object = subnetwork.nodes[subnetwork.edges[edge].o];
            newEdge.object.term = subnetwork.terms[newEdge.object.represents];

            edgeArray.push(newEdge);
        }

        edgeArray = ko.mapping.fromJS(edgeArray);
        Network.ViewModel.Network().edges(edgeArray());
    },

    /**************************************************************************
    * Maps the nodes of the subnetwork into an array.
    **************************************************************************/
    buildNodes: function(subnetwork)
    {
        var nodeArray = [];
        for (var node in subnetwork.nodes)
        {
            var newNode = {}; //subnetwork.nodes[node];
            newNode.id = node;

            //Only use nodes that represent terms; lookup the term
            if (subnetwork.nodes[node].represents)
            {
                newNode.represents = subnetwork.nodes[node].represents;
                newNode.term = subnetwork.terms[newNode.represents];
                nodeArray.push(newNode);
            }
        }

        nodeArray = ko.mapping.fromJS(nodeArray);
        Network.ViewModel.Network().nodes(nodeArray());
    },

    /**************************************************************************
    * Maps the terms of the subnetwork into an array.
    **************************************************************************/
    buildTerms: function(subnetwork)
    {
        var termArray = [];
        for (var term in subnetwork.terms)
        {
            var newTerm = {};
            newTerm.id = term;
            termArray.push(newTerm);
        }

        termArray = ko.mapping.fromJS(termArray);
        Network.ViewModel.Network().terms(termArray());
    },

    /****************************************************************************
    * Determines if the user has write-access to the network.
    ****************************************************************************/
    canEdit: function()
    {
        for (var networkIndex = 0; networkIndex < NdexWeb.ViewModel.User().networks().length; networkIndex++)
        {
            var network = NdexWeb.ViewModel.User().networks()[networkIndex];
            if (network.resourceId() === Network.ViewModel.Network().id() && network.permissions() != "READ")
                return true;
        }

        return false;
    },

    /****************************************************************************
    * Gets network edges.
    ****************************************************************************/
    getEdges: function()
    {
        NdexWeb.get(
            "/networks/" + this.ViewModel.Network().id() + "/edges/" + Network.ViewModel.PageIndex() + "/" + Network.ViewModel.PageSize(),
            null,
            function(networkEdges)
            {
                Network.buildSubnetwork(networkEdges);
            });
    },

    /****************************************************************************
    * Gets network metadata.
    ****************************************************************************/
    getNetwork: function()
    {
        NdexWeb.get(
            "/networks/" + this.ViewModel.NetworkId(),
            null,
            function(network)
            {
                network = ko.mapping.fromJS(network);

                if (typeof(network.citations) != "function")
                    network.citations = ko.observable();

                if (typeof(network.edges) != "function")
                    network.edges = ko.observable();

                if (typeof(network.nodes) != "function")
                    network.nodes = ko.observable();

                if (typeof(network.supports) != "function")
                    network.supports = ko.observable();

                if (typeof(network.terms) != "function")
                    network.terms = ko.observable();

                Network.ViewModel.Network(network);
                Network.getEdges();
            });
    },

    /****************************************************************************
    * Queries the network for the specified subnetwork using the provided
    * search parameters.
    ****************************************************************************/
    queryNetwork: function(event)
    {
        event.preventDefault();

        var startingTerms = [];
        startingTerms.push($("#divSearch input[type='search']").val());

        //TODO: Eventually push the whole Search object up and make the server-side model match it.
        NdexWeb.post("/networks/" + Network.ViewModel.NetworkId() + "/query",
            {
                representationCriterion: Network.ViewModel.Search.Fuzziness(),
                searchDepth: Network.ViewModel.Search.MaxDepth(),
                searchType: Network.ViewModel.Search.Direction(),
                startingTermStrings: startingTerms
            },
            function(subnetwork)
            {
                Network.buildSubnetwork(subnetwork);
            });
    },

    /****************************************************************************
    * Accordion functionality.
    ****************************************************************************/
    setupAccordion: function()
    {
        $("dl.Accordion > dt").click(function()
        {
            var accordionKey = $(this);

            if (accordionKey.hasClass("Expanded"))
                return;

            accordionKey.parent().children("dt.Expanded").toggleClass("Expanded");
            accordionKey.toggleClass("Expanded");
            $("dd:visible").slideUp("fast");
            accordionKey.next().slideDown("fast");
        }).next().hide();

        $("dl.Accordion > dt.Expanded").next().show();
    },

    /****************************************************************************
    * Updates the network.
    ****************************************************************************/
    updateNetwork: function()
    {
        NdexWeb.post("/networks/",
            ko.mapping.toJS(Network.ViewModel.Network()));
    },

    /****************************************************************************
    * Wires event-handlers to elements on the page.
    ****************************************************************************/
    wireEvents: function()
    {
        this.setupAccordion();
        $("#frmSearchNetwork").submit(this.queryNetwork);

        //TODO: Add knockout event-handler for moving items
        $("#ulFilterableTerms").sortable(
        {
            connectWith: ".FilterableTerms",
            placeholder: "ui-state-highlight"
        });

        $("#ulTermsIncluded").sortable(
        {
            connectWith: ".FilterableTerms",
            placeholder: "ui-state-highlight"
        });

        $("#ulTermsExcluded").sortable(
        {
            connectWith: ".FilterableTerms",
            placeholder: "ui-state-highlight"
        });

        $("#ulTraversalTerms").sortable(
        {
            connectWith: ".TraversalTerms",
            placeholder: "ui-state-highlight"
        });

        $("#ulStartingTerms").sortable(
        {
            connectWith: ".TraversalTerms",
            placeholder: "ui-state-highlight"
        });

        $("#ulTargetTerms").sortable(
        {
            connectWith: ".TraversalTerms",
            placeholder: "ui-state-highlight"
        });
    }
};

$(document).ready(function()
{
    Network._init();
});
