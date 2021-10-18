import head from '../template/head'
import secondary_header from '../template/nav_header';
import footer from '../template/footer';
import nav_footer from '../template/nav_footer';
import {version_suffix} from "../template/template_utils";

// language=HTML
export default (config) => `
  <!doctype html>
  <html lang='en'>
  <head>
    ${head(config)}
    <meta property="fb:app_id" content="187816851587993">
    <meta property="og:url" content="historical_thresholds">
    <meta property="og:type" content="article">
    <meta property="og:title" content="Climate Explorer">
    <meta property="og:description"
          content="The Climate Explorer allows you to view historical and projected climate variables and assess the impacts of climate change on the things you care about">
    <meta property="og:image" content="/img/og.jpg">
  </head>
  <body>
  ${secondary_header(config)}
  <main class="container-fluid">
      <div class="mt-2 row search-station-row">
        <div class="col-12 col-md-7 col-lg-8">
          <div class="input-group search-input-group rounded-2 border border-1 me-2">
            <button id="clear-location" class="btn search-icons" type="button"><span class="fas fa-times-circle"></span></button>
            <input id="cards-search-input" class="form-control location-mapper" type="text" placeholder="Enter county or city name"
                   aria-label="Enter county or city name">
          </div>
        </div>
        <div class="col-12 col-md-5 col-lg-4">
          <div class="dropdown rounded-2 border border-1 stations-dropdown">
            <a class="btn dropdown-toggle w-100 d-flex justify-content-between align-items-center" href="#" role="button" id="stations-dropdown-menu"
               data-bs-toggle="dropdown" aria-expanded="false">
              Stations
            </a>
            <ul class="dropdown-menu stations-dropdown-ul w-100" aria-labelledby="stations-dropdown-menu">
            </ul>
          </div>
        </div>
      </div>
      
      <div class="info-section mt-2">
        <div class="border border-1 rounded-2">
          <div class="m-2 mb-3">
            <span
                id="station-info-none"><strong>Please select a station on the map or from the Stations dropdown menu. You may need to zoom out to see more stations.</strong></span>
            <span id="station-info" class="d-none">
                    <span id="default-station-label" class="text-info-box label">Station id: </span>
                    <span id="default-station" class="text-info-box data right-padding"></span>
                    <span id="default-station-id-label" class="text-info-box label">Station: </span>
                    <span id="default-station-id" class="text-info-box data right-padding"></span>
                  </span>
          </div>
          <div class="m-2 collapse show" id="collapse-info-section">
            <div class="row align-items-center">
              <div class="col-md-12 col-lg-6 col-xl-2 mt-1 mb-1 info-section">
                <div class="btn-group border rounded-2 graph-map-selection w-100" role="group">
                  <label class="btn ps-4 pe-4 default-selection disabled" id="chartmap-select-chart-link" data-value="chart" data-page="historical_thresholds"
                         data-sel="chartmap-select-vis">Graph</label>
                  <label class="btn ps-4 pe-4 selected-item" id="chartmap-select-map-link" data-page="historical_thresholds" data-value="map"
                         data-sel="chartmap-select-vis">Map</label>
                </div>
              </div>
              <div class="col-md-12 col-lg-6 col-xl-2 selection-dropdown mt-1 mb-1 info-section">
                <div class="dropdown rounded-2 border border-1">
                  <a class="btn dropdown-toggle ps-4 pe-4 w-100 disabled" href="#" style="text-align: center;" role="button" id="selection-dropdown-menu"
                     data-bs-toggle="dropdown" aria-expanded="false" data-value="precipitation">
                    Precipitation
                  </a>
                  <ul class="dropdown-menu selection-dropdown-menu w-100" aria-labelledby="selection-dropdown-menu">
                    <li role="option" data-value="precipitation" class="dropdown-item" data-page="historical_thresholds">Precipitation</li>
                    <li role="option" data-value="tavg" class="dropdown-item" data-page="historical_thresholds">Average Temperature</li>
                    <li role="option" data-value="tmax" class="dropdown-item" data-page="historical_thresholds">Maximum Temperature</li>
                    <li role="option" data-value="tmin" class="dropdown-item" data-page="historical_thresholds">Minimum Temperature</li>
                  </ul>
                </div>
              </div>
              
              
              <div class="col-md-12 col-lg-6 col-xl-2 mt-lg-4 mt-xl-0 mt-4">
                
                <div class="input-group">
                  <div class="input-group-prepend">
                    <button class="btn btn-outline-secondary threshold-down" type="button">-</button>
                  </div>
                  <input id="threshold-value" type="text" class="form-control" placeholder="Threshold in inches" aria-label="" aria-describedby="basic-addon1" min="0" max="200" value="1" step="0.1">
                  <label class="historical-threshold-input" for="threshold-value">Threshold in<span id="threshold-unit"> inches</span></label>
                  <div class="input-group-append">
                    <button class="btn btn-outline-secondary threshold-up" type="button">+</button>
                  </div>
                </div>
                
              </div>

              <div class="col-md-12 col-lg-6 col-xl-2 mt-lg-4 mt-xl-0 mt-4">
                
                <div class="input-group">
                  <div class="input-group-prepend">
                    <button class="btn btn-outline-secondary window-down" type="button">-</button>
                  </div>
                  <input id="window-value" type="text" class="form-control" placeholder="Window in days" min="0" max="365" value="1" step="1">
                  <label class="historical-threshold-input" for="window-value">Window in<span id="window-unit"> days</label>
                  <div class="input-group-append">
                    <button class="btn btn-outline-secondary window-up" type="button">+</button>
                  </div>
                </div>

              </div>
    
              <div class="col-md-12 col-lg-6 col-xl-1 download-dropdown mt-1 mb-1 info-section">
                <div class="dropdown rounded-2 border border-1">
                  <a class="btn dropdown-toggle ps-4 pe-4 w-100 disabled" href="#" style="text-align: center;" role="button" id="download-dropdown-menu"
                     data-bs-toggle="dropdown" aria-expanded="false">
                    <span class="fas fa-download select-icon"></span>
                    Downloads
                  </a>
                  <ul class="dropdown-menu download-select" aria-labelledby="download-dropdown-menu">
                    <li data-value="download-thresholds-image" data-icon="fas fa-download select-icon" href="javascript:void(0);" class="default-select-option">
                      <a data-value="download-thresholds-image" class="dropdown-item" href="javascript:void(0);">Download threshold image</a>
                    </li>
                    <li data-value="download-thresholds-data" data-icon="fas fa-download select-icon" href="javascript:void(0);" class="default-select-option">
                      <a data-value="download-thresholds-data" class="dropdown-item" href="javascript:void(0);">Download threshold data</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="col-md-12 col-lg-6 col-xl-1 info-section">
                <div class="btn chart-info border border-1 mt-1 mb-1 w-100 disabled" id="chart-info-row-btn" data-bs-toggle="modal" data-bs-target="#aboutModal">
                  <i class="fas fa-info me-2"></i>
                  <span>About</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    
      <div id="historical-thresholds-viewport" class="graph-body d-flex flex-column flex-grow-1">
        
        <div id="stations-map-row" style="display: flex; flex-flow: column nowrap; flex: 1 1 auto; position:relative;">
          <div id="stations-map-wrap" class="map-wrap" style="display: flex; flex-flow: column nowrap; flex: 1 1 auto; position:relative;">
            <div id="stations-map" class="map-element flex-grow-1"></div>
            <div id="stations-map-message" class="py-2 px-1 rounded-2 d-none"></div>
          </div>
        </div>
        
        <div id="stations-graph-row" style="display: flex; flex-flow: column nowrap; flex: 1 1 auto; position:relative;">
          <div id="stations-graph-wrap" class="d-flex flex-column flex-grow-1">
            <div id="thresholds-container"></div>
          </div>
        </div>
        
        <div id="station-info-row" class="d-flex flex-justify padding-bottom d-flex-left d-none">
          <div class="modal fade" id="aboutModal" tabindex="-1" aria-labelledby="aboutModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-fullscreen-md-down modal-xl">
              <div class="modal-content p-3">
                <div class="modal-header">
                  <h3 class="modal-title" id="aboutModalLabel">READING THE THRESHOLDS CHARTS</h3>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <div class="mb-3">This graph shows how often the selected threshold has been exceeded per year. For consistency,
                    this chart excludes any years that are missing more than five daily temperature reports or more
                    than one precipitation report in a single month. Data from
                    <a target="_blank"
                       href="https://www.ncdc.noaa.gov/data-access/land-based-station-data/land-based-datasets/global-historical-climatology-network-ghcn">
                      Global Historical Climatology Network</a>, served by <a target="_blank" href="http://www.rcc-acis.org/">ACIS</a>.
                  </div>
                  <div>
                    Pan or zoom on these graphs to view other years. Place your cursor on either axis and then scroll, click-and-drag, or hold down your SHIFT key and
                    scroll to adjust the display.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      
      </div>
  </main>
  ${nav_footer(config)}
  ${footer(config)}
  <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.1/Chart.bundle.min.js" integrity="sha256-N4u5BjTLNwmGul6RgLoESPNqDFVUibVuOYhP4gJgrew="
          crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.19/lodash.min.js"
          integrity="sha512-/A6lxqQJVUIMnx8B/bx/ERfeuJnqoWPJdUxN8aBj+tZYL35O998ry7UUGoN65PSUNlJNrqKZrDENi4i1c3zy4Q==" crossorigin="anonymous"></script>
  <script type="text/javascript" src="/vendor/item/jquery.fl-item.min.js${version_suffix()}"></script>
  <script src="https://unpkg.com/terraformer@1.0.8/terraformer.js" integrity="sha384-+M797Pj3WZVCwMmLbOxAoaWYcKJo8NSxItmI48ytcLNeAnfn1d/IckFn31jEqrzP"
          crossorigin="anonymous"></script>
  <script src="https://unpkg.com/terraformer-arcgis-parser@1.0.5/terraformer-arcgis-parser.js"
          integrity="sha384-duFUjKTSNoxEspdJNwr83CUgRxclf0ueKJB9DU/Vbit6bfWgzvZsHW6H1JLBBXhp" crossorigin="anonymous"></script>
  <script type="${config.env === 'dev' ? 'module' : 'text/javascript'}" src="/js/historical_thresholds.js${version_suffix()}"></script>
  </body>
  </html>
`
