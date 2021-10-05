export default (config) => `
<div id="desktop-warning">
  <p>The Climate Explorer is optimized for desktop use. Please visit the site on a desktop computer.</p>
</div>

<!-- START candidates for minification -->
<script type="text/javascript" src="/vendor/formstone/core.js"></script>
<script type="text/javascript" src="/vendor/formstone/mediaquery.js"></script>
<script type="text/javascript" src="/vendor/formstone/touch.js"></script>
<script type="text/javascript" src="/vendor/formstone/scrollbar.js"></script>
<script type="text/javascript" src="/vendor/formstone/dropdown.js"></script>
<script type="text/javascript" src="/vendor/formstone/equalize.js"></script>
<script type="text/javascript" src="/vendor/formstone/swap.js"></script>
<script type="text/javascript" src="/vendor/lc_switch.min.js"></script>
<script type="text/javascript" src="/vendor/jquery.cycle2.min.js"></script>
<script type="text/javascript" src="/vendor/jquery.waypoints.min.js"></script>
<script type="text/javascript" src="/vendor/jquery.waypoints.sticky.min.js"></script>
<script type="text/javascript" src="/vendor/download.js"></script>
<script type="text/javascript" src="/vendor/jquery.hoverintent.min.js"></script>
<script type="text/javascript" src="/vendor/sweetalert.min.js"></script>
<script type="text/javascript" src="/vendor/tether.js"></script>
<script type="text/javascript" src="/vendor/shepherd.min.js"></script>
<script type="text/javascript" src="/vendor/formmapper.js"></script>
<script type="text/javascript" src="https://unpkg.com/tooltip.js@^1"></script>
<!--<script type="text/javascript" src="https://unpkg.com/popper.js@1"></script>-->
<!--<script type="text/javascript" src="https://unpkg.com/tippy.js@4"></script>-->

<!-- END candidates for minification -->

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${config.google_analytics_id}"></script>

<script>
  var s = document.createElement("script");
  s.type = "text/javascript";
  s.src = window.location.hostname === 'climate.toolkit.gov' ?
          "https://maps.googleapis.com/maps/api/js?sensor=false&amp;libraries=places&client=gme-noaa&channel=OAR.CLIMATE_GOV_CLIMATE_EXPLORER2" :
          // "https://maps.googleapis.com/maps/api/js?key=AIzaSyBSjujKAutsVyR0GcsfXJvGA-J-54zWT2U&libraries=places";
          "https://maps.googleapis.com/maps/api/js?key=AIzaSyDaYwc02FeOuyyFWflk0wXnaHeezhxVW1w&libraries=places";
  document.head.appendChild(s);
</script>

<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${config.google_analytics_id}',{
      'custom_map': {
        'dimension1': 'uuid',
      }
     });
</script>
`
