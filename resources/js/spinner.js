/**
 * This module provides a spinner widget. Just call it on any container with `$('.container').spinner()`, then call `$('.container').spinner('destroy')` when you're done.
 */
'use strict';
// Use AMD loader if present, if not use global jQuery
((function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else {
    // Browser globals
    factory(root.jQuery);
  }
})(window, function ($) {
  $.widget('ce.spinner', {
    options: {
      // built-in options
      disabled: false,
    },

    // I typically use this as a place to reference all of the important
    // DOM nodes used by the widget
    nodes: {},

    // Called once on instantiation.
    _create: function () {
      this.nodes.$overlay = $(`<div class="logo-spinner-overlay">
          <div class="logo-spinner">
            <img src="/resources/img/crt_logo.png" alt=""/>
            <span class="gear1"></span>
            <span class="gear2"></span>
          </div>
        </div>
      `);
      $(this.element).append(this.nodes.$overlay)
    },

    _init: function () {
      this._trigger('initialized');
    },

    _setOptions: function (options) {
      this._super(options);

      //alternative place to handle option changes when multiple options change at the same time.
    },


    _destroy: function () {
      this.nodes.$overlay.fadeOut(500, function () {$(this).remove();});
    },

    // =========== Public methods to implement =============================


    disable: function () {
      // Do any custom logic for disabling here, then
      this._super();
    },

    enable: function () {
      // Do any custom logic for enabling here, then
      this._super();
    }

    // ============ Public methods provided by the base widget =============
    // instance() - Retrieves the widget's instance object. If the element
    //      doesn't have an instance, returns `undefined`.
    // option(optionName) - Gets the current value of `optionName`.
    // option() - Gets a copy of the current options hash
    // option(optionName, value) - Set an option. Supports inner-hash
    //      properties using dot notation, e.g. `show.duration`.
    // option(options) - Sets one or more options for the widget
    // widget() - Returns a jQuery object containing the original element
    //      or relevant generated element.

  });
  $(document).ce({});
}));
