/******************************************************************************
* Contains common functionality for the web client.
******************************************************************************/
var NdexWeb =
{
  ViewModel:
  {
    User: ko.computed(function()
    {
      return {
        jId: localStorage.ndexJid,
        Password: localStorage.password,
        Username: localStorage.username
      };
    })
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

$(document).ready(function()
{
  NdexWeb._init();
});
