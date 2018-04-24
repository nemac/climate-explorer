<?php include_once('functions.php'); ?>
<!doctype html>
<html>
<head>
  <?php include_once ('template/head.php');?>
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

</body>
</html>
