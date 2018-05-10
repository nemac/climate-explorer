<!doctype html>
<html>
<head>
  <?php include_once('template/head.php') ?>
  <meta property="fb:app_id" content="187816851587993">
  <meta property="og:url" content="/">
  <meta property="og:type" content="article">
  <meta property="og:title" content="Location data for Buncombe County, NC">
  <meta property="og:description" content="The Climate Explorer allows you to view historical and projected climate variables and assess the impacts of climate change on the things you care about">
  <meta property="og:image" content="/resources/img/og.jpg">
</head>

<body id="page-location" class="page-type-location">
<div class="cd-cover-layer"></div>
<?php include_once('template/header.php'); ?>

<div id="viewport">
  <div id="main-content-wrap">

    <?php include_once('template/share.php'); ?>

    <div id="location-search">
      <input type="text" class="autocomplete location-mapper" autocomplete="off" placeholder="Search another City, County or Zip code">
    </div>

    <section id="location-splash" class="page-splash">
      <div class="splash-text">
        <h1 id="splash-city"></h1>
        <h3 id="splash-county"></h3>

        <p>Graphs and maps below show observed and modeled data for the county of your selected location. Adjust the displays to focus on times or regions of
          interest.</p>
      </div>

      <div id="page-nav">
        <h4>Jump to:</h4>

        <ul>
          <li><a href="#location-temperature" class="smooth-scroll">Temperature</a></li>
          <li><a href="#location-precipitation" class="smooth-scroll">Precipitation</a></li>
          <li><a href="#location-derived" class="smooth-scroll">Other Variables</a></li>
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
          <li><a href="javascript:void(0);" id="download_hist_obs_data" class='button display-block border-white hover-bg-white'><span
                  class='icon icon-arrow-down'></span>Observed Data</a></li>
          <li><a href="javascript:void(0);" id="download_hist_mod_data" class='button display-block border-white hover-bg-white'><span
                  class='icon icon-arrow-down'></span>Historical Modeled Data</a></li>
          <li><a href="javascript:void(0);" id="download_proj_mod_data" class='button display-block border-white hover-bg-white'><span
                  class='icon icon-arrow-down'></span>Projected Modeled Data</a></li>
          <li><a href="/downloads/Key-to-Climate-Explorer-Download-Filenames-and-Column-Headings.xlsx" class="button display-block border-white hover-bg-white"><span class="icon icon-arrow-down"></span>Information for Interpreting Data</a></li>
        </ul>
      </div>
    </div>


    <div id="download-precip-panel" class="download-panel overlay">
      <div class="download-inner">
        <a href="javascript:void(0);" id="download-precip-dismiss-button" class="icon icon-close"></a>
        <p>Use the following links to download this graph's data:</p>
        <ul>
          <li><a href="javascript:void(0);" id="download_precip_hist_obs_data" class='button display-block border-white hover-bg-white'><span
                  class='icon icon-arrow-down'></span>Observed Data</a></li>
          <li><a href="javascript:void(0);" id="download_precip_hist_mod_data" class='button display-block border-white hover-bg-white'><span
                  class='icon icon-arrow-down'></span>Historical Modeled Data</a></li>
          <li><a href="javascript:void(0);" id="download_precip_proj_mod_data" class='button display-block border-white hover-bg-white'><span
                  class='icon icon-arrow-down'></span>Projected Modeled Data</a></li>
          <li><a href="/downloads/Key-to-Climate-Explorer-Download-Filenames-and-Column-Headings.xlsx" class="button display-block border-white hover-bg-white"><span class="icon icon-arrow-down"></span>Information for Interpreting Data</a></li>
        </ul>
      </div>
    </div>


    <div id="download-derived-panel" class="download-panel overlay">
      <div class="download-inner">
        <a href="javascript:void(0);" id="download-derived-dismiss-button" class="icon icon-close"></a>
        <p>Use the following links to download this graph's data:</p>
        <ul>
          <li><a href="javascript:void(0);" id="download_derived_hist_obs_data" class='button display-block border-white hover-bg-white'><span
                  class='icon icon-arrow-down'></span>Observed Data</a></li>
          <li><a href="javascript:void(0);" id="download_derived_hist_mod_data" class='button display-block border-white hover-bg-white'><span
                  class='icon icon-arrow-down'></span>Historical Modeled Data</a></li>
          <li><a href="javascript:void(0);" id="download_derived_proj_mod_data" class='button display-block border-white hover-bg-white'><span
                  class='icon icon-arrow-down'></span>Projected Modeled Data</a></li>
          <li><a href="/downloads/Key-to-Climate-Explorer-Download-Filenames-and-Column-Headings.xlsx" class="button display-block border-white hover-bg-white"><span class="icon icon-arrow-down"></span>Information for Interpreting Data</a></li>
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
              <h4 id="var-tmax" data-value="tmax"><a href="#" class="text">Avg Daily Max Temp (°F)</a><a href="#detail-tmax"
                                                                                                          class="icon icon-help nav-detail-link"></a></h4>
              <ul class="location-resolution">
                <li class="active accent-border"><a class="accent-color">Annual</a></li>
                <li class="seasonal-monthly"><a>Monthly</a></li>
<!--                <li class="seasonal-monthly"><a>Seasonal</a></li>-->
              </ul>
            </li>

            <li class="">
              <h4 id="var-tmin" data-value="tmin"><a href="#" class="text">Avg Daily Min Temp (°F)</a><a href="#detail-tmin"
                                                                                                          class="icon icon-help nav-detail-link"></a></h4>
              <ul class="location-resolution">
                <li><a>Annual</a></li>
                <li class="seasonal-monthly"><a>Monthly</a></li>
<!--                <li class="seasonal-monthly"><a>Seasonal</a></li>-->
              </ul>
            </li>

            <li class="">
              <h4 id="var-days_tmax_gt_90f" data-value="days_tmax_gt_90f"><a href="#" class="text">Days w/ max > 90°F</a><a
                    href="#detail-days_tmax_gt_90f" class="icon icon-help nav-detail-link"></a></h4>
              <ul class="location-resolution">
                <li><a>Annual</a></li>
              </ul>
            </li>

            <li class="">
              <h4 id="var-days_tmax_gt_95f" data-value="days_tmax_gt_95f"><a href="#" class="text">Days w/ max > 95°F</a><a
                    href="#detail-days_tmax_gt_95f" class="icon icon-help nav-detail-link"></a></h4>
              <ul class="location-resolution">
                <li><a>Annual</a></li>
              </ul>
            </li>

            <li class="">
              <h4 id="var-days_tmax_gt_100f" data-value="days_tmax_gt_100f"><a href="#" class="text">Days w/ max > 100°F</a><a
                    href="#detail-days_tmax_gt_100f" class="icon icon-help nav-detail-link"></a></h4>
              <ul class="location-resolution">
                <li><a>Annual</a></li>
              </ul>
            </li>

            <li class="">
              <h4 id="var-days_tmax_gt_105f" data-value="days_tmax_gt_105f"><a href="#" class="text">Days w/ max > 105°F</a><a
                    href="#detail-days_tmax_gt_105f" class="icon icon-help nav-detail-link"></a></h4>
              <ul class="location-resolution">
                <li><a>Annual</a></li>
              </ul>
            </li>

            <li class="">
              <h4 id="var-days_tmax_lt_32f" data-value="days_tmax_lt_32f"><a href="#" class="text">Days w/ max < 32°F</a><a
                    href="#detail-days_tmax_lt_32f" class="icon icon-help nav-detail-link"></a></h4>
              <ul class="location-resolution">
                <li><a>Annual</a></li>
              </ul>
            </li>

            <li class="">
              <h4 id="var-days_tmin_lt_32f" data-value="days_tmin_lt_32f"><a href="#" class="text">Days w/ min < 32°F</a><a
                    href="#detail-days_tmin_lt_32f" class="icon icon-help nav-detail-link"></a></h4>
              <ul>
                <li><a>Annual</a></li>
              </ul>
            </li>

            <li class="">
              <h4 id="var-days_tmin_gt_80f" data-value="days_tmin_gt_80f"><a href="#" class="text">Days w/ min > 32°F</a><a
                    href="#detail-days_tmin_gt_80f" class="icon icon-help nav-detail-link"></a></h4>
              <ul class="location-resolution">
                <li><a>Annual</a></li>
              </ul>
            </li>

            <li class="">
              <h4 id="var-days_tmin_gt_90f" data-value="days_tmin_gt_90f"><a href="#" class="text">Days w/ min > 90°F</a><a
                    href="#detail-days_tmin_gt_90f" class="icon icon-help nav-detail-link"></a></h4>
              <ul class="location-resolution">
                <li><a>Annual</a></li>
              </ul>
            </li>
          </ul>

          <form onsubmit="return false;">
            <div class="row">
              <label for="county">County</label>
              <select id="county" class="u-full-width">
              </select>
            </div>
            <div class="row">
              <label for="frequency">Frequency</label>
              <select id="frequency" class="u-full-width">
                <option value="annual" selected="selected">Annual</option>
                <option value="monthly">Monthly</option>
<!--                <option value="seasonal">Seasonal</option>-->
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
                <label for="median">Show Averages</label>
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

            <div id="temperature-chart" class="data-accordion-tab data-chart accent-background open">
              <header>
                <h4>
                  <span class="icon icon-emission-scenario"></span> <span class="text">
                                Chart:&nbsp;<span class="full-title"></span>
                                <span class="source" id="temp-chart-name">Avg Daily Max Temp (°F)</span>
                              </span>
                </h4>

                <div class="data-accordion-actions">
                  <a href="javascript:void(0);" class="how-to-read"><span class="icon icon-help"></span>How to read this</a>
                  <a href="javascript:void(0);" id="temp-download-image" class="download-image"><span class="icon icon-download-image"></span>Image</a>
                  <a href="javascript:void(0);" id="temp-download-data" class="download-data"><span class="icon icon-download-chart"></span>Data</a>
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
                      <span class="legend-item-line-label">Averages</span>
                    </div>
                  </div>
                </div>
                <div class="range">
                  <div class="chart-range" id="slider-range" data-start="2020" data-end="2100"></div>
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
                  <span class="icon icon-district"></span>
                  <span class="text">Map:&nbsp;<span class="full-title"></span>
                  <span class="source" id="temp-map-name">Avg Daily Max Temp (°F)</span>
                </span>
                </h4>

                <div class="data-accordion-actions">
                  <a href="#" class="how-to-read"><span class="icon icon-help"></span>How to read this</a>
                  <div class="select map-seasons-container" id="temperature-map-season">
                    <select class="dropdown">
                      <option value="summer">July</option>
                      <option value="fall">October</option>
                      <option value="winter">January</option>
                      <option value="spring">April</option>
                    </select>
                  </div>
                  <a href="/variables/?id=tmax" class="full-map-btn button bg-white color-orange arrow-right">View full map</a>

                </div>
              </header>

              <div class="data-accordion-content map">

                <div id="temperature-map" class="map-element"></div>

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
              <h4 id="var-pcpn" data-value="pcpn"><a href="#" class="text">Total precip</a><a href="#detail-pcpn"
                                                                                               class="icon icon-help nav-detail-link"></a></h4>
              <ul class="location-resolution">
                <li class="active accent-border"><a class="accent-color">Annual</a></li>
                <li class="seasonal-monthly"><a>Monthly</a></li>
<!--                <li class="seasonal-monthly"><a>Seasonal</a></li>-->
              </ul>
            </li>

            <li class="">
              <h4 id="var-days_pcpn_gt_1in" data-value="days_pcpn_gt_1in"><a href="#" class="text">Days w/ > 1 in</a><a
                    href="#detail-days_pcpn_gt_1in" class="icon icon-help nav-detail-link"></a></h4>
              <ul class="location-resolution">
                <li><a>Annual</a></li>
              </ul>
            </li>

            <li class="">
              <h4 id="var-days_pcpn_gt_2in" data-value="days_pcpn_gt_2in"><a href="#" class="text">Days w/ > 2 in</a><a
                    href="#detail-days_pcpn_gt_2in" class="icon icon-help nav-detail-link"></a></h4>
              <ul class="location-resolution">
                <li><a>Annual</a></li>
              </ul>
            </li>

            <li class="">
              <h4 id="var-days_pcpn_gt_3in" data-value="days_pcpn_gt_3in"><a href="#" class="text">Days w/ > 3 in</a><a
                    href="#detail-days_pcpn_gt_3in" class="icon icon-help nav-detail-link"></a></h4>
              <ul class="location-resolution">
                <li><a>Annual</a></li>
              </ul>
            </li>

            <li class="">
              <h4 id="var-days_dry_days" data-value="days_dry_days"><a href="#" class="text">Dry Days</a><a href="#detail-days_dry_days"
                                                                                                             class="icon
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
              </select>
            </div>
            <div class="row">
              <label for="precip-frequency">Frequency</label>
              <select id="precip-frequency" class="u-full-width">
                <option value="annual" selected="selected">Annual</option>
                <option value="monthly">Monthly</option>
<!--                <option value="seasonal">Seasonal</option>-->
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
                <label for="precip-median">Show Averages</label>
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
            <div id="precipitation-chart" class="data-accordion-tab data-chart accent-background open">
              <header>
                <h4>
                  <span class="icon icon-emission-scenario"></span> <span class="text">
                                Chart:&nbsp;<span class="full-title"></span>
                                <span class="source" id="precip-chart-name">Total precip</span>
                              </span>
                </h4>
                <div class="data-accordion-actions">
                  <a href="javascript:void(0);" class="how-to-read"><span class="icon icon-help"></span>How to read this</a>
                  <a href="javascript:void(0);" id="download-image-precip" class="download-image"> <span class="icon icon-download-image"></span>Image</a>
                  <a href="javascript:void(0);" id="precip-download-data" class="download-data"> <span class="icon icon-download-chart"></span>Data</a>
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
                      <span class="legend-item-line-label">Averages</span>
                    </div>
                  </div>
                </div>
                <div class="range">
                  <div class="chart-range" id="precip-slider-range" data-start="2020" data-end="2100"></div>
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
                              Map:&nbsp;<span class="full-title"></span>
                              <span class="source" id="precip-map-name">Total precip</span>
                            </span>
                </h4>

                <div class="data-accordion-actions">
                  <a href="#" class="how-to-read"><span class="icon icon-help"></span>How to read this</a>
                  <div class="select map-seasons-container" id="precipitation-map-season">
                    <select title="Season" class="dropdown">
                      <option value="summer">July</option>
                      <option value="fall">October</option>
                      <option value="winter">January</option>
                      <option value="spring">April</option>
                    </select>
                  </div>
                  <a href="/variables/?id=pr" class="full-map-btn button bg-white color-orange arrow-right">View full map</a>


                </div>
              </header>

              <div class="data-accordion-content map">
                <div id="precipitation-map" class="map-element"></div>

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

          <h3 class="accent-color"><span class="icon icon-drought"></span>Other Variables</h3>

          <ul class="data-options">
            <li class="active accent-border">
              <h4 id="var-hdd_65f" data-value="hdd_65f"><a href="#" class="text">Heating Degree Days (°F-days)</a><a
                    href="#detail-hdd_65f" class="icon icon-help nav-detail-link"></a></h4>
              <ul>
                <li class="active accent-border"><a class="accent-color">Annual</a></li>
              </ul>
            </li>

            <li class="">
              <h4 id="var-cdd_65f" data-value="cdd_65f"><a href="#" class="text">Cooling Degree Days (°F-days)</a><a
                    href="#detail-cdd_65f" class="icon icon-help nav-detail-link"></a></h4>
              <ul class="location-resolution">
                <li><a>Annual</a></li>
              </ul>
            </li>

            <li class="">
              <h4 id="var-gdd" data-value="gdd"><a href="#" class="text">Growing Degree Days (°F-days)</a><a href="#detail-gdd"
                                                                                                              class="icon icon-help nav-detail-link"></a>
              </h4>
              <ul class="location-resolution">
                <li><a>Annual</a></li>
              </ul>
            </li>

            <li class="">
              <h4 id="var-gddmod" data-value="gddmod"><a href="#" class="text">Modified Growing Degree Days (°F-days)</a><a
                    href="#detail-gddmod" class="icon icon-help nav-detail-link"></a></h4>
              <ul class="location-resolution">
                <li><a>Annual</a></li>
              </ul>
            </li>
          </ul>

          <form onsubmit="return false;">
            <div class="row">
              <label for="derived-county">County</label>
              <select id="derived-county" class="u-full-width">

              </select>
            </div>
            <div class="row">
              <label for="derived-frequency">Frequency</label>
              <select id="derived-frequency" class="u-full-width">
                <option value="annual" selected="selected">Annual</option>
                <option value="monthly">Monthly</option>
<!--                <option value="seasonal">Seasonal</option>-->
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
                <label for="derived-median">Show Averages</label>
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

            <div id="derived-chart" class="data-accordion-tab data-chart accent-background open">
              <header>
                <h4>
                  <span class="icon icon-emission-scenario"></span> <span class="text">
                                Chart:&nbsp;<span class="full-title"></span>
                                <span class="source" id="derived-chart-name">Heating Degree Days</span>
                              </span>
                </h4>

                <div class="data-accordion-actions">
                  <a href="javascript:void(0);" class="how-to-read">
                    <span class="icon icon-help"></span>How to read this</a>
                  <a href="javascript:void(0);" id="download-image-derived" class="download-image"><span class="icon icon-download-image"></span>Image</a>
                  <a href="javascript:void(0);" id="derived-download-data" class="download-data"> <span class="icon icon-download-chart"></span>Data</a>
                </div>
              </header>

              <div class="data-accordion-content chart">
                <div class="chart-wrap">
                  <div id="chart-345" class="chart-canvas" data-chart-ID="345"></div>
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
                      <span class="legend-item-line-label">Averages</span>
                    </div>
                  </div>
                </div>

                <div class="range">
                  <div class="chart-range" id="derived-slider-range" data-start="2020" data-end="2100"></div>
                  <div class="ui-slider-label range-label min" id="derived-temp-range-low">1950</div>
                  <div class="ui-slider-label range-label max" id="derived-temp-range-high">2100</div>
                </div>
              </div>
            </div>

            <div id="derived-map-container" class="data-accordion-tab data-map accent-background">
              <header>

                <h4 class="accent-color">
                  <span class="icon icon-district"></span> <span class="text">
                                Map:&nbsp;<span class="full-title"></span>
                                <span class="source" id="derived-map-name">Heating Degree Days</span>
                              </span>
                </h4>

                <div class="data-accordion-actions">
                  <a href="#" class="how-to-read"><span class="icon icon-help"></span>How to read this</a>
                  <div class="select map-seasons-container" id="derived-map-season">
                    <select class="dropdown">
                      <option value="summer">July</option>
                      <option value="fall">October</option>
                      <option value="winter">January</option>
                      <option value="spring">April</option>
                    </select>
                  </div>
                  <!--  todo fix url and handle variable changes -->
                  <a href="variables.php?id=hdd_65f" class="full-map-btn button bg-white color-orange arrow-right">View full map</a>


                </div>
              </header>

              <div class="data-accordion-content map">


                <div id="derived-map" class="map-element"></div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>


  </div>
</div>

<?php include_once('template/footer.php'); ?>

<script src="https://unpkg.com/terraformer@1.0.8/terraformer.js" integrity="sha384-+M797Pj3WZVCwMmLbOxAoaWYcKJo8NSxItmI48ytcLNeAnfn1d/IckFn31jEqrzP"
        crossorigin="anonymous"></script>
<script src="https://unpkg.com/terraformer-arcgis-parser@1.0.5/terraformer-arcgis-parser.js"
        integrity="sha384-duFUjKTSNoxEspdJNwr83CUgRxclf0ueKJB9DU/Vbit6bfWgzvZsHW6H1JLBBXhp" crossorigin="anonymous"></script>
<script type="text/javascript" src="/resources/js/scenarioComparisonMap.js"></script>
<script type="text/javascript" src="/resources/js/location.js"></script>

</body>
</html>
