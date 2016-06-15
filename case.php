<?php
include_once('functions.php');
$case = $_REQUEST['id'];


$case = xss_clean($case);
$case =  filter_var($case, FILTER_SANITIZE_STRING);


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

    <?php

      $share_data['url'] = current_URL();
      $share_data['title'] = 'Case';

      echo opengraph_output($share_data);

    ?>

  </head>

<body id="page-fire-regimes" class="page-type-case">
<div class="cd-cover-layer"></div>
<?php include_once('template/header.php'); ?>

<header id="left-header">
    <ul id="case-menu" class="menu orange-menu">
      <li class="search-field border" id="search-by-location"><span class="icon icon-search"></span><input type="text" id="formmapper" placeholder="Search by location"></li>
    </ul>

    <div id="vars-legend" class="legend-wrap left-filler">
        <h6 class="source">Source: <a href="#" target="_blank">NOAA, 2014</a></h6>
    </div>
</header>

<div id="viewport">
    <div id="main-content-wrap">
      <div class="moveable" id="sliderDiv" style="display:none">
        <div id="swipeImg" class="handle">
          <div class="emissions-low">Lower Emissions</div>
          <div class="emissions-high">Higher Emissions</div>
        </div>
      </div>

      <div id="map" class="map"></div>

      <div class="year" id="year-slider-container" style="display:none">
        <div class="year-label year-min">1950</div>
        <div class="" id="variable-time-slider" data-min="1950" data-max="2090" data-value="2010"></div>
        <div class="year-label year-max">2090</div>
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
