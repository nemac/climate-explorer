export default (config) => `
<div id="more-info-description" class="rounded-description-box d-none" >
    
    <div class="more-caret d-flex-center">
    <span class="fas fa-angle-down"></span>
  </div>

    <div class="padding-horizontal padding-top padding-bottom-half how-to-read-conus">
        
        <div class="padding-default">
            <h2>TIPS FOR UNDERSTANDING THE CLIMATE GRAPHS</h2>
        </div>
        
        <div class="padding-horizontal padding-top padding-bottom-half d-flex-center" >
            <div class="about-tool-row d-flex-row padding-horizontal width-100 d-flex-center">
        
              <div class="d-flex-row d-flex-center width-25">
                <div  role="button" class="btn-selector btn-histobs description  d-flex-center width-100" >
                  Observations
                  <div class="inner-histobs"></div>
                </div>
                <div class="btn-chart-text d-flex-center width-100" >
                  <img alt="historical observations example graph" src="/img/about-local-climate-graph-histobs.png" class="img-btn-chart width-60 height-60"/>
                </div>
                <div class="btn-chart-text d-flex-center width-100" >
                    Click the Observations legend button just below the graph to toggle observations on and off in the graph. For annual variables, dark gray bars show observed averages for each year from 1950-2013. 
                    <br/><br/>
                  The horizontal line from which the bars extend up or down is the average from 1961-1990.Years when bars extend above the line were higher than the long-term average; years with bars that extend below the line were lower than average. 
                  <br /><br />
                  For monthly variables, observed averages for each month are shown by a black line.
                </div>
              </div>
        
              <div class="d-flex-row d-flex-center width-25">
                <div  role="button" class="btn-selector btn-histmod description d-flex-center width-100" >
                  Modeled History
                  <div class="inner-histmod"></div>
                </div>
                <div class="btn-chart-text d-flex-center width-100" >
                  <img alt="historical example graph" src="/img/about-local-climate-graph-histmod.png" class="img-btn-chart width-60 height-60"/>
                </div>
                <div class="btn-chart-text d-flex-center width-100" >
                  The gray band shows the range of values modeled (hindcast) for 1950–2005. The top edge of the band represents the maximum value modeled at each time step; the bottom edge of the band represents the minimum. All other model results are within the shaded portion.
                </div>
              </div>
        
              <div class="d-flex-row d-flex-center width-25">
                <div  role="button" class="btn-selector btn-lower-emissions description d-flex-center width-100">
                  Lower Emissions
                  <div class="inner-lower-emissions"></div>
                </div>
                <div class="btn-chart-text d-flex-center width-100" >
                  <img alt="lower emissions example graph" src="/img/about-local-climate-graph-lowerem.png" class="img-btn-chart width-60 height-60"/>
                </div>
                <div class="btn-chart-text d-flex-center width-100" >
                  The blue band shows projections for 2006–2100 based on a future in which humans stop increasing global emissions of heat-trapping gases by 2040 and then dramatically reduce them through 2100. <br/><br/>The top edge of the band represents the maximum value modeled at each time step; the bottom edge of the band represents the minimum. All other model results are within the shaded band. The darker blue line shows the weighted mean of projections for lower emissions.
                </div>
              </div>
        
              <div class="d-flex-row d-flex-center width-25">
                <div role="button" class="btn-selector btn-higher-emissions description d-flex-center width-100" >
                  Higher Emissions
                  <div class="inner-higher-emissions"></div>
                </div>
                <div class="btn-chart-text d-flex-center width-100" >
                  <img alt="higher emissions example graph" src="/img/about-local-climate-graph-higherem.png" class="img-btn-chart width-60 height-60"/>
                </div>
                <div class="btn-chart-text d-flex-center width-100" >
                  The red band shows projections for 2006–2100 based on a future in which global emissions of heat-trapping gases continue increasing through 2100. The top edge of the band represents the maximum value modeled at each time step; the bottom edge of the band represents the minimum. All other model results are within the shaded band. The red line shows the weighted mean of all projections for higher emissions.
                </div>
              </div>
            </div>
        </div>

        <div class="explainer-spacer padding-horizontal padding-bottom-half d-flex-center" >
            <div class="about-tool-row d-flex-row padding-horizontal width-100 d-flex-center">
              <div  class="d-flex-row d-flex-start width-100">
                <h2>Why do the graphs show wide bands rather than single lines?</h2>
              </div>
              <div class="d-flex-row d-flex-start width-100">
                <div class="chart-info-img btn-chart-text d-flex-start height-50 width-25" >
                  <img alt="example graphs" src="/img/graph-explain.png" class="img-btn-chart width-60 height-60"/>
                </div>
                <div class="chart-info-text btn-chart-text d-flex-center d-flex-column width-70" >
                  <p class="padding-bottom">On the left, each single red or blue line shows projections from a single global climate model for one of two possible futures. Lines in shades of red are projections for higher emissions and lines in shades of blue are for lower emissions. On the right, the example from  Climate Explorer uses single bands of red and blue shading to show the full range of model results for the same two possible futures.</p>
                  <p class="padding-bottom">In Climate Explorer graphs, the top of each color band represents the highest projection among all the models at each time step for each scenario; the bottom of the band represents the lowest projection. The dark median line within each band highlights the trend for each scenario, but it is not a prediction. Future observations are expected to vary across the full range of projections, just as observed values vary from the modeled history.</p>
                </div>
              </div>
            </div>
        </div>
    
    </div>
  
    <div class="explainer-spacer padding-horizontal padding-bottom-half how-to-read-ak" >
        
        <div class="padding-default">
            <h2>TIPS FOR UNDERSTANDING THE CLIMATE GRAPHS</h2>
        </div>
        
        <div class="explainer-spacer padding-horizontal padding-bottom-half d-flex-center" >
        
            <div class="about-tool-row d-flex-row padding-horizontal width-100 d-flex-center">
      
              <div class="d-flex-row d-flex-start width-100">
                <div class="d-block">
                    <div  role="button" class="btn-selector btn-histmod description selected d-flex-center width-100" >
                      Modeled History
                      <div class="inner-histmod"></div>
                    </div>
                    <div class="chart-info-img btn-chart-text d-flex-start" >
                        <img src="/img/about-local-climate-graph-ak-modeled.png" class="img-btn-chart width-75"/>
                    </div>
                </div>

                <div class="chart-info-text btn-chart-text d-flex-center width-70" >
                  The gray band (Modeled History) shows hindcast annual values for 1970–2005, smoothed by a 10-year rolling average. Edges of the band represent hindcast values; shading shows the difference between the two models.
                </div>
              </div>
            </div>
        
            <div class="about-tool-row d-flex-row padding-horizontal width-100 d-flex-center">

              <div  class="d-flex-row d-flex-start width-100">
                <div class="d-block">
                    <div role="button" class="btn-selector btn-higher-emissions description selected d-flex-center width-100" >
                      Higher Emissions
                      <div class="inner-higher-emissions"></div>
                    </div>
                    <div class="chart-info-img btn-chart-text d-flex-start" >
                        <img src="/img/about-local-climate-graph-ak-high-emission.png" class="img-btn-chart width-75"/>
                    </div>
                </div>

                <div class="chart-info-text btn-chart-text d-flex-center width-70" >
                  Projections for 2006–2099 are based on a higher emissions future, one in which human emissions of carbon pollution continue increasing through 2100 (also known as RCP 8.5). Annual values from the two climate models have been smoothed by a 10-year rolling average. Edges of the band represent projected values; shading shows the difference between the two models.
                </div>
              </div>
            </div>
        
        </div>
        
        <div class="explainer-spacer padding-horizontal padding-bottom-half">NOTE: As the LOCA projections dataset used for the lower 48 does not include Alaska, the Climate Explorer team and climate scientists at the Alaska Climate Adaptation and Science  Center selected SNAP Data as the data source for Alaska.
        </div>
    </div>

    <div class="padding-horizontal padding-top padding-bottom-half how-to-read-island">
            
            <div class="padding-default">
                <h2>TIPS FOR UNDERSTANDING THE CLIMATE GRAPHS</h2>
            </div>
            
            <div class="padding-horizontal padding-top padding-bottom-half d-flex-center" >
                <div class="about-tool-row d-flex-row padding-horizontal width-100 d-flex-center">
            
                  <div class="d-flex-row d-flex-center width-25">
                    <div  role="button" class="btn-selector btn-histmod description selected d-flex-center width-100" >
                      Modeled History
                      <div class="inner-histmod"></div>
                    </div>
                    <div class="btn-chart-text d-flex-center width-100" >
                      <img src="/img/about-local-climate-graph-histmod.png" class="img-btn-chart width-60 height-60"/>
                    </div>
                    <div class="btn-chart-text d-flex-center width-100" >
                      The gray band shows the range of values modeled (hindcast) for 1950–2005. The top edge of the band represents the maximum value modeled at each time step; the bottom edge of the band represents the minimum. All other model results are within the shaded portion.
                    </div>
                  </div>
            
                  <div class="d-flex-row d-flex-center width-25">
                    <div  role="button" class="btn-selector btn-lower-emissions description selected d-flex-center width-100">
                      Lower Emissions
                      <div class="inner-lower-emissions"></div>
                    </div>
                    <div class="btn-chart-text d-flex-center width-100" >
                      <img src="/img/about-local-climate-graph-lowerem.png" class="img-btn-chart width-60 height-60"/>
                    </div>
                    <div class="btn-chart-text d-flex-center width-100" >
                     The blue band shows projections for 2006–2100 based on a future in which humans stop increasing global emissions of heat-trapping gases by 2040 and then dramatically reduce them through 2100. <br/><br/>The top edge of the band represents the maximum value modeled at each time step; the bottom edge of the band represents the minimum. All other model results are within the shaded band. The darker blue line shows the weighted mean of projections for lower emissions.
                    </div>
                  </div>
            
                  <div class="d-flex-row d-flex-center width-25">
                    <div role="button" class="btn-selector btn-higher-emissions description selected d-flex-center width-100" >
                      Higher Emissions
                      <div class="inner-higher-emissions"></div>
                    </div>
                    <div class="btn-chart-text d-flex-center width-100" >
                      <img src="/img/about-local-climate-graph-higherem.png" class="img-btn-chart width-60 height-60"/>
                    </div>
                    <div class="btn-chart-text d-flex-center width-100" >
                      The red band shows projections for 2006–2100 based on a future in which global emissions of heat-trapping gases continue increasing through 2100. The top edge of the band represents the maximum value modeled at each time step; the bottom edge of the band represents the minimum. All other model results are within the shaded band. The red line shows the weighted mean of all projections for higher emissions.
                    </div>
                  </div>
                </div>
            </div>
    
            <div class="explainer-spacer padding-horizontal padding-bottom-half d-flex-center" >
                <div class="about-tool-row d-flex-row padding-horizontal width-100 d-flex-center">
                  <div class="d-flex-row d-flex-start width-100">
                      <h2>ABOUT ISLAND PROJECTIONS</h2>
                    </div>
                    <div class="d-flex-row d-flex-start width-100">
                      <div class="chart-info-text btn-chart-text d-flex-center d-flex-column width-70" >
                        <p class="padding-bottom">
                        Modeled history (hindcasts) and future projections for Hawai'i and U.S. territories come from CMIP5 global climate model simulations. Raw values from the models have not been downscaled or bias-corrected. Values provided for specific islands and island groups are averages of the three model grid points closest to the geographic center of each territory.
                        </p>
                      </div>
                    </div>
                  </div>
              </div>
    
            <div class="explainer-spacer padding-horizontal padding-bottom-half d-flex-center" >
                <div class="about-tool-row d-flex-row padding-horizontal width-100 d-flex-center">
                  <div class="d-flex-row d-flex-start width-100">
                    <h2>Why do the graphs show wide bands rather than single lines?</h2>
                  </div>
                  <div class="d-flex-row d-flex-start width-100">
                    <div class="chart-info-img btn-chart-text d-flex-start height-50 width-25" >
                      <img src="/img/graph-explain.png" class="img-btn-chart width-60 height-60"/>
                    </div>
                    <div class="chart-info-text btn-chart-text d-flex-center d-flex-column width-70" >
                      <p class="padding-bottom">On the left, each single red or blue line shows projections from a single global climate model for one of two possible futures. Lines in shades of red are projections for higher emissions and lines in shades of blue are for lower emissions. On the right, the example from  Climate Explorer uses single bands of red and blue shading to show the full range of model results for the same two possible futures.</p>
                      <p class="padding-bottom">In Climate Explorer graphs, the top of each color band represents the highest projection among all the models at each time step for each scenario; the bottom of the band represents the lowest projection. The dark median line within each band highlights the trend for each scenario, but it is not a prediction. Future observations are expected to vary across the full range of projections, just as observed values vary from the modeled history.</p>
                    </div>
                  </div>
                </div>
            </div>
        
        </div>
      

</div>
`
