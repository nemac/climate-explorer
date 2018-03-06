<?php

//DEFINING vars that were using _REQUEST
$case = isset($_GET['id']) ? $purifier->purify($_GET['id']) : '';
$city = isset($_GET['city']) ? $purifier->purify($_GET['city']) : '';
$param = isset($_GET['param']) ? $purifier->purify($_GET['param']) : '';
$current = isset($current) ? $purifier->purify($current) : '';

$temp_content = array(

    array(
        'variable' => 'tmax',
        'name' => 'Avg Daily Max Temp (°F)',
        'overlayname' => 'Average Daily Maximum Temperature (°F)',
        'detail' => "<p>A day’s highest (maximum) temperature usually occurs in the afternoon. Averaging the daily high temperatures over any period results in a mean maximum temperature for that period.</p><p>Maximum temperature serves as one measure of comfort and safety for people and for the health of plants and animals. When maximum temperature exceeds particular thresholds, people can become ill and transportation and energy infrastructure may be stressed.</p>",
        'source' => 'Data Source: NOAA, 2016'
    ),

    array(
        'variable' => 'tmin',
        'name' => 'Avg Daily Min Temp (°F)',
        'overlayname' => 'Average Daily Minimum Temperature (°F)',
        'detail' => "<p>A day’s lowest (minimum) temperature usually occurs in the early morning, just before sunrise. Averaging the daily low temperatures for any period results in a mean minimum temperature for that period.</p><p>Periods of low temperature give plants, animals, and people a chance to recover from daytime heat. When minimum temperatures aren’t sufficiently cool, plant and animal responses can trigger ecosystem changes and increased demand for energy can stress energy infrastructure.</p>",
        'source' => 'Data Source: NOAA, 2016'
    ),

    array(
        'variable' => 'days_tmax_gt_90f',
        'name' => 'Days w/ max > 90°F',
        'overlayname' => 'Days per year with Maximum Temperature Above 90, 95, 100, or 105°F',
        'detail' => "<p>The total number of days per year with maximum temperature above various thresholds is an indicator of how often very hot conditions occur. Depending upon humidity, wind, and physical workload, people who work outdoors or don’t have access to air conditioning may feel very uncomfortable or experience heat stress or illness on very hot days.</p><p>Hot days also stress plants, animals, and human infrastructure such as roads, railroads, and electric lines. Increased demand for electricity to cool homes and buildings can place additional stress on energy infrastructure.</p>",
        'source' => ''
    ),
    array(
        'variable' => 'days_tmax_gt_95f',
        'name' => 'Days w/ max > 95°F',
        'overlayname' => 'Days per year with Maximum Temperature Above 90, 95, 100, or 105°F',
        'detail' => "<p>The total number of days per year with maximum temperature above various thresholds is an indicator of how often very hot conditions occur. Depending upon humidity, wind, and physical workload, people who work outdoors or don’t have access to air conditioning may feel very uncomfortable or experience heat stress or illness on very hot days.</p><p>Hot days also stress plants, animals, and human infrastructure such as roads, railroads, and electric lines. Increased demand for electricity to cool homes and buildings can place additional stress on energy infrastructure.</p>",
        'source' => 'Data Source: NOAA, 2016'
    ),

    array(
        'variable' => 'days_tmax_gt_100f',
        'name' => 'Days w/ max > 100°F',
        'overlayname' => 'Days per year with Maximum Temperature Above 90, 95, 100, or 105°F',
        'detail' => "<p>The total number of days per year with maximum temperature above various thresholds is an indicator of how often very hot conditions occur. Depending upon humidity, wind, and physical workload, people who work outdoors or don’t have access to air conditioning may feel very uncomfortable or experience heat stress or illness on very hot days.</p><p>Hot days also stress plants, animals, and human infrastructure such as roads, railroads, and electric lines. Increased demand for electricity to cool homes and buildings can place additional stress on energy infrastructure.</p>",
        'source' => ''
    ),
    array(
        'variable' => 'days_tmax_gt_105f',
        'name' => 'Days w/ max > 105°F',
        'overlayname' => 'Days per year with Maximum Temperature Above 90, 95, 100, or 105°F',
        'detail' => "<p>The total number of days per year with maximum temperature above various thresholds is an indicator of how often very hot conditions occur. Depending upon humidity, wind, and physical workload, people who work outdoors or don’t have access to air conditioning may feel very uncomfortable or experience heat stress or illness on very hot days.</p><p>Hot days also stress plants, animals, and human infrastructure such as roads, railroads, and electric lines. Increased demand for electricity to cool homes and buildings can place additional stress on energy infrastructure.</p>",
        'source' => ''
    ),
    array(
        'variable' => 'days_tmax_lt_32f',
        'name' => 'Days w/ max < 32°F',
        'overlayname' => 'Days per year with Maximum Temperature below 32°F',
        'detail' => "<p>The total number of days per year when the highest temperature is less than 32°F (0°C) is an indicator of how often very cold days occur.</p><p>Days when the highest temperature doesn’t rise above the freezing point of water are called “icing days.” The annual number of icing days tells us how much rest plants get from growing; with too few icing days, some plants do not perceive a “reset” signal to begin budding or blooming in the spring. The annual number of icing days can also help predict if populations of insects, such as tree-killing bark beetles, will survive the winter or not.</p>",
        'source' => 'Data Source: NOAA, 2016'
    ),
    array(
        'variable' => 'days_tmin_lt_32f',
        'name' => 'Days w/ min < 32°F',
        'overlayname' => 'Days per year with Minimum Temperature below 32°F',
        'detail' => "<p>The total number of days per year when the temperature dips below 32°F (0°C) is an indicator of how often cold days occur.</p><p>A decrease in the number of days temperature drops below freezing promotes earlier spring snowmelt and runoff, with important consequences for managing water resources. Below-freezing temperatures can cause driving hazards, aircraft icing, and damage to infrastructure, yet ski resorts and other winter recreation businesses depend on sufficiently cold days to maintain snowpack. Some plants require a cumulative number of days below freezing before they can begin budding or blooming in the spring.</p>",
        'source' => 'Data Source: NOAA, 2016'
    ),
    array(
        'variable' => 'days_tmin_gt_80f',
        'name' => 'Days w/ min > 80°F',
        'overlayname' => 'Days With Minimum Temperature above 80 or 90°F',
        'detail' => "<p>The total number of days per year when the lowest temperature doesn’t drop below a given threshold is an indicator of how often very warm nights occur.</p><p>When the lowest temperature of a 24-hour period doesn’t dip below 80 or 90°F, plants, animals, and people don’t have a chance to cool down. They can become stressed and susceptible to other negative health impacts. As the number of very warm nights increases, sensitive plants may not produce flowers or viable seeds.</p>",
        'source' => ''
    ),
    array(
        'variable' => 'days_tmin_gt_90f',
        'name' => 'Days w/ min > 90°F',
        'overlayname' => 'Days With Minimum Temperature above 80 or 90°F',
        'detail' => "<p>The total number of days per year when the lowest temperature doesn’t drop below a given threshold is an indicator of how often very warm nights occur.</p><p>When the lowest temperature of a 24-hour period doesn’t dip below 80 or 90°F, plants, animals, and people don’t have a chance to cool down. They can become stressed and susceptible to other negative health impacts. As the number of very warm nights increases, sensitive plants may not produce flowers or viable seeds.</p>",
        'source' => ''
    )

);

$precip_content = array(

    array(
        'variable' => 'pcpn',
        'name' => 'Total Precipitation',
        'overlayname' => 'Total Precipitation',
        'detail' => "<p>Total precipitation over a year, season, or month indicates the average amount of water added to the environment over the indicated period.</p><p>The graph for this variable shows total precipitation in inches. To help users perceive trends in this variable over time however, the map shows precipitation as the percentage change from the long-term average (1961 to 1990).</p>",
        'source' => ''
    ),
    array(
        'variable' => 'days_pcpn_gt_1in',
        'name' => 'Days w/ > 1 in',
        'overlayname' => 'Days with Precipitation Above 1, 2, or 3 inches',
        'detail' => "<p>The number of days per year when locations receive more than 1, 2, or 3 inches of precipitation is an indicator of how often very heavy precipitation events occur. This measurement may also be used as an indicator of flood risk.</p><p>Comparing the number of days with heavy precipitation at a single location over time can reveal a trend of increasing or decreasing flood risk.</p>",
        'source' => 'Data Source: NOAA, 2016'
    ),
    array(
        'variable' => 'days_pcpn_gt_2in',
        'name' => 'Days w/ > 2 in',
        'overlayname' => 'Days with Precipitation Above 1, 2, or 3 inches',
        'detail' => "<p>The number of days per year when locations receive more than 1, 2, or 3 inches of precipitation is an indicator of how often very heavy precipitation events occur. This measurement may also be used as an indicator of flood risk.</p><p>Comparing the number of days with heavy precipitation at a single location over time can reveal a trend of increasing or decreasing flood risk.</p>",
        'source' => ''
    ),
    array(
        'variable' => 'days_pcpn_gt_3in',
        'name' => 'Days w/ > 3 in',
        'overlayname' => 'Days with Precipitation Above 1, 2, or 3 inches',
        'detail' => "<p>The number of days per year when locations receive more than 1, 2, or 3 inches of precipitation is an indicator of how often very heavy precipitation events occur. This measurement may also be used as an indicator of flood risk.</p><p>Comparing the number of days with heavy precipitation at a single location over time can reveal a trend of increasing or decreasing flood risk.</p>",
        'source' => ''
    ),
    array(
        'variable' => 'days_dry_days',
        'name' => 'Dry Days',
        'overlayname' => 'Dry Days',
        'detail' => "<p>The number of dry days per year—days when precipitation is less than 0.01 inches—gives a sense of the portion of the year when no moisture is being added to the environment. Changes in the number of dry days can indicate a tendency toward drier or wetter conditions.</p><p>The graph for this variable shows counts of Dry Days. To help users perceive trends in numbers of dry days over time however, the map shows dry days as the projected annual number of dry days for each decade minus the 1961-1990 average. Positive values indicate more dry days while negative values indicate fewer dry days.</p>",
        'source' => ''
    )

);

$derived_content = array(

    array(
        'variable' => 'hdd_65f',
        'name' => 'Heating Degree Days',
        'overlayname' => 'Heating Degree Days',
        'detail' => "<p>The number of heating degree days at any location reflects the amount of energy people use to heat a building when it is cool outside. Lower numbers of heating degree days indicate lower demand for energy.</p><p>Heating degree days measure how much (in degrees), and for how long (in days), outside air temperature is below 65°F. For example, on a day when the average outdoor temperature is 35°F, raising the indoor temperature to 65°F would require 30 degrees of heating multiplied by 1 day, or 30 heating degree days. Engineers and utility companies use a location’s annual number of heating degree days as one input when estimating demand for energy in the cold season.</p>",
        'source' => 'Data Source: NOAA, 2016'
    ),

    array(
        'variable' => 'cdd_65f',
        'name' => 'Cooling Degree Days',
        'overlayname' => 'Cooling Degree Days',
        'detail' => "<p>The number of cooling degree days at any location reflects the amount of energy people use to cool a building when it is warm outside. Higher numbers of cooling degree days indicate higher demand for energy.</p><p>Cooling degree days measure how much (in degrees), and for how long (in days), outside air temperature is higher than 65°F. For example, on a day when the average outdoor temperature is 85°F, reducing the indoor temperature to 65°F would require 20 degrees of cooling multiplied by 1 day, or 20 cooling degree days. Engineers and utility companies use a location’s annual number of cooling degree days as one input when estimating demand for energy in the warm season.</p>",
        'source' => 'Data Source: NOAA, 2016'
    ),

    array(
        'variable' => 'gdd',
        'name' => 'Growing Degree Days',
        'overlayname' => 'Growing Degree Days',
        'detail' => "<p>The number of growing degree days per year is used to estimate the growth and development of plants (or insects) during the growing season. Higher numbers of growing-degree days indicate longer and warmer growing conditions.</p><p>As growth occurs only when temperature exceeds a species’ base temperature (for example, 50°F), the number of days times the number of degrees above the base indicates the duration and magnitude of growing conditions.</p>",
        'source' => ''
    ),
    array(
        'variable' => 'gddmod',
        'name' => 'Mod. Growing Degree Days',
        'overlayname' => 'Modified Growing Degree Days',
        'detail' => "<p>Corn growers use the number of modified growing degree days to monitor the development of corn crops. </p><p>As corn development occurs only when temperature is above 50°F but below 86°F, the standard calculation for growing-degree days is modified to omit conditions outside this range. In future decades, regions where temperatures regularly exceed 86°F may be less successful in growing corn.</p>",
        'source' => ''
    ),
    array(
        'variable' => 'dry_days',
        'name' => 'Dry Days',
        'overlayname' => 'Dry Days',
        'detail' => "<p>The number of dry days per year (days when precipitation is less than 0.01 inches) gives a sense of the portion of the year when no moisture is being added to the environment. </p><p>Long-term average precipitation totals show that most locations experience one or more relatively dry months or seasons through the year. Any increase in the number of days with no precipitation may indicate a tendency toward drier conditions in one or more seasons. </p>",
        'source' => ''
    )

);

$stations_content = array(

    array(
        'variable' => 'daily_vs_climate',
        'name' => 'Daily vs. Climate',
        'overlayname' => 'What does <u>Daily vs. Climate</u> tell us?',
        'detail' => 'These graphs compare daily temperature ranges and precipitation totals at observing stations to long-term averages. Users can identify when and by how much daily conditions at each station differed from long-term averages (Climate Normals) calculated from the previous three decades.'
    ),
    array(
        'variable' => 'thresholds',
        'name' => 'Thresholds',
        'overlayname' => 'What do <u>Thresholds</u> tell us?',
        'detail' => 'The phrases “too hot” and “too much rain” mean different things to different people. This interface lets users select a station and set their own threshold value for temperature or precipitation: results show how often that value has been exceeded per year.</p><p>For example, it may be “too hot” for herds of cattle when temperatures exceed 95°F. A city could have “too much rain”  if flooding occurs whenever they receive more than 3 inches of rain over two days.</p><p>Knowing how often thresholds have been reached or exceeded in the past can help users estimate how frequently the same thresholds may be crossed in the future.'
    ),
    array(
        'variable' => 'high_tide_flooding',
        'name' => ' Days with High Tide Flooding',
        'overlayname' => 'What do <u>Days with High Tide Flooding</u> tell us?',
        'detail' => 'The annual number of days when local sea level rises above locally identified thresholds for flooding, in the absence of storm surge or riverine flooding, reflects increases in global sea level.</p><p>At each of the stations shown, local emergency managers have identified flooding thresholds related to impacts such as inundation of low-lying roads or seawater infiltration into stormwater systems. Historical counts and future projections are currently available for 28 cities.'
    )

);

?>
<!-- BEGIN HEADER TEMPLATE -->

<header id="main-header">
    <div id="main-nav">
        <a href="https://toolkit.climate.gov" id="header-logo" title="U.S. Climate Resilience Toolkit"><img src="./resources/img/us-climate-resilience-toolkit.png" alt="U.S. Climate Resilience Toolkit"></a>

        <a href="#" id="nav-trigger" class="nav-btn launch-nav"><span class="hamburger"><span class="bar"></span></span><span class="text">Menu</span></a>

        <nav id="subnav">
            <span id="subnav-trigger">More…</span>

            <ul>
                <li><a href="#" id="tour-this-page"><span class="text">Tour This Page</span></a></li>
                <li><a href="about.php"><span class="text">About</span></a></li>
                <li><a href="definitions.php"><span class="text">Definitions</span></a></li>
                <li><a href="faq.php"><span class="text">FAQ</span></a></li>
                <li><a href="credits.php"><span class="text">Credits</span></a></li>
            </ul>
        </nav>

        <?php

        if (strpos(current_URL(), 'location.php') !== false) {

            $breadcrumb = '<a href="#nav-search" class="parent launch-nav" data-nav-slide="0"><span class="icon icon-district"></span>Location</a><span class="current">' . $city . '</span>';

        } elseif (strpos(current_URL(), 'about.php') !== false) {

            $breadcrumb = '<span class="current">About</span>';

        } elseif (strpos(current_URL(), 'definitions.php') !== false) {

            $breadcrumb = '<span class="current">Definitions</span>';

        } elseif (strpos(current_URL(), 'credits.php') !== false) {

            $breadcrumb = '<span class="current">Credits</span>';

        } elseif (strpos(current_URL(), 'stations.php') !== false) {

            $current = $param;
            $current = str_replace("_", " ", $current);
            $current = ucwords($current);

            $breadcrumb = '<a href="#nav-stations" class="parent launch-nav" data-nav-slide="2"><span class="icon icon-bubble"></span>Stations</a><span class="current">' . $current . '</span>';

        }  elseif (strpos(current_URL(), 'variables.php') !== false) {

            echo $current;

            switch ($case) {
                case 'tmax' :
                    $current = 'Avg Daily Max Temp (°F)';
                    break;
                case 'tmin' :
                    $current = 'Avg Daily Min Temp (°F)';
                    break;
                case 'days_tmax_gt_90f' :
                    $current = 'Days w/ max > 90°F';
                    break;
                case 'days_tmax_gt_95f' :
                    $current = 'Days w/ max > 95°F';
                    break;
                case 'days_tmax_gt_100f' :
                    $current = 'Days w/ max > 100°F';
                    break;
                case 'days_tmax_gt_105f' :
                    $current = 'Days w/ max > 105°F';
                    break;
                case 'days_tmax_lt_32f' :
                    $current = 'Days w/ max < 32°F';
                    break;
                case 'days_tmin_lt_32f' :
                    $current = 'Days w/ min < 32°F';
                    break;
                case 'days_tmin_gt_80f' :
                    $current = 'Days w/ min > 80°F';
                    break;
                case 'days_tmin_gt_90f' :
                    $current = 'Days w/ min > 90°F';
                    break;
                case 'pcpn' :
                    $current = 'Total precip';
                    break;
                case 'days_pcpn_gt_1in' :
                    $current = 'Days w/ > 1in';
                    break;
                case 'days_pcpn_gt_2in' :
                    $current = 'Days w/ > 2in';
                    break;
                case 'days_pcpn_gt_3in' :
                    $current = 'Days w/ > 3in';
                    break;
                case 'days_dry_days' :
                    $current = 'Dry Days';
                    break;
                case 'hdd_65f' :
                    $current = 'Heating Degree Days';
                    break;
                case 'cdd_65f' :
                    $current = 'Cooling Degree Days';
                    break;
                case 'gdd' :
                    $current = 'Growing Degree Days';
                    break;
                case 'gddmod' :
                    $current = 'Mod. Growing Degree Days';
                    break;
            }

            $breadcrumb = '<a href="#nav-variables" class="parent launch-nav" data-nav-slide="1"><span class="icon icon-bubble"></span>Variable</a><span class="current">' . $current . '</span>';

        }

        ?>

        <div id="breadcrumb">
            <a href="./"><span class="icon icon-arrow-up"></span>Home</a><?php echo isset($breadcrumb) ? $breadcrumb:'';?>
        </div>
    </div>
</header>

<nav id="nav-overlay" class="overlay">
    <a href="#" class="button close bg-white border-none blend-screen"></a>

    <div id="nav-controls" class="nav-controls cycle-pager external">
        <a href="./" id="nav-overlay-home" class="button"><span class="icon icon-arrow-up"></span><span class="text">Home</span></a>

        <ul id="nav-cycle-pager">
            <li><a href="#nav-search"><span class="icon icon-search"></span> Select a location</a></li>
            <li><a href="#nav-variables"><span class="icon icon-variables"></span> View by variable</a></li>
            <li><a href="#nav-stations"><span class="icon icon-bubble"></span> Explore Station Data</a></li>
        </ul>
    </div>

    <?php

    // NAV

    ?>

    <div id="nav-cycle" class="cycle-slideshow"
         data-cycle-timeout="0"
         data-cycle-fx="scrollHorz"
         data-cycle-slides="> .slide"
         data-cycle-pager="#nav-cycle-pager"
         data-cycle-pager-template=""
         data-cycle-log="false">

        <?php

        // SEARCH

        ?>

        <div id="nav-search" class="slide" data-slide-num="0">
            <div class="slide-bg"></div>

            <div class="nav-content-wrap">
                <h3 class="search-field"><span class="icon icon-search"></span> <input type="text" class="location-mapper" placeholder="Enter county, city, or zip code"></h3>
            </div>
        </div>

        <?php

        // VARIABLES

        ?>

        <div id="nav-variables" class="slide" data-slide-num="1">
            <div class="slide-bg"></div>

            <div class="nav-content-wrap">
                <h3><span class="icon icon-variables"></span> Choose a variable</h3>

                <div class="nav-content tabs">
                    <div id="nav-vars-projected" class="tab nav-content-tab">
                        <ol class="col-3">
                            <li>Temperature
                                <ul>
                                    <?php

                                    foreach ($temp_content as $item) {
//                                        if ($item['name'] == 'Avg Daily Max Temp (°F)') {
//                                            $item['name'] = "Mean Daily Max Temperature";
//                                        }
//                                        if ($item['name'] == 'Avg Daily Min Temp (°F)') {
//                                            $item['name'] = "Mean Daily Min Temperature";
//                                        }
//                                        if ($item['name'] == 'Days With Maximum Above 95°F') {
//                                            $item['name'] = "Days With Max Above 95°F";
//                                        }
//                                        if ($item['name'] == 'Days With Minimum Below 32°F') {
//                                            $item['name'] = "Days With Min Below 32°F";
//                                        }
                                        ?>
                                        <li><a href="#detail-<?php echo $item['variable']; ?>" class="nav-detail-link"><?php echo $item['name']; ?></a></li>
                                        <?php

                                    }

                                    ?>
                                </ul>
                            </li>
                            <li>Precipitation
                                <ul>
                                    <?php

                                    foreach ($precip_content as $item) {

                                        ?>
                                        <li><a href="#detail-<?php echo $item['variable']; ?>" class="nav-detail-link"><?php echo $item['name']; ?></a></li>
                                        <?php

                                    }

                                    ?>
                                </ul>
                            </li>
                            <li>Other
                                <ul>
                                    <?php

                                    foreach ($derived_content as $item) {


                                        ?>
                                        <li><a href="#detail-<?php echo $item['variable']; ?>" class="nav-detail-link"><?php echo $item['name']; ?></a></li>
                                        <?php

                                    }

                                    ?>
                                </ul>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>

        <?php

        // stationS

        ?>

        <div id="nav-stations" class="slide" data-slide-num="2">
            <div class="slide-bg"></div>

            <div class="nav-content-wrap">
                <h3><span class="icon icon-bubble"></span> Choose analysis type</h3>

                <div class="nav-content tabs">
                    <div id="nav-stations-list" class="tab nav-content-tab">
                        <ul class="col-3">
                            <?php

                            foreach ($stations_content as $station) {

                                ?>
                                <li><a href="#detail-<?php echo $station['variable']; ?>" class="nav-detail-link"><?php echo $station['name']; ?></a></li>

<!--                                <li><a href="stations.php?param=--><?php //echo $station['variable']; ?><!--">--><?php //echo $station['name']; ?><!--</a></li>-->
                                <?php

                            }

                            ?>
                        </ul>
                    </div>
                </div>
            </div>


        </div>
    </div>
</nav>

<?php

// DETAIL OVERLAY

?>

<div id="detail-overlay" class="overlay">
    <a href="#" class="button close bg-white border-none blend-screen"></a>

    <?php

    // VARIABLES

    ?>

    <div id="variable-details" class="nav-detail">

        <?php

        // temperature

        ?>
<!---->
<!--        <div id="detail-tmax" class="nav-detail-item">-->
<!--            <h3>What does <u>Average Daily Maximum Temperature</u> tell us?</h3>-->
<!--            <p>A day’s highest (maximum) temperature usually occurs in the mid- to late afternoon. Averaging the highest temperature of each day over any period provides the mean maximum temperature for that period.</p>-->
<!--            <p>Daily maximum temperature serves as one measure of comfort and safety for people and for the health of plants and animals. When daily maximum temperature consistently exceeds particular thresholds, people can become ill, livestock and crops suffer, and transportation and energy infrastructure may be stressed.</p>-->
<!--            <p><a href="variables.php?id=tmax" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>-->
<!--        </div>-->
<!---->
<!---->
<!--        <div id="detail-tmin" class="nav-detail-item">-->
<!--            <h3>What does <u>Average Daily Minimum Temperature</u> tell us?</h3>-->
<!--            <p>A day’s lowest (minimum) temperature usually occurs in the early morning, just after sunrise. Averaging the lowest temperature of each day over any period provides the mean minimum temperature for that period.</p>-->
<!--            <p>Periods of low temperature give plants, animals, and people a chance to recover from daytime heat. When minimum temperatures remain high overnight, people without access to cooling systems can become ill. Increases in minimum temperature also result in earlier spring snowmelt and runoff, and disrupt the timing of plant growth and flowering.</p>-->
<!--            <p><a href="variables.php?id=tmin" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>-->
<!--        </div>-->
<!---->
<!---->
<!--        <div id="detail-pr-above" class="nav-detail-item">-->
<!--            <h3>What does <u>Days of Precipitation Above 1 Inch</u> tell us?</h3>-->
<!---->
<!--            <p>The number of days per year when locations receive more than 1 inch (2.5 cm) of precipitation is an indicator of how often heavy precipitation events occur. This measurement may also be used as an indicator of flood risk.</p>-->
<!--            <p>Comparing values at a single location over time can indicate a trend of increasing or decreasing flood risk. Comparing values from one location to another may not reflect relative risks for flooding, as factors that control runoff vary from site to site.</p>-->
<!---->
<!--            <p><a href="variables.php?id=pr" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>-->
<!--        </div>-->
<!---->
<!---->
<!--        <div id="detail-pr" class="nav-detail-item">-->
<!--            <h3>What does <u>Total precip</u> tell us?</h3>-->
<!---->
<!--            <p>Daily totals of rain and snow vary from zero to several inches; averaging these totals over a period gives an average daily value. Total precip indicates the average amount of water added to the environment each day.</p>-->
<!--            <p>Total precip is one indicator of how wet or dry a place may be at different times of the year. Comparing values for Total precip over time can indicate a trend toward wetter or drier conditions.</p>-->
<!---->
<!--            <p><a href="variables.php?id=pr" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>-->
<!--        </div>-->
<!---->
<!---->
<!---->
<!--        <div id="detail-cooling_degree_day_18" class="nav-detail-item">-->
<!--            <h3>What do <u>Cooling Degree Days</u> tell us?</h3>-->
<!---->
<!--            <p>The number of cooling degree days per year reflects the amount of energy people use to cool buildings during the warm season.</p>-->
<!--            <p>For example, many people like to keep indoor temperatures at 65°F. On a day when the average outdoor temperature is 85°F, reducing the indoor temperature by 20 degrees over 1 day requires 20 degrees of cooling multiplied by 1 day, or 20 cooling degree days. Utility companies use cooling degree days to estimate the annual amount of energy people will use to cool buildings.</p>-->
<!---->
<!--            <p><a href="variables.php?id=cdd_65f" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>-->
<!--        </div>-->
<!---->
<!---->
<!--        <div id="detail-days_tmin_blw_0" class="nav-detail-item">-->
<!---->
<!--            <h3>What does <u>Days With Minimum Temperature Below 32°F</u> tell us?</h3>-->
<!---->
<!--            <p>The total number of days per year with minimum temperature below 32°F (0°C) is an indicator of how often cold days occur.</p>-->
<!--            <p>Below-freezing temperatures can cause driving hazards, aircraft icing, and damage to infrastructure. However, ski resorts and other winter recreation businesses depend on days with below-freezing temperatures to maintain snowpack. Additionally, some plants require a period of days below freezing before they can begin budding or blooming.</p>-->
<!---->
<!--            <p><a href="variables.php?id=days_tmin_blw_0" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>-->
<!--        </div>-->
<!---->
<!--        <div id="#detail-days_tmax_abv_35" class="nav-detail-item">-->
<!---->
<!--            <h3>What does <u>Days With Maximum Temperature Above 95°F</u> tell us?</h3>-->
<!---->
<!--            <p>The total number of days per year with maximum temperature above 95°F (35°C) is an indicator of how often very hot conditions occur. Depending upon humidity, wind, access to air-conditioning, humans may feel very uncomfortable or experience heat stress or illness on very hot days.</p>-->
<!--            <p>Hot days also stress plants and animals as well as infrastructure. Increased demand for cooling can stress energy infrastructure.</p>-->
<!---->
<!--            <p><a href="variables.php?id=days_tmax_abv_35" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>-->
<!--        </div>-->


        <?php

        foreach ($temp_content as $item) {

            ?>



            <div id="detail-<?php echo $item['variable']; ?>" class="nav-detail-item">


                <h3>What does <u><?php echo $item['overlayname']; ?></u> tell us?</h3>

                <?php echo $item['detail']; ?>

                <p><a href="variables.php?id=<?php echo $item['variable']; ?>" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
            </div>

            <?php

        }

        ?>

        <?php

        // precipitation

        ?>

        <div id="detail-precipitation" class="nav-detail-item">
            <h3>What does <u>Precipitation</u> tell us?</h3>

            <p>We evaluate climate over long periods of observation. For example, in 2014, the global temperature was 1.24°F (0.69°C) above the long-term average for the 20th century, according to NOAA's National Climatic Data Center. That number made 2014 the warmest year on record in the NOAA database, which goes back to 1880.</p>
            <p>Data source: NOAA, 2015</p>

            <p><a href="variables.php?id=pr" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
        </div>

        <?php

        foreach ($precip_content as $item) {

            ?>

            <div id="detail-<?php echo $item['variable']; ?>" class="nav-detail-item">
                <h3>What does <u><?php echo $item['overlayname']; ?></u> tell us?</h3>

                <?php echo $item['detail']; ?>

                <p><?php echo $item['source']; ?></p>

                <p><a href="variables.php?id=<?php echo $item['variable']; ?>" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
            </div>

            <?php

        }

        ?>

        <?php

        // derived

        ?>

        <div id="detail-derived" class="nav-detail-item">
            <h3>What does <u>Derived</u> tell us?</h3>

            <p>Derived ...</p>

            <p>Data source: NOAA, 2015</p>

            <p><a href="variables.php?id=derived" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
        </div>

        <?php

        foreach ($derived_content as $item) {

            ?>

            <div id="detail-<?php echo $item['variable']; ?>" class="nav-detail-item">
                <h3>What does number of <u><?php echo $item['overlayname']; ?></u> tell us?</h3>

                <?php echo $item['detail']; ?>

                <p><?php echo $item['source']; ?></p>

                <p><a href="variables.php?id=<?php echo $item['variable']; ?>" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
            </div>

            <?php

        }

        ?>

    </div>

    <?php

    // stationS

    ?>

    <div id="stations-details" class="nav-detail">
        <?php

        foreach ($stations_content as $station) {

            ?>

            <div id="detail-<?php echo $station['variable']; ?>" class="nav-detail-item">
                <h3><?php echo $station['overlayname']; ?></u></h3>

                <p><?php echo $station['detail']; ?></p>

                <p><a href="stations.php?id=<?php echo $station['variable']; ?>" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
            </div>

            <?php

        }

        ?>
    </div>

</div>

<!-- END HEADER TEMPLATE -->
