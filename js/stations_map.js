// Use AMD loader if present, if not use global jQuery

import get from '../node_modules/lodash-es/get.js';
import merge from '../node_modules/lodash-es/merge.js';
import debounce from '../node_modules/lodash-es/debounce.js';
/* globals require */


// noinspection JSIgnoredPromiseFromCall
export default class StationsMap {

  constructor(element, options) {
    if (typeof element === "string") {
      element = document.querySelector(this.element);
    } else if (typeof element === 'object' && typeof element.jquery !== 'undefined') {
      element = element[0];
    }
    this.element = element
    this.options = {
      stationId: null,
      stationName: null,
      stationMOverMHHW: null, // only used for tidal stations
      mode: 'temp_precip', // 'temp_precip','high_tide_flooding'
      //extent provides the initial view area of the map.
      extent: null,
      // defaultExtent: {xmin: -170, xmax: -70, ymin: 16, ymax: 67},
      // constrain_map_to_extent: {xmin: -180, xmax: -62, ymin: 10, ymax: 54},
      //zoom and center are ignored if extent is provided.
      zoom: 3,
      center: [-123, 42],
      // Map layers
      dailyStationsLayerURL: "https://crt-climate-explorer.nemac.org/data/stations_whitelist.json",
      tidalStationsLayerURL: "https://crt-climate-explorer.nemac.org/data/high-tide-flooding-widget/tidal_stations.json",
      dailyStationsDataURL: "https://data.rcc-acis.org/StnData",
    };
    this.options = merge(this.options, options);
    // All DOM nodes used by the widget (must be maintained for clean destruction)
    this.nodes = {};

    this.nodes.mapContainer = this.element;

    this._MapInitPromise = this._whenDojoLoaded().then(this._init_map.bind(this));
    switch (this.options.mode) {
      case 'temp_precip':
        this._whenDojoLoaded().then(this._init_daily_stations_layer.bind(this));
        break;
      case 'high_tide_flooding':
        this._whenDojoLoaded().then(this._init_tidal_stations_layer.bind(this));
        break;
    }

    if (this.options.stationId) {
      this._highlight_selected_station();
    }

  }


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
  // update(key, value) - Called when the `option` method is called.
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


  // Dojo modules this widget expects to use.
  get dojoDeps() {
    return ['esri/Map', 'esri/views/MapView', 'esri/layers/FeatureLayer', 'esri/renderers/SimpleRenderer', 'esri/Graphic', 'esri/symbols/WebStyleSymbol', 'esri/symbols/SimpleFillSymbol', 'esri/widgets/Legend', 'esri/widgets/Expand', 'esri/widgets/BasemapGallery', 'esri/widgets/ScaleBar', 'esri/geometry/SpatialReference', 'esri/layers/CSVLayer', 'esri/geometry/Extent', 'esri/geometry/Point', 'esri/widgets/Locate', 'esri/core/watchUtils', 'esri/geometry/support/webMercatorUtils'];
  }

  _dojoLoaded() {
    if (typeof this.dojoMods === "undefined") {
      return false;
    }
    for (let i = 0; i < this.dojoDeps; i++) {
      if (!this.dojoMods.hasOwnProperty(this.dojoDeps[i][i].split('/').pop())) {
        return false;
      }
    }
    return true;
  }

  /**
   * Promise which resolves when dojo dependencies are loaded.
   * @resolve null
   * @private
   */
  _whenDojoLoaded() {
    if (undefined !== this._dojoLoadedPromise) {
      return this._dojoLoadedPromise;
    }
    if (this._dojoLoaded()) {
      return Promise.resolve();
    }

    this._dojoLoadedPromise = new Promise((resolve) => {
      if (typeof window.require === "undefined") {
        window.dojoConfig = {
          has: {
            "esri-promise-compatibility": 1,
            "esri-promise-compatibility-deprecation-warnings": 0

          },
          async: 1,
          deps: this.dojoDeps
        };
        const arcgisStyles = document.createElement("link");
        arcgisStyles.rel = 'stylesheet';
        arcgisStyles.href = 'https://js.arcgis.com/4.9/esri/css/main.css';
        document.head.appendChild(arcgisStyles);
        const arcgisScripts = document.createElement("script");
        arcgisScripts.type = "text/javascript";
        arcgisScripts.src = "https://js.arcgis.com/4.9/";
        document.head.appendChild(arcgisScripts);
        arcgisScripts.addEventListener('load', () => {
          this._registerDojoMods(resolve);
        });
      } else {
        this._registerDojoMods(resolve);
      }
    }).catch((e) => console.log(e));
    return this._dojoLoadedPromise;
  }

  /**
   *
   * @private
   */
  _registerDojoMods(resolve) {
    window.require(this.dojoDeps, ((...mods) => {
      //get the list of modules
      /**
       *
       * @type {{}}
       * @property Map
       * @property MapView
       * @property FeatureLayer
       * @property Field
       * @property WebTileLayer
       * @property TileLayer
       * @property Graphic
       * @property SimpleFillSymbol
       * @property Legend
       * @property Expand
       * @property ScaleBar
       * @property SpatialReference
       * @property Extent
       * @property Point
       * @property Polygon
       * @property Locate
       * @property CSVLayer
       * @property BasemapGallery
       * @property watchUtils
       * @property watchUtils.whenTrue
       * @property webMercatorUtils
       * @property webMercatorUtils.xyToLngLat
       * @property webMercatorUtils.geographicToWebMercator
       */
      this.dojoMods = {};
      // preserve the modules on this.dojoMods for later reference.
      for (let i = 0; i < mods.length; i++) {
        this.dojoMods[this.dojoDeps[i].split('/').pop()] = mods[i];
      }
      resolve();
    }).bind(this));
  }


  _init_map() {
    /** @type {{findLayerById, layers, add, basemap, destroy }} */
    this.map = new this.dojoMods.Map({
      basemap: this.options.mode === 'high_tide_flooding' ? 'oceans' : 'topo'
    });
    if ((undefined === this.options.extent || null === this.options.extent) && (undefined === this.options.center || null === this.options.center)) {
      this.options.extent = this.options.defaultExtent;
    }

    const mapCenter = this.options.lat && this.options.lon ? [this.options.lon, this.options.lat] : [-123, 42];
    const mapZoom = this.options.zoom ? this.options.zoom : 8;
    /**
     * @property goTo
     * @property whenLayerView
     * @property hitTest
     * @property popup
     * @property graphics
     * @property popup.actions
     * @property popup.dockOptions
     * @property popup.dockOptions.position
     * @property popup.dockOptions.buttonEnabled
     */
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

    if (this.options.constrain_map_to_extent) {
      this.constrain_map_to_extent = this.dojoMods.webMercatorUtils.geographicToWebMercator(new this.dojoMods.Extent(this.options.constrain_map_to_extent));
    }

    // Watch view's stationary property
    this.dojoMods.watchUtils.whenTrue(this.view, "stationary", this._view_stationary_handler.bind(this));

    // add a button
    this.view.ui.add($(`<button class='btn btn-sm btn-primary d-md-none' id='deactivate_map_button'><i class='fas fa-arrows-alt'></i>&nbsp;Activate Map</button>`)[0], {
      position: 'top-left',
      index: 0
    });
    this._deactivate_map = document.body.clientWidth < 768;
    $(window).on('resize', () => {
      this._deactivate_map = document.body.clientWidth < 768;
      $('#deactivate_map_button').toggleClass('active', !this._deactivate_map);
      $(this.element).find('.esri-view-surface').first().css('pointer-events', this._deactivate_map ? 'none' : 'auto');
    });
    $('#deactivate_map_button').on('click', () => {
      this._deactivate_map = !this._deactivate_map;
      $('#deactivate_map_button').toggleClass('active', !this._deactivate_map);
      $(this.element).find('.esri-view-surface').first().css('pointer-events', this._deactivate_map ? 'none' : 'auto');
    });
    const suppress_event_for_deactivated_map = (e) => {
      if (this._deactivate_map) {
        e.stopPropagation();
      }
    };
    this.view.on("mouse-wheel", suppress_event_for_deactivated_map);
    this.view.on("drag", suppress_event_for_deactivated_map);


    this.basemap_gallery = new this.dojoMods.BasemapGallery({
      view: this.view,
      container: document.createElement('div')
    });

    this.bgExpand = new this.dojoMods.Expand({
      expandIconClass: 'esri-icon-basemap',
      view: this.view,
      content: this.basemap_gallery.domNode
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
        symbol: {
          type: "simple-marker" // overwrites the default symbol used for the
          // graphic placed at the location of the user when found
        }
      })
    });

    this.view.ui.add(this.locateWidget, "top-left");
  }

  get_active_stations_layer() {
    if (this.options.mode === 'high_tide_flooding') {
      return this.tidalStationsLayer
    } else {
      return this.dailyStationsLayer
    }
  }


  _create_station_layer(layerURL, options) {
    // We implement our own json layer creator
    if (layerURL.endsWith('json')) {
      return Promise.resolve($.ajax({
        url: layerURL,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json"
      })).catch(e => {
        console.log(e);
      }).then(data => {
        if (undefined === data) {
          console.log('Failed to retrieve station data. Refresh to try again.');
          throw 'Failed to retrieve station data. Refresh to try again.';
        }
        const features = data.map((station, index) => {
          return new this.dojoMods.Graphic({
            geometry: {
              type: "point", // autocasts as new Point()
              longitude: station.lon,
              latitude: station.lat
            },
            attributes: {
              ObjectID: index,
              id: station.id,
              name: station.station ? station.station : station.name,
              mOverMHHW: station['derived'] || null
            }
          })
        });

        // add featureLayerJSON must have a object key features
        //  to be valid arcgis feature json
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
          spatialReference: {wkid: 4326},
          features: features,
          source: features
        };
        return new this.dojoMods.FeatureLayer(Object.assign(featureLayerJSON, options));
      });
    } else {
      //if url is a feature service or csv we use the provided methods for creating them.
      let layerClass = this.dojoMods.FeatureLayer;
      if (layerURL.endsWith('csv')) {
        layerClass = this.dojoMods.CSVLayer;
      }
      return Promise.resolve(new layerClass(Object.assign({url: layerURL}, options)));
    }
  }

  _init_daily_stations_layer() {
    this._create_station_layer(this.options.dailyStationsLayerURL, {
      outfields: ['*'],
      renderer: {
        type: "simple", // autocasts as new SimpleRenderer()
        symbol: {
          type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
          size: 10,
          color: "#DB303D",
          outline: {
            color: '#FBB4AA',
            width: 2
          }
        }
      }
    }).then((layer) => {
      this.dailyStationsLayer = layer;
      this._MapInitPromise.then(() => {
        this.map.add(this.dailyStationsLayer);
        this.view.on("pointer-move", this._view_mouse_over_handler.bind(this));
        this.view.on("click", this._view_mouse_click_handler.bind(this));
      });
    });
  }

  _init_tidal_stations_layer() {
    this._create_station_layer(this.options.tidalStationsLayerURL, {
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
    }).then((layer) => {
      this.tidalStationsLayer = layer;
      this._MapInitPromise.then(() => {
        this.map.add(this.tidalStationsLayer);
        this.view.on("pointer-move", this._view_mouse_over_handler.bind(this));
        this.view.on("click", this._view_mouse_click_handler.bind(this));
      });
    });
  }

  _view_mouse_click_handler(event) {
    this.view.hitTest(event).then((response) => {
      const active_stations_layer = this.get_active_stations_layer()
      let station = response.results.find((result) => result.graphic.layer === active_stations_layer);
      if (!station) return;
      station = station.graphic;
      let options;
      if (this.options.mode === 'high_tide_flooding') {
        options = {
          tidalStationName: station.attributes.name,
          tidalStationId: station.attributes.id,
          tidalStationMOverMHHW: station.attributes.mOverMHHW || null
        };
      } else {
        options = {
          stationName: station.attributes.name, stationId: station.attributes.id
        };
      }
      this.update(options);
      this._trigger('station_updated', null, this.options);
    });
  }

  _view_mouse_over_handler(event) {
    return;
    debounce(() => {
      this.view.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          // make pointer cursor - mouse IS over a station feature
          document.getElementById('stations-map').style.cursor = "pointer";
        } else {
          // make default cursor - mouse IS NOT over station feature
          document.getElementById('stations-map').style.cursor = "default";
        }
        let station = response.results.filter((result) => {
          return result.graphic.layer === this.dailyStationsLayer;
        });
        station = station.graphic
        const refEl = $('circle:hover').first();
        if (!(typeof refEl.stationTooltip !== "undefined")) {
          refEl.stationTooltip = new Tooltip(refEl, {
            placement: 'right',
            title: station.attributes.name,
            container: $('#stations-map')[0]
          });
        }
        refEl.stationTooltip.show();
      });
    }, 50, {leading: true, trailing: true})
  }

  _view_stationary_handler() {
    // Get the new extent of the view when view is stationary.
    if (this.view.center) {
      const [lon, lat] = this.dojoMods.webMercatorUtils.xyToLngLat(this.view.center.x, this.view.center.y);

      //ignore invalid latlon values
      if (lon <= 1 && lon >= -1) {
        return null;
      }

      this.options.lat = Math.round(lat * 100) / 100;
      this.options.lon = Math.round(lon * 100) / 100;
      this.options.center = [this.options.lat, this.options.lon]
    }
    // sets url state zoom level
    if (this.view.zoom && this.view.zoom > 0) {
      this.options.zoom = Math.round(this.view.zoom * 100) / 100;
    }
    // make sure the extent is defined than get the current map extent
    // use extent to get a list of current stations.
    if (this.view.extent) {
      const xymin = this.dojoMods.webMercatorUtils.xyToLngLat(this.view.extent.xmin, this.view.extent.ymin);
      const xymax = this.dojoMods.webMercatorUtils.xyToLngLat(this.view.extent.xmax, this.view.extent.ymax);
      const quickRound = num => Math.round(num * 100 + Number.EPSILON) / 100;
      this.options.extent = {
        xmin: quickRound(xymin[0]),
        xmax: quickRound(xymax[0]),
        ymin: quickRound(xymin[1]),
        ymax: quickRound(xymax[1])
      };

      const active_stations_layer = this.get_active_stations_layer();
      if (!!active_stations_layer) {
        // get station points within extent bbox
        active_stations_layer.queryFeatures({geometry: this.view.extent}).then((ptsWithin) => {
          this._trigger('stations_in_extent_changed', null, [ptsWithin.features]);
        });
      }

      this._trigger('change', null, this.options);

    }
  }


  _set_option(key, value) {
    // This will actually update the value in the options hash
    this.options[key] = value

    // And now we can act on that change
    switch (key) {
        // Not necessary in all cases, but likely enough to me to include it here
      case "mode":
        switch (this.options.mode) {
          case 'temp_precip':
            if (undefined !== this.tidalStationsLayer) {
              this.tidalStationsLayer.visible = false;
            }
            if (undefined !== this.dailyStationsLayer) {
              this.dailyStationsLayer.visible = true;
            } else {
              this._whenDojoLoaded().then(this._init_daily_stations_layer.bind(this));
            }
            if (this.map.basemap.id !== 'topo') {
              this.map.basemap = 'topo';
            }
            break;
          case 'high_tide_flooding':
            if (undefined !== this.dailyStationsLayer) {
              this.dailyStationsLayer.visible = false;
            }
            if (undefined !== this.tidalStationsLayer) {
              this.tidalStationsLayer.visible = true;
            } else {
              this._whenDojoLoaded().then(this._init_tidal_stations_layer.bind(this));
            }
            if (this.map.basemap.id !== 'oceans') {
              this.map.basemap = 'oceans';
            }
            break;
        }
        break;
    }
  }

  update(options) {
    const old_options = merge({}, this.options);
    for (const k of Object.keys(options)) {
      this._set_option(k, options[k]);
    }
    if (this.options.stationId !== old_options.stationId) {
      this._highlight_selected_station();
    }
    if (this.options.extent !== old_options.extent && this.options.extent !== null) {
      this.view.goTo(new this.dojoMods.Extent(this.options.extent));
    } else if (this.options.center !== old_options.center && this.options.center !== null) {
      this.options.extent = null;
      this.view.goTo({center: new this.dojoMods.Point({latitude: this.options.center[0], longitude: this.options.center[1]}), zoom: this.options.zoom});
    }
    this._trigger('change', null, this.options);
    return this;
  }

  _highlight_selected_station() {
    if (this.options.stationId === null) {
      return;
    }
    try {
      const active_stations_layer = this.get_active_stations_layer()
      if (active_stations_layer) {
        active_stations_layer.queryFeatures({objectIds: this.options.stationId, returnGeometry: true}).then((results) => {
          if (get(results, 'features', []).length > 0) {
            this.view.graphics.removeAll();
            this.view.graphics.add(Object.assign(results.features[0].graphic, {
              symbol: {
                type: 'simple-fill',
                color: "rgba(0,0,0,0)",
                outline: {
                  width: 5,
                  color: "rgba(50,50,50,1)"
                }
              }
            }));
          }
        });
      }

    } catch (ex) {
      console.log(ex)
    }
  }

  destroy() {
    // remove CSS classes, destroy nodes, etc
    Object.values(this.nodes).forEach((node) => {
      node.remove();
    });
    this.map.destroy();
  }

  // noinspection JSUnusedGlobalSymbols
  whenDojoMods(callback) {
    if (this.dojoMods !== undefined) {
      callback();
    } else {
      window.addEventListener('dojoModsLoaded', callback);
    }
  }


  _trigger(type, event, data) {
    let prop, orig;
    let callback = this.options[type];

    data = data || {};
    event = $.Event(event);
    event.type = type.toLowerCase();

    // The original event may come from any element
    // so we need to reset the target on the new event
    event.target = this.element;

    // Copy original event properties over to the new event
    orig = event.originalEvent;
    if (orig) {
      for (prop in orig) {
        if (!(prop in event)) {
          event[prop] = orig[prop];
        }
      }
    }

    $(this.element).trigger(event, data);
    return !(typeof callback === "function" &&
        callback.apply(this.element, [event].concat(data)) === false ||
        event.isDefaultPrevented());
  }

}
