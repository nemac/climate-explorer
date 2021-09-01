export default (config) => `

    <!-- Modal -->
    <div class="modal fade" id="aboutModal" tabindex="-1" aria-labelledby="aboutModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title" id="aboutModalLabel">HOW TO READ</h3>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
          
              <div class="how-to-read-conus">
                
                <div class="mb-3"> 
                    <h2>TIPS FOR UNDERSTANDING THE CLIMATE GRAPHS</h2>
                </div>
              
                <div class="row"> 
                      
                      <div class="col-sm-12 col-md-3">
                      
                          <div class="d-flex justify-content-center border border-1 rounded-3 chart-explainer-fake-buttons mb-2 pt-1 pb-1"> 
                              <div class="inner-histobs ps-3 pe-3 pt-2 pb-2 me-2 rounded-3"></div>
                              Observations
                          </div>
                      
                          <div class="mb-2 d-flex justify-content-center"> 
                              <img alt="historical observations example graph" src="/img/about-local-climate-graph-histobs.png">
                          </div>
                          
                          <div class="mb-2"> 
                              <p>
                              Click the Observations legend button just below the graph to toggle observations on and off in the graph. For annual variables, dark gray bars show observed averages for each year from 1950-2013.
                              </p>
                          </div>
                          
                          <div class="mb-2">
                              <p>
                              The horizontal line from which the bars extend up or down is the average from 1961-1990.Years when bars extend above the line were higher than the long-term average; years with bars that extend below the line were lower than average. 
                              </p> 
                          </div>
                          
                          <div class="mb-2"> 
                              <p>
                              For monthly variables, observed averages for each month are shown by a black line.
                              </p>
                          </div>
                      </div>                
                  
                      <div class="col-sm-12 col-md-3">
                          
                              <div class="d-flex justify-content-center border border-1 rounded-3 chart-explainer-fake-buttons mb-2 pt-1 pb-1"> 
                                  <div class="inner-histmod ps-3 pe-3 pt-2 pb-2 me-2 rounded-3"></div>
                                  Modeled History
                              </div>
                          
                              <div class="mb-2 d-flex justify-content-center"> 
                                  <img alt="historical example graph" src="/img/about-local-climate-graph-histmod.png">
                              </div>
                              
                              <div class="mb-2"> 
                                  <p>
                                  The gray band shows the range of values modeled (hindcast) for 1950–2005. The top edge of the band represents the maximum value modeled at each time step; the bottom edge of the band represents the minimum. All other model results are within the shaded portion.
                                  </p>
                              </div>
                              
                          </div>                
                      
                      <div class="col-sm-12 col-md-3">
                          
                          <div class="d-flex justify-content-center border border-1 rounded-3 chart-explainer-fake-buttons mb-2 pt-1 pb-1"> 
                              <div class="inner-lower-emissions ps-3 pe-3 pt-2 pb-2 me-2 rounded-3"></div>
                              Lower Emissions
                          </div>
                      
                          <div class="mb-2 d-flex justify-content-center"> 
                              <img alt="lower emissions example graph" src="/img/about-local-climate-graph-lowerem.png">
                          </div>
                          
                          <div class="mb-2"> 
                              <p>
                              The blue band shows projections for 2006–2100 based on a future in which humans stop increasing global emissions of heat-trapping gases by 2040 and then dramatically reduce them through 2100.
                              </p>
                          </div>
                          
                          <div class="mb-2"> 
                              <p>
                              The top edge of the band represents the maximum value modeled at each time step; the bottom edge of the band represents the minimum. All other model results are within the shaded band. The darker blue line shows the weighted mean of projections for lower emissions.
                              </p>
                          </div>
                          
                      </div>
                      
                      <div class="col-sm-12 col-md-3">
                          
                          <div class="d-flex justify-content-center mb-2 border border-1 rounded-3 chart-explainer-fake-buttons pt-1 pb-1"> 
                              <div class="inner-higher-emissions ps-3 pe-3 pt-2 pb-2 me-2 rounded-3"></div>
                              Higher Emissions
                          </div>
                      
                          <div class="mb-2 d-flex justify-content-center"> 
                              <img alt="higher emissions example graph" src="/img/about-local-climate-graph-higherem.png">
                          </div>
                          
                          <div class="mb-2"> 
                              <p>
                              The red band shows projections for 2006–2100 based on a future in which global emissions of heat-trapping gases continue increasing through 2100. The top edge of the band represents the maximum value modeled at each time step; the bottom edge of the band represents the minimum. All other model results are within the shaded band. The red line shows the weighted mean of all projections for higher emissions.
                              </p>
                          </div>
                             
                      </div>     
           
                        
                </div> 
                
                <hr>
                
                <div class="mb-3"> 
                    <h2>Why do the graphs show wide bands rather than single lines?</h2>
                </div>
                
                <div class="row d-flex justify-content-center"> 
                    <div class="col-sm-12 col-md-4">
                        <img alt="example graphs" src="/img/graph-explain.png" class="img-fluid"/>
                    </div>
                    <div class="col-sm-12 col-md-8">
                        <p class="mb-2">On the left, each single red or blue line shows projections from a single global climate model for one of two possible futures. Lines in shades of red are projections for higher emissions and lines in shades of blue are for lower emissions. On the right, the example from  Climate Explorer uses single bands of red and blue shading to show the full range of model results for the same two possible futures.
                        </p>
                      
                        <p class="mb-2">
                        In Climate Explorer graphs, the top of each color band represents the highest projection among all the models at each time step for each scenario; the bottom of the band represents the lowest projection. The dark median line within each band highlights the trend for each scenario, but it is not a prediction. Future observations are expected to vary across the full range of projections, just as observed values vary from the modeled history.
                        </p>
                    </div>
                
                </div>
                
              </div>
            
              <div class="how-to-read-ak">
                
                <div class="mb-3"> 
                    <h2>TIPS FOR UNDERSTANDING THE CLIMATE GRAPHS</h2>
                </div>
              
                <div class="row"> 
                      
                      <div class="col-sm-12 col-md-6">
                          
                              <div class="d-flex justify-content-center border border-1 rounded-3 chart-explainer-fake-buttons mb-2 pt-1 pb-1"> 
                                  <div class="inner-histmod ps-3 pe-3 pt-2 pb-2 me-2 rounded-3"></div>
                                  Modeled History
                              </div>
                          
                              <div class="mb-2 d-flex justify-content-center"> 
                                  <img alt="historical alaska example graph" src="/img/about-local-climate-graph-ak-modeled.png">
                              </div>
                              
                              <div class="mb-2"> 
                                  <p>
                                  The gray band (Modeled History) shows hindcast annual values for 1970–2005, smoothed by a 10-year rolling average. Edges of the band represent hindcast values; shading shows the difference between the two models.
                                  </p>
                              </div>
                              
                          </div>                
                      
                      <div class="col-sm-12 col-md-6">
                          
                          <div class="d-flex justify-content-center mb-2 border border-1 rounded-3 chart-explainer-fake-buttons pt-1 pb-1"> 
                              <div class="inner-higher-emissions ps-3 pe-3 pt-2 pb-2 me-2 rounded-3"></div>
                              Higher Emissions
                          </div>
                      
                          <div class="mb-2 d-flex justify-content-center"> 
                              <img alt="higher emissions alaska example graph" src="/img/about-local-climate-graph-ak-high-emission.png">
                          </div>
                          
                          <div class="mb-2"> 
                              <p>
                              Projections for 2006–2099 are based on a higher emissions future, one in which human emissions of carbon pollution continue increasing through 2100 (also known as RCP 8.5). Annual values from the two climate models have been smoothed by a 10-year rolling average. Edges of the band represent projected values; shading shows the difference between the two models.
                              </p>
                          </div>
                             
                      </div>     
                            
                </div> 
                     
              </div>
            
              <div class="how-to-read-island">
                  
                  <div class="mb-3"> 
                      <h2>TIPS FOR UNDERSTANDING THE CLIMATE GRAPHS</h2>
                  </div>
                
                  <div class="row"> 
                        
                        <div class="col-sm-12 col-md-4">
                            
                                <div class="d-flex justify-content-center border border-1 rounded-3 chart-explainer-fake-buttons mb-2 pt-1 pb-1"> 
                                    <div class="inner-histmod ps-3 pe-3 pt-2 pb-2 me-2 rounded-3"></div>
                                    Modeled History
                                </div>
                            
                                <div class="mb-2 d-flex justify-content-center"> 
                                    <img alt="historical example graph" src="/img/about-local-climate-graph-histmod.png">
                                </div>
                                
                                <div class="mb-2"> 
                                    <p>
                                    The gray band shows the range of values modeled (hindcast) for 1950–2005. The top edge of the band represents the maximum value modeled at each time step; the bottom edge of the band represents the minimum. All other model results are within the shaded portion.
                                    </p>
                                </div>
                                
                            </div>                
                        
                        <div class="col-sm-12 col-md-4">
                            
                            <div class="d-flex justify-content-center border border-1 rounded-3 chart-explainer-fake-buttons mb-2 pt-1 pb-1"> 
                                <div class="inner-lower-emissions ps-3 pe-3 pt-2 pb-2 me-2 rounded-3"></div>
                                Lower Emissions
                            </div>
                        
                            <div class="mb-2 d-flex justify-content-center"> 
                                <img alt="lower emissions example graph" src="/img/about-local-climate-graph-lowerem.png">
                            </div>
                            
                            <div class="mb-2"> 
                                <p>
                                The blue band shows projections for 2006–2100 based on a future in which humans stop increasing global emissions of heat-trapping gases by 2040 and then dramatically reduce them through 2100.
                                </p>
                            </div>
                            
                            <div class="mb-2"> 
                                <p>
                                The top edge of the band represents the maximum value modeled at each time step; the bottom edge of the band represents the minimum. All other model results are within the shaded band. The darker blue line shows the weighted mean of projections for lower emissions.
                                </p>
                            </div>
                            
                        </div>
                        
                        <div class="col-sm-12 col-md-4">
                            
                            <div class="d-flex justify-content-center mb-2 border border-1 rounded-3 chart-explainer-fake-buttons pt-1 pb-1"> 
                                <div class="inner-higher-emissions ps-3 pe-3 pt-2 pb-2 me-2 rounded-3"></div>
                                Higher Emissions
                            </div>
                        
                            <div class="mb-2 d-flex justify-content-center"> 
                                <img alt="higher emissions example graph" src="/img/about-local-climate-graph-higherem.png">
                            </div>
                            
                            <div class="mb-2"> 
                                <p>
                                The red band shows projections for 2006–2100 based on a future in which global emissions of heat-trapping gases continue increasing through 2100. The top edge of the band represents the maximum value modeled at each time step; the bottom edge of the band represents the minimum. All other model results are within the shaded band. The red line shows the weighted mean of all projections for higher emissions.
                                </p>
                            </div>
                               
                        </div>     
             
                          
                  </div> 
                  
                  <hr>
                  
                  <div class="mb-3"> 
                      <h2 class="mb-2">ABOUT ISLAND PROJECTIONS</h2>
                      <p>
                      Modeled history (hindcasts) and future projections for Hawai'i and U.S. territories come from CMIP5 global climate model simulations. Raw values from the models have not been downscaled or bias-corrected. Values provided for specific islands and island groups are averages of the three model grid points closest to the geographic center of each territory.
                      </p>
                  </div>
                  
                  <hr>
                  
                  <div class="mb-3"> 
                      <h2>Why do the graphs show wide bands rather than single lines?</h2>
                  </div>
                  
                  <div class="row d-flex justify-content-center"> 
                      <div class="col-sm-12 col-md-4">
                          <img alt="example graphs" src="/img/graph-explain.png" class="img-fluid"/>
                      </div>
                      <div class="col-sm-12 col-md-8">
                          <p class="mb-2">On the left, each single red or blue line shows projections from a single global climate model for one of two possible futures. Lines in shades of red are projections for higher emissions and lines in shades of blue are for lower emissions. On the right, the example from  Climate Explorer uses single bands of red and blue shading to show the full range of model results for the same two possible futures.
                          </p>
                        
                          <p class="mb-2">
                          In Climate Explorer graphs, the top of each color band represents the highest projection among all the models at each time step for each scenario; the bottom of the band represents the lowest projection. The dark median line within each band highlights the trend for each scenario, but it is not a prediction. Future observations are expected to vary across the full range of projections, just as observed values vary from the modeled history.
                          </p>
                      </div>
                  
                  </div>
                  
                </div>
          
          </div>
        </div>
      </div>
    </div>
    <!-- End Modal-->

`
