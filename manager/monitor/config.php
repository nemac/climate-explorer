<?php
error_reporting(E_ALL);
session_start();

/* Database Config */
define("DB_HOST", "localhost"); // MySQL Host
define("DB_USERNAME", "bigmappe_cem"); // MySQL Username
define("DB_PASSWORD", "c0raplok"); // MySQL password
define("DB_DATABASE", "bigmappe_cem"); // MySQL Database

/* Website Config */
define("PATH", dirname(__FILE__)); // Get the Monitor path
define("DEMO", 0); // Default: 0. If the value is 1, all save functions will be disabled.


/* Fix Real IP */
if(isset($_SERVER["HTTP_CF_CONNECTING_IP"])) {
	$_SERVER['REMOTE_ADDR'] = $_SERVER["HTTP_CF_CONNECTING_IP"];

}elseif(isset($_SERVER["HTTP_X_REMOTE_IP"])) {
	$_SERVER['REMOTE_ADDR'] = $_SERVER["HTTP_X_REMOTE_IP"];

}
?>