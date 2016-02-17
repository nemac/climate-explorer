<?php
  
  $site_url = 'http://' . $_SERVER["SERVER_NAME"] . (isset($_SERVER["SERVER_PORT"]) ? ":" . $_SERVER["SERVER_PORT"] : '');
  
  if ($_SERVER["SERVER_NAME"] == 'localhost') {
    $site_url .= '/climateexplorer';
  }
  
?>
<!doctype html>
<html>
  <head>
    <title>Climate Explorer</title>
    
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <link rel="stylesheet" media="screen" href="resources/css/screen.css">
  </head>
  
  <body id="page-location-seattle" class="page-type-location">
    <?php
      
      include_once('tpl_header.php'); 
        
    ?>
    
    <div id="viewport">
      <div id="main-content-wrap" style="background-image: url(<?php echo $site_url; ?>/resources/img/bg_location-seattle.jpg);">
        
        <?php
          
          include_once('tpl_share.php'); 
            
        ?>
        
        <section id="location-splash" class="page-splash">
          <div class="splash-text">
            <h1>Seattle, WA</h1>
            <p>The following provides a summary of the data for the location you have chosen. Explore the summaries or click on the graph or map for more details.</p>
          </div>
        
          <div id="page-nav">
            <h4>Jump to:</h4>
            
            <ul>
              <li><a href="#location-temperature">Temperature</a></li>
              <li><a href="#location-precipitation">Precipitation</a></li>
              <li><a href="#location-impacts">Relevant Impacts</a></li>
            </ul>
          </div>
        </section>
        
        <section id="location-temperature" class="location-data-section-wrap">
          <div class="location-data-section">
            <header>
              <h3 class="accent-color"><span class="icon icon-temperature"></span>Temperature</h3>
              
              <div class="data-vars">
                <select id="data-type" class="dropdown">
                  <option value="projected">Projected</option>
                  <option value="historical">Historical</option>
                </select>
                
                <select id="data-season" class="dropdown">
                  <option value="spring">Spring</option>
                  <option value="summer">Summer</option>
                  <option value="autumn">Autumn</option>
                  <option value="winter">Winter</option>
                </select>
              </div>
            </header>

            <div id="temperature-data" class="data-list">
              <ul class="data-options">
                <li><a href="#" class="active accent-color accent-border">Average Mean<span class="icon icon-help"></span></a></li>
                <li><a href="#">Average Low<span class="icon icon-help"></span></a></li>
                <li><a href="#">Average High<span class="icon icon-help"></span></a></li>
                <li><a href="#">Hottest<span class="icon icon-help"></span></a></li>
                <li><a href="#">Coldest<span class="icon icon-help"></span></a></li>
                <li><a href="#">Days over 90º<span class="icon icon-help"></span></a></li>
              </ul>
            </div>
            
            <div id="temperature-tabs" class="data-accordion-wrap">
              <div class="data-accordion">

                <div id="temperature-chart" class="data-accordion-tab data-chart accent-background">
                  <header>
                    <h4>
                      <span class="icon icon-emission-scenario"></span>
                      <span class="text">
                        Chart<span class="full-title">: Chart Title</span>
                        <span class="source">Source: <a href="#" target="_blank">NOAA, 2014</a></span>
                      </span>
                    </h4>
                    
                    <div class="chart-actions">
                      <a href="#" class="chart-download-image"><span class="icon icon-download-image"></span>Image</a>
                      <a href="#" class="chart-download-data"><span class="icon icon-download-chart"></span>Data</a>
                    </div>
                  </header>
                  
                  <div class="data-accordion-content chart">
                    <div class="chart-wrap">
                      <div class="chart-legend"></div>
                      <canvas id="chart-123" class="chart-canvas" data-chart-ID="123" height="100" width="50"></canvas>
                    </div>
                    
                    <div class="range">
                      <div class="chart-range" data-start="2010" data-end="2100"></div>
                      <div class="ui-slider-label range-label min">2010</div>
                      <div class="ui-slider-label range-label max">2100</div>
                    </div>
                  </div>
                </div>

                <div id="temperature-map" class="data-accordion-tab data-map accent-background">
                  <header>
                    <h4 class="accent-color">
                      <span class="icon icon-district"></span>
                      <span class="text">
                        Map<span class="full-title">: Map Title</span>
                        <span class="source">Source: <a href="#" target="_blank">NOAA, 2014</a></span>
                      </span>
                    </h4>
                  </header>
                  
                  <div id="map-123" class="data-accordion-content map"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section id="location-precipitation" class="location-data-section-wrap">
          <div class="location-data-section">
            <header>
              <h3 class="accent-color"><span class="icon icon-precipitation"></span>Precipitation</h3>
              
              <div class="data-vars">
                <select id="data-type" class="dropdown">
                  <option value="projected">Projected</option>
                  <option value="historical">Historical</option>
                </select>
                
                <select id="data-season" class="dropdown">
                  <option value="spring">Spring</option>
                  <option value="summer">Summer</option>
                  <option value="autumn">Autumn</option>
                  <option value="winter">Winter</option>
                </select>
              </div>
            </header>

            <div id="precipitation-data" class="data-list">
              <ul class="data-options">
                <li><a href="#" class="active accent-color accent-border">Average Mean</a></li>
                <li><a href="#">Total Rainfall</a></li>
                <li><a href="#">Precipitation Anomaly</a></li>
                <li><a href="#">Number of Wet Days</a></li>
                <li><a href="#">Number of Extreme Wet Days</a></li>
              </ul>
            </div>
            
            <div id="precipitation-tabs" class="data-accordion-wrap">
              <div class="data-accordion">

                <div id="precipitation-chart" class="data-accordion-tab data-chart accent-background">
                  <header>
                    <h4>
                      <span class="icon icon-emission-scenario"></span>
                      <span class="text">
                        Chart<span class="full-title">: Chart Title</span>
                        <span class="source">Source: <a href="#" target="_blank">NOAA, 2014</a></span>
                      </span>
                    </h4>
                    
                    <div class="chart-actions">
                      <a href="#" class="chart-download-image"><span class="icon icon-download-image"></span>Image</a>
                      <a href="#" class="chart-download-data"><span class="icon icon-download-chart"></span>Data</a>
                    </div>
                  </header>
                  
                  <div class="data-accordion-content chart">
                    <div class="chart-wrap">
                      <div class="chart-legend"></div>
                      <canvas id="chart-234" class="chart-canvas" data-chart-ID="234" height="100" width="50"></canvas>
                    </div>
                    
                    <div class="range">
                      <div class="chart-range" data-start="2010" data-end="2100"></div>
                      <div class="ui-slider-label range-label min">2010</div>
                      <div class="ui-slider-label range-label max">2100</div>
                    </div>
                  </div>
                </div>

                <div id="precipitation-map" class="data-accordion-tab data-map accent-background">
                  <header>
                    <h4 class="accent-color">
                      <span class="icon icon-district"></span>
                      <span class="text">
                        Map<span class="full-title">: Map Title</span>
                        <span class="source">Source: <a href="#" target="_blank">NOAA, 2014</a></span>
                      </span>
                    </h4>
                  </header>
                  
                  <div id="map-234" class="data-accordion-content map"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section id="location-drought" class="location-data-section-wrap">
          <div class="location-data-section">
            <header>
              <h3 class="accent-color"><span class="icon icon-drought"></span>Drought</h3>
              
              <div class="data-vars">
                <select id="data-type" class="dropdown">
                  <option value="projected">Projected</option>
                  <option value="historical">Historical</option>
                </select>
                
                <select id="data-season" class="dropdown">
                  <option value="spring">Spring</option>
                  <option value="summer">Summer</option>
                  <option value="autumn">Autumn</option>
                  <option value="winter">Winter</option>
                </select>
              </div>
            </header>

            <div id="drought-data" class="data-list">
              <ul class="data-options">
                <li><a href="#" class="active accent-color accent-border">Total Rainfall</a></li>
                <li><a href="#">Agricultural Impacts</a></li>
                <li><a href="#">Number of Dry Days</a></li>
                <li><a href="#">Number of Extreme Dry</a></li>
              </ul>
            </div>
            
            <div id="drought-tabs" class="data-accordion-wrap">
              <div class="data-accordion">

                <div id="drought-chart" class="data-accordion-tab data-chart accent-background">
                  <header>
                    <h4>
                      <span class="icon icon-emission-scenario"></span>
                      <span class="text">
                        Chart<span class="full-title">: Chart Title</span>
                        <span class="source">Source: <a href="#" target="_blank">NOAA, 2014</a></span>
                      </span>
                    </h4>
                    
                    <div class="chart-actions">
                      <a href="#" class="chart-download-image"><span class="icon icon-download-image"></span>Image</a>
                      <a href="#" class="chart-download-data"><span class="icon icon-download-chart"></span>Data</a>
                    </div>
                  </header>
                  
                  <div class="data-accordion-content chart">
                    <div class="chart-wrap">
                      <div class="chart-legend"></div>
                      <canvas id="chart-345" class="chart-canvas" data-chart-ID="345" height="400" width="300"></canvas>
                    </div>
                    
                    <div class="range">
                      <div class="chart-range" data-start="2010" data-end="2100"></div>
                      <div class="ui-slider-label range-label min">2010</div>
                      <div class="ui-slider-label range-label max">2100</div>
                    </div>
                  </div>
                </div>

                <div id="drought-map" class="data-accordion-tab data-map accent-background">
                  <header>
                    <h4 class="accent-color">
                      <span class="icon icon-district"></span>
                      <span class="text">
                        Map<span class="full-title">: Map Title</span>
                        <span class="source">Source: <a href="#" target="_blank">NOAA, 2014</a></span>
                      </span>
                    </h4>
                  </header>
                  
                  <div id="map-345" class="data-accordion-content map"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section id="location-impacts" class="impacts-list">
          <h2>Relevant Impacts</h2>
          
          <article id="impact-ecosystem-vulnerability" class="impact-banner" style="background-image: url(<?php echo $site_url; ?>/resources/img/bg_topic-ecosystem.jpg);">
            <div class="impact-banner-text">
              <h4>Impacts</h4>
              <h3><a href="<?php echo $site_url; ?>/impact_ecosystem-vulnerability.php">Ecosystem Vulnerability</a></h3>
              <p>From large-scale agriculture, to massive dams and reservoirs, to managed fire regimes dating back thousands of years, humans have transformed the planet by engineering Earth’s physical and biological systems to better serve our needs and desires.</p>
            </div>
            
            <a href="<?php echo $site_url; ?>/impact_ecosystem-vulnerability.php" class="button bg-trans border-white hover-bg-white">View details</a>
          </article>
          
          <article id="impact-coastal-flood-risk" class="impact-banner" style="background-image: url(<?php echo $site_url; ?>/resources/img/bg_topic-coastalflood.jpg);">
            <div class="impact-banner-text">
              <h4>Impacts</h4>
              <h3><a href="#">Coastal Flood Risk</a></h3>
              <p>Every year, at multiple locations along the coast of the United States, events such as storm surges, high tides, strong waves, heavy precipitation, increased river flow, and tsunamis cause damaging coastal floods.</p>
            </div>
            
            <a href="#" class="button bg-trans border-white hover-bg-white">View details</a>
          </article>
        </section>
      </div>
    </div>
    
    <?php
      
      include_once('tpl_footer.php'); 
        
    ?>
  </body>
</html>