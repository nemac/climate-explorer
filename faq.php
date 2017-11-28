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
                <h1>Frequently Asked Questions</h1>
            </div>
        </section>

        <section id="standard-body" class="page-text accordion">

          <h4>How can I submit questions or comments, or report a bug or broken link?  When can I expect a reply? </h4>
          <p>We’d love to hear from you.  Please send questions, comments, or suggestions about the Climate Explorer to <a href="mailto:noaa.toolkit@noaa.gov">noaa.toolkit@noaa.gov</a>. Expect a reply within one week.</p>

          <h4>Which web browser should I use to interact with the Climate Explorer?</h4>
          <p>The tool is designed to be widely accessible and compatible with most popular, current web browsers, including Safari, Chrome, Firefox, and Internet Explorer 10.  Currently, the Climate Explorer tool is best viewed on a desktop or laptop computer web browser (Windows, Mac OS X, or Linux).  The Climate Explorer is not yet optimized for viewing on mobile devices. </p>

          <h4>What is the recommended citation for the information in the Climate Explorer?</h4>
          <p>U.S. Federal Government, 2016: U.S. Climate Resilience Toolkit Climate Explorer. [Online] http://toolkit.climate.gov/climate-explorer/  Accessed {DATE}.</p>

          <h4>May I have permission to use images of the graphs, maps, and text in the Climate Explorer?  </h4>
          <p>Yes. The graphs, maps, and text available in the Climate Explorer are considered public information and may be reproduced and distributed freely.  If you use images and text from the tool, please cite the U.S. Climate Resilience Toolkit Climate Explorer as the source.</p>

          <h4>How may I contribute maps and data to the Climate Explorer, or assist in its development?</h4>
          <p>If you have maps or data that you would like to offer as candidates for inclusion in the Climate Explorer, let us know by emailing <a href="mailto:noaa.toolkit@noaa.gov">noaa.toolkit@noaa.gov</a>. Expect a reply within one week (often much sooner). </p>

          <p>If you would like to add to or evolve the tool’s functionality, please note that the code for both <a href="https://github.com/nemac/climate-explorer" target="_blank">Climate Explorer 1</a> and <a href="https://github.com/nemac/climate-widget-graph" target="_blank">Climate Explorer 2</a> are freely available on GitHub. NOTE: We’d be happy to hear of your efforts, but the Climate Explorer team does not offer technical support for people downloading or working with the code.</p>

          <h4>Where did the climate projection data in Climate Explorer come from?</h4>
          <p>All modeled data presented in the Climate Explorer’s graphs are based on statistical downscaling of Coupled Model Intercomparison Project Phase 5 (CMIP5) using Bias-Corrected Constructed Analogs (BCCA), provided by the U.S. Geological Survey. The bias-correction step for daily observations was developed and described by Maurer et al. (2010). Constructed analogs were produced using methods described by Hidalgo et al. (2008). A gridded observational dataset by Maurer et al (2002) was used as a reference for calculating differences from historical averages for the period 1960-1989. The <a href="http://catalog.data.gov/dataset/bias-corrected-constructed-analogs-v2-daily-climate-projections" target="_blank">BCCA data are freely accessible via Data.gov</a>. (You can Learn more about the BCCA climate and hydrology projections <a href="http://gdo-dcp.ucllnl.org/downscaled_cmip_projections/" target="_blank">here</a>.  Learn more about CMIP5 <a href="http://cmip-pcmdi.llnl.gov/cmip5/index.html" target="_blank">here</a>.) </p>

          <p>High-resolution (800 meter) image maps were generated using the NASA Earth Exchange Downscaled Climate Projections (NEX-DCP30) dataset. This dataset includes downscaled projections from 33 models, as well as ensemble statistics calculated for each IPCC Representative Concentration Pathway from all 33 models included in the NEX-DCP30 dataset. The purpose of this dataset is to provide a set of high-resolution, bias-corrected climate change projections that can be used to evaluate climate change impacts on processes that are sensitive to finer-scale climate gradients and the effects of local topography on climate conditions. (Learn more about NASA NEX-DCP30 data <a href="https://cds.nccs.nasa.gov/nex/" target="_blank">here</a>.) </p>

          <p>Observations shown as dark gray bars in Climate Explorer graphs are based on weather observations around the country that have been interpolated and stored as gridded data (Maurer et al. 2002). </p>

          <p>For more details about the tool and its data sources, please see the “<a href="about.php">About Climate Explorer</a>” section. </p>

          <h4>Why can I only get county-scale climate projections?  Where can I get climate projections at higher spatial and temporal resolution?</h4>
          <p>When deliberating on the appropriate scale at which to offer climate projections in Climate Explorer, we wanted to strike a good balance between providing information at a scale that is relevant to local adaptation decision making while recognizing important constraints, such as of the coarse spatial resolution of gridded historical observations as well as uncertainties inherent in projecting future climate conditions.  Our team of climate model experts agreed that averaging the BCCA data for every county in the contiguous United States resolution provided the best balance between these two considerations. (Learn more about our team of climate model experts <a href="credits.php" target="_blank">here</a>.)</p>

          <p>The Climate Explorer uses the Bias-Corrected Constructed Analogs (BCCA) downscaled climate and hydrology projections, which are available at 12-km spatial resolution and daily temporal resolution for the period from 1950 to 2099.  (Learn more about the BCCA dataset <a href="http://gdo-dcp.ucllnl.org/downscaled_cmip_projections/" target="_blank">here</a>.) </p>

          <p>[NOTE: Downscaled climate projection information is available at other spatial resolutions for some locations. For example, climate modelers have produced downscaled climate projections at city-scale resolution for particular cities; other modelers have produced downscaled climate projections for particular watersheds, national park lands, and other locations. Groups such as USDA’s Climate Hubs, NOAA’s Regional Integrated Sciences and Assessments (RISA) groups, and Landscape Conservation Cooperatives may have, or be able to point you toward, expertise in developing or interpreting downscaled climate projections at an appropriate spatial scale. You may be able to find climate model expertise near your location on our “<a href="http://toolkit.climate.gov/help/partners" target="_blank">Find Experts</a>” map.]</p>

          <h4>In the “Days of Precipitation Above 1 Inch” charts, why are historical observed values so different from historical modeled values for some counties and not for others?</h4>
          <p>For counties that have diverse land elevations and/or are situated near an ocean or large inland water body, statistically downscaled climate projections tend to underpredict the number of days with high precipitation values, and they tend to overpredict the number of days with drizzle.  Comparing observed values with historical model values can reveal counties where this bias is apparent.  Climate modelers are aware of the problem and are actively working to remove such biases from their models.  We plan to upgrade Climate Explorer with improved climate projection information as it becomes available.</p>

          <h4>What errors, uncertainties, and assumptions are inherent in the climate projection data available in the Climate Explorer?</h4>
          <p>The shaded bands represent the full range of all model outputs for the ensemble of 20 different models, for the historical period (gray band) and two future scenarios (red and blue bands). While there is substantial and increasing skill at predicting and projecting future climate conditions, no climate model will ever simulate the climate system perfectly.  There are noteworthy sources of uncertainty  in all climate projections, including those offered in the Climate Explorer.</p>

          <ol>
            <li>Because scientists do not have real-world measurements for every point on Earth’s surface or throughout all levels of the atmosphere and ocean, they must make some assumptions about conditions at locations between measurements. These assumptions are used to develop gridded observational data, and again to set initial conditions for climate models. This also introduces a level of uncertainty in the observed data used in downscaling approaches.</li>

            <li>Natural variability of the weather and climate system—ultimately due to chaos—introduces an inherent degree of unpredictability in climate projections. The goal of climate projections is to help people understand significant changes and trends in climate conditions over time. They are not intended to serve as forecasts of weather conditions in a specific year in the future.</li>

            <li>Beyond natural interannual variability, two elements of the modeling process introduce margins of uncertainty in climate projections:

              <ol>
                <li>Each global climate model uses a slightly different set of equations to represent Earth’s physical processes. Therefore, results from different models show a range of projections at each time step for each scenario. This is the reason Climate Explorer graphs show a band of projected values for each scenario rather than a single line.</li>

                <li>The Representative Concentration Pathways (RCPs) are not year-by-year forecasts of emissions. Rather, they reflect the sum of societal choices over the next several decades that result in specific levels of radiative forcing in the year 2100. Uncertainty in what the actual abundance of various heat-trapping gases (which determines radiative forcing) will be during each year of the 21st century also introduces uncertainty.</li>
              </ol>
            </li>

            <li>The statistical downscaling method assumes that the future climate will behave similarly to the historical climate in terms of atmospheric and oceanic circulation patterns, which may not be true at every location.</li>

            <li>Calculating a single average value for each county inevitably introduces error, in that the average cannot accurately represent every location in the county. The error for any location depends on differences in the environment such as elevation and proximity to lakes, a coast, or mountains.</li>

            <li>The Climate Explorer’s presentation of projections as a band of values gives output from each of the 20 models equal weight. Some studies are underway to assess which models perform best in particular places or for particular times, but climate modelers have not yet identified methods to identify which models perform the best at a national scale.</li>
          </ol>

          <h4>What are the scenarios represented by the gray, red, and blue bands in the charts?</h4>
          <p>The light gray band shows the range of model data (hindcast) for the historical period. Models were initialized with conditions present in 1950, and then run through 2005. To get a sense of the climate models’ predictive ability for a chosen variable in a particular county, compare the year-to-year variability of observations (dark gray bars) with the range of modeled projections.</p>

          <p>The red band shows the range of projections for a scenario in which global emissions of heat-trapping gases continue increasing. Sometimes called “business-as-usual,” the Climate Explorer’s Higher Emissions scenario is known as Representative Concentration Pathway or RCP 8.5. In this possible future, the increasing concentration of heat-trapping gases in the atmosphere follows a path that results in radiative forcing of at least 8.5 Watts per square meter over pre-industrial values by the year 2100. For planning purposes, people who have a low tolerance for risk often focus on this higher emissions scenario.</p>

          <p>The blue band shows the range of projections for a scenario in which global emissions of heat-trapping gases stop increasing and become stable. The Climate Explorer’s Lower Emissions scenario is known as RCP 4.5. This scenario represents a path in which the current rate of global emissions of heat-trapping gases peaks around 2040, and stabilizes; the atmosphere’s radiative is 4.5 Watts per square meter over pre-industrial values in 2100. </p>

          <h4>What are Representative Concentration Pathways (RCPs)?</h4>
          <p>Representative Concentration Pathways represent different storylines about how the abundance of heat-trapping gases in Earth’s atmosphere will change through the year 2100. The Intergovernmental Panel on Climate Change (IPCC) defined the four pathways (2.6, 4.5, 6, and 8.5) to serve as a consistent set of conditions for which global climate models would calculate projections. Though each of the RCPs defines a radiative forcing level for the year 2100, Earth’s average surface temperature will continue to increase beyond the end of this century under all scenarios.  </p>

          <h4>Which RCP should I use?  Which is most likely to occur?</h4>
          <p>According to the Intergovernmental Panel on Climate Change, the representative concentration pathways (RCP) scenarios should not be considered policy-prescriptive because they were developed to support scientific research on various possible climate change futures, without making any judgment as to their desirability or probability. </p>

          <p>These scenarios reflect choices individuals and society will make over coming decades, so there is uncertainty regarding the actual year-to-year change in greenhouse gases. RCPs are not considered to be forecasts, nor do they represent absolute bounds on the realm of possibility.  While they all represent plausible scenarios for the future, none of the RCPs are intended to serve as predictions, best guesses, most likely, or more plausible pathways than the others.</p>

          <p>That said, the projected global temperature values based on the RCPs can serve as a useful point of reference when considering possible futures with respect to human populations, ecosystems, natural resources, and valued assets within the built environment. Key questions to consider when planning for the future include:</p>

          <ol>
            <li>What’s my tolerance for risk?</li>
            <li>How much confidence do I have that humanity will take action to limit and/or reduce concentrations of heat-trapping gases in the atmosphere this century?</li>
          </ol>

          <p>Individuals and groups who have a low tolerance for risk and/or low confidence that humans will act to significantly reduce greenhouse gas emissions may choose to plan for impacts under RCP 8.5.  People with some tolerance for risk and/or some confidence that humans will take moderate action in the very near future to reduce emissions may choose to plan for RCP 4.5.  </p>

          <p>In 2015, at the United Nations Framework on Climate Change (UNFCCC) 21st Annual Conference of the Parties (COP21) in Paris, nations agreed to pursue efforts to limit global average temperature increase to 1.5°C above pre-industrial levels. Climate modelers suggest this is only possible if we strive to reach RCP 2.6, a pathway that calls for immediate action to achieve drastic reductions in greenhouse gas emissions. </p>

          <h4>Why do maps for precipitation projections show such large variations for % difference?</h4>
          <p>In areas where annual precipitation is relatively low, any change in annual amounts represents a fairly large percentage difference. For instance, if an area that currently receives 8 inches of rain per year is projected to receive 12 inches per year at some point in the future, the change is 50%. Conversely, if precipitation over a relatively wet area changes, the percentage change is smaller. For example, if an area that currently receives 50 inches of rain per year is projected to reach 55 inches per year in the future, the change is 10%.</p>

          <h4>How many models are represented by the range of projections?</h4>
          <p>Twenty global climate models were used to produce the range of projection values shown in the Climate Explorer graphs for RCP 8.5 and for the historical modeled values.  In alphabetical order, the models represented here are: ACCESS1-0, bcc-csm1-1, BNU-ESM, CanESM2, CCSM4, CESM1-BGC, CSIRO-Mk3-6-0, GFDL-CM3, GFDL-ESM2G, GFDL-ESM2M, inmcm4, IPSL-CM5A-LR, IPSL-CM5A-MR, MIROC-ESM, MIROC-ESM-CHEM, MIROC5, MPI-ESM-LR, MPI-ESM-MR, MRI-CGCM3, and NorESM1-M. Projections for RCP 4.5 used all of these models except GFDL-CM3.</p>

          <h4>What important considerations should users keep in mind when exploring projections in the Climate Explorer?</h4>
          <p>Climate projections can provide useful information when considering important decisions about the future, but should not be the sole basis for decision-making.  It’s important to understand the limitations of climate models when interpreting or using their results:</p>

          <ul>
            <li>Climate projections are not predictions. Projections are based on assumptions about future human emissions of greenhouse gases and other policy choices.</li>
            <li>Climate modelers attempt to incorporate our best scientific understanding of the climate system into their models, yet known weaknesses and some gaps in scientific understanding remain. Modelers also seek to represent their evolving understanding of newly discovered processes within their models. Despite these limitations, global climate models represent our best tool for exploring the future evolution of our planet’s climate. </li>
            <li>Climate projections do not attempt to predict the timing of specific meteorological events such as storms, droughts, or El Niños, either in hindcast mode or in projections. The location and timing of future extreme weather events cannot be deduced from climate model projections. Model results can, however, assess the changing climatology of meteorological events. For instance, projections can indicate changes in the frequencies of events such as days over 95ºF and under 32ºF .</li>
            <li>Projections vary from model to model; the current state of understanding is that the full range of projections represents an estimate for the range of plausible climate futures. Considering the full range of projections for one or more future scenarios may help you gain a more complete picture of the range of potential future risks.</li>
            <li>Increased resolution does not necessarily equate to greater fidelity (i.e. less uncertainty) or reliability.</li>
          </ul>

          <p>For decisions involving the use of climate model projections, you may want to consider seeking <a href="http://toolkit.climate.gov/help/partners" target="_blank">expertise</a>.</p>

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
