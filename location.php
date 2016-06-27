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

if (preg_match('/[^a-z, ._\-0-9]/i', $city)) {
    header("Location:error.php");
}
if (preg_match('/[^a-z, ._\-0-9]/i', $county)) {
    header("Location:error.php");
}
if (!is_numeric($fips)) {
    header("Location:error.php");
}
if (!isValidLatitude($lat)) {
    header("Location:error.php");
}
if (!isValidLongitude($lon)) {
    header("Location:error.php");
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

</head>

<body id="page-location-<?php echo $fips; ?>" class="page-type-location">
<div class="cd-cover-layer"></div>
<?php include_once('template/header.php'); ?>

<div id="viewport">
    <div id="main-content-wrap">

        <?php include_once('template/share.php'); ?>

        <div id="location-search">
            <input type="text" class="autocomplete location-mapper" placeholder="Search another location">
        </div>

        <section id="location-splash" class="page-splash">
            <div class="splash-text">
                <h1><?php echo $city ?></h1>
                <h3><?php echo $county ?></h3>
                <p>Graphs and maps below show observed and modeled data for the County of your selected location. Zoom and pan on the graphs and maps to focus on times or regions of interest.</p>
            </div>

            <div id="page-nav">
                <h4>Jump to:</h4>

                <ul>
                    <li><a href="<?php $current_domain ?>#location-temperature">Temperature</a></li>
                    <li><a href="<?php $current_domain ?>#location-precipitation">Precipitation</a></li>
                    <li><a href="<?php $current_domain ?>#location-derived">Other</a></li>
                    <li><a href="<?php $current_domain ?>#location-stations">Weather Stations</a></li>
                    <!--<li><a href="#location-impacts">Relevant Impacts</a></li>-->
                </ul>
            </div>
        </section>

        <!-- begin temperature chart and map -->

        <div id="download-panel" class="hidden download-panel overlay">
            <div class="download-inner">
                <a href="<?php $current_domain ?>#" id="download-dismiss-button" class="icon icon-close"></a>
                <p>Use the following links to download this graph's data:</p>
                <ul></ul>
            </div>
        </div>

        <section id="location-temperature" class="location-data-section-wrap">
            <div class="location-data-section">
                <div id="temperature-data" class="data-list">

                    <span class="trigger data-options-trigger"><span class="hamburger"><span class="bar"></span></span><span class="text">View</span></span>

                    <h3 class="accent-color"><span class="icon icon-temperature"></span>Temperature</h3>

                    <ul class="data-options">
                        <li class="active accent-border">
                            <h4 id="var-tasmax"><a href="<?php $current_domain ?>#" class="text">Mean Daily Maximum Temperature</a><a href="<?php $current_domain ?>#detail-tasmax" class="icon icon-help nav-detail-link"></a></h4>
                            <ul class="location-resolution">
                                <li class="active accent-border"><a class="accent-color">Annual</a></li>
                                <li class="seasonal-monthly"><a>Monthly</a></li>
                                <li class="seasonal-monthly"><a>Seasonal</a></li>
                            </ul>
                        </li>

                        <li class="">
                            <h4 id="var-tasmin"><a href="<?php $current_domain ?>#" class="text">Mean Daily Minimum Temperature</a><a href="<?php $current_domain ?>#detail-tasmin" class="icon icon-help nav-detail-link"></a></h4>
                            <ul class="location-resolution">
                                <li><a>Annual</a></li>
                                <li class="seasonal-monthly"><a>Monthly</a></li>
                                <li class="seasonal-monthly"><a>Seasonal</a></li>
                            </ul>
                        </li>

                        <li class="">
                            <h4 id="var-days_tmax_abv_35.0"><a href="<?php $current_domain ?>#" class="text">Days with Maximum Above 95&deg;F</a><a href="<?php $current_domain ?>#detail-days_tmax_abv_35" class="icon icon-help nav-detail-link"></a></h4>
                            <ul class="location-resolution">
                                <li><a>Annual</a></li>
                            </ul>
                        </li>

                        <li class="">
                            <h4 id="var-days_tmin_blw_0.0"><a href="<?php $current_domain ?>#" class="text">Days with Minimum Below 32&deg;F</a><a href="<?php $current_domain ?>#detail-days_tmin_blw_0" class="icon icon-help nav-detail-link"></a></h4>
                            <ul>
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
                            <select id="variable" class="u-full-width">
                            </select>
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
                                    <span class="icon icon-emission-scenario"></span>
                              <span class="text">
                                Chart<span class="full-title">: <?php echo $county ?></span>
                                <span class="source" id="temp-chart-name">Mean Daily Maximum Temperature</span>
                              </span>
                                </h4>

                                <div class="data-accordion-actions">
                                    <a href="#" class="how-to-read"><span class="icon icon-help"></span>How to read this</a>
                                    <a href="#" id="temp-download-image" class="download-image"><span class="icon icon-download-image"></span>Image</a>
                                    <a href="#" id="temp-download-data" class="download-data"><span class="icon icon-download-chart"></span>Data</a>
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
                                            Historical (Modelled)
                                        </div>
                                        <div id="rcp45-range" class="legend-item legend-item-range selected">
                                            <div class="legend-item-block selected" id="rcp45-block"></div>
                                            Lower Emissionss
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
                                    <div class="ui-slider-label range-label mid" id="temp-range-mid" style="display:none">30 Years Centered in 2050</div>
                                    <div class="ui-slider-label range-label max" id="temp-range-high">2100</div>
                                </div>
                            </div>
                        </div>

                        <div id="temperature-map-container" class="data-accordion-tab data-map accent-background">
                            <header>
                                <h4 class="accent-color">
                                    <span class="icon icon-district"></span>
                                      <span class="text">
                                        Map<span class="full-title">: <?php echo $county ?></span>
                                        <span class="source" id="temp-map-name">Mean Daily Maximum Temperature</span>
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
                                        <div class="emissions-low">Lower Emissions</div>
                                        <div class="emissions-high">Higher Emissions</div>
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
                                        <img class="legend-image" src="resources/img/tasmax.png"></img>
                                    </div>
                                </div>

                                <a href="variables.php?id=tasmax" class="full-map-btn button bg-white color-orange arrow-right">View full map</a>
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
                            <h4 id="var-pr"><a href="<?php $current_domain ?>#" class="text">Mean Daily Precipitation</a><a href="<?php $current_domain ?>#detail-pr" class="icon icon-help nav-detail-link"></a></h4>
                            <ul class="location-resolution">
                                <li class="active accent-border"><a class="accent-color">Annual</a></li>
                                <li class="seasonal-monthly"><a>Monthly</a></li>
                                <li class="seasonal-monthly"><a>Seasonal</a></li>
                            </ul>
                        </li>

                        <li class="">
                            <h4 id="var-days_prcp_abv_25.3"><a href="<?php $current_domain ?>#" class="text">Days of Precipitation Above 1 Inch</a><a href="<?php $current_domain ?>#detail-pr-above" class="icon icon-help nav-detail-link"></a></h4>
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
                                <option value="pr" selected="selected">Mean Daily Precipitation</option>
                                <option value="days_prcp_abv_25.3">Days of Precipitation Above 1 Inch</option>
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
                                    <span class="icon icon-emission-scenario"></span>
                              <span class="text">
                                Chart<span class="full-title">: <?php echo $county ?></span>
                                <span class="source" id="precip-chart-name">Mean Daily Precipitation</span>
                              </span>
                                </h4>
                                <div class="data-accordion-actions">
                                    <a href="#" class="how-to-read"><span class="icon icon-help"></span>How to read this</a>
                                    <a href="#" id="download-image-precip" class="download-image"><span class="icon icon-download-image"></span>Image</a>
                                    <a href="#" id="precip-download-data" class="download-data"><span class="icon icon-download-chart"></span>Data</a>
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
                                            Historical (Modelled)
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
                                    <div class="ui-slider-label range-label mid" id="precip-range-mid" style="display:none">30 Years Centered in 2050</div>
                                    <div class="ui-slider-label range-label max" id="precip-range-high">2100</div>
                                </div>
                            </div>
                        </div>

                        <div id="precipitation-map-container" class="data-accordion-tab data-map accent-background">
                            <header>
                                <h4 class="accent-color">
                                    <span class="icon icon-district"></span>
                            <span class="text">
                              Map<span class="full-title">: <?php echo $county ?></span>
                              <span class="source" id="precip-map-name">Mean Daily Precipitation</span>
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
                                        <div class="emissions-low">Lower Emissions</div>
                                        <div class="emissions-high">Higher Emissions</div>
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
                                        <img class="legend-image" src="resources/img/pr.png"></img>
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
                            <h4 id="var-heating_degree_day_18.3"><a href="<?php $current_domain ?>#" class="text">Heating Degree Days</a><a href="<?php $current_domain ?>#detail-heating_degree_day_18" class="icon icon-help nav-detail-link"></a></h4>
                            <ul>
                                <li class="active accent-border"><a class="accent-color">Annual</a></li>
                            </ul>
                        </li>

                        <li class="">
                            <h4 id="var-cooling_degree_day_18.3"><a href="<?php $current_domain ?>#" class="text">Cooling Degree Days</a><a href="<?php $current_domain ?>#detail-cooling_degree_day_18" class="icon icon-help nav-detail-link"></a></h4>
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
                                <option value="heating_degree_day_18.3" selected="selected">Heating Degree Days</option>
                                <option value="cooling_degree_day_18.3">Cooling Degree Days</option>
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
                                    <span class="icon icon-emission-scenario"></span>
                              <span class="text">
                                Chart<span class="full-title">: <?php echo $county ?></span>
                                <span class="source" id="derived-chart-name">Heating Degree Days</span>
                              </span>
                                </h4>

                                <div class="data-accordion-actions">
                                    <a href="#" class="how-to-read"><span class="icon icon-help"></span>How to read this</a>
                                    <a href="#" id="download-image-derived" class="download-image"><span class="icon icon-download-image"></span>Image</a>
                                    <a href="#" id="derived-download-data" class="download-data"><span class="icon icon-download-chart"></span>Data</a>
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
                                            Historical (Modelled)
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
                                    <span class="icon icon-district"></span>
                              <span class="text">
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
                                        <div class="emissions-low">Lower Emissions</div>
                                        <div class="emissions-high">Higher Emissions</div>
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
                                        <img class="legend-image" src="resources/img/heating_degree_day_18.3.png"></img>
                                    </div>
                                </div>

                                <a href="variables.php?id=heating_degree_day_18.3" class="full-map-btn button bg-white color-orange arrow-right">View full map</a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>


        <!-- begin weather stations map -->

        <section id="location-stations" class="location-data-section-wrap">
            <div class="location-data-section">
                <div id="stations-data" class="data-list">
                    <h3 class="accent-color"><span class="icon icon-district"></span>Weather Stations</h3>
                    <p>Dots on the map show weather stations in the Global Historical Climatology Network-Daily (GHCN-D) database.</p>
                    <p>Click any dot to view zoomable graphs of observed daily temperature and precipitation compared to 1981-2010 Climate Normals.</p>
                    <p>Scroll or click and drag to adjust the graph display.</p>
                </div>

                <div id="stations-tabs" class="data-accordion-wrap">
                    <div id="location-station-map"></div>
                </div>
            </div>
        </section>

        <!-- end weather stations chart and map -->

        <?php /*
        <section id="location-impacts" class="impacts-list">
            <h2>Relevant Impacts</h2>

            <article id="impact-ecosystem-vulnerability" class="impact-banner" style="background-image: url(./resources/img/bg_topic-ecosystem.jpg);">
                <div class="impact-banner-text">
                    <h4>Impacts</h4>
                    <h3><a href="./impact_ecosystem-vulnerability.html">Ecosystem Vulnerability</a></h3>
                    <p>From large-scale agriculture, to massive dams and reservoirs, to managed fire regimes dating back thousands of years, humans have transformed the planet by engineering Earth’s physical and biological systems to better serve our needs and desires.</p>
                </div>

                <a href="./impact_ecosystem-vulnerability.html" class="button bg-trans border-white hover-bg-white">View details</a>
            </article>

            <article id="impact-coastal-flood-risk" class="impact-banner" style="background-image: url(./resources/img/bg_topic-coastalflood.jpg);">
                <div class="impact-banner-text">
                    <h4>Impacts</h4>
                    <h3><a href="#">Coastal Flood Risk</a></h3>
                    <p>Every year, at multiple locations along the coast of the United States, events such as storm surges, high tides, strong waves, heavy precipitation, increased river flow, and tsunamis cause damaging coastal floods.</p>
                </div>

                <a href="#" class="button bg-trans border-white hover-bg-white">View details</a>
            </article>
        </section>*/ ?>
    </div>
</div>


<?php include_once('template/footer.php'); ?>

<script src="./resources/js/cwg/climate-widget-graph.js"></script>
<script src="./resources/js/cwg/cwg.js"></script>


</body>
</html>
