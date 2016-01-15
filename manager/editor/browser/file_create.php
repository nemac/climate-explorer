<?php
session_start();
$file = $_POST["f"];
$ourFileHandle = fopen($file, 'a') or die("{false}");
fclose($ourFileHandle);
?>
