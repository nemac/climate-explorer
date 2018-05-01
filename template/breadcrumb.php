<?php
$breadcrumb = '';

switch (str_replace('.php', '', trim(strtok($_SERVER["REQUEST_URI"],'?'), '/'))) {
  case 'location':
    $breadcrumb_text = isset($_GET['city']) ? $purifier->purify($_GET['city']) : '';
    $breadcrumb .= '<a href="#nav-search" class="parent launch-nav" data-nav-slide="0"><span class="icon icon-district"></span>Location</a>';
    break;
  case 'about':
    $breadcrumb_text = 'About';
    break;
  case 'definitions':
    $breadcrumb_text = 'Definitions';
    break;
  case'credits':
    $breadcrumb_text = 'Credits';
    break;
  case'stations':
    $breadcrumb_text = isset($_GET['param']) ? $purifier->purify($_GET['param']) : '';
    $breadcrumb_text = str_replace("_", " ", $breadcrumb_text);
    $breadcrumb_text = ucwords($breadcrumb_text);

    $breadcrumb .= '<a href="#nav-stations" class="parent launch-nav" data-nav-slide="2"><span class="icon icon-bubble"></span>Stations</a>';
    break;
  case'variables':
    $case = isset($_GET['id']) ? $purifier->purify($_GET['id']) : '';
    switch ($case) {
      case 'tmax' :
        $breadcrumb_text = 'Avg Daily Max Temp (°F)';
        break;
      case 'tmin' :
        $breadcrumb_text = 'Avg Daily Min Temp (°F)';
        break;
      case 'days_tmax_gt_90f' :
        $breadcrumb_text = 'Days w/ max > 90°F';
        break;
      case 'days_tmax_gt_95f' :
        $breadcrumb_text = 'Days w/ max > 95°F';
        break;
      case 'days_tmax_gt_100f' :
        $breadcrumb_text = 'Days w/ max > 100°F';
        break;
      case 'days_tmax_gt_105f' :
        $breadcrumb_text = 'Days w/ max > 105°F';
        break;
      case 'days_tmax_lt_32f' :
        $breadcrumb_text = 'Days w/ max < 32°F';
        break;
      case 'days_tmin_lt_32f' :
        $breadcrumb_text = 'Days w/ min < 32°F';
        break;
      case 'days_tmin_gt_80f' :
        $breadcrumb_text = 'Days w/ min > 80°F';
        break;
      case 'days_tmin_gt_90f' :
        $breadcrumb_text = 'Days w/ min > 90°F';
        break;
      case 'pcpn' :
        $breadcrumb_text = 'Total precip';
        break;
      case 'days_pcpn_gt_1in' :
        $breadcrumb_text = 'Days w/ > 1in';
        break;
      case 'days_pcpn_gt_2in' :
        $breadcrumb_text = 'Days w/ > 2in';
        break;
      case 'days_pcpn_gt_3in' :
        $breadcrumb_text = 'Days w/ > 3in';
        break;
      case 'days_dry_days' :
        $breadcrumb_text = 'Dry Days';
        break;
      case 'hdd_65f' :
        $breadcrumb_text = 'Heating Degree Days';
        break;
      case 'cdd_65f' :
        $breadcrumb_text = 'Cooling Degree Days';
        break;
      case 'gdd' :
        $breadcrumb_text = 'Growing Degree Days';
        break;
      case 'gddmod' :
        $breadcrumb_text = 'Mod. Growing Degree Days';
        break;
    }

    $breadcrumb .= '<a href="#nav-variables" class="parent launch-nav" data-nav-slide="1"><span class="icon icon-bubble"></span>Variable</a>';
}

$breadcrumb .= '<span class="current">' . $breadcrumb_text . '</span>';
