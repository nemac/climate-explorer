import head from '../template/head';
import secondary_header from '../template/nav_header';
import nav_footer from '../template/nav_footer';
import footer from '../template/footer';

// language=HTML
export default (config) => `
  <!doctype html>
  <html lang='en'>
  <head>
    ${head(config)}
    <meta property="fb:app_id" content="187816851587993"/>
    <meta property="og:url" content="/about.php"/>
    <meta property="og:type" content="article"/>
    <meta property="og:title" content="About Climate Explorer"/>
    <meta property="og:description"
          content="The Climate Explorer allows you to view historical and projected climate variables and assess the impacts of climate change on the things you care about"/>
    <meta property="og:image" content="/img/og.jpg"/>
  </head>
  <body>
  ${secondary_header(config)}
  <div class="container-fluid d-flex d-flex-column body-size">
    <div>
      <div class="main-title mt-3 mb-3">
        <h2>ABOUT The U.S. Climate Resilience Toolkit CLIMATE EXPLORER (version 3.1)</h2>
      </div>
      <div class="page-text">
        <p>
          The Climate Explorer gives users a way to check how climate conditions in the United States are projected to change over the coming decades. This
          information—derived from global climate models—is available for counties and county-equivalents for all 50 states and U.S. territories in the United States.
        </p>
        <p>
          Built to accompany the U.S. Climate Resilience Toolkit, Climate Explorer graphs projections for two possible futures: one in which humans drastically reduce
          and stabilize global emissions of heat-trapping gases (labeled Lower emissions, also known as RCP4.5), and one in which we continue increasing emissions
          through the end of the 21st century (labeled Higher emissions, also known as RCP8.5). Note that only higher emissions projections are available for Alaska.
          Decision makers can check climate projections based on these two plausible futures and then plan according to their tolerance for risk and the timeframe of
          their decisions.
        </p>
        <p>
          For the contiguous United States, the tool also displays observations of climate variables from 1950 to 2013. Users can compare observations to modeled
          history (results called hindcasts, or projections generated for the past) for the same period. Checking how observations compare to modeled history provides
          some insight on the models' collective ability to reproduce past conditions. For temperature-related variables, the range of observations are generally
          within the envelope of modeled history (hindcasts), indicating model skill in simulating observed conditions. For some variables—especially
          precipitation-related variables—comparing observations with hindcasts reveals limitations of the models.
        </p>
        <p>
        <hr>
        </p>
        <h2>ABOUT THE TOOL</h2>
        <p>
          The Climate Explorer provides interactive graphs and maps showing past and projected climate conditions for counties and county-equivalents across the
          United States. Built to support the <a href="https://toolkit.climate.gov/" target="_blank>">U.S. Climate Resilience Toolkit</a>, the tool helps people
          explore projected future climate conditions that may put people, property, and other assets at risk.
        </p>
        <p>
          <a target="_blank" href="https://www.fernleafinteractive.com/">FernLeaf Interactive</a> and the <a target="_blank" href="https://nemac.unca.edu/">National
          Environmental Modeling and Analysis Center (NEMAC)</a> at the University of North Carolina Asheville built the Climate Explorer’s graphing modules; they
          also built the interactive map modules which are powered by <a target="_blank" href="http://www.arcgis.com/">ArcGIS</a>. All requests for historic and
          projected climate data are powered by ACIS web services. <a target="_blank" href="https://habitatseven.com/">Habitat Seven</a> led the initial design of the
          Climate Explorer interface. If you have questions or comments about the Climate Explorer, please direct them to <a target="_blank"
                                                                                                                             href="mailto:noaa.toolkit@noaa.gov">noaa.toolkit@noaa.gov</a>.
        </p>
        <p>
        <hr>
        </p>
        <h2>ABOUT THE DATA</h2>
        <h3>Observations</h3>
        <p>
          For the contiguous United States, graphs and maps for 1950 through 2013 show averages of observations recorded at individual climate and weather stations.
          Station data for temperature and precipitation were interpolated and stored as a gridded observational dataset prepared by Livneh et al. (2013, 2015). This
          dataset is also used to calculate observed differences from averages for the period 1961-1990. Data are <a target="_blank"
                                                                                                                     href="https://catalog.data.gov/dataset/a-spatially-comprehensive-hydrologic-model-based-data-set-for-mexico-the-u-s-and-sout-1950-2013">available
          via Data.gov</a>.
        </p>
        <h3>Modeled History and Projections</h3>
        <p>
          Graphs in Climate Explorer show results generated by global climate models for the Coupled Model Intercomparison Project Phase 5 (CMIP5). For the contiguous
          United States, the climate model data were statistically downscaled using the Localized Constructed Analogs method (<a target="_blank"
                                                                                                                                 href="http://loca.ucsd.edu/">LOCA</a>;
          Pierce et al. 2014). For Alaska, data are from Scenarios Network for Alaska + Arctic Planning (SNAP). For Hawai’i and U.S. territories, data are from global
          climate model simulations: projections for individual islands were calculated as the average of the three grid points closest to the geographic center of
          each island..
        </p>
        <p>
          For the contiguous United States, Hawai’i, and U.S. territories, Climate Explorer shows projections for two potential futures, labeled Lower emissions and
          Higher emissions; they represent scenarios RCP 4.5 and RCP 8.5, respectively. Projections for Alaska are only for Higher emissions. <a target="_blank"
                                                                                                                                                 href="https://link.springer.com/article/10.1007/s10584-011-0148-z">
          Learn more about Representative Concentration Pathways (RCPs) »</a>
        </p>
        <p>
          To produce maps of observed temperatures for 1950 to 2010 for the contiguous United States, we calculated decadal averages for each month of the year using
          the Livneh observational dataset. For the 2020s to the 2090s, we used weighted averages of all model output to calculate average projected values.
        </p>
        <p>
          To produce maps of Percent Change in Precipitation for the contiguous United States, we first calculated observed monthly averages of Total Precipitation
          for the period 1961-1990 (we refer to these values as the 30-year climatology). For January, April, July, and October—the middle month of each season—we
          calculated 10-year averages of Total Precipitation for the 1950s through the 2000s, and subtracted the appropriate monthly climatology from them. We divided
          the difference by the climatology, and then multiplied the result by 100. For future decades, we used the weighted mean of the 32 models in the LOCA dataset
          to calculate decadal averages for each of the four representative months, and followed the procedure above to calculate percent change relative to the
          30-year climatology.
        </p>
        <p>
          For graphs and maps of Days over or under various thresholds, Heating Degree Days, Cooling Degree Days, Growing Degree Days, Modified Growing Degree Days,
          all data are presented as average annual values across a decade with the starting year indicated in the time slider.
        </p>
        <p>
          Days with High-tide Flooding were compiled from tide-gauge data based on locally identified thresholds related to impacts such as flooding of low-lying
          roads.
        </p>
        <h3>Stations</h3>
        <p>
          Temperature and precipitation observations and Climate Normals displayed in graphs for individual stations are from the <a target="_blank"
                                                                                                                                     href="https://www.ncdc.noaa.gov/data-access/land-based-station-data/land-based-datasets/global-historical-climatology-network-ghcn">Global
          Historical Climatology Network-Daily (GHCN-D)</a> database. These data are accessed via the NOAA Regional Climate Centers' Applied Climate Information
          System (ACIS) <a target="_blank" href="http://grid2.rcc-acis.org/GridData">data server</a>.
        </p>
        <p>
          Historical observations and future projections of coastal high tide flooding are from <a target="_blank"
                                                                                                   href="https://tidesandcurrents.noaa.gov/publications/techrpt86_PaP_of_HTFlooding.pdf">NOAA
          Technical Report NOS CO-OPS 086 - Patterns and Projections of High-tide Flooding</a>.
        </p>
        <h3>Credits & Acknowledgments</h3>
        <p>
          The U.S. Climate Resilience Toolkit and Climate Explorer are managed by <a target="_blank" href="https://cpo.noaa.gov/">NOAA's Climate Program Office</a>,
          and hosted by the <a target="_blank" href="https://nemac.unca.edu/">National Environmental Modeling and Analysis Center (NEMAC)</a> at the University of
          North Carolina Asheville.
        </p>
        <p>
          Development of the Climate Explorer was directed and overseen by an interagency team of federal climate model experts through the U.S. Global Change
          Research Program. Federal agencies represented in the effort are the Environmental Protection Agency (EPA), NASA, NOAA, and the U.S. Geological Survey.
        </p>
        <p>
          FernLeaf Interactive, the National Environmental Modeling and Analysis Center (NEMAC) at UNC-Asheville, and HabitatSeven have all contributed to design and
          programming of the Climate Explorer over its development.
        </p>
        <p>
          The LOCA climate projection data was processed for Climate Explorer through a collaborative effort supported by NCEI-Asheville, NEMAC, and the Northeast
          Regional Climate Center at Cornell University. Jay Alder (USGS) designed the color palettes and plotted data ranges for the interactive maps: he also
          developed future minus present difference maps for the 'precipitation' and 'number of dry days' variables.
        </p>
        <h3>
          Interagency Climate Projection Team Members
        </h3>
        <ul>
          <li>Fred Lipschultz, Chair, contractor to U.S. Global Change Research Program</li>
          <li>Jay Alder, U.S. Geological Survey</li>
          <li>Art DeGaetano, NOAA Northeast Regional Climate Center</li>
          <li>Forrest Melton, NASA Ames Research Center Cooperative for Research in Earth Science and Technology / California State University Monterey Bay</li>
          <li>Phil Morefield, U.S. Environmental Protection Agency</li>
          <li>Andrea Ray, NOAA Earth System Research Laboratory</li>
          <li>Liqiang Sun, NOAA National Centers for Environmental Information</li>
          <li>William Sweet, NOAA National Ocean Service</li>
        </ul>
        <h3>U.S. Climate Resilience Toolkit Program Management</h3>
        <ul>
          <li>David Herring, program manager, NOAA Climate Program Office</li>
          <li>LuAnn Dahlman, managing editor, contractor to NOAA Climate Program Office</li>
          <li>Ned Gardiner, public engagement manager, contractor to NOAA Climate Program Office</li>
          <li>Larry Belcher, programmer, contractor to NOAA Climate Program Office</li>
        </ul>
        <h3>Design, Programming & Development</h3>
        <ul>
          <li>Jeff Hicks, lead analyst, FernLeaf Interactive</li>
          <li>Josh Wilson, software engineer, FernLeaf Interactive</li>
          <li>Shayan Ghofrany, web application developer, FernLeaf Interactive</li>
          <li>David Michelson, software designer, NEMAC</li>
          <li>Bill Noon, application programmer, Cornell University</li>
          <li>Jamie Herring, president & lead designer, HabitatSeven</li>
          <li>Jordan Harding, chief technology officer, HabitatSeven</li>
          <li>Brendan Heberton, application architect, HabitatSeven</li>
          <li>Wesley Bowman, data developer, HabitatSeven</li>
          <li>Aires Almeida, chief creative officer, HabitatSeven</li>
          <li>Phil Evans, senior designer, HabitatSeven</li>
          <li>James Fox, director & product manager, NEMAC</li>
          <li>Ian Johnson, geospatial technician, NEMAC</li>
          <li>John Frimmel, principal software developer, NEMAC</li>
        </ul>
        <h3>Thanks also to reviewers:</h3>
        <ul>
          <li>Daniel Cayan, climate modeler, Scripps Institution of Oceanography</li>
          <li>Keith Dixon, climate modeler, NOAA Geophysical Fluid Dynamics Laboratory</li>
          <li>Katherine Hayhoe, climate modeler, Texas Tech University</li>
          <li>Ken Kunkel, climate modeler, NOAA National Centers for Environmental Information</li>
          <li>David Pierce, Programmer/Analyst, Scripps Institution of Oceanography</li>
          <li>Alaska Climate Adaptation and Science Center</li>
        </ul>
        <p>
        <hr>
        </p>
        <h2>References</h2>
        <ul>
          <li>
            Bieniek, P. A., Bhatt, U. S., Walsh, J. E., Rupp, T. S., Zhang, J., Krieger, J. R., and Lader, R. 2016: Dynamical downscaling of ERA-Interim temperature
            and precipitation for Alaska. Journal of Applied Meteorology and Climatology, 55(3), 635-654.<a
              href="https://journals.ametsoc.org/doi/abs/10.1175/JAMC-D-15-0153.1" target="_blank">https://journals.ametsoc.org/doi/abs/10.1175/JAMC-D-15-0153.1</a>
          </li>
          <li>
            Livneh, B., E. A. Rosenberg, C. Lin, B. Nijssen, V. Mishra, K. M. Andreadis, E. P. Maurer, and D. P. Lettenmaier (2013), A long-term hydrologically based
            dataset of land surface fluxes and states for the conterminous United States: Update and extensions, <em>J. Clim.</em>, 26(23), 9384–9392, doi <a
              target="_blank" href="http://dx.doi.org/10.1175/JCLI-D-12-00508.1">10.1175/JCLI-D-12-00508.1</a>.
          </li>
          <li>
            Livneh, B., Bohn, T.J., Pierce, D.W., Munoz-Arriola, F., Nijssen, B., Vose, R., Brekke, L. 2015. A spatially comprehensive, hydrometeorological data set
            for Mexico, the U.S., and Southern Canada 1950–2013. <em>Scientific Data</em> 2:150042. doi: <a target="_blank"
                                                                                                            href="http://dx.doi.org/10.1038/sdata.2015.42">10.1038/sdata.2015.42</a>.
          </li>
          <li>
            Pierce, D. W., D. R. Cayan, and B. L. Thrasher, 2014: Statistical Downscaling Using Localized Constructed Analogs (LOCA). <em>Journal of
            Hydrometeorology</em>, volume 15, 2558-2585. doi: <a target="_blank" href="https://doi.org/10.1175/JHM-D-14-0082.1">10.1175/JHM-D-14-0082.1</a>.
          </li>
          <li>
            Sanderson, B.M. and M.F. Wehner, 2017: Model weighting strategy. In: Climate Science Special Report: Fourth National Climate Assessment, Volume I
            [Wuebbles, D.J., D.W. Fahey, K.A. Hibbard, D.J. Dokken, B.C. Stewart, and T.K. Maycock (eds.)]. U.S. Global Change Research Program, Washington, DC, USA,
            pp. 436-442, doi: <a target="_blank" href="http://dx.doi.org/10.7930/J06T0JS3">10.7930/J06T0JS3</a>.
          </li>
          <li>
            Sweet, W.V.. G. Dusek, J. Obeysekera, and J. Marra (2018): <a target="_blank"
                                                                          href="https://tidesandcurrents.noaa.gov/publications/techrpt86_PaP_of_HTFlooding.pdf">NOAA
            Technical Report NOS CO-OPS 086 - Patterns and Projections of High-tide Flooding</a>.
          </li>
          <li>
            Sweet, W.V. and J. Park (2014): From the extreme and the mean: Acceleration and tipping point of coastal inundation from sea level rise. Earth Futures, 2
            579-600. doi: <a target="_blank" href="https://doi.org/10.1002/2014EF000272">10.1002/2014EF000272</a>.
          </li>
          <li>
            Taylor, K.E., R.J. Stouffer, and G.A. Meehl, 2012: An Overview of CMIP5 and the Experiment Design. <em>Bull. Amer. Meteor. Soc.,</em> 93, 485–498, doi: <a
              target="_blank" href="https://doi.org/10.1175/BAMS-D-11-00094.1">10.1175/BAMS-D-11-00094.1</a>.
          </li>
          <li>
            van Vuuren, D.P., Edmonds, J., Kainuma, M. et al. Climatic Change (2011) 109: 5. doi: <a target="_blank" href="https://doi.org/10.1007/s10584-011-0148-z">10.1007/s10584-011-0148-z</a>.
          </li>
        </ul>
        <hr>
        <h2>Contact</h2>
        <p>If you have questions or comments on the Climate Explorer, please direct them to <a target="_blank" href="mailto:noaa.toolkit@noaa.gov">noaa.toolkit@noaa.gov</a>.
        </p>
      </div>
    </div>
  </div>
  ${nav_footer(config)}
  ${footer(config)}
  <script src="https://unpkg.com/terraformer@1.0.8/terraformer.js" integrity="sha384-+M797Pj3WZVCwMmLbOxAoaWYcKJo8NSxItmI48ytcLNeAnfn1d/IckFn31jEqrzP"
          crossorigin="anonymous"></script>
  <script src="https://unpkg.com/terraformer-arcgis-parser@1.0.5/terraformer-arcgis-parser.js"
          integrity="sha384-duFUjKTSNoxEspdJNwr83CUgRxclf0ueKJB9DU/Vbit6bfWgzvZsHW6H1JLBBXhp" crossorigin="anonymous"></script>
  <script type="${config.env === 'dev' ? 'module' : 'text/javascript'}" src="/js/index.js"></script>
  </body>
  </html>
`
