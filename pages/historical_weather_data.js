import head from '../template/head'
import secondary_header from '../template/nav_header';
import footer from '../template/footer';
import nav_footer from '../template/nav_footer';

// language=HTML
export default (config) => `
<!doctype html>
<html lang='en' class="h-100">
<head>
  ${head(config)}
  <meta property="fb:app_id" content="187816851587993">
  <meta property="og:url" content="historical_weather_data">
  <meta property="og:type" content="article">
  <meta property="og:title" content="Location data for Buncombe County, NC">
  <meta property="og:description" content="The Climate Explorer allows you to view historical and projected climate variables and assess the impacts of climate change on the things you care about">
  <meta property="og:image" content="/img/og.jpg">
</head>

<body class="h-100">

  ${secondary_header(config)}

<div class="container-fluid d-flex-column body-size h-100">
  
      <div class="mt-2 row search-station-row"> 
            
          <div class="col-12 col-md-7 col-lg-8"> 
            <div class="input-group search-input-group rounded-2 border border-1 me-2">
              <button id="clear-location" class="btn search-icons" type="button"><span class="fas fa-times-circle"></span></button>
              <input id="cards-search-input" class="form-control location-mapper" type="text" placeholder="Enter county or city name" aria-label="Enter county or city name">
            </div>
          </div>

          <div class="col-12 col-md-5 col-lg-4"> 
            <div class="dropdown rounded-2 border border-1 stations-dropdown">
                <a class="btn dropdown-toggle w-100 d-flex justify-content-between align-items-center" href="#" role="button" id="stations-dropdown-menu" data-bs-toggle="dropdown" aria-expanded="false">
                  Stations
                </a>
              
                <ul class="dropdown-menu stations-dropdown-ul w-100" aria-labelledby="stations-dropdown-menu">
                </ul>
            </div>
          </div>
          
      </div>
      
      <div class="info-section mt-2">
          <div class="border border-1 rounded-2"> 
            
            <div class="m-2"> 
              <span id="station-info-none"><strong>Please select a station on the map or from the Stations dropdown menu. You may need to zoom out to see more stations.</strong></span>
              <span id="station-info" class="d-none">
                <span id="default-station-label" class="text-info-box label">Station id: </span>
                <span id="default-station" class="text-info-box data right-padding" ></span>
                <span id="default-station-id-label" class="text-info-box label">Station: </span>
                <span id="default-station-id" class="text-info-box data right-padding" ></span>
              </span>
            </div>
            
            <div class="m-2 collapse show" id="collapse-info-section"> 
              
              <div class="row">
                  
                  <div class="col-md-12 col-lg-6 col-xl-2 mt-1 mb-1 info-section"> 
                    <div class="btn-group border rounded-2 graph-map-selection w-100" role="group"> 
                      <label class="btn ps-4 pe-4 default-selection disabled" id="chartmap-select-chart-link" data-value="chart"  data-page="historical_weather_data" data-sel="chartmap-select-vis">Graph</label>
                      <label class="btn ps-4 pe-4 selected-item" id="chartmap-select-map-link" data-page="historical_weather_data"  data-value="map" data-sel="chartmap-select-vis">Map</label>
                    </div>
                  </div>
                   
                  <div class="col-md-12 col-lg-6 col-xl-1 download-dropdown mt-1 mb-1 info-section"> 
                    <div class="dropdown rounded-2 border border-1">
                      <a class="btn dropdown-toggle ps-4 pe-4 w-100 disabled" href="#" style="text-align: center;" role="button" id="download-dropdown-menu" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class="fas fa-download select-icon"></span>
                        Downloads
                      </a>
                    
                      <ul class="dropdown-menu download-select" aria-labelledby="download-dropdown-menu">
                        <div data-icon="fas fa-temperature-high select-icon" class="d-flex ms-3 select-icon">
                          <i class="fas fa-temperature-high me-2"></i>Temperature
                        </div>
                        <li data-value="download-temperature-image" data-icon="fas fa-download select-icon" href="javascript:void(0);">
                          <a data-value="download-temperature-image" class="dropdown-item" href="javascript:void(0);" >Download temperature image</a>
                        </li>
                        <li data-value="download-temperature-data" data-icon="fas fa-download select-icon" href="javascript:void(0);" class="mb-2">
                          <a data-value="download-temperature-data" class="dropdown-item" href="javascript:void(0);" >Download temperature data</a>
                        </li>
                        <div data-icon="fas fa-cloud-rain select-icon" class="d-flex ms-3 select-icon">
                          <i class="fas fa-cloud-rain me-2"></i>Precipitation
                        </div>
                        <li data-value="download-image" data-icon="fas fa-download select-icon" href="javascript:void(0);">
                          <a data-value="download-precipitation-image" class="dropdown-item" href="javascript:void(0);" >Download precipitation image</a>
                        </li>
                        <li data-value="download-precipitation-observed-data" data-icon="fas fa-download select-icon" href="javascript:void(0);">
                          <a data-value="download-precipitation-data" class="dropdown-item" href="javascript:void(0);" >Download precipitation data</a>
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
  
      <div id="historical-weather-data-viewport" class="graph-body d-flex d-flex-column mt-2">
          <div id="stations-map-row" class="padding-top-half w-100 h-100 d-flex" style="position: relative;">
            <div id="stations-map-wrap" class="map-wrap w-100 h-100">
              <div id="stations-map" class="map-element h-100"></div>
              <div id="stations-map-message" class="pt-2 pb-2 pe-1 ps-1 rounded-2 d-none"></div>
            </div>
          </div>
         
          <div id="stations-graph-row" class="h-100 w-100" >
            <div id="stations-graph-wrap" class="d-flex-row w-100 h-100">
              <div id="multi-chart" class="chart-body left_chart col-12 col-lg-6 h-100"></div>
              <div id="multi-precip-chart" class="chart-body right_chart col-12 col-lg-6 h-100"></div>
            </div>
          </div>
      
      </div>
  
      <div id="station-info-row" class="d-flex-row flex-justify padding-bottom d-flex-left d-none">
        <div class="modal fade" id="aboutModal" tabindex="-1" aria-labelledby="aboutModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-fullscreen-md-down modal-xl">
          <div class="modal-content p-3">
            <div class="modal-header">
              <h3 class="modal-title" id="aboutModalLabel">READING THE HISTORICAL WEATHER CHARTS</h3>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
            
                <div class="mb-2"> 
                Blue bars on temperature graphs indicate the range of observed temperatures for each day; the green band shows Climate Normals for temperature—the average temperature range at that station from 1981-2010. Blue areas on precipitation graphs track year-to-date cumulative precipitation; the black line shows Climate Normals for precipitation. Data from <a target="_blank" href="https://www.ncdc.noaa.gov/data-access/land-based-station-data/land-based-datasets/global-historical-climatology-network-ghcn">Global Historical Climatology Network-Daily dataset</a>, served by <a target="_blank" href="http://www.rcc-acis.org/">ACIS</a>.
                </div>
                <div>
                Pan or zoom on these graphs to view other years. Place your cursor on either axis and then scroll, click-and-drag, or hold down your SHIFT key and scroll to adjust the display.
                </div>
            
            </div>
          </div>
        </div>
      </div>
    </div>
</div>


${nav_footer(config)}
${footer(config)}

<script src="https://unpkg.com/terraformer@1.0.8/terraformer.js" integrity="sha384-+M797Pj3WZVCwMmLbOxAoaWYcKJo8NSxItmI48ytcLNeAnfn1d/IckFn31jEqrzP"
crossorigin="anonymous"></script>
<script src="https://unpkg.com/terraformer-arcgis-parser@1.0.5/terraformer-arcgis-parser.js"
integrity="sha384-duFUjKTSNoxEspdJNwr83CUgRxclf0ueKJB9DU/Vbit6bfWgzvZsHW6H1JLBBXhp" crossorigin="anonymous"></script>
<script src="/vendor/multigraph.min.js"></script>
<script type="${config.env === 'dev' ? 'module' : 'text/javascript'}" src="/js/historical_weather_data.js"></script>

</body>
</html>
`
