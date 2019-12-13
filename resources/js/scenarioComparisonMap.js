'use strict';
// Use AMD loader if present, if not use global jQuery

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else {
    // Browser globals
    factory(root.jQuery);
  }
})(window, function ($) {
  $.widget('ce.scenarioComparisonMap', {

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
    //      options being overwritten.
    // uuid - A unique int identifier for the widget
    // version - the string version of the widget
    // widgetEventPrefix - The prefix prepended to events fired from this
    //      widget. Defaults to the widget's name. (Deprecated)
    // widgetFullName - The full name, including namespace, with a dash
    //      between namespace and widget name (e.g. ui-draggable).
    // widgetName - The name of the widget
    // window - a jQuery object containing the `window` that contains the
    //      widget. Useful for iframe interaction.

    // =========== Private methods provided by the base widget ============
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
      state: null,
      county: null,

      countyName: '',
      stateName: '',
      variable: 'tmax', //required
      season: null,
      leftScenario: null, // 'historical', 'rcp85','rcp45'
      rightScenario: null, // 'historical', 'rcp85','rcp45'
      leftYear: null, //1950 - 2100
      rightYear: null, //1950 - 2100
      leftOpacity: 1,
      rightOpacity: 1,
      showCounties: true,
      defaultExtent: { xmin: -119, xmax: -73, ymin: 18, ymax: 54 },
      constrainMapToExtent: { xmin: -185, xmax: -62, ymin: 16, ymax: 75 },
      //extent provides the initial view area of the map.
      extent: null,
      //zoom and center are ignored if extent is provided.
      zoom: null, // Ex: 5
      center: null, // Ex: [-98.21, 37.42]
      swipeX: null,
      // Additional elements
      legendContainerId: "legend-container",
      //Map reference layers
      statesLayerURL: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_States_Generalized/FeatureServer/0',
      countiesLayerURL: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Counties_Generalized/FeatureServer/0',
      // Controls debug output
      // 0:off, 1:errors only, 2:errors and warnings, 3:everything
      debug: 3,
      logger: console,
      // built-in options
      disabled: false,
      animateIntro: true,
      scenarios: {
        'historical': {
          title: "Historical",
          tilesURL: "https://climate-explorer.fernleafinteractive.com/webtiles/hist/{variable}/{season_month}/{level}/{col}/{row}.png",
          tilesTMS: true,
          years: [{ value: 'avg', label: '1961-1990 Average' }],
          defaultYear: 'avg',
          min_zoom_level: 3,
          max_zoom_level: 6
        },
        'rcp45': {
          title: 'Lower Emissions',
          tilesURL: "https://climate-explorer.fernleafinteractive.com/webtiles/rcp45/{variable}/{year}/{season_month}/{level}/{col}/{row}.png",
          tilesTMS: true,
          years: [
          // {value: '2010', label: '2010'},
          { value: '2020s', label: "2020s" }, { value: '2030s', label: "2030s" }, { value: '2040s', label: "2040s" }, { value: '2050s', label: "2050s" }, { value: '2060s', label: "2060s" }, { value: '2070s', label: "2070s" }, { value: '2080s', label: "2080s" }, { value: '2090s', label: "2090s" }],
          defaultYear: '2090s',
          min_zoom_level: 3,
          max_zoom_level: 6
        },
        'rcp85': {
          title: 'Higher Emissions',
          tilesURL: "https://climate-explorer.fernleafinteractive.com/webtiles/rcp85/{variable}/{year}/{season_month}/{level}/{col}/{row}.png",
          tilesTMS: true,
          years: [
          // {value: '2010', label: '2010'},
          { value: '2020s', label: "2020s" }, { value: '2030s', label: "2030s" }, { value: '2040s', label: "2040s" }, { value: '2050s', label: "2050s" }, { value: '2060s', label: "2060s" }, { value: '2070s', label: "2070s" }, { value: '2080s', label: "2080s" }, { value: '2090s', label: "2090s" }],
          defaultYear: '2090s',
          min_zoom_level: 3,
          max_zoom_level: 6
        }
      },
      variables: {
        'tmax': {
          title: 'Avg Daily Max Temp (°F)',
          seasonal_data: true,
          defaultConfig: {
            leftScenario: 'historical',
            rightScenario: 'rcp85',
            season: 'annual'
          },
          legend_unit: '&deg;Fahrenheit'
        },
        'tmin': {
          title: 'Avg Daily Min Temp (°F)',
          seasonal_data: true,
          defaultConfig: {
            leftScenario: 'historical',
            rightScenario: 'rcp85',
            season: 'annual',
          },
          legend_unit: '&deg;Fahrenheit'
        },
        'days_tmax_gt_90f': {
          title: 'Days w/ max > 90°F',
          seasonal_data: false,
          defaultConfig: {
            leftScenario: 'historical',
            rightScenario: 'rcp85',
          },
          legend_unit: 'Days'
        },
        'days_tmax_gt_95f': {
          title: 'Days w/ max > 95°F',
          seasonal_data: false,
          defaultConfig: {
            leftScenario: 'historical',
            rightScenario: 'rcp85',
          },
          legend_unit: 'Days'
        },
        'days_tmax_gt_100f': {
          title: 'Days w/ max > 100°F',
          seasonal_data: false,
          defaultConfig: {
            leftScenario: 'historical',
            rightScenario: 'rcp85',
          },
          legend_unit: 'Days'
        },
        'days_tmax_gt_105f': {
          title: 'Days w/ max > 105°F',
          seasonal_data: false,
          defaultConfig: {
            leftScenario: 'historical',
            rightScenario: 'rcp85',
          },
          legend_unit: 'Days'
        },

        'days_tmax_lt_32f': {
          title: 'Days w/ max < 32°F',
          seasonal_data: false,
          defaultConfig: {
            leftScenario: 'historical',
            rightScenario: 'rcp85',
          },
          legend_unit: 'Days'
        },
        'days_tmin_lt_32f': {
          title: 'Days w/ min < 32°F',
          seasonal_data: false,
          defaultConfig: {
            leftScenario: 'historical',
            rightScenario: 'rcp85',
          },
          legend_unit: 'Days'
        },

        'days_tmin_gt_80f': {
          title: 'Days w/ min > 80°F',
          seasonal_data: false,
          defaultConfig: {
            leftScenario: 'historical',
            rightScenario: 'rcp85',
          },
          legend_unit: 'Days'
        },
        'days_tmin_gt_90f': {
          title: 'Days w/ min > 90°F',
          seasonal_data: false,
          defaultConfig: {
            leftScenario: 'historical',
            rightScenario: 'rcp85',
          },
          legend_unit: 'Days'
        },
        'pcpn': {
          title: 'Total Precipitation',
          seasonal_data: true,
          defaultConfig: {
            leftScenario: 'rcp45',
            rightScenario: 'rcp85',
            season: 'annual'
          },
          disabledScenarios: ['historical'],
          legend_unit: '% Change',
          legend_note: 'Note: Maps are anomalies from 1961-1990 baseline'
        },
        'days_pcpn_gt_1in': {
          title: 'Days w/ > 1 in',
          seasonal_data: false,
          defaultConfig: {
            leftScenario: 'historical',
            rightScenario: 'rcp85',
          },
          legend_unit: '% Change',
          legend_note: 'Note: Maps are anomalies from 1961-1990 baseline'

        },
        'days_pcpn_gt_2in': {
          title: 'Days w/ > 2 in',
          seasonal_data: false,
          defaultConfig: {
            leftScenario: 'historical',
            rightScenario: 'rcp85',
          },
          legend_unit: '% Change',
          legend_note: 'Note: Maps are anomalies from 1961-1990 baseline'
        },
        'days_pcpn_gt_3in': {
          title: 'Days w/ > 3 in',
          seasonal_data: false,
          defaultConfig: {
            leftScenario: 'historical',
            rightScenario: 'rcp85',
          },
          legend_unit: '% Change',
          legend_note: 'Note: Maps are anomalies from 1961-1990 baseline'

        },
        'days_dry_days': {
          title: 'Dry Days',
          seasonal_data: false,
          defaultConfig: {
            leftScenario: 'rcp45',
            rightScenario: 'rcp85',
          },
          disabledScenarios: ['historical'],
          legend_unit: 'Degree Days',
        },
        'hdd_65f': {
          title: 'Heating Degree Days',
          seasonal_data: false,
          defaultConfig: {
            leftScenario: 'historical',
            rightScenario: 'rcp85',
          },
          legend_unit: 'Degree Days',
        },
        'cdd_65f': {
          title: 'Cooling Degree Days',
          seasonal_data: false,
          defaultConfig: {
            leftScenario: 'historical',
            rightScenario: 'rcp85',
          },
          legend_unit: 'Degree Days',
        },
        'gdd': {
          title: 'Growing Degree Days',
          seasonal_data: false,
          defaultConfig: {
            leftScenario: 'historical',
            rightScenario: 'rcp85',
          },
          legend_unit: 'Degree Days',
        },
        'gddmod': {
          title: 'Mod. Growing Degree Days',
          seasonal_data: false,
          defaultConfig: {
            leftScenario: 'historical',
            rightScenario: 'rcp85',
          },
          legend_unit: 'Degree Days',
        }
      },
      season_months: {'winter':'01', 'spring':'04','summer':'07','fall':'10','annual':'annual'}
    },

    // Dojo modules this widget expects to use.
    dojoDeps: ['esri/Map', 'esri/views/MapView', 'esri/layers/FeatureLayer', 'esri/layers/support/Field', 'esri/layers/WebTileLayer', 'esri/layers/TileLayer',
    // 'esri/widgets/BasemapToggle',
    // 'esri/renderers/SimpleRenderer',
    'esri/Graphic',
    // 'esri/symbols/WebStyleSymbol',
    'esri/symbols/SimpleFillSymbol', 'esri/widgets/Legend', 'esri/widgets/Expand',
    // 'esri/widgets/OpacitySlider',
    // 'esri/widgets/ColorSlider',
    // 'esri/widgets/BasemapGallery',
    'esri/widgets/ScaleBar', 'esri/geometry/SpatialReference',
    // 'esri/layers/CSVLayer',
    'esri/geometry/Extent', 'esri/geometry/Point', 'esri/geometry/Polygon', 'esri/widgets/Locate', 'esri/core/watchUtils', 'esri/geometry/support/webMercatorUtils'],
    // recreated in ce.js for the purposes of breadcrumbs


    _dojoLoaded: function _dojoLoaded() {
      if (this.dojoMods === undefined) {
        return false;
      }
      for (var i = 0; i < this.dojoDeps; i++) {
        if (!this.dojoMods.hasOwnProperty(this.dojoDeps[i][i].split('/').pop())) {
          return false;
        }
      }
      return true;
    },

    /**
     * Promise which resolves when dojo dependencies are loaded.
     * @resolve null
     * @private
     */
    _whenDojoLoaded: function _whenDojoLoaded() {
      if (undefined !== this._dojoLoadedPromise) {
        return this._dojoLoadedPromise;
      }
      if (this._dojoLoaded()) {
        return Promise.resolve().catch(this._log.bind(this));
      }

      this._dojoLoadedPromise = new Promise(function (resolve, reject) {
        if (window.require === undefined) {
          window.dojoConfig = {
            has: {
              "esri-promise-compatibility": 1,
              "esri-promise-compatibility-deprecation-warnings": 0
            },
            async: 1,
            deps: this.dojoDeps
          };

          var arcgisStyles = document.createElement("link");
          arcgisStyles.rel = 'stylesheet';
          arcgisStyles.href = 'https://js.arcgis.com/4.9/esri/css/main.css';
          document.head.appendChild(arcgisStyles);
          var arcgisScripts = document.createElement("script");
          arcgisScripts.type = "text/javascript";
          arcgisScripts.src = "https://js.arcgis.com/4.9/";
          document.head.appendChild(arcgisScripts);
          arcgisScripts.addEventListener('load', function (resolve) {
            this._registerDojoMods(resolve);
          }.bind(this, resolve));
        } else {
          this._registerDojoMods(resolve);
        }
      }.bind(this)).catch(this._log.bind(this));
      return this._dojoLoadedPromise;
    },
    /**
     *
     * @private
     */
    _registerDojoMods: function _registerDojoMods(resolve) {
      require(this.dojoDeps, function (resolve) {
        //get the list of modules
        var mods = Array.prototype.slice.call(arguments, 1);
        this.dojoMods = {};
        // preserve the modules on this.dojoMods for later reference.

        for (var i = 0; i < mods.length; i++) {
          this.dojoMods[this.dojoDeps[i].split('/').pop()] = mods[i];
        }
        resolve();
      }.bind(this, resolve));
    },
    // Called once on instantiation.
    _create: function _create() {
      var _this = this;

      // All DOM nodes used by the widget (must be maintained for clean destruction)
      this.nodes = {};

      this.leftLayer = null;
      this.rightLayer = null;

      this.nodes.mapContainer = this.element[0];
      this.nodes.stationOverlayContainer = $('#' + this.options.stationOverlayContainerId)[0];

      this.options.variable = this.options.variable || 'tmax';

      if (this.options.leftScenario === undefined || this.options.rightScenario === null || (this.options.variables[this.options.variable].disabledScenarios || []).includes(this.options.leftScenario)) {
        this.options.leftScenario = this.options.variables[this.options.variable].defaultConfig.leftScenario;
      }

      if (this.options.rightScenario === undefined || this.options.rightScenario === null || this.options.rightScenario === null || (this.options.variables[this.options.variable].disabledScenarios || []).includes(this.options.rightScenario)) {
        this.options.rightScenario = this.options.variables[this.options.variable].defaultConfig.rightScenario;
      }

      if (undefined === this.options.leftYear || this.options.leftYear === null || !this.options.scenarios[this.options.leftScenario].years.find(function (v) {
        return v.value === _this.options.leftYear;
      })) {
        this.options.leftYear = this.options.scenarios[this.options.leftScenario].defaultYear;
      }
      if (undefined === this.options.rightYear || this.options.rightYear === null || !this.options.scenarios[this.options.rightScenario].years.find(function (v) {
        return v.value === _this.options.rightYear;
      })) {
        this.options.rightYear = this.options.scenarios[this.options.rightScenario].defaultYear;
      }
      this.options.season = this.options.season || this.options.variables[this.options.variable].defaultConfig.season;

      this._mapInitPromise = this._whenDojoLoaded().then(this._initMap.bind(this)).catch(this._log.bind(this));
      this._initControlsOverlay();

      var layerPromises = [this._whenDojoLoaded().then(this._updateScenarioLayers.bind(this)), this._whenDojoLoaded().then(this._initStatesLayer.bind(this))];
      if (this.options.showCounties) {
        layerPromises.push(this._whenDojoLoaded().then(this._updateCountiesLayer.bind(this)));
      }
      return Promise.all(layerPromises).then(this._trigger.bind(this, 'layersloaded', null, null));
    },
    _initControlsOverlay: function _initControlsOverlay() {
      this.nodes.$controlsOverLayContainer = $('<div>', { 'class': 'scenario-map-overlay-container' });
      this.nodes.$controlsOverLayContainer.append('        \n        <div class="movable slider-div">\n          <div class="handle"></div>\n        </div>\n        <div class="bottom-scenario-controls">\n          <div class="left-scenario-controls">\n            <div class="left-scenario-dropdown">\n              <div id="leftScenario-select-wrapper" class="rounded-choice-box padding-horrizontal-half padding-vertical-half default-btn-height d-flex-center width-100">\n<div class="select leftScenario-select">\n  <div id="leftScenario-select-vis" class="select-styled" rel="historical">Historical</div>\n  <ul class="select-options">\n    <li id="leftScenario-select" rel="historical" class="default-select-option leftScenario-option-historical">Historical</li>\n    <li id="leftScenario-select" rel="rcp45" class="default-select-option leftScenario-option-lower">Lower Emissions</li>\n  </ul>\n</div>\n</div>\n           </div>\n            <div class="year left-year-slider-container">\n              <div class="year-label year-min"></div>\n              <div class="left-year-slider"></div>\n              <div class="year-label year-max"></div>\n            </div>\n          </div>\n          <div class="right-scenario-controls">\n        \n            <div class="right-scenario-dropdown">\n             <div id="rightScenario-select-wrapper" class="rounded-choice-box padding-horrizontal-half padding-vertical-half default-btn-height d-flex-center width-100">\n  <div class="select rightScenario-select">\n    <div id="rightScenario-select-vis" class="select-styled" rel="rcp85">Higher Emissions</div>\n    <ul class="select-options">\n      <li id="rightScenario-select" rel="rcp85" class="default-select-option rightScenario-option-higher">Higher Emissions</li>\n      <li id="rightScenario-select-map" rel="rcp45" class="default-select-option rightScenario-option-lower">Lower Emissions</li>\n    </ul>\n  </div>\n</div>\n</div>\n            <div class="year right-year-slider-container">\n              <div class="year-label year-min"></div>\n              <div class="right-year-slider"></div>\n              <div class="year-label year-max"></div>\n            </div>\n          </div>\n        </div>\n                  \n            ');
      $(this.nodes.mapContainer).append(this.nodes.$controlsOverLayContainer);

      this.nodes.$controlsOverLayContainer.find('.movable.slider-div').draggable({
        axis: "x",
        containment: this.nodes.$controlsOverLayContainer,
        scroll: false,
        drag: function (event, ui) {
          this._setOptions({ swipeX: ui.position.left });
        }.bind(this),
        stop: function (event, ui) {
          this._setOptions({ swipeX: ui.position.left });
        }.bind(this)
      });

      this._updateLeftScenarioSelect();
      this._updateRightScenarioSelect();
      this._updateLeftYearSlider();
      this._updateRightYearSlider();
},
    _initMap: function _initMap() {
      this.map = new this.dojoMods.Map({
        basemap: 'topo'
      });
      // this.map.basemap.referenceLayers.clear();
      this.map.basemap.referenceLayers.add(new this.dojoMods.TileLayer({ url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer' }));
      this.map.basemap.referenceLayers.items.slice(-1)[0].minScale = 5000000;
      // this.map.basemap.referenceLayers.add(new this.dojoMods.TileLayer({url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer'}));
      if ((undefined === this.options.extent || null === this.options.extent) && (undefined === this.options.center || null === this.options.center)) {
        this.options.extent = this.options.defaultExtent;
      }
      this.view = new this.dojoMods.MapView({
        container: this.nodes.mapContainer,
        map: this.map,
        zoom: this.options.zoom,
        center: this.options.extent ? null : this.options.center,
        extent: this.options.extent ? this.dojoMods.webMercatorUtils.geographicToWebMercator(new this.dojoMods.Extent(this.options.extent)) : null,
        constraints: {
          rotationEnabled: false,
          minZoom: 4,
          maxZoom: 10
        }
      });
      if (this.options.constrainMapToExtent) {
        this.constrainMapToExtent = this.dojoMods.webMercatorUtils.geographicToWebMercator(new this.dojoMods.Extent(this.options.constrainMapToExtent));
      }

      // Watch view's stationary property
      this.dojoMods.watchUtils.whenTrue(this.view, "stationary", function () {
        if (this.view.center) {
          const latlon =  this.dojoMods.webMercatorUtils.xyToLngLat(this.view.center.x, this.view.center.y);

          // for some odd reason I can't identify the first
          // lat and long value is between 1 and -1 this is not something a user
          // has done so we ignore it.
          // of course if a user actually does pan that part of the map it will not be passed to the state url
          // and could cause issues later...
          if (latlon[0] <= 1 && latlon[0]  >= -1) {
            return null;
          }

          // for some reason lat long is backwards and to center a map you must pass long lat.
          // here I am switching lat long from center of tha map which is long lat back lat long order
          // this will although keeping the state url consistent accross local climate maps and stations map
          this.options.lat = Math.round(latlon[1]*100)/100;
          this.options.lon = Math.round(latlon[0]*100)/100;
          this.options.center = [this.options.lat, this.options.lon]
        }
        // Constrain map panning
        if (this.view.extent !== undefined && this.view.extent !== null && this.constrainMapToExtent !== undefined && !this.constrainMapToExtent.contains(this.view.extent.center)) {
          //clamp center
          var x = Math.min(Math.max(this.view.extent.center.x, this.constrainMapToExtent.xmin), this.constrainMapToExtent.xmax);
          var y = Math.min(Math.max(this.view.extent.center.y, this.constrainMapToExtent.ymin), this.constrainMapToExtent.ymax);
          this.view.center = new this.dojoMods.Point({ x: x, y: y, spatialReference: this.view.extent.spatialReference });
        }

        // Get the new extent of the view when view is stationary.
        if (this.view.extent) {
          var xymin = this.dojoMods.webMercatorUtils.xyToLngLat(this.view.extent.xmin, this.view.extent.ymin);
          var xymax = this.dojoMods.webMercatorUtils.xyToLngLat(this.view.extent.xmax, this.view.extent.ymax);
          var quickRound = function quickRound(num) {
            return Math.round(num * 100 + Number.EPSILON) / 100;
          };
          this.options.extent = {
            xmin: quickRound(xymin[0]),
            xmax: quickRound(xymax[0]),
            ymin: quickRound(xymin[1]),
            ymax: quickRound(xymax[1])
          };
          if (this.view.zoom && this.view.zoom > 0) {
            this.options.zoom = this.view.zoom;
          }

          // make sure turf has been added
          // add if center point is within the conus extent defeind by
          // const bbox = [-128.74, 24.23,  -64.1, 51.41];
          if (typeof turf !== "undefined") {
            const bbox = [-128.74, 24.23,  -64.1, 51.41]; // conus extent
            const poly = turf.bboxPolygon(bbox);
            if (this.options.center){
              var pt = turf.point(this.options.center.reverse());
              // is the center in conus
              this.options.isCenterConus = turf.booleanPointInPolygon(pt, poly);
              this._trigger('changeExtent', null, this.options);
            }
          }


          this._trigger('change', null, this.options);
        }
      }.bind(this));

      this.nodes.$legendContainer = $('<div class="scenario-map-legend-container"></div>');
      this._updateLegend();
      this.legendExpand = new this.dojoMods.Expand({
        expandIconClass: 'esri-icon-description',
        view: this.view,
        content: this.nodes.$legendContainer[0],
        expanded: true
      });

      this.view.ui.add(this.legendExpand, 'top-left');
      this.view.ui.move("zoom", "top-left");

      this.locateWidget = new this.dojoMods.Locate({
        view: this.view, // Attaches the Locate button to the view
        // graphic: new this.dojoMods.Graphic({
        //   symbol: {type: "simple-marker"}  // overwrites the default symbol used for the
        //   // graphic placed at the location of the user when found
        // }),
        useHeadingEnabled: false
      });

      this.view.ui.add(this.locateWidget, "top-left");


      this.scaleBar = new this.dojoMods.ScaleBar({
        view: this.view,
        units: 'dual'
      });

      this.view.ui.add(this.scaleBar, {
        position: "bottom-left"
      });
    },

    _updateScenarioLayers: function _updateScenarioLayers() {
      return Promise.all([this._updateLeftScenarioLayer(), this._updateRightScenarioLayer()]).catch(this._error.bind(this));
    },

    _updateLeftScenarioLayer: function _updateLeftScenarioLayer() {
      return this._initScenarioLayer(this.options.leftScenario, this.options.leftYear, 'left', this.options.leftOpacity).then(function (layer) {
        this.leftLayer = layer;
        return layer;
      }.bind(this));
    },

    _updateRightScenarioLayer: function _updateRightScenarioLayer() {
      return this._initScenarioLayer(this.options.rightScenario, this.options.rightYear, 'right', this.options.rightOpacity).then(function (layer) {
        this.rightLayer = layer;
        return layer;
      }.bind(this));
    },

    _initScenarioLayer: function _initScenarioLayer(scenario, year, side, opacity) {
      var promise = new Promise(function (resolve) {
        var layerClass = this.dojoMods.TileLayer;
        if (this.options.scenarios[scenario].tilesURL.endsWith('png')) {
          layerClass = this.dojoMods.WebTileLayer;
        }

        var layer = new layerClass({ urlTemplate: this._getScenarioURL(scenario, year), opacity: opacity });


        if (this.options.scenarios[scenario].max_zoom_level && this.options.scenarios[scenario].min_zoom_level){
          layer.tileInfo.lods = layer.tileInfo.lods.filter((lod) => lod.level >=  this.options.scenarios[scenario].min_zoom_level && lod.level <=  this.options.scenarios[scenario].max_zoom_level);
        }

        //TMS hack
        if (this.options.scenarios[scenario].tilesURL.endsWith('png') && this.options.scenarios[scenario].tilesTMS) {
          layer.getTileUrl = function (level, row, col) {
            level = this.levelValues[level];
            if (0 > row || row >= 1 << level) {
              return null;
            }
            row = Math.pow(2, level) - row - 1;

            return this.tileServers[row % this.tileServers.length] + this.urlPath.replace(/\{level\}/gi, level).replace(/\{row\}/gi, row).replace(/\{col\}/gi, col);
          };
        }
        this._mapInitPromise.then(function (layer) {
          if (side === 'left') {
            // removes old layer to remove stray layers
            let leftLayer = this.map.findLayerById('left-variable');
            this.map.remove(leftLayer);

            layer.id = `left-variable`;
            this.map.add(layer, 0);
          } else {
            // removes old layer to remove stray layers
            let rightLayer  = this.map.findLayerById('right-variable');
            this.map.remove(rightLayer);

            layer.id = `right-variable`;
            this.map.add(layer, 1);
          }
        }.bind(this, layer));
        resolve(layer);
      }.bind(this)).catch(this._log.bind(this));
      // hook the layerView's first render to apply the clipping path.
      promise.then(function (layer) {
        this.view.whenLayerView(layer).then(function (layerView) {
          var _this2 = this;

          // animate swipe on map load
          if (this.options.animateIntro) {
            this.view.when().then(function () {
              setTimeout(function () {
                $(".movable").animate({ left: "50%" }, {
                  duration: 1200,
                  easing: 'easeInOutCubic',
                  step: function (now, fx) {
                    if (layerViewContainer.element) {
                      this._setOption('swipeX', layerViewContainer.element.width * now / 100);
                    }
                  }.bind(_this2)
                });
                _this2.options.animateIntro = false;
              }, 1800); // delay 1800ms for the map to load a bit
            }.bind(this));
          }

          var layerViewContainer = layerView.container;
          layerViewContainer._doRender = layerViewContainer.doRender;
          layerViewContainer.doRender = function (a) {
            layerViewContainer._doRender(a);
            if (_this2.options.swipeX === null) {
              _this2.options.swipeX = layerViewContainer.element.width;
            }
            if (_this2.options.swipeX > layerViewContainer.element.width) {
              _this2.options.swipeX = layerViewContainer.element.width;
              _this2.nodes.$controlsOverLayContainer.find('.movable.slider-div').css('left', _this2.options.swipeX);
            }

            _this2._setClipPath(layerViewContainer.element, side, _this2.options.swipeX);
          };
        }.bind(this));
      }.bind(this));
      return promise;
    },

    // Init is automatically invoked after create, and again every time the
    //  widget is invoked with no arguments after that
    _init: function _init() {
      this._trigger('initialized');
    },

    _updateCountiesLayer: function _updateCountiesLayer() {
      if (undefined !== this.countiesLayer) {
        return Promise.resolve(this.countiesLayer);
      }
      return this._createReferenceLayer(this.options.countiesLayerURL, {
        opacity: 1,
        "objectIdFieldName" : "FID",
        "uniqueIdField" : {
        "name" : "FID",
        "isSystemMaintained" : true
      },
      "globalIdFieldName" : "",
        "geometryType" : "polygon",
        "spatialReference" : {
        "wkid" : 102100,
          "latestWkid" : 3857
      },
        "outFields":['*'],
      "fields" : [
        {
          "name" : "FID",
          "type" : "esriFieldTypeOID",
          "alias" : "FID",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "OBJECTID",
          "type" : "esriFieldTypeInteger",
          "alias" : "OBJECTID",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "NAME",
          "type" : "esriFieldTypeString",
          "alias" : "NAME",
          "sqlType" : "sqlTypeNVarchar",
          "length" : 32,
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "STATE_NAME",
          "type" : "esriFieldTypeString",
          "alias" : "STATE_NAME",
          "sqlType" : "sqlTypeNVarchar",
          "length" : 35,
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "STATE_FIPS",
          "type" : "esriFieldTypeString",
          "alias" : "STATE_FIPS",
          "sqlType" : "sqlTypeNVarchar",
          "length" : 2,
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "CNTY_FIPS",
          "type" : "esriFieldTypeString",
          "alias" : "CNTY_FIPS",
          "sqlType" : "sqlTypeNVarchar",
          "length" : 3,
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "FIPS",
          "type" : "esriFieldTypeString",
          "alias" : "FIPS",
          "sqlType" : "sqlTypeNVarchar",
          "length" : 5,
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "POPULATION",
          "type" : "esriFieldTypeInteger",
          "alias" : "POPULATION",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "POP_SQMI",
          "type" : "esriFieldTypeDouble",
          "alias" : "POP_SQMI",
          "sqlType" : "sqlTypeFloat",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "POP2010",
          "type" : "esriFieldTypeInteger",
          "alias" : "POP2010",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "POP10_SQMI",
          "type" : "esriFieldTypeDouble",
          "alias" : "POP10_SQMI",
          "sqlType" : "sqlTypeFloat",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "WHITE",
          "type" : "esriFieldTypeInteger",
          "alias" : "WHITE",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "BLACK",
          "type" : "esriFieldTypeInteger",
          "alias" : "BLACK",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "AMERI_ES",
          "type" : "esriFieldTypeInteger",
          "alias" : "AMERI_ES",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "ASIAN",
          "type" : "esriFieldTypeInteger",
          "alias" : "ASIAN",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "HAWN_PI",
          "type" : "esriFieldTypeInteger",
          "alias" : "HAWN_PI",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "HISPANIC",
          "type" : "esriFieldTypeInteger",
          "alias" : "HISPANIC",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "OTHER",
          "type" : "esriFieldTypeInteger",
          "alias" : "OTHER",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "MULT_RACE",
          "type" : "esriFieldTypeInteger",
          "alias" : "MULT_RACE",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "MALES",
          "type" : "esriFieldTypeInteger",
          "alias" : "MALES",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "FEMALES",
          "type" : "esriFieldTypeInteger",
          "alias" : "FEMALES",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "AGE_UNDER5",
          "type" : "esriFieldTypeInteger",
          "alias" : "AGE_UNDER5",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "AGE_5_9",
          "type" : "esriFieldTypeInteger",
          "alias" : "AGE_5_9",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "AGE_10_14",
          "type" : "esriFieldTypeInteger",
          "alias" : "AGE_10_14",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "AGE_15_19",
          "type" : "esriFieldTypeInteger",
          "alias" : "AGE_15_19",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "AGE_20_24",
          "type" : "esriFieldTypeInteger",
          "alias" : "AGE_20_24",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "AGE_25_34",
          "type" : "esriFieldTypeInteger",
          "alias" : "AGE_25_34",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "AGE_35_44",
          "type" : "esriFieldTypeInteger",
          "alias" : "AGE_35_44",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "AGE_45_54",
          "type" : "esriFieldTypeInteger",
          "alias" : "AGE_45_54",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "AGE_55_64",
          "type" : "esriFieldTypeInteger",
          "alias" : "AGE_55_64",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "AGE_65_74",
          "type" : "esriFieldTypeInteger",
          "alias" : "AGE_65_74",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "AGE_75_84",
          "type" : "esriFieldTypeInteger",
          "alias" : "AGE_75_84",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "AGE_85_UP",
          "type" : "esriFieldTypeInteger",
          "alias" : "AGE_85_UP",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "MED_AGE",
          "type" : "esriFieldTypeDouble",
          "alias" : "MED_AGE",
          "sqlType" : "sqlTypeFloat",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "MED_AGE_M",
          "type" : "esriFieldTypeDouble",
          "alias" : "MED_AGE_M",
          "sqlType" : "sqlTypeFloat",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "MED_AGE_F",
          "type" : "esriFieldTypeDouble",
          "alias" : "MED_AGE_F",
          "sqlType" : "sqlTypeFloat",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "HOUSEHOLDS",
          "type" : "esriFieldTypeInteger",
          "alias" : "HOUSEHOLDS",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "AVE_HH_SZ",
          "type" : "esriFieldTypeDouble",
          "alias" : "AVE_HH_SZ",
          "sqlType" : "sqlTypeFloat",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "HSEHLD_1_M",
          "type" : "esriFieldTypeInteger",
          "alias" : "HSEHLD_1_M",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "HSEHLD_1_F",
          "type" : "esriFieldTypeInteger",
          "alias" : "HSEHLD_1_F",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "MARHH_CHD",
          "type" : "esriFieldTypeInteger",
          "alias" : "MARHH_CHD",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "MARHH_NO_C",
          "type" : "esriFieldTypeInteger",
          "alias" : "MARHH_NO_C",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "MHH_CHILD",
          "type" : "esriFieldTypeInteger",
          "alias" : "MHH_CHILD",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "FHH_CHILD",
          "type" : "esriFieldTypeInteger",
          "alias" : "FHH_CHILD",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "FAMILIES",
          "type" : "esriFieldTypeInteger",
          "alias" : "FAMILIES",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "AVE_FAM_SZ",
          "type" : "esriFieldTypeDouble",
          "alias" : "AVE_FAM_SZ",
          "sqlType" : "sqlTypeFloat",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "HSE_UNITS",
          "type" : "esriFieldTypeInteger",
          "alias" : "HSE_UNITS",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "VACANT",
          "type" : "esriFieldTypeInteger",
          "alias" : "VACANT",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "OWNER_OCC",
          "type" : "esriFieldTypeInteger",
          "alias" : "OWNER_OCC",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "RENTER_OCC",
          "type" : "esriFieldTypeInteger",
          "alias" : "RENTER_OCC",
          "sqlType" : "sqlTypeInteger",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "NO_FARMS12",
          "type" : "esriFieldTypeDouble",
          "alias" : "NO_FARMS12",
          "sqlType" : "sqlTypeFloat",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "AVE_SIZE12",
          "type" : "esriFieldTypeDouble",
          "alias" : "AVE_SIZE12",
          "sqlType" : "sqlTypeFloat",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "CROP_ACR12",
          "type" : "esriFieldTypeDouble",
          "alias" : "CROP_ACR12",
          "sqlType" : "sqlTypeFloat",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "AVE_SALE12",
          "type" : "esriFieldTypeDouble",
          "alias" : "AVE_SALE12",
          "sqlType" : "sqlTypeFloat",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "SQMI",
          "type" : "esriFieldTypeDouble",
          "alias" : "SQMI",
          "sqlType" : "sqlTypeFloat",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "Shape_Leng",
          "type" : "esriFieldTypeDouble",
          "alias" : "Shape_Leng",
          "sqlType" : "sqlTypeFloat",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "Shape_Area",
          "type" : "esriFieldTypeDouble",
          "alias" : "Shape_Area",
          "sqlType" : "sqlTypeFloat",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "Shape__Area",
          "type" : "esriFieldTypeDouble",
          "alias" : "Shape__Area",
          "sqlType" : "sqlTypeFloat",
          "domain" : null,
          "defaultValue" : null
        },
        {
          "name" : "Shape__Length",
          "type" : "esriFieldTypeDouble",
          "alias" : "Shape__Length",
          "sqlType" : "sqlTypeFloat",
          "domain" : null,
          "defaultValue" : null
        }
      ],
        renderer: {
          type: 'simple',
          symbol: {
            type: "simple-fill", // autocasts as new SimpleFillSymbol()
            style: "solid",
            color: "rgba(0,0,0,0)",
            outline: { // autocasts as new SimpleLineSymbol()
              color: [70, 70, 70, 1],
              width: 0.3
            }
          }
        }
      }).then(function (layer) {
        this.countiesLayer = layer;
        this._mapInitPromise.then(function () {
          this.map.add(this.countiesLayer, 4);
          this.view.on("click", function (event) {
            this.countiesLayer.queryFeatures({geometry: event.mapPoint, outFields: ["*"]}).then(function (response) {
              if (!'features' in response || response.features.length < 1){
                return
              }
              var county = response.features[0];
              this.options.county = county.attributes['FIPS'];
              // this.options.countyName = county.attributes['NAME'] + ' ' + county.attributes['LSAD'];
              this.options.countyName = county.attributes['NAME'];
              this.options.stateName = county.attributes['STATE_NAME'];

              // e.stopPropagation();

              // get the invisiable link just outside the element node tree
              // if inside we have issues will bubbling propogation
              const link = document.querySelector('#national-climate-maps-secretlink-forcharts');
              const params = `?fips=${this.options.county}&county=${this.options.countyName}`

 
              // set the url and search params
              let url = `${$(link).attr('href')}/?fips=${this.options.county}&lat=${event.mapPoint.latitude}&lon=${event.mapPoint.longitude}&city=${this.options.countyName}  County, ${this.options.stateName} County&county=${this.options.countyName} County&nav=local-climate-charts`

              // override for alaska there are no counties so remove count text
              if (county.attributes['STATE_NAME'] === 'Alaska') {
                url = `${$(link).attr('href')}/?fips=${this.options.county}&lat=${event.mapPoint.latitude}&lon=${event.mapPoint.longitude}&city=${this.options.countyName}, ${this.options.stateName} &county=${this.options.countyName}&nav=local-climate-charts`
              }

              $(link).attr('href', url);

              // force click on invisible link
              link.click();

              //  not doing overlay now, going to local charts instead...
              // the new ui is not styling this but Davism is leaving it incase we want
              // re-enable it.
              // this._updateOverlay();
            }.bind(this));
          }.bind(this));
        }.bind(this));
        return layer;
      }.bind(this));
    },
    _initStatesLayer: function _initStatesLayer() {
      return this._createReferenceLayer(this.options.statesLayerURL, {

        opacity: 0.5,
        "objectIdFieldName" : "FID",
        "uniqueIdField" :
        {
        "name" : "FID",
        "isSystemMaintained" : true
        },
        "globalIdFieldName" : "",
        "geometryType" : "polygon",
        "spatialReference" : {
        "wkid" : 102100,
        "latestWkid" : 3857
        },
        "outFields":['*'],
        "fields" : [
        {
        "name" : "FID",
        "type" : "esriFieldTypeOID",
        "alias" : "FID",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "STATE_NAME",
        "type" : "esriFieldTypeString",
        "alias" : "STATE_NAME",
        "sqlType" : "sqlTypeNVarchar",
        "length" : 25,
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "STATE_FIPS",
        "type" : "esriFieldTypeString",
        "alias" : "STATE_FIPS",
        "sqlType" : "sqlTypeNVarchar",
        "length" : 2,
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "STATE_ABBR",
        "type" : "esriFieldTypeString",
        "alias" : "STATE_ABBR",
        "sqlType" : "sqlTypeNVarchar",
        "length" : 2,
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "POPULATION",
        "type" : "esriFieldTypeInteger",
        "alias" : "POPULATION",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "POP_SQMI",
        "type" : "esriFieldTypeDouble",
        "alias" : "POP_SQMI",
        "sqlType" : "sqlTypeFloat",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "POP2010",
        "type" : "esriFieldTypeInteger",
        "alias" : "POP2010",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "POP10_SQMI",
        "type" : "esriFieldTypeDouble",
        "alias" : "POP10_SQMI",
        "sqlType" : "sqlTypeFloat",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "WHITE",
        "type" : "esriFieldTypeInteger",
        "alias" : "WHITE",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "BLACK",
        "type" : "esriFieldTypeInteger",
        "alias" : "BLACK",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "AMERI_ES",
        "type" : "esriFieldTypeInteger",
        "alias" : "AMERI_ES",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "ASIAN",
        "type" : "esriFieldTypeInteger",
        "alias" : "ASIAN",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "HAWN_PI",
        "type" : "esriFieldTypeInteger",
        "alias" : "HAWN_PI",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "HISPANIC",
        "type" : "esriFieldTypeInteger",
        "alias" : "HISPANIC",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "OTHER",
        "type" : "esriFieldTypeInteger",
        "alias" : "OTHER",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "MULT_RACE",
        "type" : "esriFieldTypeInteger",
        "alias" : "MULT_RACE",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "MALES",
        "type" : "esriFieldTypeInteger",
        "alias" : "MALES",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "FEMALES",
        "type" : "esriFieldTypeInteger",
        "alias" : "FEMALES",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "AGE_UNDER5",
        "type" : "esriFieldTypeInteger",
        "alias" : "AGE_UNDER5",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "AGE_5_9",
        "type" : "esriFieldTypeInteger",
        "alias" : "AGE_5_9",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "AGE_10_14",
        "type" : "esriFieldTypeInteger",
        "alias" : "AGE_10_14",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "AGE_15_19",
        "type" : "esriFieldTypeInteger",
        "alias" : "AGE_15_19",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "AGE_20_24",
        "type" : "esriFieldTypeInteger",
        "alias" : "AGE_20_24",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "AGE_25_34",
        "type" : "esriFieldTypeInteger",
        "alias" : "AGE_25_34",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "AGE_35_44",
        "type" : "esriFieldTypeInteger",
        "alias" : "AGE_35_44",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "AGE_45_54",
        "type" : "esriFieldTypeInteger",
        "alias" : "AGE_45_54",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "AGE_55_64",
        "type" : "esriFieldTypeInteger",
        "alias" : "AGE_55_64",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "AGE_65_74",
        "type" : "esriFieldTypeInteger",
        "alias" : "AGE_65_74",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "AGE_75_84",
        "type" : "esriFieldTypeInteger",
        "alias" : "AGE_75_84",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "AGE_85_UP",
        "type" : "esriFieldTypeInteger",
        "alias" : "AGE_85_UP",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "MED_AGE",
        "type" : "esriFieldTypeDouble",
        "alias" : "MED_AGE",
        "sqlType" : "sqlTypeFloat",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "MED_AGE_M",
        "type" : "esriFieldTypeDouble",
        "alias" : "MED_AGE_M",
        "sqlType" : "sqlTypeFloat",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "MED_AGE_F",
        "type" : "esriFieldTypeDouble",
        "alias" : "MED_AGE_F",
        "sqlType" : "sqlTypeFloat",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "HOUSEHOLDS",
        "type" : "esriFieldTypeInteger",
        "alias" : "HOUSEHOLDS",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "AVE_HH_SZ",
        "type" : "esriFieldTypeDouble",
        "alias" : "AVE_HH_SZ",
        "sqlType" : "sqlTypeFloat",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "HSEHLD_1_M",
        "type" : "esriFieldTypeInteger",
        "alias" : "HSEHLD_1_M",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "HSEHLD_1_F",
        "type" : "esriFieldTypeInteger",
        "alias" : "HSEHLD_1_F",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "MARHH_CHD",
        "type" : "esriFieldTypeInteger",
        "alias" : "MARHH_CHD",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "MARHH_NO_C",
        "type" : "esriFieldTypeInteger",
        "alias" : "MARHH_NO_C",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "MHH_CHILD",
        "type" : "esriFieldTypeInteger",
        "alias" : "MHH_CHILD",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "FHH_CHILD",
        "type" : "esriFieldTypeInteger",
        "alias" : "FHH_CHILD",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "FAMILIES",
        "type" : "esriFieldTypeInteger",
        "alias" : "FAMILIES",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "AVE_FAM_SZ",
        "type" : "esriFieldTypeDouble",
        "alias" : "AVE_FAM_SZ",
        "sqlType" : "sqlTypeFloat",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "HSE_UNITS",
        "type" : "esriFieldTypeInteger",
        "alias" : "HSE_UNITS",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "VACANT",
        "type" : "esriFieldTypeInteger",
        "alias" : "VACANT",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "OWNER_OCC",
        "type" : "esriFieldTypeInteger",
        "alias" : "OWNER_OCC",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "RENTER_OCC",
        "type" : "esriFieldTypeInteger",
        "alias" : "RENTER_OCC",
        "sqlType" : "sqlTypeInteger",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "NO_FARMS12",
        "type" : "esriFieldTypeDouble",
        "alias" : "NO_FARMS12",
        "sqlType" : "sqlTypeFloat",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "AVE_SIZE12",
        "type" : "esriFieldTypeDouble",
        "alias" : "AVE_SIZE12",
        "sqlType" : "sqlTypeFloat",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "CROP_ACR12",
        "type" : "esriFieldTypeDouble",
        "alias" : "CROP_ACR12",
        "sqlType" : "sqlTypeFloat",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "AVE_SALE12",
        "type" : "esriFieldTypeDouble",
        "alias" : "AVE_SALE12",
        "sqlType" : "sqlTypeFloat",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "SQMI",
        "type" : "esriFieldTypeDouble",
        "alias" : "SQMI",
        "sqlType" : "sqlTypeFloat",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "Shape__Area",
        "type" : "esriFieldTypeDouble",
        "alias" : "Shape__Area",
        "sqlType" : "sqlTypeFloat",
        "domain" : null,
        "defaultValue" : null
        },
        {
        "name" : "Shape__Length",
        "type" : "esriFieldTypeDouble",
        "alias" : "Shape__Length",
        "sqlType" : "sqlTypeFloat",
        "domain" : null,
        "defaultValue" : null
        }
        ],











        renderer: {
          type: 'simple',
          symbol: {
            type: "simple-fill", // autocasts as new SimpleFillSymbol()
            style: "none",
            outline: { // autocasts as new SimpleLineSymbol()
              color: "black",
              width: 1
            }
          }
        }
      }).then(function (layer) {
        this.statesLayer = layer;
        this._mapInitPromise.then(function () {
          this.map.add(this.statesLayer, 10);
        }.bind(this));
      }.bind(this));
    },

    _createReferenceLayer: function _createReferenceLayer(layerURL, options) {
      // We implement our own json layer creator
      if (layerURL.endsWith('json') || layerURL.endsWith('geojson')) {
        return Promise.resolve($.ajax({
          url: layerURL,
          type: "GET",
          contentType: "application/json; charset=utf-8",
          dataType: "json"
        })).catch(this._error).then(function (data) {
          if (undefined === data) {
            throw 'Failed to retrieve station data. Refresh to try again.';
          }
          return new Promise(function (resolve) {
            setTimeout(function () {
              // using setTimeout here to keep from blocking for too long
              var features = Terraformer.ArcGIS.convert(new Terraformer.Primitive(data));
              for (var i = 0; i < features.length; i++) {
                features[i]['geometry'] = new this.dojoMods.Polygon(features[i]['geometry']);
              }
              resolve(features);
            }.bind(this));
          }.bind(this)).catch(this._error);
        }.bind(this)).then(function (features) {
          // Use Terraformer to convert GeoJSON to ArcGIS JSON
          return new this.dojoMods.FeatureLayer(_extends({
            // create an instance of esri/layers/support/Field for each field object
            source: features
          }, options));
        }.bind(this));
      } else {
        //if url is a feature service or csv we use the provided methods for creating them.
        var layerClass = this.dojoMods.FeatureLayer;
        if (layerURL.endsWith('csv')) {
          layerClass = this.dojoMods.CSVLayer;
        }
        return Promise.resolve(new layerClass(_extends({ url: layerURL }, options))).catch(this._log.bind(this));
      }
    },

    // Allows the widget to react to option changes. Any custom behaviors
    // can be configured here.
    _setOptions: function _setOptions(options) {
      var old_options = _extends({}, this.options);
      this._super(options);
      if (this.options.county !== old_options.county) {
        this._updateOverlay();
      }
      if (this.options.extent !== old_options.extent && this.options.extent !== null) {
        this.view.goTo(new this.dojoMods.Extent(this.options.extent));
      } else if (this.options.center !== old_options.center && this.options.center !== null) {
        this.options.extent = null;
        if (this.view) {
          this.view.goTo({ center: new this.dojoMods.Point({ latitude: this.options.center[0], longitude: this.options.center[1] }), zoom: this.options.zoom });
        }
      }
      if (this.options.variable) {
        if (this.options.variable !== old_options.variable || this.options.season !== old_options.season) {
          // Only a few variables have seasonal data
          if (this.options.variables[this.options.variable]['seasonal_data'] ) {
            this.options.season = this.options.season || this.options.variables[this.options.variable].defaultConfig.season;
          } else {
            this.options.season = null;
          }
          // validate current scenario config and apply default configs as needed.
          if ((this.options.variables[this.options.variable].disabledScenarios || []).includes(this.options.leftScenario) || (this.options.variables[old_options.variable].disabledScenarios || []).includes(this.options.variables[this.options.variable].defaultConfig.leftScenario)) {
            this._setOption('leftScenario', this.options.variables[this.options.variable].defaultConfig.leftScenario);
          } else {
            this._updateLeftScenario();
          }
          if ((this.options.variables[this.options.variable].disabledScenarios || []).includes(this.options.rightScenario) || (this.options.variables[old_options.variable].disabledScenarios || []).includes(this.options.variables[this.options.variable].defaultConfig.rightScenario)) {
            this._setOption('rightScenario', this.options.variables[this.options.variable].defaultConfig.rightScenario);
          } else {
            this._updateRightScenario();
          }
          this._updateLegend();
          this._updateOverlay();
        }
      }

      // skip send change trigger for sliding the map changer. it causes issues for some browsers
      // when using an event listenter on the map
      if (options.swipeX) {
        return this;
      }
      this._trigger('change', null, this.options);
      return this;
    },

    _setOption: function _setOption(key, value) {
      var oldValue = this.options[key];
      // This will actually update the value in the options hash
      this._super(key, value);
      // And now we can act on that change
      switch (key) {
        // Not necessary in all cases, but likely enough to me to include it here
        case "state":
          this._init();
          break;
        case "swipeX":
          this._setSwipeX(value);
          break;
        case "leftYear":
          if (value !== oldValue) {
            this._updateLeftScenarioLayer();
          }
          break;
        case "rightYear":
          if (value !== oldValue) {
            this._updateRightScenarioLayer();
          }
          break;
        case "leftScenario":
          if (value !== oldValue) {
            if ((this.options.variables[this.options.variable].disabledScenarios || []).includes(value)) {
              break;
            }
            this._updateLeftScenario();
          }
          break;
        case "rightScenario":
          if (value !== oldValue) {
            if ((this.options.variables[this.options.variable].disabledScenarios || []).includes(value)) {
              break;
            }
            this._updateRightScenario();
          }
          break;
        case "showCounties":

          this._whenDojoLoaded().then(this._updateCountiesLayer.bind(this)).then(function (layer) {
            layer.visible = value;
          });

          break;
      }
    },

    _updateLeftScenario: function _updateLeftScenario() {
      var _this3 = this;

      if (!this.options.scenarios[this.options.leftScenario].years.find(function (v) {
        return v.value === _this3.options.leftYear;
      })) {
        this.options.leftYear = this.options.scenarios[this.options.leftScenario].defaultYear;
      }
      this._updateLeftScenarioSelect();
      this._updateLeftScenarioLayer();
      this._updateLeftYearSlider();
    },
    _updateRightScenario: function _updateRightScenario() {
      var _this4 = this;

      if (!this.options.scenarios[this.options.rightScenario].years.find(function (v) {
        return v.value === _this4.options.rightYear;
      })) {
        this.options.rightYear = this.options.scenarios[this.options.leftScenario].defaultYear;
      }
      this._updateRightScenarioSelect();
      this._updateRightScenarioLayer();
      this._updateRightYearSlider();
    },

    _updateLeftYearSlider: function _updateLeftYearSlider() {
      var _this5 = this;

      //override to disable left year slider for historical
      if (this.options.leftYear === 'avg') {
        this.nodes.$controlsOverLayContainer.find('.left-year-slider-container').addClass('disabled').text(this.options.scenarios[this.options.leftScenario].years.slice(-1)[0].label);
        delete this.nodes['$leftYearSlider'];
        delete this.nodes['$leftYearTooltip'];
        return;
      } else if (this.nodes.$controlsOverLayContainer.find('.left-year-slider-container').hasClass('disabled')) {
        this.nodes.$controlsOverLayContainer.find('.left-year-slider-container').removeClass('disabled').html('\n              <div class="year-label year-min"></div>\n              <div class="left-year-slider"></div>\n              <div class="year-label year-max"></div>');
      }

      if (this.nodes.$leftYearSlider === undefined) {
        this.nodes.$leftYearSlider = $(this.element).find('.left-year-slider');
      }

      if (this.nodes.$leftYearTooltip === undefined) {
        this.nodes.$leftYearTooltip = $('<span class="map-tooltip"></span>').hide();
      }
      var maxLabel = this.options.scenarios[this.options.leftScenario].years.slice(-1)[0].label;
      if (this.options.leftYear === 'avg') {
        maxLabel = '2000';
      }

      this.nodes.$leftYearTooltip.text(this.options.scenarios[this.options.leftScenario].years.find(function (v) {
        return v.value === _this5.options.leftYear.toString();
      }).label);
      this.nodes.$controlsOverLayContainer.find('.left-year-slider-container .year-min').text(this.options.scenarios[this.options.leftScenario].years[0].label);
      this.nodes.$controlsOverLayContainer.find('.left-year-slider-container .year-max').text(maxLabel);
      this.nodes.$leftYearSlider.slider({
        range: false,
        min: 0,
        max: this.options.scenarios[this.options.leftScenario].years.length - 1,
        step: 1,
        value: this.options.scenarios[this.options.leftScenario].years.findIndex(function (v) {
          return v.value === _this5.options.leftYear.toString();
        }),
        slide: function (event, ui) {
          this.nodes.$leftYearTooltip.text(this.options.scenarios[this.options.leftScenario].years[ui.value].label);
        }.bind(this),
        change: function (event, ui) {
          this.nodes.$leftYearSlider.attr('data-value', ui.value);

          this._setOptions({ leftYear: this.options.scenarios[this.options.leftScenario].years[ui.value].value });
        }.bind(this)
      }).find(".ui-slider-handle").html('<span class="icon icon-arrow-left-right"></span>').append(this.nodes.$leftYearTooltip);
      this.nodes.$leftYearTooltip.fadeIn();
    },

    _updateRightYearSlider: function _updateRightYearSlider() {
      var _this6 = this;

      if (this.nodes.$rightYearSlider === undefined) {
        this.nodes.$rightYearSlider = $(this.element).find('.right-year-slider');
      }
      if (this.nodes.$rightYearTooltip === undefined) {
        this.nodes.$rightYearTooltip = $("<span class='map-tooltip'></span>").hide();
      }
      var maxLabel = this.options.scenarios[this.options.rightScenario].years.slice(-1)[0].label;
      if (this.options.rightYear === 'avg') {
        maxLabel = '2000';
      }
      this.nodes.$rightYearTooltip.text(this.options.scenarios[this.options.rightScenario].years.find(function (v) {
        return v.value === _this6.options.rightYear.toString();
      }).label);
      this.nodes.$controlsOverLayContainer.find('.right-year-slider-container .year-min').text(this.options.scenarios[this.options.rightScenario].years[0].label);
      this.nodes.$controlsOverLayContainer.find('.right-year-slider-container .year-max').text(maxLabel);
      this.nodes.$rightYearSlider.slider({
        range: false,
        min: 0,
        max: this.options.scenarios[this.options.rightScenario].years.length - 1,
        step: 1,
        value: this.options.scenarios[this.options.rightScenario].years.findIndex(function (v) {
          return v.value === _this6.options.rightYear.toString();
        }),
        slide: function (event, ui) {
          this.nodes.$rightYearTooltip.text(this.options.scenarios[this.options.rightScenario].years[ui.value].label);
        }.bind(this),
        change: function (event, ui) {
          this.nodes.$rightYearSlider.attr('data-value', ui.value);

          this._setOptions({ rightYear: this.options.scenarios[this.options.rightScenario].years[ui.value].value });
        }.bind(this)
      }).find(".ui-slider-handle").html("<span class='icon icon-arrow-left-right'></span>").append(this.nodes.$rightYearTooltip);
      this.nodes.$rightYearTooltip.fadeIn();
    },

    _updateLeftScenarioSelect: function _updateLeftScenarioSelect() {
      var _this7 = this;

      // check if varriable is precip then disable the historical and select lower emmissions
      if (_this7.options.variable === 'pcpn') {
        $('#leftScenario-select-vis').attr('rel','rcp45');
        $('#leftScenario-select-vis').html('Lower Emissions');
        $('.leftScenario-option-historical').addClass('d-none');
      } else {
        $('.leftScenario-option-historical').removeClass('d-none');
      }

      // leftScenario-select-vis
      if (this.nodes.$leftScenarioSelect === undefined) {
        this.nodes.$leftScenarioSelect = $(this.nodes.$controlsOverLayContainer).find("#leftScenario-select-vis");
        this.nodes.$leftScenarioSelect.attr('rel');

        this.nodes.$leftScenarioSelect.bind('cs-changed', function () {
          if (this.nodes.$leftScenarioSelect.attr('rel') !== undefined && this.nodes.$leftScenarioSelect.attr('rel') !== null) {
            this._setOptions({ leftScenario: this.nodes.$leftScenarioSelect.attr('rel') });
          }
        }.bind(this));
      }
    },

    _updateRightScenarioSelect: function _updateRightScenarioSelect() {
      var _this8 = this;

      if (this.nodes.$rightScenarioSelect === undefined) {
        this.nodes.$rightScenarioSelect = $(this.nodes.$controlsOverLayContainer).find("#rightScenario-select-vis");
        this.nodes.$rightScenarioSelect.attr('rel');

        this.nodes.$rightScenarioSelect.bind('cs-changed', function () {
          if (this.nodes.$rightScenarioSelect.attr('rel') !== undefined && this.nodes.$rightScenarioSelect.attr('rel') !== null) {
            this._setOptions({ rightScenario: this.nodes.$rightScenarioSelect.attr('rel') });
          }
        }.bind(this));
      }
    },

    _setSwipeX: function _setSwipeX(value) {
      if (this.leftLayer && this.rightLayer) {
        this.view.whenLayerView(this.leftLayer).then(function (layerView) {
          this._setClipPath(layerView.container.element, 'left', value);
        }.bind(this));
        this.view.whenLayerView(this.rightLayer).then(function (layerView) {
          this._setClipPath(layerView.container.element, 'right', value);
        }.bind(this));
      }
    },

    _updateLegend: function _updateLegend() {
      let legendFilename = this.options.variables[this.options.variable]['seasonal_data'] ? [this.options.season || 'summer', this.options.variable].join('_') : this.options.variable;
      let legend_note = ('legend_note' in this.options.variables[this.options.variable] && !!this.options.variables[this.options.variable]['legend_note']) ? this.options.variables[this.options.variable]['legend_note'] : null;
      this.nodes.$legendContainer.html(`
        <span class="legend-unit-label">${this.options.variables[this.options.variable]['legend_unit']}</span>
        <img alt="legend image" class="legend-image" src="/resources/img/legends/${legendFilename}.png">
        ${!!legend_note ? `<span class="legend-note-label">${legend_note}</span>` : ''}
      `);
    },

    _updateOverlay: function _updateOverlay() {
      if (typeof this.options.county === 'undefined' || this.options.county === null) {
        if (typeof this.nodes.$countyOverlay !== 'undefined') {
          delete this['cwg'];
          this.nodes.$countyOverlay.remove();
        }
        return;
      }
      if (this.nodes.$countyOverlay !== undefined && this.nodes.$countyOverlay !== null) {}
    },

    _getScenarioURL: function _getScenarioURL(scenario, year) {
      var tilesURL = this.options.scenarios[scenario].tilesURL;
      var season = this.options.season || '';
      var season_month = this.options.season_months[season] || '';
      if (scenario === 'historical') {
        scenario = 'hist';
      }
      var variable = this.options.variable;
      // if (this.options.variable === 'days_dry_days') {
      //   variable = 'dry_days';
      // }
      if (!['tmin', 'tmax', 'pcpn'].includes(variable)) {
        season = 'annual';
      }
      // fill template variables and collapse empty '//' values (that aren't part of the 'https://') as s3 hates them.
      tilesURL = tilesURL.replace('{scenario}', scenario).replace('{season}', season).replace('{season_month}', season_month).replace('{variable}', variable).replace('{year}', year).replace(/\/\//g, (i => m => !i++ ? m : '/')(0));
      // console.log(tilesURL);
      return tilesURL
    },
    _destroy: function _destroy() {
      // remove CSS classes, destroy nodes, etc
      Object.values(this.nodes).forEach(function (node) {
        node.remove();
      });
      this.map.destroy();
    },

    _log: function _log() {
      this.options.debug === 3 && this._toLoggerMethod('log', arguments);
    },
    _warn: function _warn() {
      this.options.debug >= 2 && this._toLoggerMethod('warn', arguments);
    },
    _error: function _error() {
      this.options.debug >= 1 && this._toLoggerMethod('error', arguments);
    },
    _toLoggerMethod: function _toLoggerMethod(method, args) {
      args = Array.prototype.slice.call(arguments, 1);
      var logger = this.options.logger || console;
      logger.error.apply(logger, args);
    },

    // =========== Public methods=============================

    getShowSeasonControls: function getShowSeasonControls() {
      return this.options.variables[this.options.variable]['seasonal_data'];
    },
    disable: function disable() {
      // Do any custom logic for disabling here, then
      this._super();
    },

    enable: function enable() {
      // Do any custom logic for enabling here, then
      this._super();
    },
    whenDojoMods: function whenDojoMods(callback) {

      if (this.dojoMods !== undefined) {
        callback();
      } else {
        window.addEventListener('dojoModsLoaded', callback);
      }
    },
    _setClipPath: function _setClipPath(element, side, value) {
      if (side === 'left') {
        if (element.style.WebkitClipPath !== undefined) {
          element.style.WebkitClipPath = "polygon(0 0, " + value + "px 0, " + value + "px 100%, 0% 100%)";
        }
        if (element.style.ClipPath !== undefined) {
          element.style.clipPath = "polygon(0 0, " + value + "px 0, " + value + "px 100%, 0% 100%)";
        }
        if (element.style.clipPath === undefined || element.style.clipPath === '' || element.style.WebkitClipPath === undefined || element.style.WebkitClipPath === '') {
          element.style.clip = "rect(" + ["0px", value + "px", element.height + "px", "0px"].join(' ') + ")";
        }
      } else if (side === 'right') {
        if (element.style.WebkitClipPath !== undefined) {
          element.style.WebkitClipPath = "polygon(" + value + "px 0, 100% 0%, 100% 100%, " + value + "px 100%)";
        }
        if (element.style.clipPath !== undefined) {
          element.style.clipPath = "polygon(" + value + "px 0, 100% 0%, 100% 100%, " + value + "px 100%)";
        }
        if (element.style.clipPath === undefined || element.style.clipPath === '' || element.style.WebkitClipPath === undefined || element.style.WebkitClipPath === '') {
          element.style.clip = "rect(" + ['0px', element.width + "px", element.height + "px", value + "px"].join(' ') + ")";
        }
      }
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
});
