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
                <h1>Frequently Asked Questions</h1>
            </div>
        </section>

        <section id="standard-body" class="page-text accordion-plain">

            <h2>Using the Climate Explorer tool</h2>

            <h4>Which web browser should I use to interact with the Climate Explorer?</h4>

            <div class="accordion-text">
                <p>Climate Explorer is designed to be widely accessible and compatible with most popular, current web browsers, including Chrome, Firefox, Safari, and Internet Explorer 10. Currently, Climate Explorer is best viewed on a desktop or laptop computer as the tool has not been optimized for mobile devices.</p>
            </div>

            <h4>How can I submit questions or comments, or report a bug or broken link? </h4>

            <div class="accordion-text">
                <p>We’d love to hear from you. Please send questions, comments, or suggestions about the Climate Explorer to noaa.toolkit@noaa.gov. Expect a reply within one week.</p>
            </div>

            <h4>May I have permission to use images of the graphs, maps, and text in the Climate Explorer?</h4>

            <div class="accordion-text">
                <p>Yes. The graphs, maps, and text available in the Climate Explorer are considered public information and may be downloaded, reproduced, and distributed freely. If you use images and text from the tool, please credit the <strong>U.S. Climate Resilience Toolkit Climate Explorer</strong> as the source.</p>
            </div>

            <h4>What is the recommended citation for the information in the Climate Explorer?</h4>

            <div class="accordion-text">
                <p>U.S. Federal Government, 2018: U.S. Climate Resilience Toolkit Climate Explorer. [Online] https://climate-explorer2.nemac.org Accessed {DATE}.</p>
            </div>

            <h2>About Climate Projections</h2>

            <h4>What important considerations should users keep in mind when exploring climate projections?</h4>

            <div class="accordion-text">
                <p>Climate projections can provide useful information for making decisions about the future, but they should not be the sole basis for decision-making. It’s important to understand the limitations of climate models when interpreting or using their results:</p>

                <ul>
                    <li>Climate projections are not predictions. Projections are based on assumptions about future human emissions of greenhouse gases and other policy choices.</li>
                    <li>Climate modelers attempt to incorporate our best scientific understanding of the climate system into their models, yet known weaknesses and some gaps in scientific understanding remain. Modelers also seek to represent their evolving understanding of newly discovered processes within their models. Despite these limitations, global climate models represent our best tool for exploring the future evolution of our planet’s climate.</li>
                    <li>Climate projections do not attempt to predict the timing of specific meteorological events such as storms, droughts, or El Niños, either in hindcast mode or in projections. The location and timing of future extreme weather events cannot be deduced from climate model projections. Model results can, however, assess the changing climatology of meteorological events. For instance, projections can indicate changes in the frequencies of events such as days over 95ºF and under 32ºF.</li>
                    <li>Projections vary from model to model; the current state of understanding is that the full range of projections represents an estimate for the range of plausible climate futures. Considering the full range of projections for one or more future scenarios may help you gain a more complete picture of the range of potential future risks.</li>
                    <li>Increased spatial resolution does not necessarily equate to greater fidelity (i.e. less uncertainty) or reliability.</li>
                </ul>
                <p>For decisions involving the use of climate model projections, you may want to consider seeking expertise.</p>
            </div>

            <h4>What are Representative Concentration Pathways (RCPs)?</h4>

            <div class="accordion-text">
                <p>Representative Concentration Pathways (RCPs) represent different storylines about how the abundance of heat-trapping gases in Earth’s atmosphere will change through the year 2100. The Intergovernmental Panel on Climate Change (IPCC) defined four pathways (RCP 2.6, RCP 4.5, RCP 6, and RCP 8.5) to serve as a consistent set of conditions for which global climate models would calculate projections. Though each of the RCPs defines a radiative forcing level for the year 2100, Earth’s average surface temperature will continue to increase beyond the end of this century under all scenarios.</p>
            </div>

            <h4>Which RCP should I use? Which is most likely to occur?</h4>

            <div class="accordion-text">
                <p>According to the Intergovernmental Panel on Climate Change, the Representative Concentration Pathways (RCPs) should not be considered policy-prescriptive because they were developed to support scientific research on various possible climate change futures, without making any judgment as to their desirability or probability. These scenarios reflect choices individuals and society will make over coming decades, so there is uncertainty regarding the actual year-to-year change in greenhouse gases. RCPs are not considered to be forecasts, nor do they represent absolute bounds on the realm of possibility. While they all represent plausible scenarios for the future, none of the RCPs are intended to serve as predictions, best guesses, most likely, or more plausible pathways than the others.</p>
                <p>Keeping these caveats in mind, the projected global temperature values based on the RCPs can serve as a useful point of reference when considering possible futures with respect to human populations, ecosystems, natural resources, and valued assets within the built environment. Key questions to consider when planning for the future include: What’s my tolerance for risk? How much confidence do I have that humanity will take action to limit and/or reduce concentrations of heat-trapping gases in the atmosphere this century? Individuals and groups who have a low tolerance for risk and/or low confidence that humans will act to significantly reduce greenhouse gas emissions may choose to plan for impacts under RCP 8.5. People who have some tolerance for risk and/or some confidence that humans will take moderate action in the very near future to reduce emissions may choose to plan for RCP 4.5.</p>
                <p>In 2015, at the United Nations Framework on Climate Change (UNFCCC) 21st Annual Conference of the Parties (COP21) in Paris, many nations agreed to pursue efforts to limit global average temperature increase to 1.5°C above pre-industrial levels. Climate modelers suggest this is only possible if we strive to reach RCP 2.6, a pathway that calls for immediate action to achieve drastic reductions in greenhouse gas emissions.</p>
            </div>

            <h4>What errors, uncertainties, and assumptions are inherent in climate projection data?</h4>

            <div class="accordion-text">
                <p>While there is substantial and increasing skill at projecting future climate conditions, no climate model will ever simulate the climate system perfectly. Noteworthy sources of uncertainty exist in all climate projections, including those offered in the Climate Explorer.</p>
                <p>Because scientists do not have real-world measurements for every point on Earth’s surface or throughout all levels of the atmosphere and ocean, they must make assumptions about conditions at locations between measurements. These assumptions are used to develop gridded observational data, and again to set initial conditions for climate models. This also introduces a level of uncertainty in the observed data used in downscaling approaches.</p>
                <p>Natural variability of the weather and climate system—ultimately due to chaos—introduces an inherent degree of unpredictability in climate projections. The goal of climate projections is to help people understand significant changes and trends in climate conditions over time. Projections are not intended to serve as forecasts of weather conditions in a specific year in the future.</p>
                <p>Beyond spatial interpolation and natural interannual variability, three elements of the modeling process introduce margins of uncertainty in climate projections. First, each global climate model uses a slightly different set of equations to represent Earth’s physical processes. Therefore, results from different models show a range of projections at each time step for each scenario. This is the reason Climate Explorer graphs show a band of projected values for each scenario rather than a single line. Second, the Representative Concentration Pathways (RCPs; see below) are not year-by-year forecasts of emissions. Rather, they reflect the sum of societal choices over the next several decades that result in specific levels of radiative forcing in the year 2100. Uncertainty in what the actual abundance of various heat-trapping gases (which determines radiative forcing) will be during each year of the 21st century also introduces uncertainty. Third, the statistical downscaling method assumes that the future climate will behave similarly to the historical climate in terms of atmospheric and oceanic circulation patterns, which may not be true at every location.</p>
                <p>Calculating a single average value for climate variables for each county inevitably also introduces error, in that the average cannot accurately represent every location in the county. The error for any location depends on differences in the environment such as elevation and proximity to lakes, a coast, or mountains.</p>
                <p>The Climate Explorer’s presentation of projections as bands of values gives equal weight to the outputs from each of the 32 models; whichever model has the maximum value at any time step is represented at the top of the band and whichever model has the minimum value is represented by the bottom of the band. The weighted average line is calculated by assigning more or less ‘'weight' to each model based on their independence from the other 32 models and their skill in projecting the observed climate of North America in the recent past. Though the average line is no more likely to be the observed future value than any of the other model’s value, it helps define the trend.</p>
            </div>


            <h2>Data in the Climate Explorer</h2>

            <h4>Where did the climate projection data in Climate Explorer come from?</h4>

            <div class="accordion-text">
                <p>The modeled data presented in the Climate Explorer’s graphs are based on statistical downscaling of temperature and precipitation projections from the Coupled Model Intercomparison Project Phase 5 (CMIP5) using Localized Constructed Analogs (LOCA), provided by David Pierce and Daniel Cayan of the Scripps Institution of Oceanography. The downscaling technique was developed and described by D.W. Pierce, (2014). Climate variables presented in Climate Explorer were derived from LOCA projections of maximum temp, minimum temp, and total precipitation. LOCA data for historical and future periods are freely available via Data.gov.</p>
                <p>A gridded observational dataset aggregated by Ben Livneh et al. (2013, 2015) was used to calculate historical averages for the period 1961-1990. Annual observations—shown as dark gray bars in Climate Explorer graphs—extend above or below the 30-year average. Livneh data are freely available via Data.gov.</p>
                <p>For more details about the tool and its data sources, please see the “About Climate Explorer” section.</p>

            </div>

            <h4>What changes were made in the early 2018 update of Climate Explorer?</h4>

            <div class="accordion-text">
                <p>See <a href="https://toolkit.climate.gov/content/notice-climate-explorer-users">Notice to Climate Explorer Users</a></p>

            </div>

            <h4>Why did the Climate Explorer team select the LOCA dataset for display?</h4>

            <div class="accordion-text">
                <p>Communities that undertake resilience-building tasks are often most concerned with the potential impacts of extreme events, yet until recently, downscaled climate projections were not designed to represent these extremes well. We chose to use the Localized Constructed Analogs (LOCA) dataset based on its improved ability to represent extremes at high spatial resolution, relative to its predecessors (Pierce et al., 2014). LOCA was developed for the California Climate Change Assessment, the Southwest Climate Science Center and other U.S. planning efforts, including the Fourth National Climate Assessment of the U.S. Global Change Research Program.</p>
                <p>LOCA downscales (or localizes) temperature or precipitation simulated by a coarse-resolution climate model field by looking for observed days that match the model day both regionally and locally around each grid cell being downscaled. The matching observed days identified at each grid cell are then joined across the domain like a jigsaw puzzle. The result is a final downscaled field at the same spatial resolution as the observations. The LOCA dataset and the CE offer projections for two future scenarios: a higher greenhouse gas emissions future (RCP8.5) and a lower emissions future (RCP4.5) (van Vuuren et al. 2011).</p>
            </div>

            <h4>How many models are represented by the range of projections in Climate Explorer?</h4>

            <div class="accordion-text">
                <p>Thirty-two of the global climate models that participated in the Coupled Model Intercomparison Project Phase 5 (CMIP5) produced the range of projection values shown in the Climate Explorer. Models represented are: ACCESS1-0, ACCESS1-3, CCSM4, CESM1-BGC, CESM1-CAM5, CMCC-CM, CMCC-CMS, CNRM-CM5, CSIRO-Mk3-6-0, CanESM2,, EC-EARTH, FGOALS-g2, GFDL-CM3, GFDL-ESM2G, GFDL-ESM2M, GISS-E2-H, GISS-E2-R, HadGEM2-AO, HadGEM2-CC, HadGEM2-ES, IPSL-CM5A-LR, IPSL-CM5A-MR, MIROC-ESM,, MIROC-ESM-CHEM, MIROC5, MPI-ESM-LR, MPI-ESM-MR, MRI-CGCM3, NorESM1-M, Bcc-csm1-1, Bcc-csm1-1-m, and inmcm4.</p>
            </div>

            <h4>Where do the sea level projections come from?</h4>

            <div class="accordion-text">
                <p>William Sweet and other researchers at NOAA's National Ocean Service used the latest peer-reviewed estimates of global sea level rise to produce these estimates. Combined with information on local land subsidence or uplift, they estimated the frequency of high-tide flooding during each future decade out to 2100. The graphs show observed annual flood days through 2016 and projections for the number of days per year when inundation will exceed a locally defined level: high-tide flooding events should not be envisioned as city-wide floods.</p>
                <p>For further information, see <a href="https://tidesandcurrents.noaa.gov/publications/NOAA_Technical_Report_NOS_COOPS_073.pdf" target="_blank">https://tidesandcurrents.noaa.gov/publications/NOAA_Technical_Report_NOS_COOPS_073.pdf</a></p>
            </div>

            <h4>What are the scenarios represented by the blue, red, and gray bands in the tool’s charts?</h4>

            <div class="accordion-text">
                <p>The blue band shows the range of projections for a possible future in which global emissions of heat-trapping gases peak around 2040 and then become stable. Labeled as “Lower Emissions” in Climate Explorer, this scenario is known as  Representative Concentration Pathway 4.5, or RCP 4.5. This scenario represents a path in which the atmosphere’s radiative forcing in 2100 is 4.5 Watts per square meter higher than pre-industrial values.</p>
                <p>The red band shows the range of projections for a potential future in which global emissions of heat-trapping gases continue increasing through 2100. Labeled as  “Higher Emissions” in Climate Explorer, this scenario is known as Representative Concentration Pathway 8.5 or RCP 8.5. In this possible future, the increasing concentration of heat-trapping gases in the atmosphere follows a path that results in radiative forcing of at least 8.5 Watts per square meter over pre-industrial values by the year 2100. For planning purposes, people who have a low tolerance for risk often focus on this higher emissions scenario.</p>
                <p>The light gray band shows the range of modeled data (hindcast) for the historical period. To produce these results, global climate models were initialized with historical conditions, and then run in “forecast” mode to model conditions through 2015.</p>
            </div>

            <h4>Why can’t I find climate projections for Alaska and Hawai’i in the Climate Explorer?</h4>

            <div class="accordion-text">
                <p>The LOCA dataset downscaled CMIP5 projections for the contiguous U.S. plus portions of Canada and Mexico, but not for Alaska, Hawai’i, or other U.S. Territories. We plan to find and offer comparable projections for these states as soon as possible.</p>
                <p>In the meantime, users can access climate projections for Alaska from  the <a href="https://www.snap.uaf.edu/" target="_blank">Scenarios Network for Alaska + Arctic Planning (SNAP)</a>. Projections for Hawai’i are available from the NOAA National Centers for Environmental Information’s <a href="https://statesummaries.ncics.org/hi" target="_blank">State Climate Summaries</a> site.</p>
            </div>

            <h4>How did you decide which stations and years to show in the Daily vs. Climate and Thresholds graphs in the <strong>Explore Station Data</strong> section?</h4>

            <div class="accordion-text">
                <p>We started with a pool of all stations in the Global Historical Climatology Network - Daily dataset that are located within the contiguous United States. In a first pass, we eliminated stations did not record data during the past 30 years. In our second pass, we documented which stations were missing more than 5 temperature records in a single month or more than 1 precipitation record in a single month, and excluded these years from the thresholding function. We deleted all stations where records did not meet these criteria for at least 10% of the years in its period of record.</p>
            </div>

            <h4>What is represented in the High-tide flooding graphs?</h4>

            <div class="accordion-text">
                <p>High-tide flooding graphs show observed and projected changes in the frequency of high-tide flooding—events when sea water laps onto land to inundate some portion of normally dry land. These floods have also been called nuisance, sunny day, or recurrent flooding. At each station, local emergency managers and NOAA Weather Forecasting Offices have identified flooding thresholds related to impacts such as flooding of low-lying roads or infiltration into storm-water systems. In the CE, users can now view the observed annual number of days with high tide flooding at selected stations, and projections for the annual number of high tide flooding, for two difference scenarios, through 2100 (Sweet and Park, 2014).</p>
            </div>


            <h2>Considerations for using Climate Explorer</h2>


            <h4>Why can I only get county-scale climate projections in Climate Explorer? Where can I get climate projections at higher spatial and temporal resolution?</h4>

            <div class="accordion-text">
                <p>After deliberating on the appropriate scale at which to offer climate projections in Climate Explorer, we chose to strike a balance between providing information at a scale that is relevant to local adaptation decision making and that recognizes important constraints, such as of the coarse spatial resolution of gridded historical observations and uncertainties inherent in projecting future climate conditions. Our team of climate model experts agreed that averaging the LOCA data for every county in the contiguous United States provided the best balance between these considerations.</p>
                <p>The Climate Explorer uses the Localized Constructed Analogs (LOCA) downscaled climate and hydrology projections, which are available at 1/16° spatial resolution and daily temporal resolution for the period from 1950 to 2100. (Note: some models stop in 2099.)</p>
                <p>Downscaled climate projection information is available from other sources at other spatial resolutions for some locations. For example, climate modelers have produced downscaled climate projections at city-scale resolution for some cities, watersheds, national park lands, and other locations. Groups such as USDA’s Climate Hubs, NOAA’s Regional Integrated Sciences and Assessments (RISA) groups, and Landscape Conservation Cooperatives may have, or may be able to point you to, people or groups who have expertise in developing or interpreting downscaled climate projections at other spatial scales. You may also be able to find climate model expertise near your location on the Climate Resilience Toolkit’s <a href="https://toolkit.climate.gov/help/partners" target="_blank">Find Experts</a> map.</p>
            </div>

            <h4>Why do maps for precipitation projections show such large variations for % difference?</h4>

            <div class="accordion-text">
                <p>In areas where annual precipitation is relatively low, any change in annual amounts represents a fairly large percentage difference. For instance, if an area that currently receives 8 inches of rain per year is projected to receive 12 inches per year at some point in the future, the change is 50%. Conversely, if precipitation over a relatively wet area changes, the percentage change is smaller. For example, if an area that currently receives 50 inches of rain per year is projected to reach 55 inches per year in the future, the change is 10%.</p>
            </div>

            <h4>In the "Days of Precipitation Above 1 Inch" charts, why are historical observed values so different from historical modeled values for some counties and not for others?</h4>

            <div class="accordion-text">
                <p>For counties that have diverse land elevations and/or are situated near an ocean or large inland water body, statistically downscaled climate projections tend to underpredict the number of days with high precipitation values, and they tend to over-predict the number of days with drizzle. Comparing observed values with historical model values can reveal counties where this bias is apparent. Climate modelers are aware of the problem and are actively working to remove such biases from their models. The change to LOCA data (from BCCA) is intended to improve representation of precipitation extremes.</p>
            </div>



            <h2>Contacting the Climate Explorer team</h2>


            <h4>How may I contribute maps and data to the Climate Explorer, or assist in its development?</h4>

            <div class="accordion-text">
                <p>If you have maps or data that you would like to offer as candidates for inclusion in the Climate Explorer, let us know by emailing noaa.toolkit@noaa.gov. If you would like to add to or evolve the tool’s functionality, please note that the code repository for Climate Explorer is freely available on GitHub. Please note:  We’d be happy to hear of your efforts to reuse this code, but the Climate Explorer team does not offer technical support for working with the code.</p>
            </div>



            <h4>Contact</h4>

            <div class="accordion-text">
                <p>If you have questions or comments on the Climate Explorer, please direct them to <a href="mailto:noaa.toolkit@noaa.gov">noaa.toolkit@noaa.gov</a>.</p>
            </div>


        </section>
    </div>
</div>

<?php include_once('template/footer.php'); ?>

<script src="/resources/js/cwg/climate-widget-graph.js"></script>
<script src="/resources/js/cwg/cwg.js"></script>

</body>
</html>
