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

      $param = $_REQUEST['param'];
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
                <h1><?php echo $param ?></h1>
                <p id="topic-description"></p>
            </div>

            <div id="subtopics-menu" class="white-menu">
              <h4>Sub-topics</h4>
              <ul id="subtopics-list">

              </ul>
              <a href="case.php?id=" id="subtopics-view-all" class="button display-block border-white color-orange arrow-right">View all</a>
            </div>
        </section>

        <section id="subtopics" class="topics-list"></section>

    </div>
</div>

<?php include_once('template/footer.php'); ?>

<script>
  $.getJSON('./resources/data/data-grouped.json', function(data) {
    var li;
    var desc = data.topics['<?php echo $param ?>'].description;
    $('#topic-description').html(desc);

    $.each(data.topics['<?php echo $param; ?>'].groups, function(i, group) {
      li = '<li>'+group.title+'</li>';
      $('#subtopics-list').append(li);

      var html = '<article id="<?php echo $param ?>" class="topic-banner">'+
        '<div class="topic-banner-text">'+
            '<h4>Sub-topic</h4>'+
            '<h3><a href="case.php?id=coastal-flooding">'+group.title+'</a></h3>'+
            '<p>'+group.description+'</p>'+
        '</div>'+
        '<div class="topic-layers white-menu">'+
            '<h4>Data layers include:</h4>'+
            '<ul id="coastal-flooding-layer-list">'+
            '</ul>'+
        '</div>'+
        '<a href="case.php?id=coastal-flooding" class="button bg-trans border-white hover-bg-white plus">View details</a>'+
      '</article>';

      $('#subtopics').append(html);
    });
  });

</script>

</body>
</html>
