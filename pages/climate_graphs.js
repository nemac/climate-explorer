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

<body class="width-100 height-100">

${secondary_header(config)}

<div id="climate-graphs-viewport" class="padding-horizontal d-flex d-flex-column">

  <div id="search-row" class="padding-horizontal d-flex-row flex-justify padding-top padding-bottom-half d-flex-justify">

    <div class="rounded-box-secondary input-outer padding-horizontal bottom-padding default-btn-height search-box-secondary width-65">
      <input tabindex="0" id="cards-search-input" type="text" class="location-mapper input-inner-default border-none default-btn-height" autocomplete="off"
             placeholder="Enter county or city name">
      <span class="icon icon-search search-default float-right padding-default"></span>
      <div id="clear-location-wrapper" class="">
        <span id="clear-location" data-page="climate_graphs" class="fas fa-times-circle"></span>
      </div>
    </div>

    <div id="stations-select-wrapper" class="rounded-choice-box padding-horizontal default-btn-height top-select-wrapper d-flex-center disabled">
      <div class="select">
        <div id="stations-select-vis" class="select-styled disabled" data-value="none">Stations</div>
        <ul class="select-options" style="display: none;">
          <li data-value="none" class="default-select-option">Stations</li>
          <li data-value="station-1" class="default-select-option">Stations 1</li>
          <li data-value="station-2" class="default-select-option">Stations 2</li>
          <li data-value="station-3" class="default-select-option">Stations 3</li>
          <li data-value="station-4" class="default-select-option">Stations 4</li>
        </ul>
      </div>
    </div>

  </div>

  <div id="info-row" class="padding-vertical padding-horizontal width-100">
    <div class="rounded-filters-box padding-default width-100">

      <div class="filter-border-bottom d-flex-row">

        <div id="info-text-wrapper" class="width-90">
          <i class="fas fa-chart-line icon-info-box"></i>
          <span id="default-city-county" class="text-info-box"></span>
          <span id="default-dash" class="text-info-box"> - </span>
          <span id="default-chart-map-variable" class="text-info-box" data-value="tmax">Average Daily Maximum Temp (°F)</span>
        </div>

        <div id="filters-toggle" class="width-10">
          <div class="select filters-toggle-select">
            <div id="filters-toggle-select-vis" class="select-styled" data-value="filter"></div>
          </div>
        </div>

      </div>

      <div id="filters-row" class="d-flex-row flex-justify padding-top  d-flex-left">

        <div id="variable-select-wrapper" class="rounded-choice-box padding-left-half padding-vertical-half default-btn-height d-flex-center width-30">
          ${variable_selector(config)}
        </div>
        <span id="select-tip-holder">
              <span tabindex="100" data-value="select-tip" id="select-tip" class="fas fa-question padding-left-half select-tip" data-tippy-content="
                <strong>Average Daily Maximum Temperature (°F)</strong><hr/>
                A day's highest (maximum) temperature usually occurs in the afternoon. Averaging the daily high temperatures over any period results in a mean maximum temperature for that period.
                <br />
                <br />
                Maximum temperature serves as one measure of comfort and safety for people and for the health of plants and animals. When maximum temperature exceeds particular thresholds, people can become ill and transportation and energy infrastructure may be stressed.">
              </span>
            </span>

        <div id="chartmap-wrapper" class="padding-horizontal-half padding-vertical-half default-btn-height d-flex-center width-15">
          <div tabindex="100" role="button" class="btn-selector btn-chart btn-default-selected circle-box-left d-flex-center width-50" data-value="chart"
               data-page="climate_graphs" data-sel="chartmap-select-vis">
            Graph
          </div>
          <div tabindex="101" role="button" class="btn-selector btn-map btn-default circle-box-right d-flex-center width-50 btn-default-disabled" data-page="climate_maps"
               data-value="map"  data-sel="chartmap-select-vis">
            Map
          </div>
        </div>

        <div id="chartmap-select-wrapper" class="rounded-choice-box padding-left-half padding-vertical-half default-btn-height d-flex-center width-15">
          <div class="select chartmap-select">
            <div tabindex="102" id="chartmap-select-vis" class="select-styled" data-value="chart">Chart</div>
            <ul class="select-options">
              <li tabindex="103" id="chartmap-select-chart-link" data-value="chart" class="default-select-option" data-page="climate_graphs"
                  >Chart
              </li>
              <li tabindex="104" id=chartmap-select-map-link"" data-value="map" class="default-select-option" data-page="climate_maps"
                  >Map
              </li>
            </ul>
            </ul>
          </div>
        </div>

        <div id="time-wrapper" class="padding-left-half padding-vertical-half default-btn-height d-flex-center width-15">
          <div tabindex="105" role="button" class="btn-selector btn-annual btn-default-selected circle-box-left d-flex-center width-50" data-value="annual"
               data-sel="time-select-vis">
            Annual
          </div>
          <div tabindex="106" role="button" class="btn-selector btn-monthly btn-default circle-box-right d-flex-center width-50" data-value="monthly"
               data-sel="time-select-vis">
            Monthly
          </div>
        </div>

        <div id="time-select-wrapper" class="rounded-choice-box padding-left-half padding-vertical-half default-btn-height d-flex-center width-15">
          <div class="select time-select">
            <div tabindex="107" id="time-select-vis" class="select-styled" data-value="annual">Annual</div>
            <ul class="select-options">
              <li tabindex="108" data-value="annual" class="default-select-option">Annual</li>
              <li tabindex="109" data-value="monthly" class="default-select-option">Monthly</li>
            </ul>
          </div>
        </div>

        <div id="downloads-select-wrapper" class="rounded-choice-box padding-left-half padding-vertical-half default-btn-height d-flex-center">

          <div tabindex="109" class="select download-select">
            <div tabindex="109" id="downloads-select-vis" class="select-styled" data-value="none" href="javascript:void(0);">
              <i class="fas fa-download select-icon"></i>
              <a tabindex="109" data-value="none" class="download-link-main long-desc" href="javascript:void(0);">Downloads</a>
              <a tabindex="109" data-value="none" class="download-link-main short-desc" href="javascript:void(0);">Down</a>
            </div>
            <ul class="select-options" style="display: none;">
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
<script src="https://cdnjs.cloudflare.com/ajax/libs/plotly.js/1.58.4/plotly-basic.min.js"
        integrity="sha512-7S1p+6A2VVIWu+EevZqeqXWos1Tn+mroZxpkZ9THWipecJkL7TLg2myv5cIAShu9j3+fjHyCvEh/d7BKegMY1g==" crossorigin="anonymous"></script>
<script>
  window.climate_by_location_config = {areas_json_url: 'https://crt-climate-explorer.nemac.org/data/ce_areas.json'}
</script>
<script type="text/javascript" src="/vendor/climate_by_location.climate_explorer.bundle.js"></script>
<script src="https://unpkg.com/terraformer@1.0.8/terraformer.js" integrity="sha384-+M797Pj3WZVCwMmLbOxAoaWYcKJo8NSxItmI48ytcLNeAnfn1d/IckFn31jEqrzP"
        crossorigin="anonymous"></script>
<script src="https://unpkg.com/terraformer-arcgis-parser@1.0.5/terraformer-arcgis-parser.js"
        integrity="sha384-duFUjKTSNoxEspdJNwr83CUgRxclf0ueKJB9DU/Vbit6bfWgzvZsHW6H1JLBBXhp" crossorigin="anonymous"></script>
<script type="${config.env === 'dev'? 'module':  'text/javascript'}" src="/js/climate_graphs.js"></script>

</body>
</html>
`
