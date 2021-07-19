import head from '../template/head'
import secondary_header from '../template/secondary_header';
import footer from '../template/footer';
import nav_footer from '../template/nav_footer';

export default (config) => `
<!doctype html>
<html lang='en' class="width-100 height-100">
<head>
  ${head(config)}
  <meta property="fb:app_id" content="187816851587993" />
  <meta property="og:url" content="/faq.php" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="FAQ" />
  <meta property="og:description" content="The Climate Explorer allows you to view historical and projected climate variables and assess the impacts of climate change on the things you care about" />
  <meta property="og:image" content="/img/og.jpg" />
</head>


<body class="width-100 height-100">

  ${secondary_header(config)}

  <div id="about-viewport" class="padding-horizontal d-flex d-flex-column">
    <div id="about-text-row" class="padding-vertical width-100" >

      <div class="splash-text">
        <h2>FREQUENTLY ASKED QUESTIONS</h2>
      </div>

      <div id="standard-body" class="page-text ui-accordion ui-widget ui-helper-reset">

        <h2>USING THE CLIMATE EXPLORER TOOL</h2>
        <h4>How can I submit questions or comments, or report a bug or broken link?</h4>
        <div class="accordion-text">
          <p>
            We'd love to hear from you. Please send questions, comments, or suggestions to <a href="mailto:noaa.toolkit@noaa.gov" target="_blank">noaa.toolkit@noaa.gov</a>. Expect a reply within a few days to one week.
          </p>
        </div>
        
        <h4>Is there a tutorial or educational activity to help new users read and understand the tool’s maps and graphs?</h4>
        <div class="accordion-text">
          <p>
          Yes. See <a href="https://arcg.is/15mvy80" target="_blank">Using Climate Explorer to get a feel for Future Conditions</a> 
          </p>
        </div>
        
        <h4>
          Do I have permission to use images of the graphs, maps, and text in the Climate Explorer?
        </h4>
        <div class="accordion-text">
          <p>
          Yes. The graphs, maps, and text available in the Climate Explorer are public information and may be downloaded, reproduced, and distributed freely. Please credit the U.S. Climate Resilience Toolkit Climate Explorer as the source.
          </p>
        </div>
        
        <h4>What is the recommended citation for information in the Climate Explorer?</h4>
        <div class="accordion-text">
          <p>U.S. Federal Government, 2021: U.S. Climate Resilience Toolkit Climate Explorer. [Online] https://crt-climate-explorer.nemac.org/ Accessed {DATE}.</p>
        </div>

        <h2>DATA IN THE CLIMATE EXPLORER</h2>
        <h4>What are the conditions represented by the blue, red, and gray bands in the tool's charts?</h4>
        <div class="accordion-text">
          <p>
            The blue band shows the range of projections for a possible future in which global emissions of heat-trapping gases peak around 2040 and then become stable. Labeled as “Lower Emissions” in Climate Explorer, this scenario is known as Representative Concentration Pathway 4.5, or RCP 4.5. This scenario represents a path in which the atmosphere's radiative forcing in 2100 is 4.5 Watts per square meter higher than pre-industrial values, without ever exceeding that value.
          </p>
          <p>
          The red band shows the range of projections for a potential future in which global emissions of heat-trapping gases continue increasing through 2100. Labeled as “Higher Emissions” in Climate Explorer, this scenario is known as Representative Concentration Pathway 8.5 or RCP 8.5. In this possible future, the increasing concentration of heat-trapping gases in the atmosphere follows a path that results in radiative forcing of at least 8.5 Watts per square meter over pre-industrial values by the year 2100. For planning purposes, people who have a low tolerance for risk often focus on this higher emissions scenario.
          </p>
          <p>
          The light gray band shows the range of modeled results (hindcast) for the historical period. To produce these results, global climate models were initialized to historical conditions, and then run in “forecast” mode to model conditions through 2015.
          </p>
        </div>
        
        <h4>Where did the climate projection data in Climate Explorer come from?</h4>
        <div class="accordion-text">
          <p>
            Modeled data for the contiguous United States are based on statistical downscaling of temperature and precipitation projections from the Coupled Model Intercomparison Project Phase 5 (<a href="https://esgf-node.llnl.gov/projects/cmip5/" target="_blank">CMIP5</a>) using Localized Constructed Analogs (<a href="http://loca.ucsd.edu/" target="_blank">LOCA</a>). LOCA data for historical and future periods are freely available for the contiguous United States, Southern Canada, and Northern Mexico via <a href="https://catalog.data.gov/dataset/projected-future-loca-statistical-downscaling-localized-constructed-analogs-statistically-downs" target="_blank">Data.gov</a>.
          </p>
          <p>
          For Alaska boroughs, hindcasts and projections are based on results from two climate models, GFDL-CM3 and NCAR-CCSM4. <a href="http://ckan.snap.uaf.edu/dataset/historical-and-projected-dynamically-downscaled-climate-data-for-the-state-of-alaska-and-surrou" target="_blank">Downscaled results for Alaska</a> were produced by the <a href="https://casc.alaska.edu/" target="_blank">Alaska Climate Adaptation and Science Center</a> using the Weather Research and Forecasting (<a href="https://www.mmm.ucar.edu/weather-research-and-forecasting-model" target="_blank">WRF</a>) model (Version 3.5). On climate graphs for Alaska boroughs, values from the two climate models have been smoothed by a 10-year rolling average.
          </p>
          <p>
          For Hawai’i and U.S. island territories, modeled history and future projections come from CMIP5 global climate model simulations. Raw values from the models have not been downscaled or bias-corrected. Projections for specific islands are the average of the three global climate model grid points closest to the geographic center of each island.
          </p>
        </div>
        
        <h4>Where did the observation data for contiguous U.S. locations come from?</h4>
        <div class="accordion-text">
          <p>
            A gridded observational dataset aggregated by <a href="https://www.nature.com/articles/sdata201542">Ben Livneh et al. (2013, 2015)</a> was used to calculate observed averages counties in the contiguous United States. Annual observations—shown as dark gray bars in Climate Explorer’s annual graphs—extend above or below the 30-year average measured from 1961-1990. Livneh data are freely available via <a href="https://catalog.data.gov/dataset/a-spatially-comprehensive-hydrologic-model-based-data-set-for-mexico-the-u-s-and-sout-1950-2013" target="_blank">Data.gov</a>.
          </p>
        </div>
        
        <h4>Why do the historical observations end in 2013? Why don’t you show observations up to the previous year?</h4>
        <div class="accordion-text">
          <p>
            The observational dataset in the Climate Explorer was published in 2013 and updated in 2015. More recent data has been collected (for example, see the <a href="https://www.ncdc.noaa.gov/ghcn-daily-description" target="_blank">Global Historical Climatology Network - Daily</a> dataset) yet the recent data have not been gridded and processed in accordance with the Livneh protocols. Slight differences in protocols for developing and updating datasets make one-to-one comparisons between Livneh and other observational datasets difficult, though disparate observational datasets show similar trends.
          </p>
        </div>

        <h4>Why did the Climate Explorer team select the LOCA dataset for downscaled projections?</h4>
        <div class="accordion-text">
          <p>
            Communities that undertake resilience-building tasks are often most concerned with the potential impacts of extreme events, yet until recently, downscaled climate projections were not designed to represent these extremes well. We chose the Localized Constructed Analogs (LOCA) dataset based on its improved ability to represent extremes at high spatial resolution, relative to its predecessors (<a href="https://journals.ametsoc.org/view/journals/hydr/15/6/jhm-d-14-0082_1.xml" target="_blank">Pierce et al., 2014</a>). LOCA was developed for the California Climate Change Assessment, the Southwest Climate Science Center and other U.S. planning efforts, including the Fourth National Climate Assessment of the U.S. Global Change Research Program.
          </p>
          <p>
            LOCA downscales (or localizes) temperature or precipitation simulated by a coarse-resolution climate model by looking for observed days that match the model day both regionally and locally around each grid cell being downscaled. The matching observed days identified at each grid cell are then joined across the domain like a jigsaw puzzle. The result is a final downscaled field at the same spatial resolution as the observations. The LOCA dataset offers projections for two plausible futures: a higher greenhouse gas emissions future (RCP8.5) and a lower emissions future (RCP4.5) (<a href="https://link.springer.com/article/10.1007/s10584-013-0906-1" target="_blank">van Vuuren et al., 2011</a>).
          </p>
        </div>
        
        <h4>How many models are represented by the range of projections in Climate Explorer?</h4>
        <div class="accordion-text">
          <p>
            For counties in the contiguous United States, 32 of the global climate models that participated in the Coupled Model Intercomparison Project Phase 5 (CMIP5) were used to produce the range of projections. Models represented in LOCA data are: ACCESS1-0, ACCESS1-3, CCSM4, CESM1-BGC, CESM1-CAM5, CMCC-CM, CMCC-CMS, CNRM-CM5, CSIRO-Mk3-6-0, CanESM2,, EC-EARTH, FGOALS-g2, GFDL-CM3, GFDL-ESM2G, GFDL-ESM2M, GISS-E2-H, GISS-E2-R, HadGEM2-AO, HadGEM2-CC, HadGEM2-ES, IPSL-CM5A-LR, IPSL-CM5A-MR, MIROC-ESM, MIROC-ESM-CHEM, MIROC5, MPI-ESM-LR, MPI-ESM-MR, MRI-CGCM3, NorESM1-M, Bcc-csm1-1, Bcc-csm1-1-m, and inmcm4.
          </p>
          <p>
          For Alaska boroughs, hindcasts and projections are based on results from two climate models, GFDL-CM3 and NCAR-CCSM4.
          </p>
        </div>
        
        <h4>Where do the sea level projections come from?</h4>
        <div class="accordion-text">
          <p>
            William Sweet and other researchers at NOAA's National Ocean Service used the latest peer-reviewed estimates of global sea level rise and local reports of flooding impacts to produce these estimates. Combined with information on local land subsidence or uplift, oceanographers estimated the frequency of high-tide flooding at each location during future decades out to 2100. The graphs show observed annual high-tide flood days through 2016 and projections for the number of days per year when inundation will exceed a locally defined level through 2100.
          </p>
          <p>
            High-tide flooding events should not be envisioned as days-long city-wide floods. Rather, these events result in temporary inundation of low-lying portions of the coastal cities at each station.
          </p>
          <p>
          For further information, see <a href="https://tidesandcurrents.noaa.gov/publications/techrpt86_PaP_of_HTFlooding.pdf" target="_blank">Patterns and Projections of High-tide flooding along the U.S. Coastline using a Common Impact Threshold</a>.
          </p>
        </div>
        
        <h4>For which areas outside of the contiguous U.S. does the Climate Explorer have projections?</h4>
        <div class="accordion-text">
          <p>
            The LOCA dataset offers downscaled CMIP5 projections for the contiguous U.S. plus portions of Canada and Mexico, but not for Alaska, Hawai'i, or other U.S. territories. In collaboration with climate scientists from the region, we added projections for Alaska from the <a href="https://www.snap.uaf.edu/">Scenarios Network for Alaska + Arctic Planning (SNAP)</a>. In 2021, we added climate projections for Hawai'i and United States territories in the Pacific Ocean and Caribbean Sea. Data for Hawai'i and U.S. territories come from CMIP5 global climate model simulations. Raw values from the models have not been downscaled or bias-corrected. Values provided for individual islands and island groups are averages of the three model grid points closest to the geographic center of each territory. Modeled history and projections are available for the following island locations:
          </p>
          <p>
            <ul style="list-style: none">
              <li><a  href="/cards_home/?area-id=hawaii_north&area-label=Northern+Hawaiian+Islands+%28Oahu%2C+Kauai%29&lat=20.4&lon=-160.8" target="_blank">Northern Hawaiian Islands (Honolulu County, Kauaʻi County, and Northwestern Hawaiian Islands)</a></li>
              <li><a  href="/cards_home/?area-id=hawaii_south&area-label=Southern+Hawaiian+Islands+%28Hawai%27i%2C+Maui%2C+Molokai%29&lat=18.7&lon=-157.4" target="_blank">Southern Hawaiian Islands (Maui County, Hawai'i County)</a></li>
              <li><a  href="/cards_home/?area-id=puerto_rico_ne&area-label=Northeastern+Puerto+Rico+%28San+Juan%2C+Caguas%29&lat=18.03356&lon=-66.3373" target="_blank">Northeastern Puerto Rico (San Juan, Caguas)</a></li>
              <li><a  href="/cards_home/?area-id=puerto_rico_sw&area-label=Southwestern+Puerto+Rico+%28Mayaguez%2C+Ponce%29&lat=17.454&lon=-68.0816" target="_blank">Southwestern Puerto Rico (Mayaguez, Ponce)</a></li>
              <li><a  href="/cards_home/?area-id=guam&area-label=Guam&lat=13.2&lon=144.4" target="_blank">Guam</a></li>
              <li><a  href="/cards_home/?area-id=us_virgin_islands&area-label=US+Virgin+Islands&lat=17.596903&lon=-64.927612" target="_blank">U.S. Virgin Islands</a></li>
              <li><a  href="/cards_home/?area-id=american_samoa&area-label=American+Samoa&lat=-14.552944&lon=-170.874588" target="_blank">American Samoa</a></li>
              <li><a  href="/cards_home/?area-id=midway_islands&area-label=Midway+Islands&lat=28.1976585966&lon=-177.389597134" target="_blank">Midway Islands</a></li>
              <li><a  href="/cards_home/?area-id=northern_mariana_islands&area-label=Northern+Mariana+Islands&lat=14.0&lon=143.51" target="_blank">Northern Mariana Islands</a></li>
              <li><a  href="/cards_home/?area-id=baker_island&area-label=Baker+Island+%28uninhabited%29&lat=0.19033437683&lon=-176.485829231" target="_blank">Baker Island (uninhabited)</a></li>
              <li><a  href="/cards_home/?area-id=johnston_atoll&area-label=Johnston+Atoll+%28uninhabited%29&lat=16.7210147164&lon=-169.549509244" target="_blank">Johnston Atoll (uninhabited)</a></li>
              <li><a  href="/cards_home/?area-id=jarvis_island&area-label=Jarvis+Island+%28uninhabited%29&lat=-0.388767184358&lon=-160.029977994" target="_blank">Jarvis Island (uninhabited)</a></li>
              <li><a  href="/cards_home/?area-id=palmyra_atoll_kingman_reef&area-label=Palmyra+Atoll+and+Kingman+Reef+%28uninhabited%29&lat=5.550381&lon=-162.877808" target="_blank">Palmyra Atoll and Kingman Reef (uninhabited)</a></li>
              <li><a  href="/cards_home/?area-id=howland_island&area-label=Howland+Island+%28uninhabited%29&lat=0.790187893157&lon=-176.640492317" target="_blank">Howland Island (uninhabited)</a></li>
              <li><a  href="/cards_home/?area-id=wake_island&area-label=Wake Island&lat=19.2755801457&lon=166.619395379" target="_blank">Wake Island</a></li>
          </ul>
          </p>
        </div>
        
        <h4>How did you decide which stations and years to show in the Daily vs. Climate and Thresholds graphs in the Weather & Tidal Stations section?</h4>
        <div class="accordion-text">
          <p>
            We started with a pool of all stations in the Global Historical Climatology Network - Daily dataset that are located within the contiguous United States. In a first pass, we eliminated stations that did not record data during the past 30 years. In our second pass, we documented which stations were missing more than 5 temperature records in a single month or more than 1 precipitation record in a single month, and excluded these years from the thresholding function. We deleted all stations where records did not meet these criteria for at least 10% of the years in its period of record.
          </p>
        </div>
        
        <h4>What is represented in the High-tide flooding graphs?</h4>
        <div class="accordion-text">
          <p>
            High-tide flooding graphs show observed and projected changes in the frequency of high-tide flooding—events when sea water laps onto land to inundate some portion of normally dry land. These floods have also been called nuisance, sunny day, or recurrent flooding. At each station, local emergency managers and NOAA Weather Forecasting Offices have identified flooding thresholds (expressed as heights above local mean high higher water) related to impacts such as flooding of low-lying roads or infiltration into storm-water systems. Oceanographers compiled these heights for many stations, and then performed statistical analyses on the dataset to establish threshold flood heights for each station.
          </p>
          <p>
            For stations in the study, graphs show the observed annual number of days with high tide flooding through 2016, and projections for the annual number of high tide flooding days through 2100, for higher and lower emissions scenarios.
          </p>
          <p>
            For more information, see <a href="https://tidesandcurrents.noaa.gov/publications/techrpt86_PaP_of_HTFlooding.pdf" target="_blank">Patterns and Projections of High-tide flooding along the U.S. Coastline using a Common Impact Threshold</a>.
          </p>
        </div>
        
        <h2>ABOUT CLIMATE PROJECTIONS</h2>
        <h4>What important considerations should users keep in mind when exploring climate projections?</h4>
        <div class="accordion-text">
          <p>
            Climate projections can provide useful information for making decisions about the future, but they should not be the sole basis for decision-making. It's important to understand the limitations of climate models when interpreting or using their results:
          <ul style="list-style: none">
            <li>Though projection data are available as annual data, decadal averages are a more appropriate temporal unit for considering projections.</li>
            <li>Climate projections are not the same as weather predictions. Projections are based on assumptions about future human emissions of greenhouse gases and other policy choices.</li>
            <li>Climate modelers attempt to incorporate our best scientific understanding of the climate system into their models, yet known weaknesses and some gaps in scientific understanding remain. Modelers also seek to represent their evolving understanding of newly discovered processes within their models. Despite these limitations, global climate models represent our best tool for exploring the future evolution of our planet's climate.</li>
            <li>Climate projections do not attempt to predict the timing of specific meteorological events such as storms, droughts, or El Niños, either in hindcast mode or in projections. The location and timing of future extreme weather events cannot be deduced from climate model projections. Model results can, however, assess the changing climatology of meteorological events. For instance, projections can indicate changes in the frequencies of events such as days over 95ºF and under 32ºF.</li>
            <li>Projections vary from model to model; the current state of understanding is that the full range of projections selected for this tool represents an estimate for the range of plausible climate futures. Considering the trends and the full range of projections for future scenarios can help users develop a sense of potential future risks.</li>
            <li>Increased spatial resolution (from downscaling global climate model output) does not necessarily equate to greater reliability or lower uncertainty than lower spatial resolution results.</li>
          </ul>
          </p>
          
          <p>For decisions involving the use of climate model projections, you may want to consider seeking <a href="https://toolkit.climate.gov/#expertise" target="_blank">expertise</a>.</p>
        </div>
        
        <h4>What are Representative Concentration Pathways (RCPs)?</h4>
        <div class="accordion-text">
          <p>Representative Concentration Pathways (RCPs) represent different storylines about how the abundance of heat-trapping gases in Earth's atmosphere will change through the year 2100. The Intergovernmental Panel on Climate Change (IPCC) defined four pathways (RCP 2.6, RCP 4.5, RCP 6, and RCP 8.5) to serve as a consistent set of conditions for which global climate models would calculate projections. Though each of the RCPs defines a radiative forcing level for the year 2100, Earth's average surface temperature will continue to increase beyond the end of this century under all scenarios.
          </p>
          <p>To learn more, view <a href="https://link.springer.com/article/10.1007/s10584-013-0906-1" target="_blank">a summary table</a> describing the four RCPs</p>
        </div>
        
        <h4>Which RCP should I use? Which is most likely to occur?</h4>
        <div class="accordion-text">
          <p>
            According to the Intergovernmental Panel on Climate Change, the Representative Concentration Pathways (RCPs) should not be considered policy-prescriptive because they were developed to support scientific research on various possible climate change futures, without making any judgment as to their desirability or probability. These scenarios reflect choices individuals and society will make over coming decades, so there is uncertainty regarding the actual year-to-year change in greenhouse gases. RCPs are not considered to be forecasts, nor do they represent absolute bounds on the realm of possibility. While they all represent plausible scenarios for the future, none of the RCPs are intended to serve as predictions, best guesses, most likely, or more plausible pathways than the others.
          </p>
          <p>
          Keeping these caveats in mind, the projected global temperature values based on the RCPs can serve as a useful point of reference when considering possible futures with respect to human populations, ecosystems, natural resources, and valued assets within the built environment. Key questions to consider when planning for the future include: What's my tolerance for risk? How much confidence do I have that humanity will take action to limit and/or reduce concentrations of heat-trapping gases in the atmosphere this century? Individuals and groups who have a low tolerance for risk and/or low confidence that humans will act to significantly reduce greenhouse gas emissions may choose to plan for impacts under RCP 8.5. People who have some tolerance for risk and/or some confidence that humans will take significant action to reduce emissions in the very near future may choose to plan for RCP 4.5.
          </p>
          <p>
            In 2015, at the United Nations Framework on Climate Change (UNFCCC) 21st Annual Conference of the Parties (COP21) in Paris, many nations agreed to pursue efforts to limit global average temperature increase to 1.5°C above pre-industrial levels. Climate modelers suggest this is only possible if we strive to reach RCP 2.6, a pathway that calls for immediate action to achieve drastic reductions in greenhouse gas emissions.
          </p>
        </div>
        
        <h4>What errors, uncertainties, and assumptions are inherent in climate projection data?</h4>
        <div class="accordion-text">
          <p>
            While there is substantial and increasing skill at projecting future climate conditions, no climate model will ever simulate the climate system perfectly. Noteworthy sources of uncertainty exist in all climate projections, including those offered in the Climate Explorer.
          </p>
          <p>
            Because scientists do not have real-world measurements for every point on Earth's surface or throughout all levels of the atmosphere and ocean, they must make assumptions about conditions at locations between measurements. These assumptions are used to develop gridded observational data, and again to set initial conditions for climate models. This also introduces a level of uncertainty in the observed data used in downscaling approaches.
          </p>
          <p>
            Natural variability of the weather and climate system—ultimately due to chaos—introduces an inherent degree of unpredictability in climate projections. The goal of climate projections is to help people understand significant changes and trends in climate conditions over time. Projections are not intended to serve as forecasts of weather conditions in any specific year in the future.
Beyond spatial interpolation and natural interannual variability, other elements of the modeling process introduce margins of uncertainty in climate projections.
          <ul style="list-style: none">
              <li>First, each global climate model uses a slightly different set of equations to represent Earth's physical processes. Therefore, results from different models show a range of projections at each time step for each scenario. This is the reason Climate Explorer graphs show a band of projected values for each scenario rather than a single line.
              </li>
              <li>Second, the Representative Concentration Pathways (RCPs; see below) are not year-by-year forecasts of emissions. Rather, they reflect the sum of societal choices over the next several decades that result in specific levels of radiative forcing in the year 2100. Uncertainty in what the actual abundance of various heat-trapping gases (which determines radiative forcing) will be during each year of the 21st century also introduces uncertainty.
              </li>
              <li>Third, the statistical downscaling method assumes that the future climate will behave similarly to the historical climate in terms of atmospheric and oceanic circulation patterns, which may not be true at every location.
              </li>
              <li>Finally, calculating a single average value for climate variables for each county inevitably also introduces error, in that the average cannot accurately represent every location in the county. The error for any location depends on differences in the environment such as elevation and proximity to lakes, a coast, or mountains.
              </li>
            </ul>
          </p>
          <p>The Climate Explorer's presentation of projections as bands of values gives equal weight to the outputs from each of the 32 models; whichever model has the maximum value at any time step is represented at the top of the band and whichever model has the minimum value is represented by the bottom of the band. The weighted average line is calculated by assigning more or less 'weight' to each model based on their independence from the other 32 models and their skill in projecting the observed climate of North America in the recent past. Though the weighted mean line is no more likely to be the observed future value than any other model's value, it helps define the trend.
          </p>
        </div>
        
        <h2>CONSIDERATIONS FOR USING CLIMATE EXPLORER</h2>
        <h4>Isn’t there another tool called Climate Explorer?</h4>
        <div class="accordion-text">
          <p>
            Yes, the KNMI Climate Explorer is a scientific tool developed and maintained by Koninklijk Nederlands Meteorologisch Instituut (also known as the Royal Netherlands Meteorological Institute).
          </p>
          <p>Though the two tools have some similarities, the <a href="https://www.emetsoc.org/ems-technology-award-2021-for-geert-jan-van-oldenborgh/" target="_blank">award-winning KNMI Climate Explorer</a> was established more than a decade before the U.S. Climate Resilience Toolkit’s Climate Explorer, and the two are not related. Their developers simply chose the same name for their tools. Climate researchers are one of the main audiences for the KNMI Climate Explorer—data available through the tool is offered in specialized formats that require scientific software.
          </p>
        </div>
        
        <h4>Why can I only get county-scale climate projections in Climate Explorer? Where can I get climate projections at higher spatial and temporal resolution?</h4>
        <div class="accordion-text">
          <p>
            After deliberating on the appropriate scale at which to offer climate projections in Climate Explorer, we chose to strike a balance between providing information at a scale that is relevant to local adaptation decision making and that recognizes important constraints, such as of the coarse spatial resolution of gridded historical observations and uncertainties inherent in projecting future climate conditions. Our team of climate model experts agreed that averaging the LOCA data for every county in the contiguous United States provided the best balance between these considerations.
          </p>
          <p>The Climate Explorer uses the Localized Constructed Analogs (LOCA) downscaled climate and hydrology projections, which are available at 1/16° spatial resolution and daily temporal resolution for the period from 1950 to 2100. (Note: some models stop in 2099.)
          </p>
          <p>
          Downscaled climate projection information is available from other sources at other spatial resolutions for some locations. For example, climate modelers have produced downscaled climate projections at city-scale resolution for some cities, watersheds, national park lands, and other locations. Groups such as USDA's Climate Hubs, NOAA's Regional Integrated Sciences and Assessments (RISA) groups, and Landscape Conservation Cooperatives may have, or may be able to point you to, people or groups who have expertise in developing or interpreting downscaled climate projections at other spatial scales. You may also be able to find climate model expertise near your location on the Climate Resilience Toolkit's <a href="https://toolkit.climate.gov/help/partners" target="_blank">Find Experts</a> map.
           </p>
        </div>
        
        <h4>Why do maps for precipitation projections show such large variations for % difference?</h4>
        <div class="accordion-text">
          <p>
            In areas where annual precipitation is relatively low, any change in annual precipitation represents a fairly large percentage difference. For instance, if an area that currently receives 8 inches of rain per year is projected to receive 12 inches per year at some point in the future, the change is 50%. Conversely, if precipitation over a relatively wet area changes, the percentage change is smaller. For example, if an area that currently receives 50 inches of rain per year is projected to reach 55 inches per year in the future, the change is 10%.
          </p>
        </div>
        
        <h4>In the "Days of Precipitation Above 1 Inch" charts, why are historical observed values so different from historical modeled values for some counties and not for others?</h4>
        <div class="accordion-text">
          <p>
            For counties that have diverse land elevations and/or are situated near the ocean or large inland water body, statistically downscaled climate projections tend to under-predict the number of days with high precipitation values. Similarly, statistically downscaled climate projections tend to over-predict the number of days with drizzle. Comparing observed values with historical model values can reveal counties where this bias is apparent. Climate modelers are aware of the problem and are actively working to remove such biases from their models.
          </p>
        </div>
        
        <h2>CONTACTING THE CLIMATE EXPLORER TEAM</h2>
        <h4>How may I contribute maps and data to the Climate Explorer, or assist in its development?</h4>
        <div class="accordion-text">
            <p>If you have maps or data that you would like to offer as candidates for inclusion in the Climate Explorer, let us know by emailing <a href="mailto:noaa.toolkit@noaa.gov" target="_blank">noaa.toolkit@noaa.gov</a>. If you would like to add to or evolve the tool's functionality, please note that the code repository for Climate Explorer is freely available on GitHub. Please note: We'd be happy to hear of your efforts to reuse this code, but the Climate Explorer team can not offer technical support for such efforts.
            </p>
        </div>
        
        <h4>Contact</h4>
        <div class="accordion-text">
            <p>If you have questions or comments on the Climate Explorer, please direct them to <a href="mailto:noaa.toolkit@noaa.gov" target="_blank">noaa.toolkit@noaa.gov</a>.
            </p>
        </div>
      
      </div>
    </div>
  </div>


  ${nav_footer(config)}
  ${footer(config)}

  <script src="https://unpkg.com/terraformer@1.0.8/terraformer.js" integrity="sha384-+M797Pj3WZVCwMmLbOxAoaWYcKJo8NSxItmI48ytcLNeAnfn1d/IckFn31jEqrzP"
  crossorigin="anonymous"></script>
  <script src="https://unpkg.com/terraformer-arcgis-parser@1.0.5/terraformer-arcgis-parser.js"
  integrity="sha384-duFUjKTSNoxEspdJNwr83CUgRxclf0ueKJB9DU/Vbit6bfWgzvZsHW6H1JLBBXhp" crossorigin="anonymous"></script>
  <script type="${config.env === 'dev'? 'module':  'text/javascript'}" src="/js/index.js"></script>
</body>
</html>
`
