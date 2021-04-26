import feedback from './feedack';

export default (config) => `

<!-- BEGIN NAV FOOTER TEMPLATE -->

<div id="nav-footer" class="d-flex-row padding-horizontal padding-top-half padding-bottom d-flex d-flex-center width-100">
  <div class="flex-container-nowrap flex-justify padding-horizontal width-100">

    <!-- home  -->
    <div class="d-flex-row nav-footer-row-1">
      <div class="padding-horizontal d-flex-column first-column">
        <div class="d-flex-center d-flex-row padding-horizontal nav-footer-area-title" >
        </div>

        <div tabindex="10000" id="home-nav-footer" class="padding-horizontal d-flex-bottom d-flex-row nav-footer-item" role="button" data-page="cards-home">
          <div class="d-flex d-flex-bottom d-flex-column">
            <div class="nav-footer-icon">
              <!-- <i class="fas fa-compass"></i> -->
              <i class="fas fa-th-large icon-info-box"></i>
            </div>
            <div class="nav-footer-label">
              Cards Home
            </div>
            <div class="nav-footer-label-smallscreen">
              Cards Home
            </div>
            <div class="nav-footer-label-verysmallscreen">
              Cards
            </div>
          </div>
        </div>

        <div tabindex="10000" id="next-steps-nav-footer" class="padding-horizontal d-flex-bottom d-flex-row nav-footer-item" role="button" data-page="next-steps">
          <div class="d-flex d-flex-bottom d-flex-column">
            <div class="nav-footer-icon">
              <i class="fas fa-map-signs icon-info-box"></i>
            </div>
            <div class="nav-footer-label">
              Take action
            </div>
            <div class="nav-footer-label-smallscreen">
              Take Action
            </div>
            <div class="nav-footer-label-verysmallscreen">
              Action
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- county based  -->
    <div class="d-flex-row nav-footer-row-2">
      <div id="region-based" class="padding-horizontal d-flex-fill d-flex-column">
        <div class="d-flex-center d-flex-row d-flex-fill padding-horizontal nav-footer-area-title" >
          <span class="nav-footer-area-line"></span>
          <span class="nav-footer-area-text">Region Based</span>
          <span class="nav-footer-area-text-smallecreen">Region</span>
          <span class="nav-footer-area-line"></span>
        </div>

        <div class="padding-horizontal d-flex-fill d-flex-row nav-footer-items">

          <div tabindex="10002" id="local-climate-charts-nav-footer" class="d-flex d-flex-bottom padding-horizontal d-flex-column nav-footer-item" role="button" data-page="local-climate-charts">
            <div class="nav-footer-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="nav-footer-label">
              Climate Charts
            </div>
            <div class="nav-footer-label-smallscreen">
              Climate Charts
            </div>
            <div class="nav-footer-label-verysmallscreen">
              Charts
            </div>
          </div>

          <div tabindex="10003" id="local-climate-maps-nav-footer" class="d-flex d-flex-bottom padding-horizontal d-flex-column nav-footer-item" role="button" data-page="local-climate-maps">
            <div class="nav-footer-icon">
              <i class="fas fa-map-marked-alt"></i>
            </div>
            <div class="nav-footer-label">
              Climate Maps
            </div>
            <div class="nav-footer-label-smallscreen">
              Climate Maps
            </div>
            <div class="nav-footer-label-verysmallscreen">
              Maps
            </div>
          </div>
        </div>
      </div>




      <!-- Station based  -->
      <div id="station-based" class="padding-horizontal d-flex-fill d-flex-column">
        <div class="d-flex-center d-flex-row d-flex-fill padding-horizontal nav-footer-area-title" >
          <span class="nav-footer-area-line"></span>
          <span class="nav-footer-area-text">Station Based</span>
          <span class="nav-footer-area-text-smallecreen">Station</span>
          <span class="nav-footer-area-line"></span>
        </div>

        <div id="more-wrapper-nav-footer" class="padding-horizontal d-flex-row nav-footer-items">
          <div tabindex="10004" id="more-nav-footer" class="d-flex d-flex-bottom padding-horizontal d-flex-column nav-footer-item" role="button">
            <div class="nav-footer-icon">
              <i class="fas fa-ellipsis-h"></i>
            </div>
            <div class="nav-footer-label">
              More
            </div>
            <div class="nav-footer-label-smallscreen">
              More
            </div>
            <div class="nav-footer-label-verysmallscreen">
              More
            </div>
          </div>
        </div>

        <div id="expanded-wrapper-nav-footer" class="padding-horizontal d-flex-row nav-footer-items">

          <div tabindex="10005" id="historical-weather-data-nav-footer" class="d-flex d-flex-bottom padding-horizontal d-flex-column nav-footer-item" role="button" data-page="historical-weather-data">
            <div class="nav-footer-icon">
              <i class="fas fa-chart-area"></i>
            </div>
            <div class="nav-footer-label">
              Historical Weather Data
            </div>
            <div class="nav-footer-label-smallscreen">
              Historical Data
            </div>
            <div class="nav-footer-label-verysmallscreen">
              Data
            </div>
          </div>

          <div tabindex="10006" id="historical-thresholds-nav-footer" class="d-flex d-flex-center d-flex-bottom padding-horizontal d-flex-column nav-footer-item" role="button" data-page="historical-thresholds">
            <div class="nav-footer-icon">
              <i class="fas fa-chart-bar"></i>
            </div>
            <div class="nav-footer-label">
              Historical Thresholds
            </div>
            <div class="nav-footer-label-smallscreen">
              Historical Thresholds
            </div>
            <div class="nav-footer-label-verysmallscreen">
              Thresholds
            </div>
          </div>

          <div tabindex="10007" id="high-tide-flooding-nav-footer" class="d-flex d-flex-bottom padding-horizontal d-flex-column nav-footer-item" role="button" data-page="high-tide-flooding">
            <div class="nav-footer-icon">
              <i class="fas fa-water"></i>
            </div>
            <div class="nav-footer-label">
              High-Tide Flooding
            </div>
            <div class="nav-footer-label-smallscreen">
              High-tide
            </div>
            <div class="nav-footer-label-verysmallscreen">
              Tide
            </div>
          </div>
          </div>
        </div>

      </div>

      <!-- less  -->
      <div id="less-row-1" class="d-flex-row nav-footer-row-1">
        <div class="padding-horizontal d-flex-column">
          <div class="d-flex-center d-flex-row padding-horizontal nav-footer-area-title" >
          </div>

          <div tabindex="10008" id="less-wrapper-nav-footer" class="padding-horizontal d-flex-bottom d-flex-row nav-footer-item" role="button" data-page="cards-home">
            <div class="d-flex d-flex-bottom d-flex-column">
              <div class="nav-footer-icon">
                <i class="fas fa-ellipsis-h"></i>
              </div>
              <div class="nav-footer-label">
                Less
              </div>
              <div class="nav-footer-label-smallscreen">
                Less
              </div>
              <div class="nav-footer-label-verysmallscreen">
                Less
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
      ${feedback(config)}
  </div>
</div>

<script type="text/javascript" src="/js/nav_footer.js"></script>

<!-- END NAV FOOTER TEMPLATE -->
`