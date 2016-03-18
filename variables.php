<!doctype html>
<html>
  <head>
    <title>Climate Explorer</title>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="resources/css/ol3-popup.css">
    <link rel="stylesheet" media="screen" href="resources/css/screen.css">

    <script type="text/javascript" src="./resources/js/jquery.min.js"></script>
    <script type="text/javascript" src="./resources/js/jquery-ui.min.js"></script>
  </head>

  <body id="page-variables" class="page-type-variables">

    <?php include_once('template/header.php'); ?>

    <header id="left-header">
      <ul id="vars-menu" class="menu blue-menu">
        <li class="search-field"><span class="icon icon-search"></span><input type="text" placeholder="Search by location"></li>

        <li class="select border">
          <select class="dropdown">
            <option value="tasmax">Mean Daily Maximum</option>
            <option value="tasmin">Mean Daily Minimum</option>
            <option value="days_tmax_abv_35.0">Days over 95º F</option>
            <option value="days_tmin_blw_0.0">Days min below 32º F</option>
          </select>
        </li>

        <li class="toggle"><label for="counties-overlay-toggle"><span class="text">Counties</span><input type="checkbox" name="counties-overlay-toggle" id="counties-overlay-toggle" value="1" autocomplete="off" checked="true"></label></li>
        <li class="toggle border"><label for="weather-overlay-toggle"><span class="text">Weather Stations</span><input type="checkbox" name="weather-overlay-toggle" id="weather-overlay-toggle" value="1" autocomplete="off"></label></li>
        <!--<li class="border"><a><span class="icon icon-variables"></span><span class="text">Projected Variables</span></a></li>
        <li><a><span class="icon icon-temperature"></span><span class="text">Temperature</span></a></li>
        <li><a><span class="icon icon-average-mean"></span><span class="text">Average Mean</span></a></li>
        <li><a><span class="icon icon-emission-scenario"></span><span class="text">Emission Scenario</span></a></li>
        <li class="border"><a><span class="icon icon-season"></span><span class="text">Season</span></a></li>-->
        <li class="about-link"><a href="#detail-temperature" class="nav-detail-link">About Average Mean Temperature</a></li>
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
