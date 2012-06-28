About
=====

ShowPasswordTrigger is a jQuery plugin that can show passwords in password inputs.
The plugin provides several methods of revealing password:

* show the password when the mouse is over the password field
* show the password when the password field has focus
* show the password when the linked trigger element is clicked


Usage
-----

The plugin should be applied to input fields with `type="password"`. Several usage examples are provided below:

```js

    // Show password when mouse is over the #password_1
    $('#password_1').showPasswordTrigger();

    // Show password when #password_2 has focus
    $('#password_2').showPasswordTrigger({triggerOnFocus: true});

    // Show password when #password_3_checkox is checked
    $('#password_3').showPasswordTrigger({trigger: '#password_3_checkbox'})

    // Show password field when #password_4_trigger is clicked. Also override
    // trigger classes, so class 'passVisibleBtn' is added to the trigger
    // when password is visible and class 'passHiddenBtn' is added to the
    // trigger when password is hidden.
    // In specified onChange callback we can make any other manipulations with
    // trigger element
    $('#password_4').showPasswordTrigger({
            trigger:'#password_4_trigger',
            triggerActiveClass:'passVisibleBtn',
            triggerInactiveClass:'passHiddenBtn',
            onChange: function($trigger, isVisible) {
                $trigger.text(isVisible ? 'Hide password' : 'Show password');
            }
    });
```

You can see the demo in examples/index.html.


Plugin options
--------------

`trigger`
*Optional. Default: `null`.*
Should contain a selector of a single element which will toggle the password
visibility when the trigger element is clicked. If `trigger` option is omitted,
the password is revealed when the mouse is over the field or when the password
input has focus (see `triggerOnFocus` option).


`triggerOnFocus`
*Optional. Default: `false`.*
When set to true, the password will be revealed when the field has focus, otherwise
the password will be revealed when the mouse is over the field. Has no effect when
`trigger` option is specified.


`triggerActiveClass`
*Optional. Default: `""`.*
Specifies a class which will be added to the trigger element when the password
is visible. This option is taken into account only when `trigger` option is
specified.


`triggerInactiveClass`
*Optional. Default: `"passVisible"`.*
Specifies a class which will be added to the trigger element when the password
is hidden. This option is taken into account only when `trigger` option is
specified.

`onChange`
*Optional. Default: `null`.*
A callback function that will be called after password visibility is changed.
Two parameters are passed to this function: a jQuery object that contains trigger element
specified in `trigger` option and password visibility state (true - password is visible,
false - password is hidden).
This callback is called only if `trigger` option is specified.
