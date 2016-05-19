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

        <section id="topic-splash" class="page-splash">
            <div class="splash-text">
                <h4>Topic</h4>
                <h1>Ecosystem Vulnerability</h1>
                <p>Despite extensive human engineering of Earth’s resources, our economy and culture continue to depend on natural ecosystem services for food, timber, clean water, and more.</p>
            </div>

            <div id="subtopics-menu" class="white-menu">
              <h4>Sub-topics</h4>
              <ul>
                <li><a href="#subtopic-coastal-flooding" class="smooth-scroll">Coastal Flooding</a></li>
                <li><a href="#subtopic-fire-regimes" class="smooth-scroll">Drought</a></li>
              </ul>
              <a href="case.php?id=" id="subtopics-view-all" class="button display-block border-white color-orange arrow-right">View all</a>
            </div>
        </section>

        <section id="subtopics" class="topics-list">
          
          <?php
            
            // BEGIN LOOP
            
            $subtopic = 'coastal-flooding';
            
            $subtopic_ID = 'subtopic-' . $subtopic;
            
          ?>
          
          <article id="<?php echo $subtopic_ID; ?>" class="topic-banner">
            <div class="topic-banner-text">
                <h4>Sub-topic</h4>
                <h3><a href="case.php?id=coastal-flooding">Coastal Flooding</a></h3>
                <p>Municipalities and property owners can check their vulnerability to coastal flooding. Map layers show areas of current flood hazards as well as visualizations of flooding from future sea level rise.</p>
            </div>

            <div class="topic-layers white-menu">
                <h4>Data layers include:</h4>

                <ul id="coastal-flooding-layer-list">
                </ul>
            </div>

            <a href="case.php?id=coastal-flooding" class="button bg-trans border-white hover-bg-white plus">View details</a>
          </article>
          
          <?php
            
            // END LOOP
            
          ?>

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
