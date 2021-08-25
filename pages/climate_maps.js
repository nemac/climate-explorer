import head from '../template/head'
import secondary_header from '../template/secondary_header';
import variable_selector from '../template/variable_selector';
import footer from '../template/footer';
import nav_footer from '../template/nav_footer';

export default (config) => `
<!doctype html>
<html lang='en' class="width-100 height-100">
<head>
  ${head(config)}
  <meta property="fb:app_id" content="187816851587993">
  <meta property="og:url" content="/">
  <meta property="og:type" content="article">
  <meta property="og:title" content="Location data for Buncombe County, NC">
  <meta property="og:description" content="The Climate Explorer allows you to view historical and projected climate variables and assess the impacts of climate change on the things you care about">
  <meta property="og:image" content="/img/og.jpg">
</head>

<body>

  ${secondary_header(config)}

    <div class="container-fluid top-spacing mb-3">
    
      <div class="d-flex flex-row"> 
        
        <div class="input-group mb-3 search-input-group rounded-3 border border-1 w-75 me-2">
          <button id="clear-location" class="btn search-icons" type="button"><span class="fas fa-times-circle"></span></button>
          <input id="cards-search-input" class="form-control location-mapper" type="text" placeholder="Enter county or city name" aria-label="Enter county or city name">
        </div>
        
        <div class="dropdown w-25 rounded-3 border border-1 mb-3 stations-dropdown">
            <a class="btn dropdown-toggle w-100" href="#" role="button" id="stations-dropdown-menu" data-bs-toggle="dropdown" aria-expanded="false">
              Stations
            </a>
          
            <ul class="dropdown-menu w-100" aria-labelledby="stations-dropdown-menu">
              <li><a class="dropdown-item" href="#">Station 1</a></li>
              <li><a class="dropdown-item" href="#">Station 2</a></li>
              <li><a class="dropdown-item" href="#">Station 3</a></li>
            </ul>
        </div>
      </div>
    
      <div class="info-section">
          <div class="border border-1 rounded-3"> 
            <div class="m-3 mb-3 btn p-0" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-info-section" aria-expanded="true" aria-controls="collapse-info-section">
                <i class="fas fa-map-marked-alt me-2"></i>
                <span id="default-city-county"></span>
                <span> - </span>
                <span id="default-chart-map-variable" data-value="tmax">Average Daily Maximum Temp (°F)</span>
            </div>
            <div class="m-3 collapse show" id="collapse-info-section"> 
              
              <div class="d-flex flex-row">
                  <div class="d-flex flex-row align-items-center"> 
                    <div class="dropdown variable-select rounded-3 border border-1 me-2 w-100">
                      <a class="btn dropdown-toggle w-100" href="#" role="button" id="filter-dropdown-menu" data-bs-toggle="dropdown" aria-expanded="true">
                        Average Daily Maximum Temperature (°F)
                      </a>
                    
                      <div class="dropdown-menu filter-dropdown-menu" aria-labelledby="filter-dropdown-menu">
                         <div class="d-flex">
                             ${variable_selector(config)}
                         </div>
                      </div>
                      <!--<ul class="dropdown-menu variable-select w-100" aria-labelledby="filter-dropdown-menu">
                          ${variable_selector(config)}
                      </ul>-->
                    </div>
                    <span id="filter-tooltip" class="fa fa-question d-flex justify-content-center align-items-center" aria-hidden="true"></span>
                  </div>
                  
                  <div class="ms-2 me-2"> 
                    <div class="btn-group border rounded-3 graph-map-selection" role="group"> 
                      <input type="radio" class="btn-check" name="graph-map" id="graph-selection" autocomplete="off" data-page="climate_graphs"  data-sel="chartmap-select-vis">
                      <label class="btn ps-4 pe-4 default-selection" for="graph-selection">Graph</label>
                      
                      <input type="radio" class="btn-check" name="graph-map" id="map-selection" autocomplete="off" data-page="climate_maps"  data-value="map" data-sel="chartmap-select-vis">
                      <label class="btn ps-4 pe-4 selected-item" for="map-selection">Map</label>
                    </div>
                  </div>
                  
                  <div id="time-wrapper" class="btn-group">
                    <input type="radio" class="btn-check" name="annual-season" id="annual-selection" autocomplete="off" data-value="annual" data-sel="time-select-vis">
                    <label class="btn ps-4 pe-4 selected-item" for="annual-selection">Annual</label>
                    
                    <input type="radio" class="btn-check" name="annual-season" id="spring-selection" autocomplete="off" data-value="spring" data-sel="time-select-vis">
                    <label class="btn ps-4 pe-4 default-selection" for="spring-selection">Spring</label>
                    
                    <input type="radio" class="btn-check" name="annual-season" id="summer-selection" autocomplete="off" data-value="summer" data-sel="time-select-vis">
                    <label class="btn ps-4 pe-4 default-selection" for="summer-selection">Summer</label>
                    
                    <input type="radio" class="btn-check" name="annual-season" id="fall-selection" autocomplete="off" data-value="fall" data-sel="time-select-vis">
                    <label class="btn ps-4 pe-4 default-selection" for="fall-selection">Fall</label>                  
                    
                    <input type="radio" class="btn-check" name="annual-season" id="winter-selection" autocomplete="off" data-value="winter" data-sel="time-select-vis">
                    <label class="btn ps-4 pe-4 default-selection" for="winter-selection">Winter</label>
                  </div>
                  
                  <div class="ms-2 me-2 download-dropdown"> 
                    <div class="dropdown rounded-3 border border-1">
                      <a class="btn dropdown-toggle ps-4 pe-4 w-100" href="#" role="button" id="download-dropdown-menu" data-bs-toggle="dropdown" aria-expanded="false">
                          <span class="fas fa-download select-icon"></span>
                          Downloads
                        </a>
                    
                      <ul class="dropdown-menu download-select" aria-labelledby="download-dropdown-menu">
                        <li class="dropdown-item default-select-option" data-value="download-lefttmap-image" data-icon="fas fa-download select-icon" href="javascript:void(0);">
                          <a data-value="download-lefttmap-image" class="download-link" href="javascript:void(0);" >Download left map as image</a>
                        </li>
                        
                        <li class="dropdown-item default-select-option" data-value="download-rightmap-image" data-icon="fas fa-download select-icon" href="javascript:void(0);">
                          <a data-value="download-rightmap-image" class="download-link" href="javascript:void(0);" >Download right map as image</a>
                        </li>
                      </ul>
                    </div>
                </div>
              </div>
              
            </div>
          </div> 
      </div>
    
    </div>
    
    <div id="climate-maps-viewport">
  
        <div id="info-row" class="width-100">
        </div>
  
        <div id="map-for-print-left" class="d-off d-none"></div>
        <div id="map-for-print-right" class="d-off d-none"></div>
  
        <div id="map-row" class="padding-horizontal w-100 d-flex">
  
            <div id="map-element" class="d-flex w-100"> 
              <div id="local-climate-map-element" class="map-element p-0"></div>
              <div id="map-message" class="map-nodata-message d-none"></div>
            </div>

        </div>
  
      </div>


${nav_footer(config)}
${footer(config)}
<script src="https://unpkg.com/terraformer@1.0.8/terraformer.js" integrity="sha384-+M797Pj3WZVCwMmLbOxAoaWYcKJo8NSxItmI48ytcLNeAnfn1d/IckFn31jEqrzP"
        crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js" integrity="sha256-c3RzsUWg+y2XljunEQS0LqWdQ04X1D3j22fd/8JCAKw=" crossorigin="anonymous"></script>
<!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.5.0-beta4/html2canvas.min.js" integrity="sha256-w6/1B0uwkpR3uX0YUw3k2zzHnq6xDNdVZHLIdz8xV6I=" crossorigin="anonymous"></script> -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.js" integrity="sha256-Tw0/gX6aFDMese6GHQJFL/ZjF+f7edyF9okFVY/B9oU=" crossorigin="anonymous"></script>
<script src="https://unpkg.com/terraformer-arcgis-parser@1.0.5/terraformer-arcgis-parser.js"
        integrity="sha384-duFUjKTSNoxEspdJNwr83CUgRxclf0ueKJB9DU/Vbit6bfWgzvZsHW6H1JLBBXhp" crossorigin="anonymous"></script>
<script type="${config.env === 'dev'? 'module':  'text/javascript'}" src="/js/climate_maps.js"></script>

</body>
</html>
`
