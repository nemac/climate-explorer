<?php
include("config.php");
session_start();
if (isset($_SESSION["username"])) {
    die('<script type="text/javascript">window.location="main.php"</script>');
}
//Username and pass in config.php!
$error = "";
if ($_POST) {
    $error = null;
    if ($_POST["username"] == $username && $_POST["pass"] == $pass) {
        $_SESSION["username"] = $_POST["username"];
        die('<script type="text/javascript">window.location="main.php"</script>');
    } else {
        $error = "Wrong username or password!";
    }
}
?>
<html> 
    <head>
        <link rel="stylesheet" type="text/css" href="css/structure.css">
    </head>
    <body>
        <form class="box login" method="POST" action="<?php echo $_SERVER["PHP_SELF"]; ?>">

            <fieldset class="boxBody">
                <?php
                echo $error;
                ?>
                <label>Username</label>
                <input name="username" type="text" tabindex="1" placeholder="" value="admin" required>
                <label>Password</label>
                <input name="pass" type="password" tabindex="2" required  value="admin">
            </fieldset>
            <footer>
                <input type="submit" class="btnLogin" value="Login" tabindex="4">
            </footer>
        </form>
        <footer id="main">

        </footer>
    </body>
</html>
