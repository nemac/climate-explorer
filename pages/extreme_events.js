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
    <meta property="og:url" content="extreme_events">
    <meta property="og:type" content="article">
    <meta property="og:title" content="Climate Explorer">
    <meta property="og:description"
          content="The Climate Explorer allows you to view historical and projected climate variables and assess the impacts of climate change on the things you care about">
    <meta property="og:image" content="/img/og.jpg">
  </head>
  <body class="extreme-events">
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
        <div class="m-2 mb-1">
          <span
              id="station-info-none"><strong>Please select a station on the map or from the Stations dropdown menu. You may need to zoom out to see more stations.</strong></span>
          <span id="station-info" class="d-none">
              <span id="default-station-label" class="text-info-box label">Station id: </span>
              <span id="default-station" class="text-info-box data right-padding"></span>
              <span id="default-station-id-label" class="text-info-box label">Station: </span>
              <span id="default-station-id" class="text-info-box data right-padding"></span>
            </span>
        </div>
        <div class="m-2 mt-1 collapse show" id="collapse-info-section">
          <div class="row align-items-center">
            <div class="col-md-12 col-lg-6 col-xl-1 mt-1 mb-1 info-section">
              <div class="btn-group border rounded-2 graph-map-selection w-100" role="group">
                <label class="btn ps-4 pe-4 default-selection disabled" id="chartmap-select-chart-link" data-value="chart" data-page="extreme_events"
                       data-sel="chartmap-select-vis">Graph</label>
                <label class="btn ps-4 pe-4 selected-item" id="chartmap-select-map-link" data-page="extreme_events" data-value="map"
                       data-sel="chartmap-select-vis">Map</label>
              </div>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-2 selection-dropdown mt-1 mb-1 info-section">
              <div class="dropdown rounded-2 border border-1">
                <a class="btn dropdown-toggle ps-4 pe-4 w-100 disabled" href="#" style="text-align: center;" role="button" id="selection-dropdown-menu"
                   data-bs-toggle="dropdown" aria-expanded="false" data-value="precipitation">
                  Precipitation
                </a>
                <div class="dropdown-menu p-2">
                  <div class="d-lg-flex">
                    <div class="m-2 p-2">
                      <div class="mb-2">
                        <i class="fas fa-temperature-high"></i>
                        <span>Variables</span>
                      </div>
                      <ul class="selection-dropdown-menu w-100">
                        <li role="option" data-value="precipitation" class="dropdown-item" data-page="extreme_events">Precipitation</li>
                        <li role="option" data-value="tavg" class="dropdown-item" data-page="extreme_events">Average Temperature</li>
                        <li role="option" data-value="tmax" class="dropdown-item" data-page="extreme_events">Maximum Temperature</li>
                        <li role="option" data-value="tmin" class="dropdown-item" data-page="extreme_events">Minimum Temperature</li>
                      </ul>
                    </div>

                    <div class="m-2 p-2">
                      <div class="mb-2">
                        <i class=""></i>
                        <span>Presets</span>
                      </div>
                      <ul class="selection-dropdown-menu w-100">
                        <li role="option" data-value="preset-1" class="dropdown-item" data-page="extreme_events">3-day precipitation at least 90th percentile</li>
                        <li role="option" data-value="preset-2" class="dropdown-item" data-page="extreme_events">1-day precipitation no more than 0.01in (dry days)
                        </li>
                        <li role="option" data-value="preset-3" class="dropdown-item" data-page="extreme_events">1-day max temp at least 95 °F</li>
                        <li role="option" data-value="preset-4" class="dropdown-item" data-page="extreme_events">3-day min temp at least 90 °F (hot-nights)</li>
                        <li role="option" data-value="preset-5" class="dropdown-item" data-page="extreme_events">1-day min temp no more than 32 °F (frost days)</li>
                        <li role="option" data-value="preset-6" class="dropdown-item" data-page="extreme_events">1-day max temp no more than 32 °F (icing days)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            

            <div class="col-md-12 col-lg-6 col-xl-2 mt-1 mb-1">

              <div class="input-group">
                <label class="input-group-text" for="threshold">Threshold</label>
                <input id="threshold" class="form-control" type="number" step="0.5" name="threshold" value="1">
                <span id="variable_unit_label" class="input-group-text">in</span>
              </div>

            </div>

            <div class="col-md-12 col-lg-6 col-xl-1 percentile-dropdown mt-1 mb-1 info-section">
              <div class="dropdown default-selection rounded-2 border border-1">
                <a class="btn dropdown-toggle ps-4 pe-4 w-100" href="#" style="text-align: center;" role="button" id="percentile-dropdown-menu"
                   data-bs-toggle="dropdown" aria-expanded="false">
                  Percentiles
                </a>
                <ul class="dropdown-menu percentile-dropdown-menu percentile-select" aria-labelledby="percentile-dropdown-menu">
                  <li role="option" data-value="10" class="dropdown-item default-select-option">10th</li>
                  <li role="option" data-value="25" class="dropdown-item default-select-option">25th</li>
                  <li role="option" data-value="50" class="dropdown-item default-select-option">50th</li>
                  <li role="option" data-value="75" class="dropdown-item default-select-option">75th</li>
                  <li role="option" data-value="90" class="dropdown-item default-select-option">90th</li>
                </ul>
              </div>
            </div>

            <div class="col-md-12 col-lg-6 col-xl-1 operator-dropdown mt-1 mb-1 info-section">
              <div class="dropdown default-selection rounded-2 border border-1">
                <a class="btn dropdown-toggle ps-4 pe-4 w-100" href="#" style="text-align: center;" role="button" id="operator-dropdown-menu"
                   data-bs-toggle="dropdown" aria-expanded="false">
                  Operator
                </a>
                <ul class="dropdown-menu operator-dropdown-menu operator-select" aria-labelledby="operator-dropdown-menu">
                  <li role="option" data-value=">=" class="dropdown-item default-select-option">at least (>=)</li>
                  <li role="option" data-value="<=" class="dropdown-item default-select-option">not more than (<=)</li>
                </ul>
              </div>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-2 mt-1 mb-1">

              <div class="input-group">
                <label for="window_days" class="input-group-text">Window</label>
                <input id="window_days" class="form-control" type="number" name="window_days" value="1" min="1" max="30">
                <span class="input-group-text" style="background-color: #E9F1FC;">days</span>
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
                  <li class="dropdown-item default-select-option" data-value="annual_exceedance_data">Annual exceedance data (.csv)</li>
                  <li class="dropdown-item default-select-option" data-value="annual_exceedance_image">Annual exceedance image (.png)</li>
                  <li class="dropdown-item default-select-option" data-value="histogram_data">Histogram data (.csv)</li>
                  <li class="dropdown-item default-select-option" data-value="histogram_image">Histogram image (.png)</li>
                  <li class="dropdown-item default-select-option" data-value="daily_values_data">Daily values data (.csv)</li>
                  <li class="dropdown-item default-select-option" data-value="daily_values_image">Daily values image (.png)</li>
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

    <div id="historical-thresholds-viewport" class="h-100" style="display: flex; flex-flow: column nowrap; flex: 1 1 auto; position: relative;">
      <div class="graph-row row d-none">
        <div class="col">
          <div class="row">
            <div class="graph-container col-12" style="height: 23rem;">

              <div class="graph-wrapper shadow-sm mt-2">
                <h5 id="annual-exceedance-title" class="m-1"></h5>
                <div id="annual-exceedance-view" class="graph-item"></div>
              </div>
            </div>
          </div>

          <hr>

          <div class="row my-1">

            <div class="graph-container col-12 col-md-6 col-lg-4 border-0 p-2" style="min-height: 16rem;">
              <div class="graph-wrapper shadow border-1">
                <h5 id="histogram-title" class="m-2"></h5>
                <div id="histogram-view" class="graph-item"></div>
              </div>
            </div>
            <div class="graph-container col-12 col-md-6 col-lg-4 border-0  p-2" style="min-height: 16rem;">
              <div class="graph-wrapper shadow">
                <div class="d-flex flex-row align-items-center">
                  <h5 id="daily-values-title" class="m-1"></h5>
                  <button class="btn btn-sm ms-auto" id="daily-graphs-modal-btn"><i class="fas fa-expand me-2"></i>more</button>
                </div>
                <div id="absolute-view" class="graph-item mt-2"></div>
              </div>
            </div>
            <div class="graph-container col-12 col-md-12 col-lg-4 border-0 p-2">
              <div class="graph-wrapper shadow p-2">
                <h5 class="mx-1">Plain-language description:</h5>
                <div id="plain-language-view" class="graph-item mx-1 mt-2" style="font-size: 1.2rem;">
                </div>
              </div>
            </div>

          </div>

          <hr>
        </div>
      </div>
      <div id="stations-map-row" class="row my-2" style="min-height: 34rem; flex: 1 0 100%;">
        <div class="col">
          <div id="stations-map-wrap" class="map-wrap" style="display: flex; flex-flow: column nowrap; flex: 1 1 auto; position:relative; height:100%;">
            <div id="stations-map" class="map-element flex-grow-1"></div>
            <div id="stations-map-message" class="py-2 px-1 rounded-2 d-none"></div>
          </div>
        </div>
      </div>


    </div>
  </main>
  <div class="modal fade" id="aboutModal" tabindex="-1" aria-labelledby="aboutModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen-md-down modal-xl">
      <div class="modal-content p-3">
        <div class="modal-header">
          <h3 class="modal-title" id="aboutModalLabel">READING THE EXTREME EVENTS CHARTS</h3>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">


          <div class="mb-3">
            <p>The first graph on this page shows how often the selected threshold has been exceeded per year for the selected weather station. For consistency,
              this chart excludes any years that are missing more than five daily temperature reports or more
              than one precipitation report in a single month.</p>
            <p>The second (lower left) graph shows the number of occurrences of specific daily values for the entire period of record for this weather station.
              The current threshold can be seen as a vertical line. This graph uses a linear Y-axis for temperature variables (where daily values are roughly a
              normal distribution), and a logarithmic Y-axis for precipitation (where daily values are roughly exponentially distributed skewed toward 0)</p>
            <p>The third (lower middle) graph shows the observed daily values compared to climate normals (based on 1981-2010). The current threshold can be
              seen
              as a horizontal lin
            <p>In the lower right is a plain-language description of the annual exceedance.</p>

            The histogram graph in the lower left and the lower middle display observed daily values for the selected variable for the entire period of record
            for
            the selected weather station, one as a Blue bars on temperature graphs indicate the range of observed temperatures for each day; the green band
            shows
            Climate Normals for temperature—the average temperature range at that station from . Blue areas on precipitation graphs track year-to-date
            cumulative
            precipitation; the black line shows Climate Normals for precipitation.

            Data from
            <a target="_blank"
               href="https://www.ncdc.noaa.gov/data-access/land-based-station-data/land-based-datasets/global-historical-climatology-network-ghcn">
              Global Historical Climatology Network</a>, served by <a target="_blank" href="http://www.rcc-acis.org/">ACIS</a>.
          </div>
          <div>
            Pan or zoom on these graphs to view other years using the tools in the top right of each graph or place your cursor on either axis and then
            click-and-drag to pan along just that axis.
          </div>

        </div>
      </div>
    </div>
  </div>
  <div class="modal fade" id="daily-graphs-modal" tabindex="-1" aria-labelledby="daily-graphs-modal-label" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-fullscreen-md-down">
      <div class="modal-content p-3">
        <div class="modal-header">
          <h3 class="modal-title" id="daily-graphs-modal-label">Daily values</h3>
          <div>
            
          </div>
          <div class="ms-5 dropdown rounded-2 border border-1">
            <a class="btn dropdown-toggle default-selection ps-4 pe-4 w-100" href="#" style="text-align: center;" role="button" id="modal-download-dropdown-menu"
               data-bs-toggle="dropdown" aria-expanded="false">
              <span class="fas fa-download select-icon"></span>
              Downloads
            </a>
            <ul class="dropdown-menu download-select-modal" aria-labelledby="modal-download-dropdown-menu">
              <li class="dropdown-item default-select-option" data-value="absolute_data">Observed data (.csv)</li>
              <li class="dropdown-item default-select-option" data-value="absolute_image">Observed image (.png)</li>
              <li class="dropdown-item default-select-option" data-value="normalized_data">Observed vs. Normal data (.csv)</li>
              <li class="dropdown-item default-select-option" data-value="normalized_image">Observed vs. Normal image (.png)</li>
              <li class="dropdown-item default-select-option" id="other_data" data-value="other_data">Other data (.csv)</li>
              <li class="dropdown-item default-select-option" id="other_image" data-value="other_image">Other image (.png)</li>
            </ul>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="row mt-2">
            <div class="col col-12 d-flex flex-column" style="height: 18rem; overflow: hidden; position: relative;">
              <h5>Observed</h5>
              <div id="daily-graph-absolute" style="height: 18rem; overflow: hidden;"></div>
            </div>
          </div>
          <div class="row mt-5">
            <div class="col col-12  d-flex flex-column" style="height: 18rem; overflow: hidden;">
              <h5>Observed vs. Normal</h5>
              <div id="daily-graph-normalized" style="height: 18rem; overflow: hidden;"></div>
            </div>
          </div>
          <div class="row mt-5">
            <div class="col col-12  d-flex flex-column " style="height: 18rem; overflow: hidden;">
              <h5 id="daily-graph-other-label"></h5>
              <div id="daily-graph-other" style="flex: 1 1 auto;"></div>
            </div>
          </div>
          <div>
            Pan or zoom on these graphs to view other years using the tools in the top right of each graph or place your cursor on either axis and then
            click-and-drag to pan along just that axis.
          </div>

        </div>
      </div>
    </div>
  </div>
  ${nav_footer(config)}
  ${footer(config)}
  <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.19/lodash.min.js"
          integrity="sha512-/A6lxqQJVUIMnx8B/bx/ERfeuJnqoWPJdUxN8aBj+tZYL35O998ry7UUGoN65PSUNlJNrqKZrDENi4i1c3zy4Q==" crossorigin="anonymous"></script>

  <script src='https://cdn.plot.ly/plotly-2.4.2.min.js'></script>

  <script type="text/javascript" src="/vendor/climate_by_station_widget.js${version_suffix()}"></script>
  <script src="https://unpkg.com/terraformer@1.0.8/terraformer.js" integrity="sha384-+M797Pj3WZVCwMmLbOxAoaWYcKJo8NSxItmI48ytcLNeAnfn1d/IckFn31jEqrzP"
          crossorigin="anonymous"></script>
  <script src="https://unpkg.com/terraformer-arcgis-parser@1.0.5/terraformer-arcgis-parser.js"
          integrity="sha384-duFUjKTSNoxEspdJNwr83CUgRxclf0ueKJB9DU/Vbit6bfWgzvZsHW6H1JLBBXhp" crossorigin="anonymous"></script>
  <script type="${config.env === 'dev' ? 'module' : 'text/javascript'}" src="/js/extreme_events.js${version_suffix()}"></script>
  </body>
  </html>
`
