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

  <body id="page-variables" class="page-type-variables">
    <?php
      
      include_once('tpl_header.php'); 
        
    ?>
    
    <header id="left-header">
      <ul id="vars-menu" class="menu blue-menu">
        <li class="search-field border"><span class="icon icon-search"></span><input type="text" placeholder="Search by location"></li>
        <li class="toggle"><label for="counties-overlay-toggle"><span class="text">Counties</span><input type="checkbox" name="counties-overlay-toggle" id="counties-overlay-toggle" value="1" autocomplete="off" checked="true"></label></li>
        <li class="toggle border"><label for="weather-overlay-toggle"><span class="text">Weather Stations</span><input type="checkbox" name="weather-overlay-toggle" id="weather-overlay-toggle" value="1" autocomplete="off"></label></li>
        <!--<li class="border"><a><span class="icon icon-variables"></span><span class="text">Projected Variables</span></a></li>
        <li><a><span class="icon icon-temperature"></span><span class="text">Temperature</span></a></li>
        <li><a><span class="icon icon-average-mean"></span><span class="text">Average Mean</span></a></li>
        <li><a><span class="icon icon-emission-scenario"></span><span class="text">Emission Scenario</span></a></li>
        <li class="border"><a><span class="icon icon-season"></span><span class="text">Season</span></a></li>-->
        <li class="about-link"><a href="#">About Average Mean Temperature</a></li>
      </ul>
      
      <div id="vars-legend" class="legend-wrap left-filler">
        <div class="legend">
          <h5>Legend</h5>
          <h6>Degrees Fahrenheit</h6>
          
          <ul>
            <li><span class="color" style="background-color: #2a0023;"></span>&gt; 105</li>
            <li><span class="color" style="background-color: #c3003c;"></span>90–104</li>
            <li><span class="color" style="background-color: #f5442d;"></span>70–89</li>
            <li><span class="color" style="background-color: #f0f567;"></span>50–69</li>
            <li><span class="color" style="background-color: #48f7d0;"></span>30–49</li>
            <li><span class="color" style="background-color: #0078d4;"></span>&lt; 30</li>
          </ul>
        </div>
        
        <h6 class="source">Source: <a href="#" target="_blank">NOAA, 2014</a></h6>
      </div>
    </header>
    
    <div id="viewport">
      <div id="main-content-wrap">
        
        <div class="split-pane vertical-percent">
  				<div class="split-pane-component" id="pane-left">
    				<div class="pane-content">

    				</div>
  				</div>
  				
  				<div class="split-pane-divider" id="pane-divider"></div>
  				
  				<div class="split-pane-component" id="pane-right">
    				<div class="pane-content">

    				</div>
  				</div>
  			</div>
        
        <div class="year">
          <div class="year-label year-min">1950</div>
          <div class="year-slider" data-min="1950" data-max="2100" data-value="2015"></div>
          <div class="year-label year-max">2100</div>
        </div>
        
        <div class="zoom">
          <div class="zoom-slider" data-value="1"></div>
          <div class="ui-slider-label zoom-label plus"></div>
          <div class="ui-slider-label zoom-label minus"></div>
        </div>

        <div id="tpl_share"></div>
      </div>
    </div>
    
    <a href="#" id="district-trigger"><span class="text">Show District Overlay</span><span class="icon icon-district"></span></a>
    
    <?php
      
      include_once('tpl_footer.php'); 
        
    ?>

    <script>
      $(function(){
        $("#tpl_share").load("tpl_share.html");
      });
    </script>
  </body>
</html>