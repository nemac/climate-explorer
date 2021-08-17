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
  <meta property="og:url" content="high_tide_flooding">
  <meta property="og:type" content="article">
  <meta property="og:title" content="Location data for Buncombe County, NC">
  <meta property="og:description" content="The Climate Explorer allows you to view historical and projected climate variables and assess the impacts of climate change on the things you care about">
  <meta property="og:image" content="/img/og.jpg">
</head>

<body class="width-100 height-100">

  ${secondary_header(config)}

  <div id="high-tide-flooding-viewport" class="padding-horizontal d-flex d-flex-column">

    <div id="search-row" class="padding-horizontal d-flex-row flex-justify padding-top padding-bottom-half d-flex-justify" >

      <div class="rounded-box-secondary input-outer padding-horizontal bottom-padding default-btn-height search-box-secondary width-65">
        <input tabindex="1" id="cards-search-input" type="text" class="location-mapper input-inner-default border-none default-btn-height" autocomplete="off" placeholder="Enter county or city name">
        <span class="icon icon-search search-default float-right padding-default"></span>
        <div id="clear-location-wrapper" class="">
          <span id="clear-location" data-page="high_tide_flooding" class="fas fa-times-circle"></span>
        </div>
      </div>

      <div id="stations-select-wrapper" class="rounded-choice-box padding-horizontal default-btn-height top-select-wrapper d-flex-center">
        <div class="select stations-select">
          <div tabindex="20" id="stations-select-vis" class="select-styled" data-value="">Stations</div>
          <ul class="select-options" role="listbox">
            <li tabindex="21" data-value="" class="default-select-option"></li>
          </ul>
        </div>
      </div>

    </div>

    <div id="info-row" class="padding-vertical padding-horizontal width-100" >
      <div class="rounded-filters-box padding-default width-100">

        <div class="filter-border-bottom d-flex-row">

          <div id="info-text-wrapper" class="width-90">
            <i class="fas fa-water icon-info-box"></i>
            <span id="station-info-none" class="padding-horizontal"><strong>Please select a station on the map or from the Stations dropdown menu. You may need to zoom out to see more stations.</strong></span>
            <span id="station-info" class="padding-horizontal d-none">
              <span id="default-station-label" class="text-info-box label" >Station id: </span>
              <span id="default-station" class="text-info-box data right-padding" ></span>
              <span id="default-station-id-label" class="text-info-box label" >Station: </span>
              <span id="default-station-id" class="text-info-box data right-padding" ></span>
              <span id="default-stationMOverMHHW-label" class="text-info-box label" >Local threshold: </span>
              <span id="default-stationMOverMHHW" class="text-info-box data right-padding" ></span>
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
            <div tabindex="5004" role="button" class="btn-selector btn-chart btn-default circle-box-left d-flex-center width-50 btn-default-disabled" data-value="chart" data-page="high_tide_flooding" data-sel="chartmap-select-vis">
              Graph
            </div>
            <div tabindex="5005" role="button" class="btn-selector btn-map btn-default-selected circle-box-right d-flex-center width-50"  data-page="high_tide_flooding"  data-value="map" data-sel="chartmap-select-vis">
              Map
            </div>
          </div>

          <div id="chartmap-select-wrapper" class="rounded-choice-box padding-horizontal-half padding-vertical-half default-btn-height d-flex-center width-20">
            <div class="select chartmap-select">
              <div tabindex="5006" id="chartmap-select-vis" class="select-styled" data-value="chart">Map</div>
              <ul class="select-options" role="radiogroup">
                <li role="radio" tabindex="5007" id="chartmap-select-chart-link" data-value="chart" class="default-select-option" data-page="high_tide_flooding">Chart</li>
                <li role="radio" tabindex="5008" id="chartmap-select-map-link" data-value="map" class="default-select-option" data-page="high_tide_flooding">Map</li>
              </ul>
            </div>
          </div>

          <div id="tidalzoom-wrapper" class="padding-horizontal-half padding-vertical-half default-btn-height d-flex-center width-30">
            <div tabindex="5009" id="btn-tidalzoom" class="btn-tidalzoom-h btn-default circle-box-left d-flex-center width-90 btn-default-disabled" data-value="Historical" >
              Historical
            </div>
            <div tabindex="5010" id="btn-tidalzoom" class="btn-tidalzoom-hm btn-default circle-box-right d-flex-center width-90 btn-default-disabled" data-value="Historical and Modeled" >
              Historical & Modeled
            </div>
          </div>

          <div id="tidalzoom-select-wrapper" class="rounded-choice-box padding-horizontal-half padding-vertical-half default-btn-height d-flex-center width-20">
            <div class="select tidalzoom-select">
              <div tabindex="5011" id="tidalzoom-select-vis" class="select-styled" data-value="hm">Historical & Modeled</div>
              <ul class="select-options">
                <li tabindex="5012" id="tidalzoom-select-chart-link" data-value="hm" class="default-select-option" data-page="high_tide_flooding">Historical & Modeled</li>
                <li tabindex="5013" id="tidalzoom-select-map-link" data-value="h" class="default-select-option" data-page="high_tide_flooding" >Historical</li>
              </ul>
            </div>
          </div>

          <div id="downloads-select-wrapper" class="rounded-choice-box padding-left-half padding-vertical-half default-btn-height d-flex-center">
            <div class="select download-select">
              <div tabindex="5001" id="downloads-select-vis" class="select-styled" data-value="none" href="javascript:void(0);">
                <i class="fas fa-download select-icon"></i>
                <span class="download-link-main long-desc" >Downloads</span>
                <span class="download-link-main short-desc">Down</span>
              </div>
              <ul class="select-options" style="display: none;">
                <li data-value="download-tidal-image" data-icon="fas fa-download select-icon" href="javascript:void(0);" class="default-select-option">
                  <a tabindex="5002" data-value="download-tidal-image" class="download-link" href="javascript:void(0);" >Download tidal flooding image</a>
                </li>
                <li data-value="download-tidal-data" data-icon="fas fa-download select-icon" href="javascript:void(0);" class="default-select-option">
                  <a tabindex="5003" data-value="download-tidal-data" class="download-link" href="https://tidesandcurrents.noaa.gov/publications/techrpt86_PaP_of_HTFlooding.csv" >Download tidal flooding data</a>
                </li>
              </ul>
            </div>
          </div>

          <div tabindex="5011" id="chart-info-row-btn" class="rounded-choice-box padding-left-half padding-vertical-half default-btn-height d-flex-center" >
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
        <div id="tidal-chart" class="tidal-chart d-flex-center width-100">
        </div>
      </div>
    </div>

    <div id="station-info-row" class="d-flex-row flex-justify padding-bottom d-flex-left d-none" >
      <span id="more-info-description" class="rounded-description-box d-none" >
        <div class="more-caret d-flex-center">
          <span class="fas fa-angle-down"></span>
        </div>

        <div class="padding-default">
          <h2>Reading the tidal flooding charts</h2>
        </div>
        <div class="chart-info-text btn-chart-text left-padding padding-bottom-half" >Click 'Historical' button to zoom in on or out from the observational period.
          Place your cursor over the curves on this graph for details. Gray bars from 1950 to 2016 show observed annual
          counts of high-tide flooding. Red and blue curves show the average number of high-tide flooding events projected
          for future years under two scenarios. Data from
          <a target="_blank" href="https://tidesandcurrents.noaa.gov/publications/techrpt86_PaP_of_HTFlooding.pdf">
            NOAA Technical Report NOS CO-OPS 086 - Patterns and Projections of High-Tide Flooding
          </a>.
        </div>
      </span>
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

    <script type="${config.env === 'dev'? 'module':  'text/javascript'}" src="/js/high_tide_flooding.js"></script>
  </body>
  </html>
`
