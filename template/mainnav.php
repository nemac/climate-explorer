<?php

$temp_content = array(
  array(
    'variable' => 'tmax',
    'name' => 'Avg Daily Max Temp (°F)',
    'overlayname' => 'Average Daily Maximum Temperature (°F)',
    'detail' => "<p>A day’s highest (maximum) temperature usually occurs in the afternoon. Averaging the daily high temperatures over any period results in a mean maximum temperature for that period.</p><p>Maximum temperature serves as one measure of comfort and safety for people and for the health of plants and animals. When maximum temperature exceeds particular thresholds, people can become ill and transportation and energy infrastructure may be stressed.</p>",
    'source' => ''
  ),
  array(
    'variable' => 'tmin',
    'name' => 'Avg Daily Min Temp (°F)',
    'overlayname' => 'Average Daily Minimum Temperature (°F)',
    'detail' => "<p>A day’s lowest (minimum) temperature usually occurs in the early morning, just before sunrise. Averaging the daily low temperatures for any period results in a mean minimum temperature for that period.</p><p>Periods of low temperature give plants, animals, and people a chance to recover from daytime heat. When minimum temperatures aren’t sufficiently cool, plant and animal responses can trigger ecosystem changes and increased demand for energy can stress energy infrastructure.</p>",
    'source' => ''
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
    'source' => ''
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
    'source' => ''
  ),
  array(
    'variable' => 'days_tmin_lt_32f',
    'name' => 'Days w/ min < 32°F',
    'overlayname' => 'Days per year with Minimum Temperature below 32°F',
    'detail' => "<p>The total number of days per year when the temperature dips below 32°F (0°C) is an indicator of how often cold days occur.</p><p>A decrease in the number of days temperature drops below freezing promotes earlier spring snowmelt and runoff, with important consequences for managing water resources. Below-freezing temperatures can cause driving hazards, aircraft icing, and damage to infrastructure, yet ski resorts and other winter recreation businesses depend on sufficiently cold days to maintain snowpack. Some plants require a cumulative number of days below freezing before they can begin budding or blooming in the spring.</p>",
    'source' => ''
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
    'source' => ''
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
    'source' => ''
  ),
  array(
    'variable' => 'cdd_65f',
    'name' => 'Cooling Degree Days',
    'overlayname' => 'Cooling Degree Days',
    'detail' => "<p>The number of cooling degree days at any location reflects the amount of energy people use to cool a building when it is warm outside. Higher numbers of cooling degree days indicate higher demand for energy.</p><p>Cooling degree days measure how much (in degrees), and for how long (in days), outside air temperature is higher than 65°F. For example, on a day when the average outdoor temperature is 85°F, reducing the indoor temperature to 65°F would require 20 degrees of cooling multiplied by 1 day, or 20 cooling degree days. Engineers and utility companies use a location’s annual number of cooling degree days as one input when estimating demand for energy in the warm season.</p>",
    'source' => ''
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
  )
);

$stations_content = array(
  array(
    'variable' => 'daily_vs_climate',
    'name' => 'Daily vs. Climate',
    'overlayname' => 'What does <u>Daily vs. Climate</u> tell us?',
    'detail' => 'Graphs for individual observing stations let you compare daily temperatures and precipitation totals to long-term averages. The graphs show when and by how much daily conditions differ from Climate Normals, values that are calculated from observations over the previous three decades.'
  ),
  array(
    'variable' => 'thresholds',
    'name' => 'Thresholds',
    'overlayname' => 'What do <u>Thresholds</u> tell us?',
    'detail' => 'The phrases “too hot” and “too much rain” mean different things in different situations. This interface lets you select a station and set your own threshold value for temperature or precipitation: results show how often that value has been exceeded per year.</p><p>For example, it may be “too hot” for herds of cattle when temperatures exceed 95°F. A city could have “too much rain” if flooding occurs every time they receive 3 inches of rain over two days.</p><p>Knowing how often thresholds have been reached or exceeded in the past can give you an idea of how frequently the same thresholds may be crossed in the future.'
  ),
  array(
    'variable' => 'high_tide_flooding',
    'name' => ' Days with High-tide Flooding',
    'overlayname' => 'What do <u>Days with High-tide Flooding</u> tell us?',
    'detail' => 'Over time, increases in the number of days per year when local sea level rises above identified thresholds for flooding generally reflect increases in global sea level. However, changes in local sea level are always the result of global sea level rise paired with land subsidence or uplift: in some locations, the rate of land subsidence is up to three times larger than the global sea level rise signal.</p><p>At each of the tidal gauge stations on the map, emergency managers identified flooding heights related to local impacts such as inundation of low-lying roads or seawater pouring into stormwater systems. Oceanographers compiled these heights for many stations, and then performed statistical analyses on the dataset to establish a threshold flood height at each station. Threshold heights are expressed as distance above the long-term average of the daily highest water level, also known as mean higher high water (MHHW).'
  )); ?>

<nav id="nav-overlay" class="overlay">
  <a href="#" class="button close bg-white border-none blend-screen"></a>

  <div id="nav-controls" class="nav-controls cycle-pager external">
    <a href="/" id="nav-overlay-home" class="button"><span class="icon icon-arrow-up"></span><span class="text">Home</span></a>

    <ul id="nav-cycle-pager">
      <li><a href="#nav-search"><span class="icon icon-search"></span> Select a location</a></li>
      <li><a href="#nav-variables"><span class="icon icon-variables"></span> View by variable</a></li>
      <li><a href="#nav-stations"><span class="icon icon-bubble"></span> Weather & Tidal Stations</a></li>
    </ul>
  </div>

  <!-- NAV -->

  <div id="nav-cycle" class="cycle-slideshow"
       data-cycle-timeout="0"
       data-cycle-fx="scrollHorz"
       data-cycle-slides="> .slide"
       data-cycle-pager="#nav-cycle-pager"
       data-cycle-pager-template=""
       data-cycle-log="false">

    <!-- SEARCH -->

    <div id="nav-search" class="slide" data-slide-num="0">
      <div class="slide-bg"></div>

      <div class="nav-content-wrap">
        <h3 class="search-field"><span class="icon icon-search"></span>
          <input type="text" class="location-mapper" autocomplete="off" placeholder="Enter county, city, or zip code">
        </h3>
      </div>
    </div>

    <!-- VARIABLES -->

    <div id="nav-variables" class="slide" data-slide-num="1">
      <div class="slide-bg"></div>

      <div class="nav-content-wrap">
        <h3><span class="icon icon-variables"></span> Choose a variable</h3>

        <div class="nav-content tabs">
          <div id="nav-vars-projected" class="tab nav-content-tab">
            <ol class="col-3">
              <li>Temperature
                <ul>
                  <?php foreach ($temp_content as $item) { ?>
                    <li><a href="#detail-<?php echo $item['variable']; ?>" class="nav-detail-link"><?php echo htmlentities($item['name']); ?></a></li>
                  <?php } ?>
                </ul>
              </li>
              <li>Precipitation
                <ul>
                  <?php

                  foreach ($precip_content as $item) { ?>
                    <li><a href="#detail-<?php echo $item['variable']; ?>" class="nav-detail-link"><?php echo htmlentities($item['name']); ?></a></li>
                  <?php } ?>
                </ul>
              </li>
              <li>Other
                <ul>
                  <?php foreach ($derived_content as $item) { ?>
                    <li><a href="#detail-<?php echo $item['variable']; ?>" class="nav-detail-link"><?php echo htmlentities($item['name']); ?></a></li>
                  <?php } ?>
                </ul>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <!-- STATIONS -->

    <div id="nav-stations" class="slide" data-slide-num="2">
      <div class="slide-bg"></div>

      <div class="nav-content-wrap">
        <h3><span class="icon icon-bubble"></span> Choose analysis type</h3>

        <div class="nav-content tabs">
          <div id="nav-stations-list" class="tab nav-content-tab">
            <ul class="col-3">
              <?php foreach ($stations_content as $station) { ?>
                <li><a href="#detail-<?php echo $station['variable']; ?>" class="nav-detail-link"><?php echo htmlentities($station['name']); ?></a></li>
              <?php } ?>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</nav>

<!-- DETAIL OVERLAY -->

<div id="detail-overlay" class="overlay">
  <a href="#" class="button close bg-white border-none blend-screen"></a>

  <!-- VARIABLES -->

  <div id="variable-details" class="nav-detail">

    <!-- TEMPERATURE -->

    <?php foreach ($temp_content as $item) { ?>

      <div id="detail-<?php echo $item['variable']; ?>" class="nav-detail-item">


        <h3>What does <u><?php echo $item['overlayname']; ?></u> tell us?</h3>

        <?php echo $item['detail']; ?>

        <p><a href="/variables/?id=<?php echo $item['variable']; ?>" class="button bg-trans border-white hover-bg-white">Get started</a>
          <a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a>
        </p>
      </div>

    <?php } ?>

    <!-- PRECIPITATION -->

    <div id="detail-precipitation" class="nav-detail-item">
      <h3>What does <u>Precipitation</u> tell us?</h3>

      <p>We evaluate climate over long periods of observation. For example, in 2014, the global temperature was 1.24°F (0.69°C) above the long-term average
        for
        the 20th century, according to NOAA's National Climatic Data Center. That number made 2014 the warmest year on record in the NOAA database, which goes
        back to 1880.</p>
      <p>Data source: NOAA, 2015</p>

      <p><a href="/variables/?id=pr" class="button bg-trans border-white hover-bg-white">Get started</a>
        <a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a>
      </p>
    </div>

    <?php foreach ($precip_content as $item) { ?>

      <div id="detail-<?php echo $item['variable']; ?>" class="nav-detail-item">
        <h3>What does <u><?php echo $item['overlayname']; ?></u> tell us?</h3>

        <?php echo $item['detail']; ?>

        <p><?php echo $item['source']; ?></p>

        <p><a href="/variables/?id=<?php echo $item['variable']; ?>" class="button bg-trans border-white hover-bg-white">Get started</a>
          <a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a>
        </p>
      </div>

    <?php } ?>

    <!-- DERIVED -->

    <div id="detail-derived" class="nav-detail-item">
      <h3>What does <u>Derived</u> tell us?</h3>

      <p>Derived ...</p>

      <p>Data source: NOAA, 2015</p>

      <p><a href="/variables/?id=derived" class="button bg-trans border-white hover-bg-white">Get started</a>
        <a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a>
      </p>
    </div>

    <?php foreach ($derived_content as $item) { ?>

      <div id="detail-<?php echo $item['variable']; ?>" class="nav-detail-item">
        <h3>What does number of <u><?php echo $item['overlayname']; ?></u> tell us?</h3>
        <?php echo $item['detail']; ?>
        <p><?php echo $item['source']; ?></p>
        <p><a href="/variables/?id=<?php echo $item['variable']; ?>" class="button bg-trans border-white hover-bg-white">Get started</a>
          <a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a>
        </p>
      </div>
    <?php } ?>
  </div>

  <!-- STATIONS -->

  <div id="stations-details" class="nav-detail">
    <?php foreach ($stations_content as $station) { ?>
      <div id="detail-<?php echo $station['variable']; ?>" class="nav-detail-item">
        <h3><?php echo $station['overlayname']; ?></h3>
        <p><?php echo $station['detail']; ?></p>
        <p><a href="/stations/?id=<?php echo $station['variable']; ?>" class="button bg-trans border-white hover-bg-white">Get started</a>
          <a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a>
        </p>
      </div>
    <?php } ?>
  </div>
</div>
