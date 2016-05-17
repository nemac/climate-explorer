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

<body id="page-topic-ecosystem-vulnerability" class="page-type-topic">

<?php include_once('template/header.php'); ?>

<div id="viewport">
    <div id="main-content-wrap" style="background-image: url(./resources/img/bg_location-seattle.jpg);">

        <div class="share-widget">
          <a href="#" class="share-trigger"><span class="icon icon-social"></span>Share</a>
          <ul>
            <li><a href="#" class="share-link share-facebook"><span class="icon icon-facebook"></span>Facebook</a></li>
            <li><a href="#" class="share-link share-twitter"><span class="icon icon-twitter"></span>Twitter</a></li>
            <li><a href="#" class="share-link share-linkedin"><span class="icon icon-linkedin"></span>LinkedIn</a></li>
          </ul>
        </div>

        <section id="impact-splash" class="page-splash">
            <div class="splash-text">
                <h4>Impact</h4>
                <h1>Ecosystem Vulnerability</h1>
                <p>Despite extensive human engineering of Earth’s resources, our economy and culture continue to depend on natural ecosystem services for food, timber, clean water, and more.</p>
            </div>

            <div id="cases-menu" class="white-menu">
                <h4>Cases</h4>
                <ul>
                  <li><a href="#case-water-resources" class="smooth-scroll">Coastal Flooding</a></li>
                  <li><a href="#case-fire-regimes" class="smooth-scroll">Drought</a></li>
                  <li><a href="#" class="smooth-scroll">Flooding</a></li>
                  <li><a href="#" class="smooth-scroll">Tribal Nations: Flood Risk</a></li>
                  <li><a href="#" class="smooth-scroll">Tribal Nations: Drought Risk</a></li>
                  <li><a href="#" class="smooth-scroll">Ecosystems</a></li>
                  <li><a href="#" class="smooth-scroll">Human Health</a></li>
                  <li><a href="#" class="smooth-scroll">Transportation</a></li>
                </ul>
            </div>
        </section>

        <section id="cases" class="impacts-list">
          <article id="case-coastal-flooding" class="impact-banner">
            <div class="impact-banner-text">
                <h4>Case</h4>
                <h3><a href="case_coastal-flooding.html">Coastal Flooding</a></h3>
                <p>Municipalities and property owners can check their vulnerability to coastal flooding. Map layers show areas of current flood hazards as well as visualizations of flooding from future sea level rise.</p>
            </div>

            <div class="impact-layers white-menu">
                <h4>Data layers include:</h4>

                <ul id="coastal-flooding-layer-list">
                </ul>
            </div>

            <a href="case_coastal-flooding.html" class="button bg-trans border-white hover-bg-white plus">View details</a>
          </article>

          <article id="case-fire-regimes" class="impact-banner" style="background-image: url(./resources/img/bg_topic-fireregimes.jpg);">
            <div class="impact-banner-text">
                <h4>Case</h4>
                <h3><a href="case_fire-regimes.html">Drought</a></h3>
                <p>Explore which regions are currently abnormally dry or experiencing drought; check the land cover to see what types of vegetation, crops, and development may be impacted. View graphs of cumulative precipitation to assess the lack of moisture.</p>
            </div>

            <div class="impact-layers white-menu">
                <h4>Data layers include:</h4>

                <ul id="drought-layer-list">
                </ul>
            </div>

            <a href="case_fire-regimes.html" class="button bg-trans border-white hover-bg-white plus">View details</a>
          </article>

          <article id="case-flooding" class="impact-banner">
            <div class="impact-banner-text">
                <h4>Case</h4>
                <h3><a href="case_flooding.html">Flooding</a></h3>
                <p></p>
            </div>

            <div class="impact-layers white-menu">
                <h4>Data layers include:</h4>

                <ul id="flooding-layer-list">
                </ul>
            </div>

            <a href="case_flooding.html" class="button bg-trans border-white hover-bg-white plus">View details</a>
          </article>

          <article id="case-tribal-flood" class="impact-banner">
            <div class="impact-banner-text">
                <h4>Case</h4>
                <h3><a href="case_tribal-flood.html">Tribal Nations: Flood Risk</a></h3>
                <p>Survey the extent of American Indian land, and lands where an Indian tribe proved original tribal occupancy. Explore landcover and social vulnerability categories at these locations, and check for climate stressors such as sea level rise, flood hazards, and drought.</p>
            </div>

            <div class="impact-layers white-menu">
                <h4>Data layers include:</h4>

                <ul id="tribal-flooding-layer-list">
                </ul>
            </div>

            <a href="case_tribal-flood.html" class="button bg-trans border-white hover-bg-white plus">View details</a>
          </article>


          <article id="case-tribal-flood" class="impact-banner">
            <div class="impact-banner-text">
                <h4>Case</h4>
                <h3><a href="case_tribal-drought.html">Tribal Nations: Drought Risk</a></h3>
                <p>Survey the extent of American Indian land, and lands where an Indian tribe proved original tribal occupancy. Explore landcover and social vulnerability categories at these locations, and check for climate stressors such as sea level rise, flood hazards, and drought.</p>
            </div>

            <div class="impact-layers white-menu">
                <h4>Data layers include:</h4>

                <ul id="tribal-drought-layer-list">
                </ul>
            </div>

            <a href="case_tribal-drought.html" class="button bg-trans border-white hover-bg-white plus">View details</a>
          </article>


          <article id="case-tribal-flood" class="impact-banner">
            <div class="impact-banner-text">
                <h4>Case</h4>
                <h3><a href="case_ecosystems.html">Ecosystems</a></h3>
                <p>View landcover, wetlands, and rivers & streams to visualize the location and extent of land-based ecosystems. Compare their locations to climate stressors such as sea level rise and drought. </p>
            </div>

            <div class="impact-layers white-menu">
                <h4>Data layers include:</h4>

                <ul id="ecosystems-layer-list">
                </ul>
            </div>

            <a href="case_ecosystems.html" class="button bg-trans border-white hover-bg-white plus">View details</a>
          </article>


          <article id="case-tribal-flood" class="impact-banner">
            <div class="impact-banner-text">
                <h4>Case</h4>
                <h3><a href="case_human-health.html">Human Health</a></h3>
                <p>Explore areas where high percentages of residents are elderly and/or poor, and where other factors increase social vulnerability. People in these areas may require assistance during events such as heat waves, storms, or flooding. </p>
            </div>

            <div class="impact-layers white-menu">
                <h4>Data layers include:</h4>

                <ul id="human-health-layer-list">
                </ul>
            </div>

            <a href="case_human-health.html" class="button bg-trans border-white hover-bg-white plus">View details</a>
          </article>


          <article id="case-tribal-flood" class="impact-banner">
            <div class="impact-banner-text">
                <h4>Case</h4>
                <h3><a href="case_transportation.html">Transportation</a></h3>
                <p>View the location of transportation assets such as highways, bridges, and airports, and compare them with climate stressors such as innundation from sea level rise and flooding hazards.</p>
            </div>

            <div class="impact-layers white-menu">
                <h4>Data layers include:</h4>

                <ul id="transportation-layer-list">
                </ul>
            </div>

            <a href="case_transportation.html" class="button bg-trans border-white hover-bg-white plus">View details</a>
          </article>

        </section>
    </div>
</div>

<?php include_once('template/footer.php'); ?>

<script>

  $.getJSON('./resources/data/data.json', function(data) {
    var li;
    $.each(data.cases.drought.layers, function(i, layer) {
      li = '<li>'+data.layers[layer].title+'</li>';
      $('#drought-layer-list').append(li);
    });

    $.each(data.cases.coastal_flooding.layers, function(i, layer) {
      li = '<li>'+data.layers[layer].title+'</li>';
      $('#coastal-flooding-layer-list').append(li);
    });

    $.each(data.cases.flooding.layers, function(i, layer) {
      li = '<li>'+data.layers[layer].title+'</li>';
      $('#flooding-layer-list').append(li);
    });

    $.each(data.cases.tribal_flooding.layers, function(i, layer) {
      li = '<li>'+data.layers[layer].title+'</li>';
      $('#tribal-flooding-layer-list').append(li);
    });

    $.each(data.cases.tribal_drought.layers, function(i, layer) {
      li = '<li>'+data.layers[layer].title+'</li>';
      $('#tribal-drought-layer-list').append(li);
    });

    $.each(data.cases.ecosystems.layers, function(i, layer) {
      li = '<li>'+data.layers[layer].title+'</li>';
      $('#ecosystems-layer-list').append(li);
    });

    $.each(data.cases.human_health.layers, function(i, layer) {
      li = '<li>'+data.layers[layer].title+'</li>';
      $('#human-health-layer-list').append(li);
    });

    $.each(data.cases.transportation.layers, function(i, layer) {
      li = '<li>'+data.layers[layer].title+'</li>';
      $('#transportation-layer-list').append(li);
    });
  });

</script>

</body>
</html>
