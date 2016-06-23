<div id="desktop-warning">
  <p>The Climate Explorer is optimized for desktop use. Please visit the site on a desktop computer.</p>
</div>

<!-- START:JS_LOADER -->

<script type="text/javascript" src="<?php $current_domain ?>resources/js/lodash.js"></script>
<script type="text/javascript" src="<?php $current_domain ?>resources/js/proj4.js"></script>

<script type="text/javascript" src="<?php $current_domain ?>resources/js/chart/chart.core.js"></script>
<script type="text/javascript" src="<?php $current_domain ?>resources/js/chart/chart.line.js"></script>

<script type="text/javascript" src="<?php $current_domain ?>resources/js/formstone/core.js"></script>
<script type="text/javascript" src="<?php $current_domain ?>resources/js/formstone/mediaquery.js"></script>
<script type="text/javascript" src="<?php $current_domain ?>resources/js/formstone/touch.js"></script>
<script type="text/javascript" src="<?php $current_domain ?>resources/js/formstone/scrollbar.js"></script>
<script type="text/javascript" src="<?php $current_domain ?>resources/js/formstone/dropdown.js"></script>
<script type="text/javascript" src="<?php $current_domain ?>resources/js/formstone/equalize.js"></script>
<script type="text/javascript" src="<?php $current_domain ?>resources/js/formstone/swap.js"></script>
<script type="text/javascript" src="<?php $current_domain ?>resources/js/formstone/tabs.js"></script>

<script type="text/javascript" src="<?php $current_domain ?>resources/js/lc_switch.min.js"></script>
<script type="text/javascript" src="<?php $current_domain ?>resources/js/jquery.cycle2.min.js"></script>
<script type="text/javascript" src="<?php $current_domain ?>resources/js/jquery.waypoints.min.js"></script>
<script type="text/javascript" src="<?php $current_domain ?>resources/js/jquery.waypoints.sticky.min.js"></script>
<script type="text/javascript" src="<?php $current_domain ?>resources/js/split-pane.min.js"></script>
<script type="text/javascript" src="<?php $current_domain ?>resources/js/download.js"></script>
<script type="text/javascript" src="<?php $current_domain ?>resources/js/jquery.hoverintent.min.js"></script>

<script type="text/javascript" src="<?php $current_domain ?>resources/js/tether.js"></script>
<script type="text/javascript" src="<?php $current_domain ?>resources/js/shepherd.min.js"></script>

<script type="text/javascript" src="<?php $current_domain ?>resources/js/variables.js"></script>
<script type="text/javascript" src="<?php $current_domain ?>resources/js/location.js"></script>
<script type="text/javascript" src="<?php $current_domain ?>resources/js/cwg/climate-widget-graph.js"></script>

<script type="text/javascript" src="<?php $current_domain ?>resources/js/sweetalert.min.js"></script>

<script type="text/javascript" src="<?php $current_domain ?>resources/js/ol.js"></script>
<script type="text/javascript" src="<?php $current_domain ?>resources/js/ol3-popup.js"></script>
<script type="text/javascript" src="<?php $current_domain ?>resources/js/main.js"></script>

<!-- if CASE -->
<?php if (isset($case) && $case != null) { ?>
  <script type="text/javascript" src="<?php $current_domain ?>resources/js/multigraph-nojq.min.js"></script>
  <script type="text/javascript" src="<?php $current_domain ?>resources/js/impacts.js"></script>
  <script>
    $(document).ready(function() {
      impacts = new Impacts(<?php echo "'" . $case . "'"; ?>);
    });
  </script>

<?php } ?>

<script src="http://maps.googleapis.com/maps/api/js?sensor=false&amp;libraries=places"></script>
<script src="<?php $current_domain ?>resources/js/formmapper.js"></script>

<script type="text/javascript" src="<?php $current_domain ?>resources/js/chart.js"></script>
<script type="text/javascript" src="<?php $current_domain ?>resources/js/global_functions.js"></script>

<?php if (isset($active_variable) && $active_variable != null) { ?>
  <script>
    $(document).ready(function() {
      variables = new Variables(<?php echo "'" . $active_variable . "'"; ?>);
    });
  </script>
<?php } ?>

<?php if (isset($location) && $location != null) { ?>
  <script>
    $(document).ready(function() {
      loc = new Location(<?php echo "'" . $lat . "'"; ?>, <?php echo "'" . $lon . "'"; ?>);
    });
  </script>
<?php } ?>

<script>
  $(document).ready(function() {
    app = new App();
  });
</script>

<!-- END:JS_LOADER -->
