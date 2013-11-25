var Feedback =
{
    ViewModel:
    {
        Text: ko.observable(),
        Type: ko.observable("Comment")
    },

    /****************************************************************************
    * Initialization.
    ****************************************************************************/
    _init: function()
    {
        ko.applyBindings(this.ViewModel, $("#frmFeedback")[0]);
        this.wireEvents();
    },

    /****************************************************************************
    * Submits the form to create a new user.
    ****************************************************************************/
    sendFeedback: function(event)
    {
        event.preventDefault();

        if (!Feedback.ViewModel.Text())
        {
            $.gritter.add({ title: "Input Validation", text: "You have no feedback!" });
            return;
        }

        NdexWeb.post("/feedback/" + Feedback.ViewModel.Type(),
            Feedback.ViewModel.Text(),
            function()
            {
                $.gritter.add({ title: "Feedback Submitted", text: "Your feedback has been submitted." });
            });
    },

    /****************************************************************************
    * Wires event-handlers to elements on the page.
    ****************************************************************************/
    wireEvents: function()
    {
        $("#frmFeedback").submit(this.sendFeedback);
    }
};

$(document).ready(function()
{
    Feedback._init();
})