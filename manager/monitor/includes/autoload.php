<?php
$ds = DIRECTORY_SEPARATOR;
$current_version = "1.1.0";

function __autoload($class) {
	global $ds;
	require_once(dirname(__FILE__)."{$ds}classes{$ds}{$class}.class.php");
}

require_once(dirname(__FILE__)."{$ds}..{$ds}config.php");
$function = new Functions;

if($function->IsInstalled() == 1) {
	header("Location: install");
}

require_once(dirname(__FILE__)."{$ds}database.php");

$csrf = new CSRF;
$cookie = new Cookie;
$login = new Login;
$server = new Server;
$pb = new PBPage;

?>