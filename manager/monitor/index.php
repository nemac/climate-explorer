<?php
require_once("includes/autoload.php");

if(!$login->LoggedIn) {
	Header("Location: signin.php");
	die();
}
if(isset($_GET['signout'])) {
	$cookie->Delete("LoggedIn_Token");
	header("Location: signin.php");
	die();
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="robots" content="noindex, nofollow">
	<meta name="author" content="Justin991q">

	<title><?php echo $config['name']; ?></title>

	<link rel="icon" href="assets/images/icon.png">
	
	<link href="assets/css/bootstrap.min.css" rel="stylesheet">
	<link href="assets/css/jumbotron-narrow.css" rel="stylesheet">
	<link href="assets/font-awesome/css/font-awesome.min.css" rel="stylesheet">

	<script src="assets/js/jquery.min.js"></script>
	<script src="assets/js/bootstrap.min.js"></script>
	<script src="assets/js/jquery.knob.min.js"></script>
	<script src="assets/js/google.js"></script>

	<script type="text/javascript">
		$(function () {
			$('[data-toggle="tooltip"]').tooltip()
			$(".dial").knob();
		})
	</script>
	<!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
	<!--[if lt IE 9]>
		<script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
		<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
	<![endif]-->
</head>

<body>
<div class="container">
	<div class="header clearfix">
		<nav>
			<ul class="nav nav-pills pull-right">
				<li class="<?php echo $function->Active_Page("/").$function->Active_Page("dashboard"); ?>"><a href="index.php">Dashboard</a></li>
				<li class="<?php echo $function->Active_Page("server_manager"); ?>"><a href="index.php?p=server_manager">Server Manager</a></li>
				<li class="<?php echo $function->Active_Page("pushbullet"); ?>"><a href="index.php?p=pushbullet">Pushbullet</a></li>
				<li class="<?php echo $function->Active_Page("version"); ?>"><a href="index.php?p=version">Version</a></li>
				<?php
					if($login->Access()) {
				?>
					<li class="dropdown">
						<a id="drop5" href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
							Administration
							<span class="caret"></span>
						</a>
						<ul id="menu2" class="dropdown-menu" aria-labelledby="drop5">
							<li><a href="index.php?p=config">Config</a></li>
							<li><a href="index.php?p=users">User Management</a></li>
						</ul>
					</li>
			<?php }	?>
				<li class="dropdown">
					<a id="drop5" href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
						<?php echo html($login->username); ?>
						<span class="caret"></span>
					</a>
					<ul id="menu2" class="dropdown-menu" aria-labelledby="drop5">
						<li><a href="index.php?p=account_settings">Account Settings</a></li>
						<li><a href="index.php?signout">Sign Out</a></li>
					</ul>
				</li>
			</ul>
		</nav>
		<h3 class="text-muted"><?php echo $config['name']; ?></h3>
	</div>
	<?php
		if($function->IsInstalled() == 2) {
			echo '<div class="alert alert-danger">The <b>/install/</b> folder is still exist, please remove the <b>/install/</b> folder.</div>';
		}elseif(DEMO == 1) {
			echo '<div class="alert alert-danger">This is a demo version which is for testing purposes only. Due to safety reasons we have disabled some features.</div>';
		}
		include("includes/pagesystem.php");
	?>

	<footer class="footer">
		<p>&copy; <?php echo $config['name']; ?> <?php echo (date('Y') - 1)." - ".date('Y'); ?>. Version: <?php echo $config['version']; ?></p>
	</footer>
</div>
</body>
</html>
<?php
$db->close();
?>