<?php
$lockdown = 0;
include_once('functions.php');
$page_slug = basename(__FILE__, '.php');

$active_variable = isset($_GET['id']) ? $purifier->purify($_GET['id']) : '';
$active_year = isset($_GET['year']) ? $purifier->purify($_GET['year']) : 2010;
$zoom = isset($_GET['zoom']) ? $purifier->purify($_GET['zoom']) : '';

$center = isset($_GET['center']) ? $purifier->purify($_GET['center']) : '';

if (!is_numeric($active_year)) {
    header("Location:error.php?10");
}

if ($active_year) {
    if ($active_year < 1950 || $active_year > 2090) {
        header("Location:error.php?13");
    }
}

// ensure center exists first
if ($center) {
    // separate both parts
    $validCenter = explode(',', $center);
    // ensure it's a number, error if not
    if (!is_numeric($validCenter[0])) {
        header("Location:error.php?1");
    }
    // ensure it's a number, error if not
    if (!is_numeric($validCenter[1])) {
        header("Location:error.php?2");
    }
}
$pos_year = $active_year;
settype($active_year, "integer");

$active_year = filter_var($active_year, FILTER_SANITIZE_NUMBER_INT);



if ($zoom) {
// ensure it's a number, error if not
    if (!is_numeric($zoom)) {
        header("Location:error.php?3");
    }
}


if ($active_variable) {
    if (!validate_alphanumeric_underscore($active_variable)) {
        header("Location:error.php?123");
    }
} else {
    if ($current_url != strip_tags(rawurldecode($current_url))) {
        if ($current_url != $current_domain . "/error.php?12") {
            header("Location:" . $current_domain . "/error.php?11");
        }
    }
}


if ($active_year) {
    if ($active_year < 1950 || $active_year > 2090) {
        header("Location:error.php?13");
    }
}

// maintain year as string for strpos

// make sure actual year is an int.
settype($active_year, "integer");
// just in case
$active_year = filter_var($active_year, FILTER_SANITIZE_NUMBER_INT);
// destroy anything that comes after the final argument
$cut_url = trim(substr($current_url, 0, strpos($current_url, $pos_year))) . $pos_year;
// in case year doesn't exist yet

if (!$zoom) {
    $cut_url = trim(substr($current_url, 0, strpos($current_url, $active_variable))) . $active_variable;
}
// check current url vs cut url
if ($cut_url == $current_url) {
    // do nothing because it wasn't modified

    #echo $cut_url."\n".$current_url;
} else {
    #echo $cut_url."\n".$current_url;
    if (isset($cut_url)) {
        header("Location:" . $current_domain . "/error.php?5");
    }
}

?>
<!doctype html>
<html>
<head>
    <title>Climate Explorer</title>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="<?php $current_domain ?>resources/css/ol.css">
    <link rel="stylesheet" href="<?php $current_domain ?>resources/css/ol3-popup.css">

    <link rel="stylesheet" href="<?php $current_domain ?>resources/css/sweetalert.css">

    <link rel="stylesheet" media="screen" href="<?php $current_domain ?>resources/css/screen.css">
    <link rel="stylesheet" media="screen" href="<?php $current_domain ?>resources/css/mods.css">

    <script type="text/javascript" src="<?php $current_domain ?>resources/js/jquery.min.js"></script>
    <script type="text/javascript" src="<?php $current_domain ?>resources/js/jquery-ui.min.js"></script>

    <?php

    $share_data['url'] = current_URL();
    $share_data['title'] = 'Variables';

    echo opengraph_output($share_data);

    ?>
</head>

<body id="page-variables" class="page-type-variables">
<div class="cd-cover-layer"></div>
<?php include_once('template/header.php'); ?>

<div id="download-panel" class="hidden download-panel">
    <div class="download-inner">
        <p>Use the following links to download this graph's data:</p>
        <ul></ul>
        <div class="center">
            <button id="download-dismiss-button">Dismiss</button>
        </div>
    </div>
</div>

<header id="left-header">
    <span class="trigger icon icon-close" id="left-header-trigger"></span>

    <ul id="vars-menu" class="menu blue-menu">
        <li class="search-field border" id="variable-search-by-location"><span class="icon icon-search"></span><input type="text" id="formmapper" placeholder="Search by location"></li>

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
            <select class="dropdown" id="variable-options">
                <option value="tasmax">Mean Daily Maximum Temperature</option>
                <option value="tasmin">Mean Daily Minimum Temperature</option>
                <option value="days_tmax_abv_35.0">Days With Maximum Above 95°F</option>
                <option value="days_tmin_blw_0.0">Days With Minimum Below 32°F</option>
                <option value="pr">Mean Daily Precipitation</option>
                <option value="days_prcp_abv_25.3">Days of Precipitation Above 1 Inch</option>
                <option value="heating_degree_day_18.3">Heating Degree Days</option>
                <option value="cooling_degree_day_18.3">Cooling Degree Days</option>
            </select>
        </li>

        <li class="about-link"><a href="<?php $current_domain ?>#detail-tasmax" class="nav-detail-link" id="about-variable-link">About Mean Daily Maximum Temperature</a></li>
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
        <!-- <input id="swipe" type="range" style="width: 100%"> -->
        <div class="select border" id="map-seasons-container">
            <select class="dropdown" id="map-season">
                <option value="summer">July</option>
                <option value="fall">October</option>
                <option value="winter">January</option>
                <option value="spring">April</option>
            </select>
        </div>


        <div class="moveable" id="sliderDiv">
            <div id="swipeImg" class="handle">
                <div class="emissions-low">Lower Emissions</div>
                <div class="emissions-high">Higher Emissions</div>
            </div>
        </div>

        <div id="variable-map"></div>

        <div class="year" id="year-slider-container">
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

<a href="<?php $current_domain ?>#" id="district-trigger"><span class="text">Show District Overlay</span><span class="icon icon-district"></span></a>

<?php include_once('template/footer.php'); ?>
</body>
</html>
