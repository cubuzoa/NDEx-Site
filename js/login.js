var Login =
{
    ViewModel:
    {
        Username: ko.observable(),
        Password: ko.observable()
    },

    /****************************************************************************
    * Initialization.
    ****************************************************************************/
    _init: function()
    {
        ko.applyBindings(Login.ViewModel, $("#frmLogin")[0]);
        this.wireEvents();
    },

    /****************************************************************************
    * Submits the user's credentials to the server for authentication.
    ****************************************************************************/
    submitCredentials: function(event)
    {
        event.preventDefault();

        if (typeof(Storage) === "undefined")
        {
            $.gritter.add({ title: "Unsupported Browser", text: "Your browser isn't supported; you'll need to upgrade it to use this site." });
            return;
        }

        delete localStorage.Username;
        delete localStorage.Password;
        delete localStorage.UserId;

        if (!Login.ViewModel.Username() || !Login.ViewModel.Password())
        {
            $.gritter.add({ title: "Invalid Input", text: "Username and password are required." });
            return;
        }

        $.ajax(
        {
            type: "GET",
            url: NdexWeb.ApiHost + "/users/" + Login.ViewModel.Username(),
            dataType: "JSON",
            beforeSend: function(xhr)
            {
                xhr.setRequestHeader("Authorization",
                    "Basic " + btoa(Login.ViewModel.Username() + ":" + Login.ViewModel.Password()));
            },
            success: function(userData)
            {
                //TODO: Need to create an unsupported page to let the user know they need to upgrade their browser
                if (userData)
                {
                    localStorage.Username = userData.username;
                    localStorage.Password = Login.ViewModel.Password();
                    localStorage.UserId = userData.id;
                    window.location = "/user/" + userData.id
                }
                else
                    $.gritter.add({ title: "Server Error", text: "An error occurred during authentication. Please try again later." });
            },
            error: function()
            {
                $.gritter.add({ title: "Unauthorized", text: "Invalid username or password." });
            }
        });
    },

    /****************************************************************************
    * Wires event-handlers to elements on the page.
    ****************************************************************************/
    wireEvents: function()
    {
        $("#frmLogin").submit(this.submitCredentials);
    }
};

$(document).ready(function()
{
    Login._init();
});