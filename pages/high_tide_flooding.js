import head from '../template/head'
import secondary_header from '../template/secondary_header';
import footer from '../template/footer';
import nav_footer from '../template/nav_footer';

// language=HTML
export default (config) => `
<!doctype html>
<html lang='en'>
<head>
  ${head(config)}
  <meta property="fb:app_id" content="187816851587993">
  <meta property="og:url" content="high_tide_flooding">
  <meta property="og:type" content="article">
  <meta property="og:title" content="Location data for Buncombe County, NC">
  <meta property="og:description" content="The Climate Explorer allows you to view historical and projected climate variables and assess the impacts of climate change on the things you care about">
  <meta property="og:image" content="/img/og.jpg">
</head>

<body>

  ${secondary_header(config)}

    <div class="container-fluid high-tide-flooding-body h-100">
        <div class="mt-3 row search-station-row"> 
            
          <div class="col-12 col-md-7 col-lg-8"> 
            <div class="input-group mb-3 search-input-group rounded-2 border border-1 me-2">
              <button id="clear-location" class="btn search-icons" type="button"><span class="fas fa-times-circle"></span></button>
              <input id="cards-search-input" class="form-control location-mapper" type="text" placeholder="Enter county or city name" aria-label="Enter county or city name">
            </div>
          </div>

          <div class="col-12 col-md-5 col-lg-4"> 
            <div class="dropdown rounded-2 border border-1 mb-3 stations-dropdown">
                <a class="btn dropdown-toggle w-100 d-flex justify-content-between align-items-center" href="#" role="button" id="stations-dropdown-menu" data-bs-toggle="dropdown" aria-expanded="false">
                  Stations
                </a>
              
                <ul class="dropdown-menu stations-dropdown-ul w-100" aria-labelledby="stations-dropdown-menu">
                </ul>
            </div>
          </div>
          
      </div>
        
        <div class="info-section">
            <div class="border border-1 rounded-2"> 
              
              <div class="m-3"> 
                <span id="station-info-none"><strong>Please select a station on the map or from the Stations dropdown menu. You may need to zoom out to see more stations.</strong></span>
                <span id="station-info" class="d-none">
                  <span id="default-station-label" class="text-info-box label">Station id: </span>
                  <span id="default-station" class="text-info-box data right-padding" ></span>
                  <span id="default-station-id-label" class="text-info-box label">Station: </span>
                  <span id="default-station-id" class="text-info-box data right-padding" ></span>
                  <span id="default-stationMOverMHHW-label" class="text-info-box label">Local threshold: </span>
                  <span id="default-stationMOverMHHW" class="text-info-box data right-padding" ></span>
                </span>
              </div>
              
              <div class="m-3 collapse show" id="collapse-info-section"> 
                
                <div class="row">
                    
                    <div class="col-md-12 col-lg-6 col-xl-2 mt-1 mb-1 info-section"> 
                      <div class="btn-group border rounded-2 graph-map-selection w-100" role="group"> 
                        <label class="btn ps-4 pe-4 default-selection disabled" id="chartmap-select-chart-link" data-value="chart" data-page="high_tide_flooding">Graph</label>
                        <label class="btn ps-4 pe-4 selected-item" id="chartmap-select-map-link" data-value="chart" data-page="high_tide_flooding" data-sel="chartmap-select-vis">Map</label>
                      </div>
                    </div>
                     
                    <div class="col-md-12 col-lg-6 col-xl-3 btn-group mt-1 mb-1 info-section" id="time-wrapper">
                      <label id="historical-selection" class="btn ps-4 pe-4 default-selection disabled" id="btn-tidalzoom" data-value="Historical">Historical</label>
                      <label id="historical-model-selection" class="btn ps-4 pe-4 default-selection disabled" id="btn-tidalzoom"
data-value="Historical and Modeled">Historical & Modeled</label>
                    </div>
                    
                    <div class="col-md-12 col-lg-6 col-xl-1 download-dropdown mt-1 mb-1 info-section"> 
                      <div class="dropdown rounded-2 border border-1">
                        <a class="btn dropdown-toggle ps-4 pe-4 w-100 disabled" href="#" style="text-align: center;" role="button" id="download-dropdown-menu" data-bs-toggle="dropdown" aria-expanded="false">
                          <span class="fas fa-download select-icon"></span>
                          Downloads
                        </a>
                      
                        <ul class="dropdown-menu download-select" aria-labelledby="download-dropdown-menu">
                          <li data-value="download-tidal-image" data-icon="fas fa-download select-icon" href="javascript:void(0);">
                            <a data-value="download-tidal-image" class="dropdown-item" href="javascript:void(0);" >Download tidal flooding image</a>
                          </li>
                          <li data-value="download-tidal-data" data-icon="fas fa-download select-icon" href="javascript:void(0);">
                            <a data-value="download-tidal-data" class="dropdown-item" href="https://tidesandcurrents.noaa.gov/publications/techrpt86_PaP_of_HTFlooding.csv">Download tidal flooding data</a>
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

        <div id="high-tide-flooding-viewport" class="d-flex d-flex-column">
        
            <div id="stations-map-row" class="d-flex h-100 w-100">
              <div id="stations-map-wrap" class="map-wrap h-100 w-100">
                <div id="stations-map" class="map-element"></div>
                <div id="stations-map-message" class="map-nostations-message d-none"></div>
              </div>
            </div>
        
            <div id="stations-graph-row" class="w-100 h-100" >
              <div id="stations-graph-wrap" class="w-100 d-flex-row">
                <div id="tidal-chart" class="tidal-chart d-flex-center w-100">
                </div>
              </div>
            </div>
        
            <div class="modal fade" id="aboutModal" tabindex="-1" aria-labelledby="aboutModalLabel" aria-hidden="true">
              <div class="modal-dialog modal-xl">
                <div class="modal-content p-3">
                  <div class="modal-header">
                    <h3 class="modal-title" id="aboutModalLabel">READING THE TIDAL FLOODING CHARTS</h3>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                  
                      <div> 
                      Click 'Historical' button to zoom in on or out from the observational period. Place your cursor over the curves on this graph for details. Gray bars from 1950 to 2016 show observed annual counts of high-tide flooding. Red and blue curves show the average number of high-tide flooding events projected for future years under two scenarios. Data from <a target="_blank" href="https://tidesandcurrents.noaa.gov/publications/techrpt86_PaP_of_HTFlooding.pdf">NOAA Technical Report NOS CO-OPS 086 - Patterns and Projections of High-Tide Flooding</a>.
                      </div>
                  
                  </div>
                </div>
              </div>
            </div>
        </div>

    </div>

    
    <!-- </div> -->

    ${nav_footer(config)}
    ${footer(config)}

    <script src="https://cdnjs.cloudflare.com/ajax/libs/plotly.js/1.58.4/plotly-basic.min.js" integrity="sha512-7S1p+6A2VVIWu+EevZqeqXWos1Tn+mroZxpkZ9THWipecJkL7TLg2myv5cIAShu9j3+fjHyCvEh/d7BKegMY1g==" crossorigin="anonymous"></script>

    <script type="text/javascript" src="/vendor/tidalstationswidget.js"></script>
    
    <script src="https://unpkg.com/terraformer@1.0.8/terraformer.js" integrity="sha384-+M797Pj3WZVCwMmLbOxAoaWYcKJo8NSxItmI48ytcLNeAnfn1d/IckFn31jEqrzP"
    crossorigin="anonymous"></script>
    <script src="https://unpkg.com/terraformer-arcgis-parser@1.0.5/terraformer-arcgis-parser.js"
    integrity="sha384-duFUjKTSNoxEspdJNwr83CUgRxclf0ueKJB9DU/Vbit6bfWgzvZsHW6H1JLBBXhp" crossorigin="anonymous"></script>

    <script type="${config.env === 'dev' ? 'module' : 'text/javascript'}" src="/js/high_tide_flooding.js"></script>
  </body>
  </html>
`
