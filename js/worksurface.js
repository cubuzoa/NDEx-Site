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
        ko.applyBindings(this.ViewModel, $("#divUser")[0]);
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
            },
            function (error)
            {
                // if failure
                exports.formatError("while adding Network to workSurface: " + error);
            });

        WorkSurface.ViewModel.Networks.push(this);
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




function viewNetwork(){

    var Lnk = document.getElementById('viewNet');
    var found = false;

    $("input").each(function(index,value){
        if($(this).is(':checked')){
            Lnk.href = "../viewNetwork/"+$(this).attr('title');
            found = true;
            return false ;
        }
    });
    if(found)return;

    Lnk.removeAttribute('href');
    alert('No Elements Selected');

}

function visualizeNetwork(){

    var Lnk = document.getElementById('visualizeNet');
    var found = false;

    $("input").each(function(index,value){
        if($(this).is(':checked')){
            Lnk.href = "../visualizeNetwork/"+$(this).attr('title');
            found = true;
            return false ;
        }
    });
    if(found)return;

    Lnk.removeAttribute('href');
    alert('No Elements Selected');

}

function compareNetworks(){

    var Lnk = document.getElementById('compareNets');
    var firstNet = 1;
    var found = false;

    $("input").each(function(index,value){
        if($(this).is(':checked')){
            firstNet= $(this).attr('title');
            return false ;
        }
    });

    $("input").each(function(index,value){
        if($(this).is(':checked')){
            if(firstNet != $(this).attr('title')){
                Lnk.href = "../compareNetworks/" + firstNet + "/" + $(this).attr('title');
                found = true;
                return false ;
            }
        }
    });

    if(found)return;

    Lnk.removeAttribute('href');
    alert('Please Select 2 Elements');

}

function removeNetwork(){
    var parent = document.getElementById('divWorkSurface');

    $("input").each(function(index,value){
        if($(this).is(':checked')){
            ndexUI.removeFromWorkSurface($(this).attr('title'))
        }
    });
}