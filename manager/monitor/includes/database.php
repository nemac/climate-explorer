<?php
$db = @new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE); 

if($db->connect_error){
	die("<h3>Could not connect to the MySQL server.<br />Please be sure that the MySQL details are correct.</h3>");
}

function html($string) {
	return htmlentities(stripslashes($string), ENT_QUOTES, "UTF-8");
}

$config = $db->query("SELECT * FROM config");
$config = $config->fetch_assoc();
?>