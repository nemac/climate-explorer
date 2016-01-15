<?php
session_start();
$file = $_POST["f"];
$isFile = $_POST["t"];
if ($isFile) {
    unlink($file) or die("{false}");
} else {
    rmdir($file) or die("{false}");
}
?>
