var User =
{
    ViewModel:
    {
        UserId: ko.observable(),
        User: ko.observable()
    },

    /****************************************************************************
    * Initialization.
    ****************************************************************************/
    _init: function()
    {
        ko.applyBindings(this.ViewModel, $("#divUser")[0]);

        if (NdexWeb.ViewModel.User().id() !== this.ViewModel.UserId())
            this.loadUser();
        else
            this.ViewModel.User(NdexWeb.ViewModel.User());

        this.wireEvents();
    },

    /****************************************************************************
    * Accepts a user's request.
    ****************************************************************************/
    acceptRequest: function(event)
    {
        var acceptedRequest = event.data;
        acceptedRequest.response = $(this).val();
        acceptedRequest.responseMessage = $("#divModalContent textarea").val();
        acceptedRequest.responder = NdexWeb.ViewModel.User().id();

        NdexWeb.post("/requests",
            ko.mapping.toJSON(acceptedRequest),
            function ()
            {
                NdexWeb.hideModal();
            });
    },

    /****************************************************************************
    * Determines if the user can respond to a request.
    ****************************************************************************/
    canRespond: function(userRequest)
    {
        if (userRequest.toId() == User.ViewModel.User().id())
            return true;

        for (var groupIndex = 0; groupIndex < User.ViewModel.User().groups().length; groupIndex++)
        {
            if (userRequest.toId() != User.ViewModel.User().groups()[groupIndex].resourceId())
                continue;

            return true;
        }

        for (var networkIndex = 0; networkIndex < User.ViewModel.User().networks().length; networkIndex++)
        {
            if (userRequest.toId() != User.ViewModel.User().networks()[networkIndex].resourceId())
                continue;

            return true;
        }

        return false;
    },

    /****************************************************************************
    * Changes the user's password.
    ****************************************************************************/
    changePassword: function()
    {
        NdexWeb.showModal("Change Password", "#changePassword", true, function()
        {
            $("#txtPassword").Password(
            {
                Confirmation:
                {
                    IsInvalidCallback: function()
                    {
                        $("#divModalContent button").attr("disabled", true);
                    },
                    IsValidCallback: function()
                    {
                        $("#divModalContent button").removeAttr("disabled");
                    },
                    MatchUrl: "/img/success.png",
                    MismatchUrl: "/img/alert.png",
                    TextBox: "#txtConfirmPassword"
                }
            });

            $("#divModalContent button").click(function()
            {
                NdexWeb.post("/users/" + User.ViewModel.UserId() + "/password",
                    $("#txtPassword").val(),
                    function()
                    {
                        localStorage.Password = $("#txtPassword").val();
                        $.gritter.add({ title: "Password Changed", text: "Your password has been changed." });
                        NdexWeb.hideModal();
                    });
            });
        });
    },

    /****************************************************************************
    * Changes the user's profile background image.
    ****************************************************************************/
    changeProfileBackground: function()
    {
        NdexWeb.showModal("Change Profile Background", "#changeImage", true, function()
        {
            $("#frmChangeImage").attr("action", NdexWeb.ApiHost + "/users/" + NdexWeb.ViewModel.User().id() + "/profile-background");
            $("#fileNewImage").change(function()
            {
                $("#frmChangeImage").ajaxSubmit(
                {
                    dataType: "json",
                    beforeSend: function(xhr)
                    {
                        xhr.setRequestHeader("Authorization", "Basic " + NdexWeb.ViewModel.EncodedUser());
                        xhr.setRequestHeader("Test Header", "Dammit");
                    },
                    success: function()
                    {
                        $("#imgProfileBackground").attr("src", "/account_img/background/" + NdexWeb.ViewModel.User().username() + ".jpg?" + Math.random(100000, 1000000));
                        NdexWeb.hideModal();
                    },
                    error: function(jqXHR, textStatus, errorThrown)
                    {
                        $.gritter.add({ title: "Failure", text: "Failed to change your profile background." });
                    }
                });
            });
        });
    },

    /****************************************************************************
    * Changes the user's profile image.
    ****************************************************************************/
    changeProfileImage: function()
    {
        NdexWeb.showModal("Change Profile Image", "#changeImage", true, function()
        {
            $("#frmChangeImage").attr("action", NdexWeb.ApiHost + "/users/" + NdexWeb.ViewModel.User().id() + "/profile-image");
            $("#fileNewImage").change(function()
            {
                $("#frmChangeImage").ajaxSubmit(
                {
                    dataType: "json",
                    beforeSend: function(xhr)
                    {
                        xhr.setRequestHeader("Authorization", "Basic " + NdexWeb.ViewModel.EncodedUser());
                    },
                    success: function()
                    {
                        $("#imgProfile").attr("src", "/account_img/foreground/" + NdexWeb.ViewModel.User().username() + ".jpg?" + Math.random(100000, 1000000));
                        NdexWeb.hideModal();
                    },
                    error: function(jqXHR, textStatus, errorThrown)
                    {
                        $.gritter.add({ title: "Failure", text: "Failed to change your profile image." });
                    }
                });
            });
        });
    },

    /****************************************************************************
    * Displays a modal that allows a user to create a group.
    ****************************************************************************/
    createGroup: function()
    {
        NdexWeb.showModal("Create Group", "#createGroup", true, function()
        {
            $("#frmCreateGroup").submit(function(event)
            {
                event.preventDefault();

                NdexWeb.put("/groups/",
                    {
                        accountType: "Group",
                        members:
                        [{
                            permissions: "ADMIN",
                            resourceId: NdexWeb.ViewModel.User().id()
                        }],
                        name: $("#txtGroupName").val()
                    },
                    function(newGroup)
                    {
                        window.location = "/group/" + newGroup.id;
                    },
                    function(jqXHR, textStatus, errorThrown)
                    {
                        $.gritter.add({ title: "Failure", text: "Failed to create the group." });
                    });
            });
        });
    },

    /****************************************************************************
    * Displays a modal that allows a user to create a network.
    ****************************************************************************/
    createNetwork: function()
    {
        NdexWeb.showModal("Create Network", "#createNetwork", true, function()
        {
            $("#frmCreateNetwork").attr("action", NdexWeb.ApiHost + "/networks/");
            $("#fileCreateNetwork").change(function()
            {
                $("#frmCreateNetwork").ajaxSubmit(
                {
                    dataType: "json",
                    beforeSend: function(xhr)
                    {
                        xhr.setRequestHeader("Authorization", "Basic " + NdexWeb.ViewModel.EncodedUser());
                    },
                    success: function(newNetwork)
                    {
                        window.location = "/network/" + newNetwork.id;
                    },
                    error: function(jqXHR, textStatus, errorThrown)
                    {
                        //TODO: Need to add errors to the unordered list, but need to see how they're returned first
                        $.gritter.add({ title: "Failure", text: "Failed to create the network." });
                    }
                });
            });
        });
    },

    /****************************************************************************
    * Declines a user's request.
    ****************************************************************************/
    declineRequest: function(event)
    {
        var declinedRequest = event.data;
        declinedRequest.response = "DECLINED";
        declinedRequest.responseMessage = $("#divModalContent textarea").val();
        declinedRequest.responder = NdexWeb.ViewModel.User().id();

        NdexWeb.post("/requests",
            ko.mapping.toJSON(declinedRequest),
            function ()
            {
                NdexWeb.hideModal();
            });
    },

    /****************************************************************************
    * Invites the user to join a group.
    ****************************************************************************/
    inviteToGroup: function()
    {
        NdexWeb.showRequestModal("Group Invitation");
    },

    /****************************************************************************
    * Loads the user's information.
    ****************************************************************************/
    loadUser: function()
    {
        NdexWeb.get("/users/" + User.ViewModel.UserId(),
            null,
            function (userData)
            {
                userData = ko.mapping.fromJS(userData);
                User.ViewModel.User(userData);
            });
    },

    /****************************************************************************
    * Requests group access.
    ****************************************************************************/
    requestGroupAccess: function()
    {
        NdexWeb.showRequestModal("Join Group", this);
    },

    /****************************************************************************
    * Requests network access.
    ****************************************************************************/
    requestNetworkAccess: function()
    {
        NdexWeb.showRequestModal("Network Access", this);
    },

    /****************************************************************************
    * Displays a user's request in a modal dialog.
    ****************************************************************************/
    showRequest: function(userRequest)
    {
        NdexWeb.showModal("Request", "#userRequest", true, function()
        {
            $("#divModalContent #spanFrom").text(userRequest.from());
            $("#divModalContent #spanTo").text(userRequest.to());
            $("#divModalContent p").text(userRequest.message());

            if (userRequest.response())
            {
                $("#divModalContent strong").removeClass("hide");
                $("#divModalContent strong > em").text(userRequest.response());
                $("#divModalContent strong > span").text(userRequest.responder());

                //Now that the user has viewed one of their requests that was
                //responded to, delete the request
                if (userRequest.toId() === NdexWeb.ViewModel.User.id())
                {
                    $("#btnCloseModal").click(function()
                    {
                        NdexWeb.delete("/requests/" + userRequest.id());
                        NdexWeb.hideModal();
                    });
                }
            }
            else if (User.canRespond(userRequest))
            {
                $("#divModalContent button").removeClass("hide");
                $("#divModalContent #btnDecline").click(userRequest, User.declineRequest);
                $("#divModalContent #select").change(userRequest, User.acceptRequest);
            }
        });
    },

    /****************************************************************************
    * Updates the user.
    ****************************************************************************/
    updateUser: function()
    {
        NdexWeb.post("/users",
            ko.mapping.toJS(User.ViewModel.User()));
    },

    /****************************************************************************
    * Wires event-handlers to elements on the page.
    ****************************************************************************/
    wireEvents: function()
    {
        $("#imgProfile").error(function()
        {
            this.src = "/img/default-profile.png";
        });

        $("#imgProfileBackground").error(function()
        {
            this.src = "/img/default-background.png";
        });
    }
};

$(document).ready(function()
{
    User._init();
});