<?php include_once('functions.php'); ?>
<!doctype html>
<html>
<head>
    <title>Climate Explorer</title>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="/resources/css/ol3-popup.css">

    <link rel="stylesheet" href="/resources/css/sweetalert.css">

    <link rel="stylesheet" media="screen" href="/resources/css/screen.css">
    <link rel="stylesheet" media="screen" href="/resources/css/mods.css">

    <script type="text/javascript" src="/resources/js/jquery.min.js"></script>
    <script type="text/javascript" src="/resources/js/jquery-ui.min.js"></script>

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
                <h1>Definitions</h1>
            </div>
        </section>

        <section id="standard-body" class="page-text">

            <dl>

                <dt>Actual</dt>
                <dd>Variable expressed in common units such as degrees Fahrenheit or Celsius, or inches or centimeters of precipitation. Compare with Anomaly.</dd>
                <dt>Anomaly</dt>
                <dd>Variable expressed as the difference from the average observed over a base period. In the case of Climate Explorer data, the base period is 1961 to 1990. Compare with Actual.</dd>
                <dt>Averages</dt>
                <dd>Lines within the red and blue bands highlight the weighted mean of all projections at each time step. Projections are weighted according to model independance and skill (see Sanderson and Wehner, 2017). Though the weighted average is no more or less likely to predict actual values in the future than any specific model, the line can help define any trend over time.</dd>
                <dt>Cooling Degree Days (CDD)</dt>
                <dd>A measure that reflects the amount of energy it takes to cool the indoor environment when daily average temperature exceeds 65°F. Values are calculated by subtracting 65°F from the mean daily temperature, and summing those daily values over the period of interest. The higher a location's number of cooling degree days, the higher the demand for energy for cooling.</dd>
                <dt>Days with Precipitation > 1, 2, 3 inches</dt>
                <dd>Total number of days per year when a location receives daily precipitation greater than 1, 2, or 3 inches.</dd>
                <dt>Days with Maximum Temperature > 90, 95, 100, 105°F</dt>
                <dd>Total number of days per year when the highest temperature of the day is greater than 90, 95, 100, or 105°F.</dd>
                <dt>Days with Minimum Temperature < 32°F</dt>
                <dd>Total number of days per year when the lowest temperature of the day dips below freezing (32°F). Referred to as frost days.</dd>
                <dt>Days with Minimum Temperature > 80, 90°F</dt>
                <dd>Total number of days per year when the lowest temperature of the day does not drop below 80 or 90°F.</dd>
                <dt>Days with Maximum Temperature < 32°F</dt>
                <dd>Total days per year when the highest temperature of the day does not rise above freezing (32°F). Known as icing days.</dd>
                <dt>Downscaled Climate ProjectionsM</dt>
                <dd>Climate model projections at local to regional scale derived from larger-scale models or analyses. The downscaling technique used for projections shown in Climate Explorer use historical climate observations to add fine-scale detail to global-scale projections.</dd>
                <dt>Dry days</dt>
                <dd>The number days per year when precipitation is less than 0.01 inch.</dd>
                <dt>Emissions</dt>
                <dd>Exhaust from burning coal, oil, and/or natural gas and other process that release heat-trapping gases into the atmosphere.</dd>
                <dt>Ensemble</dt>
                <dd>The range of results from a group of climate models all running the same experiment.</dd>
                <dt>Greenhouse gases</dt>
                <dd>See Heat-trapping gases.</dd>
                <dt>Growing Degree Days</dt>
                <dd>A measure related to the length of time conditions are right for plants and animals to grow or develop. As development can only occur when temperature exceeds a species’ base temperature (50°F for our calculations), values are calculated by subtracting 50°F from the mean daily temperature, and summing the positive results over the period of interest.</dd>
                <dt>Heat-trapping gases</dt>
                <dd>Gases such as carbon dioxide, methane, and water vapor that absorb and emit heat energy. Burning fuels such as coal, oil, and natural gas for energy is a major source of heat-trapping gases. Also called greenhouse gases.</dd>
                <dt>Heating Degree Days</dt>
                <dd>A measure that reflects the amount of energy it takes to heat the indoor environment when daily average temperature is below 65°F. Values are calculated by subtracting the mean daily temperature from 65°F and summing those daily values over the period of interest. The lower a location's number of heating degree days, the lower the demand for energy for heating.</dd>
                <dt>Hindcast</dt>
                <dd>Climate model simulations for a historical period. To produce a hindcast, models are initialized with known or estimated conditions at a starting point in the past, and then run in “forecast” mode up to the present. Modelers use hindcasts to check how well model output matches conditions that actually occurred.</dd>
                <dt>Historical (Modeled)</dt>
                <dd>The range of climate model results simulated for 1950 to 2015. To produce these results, climate models were initialized with known conditions in 1950, and then run in “forecast” mode up to 2015. Comparing observations to the range of modeled values gives users a way to check models' predictive abilities. See also Hindcast.</dd>
                <dt>Higher Emissions</dt>
                <dd>A possible future in which global emissions of heat-trapping gases continue to increase through 2100. In this scenario, the atmosphere’s ability to trap heat—a measure called radiative forcing—reaches 8.5 Watts per square meter in the year 2100. This pathway is known as RCP 8.5, where RCP stands for Representative Concentration Pathway.</dd>
                <dt>Localized Constructed Analogs (LOCA)</dt>
                <dd>A downscaling technique that uses historical climate observations to add fine-scale detail to projections from global climate models.</dd>
                <dt>Lower Emissions</dt>
                <dd>A possible future in which global emissions of heat-trapping gases peak around the year 2040 and then decrease. In this scenario, the atmosphere’s ability to trap heat—a measure called radiative forcing—stabilizes at 4.5 Watts per meter squared in the year 2100. This pathway is known as Representative Concentration Pathway (RCP) 4.5.</dd>
                <dt>Mean Daily Maximum Temperature</dt>
                <dd>Average of the highest temperature reached each day, calculated over the period of interest (month, season, year).</dd>
                <dt>Mean Daily Minimum Temperature</dt>
                <dd>Average of the lowest temperature reached each day, calculated over the period of interest (month, season, year).</dd>
                <dt>Modified Growing Degree Days</dt>
                <dd>A measure reflecting when conditions are right for corn to develop (between 50 and 86°F). Values are calculated using the standard calculation for growing degree days, but maximum or minumum temperatures less than 50°F are set to 50°F and maximum or minimum temperatures > 86°F are set to 86°F.</dd>
                <dt>Total Precipitation</dt>
                <dd>The sum total of precipitation over a month, season, or year.</dd>
                <dt>Observations</dt>
                <dd>Daily readings from instruments at weather / climate recording stations, averaged across areas and over varying periods. Climate Explorer graphs and maps show values from an observational dataset published by Livneh and others in 2013 and updated in 2015.</dd>
                <dt>Projections</dt>
                <dd>Results from global climate models characterizing future climate conditions.</dd>
                <dt>Radiative forcing</dt>
                <dd>A measure describing the atmosphere’s ability to trap heat. Radiative forcing is directly related to the abundance of heat-trapping gases (also known as greenhouse gases) in the atmosphere: the higher the value for radiative forcing, the higher the amount of heat energy the atmosphere will trap.</dd>
                <dt>Range of projections</dt>
                <dd>Light-colored bands in Climate Explorer graphs enclose the full set of values projected for each timestep by the 32 climate models. The top edge of each band represents the maximum value among projections at each time step; the bottom edge represents the minimum value projected among all models. All remaining projected values lie between the top and bottom edges of each band.</dd>
                <dt>Representative Concentration Pathways (RCPs)</dt>
                <dd>A set of four hypothetical futures described by the amount of radiative forcing in the atmosphere. The four potential pathways (RCP 2.6, RCP 4.5, RCP 6.0, and RCP 8.5) indicate an increase in the atmosphere's heat-trapping capacity, in watts per square meter, in 2100 relative to 1750. Each pathway is defined to serve as a consistent input for making climate projections. The LOCA dataset only produced results for RCP 4.5 and RCP 8.5. Climate Explorer uses the name "Lower Emissions" to stand for RCP 4.5 and the name "Higher Emissions" to stand for RCP 8.5.</dd>
                <dt>Scenarios</dt>
                <dd>Descriptions of plausible futures in which technological capabilities and societal choices result in varying amounts of heat-trapping gases in the atmosphere.</dd>
                <dt>Simulations</dt>
                <dd>Discrete attempts using climate models to replicate physical processes of the Earth system. Simulations of the future are called projections, simulations of the past are called hindcasts.</dd>

            </dl>

        </section>
    </div>
</div>

<?php include_once('template/footer.php'); ?>

</body>
</html>
