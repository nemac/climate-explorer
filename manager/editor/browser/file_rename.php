<?php
session_start();
$file = $_POST["f"];
$new = $_POST["n"];
$path = dirname($file);
rename("$file", "$path/$new") or die("{false}");
?>
