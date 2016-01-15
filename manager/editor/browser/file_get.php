<?php
session_start();
$filename = urldecode($_GET["f"]);
$path_info = pathinfo($filename);
$ext = array("php", "html", "js", "css",
    "txt", "shtml", "xhtml", ".htaccess",
    "htm", "xml", "json", "jsp", "asp",
    "aspx");
if (!isset($path_info['extension'])) {
    die(file_get_contents($filename));
}
if (in_array($path_info['extension'], $ext)) {
    die(file_get_contents($filename));
} else {
    echo "{false}";
}
?>
