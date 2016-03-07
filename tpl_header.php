<?php
  
  
  $nav_content = array(
    
    'variables' => array(
      
    ),
    
    'impacts' => array(
      
      array(
        'variable' => 'coastal_flooding',
        'name' => 'Coastal Flooding',
        'detail' => "Coastal Flooding detail",
        'source' => 'NOAA, 2015'
      ),
      
      array(
        'variable' => 'drought',
        'name' => 'Drought',
        'detail' => "Drought detail",
        'source' => 'NOAA, 2015'
      ),
      
      array(
        'variable' => 'flooding',
        'name' => 'Flooding',
        'detail' => "Flooding detail",
        'source' => 'NOAA, 2015'
      ),
      
      array(
        'variable' => 'tribal_flood',
        'name' => 'Tribal Nations: Flood Risk',
        'detail' => "Tribal Nations: Flood Risk detail",
        'source' => 'NOAA, 2015'
      ),
      
      array(
        'variable' => 'tribal_drought',
        'name' => 'Tribal Nations: Drought Risk',
        'detail' => "Tribal Nations: Drought Risk detail",
        'source' => 'NOAA, 2015'
      ),
      
      array(
        'variable' => 'ecosystems',
        'name' => 'Ecosystems',
        'detail' => "Despite extensive human engineering of Earth’s resources, our economy and culture continue to depend on natural ecosystem services for food, timber, clean water, and more.",
        'source' => 'NOAA, 2015'
      ),
      
      array(
        'variable' => 'human_health',
        'name' => 'Human Health',
        'detail' => "Human Health detail",
        'source' => 'NOAA, 2015'
      ),
      
      array(
        'variable' => 'transportation',
        'name' => 'Transportation',
        'detail' => "Transportation detail",
        'source' => 'NOAA, 2015'
      )
    )
    
  );
  
?>
<!-- BEGIN HEADER TEMPLATE -->

<header id="main-header">
  <div id="main-nav">
    <a href="https://toolkit.climate.gov" id="header-logo" title="U.S. Climate Resilience Toolkit"><img src="./resources/img/us-climate-resilience-toolkit.png" alt="U.S. Climate Resilience Toolkit"></a>

    <a href="./" id="nav-home" class="nav-btn"><span class="icon icon-arrow-up"></span><span class="text">Home</span></a>

    <a href="#" id="nav-trigger" class="nav-btn"><span class="hamburger"><span class="bar"></span></span><span class="text">Menu</span></a>

    <nav id="subnav">
      <ul>
        <li><a href="#"><span class="icon"></span><span class="text">Help</span></a></li>
        <li><a href="#"><span class="icon"></span><span class="text">About</span></a></li>
        <li><a href="#"><span class="icon"></span><span class="text">Definitions</span></a></li>
        <li><a href="#"><span class="icon"></span><span class="text">Credits</span></a></li>
      </ul>
    </nav>
    
    <div id="breadcrumb"></div>
  </div>
</header>

<nav id="nav-overlay">
  <a href="#" id="nav-close" class="button close bg-white border-none blend-screen"></a>
  
  <div id="nav-controls" class="nav-controls cycle-pager external">
    <a href="./" id="nav-overlay-home" class="button"><span class="icon icon-arrow-up"></span><span class="text">Home</span></a>
    
    <ul id="nav-cycle-pager">
      <li><a href="#nav-search"><span class="icon icon-search"></span> Search by location</a></li>
      <li><a href="#nav-variables"><span class="icon icon-variables"></span> View by variable</a></li>
      <li><a href="#nav-impacts"><span class="icon icon-bubble"></span> View by impact</a></li>
    </ul>
  </div>

  <div id="nav-cycle" class="cycle-slideshow" 
    data-cycle-timeout="0" 
    data-cycle-fx="scrollHorz" 
    data-cycle-slides="> .slide" 
    data-cycle-pager="#nav-cycle-pager" 
    data-cycle-pager-template="">
      
    <div id="nav-search" class="slide" data-slide-num="0">
      <div class="slide-bg"></div>
      
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

    <div id="nav-variables" class="slide" data-slide-num="1">
      <div class="slide-bg"></div>
      
      <div class="nav-content-wrap">
        <h3><span class="icon icon-variables"></span> Choose a variable</h3>

        <div class="nav-content tabs">
          <div id="nav-vars-projected" class="tab nav-content-tab">
            <ol class="col-3">
              <li><a href="#detail-temperature" class="nav-detail-link">Temperature</a>
                <ul>
                  <li><a>Mean Daily Max</a></li>
                  <li><a>Mean Daily Min</a></li>
                  <li><a>Days Over 95º F</a></li>
                  <li><a>Days Under 32º F</a></li>
                </ul>
              </li>
              <li><a>Precipitation</a>
                <ul>
                  <li><a>Precipitation</a></li>
                </ul>
              </li>
              <li><a>Derived</a>
                <ul>
                  <li><a>Heating Degree Days</a></li>
                  <li><a>Cooling Degree Days</a></li>
                </ul>
              </li>
            </ol>
          </div>
        </div>
      </div>
      
      <div id="variable-details" class="nav-detail">
        <div id="detail-temperature" class="nav-detail-item">
          <h3>What does <u>Average Mean Temperature</u> mean?</h3>
          
          <p>We evaluate climate over long periods of observation. For example, in 2014, the global temperature was 1.24°F (0.69°C) above the long-term average for the 20th century, according to NOAA's National Climatic Data Center. That number made 2014 the warmest year on record in the NOAA database, which goes back to 1880.</p>
          <p>Annual average air temperatures have changed in different parts of the United States since the early 20th century (since 1901 for the contiguous 48 states and 1925 for Alaska). The data are shown for climate divisions, as defined by the National Oceanic and Atmospheric Administration.</p>
          <p>Data source: NOAA, 2015 3</p>
          
          <p><a href="variables.php" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
        </div>
      </div>
    </div>
    
    <div id="nav-impacts" class="slide" data-slide-num="2">
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
              <?php
                
                foreach($nav_content['impacts'] as $impact) {
                  
              ?>
              <li><a href="#detail-<?php echo $impact['variable']; ?>" class="nav-detail-link"><?php echo $impact['name']; ?></a></li>
              <?php
                
                }
                
              ?>
            </ul>
          </div>
        </div>
      </div>
      
      <div id="impacts-details" class="nav-detail">
        
        <?php
          
          foreach($nav_content['impacts'] as $impact) {
            
        ?>
        
        <div id="detail-<?php echo $impact['variable']; ?>" class="nav-detail-item">
          <h3>What does <u><?php echo $impact['name']; ?></u> mean?</h3>
          
          <p><?php echo $impact['detail']; ?></p>
          
          <p>Data source: <?php echo $impact['source']; ?></p>
          
          <p><a href="case.php?id=<?php echo $impact['variable']; ?>" class="button bg-trans border-white hover-bg-white">Get started</a><a href="#" class="close-detail button bg-trans border-trans color-white arrow-left">Back</a></p>
        </div>
      
        <?php
          
          }
          
        ?>
      </div>
    </div>
  </div>
</nav>

<!-- END HEADER TEMPLATE -->