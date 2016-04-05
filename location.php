<?php

  $location = true;
  $city = $_REQUEST['city'];
  $county = $_REQUEST['county'];
  $fips = $_REQUEST['fips'];
  $lat = $_REQUEST['lat'];
  $lon = $_REQUEST['lon'];

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

<body id="page-location-seattle" class="page-type-location">

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
                    <li><a href="#location-temperature">Temperature</a></li>
                    <li><a href="#location-precipitation">Precipitation</a></li>
                    <li><a href="#location-derived">Derived</a></li>
                    <li><a href="#location-stations">Weather Stations</a></li>
                    <li><a href="#location-impacts">Relevant Impacts</a></li>
                </ul>
            </div>
        </section>

        <!-- begin temperature chart and map -->
        <section id="location-temperature" class="location-data-section-wrap">
            <div class="location-data-section">
                <header>
                  <h3 class="accent-color"><span class="icon icon-temperature"></span>Temperature</h3>

                  <div class="data-vars">
                    <label for="temperature-presentation">Display: </label>

                    <select id="temperature-presentation" class="dropdown">
                      <option value="absolute">Actual</option>
                      <option value="anomaly">Anomaly</option>
                    </select>

                  </div>
                </header>

                <div id="temperature-data" class="data-list">
                    <ul class="data-options">
                      <li class="active accent-border">
                        <h4 id="var-tasmax"><a href="#" class="text accent-color">Mean Daily Maximum</a><a href="#detail-temperature" class="icon icon-help nav-detail-link"></a></h4>
                        <ul class="location-resolution">
                          <li><a>Annual</a></li>
                          <li><a>Seasonal</a></li>
                          <li><a>Monthly</a></li>
                        </ul>
                      </li>

                      <li class="accent-border">
                        <h4 id="var-tasmin"><a href="#" class="text accent-color">Mean Daily Minimum</a><a href="#" class="icon icon-help nav-detail-link"></a></h4>
                        <ul class="location-resolution">
                          <li><a>Annual</a></li>
                          <li><a>Seasonal</a></li>
                          <li><a>Monthly</a></li>
                        </ul>
                      </li>

                      <li class="accent-border">
                        <h4 id="var-days_tmax_abv_35.0"><a href="#" class="text accent-color">Days with Maximum Above 95&deg;</a><a href="#" class="icon icon-help nav-detail-link"></a></h4>
                        <ul class="location-resolution">
                          <li><a>Annual</a></li>
                        </ul>
                      </li>

                      <li class="accent-border">
                        <h4 id="var-days_tmin_blw_0.0"><a href="#" class="text accent-color">Days with Minimum Below 32º</a><a href="#" class="icon icon-help nav-detail-link"></a></h4>
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
                                    <option value="both">RCP 8.5 and 4.5</option>
                                    <option value="rcp85" selected="selected">RCP 8.5</option>
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
                                    <option value="false" selected="selected">Hide</option>
                                    <option value="true">Show</option>
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
                </div>

                <div id="temperature-tabs" class="data-accordion-wrap">
                    <div class="data-accordion">

                        <div id="temperature-chart" class="data-accordion-tab data-chart accent-background">
                          <header>
                            <h4>
                              <span class="icon icon-emission-scenario"></span>
                              <span class="text">
                                Chart<span class="full-title">: Chart Title</span>
                                <span class="source">Source: <a href="#" target="_blank">NOAA, 2014</a></span>
                              </span>
                            </h4>

                            <div class="data-accordion-actions">
                              <a href="#" class="how-to-read"><span class="icon icon-help"></span>How to read this</a>
                              <a href="#" id="temp-download-image" class="download-image"><span class="icon icon-download-image"></span>Image</a>
                              <a href="#" class="download-data"><span class="icon icon-download-chart"></span>Data</a>
                            </div>
                          </header>

                          <div class="data-accordion-content chart">
                              <div class="chart-wrap">
                                <div id="chart-123" class="chart-canvas" data-chart-ID="123"></div>
                                <div class="chart-legend">
                                  <div id="rcp45-range" class="legend-item legend-item-range">
                                    <div class="legend-item-block" id="rcp45-block"></div>
                                    Low Emissions (RCP 4.5) Range
                                  </div>
                                  <div id="rcp85-range" class="legend-item legend-item-range selected">
                                    <div class="legend-item-block selected" id="rcp85-block"></div>
                                    High Emissions (RCP 8.5) Range
                                  </div>
                                  <div id="rcp45-mean" class="legend-item legend-item-range">
                                    <div class="legend-item-line" id="rcp85-line"></div>
                                    High Emissions Median
                                    <div class="legend-item-line" id="rcp45-line"></div>
                                    Low Emissions Median
                                  </div>
                                  <div id="historical-range" class="legend-item legend-item-range">
                                    <div class="legend-item-block" id="historical-block"></div>
                                    Historical (Modelled)
                                  </div>
                                  <div id="under-baseline-range" class="legend-item legend-item-range">
                                    <div class="legend-item-block" id="under-baseline-block"></div>
                                    Observed under baseline
                                  </div>
                                  <div id="over-baseline-range" class="legend-item legend-item-range">
                                    <div class="legend-item-block" id="over-baseline-block"></div>
                                    Observed over baseline
                                  </div>
                                </div>
                              </div>
                              <div class="range">
                                  <div id="slider-range"></div>
                                  <div class="ui-slider-label range-label min">2010</div>
                                  <div class="ui-slider-label range-label max">2100</div>
                              </div>
                          </div>
                        </div>

                        <div id="temperature-map" class="data-accordion-tab data-map accent-background">
                          <header>
                            <h4 class="accent-color">
                              <span class="icon icon-district"></span>
                              <span class="text">
                                Map<span class="full-title">: Map Title</span>
                                <span class="source">Source: <a href="#" target="_blank">NOAA, 2014</a></span>
                              </span>
                            </h4>

                            <div class="data-accordion-actions">
                              <a href="#" class="how-to-read"><span class="icon icon-help"></span>How to read this</a>
                              <a href="#" class="download-image"><span class="icon icon-download-image"></span>Image</a>
                              <a href="#" class="download-data"><span class="icon icon-download-chart"></span>Data</a>
                            </div>
                          </header><div id="map-123" class="data-accordion-content map"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- end temperature chart and map -->

        <!-- begin precipitation chart and map -->
        <section id="location-precipitation" class="location-data-section-wrap">
            <div class="location-data-section">
                <header>
                    <h3 class="accent-color"><span class="icon icon-precipitation"></span>Precipitation</h3>

                    <div class="data-vars">
                        <label for="precipitation-presentation">Display: </label>
                        <select id="precipitation-presentation" class="dropdown">
                          <option value="absolute">Actual</option>
                          <option value="anomaly">Anomaly</option>
                        </select>
                    </div>
                </header>

                <div id="precipitation-data" class="data-list">
                  <ul class="data-options">
                    <li class="active accent-border">
                      <h4 id="var-pr"><a href="#" class="text accent-color">Mean Daily Precipitation</a><a href="#" class="icon icon-help nav-detail-link"></a></h4>
                      <ul class="location-resolution">
                        <li><a>Annual</a></li>
                        <li><a>Seasonal</a></li>
                        <li><a>Monthly</a></li>
                      </ul>
                    </li>

                    <li class="accent-border">
                      <h4 id="var-days_prcp_abv_25.3"><a href="#" class="text accent-color">Days of Precipitation Above 1in</a><a href="#" class="icon icon-help nav-detail-link"></a></h4>
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
                            <option value="days_prcp_abv_25.3">Days of Precipitation Above 1in</option>
                          </select>
                      </div>
                      <div class="row">
                          <div class="six columns">
                              <label for="precip-scenario">Scenario</label>
                              <select id="precip-scenario" class="u-full-width">
                                  <option value="both">RCP 8.5 and 4.5</option>
                                  <option value="rcp85" selected="selected">RCP 8.5</option>
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
                                  <option value="false" selected="selected">Hide</option>
                                  <option value="true">Show</option>
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
                </div>

                <div id="precipitation-tabs" class="data-accordion-wrap">
                    <div class="data-accordion">
                        <div id="precipitation-chart" class="data-accordion-tab data-chart accent-background">
                          <header>
                            <h4>
                              <span class="icon icon-emission-scenario"></span>
                              <span class="text">
                                Chart<span class="full-title">: Chart Title</span>
                                <span class="source">Source: <a href="#" target="_blank">NOAA, 2014</a></span>
                              </span>
                            </h4>
                            <div class="data-accordion-actions">
                              <a href="#" class="how-to-read"><span class="icon icon-help"></span>How to read this</a>
                              <a href="#" id="download-image-precip" class="download-image"><span class="icon icon-download-image"></span>Image</a>
                              <a href="#" class="download-data"><span class="icon icon-download-chart"></span>Data</a>
                            </div>
                          </header>

                          <div class="data-accordion-content chart">
                            <div class="chart-wrap">
                              <div id="chart-234" class="chart-canvas" data-chart-ID="234" style="width:100%"></div>
                              <div class="chart-legend" id="precip-chart">
                                <div id="rcp45-range" class="legend-item legend-item-range">
                                  <div class="legend-item-block" id="preciprcp45-block"></div>
                                  Low Emissions (RCP 4.5) Range
                                </div>
                                <div id="rcp85-range" class="legend-item legend-item-range selected">
                                  <div class="legend-item-block selected" id="preciprcp85-block"></div>
                                  High Emissions (RCP 8.5) Range
                                </div>
                                <div id="rcp45-mean" class="legend-item legend-item-range">
                                  <div class="legend-item-line" id="preciprcp85-line"></div>
                                  High Emissions Median
                                  <div class="legend-item-line" id="preciprcp45-line"></div>
                                  Low Emissions Median
                                </div>
                                <div id="historical-range" class="legend-item legend-item-range">
                                  <div class="legend-item-block" id="historical-block"></div>
                                  Historical (Modelled)
                                </div>
                                <div id="under-baseline-range" class="legend-item legend-item-range">
                                  <div class="legend-item-block" id="under-baseline-block"></div>
                                  Observed under baseline
                                </div>
                                <div id="over-baseline-range" class="legend-item legend-item-range">
                                  <div class="legend-item-block" id="over-baseline-block"></div>
                                  Observed over baseline
                                </div>
                              </div>
                            </div>
                            <div class="range">
                              <div id="precip-slider-range"></div>
                              <div class="ui-slider-label range-label min">2010</div>
                              <div class="ui-slider-label range-label max">2100</div>
                            </div>
                        </div>
                      </div>

                        <div id="precipitation-map" class="data-accordion-tab data-map accent-background">
                          <header>
                              <h4 class="accent-color">
                                <span class="icon icon-district"></span>
                                <span class="text">
                                  Map<span class="full-title">: Map Title</span>
                                  <span class="source">Source: <a href="#" target="_blank">NOAA, 2014</a></span>
                                </span>
                              </h4>
                              <div class="data-accordion-actions">
                                <a href="#" class="download-image"><span class="icon icon-download-image"></span>Image</a>
                                <a href="#" class="download-data"><span class="icon icon-download-chart"></span>Data</a>
                              </div>
                          </header>
                          <div id="map-234" class="data-accordion-content map"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    <!-- end precip chart and map -->


    <!-- being derived chart and map -->
        <section id="location-derived" class="location-data-section-wrap">
            <div class="location-data-section">
                <header>
                    <h3 class="accent-color"><span class="icon icon-drought"></span>Derived</h3>

                    <div class="data-vars">

                        <label for="der-presentation">Display: </label>
                        <select id="der-presentation" class="dropdown">
                          <option value="absolute">Actual</option>
                          <option value="anomaly">Anomaly</option>
                        </select>
                    </div>
                </header>

                <div id="derived-data" class="data-list">
                  <ul class="data-options">
                    <li class="active accent-border">
                      <h4 id="var-heating_degree_day_18.3"><a href="#" class="text accent-color">Heating Degree Days</a><a href="#" class="icon icon-help nav-detail-link"></a></h4>
                      <ul>
                        <li><a>Annual</a></li>
                      </ul>
                    </li>

                    <li class="accent-border">
                      <h4 id="var-cooling_degree_day_18.3"><a href="#" class="text accent-color">Cooling Degree Days</a><a href="#" class="icon icon-help nav-detail-link"></a></h4>
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
                                  <option value="both">RCP 8.5 and 4.5</option>
                                  <option value="rcp85" selected="selected">RCP 8.5</option>
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
                                  <option value="false" selected="selected">Hide</option>
                                  <option value="true">Show</option>
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
                </div>

                <div id="derived-tabs" class="data-accordion-wrap">
                    <div class="data-accordion">

                        <div id="derived-chart" class="data-accordion-tab data-chart accent-background">
                          <header>
                            <h4>
                              <span class="icon icon-emission-scenario"></span>
                              <span class="text">
                                Chart<span class="full-title">: Chart Title</span>
                                <span class="source">Source: <a href="#" target="_blank">NOAA, 2014</a></span>
                              </span>
                            </h4>

                            <div class="data-accordion-actions">
                              <a href="#" class="how-to-read"><span class="icon icon-help"></span>How to read this</a>
                              <a href="#" id="download-image-derived" class="download-image"><span class="icon icon-download-image"></span>Image</a>
                              <a href="#" class="download-data"><span class="icon icon-download-chart"></span>Data</a>
                            </div>
                          </header>

                          <div class="data-accordion-content chart">
                            <div class="chart-wrap">
                              <div id="chart-345" class="chart-canvas" data-chart-ID="345" style="width:100%"></div>
                              <div class="chart-legend" id="derive-chart">
                                <div id="rcp45-range" class="legend-item legend-item-range">
                                  <div class="legend-item-block" id="derivercp45-block"></div>
                                  Low Emissions (RCP 4.5) Range
                                </div>
                                <div id="rcp85-range" class="legend-item legend-item-range selected">
                                  <div class="legend-item-block selected" id="derivercp85-block"></div>
                                  High Emissions (RCP 8.5) Range
                                </div>
                                <div id="rcp45-mean" class="legend-item legend-item-range">
                                  <div class="legend-item-line" id="derivercp85-line"></div>
                                  High Emissions Median
                                  <div class="legend-item-line" id="derivercp45-line"></div>
                                  Low Emissions Median
                                </div>
                                <div id="historical-range" class="legend-item legend-item-range">
                                  <div class="legend-item-block" id="historical-block"></div>
                                  Historical (Modelled)
                                </div>
                                <div id="under-baseline-range" class="legend-item legend-item-range">
                                  <div class="legend-item-block" id="under-baseline-block"></div>
                                  Observed under baseline
                                </div>
                                <div id="over-baseline-range" class="legend-item legend-item-range">
                                  <div class="legend-item-block" id="over-baseline-block"></div>
                                  Observed over baseline
                                </div>
                              </div>
                            </div>

                            <div class="range">
                              <div id="derived-slider-range"></div>
                              <div class="ui-slider-label range-label min">2010</div>
                              <div class="ui-slider-label range-label max">2100</div>
                            </div>
                          </div>
                        </div>

                        <div id="derived-map" class="data-accordion-tab data-map accent-background">
                          <header>
                            <h4 class="accent-color">
                              <span class="icon icon-district"></span>
                              <span class="text">
                                Map<span class="full-title">: Map Title</span>
                                <span class="source">Source: <a href="#" target="_blank">NOAA, 2014</a></span>
                              </span>
                            </h4>

                            <div class="data-accordion-actions">
                              <a href="#" class="download-image"><span class="icon icon-download-image"></span>Image</a>
                              <a href="#" class="download-data"><span class="icon icon-download-chart"></span>Data</a>
                            </div>
                          </header>
                          <div id="map-345" class="data-accordion-content map"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>


        <!-- begin precipitation chart and map -->
        <section id="location-stations" class="location-data-section-wrap">
          <div class="location-data-section">
            <header>
              <h3 class="accent-color"><span class="icon icon-temperature"></span>Weather Stations</h3>
            </header>
          </div>
          <div id="location-station-map"></div>
        </section>
    <!-- end precip chart and map -->


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
        </section>
    </div>
</div>


<?php include_once('template/footer.php'); ?>

<script src="./resources/js/cwg/climate-widget-graph.js"></script>
<script src="./resources/js/cwg/cwg.js"></script>




</body>
</html>
