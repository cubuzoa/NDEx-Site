var Join =
{
    ViewModel:
    {
        Username: ko.observable(),
        Password: ko.observable(),
        PasswordConfirmation: ko.observable(),
        EmailAddress: ko.observable()
    },

    /****************************************************************************
    * Initialization.
    ****************************************************************************/
    _init: function()
    {
        if (NdexWeb.ViewModel.User())
        {
            window.location = "/editProfile";
            return;
        }

        $("#txtPassword").Password(
        {
            Confirmation:
            {
                IsInvalidCallback: function()
                {
                    $("#frmJoin button").attr("disabled", true);
                },
                IsValidCallback: function()
                {
                    $("#frmJoin button").removeAttr("disabled");
                },
                MatchUrl: "/img/success.png",
                MismatchUrl: "/img/alert.png",
                TextBox: "#txtConfirmPassword",
            }
        });


        ko.applyBindings(this.ViewModel, $("#frmJoin")[0]);
        this.wireEvents();
    },

    /****************************************************************************
    * Submits the form to create a new user.
    ****************************************************************************/
    submitForm: function(event)
    {
        event.preventDefault();

        if ($("#frmJoin button").is(":disabled"))
            return;
        else if (Join.ViewModel.Password() !== Join.ViewModel.PasswordConfirmation())
        {
            $.gritter.add({ title: "Input Validation", text: "Passwords don't match." });
            return;
        }

        NdexWeb.put("/users",
            {
                username: Join.ViewModel.Username(),
                password: Join.ViewModel.Password(),
                emailAddress: Join.ViewModel.EmailAddress()
            },
            function(newUser)
            {
                if (newUser)
                {
                    localStorage.Username = Join.ViewModel.Username();
                    localStorage.Password = Join.ViewModel.Password();
                    localStorage.UserId = newUser.id;
                    window.location = "/users/" + localStorage.UserId;
                }
                else
                    $.gritter.add({ title: "Server Error", text: "An error occurred creating your user, please try again later." });
            });
    },

    /****************************************************************************
    * Wires event-handlers to elements on the page.
    ****************************************************************************/
    wireEvents: function()
    {
        $("#frmJoin").submit(this.submitForm);
    }
};

$(document).ready(function()
{
   Join._init();
});