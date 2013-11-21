/******************************************************************************
 * Contains common functionality for the web client.
 ******************************************************************************/
var NdexWeb =
{
    ApiHost: "http://localhost:8080/ndexbio-rest",
    ViewModel:
    {
        User: ko.observable()
    },
    divModal: null,
    divModalBackground: null,

    /****************************************************************************
    * Initialization of the client.
    ****************************************************************************/
    _init: function()
    {
        this.divModal = $("#divModal");
        this.divModalBackground = $("#divModalBackground");

        ko.applyBindings(this.ViewModel, $("#navTop")[0]);
        this.loadUser();
        this.wireEvents();
    },

    /****************************************************************************
    * Displays a modal that asks the user to confirm an action. If confirmed, a
    * callback function is called, otherwise the modal just disappears.
    ****************************************************************************/
    confirmAction: function(actionText, confirmCallback)
    {
        NdexWeb.showModal("Confirmation", "#confirmAction");
        NdexWeb.divModal.find("h4").text("Are you sure you want to " + actionText + "?");
        $("#btnDecline").click(NdexWeb.hideModal);
        $("#btnConfirm").click(function()
        {
            NdexWeb.hideModal();
            confirmCallback();
        });
    },

    /****************************************************************************
    * AJAX DELETE request.
    ****************************************************************************/
    delete: function(url, callback, errorHandler)
    {
        $.ajax(
        {
            type: "DELETE",
            url: NdexWeb.ApiHost + url,
            beforeSend: function(xhr)
            {
                xhr.setRequestHeader("Authorization", "Basic " + NdexWeb.ViewModel.EncodedUser());
            },
            success: callback,
            error: errorHandler || NdexWeb.errorHandler()
        });
    },

    /****************************************************************************
    * Default error handling.
    ****************************************************************************/
    errorHandler: function(exception)
    {
        console.log("Exception thrown: " + JSON.stringify(exception));
        //$.gritter.add({ title: "Exception", text: JSON.stringify(exception) });
    },

    /****************************************************************************
    * AJAX GET request.
    ****************************************************************************/
    get: function(url, queryArgs, callback, errorHandler)
    {
        $.ajax(
        {
            type: "GET",
            url: NdexWeb.ApiHost + url,
            data: queryArgs,
            dataType: "JSON",
            beforeSend: function(xhr)
            {
                xhr.setRequestHeader("Authorization", "Basic " + NdexWeb.ViewModel.EncodedUser());
            },
            success: callback,
            error: errorHandler || NdexWeb.errorHandler
        });
    },

    /****************************************************************************
    * Hides the modal DIV elements.
    ****************************************************************************/
    hideModal: function()
    {
        setTimeout(function()
        {
            NdexWeb.divModalBackground.fadeOut("fast");
            NdexWeb.divModal.fadeOut("fast");
        }, 500);
    },

    /****************************************************************************
    * Loads the information of the currently-logged in user.
    ****************************************************************************/
    loadUser: function()
    {
        if (!localStorage.UserId)
            return;

        NdexWeb.get("/users/" + localStorage.UserId,
            null,
            function(userData)
            {
                userData = ko.mapping.fromJS(userData);
                NdexWeb.ViewModel.User(userData());
            });
    },

    /****************************************************************************
    * Logs the user out of the system.
    ****************************************************************************/
    logOut: function()
    {
        delete localStorage.Username;
        delete localStorage.Password;
        delete localStorage.UserId;
        window.location = "/";
    },

    /****************************************************************************
    * AJAX POST request.
    ****************************************************************************/
    post: function(url, postData, callback, errorHandler)
    {
        $.ajax(
        {
            type: "POST",
            url: NdexWeb.ApiHost + url,
            data: JSON.stringify(postData),
            dataType: "JSON",
            contentType: 'application/json',
            beforeSend: function(xhr)
            {
                xhr.setRequestHeader("Authorization", "Basic " + NdexWeb.ViewModel.EncodedUser());
            },
            success: callback,
            error: errorHandler || NdexWeb.errorHandler
        });
    },

    /****************************************************************************
    * AJAX PUT request.
    ****************************************************************************/
    put: function(url, putData, callback, errorHandler)
    {
        $.ajax(
        {
            type: "PUT",
            url: NdexWeb.ApiHost + url,
            contentType: "application/json",
            data: JSON.stringify(putData),
            dataType: "JSON",
            beforeSend: function(xhr)
            {
                xhr.setRequestHeader("Authorization", "Basic " + NdexWeb.ViewModel.EncodedUser());
            },
            success: callback,
            error: errorHandler || NdexWeb.errorHandler
        });
    },

    /****************************************************************************
    * Sends the user's request.
    ****************************************************************************/
    sendRequest: function(event)
    {
        event.preventDefault();

        var requestData = $("#txtMessage").data("Request");
        requestData.Message = $("#txtMessage").val();

        for (var ownerIndex = 0; ownerIndex < requestData.owners().length; ownerIndex++)
        {
            //TODO: Submit the request to each owner
        }

        NdexWeb.closeModal();
    },

    /****************************************************************************
    * Shows the modal DIV elements.
    ****************************************************************************/
    showModal: function(modalTitle, modalContent, hasCloseButton, callbackFunction)
    {
        NdexWeb.divModal.find("div.Title > span").text(modalTitle);
        NdexWeb.divModal.find("#divModalContent").empty();

        //modalContent could be a selector, a reference to a DOM element, or a
        //reference to a SCRIPT element
        if (typeof (modalContent) === "string")
            modalContent = $(modalContent);

        if (modalContent.prop("tagName").toUpperCase() === "SCRIPT")
            NdexWeb.divModal.find("#divModalContent").append(modalContent.html());
        else
            NdexWeb.divModal.find("#divModalContent").append(modalContent);

        if (hasCloseButton)
            $("#btnCloseModal").show();
        else
            $("#btnCloseModal").hide();

        NdexWeb.divModalBackground.fadeIn("fast", function()
        {
            //IE ClearType jQuery fix
            if (this.style.removeAttribute)
                this.style.removeAttribute("filter");

            NdexWeb.divModal.fadeIn("fast");

            if (callbackFunction)
                callbackFunction();
        });
    },

    /****************************************************************************
    * Displays the request modal dialog.
    ****************************************************************************/
    showRequestModal: function(requestType, requestedResource)
    {
        var modalTitle, defaultMessage;

        switch (requestType)
        {
            case "GROUP_INVITATION":
                modalTitle = "Group Invitation";
                defaultMessage = "You are invited to become a member of " + requestedResource.groupname() + ".";
                break;
            case "JOIN_GROUP":
                modalTitle = "Request to Join";
                defaultMessage = "Please add me as a member of group " + requestedResource.groupname() + ".";
                break;
            case "NETWORK_ACCESS":
                modalTitle = "Request for Network Access";
                defaultMessage = "I'd like access to the " + requestedResource.title() + " network.";
                break;
            default:
                break;
        }

        NdexWeb.showModal(modalTitle, "#requestAccess", true, function()
        {
            $("#txtMessage")
                .val(defaultMessage)
                .data("Request",
                {
                    FromId: NdexWeb.ViewModel.User().jId,
                    ResourceId: requestedResource.jid(),
                    ToId: requestedResource.owners(),
                    Type: requestType
                });
        });
    },

    /****************************************************************************
    * Wires event-handlers to elements on the page.
    ****************************************************************************/
    wireEvents: function()
    {
        $("#btnCloseModal").click(this.hideModal);
        $("#signOut > a").click(this.logOut);
        $(document).on("click", "#frmRequest", this.sendRequest);
    }
};

/****************************************************************************
* Returns the user's credentials as required by Basic Authentication base64
* encoded.
****************************************************************************/
NdexWeb.ViewModel.EncodedUser = ko.computed(function()
{
    if (localStorage.UserId)
        return btoa(localStorage.Username + ":" + localStorage.Password);
    else
        return null;
});

$(document).ready(function()
{
    NdexWeb._init();
});
