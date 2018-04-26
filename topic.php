<?php
include_once('functions.php');
$share_data['url'] = current_URL();

$param = isset($_GET['param']) ? $purifier->purify($_GET['param']) : '';

$param = filter_var($param, FILTER_SANITIZE_STRING);

if ($param != 'coastal' && $param != 'health' && $param != 'water' && $param != 'ecosystems' && $param != 'tribal_nations' && $param != 'transportation') {
  header("Location:error.php");
}
?>
<!doctype html>
<html>
<head>
  <?php include_once('template/head.php') ?>

  <?php
  echo opengraph_output($share_data);
  ?>
</head>

<body id="page-station-<?php echo $param; ?>" class="page-type-stations">

<?php include_once('template/header.php'); ?>

<div id="viewport">
  <div id="main-content-wrap">

    <section id="station-splash" class="page-splash">
      <div class="splash-text">
        <h4>station</h4>
        <h1><?php echo str_replace("_", " ", $param) ?></h1>
        <p id="station-description"></p>
      </div>

      <div id="substations-menu" class="white-menu">
        <h4>Impacts</h4>
        <ul id="substations-list">

        </ul>
        <a href="/case.php?id=<?php echo $param ?>&group=all" id="substations-view-all"
           class="button display-block border-white color-orange arrow-right">View all layers for station</a>
      </div>
    </section>

    <section id="substations" class="stations-list"></section>

    <?php include_once('template/share.php'); ?>

  </div>
</div>

<?php include_once('template/footer.php'); ?>


<script>
  $.getJSON('/resources/data/data-grouped.json', function (data) {
    var li;
    var desc = data.stations['<?php echo $param ?>'].description;
    $('#station-description').html(desc);

    $.each(data.stations['<?php echo $param; ?>'].groups, function (i, group) {
      li = '<li><a href="/#<?php echo $param; ?>-' + i + '">' + group.title + '</a></li>';
      $('#substations-list').append(li);

      var html = '<article id="<?php echo $param ?>-' + i + '" class="station-banner">' +
        '<div class="station-banner-text">' +
        '<h4>Impact</h4>' +
        '<h3><a href="/case.php?id=<?php echo $param ?>&group=' + i + '">' + group.title + '</a></h3>' +
        '<p>' + group.description + '</p>' +
        '</div>' +
        '<div class="station-layers white-menu">' +
        '<h4>Data layers include:</h4>' +
        '<ul id="' + i + '-layer-list">' +
        '</ul>' +
        '</div>' +
        '<a href="/case.php?id=<?php echo $param ?>&group=' + i + '" class="button bg-trans border-white hover-bg-white plus">View details</a>' +
        '</article>';

      $('#substations').append(html);

      $.each(group.layers, function (f, layer) {
        //console.log('layer', layer, 'data.layers', data.layers);
        var li = '<li>' + data.layers[layer].title + '</li>';
        $('#' + i + '-layer-list').append(li);
      });
    });
  });

  (function ($) {
    $(function () {

      $('body').on('click', '#substations-list a', function (e) {
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
