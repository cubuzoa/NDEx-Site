/****************************************************************************
* jQuery Password Plugin
* Author: John Stegall
****************************************************************************/
(function($)
{
    $.fn.Password = function()
    {
        var parameters = arguments;

        //Maintain chainability because everyone likes the bondage
        return this.each(function()
        {
            //Who the hell does this developer think they are overriding the awesome,
            //minimalist default settings?
            if (parameters.length < 1 || typeof (parameters[0]) === "object")
                return Password._init($(this), parameters[0]);
        });
    }

    /****************************************************************************
    * The Password object.
    ****************************************************************************/
    var Password =
    {
        /**************************************************************************
        * Initialization.
        **************************************************************************/
        _init: function(targetElement, options)
        {
            var passwordOptions = $.extend(
                {
                    Confirmation:
                    {
                        ContainerCss: null,
                        ImageCss: null,
                        IsInvalidCallback: null,
                        IsValidCallback: null,
                        MatchUrl: null,
                        MismatchUrl: null,
                        TextBox: null,
                    },
                    ContainerCss: null,
                    Strength:
                    {
                        CssClass: null,
                        Display: true,
                        FairPattern: /^(?=.*[A-Za-z]+)(?=.*[0-9]+).{6,}$/,
                        GoodPattern: /^(?=.*[A-Z]+)(?=.*[a-z]+)(?=.*[0-9]+).{8,}$/,
                        StrongPattern: /^(?=.*[A-Z]+)(?=.*[a-z]+)(?=.*[0-9]+)(?=.*[^A-Za-z0-9 ]+).{8,}$/
                    },
                }, options);

            var passwordDiv = Password.wrapPasswordElement(targetElement, passwordOptions);

            if (!targetElement.data("Password"))
                targetElement.data("Password", passwordOptions);

            if (passwordOptions.Confirmation.TextBox)
            {
                Password.setupConfirmation(targetElement, passwordOptions.Confirmation);
                passwordOptions.Confirmation.TextBox.data("Password", passwordOptions);
                passwordOptions.Confirmation.TextBox.data("Password Target", targetElement);
            }

            if (passwordOptions.Strength.Display)
                Password.setupStrength(targetElement, passwordOptions.Strength);
        },

        /****************************************************************************
        * Nifty password UI and behaviors go BOOM.
        ****************************************************************************/
        _destroy: function()
        {
            var targetElement = $(this);
            var passwordOptions = targetElement.data("Password");

            targetElement.unwrap();
            targetElement.removeData("Password");

            if (passwordOptions.Confirmation.TextBox)
            {
                passwordOptions.Confirmation.TextBox.unwrap();
                passwordOptions.Confirmation.TextBox.removeData("Password");
                passwordOptions.Confirmation.TextBox.removeData("Password Target");
            }
        },

        /****************************************************************************
        * Configures the password confirmation UI and behaviors.
        ****************************************************************************/
        setupConfirmation: function(passwordElement, confirmationOptions)
        {
            if (typeof (confirmationOptions.TextBox) === "string")
                confirmationOptions.TextBox = $(confirmationOptions.TextBox);

            var containingDiv = $("<div />");
            containingDiv.css("display", "inline-block");
            containingDiv.css("position", "relative");
            confirmationOptions.TextBox.wrap(containingDiv);
            containingDiv = confirmationOptions.TextBox.parent();

            if (confirmationOptions.ContainerCss)
                containingDiv.addClass(confirmationOptions.ContainerCss);

            if (confirmationOptions.MatchUrl || confirmationOptions.MismatchUrl)
            {
                var confirmationImage = $("<img />");

                if (confirmationOptions.ImageCss)
                    confirmationImage.addClass(confirmationOptions.ImageCss);
                else
                {
                    confirmationImage.css("display", "none");
                    confirmationImage.css("margin-left", "2em");
                }

                confirmationImage.attr("src", confirmationOptions.MismatchUrl);
                containingDiv.append(confirmationImage);

                passwordElement.keyup(Password.updateConfirmation);
                confirmationOptions.TextBox.keyup(Password.updateConfirmation);
                confirmationOptions.TextBox.blur(function()
                {
                    confirmationImage.fadeOut();
                });
            }
        },

        /****************************************************************************
        * Configures the password UI for maximum stud muffin potential.
        ****************************************************************************/
        setupStrength: function(passwordElement, strengthOptions)
        {
            var strengthDiv = $("<div />");
            strengthDiv.css("display", "none");

            if (strengthOptions.CssClass)
                strengthDiv.addClass(strengthOptions.CssClass);

            strengthDiv.append($("<p><b>Strength:</b> <span>Weak</span></p>"));
            passwordElement.parent().append(strengthDiv);

            var meterDiv = $("<div />");
            meterDiv.css("background", "#F5F5F5");
            meterDiv.css("height", "5px");
            meterDiv.css("margin", "0.25em 0");

            var meterSpan = $("<span />");
            meterSpan.css("background", "#A00000");
            meterSpan.css("display", "block");
            meterSpan.css("height", "100%");
            meterSpan.css("width", "25%");

            meterDiv.append(meterSpan);
            strengthDiv.append(meterDiv);

            passwordElement.keyup(Password.updateStrength);
            passwordElement.blur(function()
            {
                strengthDiv.fadeOut();
            });
        },

        /****************************************************************************
        * Notifies the user of the error of their ways.
        ****************************************************************************/
        updateConfirmation: function()
        {
            var passwordElement;
            var confirmationElement;
            var passwordOptions = $(this).data("Password");

            if (this.id == passwordOptions.Confirmation.TextBox.attr("id"))
            {
                confirmationElement = $(this);
                passwordElement = confirmationElement.data("Password Target");
            }
            else
            {
                passwordElement = $(this);
                confirmationElement = passwordOptions.Confirmation.TextBox;
            }

            if (passwordElement.val().length + confirmationElement.val().length === 0)
                confirmationElement.next().fadeOut();
            else if (passwordElement.val() == confirmationElement.val())
            {
                confirmationElement.next().prop("src", passwordOptions.Confirmation.MatchUrl);
                confirmationElement.next().css("display", "inline-block");

                if (passwordOptions.Confirmation.IsValidCallback)
                    passwordOptions.Confirmation.IsValidCallback();
            }
            else
            {
                confirmationElement.next().prop("src", passwordOptions.Confirmation.MismatchUrl);
                confirmationElement.next().css("display", "inline-block");

                if (passwordOptions.Confirmation.IsInvalidCallback)
                    passwordOptions.Confirmation.IsInvalidCallback();

                if (!confirmationElement.next().is(":visible"))
                    confirmationElement.next().fadeIn();
            }
        },

        /****************************************************************************
        * Let's the user know how small or large their penis is.
        ****************************************************************************/
        updateStrength: function()
        {
            var passwordElement = $(this);
            var passwordOptions = passwordElement.data("Password");
            var strengthDiv = passwordElement.siblings("div");

            if (passwordOptions.Strength.StrongPattern.test(passwordElement.val()))
            {
                strengthDiv.find("p span").text("Strong");
                strengthDiv.find("div span").css("background", "#00A000");
                strengthDiv.find("div span").css("width", "100%");
            }
            else if (passwordOptions.Strength.GoodPattern.test(passwordElement.val()))
            {
                strengthDiv.find("p span").text("Moderate");
                strengthDiv.find("div span").css("background", "#0000A0");
                strengthDiv.find("div span").css("width", "75%");
            }
            else if (passwordOptions.Strength.FairPattern.test(passwordElement.val()))
            {
                strengthDiv.find("p span").text("Fair");
                strengthDiv.find("div span").css("background", "#FC3");
                strengthDiv.find("div span").css("width", "50%");
            }
            else
            {
                strengthDiv.find("p span").text("Weak");
                strengthDiv.find("div span").css("background", "#A00000");
                strengthDiv.find("div span").css("width", "25%");
            }

            if (!strengthDiv.is(":visible"))
                strengthDiv.fadeIn();
        },

        /****************************************************************************
        * Bubble wraps the password INPUT element in a containing DIV element.
        ****************************************************************************/
        wrapPasswordElement: function(targetElement, passwordOptions)
        {
            var containingDiv = $("<div />");
            containingDiv.css("display", "inline-block");
            containingDiv.css("position", "relative");

            if (passwordOptions.ContainerCss)
                containingDiv.addClass(passwordOptions.ContainerCss);

            targetElement.wrap(containingDiv);
            return targetElement.parent();
        }
    };
})(jQuery);