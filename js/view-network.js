var ViewNetwork =
{
  ViewModel:
  {
    Network:
    {
      Edges: ko.observableArray(),
      Id: ko.observable(),
      Metadata: ko.observable(),
      Nodes: ko.observableArray(),
      Terms: ko.observableArray()
    },
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
    ko.applyBindings(this.ViewModel, $("#divNetwork")[0]);

    this.getNetwork();
    this.wireEvents();
  },

  /****************************************************************************
  * Gets network edges.
  ****************************************************************************/
  getEdges: function()
  {
    ndexClient.ndexGet("/networks/" + encodeURIComponent(this.ViewModel.Network.Id()) + "/edge",
      {
        limit: this.ViewModel.PageSize(),
        offset: this.ViewModel.PageIndex() - 1
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
        ViewNetwork.ViewModel.Network.Edges(edgeArray());
      });
  },

  /****************************************************************************
  * Gets network metadata.
  ****************************************************************************/
  getNetwork: function()
  {
    ndexClient.ndexGet(
      "/networks/" + encodeURIComponent(this.ViewModel.Network.Id()) + "/metadata",
      null,
      function(metadata)
      {
        var networkMetadata = ko.mapping.fromJS(metadata.network);
        ViewNetwork.ViewModel.Network.Metadata(networkMetadata);
        ViewNetwork.getNodes();
        ViewNetwork.getEdges();
      });
  },

  /****************************************************************************
  * Gets network nodes.
  ****************************************************************************/
  getNodes: function()
  {
    ndexClient.ndexGet(
      "/networks/" + encodeURIComponent(this.ViewModel.Network.Id()) + "/node",
      {
        limit: this.ViewModel.PageSize(),
        offset: this.ViewModel.PageIndex() - 1
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
        ViewNetwork.ViewModel.Network.Nodes(nodeArray());

        //Convert the terms dictionary into an array
        var termArray = [];
        for (var term in nodes.network.terms)
        {
          var newTerm = nodes.network.terms[term];
          newTerm.id = term;
          termArray.push(newTerm);
        }

        termArray = ko.mapping.fromJS(termArray);
        ViewNetwork.ViewModel.Network.Terms(termArray());
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
  ViewNetwork._init();
});
