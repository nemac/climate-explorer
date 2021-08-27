import head from '../template/head'
import secondary_header from '../template/secondary_header';
import variable_selector from '../template/variable_selector';
import footer from '../template/footer';
import nav_footer from '../template/nav_footer';
import chart_explainer from '../template/chart_explainer';

export default (config) => `
<!doctype html>
<html lang='en' class="width-100 height-100">
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

<div class="container-fluid top-spacing">

  <div class="d-flex flex-row"> 
        
    <div class="input-group mb-3 search-input-group rounded-3 border border-1 w-75 me-2">
      <button id="clear-location" class="btn search-icons" type="button"><span class="fas fa-times-circle"></span></button>
      <input id="cards-search-input" class="form-control location-mapper" type="text" placeholder="Enter county or city name" aria-label="Enter county or city name">
    </div>
    
    <div class="dropdown w-25 rounded-3 border border-1 mb-3 stations-dropdown">
        <a class="btn dropdown-toggle disabled w-100" href="#" role="button" id="stations-dropdown-menu" data-bs-toggle="dropdown" aria-expanded="false">
          Stations
        </a>
      
        <ul class="dropdown-menu w-100" aria-labelledby="stations-dropdown-menu">
          <li><a class="dropdown-item" href="#">Station 1</a></li>
        </ul>
    </div>
  </div>

  <div class="info-section">
      <div class="border border-1 rounded-3"> 
        
        <div class="m-3 mb-3 btn p-0" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-info-section" aria-expanded="true" aria-controls="collapse-info-section">
            <i class="fas fa-chart-line me-2"></i>
            <span id="default-city-county"></span>
            <span> - </span>
            <span id="default-chart-map-variable" data-value="tmax">Average Daily Maximum Temp (°F)</span>
        </div>
        
        <div class="m-3 collapse show" id="collapse-info-section"> 
          
          <div class="d-flex flex-row">
              <div class="d-flex flex-row align-items-center"> 
                <div class="dropdown rounded-3 border border-1 me-2 w-100">
                  <a class="btn dropdown-toggle w-100" href="#" id="filter-dropdown-menu" data-bs-toggle="dropdown" aria-expanded="true" data-value="tmax">
                    Average Daily Maximum Temperature (°F)
                  </a>
                
                  <div class="dropdown-menu filter-dropdown-menu p-2" aria-labelledby="filter-dropdown-menu">
                     <div class="d-lg-flex">
                        ${variable_selector(config)}
                     </div>
                  </div>
                </div>
                <span id="filter-tooltip" class="fa fa-question d-flex justify-content-center align-items-center" aria-hidden="true"></span>
              </div>
              
              <div class="ms-2 me-2"> 
                <div class="btn-group border rounded-3 graph-map-selection" role="group"> 
                  <input type="radio" class="btn-check" name="graph-map" id="graph-selection" autocomplete="off" data-page="climate_graphs"  data-sel="chartmap-select-vis">
                  <label class="btn ps-4 pe-4 selected-item" for="graph-selection">Graph</label>
                  
                  <input type="radio" class="btn-check" name="graph-map" id="map-selection" autocomplete="off" data-page="climate_maps"  data-value="map" data-sel="chartmap-select-vis">
                  <label class="btn ps-4 pe-4 default-selection" for="map-selection">Map</label>
                </div>
              </div>
               
              <div id="time-wrapper" class="btn-group">
                <!--<input type="radio" class="btn-check" name="annual-season" id="annual-selection" autocomplete="off" data-value="annual" data-sel="time-select-vis">-->
                <label id="annual-selection-label" class="btn ps-4 pe-4 selected-item" for="annual-selection" data-value="annual" data-sel="time-select-vis">Annual</label>
                
                <!--<input type="radio" class="btn-check" name="annual-season" id="spring-selection" autocomplete="off" data-value="monthly" data-sel="time-select-vis">-->
                <label id="monthly-selection-label" class="btn ps-4 pe-4 default-selection" for="spring-selection" data-value="monthly" data-sel="time-select-vis">Monthly</label>
              </div>
              
              <div class="ms-2 me-2 download-dropdown"> 
                <div class="dropdown rounded-3 border border-1">
                  <a class="btn dropdown-toggle ps-4 pe-4 w-100" href="#" role="button" id="download-dropdown-menu" data-bs-toggle="dropdown" aria-expanded="false">
                      <span class="fas fa-download select-icon"></span>
                      Downloads
                    </a>
                
                  <ul class="dropdown-menu download-select" aria-labelledby="download-dropdown-menu">
                    <li id="download-image" data-value="download-image" data-icon="fas fa-download select-icon" href="javascript:void(0);" class="default-select-option">
                      <a tabindex="109" data-value="download-image" class="download-link" href="javascript:void(0);">Chart image (.png)</a>
                    </li>
                    <li id="download-observed-data" data-value="download-observed-data" data-icon="fas fa-download select-icon" href="javascript:void(0);"
                        class="default-select-option">
                      <a tabindex="109" data-value="download-observed-data" class="download-link" href="javascript:void(0);">Observations (.csv)</a>
                    </li>
                    <li id="download-historical-modeled-data" data-value="download-historical-modeled-data" data-icon="fas fa-download select-icon" href="javascript:void(0);"
                        class="default-select-option">
                      <a tabindex="109" data-value="download-historical-modeled-data" class="download-link" href="javascript:void(0);">Modeled History (.csv)</a>
                    </li>
                    <li id="download-projected-modeled-data" data-value="download-projected-modeled-data" data-icon="fas fa-download select-icon" href="javascript:void(0);"
                        class="default-select-option">
                      <a tabindex="109" data-value="download-projected-modeled-data" class="download-link" href="javascript:void(0);">Projections (.csv)</a>
                    </li>
                    <li id="download-interpreting" data-value="download-interpreting" data-icon="fas fa-download select-icon" class="default-select-option">
                      <a tabindex="109" data-value="download-interpreting" class="download-link" href="https://crt-climate-explorer.nemac.org/data/Climate-Explorer--Documentation-for-Downloads.xlsx">Documentation for Downloads (.xlsx)</a>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div tabindex="110" id="chart-info-row-btn" class="rounded-choice-box padding-left-half padding-vertical-half default-btn-height d-flex-center">
                <div class="more-info btn-default padding-left-half">
                  <span class="fas fa-info more-info more-icon"></span>
                  <span class="fas fa-info more-info less-icon d-none"></span>
                  <span class="more short-desc">About</span>
                  <span class="more long-desc">How to read</span>
                  <span class="more long-desc d-none">How to read</span>
                  <span class="more short-desc d-none">About</span>
                </div>
              </div>
          </div>
          
        </div>
      </div> 
  </div>

  <div id="chart-row" class="padding-horizontal padding-top-half padding-bottom-half d-flex-column flex-justify">

    <div id="chart-wrap" class="chart-wrap d-flex d-flex-center width-100">
      <div id="chart-123" class="chart-canvas width-100 height-100" data-chart-ID="123"></div>
      <div id="chart-message" class="chart-nodata-message d-none"></div>
    </div>

    <div id="legend-wrapper" class="padding-horizontal-half default-btn-height d-flex-center">
      <div role="button" tabindex="111" class="btn-selector btn-histobs d-flex-center width-50" data-value="histobs">
        Observations
        <div class="inner-histobs"></div>
      </div>
      <div role="button" tabindex="112" class="btn-selector btn-histmod selected d-flex-center width-50" data-value="histmod">
        Modeled History
        <div class="inner-histmod"></div>
      </div>
      <div role="button" tabindex="113" class="btn-selector btn-lower-emissions selected  d-flex-center width-50" data-value="rcp45">
        Lower Emissions
        <div class="inner-lower-emissions"></div>
      </div>
      <div role="button" tabindex="40" class="btn-selector btn-higher-emissions selected d-flex-center width-50" data-value="rcp85">
        Higher Emissions
        <div class="inner-higher-emissions"></div>
      </div>
    </div>

    <div id="monthly-select-wrapper" class="padding-horizontal-half padding-vertical-half default-btn-height d-none width-60">
      <div role="button" tabindex="114" class="btn-selector btn-default-selected d-flex-center width-33" data-value="2025">
        2010-2040 average
      </div>
      <div role="button" tabindex="115" class="btn-selector btn-default d-flex-center width-33" data-value="2050">
        2035-2065 average
      </div>
      <div role="button" tabindex="116" class="btn-selector btn-default d-flex-center width-33" data-value="2075">
        2060-2090 average
      </div>
    </div>
  </div>

  <div tabindex="117" id="chart-info-row" class="d-flex-row flex-justify padding-bottom-half d-flex-left d-none">
    ${chart_explainer(config)}
  </div>

</div>
</div>

${nav_footer(config)}
${footer(config)}

<script src="https://cdnjs.cloudflare.com/ajax/libs/core-js/2.6.11/core.min.js"
        integrity="sha512-TfdDRAa9DmMqSYW/UwWmezKavKBwQO1Ek/JKDTnh7dLdU3kAw31zUS2rtl6ulgvGJWkMEPaR5Heu5nA/Aqb49g==" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/plotly.js/1.58.4/plotly-basic.min.js" integrity="sha512-7S1p+6A2VVIWu+EevZqeqXWos1Tn+mroZxpkZ9THWipecJkL7TLg2myv5cIAShu9j3+fjHyCvEh/d7BKegMY1g==" crossorigin="anonymous"></script>
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
