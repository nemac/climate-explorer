import feedback from './feedack';

export default (config) => `

<!-- BEGIN NAV FOOTER TEMPLATE -->

<div class="container-fluid"> 

    <div class="d-flex mt-auto rounded-2 border border-top-1">
        <div class="col-3 p-2 mt-auto">
            <div class="d-flex flex-row justify-content-evenly"> 
                <div class="d-flex flex-column align-items-center rounded-2 p-1 footer-button" data-page="cards_home">
                    <i class="fas fa-th-large footer-icon"></i>
                    <span class="footer-icon-title">Cards Home</span>
                </div>
                <div class="d-flex flex-column align-items-center rounded-2 p-1 footer-button" data-page="next_steps"> 
                    <i class="fas fa-map-signs footer-icon"></i>
                    <span class="footer-icon-title">Take Action</span>
                </div>
            </div>
        </div>
        
        <div class="col-3 p-2">
            <div class="d-flex flex-row"> 
                <div class="d-block w-100"> 
                  
                  <div class="d-flex flex-row justify-content-center align-items-center"> 
                    <hr class="w-25">
                    <span class="me-2 ms-2" style="text-align: center">Region Based</span>
                    <hr class="w-25">
                  </div>              
                  <div class="d-flex flex-row justify-content-evenly"> 
                    <div class="d-flex flex-column align-items-center rounded-2 p-1 footer-button" data-page="climate_graphs">
                        <i class="fas fa-chart-line footer-icon"></i>
                        <span class="footer-icon-title">Climate Graphs</span>
                    </div>
                    <div class="d-flex flex-column align-items-center rounded-2 p-1 footer-button" data-page="climate_maps">
                        <i class="fas fa-map-marked-alt footer-icon"></i>
                        <span class="footer-icon-title">Climate Maps</span>
                    </div>
                  </div>
                  
                </div>
                
            </div>
        </div>
        
        <div class="col-6 p-2">
            <div class="d-flex flex-row"> 
                <div class="d-block w-100"> 
                  
                  <div class="d-flex flex-row justify-content-center align-items-center"> 
                    <hr class="w-25">
                    <span class="me-2 ms-2" style="text-align: center">Station Based</span>
                    <hr class="w-25">
                  </div>              
                  <div class="d-flex flex-row justify-content-evenly"> 
                    <div class="d-flex flex-column align-items-center rounded-2 p-1 footer-button" data-page="historical_weather_data">
                        <i class="fas fa-chart-area footer-icon"></i>
                        <span class="footer-icon-title">Historical Weather Data</span>
                    </div>
                    <div class="d-flex flex-column align-items-center rounded-2 p-1 footer-button" data-page="historical_thresholds">
                        <i class="fas fa-chart-bar footer-icon"></i>
                        <span class="footer-icon-title">Historical Thresholds</span>
                    </div>
                    <div class="d-flex flex-column align-items-center rounded-2 p-1 footer-button" data-page="high_tide_flooding">
                        <i class="fas fa-water footer-icon"></i>
                        <span class="footer-icon-title">High-Tide Flooding</span>
                    </div>
                  </div>
                  
                </div>
                
            </div>
        </div>
    </div>
     ${feedback(config)}
</div>


<!--<div id="nav-footer" class="d-flex-row padding-horizontal padding-top-half padding-bottom d-flex d-flex-center width-100">-->
<!--  <div class="flex-container-nowrap flex-justify padding-horizontal width-100">-->

<!--    &lt;!&ndash; home  &ndash;&gt;-->
<!--    <div class="d-flex-row nav-footer-row-1">-->
<!--      <div class="padding-horizontal d-flex-column first-column">-->
<!--        <div class="d-flex-center d-flex-row padding-horizontal nav-footer-area-title" >-->
<!--        </div>-->

<!--        <div tabindex="10000" id="home-nav-footer" class="padding-horizontal d-flex-bottom d-flex-row nav-footer-item" role="button" data-page="cards_home">-->
<!--          <div class="d-flex d-flex-bottom d-flex-column">-->
<!--            <div class="nav-footer-icon">-->
<!--              &lt;!&ndash; <i class="fas fa-compass"></i> &ndash;&gt;-->
<!--              <i class="fas fa-th-large icon-info-box"></i>-->
<!--            </div>-->
<!--            <div class="nav-footer-label">-->
<!--              Cards Home-->
<!--            </div>-->
<!--            <div class="nav-footer-label-smallscreen">-->
<!--              Cards Home-->
<!--            </div>-->
<!--            <div class="nav-footer-label-verysmallscreen">-->
<!--              Cards-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->

<!--        <div tabindex="10000" id="next-steps-nav-footer" class="padding-horizontal d-flex-bottom d-flex-row nav-footer-item" role="button" data-page="next_steps">-->
<!--          <div class="d-flex d-flex-bottom d-flex-column">-->
<!--            <div class="nav-footer-icon">-->
<!--              <i class="fas fa-map-signs icon-info-box"></i>-->
<!--            </div>-->
<!--            <div class="nav-footer-label">-->
<!--              Take action-->
<!--            </div>-->
<!--            <div class="nav-footer-label-smallscreen">-->
<!--              Take Action-->
<!--            </div>-->
<!--            <div class="nav-footer-label-verysmallscreen">-->
<!--              Action-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->

<!--      </div>-->
<!--    </div>-->

<!--    &lt;!&ndash; county based  &ndash;&gt;-->
<!--    <div class="d-flex-row nav-footer-row-2">-->
<!--      <div id="region-based" class="padding-horizontal d-flex-fill d-flex-column">-->
<!--        <div class="d-flex-center d-flex-row d-flex-fill padding-horizontal nav-footer-area-title" >-->
<!--          <span class="nav-footer-area-line"></span>-->
<!--          <span class="nav-footer-area-text">Region Based</span>-->
<!--          <span class="nav-footer-area-text-smallecreen">Region</span>-->
<!--          <span class="nav-footer-area-line"></span>-->
<!--        </div>-->

<!--        <div class="padding-horizontal d-flex-fill d-flex-row nav-footer-items">-->

<!--          <div tabindex="10002" id="climate-graphs-nav-footer" class="d-flex d-flex-bottom padding-horizontal d-flex-column nav-footer-item" role="button" data-page="climate_graphs">-->
<!--            <div class="nav-footer-icon">-->
<!--              <i class="fas fa-chart-line"></i>-->
<!--            </div>-->
<!--            <div class="nav-footer-label">-->
<!--              Climate Graphs-->
<!--            </div>-->
<!--            <div class="nav-footer-label-smallscreen">-->
<!--              Climate Graphs-->
<!--            </div>-->
<!--            <div class="nav-footer-label-verysmallscreen">-->
<!--              Charts-->
<!--            </div>-->
<!--          </div>-->

<!--          <div tabindex="10003" id="climate-maps-nav-footer" class="d-flex d-flex-bottom padding-horizontal d-flex-column nav-footer-item" role="button" data-page="climate_maps">-->
<!--            <div class="nav-footer-icon">-->
<!--              <i class="fas fa-map-marked-alt"></i>-->
<!--            </div>-->
<!--            <div class="nav-footer-label">-->
<!--              Climate Maps-->
<!--            </div>-->
<!--            <div class="nav-footer-label-smallscreen">-->
<!--              Climate Maps-->
<!--            </div>-->
<!--            <div class="nav-footer-label-verysmallscreen">-->
<!--              Maps-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->




<!--      &lt;!&ndash; Station based  &ndash;&gt;-->
<!--      <div id="station-based" class="padding-horizontal d-flex-fill d-flex-column">-->
<!--        <div class="d-flex-center d-flex-row d-flex-fill padding-horizontal nav-footer-area-title" >-->
<!--          <span class="nav-footer-area-line"></span>-->
<!--          <span class="nav-footer-area-text">Station Based</span>-->
<!--          <span class="nav-footer-area-text-smallecreen">Station</span>-->
<!--          <span class="nav-footer-area-line"></span>-->
<!--        </div>-->

<!--        <div id="more-wrapper-nav-footer" class="padding-horizontal d-flex-row nav-footer-items">-->
<!--          <div tabindex="10004" id="more-nav-footer" class="d-flex d-flex-bottom padding-horizontal d-flex-column nav-footer-item" role="button">-->
<!--            <div class="nav-footer-icon">-->
<!--              <i class="fas fa-ellipsis-h"></i>-->
<!--            </div>-->
<!--            <div class="nav-footer-label">-->
<!--              More-->
<!--            </div>-->
<!--            <div class="nav-footer-label-smallscreen">-->
<!--              More-->
<!--            </div>-->
<!--            <div class="nav-footer-label-verysmallscreen">-->
<!--              More-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->

<!--        <div id="expanded-wrapper-nav-footer" class="padding-horizontal d-flex-row nav-footer-items">-->

<!--          <div tabindex="10005" id="historical-weather-data-nav-footer" class="d-flex d-flex-bottom padding-horizontal d-flex-column nav-footer-item" role="button" data-page="historical_weather_data">-->
<!--            <div class="nav-footer-icon">-->
<!--              <i class="fas fa-chart-area"></i>-->
<!--            </div>-->
<!--            <div class="nav-footer-label">-->
<!--              Historical Weather Data-->
<!--            </div>-->
<!--            <div class="nav-footer-label-smallscreen">-->
<!--              Historical Data-->
<!--            </div>-->
<!--            <div class="nav-footer-label-verysmallscreen">-->
<!--              Data-->
<!--            </div>-->
<!--          </div>-->

<!--          <div tabindex="10006" id="historical-thresholds-nav-footer" class="d-flex d-flex-center d-flex-bottom padding-horizontal d-flex-column nav-footer-item" role="button" data-page="historical_thresholds">-->
<!--            <div class="nav-footer-icon">-->
<!--              <i class="fas fa-chart-bar"></i>-->
<!--            </div>-->
<!--            <div class="nav-footer-label">-->
<!--              Historical Thresholds-->
<!--            </div>-->
<!--            <div class="nav-footer-label-smallscreen">-->
<!--              Historical Thresholds-->
<!--            </div>-->
<!--            <div class="nav-footer-label-verysmallscreen">-->
<!--              Thresholds-->
<!--            </div>-->
<!--          </div>-->

<!--          <div tabindex="10007" id="high-tide-flooding-nav-footer" class="d-flex d-flex-bottom padding-horizontal d-flex-column nav-footer-item" role="button" data-page="high_tide_flooding">-->
<!--            <div class="nav-footer-icon">-->
<!--              <i class="fas fa-water"></i>-->
<!--            </div>-->
<!--            <div class="nav-footer-label">-->
<!--              High-Tide Flooding-->
<!--            </div>-->
<!--            <div class="nav-footer-label-smallscreen">-->
<!--              High-tide-->
<!--            </div>-->
<!--            <div class="nav-footer-label-verysmallscreen">-->
<!--              Tide-->
<!--            </div>-->
<!--          </div>-->
<!--          </div>-->
<!--        </div>-->

<!--      </div>-->

<!--      &lt;!&ndash; less  &ndash;&gt;-->
<!--      <div id="less-row-1" class="d-flex-row nav-footer-row-1">-->
<!--        <div class="padding-horizontal d-flex-column">-->
<!--          <div class="d-flex-center d-flex-row padding-horizontal nav-footer-area-title" >-->
<!--          </div>-->

<!--          <div tabindex="10008" id="less-wrapper-nav-footer" class="padding-horizontal d-flex-bottom d-flex-row nav-footer-item" role="button" data-page="cards_home">-->
<!--            <div class="d-flex d-flex-bottom d-flex-column">-->
<!--              <div class="nav-footer-icon">-->
<!--                <i class="fas fa-ellipsis-h"></i>-->
<!--              </div>-->
<!--              <div class="nav-footer-label">-->
<!--                Less-->
<!--              </div>-->
<!--              <div class="nav-footer-label-smallscreen">-->
<!--                Less-->
<!--              </div>-->
<!--              <div class="nav-footer-label-verysmallscreen">-->
<!--                Less-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->

<!--        </div>-->
<!--      </div>-->

<!--    </div>-->
     
<!--  </div>-->
<!--</div>-->


<!-- END NAV FOOTER TEMPLATE -->
`
