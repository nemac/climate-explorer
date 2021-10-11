import head from '../template/head'
import secondary_header from '../template/nav_header';
import variable_selector from '../template/variable_selector';
import footer from '../template/footer';
import nav_footer from '../template/nav_footer';

// language=HTML
export default (config) => `
  <!doctype html>
  <html lang='en'>
  <head>
    ${head(config)}
    <meta property="fb:app_id" content="187816851587993">
    <meta property="og:url" content="/">
    <meta property="og:type" content="article">
    <meta property="og:title" content="Location data for Buncombe County, NC">
    <meta property="og:description"
          content="The Climate Explorer allows you to view historical and projected climate variables and assess the impacts of climate change on the things you care about">
    <meta property="og:image" content="/img/og.jpg">
  </head>
  <body>
  ${secondary_header(config)}
  <main class="container-fluid d-flex flex-column" style="position: relative;">
    <div class="row mt-2 search-station-row">
      <div class="col-12 col-md-7 col-lg-8">
        <div class="input-group search-input-group rounded-2 border border-1 me-2">
          <button id="clear-location" class="btn search-icons" type="button"><span class="fas fa-times-circle"></span></button>
          <input id="cards-search-input" class="form-control location-mapper" type="text" placeholder="Enter county or city name"
                 aria-label="Enter county or city name">
        </div>
      </div>
      <div class="col-12 col-md-5 col-lg-4">
        <div class="dropdown rounded-2 border border-1 stations-dropdown">
          <a class="btn dropdown-toggle w-100 d-flex justify-content-between align-items-center disabled" href="#" role="button" id="stations-dropdown-menu"
             data-bs-toggle="dropdown" aria-expanded="false">
            Stations
          </a>
        </div>
      </div>
    </div>
    <div class="info-section mt-2">
      <div class="border border-1 rounded-2">
        <div class="d-flex justify-content-between">
          <div class="m-2 d-flex align-items-center">
            <i class="fas fa-chart-line me-2"></i>
            <span id="default-city-county"></span>
            <span class="ms-1 me-1"> - </span>
            <span id="default-chart-map-variable" data-value="tmax">Average Daily Maximum Temp (°F)</span>
          </div>
          <div class="accordion-button accordion-click" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-info-section" aria-expanded="true"
               aria-controls="collapse-info-section"></div>
        </div>
        <div class="m-2 mt-0 collapse show" id="collapse-info-section">
          <div class="row">
            <div class="col-md-12 col-lg-3 order-xs-1 d-flex flex-row align-items-center mb-1 mt-1 info-section">
              <div class="dropdown rounded-2 border border-1 w-100">
                <a class="d-flex justify-content-between align-items-center btn dropdown-toggle w-100" href="#" id="filter-dropdown-menu" data-bs-toggle="dropdown"
                   aria-expanded="true" data-value="tmax">
                  Average Daily Maximum Temperature (°F)
                </a>
                <div class="dropdown-menu filter-dropdown-menu p-2" aria-labelledby="filter-dropdown-menu">
                  <div class="d-lg-flex">
                    ${variable_selector(config)}
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-12 col-lg-2 order-xs-2 mb-1 mt-1 info-section">
              <div class="btn-group border rounded-2 graph-map-selection w-100" role="group">
                <input type="radio" class="btn-check" name="graph-map" id="graph-selection" autocomplete="off" data-page="climate_graphs"
                       data-sel="chartmap-select-vis">
                <label class="btn ps-4 pe-4 default-selection" for="graph-selection">Graph</label>
                <input type="radio" class="btn-check" name="graph-map" id="map-selection" autocomplete="off" data-page="climate_maps" data-value="map"
                       data-sel="chartmap-select-vis">
                <label class="btn ps-4 pe-4 selected-item" for="map-selection">Map</label>
              </div>
            </div>
            <div class="col-md-12 col-lg-5 order-xs-4 btn-group d-flex-wrap mb-1 mt-1 info-section" id="time-wrapper">
              <label id="annual-selection-label" class="btn ps-4 pe-4 selected-item" for="annual-selection" data-value="annual">Annual</label>
              <label id="spring-selection-label" class="btn ps-4 pe-4 default-selection" for="spring-selection" data-value="spring">Spring</label>
              <label id="summer-selection-label" class="btn ps-4 pe-4 default-selection" for="summer-selection" data-value="summer">Summer</label>
              <label id="fall-selection-label" class="btn ps-4 pe-4 default-selection" for="fall-selection" data-value="fall">Fall</label>
              <label id="winter-selection-label" class="btn ps-4 pe-4 default-selection" for="winter-selection" data-value="winter">Winter</label>
            </div>
            <div class="col-md-12 col-lg-1 order-xs-3 download-dropdown mb-1 mt-1 info-section">
              <div class="dropdown rounded-2 border border-1">
                <a class="btn dropdown-toggle ps-4 pe-4 w-100" href="#" role="button" id="download-dropdown-menu" data-bs-toggle="dropdown" aria-expanded="false"
                   style="text-align: center;">
                  <span class="fas fa-download select-icon"></span>
                  Downloads
                </a>
                <ul class="dropdown-menu download-select" aria-labelledby="download-dropdown-menu">
                  <li class="default-select-option" data-value="download-leftmap-image" data-icon="fas fa-download select-icon">
                    <a class="dropdown-item download-link" data-value="download-leftmap-image" href="javascript:void(0);">Download left map as image</a>
                  </li>
                  <li class="default-select-option" data-value="download-rightmap-image" data-icon="fas fa-download select-icon">
                    <a class="dropdown-item download-link" data-value="download-rightmap-image" href="javascript:void(0);">Download right map as image</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="climate-maps-viewport" class="d-flex flex-column flex-grow-1 mt-2 pb-2" style="min-height:35rem;">
      <div id="info-row" class="w-100">
      </div>
      <div id="map-for-print-left" class="d-none d-none"></div>
      <div id="map-for-print-right" class="d-none d-none"></div>
      <div id="map-row" class="w-100 flex-grow-1 d-flex flex-column" style="overflow: hidden">
        <div id="map-element" class="d-flex flex-column w-100 flex-grow-1">
          <div id="local-climate-map-element" class="map-element p-0 flex-grow-1"></div>
          <div id="map-message" class="map-nodata-message d-none"></div>
        </div>
      </div>
    </div>
  </main>
  ${nav_footer(config)}
  ${footer(config)}
  <script src="https://unpkg.com/terraformer@1.0.8/terraformer.js" integrity="sha384-+M797Pj3WZVCwMmLbOxAoaWYcKJo8NSxItmI48ytcLNeAnfn1d/IckFn31jEqrzP"
          crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js" integrity="sha256-c3RzsUWg+y2XljunEQS0LqWdQ04X1D3j22fd/8JCAKw="
          crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.js" integrity="sha256-Tw0/gX6aFDMese6GHQJFL/ZjF+f7edyF9okFVY/B9oU="
          crossorigin="anonymous"></script>
  <script src="https://unpkg.com/terraformer-arcgis-parser@1.0.5/terraformer-arcgis-parser.js"
          integrity="sha384-duFUjKTSNoxEspdJNwr83CUgRxclf0ueKJB9DU/Vbit6bfWgzvZsHW6H1JLBBXhp" crossorigin="anonymous"></script>
  <script type="${config.env === 'dev' ? 'module' : 'text/javascript'}" src="/js/climate_maps.js"></script>
  </body>
  </html>
`
