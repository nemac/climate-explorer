import head from '../template/head'
import secondary_header from '../template/secondary_header';
import footer from '../template/footer';
import nav_footer from '../template/nav_footer';

export default (config) => `
<!doctype html>
<html lang='en'>
<head>
  ${head(config)}
  <meta property="fb:app_id" content="187816851587993">
  <meta property="og:url" content="historical_thresholds">
  <meta property="og:type" content="article">
  <meta property="og:title" content="Location data for Buncombe County, NC">
  <meta property="og:description" content="The Climate Explorer allows you to view historical and projected climate variables and assess the impacts of climate change on the things you care about">
  <meta property="og:image" content="/img/og.jpg">
</head>

<body>

  ${secondary_header(config)}

    <div class="container-fluid d-flex-column historical-thresholds-body"> 
      <div id="historical-thresholds-viewport" class="d-flex-column">
      
          <div class="d-flex flex-row mt-3"> 
              <div class="input-group mb-3 search-input-group rounded-3 border border-1 w-75 me-2">
                <button id="clear-location" class="btn search-icons" type="button"><span class="fas fa-times-circle"></span></button>
                <input id="cards-search-input" class="form-control location-mapper" type="text" placeholder="Enter county or city name" aria-label="Enter county or city name">
              </div>
                
              <div class="dropdown w-25 rounded-3 border border-1 mb-3 stations-dropdown">
                  <a class="btn dropdown-toggle w-100" href="#" role="button" id="stations-dropdown-menu" data-bs-toggle="dropdown" aria-expanded="false">
                    Stations
                  </a>
                
                  <ul class="dropdown-menu stations-dropdown-ul w-100" aria-labelledby="stations-dropdown-menu">
                  </ul>
              </div>
          </div>
      
          <div class="info-section">
              <div class="border border-1 rounded-3"> 
                
                <div class="m-3"> 
                  <span id="station-info-none"><strong>Please select a station on the map or from the Stations dropdown menu. You may need to zoom out to see more stations.</strong></span>
                  <span id="station-info" class="d-none">
                    <span id="default-station-label" class="text-info-box label">Station id: </span>
                    <span id="default-station" class="text-info-box data right-padding" ></span>
                    <span id="default-station-id-label" class="text-info-box label">Station: </span>
                    <span id="default-station-id" class="text-info-box data right-padding" ></span>
                  </span>
                </div>
                
                <div class="m-3 collapse show" id="collapse-info-section"> 
                  
                  <div class="row">
                      
                      <div class="col-md-12 col-lg-6 col-xl-2 mt-1 mb-1" style="text-align: center;"> 
                        <div class="btn-group border rounded-3 graph-map-selection w-100" role="group"> 
                          <label class="btn ps-4 pe-4 default-selection disabled" id="chartmap-select-chart-link" data-value="chart"  data-page="historical_weather_data" data-sel="chartmap-select-vis">Graph</label>
                          <label class="btn ps-4 pe-4 selected-item" id="chartmap-select-map-link" data-page="historical_weather_data"  data-value="map" data-sel="chartmap-select-vis">Map</label>
                        </div>
                      </div>
                       
                       <div class="col-md-12 col-lg-6 col-xl-2 selection-dropdown mt-1 mb-1" style="text-align: center;"> 
                        <div class="dropdown rounded-3 border border-1">
                          <a class="btn dropdown-toggle ps-4 pe-4 w-100 disabled" href="#" style="text-align: center;" role="button" id="selection-dropdown-menu" data-bs-toggle="dropdown" aria-expanded="false">
                            Precipitation
                          </a>
                        
                          <ul class="dropdown-menu w-100" aria-labelledby="selection-dropdown-menu">
           
                            <li role="option" id="threshold-variable-select-chart-link" data-value="precipitation" class="dropdown-item" data-page="historical_thresholds">Precipitation</li>
                            <li role="option" id="threshold-variable-select-map-link" data-value="tavg" class="dropdown-item" data-page="historical_thresholds" >Average Temperature</li>
                            <li role="option" id="threshold-variable-select-map-link" data-value="tmax" class="dropdown-item" data-page="historical_thresholds" >Maximum Temperature</li>
                            <li role="option" id="threshold-variable-select-map-link" data-value="tmin" class="dropdown-item" data-page="historical_thresholds" >Minimum Temperature</li>
                          </ul>
                        </div>
                      </div>
                       
                      <div class="col-md-12 col-lg-6 col-xl-2 download-dropdown mt-1 mb-1" style="text-align: center;"> 
                        <div class="dropdown rounded-3 border border-1">
                          <a class="btn dropdown-toggle ps-4 pe-4 w-100 disabled" href="#" style="text-align: center;" role="button" id="download-dropdown-menu" data-bs-toggle="dropdown" aria-expanded="false">
                            <span class="fas fa-download select-icon"></span>
                            Downloads
                          </a>
                        
                          <ul class="dropdown-menu download-select" aria-labelledby="download-dropdown-menu">
                            <div data-icon="fas fa-temperature-high select-icon" class="d-flex justify-content-center">
                              <i class="fas fa-temperature-high me-2"></i>Temperature
                            </div>
                            <li tabindex="5001" data-value="download-temperature-image" data-icon="fas fa-download select-icon" href="javascript:void(0);">
                              <a tabindex="5001" data-value="download-temperature-image" class="dropdown-item" href="javascript:void(0);" >Download temperature image</a>
                            </li>
                            <li tabindex="5002" data-value="download-temperature-data" data-icon="fas fa-download select-icon" href="javascript:void(0);" class="mb-2">
                              <a tabindex="5002" data-value="download-temperature-data" class="dropdown-item" href="javascript:void(0);" >Download temperature data</a>
                            </li>
                            <div data-icon="fas fa-cloud-rain select-icon" class="d-flex justify-content-center">
                              <i class="fas fa-cloud-rain me-2"></i>Precipitation
                            </div>
                            <li tabindex="5003" data-value="download-image" data-icon="fas fa-download select-icon" href="javascript:void(0);">
                              <a tabindex="5004" data-value="download-precipitation-image" class="dropdown-item" href="javascript:void(0);" >Download precipitation image</a>
                            </li>
                            <li tabindex="5004" data-value="download-precipitation-observed-data" data-icon="fas fa-download select-icon" href="javascript:void(0);">
                              <a tabindex="5004" data-value="download-precipitation-data" class="dropdown-item" href="javascript:void(0);" >Download precipitation data</a>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <div class="col-md-12 col-lg-6 col-xl-1 btn chart-info border border-1 mt-1 mb-1 disabled" style="text-align: center;" id="chart-info-row-btn" data-bs-toggle="modal" data-bs-target="#aboutModal">
                          <i class="fas fa-info me-2"></i>
                          <span>About</span>
                      </div>
                  </div>
                  
                </div>
              </div> 
          </div>
      
          <div id="info-row" class="padding-vertical padding-horizontal width-100" >
            <div class="rounded-filters-box padding-default width-100">
      
              <div id="filters-row" class="d-flex-row flex-justify padding-top padding-bottom d-flex-left" >
      
                <div id="chartmap-wrapper" class="padding-horizontal-half padding-vertical-half default-btn-height d-flex-center width-20 disabled">
                  <div tabindex="5003" role="button" class="btn-selector btn-chart btn-default circle-box-left d-flex-center width-50 btn-default-disabled" data-value="chart" data-page="historical_thresholds" data-sel="chartmap-select-vis">
                    Graph
                  </div>
                  <div tabindex="5004" role="button" class="btn-selector btn-default-selected circle-box-right d-flex-center width-50"  data-page="historical_thresholds"  data-value="map" data-sel="chartmap-select-vis">
                    Map
                  </div>
                </div>
      
                <div id="chartmap-select-wrapper" class="rounded-choice-box padding-left-half padding-vertical-half default-btn-height d-flex-center width-20">
                  <div class="select chartmap-select">
                    <div id="chartmap-select-vis" class="select-styled" data-value="map">Map</div>
                    <ul class="select-options">
                      <li tabindex="5005" id="chartmap-select-chart-link" data-value="chart" class="default-select-option" data-page="historical_thresholds"  >Chart</li>
                      <li tabindex="5006" id="chartmap-select-map-link" data-value="map" class="default-select-option" data-page="historical_thresholds" >Map</li>
                    </ul>
                  </div>
                </div>
      
                  <div id="threshold-variable-select-wrapper" class="rounded-choice-box padding-horizontal-half padding-vertical-half default-btn-height d-flex-center width-20">
                    <div class="select threshold-variable-select">
                      <div tabindex="5007" id="threshold-variable-select-vis" class="select-styled" data-value="precipitation">Precipitation</div>
                      <ul class="select-options">
                        <li tabindex="5008" role="option" id="threshold-variable-select-chart-link" data-value="precipitation" class="default-select-option" data-page="historical_thresholds">Precipitation</li>
                        <li tabindex="5009" role="option" id="threshold-variable-select-map-link" data-value="tavg" class="default-select-option" data-page="historical_thresholds" >Average Temperature</li>
                        <li tabindex="5010" role="option" id="threshold-variable-select-map-link" data-value="tmax" class="default-select-option" data-page="historical_thresholds" >Maximum Temperature</li>
                        <li tabindex="5011" role="option" id="threshold-variable-select-map-link" data-value="tmin" class="default-select-option" data-page="historical_thresholds" >Minimum Temperature</li>
                      </ul>
                    </div>
                  </div>
      
      
                  <div id="threshold_value_form_field" class="form-field padding-left-half padding-vertical-half default-btn-height d-flex width-15">
      
                    <div tabindex="5012" class="threshold-button threshold-down">-</div>
                      <div class="form-field-control height-100">
                        <input tabindex="5013" id="threshold-value" type="number" class="form-field-input height-100" placeholder=" " min="0" max="200" value="1" autofocus="autofocus" step="0.1"/>
                        <label for="threshold-value" class="form-field-label height-100">Threshold<span id="threshold-unit"> in inches</span></label>
                        <div class="form-field-bar height-100"></div>
                      </div>
                      <div tabindex="5014" class="threshold-button threshold-up">+</div>
      
                    </div>
      
                  <div id="window_value_form_field" class="form-field padding-left-half padding-vertical-half default-btn-height d-flex width-15">
      
                    <div tabindex="5015" class="window-button window-down">-</div>
                    <div class="form-field-control height-100">
                      <input tabindex="5016" id="window-value" type="number" class="form-field-input height-100" placeholder=" " min="0" max="365" value="1" autofocus="autofocus" step="1"/>
                      <label for="window-value" class="form-field-label height-100">Window<span id="window-unit"> in days</span></label>
                      <div class="form-field-bar height-100"></div>
                    </div>
                    <div tabindex="5017" class="window-button window-up">+</div>
                  </div>
      
                  <div id="downloads-select-wrapper" class="rounded-choice-box padding-left-half padding-vertical-half default-btn-height d-flex-center">
                    <div class="select download-select">
                      <div tabindex="5000" id="downloads-select-vis" class="select-styled" data-value="none" href="javascript:void(0);">
                        <i class="fas fa-download select-icon"></i>
                        <a data-value="none" class="download-link-main long-desc" href="javascript:void(0);" >Downloads</a>
                        <a data-value="none" class="download-link-main short-desc" href="javascript:void(0);" >Down</a>
                      </div>
                      <ul class="select-options" style="display: none;">
                        <li data-value="download-thresholds-image" data-icon="fas fa-download select-icon" href="javascript:void(0);" class="default-select-option">
                          <a tabindex="5001" data-value="download-thresholds-image" class="download-link" href="javascript:void(0);" >Download threshold image</a>
                        </li>
                        <li data-value="download-thresholds-data" data-icon="fas fa-download select-icon" href="javascript:void(0);" class="default-select-option">
                          <a tabindex="5002" data-value="download-thresholds-data" class="download-link" href="javascript:void(0);" >Download threshold data</a>
                        </li>
                      </ul>
                    </div>
                  </div>
      
                  <div tabindex="5009" id="chart-info-row-btn" class="rounded-choice-box padding-left-half padding-vertical-half default-btn-height d-flex-center" >
                    <div class="more-info btn-default padding-left-half btn-default-disabled">
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
      
          <div id="stations-map-row" class="padding-top-half width-100 height-100 d-flex" >
            <div id="stations-map-wrap" class="map-wrap width-100 height-100 ">
              <div id="stations-map" class="map-element"></div>
              <div id="stations-map-message" class="map-nostations-message d-none"></div>
            </div>
          </div>
      
          <div id="stations-graph-row" class="padding-vertical width-100 height-100" >
            <div id="stations-graph-wrap" class="width-100 height-100 d-flex-row">
                <div id="thresholds-container" class="d-flex-center width-100"></div>
            </div>
          </div>
      
          <div id="station-info-row" class="d-flex-row flex-justify padding-bottom d-flex-left d-none" >
            <span id="more-info-description" class="rounded-description-box d-none" >
              <div class="more-caret d-flex-center">
                <span class="fas fa-angle-down"></span>
              </div>
      
              <div class="padding-default">
                <h2>Reading the thresholds charts</h2>
              </div>
              <div class="chart-info-text btn-chart-text left-padding padding-bottom-half" >This graph shows how often the selected threshold has been exceeded per year. For consistency,
              this chart excludes any years that are missing more than five daily temperature reports or more
              than one precipitation report in a single month. Data from
              <a target="_blank" href="https://www.ncdc.noaa.gov/data-access/land-based-station-data/land-based-datasets/global-historical-climatology-network-ghcn">
                Global Historical Climatology Network</a>, served by <a target="_blank" href="http://www.rcc-acis.org/">ACIS</a>.
              </div>
            </span>
          </div>
        </div>

    </div>

    ${nav_footer(config)}
    ${footer(config)}
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.1/Chart.bundle.min.js" integrity="sha256-N4u5BjTLNwmGul6RgLoESPNqDFVUibVuOYhP4gJgrew=" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.19/lodash.min.js" integrity="sha512-/A6lxqQJVUIMnx8B/bx/ERfeuJnqoWPJdUxN8aBj+tZYL35O998ry7UUGoN65PSUNlJNrqKZrDENi4i1c3zy4Q==" crossorigin="anonymous"></script>
    <script type="text/javascript" src="/vendor/item/jquery.fl-item.min.js"></script>
    <script src="https://unpkg.com/terraformer@1.0.8/terraformer.js" integrity="sha384-+M797Pj3WZVCwMmLbOxAoaWYcKJo8NSxItmI48ytcLNeAnfn1d/IckFn31jEqrzP"
    crossorigin="anonymous"></script>
    <script src="https://unpkg.com/terraformer-arcgis-parser@1.0.5/terraformer-arcgis-parser.js"
    integrity="sha384-duFUjKTSNoxEspdJNwr83CUgRxclf0ueKJB9DU/Vbit6bfWgzvZsHW6H1JLBBXhp" crossorigin="anonymous"></script>
    <script type="${config.env === 'dev'? 'module':  'text/javascript'}" src="/js/historical_thresholds.js"></script>

  </body>
  </html>
`
