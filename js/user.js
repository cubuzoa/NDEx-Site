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

        this.autoSelectTab();

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
        acceptedRequest.response = "ACCEPTED";
        acceptedRequest.responder = NdexWeb.ViewModel.User().id();

        NdexWeb.post("/requests",
            ko.mapping.toJSON(acceptedRequest),
            function ()
            {
                NdexWeb.hideModal();
            });
    },

    /****************************************************************************
    * Auto-selects the tab based on the hash of the browser location.
    * Additionally adds some logic to ensure the tab stays selected on reload.
    ****************************************************************************/
    autoSelectTab: function()
    {
        //TODO: Test this - does it work?
        var selectedTab = document.location.hash;

        if (selectedTab)
            $("ul.nav-tabs a[href='" + selectedTab.replace("#", "#div") + "']").tab("show");

        $(".nav-tabs a").on("shown", function(e)
        {
            window.location.hash = e.target.hash.replace("#", "#" + prefix);
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
                $("#frmChangeImage").ajaxForm(
                {
                    iframe: true,
                    dataType: "json",
                    beforeSend: function(xhr)
                    {
                        xhr.setRequestHeader("Authorization", "Basic " + NdexWeb.ViewModel.EncodedUser());
                    },
                    success: function()
                    {
                        $("#imgProfileBackground").attr("src", "");
                        $("#imgProfileBackground").attr("src", "/img/background/" + NdexWeb.ViewModel.User().username() + ".jpg");
                    },
                    error: function(jqXHR, textStatus, errorThrown)
                    {
                        $.gritter.add({ title: "Failure", text: "Failed to change your profile background." });
                    }
                });

                $("#frmChangeImage").submit();
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
                $("#frmChangeImage").ajaxForm(
                {
                    iframe: true,
                    dataType: "json",
                    beforeSend: function(xhr)
                    {
                        xhr.setRequestHeader("Authorization", "Basic " + NdexWeb.ViewModel.EncodedUser());
                    },
                    success: function()
                    {
                        $("#imgProfile").attr("src", "");
                        $("#imgProfile").attr("src", "/img/foreground/" + NdexWeb.ViewModel.User().username() + ".jpg");
                    },
                    error: function(jqXHR, textStatus, errorThrown)
                    {
                        $.gritter.add({ title: "Failure", text: "Failed to change your profile image." });
                    }
                });

                $("#frmChangeImage").submit();
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
        declinedRequest.responder = NdexWeb.ViewModel.User().id();

        NdexWeb.post("/requests",
            ko.mapping.toJSON(declinedRequest),
            function ()
            {
                NdexWeb.hideModal();
            });
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
            }
            else if (User.canRespond(userRequest))
            {
                $("#divModalContent button").removeClass("hide");
                $("#divModalContent #btnDecline").click(userRequest, User.declineRequest);
                $("#divModalContent #btnAccept").click(userRequest, User.acceptRequest);
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