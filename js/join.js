var Join =
{
    ViewModel:
    {
        Username: ko.observable(),
        Password: ko.observable(),
        PasswordConfirmation: ko.observable(),
        Email: ko.observable()
    },

    /****************************************************************************
    * Initialization.
    ****************************************************************************/
    _init: function()
    {
        if (NdexWeb.ViewModel.User().Id)
        {
            window.location = "/editProfile";
            return;
        }

        ko.applyBindings(this.ViewModel, $("#frmJoin")[0]);
        this.wireEvents();
    },

    /****************************************************************************
    * Submits the form to create a new user.
    ****************************************************************************/
    submitForm: function(event)
    {
        event.preventDefault();

        if (Join.ViewModel.Password() !== Join.ViewModel.PasswordConfirmation())
        {
            $.gritter.add({ title: "Input Validation", text: "Passwords don't match." });
            return;
        }

        NdexWeb.put("/users",
            {
                username: Join.ViewModel.Username(),
                password: Join.ViewModel.Password(),
                email: Join.ViewModel.Email()
            },
            function(newUser)
            {
                if (newUser)
                {
                    localStorage.Username = Join.ViewModel.Username();
                    localStorage.Password = Join.ViewModel.Password();
                    localStorage.UserId = newUser.id;
                    window.location = "/editProfile";
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