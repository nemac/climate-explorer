<?php
session_start();
 
$randomnr = substr(hash("sha256", uniqid()), 0, 6);
$_SESSION['captcha'] = hash("sha256", $randomnr);
$im = imagecreatetruecolor(100, 35);

$white = imagecolorallocate($im, 255, 255, 255);
$grey = imagecolorallocate($im, 128, 128, 128);
$black = imagecolorallocate($im, 0, 0, 0);
 
imagefilledrectangle($im, 0, 50, 100, 0, $white);
imagecolortransparent($im,$white);

$font = "Font/captcha".rand(0,5).".ttf";
imagettftext($im, 15, 0, 21, 24, $grey, $font, $randomnr);
imagettftext($im, 15, 0, 21, 24, $black, $font, $randomnr);
 
header("Expires: Wed, 1 Jan 1997 00:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
 
header ("Content-type: image/gif");
imagegif($im);
imagedestroy($im);
?>