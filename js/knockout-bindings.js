ko.bindingHandlers.isEditable =
{
    /****************************************************************************
    * Makes an element editable or not editable based on user permissions. The
    * valueAccessor parameter contains the ID of the object being viewed.
    ****************************************************************************/
    update: function(element, valueAccessor)
    {
        var objectId = ko.utils.unwrapObservable(valueAccessor()) || $(element).val();
        element = $(element);

        if (NdexWeb.ViewModel.User().id() === objectId)
        {
            element.removeAttr("readonly");
            return;
        }

        for (var groupIndex = 0; groupIndex < NdexWeb.ViewModel.User().groups().length; groupIndex++)
        {
            var group = NdexWeb.ViewModel.User().groups()[groupIndex];
            if (group.resourceId() === objectId && group.permissions() != "READ")
            {
                element.removeAttr("readonly");
                return;
            }
        }

        for (var networkIndex = 0; networkIndex < NdexWeb.ViewModel.User().networks().length; networkIndex++)
        {
            var network = NdexWeb.ViewModel.User().networks()[networkIndex];
            if (network.resourceId() === objectId && network.permissions() != "READ")
            {
                element.removeAttr("readonly");
                return;
            }
        }


        element.attr("readonly", true);
        element.css("cursor", "default");
    }
};
