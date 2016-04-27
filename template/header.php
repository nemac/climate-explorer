<?php
  
  // new content here

  $temp_content = array(

    array(
      'variable' => 'tasmax',
      'name' => 'Mean Daily Max',
      'detail' => "<p>A day’s highest (maximum) temperature usually occurs in the afternoon. Averaging the daily high temperatures for any period results in a mean maximum temperature for that period. Maximum temperatures are one indicator of comfort and safety for outdoor workers and urban populations. Additionally, transportation and energy infrastructure may be stressed when maximum temperature exceeds particular thresholds.</p>",
      'source' => 'NOAA, 2016'
    ),

    array(
      'variable' => 'tasmin',
      'name' => 'Mean Daily Min',
      'detail' => "<p>A day’s lowest (minimum) temperature usually occurs in the early morning. Averaging the daily low temperatures for any period results in a mean minimum temperature for that period.</p><p>Periods of low temperature give plants, animals, and people a chance to recover from daytime heat and stress. When overnight lows aren’t sufficiently cool, tree-damaging insects such as bark beetles can thrive, potentially triggering major changes to ecosystems.</p>",
      'source' => 'NOAA, 2016'
    ),

    array(
      'variable' => 'days_tmax_abv_35',
      'name' => 'Days Over 95º F',
      'detail' => "<p>The total number of days per year that have their highest temperature above 95°F (35°C) is an indicator of how often very hot conditions occur. Depending upon humidity, wind, and access to air-conditioning, humans may feel very uncomfortable or experience heat stress on very hot days.</p><p>If several hot days occur in a row (a separate variable, not indicated here), and people and the environment don’t have a chance to cool down before another very hot day begins, heat stress accumulates, and can become a public health concern.</p>",
      'source' => 'NOAA, 2016'
    ),

    array(
      'variable' => 'days_tmin_blw_0',
      'name' => 'Days Under 32º F',
      'detail' => "<p>The total number of days per year that have their lowest temperature below 32°F (0°C) is an indicator of how often cold days occur; comparing values over time indicates any trend in the occurrence of cold weather. </p><p>Below-freezing temperatures can cause driving hazards, aircraft icing, and damage to infrastructure. However, ski resorts and other winter recreation businesses depend on days with below-freezing temperatures to maintain snowpack. Additionally, some plants require a period of days below freezing before they can begin budding or blooming.</p>",
      'source' => 'NOAA, 2016'
    )

  );

  $precip_content = array(

    array(
      'variable' => 'pr',
      'name' => 'Precipitation',
      'detail' => "<p>Daily precipitation is total precipitation that fell on a given day. Averaging the daily precipitation results in a mean daily precipitation for that period. Though daily totals of rain and snow vary from zero to several inches, it’s useful to consider the average amount of water added to the environment per day over a month, season, or year.</p><p>The value for mean daily precipitation is one indicator of how wet or dry a place may be at different times of the year. Comparing values for mean daily precipitation over time can indicate a trend toward wetter or drier conditions.</p>",
      'source' => 'NOAA, 2016'
    )

  );

  $derived_content = array(

    array(
      'variable' => 'heating_degree_day_18',
      'name' => 'Heating Degree Days',
      'detail' => "<p>The number of heating degree days at any location reflects the amount of energy people use to heat a building during the cool season.</p><p>For example, many people like to keep indoor temperatures around 65°F. On a day when the average outdoor temperature is 55°F, raising the indoor temperature by 10 degrees over 1 day requires 10 degrees of heating multiplied by 1 day, or 10 heating degree days. Examining heating degree days for different locations or over time can help people and utility companies estimate the amount of energy needed for heating.</p>",
      'source' => 'NOAA, 2016'
    ),

    array(
      'variable' => 'cooling_degree_day_18',
      'name' => 'Cooling Degree Days',
      'detail' => "<p>The number of cooling degree days at any location reflects the amount of energy people use to cool a building during the warm season.</p><p>For example, many people like to keep indoor temperatures around 65°F. On a day when the average outdoor temperature is 85°F, reducing the indoor temperature by 20 degrees over 1 day requires 20 degrees of cooling multiplied by 1 day, or 20 cooling degree days. Examining cooling degree days for different locations or over time can help people and utility companies estimate the amount of energy needed for cooling.</p>",
      'source' => 'NOAA, 2016'
    )

  );

  $impacts_content = array(

    array(
      'variable' => 'arctic',
      'name' => 'Arctic',
      'detail' => "<p>Dramatic reductions in Arctic sea ice threaten ecosystems and fisheries, disrupt traditional lifestyles, and erode coastlines. Increasing development activities may boost the region’s economy, but they also increase risks to ecosystems and the environment. Explore landcover, current drought, and historical observations in this rapidly changing region.</p>",
      'source' => 'NOAA, 2016'
    ),

    array(
      'variable' => 'coasts',
      'name' => 'Coasts',
      'detail' => "<p>As sea level rises, so do instances of flooding along the coast. Rising waters increasingly threaten buildings and infrastructure through storm surge, strong waves, heavy precipitation, and high-tide \"nuisance\" flooding. Property owners and municipalities can check their vulnerability to coastal flooding from current flood hazards as well as future sea level rise.</p>",
      'source' => 'NOAA, 2015'
    ),

    array(
      'variable' => 'ecosystems',
      'name' => 'Ecosystems',
      'detail' => "<p>Ecosystems that serve as natural sources of food, timber, and clean water are increasingly threatened by changing conditions. View landcover, wetlands, and rivers & streams to visualize the location and extent of land-based ecosystems. Compare these locations to climate stressors such as sea level rise and drought.</p>",
      'source' => 'NOAA, 2015'
    ),

    array(
      'variable' => 'energy',
      'name' => 'Energy',
      'detail' => "<p>As temperatures warm, demand for energy is expected to increase. Exposed energy infrastructure—particularly along our coasts—may lead to disruptions in energy supply. Managers of energy assets can check current flood hazards as well as visualizations of flooding from future sea level rise.</p>",
      'source' => 'NOAA, 2015'
    ),

    array(
      'variable' => 'food',
      'name' => 'Food',
      'detail' => "<p>Increasing heat waves, drought, and very heavy precipitation have the potential to reduce agricultural productivity in future decades. Changes in crop yields and livestock production can increase food prices and reduce food security.</p>",
      'source' => 'NOAA, 2015'
    ),

    array(
      'variable' => 'health',
      'name' => 'Health',
      'detail' => "<p>Increases in extreme weather events, poor air quality, and transmittable illnesses threaten human health. Explore areas where high percentages of residents are elderly and/or poor, and where other factors increase social vulnerability. People in these areas may require assistance during events such as heat waves, storms, or flooding.</p>",
      'source' => 'NOAA, 2015'
    ),

    array(
      'variable' => 'tribal_nations',
      'name' => 'Tribal Nations',
      'detail' => "<p>Climate change increasingly impacts land, foods, and lifestyles of American Indians. Survey the extent of Indian land and explore landcover and social vulnerability in these locations. Check the land's vulnerability to climate stressors such as sea level rise, flood hazards, and drought.</p>",
      'source' => 'NOAA, 2015'
    ),

    array(
      'variable' => 'water',
      'name' => 'Water',
      'detail' => "<p>Changing conditions are increasing threats of both flooding and drought. Flood zone maps can help you identify areas that are at risk of flooding and the current drought layer shows which regions are abnormally dry or experiencing drought. View the land cover layer to get a sense of what may be impacted by flooding or drought.</p>",
      'source' => 'NOAA, 2015'
    ),

    array(
      'variable' => 'transportation',
      'name' => 'Transportation',
      'detail' => "<p>Extreme events increasingly threaten land-, water-, and air-based transportation systems and supply chains. View the location of transportation assets such as highways, bridges, and airports, and check to see where they coincide with flooding hazards and the risk of inundation from sea level rise.</p>",
      'source' => 'NOAA, 2015'
    )

  );

?>
<!-- BEGIN HEADER TEMPLATE -->

<header id="main-header">
  <div id="main-nav">
    <a href="https://toolkit.climate.gov" id="header-logo" title="U.S. Climate Resilience Toolkit"><img src="./resources/img/us-climate-resilience-toolkit.png" alt="U.S. Climate Resilience Toolkit"></a>

    <a href="./" id="nav-home" class="nav-btn"><span class="icon icon-arrow-up"></span><span class="text">Home</span></a>

    <a href="#" id="nav-trigger" class="nav-btn launch-nav"><span class="hamburger"><span class="bar"></span></span><span class="text">Menu</span></a>

    <nav id="subnav">
      <ul>
        <li><a href="#"><span class="icon"></span><span class="text">Help</span></a></li>
        <li><a href="#"><span class="icon"></span><span class="text">About</span></a></li>
        <li><a href="#"><span class="icon"></span><span class="text">Definitions</span></a></li>
        <li><a href="#"><span class="icon"></span><span class="text">Credits</span></a></li>
      </ul>
    </nav>

    <div id="breadcrumb"></div>
  </div>
</header>

<nav id="nav-overlay" class="overlay">
  <a href="#" class="button close bg-white border-none blend-screen"></a>

  <div id="nav-controls" class="nav-controls cycle-pager external">
    <a href="./" id="nav-overlay-home" class="button"><span class="icon icon-arrow-up"></span><span class="text">Home</span></a>

    <ul id="nav-cycle-pager">
      <li><a href="#nav-search"><span class="icon icon-search"></span> Search by location</a></li>
      <li><a href="#nav-variables"><span class="icon icon-variables"></span> View by variable</a></li>
      <li><a href="#nav-impacts"><span class="icon icon-bubble"></span> View by topic</a></li>
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
        <h3><span class="icon icon-search"></span> Search locations</h3>

        <div class="nav-content tabs">
          <nav>
              <a href="#nav-search" class="nav-search-tab" data-tabs-group="nav-search"><span>Results</span></a>
          </nav>

          <div id="nav-search" class="tab nav-content-tab">
            <ul class="col-2">
              <li class="search-field"><span class="icon icon-search"></span><input type="text" class="location-mapper" placeholder="Search by location"></li>
            </ul>
          </div>
        </div>
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
              <li>Derived
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

      // IMPACTS

    ?>

    <div id="nav-impacts" class="slide" data-slide-num="2">
      <div class="slide-bg"></div>

      <div class="nav-controls">
        <a href="#" class="nav-left button border-white hover-bg-white arrow-left"><span class="icon icon-variables"></span> Variables</a>
        <a href="#" class="nav-right button border-white hover-bg-white arrow-right"><span class="icon icon-search"></span> Search</a>
      </div>

      <div class="nav-content-wrap">
        <h3><span class="icon icon-bubble"></span> Choose an impact</h3>

        <div class="nav-content tabs">
          <nav>
            <a href="#nav-impacts" class="nav-impacts-tab" data-tabs-group="nav-impacts"><span>By Impact</span></a>
          </nav>

          <div id="nav-impacts" class="tab nav-content-tab">
            <ul class="col-2">
              <?php

                foreach($impacts_content as $impact) {

              ?>
              <li><a href="#detail-<?php echo $impact['variable']; ?>" class="nav-detail-link"><?php echo $impact['name']; ?></a></li>
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

    <div id="detail-temperature" class="nav-detail-item">
      <h3>What does <u>Average Mean Temperature</u> mean?</h3>

      <p>We evaluate climate over long periods of observation. For example, in 2014, the global temperature was 1.24°F (0.69°C) above the long-term average for the 20th century, according to NOAA's National Climatic Data Center. That number made 2014 the warmest year on record in the NOAA database, which goes back to 1880.</p>
      <p>Annual average air temperatures have changed in different parts of the United States since the early 20th century (since 1901 for the contiguous 48 states and 1925 for Alaska). The data are shown for climate divisions, as defined by the National Oceanic and Atmospheric Administration.</p>
      <p>Data source: NOAA, 2015 3</p>

      <p><a href="variables.php" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
    </div>

    <?php

      foreach($temp_content as $item) {

    ?>

    <div id="detail-<?php echo $item['variable']; ?>" class="nav-detail-item">
      <h3>What does <u><?php echo $item['name']; ?></u> mean?</h3>

      <?php echo $item['detail']; ?>

      <p>Data source: <?php echo $item['source']; ?></p>

      <p><a href="variables.php?id=<?php echo $item['variable']; ?>" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
    </div>

    <?php

      }

    ?>

    <?php

      // precipitation

    ?>

    <div id="detail-precipitation" class="nav-detail-item">
      <h3>What does <u>Precipitation</u> mean?</h3>

      <p>We evaluate climate over long periods of observation. For example, in 2014, the global temperature was 1.24°F (0.69°C) above the long-term average for the 20th century, according to NOAA's National Climatic Data Center. That number made 2014 the warmest year on record in the NOAA database, which goes back to 1880.</p>
      <p>Data source: NOAA, 2015 3</p>

      <p><a href="variables.php?id=pr" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
    </div>

    <?php

      foreach($precip_content as $item) {

    ?>

    <div id="detail-<?php echo $item['variable']; ?>" class="nav-detail-item">
      <h3>What does <u><?php echo $item['name']; ?></u> mean?</h3>

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
      <h3>What does <u>Derived</u> mean?</h3>

      <p>Derived ...</p>

      <p>Data source: NOAA, 2015 3</p>

      <p><a href="variables.php?id=derived" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
    </div>

    <?php

      foreach($derived_content as $item) {

    ?>

    <div id="detail-<?php echo $item['variable']; ?>" class="nav-detail-item">
      <h3>What does <u><?php echo $item['name']; ?></u> mean?</h3>

      <?php echo $item['detail']; ?>

      <p>Data source: <?php echo $item['source']; ?></p>

      <p><a href="variables.php?id=<?php echo $item['variable']; ?>" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
    </div>

    <?php

      }

    ?>

  </div>

  <?php

    // IMPACTS

  ?>

  <div id="impacts-details" class="nav-detail">
    <?php

      foreach($impacts_content as $impact) {

    ?>

    <div id="detail-<?php echo $impact['variable']; ?>" class="nav-detail-item">
      <h3>What does <u><?php echo $impact['name']; ?></u> mean?</h3>

      <?php echo $impact['detail']; ?>

      <p>Data source: <?php echo $impact['source']; ?></p>

      <p><a href="case.php?id=<?php echo $impact['variable']; ?>" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
    </div>

    <?php

      }

    ?>
  </div>

</div>

<!-- END HEADER TEMPLATE -->