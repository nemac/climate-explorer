<?php
session_start();
$content = $_POST["c"];
$file = $_POST["f"];
file_put_contents($file, stripslashes($content)) or die("{false}");
echo $file;
?>
