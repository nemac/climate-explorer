<?php
$lockdown = 0;
include_once('functions.php');

$page_slug = basename(__FILE__, '.php');

$location = true;

$city = isset($_GET['city']) ? $purifier->purify($_GET['city']) : '';
$county = isset($_GET['county']) ? $purifier->purify($_GET['county']) : '';
$fips = isset($_GET['fips']) ? $purifier->purify($_GET['fips']) : '';
$lat = isset($_GET['lat']) ? $purifier->purify($_GET['lat']) : '';
$lon = isset($_GET['lon']) ? $purifier->purify($_GET['lon']) : '';

if (preg_match('/[^a-z, .\'_\-0-9]/i', $city)) {
    header("Location:error.php?1");
}
if (preg_match('/[^a-z, .\'_\-0-9]/i', $county)) {
    header("Location:error.php?2");
}
if (!is_numeric($fips)) {
    header("Location:error.php?3");
}
if (!isValidLatitude($lat)) {
    header("Location:error.php?4");
}
if (!isValidLongitude($lon)) {
    header("Location:error.php?5");
}
?>
<!doctype html>
<html>
<head>
    <title>Climate Explorer</title>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="<?php $current_domain ?>resources/css/ol3-popup.css">

    <link rel="stylesheet" href="<?php $current_domain ?>resources/css/sweetalert.css">

    <link rel="stylesheet" media="screen" href="<?php $current_domain ?>resources/css/screen.css">
    <link rel="stylesheet" media="screen" href="<?php $current_domain ?>resources/css/mods.css">

    <script type="text/javascript" src="<?php $current_domain ?>resources/js/jquery.min.js"></script>
    <script type="text/javascript" src="<?php $current_domain ?>resources/js/jquery-ui.min.js"></script>

    <?php

    $share_data['url'] = current_URL();
    $share_data['title'] = 'Location data for ' . $city;

    echo opengraph_output($share_data);

    ?>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js" integrity="sha256-KM512VNnjElC30ehFwehXjx1YCHPiQkOPmqnrWtpccM=" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.1/Chart.bundle.min.js" integrity="sha256-N4u5BjTLNwmGul6RgLoESPNqDFVUibVuOYhP4gJgrew=" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js" integrity="sha256-8E6QUcFg1KTnpEU8TFGhpTGHw5fJqB9vCms3OhAYLqw=" crossorigin="anonymous"></script>

    <script src="resources/item/jquery.fl-item.min.js"></script>
    <link rel="stylesheet" href="resources/item/fl-item.css"/>
</head>

<body id="page-location-<?php echo $fips; ?>" class="page-type-location">
<div class="cd-cover-layer"></div>
<?php include_once('template/header.php'); ?>

<div id="viewport">
    <div id="main-content-wrap">

        <?php include_once('template/share.php'); ?>

        <div id="location-search">
            <input type="text" class="autocomplete location-mapper" placeholder="Search another City, County or Zip code">
        </div>

        <section id="location-splash" class="page-splash">
            <div class="splash-text">
                <h1><?php echo $city ?></h1>
                <h3><?php echo $county ?></h3>
                <p>Graphs and maps below show observed and modeled data for the county of your selected location. Adjust the displays to focus on times or regions of interest.</p>
            </div>

            <div id="page-nav">
                <h4>Jump to:</h4>

                <ul>
                    <li><a href="<?php $current_domain ?>#location-temperature">Temperature</a></li>
                    <li><a href="<?php $current_domain ?>#location-precipitation">Precipitation</a></li>
                    <li><a href="<?php $current_domain ?>#location-derived">Other Variables</a></li>
                    <li><a href="<?php $current_domain ?>#location-stations">Stations</a></li>
                    <!--<li><a href="#location-impacts">Relevant Impacts</a></li>-->
                </ul>
            </div>
        </section>

        <!-- begin temperature chart and map -->

        <div id="download-panel" class="download-panel overlay">
            <div class="download-inner">
                <a href="javascript:void(0);" id="download-dismiss-button" class="icon icon-close"></a>
                <p>Use the following links to download this graph's data:</p>
                <ul>
                    <li><a href="javascript:void(0);" id="download_hist_obs_data" class='button display-block border-white hover-bg-white'><span class='icon icon-arrow-down'></span>Observed Data</a></li>
                    <li><a href="javascript:void(0);" id="download_hist_mod_data" class='button display-block border-white hover-bg-white'><span class='icon icon-arrow-down'></span>Historical Modeled Data</a></li>
                    <li><a href="javascript:void(0);" id="download_proj_mod_data" class='button display-block border-white hover-bg-white'><span class='icon icon-arrow-down'></span>Projected Modeled Data</a></li>
                </ul>

            </div>
        </div>


        <div id="download-precip-panel" class="download-panel overlay">
            <div class="download-inner">
                <a href="javascript:void(0);" id="download-precip-dismiss-button" class="icon icon-close"></a>
                <p>Use the following links to download this graph's data:</p>
                <ul>
                    <li><a href="javascript:void(0);" id="download_precip_hist_obs_data" class='button display-block border-white hover-bg-white'><span class='icon icon-arrow-down'></span>Observed Data</a></li>
                    <li><a href="javascript:void(0);" id="download_precip_hist_mod_data" class='button display-block border-white hover-bg-white'><span class='icon icon-arrow-down'></span>Historical Modeled Data</a></li>
                    <li><a href="javascript:void(0);" id="download_precip_proj_mod_data" class='button display-block border-white hover-bg-white'><span class='icon icon-arrow-down'></span>Projected Modeled Data</a></li>
                </ul>

            </div>
        </div>



        <div id="download-derived-panel" class="download-panel overlay">
            <div class="download-inner">
                <a href="javascript:void(0);" id="download-derived-dismiss-button" class="icon icon-close"></a>
                <p>Use the following links to download this graph's data:</p>
                <ul>
                    <li><a href="javascript:void(0);" id="download_derived_hist_obs_data" class='button display-block border-white hover-bg-white'><span class='icon icon-arrow-down'></span>Observed Data</a></li>
                    <li><a href="javascript:void(0);" id="download_derived_hist_mod_data" class='button display-block border-white hover-bg-white'><span class='icon icon-arrow-down'></span>Historical Modeled Data</a></li>
                    <li><a href="javascript:void(0);" id="download_derived_proj_mod_data" class='button display-block border-white hover-bg-white'><span class='icon icon-arrow-down'></span>Projected Modeled Data</a></li>
                </ul>

            </div>
        </div>

        <section id="location-temperature" class="location-data-section-wrap">
            <div class="location-data-section">
                <div id="temperature-data" class="data-list">

                    <span class="trigger data-options-trigger"><span class="hamburger"><span class="bar"></span></span><span class="text">View</span></span>

                    <h3 class="accent-color"><span class="icon icon-temperature"></span>Temperature</h3>

                    <ul class="data-options">
                        <li class="active accent-border">
                            <h4 id="var-tmax"><a href="<?php $current_domain ?>#" class="text">Ave Daily Max Temp (°F)</a><a href="<?php $current_domain ?>#detail-tmax" class="icon icon-help nav-detail-link"></a></h4>
                            <ul class="location-resolution">
                                <li class="active accent-border"><a class="accent-color">Annual</a></li>
                                <li class="seasonal-monthly"><a>Monthly</a></li>
                                <li class="seasonal-monthly"><a>Seasonal</a></li>
                            </ul>
                        </li>

                        <li class="">
                            <h4 id="var-tmin"><a href="<?php $current_domain ?>#" class="text">Ave Daily Min Temp (°F)</a><a href="<?php $current_domain ?>#detail-tasmin" class="icon icon-help nav-detail-link"></a></h4>
                            <ul class="location-resolution">
                                <li><a>Annual</a></li>
                                <li class="seasonal-monthly"><a>Monthly</a></li>
                                <li class="seasonal-monthly"><a>Seasonal</a></li>
                            </ul>
                        </li>

                        <li class="">
                            <h4 id="var-days_tmax_gt_90f"><a href="<?php $current_domain ?>#" class="text">Days w/ max > 90°F</a><a href="<?php $current_domain ?>#detail-days_tmax_gt_90f" class="icon icon-help nav-detail-link"></a></h4>
                            <ul class="location-resolution">
                                <li><a>Annual</a></li>
                            </ul>
                        </li>

                        <li class="">
                            <h4 id="var-days_tmax_gt_95f"><a href="<?php $current_domain ?>#" class="text">Days w/ max > 95°F</a><a href="<?php $current_domain ?>#detail-days_tmax_gt_95f" class="icon icon-help nav-detail-link"></a></h4>
                            <ul class="location-resolution">
                                <li><a>Annual</a></li>
                            </ul>
                        </li>

                        <li class="">
                            <h4 id="var-days_tmax_gt_100f"><a href="<?php $current_domain ?>#" class="text">Days w/ max > 100°F</a><a href="<?php $current_domain ?>#detail-days_tmax_gt_100f" class="icon icon-help nav-detail-link"></a></h4>
                            <ul class="location-resolution">
                                <li><a>Annual</a></li>
                            </ul>
                        </li>

                        <li class="">
                            <h4 id="var-days_tmax_gt_105f"><a href="<?php $current_domain ?>#" class="text">Days w/ max > 105°F</a><a href="<?php $current_domain ?>#detail-days_tmax_gt_105f" class="icon icon-help nav-detail-link"></a></h4>
                            <ul class="location-resolution">
                                <li><a>Annual</a></li>
                            </ul>
                        </li>

                        <li class="">
                            <h4 id="var-days_tmax_lt_32f"><a href="<?php $current_domain ?>#" class="text">Days w/ max < 32°F</a><a href="<?php $current_domain ?>#detail-days_tmax_lt_32f" class="icon icon-help nav-detail-link"></a></h4>
                            <ul class="location-resolution">
                                <li><a>Annual</a></li>
                            </ul>
                        </li>

                        <li class="">
                            <h4 id="var-days_tmin_lt_32f"><a href="<?php $current_domain ?>#" class="text">Days w/ min < 32°F</a><a href="<?php $current_domain ?>#detail-days_tmin_blw_0" class="icon icon-help nav-detail-link"></a></h4>
                            <ul>
                                <li><a>Annual</a></li>
                            </ul>
                        </li>

                        <li class="">
                            <h4 id="var-days_tmin_gt_80f"><a href="<?php $current_domain ?>#" class="text">Days w/ min > 32°F</a><a href="<?php $current_domain ?>#detail-days_tmin_gt_80f" class="icon icon-help nav-detail-link"></a></h4>
                            <ul class="location-resolution">
                                <li><a>Annual</a></li>
                            </ul>
                        </li>

                        <li class="">
                            <h4 id="var-days_tmin_gt_90f"><a href="<?php $current_domain ?>#" class="text">Days w/ min > 90°F</a><a href="<?php $current_domain ?>#detail-days_tmin_gt_90f" class="icon icon-help nav-detail-link"></a></h4>
                            <ul class="location-resolution">
                                <li><a>Annual</a></li>
                            </ul>
                        </li>
                    </ul>

                    <form onsubmit="return false;">
                        <div class="row">
                            <label for="county">County</label>
                            <select id="county" class="u-full-width">
                                <option value="<?php echo $fips ?>" selected="selected"><?php echo $county ?></option>
                            </select>
                        </div>
                        <div class="row">
                            <label for="frequency">Frequency</label>
                            <select id="frequency" class="u-full-width">
                                <option value="annual" selected="selected">Annual</option>
                                <option value="monthly">Monthly</option>
                                <option value="seasonal">Seasonal</option>
                            </select>
                        </div>
                        <div class="row">
                            <label for="timeperiod">Time Period</label>
                            <select id="timeperiod" class="u-full-width">
                                <option value="2025" selected="selected">30 Years Centered on 2025</option>
                                <option value="2050">30 Years Centered on 2050</option>
                                <option value="2075">30 Years Centered on 2075</option>
                            </select>
                        </div>
                        <div class="row">
                            <label for="variable">Variable</label>
                            <select id="variable" class="u-full-width"></select>
                        </div>
                        <div class="row">
                            <div class="six columns">
                                <label for="scenario">Scenario</label>
                                <select id="scenario" class="u-full-width">
                                    <option value="both" selected="selected">RCP 8.5 and 4.5</option>
                                    <option value="rcp85">RCP 8.5</option>
                                    <option value="rcp45">RCP 4.5</option>
                                </select>
                            </div>
                            <div class="six columns">
                                <label for="presentation">Display: </label>
                                <select id="presentation" class="u-full-width">
                                    <option value="absolute">Absolute</option>
                                    <option value="anomaly">Anomaly</option>
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="six columns">
                                <label for="median">Show Medians</label>
                                <select id="median" class="u-full-width">
                                    <option value="true" selected="selected">Show</option>
                                    <option value="false">Hide</option>
                                </select>
                                <label for="hist-mod">Historical Modeled</label>
                                <select id="hist-mod" class="u-full-width">
                                    <option value="false" selected="selected">Hide</option>
                                    <option value="true">Show</option>
                                </select>
                                <label for="hist-obs">Historical Obs</label>
                                <select id="hist-obs" class="u-full-width">
                                    <option value="true">Hide</option>
                                    <option value="false" selected="selected">Show</option>
                                </select>
                            </div>
                        </div>
                        <div class="center">
                            <button id="download-button">Download Data</button>
                        </div>
                        <div class="center">
                            <button><a id="download-image-link-temp">Download Image</a></button>
                        </div>
                    </form>

                    <div class="data-vars">
                        <label for="temperature-presentation">Display: </label>

                        <select id="temperature-presentation" class="dropdown">
                            <option value="absolute">Actual</option>
                            <option value="anomaly">Anomaly</option>
                        </select>

                    </div>
                </div>

                <div id="temperature-tabs" class="data-accordion-wrap">
                    <div class="data-accordion">

                        <div id="temperature-chart" class="data-accordion-tab data-chart accent-background">
                            <header>
                                <h4>
                                    <span class="icon icon-emission-scenario"></span> <span class="text">
                                Chart<span class="full-title">: <?php echo $county ?></span>
                                <span class="source" id="temp-chart-name">Ave Daily Max Temp (°F)</span>
                              </span>
                                </h4>

                                <div class="data-accordion-actions">
                                    <a href="javascript:void(0);" class="how-to-read"><span class="icon icon-help"></span>How to read this</a> <a href="javascript:void(0);" id="temp-download-image" class="download-image"><span class="icon icon-download-image"></span>Image</a> <a href="javascript:void(0);" id="temp-download-data" class="download-data"><span class="icon icon-download-chart"></span>Data</a>
                                </div>
                            </header>

                            <div class="data-accordion-content chart">
                                <div class="chart-wrap">
                                    <div id="chart-123" class="chart-canvas" data-chart-ID="123"></div>
                                    <div class="chart-legend">
                                        <div id="historical-obs" class="legend-item legend-item-range">
                                            <div class="legend-item-line-container">
                                                <div class="legend-item-line observed" id="over-baseline-block"></div>
                                            </div>
                                            <span class="legend-item-line-label">Observations</span>
                                        </div>
                                        <div id="historical-range" class="legend-item legend-item-range selected">
                                            <div class="legend-item-block selected" id="historical-block"></div>
                                            Historical (Modeled)
                                        </div>
                                        <div id="rcp45-range" class="legend-item legend-item-range selected">
                                            <div class="legend-item-block selected" id="rcp45-block"></div>
                                            Lower Emissions
                                        </div>
                                        <div id="rcp85-range" class="legend-item legend-item-range selected">
                                            <div class="legend-item-block selected" id="rcp85-block"></div>
                                            Higher Emissions
                                        </div>
                                        <div id="rcp45-mean" class="legend-item legend-item-range selected">
                                            <div class="legend-item-line-container">
                                                <div class="legend-item-line selected" id="rcp85-line"></div>
                                                <div class="legend-item-line selected" id="rcp45-line"></div>
                                            </div>
                                            <span class="legend-item-line-label">Medians</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="range">
                                    <div class="chart-range" id="slider-range" data-start="2010" data-end="2100"></div>
                                    <div class="ui-slider-label range-label min" id="temp-range-low">1950</div>
                                    <div class="ui-slider-label range-label mid" id="temp-range-mid" style="display:none">30 Years Centered in 2050
                                    </div>
                                    <div class="ui-slider-label range-label max" id="temp-range-high">2100</div>
                                </div>
                            </div>
                        </div>

                        <div id="temperature-map-container" class="data-accordion-tab data-map accent-background">
                            <header>
                                <h4 class="accent-color">
                                    <span class="icon icon-district"></span> <span class="text">
                                        Map<span class="full-title">: <?php echo $county ?></span>
                                        <span class="source" id="temp-map-name">Ave Daily Max Temp (°F)</span>
                                      </span>
                                </h4>

                                <div class="data-accordion-actions">
                                    <div class="select map-seasons-container" id="temperature-map-season">
                                        <select class="dropdown">
                                            <option value="summer">July</option>
                                            <option value="fall">October</option>
                                            <option value="winter">January</option>
                                            <option value="spring">April</option>
                                        </select>
                                    </div>

                                    <a href="#" class="how-to-read"><span class="icon icon-help"></span>How to read this</a>

                                </div>
                            </header>

                            <div class="data-accordion-content map">
                                <div class="moveable" id="temperature-mapSliderDiv">
                                    <div id="temperature-swipeImg" class="handle">
                                        <div class="emissions-low">

                                            <select class="dropdown" id="le-options" style="width:125px">
                                                <option value="lower_historical">HISTORICAL</option>

                                                <option value="lower">LOWER EMISSIONS</option>


                                            </select>

                                        </div>
                                        <div class="emissions-high">

                                            <select class="dropdown swipe-dropdown" id="he-options" style="width:125px">

                                                <option value="higher">HIGHER EMISSIONS</option>
                                                <option value="higher_historical">HISTORICAL</option>

                                            </select>

                                        </div>

<!--                                        <div class="emissions-low">Lower Emissions</div>-->
<!--                                        <div class="emissions-high">Higher Emissions</div>-->
                                    </div>


                                </div>

                                <div id="temperature-map" class="map-element"></div>

                                <div class="year" id="temperature-map-slider-container">
                                    <div class="year-label year-min">1950</div>
                                    <div class="" id="temperature-map-time-slider" data-min="1950" data-max="2090" data-value="2010"></div>
                                    <div class="year-label year-max">2090</div>
                                </div>

                                <div class="location-map-legend-container">
                                    <h5>Legend</h5>
                                    <div class="location-map-legend">
                                        <img class="legend-image" src="resources/img/legends/summer_tmax.png"></img>
                                    </div>
                                </div>

                                <a href="variables.php?id=tmax" class="full-map-btn button bg-white color-orange arrow-right">View full map</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- end temperature chart and map -->

        <!-- begin precipitation chart and map -->
        <section id="location-precipitation" class="location-data-section-wrap">
            <div class="location-data-section">
                <div id="precipitation-data" class="data-list">
                    <span class="trigger data-options-trigger"><span class="hamburger"><span class="bar"></span></span><span class="text">View</span></span>

                    <h3 class="accent-color"><span class="icon icon-precipitation"></span>Precipitation</h3>

                    <ul class="data-options">
                        <li class="active accent-border">
                            <h4 id="var-pcpn"><a href="<?php $current_domain ?>#" class="text">Total precip</a><a href="<?php $current_domain ?>#detail-pr" class="icon icon-help nav-detail-link"></a></h4>
                            <ul class="location-resolution">
                                <li class="active accent-border"><a class="accent-color">Annual</a></li>
                                <li class="seasonal-monthly"><a>Monthly</a></li>
                                <li class="seasonal-monthly"><a>Seasonal</a></li>
                            </ul>
                        </li>

                        <li class="">
                            <h4 id="var-days_pcpn_gt_1in"><a href="<?php $current_domain ?>#" class="text">Days w/ > 1 in</a><a href="<?php $current_domain ?>#detail-days_pcpn_gt_1in" class="icon icon-help nav-detail-link"></a></h4>
                            <ul class="location-resolution">
                                <li><a>Annual</a></li>
                            </ul>
                        </li>

                        <li class="">
                            <h4 id="var-days_pcpn_gt_2in"><a href="<?php $current_domain ?>#" class="text">Days w/ > 2 in</a><a href="<?php $current_domain ?>#detail-days_pcpn_gt_2in" class="icon icon-help nav-detail-link"></a></h4>
                            <ul class="location-resolution">
                                <li><a>Annual</a></li>
                            </ul>
                        </li>

                        <li class="">
                            <h4 id="var-days_pcpn_gt_3in"><a href="<?php $current_domain ?>#" class="text">Days w/ > 3 in</a><a href="<?php $current_domain ?>#detail-days_pcpn_gt_3in" class="icon icon-help nav-detail-link"></a></h4>
                            <ul class="location-resolution">
                                <li><a>Annual</a></li>
                            </ul>
                        </li>

                        <li class="">
                            <h4 id="var-days_dry_days"><a href="<?php $current_domain ?>#" class="text">Dry Days</a><a href="<?php $current_domain ?>#detail-days_dry_days" class="icon
                            icon-help nav-detail-link"></a></h4>
                            <ul class="location-resolution">
                                <li><a>Annual</a></li>
                            </ul>
                        </li>

                    </ul>

                    <form onsubmit="return false;">
                        <div class="row">
                            <label for="precip-county">County</label>
                            <select id="precip-county" class="u-full-width">
                                <option value="<?php echo $fips ?>" selected="selected"><?php echo $county ?></option>
                            </select>
                        </div>
                        <div class="row">
                            <label for="precip-frequency">Frequency</label>
                            <select id="precip-frequency" class="u-full-width">
                                <option value="annual" selected="selected">Annual</option>
                                <option value="monthly">Monthly</option>
                                <option value="seasonal">Seasonal</option>
                            </select>
                        </div>
                        <div class="row">
                            <label for="precip-timeperiod">Time Period</label>
                            <select id="precip-timeperiod" class="u-full-width">
                                <option value="2025" selected="selected">30 Years Centered on 2025</option>
                                <option value="2050">30 Years Centered on 2050</option>
                                <option value="2075">30 Years Centered on 2075</option>
                            </select>
                        </div>
                        <div class="row">
                            <label for="precip-variable">Variable</label>
                            <select id="precip-variable" class="u-full-width">
                                <option value="pcpn" selected="selected">Total precip</option>
                                <option value="days_pcpn_gt_1in">Days of Precipitation Above 1 Inch</option>
                                <option value="days_pcpn_gt_2in">Days of Precipitation Above 1 Inch</option>
                                <option value="days_pcpn_gt_3in">Days of Precipitation Above 1 Inch</option>
                                <option value="days_pcpn_gt_4in">Days of Precipitation Above 1 Inch</option>
                                <option value="days_dry_days">dry days (days)</option>
                            </select>
                        </div>
                        <div class="row">
                            <div class="six columns">
                                <label for="precip-scenario">Scenario</label>
                                <select id="precip-scenario" class="u-full-width">
                                    <option value="both" selected="selected">RCP 8.5 and 4.5</option>
                                    <option value="rcp85">RCP 8.5</option>
                                    <option value="rcp45">RCP 4.5</option>
                                </select>
                            </div>
                            <div class="six columns">
                                <label for="precip-presentation">Display: </label>
                                <select id="precip-presentation" class="u-full-width">
                                    <option value="absolute">Absolute</option>
                                    <option value="anomaly">Anomaly</option>
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="six columns">
                                <label for="precip-median">Show Medians</label>
                                <select id="precip-median" class="u-full-width">
                                    <option value="true" selected="selected">Show</option>
                                    <option value="false">Hide</option>
                                </select>
                                <label for="precip-hist-mod">Historical Modeled</label>
                                <select id="precip-hist-mod" class="u-full-width">
                                    <option value="false" selected="selected">Hide</option>
                                    <option value="true">Show</option>
                                </select>
                                <label for="precip-hist-obs">Historical Obs</label>
                                <select id="precip-hist-obs" class="u-full-width">
                                    <option value="true">Hide</option>
                                    <option value="false" selected="selected">Show</option>
                                </select>
                            </div>
                        </div>
                        <div class="center">
                            <button id="download-button">Download Data</button>
                        </div>
                        <div class="center">
                            <button><a id="download-image-link-precip">Download Image</a></button>
                        </div>
                    </form>

                    <div class="data-vars">
                        <label for="precipitation-presentation">Display: </label>
                        <select id="precipitation-presentation" class="dropdown">
                            <option value="absolute">Actual</option>
                            <option value="anomaly">Anomaly</option>
                        </select>
                    </div>
                </div>

                <div id="precipitation-tabs" class="data-accordion-wrap">
                    <div class="data-accordion">
                        <div id="precipitation-chart" class="data-accordion-tab data-chart accent-background">
                            <header>
                                <h4>
                                    <span class="icon icon-emission-scenario"></span> <span class="text">
                                Chart<span class="full-title">: <?php echo $county ?></span>
                                <span class="source" id="precip-chart-name">Total precip</span>
                              </span>
                                </h4>
                                <div class="data-accordion-actions">
                                    <a href="javascript:void(0);" class="how-to-read"><span class="icon icon-help"></span>How to read this</a> <a href="javascript:void(0);" id="download-image-precip" class="download-image"><span class="icon icon-download-image"></span>Image</a> <a href="javascript:void(0);" id="precip-download-data" class="download-data"><span class="icon icon-download-chart"></span>Data</a>
                                </div>
                            </header>

                            <div class="data-accordion-content chart">
                                <div class="chart-wrap">
                                    <div id="chart-234" class="chart-canvas" data-chart-ID="234" style="width:100%"></div>
                                    <div class="chart-legend" id="precip-chart">
                                        <div id="precip-historical-obs" class="legend-item legend-item-range">
                                            <div class="legend-item-line-container">
                                                <div class="legend-item-line observed" id="precipover-baseline-block"></div>
                                            </div>
                                            <span class="legend-item-line-label">Observations</span>
                                        </div>
                                        <div id="precip-historical-range" class="legend-item legend-item-range selected">
                                            <div class="legend-item-block selected" id="preciphistorical-block"></div>
                                            Historical (Modeled)
                                        </div>
                                        <div id="precip-rcp45-range" class="legend-item legend-item-range selected">
                                            <div class="legend-item-block selected" id="preciprcp45-block"></div>
                                            Lower Emissions
                                        </div>
                                        <div id="precip-rcp85-range" class="legend-item legend-item-range selected">
                                            <div class="legend-item-block selected" id="preciprcp85-block"></div>
                                            Higher Emissions
                                        </div>
                                        <div id="precip-rcp45-mean" class="legend-item legend-item-range selected">
                                            <div class="legend-item-line-container">
                                                <div class="legend-item-line selected" id="preciprcp85-line"></div>
                                                <div class="legend-item-line selected" id="preciprcp45-line"></div>
                                            </div>
                                            <span class="legend-item-line-label">Medians</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="range">
                                    <div class="chart-range" id="precip-slider-range" data-start="2010" data-end="2100"></div>
                                    <div class="ui-slider-label range-label min" id="precip-range-low">1950</div>
                                    <div class="ui-slider-label range-label mid" id="precip-range-mid" style="display:none">30 Years Centered in 2050
                                    </div>
                                    <div class="ui-slider-label range-label max" id="precip-range-high">2100</div>
                                </div>
                            </div>
                        </div>

                        <div id="precipitation-map-container" class="data-accordion-tab data-map accent-background">
                            <header>
                                <h4 class="accent-color">
                                    <span class="icon icon-district"></span> <span class="text">
                              Map<span class="full-title">: <?php echo $county ?></span>
                              <span class="source" id="precip-map-name">Total precip</span>
                            </span>
                                </h4>

                                <div class="data-accordion-actions">
                                    <div class="select map-seasons-container" id="precipitation-map-season">
                                        <select class="dropdown">
                                            <option value="summer">July</option>
                                            <option value="fall">October</option>
                                            <option value="winter">January</option>
                                            <option value="spring">April</option>
                                        </select>
                                    </div>

                                    <a href="#" class="how-to-read"><span class="icon icon-help"></span>How to read this</a>

                                </div>
                            </header>

                            <div class="data-accordion-content map">
                                <div class="moveable" id="precipitation-mapSliderDiv">
                                    <div id="precipitation-swipeImg" class="handle">
                                        <div class="emissions-low">

                                            <select class="dropdown" id="le-options" style="width:125px">
                                                <option value="lower_historical">HISTORICAL</option>

                                                <option value="lower">LOWER EMISSIONS</option>


                                            </select>

                                        </div>
                                        <div class="emissions-high">

                                            <select class="dropdown swipe-dropdown" id="he-options" style="width:125px">

                                                <option value="higher">HIGHER EMISSIONS</option>
                                                <option value="higher_historical">HISTORICAL</option>

                                            </select>

                                        </div>

                                    </div>


                                </div>

                                <div id="precipitation-map" class="map-element"></div>

                                <div class="year" id="precipitation-map-slider-container">
                                    <div class="year-label year-min">1950</div>
                                    <div class="" id="precipitation-map-time-slider" data-min="1950" data-max="2090" data-value="2010"></div>
                                    <div class="year-label year-max">2090</div>
                                </div>

                                <div class="location-map-legend-container">
                                    <h5>Legend</h5>
                                    <div class="location-map-legend">
                                        <img class="legend-image" src="resources/img/legends/pcpn.png"></img>
                                    </div>
                                </div>

                                <a href="variables.php?id=pr" class="full-map-btn button bg-white color-orange arrow-right">View full map</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- end precip chart and map -->

        <!-- being derived chart and map -->
        <section id="location-derived" class="location-data-section-wrap">
            <div class="location-data-section">
                <div id="derived-data" class="data-list">

                    <span class="trigger data-options-trigger"><span class="hamburger"><span class="bar"></span></span><span class="text">View</span></span>

                    <h3 class="accent-color"><span class="icon icon-drought"></span>Other</h3>

                    <ul class="data-options">
                        <li class="active accent-border">
                            <h4 id="var-hdd_65f"><a href="<?php $current_domain ?>#" class="text">Heating Degree Days (°F-days)</a><a href="<?php $current_domain ?>#detail-heating_degree_day_18" class="icon icon-help nav-detail-link"></a></h4>
                            <ul>
                                <li class="active accent-border"><a class="accent-color">Annual</a></li>
                            </ul>
                        </li>

                        <li class="">
                            <h4 id="var-cdd_65f"><a href="<?php $current_domain ?>#" class="text">Cooling Degree Days (°F-days)</a><a href="<?php $current_domain ?>#detail-cooling_degree_day_18" class="icon icon-help nav-detail-link"></a></h4>
                            <ul>
                                <li><a>Annual</a></li>
                            </ul>
                        </li>

                        <li class="">
                            <h4 id="var-gdd"><a href="<?php $current_domain ?>#" class="text">Growing Degree Days (°F-days)</a><a href="<?php $current_domain ?>#detail-gdd" class="icon icon-help nav-detail-link"></a></h4>
                            <ul>
                                <li><a>Annual</a></li>
                            </ul>
                        </li>

                        <li class="">
                            <h4 id="var-gddmod"><a href="<?php $current_domain ?>#" class="text">Modified Growing Degree Days (°F-days)</a><a href="<?php $current_domain ?>#detail-gddmod" class="icon icon-help nav-detail-link"></a></h4>
                            <ul>
                                <li><a>Annual</a></li>
                            </ul>
                        </li>
                    </ul>

                    <form onsubmit="return false;">
                        <div class="row">
                            <label for="derived-county">County</label>
                            <select id="derived-county" class="u-full-width">
                                <option value="<?php echo $fips ?>" selected="selected"><?php echo $county ?></option>
                            </select>
                        </div>
                        <div class="row">
                            <label for="derived-frequency">Frequency</label>
                            <select id="derived-frequency" class="u-full-width">
                                <option value="annual" selected="selected">Annual</option>
                                <option value="monthly">Monthly</option>
                                <option value="seasonal">Seasonal</option>
                            </select>
                        </div>
                        <div class="row">
                            <label for="derived-timeperiod">Time Period</label>
                            <select id="derived-timeperiod" class="u-full-width">
                                <option value="2025" selected="selected">30 Years Centered on 2025</option>
                                <option value="2050">30 Years Centered on 2050</option>
                                <option value="2075">30 Years Centered on 2075</option>
                            </select>
                        </div>
                        <div class="row">
                            <label for="derived-variable">Variable</label>
                            <select id="derived-variable" class="u-full-width">
                                <option value="hdd_65f" selected="selected">Heating Degree Days</option>
                                <option value="cdd_65f">Cooling Degree Days</option>
                                <option value="gdd">Growing Degree Days</option>
                                <option value="gddmod">Mod. Growing Degree Days</option>
                            </select>
                        </div>
                        <div class="row">
                            <div class="six columns">
                                <label for="derived-scenario">Scenario</label>
                                <select id="derived-scenario" class="u-full-width">
                                    <option value="both" selected="selected">RCP 8.5 and 4.5</option>
                                    <option value="rcp85">RCP 8.5</option>
                                    <option value="rcp45">RCP 4.5</option>
                                </select>
                            </div>
                            <div class="six columns">
                                <label for="derived-presentation">Display: </label>
                                <select id="derived-presentation" class="u-full-width">
                                    <option value="absolute">Absolute</option>
                                    <option value="anomaly">Anomaly</option>
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="six columns">
                                <label for="derived-median">Show Medians</label>
                                <select id="derived-median" class="u-full-width">
                                    <option value="true" selected="selected">Show</option>
                                    <option value="false">Hide</option>
                                </select>
                                <label for="derived-hist-mod">Historical Modeled</label>
                                <select id="derived-hist-mod" class="u-full-width">
                                    <option value="false" selected="selected">Hide</option>
                                    <option value="true">Show</option>
                                </select>
                                <label for="derived-hist-obs">Historical Obs</label>
                                <select id="derived-hist-obs" class="u-full-width">
                                    <option value="true">Hide</option>
                                    <option value="false" selected="selected">Show</option>
                                </select>
                            </div>
                        </div>
                        <div class="center">
                            <button id="download-button">Download Data</button>
                        </div>
                        <div class="center">
                            <button><a id="download-image-link-derived">Download Image</a></button>
                        </div>
                    </form>

                    <div class="data-vars">
                        <label for="der-presentation">Display: </label>
                        <select id="der-presentation" class="dropdown">
                            <option value="absolute">Actual</option>
                            <option value="anomaly">Anomaly</option>
                        </select>
                    </div>
                </div>

                <div id="derived-tabs" class="data-accordion-wrap">
                    <div class="data-accordion">

                        <div id="derived-chart" class="data-accordion-tab data-chart accent-background">
                            <header>
                                <h4>
                                    <span class="icon icon-emission-scenario"></span> <span class="text">
                                Chart<span class="full-title">: <?php echo $county ?></span>
                                <span class="source" id="derived-chart-name">Heating Degree Days</span>
                              </span>
                                </h4>

                                <div class="data-accordion-actions">
                                    <a href="javascript:void(0);" class="how-to-read"><span class="icon icon-help"></span>How to read this</a> <a href="javascript:void(0);" id="download-image-derived" class="download-image"><span class="icon icon-download-image"></span>Image</a> <a href="javascript:void(0);" id="derived-download-data" class="download-data"><span class="icon icon-download-chart"></span>Data</a>
                                </div>
                            </header>

                            <div class="data-accordion-content chart">
                                <div class="chart-wrap">
                                    <div id="chart-345" class="chart-canvas" data-chart-ID="345" style="width:100%"></div>
                                    <div class="chart-legend" id="derive-chart">
                                        <div id="derive-historical-obs" class="legend-item legend-item-range">
                                            <div class="legend-item-line-container">
                                                <div class="legend-item-line observed" id="deriveunder-baseline-block"></div>
                                            </div>
                                            <span class="legend-item-line-label">Observations</span>
                                        </div>
                                        <div id="derive-historical-range" class="legend-item legend-item-range selected">
                                            <div class="legend-item-block selected" id="derivehistorical-block"></div>
                                            Historical (Modeled)
                                        </div>
                                        <div id="derive-rcp45-range" class="legend-item legend-item-range selected">
                                            <div class="legend-item-block selected" id="derivercp45-block"></div>
                                            Lower Emissions
                                        </div>
                                        <div id="derive-rcp85-range" class="legend-item legend-item-range selected">
                                            <div class="legend-item-block selected" id="derivercp85-block"></div>
                                            Higher Emissions
                                        </div>
                                        <div id="derive-rcp45-mean" class="legend-item legend-item-range selected">
                                            <div class="legend-item-line-container">
                                                <div class="legend-item-line selected" id="derivercp85-line"></div>
                                                <div class="legend-item-line selected" id="derivercp45-line"></div>
                                            </div>
                                            <span class="legend-item-line-label">Medians</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="range">
                                    <div class="chart-range" id="derived-slider-range" data-start="2010" data-end="2100"></div>
                                    <div class="ui-slider-label range-label min" id="derived-temp-range-low">1950</div>
                                    <div class="ui-slider-label range-label max" id="derived-temp-range-high">2100</div>
                                </div>
                            </div>
                        </div>

                        <div id="derived-map-container" class="data-accordion-tab data-map accent-background">
                            <header>
                                <h4 class="accent-color">
                                    <span class="icon icon-district"></span> <span class="text">
                                Map<span class="full-title">: <?php echo $county ?></span>
                                <span class="source" id="derived-map-name">Heating Degree Days</span>
                              </span>
                                </h4>

                                <div class="data-accordion-actions">
                                    <div class="select map-seasons-container" id="derived-map-season">
                                        <select class="dropdown">
                                            <option value="summer">July</option>
                                            <option value="fall">October</option>
                                            <option value="winter">January</option>
                                            <option value="spring">April</option>
                                        </select>
                                    </div>

                                    <a href="#" class="how-to-read"><span class="icon icon-help"></span>How to read this</a>

                                </div>
                            </header>

                            <div class="data-accordion-content map">
                                <div class="moveable" id="derived-mapSliderDiv">
                                    <div id="derived-swipeImg" class="handle">
                                        <div class="emissions-low">

                                            <select class="dropdown" id="le-options" style="width:125px">
                                                <option value="lower_historical">HISTORICAL</option>
                                                <option value="lower">LOWER EMISSIONS</option>
                                            </select>

                                        </div>
                                        <div class="emissions-high">

                                            <select class="dropdown swipe-dropdown" id="he-options" style="width:125px">
                                                <option value="higher">HIGHER EMISSIONS</option>
                                                <option value="higher_historical">HISTORICAL</option>
                                            </select>

                                        </div>
                                    </div>
                                </div>

                                <div id="derived-map" class="map-element"></div>

                                <div class="year" id="derived-map-slider-container">
                                    <div class="year-label year-min">1950</div>
                                    <div class="" id="derived-map-time-slider" data-min="1950" data-max="2090" data-value="2010"></div>
                                    <div class="year-label year-max">2090</div>
                                </div>

                                <div class="location-map-legend-container">
                                    <h5>Legend</h5>
                                    <div class="location-map-legend">
                                        <img class="legend-image" src="resources/img/legends/hdd_65f.png"></img>
                                    </div>
                                </div>

                                <a href="variables.php?id=hdd_65f" class="full-map-btn button bg-white color-orange arrow-right">View full map</a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>


    </div>
</div>

<?php include_once('template/footer.php'); ?>

</body>
</html>
