<?php
include_once('functions.php');
$share_data['url'] = current_URL();

$param = isset($_GET['param']) ? $_GET['param'] : '';

if ($param != 'coastal' && $param != 'health' && $param != 'water' && $param != 'ecosystems' && $param != 'tribal_nations' && $param != 'transportation') {
    header("Location:error.php");
}

$param = xss_clean($param);
// unnecessary but doesn't hurt.
$param =  filter_var($param, FILTER_SANITIZE_STRING);
?>
<!doctype html>
<html>
<head>
    <title>Climate Explorer</title>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" media="screen" href="resources/css/screen.css">
    <link rel="stylesheet" media="screen" href="resources/css/mods.css">

    <script type="text/javascript" src="./resources/js/jquery.min.js"></script>
    <script type="text/javascript" src="./resources/js/jquery-ui.min.js"></script>

    <?php
    echo opengraph_output($share_data);
    ?>

    <style>



    </style>

</head>

<body id="page-topic-<?php echo $param; ?>" class="page-type-topic">

<?php include_once('template/header.php'); ?>

<div id="viewport">
    <div id="main-content-wrap">

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
                <h1><?php echo str_replace("_", " ", $param) ?></h1>
                <p id="topic-description"></p>
            </div>

            <div id="subtopics-menu" class="white-menu">
              <h4>Impacts</h4>
              <ul id="subtopics-list">

              </ul>
              <a href="case.php?id=<?php echo $param ?>&group=all" id="subtopics-view-all" class="button display-block border-white color-orange arrow-right">View all layers for topic</a>
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
      li = '<li><a href="#<?php echo $param; ?>-' + i + '">' + group.title + '</a></li>';
      $('#subtopics-list').append(li);

      var html = '<article id="<?php echo $param ?>-' + i + '" class="topic-banner">'+
        '<div class="topic-banner-text">'+
            '<h4>Impact</h4>'+
            '<h3><a href="case.php?id=<?php echo $param ?>&group='+i+'">'+group.title+'</a></h3>'+
            '<p>'+group.description+'</p>'+
        '</div>'+
        '<div class="topic-layers white-menu">'+
            '<h4>Data layers include:</h4>'+
            '<ul id="'+i+'-layer-list">'+
            '</ul>'+
        '</div>'+
        '<a href="case.php?id=<?php echo $param ?>&group='+i+'" class="button bg-trans border-white hover-bg-white plus">View details</a>'+
      '</article>';

      $('#subtopics').append(html);

      $.each(group.layers, function(f, layer) {
        //console.log('layer', layer, 'data.layers', data.layers);
        var li = '<li>'+data.layers[layer].title+'</li>';
        $('#'+i+'-layer-list').append(li);
      });
    });
  });

  (function ($) {
    $(function () {

      $('body').on('click', '#subtopics-list a', function(e) {
        e.preventDefault();

        var link_href = $(this).attr('href');
        var viewport_scrolltop = $('#viewport').scrollTop();
        var element_position = $(link_href).offset().top;
        var destination = viewport_scrolltop + element_position;

        $('#viewport').animate({
          scrollTop: destination - $('#main-header').outerHeight()
        }, 1000);

      });

    });
  }(jQuery));


</script>

</body>
</html>
