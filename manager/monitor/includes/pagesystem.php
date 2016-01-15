<?php
$pages = array("dashboard", "server_manager", "config", "users", "version", "account_settings", "pushbullet");


if(isset($_GET['p'])) {
    if(in_array($_GET['p'], $pages)) {
        if(file_exists("pages/{$_GET['p']}.php") == false) {
           include("pages/dashboard.php");
        }else{
            include("pages/{$_GET['p']}.php");
        }
    }else{
        include("pages/dashboard.php");
    }
}else{
    include("pages/dashboard.php");
}
?>