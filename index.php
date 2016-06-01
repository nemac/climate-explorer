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

    <link rel="stylesheet" media="screen" href="resources/css/shepherd-theme-arrows.css">

    <link rel="stylesheet" media="screen" href="resources/css/screen.css">
    <link rel="stylesheet" media="screen" href="resources/css/mods.css">

    <script type="text/javascript" src="./resources/js/jquery.min.js"></script>
    <script type="text/javascript" src="./resources/js/jquery-ui.min.js"></script>

    <?php

      $share_data['url'] = current_URL();

      echo opengraph_output($share_data);

    ?>

</head>
<body id="page-home" class="">
<div class="cd-cover-layer"></div>
<?php include_once('template/header.php'); ?>

<div id="viewport">
    <div id="main-content-wrap">
        <section id="home-splash">
            <?php

              $locations = array(
                '', // [0]
                'Seven Mile, Florida',
                'Carbon County, Utah',
                'Boston, Massachusetts',
                'Oakland, California',
                'Pinal County, Arizona',
                'Camptonville, California'
              );

              $splash_id = rand(1, 7);

            ?>

            <div id="splash-<?php echo $splash_id; ?>" class="splash-bg">
              <div class="slide-text"><span class="location"><?php echo $locations[$splash_id]; ?></span></div>
            </div>

            <div id="home-text" class="splash-text">
                <h1>The Climate Explorer</h1>
                <p>Explore maps and graphs of historical and projected climate trends in your local area. View data by topics to see how climate change will impact things you care about.</p>
            </div>

            <ul id="home-menu" class="menu blue-menu">
                <li><a href="location.html" class="launch-nav" data-nav-slide="0" id="home-search-by-location"><span class="icon icon-search"></span>Search by location</a></li>
                <li><a href="#" class="launch-nav" data-nav-slide="1" id="home-search-by-variable"><span class="icon icon-variables"></span>View by variable</a></li>
                <li class="border"><a href="#" class="launch-nav" data-nav-slide="2" id="home-search-by-topic"><span class="icon icon-bubble"></span>View by topic</a></li>
                <li><a href="#" id="cd-tour-trigger" class="start-home-tour"><span class="icon icon-tour"></span>New here? Take the tour</a></li>
            </ul>

            <div id="h7">
              <a href="http://habitatseven.com" target="_blank"><span class="logo"></span><span class="text">Designed by Habitat Seven</span></a>
            </div>

            <div id="logos">
              <a href="#"><img src="./resources/img/logo_noaa.png"></a>
              <a href="#"><img src="./resources/img/logo_nasa.png"></a>
              <a href="#"><img src="./resources/img/logo_usgs.png"></a>
              <a href="#"><img src="./resources/img/logo_epa.png"></a>
            </div>
        </section>

    </div>

    <?php include_once('template/share.php'); ?>
</div>

<?php include_once('template/footer.php'); ?>

</body>
</html>
