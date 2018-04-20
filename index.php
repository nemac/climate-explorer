<?php include_once('functions.php'); ?>
<!doctype html>
<html>
<head>


  <?php include_once('template/head.php')?>

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
                '<a href="location.php?county=Monroe+County&city=Marathon,%20FL&fips=12087&lat=24.726026&lon=-81.04462619999998">Explore: Marathon, Florida</a>',
                '<a href="location.php?county=Carbon+County&city=Carbon+County,%20UT&fips=49007&lat=39.6479807&lon=-110.61689209999997">Explore: Carbon County, Utah</a>',
                '<a href="location.php?county=Suffolk+County&city=Boston,%20MA&fips=25025&lat=42.3600825&lon=-71.05888010000001">Explore: Boston, Massachusetts</a>',
                '<a href="location.php?county=Alameda+County&city=Oakland,%20CA&fips=06001&lat=37.8043637&lon=-122.2711137">Explore: Oakland, California</a>',
                '<a href="location.php?county=Pinal+County&city=Pinal+County,%20AZ&fips=04021&lat=32.8162061&lon=-111.28450250000003">Explore: Pinal County, Arizona</a>',
                '<a href="location.php?county=Yuba+County&city=Camptonville,%20CA&fips=06115&lat=39.45213229999999&lon=-121.04859799999997">Explore: Camptonville, California</a>'
              );

              $splash_id = rand(1, 6);

            ?>

            <div id="splash-<?php echo $splash_id; ?>" class="splash-bg">
              <div class="slide-text"><span class="location"><?php echo $locations[$splash_id]; ?></span></div>
            </div>

            <div id="home-text" class="splash-text">
              <h1>The Climate Explorer</h1>
              <p>Explore graphs and maps of historical and projected climate trends for any county in the contiguous United States.</p>
            </div>

            <ul id="home-menu" class="menu blue-menu">
                <li><a href="<?php $current_domain ?>#" class="launch-nav" data-nav-slide="0" id="home-search-by-location"><span class="icon icon-search"></span>Select a location</a></li>
                <li><a href="<?php $current_domain ?>#" class="launch-nav" data-nav-slide="1" id="home-search-by-variable"><span class="icon icon-variables"></span>View by variable</a></li>
                <li class="border"><a href="<?php $current_domain ?>#" class="launch-nav" data-nav-slide="2" id="home-search-by-station"><span class="icon icon-bubble"></span>Explore Station Data</a></li>
                <li><a href="<?php $current_domain ?>#" id="cd-tour-trigger" class="start-home-tour"><span class="icon icon-tour"></span>New here? Take the tour</a></li>
            </ul>

            <div id="h7">
              <a href="http://habitatseven.com" target="_blank"><span class="logo"></span><span class="text">Designed by Habitat Seven</span></a>
            </div>

            <div id="logos">
              <a><img src="/resources/img/logo_noaa.png"></a>
              <a><img src="/resources/img/logo_nasa.png"></a>
              <a><img src="/resources/img/logo_usgs.png"></a>
              <a><img src="/resources/img/logo_epa.png"></a>
              <a><img src="/resources/img/logo_usdi.png"></a>
              <a><img src="/resources/img/logo_nemac.png"></a>
              <a id="global-change"><img src="/resources/img/logo_global-change.png"></a>
            </div>
        </section>

    </div>

    <?php include_once('template/share.php'); ?>
</div>

<?php include_once('template/footer.php'); ?>


</body>
</html>
