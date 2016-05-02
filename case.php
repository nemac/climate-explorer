<?php

  $case = $_REQUEST['id'];

?>
<!doctype html>
<html>
  <head>
    <title>Climate Explorer</title>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="resources/css/ol3-popup.css">
    <link rel="stylesheet" media="screen" href="resources/css/shepherd-theme-arrows.css">

    <link rel="stylesheet" media="screen" href="resources/css/screen.css">
    <link rel="stylesheet" media="screen" href="resources/css/mods.css">

    <script type="text/javascript" src="./resources/js/jquery.min.js"></script>
    <script type="text/javascript" src="./resources/js/jquery-ui.min.js"></script>

  </head>

<body id="page-fire-regimes" class="page-type-case">

<?php include_once('template/header.php'); ?>

<header id="left-header">
    <ul id="case-menu" class="menu orange-menu">
      <li class="search-field" id="search-by-location"><span class="icon icon-search"></span><input type="text" id="formmapper" placeholder="Search by location"></li>
    </ul>

    <div id="vars-legend" class="legend-wrap left-filler">
        <h6 class="source">Source: <a href="#" target="_blank">NOAA, 2014</a></h6>
    </div>
</header>

<div id="viewport">
    <div id="main-content-wrap">
        <div id="map" class="map"></div>
        <div class="year" style="display:none">
            <div class="year-label year-min">1950</div>
            <div class="year-slider" data-min="1950" data-max="2100" data-value="2015"></div>
            <div class="year-label year-max">2100</div>
        </div>

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
