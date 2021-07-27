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
  <meta property="og:url" content="historical_weather_data">
  <meta property="og:type" content="article">
  <meta property="og:title" content="Location data for Buncombe County, NC">
  <meta property="og:description" content="The Climate Explorer allows you to view historical and projected climate variables and assess the impacts of climate change on the things you care about">
  <meta property="og:image" content="/img/og.jpg">
</head>

<body class="width-100 height-100">

  ${secondary_header(config)}

<div id="historical-weather-data-viewport" class="padding-horizontal d-flex d-flex-column">

  <div id="search-row" class="padding-horizontal d-flex-row flex-justify padding-top padding-bottom-half d-flex-justify" >

    <div class="rounded-box-secondary input-outer padding-horizontal bottom-padding default-btn-height search-box-secondary width-65">
      <input tabindex="1" id="cards-search-input" type="text" class="location-mapper input-inner-default border-none default-btn-height" autocomplete="off" placeholder="Enter county or city name">
      <span class="icon icon-search search-default float-right padding-default"></span>
      <div id="clear-location-wrapper" class="">
        <span id="clear-location" data-page="historical_weather_data" class="fas fa-times-circle"></span>
      </div>
    </div>

    <div id="stations-select-wrapper" class="rounded-choice-box padding-horizontal default-btn-height top-select-wrapper d-flex-center">
      <div class="select stations-select">
        <div tabindex="20" id="stations-select-vis" class="select-styled" data-value="station-1">Stations</div>
        <ul class="select-options">
          <li tabindex="21" data-value="station-1" class="default-select-option">Stations 1</li>
          <li tabindex="22" data-value="station-2" class="default-select-option">Stations 2</li>
        </ul>
      </div>
    </div>

  </div>

  <div id="info-row" class="padding-vertical padding-horizontal width-100" >
    <div class="rounded-filters-box padding-default width-100">

      <div class="filter-border-bottom d-flex-row">

        <div id="info-text-wrapper" class="width-90">
          <i class="fas fa-chart-area icon-info-box"></i>
          <span id="station-info-none" class="padding-horizontal"><strong>Please select a station on the map or from the Stations dropdown menu. You may need to zoom out to see more stations.</strong></span>
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

        <div id="chartmap-wrapper" class="padding-horizontal-half padding-vertical-half default-btn-height d-flex-center width-20 disabled">
          <div tabindex="5005" role="button" class="btn-selector btn-chart btn-default circle-box-left d-flex-center width-50 btn-default-disabled" data-value="chart"  data-page="historical_weather_data" data-sel="chartmap-select-vis">
            Graph
          </div>
          <div tabindex="5006" role="button" class="btn-selector btn-map btn-default-selected circle-box-right d-flex-center width-50"  data-page="historical_weather_data"  data-value="map" data-sel="chartmap-select-vis">
            Map
          </div>
        </div>

        <div id="chartmap-select-wrapper" class="rounded-choice-box padding-horizontal-half padding-vertical-half default-btn-height d-flex-center width-20">
          <div class="select chartmap-select">
            <div tabindex="5007" id="chartmap-select-vis" class="select-styled" data-value="chart">Map</div>
            <ul class="select-options">
              <li tabindex="5008" data-value="chart" id="chartmap-select-chart-link" class="default-select-option" data-page="historical_weather_data"  >Chart</li>
              <li tabindex="5009" data-value="map" id="chartmap-select-map-link" class="default-select-option" data-page="historical_weather_data" >Map</li>
            </ul>
          </div>
        </div>

        <div id="downloads-select-wrapper" class="rounded-choice-box padding-left-half padding-vertical-half default-btn-height d-flex-center">
          <div class="select download-select">
            <div tabindex="5000" id="downloads-select-vis" class="select-styled" data-value="none" href="javascript:void(0);">
              <i class="fas fa-download select-icon"></i>
              <a data-value="none" class="download-link-main long-desc" href="javascript:void(0);" >Downloads</a>
              <a data-value="none" class="download-link-main short-desc" href="javascript:void(0);" >Down</a>
            </div>
            <ul class="select-options" style="display: none;">
              <div data-icon="fas fa-temperature-high select-icon" class="default-select-option-group">
                <i class="fas fa-temperature-high select-icon"></i>Temperature
              </div>
              <li tabindex="5001" data-value="download-temperature-image" data-icon="fas fa-download select-icon" href="javascript:void(0);" class="default-select-option">
                <a tabindex="5001" data-value="download-temperature-image" class="download-link" href="javascript:void(0);" >Download temperature image</a>
              </li>
              <li tabindex="5002" data-value="download-temperature-data" data-icon="fas fa-download select-icon" href="javascript:void(0);" class="default-select-option">
                <a tabindex="5002" data-value="download-temperature-data" class="download-link" href="javascript:void(0);" >Download temperature data</a>
              </li>
              <div data-icon="fas fa-cloud-rain select-icon" class="default-select-option-group">
                <i class="fas fa-cloud-rain select-icon"></i>Precipitation
              </div>
              <li tabindex="5003" data-value="download-image" data-icon="fas fa-download select-icon" href="javascript:void(0);" class="default-select-option">
                <a tabindex="5004" data-value="download-precipitation-image" class="download-link" href="javascript:void(0);" >Download precipitation image</a>
              </li>
              <li tabindex="5004" data-value="download-precipitation-observed-data" data-icon="fas fa-download select-icon" href="javascript:void(0);" class="default-select-option">
                <a tabindex="5004" data-value="download-precipitation-data" class="download-link" href="javascript:void(0);" >Download precipitation data</a>
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
        <div id="multi-chart" class="left_chart d-flex-center width-50"></div>
        <div id="multi-precip-chart" class="right_chart d-flex-center width-50"></div>
    </div>
  </div>

  <div id="station-info-row" class="d-flex-row flex-justify padding-bottom d-flex-left d-none" >
    <span id="more-info-description" class="rounded-description-box d-none" >
      <div class="more-caret d-flex-center">
        <span class="fas fa-angle-down"></span>
      </div>

      <div class="padding-default">
        <h2>Reading the historical weather charts</h2>
      </div>
      <div class="chart-info-text btn-chart-text left-padding padding-bottom-half" >Blue bars on temperature graphs indicate the range of observed temperatures for each day; the green band shows Climate Normals
        for temperature&mdash;the average temperature range at that station from 1981-2010. Blue areas on precipitation graphs
        track year-to-date cumulative precipitation; the black line shows Climate Normals for precipitation.
        Data from <a target="_blank" href="https://www.ncdc.noaa.gov/data-access/land-based-station-data/land-based-datasets/global-historical-climatology-network-ghcn">
          Global Historical Climatology Network-Daily dataset</a>,
        served by <a target="_blank"  href="http://www.rcc-acis.org/">ACIS</a>.
      </div>
      <div class="chart-info-text btn-chart-text left-padding padding-bottom-half" >Pan or zoom on these graphs to view other years. Place your cursor on either axis and then scroll, click-and-drag,
        or hold down your SHIFT key and scroll to adjust the display.
      </div>
    </span>
  </div>

</div>
<!-- </div> -->

${nav_footer(config)}
${footer(config)}

<script src="https://unpkg.com/@esri/arcgis-to-geojson-utils"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Turf.js/5.1.6/turf.min.js" integrity="sha256-Nhtik+K3xORhs5S9o0qlol4eRNB9O5OyTOJqbLucPk8=" crossorigin="anonymous"></script>
<script src="https://unpkg.com/terraformer@1.0.8/terraformer.js" integrity="sha384-+M797Pj3WZVCwMmLbOxAoaWYcKJo8NSxItmI48ytcLNeAnfn1d/IckFn31jEqrzP"
crossorigin="anonymous"></script>
<script src="https://unpkg.com/terraformer-arcgis-parser@1.0.5/terraformer-arcgis-parser.js"
integrity="sha384-duFUjKTSNoxEspdJNwr83CUgRxclf0ueKJB9DU/Vbit6bfWgzvZsHW6H1JLBBXhp" crossorigin="anonymous"></script>
<script src="/vendor/multigraph.min.js"></script>
<script type="${config.env === 'dev'? 'module':  'text/javascript'}" src="/js/historical_weather_data.js"></script>

</body>
</html>
`
