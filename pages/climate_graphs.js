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

<div class="container-fluid climate-graphs-body">

  <div class="d-flex flex-row mt-3"> 
        
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
          
          <div class="row">
              <div class="col-md-12 col-lg-8 col-xl-3 d-flex flex-row align-items-center mt-1 mb-1" style="text-align: center;"> 
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
              
              <div class="col-md-12 col-lg-4 col-xl-2 mt-1 mb-1" style="text-align: center;"> 
                <div class="btn-group border rounded-3 graph-map-selection w-100" role="group"> 
                  <input type="radio" class="btn-check" name="graph-map" id="graph-selection" autocomplete="off" data-page="climate_graphs"  data-sel="chartmap-select-vis">
                  <label class="btn ps-4 pe-4 selected-item" for="graph-selection">Graph</label>
                  
                  <input type="radio" class="btn-check" name="graph-map" id="map-selection" autocomplete="off" data-page="climate_maps"  data-value="map" data-sel="chartmap-select-vis">
                  <label class="btn ps-4 pe-4 default-selection" for="map-selection">Map</label>
                </div>
              </div>
               
              <div class="col-md-12 col-lg-4 col-xl-2 btn-group mt-1 mb-1" style="text-align: center;" id="time-wrapper">
                <label id="annual-selection-label" class="btn ps-4 pe-4 selected-item" for="annual-selection" data-value="annual" data-sel="time-select-vis">Annual</label>
                <label id="monthly-selection-label" class="btn ps-4 pe-4 default-selection" for="spring-selection" data-value="monthly" data-sel="time-select-vis">Monthly</label>
              </div>
              
              <div class="col-md-12 col-lg-4 col-xl-2 download-dropdown mt-1 mb-1" style="text-align: center;"> 
                <div class="dropdown rounded-3 border border-1">
                  <a class="btn dropdown-toggle ps-4 pe-4 w-100" href="#" style="text-align: center;" role="button" id="download-dropdown-menu" data-bs-toggle="dropdown" aria-expanded="false">
                      <span class="fas fa-download select-icon"></span>
                      Downloads
                    </a>
                
                  <ul class="dropdown-menu download-select" aria-labelledby="download-dropdown-menu">
                    <li id="download-image" data-value="download-image" data-icon="fas fa-download select-icon" href="javascript:void(0);">
                      <a class="dropdown-item" tabindex="109" data-value="download-image" href="javascript:void(0);">Chart image (.png)</a>
                    </li>
                    <li id="download-observed-data" data-value="download-observed-data" data-icon="fas fa-download select-icon" href="javascript:void(0);">
                      <a class="dropdown-item" tabindex="109" data-value="download-observed-data" href="javascript:void(0);">Observations (.csv)</a>
                    </li>
                    <li id="download-historical-modeled-data" data-value="download-historical-modeled-data" data-icon="fas fa-download select-icon" href="javascript:void(0);">
                      <a class="dropdown-item" tabindex="109" data-value="download-historical-modeled-data" href="javascript:void(0);">Modeled History (.csv)</a>
                    </li>
                    <li id="download-projected-modeled-data" data-value="download-projected-modeled-data" data-icon="fas fa-download select-icon" href="javascript:void(0);">
                      <a class="dropdown-item" tabindex="109" data-value="download-projected-modeled-data" href="javascript:void(0);">Projections (.csv)</a>
                    </li>
                    <li id="download-interpreting" data-value="download-interpreting" data-icon="fas fa-download select-icon">
                      <a class="dropdown-item" tabindex="109" data-value="download-interpreting" href="https://crt-climate-explorer.nemac.org/data/Climate-Explorer--Documentation-for-Downloads.xlsx">Documentation for Downloads (.xlsx)</a>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div class="col-md-12 col-lg-4 col-xl-1 btn chart-info border border-1 mt-1 mb-1" style="text-align: center;" id="chart-info-row-btn" data-bs-toggle="modal" data-bs-target="#aboutModal">
                  <i class="fas fa-info me-2"></i>
                  <span>About</span>
              </div>
          </div>
          
        </div>
      </div> 
  </div>

  <div id="chart-row" class="d-flex-column border border-1 mt-3 rounded-3">

    <div id="chart-wrap" class="chart-wrap d-flex d-flex-center width-100">
      <div id="chart-123" class="chart-canvas width-100 height-100" data-chart-ID="123"></div>
      <div id="chart-message" class="chart-nodata-message d-none"></div>
    </div>

    <div id="legend-wrapper" class="d-flex-center flex-wrap mb-2">
      <div class="btn btn-histobs d-flex-center border border-1 m-1 rounded-3" data-value="histobs">
        <div class="inner-histobs ps-3 pe-3 pt-2 pb-2 me-2 rounded-3"></div>
        Observations
      </div>
      <div class="btn btn-histmod d-flex-center selected-item border border-1 m-1 rounded-3" data-value="histmod">
        <div class="inner-histmod ps-3 pe-3 pt-2 pb-2 me-2 rounded-3"></div>
        Modeled History
      </div>
      <div class="btn btn-lower-emissions selected-item d-flex-center border border-1 m-1 rounded-3" data-value="rcp45">
        <div class="inner-lower-emissions ps-3 pe-3 pt-2 pb-2 me-2 rounded-3"></div>
        Lower Emissions
      </div>
      <div class="btn btn-higher-emissions selected-item d-flex-center border border-1 m-1 rounded-3"  data-value="rcp85">
        <div class="inner-higher-emissions ps-3 pe-3 pt-2 pb-2 me-2 rounded-3"></div>
        Higher Emissions
      </div>
    </div>

    <div id="monthly-select-wrapper" class="d-flex-center flex-wrap mb-2 d-none">
      <div class="btn selected-item d-flex-center border border-1 m-1 rounded-3" data-value="2025">
        2010-2040 average
      </div>
      
      <div class="btn default-selection d-flex-center border border-1 m-1 rounded-3" data-value="2050">
        2035-2065 average
      </div>
  
      <div class="btn default-selection d-flex-center border border-1 m-1 rounded-3" data-value="2075">
        2060-2090 average
      </div>
    </div>
  </div>


  <div id="chart-info-row" class="d-flex-row flex-justify padding-bottom-half d-flex-left d-none">
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
