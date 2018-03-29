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
  $.widget('ce3.stationsMap', {

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
      zoom: 5,
      center: [-105.21, 37.42],
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

    // All DOM nodes used by the widget
    nodes: {},

    // Dojo modules this widget expects to use.
    dojoDeps: [
      'esri/Map',
      'esri/views/MapView',
      'esri/layers/FeatureLayer',
      'esri/renderers/UniqueValueRenderer',
      'esri/renderers/SimpleRenderer',
      'esri/symbols/WebStyleSymbol',
      'esri/symbols/SimpleFillSymbol',
      'esri/widgets/Legend',
      'esri/widgets/Expand',
      'esri/widgets/BasemapGallery',
      'esri/widgets/ScaleBar',
      'esri/geometry/SpatialReference',
      'esri/layers/CSVLayer'
    ],

    _dojoLoaded: function () {
      if (this.dojoMods === undefined) {
        return false;
      }
      for (var i = 0; i < this.dojoDeps; i++) {
        if (!window.dojoMod.hasOwnProperty(this.dojoDeps[i][i].split('/').pop())) {
          return false
        }
      }
      return true;
    },
    /**
     * Inits dojo.
     * @private
     */
    _initDojo: function () {

    },

    /**
     * Promise which resolves when dojo dependencies are loaded.
     * @resolve null
     * @private
     */
    _whenDojoLoaded: function () {
      return this._dojoLoaded() ? Promise.resolve() : new Promise(function (resolve, reject) {
        if (window.require === undefined) {
          window.dojoConfig = {has: {"esri-promise-compatibility": 1, "esri-promise-compatibility-deprecation-warnings": 0, async: 1, deps: this.dojoDeps}};
          var s = document.createElement("script");
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
    },
    /**
     *
     * @private
     */
    _registerDojoMods: function (resolve) {
      require(this.dojoDeps, function (resolve) {
        //get the list of modules
        var mods = Array.prototype.slice.call(arguments, 1);
        this.dojoMods = {};
        // preserve the modules on this.dojoMods for later reference.
        for (i = 0; i < mods.length; i++) {this.dojoMods[this.dojoDeps[i].split('/').pop()] = mods[i];}
        resolve()
      }.bind(this, resolve));
    },
    // Called once on instantiation.
    _create: function () {
      this.nodes.mapContainer = this.element[0];

      this._whenDojoLoaded()
        .then(this._initMap.bind(this))
        .then(this.addStations.bind(this))
    },

    _initMap: function () {
      console.log('made it!');
      this.map = new this.dojoMods.Map({
        // basemap: 'gray-vector'
        basemap: 'topo'
      });

      this.view = new this.dojoMods.MapView({
        container: this.nodes.mapContainer,
        map: this.map,
        zoom: this.options.zoom,
        center: this.options.center,
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
    },

    addStations: function () {
      this.stationsLayer = new this.dojoMods.CSVLayer({
        url: "/resources/item/stations.csv",
        latitudeField: 'lat',
        longitudeField: 'lon',
        // popupTemplate: template,
        elevationInfo: {mode: "on-the-ground"},
        renderer:{
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
      });
      this.map.add(this.stationsLayer);
    },

    // Optional -Return value will be sent as the `create` event's data.
    // _getCreateEventData: function() {

    // },

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
      }
    },

    _destroy: function () {
      // remove CSS classes, destroy nodes, etc
      Object.values(this.nodes).forEach(function (node) {node.remove()});
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
      logger = this.options.logger || console;
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

var Stations = function (id, data_base_url) {

  this.data_base_url = data_base_url;

  var qtrs = location.search;
  var qs = this.parseQueryString(qtrs);

  console.log("running init");
  this.mapStations();
  this.selectedStationType = id || 'daily_vs_climate';
  this.selectedSeason = 'summer';

  $(".level-1").html(this.varMapping[this.selectedStationType]);

  $('#about-stations-link').html('About ' + this.varMapping[this.selectedStationType]);
  $('.current').html(this.varMapping[this.selectedStationType]);
  $('#about-stations-link').prop('href', '#detail-' + this.selectedStationType.split('.')[0]);

  $('#stations-options').val(id).attr('selected', true).change();


  this.createMap();
  this.wireSearch();
};

// todo refactor
/*
 * Lots of inconsistencies in naming, so here I map all the variables to one another
 *
 */
Stations.prototype.mapStations = function () {
  this.varMapping = {
    'daily_vs_climate': 'Daily vs. Climate',
    'thresholds': 'Thresholds',
    'high_tide_flooding': 'High-tide Flooding'

  };
};

function isNumeric(num) {
  return (num > 0 || num === 0 || num === '0' || num < 0) && num !== true && isFinite(num);
}

Stations.prototype.createMap = function () {

  selectedStationType = $('#stations-options option:selected').val();
  var qtrs = location.search;
  var qs = this.parseQueryString(qtrs);
  var center = (qs.center) ? qs.center.split(',') : null;
  // make sure variable in query is valid

  this.view.ui.add(this.bgExpand, 'bottom-right');
  // var view = new ol.View({
  //     center: center || ol.proj.transform([-105.21, 37.42], 'EPSG:4326', 'EPSG:3857'),
  //     zoom: qs.zoom || 5,
  //     minZoom: 5,
  //     maxZoom: 10
  // });
  // var scaleLineControl = new ol.control.ScaleLine();
  // this.map = new ol.Map({
  //     controls: ol.control.defaults({
  //         attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
  //             collapsible: false
  //         })
  //     }).extend([
  //         scaleLineControl
  //     ]),
  //     target: 'stations-map',
  //     layers: [
  //         new ol.layer.Tile({
  //             source: new ol.source.XYZ({
  //                 url: 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  //                 attributions: [new ol.Attribution({html: ['&copy; Esri, HERE, DeLorme, MapmyIndia, © OpenStreetMap contributors, and the GIS user community ']})],
  //                 maxZoom: 10
  //             })
  //         })
  //     ],
  //     view: view
  // });

  // this.popup = new ol.Overlay.Popup();
  // this.map.addOverlay(this.popup);
  //
  // //add layers to map and wire events
  // this.addStations();
  // this.wire();
};

Stations.prototype.addStations = function (selectedStationType) {
  var self = this;
  var styles = {
    'Point': new ol.style.Style({
      image: new ol.style.Circle({
        radius: 8,
        fill: new ol.style.Fill({color: ''}),
        stroke: new ol.style.Stroke({color: '#FFF', width: 2})
      })
    })
  };

  if (!selectedStationType) {
    selectedStationType = $('#stations-options option:selected').val();
  }

  console.log('running addStations');
  console.log(selectedStationType);
  var styleFunction = function (feature) {
    return styles[feature.getGeometry().getType()];
  };

  //json_url = '/resources/item/conus_station_whitelist.json';
  json_url = '/resources/item/conus_stations_whitelist.json';

  $.getJSON(json_url, function (data) {
    var itemfeatureCollection = {
      'type': 'FeatureCollection',
      'features': []
    };

    var obj;
    $.each(data, function (i, d) {

      obj = {
        'type': 'Feature',
        'properties': {
          'station': d.id,
          'name': d.name
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [d.lon, d.lat]
        }
      };

      itemfeatureCollection.features.push(obj);

      if (i === 0) {
        console.log(obj);
      }
    });

    var features = new ol.format.GeoJSON().readFeatures(itemfeatureCollection, {
      featureProjection: 'EPSG:3857'
    });
    var vectorSource = new ol.source.Vector({
      features: features
    });
    vectorLayer = new ol.layer.Vector({
      source: vectorSource,
      style: styleFunction
    });


    vectorLayer.set('layer_id', 'stations');
    vectorLayer.set('name', 'stations');
    self.map.addLayer(vectorLayer);
    vectorLayer.setVisible(false);

    json_url = '/resources/tidal/tidal_stations.json';

    $.getJSON(json_url, function (data) {
      var featureCollection = {
        'type': 'FeatureCollection',
        'features': []
      };

      var obj;
      $.each(data, function (i, d) {

        obj = {
          'type': 'Feature',
          'properties': {
            'station': d.id,
            'name': d.label
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [d.lon, d.lat]
          }
        };


        featureCollection.features.push(obj);

        if (i === 0) {
          console.log(obj);
        }
      });

      var features = new ol.format.GeoJSON().readFeatures(featureCollection, {
        featureProjection: 'EPSG:3857'
      });
      var vectorSource = new ol.source.Vector({
        features: features
      });
      tidalLayer = new ol.layer.Vector({
        source: vectorSource,
        style: styleFunction
      });


      tidalLayer.set('layer_id', 'tidal_stations');
      tidalLayer.set('name', 'tidal_stations');
      self.map.addLayer(tidalLayer);
      tidalLayer.setVisible(false);

      if (selectedStationType === 'daily_vs_climate' || selectedStationType === 'thresholds') {
        vectorLayer.setVisible(true);
        tidalLayer.setVisible(false);
      }


      if (selectedStationType === 'high_tide_flooding') {
        vectorLayer.setVisible(false);
        tidalLayer.setVisible(true);
      }
    });


  });


  var styleFunction = function (feature) {
    return styles[feature.getGeometry().getType()];
  };


};

Stations.prototype.stationSelected = function (feature, event, type) {
  if (feature) {
    var props = feature.getProperties();
    $('#station-overlay-container').css('visibility', 'visible');


    console.log('option selected');
    console.log(selectedStationType);
    console.log(props);

    if (selectedStationType === 'daily_vs_climate') {
      var html =
        '<div id="station-overlay">' +
        '   <div id="station-overlay-close">x</div>' +
        '   <div id="station-overlay-header">' +
        '       <h3 class="accent-color" style="margin-bottom: 20px;"><span class="icon icon-district"></span>Weather Station</h3>' +
        '       <h5>Name: ' + props.name + '</h5>' +
        '       <h5>Station ID: ' + props.station + '</h5>' +
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
        '</div>';


      $('#station-overlay-container').append(html);


      var stations_base_url = 'https://data.rcc-acis.org/StnData';
      this.chart = new ChartBuilder(props, stations_base_url);

    }
    if (selectedStationType === 'thresholds') {
      var html =

        '<div id="station-overlay">' +
        '   <div id="station-overlay-close">x</div>' +
        '   <div id="station-overlay-header">' +
        '       <h3 class="accent-color" style="margin-bottom: 20px;"><span class="icon icon-district"></span>Weather Station</h3>' +
        '       <h5>Name: ' + props.name + '</h5>' +
        '       <h5>Station ID: ' + props.station + '</h5>' +
        '   </div>' +
        '   <div id="threshold_inputs">' +
        // '       <div class="field-pair field-id">' +
        // '           <label for="station">Station Id:</label>' +
        // '           <div class="field">' +
        // '               <input type="text" name="station" id="station" value="' + props.station + '">' +
        // '           </div>' +
        // '       </div>' +
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
        '</div>';


      $('#station-overlay-container').append(html);


      $("#thresholds-container").item({
        station: props.station, // GHCN-D Station id (required)
        variable: 'precipitation', // Valid values: 'precipitation', 'tmax', 'tmin', 'tavg'
        threshold: 1.0,
        responsive: true,
        thresholdOperator: '>', // Valid values: '==', '>=', '>', '<=', '<'
        thresholdFilter: '', // Transformations/Filters to support additional units. Valid Values: 'KtoC','CtoK','FtoC','CtoF','InchToCM','CMtoInch'
        thresholdFunction: undefined, //Pass in a custom function: function(this, values){ return _.sum(values) > v2; }
        window: 1, // Rolling window size in days.
        dailyValueValidator: undefined, // Pass in a custom validator predicate function(value, date){return date.slice(0, 4) > 1960 && value > 5 }
        yearValidator: undefined, // Similar to dailyValueValidator
        dataAPIEndpoint: "https://data.rcc-acis.org/",
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
        var queryElements = void 0,
          missingValueTreatment = void 0,
          windowFunction = void 0;
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
        $("#thresholds-container").item({window: parseInt($('#window').val())});
        $("#thresholds-container").item('update');
      });


      var stations_base_url = 'https://data.rcc-acis.org/StnData';
      this.chart = new ChartBuilder(props, stations_base_url);

    }
    if (selectedStationType === 'high_tide_flooding') {
      var html =
        '<div id="station-overlay">' +
        '   <div id="station-overlay-close">x</div>' +
        '   <div id="station-overlay-header">' +
        '       <h3 class="accent-color" style="margin-bottom: 20px;"><span class="icon icon-district"></span>High Tide Flooding</h3>' +
        '       <h5>Name: <span class="station_name">' + props.name + '</span></h5>' +
        '       <h5>Station ID: <span class="station_id">' + props.station + '</span></h5>' +
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
        '      <canvas id="tidal-chart"></canvas>' +
        '       <div class="station_overlay_text">' +
        '          <p>Gray bars show annual counts of high-tide flooding in the past. Red and blue bars show projections of the average number of high-tide flooding events in future years.</p>' +
        '       </div>' +
        '   </div>' +
        '</div>';


      $('#station-overlay-container').append(html);


      $("#tidal-chart").tidalstationwidget({
        station: '8665530',
        data_url: '/resources/tidal/tidal_data.json', // defaults to tidal_data.json
        responsive: true // set to false to disable ChartJS responsive sizing.
      });

      $('#station-overlay-header h3').html('Tidal Station');

      $('#location-stations').addClass('type-tidal');

      $('#stations-spinner').fadeOut(250);

      $('#tidal_station').change(function () {
        $("#tidal-chart").tidalstationwidget("update", {station: $(this).val()})

        if ($(this).find('option:selected').length) {
          $('#station-overlay-header .station-name').html($(this).find('option:selected').text());
        }

        $('#station-overlay-header .station-id').html($(this).val());
      });

      setTimeout(function () {
        $("#tidal_station").val(props.station).trigger('change');
      }, 250);


    }

    $('#station-overlay-close').click(function () {
      $('#station-overlay-container').css('visibility', 'hidden');
      $('#station-overlay-container').empty();
    });
  }
};


Stations.prototype.wireSearch = function () {
  var self = this;

  $("#formmapper").formmapper({
    details: "form"
  });

  $("#formmapper").bind("geocode:result", function (event, result) {
    var lat, lon;
    if (result.geometry.access_points) {
      lat = result.geometry.access_points[0].location.lat;
      lon = result.geometry.access_points[0].location.lng;
    } else {
      lat = result.geometry.location.lat();
      lon = result.geometry.location.lng();
    }

    var conv = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
    var xy = self.map.getPixelFromCoordinate(conv);

    self.map.getView().setZoom(8);
    self.map.getView().setCenter(conv);

    setTimeout(function () {
      var center = self.map.getView().getCenter();
      xy = self.map.getPixelFromCoordinate(center);

      var feature = self.map.forEachFeatureAtPixel(xy, function (feature, layer) {
        var id = layer.get('layer_id');
        if (id === 'states') {
          return null;
        } else {
          return feature;
        }
      });

      var e = {};
      e.mapBrowserEvent = {};
      e.mapBrowserEvent.coordinate = center;
      if (feature) {
        self.selected_collection.clear();
        self.selected_collection.push(feature);
        var props = feature.getProperties();

      } else {
        self.popup.hide();
      }
    }, 500);

  });
};
Stations.prototype.wire = function () {
  var self = this;

  //map click selector
  var select = new ol.interaction.Select({
    layers: function (layer) {
      if (layer.get('layer_id') === 'stations2') {
        return true;
      } else {
        return false;
      }
    },
    condition: ol.events.condition.click
  });


  this.map.addInteraction(select);

  select.on('select', function (e) {
    var feature = self.map.forEachFeatureAtPixel(e.mapBrowserEvent.pixel, function (feature, layer) {
      return feature;
    });

    if (feature) {
      var props = feature.getProperties();
      self.stationSelected(feature, e);
    } else {
      $('#station-data-about').show();
    }

  });

  this.map.getView().on('change:resolution', function () {
    var zoom = self.map.getView().getZoom();
    $('.page-type-stations .zoom-slider').slider('value', zoom);
  });

  this.map.on('moveend', function () {
    self.updateUrl();
  });

  $('.page-type-stations .zoom-slider').attr('data-value', 4);
  $('.page-type-stations .zoom-slider').slider({
    orientation: "vertical",
    range: false,
    min: 5,
    max: 10,
    value: 0,
    slide: function (event, ui) {
      $(this).attr('data-value', ui.value);
      self.setZoom(ui.value);
    },
    change: function (event, ui) {
      $(this).attr('data-value', ui.value);
      self.setZoom(ui.value);
    }
  });


  // detect dropdown change
  $('#stations-options-container .fs-dropdown-item').on('click', function (e) {
    self.selectedStationType = $(this).data().value;


    // hide the overlay if it exists
    $('#station-overlay-container').css('visibility', 'hidden').empty();

    // update about link
    $('#about-stations-link').html('About ' + self.varMapping[self.selectedStationType]);
    $('#about-stations-link').prop('href', '#detail-' + self.selectedStationType.split('.')[0]);

    //$(".level-1").html(self.varMapping[self.selectedStation]);


    self.updateUrl();
    self.updateChart();
    //self.addStations(self.selectedStationType);


    if (self.selectedStationType === 'daily_vs_climate' || self.selectedStationType === 'thresholds') {
      vectorLayer.setVisible(true);
      tidalLayer.setVisible(false);
    }

    console.log(self.selectedStationType);

    if (self.selectedStationType === 'high_tide_flooding') {
      vectorLayer.setVisible(false);
      tidalLayer.setVisible(true);
    }

    $('#breadcrumb .current').html(self.varMapping[self.selectedStationType]);


  });


  $('#stations-options').on('change', function () {
    $("#chart-name").html($('.fs-dropdown-selected').html());
  });


  this.map.addInteraction(select);

  this.selected_collection = select.getFeatures();

  select.on('select', function (e) {

    var features = select.getFeatures();
    var feature = self.map.forEachFeatureAtPixel(e.mapBrowserEvent.pixel, function (feature, layer) {
      if (layer.get('layer_id') === 'states') {
        return null;
      } else {
        return feature;
      }
    });

    if (feature) {
      var props = feature.getProperties();
    } else {
      features.remove(feature);
      self.popup.hide();
    }

    $('.ol-popup-closer').on('click', function () {
      self.popup.hide();
      features.remove(feature);
      e.preventDefault();
    });

  });


};
Stations.prototype.parseQueryString = function (qstr) {
  var query = {};
  var a = qstr.substr(1).split('&');
  for (var i = 0; i < a.length; i++) {
    var b = a[i].split('=');
    query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
  }
  return query;
};
Stations.prototype.updateUrl = function () {
  var qtrs = location.search;
  var qs = this.parseQueryString(qtrs);

  //history.pushState(null, "", "?id="+self.selectedStation);
  qs.id = this.selectedStationType;
  qs.zoom = this.map.getView().getZoom();
  qs.center = this.map.getView().getCenter().toString();

  var str = $.param(qs);
  history.replaceState(null, "", 'stations.php?' + str);
  setTimeout(function () {
    selectedStationOption = $('#stations-options option:selected').text();
    selectedStationType = $('#stations-options option:selected').val();
    actualurl = window.location.href;     // Returns full URL
    actualurlEncoded = encodeURIComponent(actualurl);
    twitterurl = "https://twitter.com/intent/tweet?text=" + selectedStationOption + "+via+%40NOAA+Climate+Explorer%3A+" + actualurlEncoded;     // Returns full URL
    facebookurl = "https://www.facebook.com/sharer/sharer.php?u=" + actualurlEncoded;     // Returns full URL

    $('#share_facebook').attr("href", facebookurl);
    $('#share_facebook').attr("data-href", actualurl);
    $('#share_twitter').attr("href", twitterurl);
    $('#share_link').val(actualurl);

  }, 500)

};
Stations.prototype.setZoom = function (zoom) {
  this.map.getView().setZoom(zoom);
  this.updateUrl();
};


Stations.prototype.updateChart = function () {
  if (this.cwg) {
    this.cwg.update({
      variable: this.selectedStationType
    });
  }
};


$(window).resize(function () {
  cwg.resize();
});