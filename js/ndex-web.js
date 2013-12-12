/******************************************************************************
 * Contains common functionality for the web client.
 ******************************************************************************/
var NdexWeb =
{
    ApiHost: "http://localhost:8080/ndexbio-rest",
    TaskTimer: null,
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

        if (location.hostname.toLowerCase() != "localhost")
            this.ApiHost = "/rest/ndexbio-rest";

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
    errorHandler: function(jqXHR, textStatus, errorThrown)
    {
        $.gritter.add({ title: errorThrown, text: jqXHR.responseText });
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
            NdexWeb.divModalBackground.hide();
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

        $.ajax(
        {
            type: "GET",
            async: false,
            url: NdexWeb.ApiHost + "/users/" + localStorage.UserId,
            dataType: "JSON",
            beforeSend: function(xhr)
            {
                xhr.setRequestHeader("Authorization", "Basic " + NdexWeb.ViewModel.EncodedUser());
            },
            success: function(userData)
            {
                userData = ko.mapping.fromJS(userData);
                NdexWeb.ViewModel.User(userData);

                if (NdexWeb.ViewModel.HasActiveTasks())
                    NdexWeb.TaskTimer = setInterval(NdexWeb.updateTasks, 3000);
            },
            error: NdexWeb.errorHandler
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
        requestData.message = $("#txtMessage").val();

        NdexWeb.put("/requests",
            requestData,
            function()
            {
                $.gritter.add({ title: "Request Sent", text: "Your request has been sent." });
                NdexWeb.hideModal();
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
    * Displays the request modal dialog.
    ****************************************************************************/
    showRequestModal: function(requestType, requestedResource)
    {
        var modalTitle, defaultMessage;

        switch (requestType)
        {
            case "Group Invitation":
                modalTitle = "Group Invitation";
                defaultMessage = "You are invited to become a member.";
                break;
            case "Join Group":
                modalTitle = "Request to Join";
                defaultMessage = "Please add me as a member of group " + requestedResource.resourceName() + ".";
                break;
            case "Network Access":
                modalTitle = "Request for Network Access";
                defaultMessage = "I'd like access to the " + requestedResource.resourceName() + " network.";
                break;
            default:
                break;
        }

        NdexWeb.showModal(modalTitle, "#requestAccess", true, function()
        {
            if (requestType === "Group Invitation")
            {
                $("#divModalContent div").removeClass("hide");

                var ddlGroup = $("#divModalContent #ddlGroup");
                for (var groupIndex = 0; groupIndex < NdexWeb.ViewModel.User().groups().length; groupIndex++)
                {
                    ddlGroup.append($("<option></option>")
                        .attr("value", NdexWeb.ViewModel.User().groups()[groupIndex].resourceId())
                        .text(NdexWeb.ViewModel.User().groups()[groupIndex].resourceName()));
                }

                ddlGroup.change(function()
                {
                    $("#txtMessage").val("You are invited to become a member of " + ddlGroup.children(":selected").text() + ".");
                });

                ddlGroup.trigger("change");

                $("#txtMessage").data("Request",
                {
                    fromId: ddlGroup.val(),
                    toId: NdexWeb.ViewModel.User().id(),
                    requestType: requestType
                });
            }
            else
            {
                $("#txtMessage")
                    .val(defaultMessage)
                    .data("Request",
                    {
                        fromId: NdexWeb.ViewModel.User().id(),
                        toId: requestedResource.resourceId(),
                        requestType: requestType
                    });
            }
        });
    },

    /****************************************************************************
    * Updates the progress and/or status of the user's unfinished tasks.
    ****************************************************************************/
    updateTasks: function()
    {
        for (var taskIndex = 0; taskIndex < NdexWeb.ViewModel.User().tasks().length; taskIndex++)
        {
            var currentTask = NdexWeb.ViewModel.User().tasks()[taskIndex];
            if (currentTask.status() === "Queued" || currentTask.status() == "Processing")
            {
                NdexWeb.get("/tasks/" + currentTask.id(),
                    null,
                    function(updatedTask)
                    {
                        currentTask.progress(updatedTask.progress);
                        currentTask.status(updatedTask.status);
                    },
                    function()
                    {
                        //Don't do anything if updating a task failed
                    });
            }
        }

        if (!NdexWeb.ViewModel.HasActiveTasks())
            clearInterval(NdexWeb.TaskTimer);
    },

    /****************************************************************************
    * Wires event-handlers to elements on the page.
    ****************************************************************************/
    wireEvents: function()
    {
        $("#btnCloseModal").click(this.hideModal);
        $(document).on("submit", "#frmRequest", this.sendRequest);

        $(document).on("[title]", function()
        {
            $(this).tooltip();
        });
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

/****************************************************************************
* Determines if the user has unfinished tasks or not.
****************************************************************************/
NdexWeb.ViewModel.HasActiveTasks = ko.computed(function()
{
    if (NdexWeb.ViewModel.User())
    {
        for (var taskIndex = 0; taskIndex < NdexWeb.ViewModel.User().tasks().length; taskIndex++)
        {
            var currentTask = NdexWeb.ViewModel.User().tasks()[taskIndex];
            if (currentTask.status() === "Queued" || currentTask.status() == "Processing")
                return true;
        }
    }

    return false;
});

$(document).ready(function()
{
    NdexWeb._init();
});
