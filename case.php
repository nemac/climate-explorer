<?php
include_once('functions.php');
$page_slug = basename(__FILE__, '.php');

// DEFINE VARS
$case = isset($_GET['id']) ? $purifier->purify($_GET['id']) : '';
$group = isset($_GET['group']) ? $purifier->purify($_GET['group']) : '';
$active_year = isset($_GET['active_year']) ? $purifier->purify($_GET['active_year']) : 2020;
$zoom = isset($_GET['zoom']) ? $purifier->purify($_GET['zoom']) : '';
$center = isset($_GET['center']) ? $purifier->purify($_GET['center']) : '';
$layers = isset($_GET['layers']) ? $purifier->purify($_GET['layers']) : '';

// ensure center exists first
if ($center){
  // separate both parts
  $validCenter = explode(',',$center);
  // ensure it's a number, error if not
  if (!is_numeric($validCenter[0])) {
    header("Location:error.php?1");
  }
  // ensure it's a number, error if not
  if (!is_numeric($validCenter[1])) {
    header("Location:error.php?2");
  }
}

if ($zoom) {
// ensure it's a number, error if not
  if (!is_numeric($zoom)) {
    header("Location:error.php?3");
  }
}
if ($layers){

if (preg_match('/[^a-z, ._\-0-9]/i', $layers)) {
  header("Location:error.php?4");
}
}

// maintain year as string for strpos
$pos_year = $active_year;
// make sure actual year is an int.
settype($active_year, "integer");
// just in case
$active_year = filter_var($active_year, FILTER_SANITIZE_NUMBER_INT);
// destroy anything that comes after the final argument
$cut_url = trim(substr($current_url, 0, strpos($current_url, $pos_year))).$pos_year;
#echo $cut_url;
// in case year doesn't exist yet
if (!$zoom){
  $cut_url = trim(substr($current_url, 0, strpos($current_url, $group))).$group;
}
// check current url vs cut url
if($cut_url == $current_url) {
  // do nothing because it wasn't modified

  #echo $cut_url."\n".$current_url;
} else {
  #echo $cut_url."\n".$current_url;
  if (isset($cut_url)){
    header("Location:" . $current_domain . "/error.php?5");
  }
}

if ((!is_numeric($active_year) && (isset($active_year)))) {
  header("Location:error.php?6");
}


$active_year = filter_var($active_year, FILTER_SANITIZE_NUMBER_INT);



if ($case != 'coastal' && $case != 'health' && $case != 'water' && $case != 'ecosystems' && $case != 'tribal_nations' && $case != 'transportation') {
  header("Location:error.php?7");
}

if ($group != 'all' && $group != 'group1' && $group != 'group2' && $group != 'group3' && $group != 'group4' && $group != 'group5' && $group != 'group6' && $group != 'group7') {
  header("Location:error.php?8");
}


?>
<!doctype html>
<html>
  <head>
    <title>Climate Explorer</title>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="/resources/css/ol3-popup.css">

    <link rel="stylesheet" href="/resources/css/sweetalert.css">

    <link rel="stylesheet" media="screen" href="/resources/css/screen.css">
    <link rel="stylesheet" media="screen" href="/resources/css/mods.css">

    <script type="text/javascript" src="/resources/js/jquery.min.js"></script>
      <script type="text/javascript" src="/resources/js/jquery-ui.min.js"></script>
      <script type="text/javascript" src="/resources/js/touchpunch.js"></script>

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
      <span class="trigger icon icon-close" id="left-header-trigger"></span>

      <ul id="case-menu" class="menu orange-menu">
        <li class="search-field border" id="search-by-location"><span class="icon icon-search"></span><input type="text" id="formmapper" placeholder="Select a location"></li>
      </ul>

      <div id="vars-legend" class="legend-wrap left-filler">

        <div id="station-legends"></div>
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
          <div class="" id="variable-time-slider" data-min="1950" data-max="2090" data-value="2020"></div>
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

    <!-- <a href="#" id="district-trigger"><span class="text">Show District Overlay</span><span class="icon icon-district"></span></a> -->

    <?php include_once('template/footer.php'); ?>

  </body>
</html>
