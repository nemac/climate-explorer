import feedback from './feedack';

// language=HTML
export default (config) => `

  <!-- BEGIN NAV FOOTER TEMPLATE -->
  <nav class="navbar navbar-expand-lg nav_footer border-top p-0">
    <div class="container-fluid">
      <div class="d-flex flex-column btn align-items-center rounded-2 p-1 footer-button footer-button-selected" data-page="cards_home">
        <i class="fas fa-th-large footer-icon me-2"></i>
        <p>Cards Home</p>
      </div>
      <div class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#footerSupportedContent" aria-controls="footerSupportedContent"
           aria-expanded="false" aria-label="Toggle navigation">
        <div class="navbar-toggler-icon d-flex justify-content-center align-items-center">
          <div class="d-flex justify-content-between align-items-center w-100">
            <div>
              <i class="fa fa-ellipsis-h footer-ellipsis"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="collapse navbar-collapse mt-2 mb-2" id="footerSupportedContent">
        <ul class="navbar-nav w-100">
          <li class="nav-item dropdown me-2 rounded-2 w-100">
            <div class="d-flex flex-row justify-content-evenly">
              <div class="d-flex btn flex-column align-items-center rounded-2 p-1 footer-button" data-page="climate_maps">
                <i class="fas fa-map-marked-alt footer-icon"></i>
                <span class="footer-icon-title">Climate Maps</span>
              </div>
              <div class="d-flex btn flex-column align-items-center rounded-2 p-1 footer-button" data-page="climate_graphs">
                <i class="fas fa-chart-line footer-icon"></i>
                <span class="footer-icon-title">Climate Graphs</span>
              </div>
              <div class="d-flex btn flex-column align-items-center rounded-2 p-1 footer-button" data-page="historical_weather_data">
                <i class="fas fa-chart-area footer-icon"></i>
                <span class="footer-icon-title">Historical Weather Data</span>
              </div>
              <div class="d-flex btn flex-column align-items-center rounded-2 p-1 footer-button" data-page="historical_thresholds">
                <i class="fas fa-chart-bar footer-icon"></i>
                <span class="footer-icon-title">Historical Thresholds</span>
              </div>
              <div class="d-flex btn flex-column align-items-center rounded-2 p-1 footer-button" data-page="high_tide_flooding">
                <i class="fas fa-water footer-icon"></i>
                <span class="footer-icon-title">High-Tide Flooding</span>
              </div>
              <div class="d-flex btn flex-column align-items-center rounded-2 p-1 footer-button" data-page="next_steps">
                <i class="fas fa-map-signs footer-icon"></i>
                <span class="footer-icon-title">Take Action</span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <!-- END NAV FOOTER TEMPLATE -->
`
