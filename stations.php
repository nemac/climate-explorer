<?php
$lockdown = 0;
include_once('functions.php');
$page_slug = basename(__FILE__, '.php');
$active_station = isset($_GET['id']) ? $purifier->purify($_GET['id']) : '';
$zoom = isset($_GET['zoom']) ? $purifier->purify($_GET['zoom']) : '';
$center = isset($_GET['center']) ? $purifier->purify($_GET['center']) : '';
// ensure center exists first
if ($center) {
  // separate both parts
  $validCenter = explode(',', $center);
  // ensure it's a number, error if not
  if (!is_numeric($validCenter[0])) {
    header("Location:/error.php?1");
  }
  // ensure it's a number, error if not
  if (!is_numeric($validCenter[1])) {
    header("Location:/error.php?2");
  }
}
if ($zoom) {
  // ensure it's a number, error if not
  if (!is_numeric($zoom)) {
    header("Location:/error.php?3");
  }
}
if ($active_station) {
  if (!validate_alphanumeric_underscore($active_station)) {
    header("Location:/error.php?123");
  }
}
else {
  if ($current_url != strip_tags(rawurldecode($current_url))) {
    if ($current_url != $current_domain . "/error.php?12") {
      header("Location:/error.php?11");
    }
  }
}
//if (!$zoom) {
//  $cut_url = trim(substr($current_url, 0, strpos($current_url, $active_station))) . $active_station;
//}
//// check current url vs cut url
//if ($cut_url == $current_url) {
//  // do nothing because it wasn't modified
//}
//else {
//  if (isset($cut_url)) {
//    header("Location:/error.php?5");
//  }
//}
?>
<!doctype html>
<html>
<head>
  <title>Climate Explorer</title>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="/resources/css/ol.css">
  <link rel="stylesheet" href="/resources/css/ol3-popup.css">
  <link rel="stylesheet" href="/resources/css/sweetalert.css">
  <link rel="stylesheet" media="screen" href="/resources/css/screen.css">
  <link rel="stylesheet" media="screen" href="/resources/css/mods.css">
  <?php
  $share_data['url'] = current_URL();
  $share_data['title'] = 'Stations';
  echo opengraph_output($share_data);
  ?>
  <link rel="stylesheet" href="https://js.arcgis.com/4.6/esri/css/main.css">

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
      <select class="dropdown" id="stations-options">
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
<!--todo review mobile support-->
<div id="desktop-warning">
  <p>The Climate Explorer is optimized for desktop use. Please visit the site on a desktop computer.</p>
</div>

<!-- START:JS_LOADER -->

<script type="text/javascript" src="/resources/js/jquery.min.js"></script>
<script type="text/javascript" src="/resources/js/jquery-ui.min.js"></script>

<script>
  var s = document.createElement("script");
  s.type = "text/javascript";
  if (window.location.hostname == 'climate.toolkit.gov') {
    s.src = "https://maps.googleapis.com/maps/api/js?sensor=false&amp;libraries=places&client=gme-noaa&channel=OAR.CLIMATE_GOV_CLIMATE_EXPLORER2"
  }
  else {
    s.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBSjujKAutsVyR0GcsfXJvGA-J-54zWT2U&libraries=places"
  }
  $("head")[0].appendChild(s);
</script>
<script src="/resources/item/jquery.fl-item.min.js"></script>

<script type="text/javascript" src="/resources/js/lodash.js"></script>
<!--<script type="text/javascript" src="/resources/js/proj4.js"></script>-->
<!--todo minify shared js dependencies-->
<script type="text/javascript" src="/resources/js/chart/chart.core.js"></script>
<script type="text/javascript" src="/resources/js/chart/chart.line.js"></script>

<script type="text/javascript" src="/resources/js/formstone/core.js"></script>
<script type="text/javascript" src="/resources/js/formstone/mediaquery.js"></script>
<script type="text/javascript" src="/resources/js/formstone/touch.js"></script>
<script type="text/javascript" src="/resources/js/formstone/scrollbar.js"></script>
<script type="text/javascript" src="/resources/js/formstone/dropdown.js"></script>
<script type="text/javascript" src="/resources/js/formstone/equalize.js"></script>
<script type="text/javascript" src="/resources/js/formstone/swap.js"></script>
<script type="text/javascript" src="/resources/js/formstone/tabs.js"></script>

<script type="text/javascript" src="/resources/js/lc_switch.min.js"></script>
<script type="text/javascript" src="/resources/js/jquery.cycle2.min.js"></script>
<script type="text/javascript" src="/resources/js/jquery.waypoints.min.js"></script>
<script type="text/javascript" src="/resources/js/jquery.waypoints.sticky.min.js"></script>
<script type="text/javascript" src="/resources/js/split-pane.min.js"></script>
<script type="text/javascript" src="/resources/js/download.js"></script>
<script type="text/javascript" src="/resources/js/jquery.hoverintent.min.js"></script>

<script type="text/javascript" src="/resources/js/tether.js"></script>
<script type="text/javascript" src="/resources/js/shepherd.min.js"></script>
<script type="text/javascript" src="/resources/js/cwg/climate-widget-graph.js"></script>

<script type="text/javascript" src="/resources/js/cwg/cwg.js"></script>

<script type="text/javascript" src="/resources/js/sweetalert.min.js"></script>

<!--<script type="text/javascript" src="/resources/js/ol.js"></script>-->
<!--<script type="text/javascript" src="/resources/js/ol3-popup.js"></script>-->
<script type="text/javascript" defer src="/resources/js/main.js"></script>

<!-- if CASE -->
<?php if (isset($case) && !is_null($case) && $page_slug == 'case') { ?>
  <script type="text/javascript" src="/resources/js/multigraph-nojq.min.js"></script>
  <script type="text/javascript" src="/resources/js/impacts.js"></script>
  <script>
    $(document).ready(function () {
      impacts = new Impacts(<?php echo "'" . $case . "'"; ?>, <?php echo "'" . $data_base_url . "'"; ?>);
    });
  </script>

<?php } ?>


<script src="/resources/js/formmapper.js"></script>
-->

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.1/Chart.bundle.min.js"
        integrity="sha256-N4u5BjTLNwmGul6RgLoESPNqDFVUibVuOYhP4gJgrew=" crossorigin="anonymous"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js"
        integrity="sha256-8E6QUcFg1KTnpEU8TFGhpTGHw5fJqB9vCms3OhAYLqw=" crossorigin="anonymous"></script>

<script type="text/javascript" src="/resources/js/station-charts.js"></script>
<script type="text/javascript" src="/resources/js/global_functions.js"></script>

<?php if (isset($active_station) && $active_station != null) { ?>
  <script>
    $(document).ready(function () {

      window.stations = $('#stations-map').stationsMap({stationId: <?php echo "'" . $active_station . "'"; ?>});

    });
  </script>
<?php } ?>

<script>
  $(document).ready(function () {
    app = new App(<?php echo "'" . $data_base_url . "'"; ?>);
  });
</script>

<!-- END:JS_LOADER -->


<script>


  $('#threshold').change(function () {
    $("#item-chart-container").item({threshold: parseFloat($('#threshold').val())}).item('update');
  });

  $('#station').change(function () {
    $("#item-chart-container").item('option', 'station', $('#station').val()).item('update');
  });


  // when #variable changes, update ui units and apply sensible defaults.
  $('#itemvariable').change(function (e) {
    var queryElements = void 0,
      missingValueTreatment = void 0,
      windowFunction = void 0;
    switch ($('#itemvariable').val()) {
      case 'precipitation':
        $('#thresholdUnits').text('in');
        $('#threshold').val(1.0);
        $('#item_inches_or_f').text('inches');
        break;
      case 'tmax':
        $('#thresholdUnits').text('F');
        $('#threshold').val(95);
        $('#item_inches_or_f').text('°F');
        break;
      case 'tmin':
        $('#thresholdUnits').text('F');
        $('#threshold').val(32);
        $('#item_inches_or_f').html('°F');
        break;
      case 'tavg':
        $('#thresholdUnits').text('F');
        $('#threshold').val(70);
        $('#item_inches_or_f').text('°F');
        break;
    }
    $("#item-chart-container").item({
      threshold: parseFloat($('#threshold').val()),
      variable: $('#itemvariable option:selected').val()
    }).item('update');
  });

  $('#percentileThreshold').change(function () {

    var value = $('#percentileThreshold').val();
    if (value === '') {
      return;
    }

    if (value <= 0 || value >= 100) {
      $('#percentileThreshold').addClass('form-control-danger');
      return;
    }

    $('#threshold').val($("#item-chart-container").item('getPercentileValue', value)).trigger('change');

  });

  $('#window').change(function () {
    $("#item-chart-container").item({window: parseInt($('#window').val())});
    $("#item-chart-container").item('update');
  });

</script>

<!-- polyfill for promises -->
<script type="text/javascript" src="/resources/js/es6-promise.auto.min.js"></script>
<script type="text/javascript" src="/resources/js/es6-promise.min.js"></script>

<script type="text/javascript" src="/resources/js/stations.js"></script>
<script src="/resources/tidal/tidalstationswidget.js"></script>
<?php //include_once('template/arcgis-shim.php'); ?>

</body>
</html>
