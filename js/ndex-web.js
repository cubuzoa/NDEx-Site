/******************************************************************************
 * Contains common functionality for the web client.
 ******************************************************************************/
var NdexWeb =
{
    ApiHost: "http://localhost:3333",
    ViewModel:
    {
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
    * Logs the user out of the system.
    ****************************************************************************/
    logOut: function()
    {
        delete localStorage.username;
        delete localStorage.password;
        delete localStorage.ndexJid;
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
    * Wires event-handlers to elements on the page.
    ****************************************************************************/
    wireEvents: function()
    {
        $("#btnCloseModal").click(this.hideModal);
        $("#signOut > a").click(this.logOut);
    }
};

/****************************************************************************
* Retrieves the user's credentials from local storage (if they exist).
****************************************************************************/
NdexWeb.ViewModel.User = ko.computed(function()
{
    return {
        jId: localStorage.ndexJid,
        Password: localStorage.password,
        Username: localStorage.username
    };
});

/****************************************************************************
* Returns the user's credentials as required by Basic Authentication base64
* encoded.
****************************************************************************/
NdexWeb.ViewModel.EncodedUser = ko.computed(function()
{
    if (NdexWeb.ViewModel.User().jId)
        return btoa(NdexWeb.ViewModel.User().Username + ":" + NdexWeb.ViewModel.User().Password);
    else
        return null;
});

$(document).ready(function()
{
    NdexWeb._init();
});
