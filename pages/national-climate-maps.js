import head from '../template/head'
import secondary_header from '../template/secondary_header';
import variable_selector from '../template/variable-selector';
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

<body class="width-100 height-100">

  ${secondary_header(config)}
    <div id="local-climate-maps-viewport" class="padding-horizontal d-flex d-flex-column">

      <div id="search-row" class="padding-horizontal d-flex-row flex-justify padding-top padding-bottom-half d-flex-justify" >

        <div class="rounded-box-secondary input-outer padding-horizontal bottom-padding default-btn-height search-box-secondary width-40">
          <input tabindex="1" id="cards-search-input" type="text" class="location-mapper input-inner-default border-none default-btn-height" autocomplete="off" placeholder="Enter county, city, or zip code">
          <span class="icon icon-search search-default float-right padding-default"></span>
          <div id="clear-location-wrapper" class="">
            <span id="clear-location" data-page="national-climate-maps" class="fas fa-times-circle"></span>
          </div>
        </div>


        <div id="stations-select-wrapper" class="rounded-choice-box padding-horizontal default-btn-height top-select-wrapper d-flex-center disabled">
          <div class="select">
            <div tabindex="2" id="stations-select-vis" class="select-styled disabled" data-value="none">Stations</div>
            <ul class="select-options" style="display: none;">
              <li tabindex="3" data-value="none" class="default-select-option">Stations</li>
              <li tabindex="4" data-value="station-1" class="default-select-option">Stations 1</li>
              <li tabindex="5" data-value="station-2" class="default-select-option">Stations 2</li>
              <li tabindex="6" data-value="station-3" class="default-select-option">Stations 3</li>
              <li tabindex="7" data-value="station-4" class="default-select-option">Stations 4</li>
            </ul>
          </div>
        </div>

        <div id="downloads-select-wrapper" class="rounded-choice-box padding-horizontal default-btn-height top-select-wrapper d-flex-center">

          <div class="select download-select">
            <div tabindex="8" id="downloads-select-vis" class="select-styled" data-value="none" >
              <i class="fas fa-download select-icon"></i>
              <a data-value="none" href="javascript:void(0);" >Downloads</a>
            </div>
            <ul class="select-options" style="display: none;">
              <li data-value="download-lefttmap-image" data-icon="fas fa-download select-icon" href="javascript:void(0);" class="default-select-option">
                <a tabindex="9" data-value="download-lefttmap-image" class="download-link" href="javascript:void(0);" >Download left map as image</a>
              </li>
              <li data-value="download-rightmap-image" data-icon="fas fa-download select-icon" href="javascript:void(0);" class="default-select-option">
                <a tabindex="10" data-value="download-rightmap-image" class="download-link" href="javascript:void(0);" >Download right map as image</a>
              </li>
            </ul>
          </div>
        </div>

      </div>

      <div id="info-row" class="padding-vertical width-100" >
        <div class="rounded-filters-box padding-default width-100">

          <div class="filter-border-bottom d-flex-row">

            <div id="info-text-wrapper" class="width-90">
              <i class="stateface stateface-us icon-info-box"></i>
              <span id="default-city-county" class="text-info-box"></span>
              <span id="default-dash" class="text-info-box" > - </span>
              <span id="default-chart-map-variable" class="text-info-box" data-value="tmax">Average Daily Maximum Temp (°F)</span>
            </div>

            <div id="filters-toggle" class="width-10">
              <div class="select filters-toggle-select">
                <div tabindex="11" id="filters-toggle-select-vis" class="select-styled" data-value="filter"></div>
              </div>
            </div>

          </div>

          <div id="filters-row" class="d-flex-row flex-justify padding-top padding-bottom d-flex-left" >

            <div id="variable-select-wrapper" class="rounded-choice-box padding-horizontal-half padding-vertical-half default-btn-height d-flex-center width-30">
              ${variable_selector(config)}
            </div>

            <a id="national-climate-maps-secretlink-forcharts" href="/local-climate-charts" class="d-none"></a>

            <div id="time-wrapper" class="padding-horizontal-half padding-vertical-half default-btn-height d-flex-center width-30">
              <div tabindex="101" role="button" class="btn-selector btn-annual btn-default-selected circle-box-left d-flex-center width-50" data-value="annual" data-sel="time-select-vis">
                Annual
              </div>
              <div tabindex="102" role="button" class="btn-selector btn-spring btn-default circle-box-middle d-flex-center width-50" data-value="spring" data-sel="time-select-vis" >
                Spring
              </div>
              <div tabindex="103" role="button" class="btn-selector btn-summer btn-default circle-box-middle d-flex-center width-50" data-value="summer" data-sel="time-select-vis" >
                Summer
              </div>
              <div tabindex="104" role="button" class="btn-selector btn-fall btn-default circle-box-middle d-flex-center width-50" data-value="fall" data-sel="time-select-vis" >
                Fall
              </div>
              <div tabindex="105" role="button" class="btn-selector btn-winter btn-default circle-box-right d-flex-center width-50" data-value="winter" data-sel="time-select-vis" >
                Winter
              </div>
            </div>

            <div id="time-select-wrapper" class="rounded-choice-box padding-horizontal-half padding-vertical-half default-btn-height d-flex-center width-20">
              <div class="select time-select">
                <div tabindex="106" id="time-select-vis" class="select-styled" data-value="Annual">Annual</div>
                <ul class="select-options">
                  <li tabindex="107" data-value="annual" class="default-select-option">Annual</li>
                  <li tabindex="108" data-value="spring" class="default-select-option">Spring</li>
                  <li tabindex="109" data-value="summer" class="default-select-option">Summer</li>
                  <li tabindex="110" data-value="fall" class="default-select-option">Fall</li>
                  <li tabindex="111" data-value="winter" class="default-select-option">Winter</li>
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
            <div id="temperature-map" class="map-element"></div>
            <div id="map-message" class="map-nodata-message d-none"></div>
          </div>

      </div>
      </div>
    </div>

${nav_footer(config)}
${footer(config)}

<script src="https://cdnjs.cloudflare.com/ajax/libs/Turf.js/5.1.6/turf.min.js" integrity="sha256-Nhtik+K3xORhs5S9o0qlol4eRNB9O5OyTOJqbLucPk8=" crossorigin="anonymous"></script>
<script src="https://unpkg.com/terraformer@1.0.8/terraformer.js" integrity="sha384-+M797Pj3WZVCwMmLbOxAoaWYcKJo8NSxItmI48ytcLNeAnfn1d/IckFn31jEqrzP"
        crossorigin="anonymous"></script>
<script src="https://unpkg.com/terraformer-arcgis-parser@1.0.5/terraformer-arcgis-parser.js"
        integrity="sha384-duFUjKTSNoxEspdJNwr83CUgRxclf0ueKJB9DU/Vbit6bfWgzvZsHW6H1JLBBXhp" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js" integrity="sha256-c3RzsUWg+y2XljunEQS0LqWdQ04X1D3j22fd/8JCAKw=" crossorigin="anonymous"></script>
<script type="text/javascript" src="/js/scenarioComparisonMap.js"></script>
<script type="text/javascript" src="/js/ce3-ui-components.js"></script>
<script type="text/javascript" src="/js/local-climate-maps.js"></script>
<script type="text/javascript" src="/js/secondary_header.js"></script>

</body>
</html>
`
