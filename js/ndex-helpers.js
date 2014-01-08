var NdexHelpers =
{
    /**************************************************************************
    * Converts a Knockout observable dictionary (which gets converted into an
    * array) into a standard JavaScript dictionary.
    **************************************************************************/
    convertObservableDictionaryToArray: function(observableDictionary)
    {
        if (typeof(observableDictionary.items) === "function")
            observableDictionary = ko.mapping.toJS(observableDictionary);

        var dictionary = {};
        for (var dataIndex = 0; dataIndex < observableDictionary.items.length; dataIndex++)
            dictionary[observableDictionary.items[dataIndex].key] = observableDictionary.items[dataIndex].value;

        return dictionary;
    }
};
