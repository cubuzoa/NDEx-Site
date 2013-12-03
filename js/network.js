//TODO: Refactor after refactoring of Java NetworkService is complete
var Network =
{
    ViewModel:
    {
        NetworkId: ko.observable(),
        Network: ko.observable(),
        Search:
        {
            Direction: ko.observable("DEFAULT"),
            Fuzziness: ko.observable("STRICT"),
            Keywords: ko.observable(""),
            MaxDepth: ko.observable(10),
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
        PageSize: ko.observable(15)
    },

    /****************************************************************************
    * Initialization.
    ****************************************************************************/
    _init: function()
    {
        ko.applyBindings(Network.ViewModel, $("#divNetwork")[0]);
        this.getNetwork();
        this.wireEvents();
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
            "/networks/" + encodeURIComponent(this.ViewModel.Network().id()) + "/edge",
            {
                skip: this.ViewModel.PageIndex() - 1,
                top: this.ViewModel.PageSize()
            },
            function(edges)
            {
                //The edges collection is a dictionary, so convert it into an array.
                //Each edge is a reference to a subject, predicate, and object; each
                //one must be looked up in a separate array
                var edgeArray = [];
                for (var edge in edges.network.edges)
                {
                    var newEdge = edges.network.edges[edge];
                    newEdge.id = newEdge;
                    newEdge.subject = edges.network.nodes[edges.network.edges[edge].s];
                    newEdge.subject.term = edges.network.terms[newEdge.subject.represents];
                    newEdge.predicate = edges.network.terms[edges.network.edges[edge].p];
                    newEdge.object = edges.network.nodes[edges.network.edges[edge].o];
                    newEdge.object.term = edges.network.terms[newEdge.object.represents];

                    edgeArray.push(newEdge);
                }

                edgeArray = ko.mapping.fromJS(edgeArray);
                Network.ViewModel.Network().Edges(edgeArray());
            });
    },

    /****************************************************************************
    * Gets network metadata.
    ****************************************************************************/
    getNetwork: function()
    {
        NdexWeb.get(
            "/networks/" + encodeURIComponent(this.ViewModel.NetworkId()),
            null,
            function(network)
            {
                network = ko.mapping.fromJS(network);
                Network.ViewModel.Network(network);
                //TODO: These need to be updated per Dexter's latest changes
                //Network.getNodes();
                //Network.getEdges();
            });
    },

    /****************************************************************************
    * Gets network nodes.
    ****************************************************************************/
    getNodes: function()
    {
        NdexWeb.get(
            "/networks/" + encodeURIComponent(this.ViewModel.Network().id()) + "/node",
            {
                skip: this.ViewModel.PageIndex() - 1,
                top: this.ViewModel.PageSize()
            },
            function(nodes)
            {
                //The nodes collection is a dictionary, so convert it into an array
                var nodeArray = [];
                for (var node in nodes.network.nodes)
                {
                    var newNode = nodes.network.nodes[node];
                    newNode.id = node;

                    //Only use nodes that represent terms; lookup the term
                    if (newNode.represents)
                    {
                        newNode.term = nodes.network.terms[newNode.represents];
                        nodeArray.push(newNode);
                    }
                }

                nodeArray = ko.mapping.fromJS(nodeArray);
                Network.ViewModel.Network().Nodes(nodeArray());

                //Convert the terms dictionary into an array
                var termArray = [];
                for (var term in nodes.network.terms)
                {
                    var newTerm = nodes.network.terms[term];
                    newTerm.id = term;
                    termArray.push(newTerm);
                }

                termArray = ko.mapping.fromJS(termArray);
                Network.ViewModel.Network().Terms(termArray());
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
        //TODO: Add knockout event-handler for moving items
        //TODO: Move these to a modal, or add more accordion keys?
        //TODO: What to do for visualization?
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

        this.setupAccordion();
    }
};

$(document).ready(function()
{
    Network._init();
});
