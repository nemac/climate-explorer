<div id="desktop-warning">
  <p>The Climate Explorer is optimized for desktop use. Please visit the site on a desktop computer.</p>
</div>

<!-- START candidates for minification -->
<script type="text/javascript" src="/resources/vendor/lodash.js"></script>
<script type="text/javascript" src="/resources/vendor/formstone/core.js"></script>
<script type="text/javascript" src="/resources/vendor/formstone/mediaquery.js"></script>
<script type="text/javascript" src="/resources/vendor/formstone/touch.js"></script>
<script type="text/javascript" src="/resources/vendor/formstone/scrollbar.js"></script>
<script type="text/javascript" src="/resources/vendor/formstone/dropdown.js"></script>
<script type="text/javascript" src="/resources/vendor/formstone/equalize.js"></script>
<script type="text/javascript" src="/resources/vendor/formstone/swap.js"></script>
<script type="text/javascript" src="/resources/vendor/lc_switch.min.js"></script>
<script type="text/javascript" src="/resources/vendor/jquery.cycle2.min.js"></script>
<script type="text/javascript" src="/resources/vendor/jquery.waypoints.min.js"></script>
<script type="text/javascript" src="/resources/vendor/jquery.waypoints.sticky.min.js"></script>
<script type="text/javascript" src="/resources/vendor/split-pane.min.js"></script>
<script type="text/javascript" src="/resources/vendor/download.js"></script>
<script type="text/javascript" src="/resources/vendor/jquery.hoverintent.min.js"></script>
<script type="text/javascript" src="/resources/vendor/sweetalert.min.js"></script>
<script type="text/javascript" src="/resources/vendor/tether.js"></script>
<script type="text/javascript" src="/resources/vendor/shepherd.min.js"></script>
<script type="text/javascript" src="/resources/vendor/formmapper.js"></script>
<!-- END candidates for minification -->

<script type="text/javascript" src="/resources/vendor/climate-widget-graph/climate-widget-graph.js"></script>

<script type="text/javascript" src="/resources/js/main.js"></script>

<script type="text/javascript" src="/resources/js/global_functions.js"></script>
<script type="text/javascript" src="/resources/vendor/tidal/tidalstationswidget.js"></script>


<?php if (isset($active_variable) && $active_variable != null) { ?>
  <script>
    $(document).ready(function () {
      window.variables = new Variables(<?php echo "'" . $active_variable . "'"; ?>, <?php echo "'" . $data_base_url . "'"; ?>);
    });
  </script>
<?php } ?>

<?php if (isset($location) && $location != null) { ?>
  <script>
    $(document).ready(function () {
      window.loc = new Location(<?php echo "'" . $lat . "'"; ?>, <?php echo "'" . $lon . "'"; ?>, <?php echo "'" . $stations_base_url . "'"; ?>, <?php echo "'" . $data_base_url . "'"; ?>);
    });
  </script>
<?php } ?>

<script>
  $(document).ready(function () {
    window.app = new App(<?php echo "'" . $data_base_url . "'"; ?>);
  });
</script>
