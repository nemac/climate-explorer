<?php
  
  $current_template = explode('/', $_SERVER['REQUEST_URI']);
  $current_template = end($current_template);
  
  $breadcrumb_text = '';
  
  switch($current_template) {
    case 'location.php' :
      $breadcrumb_text = '<span class="level-1">Location results</span>';
      break;
    case 'variables.php' :
      $breadcrumb_text = '<span class="level-2">Variable</span> <span class="level-1">Average Mean Temperature</span>';
      break;
    case 'case_fire-regimes.php' :
      $breadcrumb_text = '<span class="level-3">Impacts</span> <span class="level-2">Case</span> <span class="level-1">Fire Regimes</span>';
      break;
  }
  
?>

      <header id="main-header">
        <div id="main-nav">
          <a href="<?php echo $site_url; ?>" id="header-logo" title="U.S. Climate Resilience Toolkit"><img src="<?php echo $site_url; ?>/resources/img/us-climate-resilience-toolkit.png" alt="U.S. Climate Resilience Toolkit"></a>
        
          <a href="#" id="nav-trigger" class="nav-btn"><span class="hamburger"><span class="bar"></span></span><span class="text">Menu</span></a>
        
          <?php /*<a href="#" id="nav-home" class="nav-btn"><span class="icon icon-arrow-up"></span><span class="text">Home</span></a>*/ ?>
        
          <nav id="subnav">
            <ul>
              <li><a href="#"><span class="icon"></span><span class="text">Help</span></a></li>
              <li><a href="#"><span class="icon"></span><span class="text">About</span></a></li>
              <li><a href="#"><span class="icon"></span><span class="text">Definitions</span></a></li>
            </ul>
          </nav>
          
          <?php 
            
            if ($breadcrumb_text != '') {
              
          ?>
          
          <div id="breadcrumb">
            <?php 
              
              echo $breadcrumb_text;
              
            ?>
          </div>
          
          <?php
            
            }
            
          ?>
        </div>
      </header>
      
      <nav id="nav-overlay">
        <a href="#" id="nav-close" class="button close bg-white border-none blend-screen"></a>
        
        <div id="nav-cycle" class="cycle-slideshow"
          data-cycle-timeout="0"
          data-cycle-fx="scrollHorz"
          data-cycle-slides="> .slide"
        >
          <div id="nav-search" class="slide">
            <div class="slide-bg"></div>
            
            <div class="nav-controls">
              <a href="#" class="nav-left button border-white hover-bg-white arrow-left"><span class="icon icon-bubble"></span> Impacts</a>
              <a href="#" class="nav-right button border-white hover-bg-white arrow-right"><span class="icon icon-variables"></span> Variables</a>
            </div>
            
            <div class="nav-content-wrap">
              <h3><span class="icon icon-search"></span> Search locations</h3>
              
              <div class="nav-content tabs">
                <nav>
                  <a href="#nav-search" class="nav-search-tab" data-tabs-group="nav-search"><span>Results</span></a>
                </nav>
                
                <div id="nav-search" class="tab nav-content-tab">
                  <ul class="col-2">
                    <li><a href="location.php">Seattle</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div id="nav-variables" class="slide">
            <div class="slide-bg"></div>
            
            <div class="nav-controls">
              <a href="#" class="nav-left button border-white hover-bg-white arrow-left"><span class="icon icon-search"></span> Search</a>
              <a href="#" class="nav-right button border-white hover-bg-white arrow-right"><span class="icon icon-bubble"></span> Impacts</a>
            </div>
            
            <div class="nav-content-wrap">
              <h3><span class="icon icon-variables"></span> Choose a variable</h3>
              
              <a href="variables.php">Variables dummy page</a>
              
              <div class="nav-content tabs">
                <nav>
                  <a href="#nav-vars-projected" class="nav-vars-tab" data-tabs-group="nav-vars"><span>Projected</span></a>
                  <a href="#nav-vars-historical" class="nav-vars-tab" data-tabs-group="nav-vars"><span>Historical</span></a>
                </nav>
                
                <div id="nav-vars-projected" class="tab nav-content-tab">
                  <ol class="col-4">
                    <li><a>Temperature</a>
                      <ul>
                        <li><a>By Climate Division</a></li>
                        <li><a>Modelled  Historical</a></li>
                        <li><a>Weather Station</a></li>
                      </ul>
                    </li>
                    
                    <li><a>Precipitation</a>
                      <ul>
                        <li><a>By Climate Division</a></li>
                        <li><a>Modelled  Historical</a></li>
                        <li><a>Weather Station</a></li>
                      </ul>
                    </li>
                    
                    <li><a>Drought</a></li>
                    
                    <li><a>Sea Level Rise</a></li>
                  </ul>
                </div>
                
                <div id="nav-vars-historical" class="tab nav-content-tab">
                  <ul class="col-4">
                    <li>temperature</li>
                    <li>precipitation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div id="nav-impacts" class="slide">
            <div class="slide-bg"></div>
            
            <div class="nav-controls">
              <a href="#" class="nav-left button border-white hover-bg-white arrow-left"><span class="icon icon-variables"></span> Variables</a>
              <a href="#" class="nav-right button border-white hover-bg-white arrow-right"><span class="icon icon-search"></span> Search</a>
            </div>
            
            <div class="nav-content-wrap">
              <h3><span class="icon icon-bubble"></span> Choose an impact</h3>
              
              <div class="nav-content tabs">
                <nav>
                  <a href="#nav-impacts" class="nav-impacts-tab" data-tabs-group="nav-impacts"><span>By Impact</span></a>
                </nav>
                
                <div id="nav-impacts" class="tab nav-content-tab">
                  <ul class="col-2">
                    <!--<li><a href="#">Coastal Flood Risk</a></li>-->
                    <li><a href="impact_ecosystem-vulnerability.php">Ecosystem Vulnerability</a></li>
                    <!--<li><a href="#">Energy Supply and Use</a></li>
                    <li><a href="#">Food Resilience</a></li>
                    <li><a href="#">Human Health</a></li>
                    <li><a href="#">Transportation and Supply Chain</a></li>
                    <li><a href="#">Tribal Nations</a></li>
                    <li><a href="#">Water Resources</a></li>-->
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>