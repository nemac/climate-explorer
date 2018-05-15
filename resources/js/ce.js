/*
This module provides a central point to preserve state, perform basic routing (maybe?), and is the ONLY place that the page url history should be modified.
This module can additionally provide convenience methods that may be called on individual pages to quickly get state data relevant for them.

Individual pages are responsible for wiring up widgets/other modules to preserve state in this module.
This improves the separation of responsibilities between pages and the widgets/other modules they may use.

The jQuery widget factory has largely been outmoded by ES6 classes, but still provides a handful of useful boilerplate,
especially when it comes to interacting with the DOM and handling events.

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
  $.widget('ce.ce', {
    // ============ Properties on the base widget ==========================
    // defaultElement - an element to use when a widget instance is
    //      constructed without providing an element (`$.ns.widgetName();`)
    // document - a jquery object containing the `document` that contains
    //      the widget's element. Useful for iframe interaction.
    // element - a jquery object with the element on which the widget was
    //      instantiated. Each instance binds to a single node.
    // namespace - the location on the global jQuery object that stores the
    //      widget's prototype. A 'ui' namespace => `$.ui`.
    // options - The current options hash. User-provided options will be
    //      merged with default options on instantiation, with default
    //      options beind overwritten.
    // uuid - A unique int identifier for the widget
    // version - the string version of the widget
    // widgetEventPrefix - The prefix prepended to events fired from this
    //      widget. Defaults to the widget's name. (Deprecated)
    // widgetFullName - The full name, including namespace, with a dash
    //      between namespace and widget name (e.g. ui-draggable).
    // widgetName - The name of the widget
    // window - a jQuery object containing the `window` that contains the
    //      widget. Useful for iframe interaction.

    // =========== Private methods provided by the base widgetn ============
    // _delay(fn[, delay=0]) - calls fn after the delay with `this` context
    // _focusable(element) - set up element to apply ui-state-focus on focus
    //      event handlers are cleaned up on destroy
    // _hide(element, option[, callback]) - Hides an element according to
    //      the current value of the `hide` option
    // _hoverable(element) - Set up element to apply ui-state-hover on hover
    //      event handlers are cleaned up on destroy
    // _off(element, eventName) - Unbinds the handlers for the specified
    //      event types from the specified element(s)
    // _on([suppressDisabledCheck][, element][, handlers]) - Binds event
    //      handlers to the specified elements. Delegation is supported
    //      via selectors inside the event names, e.g. 'click .foo'. The
    //      `_on` method provides several benefits of direct binding:
    //          * Maintains proper `this` inside handlers
    //          * Automatically handles disabled widgets: If widget is
    //              disabled or event occurs on an element with the class
    //              'ui-state-disabled', the handler is not invoked. Can
    //              be overridden with the suppressDisabledCheck parameter.
    //          * Event handlers are automatically namespaced and cleaned
    //              up on destroy
    //      Example:
    //      this._on( this.element, {
    //          'click a': function(event) {
    //              event.preventDefault();
    //          }
    //      });
    // _setOptions(key, value) - Called when the `option` method is called.
    //      Can be overridden to batch process processor-intensive changes
    // _show(element, option[, callback]) - Shows an element according to
    //      the current value of the `show` option
    // _super([arg1][,...]) - Invokes the method of the same name from the
    //      parent widget, with any specified arguments. Basically `.call`
    // _superApply(arguments) - The `apply` version of `_super`
    // _trigger(type[, event][, data]) - Triggers an event and its callback.
    //      ***** VERY IMPORTANT *****
    //      THE OPTION WITH THE NAME EQUAL TO `TYPE` IS INVOKED AS CALLBACK.
    //      ***** VERY IMPORTANT *****
    //      The event name is the lowercase concatenation of the widget
    //      name and type. If you want to provide data you must pass all
    //      three arguments - pass null if there's no event to pass along.
    //      If the default action is prevented, `false` will be returned,
    //      otherwise `true`. Preventing the default occurs when the handler
    //      returns `false` or calls `event.preventDefault();`
    //

    options: {
      // Controls debug output
      // 0:off, 1:errors only, 2:errors and warnings, 3:everything
      debug: 0,
      logger: console,
      // built-in options
      disabled: false,
      // if and how to animate the hiding of the element
      // http://api.jqueryui.com/jQuery.widget/#option-hide
      hide: null,
      // likewise for show
      // http://api.jqueryui.com/jQuery.widget/#option-show
      show: null
    },

    // I typically use this as a place to reference all of the important
    // DOM nodes used by the widget
    nodes: {},

    // Called once on instantiation.
    _create: function () {
      this.updateSharing();
      this.updateBreadcrumbs();
    },

    // Optional -Return value will be sent as the `create` event's data.
    // _getCreateEventData: function() {

    // },

    // If you need to programmatically create your options, this method
    // allows you to do so. User provided options take highest precedence,
    // then the output of this function, then the options hash is last.
    // _getCreateOptions: function() {

    // },

    // Init is automatically invoked after create, and again every time the
    //  widget is invoked with no arguments after that
    _init: function () {
      this._trigger('initialized');
    },

    // Allows the widget to react to option changes. Any custom behaviors
    // can be configured here.
    _setOption: function (key, value) {
      // This will actually update the value in the options hash
      this._super(key, value);
      // And now we can act on that change
      switch (key) {
        // Not necessary in all cases, but likely enough to me to include it here
        case "state":
          this._init();
          break;
      }
    },

    _setOptions: function (options) {
      this._super(options);

      //alternative place to handle option changes when multiple options change at the same time.
    },

    getUrlParam: function (key) {
      var params = decodeURIComponent(window.location.search.substring(1)).split("&"),
        param,
        i;

      for (i = 0; i < params.length; i++) {
        param = params[i].split('=');

        if (param[0] === key) {
          return param[1] || true;
        }
      }

      return undefined;
    },

    /**
     * Gets url parameters and re-keys them as specified by params
     * @param {Object} params - An object with newkey:oldkey key:value pairs
     */
    getUrlParams: function (params) {
      var results = {};

      Object.keys(params).forEach(function (newkey) {
        if (this.getUrlParam(params[newkey]) !== undefined) {
          results[newkey] = this.getUrlParam(params[newkey])
        }
      }.bind(this));
      return results;
    },

    // Replaces all URL params with the passed array
    // params is a nested array of objects with the keys "key" and "value"
    setUrlParams: function (params) {
      var href = window.location.href.split("?")[0],
        i;

      if (params.length === 0) return;
      if (window.hasOwnProperty("history") === false || window.history.replaceState === false) return;


      for (i = 0; i < params.length; i++) {
        params[i] = encodeURIComponent(params[i].key) + "=" + encodeURIComponent(params[i].value);
      }

      window.history.replaceState({}, "", href + "?" + params.join("&"));
      this.updateSharing();
      this.updateBreadcrumbs();
    },

    // Replaces specified URL param with the passed value
    setUrlParam: function (key, value) {
      var currentParams = window.location.search.substring(1),
        newParams,
        params = decodeURIComponent(currentParams).split("&"),
        param,
        href = window.location.href.split("?")[0],
        paramExists = false,
        i, l;

      if (window.hasOwnProperty("history") === false || window.history.replaceState === false) return;

      if (value === null || value === undefined || value === false) {
          this.removeUrlParam(key);
          return;
      }

      for (i = 0, l = params.length; i < l; i++) {
        if (params[i] === "") {
          params.splice(i, 1);
          i--;
          l--;
          continue;
        }

        param = params[i].split('=');

        if (param[0] === key) {
          param[1] = value;
          paramExists = true;
        }

        params[i] = encodeURIComponent(param[0]) + "=" + encodeURIComponent(param[1]);
      }

      if (!paramExists && key && value) {
        params.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
      }

      newParams = params.join("&");
      if (newParams !== currentParams) {
        window.history.replaceState({}, "", href + "?" + newParams);
      }
      this.updateSharing();
      this.updateBreadcrumbs();
    },

    // Removes specified URL param
    removeUrlParam: function (key) {
      var params = decodeURIComponent(window.location.search.substring(1)).split("&"),
        param,
        newParams = [],
        href = window.location.href.split("?")[0],
        i;

      if (window.hasOwnProperty("history") === false || window.history.replaceState === false) return;

      for (i = 0; i < params.length; i++) {
        param = params[i].split('=');

        if (param[0] === key) {
          continue;
        }

        newParams.push(encodeURIComponent(param[0]) + "=" + encodeURIComponent(param[1]));
      }

      if (params.length !== newParams.length) {
        window.history.replaceState({}, "", href + "?" + newParams.join("&"));
      }
    },

    _extentToString: function (extent) {
      return extent.xmin + "," + extent.xmax + "," + extent.ymin + "," + extent.ymax;
    },

    // expects string with 4 comma separated values
    _extentToObject: function (extent) {
      extent = extent.split(",");
      return {
        xmin: extent[0],
        xmax: extent[1],
        ymin: extent[2],
        ymax: extent[3]
      };
    },

    //todo write public getters for state variables
    getStationsMapState: function () {
      var state = this.getUrlParams({
        mode: 'id',
        stationId: 'station',
        variable: 'variable',

        extent: 'extent',
        lat: 'lat',
        lon: 'lon',
        zoom: 'zoom'
      });
      if (state.lat && state.lon) {
        state.center = [state.lat, state.lon]
      }
      if (state.extent) {state.extent = this._extentToObject(state.extent);}

      return state
    },
    setStationsMapState: function (state) {
      (Object.keys(state).includes('stationId') && state.stationId) ? this.setUrlParam('station', state['stationId']) :
        this.removeUrlParam('station');
      Object.keys(state).includes('mode') ? this.setUrlParam('id', state['mode']) :
        this.removeUrlParam('station'); // on mode change overlay goes away
      Object.keys(state).includes('extent') ? this.setUrlParam('extent', this._extentToString(state['extent'])) :
        null;
      Object.keys(state).includes('zoom') ? this.setUrlParam('zoom', state['zoom']) :
        null;
    },

    getVariablesPageState: function () {
      var state = this.getUrlParams({
        variable: 'id',
        season: 'season',
        leftScenario: 'left',
        rightScenario: 'right',
        extent: 'extent',
        lat: 'lat',
        lon: 'lon',
        zoom: 'zoom'
      });
      if (state.lat && state.lon) {
        state.center = [ state.lon, state.lat]
      }
      if (state.extent) {state.extent = this._extentToObject(state.extent);}

      return state;
    },
    setVariablesMapState: function (state) {
      Object.keys(state).includes('variable') ? this.setUrlParam('id', state['variable']) :
        null;
      Object.keys(state).includes('season') ? this.setUrlParam('season', state['season']) :
        null;
      Object.keys(state).includes('leftScenario') ? this.setUrlParam('left', state['leftScenario']) :
        null;
      Object.keys(state).includes('leftYear') ? this.setUrlParam('leftyear', state['leftYear']) :
        null;
      Object.keys(state).includes('rightScenario') ? this.setUrlParam('right', state['rightScenario']) :
        null;
      Object.keys(state).includes('rightYear') ? this.setUrlParam('rightyear', state['rightYear']) :
        null;
      Object.keys(state).includes('extent') ? this.setUrlParam('extent', this._extentToString(state['extent'])) :
        null;
      Object.keys(state).includes('zoom') ? this.setUrlParam('zoom', state['zoom']) :
        null;
//      Object.keys(state).includes('mode') ? this.setUrlParam('id', state['mode']) :
//        this.removeUrlParam('station'); // on mode change overlay goes away
    },

    // called using `$(window).ce('getMapState')`...and maybe `window.ce.getMapState` if that's easier
    getMapState: function () {
      return {
        lat: this.state.lat,
        lon: this.state.lon,
        zoom: this.state.zoom,
      };
    },


    getLocationPageState: function () {
      var state = this.getUrlParams({
        county: 'county',
        city: 'city',
        fips: 'fips',
        extent: 'extent',
        lat: 'lat',
        lon: 'lon',
        zoom: 'zoom'
      });
      if (state.lat && state.lon) { state.center = [state.lon,state.lat] }

      if (state.county) { state.county = state.county.replace(/\+/g, ' '); }
      if (state.city) { state.city = state.city.replace(/\+/g, ' '); }
      if (state.extent) state.extent = this._extentToObject(state.extent);

      return state;
    },


    // These 3 methods give you an easy way to control debug messages
    _log: function () { (this.options.debug === 3) && this._toLoggerMethod('log', arguments); },
    _warn: function () { (this.options.debug >= 2) && this._toLoggerMethod('warn', arguments); },
    _error: function () { (this.options.debug >= 1) && this._toLoggerMethod('error', arguments); },
    _toLoggerMethod: function (method, args) {
      var args = Array.prototype.slice.call(arguments, 1),
        logger = this.options.logger || console;
      logger.error.apply(logger, args);
    },

    updateSharing: function () {
      $('#share_facebook').prop('href', 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href));
      $('#share_twitter').prop('href', 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(window.location.href));
      $('#share_link').val(window.location.href);
    },

    updateBreadcrumbs: function () {
      if (window.location.pathname === '/') return;

      var breadcrumb_text,
        additional_breadcrumb;

      var page = window.location.pathname.split("/").filter(function (p) {return p !== ""}).pop().replace(".php", "");

      if (!page) return;

      switch (page) {
        case 'location':
          breadcrumb_text = this.getUrlParam('city') || "";
          breadcrumb_text = breadcrumb_text.replace(/\+/g, " ");
          additional_breadcrumb = '<a href="#nav-search" class="parent launch-nav breadcrumb-middle" data-nav-slide="0"><span class="icon icon-district"></span>Location</a>';
          break;
        case 'about':
          breadcrumb_text = 'About';
          break;
        case 'definitions':
          breadcrumb_text = 'Definitions';
          break;
        case 'credits':
          breadcrumb_text = 'Credits';
          break;
        case 'stations':
          breadcrumb_text = this.getUrlParam('id') || "";
          breadcrumb_text = breadcrumb_text.replace(/\_/g, " ").replace(/\w\S*/g, function (txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});

          additional_breadcrumb = '<a href="#nav-stations" class="parent launch-nav breadcrumb-middle" data-nav-slide="2"><span class="icon icon-bubble"></span>Stations</a>';
          break;
        case 'variables':
          breadcrumb_text = this._getVariableBreadcrumb(this.getUrlParam('id') || 'tmax');
          additional_breadcrumb = '<a href="#nav-variables" class="parent launch-nav breadcrumb-middle" data-nav-slide="1"><span class="icon icon-bubble"></span>Variable</a>';
      }

      $(".current").text(breadcrumb_text);
      if (additional_breadcrumb && $(".breadcrumb-middle").length === 0) {
        $(".current").before(additional_breadcrumb);
      }
    },

    // recreates list of variables found in scenarioComparisonMap.js
    _getVariableBreadcrumb: function (key) {
      var variables = {
        'tmax': {title: 'Avg Daily Max Temp (°F)', seasonal_data: true},
        'tmin': {title: 'Avg Daily Min Temp (°F)', seasonal_data: true},
        'days_tmax_gt_90f': {title: 'Days w/ max > 90°F', seasonal_data: false},
        'days_tmax_gt_95f': {title: 'Days w/ max > 95°F', seasonal_data: false},
        'days_tmax_gt_100f': {title: 'Days w/ max > 100°F', seasonal_data: false},
        'days_tmax_gt_105f': {title: 'Days w/ max > 105°F', seasonal_data: false},
        'days_tmax_lt_32f': {title: 'Days w/ max < 32°F', seasonal_data: false},
        'days_tmin_lt_32f': {title: 'Days w/ min < 32°F', seasonal_data: false},
        'days_tmin_gt_80f': {title: 'Days w/ min > 80°F', seasonal_data: false},
        'days_tmin_gt_90f': {title: 'Days w/ min > 90°F', seasonal_data: false},
        'pcpn': {title: 'Total Precipitation', seasonal_data: true},
        'days_pcpn_gt_1in': {title: 'Days w/ > 1 in', seasonal_data: false},
        'days_pcpn_gt_2in': {title: 'Days w/ > 2 in', seasonal_data: false},
        'days_pcpn_gt_3in': {title: 'Days w/ > 3 in', seasonal_data: false},
        'days_dry_days': {title: 'Dry Days', seasonal_data: false},
        'hdd_65f': {title: 'Heating Degree Days', seasonal_data: false},
        'cdd_65f': {title: 'Cooling Degree Days', seasonal_data: false},
        'gdd': {title: 'Growing Degree Days', seasonal_data: false},
        'gddmod': {title: 'Mod. Growing Degree Days', seasonal_data: false}
      }

      return variables[key].title;
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
}));
$(function () {
  window.ce = $(window).ce({});
});

