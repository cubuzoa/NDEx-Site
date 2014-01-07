var Network =
{
    IsLoadingNextPage: true,
    PageIndex: 1,
    PageSize: 25,
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
        Subnetwork: ko.observable()
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

        this.getNetwork();
        ko.applyBindings(Network.ViewModel, $("#divNetwork")[0]);

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

        if (Network.PageIndex === 1)
            Network.ViewModel.Network().edges(edgeArray());
        else
            Network.ViewModel.Network().edges.push.apply(edgeArray());
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

        if (Network.PageIndex === 1)
            Network.ViewModel.Network().nodes(nodeArray());
        else
            Network.ViewModel.Network().nodes.push.apply(nodeArray());
    },

    /**************************************************************************
    * Builds the subnetwork.
    **************************************************************************/
    buildSubnetwork: function(subnetwork)
    {
        var networkCitations = ko.mapping.fromJS(subnetwork.citations);
        var networkSupports = ko.mapping.fromJS(subnetwork.supports);

        if (Network.PageIndex === 1)
        {
            if (typeof(networkCitations) === "function")
                Network.ViewModel.Network().citations(networkCitations());
            else
                Network.ViewModel.Network().citations(networkCitations);

            if (typeof(networkSupports) === "function")
                Network.ViewModel.Network().citations(networkSupports());
            else
                Network.ViewModel.Network().citations(networkSupports);
        }
        else
        {
            if (typeof(networkCitations) === "function")
                Network.ViewModel.Network().citations.push.apply(networkCitations());
            else
                Network.ViewModel.Network().citations.push.apply(networkCitations);

            if (typeof(networkSupports) === "function")
                Network.ViewModel.Network().citations.push.apply(networkSupports());
            else
                Network.ViewModel.Network().citations.push.apply(networkSupports);
        }

        Network.buildEdges(subnetwork);
        Network.buildNodes(subnetwork);
        Network.buildTerms(subnetwork);
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

        if (Network.PageIndex === 1)
            Network.ViewModel.Network().terms(termArray());
        else
            Network.ViewModel.Network().terms.push.apply(termArray());
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
    * Changes the member's permissions.
    ****************************************************************************/
    changeMemberPermissions: function(networkMember, event)
    {
        NdexWeb.post("/networks/" + Network.ViewModel.Network().id() + "/member",
            ko.mapping.toJS(networkMember),
            function()
            {
                $.gritter.add({ title: "Network Updated", text: groupMember.resourceName() + "'s permissions have been changed." });
            });
    },

    /****************************************************************************
    * Gets network edges.
    ****************************************************************************/
    getEdges: function()
    {
        NdexWeb.get(
            "/networks/" + this.ViewModel.Network().id() + "/edges/" + (Network.PageIndex - 1) + "/" + Network.PageSize,
            null,
            function(networkEdges)
            {
                Network.IsLoadingNextPage = false;

                if (!networkEdges || networkEdges.length < 1)
                {
                    $("#divSubnetwork").unbind("scroll");
                    return;
                }

                Network.buildSubnetwork(networkEdges);
            },
            function(jqXHR, textStatus, errorThrown)
            {
                Network.IsLoadingNextPage = false;
                NdexWeb.errorHandler(jqXHR, textStatus, errorThrown);
            });
    },

    /****************************************************************************
    * Gets network metadata.
    ****************************************************************************/
    getNetwork: function()
    {
        $.ajax(
        {
            async: false,
            type: "GET",
            url: NdexWeb.ApiHost + "/networks/" + this.ViewModel.NetworkId(),
            dataType: "json",
            beforeSend: function(xhr)
            {
                xhr.setRequestHeader("Authorization", "Basic " + NdexWeb.ViewModel.EncodedUser());
            },
            success: function(network)
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
                Network.PageIndex = 1;
                Network.getEdges();
                $("#divSubnetwork").scroll(this.infiniteScroll);

            },
            error: NdexWeb.errorHandler
        });
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
        if ($("#divSubnetwork").scrollTop() > parseInt(($("#divSubnetwork").height()) * .67))
        {
            if (Network.IsLoadingNextPage === false)
            {
                Network.IsLoadingNextPage = true;
                Network.PageIndex++;
                Network.getEdges();
            }
        }
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
        //TODO: Need to add paging to server-side queryNetwork API method
        NdexWeb.post("/networks/" + Network.ViewModel.NetworkId() + "/query",
            {
                representationCriterion: Network.ViewModel.Search.Fuzziness(),
                searchDepth: Network.ViewModel.Search.MaxDepth(),
                searchType: Network.ViewModel.Search.Direction(),
                startingTermStrings: startingTerms
            },
            function(subnetwork)
            {
                $("#divSubnetwork").unbind("scroll");

                if (subnetwork != null)
                {
                    Network.ViewModel.Subnetwork(ko.mapping.fromJS(subnetwork));
                    Network.buildSubnetwork(subnetwork);
                }
            });
    },

    /****************************************************************************
    * Removes a member from the network.
    ****************************************************************************/
    removeMember: function(networkMember, event)
    {
        NdexWeb.confirmAction("Are you sure you want to remove this member?", function()
        {
            NdexWeb.delete("/networks/" + Network.ViewModel.Network().id() + "/member/" + networkMember.resourceId(),
                function()
                {
                    $.gritter.add({ title: "Network Updated", text: networkMember.resourceName() + "'s permissions have been changed." });
                });
        });
    },

    /****************************************************************************
    * Displays a modal that allows the user to save the subnetwork as its own
    * separate network.
    ****************************************************************************/
    saveSubnetwork: function(viewModel, event)
    {
        NdexWeb.showModal("Save Subnetwork", "#saveSubnetwork", true, function()
        {
            $("#frmSaveSubnetwork").submit(function(event)
            {
                event.preventDefault();

                NdexWeb.put("/networks",
                    {
                        citations: ko.mapping.toJS(Network.ViewModel.Subnetwork().citations),
                        description: $("#txtDescription").val(),
                        edges: ko.mapping.toJS(Network.ViewModel.Subnetwork().edges),
                        format: "JDEX",
                        isPublic: $("#chkIsPublic").prop("checked"),
                        name: $("#txtName").val(),
                        nodes: ko.mapping.toJS(Network.ViewModel.Subnetwork().nodes),
                        source: "Subnetwork of " + Network.ViewModel.Network().name(),
                        supports: ko.mapping.toJS(Network.ViewModel.Subnetwork().supports),
                        terms: ko.mapping.toJS(Network.ViewModel.Subnetwork().terms)
                    },
                    function(newNetwork)
                    {
                        NdexWeb.hideModal();
                        window.location = "/network/" + newNetwork.id;
                    });
            });
        });
    },

    /****************************************************************************
    * Accordion functionality.
    ****************************************************************************/
    setupAccordion: function()
    {
        var accordionSelector = "#ddSearchNetwork dl.Accordion > dt";
        if ($(window).width() < 481)
            accordionSelector = "dl.Accordion > dt";

        $(accordionSelector).click(function()
        {
            var accordionKey = $(this);
            if (accordionKey.hasClass("Expanded"))
                return;

            accordionKey.parent().children("dt.Expanded").toggleClass("Expanded");
            accordionKey.toggleClass("Expanded");
            accordionKey.parent().children("dd:visible").slideUp("fast");
            accordionKey.next().slideDown("fast");
        }).next().hide();

        $(accordionSelector + ".Expanded").next().show();
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
