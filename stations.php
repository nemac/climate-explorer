<!doctype html>
<html>
<head>
  <?php include_once('template/head.php'); ?>
  <meta property="fb:app_id" content="187816851587993">
  <!--  todo absolute url-->
  <meta property="og:url" content="/stations.php"/>
  <meta property="og:type" content="article">
  <meta property="og:title" content="Variables">
  <meta property="og:description"
        content="The Climate Explorer allows you to view historical and projected climate trends and assess the impacts of climate change on the things you care about">
  <meta property="og:image" content="/resources/img/og.jpg">
</head>

<body id="page-stations" class="page-type-stations">
<div class="cd-cover-layer"></div>
<?php include_once('template/header.php'); ?>

<header id="left-header">
  <span class="trigger icon icon-close" id="left-header-trigger"></span>

  <ul id="vars-menu" class="menu blue-menu">
    <li class="search-field border" id="stations-search-by-location"><span class="icon icon-search"></span>
      <input type="text" id="formmapper" placeholder="Zoom to location">
    </li>

    <li class="select border" id="stations-options-container">
      <select title="" class="dropdown" id="stations-options">
        <option value="daily_vs_climate">Daily vs. Climate</option>
        <option value="thresholds">Thresholds</option>
        <option value="high_tide_flooding">High-tide Flooding</option>

      </select>
    </li>

    <li class="about-link"><a href="#detail-daily_vs_climate" class="nav-detail-link" id="about-stations-link">About Daily vs.
        Climate</a></li>
  </ul>

  <div id="vars-legend" class="legend-wrap left-filler"></div>
</header>

<div id="viewport">
  <div id="main-content-wrap">

    <div id="stations-map"></div>

    <?php include_once('template/share.php'); ?>

    <!-- begin weather stations map -->

    <div id="stations-spinner"></div>

    <div id="station-overlay-container"></div>

  </div>
</div>

<div id="desktop-warning">
  <p>The Climate Explorer is optimized for desktop use. Please visit the site on a desktop computer.</p>
</div>

<?php include_once('template/footer.php')?>

<script type="text/javascript" src="/resources/js/stations.js"></script>
<script  type="text/javascript"  src="/resources/tidal/tidalstationswidget.js"></script>
<script type="text/javascript" src="/resources/js/cwg/climate-widget-graph.js"></script>

<script type="text/javascript" src="/resources/js/cwg/cwg.js"></script>


<script type="text/javascript" defer src="/resources/js/main.js"></script>


<script src="/resources/js/formmapper.js"></script>

<script src="/resources/js/ce.js"></script>


<script type="text/javascript" src="/resources/js/station-charts.js"></script>


<script>
  $(document).ready(function () {
    app = new App(<?php echo "'" . $data_base_url . "'"; ?>);
  });
  $(document).ready(function () {
    var stationsMapState = window.ce.ce("getStationsMapState");
    window.stations = $('#stations-map').stationsMap(Object.assign({
      // When state changes, just pass the current options along directly for this page.
      // If we re-use the stationsMap widget on another page there may be more handling to do.
      change: function (event, options) {window.ce.ce('setStationsMapState', options);}
    }, stationsMapState));

    if (stationsMapState.mode) {
      $("#stations-options").val(stationsMapState.mode);
      $("option[value=" + stationsMapState.mode + "]").attr("selected", "selected");
    }
  });
  $(document).ready(function () {
    var initFormMapper = function () {
      $("#formmapper").formmapper({
        details: "form"
      });

      $("#formmapper").bind("geocode:result", function (event, result) {
        if (result.geometry.access_points) {
          window.stations.stationsMap({
            extent: null,
            center: [result.geometry.access_points[0].location.lat, result.geometry.access_points[0].location.lng],
            zoom: 8
          });
        } else {
          window.stations.stationsMap({extent: null, center: [result.geometry.location.lat(), result.geometry.location.lng()], zoom: 8});
        }
      });
    };
    var whenFormMapper = function () {
      if (window.google !== undefined) {
        initFormMapper();
      }
      else {
        setTimeout(whenFormMapper);
      }
    };
    whenFormMapper();

    $('#stations-options-container .fs-dropdown-item').on('click', function (e) {
      window.stations.stationsMap({mode: $(this).data().value});
      // update about link
      $('#about-stations-link').html('About ' + $(this).text());
      $('#about-stations-link').prop('href', '#detail-' + $(this).data().value);

      $('#breadcrumb .current').html($(this).text());
    });

    $('#stations-options').on('change', function () {
      $("#chart-name").html($('.fs-dropdown-selected').html());
    });

  });
</script>

<!-- END:JS_LOADER -->


</body>
</html>
