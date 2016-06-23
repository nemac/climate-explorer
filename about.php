<?php
  $lockdown = 1;
  include_once('functions.php');



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
      $share_data['title'] = 'About Climate Explorer';

      echo opengraph_output($share_data);

    ?>

</head>

<body id="page-about" class="page-type-text">
<div class="cd-cover-layer"></div>
<?php include_once('template/header.php'); ?>

<div id="viewport">
    <div id="main-content-wrap">

        <?php include_once('template/share.php'); ?>

        <section id="standard-splash" class="page-splash">
            <div class="splash-text">
                <h1>About Climate Explorer</h1>
            </div>
        </section>

        <section id="standard-body" class="page-text">
          <p>Individuals, businesses, and communities of all sizes can use the Climate Explorer to understand how climate conditions in their location may change over the next several decades. This information—derived from global climate models—can help them make decisions and build resilience to extreme events.</p>

          <p>Built to accompany the U.S. Climate Resilience Toolkit, the Climate Explorer offers customizable graphs and maps of observed and projected temperature, precipitation, and related climate variables for every county in the contiguous United States. </p>

          <p>Based on global climate models developed for the United Nations Intergovernmental Panel on Climate Change, Climate Explorer’s graphs and maps show projected conditions for two possible futures: one in which humans make a moderate attempt to reduce global emissions of heat-trapping gases, and one in which we go on conducting business as usual. Decision makers can compare climate projections based on these two scenarios and plan according to their tolerance for risk and the timeframe of their decisions. </p>

          <p>The tool also displays climate observations for temperature, precipitation, and related variables for 1950 to the early 2000s. These are averages calculated from quality-checked ground-based weather stations across the country. Users can compare graphs of observed conditions to climate model simulations for the same period: in this case, climate models were initialized to reflect conditions in 1950, and then run through 2005. Comparing the range of observations against the simulations for this period can provide insights on the models’ collective ability to capture the range of observed variability for each climate variable. In some cases, the simulations and observations show a good match. In other cases, these comparisons may reveal consistent biases or limitations of the models.</p>

          <p>For some of the topics addressed in the U.S. Climate Resilience Toolkit, including Coastal, Energy, Ecosystems, and others, users can also view maps of assets—people, places, and infrastructure of value—and compare them with climate threats such as sea level rise and rising temperatures. Map layer comparisons available under the View by Topic menu let users explore where people and assets may be vulnerable to various climate hazards. This section of the Climate Explorer depends on external map services; as such, some map layers may occasionally be unavailable. Current map pairings represent early work that we hope to refine and expand in future releases of the tool.</p>

          <hr>

          <h2>About the tool</h2>

          <p>The Climate Explorer is a web application offering interactive maps and graphs to assist users in decision-making and resilience-building contexts. Built to support the <a href="https://toolkit.climate.gov/" target="_blank">U.S. Climate Resilience Toolkit</a>, the Climate Explorer helps people explore the exposure of human populations and valued assets to climate hazards that may put those assets at risk.  </p>

          <p>The Climate Explorer was programmed in <a href="http://openlayers.org/" target="_blank">OpenLayers 3</a> by <a href="http://habitatseven.com" target="_blank">HabitatSeven</a>, based on the original Climate Explorer and <a href="http://multigraph.org/" target="_blank">MultiGraph</a> tools, which were developed by <a href="https://nemac.unca.edu/" target="_blank">NEMAC</a> at UNC-Asheville.  Please direct comments to <a href="mailto:noaa.toolkit@noaa.gov">noaa.toolkit@noaa.gov</a>.</p>

          <hr>

          <h2>About the data</h2>

          <h3>Observations</h3>

          <p>Graphs of historical data in the Climate Explorer show averages of observations recorded at individual climate / weather stations across the country. Station data have been interpolated and stored as a gridded observational dataset prepared by Maurer et al. (2002); this dataset was used to calculate observed differences from averages for the period 1960-1989. Data are available from the <a href="https://nccwsc.usgs.gov/" target="_blank">USGS National Climate Change and Wildlife Climate Science Center</a>’s <a href="http://cida.usgs.gov/gdp/" target="_blank">Geo Data Portal</a>.</p>

          <p>Map layers that show mean maximum and minimum temperature and precipitation data from 1950-2010 are based on Parameter-elevation Regressions on Independent Slopes Model (PRISM) methods (Daly et al. 2008). Data are available from <a href="http://prism.oregonstate.edu/" target="_blank">the PRISM website</a>. Maps for all other indices are based on Maurer et al. (2002). </p>

          <h3>Modeled and Projected Data</h3>

          <p>Graphs in Climate Explorer show projections generated by global climate models for the Coupled Model Intercomparison Project Phase 5 (CMIP5): projection data were statistically downscaled using the Bias-corrected Constructed Analogs method (BCCA). The bias correction step for daily observations was developed and described by Maurer et al. (2010). Constructed analogs follow Hidalgo et al. (2008). </p>

          <p>For the maps available in the Climate Explorer, we utilized monthly data from PRISM for the historical period from 1950-2010, and high resolution climate projections from the NASA Earth Exchange Downscaled Climate Projections at 30 arc-seconds (NEX-DCP30). These datasets are both produced at a monthly timestep and at a spatial resolution of 30 arc-seconds (800m or ~0.5 miles per pixel). Both datasets capture topographic effects on temperature and precipitation, complementing the Climate Explorer graphs with spatially rich information on future climate conditions. The NEX-DCP30 dataset was produced using the Bias-Correction Spatial Disaggregation (BCSD) statistical downscaling approach described by Thrasher et al. (2013). The NEX-DCP30 dataset is available for download from the <a href="https://cds.nccs.nasa.gov/nex/" target="_blank">NASA Center for Climate Simulation</a>.</p>

          <p>To produce the Climate Explorer maps for Mean Daily Maximum Temperature and Mean Daily Minimum Temperature, we calculated decadal averages for each month of the year using PRISM observed data for the period 1950-2009, and the NASA NEX-DCP30 statistically downscaled climate projections dataset (Thrasher et al., 2013) for the period 2010-2099. For the historical period, we averaged the monthly values across the decades 1950-1959, 1960-1969, …, 2000-2009 using the PRISM dataset (Daly et al. (2008). For future decades, 2010-2019, 2020-2029, …, 2090-2099, we averaged monthly values for each decade from NASA NEX-DCP30 ensemble median values calculated from all 33 models included in the NEX-DCP30 dataset. Two scenarios were analyzed: RCP4.5 and RCP8.5. The Climate Explorer currently shows a representative month for each season.</p>

          <p>For Percent Change in Precipitation relative to 1960-1989, we calculated averages for the period 1960-1989 from PRISM average monthly precipitation data. For every decade from 1950 to 2009, a 10-year average was calculated for each month from PRISM monthly values. That decadal average was divided by the PRISM 30-year climatology from 1960-1989 and multiplied by 100 to calculate the percent of normal precipitation for each decade. For future decades, we calculated decadal averages for each month using the ensemble median of the 33 models included in the NASA NEX-DCP30 dataset  for each decade from 2010-2099. For each month and each decade, we calculated the percent of normal relative to the 30-year average for each month from 1960-1989 calculated from the PRISM data. The Climate Explorer currently shows a representative month for each season.</p>

          <p>For Days over 95º F, Days under 32º F, Heating Degree Days, and Cooling Degree Days, all data are presented as average annual values across a decade with the starting year indicated in the time slider. For the historical period, we show values based on gridded observations (Mauer et al. 2002). For potential future climate conditions, we present statistical summaries from the <a href="https://nccwsc.usgs.gov/" target="_blank">USGS National Climate Change and Wildlife Climate Science Center</a>’s <a href="http://cida.usgs.gov/gdp/" target="_blank">Geo Data Portal</a> derived from the BCCA statistically downscaled data (Hidalgo et al. 2008; Maurer et al. 2010) under RCP 4.5 and RCP 8.5. These variables require a daily timestep and thus cannot be calculated from the monthly PRISM and NEX-DCP30 datasets.</p>

          <h3>Weather Stations</h3>

          <p>Temperature and precipitation observations and Climate Normals displayed in graphs for individual weather stations are from the <a href="http://www.ncdc.noaa.gov/oa/climate/ghcn-daily/index.php" target="_blank">Global Historical Climatology Network-Daily (GHCN-D)</a> database. </p>

          <hr>

          <h2>References</h2>

          <ol>
            <li>Daly, C., Halbleib, M., Smith, J.I., Gibson, W.P., Doggett, M.K., Taylor, G.H., Curtis, J., and Pasteris, P.A. 2008. <a href="http://prism.oregonstate.edu/documents/pubs/2008intjclim_physiographicMapping_daly.pdf" target="_blank">Physiographically-sensitive mapping</a> of temperature and precipitation across the conterminous United States. International Journal of Climatology, 28: 2031-2064.</li>

            <li>Hidalgo HG, Dettinger MD, Cayan DR, 2008, California Energy Commission technical report CEC-500-2007-123</li>

            <li>Maurer EP, Hidalgo HG, Das T, Dettinger MD, Cayan DR, 2010, Hydrol Earth Syst Sci 14:1125-1138.</li>

            <li>Maurer EP, Wood AW, Adam JC, Lettenmaier DP, Nijssen B, 2002, J Climate 15(22):3237-3251,
provided via <a href="http://www.engr.scu.edu/~emaurer/gridded_obs/index_gridded_obs.html" target="_blank">http://www.engr.scu.edu/~emaurer/gridded_obs/index_gridded_obs.html</a></li>

<li>Thrasher, B., Xiong, J., Wang, W., Melton, F., Michaelis, A. and Nemani, R., 2013. Downscaled climate projections suitable for resource management. Eos, Transactions American Geophysical Union, 94(37), pp.321-323.</li>
          </ol>

          <hr>

          <h2>Contact</h2>

          <p>If you have questions or comments on the Climate Explorer, please direct them to <a href="mailto:noaa.toolkit@noaa.gov">noaa.toolkit@noaa.gov</a>.</p>

        </section>


    </div>
</div>

<?php include_once('template/footer.php'); ?>

<script src="./resources/js/cwg/climate-widget-graph.js"></script>
<script src="./resources/js/cwg/cwg.js"></script>

</body>
</html>
