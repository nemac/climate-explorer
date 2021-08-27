// Use AMD loader if present, if not use global jQuery
/* global require, define, Terraformer */
import merge from '../node_modules/lodash-es/merge.js';
import get from '../node_modules/lodash-es/get.js';
import mean from '../node_modules/lodash-es/mean.js';
import isEqual from '../node_modules/lodash-es/isEqual.js';
import {number_to_human, round_to_n_significant_figures, round} from './utils.js';
import './main.js';

// noinspection JSIgnoredPromiseFromCall
export default class ScenarioComparisonMap {
  constructor(element, options) {
    this.element = $('#map-element');
    this.options = {
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
      defaultExtent: {xmin: -119, xmax: -73, ymin: 18, ymax: 54},
      constrainMapToExtent: {xmin: -185, xmax: -62, ymin: 16, ymax: 75},
      //extent provides the initial view area of the map.
      extent: null,
      //zoom and center are ignored if extent is provided.
      zoom: null, // Ex: 5
      /** @type array in order of [longitude, latitude] */
      center: null,
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
          tilesURL: "https://climate-explorer3-dev.nemac.org/webtiles/hist/{variable}/{season_month}/{level}/{col}/{row}.png",
          tilesTMS: true,
          years: [{value: 'avg', label: '1961-1990 Average'}],
          defaultYear: 'avg',
          min_zoom_level: 3,
          max_zoom_level: 6
        },
        'rcp45': {
          title: 'Lower Emissions',
          tilesURL: "https://climate-explorer3-dev.nemac.org/webtiles/rcp45/{variable}/{year}/{season_month}/{level}/{col}/{row}.png",
          tilesTMS: true,
          years: [
            // {value: '2010', label: '2010'},
            {value: '2020s', label: "2020s"}, {value: '2030s', label: "2030s"}, {
              value: '2040s',
              label: "2040s"
            }, {value: '2050s', label: "2050s"}, {value: '2060s', label: "2060s"}, {
              value: '2070s',
              label: "2070s"
            }, {value: '2080s', label: "2080s"}, {value: '2090s', label: "2090s"}],
          defaultYear: '2090s',
          min_zoom_level: 3,
          max_zoom_level: 6
        },
        'rcp85': {
          title: 'Higher Emissions',
          tilesURL: "https://climate-explorer3-dev.nemac.org/webtiles/rcp85/{variable}/{year}/{season_month}/{level}/{col}/{row}.png",
          tilesTMS: true,
          years: [
            // {value: '2010', label: '2010'},
            {value: '2020s', label: "2020s"}, {value: '2030s', label: "2030s"}, {
              value: '2040s',
              label: "2040s"
            }, {value: '2050s', label: "2050s"}, {value: '2060s', label: "2060s"}, {
              value: '2070s',
              label: "2070s"
            }, {value: '2080s', label: "2080s"}, {value: '2090s', label: "2090s"}],
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
          legend_unit: 'Days',
          legend_note: 'Note: Maps are anomalies from 1961-1990 baseline'
        },
        'days_pcpn_gt_1in': {
          title: 'Days w/ > 1 in',
          seasonal_data: false,
          defaultConfig: {
            leftScenario: 'historical',
            rightScenario: 'rcp85',
          },
          legend_unit: 'Days',
          legend_note: 'Note: Maps are anomalies from 1961-1990 baseline'

        },
        'days_pcpn_gt_2in': {
          title: 'Days w/ > 2 in',
          seasonal_data: false,
          defaultConfig: {
            leftScenario: 'historical',
            rightScenario: 'rcp85',
          },
          legend_unit: 'Days',
          legend_note: 'Note: Maps are anomalies from 1961-1990 baseline'
        },
        'days_pcpn_gt_3in': {
          title: 'Days w/ > 3 in',
          seasonal_data: false,
          defaultConfig: {
            leftScenario: 'historical',
            rightScenario: 'rcp85',
          },
          legend_unit: 'Days',
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
          legend_unit: 'Dry Days',
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
      season_months: {'winter': '01', 'spring': '04', 'summer': '07', 'fall': '10', 'annual': 'annual'},
      area_data_api_endpoint: 'https://grid2.rcc-acis.org/GridData',
    }
    this.option = merge(this.options, options)
    // All DOM nodes used by the widget (must be maintained for clean destruction)
    this.nodes = {};

    this.leftLayer = null;
    this.rightLayer = null;

    this.nodes.mapContainer = element;
    this.nodes.stationOverlayContainer = $('#' + this.options.stationOverlayContainerId)[0];

    this.options.variable = this.options.variable || 'tmax';

    if (this.options.leftScenario === undefined || this.options.rightScenario === null || (this.options.variables[this.options.variable].disabledScenarios || []).includes(this.options.leftScenario)) {
      this.options.leftScenario = this.options.variables[this.options.variable].defaultConfig.leftScenario;
    }

    if (this.options.rightScenario === undefined || this.options.rightScenario === null || (this.options.variables[this.options.variable].disabledScenarios || []).includes(this.options.rightScenario)) {
      this.options.rightScenario = this.options.variables[this.options.variable].defaultConfig.rightScenario;
    }

    if (undefined === this.options.leftYear || this.options.leftYear === null || !this.options.scenarios[this.options.leftScenario].years.find(v => v.value === this.options.leftYear)) {
      this.options.leftYear = this.options.scenarios[this.options.leftScenario].defaultYear;
    }
    if (undefined === this.options.rightYear || this.options.rightYear === null || !this.options.scenarios[this.options.rightScenario].years.find(v => v.value === this.options.rightYear)) {
      this.options.rightYear = this.options.scenarios[this.options.rightScenario].defaultYear;
    }
    this.options.season = this.options.season || this.options.variables[this.options.variable].defaultConfig.season;

    this._mapInitPromise = this._whenDojoLoaded().then(this._initMap.bind(this)).catch(this._log.bind(this));
    this._initControlsOverlay();

    const layerPromises = [this._whenDojoLoaded().then(this._updateScenarioLayers.bind(this)), this._whenDojoLoaded().then(this._initStatesLayer.bind(this))];
    if (this.options.showCounties) {
      layerPromises.push(this._whenDojoLoaded().then(this._updateCountiesLayer.bind(this)));
    }
    Promise.all(layerPromises).then(this._trigger.bind(this, 'layersLoaded', null, null));

  }

  get dojoDeps() {
    return [
      'esri/Map',
      'esri/views/MapView',
      'esri/layers/FeatureLayer',
      'esri/layers/support/Field',
      'esri/layers/WebTileLayer',
      'esri/layers/TileLayer',
      // 'esri/widgets/BasemapToggle',
      // 'esri/renderers/SimpleRenderer',
      'esri/Graphic',
      // 'esri/symbols/WebStyleSymbol',
      'esri/symbols/SimpleFillSymbol',
      'esri/widgets/Legend',
      'esri/widgets/Expand',
      // 'esri/widgets/OpacitySlider',
      // 'esri/widgets/ColorSlider',
      // 'esri/widgets/BasemapGallery',
      'esri/widgets/ScaleBar',
      'esri/geometry/SpatialReference',
      // 'esri/layers/CSVLayer',
      'esri/geometry/Extent',
      'esri/geometry/Point',
      'esri/geometry/Polygon',
      'esri/widgets/Locate',
      'esri/core/watchUtils',
      'esri/geometry/support/webMercatorUtils'
    ]
  }

  _dojoLoaded() {
    if (this.dojoMods === undefined) {
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
      return Promise.resolve().catch(this._log.bind(this));
    }

    this._dojoLoadedPromise = new Promise((resolve) => {
      if (typeof require === "undefined") {
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
    }).catch(this._log.bind(this));
    return this._dojoLoadedPromise;
  }

  /**
   *
   * @private
   */
  _registerDojoMods(resolve) {
    require(this.dojoDeps, (...mods) => {

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
    });
  }

  _initControlsOverlay() {

    this.nodes.$controlsOverLayContainer = $('<div>', {'class': 'scenario-map-overlay-container w-100'});

    this.nodes.$controlsOverLayContainer.append(`
      <div class="movable slider-div">
        <div class="handle"></div>
      </div>
      <div class="bottom-scenario-controls">
        
        <div class="left-scenario-controls">
            <div class="leftScenario-select d-flex align-items-center w-75">
              <div class="ms-2 me-2 download-dropdown"> 
                <div class="dropdown rounded-3 border border-1">
                  <a class="btn dropdown-toggle ps-4 pe-4 w-100" role="button" id="left-scenario-dropdown-menu" data-bs-toggle="dropdown" aria-expanded="false" data-value="historical">
                      Historical
                  </a>
                
                  <ul class="dropdown-menu left-scenario-dropdown-menu" aria-labelledby="left-scenario-dropdown-menu">
                    <li role="option" data-value="historical" class="dropdown-item leftScenario-option-historical">Historical</li>
                    <li role="option" data-value="rcp45" class="dropdown-item leftScenario-option-lower">Lower Emissions</li>
                  </ul>
                </div>
              </div>
              
               <div class="left-year-slider-container rounded-3">
                  <div class="average-year-label p-2 rounded-3">
                    <span></span> 
                  </div>
                  <div class="year-label year-min"></div>
                  <div class="left-year-slider"></div>
                  <div class="year-label year-max"></div>
              </div>
            </div>
        </div>
        
        <div class="right-scenario-controls align-items-center"> 
          
          <div class="ms-2 me-2 download-dropdown"> 
            <div class="dropdown rounded-3 border border-1">
              <a class="btn dropdown-toggle ps-4 pe-4 w-100" role="button" id="right-scenario-dropdown-menu" data-bs-toggle="dropdown" aria-expanded="false" data-value="rcp85">
                  Higher Emissions
              </a>
            
              <ul class="dropdown-menu right-scenario-dropdown-menu" aria-labelledby="right-scenario-dropdown-menu">
                <li role="option" data-value="rcp85" class="dropdown-item rightScenario-option-higher">Higher Emissions</li>
                <li role="option" data-value="rcp45" class="dropdown-item rightScenario-option-lower">Lower Emissions</li>
              </ul>
            </div>
          </div>
          
          <div class="year right-year-slider-container">
            <div class="year-label year-min"></div>
            <div class="right-year-slider"></div>
            <div class="year-label year-max"></div>
          </div>
        </div>
      </div>
    `);

    // $(this.nodes.mapContainer).append(this.nodes.$controlsOverLayContainer);
    $(this.element).append(this.nodes.$controlsOverLayContainer);

    this.nodes.$controlsOverLayContainer.find('.movable.slider-div').draggable({
      axis: "x",
      containment: this.nodes.$controlsOverLayContainer,
      scroll: false,
      drag: (event, ui) => {
        this.update({swipeX: ui.position.left});
      },
      stop: (event, ui) => {
        this.update({swipeX: ui.position.left});
      }
    });

    this._updateLeftScenarioSelect();
    this._updateRightScenarioSelect();
    this._updateLeftYearSlider();
    this._updateRightYearSlider();

  }

  _initMap() {
    /** @type {{findLayerById}} */
    this.map = new this.dojoMods.Map({
      basemap: 'topo'
    });
    // this.map.basemap.referenceLayers.clear();
    // noinspection JSUnresolvedVariable
    this.map.basemap.referenceLayers.add(new this.dojoMods.TileLayer({url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer'}));
    // noinspection JSUnresolvedVariable
    this.map.basemap.referenceLayers.items.slice(-1)[0]["minScale"] = 5000000;
    // this.map.basemap.referenceLayers.add(new this.dojoMods.TileLayer({url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer'}));
    if ((undefined === this.options.extent || null === this.options.extent) && (undefined === this.options.center || null === this.options.center)) {
      this.options.extent = this.options.defaultExtent;
    }
    /**
     * @property goTo
     * @property whenLayerView
     * @property popup
     * @property popup.actions
     * @property popup.dockOptions
     * @property popup.dockOptions.position
     * @property popup.dockOptions.buttonEnabled
     */
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
      },

    });
    this.view.popup.autoCloseEnabled = false;
    this.view.popup.autoOpenEnabled = false;


    this.view.on("click", (event) => {
      this.view.popup.actions = [];
      this.view.popup.dockOptions.position = 'top-right';
      this.view.popup.dockEnabled = true;
      this.view.popup.dockOptions.buttonEnabled = false;

      this.view.popup.open();
    });

    if (this.options.constrainMapToExtent) {
      this.constrainMapToExtent = this.dojoMods.webMercatorUtils.geographicToWebMercator(new this.dojoMods.Extent(this.options.constrainMapToExtent));
    }
    this.view.when(() => {
      // Watch view's stationary property
      this.dojoMods.watchUtils.whenTrue(this.view, "stationary", () => {
        // Constrain map panning
        if (this.view.extent !== undefined && this.view.extent !== null && this.constrainMapToExtent !== undefined && !this.constrainMapToExtent.contains(this.view.extent.center)) {
          //clamp center
          const x = Math.min(Math.max(this.view.extent.center.x, this.constrainMapToExtent.xmin), this.constrainMapToExtent.xmax);
          const y = Math.min(Math.max(this.view.extent.center.y, this.constrainMapToExtent.ymin), this.constrainMapToExtent.ymax);
          this.view.center = new this.dojoMods.Point({x: x, y: y, spatialReference: this.view.extent.spatialReference});
        }
        if (this.view.center) {
          this.options.center = [round(this.view.center.longitude, 3), round(this.view.center.latitude, 3)]
        }
        if (this.view.extent) {
          const xymin = this.dojoMods.webMercatorUtils.xyToLngLat(this.view.extent.xmin, this.view.extent.ymin);
          const xymax = this.dojoMods.webMercatorUtils.xyToLngLat(this.view.extent.xmax, this.view.extent.ymax);
          this.options.extent = {
            xmin: round(xymin[0], 3),
            ymin: round(xymin[1], 3),
            xmax: round(xymax[0], 3),
            ymax: round(xymax[1], 3)
          };
        }

        if (this.view.zoom && this.view.zoom > 0) {
          this.options.zoom = this.view.zoom;
        }
        const conus_bounds = {xmin: -128.74, ymin: 24.23, xmax: -64.1, ymax: 51.41}; // conus extent
        // noinspection JSUnresolvedFunction
        if (this.options.center) {
          // is the center in conus
          this.options.isCenterConus = (
              (conus_bounds.xmin <= this.options.center[0]) &&
              (this.options.center[0] <= conus_bounds.xmax) &&
              (conus_bounds.ymin <= this.options.center[1]) &&
              (this.options.center[1] <= conus_bounds.ymax)
          );
          this._trigger('changeExtent', null, this.options);
        }
        this._trigger('change', null, this.options);
      });
    });
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
  }

  _updateScenarioLayers() {
    return Promise.all([this._updateLeftScenarioLayer(), this._updateRightScenarioLayer()]).catch(this._error.bind(this));
  }

  _updateLeftScenarioLayer() {
    return this._initScenarioLayer(this.options.leftScenario, this.options.leftYear, 'left', this.options.leftOpacity).then((layer) => {
      this.leftLayer = layer;
      return layer;
    });
  }

  _updateRightScenarioLayer() {
    return this._initScenarioLayer(this.options.rightScenario, this.options.rightYear, 'right', this.options.rightOpacity).then((layer) => {
      this.rightLayer = layer;
      return layer;
    });
  }

  _initScenarioLayer(scenario, year, side, opacity) {
    const promise = new Promise((resolve) => {
      let layerClass = this.dojoMods.TileLayer;
      if (this.options.scenarios[scenario].tilesURL.endsWith('png')) {
        layerClass = this.dojoMods.WebTileLayer;
      }
      /**
       * @property tileInfo
       * @property tilesURL
       * @property levelValues
       * @property tileServers
       * @property urlPath
       */
      const layer = new layerClass({urlTemplate: this._getScenarioURL(scenario, year), opacity: opacity});


      if (this.options.scenarios[scenario].max_zoom_level && this.options.scenarios[scenario].min_zoom_level) {
        layer.tileInfo.lods = layer.tileInfo.lods.filter((lod) => lod.level >= this.options.scenarios[scenario].min_zoom_level && lod.level <= this.options.scenarios[scenario].max_zoom_level);
      }

      //TMS hack
      if (this.options.scenarios[scenario].tilesURL.endsWith('png') && this.options.scenarios[scenario].tilesTMS) {
        layer.getTileUrl = function (layer, level, row, col) {
          // noinspection JSUnresolvedFunction
          level = layer.levelValues[level];
          if (0 > row || row >= 1 << level) {
            return null;
          }
          row = Math.pow(2, level) - row - 1;
          // noinspection JSUnresolvedFunction
          return layer.tileServers[row % layer.tileServers.length] + layer.urlPath.replace(/{level}/gi, level).replace(/{row}/gi, row).replace(/{col}/gi, col);
        }.bind(this, layer);
      }
      this._mapInitPromise.then(() => {
        if (side === 'left') {
          // removes old layer to remove stray layers
          let leftLayer = this.map.findLayerById('left-variable');
          this.map.remove(leftLayer);

          layer.id = `left-variable`;
          this.map.add(layer, 0);
        } else {
          // removes old layer to remove stray layers
          let rightLayer = this.map.findLayerById('right-variable');
          this.map.remove(rightLayer);

          layer.id = `right-variable`;
          this.map.add(layer, 1);
        }
      });
      resolve(layer);
    }).catch(this._log.bind(this));
    // hook the layerView's first render to apply the clipping path.
    promise.then((layer) => {
      this.view.whenLayerView(layer).then((layerView) => {
        // animate swipe on map load
        if (this.options.animateIntro) {
          this.view.when().then(() => {
            setTimeout(() => {
              $(".movable").animate({left: "50%"}, {
                duration: 1200,
                easing: 'easeInOutCubic',
                step: (now) => {
                  if (layerViewContainer.element) {
                    this._setOption('swipeX', layerViewContainer.element.width * now / 100);
                  }
                }
              });
              this.options.animateIntro = false;
            }, 1800); // delay 1800ms for the map to load a bit
          });
        }

        let layerViewContainer = layerView.container;
        layerViewContainer._doRender = layerViewContainer.doRender;
        layerViewContainer.doRender = (a) => {
          const _this = this;
          layerViewContainer._doRender(a);
          if (_this.options.swipeX === null) {
            _this.options.swipeX = layerViewContainer.element.width;
          }
          if (_this.options.swipeX > layerViewContainer.element.width) {
            _this.options.swipeX = layerViewContainer.element.width;
            _this.nodes.$controlsOverLayContainer.find('.movable.slider-div').css('left', _this.options.swipeX);
          }

          this._setClipPath(layerViewContainer.element, side, _this.options.swipeX);
        };
      });
    });
    return promise;
  }

  // Init is automatically invoked after create, and again every time the
  //  widget is invoked with no arguments after that
  _init() {
    this._trigger('initialized');
  }

  /**
   *
   * @return {Promise<{minScale, visible, setScaleRange}>|Promise<*>}
   * @private
   */
  _updateCountiesLayer() {
    if (undefined !== this.countiesLayer) {
      return Promise.resolve(this.countiesLayer);
    }
    return this._createReferenceLayer(this.options.countiesLayerURL, {
      opacity: 1,
      "objectIdFieldName": "FID",
      "uniqueIdField": {
        "name": "FID",
        "isSystemMaintained": true
      },
      "globalIdFieldName": "",
      "geometryType": "polygon",
      "spatialReference": {
        "wkid": 102100,
        "latestWkid": 3857
      },
      "outFields": ['*'],
      "fields": [
        {
          "name": "FID",
          "type": "esriFieldTypeOID",
          "alias": "FID",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "OBJECTID",
          "type": "esriFieldTypeInteger",
          "alias": "OBJECTID",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "NAME",
          "type": "esriFieldTypeString",
          "alias": "NAME",
          "sqlType": "sqlTypeNVarchar",
          "length": 32,
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "STATE_NAME",
          "type": "esriFieldTypeString",
          "alias": "STATE_NAME",
          "sqlType": "sqlTypeNVarchar",
          "length": 35,
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "STATE_FIPS",
          "type": "esriFieldTypeString",
          "alias": "STATE_FIPS",
          "sqlType": "sqlTypeNVarchar",
          "length": 2,
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "CNTY_FIPS",
          "type": "esriFieldTypeString",
          "alias": "CNTY_FIPS",
          "sqlType": "sqlTypeNVarchar",
          "length": 3,
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "FIPS",
          "type": "esriFieldTypeString",
          "alias": "FIPS",
          "sqlType": "sqlTypeNVarchar",
          "length": 5,
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "POPULATION",
          "type": "esriFieldTypeInteger",
          "alias": "POPULATION",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "POP_SQMI",
          "type": "esriFieldTypeDouble",
          "alias": "POP_SQMI",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "POP2010",
          "type": "esriFieldTypeInteger",
          "alias": "POP2010",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "POP10_SQMI",
          "type": "esriFieldTypeDouble",
          "alias": "POP10_SQMI",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "WHITE",
          "type": "esriFieldTypeInteger",
          "alias": "WHITE",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "BLACK",
          "type": "esriFieldTypeInteger",
          "alias": "BLACK",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AMERI_ES",
          "type": "esriFieldTypeInteger",
          "alias": "AMERI_ES",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "ASIAN",
          "type": "esriFieldTypeInteger",
          "alias": "ASIAN",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "HAWN_PI",
          "type": "esriFieldTypeInteger",
          "alias": "HAWN_PI",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "HISPANIC",
          "type": "esriFieldTypeInteger",
          "alias": "HISPANIC",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "OTHER",
          "type": "esriFieldTypeInteger",
          "alias": "OTHER",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "MULT_RACE",
          "type": "esriFieldTypeInteger",
          "alias": "MULT_RACE",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "MALES",
          "type": "esriFieldTypeInteger",
          "alias": "MALES",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "FEMALES",
          "type": "esriFieldTypeInteger",
          "alias": "FEMALES",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_UNDER5",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_UNDER5",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_5_9",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_5_9",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_10_14",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_10_14",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_15_19",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_15_19",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_20_24",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_20_24",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_25_34",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_25_34",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_35_44",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_35_44",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_45_54",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_45_54",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_55_64",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_55_64",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_65_74",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_65_74",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_75_84",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_75_84",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_85_UP",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_85_UP",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "MED_AGE",
          "type": "esriFieldTypeDouble",
          "alias": "MED_AGE",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "MED_AGE_M",
          "type": "esriFieldTypeDouble",
          "alias": "MED_AGE_M",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "MED_AGE_F",
          "type": "esriFieldTypeDouble",
          "alias": "MED_AGE_F",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "HOUSEHOLDS",
          "type": "esriFieldTypeInteger",
          "alias": "HOUSEHOLDS",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AVE_HH_SZ",
          "type": "esriFieldTypeDouble",
          "alias": "AVE_HH_SZ",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "HSEHLD_1_M",
          "type": "esriFieldTypeInteger",
          "alias": "HSEHLD_1_M",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "HSEHLD_1_F",
          "type": "esriFieldTypeInteger",
          "alias": "HSEHLD_1_F",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "MARHH_CHD",
          "type": "esriFieldTypeInteger",
          "alias": "MARHH_CHD",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "MARHH_NO_C",
          "type": "esriFieldTypeInteger",
          "alias": "MARHH_NO_C",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "MHH_CHILD",
          "type": "esriFieldTypeInteger",
          "alias": "MHH_CHILD",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "FHH_CHILD",
          "type": "esriFieldTypeInteger",
          "alias": "FHH_CHILD",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "FAMILIES",
          "type": "esriFieldTypeInteger",
          "alias": "FAMILIES",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AVE_FAM_SZ",
          "type": "esriFieldTypeDouble",
          "alias": "AVE_FAM_SZ",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "HSE_UNITS",
          "type": "esriFieldTypeInteger",
          "alias": "HSE_UNITS",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "VACANT",
          "type": "esriFieldTypeInteger",
          "alias": "VACANT",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "OWNER_OCC",
          "type": "esriFieldTypeInteger",
          "alias": "OWNER_OCC",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "RENTER_OCC",
          "type": "esriFieldTypeInteger",
          "alias": "RENTER_OCC",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "NO_FARMS12",
          "type": "esriFieldTypeDouble",
          "alias": "NO_FARMS12",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AVE_SIZE12",
          "type": "esriFieldTypeDouble",
          "alias": "AVE_SIZE12",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "CROP_ACR12",
          "type": "esriFieldTypeDouble",
          "alias": "CROP_ACR12",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AVE_SALE12",
          "type": "esriFieldTypeDouble",
          "alias": "AVE_SALE12",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "SQMI",
          "type": "esriFieldTypeDouble",
          "alias": "SQMI",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "Shape_Leng",
          "type": "esriFieldTypeDouble",
          "alias": "Shape_Leng",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "Shape_Area",
          "type": "esriFieldTypeDouble",
          "alias": "Shape_Area",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "Shape__Area",
          "type": "esriFieldTypeDouble",
          "alias": "Shape__Area",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "Shape__Length",
          "type": "esriFieldTypeDouble",
          "alias": "Shape__Length",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
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
      },
      popupTemplate: this._getAreaStatsPopupTemplate('county')
    }).then((layer) => {
      // not sure where else to put the scale factor for
      // county layer this is about scale zoom level 6 I think
      layer.minScale = 9500000; //approximate map scale to turn off counties
      this.countiesLayer = layer;
      this._mapInitPromise.then(() => {
        this.map.add(this.countiesLayer, 4);

      });
      return layer;
    });
  }

  /**
   * Gets the popupTemplate for a layer (based on area_type) or an individual feature.
   * @param area_type
   * @param feature
   * @private
   */
  _getAreaStatsPopupTemplate(area_type = 'county', feature = null) {
    if (area_type === null && !!feature) {
      area_type = get(feature, ['graphic', 'layer']) === this.statesLayer ? 'state' : 'county';
    }

    return {
      title: area_type === 'state' ? "{STATE_NAME}" : "{NAME}, {STATE_NAME}",
      outFields: ["POPULATION"],
      content: this._getAreaStatsPopupContent.bind(this),
    }
  }

  /**
   * Async function to get stats for an individual area. Supports county and state areas.
   * @param feature
   * @return {Promise<HTMLDivElement>}
   * @private
   */
  async _getAreaStatsPopupContent(feature) {
    let div = document.createElement('div')
    const population = get(feature, ['graphic', 'attributes', 'POPULATION'])
    const area_type = get(feature, ['graphic', 'layer']) === this.statesLayer ? 'state' : 'county';
    const area_id = area_type === 'state' ? get(feature, ['graphic', 'attributes', 'STATE_FIPS']) : get(feature, ['graphic', 'attributes', 'FIPS']);
    const area_name = area_type === 'state' ? get(feature, ['graphic', 'attributes', 'STATE_NAME']) : `${get(feature, ['graphic', 'attributes', 'NAME'])} County, ${get(feature, ['graphic', 'attributes', 'STATE_NAME'])}`;
    let stats;
    try {
      stats = await this._get_acis_area_stats(area_type, area_id)
    } catch (ex) {
      this._log(ex)
      div.innerHTML = `<div><span>No data</span></div>`
      return div
    }
    const url = `/climate_graphs/?fips=${area_id}&lat=${get(feature, ['graphic', 'geometry', 'centroid', 'latitude'])}&lon=${get(feature, ['graphic', 'geometry', 'centroid', 'longitude'])}&city=${area_name}${area_type === 'county' ? `&county=${get(feature, ['graphic', 'attributes', 'NAME'])} County` : ''}&nav=climate_graphs`
    div.classList.add('area-stats')
    const unit_label = this.options.variables[this.options.variable]['legend_unit'].replace('Fahrenheit', 'F').replace(' ', '&nbsp;')
    div.innerHTML = `
      <div style="font-size: 1rem; grid-column: 1 / span 2;">${this.options.variables[this.options.variable].title}</div>
      <div class="label1" >${this.options.rightYear} projection</div>
      <div class="label2 bg-rcp85">Higher Emissions</div>
      <span class="area_rcp85_value bg-rcp85" style="grid-column: 1 / span 2; padding-left: 1rem;" >${round_to_n_significant_figures(stats['rcp85'])}</span>
      <div class="label2 bg-rcp45">Lower Emissions</div>
      <span class="area_rcp45_value bg-rcp45" style="grid-column: 1 / span 2; padding-left: 1rem;">${round_to_n_significant_figures(stats['rcp45'], 3)}</span>
      <div class="label1 bg-hist" style="font-size: 0.8rem;">1961-1990&#32;observed average</div>
      <span class="area_hist_mean_value bg-hist" style="grid-column: 1 / span 2; padding-left: 1rem;">${round_to_n_significant_figures(stats['hist_mean'], 3)}</span>
     
      ${!!population ? `<div class="label1">Population (2017)</div><span style="grid-column: 1 / span 2; padding-left: 1rem;" class="area_social_value">${number_to_human(population)}</span>` : ''}
      <div style="grid-column: 1 / span 2;" class="d-flex-center"><a class="btn-default d-flex-center default-btn-height padding-horizontal rounded-choice-box" style="margin: 0.4rem auto !important;" href="${url}">Switch to graph</a></div>
      `
    return div
  }


  /**
   * Uses ACIS to retrieve LOCA downscaled values for the historical average, RCP4.5, and RCP8.5 values for the currently selected variable.
   * @return {Promise<{hist_mean, rcp45, rcp85}>}
   * @private
   */
  async _get_acis_area_stats(area_type, area_id) {
    const seasonal = !!this.options.season && this.options.season !== 'annual' && get(this.options.variables, [this.options.variable, 'seasonal_data'], false)
    const hist_sdate = `1961-${seasonal ? this.options.season_months[this.options.season] : '01'}-01`;
    const hist_edate = `1990-${seasonal ? this.options.season_months[this.options.season] : '12'}-31`;
    const proj_sdate = `${this.options.rightYear.replace('s', '')}-${seasonal ? this.options.season_months[this.options.season] : '01'}-01`;
    const proj_edate = `${this.options.rightYear.replace('s', '')}-${seasonal ? this.options.season_months[this.options.season] : '12'}-31`;

    const data = await Promise.all([
      this._fetch_acis_data('loca:wMean:rcp85', hist_sdate, hist_edate, this.options.variable, area_type, area_id, seasonal),
      this._fetch_acis_data('loca:wMean:rcp45', proj_sdate, proj_edate, this.options.variable, area_type, area_id, seasonal),
      this._fetch_acis_data('loca:wMean:rcp85', proj_sdate, proj_edate, this.options.variable, area_type, area_id, seasonal),
    ]);

    return {
      hist_mean: mean(data[0][1]),
      rcp45: data[1][1][0],
      rcp85: data[2][1][0]
    }
  }


  /**
   * Retrieves data from ACIS.
   * This is a modified version of the function by the same name from Climate By Location.
   * @param grid
   * @param sdate
   * @param edate
   * @param variable
   * @param area_type
   * @param area_id
   * @return {Promise<[][]>}
   * @private
   */
  async _fetch_acis_data(grid, sdate, edate, variable, area_type, area_id, seasonal) {
    const elems = [Object.assign(
        ScenarioComparisonMap._variable_acis_elements[this.options.variable],
        {"area_reduce": area_type + '_mean'}
    )];
    if (seasonal) {
      elems[0]["interval"] = [0, 12];
      elems[0]["duration"] = "mly";
    }
    const response = await (await fetch(this.options.area_data_api_endpoint, {
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(
          {
            "grid": grid,
            "sdate": String(sdate),
            "edate": String(edate),
            "elems": elems,
            [area_type]: area_id
          }
      )
    })).json();
    let keys = [];
    let values = [];
    for (const [key, value] of get(response, 'data', {})) {
      if (undefined !== value[area_id] && String(value[area_id]) !== '-999' && String(value[area_id]) !== '') {
        keys.push(key)
        values.push(value[area_id])
      }
    }
    return [keys, values];
  }


  _initStatesLayer() {
    return this._createReferenceLayer(this.options.statesLayerURL, {
      opacity: 0.5,
      "objectIdFieldName": "FID",
      "uniqueIdField":
          {
            "name": "FID",
            "isSystemMaintained": true
          },
      "globalIdFieldName": "",
      "geometryType": "polygon",
      "spatialReference": {
        "wkid": 102100,
        "latestWkid": 3857
      },
      "outFields": ['FID', 'STATE_FIPS'],
      "fields": [
        {
          "name": "FID",
          "type": "esriFieldTypeOID",
          "alias": "FID",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "STATE_NAME",
          "type": "esriFieldTypeString",
          "alias": "STATE_NAME",
          "sqlType": "sqlTypeNVarchar",
          "length": 25,
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "STATE_FIPS",
          "type": "esriFieldTypeString",
          "alias": "STATE_FIPS",
          "sqlType": "sqlTypeNVarchar",
          "length": 2,
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "STATE_ABBR",
          "type": "esriFieldTypeString",
          "alias": "STATE_ABBR",
          "sqlType": "sqlTypeNVarchar",
          "length": 2,
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "POPULATION",
          "type": "esriFieldTypeInteger",
          "alias": "POPULATION",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "POP_SQMI",
          "type": "esriFieldTypeDouble",
          "alias": "POP_SQMI",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "POP2010",
          "type": "esriFieldTypeInteger",
          "alias": "POP2010",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "POP10_SQMI",
          "type": "esriFieldTypeDouble",
          "alias": "POP10_SQMI",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "WHITE",
          "type": "esriFieldTypeInteger",
          "alias": "WHITE",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "BLACK",
          "type": "esriFieldTypeInteger",
          "alias": "BLACK",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AMERI_ES",
          "type": "esriFieldTypeInteger",
          "alias": "AMERI_ES",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "ASIAN",
          "type": "esriFieldTypeInteger",
          "alias": "ASIAN",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "HAWN_PI",
          "type": "esriFieldTypeInteger",
          "alias": "HAWN_PI",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "HISPANIC",
          "type": "esriFieldTypeInteger",
          "alias": "HISPANIC",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "OTHER",
          "type": "esriFieldTypeInteger",
          "alias": "OTHER",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "MULT_RACE",
          "type": "esriFieldTypeInteger",
          "alias": "MULT_RACE",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "MALES",
          "type": "esriFieldTypeInteger",
          "alias": "MALES",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "FEMALES",
          "type": "esriFieldTypeInteger",
          "alias": "FEMALES",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_UNDER5",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_UNDER5",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_5_9",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_5_9",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_10_14",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_10_14",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_15_19",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_15_19",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_20_24",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_20_24",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_25_34",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_25_34",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_35_44",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_35_44",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_45_54",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_45_54",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_55_64",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_55_64",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_65_74",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_65_74",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_75_84",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_75_84",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AGE_85_UP",
          "type": "esriFieldTypeInteger",
          "alias": "AGE_85_UP",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "MED_AGE",
          "type": "esriFieldTypeDouble",
          "alias": "MED_AGE",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "MED_AGE_M",
          "type": "esriFieldTypeDouble",
          "alias": "MED_AGE_M",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "MED_AGE_F",
          "type": "esriFieldTypeDouble",
          "alias": "MED_AGE_F",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "HOUSEHOLDS",
          "type": "esriFieldTypeInteger",
          "alias": "HOUSEHOLDS",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AVE_HH_SZ",
          "type": "esriFieldTypeDouble",
          "alias": "AVE_HH_SZ",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "HSEHLD_1_M",
          "type": "esriFieldTypeInteger",
          "alias": "HSEHLD_1_M",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "HSEHLD_1_F",
          "type": "esriFieldTypeInteger",
          "alias": "HSEHLD_1_F",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "MARHH_CHD",
          "type": "esriFieldTypeInteger",
          "alias": "MARHH_CHD",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "MARHH_NO_C",
          "type": "esriFieldTypeInteger",
          "alias": "MARHH_NO_C",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "MHH_CHILD",
          "type": "esriFieldTypeInteger",
          "alias": "MHH_CHILD",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "FHH_CHILD",
          "type": "esriFieldTypeInteger",
          "alias": "FHH_CHILD",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "FAMILIES",
          "type": "esriFieldTypeInteger",
          "alias": "FAMILIES",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AVE_FAM_SZ",
          "type": "esriFieldTypeDouble",
          "alias": "AVE_FAM_SZ",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "HSE_UNITS",
          "type": "esriFieldTypeInteger",
          "alias": "HSE_UNITS",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "VACANT",
          "type": "esriFieldTypeInteger",
          "alias": "VACANT",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "OWNER_OCC",
          "type": "esriFieldTypeInteger",
          "alias": "OWNER_OCC",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "RENTER_OCC",
          "type": "esriFieldTypeInteger",
          "alias": "RENTER_OCC",
          "sqlType": "sqlTypeInteger",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "NO_FARMS12",
          "type": "esriFieldTypeDouble",
          "alias": "NO_FARMS12",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AVE_SIZE12",
          "type": "esriFieldTypeDouble",
          "alias": "AVE_SIZE12",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "CROP_ACR12",
          "type": "esriFieldTypeDouble",
          "alias": "CROP_ACR12",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "AVE_SALE12",
          "type": "esriFieldTypeDouble",
          "alias": "AVE_SALE12",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "SQMI",
          "type": "esriFieldTypeDouble",
          "alias": "SQMI",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "Shape__Area",
          "type": "esriFieldTypeDouble",
          "alias": "Shape__Area",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
        },
        {
          "name": "Shape__Length",
          "type": "esriFieldTypeDouble",
          "alias": "Shape__Length",
          "sqlType": "sqlTypeFloat",
          "domain": null,
          "defaultValue": null
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
      },
      popupEnabled: false, // disabled for now.
      popupTemplate: this._getAreaStatsPopupTemplate('state')

    }).then((layer) => {
      this.statesLayer = layer;
      this._mapInitPromise.then(() => {
        this.map.add(this.statesLayer, 10);
      });
    });
  }

  _createReferenceLayer(layerURL, options) {
    // We implement our own json layer creator
    if (layerURL.endsWith('json') || layerURL.endsWith('geojson')) {
      return Promise.resolve($.ajax({
        url: layerURL,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json"
      })).catch(this._error).then((data) => {
        if (undefined === data) {
          throw 'Failed to retrieve station data. Refresh to try again.';
        }
        return new Promise((resolve) => {
          setTimeout(() => {
            // using setTimeout here to keep from blocking for too long
            // noinspection JSUnresolvedFunction
            const features = Terraformer.ArcGIS.convert(new Terraformer.Primitive(data));
            for (let i = 0; i < features.length; i++) {
              features[i]['geometry'] = new this.dojoMods.Polygon(features[i]['geometry']);
            }
            resolve(features);
          });
        }).catch(this._error);
      }).then((features) => {
        return new this.dojoMods.FeatureLayer(merge({
          // create an instance of esri/layers/support/Field for each field object
          source: features
        }, options));
      });
    } else {
      //if url is a feature service or csv we use the provided methods for creating them.

      const layerClass = this.dojoMods.FeatureLayer;

      return Promise.resolve(new layerClass(merge({url: layerURL}, options))).catch(this._log.bind(this));
    }
  }

  // Allows the widget to react to option changes. Any custom behaviors
  // can be configured here.
  update(options) {
    const old_options = merge({}, this.options);
    for (const k of Object.keys(options)) {
      this._setOption(k, options[k]);
    }
    // if (this.options.county !== old_options.county) {
    //   this._updateOverlay();
    // }
    if (!isEqual(this.options.extent ,old_options.extent) && this.options.extent !== null) {
      if (this.view) {
        this.view.when(() => {
          this.view.goTo(new this.dojoMods.Extent(this.options.extent));
        });
      }
    } else if (!isEqual(this.options.center, old_options.center) && this.options.center !== null && !(
        round(get(this.options.center, [0], Number.NaN), 3) === round(get(old_options.center, [0], Number.NaN), 3) &&
        round(get(this.options.center, [1], Number.NaN), 3) === round(get(old_options.center, [1], Number.NaN), 3)
    )) {
      this.options.extent = null;
      if (this.view) {
        this.view.when(() => {
          this.view.goTo({
            center: new this.dojoMods.Point({
              latitude: this.options.center[1],
              longitude: this.options.center[0]
            }), zoom: this.options.zoom
          });
        });
      }
    }
    if (this.options.variable) {
      if (this.options.variable !== old_options.variable || this.options.season !== old_options.season) {
        // Only a few variables have seasonal data
        if (this.options.variables[this.options.variable]['seasonal_data']) {
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
        this._updateAreaStatsPopup();
        // this._updateOverlay();
      }
    }

    // skip send change trigger for sliding the map changer. it causes issues for some browsers
    // when using an event listener on the map
    if (options.swipeX) {
      return this;
    }
    this._trigger('change', null, this.options);
    return this;
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

  _setOption(key, value) {
    const oldValue = this.options[key];
    // This will actually update the value in the options map
    this.options[key] = value;

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
          this._updateAreaStatsPopup();
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
        this._whenDojoLoaded().then(this._updateCountiesLayer.bind(this)).then((layer) => {

          layer.visible = value;
          layer.setScaleRange(2000, 20000);
        });

        break;
    }
  }

  _updateLeftScenario() {
    if (!this.options.scenarios[this.options.leftScenario].years.find((v) => {
      return v.value === this.options.leftYear;
    })) {
      this.options.leftYear = this.options.scenarios[this.options.leftScenario].defaultYear;
    }
    this._updateLeftScenarioSelect();
    this._updateLeftScenarioLayer();
    this._updateLeftYearSlider();
  }

  _updateRightScenario() {
    if (!this.options.scenarios[this.options.rightScenario].years.find((v) => {
      return v.value === this.options.rightYear;
    })) {
      this.options.rightYear = this.options.scenarios[this.options.leftScenario].defaultYear;
    }
    this._updateRightScenarioSelect();
    this._updateRightScenarioLayer();
    this._updateRightYearSlider();
  }

  _updateLeftYearSlider() {
    const _this5 = this;

    //override to disable left year slider for historical

    if (this.options.leftYear === 'avg') {

      this.nodes.$controlsOverLayContainer.find('.average-year-label').removeClass('d-none');
      this.nodes.$controlsOverLayContainer.find('.left-year-slider-container').removeClass('year w-100');
      this.nodes.$controlsOverLayContainer.find('.left-year-slider').addClass('d-none');
      this.nodes.$controlsOverLayContainer.find('.left-year-slider-container').find('.average-year-label').find('span').text(this.options.scenarios[this.options.leftScenario].years.slice(-1)[0].label);
      this.nodes.$controlsOverLayContainer.find('.left-year-slider-container').find('.year-label').addClass('d-none');

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
    let maxLabel = this.options.scenarios[this.options.leftScenario].years.slice(-1)[0].label;
    if (this.options.leftYear === 'avg') {
      maxLabel = '2000';
    }

    this.nodes.$controlsOverLayContainer.find('.average-year-label').addClass('d-none');
    this.nodes.$controlsOverLayContainer.find('.left-year-slider-container').addClass('year w-100');
    this.nodes.$controlsOverLayContainer.find('.left-year-slider').removeClass('d-none');
    this.nodes.$controlsOverLayContainer.find('.year-label').removeClass('d-none');

    this.nodes.$leftYearTooltip.text(this.options.scenarios[this.options.leftScenario].years.find(v => v.value === _this5.options.leftYear.toString()).label);
    this.nodes.$controlsOverLayContainer.find('.left-year-slider-container .year-min').text(this.options.scenarios[this.options.leftScenario].years[0].label);
    this.nodes.$controlsOverLayContainer.find('.left-year-slider-container .year-max').text(maxLabel);
    this.nodes.$leftYearSlider.slider({
      range: false,
      min: 0,
      max: this.options.scenarios[this.options.leftScenario].years.length - 1,
      step: 1,
      value: this.options.scenarios[this.options.leftScenario].years.findIndex(v => v.value === _this5.options.leftYear.toString()),
      slide: (event, ui) => {
        this.nodes.$leftYearTooltip.text(this.options.scenarios[this.options.leftScenario].years[ui.value].label);
      },
      change: (event, ui) => {
        this.nodes.$leftYearSlider.data('value', ui.value);

        this.update({leftYear: this.options.scenarios[this.options.leftScenario].years[ui.value].value});
      }
    }).find(".ui-slider-handle").html('<span class="icon icon-arrow-left-right"></span>').append(this.nodes.$leftYearTooltip);
    this.nodes.$leftYearTooltip.fadeIn();
  }

  _updateRightYearSlider() {
    const _this6 = this;

    if (this.nodes.$rightYearSlider === undefined) {
      this.nodes.$rightYearSlider = $(this.element).find('.right-year-slider');
    }
    if (this.nodes.$rightYearTooltip === undefined) {
      this.nodes.$rightYearTooltip = $("<span class='map-tooltip'></span>").hide();
    }
    let maxLabel = this.options.scenarios[this.options.rightScenario].years.slice(-1)[0].label;
    if (this.options.rightYear === 'avg') {
      maxLabel = '2000';
    }
    this.nodes.$rightYearTooltip.text(this.options.scenarios[this.options.rightScenario].years.find(v => v.value === _this6.options.rightYear.toString()).label);
    this.nodes.$controlsOverLayContainer.find('.right-year-slider-container .year-min').text(this.options.scenarios[this.options.rightScenario].years[0].label);
    this.nodes.$controlsOverLayContainer.find('.right-year-slider-container .year-max').text(maxLabel);
    this.nodes.$rightYearSlider.slider({
      range: false,
      min: 0,
      max: this.options.scenarios[this.options.rightScenario].years.length - 1,
      step: 1,
      value: this.options.scenarios[this.options.rightScenario].years.findIndex(v => v.value === _this6.options.rightYear.toString()),
      slide: (event, ui) => {
        this.nodes.$rightYearTooltip.text(this.options.scenarios[this.options.rightScenario].years[ui.value].label);
      },
      change: (event, ui) => {
        this.nodes.$rightYearSlider.data('value', ui.value);

        this.update({rightYear: this.options.scenarios[this.options.rightScenario].years[ui.value].value});
      }
    }).find(".ui-slider-handle").html("<span class='icon icon-arrow-left-right'></span>").append(this.nodes.$rightYearTooltip);
    this.nodes.$rightYearTooltip.fadeIn();
  }

  _updateLeftScenarioSelect() {
    const _this7 = this;

    // check if variable is precip then disable the historical and select lower emmissions
    if (_this7.options.variable === 'pcpn') {
      $('#left-scenario-dropdown-menu').data('value', 'rcp45');
      $('#left-scenario-dropdown-menu').html('Lower Emissions');
      $('.leftScenario-option-historical').addClass('d-none');
    } else {
      $('.leftScenario-option-historical').removeClass('d-none');
    }

    // left-scenario-dropdown-menu
    if (this.nodes.$leftScenarioSelect === undefined) {
      this.nodes.$leftScenarioSelect = $(this.nodes.$controlsOverLayContainer).find("#left-scenario-dropdown-menu");
      this.nodes.$leftScenarioSelect.data('value');

      this.nodes.$leftScenarioSelect.bind('cs-changed', () => {
        if (this.nodes.$leftScenarioSelect.data('value') !== undefined && this.nodes.$leftScenarioSelect.data('value') !== null) {
          this.update({leftScenario: this.nodes.$leftScenarioSelect.data('value')});
        }
      });
    }
  }

  _updateRightScenarioSelect() {
    if (this.nodes.$rightScenarioSelect === undefined) {
      this.nodes.$rightScenarioSelect = $(this.nodes.$controlsOverLayContainer).find("#right-scenario-dropdown-menu");
      this.nodes.$rightScenarioSelect.data('value');

      this.nodes.$rightScenarioSelect.bind('cs-changed', () => {
        if (this.nodes.$rightScenarioSelect.data('value') !== undefined && this.nodes.$rightScenarioSelect.data('value') !== null) {
          this.update({rightScenario: this.nodes.$rightScenarioSelect.data('value')});
        }
      });
    }
  }

  /**
   * Updates any existing popups
   * @private
   */
  _updateAreaStatsPopup() {
    if (this.view && this.view.popup.features) {
      for (const feature of this.view.popup.features) {
        feature.popupTemplate = this._getAreaStatsPopupTemplate(null, feature)
      }
    }

  }

  _setSwipeX(value) {
    if (this.leftLayer && this.rightLayer) {
      this.view.whenLayerView(this.leftLayer).then((layerView) => {
        this._setClipPath(layerView.container.element, 'left', value);
      });
      this.view.whenLayerView(this.rightLayer).then((layerView) => {
        this._setClipPath(layerView.container.element, 'right', value);
      });
    }
  }

  _updateLegend() {
    let legendFilename = this.options.variables[this.options.variable]['seasonal_data'] ? [this.options.season || 'summer', this.options.variable].join('_') : this.options.variable;
    let legend_note = ('legend_note' in this.options.variables[this.options.variable] && !!this.options.variables[this.options.variable]['legend_note']) ? this.options.variables[this.options.variable]['legend_note'] : null;
    this.nodes.$legendContainer.html(`
        <span class="legend-unit-label">${this.options.variables[this.options.variable]['legend_unit']}</span>
        <img alt="legend image" class="legend-image" src="/img/legends/${legendFilename}.png">
        ${!!legend_note ? `<span class="legend-note-label">${legend_note}</span>` : ''}
      `);
  }

  //
  // _updateOverlay() {
  //   if (typeof this.options.county === 'undefined' || this.options.county === null) {
  //     if (typeof this.nodes.$countyOverlay !== 'undefined') {
  //       delete this['cwg'];
  //       this.nodes.$countyOverlay.remove();
  //     }
  //     return;
  //   }
  //   if (this.nodes.$countyOverlay !== undefined && this.nodes.$countyOverlay !== null) {
  //   }
  // }

  _getScenarioURL(scenario, year) {
    let tilesURL = this.options.scenarios[scenario].tilesURL;
    let season = this.options.season || '';
    const season_month = this.options.season_months[season] || '';
    if (scenario === 'historical') {
      scenario = 'hist';
    }
    const variable = this.options.variable;
    // if (this.options.variable === 'days_dry_days') {
    //   variable = 'dry_days';
    // }
    if (!['tmin', 'tmax', 'pcpn'].includes(variable)) {
      season = 'annual';
    }
    // fill template variables and collapse empty '//' values (that aren't part of the 'https://') as s3 hates them.
    tilesURL = tilesURL.replace('{scenario}', scenario).replace('{season}', season).replace('{season_month}', season_month).replace('{variable}', variable).replace('{year}', year).replace(/\/\//g, (i => m => !i++ ? m : '/')(0));
    return tilesURL
  }

  _destroy() {
    // remove CSS classes, destroy nodes, etc
    this.map.destroy();
    Object.values(this.nodes).forEach(node => {
      node.remove();
    });
  }

  _log() {
    this.options.debug === 3 && this._toLoggerMethod('log', arguments);
  }

  _warn() {
    this.options.debug >= 2 && this._toLoggerMethod('warn', arguments);
  }

  _error() {
    this.options.debug >= 1 && this._toLoggerMethod('error', arguments);
  }

  _toLoggerMethod(method, args) {
    args = Array.prototype.slice.call(arguments, 1);
    const logger = this.options.logger || console;
    logger.error.apply(logger, args);
  }


  getShowSeasonControls() {
    return this.options.variables[this.options.variable]['seasonal_data'];
  }

  whenDojoMods(callback) {
    if (this.dojoMods !== undefined) {
      callback();
    } else {
      window.addEventListener('dojoModsLoaded', callback);
    }
  }

  _setClipPath(element, side, value) {
    if (side === 'left') {
      if (element.style.WebkitClipPath !== undefined) {
        element.style.WebkitClipPath = "polygon(0 0, " + value + "px 0, " + value + "px 100%, 0% 100%)";
      }
      if (element.style.clipPath !== undefined) {
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

  static get _variable_acis_elements() {
    return {
      tmax: {
        "name": "maxt",
        "units": "degreeF",
        "interval": "yly",
        "duration": "yly",
        "reduce": "mean"
      },
      tmin: {
        "name": "mint",
        "units": "degreeF",
        "interval": "yly",
        "duration": "yly",
        "reduce": "mean"
      },
      days_tmax_gt_50f: {
        "name": "maxt",
        "interval": "yly",
        "duration": "yly",
        "reduce": "cnt_gt_50"
      },
      days_tmax_gt_60f: {
        "name": "maxt",
        "interval": "yly",
        "duration": "yly",
        "reduce": "cnt_gt_60"

      },
      days_tmax_gt_70f: {
        "name": "maxt",
        "interval": "yly",
        "duration": "yly",
        "reduce": "cnt_gt_70"
      },
      days_tmax_gt_80f: {
        "name": "maxt",
        "interval": "yly",
        "duration": "yly",
        "reduce": "cnt_gt_80"
      },
      days_tmax_gt_90f: {
        "name": "maxt",
        "interval": "yly",
        "duration": "yly",
        "reduce": "cnt_gt_90"

      },
      days_tmax_gt_95f: {
        "name": "maxt",
        "interval": "yly",
        "duration": "yly",
        "reduce": "cnt_gt_95"

      },
      days_tmax_gt_100f: {
        "name": "maxt",
        "interval": "yly",
        "duration": "yly",
        "reduce": "cnt_gt_100"

      },
      days_tmax_gt_105f: {
        "name": "maxt",
        "interval": "yly",
        "duration": "yly",
        "reduce": "cnt_gt_105"

      },
      days_tmax_lt_32f: {
        "name": "maxt",
        "interval": "yly",
        "duration": "yly",
        "reduce": "cnt_lt_32"

      },
      days_tmin_lt_32f: {
        "name": "mint",
        "interval": "yly",
        "duration": "yly",
        "reduce": "cnt_lt_32"
      },
      days_tmin_lt_minus_40f: {
        "name": "mint",
        "interval": "yly",
        "duration": "yly",
        "reduce": "cnt_lt_-40"

      },
      days_tmin_gt_60f: {
        "name": "mint",
        "interval": "yly",
        "duration": "yly",
        "reduce": "cnt_gt_80"

      },
      days_tmin_gt_80f: {
        "name": "mint",
        "interval": "yly",
        "duration": "yly",
        "reduce": "cnt_gt_80"

      },
      days_tmin_gt_90f: {
        "name": "mint",
        "interval": "yly",
        "duration": "yly",
        "reduce": "cnt_gt_90"


      },
      hdd_65f: {
        "name": "hdd",
        "interval": "yly",
        "duration": "yly",
        "reduce": "sum"

      },
      cdd_65f: {
        "name": "cdd",
        "interval": "yly",
        "duration": "yly",
        "reduce": "sum"

      },
      gdd: {
        "name": "gdd",
        "interval": "yly",
        "duration": "yly",
        "reduce": "sum"
      },
      gddmod: {
        "name": "gdd",
        "duration": "yly",
        "limit": [86, 50],
        "interval": "yly",
        "reduce": "sum"
      },
      gdd_32f: {
        "name": "gdd32",
        "interval": "yly",
        "duration": "yly",
        "reduce": "sum"
      },
      hdd_32f: {
        "name": "hdd32",
        "interval": "yly",
        "duration": "yly",
        "reduce": "sum"
      },
      pcpn: {
        "name": "pcpn",
        "interval": "yly",
        "duration": "yly",
        "reduce": "sum",
        "units": "inch"
      },
      days_dry_days: {
        "name": "pcpn",
        "interval": "yly",
        "duration": "yly",
        "reduce": "cnt_lt_0.01"
      },
      days_pcpn_gt_0_25in: {
        "name": "pcpn",
        "interval": "yly",
        "duration": "yly",
        "reduce": "cnt_gt_1"
      },
      days_pcpn_gt_1in: {
        "name": "pcpn",
        "interval": "yly",
        "duration": "yly",
        "reduce": "cnt_gt_1"
      },
      days_pcpn_gt_2in: {
        "name": "pcpn",
        "interval": "yly",
        "duration": "yly",
        "reduce": "cnt_gt_2"
      },
      days_pcpn_gt_3in: {
        "name": "pcpn",
        "interval": "yly",
        "duration": "yly",
        "reduce": "cnt_gt_3"
      },
      days_pcpn_gt_4in: {
        "name": "pcpn",
        "interval": "yly",
        "duration": "yly",
        "reduce": "cnt_gt_4"
      },
    };

  }

}

// export default ScenarioComparisonMap;
