/*!
 * jQuery showPasswordTrigger plugin
 * A flexible jQuery plugin for revealing values of password inputs.
 *
 * https://github.com/toXXIc/jquery.showPasswordTrigger
 *
 * @version 1.1.0, 29-Jun-2012
 *
 * Copyright (c) 2012 Basil Gren
 * Released under the MIT license.
 */

(function ($) {

    var defaults = {
        trigger:null,
        triggerOnFocus:false,
        triggerInactiveClass:'',
        triggerActiveClass:'passVisible',
        onChange: null
    };

    // List of attributes to be cloned. Do not include "id" and "type".
    // Otherwise, the altPassword field may not behave or look like the password field.
    var CLONE_ATTRS = new Array("align", "disabled", "maxlength", "readonly", "size", "class",
        "dir", "lang", "style", "value", "title", "xml:lang", "onblur", "onchange", "onclick", "ondblclick",
        "onfocus", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onkeydown",
        "onkeypress", "onkeyup", "onselect");


    function isIE() {
        // Function $.browser is deprecated, so we'll try to detect browser using $.support
        // Tests 'noCloneChecked' and 'optSelected' return false for IE 7-9
        return !$.support.noCloneChecked && !$.support.optSelected;
    }


    function swapInputs($inputToHide, $inputToShow) {
        var value = $inputToHide.val(),
            isFocused = $inputToHide.is(':focus'), selection;

        if (isFocused)
            selection = getSelectionRange($inputToHide.get(0));

        // Strange, but show()/hide() didn't work. show() was setting display:block even
        // when display:inline was explicitly set before calling hide() for the element
        var cssDisplay = $inputToHide.css('display');
        $inputToHide.css('display', 'none');
        $inputToShow.css('display', cssDisplay);

        $inputToShow.val(value);
        if (isFocused) {
            // IE retard needs some time before focus can be set.
            if (isIE())
                setTimeout(function () {
                    $inputToShow.focus()
                }, 200);
            else
                $inputToShow.focus();

            setSelectionRange($inputToShow.get(0), selection.start, selection.end);
        }
    }


    function getSelectionRange(input) {
        var start, end;

        if (document.selection) {
            // IE Support, from http://flightschool.acylt.com/devnotes/caret-position-woes/
            input.focus();

            var oSel = document.selection.createRange();
            oSel.moveStart('character', -input.value.length);
            start = end = oSel.text.length; // Sorry, no selection restore for IE.
        }
        else {
            start = input.selectionStart;
            end = input.selectionEnd;
        }

        return {start:start, end:end};
    }


    function setSelectionRange(input, selectionStart, selectionEnd) {
        input.focus();
        // IE Support
        if (document.selection) {
            var range = input.createTextRange();
            range.collapse(true);
            range.moveEnd('character', selectionEnd);
            range.moveStart('character', selectionStart);
            range.select();
        }
        else
            input.setSelectionRange(selectionStart, selectionEnd);
    }


    // We should create it manually, because switching password visibility by changing input type attribute
    // does not work in IE.
    function createTextInput($input) {
        var altName = 'alt_' + $input.attr('name');
        var $copy = $('<input type="text" name="' + altName + '" id="' + altName + '" />');
        for (var attribute in CLONE_ATTRS) {
            var attrName = CLONE_ATTRS[attribute];
            var attrValue = $input.attr(attrName);
            if (attrValue !== undefined)
                $copy.attr(attrName, attrValue);
        }

        // Transfer some important events to original password control as they can be
        // bound by other plugins (live validators, beautifiers etc).
        jQuery.each("change blur focusout focusin keyup keydown keypress".split(' '),
            function (i, name) {
                $copy.bind(name, function () {
                    $input.trigger(name)
                });
            }
        );

        return $copy;
    }



    var ShowPasswordTrigger = function(input, options) {
        // 'Private' fields
        var $passwordInput, $textInput, $trigger;
        var passwordVisible = false;

        // Public methods
        this.showPassword = showPassword;
        this.hidePassword = hidePassword;
        this.togglePassword = togglePassword;

        init.apply(this);

        return this;

        // -----=====     Implementation     =====-----

        function init() {
            // Clone original input field.
            $passwordInput = $(input);

            // We should use copy of original element just because damn IE does not allow
            // change of input type at runtime. So all this mess-up is done just because of IE.
            $textInput = createTextInput($passwordInput);

            // Keep password value in sync with altPassword value
            var syncProc = function () {
                $passwordInput.val($textInput.val());
            };

            $textInput.change(syncProc);

            $textInput.hide();
            $textInput.insertAfter($passwordInput);

            // Bind handlers
            bindHandlers.apply(this);
        }


        function bindHandlers() {
            $trigger = null;
            if (!options.trigger) {
                if (options.triggerOnFocus) {
                    $passwordInput.focus(showPassword);
                    $textInput.blur(hidePassword);
                }
                else {
                    $passwordInput.mouseenter(showPassword);
                    $textInput.mouseleave(hidePassword);
                }
            }
            else {
                var $t = $(options.trigger);
                if ($t.length != 1)
                    return;

                $trigger = $t;

                if ($trigger.is('input[type="checkbox"]')) {
                    $trigger.change(function () {
                        $(this).is(':checked') ? showPassword() : hidePassword();
                    });
                }
                else {
                    $trigger.click(function () {
                        togglePassword();
                    });
                }

                updateTriggerClass();
            }
        }


        function updateTriggerClass() {
            if (!$trigger)
                return;

            if (passwordVisible) {
                $trigger.removeClass(options.triggerInactiveClass);
                $trigger.addClass(options.triggerActiveClass);
            }
            else {
                $trigger.removeClass(options.triggerActiveClass);
                $trigger.addClass(options.triggerInactiveClass);
            }
        }


        function setPasswordVisible(isVisible) {
            if (passwordVisible == isVisible)
                return;

            if (isVisible)
                swapInputs($passwordInput, $textInput);
            else
                swapInputs($textInput, $passwordInput);

            passwordVisible = isVisible;
            updateTriggerClass();

            if ($trigger && typeof options.onChange == "function")
                options.onChange($trigger, isVisible);
        }

        // API methods

        function showPassword() {
            setPasswordVisible(true);
        }


        function hidePassword() {
            setPasswordVisible(false);
        }

        function togglePassword() {
            setPasswordVisible(!passwordVisible);
        }
    };


    $.fn.showPasswordTrigger = function (options) {

        options = $.extend({}, defaults, options);

        return this.each(function () {
            var $passField = $(this);

            // Check input field type and name presence
            if (!$passField.attr('type') || $passField.attr('type') != 'password'
                || !$passField.attr('name'))
                return this;

            var $api = $.data(this, 'showPasswordTrigger');

            if (!$api) {
                $api = new ShowPasswordTrigger(this, options);
                $.data(this, 'showPasswordTrigger', $api);
            }


            return this;
        });
    };

})(jQuery);