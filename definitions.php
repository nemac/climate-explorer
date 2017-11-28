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

    <link rel="stylesheet" href="resources/css/ol3-popup.css">

    <link rel="stylesheet" href="resources/css/sweetalert.css">

    <link rel="stylesheet" media="screen" href="resources/css/screen.css">
    <link rel="stylesheet" media="screen" href="resources/css/mods.css">

    <script type="text/javascript" src="./resources/js/jquery.min.js"></script>
    <script type="text/javascript" src="./resources/js/jquery-ui.min.js"></script>

    <?php

      $share_data['url'] = current_URL();
      $share_data['title'] = 'Definitions';

      echo opengraph_output($share_data);

    ?>

</head>

<body id="page-definitions" class="page-type-text">
<div class="cd-cover-layer"></div>
<?php include_once('template/header.php'); ?>

<div id="viewport">
    <div id="main-content-wrap">

        <?php include_once('template/share.php'); ?>

        <section id="standard-splash" class="page-splash">
            <div class="splash-text">
                <h1>Definitions & FAQ</h1>
            </div>
        </section>

        <section id="standard-body" class="page-text">

          <dl>
            <dt>Actual</dt>
            <dd>Variable expressed in common units such as degrees Celsius or Fahrenheit, or inches or centimeters of precipitation. Compare with Anomaly.</dd>

            <dt>Anomaly	</dt>
            <dd>Variable  expressed as the difference from the average observed during a base period. In the case of Climate Explorer data, the base period is 1960 to 1989. Compare with Actual.</dd>

            <dt>BCCA (Bias-Correction Constructed Analog)	</dt>
            <dd>BCCA is a method used to downscale global climate projections to higher spatial resolution for <strong>daily</strong> data. This statistical downscaling method was used to generate <strong>graph</strong>-based visualizations shown in the Climate Explorer.</dd>

            <dt>BCSD (Bias-Correction Spatial Disaggregation)	</dt>
            <dd>BCSD is a method used to downscale global climate projections to higher spatial resolution at a <strong>monthly</strong> time scale. This statistical downscaling method was used to generate some of the <strong>map</strong>-based visualizations shown in the Climate Explorer.</dd>

            <dt>Cooling Degree Days</dt>
            <dd>A measure reflecting the amount of energy it takes to cool buildings when daily average temperature exceeds 65°F, the designated standard for indoor air temperature. Calculated by subtracting 65°F from the mean daily temperature and adding those values over the period of interest. The higher the value for this variable, the larger the amount of energy required for cooling inside buildings.</dd>

            <dt>Days of Precipitation Over 1 inch	</dt>
            <dd>Total number of days per year when a location receives more than 1 inch (2.5 cm) of precipitation.</dd>

            <dt>Days Over 95º F	</dt>
            <dd>Total number of days per year when a location has maximum temperatures over 95°F (35°C).</dd>

            <dt>Days Under 32º F	</dt>
            <dd>Total number of days per year when a location has  minimum temperatures below 32°F (0°C).</dd>

            <dt>Downscaled Climate Projections	</dt>
            <dd>Climate model projections at local to regional scale derived from larger-scale models or analysis. Downscaled data shown in the Climate Explorer are based on statistical relationships between large-scale atmospheric variables and local/regional variables. The quality of the downscaled product depends on the quality of the original global climate simulation and the accuracy of the gridded historical observations for each location. </dd>

            <dt>Emissions	</dt>
            <dd>Exhaust from burning coal, oil, and/or natural gas and other process that release heat-trapping gases into the atmosphere.</dd>

            <dt>Greenhouse gases	</dt>
            <dd>See Heat-trapping gases.</dd>

            <dt>Heat-trapping gases	</dt>
            <dd>Gases such as carbon dioxide, methane, and water vapor that absorb and emit heat energy. Burning fuels such as coal, oil, and natural gas for energy is a major source of heat-trapping gases. Also called greenhouse gases.</dd>

            <dt>Heating Degree Days	</dt>
            <dd>A measure reflecting the amount of energy it takes to heat buildings when daily average temperature is below 65°F, the designated standard for indoor air temperature. Calculated by subtracting the mean daily temperature from 65°F and adding those values over the period of interest. The lower the value for this variable, the smaller the amount of energy required for heating inside buildings.</dd>

            <dt>Hindcast	</dt>
            <dd>Use of a model to produce a simulation over a historical period. Models are initialized with known or estimated conditions from the past and then run in “forecast” mode over the historic period. Modelers then check to see how well the output matches the observations of the actual conditions over the historic period. For the ensemble of climate models used in the  Climate Explorer, the historic period for the simulations spans 1950 to 2005.</dd>

            <dt>Historical (Modeled)</dt>
            <dd>Model output simulated for the historical period (similar to projections, but calculated for the past). These values give users a way to compare the models’ abilities to match observed data. See also Hindcast.</dd>

            <dt>Higher Emissions scenario	</dt>
            <dd>A possible future in which global emissions of heat-trapping gases continue to increase. In this scenario, the atmosphere’s ability to trap heat, a measure called radiative forcing, reaches 8.5 Watts per square meter in the year 2100. This scenario is known as RCP 8.5, where RCP stands for Representative Concentration Pathway. <a href="http://link.springer.com/article/10.1007%2Fs10584-011-0148-z" target="_blank">Learn more about scenarios</a></dd>

            <dt>Lower Emissions scenario	</dt>
            <dd>A possible future in which global emissions of heat-trapping gases peak around the year 2040 and then decrease. The atmosphere’s ability to trap heat, a measure called radiative forcing, stabilizes at 4.5 Watts per meter squared in the year 2100. This scenario is known as Representative Concentration Pathway (RCP) 4.5. <a href="http://link.springer.com/article/10.1007%2Fs10584-011-0148-z" target="_blank">Learn more about scenarios</a></dd>

            <dt>Mean Daily Maximum Temperature	</dt>
            <dd>Mean (average) of a location’s daily maximum temperatures observed during a specified period.</dd>

            <dt>Mean Daily Minimum Temperature	</dt>
            <dd>Mean (average) of a location’s daily minimum temperatures observed during a specified period.</dd>

            <dt>Mean Daily Precipitation	</dt>
            <dd>Total precipitation that fell over a given period divided by the number of days in the period. For % Change in precipitation, maps show precipitation compared with average precipitation to the period 1960-1989 from average monthly precipitation. Data is currently shown for January, April, July, and October; remaining months will be added soon. </dd>

            <dt>NEX-DCP30	</dt>
            <dd>NASA Earth Exchange Downscaled Climate Projections at a spatial resolution of 30 arc seconds. <a href="https://cds.nccs.nasa.gov/nex/" target="_blank">Learn more</a></dd>

            <dt>Scenario Medians	</dt>
            <dd>Scenario medians highlight the median (middle) value of all projections at each time step. Though the median is no more or less likely to predict actual values in the future than any of the other models, the line can help define any trend over time.</dd>

            <dt>Observations	</dt>
            <dd>Readings from instruments at weather / climate recording stations. In county graphs, observations from individual stations are averaged across areas and over varying periods.</dd>

            <dt>Projections	</dt>
            <dd>Values for future climate variables derived from global climate models.</dd>

            <dt>Radiative forcing	</dt>
            <dd>A measure describing the atmosphere’s ability to trap heat. Radiative forcing is directly related to the abundance of heat-trapping gases (also known as greenhouse gases) in the atmosphere: the higher the value for radiative forcing, the higher the amount of heat energy the atmosphere will trap. </dd>

            <dt>Range of projections	</dt>
            <dd>Climate Explorer graphs show the full range of projections modeled for each scenario as bands of values highlighted in gray, red, and blue. The top edge of each band represents the maximum value of all projections at each time step; the bottom edge represents the minimum value projected by all models. Projections for lower emissions of heat-trapping (greenhouse) gases represent results from 19 global climate models. Higher emissions and Historical (modeled) projections represent results from 20 global climate models.  </dd>

            <dt>Scenarios	</dt>
            <dd>Descriptions of plausible futures in which the atmosphere contains varying amounts of heat-trapping gases. Climate scientists use a defined set of scenarios as consistent inputs for calculating future climate projections. The scenarios, known as Representative Concentration Pathways, or RCPs, specify the amount of radiative forcing in 2100 relative to 1750. See also Higher- and Lower Emissions scenario.</dd>

            <dt>Simulations	</dt>
            <dd>Values for historical climate variables derived from global climate models.</dd>
          </dl>

        </section>
    </div>
</div>


<?php include_once('template/footer.php'); ?>

<script src="./resources/js/cwg/climate-widget-graph.js"></script>
<script src="./resources/js/cwg/cwg.js"></script>




</body>
</html>
