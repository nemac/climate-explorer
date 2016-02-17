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
  
  <body id="page-fire-regimes" class="page-type-case">
    <?php
      
      include_once('tpl_header.php'); 
        
    ?>
    
    <header id="left-header">
      <ul id="case-menu" class="menu orange-menu">
        <li class="search-field border"><span class="icon icon-search"></span><input type="text" placeholder="Search by location"></li>
        <li class="legend">
          <div class="text">Current Drought <a href="#info-drought" class="help"><span class="icon icon-help"></span></a></div>
          
          <ul>
            <li><span class="color" style="background-color: #2a0023;"></span><span class="tooltip">&gt; 105</span></li>
            <li><span class="color" style="background-color: #c3003c;"></span><span class="tooltip">90–104</span></li>
            <li><span class="color" style="background-color: #f5442d;"></span><span class="tooltip">70–89</span></li>
            <li><span class="color" style="background-color: #f0f567;"></span><span class="tooltip">50–69</span></li>
            <li><span class="color" style="background-color: #48f7d0;"></span><span class="tooltip">30–49</span></li>
            <li><span class="color" style="background-color: #0078d4;"></span><span class="tooltip">&lt; 30</span></li>
          </ul>
          
          <div id="info-drought" class="layer-info">
            <h3>Current Drought</h3>
            <p>Integer sodales commodo purus, ut laoreet erat blandit varius. Aliquam ultrices eleifend diam, vitae ullamcorper mauris cursus tincidunt. Mauris pharetra ex eu ante aliquet luctus.</p>
            
            <div class="actions">
              <a href="#" class="layer-info-close"><span class="icon icon-close"></span>Close</a>
              <a href="#" class="layer-info-next"><span class="icon icon-arrow-right"></span>Next</a>
            </div>
          </div>
        </li>
        <li class="legend">
          <div class="text">Commodo Consequat <a href="#info-commodo" class="help"><span class="icon icon-help"></span></a></div>
          
          <ul>
            <li><span class="color" style="background-color: #2a0023;"></span><span class="tooltip">&gt; 105</span></li>
            <li><span class="color" style="background-color: #c3003c;"></span><span class="tooltip">90–104</span></li>
            <li><span class="color" style="background-color: #f5442d;"></span><span class="tooltip">70–89</span></li>
            <li><span class="color" style="background-color: #f0f567;"></span><span class="tooltip">50–69</span></li>
            <li><span class="color" style="background-color: #48f7d0;"></span><span class="tooltip">30–49</span></li>
            <li><span class="color" style="background-color: #0078d4;"></span><span class="tooltip">&lt; 30</span></li>
          </ul>
          
          <div id="info-commodo" class="layer-info">
            <h3>Commodo Consequat</h3>
            <p>Integer sodales commodo purus, ut laoreet erat blandit varius. Aliquam ultrices eleifend diam, vitae ullamcorper mauris cursus tincidunt. Mauris pharetra ex eu ante aliquet luctus.</p>
            
            <div class="actions">
              <a href="#" class="layer-info-close"><span class="icon icon-close"></span>Close</a>
              <a href="#" class="layer-info-next"><span class="icon icon-arrow-right"></span>Next</a>
            </div>
          </div>
        </li>
        <li class="legend">
          <div class="text">Voluptate Velit Esse <a href="#info-voluptate" class="help"><span class="icon icon-help"></span></a></div>
          
          <ul>
            <li><span class="color" style="background-color: #2a0023;"></span><span class="tooltip">&gt; 105</span></li>
            <li><span class="color" style="background-color: #c3003c;"></span><span class="tooltip">90–104</span></li>
            <li><span class="color" style="background-color: #f5442d;"></span><span class="tooltip">70–89</span></li>
            <li><span class="color" style="background-color: #f0f567;"></span><span class="tooltip">50–69</span></li>
            <li><span class="color" style="background-color: #48f7d0;"></span><span class="tooltip">30–49</span></li>
            <li><span class="color" style="background-color: #0078d4;"></span><span class="tooltip">&lt; 30</span></li>
          </ul>
          
          <div id="info-voluptate" class="layer-info">
            <h3>Voluptate Velit Esse</h3>
            <p>Integer sodales commodo purus, ut laoreet erat blandit varius. Aliquam ultrices eleifend diam, vitae ullamcorper mauris cursus tincidunt. Mauris pharetra ex eu ante aliquet luctus.</p>
            
            <div class="actions">
              <a href="#" class="layer-info-close"><span class="icon icon-close"></span>Close</a>
              <a href="#" class="layer-info-next"><span class="icon icon-arrow-right"></span>Next</a>
            </div>
          </div>
        </li>
        <li class="legend">
          <div class="text">Excepteur Sint <a href="#info-excepteur" class="help"><span class="icon icon-help"></span></a></div>
          
          <ul>
            <li><span class="color" style="background-color: #2a0023;"></span><span class="tooltip">&gt; 105</span></li>
            <li><span class="color" style="background-color: #c3003c;"></span><span class="tooltip">90–104</span></li>
            <li><span class="color" style="background-color: #f5442d;"></span><span class="tooltip">70–89</span></li>
            <li><span class="color" style="background-color: #f0f567;"></span><span class="tooltip">50–69</span></li>
            <li><span class="color" style="background-color: #48f7d0;"></span><span class="tooltip">30–49</span></li>
            <li><span class="color" style="background-color: #0078d4;"></span><span class="tooltip">&lt; 30</span></li>
          </ul>
          
          <div id="info-excepteur" class="layer-info">
            <h3>Excepteur Sint</h3>
            <p>Integer sodales commodo purus, ut laoreet erat blandit varius. Aliquam ultrices eleifend diam, vitae ullamcorper mauris cursus tincidunt. Mauris pharetra ex eu ante aliquet luctus.</p>
            
            <div class="actions">
              <a href="#" class="layer-info-close"><span class="icon icon-close"></span>Close</a>
              <a href="#" class="layer-info-next"><span class="icon icon-arrow-right"></span>Next</a>
            </div>
          </div>
        </li>
      </ul>
      
      <div id="vars-legend" class="legend-wrap left-filler">
          <h6 class="source">Source: <a href="#" target="_blank">NOAA, 2014</a></h6>
      </div>
    </header>
    
    <div id="viewport">
      <div id="main-content-wrap">
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