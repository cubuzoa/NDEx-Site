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

    delete localStorage.username;
    delete localStorage.password;
    delete localStorage.ndexJid;

    if (!Login.ViewModel.Username() || !Login.ViewModel.Password())
    {
      $.gritter.add({ title: "Invalid Input", text: "Username and password are required." });
      return;
    }

    ndexClient.authenticate(Login.ViewModel.Username(),
      Login.ViewModel.Password(),
      function(userData)
      {
        //TODO: Need to create an unsupported page to let the user know they
        //      need to upgrade their browser
        if (userData)
        {
          localStorage.username = userData.username;
          localStorage.password = userData.password;
          localStorage.ndexJid = userData.jid;
          window.location = "/viewUser/" + userData.jid
        }
        else
          $.gritter.add({ title: "Server Error", text: "An error occurred during authentication. Please try again later." });
      },
      function()
      {
        $.gritter.add({ title: "Unauthorized", text: "Invalid username or password." });
      }
    );
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