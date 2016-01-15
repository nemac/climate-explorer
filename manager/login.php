<?
$public = true;
include 'config.php';

// POST DECLARATIONS
$post_login = isset($_POST['login']) ? $_POST['login'] : '';
$post_email = isset($_POST['email']) ? $_POST['email'] : '';
$post_password = isset($_POST['password']) ? $_POST['password'] : '';

$email_error = isset($email_error) ? $email_error : '';
$password_error = isset($password_error) ? $password_error : '';


if ((empty($post_email)) && ($post_login))
{
    $email_error = "<label class='error'>Please enter your email</label>";
}

if ((empty($post_password)) && ($post_login))
{
    $password_error = "<label class='error'>Please enter your password</label>";
}

if ($post_email && $post_login && $post_password)
{
    $md5pass = md5($post_password);
    $userQuery = mysqli_query($con,"SELECT * FROM users WHERE user_email = '$post_email' limit 1")
    or die("database tables are messed up");

    if (mysqli_num_rows($userQuery) != 0)
    {
        $userArray = mysqli_fetch_array($userQuery);
        if (($post_email != $userArray['user_email'])&&($post_login))
        {
            $notification = inlineAlert("danger","E-Mail does not exist","E-Mail specified does not exist in our database.",1);
        }
        if ((stripslashes($userArray["user_password"]) != $md5pass)&&($post_login)&&($post_password))
        {
            $password_error = "<label class='error'>Incorrect Password</label>";
        }
        else
        {
            if (($post_email == $userArray['user_email'])&&($md5pass == $userArray['user_password']))
            {

                if ($userArray['user_access_level'] != 1){
                    echo "<h2>You don't have the appropriate authorization.</h2>";
                    die();
                } if ($userArray['user_active'] != 1){
                    echo "<h2>Your account is not active</h2>";
                    die();
                } else {
                    $_SESSION['first_name'] = $userArray['user_first_name'];
                    $_SESSION['last_name'] = $userArray['user_last_name'];
                    $_SESSION['user_id'] = $userArray['user_id'];
                    $_SESSION['access_level'] = $userArray['user_access_level'];
                    $_SESSION['email'] = $userArray['user_email'];
                    $curtime = time();
                    $ip = $_SERVER['REMOTE_ADDR'];
                    $result = mysqli_query($con, "UPDATE users SET user_last_login_time = '$curtime', user_last_login_ip = '$ip' where user_id = '$userArray[user_id]'") or die(mysql_error());
                    if ($result) {
                        header("Location:./");
                    }
                }
            }
        }
    }

}
?>
<!doctype html>
<html class="fixed">
<head>

    <!-- Basic -->
    <meta charset="UTF-8">

    <meta name="keywords" content="HTML5 Admin Template" />
    <meta name="description" content="Porto Admin - Responsive HTML5 Template">
    <meta name="author" content="okler.net">

    <!-- Mobile Metas -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

    <!-- Web Fonts  -->
    <link href="http://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700,800|Shadows+Into+Light" rel="stylesheet" type="text/css">

    <!-- Vendor CSS -->
    <link rel="stylesheet" href="template/assets/vendor/bootstrap/css/bootstrap.css" />

    <link rel="stylesheet" href="template/assets/vendor/font-awesome/css/font-awesome.css" />
    <link rel="stylesheet" href="template/assets/vendor/magnific-popup/magnific-popup.css" />
    <link rel="stylesheet" href="template/assets/vendor/bootstrap-datepicker/css/datepicker3.css" />

    <!-- Theme CSS -->
    <link rel="stylesheet" href="template/assets/stylesheets/theme.css" />
    <link rel="stylesheet" href="template/assets/stylesheets/theme-custom.css" />

    <!-- Skin CSS -->
    <link rel="stylesheet" href="template/assets/stylesheets/skins/default.css" />
    <!-- Head Libs -->
    <script src="template/assets/vendor/modernizr/modernizr.js"></script>
</head>
<body>
<!-- start: page -->
<section class="body-sign">
    <div class="center-sign">
        <div class="panel panel-sign">
            <div class="modal_logo">
                <a href="./"><?=$setting_site_name?></a>
            </div>
            <div class="panel-title-sign mt-xl text-right">
                <h2 class="title text-uppercase text-bold m-none"><i class="fa fa-user mr-xs"></i> Sign In</h2>
            </div>
            <div class="panel-body">
                <form action="./login" method="post">
                    <div class="form-group mb-lg<? if ($username_error) echo " has-error";?>">
                        <label>Email</label>
                        <div class="input-group input-group-icon">
                            <input name="email" type="text" class="form-control input-lg" TABINDEX="1" value="<?=$post_email?>" />
                            <?=$email_error?>
                            <span class="input-group-addon">
                                <span class="icon icon-lg">
                                    <i class="fa fa-user"></i>
                                </span>
                            </span>
                        </div>
                    </div>

                    <div class="form-group mb-lg<? if ($password_error) echo " has-error";?>">
                        <div class="clearfix">
                            <label class="pull-left">Password</label>
                            <a href="./recover" class="pull-right">Lost Password?</a>
                        </div>
                        <div class="input-group input-group-icon">
                            <input name="password" type="password" class="form-control input-lg" tabindex="2" value="<?=$post_password?>" />
                            <?=$password_error?>
                            <span class="input-group-addon">
                                <span class="icon icon-lg">
                                    <i class="fa fa-lock"></i>
                                </span>
                            </span>

                        </div>
                    </div>

                    <div class="row">
                        <div class="col-sm-8">
                            <div class="checkbox-custom checkbox-default">
                                <input id="RememberMe" name="rememberme" type="checkbox"/>
                                <label for="RememberMe">Remember Me</label>
                            </div>
                        </div>
                        <div class="col-sm-4 text-right">
                            <button type="submit" name="login" value="1" class="btn btn-primary hidden-xs">Sign In</button>
                            <button type="submit" name="login" value="1" class="btn btn-primary btn-block btn-lg visible-xs mt-lg">Sign In</button>
                        </div>
                    </div>

							<span class="mt-lg mb-lg line-thru text-center text-uppercase">
								<span>or</span>
							</span>

                    <p class="text-center">Don't have an account yet? <a href="./register">Sign Up!</a>

                </form>
            </div>
        </div>

        <p class="text-center text-muted mt-md mb-md">&copy; Copyright 2014. All Rights Reserved.</p>
    </div>
</section>
<!-- end: page -->

<!-- Vendor -->
<script src="template/assets/vendor/jquery/jquery.js"></script>
<script src="template/assets/vendor/jquery-browser-mobile/jquery.browser.mobile.js"></script>
<script src="template/assets/vendor/bootstrap/js/bootstrap.js"></script>
<script src="template/assets/vendor/nanoscroller/nanoscroller.js"></script>
<script src="template/assets/vendor/bootstrap-datepicker/js/bootstrap-datepicker.js"></script>
<script src="template/assets/vendor/magnific-popup/magnific-popup.js"></script>
<script src="template/assets/vendor/jquery-placeholder/jquery.placeholder.js"></script>

<!-- Theme Base, Components and Settings -->
<script src="template/assets/javascripts/theme.js"></script>

<!-- Theme Custom -->
<script src="template/assets/javascripts/theme.custom.js"></script>

<!-- Theme Initialization Files -->
<script src="template/assets/javascripts/theme.init.js"></script>

</body>
</html>