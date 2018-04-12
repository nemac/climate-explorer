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
  $.widget('ce.stationsMap', {

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
      stationId: null,
      stationName: null,
      mode: 'daily_vs_climate', // 'daily_vs_climate','thresholds','high_tide_flooding'
      //extent provides the initial view area of the map.
      extent: {xmin: -119, xmax: -73, ymin: 18, ymax: 54},
      //zoom and center are ignored if extent is provided.
      zoom: 5,
      center: [-98.21, 37.42],
      // Additional elements
      stationOverlayContainerId: "station-overlay-container",
      // Map layers
      dailyStationsLayerURL: "/resources/item/conus_stations_whitelist.json",
      thresholdStationsLayerURL: "/resources/item/conus_stations_whitelist.json",
      tidalStationsLayerURL: "/resources/tidal/tidal_stations.json",
      dailyStationsDataURL: "https://data.rcc-acis.org/StnData",
      thresholdStationsDataURL: "https://data.rcc-acis.org/StnData",
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

    // All DOM nodes used by the widget (must be maintained for clean destruction)
    nodes: {},

    // Dojo modules this widget expects to use.
    dojoDeps: [
      'esri/Map',
      'esri/views/MapView',
      'esri/layers/FeatureLayer',
      'esri/renderers/SimpleRenderer',
      'esri/Graphic',
      'esri/symbols/WebStyleSymbol',
      'esri/symbols/SimpleFillSymbol',
      'esri/widgets/Legend',
      'esri/widgets/Expand',
      'esri/widgets/BasemapGallery',
      'esri/widgets/ScaleBar',
      'esri/geometry/SpatialReference',
      'esri/layers/CSVLayer',
      'esri/geometry/Extent',
      'esri/geometry/Point',
      'esri/widgets/Locate',
    ],

    _dojoLoaded: function () {
      if (this.dojoMods === undefined) {
        return false;
      }
      for (let i = 0; i < this.dojoDeps; i++) {
        if (!window.dojoMod.hasOwnProperty(this.dojoDeps[i][i].split('/').pop())) {
          return false
        }
      }
      return true;
    },

    /**
     * Promise which resolves when dojo dependencies are loaded.
     * @resolve null
     * @private
     */
    _whenDojoLoaded: function () {
      if (undefined !== this._dojoLoadedPromise) {
        return this._dojoLoadedPromise
      }
      if (this._dojoLoaded()) {
        return Promise.resolve()
      }

      this._dojoLoadedPromise = new Promise(function (resolve, reject) {
        if (window.require === undefined) {
          window.dojoConfig = {
            has: {
              "esri-promise-compatibility": 1,
              "esri-promise-compatibility-deprecation-warnings": 0,
              async: 1,
              deps: this.dojoDeps
            }
          };
          let s = document.createElement("script");
          s.type = "text/javascript";
          s.src = "https://js.arcgis.com/4.6/";
          $("head")[0].appendChild(s);
          s.addEventListener('load', (function (resolve) {
            this._registerDojoMods(resolve)
          }.bind(this, resolve)))
        } else {
          this._registerDojoMods(resolve);
        }
      }.bind(this));
      return this._dojoLoadedPromise
    },
    /**
     *
     * @private
     */
    _registerDojoMods: function (resolve) {
      require(this.dojoDeps, (function (resolve) {
        //get the list of modules
        let mods = Array.prototype.slice.call(arguments, 1);
        this.dojoMods = {};
        // preserve the modules on this.dojoMods for later reference.
        for (let i = 0; i < mods.length; i++) {
          this.dojoMods[this.dojoDeps[i].split('/').pop()] = mods[i];
        }
        resolve()
      }).bind(this, resolve));
    },
    // Called once on instantiation.
    _create: function () {
      this.nodes.mapContainer = this.element[0];
      this.nodes.stationOverlayContainer = $('#' + this.options.stationOverlayContainerId)[0];

      this._MapInitPromise = this._whenDojoLoaded().then(this._initMap.bind(this));
      switch (this.options.mode) {
        case 'daily_vs_climate':
          this._whenDojoLoaded().then(this._initDailyStationsLayer.bind(this));
          break;
        case 'thresholds':
          this._whenDojoLoaded().then(this._initThresholdStationsLayer.bind(this));
          break;
        case 'high_tide_flooding':
          this._whenDojoLoaded().then(this._initTidalStationsLayer.bind(this));
          break;
      }
    },

    _initMap: function () {
      this.map = new this.dojoMods.Map({
        basemap: this.options.mode === 'high_tide_flooding' ? 'oceans' : 'topo'
      });

      this.view = new this.dojoMods.MapView({
        container: this.nodes.mapContainer,
        map: this.map,
        zoom: this.options.extent ? null : this.options.zoom,
        center: this.options.extent ? null : this.options.center,
        extent: this.options.extent ? new this.dojoMods.Extent(this.options.extent) : null,
        constraints: {
          rotationEnabled: false,
          minZoom: 4,
          maxZoom: 10
        }
      });

      this.basemapGallery = new this.dojoMods.BasemapGallery({
        view: this.view,
        container: document.createElement('div')
      });

      this.bgExpand = new this.dojoMods.Expand({
        expandIconClass: 'esri-icon-basemap',
        view: this.view,
        content: this.basemapGallery.domNode
      });

      this.view.ui.add(this.bgExpand, 'top-left');

      this.scaleBar = new this.dojoMods.ScaleBar({
        view: this.view,
        units: 'dual'
      });

      this.view.ui.add(this.scaleBar, {
        position: "bottom-left"
      });

      this.locateWidget = new this.dojoMods.Locate({
        view: this.view,   // Attaches the Locate button to the view
        graphic: new this.dojoMods.Graphic({
          symbol: {type: "simple-marker"}  // overwrites the default symbol used for the
          // graphic placed at the location of the user when found
        })
      });

      this.view.ui.add(this.locateWidget, "top-left");
    },
    _createStationLayer: function (layerURL, options) {
      // We implement our own json layer creator
      if (layerURL.endsWith('json')) {
        return Promise.resolve($.ajax({
          url: layerURL,
          type: "GET",
          contentType: "application/json; charset=utf-8",
          dataType: "json",
        }))
          .catch(e => { console.log(e); })
          .then((data) => {
            if (undefined === data) {
              console.log('Failed to retrieve station data. Refresh to try again.');
              throw 'Failed to retrieve station data. Refresh to try again.'
            }
            let features = [];
            data.forEach(function (station, index) {
              features.push(new this.dojoMods.Graphic({
                geometry: {
                  type: "point",  // autocasts as new Point()
                  longitude: station.lon,
                  latitude: station.lat
                },
                attributes: {
                  ObjectID: index,
                  id: station.id,
                  name: station.station ? station.station : station.name
                }
              }))
            }.bind(this));
            return new this.dojoMods.FeatureLayer(Object.assign({
              // create an instance of esri/layers/support/Field for each field object
              fields: [
                {
                  name: "ObjectID",
                  alias: "ObjectID",
                  type: "oid"
                }, {
                  name: "id",
                  alias: "Type",
                  type: "string"
                }, {
                  name: "name",
                  alias: "Name",
                  type: "string"
                }],
              objectIdField: "ObjectID",
              geometryType: "point",
              spatialReference: {wkid: 4326},
              source: features,
            }, options));
          });
      }
      else {
        //if url is a feature service or csv we use the provided methods for creating them.
        let layerClass = this.dojoMods.FeatureLayer;
        if (layerURL.endsWith('csv')) {
          layerClass = this.dojoMods.CSVLayer;
        }
        return Promise.resolve(new layerClass(Object.assign({url: layerURL}, options)));
      }
    },
    _initDailyStationsLayer: function () {
      this._createStationLayer(this.options.dailyStationsLayerURL, {
        outfields: ['*'],
        renderer: {
          type: "simple",  // autocasts as new SimpleRenderer()
          symbol: {
            type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
            size: 7,
            color: "#df3e2e",
            outline: {
              color: '#ffffff',
              width: 1
            }
          }
        }
      }).then(function (layer) {
        this.dailyStationsLayer = layer;
        this._MapInitPromise.then(function () {
          this.map.add(this.dailyStationsLayer);
          // this.view.on("pointer-move", function(event){
          //   this.view.hitTest(event)
          //     .then(function(response){
          //       // check if a feature is returned from the hurricanesLayer
          //       // do something with the result graphic
          //      if (response){
          //
          //      }
          //     });
          // }.bind(this));
          this.view.on("click", function (event) {
            this.view.hitTest(event)
              .then(function (response) {
                let station = response.results.filter(function (result) {
                  return result.graphic.layer === this.dailyStationsLayer;
                }.bind(this))[0].graphic;
                this._setOptions({stationName: station.attributes.name, stationId: station.attributes.id});
              }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    },

    _initThresholdStationsLayer: function () {
      // if same data, only load one.
      if (this.options.thresholdStationsLayerURL === this.options.dailyStationsLayerURL) {
        if (undefined !== this.dailyStationsLayer) {
          this.thresholdStationsLayer = this.dailyStationsLayer;
          this.thresholdStationsLayer.visible = true;
          return;
        } else {
          this._initDailyStationsLayer();
        }
      }
      this._createStationLayer(this.options.thresholdStationsDataURL, {
        outfields: ['*'],
        renderer: {
          type: "simple",  // autocasts as new SimpleRenderer()
          symbol: {
            type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
            size: 7,
            color: "#df3e2e",
            outline: {
              color: '#ffffff',
              width: 1
            }
          }
        }
      }).then(function (layer) {
        this.thresholdStationsLayer = layer;
        this._MapInitPromise.then(function () {
          this.map.add(this.thresholdStationsLayer);
          // this.view.on("pointer-move", function(event){
          //   this.view.hitTest(event)
          //     .then(function(response){
          //       // check if a feature is returned from the hurricanesLayer
          //       // do something with the result graphic
          //      if (response){
          //
          //      }
          //     });
          // }.bind(this));
          this.view.on("click", function (event) {
            this.view.hitTest(event)
              .then(function (response) {
                let station = response.results.filter(function (result) {
                  return result.graphic.layer === this.thresholdStationsLayer;
                }.bind(this))[0].graphic;
                this._setOptions({stationName: station.attributes.name, stationId: station.attributes.id});
              }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this))
    },

    _initTidalStationsLayer: function () {
      this._createStationLayer(this.options.tidalStationsLayerURL,
        {
          outfields: ['*'],
          renderer: {
            type: "simple",  // autocasts as new SimpleRenderer()
            symbol: {
              type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
              size: 7,
              color: "#3e6ac1",
              outline: {
                color: '#ffffff',
                width: 1
              }
            }
          }
        }).then(function (layer) {
        this.tidalStationsLayer = layer;
        this._MapInitPromise.then(function () {
          this.map.add(this.tidalStationsLayer);
          // this.view.on("pointer-move", function(event){
          //   this.view.hitTest(event)
          //     .then(function(response){
          //       // check if a feature is returned from the hurricanesLayer
          //       // do something with the result graphic
          //      if (response){
          //
          //      }
          //     });
          // }.bind(this));
          this.view.on("click", function (event) {
            this.view.hitTest(event)
              .then(function (response) {
                let station = response.results.filter(function (result) {
                  return result.graphic.layer === this.tidalStationsLayer;
                }.bind(this))[0].graphic;
                this._setOptions({stationName: station.attributes.name, stationId: station.attributes.id});
              }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    },

    // Init is automatically invoked after create, and again every time the
    //  widget is invoked with no arguments after that
    _init: function () {
      this._trigger('initialized');
    },


    // I find it useful to separate out my event handler logic just for
    // organization and readability's sake, but it's certainly not necessary
    _addHandlers: function () {

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
        case "mode":
          // hide the overlay if it exists
          $('#station-overlay-container').css('visibility', 'hidden').empty();

          switch (this.options.mode) {
            case 'daily_vs_climate':
              if (undefined !== this.thresholdStationsLayer) {
                this.thresholdStationsLayer.visible = false;
              }
              if (undefined !== this.tidalStationsLayer) {
                this.tidalStationsLayer.visible = false;
              }
              if (undefined !== this.dailyStationsLayer) {
                this.dailyStationsLayer.visible = true;
              }
              else {
                this._whenDojoLoaded().then(this._initDailyStationsLayer.bind(this));
              }
              if (this.map.basemap.id !== 'topo') {
                this.map.basemap = 'topo';
              }
              break;
            case 'thresholds':
              if (undefined !== this.dailyStationsLayer) {
                this.dailyStationsLayer.visible = false;
              }
              if (undefined !== this.tidalStationsLayer) {
                this.tidalStationsLayer.visible = false;
              }
              if (undefined !== this.thresholdStationsLayer) {
                this.thresholdStationsLayer.visible = true;

              }
              else {
                this._whenDojoLoaded().then(this._initThresholdStationsLayer.bind(this));
              }
              if (this.map.basemap.id !== 'topo') {
                this.map.basemap = 'topo';
              }
              break;
            case 'high_tide_flooding':
              if (undefined !== this.dailyStationsLayer) {
                this.dailyStationsLayer.visible = false;
              }
              if (undefined !== this.thresholdStationsLayer) {
                this.thresholdStationsLayer.visible = false;
              }
              if (undefined !== this.tidalStationsLayer) {
                this.tidalStationsLayer.visible = true;
              }
              else {
                this._whenDojoLoaded().then(this._initTidalStationsLayer.bind(this));
              }
              if (this.map.basemap.id !== 'oceans') {
                this.map.basemap = 'oceans';
              }
              break;

          }
          break;
      }
    },

    _setOptions: function (options) {
      let old_options = Object.assign({}, this.options);
      this._super(options);
      if (this.options.stationId !== old_options.stationId) {
        this._stationSelected();
      }
      if (this.options.extent !== old_options.extent && this.options.extent !== null) {
        this.view.goTo(new this.dojoMods.Extent(this.options.extent));
      }
      else if (this.options.center !== old_options.center && this.options.center !== null) {
        this.options.extent = null;
        this.view.goTo({center: new this.dojoMods.Point({latitude: this.options.center[0], longitude: this.options.center[1]}), zoom: this.options.zoom});
      }

      return this;
    },

    _stationSelected: function () {
      if (this.options.stationId === null) {
        return
      }
      $(this.nodes.stationOverlayContainer).css('visibility', 'visible');
      switch (this.options.mode) {
        case 'daily_vs_climate':
          $(this.nodes.stationOverlayContainer).append(
            '<div id="station-overlay">' +
            '   <div id="station-overlay-close">x</div>' +
            '   <div id="station-overlay-header">' +
            '       <h3 class="accent-color" style="margin-bottom: 20px;"><span class="icon icon-district"></span>Weather Station</h3>' +
            '       <h5>Name: ' + this.options.stationName + '</h5>' +
            '       <h5>Station ID: ' + this.options.stationId + '</h5>' +
            '   </div>' +
            '   <div id="multi-chart" class="left_chart"></div>' +
            '   <div id="multi-precip-chart" class="right_chart"></div>' +
            '   <div style="clear:both"></div>' +
            '   <div id="overlay-chart-container">' +
            '   <div class="station_overlay_text">' +
            '       <p style="font-weight:bold">Scroll, click-and-drag, or hold down your SHIFT key to scroll on either graph or axis to view more years or adjust the display.</p>' +
            '       <p>Blue bars on temperature graphs indicate the full range of observed temperatures for each day; the green band shows the average temperature range from 1981-2010. Comparing the two makes it easy to spot periods of above- and below-normal temperature.' +
            '       Green areas on precipitation graphs track year-to-date cumulative precipitation. Comparing observed precipitation to normal year-to-date totals (the black line) shows whether each season received above-, below-, or near-normal amounts of precipitation. Vertical portions of the year-to-date precipitation line show days when precipitation occurred.' +
            '       Data are from stations in the Global Historical Climatology Network-Daily dataset, compiled by the National Centers for Environmental Information and served by ACIS.</p>' +
            '   </div>' +
            '   </div>' +
            '</div>'
          );

          this.chart = new ChartBuilder({station: this.options.stationId}, this.options.dailyStationsDataURL);

          break;
        case 'thresholds':
          $(this.nodes.stationOverlayContainer).append(
            '<div id="station-overlay">' +
            '   <div id="station-overlay-close">x</div>' +
            '   <div id="station-overlay-header">' +
            '       <h3 class="accent-color" style="margin-bottom: 20px;"><span class="icon icon-district"></span>Weather Station</h3>' +
            '       <h5>Name: ' + this.options.stationName + '</h5>' +
            '       <h5>Station ID: ' + this.options.stationId + '</h5>' +
            '   </div>' +
            '   <div id="threshold_inputs">' +
            '       <div class="field-pair field-var">' +
            '           <label for="itemvariable">Variable:</label>' +
            '           <div class="field">' +
            '               <select name="itemvariable" id="itemvariable">' +
            '                   <option value="precipitation">Precipitation</option>' +
            '                   <option value="tavg">Average Temperature</option>' +
            '                   <option value="tmax">Maximum Temperature</option>' +
            '                   <option value="tmin">Minimum Temperature</option>' +
            '               </select>' +
            '           </div>' +
            '       </div>' +
            '       <div class="field-pair field-window append">' +
            '           <label for="window">Window:</label>' +
            '           <div class="field">' +
            '               <input type="number" id="window" name="window" value="1"> <span class="append">days</span>' +
            '           </div>' +
            '       </div>' +
            '       <div class="field-pair field-threshold append">' +
            '           <label for="threshold">Threshold:</label>' +
            '           <div class="field">' +
            '               <input type="number" name="threshold" id="threshold" value="1" step="0.1"> <span class="append" id="item_inches_or_f">°F</span>' +
            '           </div>' +
            '       </div>' +
            '   </div>' +
            '   <div id="overlay-thresholds-container">' +
            '<div id="thresholds-container"></div>' +
            '   <div class="station_overlay_text">' +
            '       <p style="width:65%!important;margin-left:200px;">To limit the tool to show to years with solid data records, we excluded years that are missing more than five daily temperature reports in a single month, or more than one precipitation report in a single month. Data are from stations in the Global Historical Climatology Network-Daily dataset, compiled by the National Centers for Environmental Information, and served by ACIS.</p>' +
            '   </div>' +
            '</div>' +
            '</div>' +
            '</div>'
          );

          $("#thresholds-container").item({
            station: this.options.stationId, // GHCN-D Station id (required)
            variable: 'precipitation', // Valid values: 'precipitation', 'tmax', 'tmin', 'tavg'
            threshold: 1.0,
            responsive: true,
            thresholdOperator: '>', // Valid values: '==', '>=', '>', '<=', '<'
            thresholdFilter: '', // Transformations/Filters to support additional units. Valid Values: 'KtoC','CtoK','FtoC','CtoF','InchToCM','CMtoInch'
            thresholdFunction: undefined, //Pass in a custom function: function(this, values){ return _.sum(values) > v2; }
            window: 1, // Rolling window size in days.
            dailyValueValidator: undefined, // Pass in a custom validator predicate function(value, date){return date.slice(0, 4) > 1960 && value > 5 }
            yearValidator: undefined, // Similar to dailyValueValidator
            dataAPIEndpoint: this.options.thresholdStationsDataURL.split('StnData')[0],
            barColor: '#307bda' // Color for bars.
          });

          $('#threshold').change(function () {
            $("#thresholds-container").item({threshold: parseFloat($('#threshold').val())}).item('update');
          });

          $('#station').change(function () {
            $("#thresholds-container").item('option', 'station', $('#station').val()).item('update');
          });


          // when #variable changes, update ui units and apply sensible defaults.
          $('#itemvariable').change(function (e) {
            let queryElements = undefined,
              missingValueTreatment = undefined,
              windowFunction = undefined;
            switch ($('#itemvariable').val()) {
              case 'precipitation':
                $('#thresholdUnits').text('in');
                $('#threshold').val(1.0);
                $('#item_inches_or_f').text('inches');
                break;
              case 'tmax':
                $('#thresholdUnits').text('F');
                $('#threshold').val(95);
                $('#item_inches_or_f').text('°F');
                break;
              case 'tmin':
                $('#thresholdUnits').text('F');
                $('#threshold').val(32);
                $('#item_inches_or_f').html('°F');
                break;
              case 'tavg':
                $('#thresholdUnits').text('F');
                $('#threshold').val(70);
                $('#item_inches_or_f').text('°F');
                break;
            }
            $("#thresholds-container").item({
              threshold: parseFloat($('#threshold').val()),
              variable: $('#itemvariable option:selected').val()
            }).item('update');
          });

          $('#percentileThreshold').change(function () {

            let value = $('#percentileThreshold').val();
            if (value === '') {
              return;
            }

            if (value <= 0 || value >= 100) {
              $('#percentileThreshold').addClass('form-control-danger');
              return;
            }

            $('#threshold').val($("#thresholds-container").item('getPercentileValue', value)).trigger('change');

          });

          $('#window').change(function () {
            $("#thresholds-container").item({window: parseInt($('#window').val())});
            $("#thresholds-container").item('update');
          });

          // this.chart = new ChartBuilder({station: value}, this.options.thresholdStationsDataURL);
          break;
        case 'high_tide_flooding':
          $(this.nodes.stationOverlayContainer).append(
            '<div id="station-overlay">' +
            '   <div id="station-overlay-close">x</div>' +
            '   <div id="station-overlay-header">' +
            '       <h3 class="accent-color" style="margin-bottom: 20px;"><span class="icon icon-district"></span>High Tide Flooding</h3>' +
            '       <h5>Name: <span class="station_name">' + this.options.stationName + '</span></h5>' +
            '       <h5>Station ID: <span class="station_id">' + this.options.stationId + '</span></h5>' +
            '   </div>' +
            '   <select name="" id="tidal_station" class="form-control" style="width: 200px;display:none">' +
            '       <option value="" disabled selected hidden>Station</option>' +
            '       <option value="8443970">Boston, MA</option>' +
            '       <option value="8454000">Providence, RI</option>' +
            '       <option value="8461490">New London, CT</option>' +
            '       <option value="8510560">Montauk, NY</option>' +
            '       <option value="8516945">Kings Point, NY</option>' +
            '       <option value="8518750">Battery, NY</option>' +
            '       <option value="8531680">Sandy Hook, NJ</option>' +
            '       <option value="8534720">Atlantic City, NJ</option>' +
            '       <option value="8545240">Philadelphia, PA</option>' +
            '       <option value="8557380">Lewes, DE</option>' +
            '       <option value="8574680">Baltimore, MD</option>' +
            '       <option value="8575512">Annapolis, MD</option>' +
            '       <option value="8594900">Washington D.C.</option>' +
            '       <option value="8638610">Sewells Point, VA</option>' +
            '       <option value="8658120">Wilmington, NC</option>' +
            '       <option value="8665530">Charleston, SC</option>' +
            '       <option value="8670870">Fort Pulaski, GA</option>' +
            '       <option value="8720030">Fernandina Beach, FL</option>' +
            '       <option value="8720218">Mayport, FL</option>' +
            '       <option value="8724580">Key West, FL</option>' +
            '       <option value="8726430">St Petersburg, FL</option>' +
            '       <option value="8771341">Galveston Bay, TX</option>' +
            '       <option value="8779770">Port Isabel, TX</option>' +
            '       <option value="9410230">La Jolla, CA</option>' +
            '       <option value="9414290">San Francisco, CA</option>' +
            '       <option value="9447130">Seattle, WA</option>' +
            '       <option value="1612340">Honolulu, HI</option>' +
            '   </select>' +
            '   <div id="overlay-chart-container">' +
            '      <div id="tidal-chart"></div>' +
            '       <div class="station_overlay_text">' +
            '          <p>Gray bars show annual counts of high-tide flooding in the past. Red and blue bars show projections of the average number of high-tide flooding events in future years.</p>' +
            '       </div>' +
            '   </div>' +
            '</div>'
          );


          $("#tidal-chart").tidalstationwidget({
            station: this.options.stationId,
            data_url: '/resources/tidal/tidal_data.json', // defaults to tidal_data.json
            responsive: true // set to false to disable ChartJS responsive sizing.
          });

          $('#station-overlay-header h3').html('Tidal Station');

          $('#location-stations').addClass('type-tidal');

          $('#stations-spinner').fadeOut(250);

          $('#tidal_station').change(function () {
            $("#tidal-chart").tidalstationwidget({station: $(this).val()});

            if ($(this).find('option:selected').length) {
              $('#station-overlay-header .station-name').html($(this).find('option:selected').text());
            }

            $('#station-overlay-header .station-id').html($(this).val());
          });

          break;
      }
      $('#station-overlay-close').click(function () {
        $(this.nodes.stationOverlayContainer).css('visibility', 'hidden');
        $(this.nodes.stationOverlayContainer).empty();
      }.bind(this));
    },

    _destroy: function () {
      // remove CSS classes, destroy nodes, etc
      Object.values(this.nodes).forEach(function (node) {
        node.remove()
      });
      this.map.destroy();
    },

    _log: function () {
      (this.options.debug === 3) && this._toLoggerMethod('log', arguments);
    },

    _warn: function () {
      (this.options.debug >= 2) && this._toLoggerMethod('warn', arguments);
    },

    _error: function () {
      (this.options.debug >= 1) && this._toLoggerMethod('error', arguments);
    },

    _toLoggerMethod: function (method, args) {
      args = Array.prototype.slice.call(arguments, 1);
      let logger = this.options.logger || console;
      logger.error.apply(logger, args);
    },

    // =========== Public methods=============================

    disable: function () {
      // Do any custom logic for disabling here, then
      this._super();
    },

    enable: function () {
      // Do any custom logic for enabling here, then
      this._super();
    },
    whenDojoMods: function (callback) {

      if (this.dojoMods !== undefined) {
        callback();
      }
      else {
        window.addEventListener('dojoModsLoaded', callback)
      }
    },


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

