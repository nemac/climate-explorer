<?php
include_once('functions.php');
$page_slug = basename(__FILE__, '.php');

?>
<!doctype html>
<html>
<head>
    <title>404 - File Not Found</title>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="/resources/css/ol3-popup.css">

    <link rel="stylesheet" media="screen" href="/resources/css/screen.css">
    <link rel="stylesheet" media="screen" href="/resources/css/mods.css">

    <script type="text/javascript" src="/resources/js/jquery.min.js"></script>
    <script type="text/javascript" src="/resources/js/jquery-ui.min.js"></script>

    <?php

    $share_data['url'] = current_URL();
    $share_data['title'] = 'ERROR';


    ?>

</head>

<body id="page-about" class="page-type-text">
<div class="cd-cover-layer"></div>
<?php include_once('template/header.php'); ?>

<div id="viewport">
    <div id="main-content-wrap">

        <?php include_once('template/share.php'); ?>

        <section id="standard-splash" class="page-splash">
            <div class="splash-text">
                <h1>404</h1>
            </div>
        </section>

        <section id="standard-body" class="page-text">
            <hr>
            <h2>File Not Found</h2>
        </section>


    </div>
</div>

<?php include_once('template/footer.php'); ?>

<script src="/resources/js/cwg/climate-widget-graph.js"></script>
<script src="/resources/js/cwg/cwg.js"></script>

</body>
</html>
