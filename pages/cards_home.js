import head from '../template/head'
import secondary_header from '../template/secondary_header';
import nav_footer from '../template/nav_footer';
import footer from '../template/footer';

export default (config) => `
<!doctype html>
<html lang='en' class="width-100 height-100">
<head>
  ${head(config)}
  <meta property="fb:app_id" content="187816851587993">
  <meta property="og:url" content="/">
  <meta property="og:type" content="article">
  <meta property="og:title" content="Location data for Buncombe County, NC">
  <meta property="og:description" content="The Climate Explorer allows you to view historical and projected climate variables and assess the impacts of climate change on the things you care about">
  <meta property="og:image" content="/img/og.jpg">
</head>

<body class="d-flex d-flex-column min-vh-100">

  ${secondary_header(config)}

    <div class="container-fluid">
    
      <div class="input-group mb-3 search-input-group rounded-3 border border-1">
        <button id="clear-location" class="btn search-icons" type="button"><span class="fas fa-times-circle"></span></button>
        <input id="cards-search-input" class="form-control location-mapper" type="text" placeholder="Enter county or city name" aria-label="Enter county or city name">
        <button class="btn search-icons" type="button"><span class="icon-search"></span></button>
      </div>
      
      <div class="select-county-card rounded-3 border border-1 mb-3">
        
        <div class="p-2 d-flex align-items-center">
          <i class="fas fa-th-large icon-info-box me-2"></i>
          <span class="text-info-box me-1">Select one of the following for</span>
          <span id="default-city-county"></span>
        </div>
        
      </div>
      
      <div class="row mb-3"> 
        
        <div class="col-sm-4"> 
            <div class="col-sm-12 p-0 card border border-1 rounded shadow-sm data-card h-100" data-page="climate_maps">
              <div>
                <img class="img-fluid" src="/img/card-local-maps.png" alt="example-chart"/>
             </div>
             
             <div class="m-2">
               <div class="d-flex flex-row align-items-center justify-content-between">
                  <span class="cards-home-title">Climate Maps</span>
                  <i class="fas fa-map-marked-alt"></i>
               </div>
             </div>
             
             <div class="m-2">
               Compare past and projected future conditions in your county.
             </div>
             
             <div class="disabled-text m-2">Maps are not available for this location.</div>
        
            </div>
        </div>
        
        <div class="col-sm-4"> 
            <div class="col-sm-12 p-0 card border border-1 rounded shadow-sm data-card h-100" data-page="climate_graphs">
              <div>
                <img class="img-fluid" src="/img/card-local-charts.png" alt="example climate chart"/>
             </div>
             
             <div class="m-2">
               <div class="d-flex flex-row justify-content-between">
                  <span class="cards-home-title">Climate Graphs</span>
                  <i class="fas fa-chart-line icon-size"></i>
               </div>
             </div>
             
             <div class="m-2">
               Check past and projected values for climate variables.
             </div>
             
             <div class="disabled-text m-2">Data is not available for this location.</div>
        
            </div>
        </div>
        
        <div class="col-sm-4"> 
            <div class="col-sm-12 p-0 card border border-1 rounded shadow-sm data-card h-100 data-page="high_tide_flooding"">
              <div>
                <img class="img-fluid" src="/img/card-tidal-data.png" alt="Tidal chart data image"/>
             </div>
             
             <div class="m-2">
               <div class="d-flex flex-row justify-content-between">
                  <span class="cards-home-title">High-Tide Flooding</span>
                  <i class="fas fa-water"></i>
               </div>
             </div>
             
             <div class="m-2">
               Explore the number of days per year with high-tide floods.
             </div>
             
             <div class="disabled-text m-2">High-tide flooding data not available for this location.</div>
        
            </div>
        </div>
        
      </div>
      
      <div class="row mb-3"> 
        
        <div class="col-sm-4"> 
        
            <div class="col-sm-12 p-0 card border border-1 rounded shadow-sm data-card h-100" data-page="historical_weather_data">
              <div>
                <img class="img-fluid" src="/img/card-hist-daily.png" />
             </div>
             
             <div class="m-2">
               <div class="d-flex flex-row justify-content-between">
                  <span class="cards-home-title">Historical Weather Data</span>
                  <i class="fas fa-chart-area"></i>
               </div>
             </div>
             
             <div class="m-2">
               Compare observed daily weather to long-term climate.
             </div>
             
             <div class="disabled-text m-2">Data is not available for this location</div>
        
            </div>
        </div>
        
        <div class="col-sm-4"> 
            <div class="col-sm-12 p-0 card border border-1 rounded shadow-sm data-card h-100" data-page="historical_thresholds">
              <div>
                <img class="img-fluid" src="/img/card-hist-thresholds.png" alt="historical weather thresholds image"/>
             </div>
             
             <div class="m-2">
               <div class="d-flex flex-row justify-content-between">
                  <span class="cards-home-title">Historical Thresholds</span>
                  <i class="fas fa-chart-area"></i>
               </div>
             </div>
             
             <div class="m-2">
               Check how often temperature or precipitation has exceeded user-defined values.
             </div>
             
             <div class="disabled-text m-2">Data is not available for this location.</div>
        
            </div>
        </div>
        
        <div class="col-sm-4"> 
            <div class="col-sm-12 p-0 card border border-1 rounded shadow-sm data-card h-100" data-page="next_steps">
                <div class="m-2"> 
                  <div class="d-flex flex-row justify-content-between">
                     <span class="cards-home-title">Ready to plan for resilience?</span>
                     <i class="fas fa-map-signs"></i>
                  </div>
                </div>

               <div class="m-2">
                 <div>
                    <div class="mb-2">
                        <span>Resources from our partners can help you identify what matters to your community and evaluate how climate change could affect it:</span>
                    </div>
                    
                     <ul>
                       <li class="m-1">Check your exposure to extreme events such as wildfires and flooding</li>
                       <li class="m-1">Identify social vulnerabilities across urban areas</li>
                       <li class="m-1">Get step-by-step guidance for completing a vulnerability assessment or crafting an action plan.</li>
                     </ul>
                 </div>
               </div>
               
               <div class="m-2 mt-auto"> 
                  <div> 
                    <span class="me-2">Explore planning tools</span>
                    <span class="fas fa-arrow-right"></span>
                  </div>
               </div>
            </div>
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
<script type="${config.env === 'dev' ? 'module' : 'text/javascript'}" src="/js/cards_home.js"></script>
</body>
</html>
`
