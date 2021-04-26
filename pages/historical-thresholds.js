import head from '../template/head'
import secondary_header from '../template/secondary_header';
import footer from '../template/footer';
import nav_footer from '../template/nav_footer';

export default (config) => `
<!doctype html>
<html lang='en' class="width-100 height-100">
<head>
  ${head(config)}
  <meta property="fb:app_id" content="187816851587993">
  <meta property="og:url" content="historical-thresholds">
  <meta property="og:type" content="article">
  <meta property="og:title" content="Location data for Buncombe County, NC">
  <meta property="og:description" content="The Climate Explorer allows you to view historical and projected climate variables and assess the impacts of climate change on the things you care about">
  <meta property="og:image" content="/img/og.jpg">
</head>

<body class="width-100 height-100">

  ${secondary_header(config)}

  <div id="historical-thresholds-viewport" class="padding-horizontal d-flex d-flex-column">

    <div id="search-row" class="padding-horizontal d-flex-row flex-justify padding-top padding-bottom-half d-flex-justify" >

      <div class="rounded-box-secondary input-outer padding-horizontal bottom-padding default-btn-height search-box-secondary width-65">
        <input tabindex="1" id="cards-search-input" type="text" class="location-mapper input-inner-default border-none default-btn-height" autocomplete="off" placeholder="Enter county, city, or zip code">
        <span class="icon icon-search search-default float-right padding-default"></span>
        <div id="clear-location-wrapper" class="">
          <span id="clear-location" data-page="historical-thresholds" class="fas fa-times-circle"></span>
        </div>
      </div>

      <div id="stations-select-wrapper" class="rounded-choice-box padding-horizontal default-btn-height top-select-wrapper d-flex-center">
        <div class="select stations-select">
          <div tabindex="20" id="stations-select-vis" class="select-styled" data-value="">Stations</div>
          <ul class="select-options">
            <li tabindex="21" data-value="" class="default-select-option"></li>
          </ul>
        </div>
      </div>

    </div>

    <div id="info-row" class="padding-vertical width-100" >
      <div class="rounded-filters-box padding-default width-100">

        <div class="filter-border-bottom d-flex-row">

          <div id="info-text-wrapper" class="width-90">
            <i class="fas fa-chart-bar icon-info-box"></i>
            <span id="station-info-none" class="padding-horizontal"><strong>Please select a station on the map or from the Stations dropdown menu.</strong></span>
            <span id="station-info" class="padding-horizontal d-none">
              <span id="default-station-label" class="text-info-box label" >Station id: </span>
              <span id="default-station" class="text-info-box data right-padding" ></span>
              <span id="default-station-id-label" class="text-info-box label" >Station: </span>
              <span id="default-station-id" class="text-info-box data right-padding" ></span>
            </span>
          </div>


          <div id="filters-toggle" class="width-10">
            <div class="select filters-toggle-select">
              <div id="filters-toggle-select-vis" class="select-styled" data-value="filter"></div>
            </div>
          </div>

        </div>


        <div id="filters-row" class="d-flex-row flex-justify padding-top padding-bottom d-flex-left" >

          <a id="national-climate-maps-secretlink-forcharts" href="/historical-weather-data" class="d-none"></a>
          <div id="chartmap-wrapper" class="padding-horizontal-half padding-vertical-half default-btn-height d-flex-center width-20 disabled">
            <div tabindex="5003" role="button" class="btn-selector btn-chart btn-default circle-box-left d-flex-center width-50" data-value="chart" data-page="historical-thresholds" data-sel="chartmap-select-vis">
              Chart
            </div>
            <div tabindex="5004" role="button" class="btn-selector btn-default-selected circle-box-right d-flex-center width-50"  data-page="historical-thresholds"  data-value="map" data-sel="chartmap-select-vis">
              Map
            </div>
          </div>

          <div id="chartmap-select-wrapper" class="rounded-choice-box padding-left-half padding-vertical-half default-btn-height d-flex-center width-20">
            <div class="select chartmap-select">
              <div id="chartmap-select-vis" class="select-styled" data-value="map">Map</div>
              <ul class="select-options">
                <li tabindex="5005" id="chartmap-select-chart-link" data-value="chart" class="default-select-option" data-page="historical-thresholds"  >Chart</li>
                <li tabindex="5006" id="chartmap-select-map-link" data-value="map" class="default-select-option" data-page="historical-thresholds" >Map</li>
              </ul>
            </div>
          </div>

            <div id="threshold-variable-select-wrapper" class="rounded-choice-box padding-horizontal-half padding-vertical-half default-btn-height d-flex-center width-20">
              <div class="select threshold-variable-select">
                <div tabindex="5007" id="threshold-variable-select-vis" class="select-styled" data-value="precipitation">Precipitation</div>
                <ul class="select-options">
                  <li tabindex="5008" id="threshold-variable-select-chart-link" data-value="precipitation" class="default-select-option" data-page="historical-thresholds" >Precipitation</li>
                  <li tabindex="5009" id="threshold-variable-select-map-link" data-value="tavg" class="default-select-option" data-page="historical-thresholds" >Average Temperature</li>
                  <li tabindex="5010" id="threshold-variable-select-map-link" data-value="tmax" class="default-select-option" data-page="historical-thresholds" >Maximum Temperature</li>
                  <li tabindex="5011" id="threshold-variable-select-map-link" data-value="tmin" class="default-select-option" data-page="historical-thresholds" >Minimum Temperature</li>
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

            <div tabindex="5009" id="chart-info-row-btn" class="rounded-choice-box padding-left-half padding-vertical-half default-btn-height d-flex-center width-10" >
              <div class="more-info btn-default padding-left-half">
                <span class="fas fa-info more-info more-icon"></span>
                <span class="fas fa-info more-info less-icon d-none"></span>
                <span class="more short-desc">About</span>
                <span class="more long-desc">About the graph</span>
                <span class="more long-desc d-none">About the graph</span>
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

    ${nav_footer(config)}
    ${footer(config)}

    <script src="https://unpkg.com/@esri/arcgis-to-geojson-utils"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Turf.js/5.1.6/turf.min.js" integrity="sha256-Nhtik+K3xORhs5S9o0qlol4eRNB9O5OyTOJqbLucPk8=" crossorigin="anonymous"></script>
    <script type="text/javascript" src="/js/stationsMap.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.1/Chart.bundle.min.js" integrity="sha256-N4u5BjTLNwmGul6RgLoESPNqDFVUibVuOYhP4gJgrew=" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.19/lodash.min.js" integrity="sha512-/A6lxqQJVUIMnx8B/bx/ERfeuJnqoWPJdUxN8aBj+tZYL35O998ry7UUGoN65PSUNlJNrqKZrDENi4i1c3zy4Q==" crossorigin="anonymous"></script>
    <script type="text/javascript" src="/js/stationAnnualGraph.js"></script>
    <script type="text/javascript" src="/vendor/item/jquery.fl-item.min.js"></script>
    <script src="https://unpkg.com/terraformer@1.0.8/terraformer.js" integrity="sha384-+M797Pj3WZVCwMmLbOxAoaWYcKJo8NSxItmI48ytcLNeAnfn1d/IckFn31jEqrzP"
    crossorigin="anonymous"></script>
    <script src="https://unpkg.com/terraformer-arcgis-parser@1.0.5/terraformer-arcgis-parser.js"
    integrity="sha384-duFUjKTSNoxEspdJNwr83CUgRxclf0ueKJB9DU/Vbit6bfWgzvZsHW6H1JLBBXhp" crossorigin="anonymous"></script>
    <script type="text/javascript" src="/js/ce3-ui-components.js"></script>
    <script type="text/javascript" src="/js/historical-thresholds.js"></script>

    <script type="text/javascript" src="/js/secondary_header.js"></script>
  </body>
  </html>
`