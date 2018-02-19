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
if ($active_station) {
    if (!validate_alphanumeric_underscore($active_station)) {
        header("Location:error.php?123");
    }
} else {
    if ($current_url != strip_tags(rawurldecode($current_url))) {
        if ($current_url != $current_domain . "/error.php?12") {
            header("Location:" . $current_domain . "/error.php?11");
        }
    }
}
if (!$zoom) {
    $cut_url = trim(substr($current_url, 0, strpos($current_url, $active_station))) . $active_station;
}
// check current url vs cut url
if ($cut_url == $current_url) {
    // do nothing because it wasn't modified
} else {
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
    <link rel="stylesheet" href="resources/css/ol.css">
    <link rel="stylesheet" href="resources/css/ol3-popup.css">
    <link rel="stylesheet" href="resources/css/sweetalert.css">
    <link rel="stylesheet" media="screen" href="resources/css/screen.css">
    <link rel="stylesheet" media="screen" href="resources/css/mods.css">
    <?php
    $share_data['url'] = current_URL();
    $share_data['title'] = 'Stations';
    echo opengraph_output($share_data);
    ?>
</head>

<body id="page-stations" class="page-type-stations">
<div class="cd-cover-layer"></div>
<?php include_once('template/header.php'); ?>


<header id="left-header">
    <span class="trigger icon icon-close" id="left-header-trigger"></span>

    <ul id="vars-menu" class="menu blue-menu">
        <li class="search-field border" id="stations-search-by-location"><span class="icon icon-search"></span><input type="text" id="formmapper" placeholder="Zoom to location"></li>

        <li class="select border" id="stations-options-container">
            <select class="dropdown" id="stations-options">
                <option value="daily_vs_climate">Daily vs. Climate</option>
                <option value="thresholds">Thresholds</option>
                <option value="high_tide_flooding">High-tide Flooding</option>

            </select>
        </li>

        <li class="about-link"><a href="#detail-daily_vs_climate" class="nav-detail-link" id="about-stations-link">About Daily vs. Climate</a></li>
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

        <div id="stations-map"></div>

        <div class="zoom">
            <div class="zoom-slider" data-value="1"></div>
            <div class="ui-slider-label zoom-label plus"></div>
            <div class="ui-slider-label zoom-label minus"></div>
        </div>

        <?php include_once('template/share.php'); ?>

        <!-- begin weather stations map -->


            <div id="stations-spinner"></div>

            <div id="station-overlay-container">

            <div id="station-overlay">
                <div id="station-overlay-close">×</div>


                <div id="station-overlay-header">
                    <h3>Weather Station</h3>
                    <h5>Name: <span class="station-name"></span></h5>
                    <h5>Station ID: <span class="station-id"></span></h5>
                </div>

                <?php

                // standard station
                // tabs (left column)
                // chart w/ vars (right column)

                ?>

                <div id="station-detail" class="station-overlay-content">

                    <div id="stations-charts-temp" class="chart-tab selected">
                        <div id="multi-chart-container">
                            <div id="multi-chart" style="width:100%; height:300px"></div>
                        </div>
                    </div>

                    <div id="stations-charts-precip" class="chart-tab">
                        <div id="multi-precip-chart-container">
                            <div id="multi-precip-chart" style="width:100%; height:300px"></div>
                        </div>
                    </div>

                    <div id="station-no-data" class="station-overlay-column right">This station does not have thresholds available.</div>

                    <div id="station-detail-data" class="station-overlay-column right">

                        <div id="station-data-container">

                            <div class="form-group">
                                <div class="field-pair field-id">
                                    <label for="station">Station Id:</label>

                                    <div class="field">
                                        <input type="text" name="station" id="station" value="">
                                    </div>
                                </div>

                                <div class="field-pair field-var">
                                    <label for="itemvariable">Variable:</label>

                                    <div class="field">
                                        <select name="itemvariable" id="itemvariable">
                                            <option value="tavg">TAvg</option>
                                            <option value="tmax">TMax</option>
                                            <option value="tmin">TMin</option>
                                            <option value="precipitation">Precipitation</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="field-pair field-window append">
                                    <label for="window">Window:</label>

                                    <div class="field">
                                        <input type="number" id="window" name="window" value="1"> <span class="append">days</span>
                                    </div>
                                </div>

                                <div class="field-pair field-threshold append">
                                    <label for="threshold">Threshold:</label>

                                    <div class="field">
                                        <input type="number" name="threshold" id="threshold" value="1" step="0.1"> <span class="append" id="item_inches_or_f">°F</span>
                                    </div>
                                </div>
                            </div>

                            <div id="item-chart-container"></div>

                        </div>

                    </div>

                </div>

                <?php

                // tidal station

                ?>

                <div id="station-detail-tidal" class="station-overlay-content">
                    <div id="tidal-chart-container">
                        <select name="" id="tidal_station" class="form-control" style="width: 200px;">
                            <option value="" disabled selected hidden>Station</option>
                            <option value="8443970">Boston, MA</option>
                            <option value="8454000">Providence, RI</option>
                            <option value="8461490">New London, CT</option>
                            <option value="8510560">Montauk, NY</option>
                            <option value="8516945">Kings Point, NY</option>
                            <option value="8518750">Battery, NY</option>
                            <option value="8531680">Sandy Hook, NJ</option>
                            <option value="8534720">Atlantic City, NJ</option>
                            <option value="8545240">Philadelphia, PA</option>
                            <option value="8557380">Lewes, DE</option>
                            <option value="8574680">Baltimore, MD</option>
                            <option value="8575512">Annapolis, MD</option>
                            <option value="8594900">Washington D.C.</option>
                            <option value="8638610">Sewells Point, VA</option>
                            <option value="8658120">Wilmington, NC</option>
                            <option value="8665530">Charleston, SC</option>
                            <option value="8670870">Fort Pulaski, GA</option>
                            <option value="8720030">Fernandina Beach, FL</option>
                            <option value="8720218">Mayport, FL</option>
                            <option value="8724580">Key West, FL</option>
                            <option value="8726430">St Petersburg, FL</option>
                            <option value="8771341">Galveston Bay, TX</option>
                            <option value="8779770">Port Isabel, TX</option>
                            <option value="9410230">La Jolla, CA</option>
                            <option value="9414290">San Francisco, CA</option>
                            <option value="9447130">Seattle, WA</option>
                            <option value="1612340">Honolulu, HI</option>
                        </select>

                        <canvas id="tidal-chart" style="width:100%; height:300px"></canvas>
                    </div>
                </div>

            </div>
            </div>


    </div>
</div>

<a href="#" id="district-trigger"><span class="text">Show District Overlay</span><span class="icon icon-district"></span></a>
<div id="desktop-warning">
    <p>The Climate Explorer is optimized for desktop use. Please visit the site on a desktop computer.</p>
</div>

<!-- START:JS_LOADER -->

<script type="text/javascript" src="resources/js/jquery.min.js"></script>
<script type="text/javascript" src="resources/js/jquery-ui.min.js"></script>

<script type="text/javascript" src="resources/js/stations.js"></script>

<script type="text/javascript" src="resources/js/lodash.js"></script>
<script type="text/javascript" src="resources/js/proj4.js"></script>

<script type="text/javascript" src="resources/js/chart/chart.core.js"></script>
<script type="text/javascript" src="resources/js/chart/chart.line.js"></script>

<script type="text/javascript" src="resources/js/formstone/core.js"></script>
<script type="text/javascript" src="resources/js/formstone/mediaquery.js"></script>
<script type="text/javascript" src="resources/js/formstone/touch.js"></script>
<script type="text/javascript" src="resources/js/formstone/scrollbar.js"></script>
<script type="text/javascript" src="resources/js/formstone/dropdown.js"></script>
<script type="text/javascript" src="resources/js/formstone/equalize.js"></script>
<script type="text/javascript" src="resources/js/formstone/swap.js"></script>
<!-- <script type="text/javascript" src="resources/js/formstone/tabs.js"></script> -->

<script type="text/javascript" src="resources/js/lc_switch.min.js"></script>
<script type="text/javascript" src="resources/js/jquery.cycle2.min.js"></script>
<script type="text/javascript" src="resources/js/jquery.waypoints.min.js"></script>
<script type="text/javascript" src="resources/js/jquery.waypoints.sticky.min.js"></script>
<script type="text/javascript" src="resources/js/split-pane.min.js"></script>
<script type="text/javascript" src="resources/js/download.js"></script>
<script type="text/javascript" src="resources/js/jquery.hoverintent.min.js"></script>

<script type="text/javascript" src="resources/js/tether.js"></script>
<script type="text/javascript" src="resources/js/shepherd.min.js"></script>
<script type="text/javascript" src="./resources/js/cwg/climate-widget-graph.js"></script>

<script type="text/javascript" src="resources/js/cwg/cwg.js"></script>

<script type="text/javascript" src="resources/js/sweetalert.min.js"></script>

<script type="text/javascript" src="resources/js/ol.js"></script>
<script type="text/javascript" src="resources/js/ol3-popup.js"></script>
<script type="text/javascript" src="resources/js/main.js"></script>

<!-- if CASE -->
<?php if (isset($case) && !is_null($case) && $page_slug == 'case') { ?>
    <script type="text/javascript" src="resources/js/multigraph-nojq.min.js"></script>
    <script type="text/javascript" src="resources/js/impacts.js"></script>
    <script>
        $(document).ready(function () {
            impacts = new Impacts(<?php echo "'" . $case . "'"; ?>, <?php echo "'" . $data_base_url . "'"; ?>);
        });
    </script>

<?php } ?>

<!-- AIzaSyA- -->

<?php if ($current_domain == 'http://climateexplorer.habitatseven.work') { ?>
    <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBSjujKAutsVyR0GcsfXJvGA-J-54zWT2U&libraries=places"></script><?php } else { ?>
    <script src="https://maps.googleapis.com/maps/api/js?sensor=false&amp;libraries=places&client=gme-noaa&channel=OAR.CLIMATE_GOV_CLIMATE_EXPLORER2"></script>
<?php } ?>

<script src="resources/js/formmapper.js"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.1/Chart.bundle.min.js" integrity="sha256-N4u5BjTLNwmGul6RgLoESPNqDFVUibVuOYhP4gJgrew=" crossorigin="anonymous"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js" integrity="sha256-8E6QUcFg1KTnpEU8TFGhpTGHw5fJqB9vCms3OhAYLqw=" crossorigin="anonymous"></script>

<script type="text/javascript" src="resources/js/chart.js"></script>
<script type="text/javascript" src="resources/js/global_functions.js"></script>
<script src="/resources/tidal/tidalstationswidget.js"></script>

<?php if (isset($active_station) && $active_station != null) { ?>
    <script>
        $(document).ready(function () {
            stations = new Stations(<?php echo "'" . $active_station . "'"; ?>, <?php echo "'" . $data_base_url . "'"; ?>);
        });
    </script>
<?php } ?>

<script>
    $(document).ready(function () {
        app = new App(<?php echo "'" . $data_base_url . "'"; ?>);
    });
</script>

<!-- END:JS_LOADER -->

</body>
</html>
