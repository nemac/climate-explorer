import head from '../template/head'
import secondary_header from '../template/nav_header';
import variable_selector from '../template/variable_selector';
import footer from '../template/footer';
import nav_footer from '../template/nav_footer';
import chart_explainer from '../template/chart_explainer';

// language=HTML
export default (config) => `
  <!DOCTYPE  html>
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
  <div class="container-fluid body-size h-100" style="overflow-y:auto;">
    <div class="mt-2 search-station-row row">
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
            <div class="col-md-12 col-lg-8 col-xl-3 d-flex flex-row align-items-center mt-1 mb-1 info-section">
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
            <div class="col-md-12 col-lg-4 col-xl-2 mt-1 mb-1 info-section" style="text-align: center;">
              <div class="btn-group border rounded-2 graph-map-selection w-100" role="group">
                <label id="graph-selection" class="btn ps-4 pe-4 selected-item w-50" data-page="climate_graphs">Graph</label>
                <label id="map-selection" class="btn ps-4 pe-4 default-selection w-50" data-page="climate_maps" data-value="map">Map</label>
              </div>
            </div>
            <div class="col-md-12 col-lg-4 col-xl-2 btn-group mt-1 mb-1 info-section" id="time-wrapper">
              <label id="annual-selection-label" class="btn ps-4 pe-4 selected-item w-50" for="annual-selection" data-value="annual"
                     data-sel="time-select-vis">Annual</label>
              <label id="monthly-selection-label" class="btn ps-4 pe-4 default-selection w-50" for="spring-selection" data-value="monthly" data-sel="time-select-vis">Monthly</label>
            </div>
            <div class="col-md-12 col-lg-4 col-xl-1 download-dropdown mt-1 mb-1 info-section">
              <div class="dropdown rounded-2 border border-1">
                <a class="btn dropdown-toggle ps-4 pe-4 w-100" href="#" style="text-align: center;" role="button" id="download-dropdown-menu"
                   data-bs-toggle="dropdown" aria-expanded="false">
                  <span class="fas fa-download select-icon"></span>
                  Downloads
                </a>
                <ul class="dropdown-menu download-select" aria-labelledby="download-dropdown-menu">
                  <li id="download-image" data-value="download-image" data-icon="fas fa-download select-icon">
                    <a class="dropdown-item" data-value="download-image" href="javascript:void(0);">Chart image (.png)</a>
                  </li>
                  <li id="download-observed-data" data-value="download-observed-data" data-icon="fas fa-download select-icon">
                    <a class="dropdown-item" data-value="download-observed-data" href="javascript:void(0);">Observations (.csv)</a>
                  </li>
                  <li id="download-historical-modeled-data" data-value="download-historical-modeled-data" data-icon="fas fa-download select-icon">
                    <a class="dropdown-item" data-value="download-historical-modeled-data" href="javascript:void(0);">Modeled History (.csv)</a>
                  </li>
                  <li id="download-projected-modeled-data" data-value="download-projected-modeled-data" data-icon="fas fa-download select-icon">
                    <a class="dropdown-item" data-value="download-projected-modeled-data" href="javascript:void(0);">Projections (.csv)</a>
                  </li>
                  <li id="download-interpreting" data-value="download-interpreting" data-icon="fas fa-download select-icon">
                    <a class="dropdown-item" data-value="download-interpreting"
                       href="https://crt-climate-explorer.nemac.org/data/Climate-Explorer--Documentation-for-Downloads.xlsx">Documentation for Downloads (.xlsx)</a>
                  </li>
                </ul>
              </div>
            </div>
            <div class="col-md-12 col-lg-4 col-xl-1 info-section">
              <div class="btn chart-info border border-1 mt-1 mb-1 w-100" id="chart-info-row-btn" data-bs-toggle="modal" data-bs-target="#aboutModal">
                <i class="fas fa-info me-2"></i>
                <span>About</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div id="chart-row" class="graph-body d-flex-column" style="min-height: 30rem;">
      <div id="chart-wrap" class="chart-wrap d-flex d-flex-center width-100">
        <div id="chart-123" class="chart-canvas width-100 height-100" data-chart-ID="123"></div>
        <div id="chart-message" class="chart-nodata-message d-none"></div>
      </div>
    </div>

    <div id="legend-wrapper" class="d-flex-center flex-wrap mb-2">
      <div class="btn btn-histobs d-flex-center selected-item border border-1 m-1 rounded-2" data-value="histobs">
        <div class="inner-histobs ps-3 pe-3 pt-2 pb-2 me-2 rounded-2"></div>
        Observations
      </div>
      <div class="btn btn-histmod d-flex-center selected-item border border-1 m-1 rounded-2" data-value="histmod">
        <div class="inner-histmod ps-3 pe-3 pt-2 pb-2 me-2 rounded-2"></div>
        Modeled History
      </div>
      <div class="btn btn-lower-emissions selected-item d-flex-center border border-1 m-1 rounded-2" data-value="rcp45">
        <div class="inner-lower-emissions ps-3 pe-3 pt-2 pb-2 me-2 rounded-2"></div>
        Lower Emissions
      </div>
      <div class="btn btn-higher-emissions selected-item d-flex-center border border-1 m-1 rounded-2" data-value="rcp85">
        <div class="inner-higher-emissions ps-3 pe-3 pt-2 pb-2 me-2 rounded-2"></div>
        Higher Emissions
      </div>
    </div>
    <div id="monthly-select-wrapper" class="d-flex-center flex-wrap mb-2 d-none">
      <div class="btn selected-item d-flex-center border border-1 m-1 rounded-2" data-value="2025">
        2010-2040 average
      </div>
      <div class="btn default-selection d-flex-center border border-1 m-1 rounded-2" data-value="2050">
        2035-2065 average
      </div>
      <div class="btn default-selection d-flex-center border border-1 m-1 rounded-2" data-value="2075">
        2060-2090 average
      </div>
    </div>

    <div id="chart-info-row" class="d-flex-row flex-justify padding-bottom-half d-flex-left d-none">
      ${chart_explainer(config)}
    </div>
  </div>
  ${nav_footer(config)}
  ${footer(config)}
  <script src="https://cdnjs.cloudflare.com/ajax/libs/core-js/2.6.11/core.min.js"
          integrity="sha512-TfdDRAa9DmMqSYW/UwWmezKavKBwQO1Ek/JKDTnh7dLdU3kAw31zUS2rtl6ulgvGJWkMEPaR5Heu5nA/Aqb49g==" crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/plotly.js/1.58.4/plotly-basic.min.js"
          integrity="sha512-7S1p+6A2VVIWu+EevZqeqXWos1Tn+mroZxpkZ9THWipecJkL7TLg2myv5cIAShu9j3+fjHyCvEh/d7BKegMY1g==" crossorigin="anonymous"></script>
  <script>
    window.climate_by_location_config = {areas_json_url: 'https://crt-climate-explorer.nemac.org/data/ce_areas.json'}
  </script>
  <script type="text/javascript" src="/vendor/climate_by_location.climate_explorer.bundle.js"></script>
  <script src="https://unpkg.com/terraformer@1.0.8/terraformer.js" integrity="sha384-+M797Pj3WZVCwMmLbOxAoaWYcKJo8NSxItmI48ytcLNeAnfn1d/IckFn31jEqrzP"
          crossorigin="anonymous"></script>
  <script src="https://unpkg.com/terraformer-arcgis-parser@1.0.5/terraformer-arcgis-parser.js"
          integrity="sha384-duFUjKTSNoxEspdJNwr83CUgRxclf0ueKJB9DU/Vbit6bfWgzvZsHW6H1JLBBXhp" crossorigin="anonymous"></script>
  <script type="${config.env === 'dev' ? 'module' : 'text/javascript'}" src="/js/climate_graphs.js"></script>
  </body>
  </html>
`
