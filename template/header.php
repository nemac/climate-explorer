<?php

//DEFINING vars that were using _REQUEST
$case = isset($_GET['id']) ? $purifier->purify($_GET['id']) : '';
$city = isset($_GET['city']) ? $purifier->purify($_GET['city']) : '';
$param = isset($_GET['param']) ? $purifier->purify($_GET['param']) : '';
$current = isset($current) ? $purifier->purify($current) : '';

$temp_content = array(

    array(
        'variable' => 'tasmax',
        'name' => 'Average Daily Max Temp (°F)',
        'overlayname' => 'Average Daily Maximum Temperature',
        'detail' => "<p>A day’s highest (maximum) temperature usually occurs in the afternoon. Averaging the daily high temperatures over any period results in a mean maximum temperature for that period.</p><p>Maximum temperature serves as one measure of comfort and safety for people and for the health of plants and animals. When maximum temperature exceeds particular thresholds, people can become ill and transportation and energy infrastructure may be stressed.</p>",
        'source' => 'NOAA, 2016'
    ),

    array(
        'variable' => 'tasmin',
        'name' => 'Average Daily Min Temp',
        'overlayname' => 'Average Daily Minimum Temperature',
        'detail' => "<p>A day’s lowest (minimum) temperature usually occurs in the early morning, just before sunrise. Averaging the daily low temperatures for any period results in a mean minimum temperature for that period.</p><p>Periods of low temperature give plants, animals, and people a chance to recover from daytime heat. When minimum temperatures aren’t sufficiently cool, plant and animal responses can trigger ecosystem changes and increased demand for energy can stress energy infrastructure.</p>",
        'source' => 'NOAA, 2016'
    ),

    array(
        'variable' => 'days_tmax_gt_90f',
        'name' => 'Days per year with max above 90°F',
        'overlayname' => 'Days per year with Maximum Temperature Above 90, 95, 100, or 105°F',
        'detail' => "<p>The total number of days per year with maximum temperature above various thresholds is an indicator of how often very hot conditions occur. Depending upon humidity, wind, and physical workload, people who work outdoors or don’t have access to air conditioning may feel very uncomfortable or experience heat stress or illness on very hot days.</p><p>Hot days also stress plants, animals, and human infrastructure such as roads, railroads, and electric lines. Increased demand for electricity to cool homes and buildings can place additional stress on energy.</p>",
        'source' => 'Source Pending'
    ),
    array(
        'variable' => 'days_tmax_gt_95f',
        'name' => 'Days per year with max above 95°F',
        'overlayname' => 'Days per year with Maximum Temperature Above 90, 95, 100, or 105°F',
        'detail' => "<p>The total number of days per year with maximum temperature above various thresholds is an indicator of how often very hot conditions occur. Depending upon humidity, wind, and physical workload, people who work outdoors or don’t have access to air conditioning may feel very uncomfortable or experience heat stress or illness on very hot days.</p><p>Hot days also stress plants, animals, and human infrastructure such as roads, railroads, and electric lines. Increased demand for electricity to cool homes and buildings can place additional stress on energy infrastructure.</p>",
        'source' => 'NOAA, 2016'
    ),

    array(
        'variable' => 'days_tmax_gt_100f',
        'name' => 'Days per year with max above 100°F',
        'overlayname' => 'Days per year with Maximum Temperature Above 90, 95, 100, or 105°F',
        'detail' => "<p>The total number of days per year with maximum temperature above various thresholds is an indicator of how often very hot conditions occur. Depending upon humidity, wind, and physical workload, people who work outdoors or don’t have access to air conditioning may feel very uncomfortable or experience heat stress or illness on very hot days.</p><p>Hot days also stress plants, animals, and human infrastructure such as roads, railroads, and electric lines. Increased demand for electricity to cool homes and buildings can place additional stress on energy infrastructure.</p>",
        'source' => 'Source Pending'
    ),
    array(
        'variable' => 'days_tmax_gt_105f',
        'name' => 'Days per year with max above 105°F',
        'overlayname' => 'Days per year with Maximum Temperature Above 90, 95, 100, or 105°F',
        'detail' => "<p>The total number of days per year with maximum temperature above various thresholds is an indicator of how often very hot conditions occur. Depending upon humidity, wind, and physical workload, people who work outdoors or don’t have access to air conditioning may feel very uncomfortable or experience heat stress or illness on very hot days.</p><p>Hot days also stress plants, animals, and human infrastructure such as roads, railroads, and electric lines. Increased demand for electricity to cool homes and buildings can place additional stress on energy infrastructure.</p>",
        'source' => 'Source Pending'
    ),
    array(
        'variable' => 'days_tmax_lt_32f',
        'name' => 'Days per year with max below 32°F (icing days)',
        'overlayname' => 'Days per year with Maximum Temperature below 32°F',
        'detail' => "<p>The total number of days per year when the highest temperature is less than 32°F (0°C) is an indicator of how often very cold days occur.</p><p>Days when the highest temperature doesn’t rise above the freezing point of water are called “icing days.” The annual number of icing days tells us how much rest plants get from growing; with too few icing days, some plants do not perceive a “reset” signal to begin budding or blooming in the spring. The annual number of icing days can also help predict if populations of insects, such as tree-killing bark beetles, will survive the winter or not.</p>",
        'source' => 'NOAA, 2016'
    ),
    array(
        'variable' => 'days_tmin_lt_32f',
        'name' => 'Days per year with min below 32°F (frost days)',
        'overlayname' => 'Days per year with Minimum Temperature below 32°F',
        'detail' => "<p>The total number of days per year when the temperature dips below 32°F (0°C) is an indicator of how often cold days occur.</p><p>A decrease in the number of days temperature drops below freezing promotes earlier spring snowmelt and runoff, with important consequences for managing water resources. Below-freezing temperatures can cause driving hazards, aircraft icing, and damage to infrastructure, yet ski resorts and other winter recreation businesses depend on sufficiently cold days to maintain snowpack. Some plants require a cumulative number of days below freezing before they can begin budding or blooming in the spring.</p>",
        'source' => 'NOAA, 2016'
    ),
    array(
        'variable' => 'days_tmin_gt_80f',
        'name' => 'Days per year with min above 80°F',
        'overlayname' => 'Days With Minimum Temperature above 80 or 90°F',
        'detail' => "<p>The total number of days per year when the lowest temperature doesn’t drop below a given threshold is an indicator of how often very warm nights occur.</p><p>When the lowest temperature of a 24-hour period doesn’t dip below 80 or 90°F, plants, animals, and people don’t have a chance to cool down. They can become stressed and susceptible to other negative health impacts. As the number of very warm nights increases, sensitive plants may not produce flowers or viable seeds.</p>",
        'source' => 'Source Pending'
    ),
    array(
        'variable' => 'days_tmin_gt_90f',
        'name' => 'Days per year with min above 90°F',
        'overlayname' => 'Days With Minimum Temperature above 80 or 90°F',
        'detail' => "<p>The total number of days per year when the lowest temperature doesn’t drop below a given threshold is an indicator of how often very warm nights occur.</p><p>When the lowest temperature of a 24-hour period doesn’t dip below 80 or 90°F, plants, animals, and people don’t have a chance to cool down. They can become stressed and susceptible to other negative health impacts. As the number of very warm nights increases, sensitive plants may not produce flowers or viable seeds.</p>",
        'source' => 'Source Pending'
    )

);

$precip_content = array(

    array(
        'variable' => 'pcpn',
        'name' => 'Total precipitation',
        'overlayname' => 'Total Precipitation',
        'detail' => "<p>Total precipitation over a year, season, or month indicates the average amount of water added to the environment over the indicated period.</p><p>Total precipitation is one indicator of how wet or dry a place may be at different times of the year. Comparing projected values for total precipitation over decades can indicate if climate models detect an overall trend toward wetter or drier conditions.</p>",
        'source' => 'NOAA, 2016'
    ),
    array(
        'variable' => 'days_pcpn_gt_1in',
        'name' => 'Days per year with more than 1 inch precip',
        'overlayname' => 'Days with Precipitation Above 1, 2, or 3 inches',
        'detail' => "<p>The number of days per year when locations receive more than 1, 2, or 3 inches of precipitation is an indicator of how often very heavy precipitation events occur. This measurement may also be used as an indicator of flood risk.</p><p>Comparing the number of days with heavy precipitation at a single location over time can reveal a trend of increasing or decreasing flood risk.</p>",
        'source' => 'NOAA, 2016'
    ),
    array(
        'variable' => 'days_pcpn_gt_2in',
        'name' => 'Days per year with more than 2 inches precip',
        'overlayname' => 'Days with Precipitation Above 1, 2, or 3 inchesv',
        'detail' => "<p>The number of days per year when locations receive more than 1, 2, or 3 inches of precipitation is an indicator of how often very heavy precipitation events occur. This measurement may also be used as an indicator of flood risk.</p><p>Comparing the number of days with heavy precipitation at a single location over time can reveal a trend of increasing or decreasing flood risk.</p>",
        'source' => 'Source Pending'
    ),
    array(
        'variable' => 'days_pcpn_gt_3in',
        'name' => 'Days per year with more than 3 inches precip',
        'overlayname' => 'Days with Precipitation Above 1, 2, or 3 inches',
        'detail' => "<p>The number of days per year when locations receive more than 1, 2, or 3 inches of precipitation is an indicator of how often very heavy precipitation events occur. This measurement may also be used as an indicator of flood risk.</p><p>Comparing the number of days with heavy precipitation at a single location over time can reveal a trend of increasing or decreasing flood risk.</p>",
        'source' => 'Source Pending'
    ),
    array(
        'variable' => 'days_pcpn_lt_0.01in',
        'name' => 'Dry Days (days/period)',
        'overlayname' => 'Dry Days',
        'detail' => "<p>The number of dry days per year (days when precipitation is less than 0.01 inches) gives a sense of the portion of the year when no moisture is being added to the environment.</p><p>Long-term average precipitation totals show that most locations experience one or more relatively dry months or seasons through the year. Any increase in the number of days with no precipitation may indicate a tendency toward drier conditions in one or more seasons. </p>",
        'source' => 'Source Pending'
    )

);

$derived_content = array(

    array(
        'variable' => 'hdd_65f',
        'name' => 'Heating Degree Days (°F-days)',
        'overlayname' => 'Heating Degree Days',
        'detail' => "<p>The number of heating degree days at any location reflects the amount of energy people use to heat a building when it is cool outside. Lower numbers of heating degree days indicate lower demand for energy.</p><p>Heating degree days measure how much (in degrees), and for how long (in days), outside air temperature is below 65°F.</p><p>For example, on a day when the average outdoor temperature is 35°F, raising the indoor temperature to 65°F would require 30 degrees of heating multiplied by 1 day, or 30 heating degree days. Engineers and utility companies use a location’s annual number of heating degree days as one input when estimating demand for energy in the cold season.</p>",
        'source' => 'NOAA, 2016'
    ),

    array(
        'variable' => 'cdd_65f',
        'name' => 'Cooling Degree Days (°F-days)',
        'overlayname' => 'Cooling Degree Days',
        'detail' => "<p>The number of cooling degree days at any location reflects the amount of energy people use to cool a building when it is warm outside. Higher numbers of cooling degree days indicate higher demand for energy.</p><p>Cooling degree days measure how much (in degrees), and for how long (in days), outside air temperature is higher than 65°F.</p><p>For example, on a day when the average outdoor temperature is 85°F, reducing the indoor temperature to 65°F would require 20 degrees of cooling multiplied by 1 day, or 20 cooling degree days. Engineers and utility companies use a location’s annual number of cooling degree days as one input when estimating demand for energy in the warm season.</p>",
        'source' => 'NOAA, 2016'
    ),

    array(
        'variable' => 'gdd',
        'name' => 'Growing Degree Days (°F-days)',
        'overlayname' => 'Growing Degree Days',
        'detail' => "<p>The number of growing degree days per year is used to estimate the growth and development of plants (or insects) during the growing season. Higher numbers of growing-degree days indicate longer and warmer growing conditions.</p><p>As growth occurs only when temperature exceeds a species’ base temperature (for example, 50°F), the number of days times the number of degrees above the base indicates the duration and magnitude of growing conditions.</p>",
        'source' => 'Source Pending'
    ),
    array(
        'variable' => 'gddmod',
        'name' => 'Modified Growing Degree Days (°F-days)',
        'overlayname' => 'Modified Growing Degree Days',
        'detail' => "<p>Corn growers use the number of modified growing degree days to monitor the development of corn crops.</p><p>As corn development occurs only when temperature is above 50°F but below 86°F, the standard calculation for growing-degree days is modified to omit conditions outside this range. In future decades, regions where temperatures regularly exceed 86°F may be less successful in growing corn.</p>",
        'source' => 'Source Pending'
    )

);

$topics_content = array(

    // array(
    //   'variable' => 'arctic',
    //   'name' => 'Arctic',
    //   'detail' => "<p>Dramatic reductions in Arctic sea ice threaten ecosystems and fisheries, disrupt traditional lifestyles, and erode coastlines. Increasing development activities may boost the region’s economy, but they also increase risks to ecosystems and the environment. Explore landcover, current drought, and historical observations in this rapidly changing region.</p>",
    //   'source' => 'NOAA, 2016'
    // ),

    array(
        'variable' => 'coastal',
        'name' => 'Coastal',
        'overlayname' => 'Coastal',
        'detail' => "<p>As sea level rises, so do instances of flooding along the coast. Rising waters increasingly threaten buildings and infrastructure through storm surge, strong waves, heavy precipitation, and high-tide \"nuisance\" flooding. Property owners and municipalities can check their vulnerability to coastal flooding from current flood hazards as well as future sea level rise.</p>",
        'source' => 'NOAA, 2015'
    ),

    array(
        'variable' => 'ecosystems',
        'name' => 'Ecosystems',
        'overlayname' => 'Ecosystems',
        'detail' => "<p>Ecosystems that serve as natural sources of food, timber, and clean water are increasingly threatened by changing conditions. View landcover, wetlands, and rivers & streams to visualize the location and extent of land-based ecosystems. Compare these locations to climate stressors such as sea level rise and drought.</p>",
        'source' => 'NOAA, 2015'
    ),

    // array(
    //   'variable' => 'energy',
    //   'name' => 'Energy',
    //   'detail' => "<p>As temperatures warm, demand for energy is expected to increase. Exposed energy infrastructure—particularly along our coasts—may lead to disruptions in energy supply. Managers of energy assets can check current flood hazards as well as visualizations of flooding from future sea level rise.</p>",
    //   'source' => 'NOAA, 2015'
    // ),

    // array(
    //   'variable' => 'food',
    //   'name' => 'Food',
    //   'detail' => "<p>Increasing heat waves, drought, and very heavy precipitation have the potential to reduce agricultural productivity in future decades. Changes in crop yields and livestock production can increase food prices and reduce food security.</p>",
    //   'source' => 'NOAA, 2015'
    // ),

    // array(
    //     'variable' => 'health',
    //     'name' => 'Health',
    //     'detail' => "<p>Increases in extreme weather events, poor air quality, and transmittable illnesses threaten human health. Explore areas where high percentages of residents are elderly and/or poor, and where other factors increase social vulnerability. People in these areas may require assistance during events such as heat waves, storms, or flooding.</p>",
    //     'source' => 'NOAA, 2015'
    // ),

    array(
        'variable' => 'tribal_nations',
        'name' => 'Tribal Nations',
        'overlayname' => 'Tribal Nations',
        'detail' => "<p>Climate change increasingly impacts land, foods, and lifestyles of American Indians. Survey the extent of Indian land and explore landcover and social vulnerability in these locations. Check the land's vulnerability to climate stressors such as sea level rise, flood hazards, and drought.</p>",
        'source' => 'NOAA, 2015'
    ),

    array(
        'variable' => 'water',
        'name' => 'Water',
        'overlayname' => 'Water',
        'detail' => "<p>Changing conditions are increasing threats of both flooding and drought. Flood zone maps can help you identify areas that are at risk of flooding and the current drought layer shows which regions are abnormally dry or experiencing drought. View the land cover layer to get a sense of what may be impacted by flooding or drought.</p>",
        'source' => 'NOAA, 2015'
    ),

    array(
        'variable' => 'transportation',
        'name' => 'Transportation',
        'overlayname' => 'Transportation',
        'detail' => "<p>Extreme events increasingly threaten land-, water-, and air-based transportation systems and supply chains. View the location of transportation assets such as highways, bridges, and airports, and check to see where they coincide with flooding hazards and the risk of inundation from sea level rise.</p>",
        'source' => 'NOAA, 2015'
    ),

    // array(
    //   'variable' => 'marine',
    //   'name' => 'Marine',
    //   'detail' => "<p>.</p>",
    //   'source' => 'NOAA, 2015'
    // )

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

        } elseif (strpos(current_URL(), 'topic.php') !== false) {

            $current = $param;
            $current = str_replace("_", " ", $current);
            $current = ucwords($current);

            $breadcrumb = '<a href="#nav-topics" class="parent launch-nav" data-nav-slide="2"><span class="icon icon-bubble"></span>Topic</a><span class="current">' . $current . '</span>';

        } elseif (strpos(current_URL(), 'case.php') !== false) {

            $current = $case;
            $current = str_replace("_", " ", $current);
            $current = ucwords($current);

            $breadcrumb = '<a href="#nav-topics" class="parent launch-nav" data-nav-slide="2"><span class="icon icon-bubble"></span>Topic</a><a href="./topic.php?param=' . $case . '">' . $current . '</a><span class="current">Impact</span>';

        } elseif (strpos(current_URL(), 'variables.php') !== false) {

            echo $current;

            switch ($case) {
                case 'tasmax' :
                    $current = 'Mean Daily Maximum Temperature';
                    break;
                case 'tasmin' :
                    $current = 'Mean Daily Minimum Temperature';
                    break;
                case 'days_tmax_abv_35' :
                    $current = 'Days With Maximum Above 95°F';
                    break;
                case 'days_tmin_blw_0' :
                    $current = 'Days With Minimum Below 32°F';
                    break;
                case 'days_tmax_abv_35.0' :
                    $current = 'Days With Maximum Above 95°F';
                    break;
                case 'days_tmin_blw_0.0' :
                    $current = 'Days With Minimum Below 32°F';
                    break;
                case 'pr' :
                    $current = 'Total precipitation';
                    break;
                case 'days_prcp_abv_25' :
                    $current = 'Days of Precipitation Above 1 Inch';
                    break;
                case 'days_prcp_abv_25.3' :
                    $current = 'Days of Precipitation Above 1 Inch';
                    break;
                case 'heating_degree_day_18' :
                    $current = 'Heating Degree Days';
                    break;
                case 'cooling_degree_day_18' :
                    $current = 'Cooling Degree Days';
                    break;
                case 'heating_degree_day_18.3' :
                    $current = 'Heating Degree Days';
                    break;
                case 'cooling_degree_day_18.3' :
                    $current = 'Cooling Degree Days';
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
            <li><a href="#nav-topics"><span class="icon icon-bubble"></span> View by topic</a></li>
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
                                        if ($item['name'] == 'Mean Daily Maximum Temperature') {
                                            $item['name'] = "Mean Daily Max Temperature";
                                        }
                                        if ($item['name'] == 'Mean Daily Minimum Temperature') {
                                            $item['name'] = "Mean Daily Min Temperature";
                                        }
                                        if ($item['name'] == 'Days With Maximum Above 95°F') {
                                            $item['name'] = "Days With Max Above 95°F";
                                        }
                                        if ($item['name'] == 'Days With Minimum Below 32°F') {
                                            $item['name'] = "Days With Min Below 32°F";
                                        }
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

        // TOPICS

        ?>

        <div id="nav-topics" class="slide" data-slide-num="2">
            <div class="slide-bg"></div>

            <div class="nav-content-wrap">
                <h3><span class="icon icon-bubble"></span> Choose a topic</h3>

                <div class="nav-content tabs">
                    <div id="nav-topics-list" class="tab nav-content-tab">
                        <ul class="col-2">
                            <?php

                            foreach ($topics_content as $topic) {

                                ?>
                                <li><a href="topic.php?param=<?php echo $topic['variable']; ?>"><?php echo $topic['name']; ?></a></li>
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

        <div id="detail-tmax" class="nav-detail-item">
            <h3>What does <u>Average Daily Maximum Temperature</u> tell us?</h3>

            <p>A day’s highest (maximum) temperature usually occurs in the mid- to late afternoon. Averaging the highest temperature of each day over any period provides the mean maximum temperature for that period.</p>
            <p>Daily maximum temperature serves as one measure of comfort and safety for people and for the health of plants and animals. When daily maximum temperature consistently exceeds particular thresholds, people can become ill, livestock and crops suffer, and transportation and energy infrastructure may be stressed.</p>

            <p><a href="variables.php?id=tmax" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
        </div>


        <div id="detail-tmin" class="nav-detail-item">
            <h3>What does <u>Average Daily Minimum Temperature</u> tell us?</h3>

            <p>A day’s lowest (minimum) temperature usually occurs in the early morning, just after sunrise. Averaging the lowest temperature of each day over any period provides the mean minimum temperature for that period.</p>
                Periods of low temperature give plants, animals, and people a chance to recover from daytime heat. When minimum temperatures remain high overnight, people without access to cooling systems can become ill. Increases in minimum temperature also result in earlier spring snowmelt and runoff, and disrupt the timing of plant growth and flowering.</p>

            <p><a href="variables.php?id=tasmin" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
        </div>


        <div id="detail-pr-above" class="nav-detail-item">
            <h3>What does <u>Days of Precipitation Above 1 Inch</u> tell us?</h3>

            <p>The number of days per year when locations receive more than 1 inch (2.5 cm) of precipitation is an indicator of how often heavy precipitation events occur. This measurement may also be used as an indicator of flood risk.</p>
            <p>Comparing values at a single location over time can indicate a trend of increasing or decreasing flood risk. Comparing values from one location to another may not reflect relative risks for flooding, as factors that control runoff vary from site to site.</p>

            <p><a href="variables.php?id=pr" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
        </div>


        <div id="detail-pr" class="nav-detail-item">
            <h3>What does <u>Total precipitation</u> tell us?</h3>

            <p>Daily totals of rain and snow vary from zero to several inches; averaging these totals over a period gives an average daily value. Total precipitation indicates the average amount of water added to the environment each day.</p>
            <p>Total precipitation is one indicator of how wet or dry a place may be at different times of the year. Comparing values for Total precipitation over time can indicate a trend toward wetter or drier conditions.</p>

            <p><a href="variables.php?id=pr" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
        </div>


        <div id="detail-heating_degree_day_18" class="nav-detail-item">
            <h3>What do <u>Heating Degree Days</u> tell us?</h3>

            <p>The number of heating degree days per year reflects the amount of energy people use to heat buildings during the cool season.</p>
            <p>For example, many people like to keep indoor temperatures at 65°F. On a day when the average outdoor temperature is 55°F, raising the indoor temperature by 10 degrees over 1 day requires 10 degrees of heating multiplied by 1 day, or 10 heating degree days. Utility companies use heating degree days to estimate the annual amount of energy people will use to heat buildings.</p>

            <p><a href="variables.php?id=heating_degree_day_18.3" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
        </div>

        <div id="detail-cooling_degree_day_18" class="nav-detail-item">
            <h3>What do <u>Cooling Degree Days</u> tell us?</h3>

            <p>The number of cooling degree days per year reflects the amount of energy people use to cool buildings during the warm season.</p>
            <p>For example, many people like to keep indoor temperatures at 65°F. On a day when the average outdoor temperature is 85°F, reducing the indoor temperature by 20 degrees over 1 day requires 20 degrees of cooling multiplied by 1 day, or 20 cooling degree days. Utility companies use cooling degree days to estimate the annual amount of energy people will use to cool buildings.</p>

            <p><a href="variables.php?id=cooling_degree_day_18.3" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
        </div>


        <div id="detail-days_tmin_blw_0" class="nav-detail-item">

            <h3>What does <u>Days With Minimum Temperature Below 32°F</u> tell us?</h3>

            <p>The total number of days per year with minimum temperature below 32°F (0°C) is an indicator of how often cold days occur.</p>
            <p>Below-freezing temperatures can cause driving hazards, aircraft icing, and damage to infrastructure. However, ski resorts and other winter recreation businesses depend on days with below-freezing temperatures to maintain snowpack. Additionally, some plants require a period of days below freezing before they can begin budding or blooming.</p>

            <p><a href="variables.php?id=days_tmin_blw_0" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
        </div>

        <div id="#detail-days_tmax_abv_35" class="nav-detail-item">

            <h3>What does <u>Days With Maximum Temperature Above 95°F</u> tell us?</h3>

            <p>The total number of days per year with maximum temperature above 95°F (35°C) is an indicator of how often very hot conditions occur. Depending upon humidity, wind, access to air-conditioning, humans may feel very uncomfortable or experience heat stress or illness on very hot days.</p>
            <p>Hot days also stress plants and animals as well as infrastructure. Increased demand for cooling can stress energy infrastructure.</p>

            <p><a href="variables.php?id=days_tmax_abv_35" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
        </div>


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
            <p>Data source: NOAA, 2015 3</p>

            <p><a href="variables.php?id=pr" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
        </div>

        <?php

        foreach ($precip_content as $item) {

            ?>

            <div id="detail-<?php echo $item['variable']; ?>" class="nav-detail-item">
                <h3>What does <u><?php echo $item['name']; ?></u> tell us?</h3>

                <?php echo $item['detail']; ?>

                <p>Data source: <?php echo $item['source']; ?></p>

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

            <p>Data source: NOAA, 2015 3</p>

            <p><a href="variables.php?id=derived" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
        </div>

        <?php

        foreach ($derived_content as $item) {

            ?>

            <div id="detail-<?php echo $item['variable']; ?>" class="nav-detail-item">
                <h3>What does <u><?php echo $item['name']; ?></u> tell us?</h3>

                <?php echo $item['detail']; ?>

                <p>Data source: <?php echo $item['source']; ?></p>

                <p><a href="variables.php?id=<?php echo $item['variable']; ?>" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
            </div>

            <?php

        }

        ?>

    </div>

    <?php

    // TOPICS

    ?>

    <div id="topics-details" class="nav-detail">
        <?php

        foreach ($topics_content as $topic) {

            ?>

            <div id="detail-<?php echo $topic['variable']; ?>" class="nav-detail-item">
                <h3>What does <u><?php echo $topic['name']; ?></u> tell us?</h3>

                <?php echo $topic['detail']; ?>

                <p>Data source: <?php echo $topic['source']; ?></p>

                <p><a href="case.php?id=<?php echo $topic['variable']; ?>" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
            </div>

            <?php

        }

        ?>
    </div>

</div>

<!-- END HEADER TEMPLATE -->
