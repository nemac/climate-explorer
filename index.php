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
  
  <body id="page-home" class="">
    <?php
      
      include_once('tpl_header.php'); 
        
    ?>
    
    <div id="viewport">
      <div id="main-content-wrap">
        <section id="home-splash">
          <div id="home-cycle" class="cycle-slideshow"
            data-cycle-timeout="8000"
            data-cycle-slides="> .slide"
          >
            <div id="splash-1" class="slide">
              <div class="slide-text">
                <a href="#">
                  <span class="icon icon-bubble"></span>
                  <span class="title">Resilience strategies to save marsh species</span>
                  <span class="location">Seven Mile, Florida</span>
                </a>
              </div>
            </div>
            
            <div id="splash-2" class="slide">
              <div class="slide-text">
                <a href="#">
                  <span class="icon icon-bubble"></span>
                  <span class="title">Resilience strategies to save marsh species</span>
                  <span class="location">Carbon County, Utah</span>
                </a>
              </div>
            </div>
          </div>
          
          <div id="home-text" class="splash-text">
            <h1>The Climate Explorer</h1>
            <p>Explore maps and graphs of historical and projected climate trends in your local area. View data by topics to see how climate change will impact things you care about.</p>
          </div>
          
          <ul id="home-menu" class="menu blue-menu">
            <li><a href="location.php" class="launch-nav" data-nav-slide="0"><span class="icon icon-search"></span>Search by location</a></li>
            <li><a href="#" class="launch-nav" data-nav-slide="1"><span class="icon icon-variables"></span>View by variable</a></li>
            <li class="border"><a href="#" class="launch-nav" data-nav-slide="2"><span class="icon icon-bubble"></span>View by impact</a></li>
            <li><a href="#"><span class="icon icon-tour"></span>New here? Take the tour</a></li>
          </ul>
          
          <div id="logos">
            <a href="#"><img src="<?php echo $site_url; ?>/resources/img/logo_noaa.png"></a>
            <a href="#"><img src="<?php echo $site_url; ?>/resources/img/logo_nasa.png"></a>
            <a href="#"><img src="<?php echo $site_url; ?>/resources/img/logo_usgs.png"></a>
            <a href="#"><img src="<?php echo $site_url; ?>/resources/img/logo_epa.png"></a>
          </div>
        </section>
      
      </div>

      <div id="tpl_share"></div>
    
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