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
      stationMOverMHHW: null, // only used for tidal stations
      mode: 'daily_vs_climate', // 'daily_vs_climate','thresholds','high_tide_flooding'
      //extent provides the initial view area of the map.
      extent: null,
      // defaultExtent: {xmin: -170, xmax: -70, ymin: 16, ymax: 67},
      // constrainMapToExtent: {xmin: -180, xmax: -62, ymin: 10, ymax: 54},
      //zoom and center are ignored if extent is provided.
      zoom: 3,
      center: [-123, 42],
      // Additional elements
      stationOverlayContainerId: "station-overlay-container",
      // Map layers
      dailyStationsLayerURL: "/resources/data/stations_whitelist.json",
      thresholdStationsLayerURL: "/resources/data/stations_whitelist.json",
      tidalStationsLayerURL: "/resources/vendor/tidal/tidal_stations.json",
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

    // Dojo modules this widget expects to use.
    dojoDeps: ['esri/Map', 'esri/views/MapView', 'esri/layers/FeatureLayer', 'esri/renderers/SimpleRenderer', 'esri/Graphic', 'esri/symbols/WebStyleSymbol', 'esri/symbols/SimpleFillSymbol', 'esri/widgets/Legend', 'esri/widgets/Expand', 'esri/widgets/BasemapGallery', 'esri/widgets/ScaleBar', 'esri/geometry/SpatialReference', 'esri/layers/CSVLayer', 'esri/geometry/Extent', 'esri/geometry/Point', 'esri/widgets/Locate', 'esri/core/watchUtils', 'esri/geometry/support/webMercatorUtils'],

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
        return Promise.resolve();
      }

      this._dojoLoadedPromise = new Promise(function (resolve) {
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
      }.bind(this)).catch(this._log);
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

      // All DOM nodes used by the widget (must be maintained for clean destruction)
      this.nodes = {};

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

      if (this.options.stationId) {
        this._stationSelected();
      }
    },

    _initMap: function _initMap() {
      this.map = new this.dojoMods.Map({
        basemap: this.options.mode === 'high_tide_flooding' ? 'oceans' : 'topo'
      });
      if ((undefined === this.options.extent || null === this.options.extent) && (undefined === this.options.center || null === this.options.center)) {
        this.options.extent = this.options.defaultExtent;
      }

      // for some reason lat long is backwards and to center a map you must pass long lat.
      // here I am switching lat long from center of tha map which is long lat back lat long order
      // this will although keeping the state url consistent accross local climate maps and stations map
      const mapCenter = this.options.lat && this.options.lon  ? [this.options.lon, this.options.lat] :  [-123, 42];
      const mapZoom = this.options.zoom   ? this.options.zoom :  8;

      // for some reason lat long is backwards and to center a map you must pass long lat.
      // here I am switching lat long from center of tha map which is long lat back lat long order
      // this will although keeping the state url consistent accross local climate maps and stations map
      this.view = new this.dojoMods.MapView({
        container: this.nodes.mapContainer,
        map: this.map,
        zoom: mapZoom,
        center: mapCenter,
        constraints: {
          rotationEnabled: false,
          minZoom: 3,
          maxZoom: 10,
          snapToZoom: false
        }
      });

      if (this.options.constrainMapToExtent) {
        this.constrainMapToExtent = this.dojoMods.webMercatorUtils.geographicToWebMercator(new this.dojoMods.Extent(this.options.constrainMapToExtent));
      }

      // Watch view's stationary property
      this.dojoMods.watchUtils.whenTrue(this.view, "stationary", function () {
        // Get the new extent of the view when view is stationary.
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

        // make sure the extent is defined than get the current map extent
        // use extent to get a list of current statiobs.
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

          // make sure layers item exists we will assume first layer
          // is the layer in question we will need to rethink this if we have multiple
          // layers, but as of now we have only ONE
          if (this.map.layers.items[0]) {
              // create arcgis json from layer
              const firstLayerJSON = {
                fields: this.map.layers.items[0].fields,
                geometryType: this.map.layers.items[0].geometryType,
                spatialReference: { wkid: this.map.layers.items[0].spatialReference.wkid },
                features: this.map.layers.items[0].features
              };

              // make geojson from arcgis json data so we can use turf to do a points in polygon
              // maje sure esri arcgis utils and turf have been added via script tag
              if (typeof ArcgisToGeojsonUtils !== "undefined" && typeof turf !== "undefined") {
                const LayerGeoJSON = ArcgisToGeojsonUtils.arcgisToGeoJSON(firstLayerJSON, "ObjectID" );

                // make polygon from current map extent
                // need to check performance on full extent may limit (full extent is acting funny)
                // but this is working for most scales.  we probably need to limit bigger than conus
                // limit the populatiing the list.
                const bbox = [xymin[0], xymin[1], xymax[0], xymax[1]];
                const poly = turf.bboxPolygon(bbox);

                // get station points within exte polygon
                var ptsWithin = turf.pointsWithinPolygon(LayerGeoJSON, poly);

                // console.log('stationary ptsWithin', ptsWithin);

                // update station pulldown and click events
                this._updateStationSelect(ptsWithin);

                // ensure function is defined
                if (typeof reEnableSelectNewItems !== "undefined") {
                  reEnableSelectNewItems('stations-select');
                }
                // add current object view object in case we need it again
                this.view.currentstations = ptsWithin;
                this.options.currentstations = ptsWithin;
              }
          }
          // sets url state zoom level
          if (this.view.zoom && this.view.zoom > 0) {
            this.options.zoom = Math.round(this.view.zoom*100)/100;
          }
          this._trigger('change', null, this.options);
        }
      }.bind(this));

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
        view: this.view, // Attaches the Locate button to the view
        graphic: new this.dojoMods.Graphic({
          symbol: { type: "simple-marker" // overwrites the default symbol used for the
            // graphic placed at the location of the user when found
          } })
      });

      this.view.ui.add(this.locateWidget, "top-left");
    },
    _updateStationSelect: function _updateStationSelect(currentstations){
      // sort hubs by name A-Z
      const currentstationsSorted = currentstations.features.sort((a, b) => {
        if (a.properties.name > b.properties.name) {
          return 1;
        }
        if (a.properties.name < b.properties.name) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });

      // make li for select pulldown
      let stationLi = '';
      currentstationsSorted.forEach( (station) => {
        if (this.options.mode === 'high_tide_flooding') {
          stationLi += `<li rel="${station.properties.id}|${station.properties.name}|${station.properties.mOverMHHW}|" class="default-select-option">${station.properties.name} - (${station.properties.id})</li>\n`;
        } else {
          stationLi += `<li rel="${station.properties.id},${station.properties.name}" class="default-select-option">${station.properties.name} - (${station.properties.id})</li>\n`;
        }
      })

      // update select elem if it exists
      const stationsElem = document.querySelector('#stations-select-wrapper .select-options')
      if (stationsElem) {
        stationsElem.innerHTML = stationLi;
      }
    },
    _createStationLayer: function _createStationLayer(layerURL, options) {
      var _this = this;

      // We implement our own json layer creator
      if (layerURL.endsWith('json')) {
        return Promise.resolve($.ajax({
          url: layerURL,
          type: "GET",
          contentType: "application/json; charset=utf-8",
          dataType: "json"
        })).catch(function (e) {
          console.log(e);
        }).then(function (data) {
          if (undefined === data) {
            console.log('Failed to retrieve station data. Refresh to try again.');
            throw 'Failed to retrieve station data. Refresh to try again.';
          }
          var features = [];
          data.forEach(function (station, index) {
            features.push(new this.dojoMods.Graphic({
              geometry: {
                type: "point", // autocasts as new Point()
                longitude: station.lon,
                latitude: station.lat
              },
              attributes: {
                ObjectID: index,
                id: station.id,
                name: station.station ? station.station : station.name,
                mOverMHHW: station.derived || null
              }
            }));
          }.bind(_this));

          // add featureLayerJSON must have a object key features
          //  to be valud arcgis feature json
          const featureLayerJSON = {
            // create an instance of esri/layers/support/Field for each field object
            fields: [{
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
            }, {
              name: "mOverMHHW",
              alias: "mOverMHHW",
              type: "string"
            }],
            objectIdField: "ObjectID",
            geometryType: "point",
            spatialReference: { wkid: 4326 },
            features: features,
            source: features
          };
        return new _this.dojoMods.FeatureLayer(_extends(featureLayerJSON, options));
        });
      } else {
        //if url is a feature service or csv we use the provided methods for creating them.
        var layerClass = this.dojoMods.FeatureLayer;
        if (layerURL.endsWith('csv')) {
          layerClass = this.dojoMods.CSVLayer;
        }
        return Promise.resolve(new layerClass(_extends({ url: layerURL }, options)));
      }
    },
    _initDailyStationsLayer: function _initDailyStationsLayer() {
      this._createStationLayer(this.options.dailyStationsLayerURL, {
        outfields: ['*'],
        renderer: {
          type: "simple", // autocasts as new SimpleRenderer()
          symbol: {
            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
            size: 10,
            color: "#124086",
            outline: {
              color: '#1D64DD',
              width: 2
            }
          }
        }
      }).then(function (layer) {
        this.dailyStationsLayer = layer;
        this._MapInitPromise.then(function () {
          this.map.add(this.dailyStationsLayer);
          this.view.on("pointer-move", function (event) {
            $('#stations-map circle').each(function () {
              if ("stationTooltip" in this) {
                this.stationTooltip.hide();
              }
            });
            this.view.hitTest(event).then(function (response) {

              if(response.results.length > 0){
                // make pointer cursor - mouse IS over a station feature
                document.getElementById('stations-map').style.cursor = "pointer";
              } else {
                // make default cursor - mouse IS NOT over station feature
                document.getElementById('stations-map').style.cursor = "default";
              }
              var station = response.results.filter(function (result) {
                return result.graphic.layer === this.dailyStationsLayer;
              }.bind(this))[0].graphic;
              var refEl = $('circle:hover').first();
              if (!("stationTooltip" in refEl)) {
                refEl.stationTooltip = new Tooltip(refEl, {
                  placement: 'right',
                  title: station.attributes.name,
                  container: $('#stations-map')[0]
                });
              }
              refEl.stationTooltip.show();
            }.bind(this));
          }.bind(this));
          this.view.on("click", function (event) {
            this.view.hitTest(event).then(function (response) {
              var station = response.results.filter(function (result) {
                return result.graphic.layer === this.dailyStationsLayer;
              }.bind(this))[0].graphic;
              this._setOptions({ stationName: station.attributes.name, stationId: station.attributes.id });
              this._trigger('stationUpdated', null, this.options);
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    },

    _initThresholdStationsLayer: function _initThresholdStationsLayer() {
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
      this._createStationLayer(this.options.thresholdStationsLayerURL, {
        outfields: ['*'],
        renderer: {
          type: "simple", // autocasts as new SimpleRenderer()
          symbol: {
            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
            size: 10,
            color: "#124086",
            outline: {
              color: '#1D64DD',
              width: 2
            }
          }
        }
      }).then(function (layer) {
        this.thresholdStationsLayer = layer;
        this._MapInitPromise.then(function () {
          this.map.add(this.thresholdStationsLayer);
          this.view.on("pointer-move", function (event) {
            $('#stations-map circle').each(function () {
              if ("stationTooltip" in this) {
                this.stationTooltip.hide();
              }
            });
            this.view.hitTest(event).then(function (response) {
              var station = response.results.filter(function (result) {
                return result.graphic.layer === this.thresholdStationsLayer;
              }.bind(this))[0].graphic;

              var refEl = $('circle:hover').first();
              if (!("stationTooltip" in refEl)) {
                refEl.stationTooltip = new Tooltip(refEl, {
                  placement: 'right',
                  title: station.attributes.name,
                  container: $('#stations-map')[0]
                });
              }
              refEl.stationTooltip.show();
            }.bind(this));
          }.bind(this));
          this.view.on("click", function (event) {
            this.view.hitTest(event).then(function (response) {
              var station = response.results.filter(function (result) {
                return result.graphic.layer === this.thresholdStationsLayer;
              }.bind(this))[0].graphic;
              this._setOptions({ stationName: station.attributes.name, stationId: station.attributes.id });
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    },

    _initTidalStationsLayer: function _initTidalStationsLayer() {
      this._createStationLayer(this.options.tidalStationsLayerURL, {
        outfields: ['*'],
        renderer: {
          type: "simple", // autocasts as new SimpleRenderer()
          symbol: {
            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
            size: 10,
            color: "#124086",
            outline: {
              color: '#1D64DD',
              width: 2
            }
          }
        }
      }).then(function (layer) {
        this.tidalStationsLayer = layer;
        this._MapInitPromise.then(function () {
          this.map.add(this.tidalStationsLayer);
          this.view.on("pointer-move", function (event) {
            $('#stations-map circle').each(function () {
              if ("stationTooltip" in this) {
                this.stationTooltip.hide();
              }
            });
            this.view.hitTest(event).then(function (response) {

              if(response.results.length > 0){
                // make pointer cursor - mouse IS over a station feature
                document.getElementById('stations-map').style.cursor = "pointer";
              } else {
                // make default cursor - mouse IS NOT over station feature
                document.getElementById('stations-map').style.cursor = "default";
              }
              var station = response.results.filter(function (result) {
                return result.graphic.layer === this.tidalStationsLayer;
              }.bind(this))[0].graphic;
              var refEl = $('circle:hover').first();
              if (!("stationTooltip" in refEl)) {
                refEl.stationTooltip = new Tooltip(refEl, {
                  placement: 'right',
                  title: station.attributes.name,
                  container: $('#stations-map')[0]
                });
              }
              refEl.stationTooltip.show();
            }.bind(this));
          }.bind(this));
          this.view.on("click", function (event) {
            this.view.hitTest(event).then(function (response) {
              var station = response.results.filter(function (result) {
                return result.graphic.layer === this.tidalStationsLayer;
              }.bind(this))[0].graphic;
              this._setOptions({ tidalStationName: station.attributes.name, tidalStationId: station.attributes.id, tidalStationMOverMHHW: station.attributes.mOverMHHW || null });
              this._trigger('stationUpdated', null, this.options);
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    },

    // Init is automatically invoked after create, and again every time the
    //  widget is invoked with no arguments after that
    _init: function _init() {
      this._trigger('initialized');
    },

    // I find it useful to separate out my event handler logic just for
    // organization and readability's sake, but it's certainly not necessary
    _addHandlers: function _addHandlers() {},

    // Allows the widget to react to option changes. Any custom behaviors
    // can be configured here.
    _setOption: function _setOption(key, value) {
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
              } else {
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
              } else {
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
              } else {
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

    _setOptions: function _setOptions(options) {
      var old_options = _extends({}, this.options);
      this._super(options);
      if (this.options.stationId !== old_options.stationId) {
        this._stationSelected();
      }
      if (this.options.extent !== old_options.extent && this.options.extent !== null) {
        this.view.goTo(new this.dojoMods.Extent(this.options.extent));
      } else if (this.options.center !== old_options.center && this.options.center !== null) {
        this.options.extent = null;
        this.view.goTo({ center: new this.dojoMods.Point({ latitude: this.options.center[0], longitude: this.options.center[1] }), zoom: this.options.zoom });
      }
      this._trigger('change', null, this.options);
      return this;
    },

    _stationSelected: function _stationSelected() {
      if (this.options.stationId === null) {
        return;
      }

      $(this.nodes.stationOverlayContainer).css('visibility', 'visible');
      switch (this.options.mode) {
        case 'daily_vs_climate':
          return null;
          // all handled via html in template now
          break;
        case 'thresholds':
        return null;
        // all handled via html in template now
          $(this.nodes.stationOverlayContainer).append('\n            <div id="station-overlay">\n              <div id="station-overlay-close">x</div>\n              <div id="station-overlay-header">\n                <div class="accent-color tidal-header" style="margin-bottom: 20px;">\n                <span class="icon icon-district station-overlay-header-icon"></span>Weather Station Threshholds\n                <div class="thresholds-download-btns">\n                    <a href="javascript:void(0)" class="download-thresholds-image"><span class="icon icon-download-image"></span><span class="d-none-xs">Image</span></a> \n                    <a href="javascript:void(0)" class="download-thresholds-data"><span class="icon icon-download-chart"></span><span class="d-none-xs">Data</span></a>\n                    </div>\n                </div>\n                <h5>Name: ' + this.options.stationName + '</h5>\n                <h5>Station ID: ' + this.options.stationId + '</h5>\n              </div>\n              <div id="threshold_inputs">\n                <div class="field-pair field-var">\n                  <label for="itemvariable">Variable:</label>\n                  <div class="field">\n                    <select name="itemvariable" id="itemvariable">\n                      <option value="precipitation">Precipitation</option>\n                      <option value="tavg">Average Temperature</option>\n                      <option value="tmax">Maximum Temperature</option>\n                      <option value="tmin">Minimum Temperature</option>\n                    </select>\n                  </div>\n                </div>\n                <div class="field-pair field-threshold append">\n                  <label for="threshold">Threshold:</label>\n                  <div class="field">\n                    <input type="number" name="threshold" id="threshold" value="1" step="0.1"> <span class="append" id="item_inches_or_f">inches</span>\n                  </div>\n                </div>\n                <div class="field-pair field-window append">\n                  <label for="window">Window:</label>\n                  <div class="field">\n                    <input type="number" id="window" name="window" value="1"> <span class="append">days</span>\n                  </div>\n                </div>\n                \n              </div>\n              <div id="overlay-thresholds-container">\n                <div id="thresholds-container"></div>\n                <div class="station_overlay_text">\n                  <p>This graph shows how often the selected threshold has been exceeded per year. For consistency, this chart excludes any years that are missing more than five daily temperature reports or more than one precipitation report in a single month. Data from <a target="_blank" href="https://www.ncdc.noaa.gov/data-access/land-based-station-data/land-based-datasets/global-historical-climatology-network-ghcn">Global Historical Climatology Network</a>, served by <a  target="_blank" href="http://www.rcc-acis.org/">ACIS</a>.</p>\n                </div>\n              </div>\n            </div>\n            </div>');

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

          $('.download-thresholds-image').click(function (event) {
            event.currentTarget.href = $("#thresholds-container canvas")[0].toDataURL('image/png');
            event.currentTarget.download = "thresholds_" + this.options.stationId + ".png";
          }.bind(this));

          $('.download-thresholds-data').click(function (event) {
            $("#thresholds-container").item('downloadExceedanceData', event.currentTarget);
          }.bind(this));

          $('#threshold').change(function () {
            $("#thresholds-container").item({ threshold: parseFloat($('#threshold').val()) }).item('update');
          });

          $('#station').change(function () {
            $("#thresholds-container").item('option', 'station', $('#station').val()).item('update');
          });

          // when #variable changes, update ui units and apply sensible defaults.
          $('#itemvariable').change(function () {
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

            var value = $('#percentileThreshold').val();
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
            $("#thresholds-container").item({ window: parseInt($('#window').val()) });
            $("#thresholds-container").item('update');
          });

          // this.chart = new ChartBuilder({station: value}, this.options.thresholdStationsDataURL);
          break;
        case 'high_tide_flooding':
        return null;
        // // all handled via html in template now
        //   $(this.nodes.stationOverlayContainer).append('\n              <div id="station-overlay">\n                <div id="station-overlay-close">x</div>\n                <div id="station-overlay-header">\n                  <div class="accent-color tidal-header" style="margin-bottom: 20px;">\n                    <span class="icon icon-district station-overlay-header-icon"></span>Tidal Station High-tide Flooding\n                    <span class="tidal-download-btns">\n                    <a href="javascript:void(0)" class="download-tidal-image"><span class="icon icon-download-image"></span><span class="d-none-xs">Image</span></a> \n                    <a href="https://tidesandcurrents.noaa.gov/publications/techrpt86_PaP_of_HTFlooding.csv" class="download-tidal-data"><span class="icon icon-download-chart"></span><span class="d-none-xs">Data</span></a>\n                    </span>\n                  </div>\n                  <h5>Name: <span class="station_name">' + this.options.stationName + '</span></h5>\n                  <h5>Station ID: <span class="station_id">' + this.options.stationId + '</span></h5>\n                  <h5>Local threshold: ' + (this.options.stationMOverMHHW ? this.options.stationMOverMHHW + "m over MHHW" : "") + '</h5>\n                  <button type="button" class="tidal-zoom-toggle-btn"><span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span> Historical</button>\n                </div>\n                <select name="" id="tidal_station" class="form-control" style="width: 200px;display:none">\n                  <option value="" disabled selected hidden>Station</option>\n                  <option value="8443970">Boston, MA</option>\n                  <option value="8454000">Providence, RI</option>\n                  <option value="8461490">New London, CT</option>\n                  <option value="8510560">Montauk, NY</option>\n                  <option value="8516945">Kings Point, NY</option>\n                  <option value="8518750">Battery, NY</option>\n                  <option value="8531680">Sandy Hook, NJ</option>\n                  <option value="8534720">Atlantic City, NJ</option>\n                  <option value="8545240">Philadelphia, PA</option>\n                  <option value="8557380">Lewes, DE</option>\n                  <option value="8574680">Baltimore, MD</option>\n                  <option value="8575512">Annapolis, MD</option>\n                  <option value="8594900">Washington D.C.</option>\n                  <option value="8638610">Sewells Point, VA</option>\n                  <option value="8658120">Wilmington, NC</option>\n                  <option value="8665530">Charleston, SC</option>\n                  <option value="8670870">Fort Pulaski, GA</option>\n                  <option value="8720030">Fernandina Beach, FL</option>\n                  <option value="8720218">Mayport, FL</option>\n                  <option value="8724580">Key West, FL</option>\n                  <option value="8726430">St Petersburg, FL</option>\n                  <option value="8771341">Galveston Bay, TX</option>\n                  <option value="8779770">Port Isabel, TX</option>\n                  <option value="9410230">La Jolla, CA</option>\n                  <option value="9414290">San Francisco, CA</option>\n                  <option value="9447130">Seattle, WA</option>\n                  <option value="1612340">Honolulu, HI</option>\n                </select>\n                <div id="overlay-chart-container">\n                  <div id="tidal-chart"></div>\n                  <div class="station_overlay_text">\n                    <p>Click \'Historical\' button to zoom in on or out from the observational period. Place your cursor over the curves on this graph for details. Gray bars from 1950 to 2016 show observed annual counts of high-tide flooding. Red and blue curves show the average number of high-tide flooding events projected for future years under two scenarios. Data from <a target="_blank" href="https://tidesandcurrents.noaa.gov/publications/techrpt86_PaP_of_HTFlooding.pdf">NOAA Technical Report NOS CO-OPS 086 - Patterns and Projections of High-tide Flooding</a>.</p>\n                  </div>\n                </div>\n              </div>');
        //
        //   $("#tidal-chart").tidalstationwidget({
        //     station: this.options.stationId,
        //     data_url: '/resources/vendor/tidal/tidal_data.json', // defaults to tidal_data.json
        //     responsive: true // set to false to disable ChartJS responsive sizing.
        //   });
        //
        //   $('.tidal-zoom-toggle-btn').click(function () {
        //     $("#tidal-chart").tidalstationwidget('zoomToggle');
        //     $('.tidal-zoom-toggle-btn').toggleClass('active');
        //   });
        //
        //   $('.download-tidal-image').click(function (event) {
        //     event.currentTarget.href = $("#tidal-chart canvas")[0].toDataURL('image/png');
        //     event.currentTarget.download = "high_tide_flooding_" + this.options.stationId + ".png";
        //   }.bind(this));
        //
        //   $('#station-overlay-header h3').html('Tidal Station');
        //
        //   $('#location-stations').addClass('type-tidal');
        //
        //   $('#stations-spinner').fadeOut(250);
        //
        //   $('#tidal_station').change(function () {
        //     $("#tidal-chart").tidalstationwidget({ station: $(this).val() });
        //
        //     if ($(this).find('option:selected').length) {
        //       $('#station-overlay-header .station-name').html($(this).find('option:selected').text());
        //     }
        //
        //     $('#station-overlay-header .station-id').html($(this).val());
        //   });
          break;
      }
      $('#station-overlay-close').click(function () {
        $(this.nodes.stationOverlayContainer).css('visibility', 'hidden');
        this.options.stationId = null;
        this.options.stationName = null;
        this._trigger('change', null, this.options);
        $(this.nodes.stationOverlayContainer).empty();
      }.bind(this));
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
