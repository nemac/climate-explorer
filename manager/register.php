<?php
$public = true;
include 'config.php';

// POST DECLARATIONS
$post_email = isset($_POST['email']) ? $_POST['email'] : '';
$post_username = isset($_POST['username']) ? $_POST['username'] : '';
$post_register = isset($_POST['register']) ? $_POST['register'] : '';
$post_user_name = isset($_POST['user_name']) ? $_POST['user_name'] : '';
$post_first_name = isset($_POST['first_name']) ? $_POST['first_name'] : '';
$post_last_name = isset($_POST['last_name']) ? $_POST['last_name'] : '';
$post_email = isset($_POST['email']) ? $_POST['email'] : '';
$post_password = isset($_POST['password']) ? $_POST['password'] : '';
$post_password_confirm = isset($_POST['password_confirm']) ? $_POST['password_confirm'] : '';
$post_agreed = isset($_POST['agreed']) ? $_POST['agreed'] : '';

$error_first_name = isset($error_first_name) ? $error_first_name : '';
$error_user_name = isset($error_user_name) ? $error_user_name : '';
$error_email = isset($error_email) ? $error_email : '';
$error_password = isset($error_password) ? $error_password : '';
$error_password_confirm = isset($error_password_confirm) ? $error_password_confirm : '';
$error_agreed = isset($error_agreed) ? $error_agreed : '';


if ($post_email) {
    if (!check_email_address($post_email)) {
        $email_error = "<label class='error'>Invalid email address</label>";
    }
    $field = get_one_value("SELECT email FROM users WHERE email = '$post_email'");
    if (isset($field)) {
        $email_error = "<label class='error'>Email already assigned</label>";
    }
}

if ($post_username) {
    if (!checkInput_LN($post_username)) {
        $username_error = "<label class='error'>Only numbers & letters are allowed in usernames</label>";
    } else {
        $field = get_one_value("SELECT user_name FROM users WHERE user_name='$post_username'");
        if ($field) {
            $username_error = "<label class='error'>Username already assigned</label>";
        }
    }
}

if ($post_register && !$post_first_name){
    $error_first_name = "<label class='error'>Enter your first name</label>";
}
if ($post_register && !$post_user_name){
    $error_user_name = "<label class='error'>Enter your username</label>";
}
if ($post_register && !$post_email){
    $error_email = "<label class='error'>Enter your email</label>";
}
if ($post_register && !$post_password){
    $error_password = "<label class='error'>Enter your password</label>";
}
if ($post_register && !$post_password_confirm){
    $error_password_confirm = "<label class='error'>Confirm your password</label>";
}
if ($post_register && !$post_agreed){
    $error_agreed = "<label class='error'>You must agree to terms</label>";
}



if (($post_register) && ($post_first_name) && ($post_user_name) && ($post_email) && ($post_password) && ($post_password_confirm)) {
    if ($valid == 1) {
        $genpass = generatePassword(8, 0);
        $generated_password = md5($genpass);
        $join_date = time();
        $ip = $_SERVER['REMOTE_ADDR'];
        $sql = "INSERT INTO users SET
                user_name = '$_POST[username]',
                user_pass = '$generated_password',
                first_name = '$_POST[first_name]',
                last_name = '$_POST[last_name]',
                email = '$_POST[email]',
                subscribed = '$_POST[subscribed]',
                subscribed_mlr = '$_POST[subscribed_mlr]',
                subscribed_sn = '$_POST[subscribed_sn]',
                join_date = '$join_date',
                last_login_ip = '$ip'";
        $result = mysql_query($sql);
        $last_id = mysql_insert_id();
        if (!$result) {
            die(mysql_error());
        } else {
            $notification = inlineAlert("success", "$setting_sitename Registration Successful", "We just sent your login details to your email address", 0);
            $subject = "$setting_sitename Registration";
            $message = "Thank you for registering on $setting_sitename\n\nYour username is $_POST[user_name]\nYour password is $genpass\n\nPlease login at $setting_siteurl";
            $to = "$_POST[email]";
            $headers = "From: $setting_sitename<$setting_notify_email>" . "\r\n" .
                "Reply-To: $setting_sitename<$setting_notify_email>" . "\r\n" .
                "X-Mailer: PHP/" . phpversion();
            mail($to, $subject, $message, $headers);
            $done = 1;
        }
    }
}

?>

<!doctype html>
<html class="fixed">
<head>

    <!-- Basic -->
    <meta charset="UTF-8">

    <meta name="keywords" content="AppCart"/>
    <meta name="description" content="AppCart">
    <meta name="author" content="TransitNetwork.ca">

    <!-- Mobile Metas -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>

    <!-- Web Fonts  -->
    <link href="http://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700,800|Shadows+Into+Light" rel="stylesheet" type="text/css">

    <!-- Vendor CSS -->
    <link rel="stylesheet" href="template/assets/vendor/bootstrap/css/bootstrap.css"/>

    <link rel="stylesheet" href="template/assets/vendor/font-awesome/css/font-awesome.css"/>
    <link rel="stylesheet" href="template/assets/vendor/magnific-popup/magnific-popup.css"/>
    <link rel="stylesheet" href="template/assets/vendor/bootstrap-datepicker/css/datepicker3.css"/>

    <!-- Theme CSS -->
    <link rel="stylesheet" href="template/assets/stylesheets/theme.css"/>

    <!-- Skin CSS -->
    <link rel="stylesheet" href="template/assets/stylesheets/skins/default.css"/>

    <!-- Theme Custom CSS -->
    <link rel="stylesheet" href="template/assets/stylesheets/theme-custom.css">

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
                <h2 class="title text-uppercase text-bold m-none"><i class="fa fa-user mr-xs"></i> Sign Up</h2>
            </div>


            <div class="panel-body">

                <?php echo $notification; ?>

                <form method="post" action="register.php">
                    <div class="form-group mb-none">
                        <div class="row">
                            <div class="col-sm-6 mb-lg<? if ($error_first_name) echo " has-error";?>">
                                <label>First Name</label>
                                <input name="first_name" type="text" class="form-control input-lg" value="<?=$post_first_name?>"/>
                                <?=$error_first_name?>
                            </div>
                            <div class="col-sm-6 mb-lg">
                                <label>Last Name</label>
                                <input name="last_name" type="text" class="form-control input-lg" value="<?=$post_last_name?>"/>
                            </div>
                        </div>
                    </div>

                    <div class="form-group mb-lg<? if ($user_name_error) echo " has-error";?>">
                        <label>Username</label>
                        <input name="user_name" type="text" class="form-control input-lg" value="<?=$post_user_name?>"/>
                        <?=$error_user_name?>
                    </div>

                    <div class="form-group mb-lg<? if ($email_error) echo " has-error";?>">
                        <label>E-mail Address</label>
                        <input name="email" type="email" class="form-control input-lg" value="<?=$post_email?>"/>
                        <?=$error_email?>
                    </div>

                    <div class="form-group mb-none">
                        <div class="row">
                            <div class="col-sm-6 mb-lg<? if ($error_password) echo " has-error";?>">
                                <label for="password">Password</label>
                                <input name="password" type="password" id="password" class="form-control input-lg" value="<?=$post_password?>"/>
                                <?=$error_password?>
                            </div>
                            <div class="col-sm-6 mb-lg<? if ($error_password_confirm) echo " has-error";?>">
                                <label>Password Confirmation</label>
                                <input name="password_confirm" type="password" class="form-control input-lg" value="<?=$post_password_confirm?>"/>
                                <?=$error_password_confirm?>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-sm-8">
                            <div class="checkbox-custom checkbox-default">
                                <input id="AgreeTerms" name="agreed" type="checkbox" value="1"<? if ($post_agreed == 1) echo " checked";?>/>
                                <label for="AgreeTerms">I agree with <a class="modal-basic" href="#terms">terms of use</a></label>
                            </div>
                            <?=$error_agreed?>
                        </div>


                        <div class="col-sm-4 text-right">
                            <button type="submit" name="register" value="1" class="btn btn-primary hidden-xs">Sign Up</button>
                            <button type="submit" name="register" value="1" class="btn btn-primary btn-block btn-lg visible-xs mt-lg">Sign Up</button>
                        </div>
                    </div>

							<span class="mt-lg mb-lg line-thru text-center text-uppercase">
								<span>or</span>
							</span>
                    <?php /*
                    <div class="mb-xs text-center">
                        <a class="btn btn-facebook mb-md ml-xs mr-xs">Connect with <i class="fa fa-facebook"></i></a>
                        <a class="btn btn-twitter mb-md ml-xs mr-xs">Connect with <i class="fa fa-twitter"></i></a>
                    </div>

 */ ?>

                    <p class="text-center">Already have an account? <a href="./login">Sign In!</a>

                </form>
            </div>
        </div>

        <p class="text-center text-muted mt-md mb-md">&copy; Copyright <?php echo date('Y'); ?> All Rights Reserved.</p>
    </div>
</section>
<!-- end: page -->


<div id="terms" class="modal-block modal-full-color modal-block-primary mfp-hide">
    <section class="panel">
        <header class="panel-heading">
            <h2 class="panel-title">Terms of Use</h2>
        </header>
        <div class="panel-body">
            <div class="modal-wrapper">
                <div class="modal-icon">
                    <i class="fa fa-question-circle"></i>
                </div>
                <div class="modal-text">
                    <h4>Terms of Use</h4>

                    <p>---</p>
                </div>
            </div>
        </div>
        <footer class="panel-footer">
            <div class="row">
                <div class="col-md-12 text-right">
                    <button class="btn btn-primary modal-confirm">I agree</button>
                    <button class="btn btn-default modal-dismiss">I disagree</button>
                </div>
            </div>
        </footer>
    </section>
</div>


<!-- Vendor -->
<script src="template/assets/vendor/jquery/jquery.js"></script>
<script src="template/assets/vendor/jquery-browser-mobile/jquery.browser.mobile.js"></script>
<script src="template/assets/vendor/bootstrap/js/bootstrap.js"></script>
<script src="template/assets/vendor/magnific-popup/magnific-popup.js"></script>
<script src="template/assets/vendor/jquery-placeholder/jquery.placeholder.js"></script>

<!-- Theme Base, Components and Settings -->
<script src="template/assets/javascripts/theme.js"></script>

<!-- Theme Custom -->
<script src="template/assets/javascripts/theme.custom.js"></script>

<!-- Theme Initialization Files -->
<script src="template/assets/javascripts/theme.init.js"></script>

<script type="text/javascript">
    (function ($) {
        'use strict';
        $('.modal-basic').magnificPopup({
            type: 'inline',
            preloader: false,
            modal: true
        });
        /*
         Modal Dismiss
         */
        $(document).on('click', '.modal-dismiss', function (e) {
            e.preventDefault();
            $("#AgreeTerms").prop('checked', false);
            $.magnificPopup.close();
        });

        /*
         Modal Confirm
         */
        $(document).on('click', '.modal-confirm', function (e) {
            e.preventDefault();
            $("#AgreeTerms").prop('checked', true);
            $.magnificPopup.close();
        });

    }).apply(this, [jQuery]);
</script>


</body>
</html>