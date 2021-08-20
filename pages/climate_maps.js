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

    <div class="container-fluid">
    
      <div class="d-flex flex-row"> 
        
        <div class="input-group mb-3 search-input-group rounded-3 border border-1 w-75 me-2">
          <button id="clear-location" class="btn search-icons" type="button"><span class="fas fa-times-circle"></span></button>
          <input id="cards-search-input" class="form-control location-mapper" type="text" placeholder="Enter county or city name" aria-label="Enter county or city name">
        </div>
        
        <div class="dropdown w-25 rounded-3 border border-1 mb-3 stations-dropdown">
            <a class="btn dropdown-toggle w-100" href="#" role="button" id="stations-dropdown-menu" data-bs-toggle="dropdown" aria-expanded="false">
              Stations
            </a>
          
            <ul class="dropdown-menu w-100" aria-labelledby="dropdown">
              <li><a class="dropdown-item" href="#">Station 1</a></li>
              <li><a class="dropdown-item" href="#">Station 2</a></li>
              <li><a class="dropdown-item" href="#">Station 3</a></li>
            </ul>
        </div>
      </div>
    
      <div class="info-section">
          <div class="border border-1 rounded-3"> 
            <div class="m-3 mb-3 btn" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-info-section" aria-expanded="true" aria-controls="collapse-info-section">
                <i class="fas fa-map-marked-alt me-2"></i>
                <span id="default-city-county"></span>
                <span> - </span>
                <span id="default-chart-map-variable" data-value="tmax">Average Daily Maximum Temp (°F)</span>
            </div>
            <div class="row m-3 collapse show" id="collapse-info-section"> 
              
              <div class="d-flex flex-row">
                  <div class="d-flex flex-row align-items-center"> 
                    <div class="dropdown rounded-3 border border-1 me-1 w-100">
                      <a class="btn dropdown-toggle w-100" href="#" role="button" id="stations-dropdown-menu" data-bs-toggle="dropdown" aria-expanded="true">
                        Stations
                      </a>
                    
                      <ul class="dropdown-menu w-100" aria-labelledby="dropdown">
                          ${variable_selector(config)}
                      </ul>
                    </div>
                    <span class="fa fa-question ms-2 me-2" aria-hidden="true"></span>
                  </div>
                  
                  <div class=""> 
                    <div class="btn-group w-100" role="group"> 
                      <input type="radio" class="btn-check" name="graph-map" id="graph-selection" autocomplete="off" data-page="climate_graphs"  data-sel="chartmap-select-vis">
                      <label class="btn btn-secondary ms-1" for="graph-selection">Graph</label>
                      
                      <input type="radio" class="btn-check" name="graph-map" id="map-selection" autocomplete="off" data-page="climate_maps"  data-value="map" data-sel="chartmap-select-vis">
                      <label class="btn btn-primary me-1" for="map-selection">Map</label>
                    </div>
                  </div>
                  
                  <div id="time-wrapper" class="btn-group ms-1 me-1">
                    <input type="radio" class="btn-check" name="annual-season" id="annual-selection" autocomplete="off" data-value="annual" data-sel="time-select-vis">
                    <label class="btn btn-secondary ms-1" for="annual-selection">Annual</label>
                    
                    <input type="radio" class="btn-check" name="annual-season" id="spring-selection" autocomplete="off" data-value="spring" data-sel="time-select-vis">
                    <label class="btn btn-secondary" for="spring-selection">Spring</label>
                    
                    <input type="radio" class="btn-check" name="annual-season" id="summer-selection" autocomplete="off" data-value="summer" data-sel="time-select-vis">
                    <label class="btn btn-secondary" for="summer-selection">Summer</label>
                    
                    <input type="radio" class="btn-check" name="annual-season" id="fall-selection" autocomplete="off" data-value="fall" data-sel="time-select-vis">
                    <label class="btn btn-secondary" for="fall-selection">Fall</label>                  
                    
                    <input type="radio" class="btn-check" name="annual-season" id="winter-selection" autocomplete="off" data-value="winter" data-sel="time-select-vis">
                    <label class="btn btn-secondary me-1" for="winter-selection">Winter</label>
                  </div>
                  
                  <div class="col-12"> 
                  <div class="dropdown rounded-3 border border-1 me-1">
                    <a class="btn dropdown-toggle w-100" href="#" role="button" id="stations-dropdown-menu" data-bs-toggle="dropdown" aria-expanded="false">
                      Downloads
                    </a>
                  
                    <ul class="dropdown-menu w-100" aria-labelledby="dropdown">
                      <li><a class="dropdown-item" href="#">Station 1</a></li>
                      <li><a class="dropdown-item" href="#">Station 2</a></li>
                      <li><a class="dropdown-item" href="#">Station 3</a></li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div class="col-3 p-0">   
                <div class="col-12 d-flex flex-row align-items-center"> 
                  <div class="dropdown rounded-3 border border-1 me-1 w-100">
                    <a class="btn dropdown-toggle w-100" href="#" role="button" id="stations-dropdown-menu" data-bs-toggle="dropdown" aria-expanded="true">
                      Stations
                    </a>
                  
                    <ul class="dropdown-menu w-100" aria-labelledby="dropdown">
                        ${variable_selector(config)}
                    </ul>
                  </div>
                  <span class="fa fa-question ms-2 me-2" aria-hidden="true"></span>
                </div>
                  
              </div>

              <div class="col-2 p-0"> 
                <div class="col-12"> 
                  <div class="btn-group w-100" role="group"> 
                    <input type="radio" class="btn-check" name="graph-map" id="graph-selection" autocomplete="off" data-page="climate_graphs"  data-sel="chartmap-select-vis">
                    <label class="btn btn-secondary ms-1" for="graph-selection">Graph</label>
                    
                    <input type="radio" class="btn-check" name="graph-map" id="map-selection" autocomplete="off" data-page="climate_maps"  data-value="map" data-sel="chartmap-select-vis">
                    <label class="btn btn-primary me-1" for="map-selection">Map</label>
                  </div>
                </div>
              </div>
              
              <div class="col-5 p-0"> 
                <div id="time-wrapper" class="col-12 btn-group ms-1 me-1">
                  <input type="radio" class="btn-check" name="annual-season" id="annual-selection" autocomplete="off" data-value="annual" data-sel="time-select-vis">
                  <label class="btn btn-secondary ms-1" for="annual-selection">Annual</label>
                  
                  <input type="radio" class="btn-check" name="annual-season" id="spring-selection" autocomplete="off" data-value="spring" data-sel="time-select-vis">
                  <label class="btn btn-secondary" for="spring-selection">Spring</label>
                  
                  <input type="radio" class="btn-check" name="annual-season" id="summer-selection" autocomplete="off" data-value="summer" data-sel="time-select-vis">
                  <label class="btn btn-secondary" for="summer-selection">Summer</label>
                  
                  <input type="radio" class="btn-check" name="annual-season" id="fall-selection" autocomplete="off" data-value="fall" data-sel="time-select-vis">
                  <label class="btn btn-secondary" for="fall-selection">Fall</label>                  
                  
                  <input type="radio" class="btn-check" name="annual-season" id="winter-selection" autocomplete="off" data-value="winter" data-sel="time-select-vis">
                  <label class="btn btn-secondary me-1" for="winter-selection">Winter</label>
                </div>
              </div>
              
              <div class="col-2 p-0"> 
                <div class="col-12"> 
                  <div class="dropdown rounded-3 border border-1 me-1">
                    <a class="btn dropdown-toggle w-100" href="#" role="button" id="stations-dropdown-menu" data-bs-toggle="dropdown" aria-expanded="false">
                      Downloads
                    </a>
                  
                    <ul class="dropdown-menu w-100" aria-labelledby="dropdown">
                      <li><a class="dropdown-item" href="#">Station 1</a></li>
                      <li><a class="dropdown-item" href="#">Station 2</a></li>
                      <li><a class="dropdown-item" href="#">Station 3</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div> 
      </div>
    </div>

    <div id="climate-maps-viewport" class="padding-horizontal d-flex d-flex-column">

      <div id="info-row" class="padding-vertical padding-horizontal width-100" >
        <div class="rounded-filters-box padding-default width-100">

          <div id="filters-row" class="d-flex-row flex-justify padding-top d-flex-left" >

            <div id="variable-select-wrapper" class="rounded-choice-box padding-horizontal-half padding-vertical-half default-btn-height d-flex-center width-30">
              ${variable_selector(config)}
            </div>
            <span id="select-tip-holder">
              <span tabindex="100" data-value="select-tip" id="select-tip" class="fas fa-question padding-horizontal-half select-tip" data-tippy-content="
                <strong>Average Daily Maximum Temperature (°F)</strong><hr/>
                A day's highest (maximum) temperature usually occurs in the afternoon. Averaging the daily high temperatures over any period results in a mean maximum temperature for that period.
                <br />
                <br />
                Maximum temperature serves as one measure of comfort and safety for people and for the health of plants and animals. When maximum temperature exceeds particular thresholds, people can become ill and transportation and energy infrastructure may be stressed.">
              </span>
            </span>

            <div id="chartmap-wrapper" class="padding-horizontal-half padding-vertical-half default-btn-height d-flex-center width-15 disabled">
              <div tabindex="100" role="button" class="btn-selector btn-chart btn-default circle-box-left d-flex-center width-50" data-value="chart" data-page="climate_graphs"  data-sel="chartmap-select-vis">
                Graph
              </div>
              <div tabindex="101" role="button" class="btn-selector btn-map btn-default-selected circle-box-right d-flex-center width-50"  data-page="climate_maps"  data-value="map" data-sel="chartmap-select-vis">
                Map
              </div>
            </div>

            <div id="chartmap-select-wrapper" class="rounded-choice-box padding-left-half padding-vertical-half default-btn-height d-flex-center width-15">
              <div class="select chartmap-select">
                <div tabindex="102" id="chartmap-select-vis" class="select-styled" data-value="chart">Map</div>
                <ul class="select-options">
                  <li tabindex="103" id="chartmap-select-chart-link" data-value="chart" class="default-select-option" data-page="climate_graphs"  >Chart</li>
                  <li tabindex="104" id="chartmap-select-map-link" data-value="map" class="default-select-option" data-page="climate_maps" >Map</li>
                </ul>
              </div>
            </div>

            <div id="time-wrapper" class="padding-horizontal-half padding-vertical-half default-btn-height d-flex-center width-30">
              <div tabindex="105" role="button" class="btn-selector btn-annual btn-default-selected circle-box-left d-flex-center width-50" data-value="annual" data-sel="time-select-vis">
                Annual
              </div>
              <div tabindex="106" role="button" class="btn-selector btn-spring btn-default circle-box-middle d-flex-center width-50" data-value="spring" data-sel="time-select-vis" >
                Spring
              </div>
              <div tabindex="107" role="button" class="btn-selector btn-summer btn-default circle-box-middle d-flex-center width-50" data-value="summer" data-sel="time-select-vis" >
                Summer
              </div>
              <div tabindex="108" role="button" class="btn-selector btn-fall btn-default circle-box-middle d-flex-center width-50" data-value="fall" data-sel="time-select-vis" >
                Fall
              </div>
              <div tabindex="109" role="button" class="btn-selector btn-winter btn-default circle-box-right d-flex-center width-50" data-value="winter" data-sel="time-select-vis" >
                Winter
              </div>
            </div>

            <div id="time-select-wrapper" class="rounded-choice-box padding-horizontal-half padding-vertical-half default-btn-height d-flex-center width-20">
              <div class="select time-select">
                <div tabindex="110" id="time-select-vis" class="select-styled" data-value="Annual">Annual</div>
                <ul class="select-options">
                  <li tabindex="111" data-value="annual" class="default-select-option">Annual</li>
                  <li tabindex="112" data-value="spring" class="default-select-option">Spring</li>
                  <li tabindex="113" data-value="summer" class="default-select-option">Summer</li>
                  <li tabindex="114" data-value="fall" class="default-select-option">Fall</li>
                  <li tabindex="115" data-value="winter" class="default-select-option">Winter</li>
                </ul>
              </div>
            </div>

            <div id="downloads-select-wrapper" class="rounded-choice-box padding-left-half padding-vertical-half default-btn-height d-flex-center">

              <div tabindex="116" class="select download-select">
                <div tabindex="116" id="downloads-select-vis" class="select-styled" data-value="none" href="javascript:void(0);">
                  <i class="fas fa-download select-icon"></i>
                  <a tabindex="116" data-value="none" class="download-link-main long-desc" href="javascript:void(0);" >Downloads</a>
                  <a tabindex="116" data-value="none" class="download-link-main short-desc" href="javascript:void(0);" >Down</a>
                </div>
                <ul class="select-options" style="display: none;">
                  <li data-value="download-lefttmap-image" data-icon="fas fa-download select-icon" href="javascript:void(0);" class="default-select-option">
                    <a tabindex="117" data-value="download-lefttmap-image" class="download-link" href="javascript:void(0);" >Download left map as image</a>
                  </li>
                  <li data-value="download-rightmap-image" data-icon="fas fa-download select-icon" href="javascript:void(0);" class="default-select-option">
                    <a tabindex="118" data-value="download-rightmap-image" class="download-link" href="javascript:void(0);" >Download right map as image</a>
                  </li>
                </ul>
              </div>
            </div>

          </div>


        </div>
      </div>

      <div id="map-for-print-left" class="d-off d-none"></div>
      <div id="map-for-print-right" class="d-off d-none"></div>

      <div id="map-row" class="padding-horizontal padding-top-half width-100 height-100 d-flex" >

          <div id="map-wrap" class="map-wrap width-100 height-100 ">
            <div id="local-climate-map-element" class="map-element"></div>
            <div id="map-message" class="map-nodata-message d-none"></div>
          </div>

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
