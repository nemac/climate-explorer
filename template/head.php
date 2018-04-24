<title>Climate Explorer</title>

<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="shortcut icon" href="https://toolkit.climate.gov/sites/default/files/favicon_2.ico" type="image/vnd.microsoft.icon">

<link rel="stylesheet" media="screen" href="/resources/css/screen.css">

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js" integrity="sha256-KM512VNnjElC30ehFwehXjx1YCHPiQkOPmqnrWtpccM=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.1/Chart.bundle.min.js" integrity="sha256-N4u5BjTLNwmGul6RgLoESPNqDFVUibVuOYhP4gJgrew=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js" integrity="sha256-8E6QUcFg1KTnpEU8TFGhpTGHw5fJqB9vCms3OhAYLqw=" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/es6-promise@4.2.4/dist/es6-promise.auto.min.js" integrity="sha384-tQnfZyyk7ZX5leaWDkq9qAvwSkSvH0ouVfrxLn12X9Y2DS8nDa8pHXFH9LLKJdo/" crossorigin="anonymous"></script>

<script type="text/javascript" src="/resources/js/ce.js"></script>

<script type="text/javascript" src="/resources/js/spinner.js"></script>

<script>
  var s = document.createElement("script");
  s.type = "text/javascript";
  s.src = window.location.hostname === 'climate.toolkit.gov' ?
    "https://maps.googleapis.com/maps/api/js?sensor=false&amp;libraries=places&client=gme-noaa&channel=OAR.CLIMATE_GOV_CLIMATE_EXPLORER2" :
    "https://maps.googleapis.com/maps/api/js?key=AIzaSyBSjujKAutsVyR0GcsfXJvGA-J-54zWT2U&libraries=places";
  document.head.appendChild(s);
</script>