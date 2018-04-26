<!doctype html>
<html>
<head>
  <?php include_once('template/head.php') ?>


  <meta property="fb:app_id" content="187816851587993">
  <!--  todo absolute url-->
  <meta property="og:url" content="/stations.php"/>
  <meta property="og:type" content="article">
  <meta property="og:title" content="Variables">
  <meta property="og:description"
        content="The Climate Explorer allows you to view historical and projected climate trends and assess the impacts of climate change on the things you care about">
  <meta property="og:image" content="/resources/img/og.jpg">

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
    <!---->
    <!--    <li class="toggle border" id="variable-counties-toggle">-->
    <!--      <label for="counties-overlay-toggle"><span class="text">Data by Counties</span>-->
    <!--        <input type="checkbox" name="counties-overlay-toggle" id="counties-overlay-toggle" value="1" autocomplete="off">-->
    <!--      </label>-->
    <!--      <div id="info-counties" class="layer-info">-->
    <!---->
    <!--        <div class="actions">-->
    <!--          <a href="#" class="layer-info-close"><span class="icon icon-close"></span>Close</a>-->
    <!--          <a href="#" class="layer-info-next"><span class="icon icon-arrow-right"></span>Next</a>-->
    <!--        </div>-->
    <!--      </div>-->
    <!--    </li>-->


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
  <div class="cwg-container"></div>
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

<?php include_once('template/footer.php') ?>


<script src="https://unpkg.com/terraformer@1.0.8/terraformer.js" integrity="sha384-+M797Pj3WZVCwMmLbOxAoaWYcKJo8NSxItmI48ytcLNeAnfn1d/IckFn31jEqrzP"
        crossorigin="anonymous"></script>
<script src="https://unpkg.com/terraformer-arcgis-parser@1.0.5/terraformer-arcgis-parser.js"
        integrity="sha384-duFUjKTSNoxEspdJNwr83CUgRxclf0ueKJB9DU/Vbit6bfWgzvZsHW6H1JLBBXhp" crossorigin="anonymous"></script>
<script type="text/javascript" src="/resources/js/scenarioComparisonMap.js"></script>


<script>
  $(function () {
    $('#variable-map').spinner();
  });
  $(document).ready(function () {
    window.scenariosMap = $('#variable-map').scenarioComparisonMap({
      countyselected: function (event, value) {
        window.countySelected($('.cwg-container')[0], value);
      },
      layersloaded: function (event, value) {
        $('#variable-map').spinner('destroy');
      }
    });
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
      if (window.scenariosMap.scenarioComparisonMap('getShowSeasonControls')) {
        $('#map-seasons-container').show(200)
      } else {
        $('#map-seasons-container').hide()
      }

    });

    $('#map-seasons-container .fs-dropdown-item').on('click', function (e) {
      window.scenariosMap.scenarioComparisonMap({season: $(this).data().value});
    });

    $('#variable-options').on('change', function () {
      $("#chart-name").html($('.fs-dropdown-selected').html());
    });


    // $('#counties-overlay-toggle').on('click', function (e) {
    //   window.scenariosMap.scenarioComparisonMap({showCounties: $(this).is(':checked')});
    // });

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
