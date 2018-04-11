<!doctype html>
<html>
<head>
  <title>Climate Explorer</title>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <link rel="stylesheet" href="/resources/css/sweetalert.css">
  <link rel="stylesheet" media="screen" href="/resources/css/screen.css">
  <link rel="stylesheet" media="screen" href="/resources/css/mods.css">

  <script type="text/javascript" src="/resources/js/jquery.min.js"></script>
  <script type="text/javascript" src="/resources/js/jquery-ui.min.js"></script>

  <meta property="fb:app_id" content="187816851587993">
  <!--  todo absolute url-->
  <meta property="og:url" content="/stations.php"/>
  <meta property="og:type" content="article">
  <meta property="og:title" content="Variables">
  <meta property="og:description"
        content="The Climate Explorer allows you to view historical and projected climate trends and assess the impacts of climate change on the things you care about">
  <meta property="og:image" content="/resources/img/og.jpg">

  <link rel="stylesheet" href="https://js.arcgis.com/4.6/esri/css/main.css">
  <script>
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = window.location.hostname === 'climate.toolkit.gov' ?
      "https://maps.googleapis.com/maps/api/js?sensor=false&amp;libraries=places&client=gme-noaa&channel=OAR.CLIMATE_GOV_CLIMATE_EXPLORER2" :
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyBSjujKAutsVyR0GcsfXJvGA-J-54zWT2U&libraries=places";
    document.head.appendChild(s);
  </script>
</head>

<body id="page-stations" class="page-type-stations">
<div class="cd-cover-layer"></div>
<?php include_once('template/header.php'); ?>

<header id="left-header">
  <span class="trigger icon icon-close" id="left-header-trigger"></span>

  <ul id="vars-menu" class="menu blue-menu">
    <li class="search-field border" id="stations-search-by-location"><span class="icon icon-search"></span>
      <input type="text" id="formmapper" placeholder="Zoom to location">
    </li>

    <li class="select border" id="stations-options-container">
      <select title="" class="dropdown" id="stations-options">
        <option value="daily_vs_climate">Daily vs. Climate</option>
        <option value="thresholds">Thresholds</option>
        <option value="high_tide_flooding">High-tide Flooding</option>

      </select>
    </li>

    <li class="about-link"><a href="#detail-daily_vs_climate" class="nav-detail-link" id="about-stations-link">About Daily vs.
        Climate</a></li>
  </ul>

  <div id="vars-legend" class="legend-wrap left-filler"></div>
</header>

<div id="viewport">
  <div id="main-content-wrap">

    <div id="stations-map"></div>

    <?php include_once('template/share.php'); ?>

    <!-- begin weather stations map -->

    <div id="stations-spinner"></div>

    <div id="station-overlay-container"></div>

  </div>
</div>

<div id="desktop-warning">
  <p>The Climate Explorer is optimized for desktop use. Please visit the site on a desktop computer.</p>
</div>

<!-- START:JS_LOADER -->

<script src="/resources/item/jquery.fl-item.min.js"></script>

<script type="text/javascript" src="/resources/js/lodash.js"></script>

<script type="text/javascript" src="/resources/js/chart/chart.core.js"></script>
<script type="text/javascript" src="/resources/js/chart/chart.line.js"></script>

<script type="text/javascript" src="/resources/js/formstone/core.js"></script>
<script type="text/javascript" src="/resources/js/formstone/mediaquery.js"></script>
<script type="text/javascript" src="/resources/js/formstone/touch.js"></script>
<script type="text/javascript" src="/resources/js/formstone/scrollbar.js"></script>
<script type="text/javascript" src="/resources/js/formstone/dropdown.js"></script>
<script type="text/javascript" src="/resources/js/formstone/equalize.js"></script>
<script type="text/javascript" src="/resources/js/formstone/swap.js"></script>

<script type="text/javascript" src="/resources/js/lc_switch.min.js"></script>
<script type="text/javascript" src="/resources/js/jquery.cycle2.min.js"></script>
<script type="text/javascript" src="/resources/js/jquery.waypoints.min.js"></script>
<script type="text/javascript" src="/resources/js/jquery.waypoints.sticky.min.js"></script>
<script type="text/javascript" src="/resources/js/split-pane.min.js"></script>
<script type="text/javascript" src="/resources/js/download.js"></script>
<script type="text/javascript" src="/resources/js/jquery.hoverintent.min.js"></script>

<script type="text/javascript" src="/resources/js/tether.js"></script>
<script type="text/javascript" src="/resources/js/shepherd.min.js"></script>
<script type="text/javascript" src="/resources/js/stations.js"></script>
<script  type="text/javascript"  src="/resources/tidal/tidalstationswidget.js"></script>
<script type="text/javascript" src="/resources/js/cwg/climate-widget-graph.js"></script>

<script type="text/javascript" src="/resources/js/cwg/cwg.js"></script>

<script type="text/javascript" src="/resources/js/sweetalert.min.js"></script>

<script type="text/javascript" src="/resources/js/es6-promise.auto.min.js"></script>
<script type="text/javascript" src="/resources/js/es6-promise.min.js"></script>

<script type="text/javascript" defer src="/resources/js/main.js"></script>


<script src="/resources/js/formmapper.js"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.1/Chart.bundle.min.js"
        integrity="sha256-N4u5BjTLNwmGul6RgLoESPNqDFVUibVuOYhP4gJgrew=" crossorigin="anonymous"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js"
        integrity="sha256-8E6QUcFg1KTnpEU8TFGhpTGHw5fJqB9vCms3OhAYLqw=" crossorigin="anonymous"></script>

<script type="text/javascript" src="/resources/js/station-charts.js"></script>
<script type="text/javascript" src="/resources/js/global_functions.js"></script>


<script>
  if (undefined === window.ce) {window.ce = {};}
  $(document).ready(function () {
    app = new App(<?php echo "'" . $data_base_url . "'"; ?>);
  });
  $(document).ready(function () {
    window.stations = $('#stations-map').stationsMap({stationId: window.ce.stationId, mode: window.ce.case});
  });
  $(document).ready(function () {
    var initFormMapper = function () {
      $("#formmapper").formmapper({
        details: "form"
      });

      $("#formmapper").bind("geocode:result", function (event, result) {
        if (result.geometry.access_points) {
          window.stations.stationsMap({
            extent: null,
            center: [result.geometry.access_points[0].location.lat, result.geometry.access_points[0].location.lng],
            zoom: 8
          });
        } else {
          window.stations.stationsMap({extent: null, center: [result.geometry.location.lat(), result.geometry.location.lng()], zoom: 8});
        }
      });
    };
    var whenFormMapper = function () {
      if (window.google !== undefined) {
        initFormMapper();
      }
      else {
        setTimeout(whenFormMapper);
      }
    };
    whenFormMapper();

    $('#stations-options-container .fs-dropdown-item').on('click', function (e) {
      window.stations.stationsMap({mode: $(this).data().value});
      // update about link
      $('#about-stations-link').html('About ' + $(this).text());
      $('#about-stations-link').prop('href', '#detail-' + $(this).data().value);

      $('#breadcrumb .current').html($(this).text());
    });

    $('#stations-options').on('change', function () {
      $("#chart-name").html($('.fs-dropdown-selected').html());
    });
  });
</script>

<!-- END:JS_LOADER -->


</body>
</html>
