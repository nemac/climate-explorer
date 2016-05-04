<?php
  
  include_once('functions.php');

?>
<!doctype html>
<html>
<head>
    <title>Climate Explorer</title>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="resources/css/ol3-popup.css">
    <link rel="stylesheet" media="screen" href="resources/css/shepherd-theme-arrows.css">

    <link rel="stylesheet" media="screen" href="resources/css/screen.css">
    <link rel="stylesheet" media="screen" href="resources/css/mods.css">

    <script type="text/javascript" src="./resources/js/jquery.min.js"></script>
    <script src="//code.jquery.com/ui/1.11.4/jquery-ui.js"></script>
    
    <?php
      
      $share_data['url'] = current_URL();
      $share_data['title'] = 'Definitions';
      
      echo opengraph_output($share_data);
      
    ?>

</head>

<body id="page-location-seattle" class="page-type-location">
<div class="cd-cover-layer"></div>
<?php include_once('template/header.php'); ?>

<div id="viewport">
    <div id="main-content-wrap">

        <?php include_once('template/share.php'); ?>

        <div id="location-search">
          <input type="text" class="autocomplete location-mapper" placeholder="Search another location">
        </div>

        <section id="location-splash" class="page-splash">
            <div class="splash-text">
                <h1>Definitions</h1>
                <p>This is the definitions page.</p>
            </div>
        </section>

        <!-- begin temperature chart and map -->

        
    </div>
</div>


<?php include_once('template/footer.php'); ?>

<script src="./resources/js/cwg/climate-widget-graph.js"></script>
<script src="./resources/js/cwg/cwg.js"></script>




</body>
</html>
