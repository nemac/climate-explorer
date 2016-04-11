<?php

  $active_variable = $_REQUEST['id'];

?>
<!doctype html>
<html>
  <head>
    <title>Climate Explorer</title>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="resources/css/ol3-popup.css">

    <link rel="stylesheet" media="screen" href="resources/css/screen.css">
    <link rel="stylesheet" media="screen" href="resources/css/mods.css">

    <script type="text/javascript" src="./resources/js/jquery.min.js"></script>
    <script type="text/javascript" src="./resources/js/jquery-ui.min.js"></script>
  </head>

  <body id="page-variables" class="page-type-variables">

    <?php include_once('template/header.php'); ?>

    <div id="download-panel" class="hidden download-panel">
      <div class="download-inner">
        <p>Use the following links to download this graph's data:</p>
        <ul></ul>
        <div class="center"><button id="download-dismiss-button">Dismiss</button></div>
      </div>
    </div>

    <header id="left-header">
      <ul id="vars-menu" class="menu blue-menu">
        <li class="search-field border"><span class="icon icon-search"></span><input type="text" id="formmapper" placeholder="Search by location"></li>

        <li class="select border">
          <select class="dropdown" id="variable-options">
            <option value="tasmax">Mean Daily Maximum</option>
            <option value="tasmin">Mean Daily Minimum</option>
            <option value="days_tmax_abv_35.0">Days over 95º F</option>
            <option value="days_tmin_blw_0.0">Days min below 32º F</option>
            <option value="pr">Mean Daily Precipitation</option>
            <option value="heating_degree_day_18.3">Heating Degree Days</option>
            <option value="cooling_degree_day_18.3">Cooling Degree Days</option>
          </select>
        </li>

        <li class="toggle">
          <a href="#info-counties" class="help icon icon-help"></a>
          <label for="counties-overlay-toggle"><span class="text">Data by Counties</span>
            <input type="checkbox" name="counties-overlay-toggle" id="counties-overlay-toggle" value="1" autocomplete="off" checked="true">
          </label>
          <div id="info-counties" class="layer-info">

            <div class="actions">
              <a href="#" class="layer-info-close"><span class="icon icon-close"></span>Close</a>
              <a href="#" class="layer-info-next"><span class="icon icon-arrow-right"></span>Next</a>
            </div>
          </div>
        </li>
      </ul>

      <div id="vars-legend" class="legend-wrap left-filler">
        <div class="legend">
          <h5>Legend</h5>
          <h6>Degrees Fahrenheit</h6>

          <ul>
            <li><span class="color" style="background-color: #2a0023;"></span>&gt; 105</li>
            <li><span class="color" style="background-color: #c3003c;"></span>90–104</li>
            <li><span class="color" style="background-color: #f5442d;"></span>70–89</li>
            <li><span class="color" style="background-color: #f0f567;"></span>50–69</li>
            <li><span class="color" style="background-color: #48f7d0;"></span>30–49</li>
            <li><span class="color" style="background-color: #0078d4;"></span>&lt; 30</li>
          </ul>
        </div>

        <h6 class="source">Source: <a href="#" target="_blank">NOAA, 2014</a></h6>
      </div>
    </header>

    <div id="viewport">
      <div id="main-content-wrap">

        <div id="variable-map"></div>

        <div class="zoom">
          <div class="zoom-slider" data-value="1"></div>
          <div class="ui-slider-label zoom-label plus"></div>
          <div class="ui-slider-label zoom-label minus"></div>
        </div>

        <?php include_once('template/share.php'); ?>
      </div>
    </div>

    <a href="#" id="district-trigger"><span class="text">Show District Overlay</span><span class="icon icon-district"></span></a>

    <?php include_once('template/footer.php'); ?>
  </body>
</html>
