// language=HTML
import {version_suffix} from "./template_utils.js";

export default (config) => `
  <title>Climate Explorer</title>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/2.10.2/umd/popper.min.js"></script>
<!--  <script src="https://unpkg.com/tippy.js@5"></script>-->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/tippy.js/6.3.2/tippy-bundle.umd.js"></script>
  <link rel="shortcut icon" href="https://toolkit.climate.gov/sites/default/files/favicon_2.ico" type="image/vnd.microsoft.icon">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" media="screen" href="/css/screen.css${version_suffix()}">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/feather-icons/4.28.0/feather.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
          crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js" integrity="sha256-KM512VNnjElC30ehFwehXjx1YCHPiQkOPmqnrWtpccM="
          crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min.js"
          integrity="sha256-AAhU14J4Gv8bFupUUcHaPQfvrdNauRHMt+S4UVcaJb0=" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/es6-promise@4.2.4/dist/es6-promise.auto.min.js"
          integrity="sha384-tQnfZyyk7ZX5leaWDkq9qAvwSkSvH0ouVfrxLn12X9Y2DS8nDa8pHXFH9LLKJdo/" crossorigin="anonymous"></script>

`
