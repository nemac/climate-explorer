<?php
require_once("includes/autoload.php");
if($login->LoggedIn) {
	Header("Location: index.php");
	die();
}

if($config['register'] == "0") {
	Header("Location: signin.php");
	die();
}

$output = "";
$username = "";
$email = "";

$showform = true;

$form_names = array(
					"username" => array("required" => 1),
					"email" => array("required" => 1),
					"password" => array("required" => 1),
					"r_password" => array("required" => 1),
					"captcha" => array("required" => 1)
				);
	
if(isset($_POST['log-me-in'])) {
	$username = ((!empty($_POST['username'])) ? $_POST['username'] : "");
	$email = ((!empty($_POST['email'])) ? $_POST['email'] : "");
	if($csrf->CheckForms($form_names)) {
		if($csrf->CheckToken()) {
			if($_SESSION['captcha'] != hash("sha256", $_POST['captcha'])) {
				$output = '<div class="alert alert-danger">Your captcha is not correct.</div>';
			}else{
				try {
					if($config['captcha'] == "1") { $captcha = $_POST['captcha']; }
					$login->AddUser($_POST['username'], $_POST['email'], $_POST['password'], $_POST['r_password']);
					$output = '<div class="alert alert-success">Welcome '.html($_POST['username']).', your account is now created. You can now sign in with your given credentials</div>';
					$showform = false;
				}
				catch(LoginError $e) {
					$output = '<div class="alert alert-danger">'.$e->getMessage().'</div>';
				}
			}
		}else{
			$output = '<div class="alert alert-danger">Invalid CSRF Token, please refresh the page.</div>';
		}
	}else{
		$output = '<div class="alert alert-danger">Please fill in all fields.</div>';
	}
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
		
		<link rel="icon" href="assets/images/icon.png">
	
	
		<title><?php echo $config['name']; ?> - Sign In</title>

		<link href="assets/css/bootstrap.min.css" rel="stylesheet">
		<link href="assets/css/signin.css" rel="stylesheet">

		<!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
		<!--[if lt IE 9]>
			<script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
			<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
		<![endif]-->
	</head>
	<body>
	<div class="login-body">
    <article class="container-login center-block">
		<section>
			<?php
			if(DEMO == 1) {
				echo '<div class="alert alert-danger">This is a demo version which is for testing purposes only. Due to safety reasons we have disabled some features.</div>';
			}
			?>
			<h2><?php echo $config['name']; ?></h2>
			<ul id="top-bar" class="nav nav-tabs nav-justified">
				<li><a href="signin.php">Sign In</a></li>
				<li class="active"><a href="register.php">Sign Up</a></li>
			</ul>
			<div class="tab-content tabs-login col-lg-12 col-md-12 col-sm-12 cols-xs-12">
				<div id="login-access" class="tab-pane fade active in">
					<h2><i class="glyphicon glyphicon-log-in"></i> Sign Up</h2>
					<?php echo $output; ?>
					
					<?php if($showform == true) { ?>
					<form method="post" accept-charset="utf-8" autocomplete="off" role="form" class="form-horizontal">
						<?php echo $csrf->CreateInput(); ?>
					
						<div class="form-group">
							<input type="text" class="form-control" name="username" id="login_value" placeholder="Username" tabindex="1" value="<?php echo $username; ?>" autofocus required />
						</div>
						
						<div class="form-group">
							<input type="email" class="form-control" name="email" id="login_value" placeholder="Email" tabindex="2" value="<?php echo $email; ?>" required />
						</div>
						
						<div class="form-group">
							<input type="password" class="form-control" name="password" id="password" placeholder="Password" value="" tabindex="3" required />
						</div>
						
						<div class="form-group">
							<input type="password" class="form-control" name="r_password" id="password" placeholder="Repeat password" value="" tabindex="4" required />
						</div>
						
						<div class="form-group">
							<input type="text" class="form-control" name="captcha" id="Captcha" placeholder="Captcha" value="" tabindex="5" required /><br />
							<img src="assets/captcha/image.php" />
						</div>
						
						<br/>
						<div class="form-group ">				
							<button type="submit" name="log-me-in" id="submit" tabindex="6" class="btn btn-lg btn-primary">Sign In</button>
						</div>
					</form>	
					<?php } ?>					
				</div>
			</div>
		</section>
	</article>
	</body>
</html>
<?php
$db->close();
?>