import feedback from './feedack';

export default (config) => `

<!-- BEGIN NAV FOOTER TEMPLATE -->

<div class="container-fluid"> 

    <div class="d-flex mt-auto fixed-bottom">
        <div class="col-12 p-2 nav-background-color border-top border-2 mt-auto">
            <div class="d-flex flex-row justify-content-evenly"> 
                <div class="d-flex flex-column align-items-center rounded-2 p-1 footer-button" data-page="cards_home">
                    <i class="fas fa-th-large footer-icon"></i>
                    <span class="footer-icon-title">Cards Home</span>
                </div>
                <div class="d-flex flex-column align-items-center rounded-2 p-1 footer-button" data-page="next_steps"> 
                    <i class="fas fa-map-signs footer-icon"></i>
                    <span class="footer-icon-title">Take Action</span>
                </div>
                
                <div class="d-flex flex-column align-items-center rounded-2 p-1 footer-button" data-page="climate_graphs">
                    <i class="fas fa-chart-line footer-icon"></i>
                    <span class="footer-icon-title">Climate Graphs</span>
                </div>
                
                <div class="d-flex flex-column align-items-center rounded-2 p-1 footer-button" data-page="climate_maps">
                    <i class="fas fa-map-marked-alt footer-icon"></i>
                    <span class="footer-icon-title">Climate Maps</span>
                </div>
                
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
     ${feedback(config)}
</div>

<!-- END NAV FOOTER TEMPLATE -->
`
