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
      state: null,
      county: null,
      variable: 'tmax',
      season: 'summer',
      leftScenario: 'historical', // 'historical', 'rcp85','rcp45'
      rightScenario: 'rcp85', // 'historical', 'rcp85','rcp45'
      disableScenarioSelection: false,
      leftYear: 'avg', //1950 - 2100
      rightYear: 2090, //1950 - 2100
      leftOpacity: 1,
      rightOpacity: 1,
      historicalYears: [1950, 1960, 1970, 1980, 1990, 2000],
      rcp45Years: [2010, 2020, 2030, 2040, 2050, 2060, 2070, 2080, 2090],
      rcp85Years: [2010, 2020, 2030, 2040, 2050, 2060, 2070, 2080, 2090],
      showCounties: true,
      defaultExtent: {xmin: -119, xmax: -73, ymin: 18, ymax: 54},
      //extent provides the initial view area of the map.
      extent: null,
      //zoom and center are ignored if extent is provided.
      zoom: null, // Ex: 5
      center: null, // Ex: [-98.21, 37.42]
      swipeX: null,
      // Additional elements
      legendContainerId: "legend-container",
      // Map layers
      historicalTilesURL: "https://s3.amazonaws.com/climate-explorer-bucket/tiles/{year}-{season}-hist-{variable}/{level}/{col}/{row}.png",
      historicalTilesTMS: true,
      rcp45TilesURL: "https://s3.amazonaws.com/climate-explorer-bucket/tiles/{year}-{season}-rcp45-{variable}/{level}/{col}/{row}.png",
      rcp45TilesTMS: true,
      rcp85TilesURL: "https://s3.amazonaws.com/climate-explorer-bucket/tiles/{year}-{season}-rcp85-{variable}/{level}/{col}/{row}.png",
      rcp85TilesTMS: true,
      statesLayerURL: '/resources/data/states.json',
      countiesLayerURL: '/resources/data/counties-20m.json',
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
    dojoDeps: [
      'esri/Map',
      'esri/views/MapView',
      'esri/layers/FeatureLayer',
      'esri/layers/support/Field',
      'esri/layers/WebTileLayer',
      'esri/layers/TileLayer',
      'esri/renderers/SimpleRenderer',
      'esri/Graphic',
      'esri/symbols/WebStyleSymbol',
      'esri/symbols/SimpleFillSymbol',
      'esri/widgets/Legend',
      'esri/widgets/Expand',
      'esri/widgets/OpacitySlider',
      'esri/widgets/ColorSlider',
      'esri/widgets/BasemapGallery',
      'esri/widgets/ScaleBar',
      'esri/geometry/SpatialReference',
      'esri/layers/CSVLayer',
      'esri/geometry/Extent',
      'esri/geometry/Point',
      'esri/geometry/Polygon',
      'esri/widgets/Locate',
      'esri/core/watchUtils',
      'esri/geometry/support/webMercatorUtils'
    ],
    // recreated in ce.js for the purposes of breadcrumbs
    // todo: move to one central variable location
    variables: {
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
    },

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
        return Promise.resolve().catch(this._log.bind(this));
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

          let arcgisStyles = document.createElement("link");
          arcgisStyles.rel = 'stylesheet';
          arcgisStyles.href = 'https://js.arcgis.com/4.6/esri/css/main.css';
          document.head.appendChild(arcgisStyles);
          let arcgisScripts = document.createElement("script");
          arcgisScripts.type = "text/javascript";
          arcgisScripts.src = "https://js.arcgis.com/4.6/";
          document.head.appendChild(arcgisScripts);
          arcgisScripts.addEventListener('load', function (resolve) {
            this._registerDojoMods(resolve)
          }.bind(this, resolve));
        } else {
          this._registerDojoMods(resolve);
        }
      }.bind(this))
        .catch(this._log.bind(this));
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
      // All DOM nodes used by the widget (must be maintained for clean destruction)
      this.nodes = {};

      this.leftLayer = null;
      this.rightLayer = null;

      this.nodes.mapContainer = this.element[0];
      this.nodes.stationOverlayContainer = $('#' + this.options.stationOverlayContainerId)[0];
      this._initControlsOverlay();
      this._mapInitPromise = this._whenDojoLoaded().then(this._initMap.bind(this)).catch(this._log.bind(this));

      let layerPromises = [
        this._whenDojoLoaded().then(this._updateScenarioLayers.bind(this)),
        this._whenDojoLoaded().then(this._initStatesLayer.bind(this))
      ];
      if (this.options.showCounties) {
        layerPromises.push(this._whenDojoLoaded().then(this._updateCountiesLayer.bind(this)));
      }
      return Promise.all(layerPromises).then(this._trigger.bind(this, 'layersloaded', null, null));

    },
    _initControlsOverlay: function () {
      this.nodes.$controlsOverLayContainer = $('<div>', {'class': 'scenario-map-overlay-container'});
      this.nodes.$controlsOverLayContainer.append(`
        <div class="movable slider-div">
          <div class="handle"></div>
        </div>
        <div class="left-scenario-controls">
         <div class="left-scenario-dropdown">
          <select name="leftScenario" class="dropdown">
            <option value="historical">HISTORICAL</option>
            <option value="rcp45">LOWER EMISSIONS</option>
          </select>
        </div>
           <div class="year left-year-slider-container">
          <div class="year-label year-min"></div>
          <div class="left-year-slider"></div>
          <div class="year-label year-max"></div>
        </div>
        </div>
        <div class="right-scenario-controls">
                 
          <div class="right-scenario-dropdown" >
          <select name="rightScenario" class="dropdown">
            <option value="rcp85">HIGHER EMISSIONS</option>
            <option value="rcp45">LOWER EMISSIONS</option>
          </select></div>
          <div class="year right-year-slider-container">
            <div class="year-label year-min"></div>
            <div class="right-year-slider"></div>
            <div class="year-label year-max"></div>
          </div>
        </div>
          
    `);
      $(this.nodes.mapContainer).append(this.nodes.$controlsOverLayContainer);
      this.nodes.$leftScenario = $(this.element).find(".left-scenario-controls .dropdown");
      this.nodes.$leftScenario.val(this.options.leftScenario);
      this.nodes.$leftScenario.dropdown({bottomEdge: 10});
      this.nodes.$leftScenario.on('change', function () {
        if (this.nodes.$leftScenario.val() !== undefined && this.nodes.$leftScenario.val() !== null) {
          this._setOptions({leftScenario: this.nodes.$leftScenario.val()})
        }
      }.bind(this));
      this.nodes.$rightScenario = $(this.element).find(".right-scenario-controls .dropdown");
      this.nodes.$leftScenario.val(this.options.rightScenario);
      this.nodes.$rightScenario.dropdown({bottomEdge: 10});
      this.nodes.$rightScenario.on('change', function () {
        if (this.nodes.$rightScenario.val() !== undefined && this.nodes.$rightScenario.val() !== null) {
          this._setOptions({rightScenario: this.nodes.$rightScenario.val()});
        }
      }.bind(this));
      this.nodes.$controlsOverLayContainer.find('.movable.slider-div').draggable({
        axis: "x",
        containment: this.nodes.$controlsOverLayContainer,
        scroll: false,
        drag: function (event, ui) { this._setOptions({swipeX: ui.position.left}) }.bind(this),
        stop: function (event, ui) { this._setOptions({swipeX: ui.position.left}) }.bind(this)
      });

      this._updateLeftYearSlider();
      this._updateRightYearSlider();


    },
    _initMap: function () {
      this.map = new this.dojoMods.Map({
        basemap: 'topo'
      });

      if ((undefined === this.options.extent || null === this.options.extent) && (undefined === this.options.center || null === this.options.center)){
        this.options.extent = this.options.defaultExtent;
      }
      this.view = new this.dojoMods.MapView({
        container: this.nodes.mapContainer,
        map: this.map,
        zoom:  this.options.zoom,
        // center: this.options.extent ? null : this.dojoMods.webMercatorUtils.lngLatToXY(this.options.center[0],this.options.center[1]),
        center: this.options.extent ? null : this.options.center,
        extent: this.options.extent ? this.dojoMods.webMercatorUtils.geographicToWebMercator(new this.dojoMods.Extent(this.options.extent)) : null,
        constraints: {
          rotationEnabled: false,
          minZoom: 4,
          maxZoom: 10
        }
      });

      // Watch view's stationary property
      this.dojoMods.watchUtils.whenTrue(this.view, "stationary", function () {
        // Get the new extent of the view when view is stationary.
        if (this.view.extent) {
          let xymin = this.dojoMods.webMercatorUtils.xyToLngLat(this.view.extent.xmin, this.view.extent.ymin);
          let xymax = this.dojoMods.webMercatorUtils.xyToLngLat(this.view.extent.xmax, this.view.extent.ymax);
          let quickRound = function (num) {return Math.round(num * 100 + Number.EPSILON) / 100};
          this.options.extent = {
            xmin: quickRound(xymin[0]),
            xmax: quickRound(xymax[0]),
            ymin: quickRound(xymin[1]),
            ymax: quickRound(xymax[1])
          };
          if (this.view.zoom && this.view.zoom > 0) { this.options.zoom = this.view.zoom;}
          this._trigger('change', null, this.options);
        }
      }.bind(this));

      this.locateWidget = new this.dojoMods.Locate({
        view: this.view,   // Attaches the Locate button to the view
        // graphic: new this.dojoMods.Graphic({
        //   symbol: {type: "simple-marker"}  // overwrites the default symbol used for the
        //   // graphic placed at the location of the user when found
        // }),
        useHeadingEnabled: false
      });

      this.view.ui.add(this.locateWidget, "top-left");

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

      this.nodes.$legendContainer = $('<div></div>');
      this._updateLegend();
      this.legendExpand = new this.dojoMods.Expand({
        expandIconClass: 'esri-icon-description',
        view: this.view,
        content: this.nodes.$legendContainer[0],
        expanded: true,
      });

      this.view.ui.add(this.legendExpand, 'top-left');

      this.scaleBar = new this.dojoMods.ScaleBar({
        view: this.view,
        units: 'dual'
      });

      this.view.ui.add(this.scaleBar, {
        position: "bottom-left"
      });
    },

    _updateScenarioLayers: function () {
      return Promise.all([
        this._updateLeftScenarioLayer(),
        this._updateRightScenarioLayer()
      ]);
    },

    _updateLeftScenarioLayer: function () {
      if (this.leftLayer !== null) {
        let oldLeftLayer = this.leftLayer;
        setTimeout(function () {
            oldLeftLayer.visible = false;
            oldLeftLayer.destroy();
          }
          , 400);
        this.leftLayer = null;
      }

      return this._initScenarioLayer(this.options.leftScenario, this.options.leftYear, 'left', this.options.leftOpacity)
        .then(function (layer) {
          this.leftLayer = layer;
          return layer;
        }.bind(this));

    },

    _updateRightScenarioLayer: function () {
      if (this.rightLayer !== null) {
        let oldRightLayer = this.rightLayer;
        setTimeout(function () {
            oldRightLayer.visible = false;
            oldRightLayer.destroy();
          }
          , 400);
        this.rightLayer = null;
      }

      return this._initScenarioLayer(this.options.rightScenario, this.options.rightYear, 'right', this.options.rightOpacity)
        .then(function (layer) {
          this.rightLayer = layer;
          return layer;
        }.bind(this));
    },

    _initScenarioLayer: function (scenario, year, side, opacity) {
      let promise = new Promise(function (resolve, reject) {
        let layerClass = this.dojoMods.TileLayer;
        if (this.options[scenario + 'TilesURL'].endsWith('png')) { layerClass = this.dojoMods.WebTileLayer; }
        let layer = new layerClass({urlTemplate: this._getScenarioURL(scenario, year), opacity: opacity});
        //TMS hack
        if (this.options[scenario + 'TilesURL'].endsWith('png') && this.options[scenario + 'TilesTMS']) {
          layer.getTileUrl = function (level, row, col) {
            level = this.levelValues[level];
            if (0 > row || row >= (1 << level)) { return null; }
            row = Math.pow(2, level) - row - 1;

            return this.tileServers[row % this.tileServers.length] + this.urlPath.replace(/\{level\}/gi, level).replace(/\{row\}/gi, row).replace(/\{col\}/gi, col);
          };
        }
        this._mapInitPromise.then(function (layer) {
          this.map.add(layer, 2);
        }.bind(this, layer));
        resolve(layer);
      }.bind(this))
        .catch(this._log.bind(this));
      // hook the layerView's first render to apply the clipping path.
      promise.then(function (layer) {
        this.view.whenLayerView(layer).then(function (layerView) {
          new Promise(function (resolve) {
            layerView.container._doRender = layerView.container.doRender;
            layerView.container._setClipPath = this._setClipPath;
            layerView.container._swipeX = this.options.swipeX;
            layerView.container._setSwipeX = function (value) {this.options.swipeX = value;}.bind(this);
            layerView.container.doRender = function (a) {
              this._doRender(a);
              if (this._swipeX === null) {
                this._swipeX = this.element.width / 2;
                this._setSwipeX(this._swipeX);
              }
              this._setClipPath(this.element, side, this._swipeX);
              resolve();
            };
          }.bind(this))
            .catch(this._log.bind(this))
            .then(function () {
              layerView.container.doRender = layerView.container._doRender;
            });
        }.bind(this));
      }.bind(this));
      return promise;
    },

    // Init is automatically invoked after create, and again every time the
    //  widget is invoked with no arguments after that
    _init: function () {
      this._trigger('initialized');
    },

    _updateCountiesLayer: function () {
      if (undefined !== this.countiesLayer) {
        return Promise.resolve(this.countiesLayer)
      }
      return this._createReferenceLayer(this.options.countiesLayerURL, {
        geometryType: 'polygon',
        spatialReference: {wkid: 4326},
        objectIdField: 'STATE',
        fields: [new this.dojoMods.Field({
            name: "GEO_ID",
            alias: "GEO_ID",
            type: "string"
          },
          {
            name: "NAME",
            alias: "Name",
            type: "string"
          },
          {
            name: "STATE",
            alias: "State",
            type: "string"
          },
          {
            name: "COUNTY",
            alias: "County",
            type: "string"
          })],
        renderer: {
          type: 'simple',
          symbol: {
            type: "simple-fill",  // autocasts as new SimpleFillSymbol()
            style: "solid",
            color: [0, 0, 0, 0],
            outline: {  // autocasts as new SimpleLineSymbol()
              color: "black",
              width: 0.3
            }
          }
        }
      }).then(function (layer) {
        this.countiesLayer = layer;
        this._mapInitPromise.then(function () {
          this.map.add(this.countiesLayer, 10);
          this.view.on("click", function (event) {
            this.view.hitTest(event)
              .then(function (response) {
                let county = response.results.filter(function (result) {
                  return result.graphic.layer === this.countiesLayer;
                }.bind(this))[0].graphic;
                this.options.county = county.attributes['GEO_ID'];
                this.options.countyName = county.attributes['NAME'] + ' ' + county.attributes['LSAD'];
                this._updateOverlay();
              }.bind(this));
          }.bind(this));
        }.bind(this));
        return layer;
      }.bind(this));


    },
    _initStatesLayer: function () {
      return this._createReferenceLayer(this.options.statesLayerURL, {
        geometryType: 'polygon',
        spatialReference: {wkid: 4326},
        objectIdField: 'GEO_ID',
        opacity: 0.5,
        fields: [new this.dojoMods.Field({
          name: "GEO_ID",
          alias: "GEO_ID",
          type: "string"
        }, {
          name: "STATE",
          alias: "State",
          type: "string"
        })],
        renderer: {
          type: 'simple',
          symbol: {
            type: "simple-fill",  // autocasts as new SimpleFillSymbol()
            style: "none",
            outline: {  // autocasts as new SimpleLineSymbol()
              color: "black",
              width: 1
            }
          }
        }
      }).then(function (layer) {
        this.statesLayer = layer;
        this._mapInitPromise.then(function () {
          this.map.add(this.statesLayer, 10)
        }.bind(this))
      }.bind(this));

    },


    _createReferenceLayer: function (layerURL, options) {
      // We implement our own json layer creator
      if (layerURL.endsWith('json')) {
        return Promise.resolve($.ajax({
          url: layerURL,
          type: "GET",
          contentType: "application/json; charset=utf-8",
          dataType: "json",
        }))
          .catch(this._error)
          .then(function (data) {
            if (undefined === data) {
              throw 'Failed to retrieve station data. Refresh to try again.'
            }
            return new Promise(function (resolve) {
              setTimeout(function () { // using setTimeout here to keep from blocking for too long
                let features = Terraformer.ArcGIS.convert(new Terraformer.Primitive(data));
                for (let i = 0; i < features.length; i++) {
                  features[i]['geometry'] = new this.dojoMods.Polygon(features[i]['geometry']);
                }
                resolve(features);
              }.bind(this));
            }.bind(this)).catch(this._error);
          }.bind(this))
          .then(function (features) {
            // Use Terraformer to convert GeoJSON to ArcGIS JSON
            return new this.dojoMods.FeatureLayer(Object.assign({
              // create an instance of esri/layers/support/Field for each field object
              source: features,
            }, options));
          }.bind(this));
      }
      else {
        //if url is a feature service or csv we use the provided methods for creating them.
        let layerClass = this.dojoMods.FeatureLayer;
        if (layerURL.endsWith('csv')) {
          layerClass = this.dojoMods.CSVLayer;
        }
        return Promise.resolve(new layerClass(Object.assign({url: layerURL}, options))).catch(this._log.bind(this));
      }
    },


    // Allows the widget to react to option changes. Any custom behaviors
    // can be configured here.
    _setOptions: function (options) {
      let old_options = Object.assign({}, this.options);
      this._super(options);
      if (this.options.county !== old_options.county) {
        this._countySelected();
      }
      if (this.options.extent !== old_options.extent && this.options.extent !== null) {
        this.view.goTo(new this.dojoMods.Extent(this.options.extent));
      }
      else if (this.options.center !== old_options.center && this.options.center !== null) {
        this.options.extent = null;
        this.view.goTo({center: new this.dojoMods.Point({latitude: this.options.center[0], longitude: this.options.center[1]}), zoom: this.options.zoom});
      }
      if (this.options.variable !== old_options.variable || this.options.season !== old_options.season) {
        // Only a few variables allow for seasons
        if (this.variables[this.options.variable]['seasonal_data']) {
          this.options.season = this.options.season ? this.options.season : 'summer';
        } else {
          this.options.season = null;
        }
        // pcpn and dry days only show rcp45 vs rcp85 scenario
        if (['pcpn', 'days_dry_days'].includes(this.options.variable)) {
          if (this.options.leftScenario !== 'rcp45') {
            if (!this.options.rcp45Years.includes(this.options.leftYear)) {
              this.options.leftYear = this.options.rightYear
            }
            this._setOption('leftScenario', 'rcp45');
          } else {
            this._updateLeftScenarioLayer();
          }
          if (this.options.rightScenario !== 'rcp85') {
            this._setOption('rightScenario', 'rcp85');
          } else {
            this._updateRightScenarioLayer();
          }
          this._setOption('disableScenarioSelection', true);
        }
        else if (['pcpn', 'days_dry_days'].includes(old_options.variable)) {
          this._setOption('disableScenarioSelection', false);
          this.options.leftYear = 'avg';
          this._setOption('leftScenario', 'historical');
          if (this.options.rightScenario !== 'rcp85') {
            this._setOption('rightScenario', 'rcp85');
          } else {
            this._updateRightScenarioLayer();
          }

        }
        else{
          this._updateScenarioLayers();
        }
        this._updateLegend();
        this._updateOverlay();
      }
      this._trigger('change', null, this.options);
      return this;
    },

    _setOption: function (key, value) {
      let oldValue = this.options[key];
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
            if (!this._getLeftOptions().years.includes(this.options.leftYear)) {
              this.options.leftYear = this.options.leftScenario === 'historical' ? 'avg' : this._getLeftOptions().years.slice(-1)[0];
            }
            if (this.nodes.$leftScenario.val() !== value) {
              this.nodes.$leftScenario.val(value).trigger('change');
            }
            this._updateLeftScenarioLayer();
            this._updateLeftYearSlider();
          }
          break;
        case "rightScenario":
          if (value !== oldValue) {
            if (!this._getRightOptions().years.includes(this.options.rightYear)) {
              this.options.rightYear = this._getRightOptions().years.slice(-1)[0]
            }
            if (this.nodes.$rightScenario.val() !== value) {
              this.nodes.$rightScenario.val(value).trigger('change');
            }
            this._updateRightScenarioLayer();
            this._updateRightYearSlider();
          }
          break;
        case "showCounties":

          this._whenDojoLoaded().then(this._updateCountiesLayer.bind(this)).then(function (layer) {layer.visible = value});

          break;
        case "disableScenarioSelection":
          if (this.options.disableScenarioSelection ){
            this.nodes.$leftScenario.dropdown("disable", 1);
            this.nodes.$rightScenario.dropdown("disable",1);
          }
          else {
            this.nodes.$leftScenario.dropdown("enable", 1);
            this.nodes.$rightScenario.dropdown("enable", 1);
          }
      }
    },
    _updateLeftYearSlider: function () {
      if (this.nodes.$leftYearSlider === undefined) {
        this.nodes.$leftYearSlider = $(this.element).find('.left-year-slider');
      }
      if (this.nodes.$leftYearTooltip === undefined) {
        this.nodes.$leftYearTooltip = $('<span class="tooltip"></span>').hide();
      }
      if (this.options.leftYear === 'avg') {
        this.nodes.$leftYearTooltip.text("1961-1990 Average");
      } else {
        this.nodes.$leftYearTooltip.text(this.options.leftYear);
      }
      let min = this._getLeftOptions().years[0];
      let max = this.options.leftScenario === 'historical' ? 2010 : this._getLeftOptions().years.slice(-1)[0];
      this.nodes.$controlsOverLayContainer.find('.left-year-slider-container .year-min').text(min);
      this.nodes.$controlsOverLayContainer.find('.left-year-slider-container .year-max').text(this._getLeftOptions().years.slice(-1)[0]);
      this.nodes.$leftYearSlider.slider({
        range: false,
        min: min,
        max: max,
        step: 10,
        value: this.options.leftYear === 'avg' ? 2010 : this.options.leftYear,
        slide: function (event, ui) {
          if (ui.value === 2010 && this.options.leftScenario === 'historical') {
            this.nodes.$leftYearTooltip.text("1961-1990 Average");
          } else {
            this.nodes.$leftYearTooltip.text(ui.value);
          }
        }.bind(this),
        change: function (event, ui) {
          this.nodes.$leftYearSlider.attr('data-value', ui.value);
          if (ui.value === 2010 && this.options.leftScenario === 'historical') {
            this._setOptions({leftYear: 'avg'});
          }
          else {
            this._setOptions({leftYear: ui.value});
          }
        }.bind(this),
      }).find(".ui-slider-handle").html('<span class="icon icon-arrow-left-right"></span>').append(this.nodes.$leftYearTooltip);


      this.nodes.$leftYearTooltip.fadeIn();
    },

    _updateRightYearSlider: function () {
      if (this.nodes.$rightYearSlider === undefined) {
        this.nodes.$rightYearSlider = $(this.element).find('.right-year-slider');
      }
      if (this.nodes.$rightYearTooltip === undefined) {
        this.nodes.$rightYearTooltip = $('<span class="tooltip"></span>').hide();
      }
      this.nodes.$controlsOverLayContainer.find('.right-year-slider-container .year-min').text(this._getRightOptions().years[0]);
      this.nodes.$controlsOverLayContainer.find('.right-year-slider-container .year-max').text(this._getRightOptions().years.slice(-1)[0]);
      this.nodes.$rightYearTooltip.text(this.options.rightYear);
      this.nodes.$rightYearSlider.slider({
        range: false,
        min: this._getRightOptions().years[0],
        max: this._getRightOptions().years.slice(-1)[0],
        step: 10,
        value: this.options.rightYear,
        slide: function (event, ui) {
          this.nodes.$rightYearTooltip.text(ui.value);
        }.bind(this),
        change: function (event, ui) {
          this.nodes.$rightYearSlider.attr('data-value', ui.value);
          this._setOptions({rightYear: ui.value});
        }.bind(this),
      }).find(".ui-slider-handle").html('<span class="icon icon-arrow-left-right"></span>').append(this.nodes.$rightYearTooltip);
      this.nodes.$rightYearTooltip.fadeIn();
    },
    _setSwipeX: function (value) {
      if (this.leftLayer && this.rightLayer) {
        this.view.whenLayerView(this.leftLayer).then(function (layerView) {
          this._setClipPath(layerView.container.element, 'left', value);
        }.bind(this));
        this.view.whenLayerView(this.rightLayer).then(function (layerView) {
          this._setClipPath(layerView.container.element, 'right', value);
        }.bind(this));
      }
    },

    _getLeftOptions: function () {
      return {
        year: this.options.leftYear,
        opacity: this.options.leftOpacity,
        years: this.options[this.options.leftScenario + 'Years'],
        tilesURL: this.options[this.options.leftScenario + 'TilesURL'],
        tilesTMS: this.options[this.options.leftScenario + 'TilesTMS']
      };
    },
    _getRightOptions: function () {
      return {
        year: this.options.rightYear,
        opacity: this.options.rightOpacity,
        years: this.options[this.options.rightScenario + 'Years'],
        tilesURL: this.options[this.options.rightScenario + 'TilesURL'],
        tilesTMS: this.options[this.options.rightScenario + 'TilesTMS']
      };
    },

    _updateLegend: function () {
      let legendFilename = this.variables[this.options.variable]['seasonal_data'] ? 'summer_' + this.options.variable : this.options.variable;
      this.nodes.$legendContainer.html('<img class="legend-image" src="/resources/img/legends/' + legendFilename + '.png">')
    },

    _updateOverlay: function () {
      if (typeof this.options.county === 'undefined' || this.options.county === null) {
        if (typeof this.nodes.$countyOverlay !== 'undefined') {
          delete this['cwg'];
          this.nodes.$countyOverlay.remove();
        }
        return
      }
      if (this.nodes.$countyOverlay !== undefined && this.nodes.$countyOverlay !== null) {

      }
      this.nodes.$countyOverlay = $(`<div class="county-overlay">
  <div class="county-overlay-close">x</div>
  <div class="county-overlay-inner">
    <header>
      <a href="/location/">
        <h4 class="accent-color" style="margin-bottom: 20px;">
          <span class="icon icon-emission-scenario"></span> <span class="text">Chart<span class="full-title">: ${this.options.countyName}</span>
          <span class="source" id="temp-chart-name">${this.variables[this.options.variable].title}</span>
        </span>
        </h4>
      </a>

      <div class="data-accordion-actions">
        <a href="javascript:void(0);" class="how-to-read local"><span class="icon icon-help"></span>How to read this</a>
        <a href="javascript:void(0);" class="download-image local">
          <span class="icon icon-download-image"></span>Image</a> <a href="javascript:void(0);"  class="download-data local">
        <span class="icon icon-download-chart"></span>Data</a>
      </div>
    </header>
    <div id="climate-chart" style="height:420px"></div>
    <div class="chart-legend">
      <div id="historical-obs" class="legend-item legend-item-range">
        <div class="legend-item-line-container">
          <div class="legend-item-line observed" id="over-baseline-block"></div>
        </div>
        Observations
      </div>
      <div id="historical-range" class="legend-item legend-item-range selected">
        <div class="legend-item-block selected" id="historical-block"></div>
        Historical (Modelled)
      </div>
      <div id="rcp45-range" class="legend-item legend-item-range selected">
        <div class="legend-item-block selected" id="rcp45-block"></div>
        Lower Emissions
      </div>
      <div id="rcp85-range" class="legend-item legend-item-range selected">
        <div class="legend-item-block selected" id="rcp85-block"></div>
        Higher Emissions
      </div>
      <div id="rcp45-mean" class="legend-item legend-item-range selected">
        <div class="legend-item-line-container">
          <div class="legend-item-line selected" id="rcp85-line"></div>
          <div class="legend-item-line selected" id="rcp45-line"></div>
        </div>
        Averages
      </div>
    </div>
    <div class="range">
      <div id="slider-range" class="slider-range"></div>
      <div class="ui-slider-label range-label min" id="range-low">1950</div>
      <div class="ui-slider-label range-label max" id="range-high">2100</div>
    </div>
  </div>
     <div class="download-panel overlay">
            <div class="download-inner">
                <a href="javascript:void(0);" class="download-dismiss-button icon icon-close"></a>
                <p>Use the following links to download this graph's data:</p>
                <ul>
                    <li><a href="javascript:void(0);" class='download_hist_obs_data button display-block border-white hover-bg-white'><span class='icon icon-arrow-down '></span>Observed Data</a></li>
                    <li><a href="javascript:void(0);" class='download_hist_mod_data button display-block border-white hover-bg-white'><span class='icon icon-arrow-down'></span>Historical Modeled Data</a></li>
                    <li><a href="javascript:void(0);" class='download_proj_mod_data button display-block border-white hover-bg-white'><span class='icon icon-arrow-down'></span>Projected Modeled Data</a></li>
                </ul>

            </div>
        </div>
</div>`);

      $(this.element).append(this.nodes.$countyOverlay);
      this.cwg = climate_widget.graph({
        div: "div#climate-chart",
        dataprefix: "/climate-explorer2-data/data",
        font: "Roboto",
        frequency: "annual",
        county: this.options.county.slice(-5),
        variable: this.options.variable,
        scenario: "both",
        pmedian: "true",
        histobs: "false"
      });

      $(window).resize(function () {this.cwg.resize()}.bind(this));
      this.nodes.$countyOverlay.find('.county-overlay-close').click(function () {
        delete this['cwg'];
        this.options.county = null;
        this.nodes.$countyOverlay.remove();
      }.bind(this));

      $('.legend-item-range').on('click', function (event) {
        $(event.target).toggleClass('selected');
        $(event.target).children('.legend-item-block, .legend-item-line').toggleClass('selected');
        $(event.target).children('.legend-item-line-container').children('.legend-item-line').toggleClass('selected');

        let scenario = '';
        if ($('#rcp85-block').hasClass('selected') && $('#rcp45-block').hasClass('selected')) {
          scenario = 'both';
        } else if ($('#rcp45-block').hasClass('selected')) {
          scenario = 'rcp45';
        } else if ($('#rcp85-block').hasClass('selected')) {
          scenario = 'rcp85';
        }
        this.cwg.update({
          pmedian: $('#rcp85-line').hasClass('selected') || $('#rcp45-line').hasClass('selected'),
          scenario: scenario,
          histobs: $('#over-baseline-block').hasClass('selected') || $('#under-baseline-block').hasClass('selected'),
          histmod: $('#historical-block').hasClass('selected') || $('#historical-block').hasClass('selected')
        });
      }.bind(this));

      this.nodes.$countyOverlay.find('.download-image').click(function (event) {this.cwg && this.cwg.download_image(event.target, 'graph.png'); }.bind(this));
      this.nodes.$countyOverlay.find('.download-data').click(function (event) { this.nodes.$countyOverlay.find('.download-panel').removeClass("hidden").show(250); }.bind(this));
      this.nodes.$countyOverlay.find('.download_hist_obs_data').click(function (event) { this.cwg && this.cwg.download_hist_obs_data(event.target)}.bind(this));
      this.nodes.$countyOverlay.find('.download_hist_mod_data').click(function (event) {this.cwg && this.cwg.download_hist_mod_data(event.target)}.bind(this));
      this.nodes.$countyOverlay.find('.download_proj_mod_data').click(function (event) {this.cwg && this.cwg.download_proj_mod_data(event.target) }.bind(this));
      this.nodes.$countyOverlay.find('.download-dismiss-button').click(function (event) {this.nodes.$countyOverlay.find('.download-panel').addClass("hidden").hide(); }.bind(this));

      $('.how-to-read').on('click', function () {
        if (window.app) {
          window.app.takeAnnualGraphTour('');
        }
      });

      this.nodes.$countyOverlay.find(".slider-range").slider({
        range: true,
        min: 1950,
        max: 2099,
        values: [1950, 2099],
        slide: function (event, ui) {
          return this.cwg.setXRange(ui.values[0], ui.values[1]);
        }.bind(this)
      });
    },

    _getScenarioURL: function (scenario, year) {
      let tilesURL = this.options[scenario + 'TilesURL'];
      let season = this.options.season;
      if (scenario === 'historical') {
        scenario = 'hist'
      }
      let variable = this.options.variable;
      if (this.options.variable === 'days_dry_days') {
        variable = 'dry_days';
      }
      if (!['tmin', 'tmax', 'pcpn'].includes(variable)) {
        season = 'annual'
      }
      return tilesURL
        .replace('{scenario}', scenario)
        .replace('{season}', season)
        .replace('{variable}', variable)
        .replace('{year}', year)
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

    getShowSeasonControls: function () {
      return this.variables[this.options.variable]['seasonal_data'];
    },
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
    _setClipPath(element, side, value) {
      if (side === 'left') {
        element.style.clipPath = "polygon(0 0, " + value + "px 0, " + value + "px 100%, 0% 100%)";
        element.style.WebkitClipPath = "polygon(0 0, " + value + "px 0, " + value + "px 100%, 0% 100%)";
        element.style.clip = "rect(" + [0, value, element.height, 0].join(' ') + ")";
      }
      else if (side === 'right') {
        element.style.clipPath = "polygon(" + value + "px 0, 100% 0%, 100% 100%, " + value + "px 100%)";
        element.style.WebkitClipPath = "polygon(" + value + "px 0, 100% 0%, 100% 100%, " + value + "px 100%)";
        element.style.clip = "rect(" + [0, element.width, element.height, value].join(' ') + ")";
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
}));
