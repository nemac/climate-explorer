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
    (function () {
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.src = window.location.hostname === 'climate.toolkit.gov' ?
        "https://maps.googleapis.com/maps/api/js?sensor=false&amp;libraries=places&client=gme-noaa&channel=OAR.CLIMATE_GOV_CLIMATE_EXPLORER2" :
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyBSjujKAutsVyR0GcsfXJvGA-J-54zWT2U&libraries=places";
      document.head.appendChild(s);
    })();
  </script>
</head>

<body id="page-variables" class="page-type-variables">
<div class="cd-cover-layer"></div>
<?php include_once('template/header.php'); ?>

<div id="download-panel" class="download-panel overlay">
  <div class="download-inner">
    <a href="javascript:void(0);" id="download-dismiss-button" class="icon icon-close"></a>
    <p>Use the following links to download this graph's data:</p>
    <ul>
      <li>
        <a href="javascript:void(0);" id="download_hist_obs_data" class='button display-block border-white hover-bg-white'>
          <span class='icon icon-arrow-down'></span>Observed Data</a>
      </li>
      <li><a href="javascript:void(0);" id="download_hist_mod_data" class='button display-block border-white hover-bg-white'>
          <span class='icon icon-arrow-down'></span>Historical Modeled Data</a>
      </li>
      <li><a href="javascript:void(0);" id="download_proj_mod_data" class='button display-block border-white hover-bg-white'>
          <span class='icon icon-arrow-down'></span>Projected Modeled Data</a>
      </li>
    </ul>
  </div>
</div>


<header id="left-header">
  <span class="trigger icon icon-close" id="left-header-trigger"></span>

  <ul id="vars-menu" class="menu blue-menu">
    <li class="search-field border" id="variable-search-by-location">
      <span class="icon icon-search"></span><input type="text" id="formmapper" placeholder="Zoom to location">
    </li>

    <li class="toggle border" id="variable-counties-toggle">
      <label for="counties-overlay-toggle"><span class="text">Data by Counties</span>
        <input type="checkbox" name="counties-overlay-toggle" id="counties-overlay-toggle" value="1" autocomplete="off">
      </label>
      <div id="info-counties" class="layer-info">

        <div class="actions">
          <a href="#" class="layer-info-close"><span class="icon icon-close"></span>Close</a>
          <a href="#" class="layer-info-next"><span class="icon icon-arrow-right"></span>Next</a>
        </div>
      </div>
    </li>

    <li class="select border" id="variable-options-container">
      <select class="dropdown" id="variable-options" title="Variable">
        <option value="tmax">Avg Daily Max Temp (°F)</option>
        <option value="tmin">Avg Daily Min Temp (°F)</option>
        <option value="days_tmax_gt_90f">Days w/ max &gt; 90°F</option>
        <option value="days_tmax_gt_95f">Days w/ max &gt; 95°F</option>
        <option value="days_tmax_gt_100f">Days w/ max &gt; 100°F</option>
        <option value="days_tmax_gt_105f">Days w/ max &gt; 105°F</option>
        <option value="days_tmax_lt_32f">Days w/ max &lt; 32°F</option>
        <option value="days_tmin_lt_32f">Days w/ min &lt; 32°F</option>
        <option value="days_tmin_gt_80f">Days w/ min &gt; 80°F</option>
        <option value="days_tmin_gt_90f">Days w/ min &gt; 90°F</option>
        <option value="pcpn">Total precip</option>
        <option value="days_pcpn_gt_1in">Days w/ &gt; 1 in</option>
        <option value="days_pcpn_gt_2in">Days w/ &gt; 2 in</option>
        <option value="days_pcpn_gt_3in">Days w/ &gt; 3 in</option>
        <option value="days_dry_days">Dry Days</option>
        <option value="hdd_65f">Heating Degree Days</option>
        <option value="cdd_65f">Cooling Degree Days</option>
        <option value="gdd">Growing Degree Days</option>
        <option value="gddmod">Mod. Growing Degree Days</option>
      </select>
    </li>
    <li class="select border" id="map-seasons-container">
      <select class="dropdown" id="map-season" title="Season">
        <option value="summer">Summer (Jun-Aug)</option>
        <option value="fall">Fall (Sep-Nov)</option>
        <option value="winter">Winter (Dec-Feb)</option>
        <option value="spring">Spring (Mar-May)</option>
      </select>
    </li>

    <li class="about-link"><a href="#detail-tmax" class="nav-detail-link" id="about-variable-link">About Avg Daily Max Temp (°F)</a></li>
  </ul>

  <div id="vars-legend" class="legend-wrap left-filler">
    <div class="legend">
      <h5>Legend</h5>
      <div id="legend-container"></div>
    </div>
  </div>
</header>

<div id="viewport">
  <div id="main-content-wrap">

    <div id="variable-map"></div>

    <?php include_once('template/share.php'); ?>
  </div>
</div>

<div id="desktop-warning">
  <p>The Climate Explorer is optimized for desktop use. Please visit the site on a desktop computer.</p>
</div>

<!-- START:JS_LOADER -->

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

<script type="text/javascript" src="/resources/js/variables.js"></script>
<script type="text/javascript" src="/resources/js/cwg/climate-widget-graph.js"></script>

<script type="text/javascript" src="/resources/js/cwg/cwg.js"></script>

<script type="text/javascript" src="/resources/js/sweetalert.min.js"></script>

<script type="text/javascript" src="/resources/js/es6-promise.auto.min.js"></script>
<script type="text/javascript" src="/resources/js/es6-promise.min.js"></script>

<script type="text/javascript" defer src="/resources/js/main.js"></script>


<script src="/resources/js/formmapper.js"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.1/Chart.bundle.min.js" integrity="sha256-N4u5BjTLNwmGul6RgLoESPNqDFVUibVuOYhP4gJgrew="
        crossorigin="anonymous"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js" integrity="sha256-8E6QUcFg1KTnpEU8TFGhpTGHw5fJqB9vCms3OhAYLqw="
        crossorigin="anonymous"></script>

<script type="text/javascript" src="/resources/js/global_functions.js"></script>


<script>
  if (undefined === window.ce) {window.ce = {};}
  $(document).ready(function () {
    app = new App('/resources/data/');
  });
  $(document).ready(function () {
    window.scenariosMap = $('#variable-map').scenarioComparisonMap({stationId: window.ce.stationId, mode: window.ce.case});
  });
  $(document).ready(function () {
    'use strict';

    $("#formmapper").formmapper({
      details: "form"
    });

    $("#formmapper").bind("geocode:result", function (event, result) {
      if (result.geometry.access_points) {
        window.scenariosMap.scenarioComparisonMap({
          extent: null,
          center: [result.geometry.access_points[0].location.lat, result.geometry.access_points[0].location.lng],
          zoom: 8
        });
      } else {
        window.scenariosMap.scenarioComparisonMap({extent: null, center: [result.geometry.location.lat(), result.geometry.location.lng()], zoom: 8});
      }
    });

    $('#variable-options-container .fs-dropdown-item').on('click', function (e) {
      let variable = $(this).data().value;
      let variableTitle = $(this).text();

      // update breadcrumb label
      $('#breadcrumb .current').html(variableTitle);
      // update about link
      $('#about-variable-link').html('About ' + variableTitle);
      $('#about-variable-link').prop('href', '#detail-' + variable.split('.')[0]);

      $(".level-1").html(variableTitle);
      //dry days only show rcp45 vs rcp85 scenario
      if (variable === 'pcpn' || variable === 'days_dry_days') {
        window.scenariosMap.scenarioComparisonMap({
          variable: variable,
          leftScenario: 'rcp45',
          rightScenario: 'rcp85',
          disableScenarioSelection: true
        });
      }
      else {
        window.scenariosMap.scenarioComparisonMap({variable: variable, disableScenarioSelection: false});
      }
    });

    $('#map-seasons-container .fs-dropdown-item').on('click', function (e) {
      window.scenariosMap.scenarioComparisonMap({season: $(this).data().value});
    });

    $('#variable-options').on('change', function () {
      $("#chart-name").html($('.fs-dropdown-selected').html());
    });


    // function save_state() {
    //   var qtrs = location.search;
    //   var qs = this.parseQueryString(qtrs);
    //
    //   qs.id = this.selthuisectedVariable;
    //   qs.zoom = this.map.getView().getZoom();
    //   qs.center = this.map.getView().getCenter().toString();
    //   qs.year = this.activeYear;
    //
    //   var str = $.param(qs);
    //   history.replaceState(null, "", 'variables.php?' + str);
    //   setTimeout(function () {
    //     selectedVariableOption = $('#variable-options option:selected').text();
    //     actualurl = window.location.href;     // Returns full URL
    //     actualurlEncoded = encodeURIComponent(actualurl);
    //     twitterurl = "https://twitter.com/intent/tweet?text=" + selectedVariableOption + "+via+%40NOAA+Climate+Explorer%3A+" + actualurlEncoded;     // Returns full URL
    //     facebookurl = "https://www.facebook.com/sharer/sharer.php?u=" + actualurlEncoded;     // Returns full URL
    //
    //
    //     $('#share_facebook').attr("href", facebookurl);
    //     $('#share_facebook').attr("data-href", actualurl);
    //     $('#share_twitter').attr("href", twitterurl);
    //     $('#share_link').val(actualurl);
    //
    //   }, 500);
    //
    //   $('#about-variable-link').html('About ' + this.varMapping[this.selectedVariable]);
    //   $('#about-variable-link').prop('href', '#detail-' + this.selectedVariable.split('.')[0]);
    //
    //   $('#variable-options').val(id).attr('selected', true).change();
    //
    // }
  });
</script>


</body>
</html>
