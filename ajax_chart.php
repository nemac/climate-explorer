<?php
  
$chart_ID = $_REQUEST['id'];

$chart_start = 2010;
$chart_end = 2100;

if (isset($_REQUEST['start'])) $chart_start = $_REQUEST['start'];
if (isset($_REQUEST['end'])) $chart_end = $_REQUEST['end'];

if ($chart_ID == '123') {
  
  $alldata = array(
    array(
      array( 'label' => 2010, 'value' => 65 ),
      array( 'label' => 2015, 'value' => 59 ),
      array( 'label' => 2020, 'value' => 70 ),
      array( 'label' => 2025, 'value' => 80 ),
      array( 'label' => 2030, 'value' => 81 ),
      array( 'label' => 2035, 'value' => 56 ),
      array( 'label' => 2040, 'value' => 55 ),
      array( 'label' => 2045, 'value' => 40 ),
      array( 'label' => 2050, 'value' => 45 ),
      array( 'label' => 2055, 'value' => 47 ),
      array( 'label' => 2060, 'value' => 50 ),
      array( 'label' => 2065, 'value' => 57 ),
      array( 'label' => 2070, 'value' => 60 ),
      array( 'label' => 2075, 'value' => 67 ),
      array( 'label' => 2080, 'value' => 78 ),
      array( 'label' => 2085, 'value' => 89 ),
      array( 'label' => 2090, 'value' => 99 ),
      array( 'label' => 2095, 'value' => 103 ),
      array( 'label' => 2100, 'value' => 107 )
    ),
    
    array(
      array( 'label' => 2010, 'value' => 28 ),
      array( 'label' => 2015, 'value' => 30 ),
      array( 'label' => 2020, 'value' => 34 ),
      array( 'label' => 2025, 'value' => 40 ),
      array( 'label' => 2030, 'value' => 48 ),
      array( 'label' => 2035, 'value' => 42 ),
      array( 'label' => 2040, 'value' => 60 ),
      array( 'label' => 2045, 'value' => 67 ),
      array( 'label' => 2050, 'value' => 74 ),
      array( 'label' => 2055, 'value' => 86 ),
      array( 'label' => 2060, 'value' => 88 ),
      array( 'label' => 2065, 'value' => 90 ),
      array( 'label' => 2070, 'value' => 91 ),
      array( 'label' => 2075, 'value' => 94 ),
      array( 'label' => 2080, 'value' => 99 ),
      array( 'label' => 2085, 'value' => 105 ),
      array( 'label' => 2090, 'value' => 107 ),
      array( 'label' => 2095, 'value' => 110 ),
      array( 'label' => 2100, 'value' => 111 )
    )
  );
  
  $z = 0;
  
  foreach($alldata as $dataset) {
    
    $i = 0;
    
    foreach ($dataset as $item) {
      
      if ($item['label'] >= $chart_start && $item['label'] <= $chart_end) {
        $json['result']['labels'][$i] = strval($item['label']);
        $json['result']['datasets'][$z]['data'][] = $item['value'];
        
        $i++;
      }
    }
    
    $z++;
  }
  
  //print_r($json);

  
  //$json['result']['labels'] = array('2010', '2015', '2020', '2025', '2030', '2035', '2040', '2045', '2050', '2055', '2060', '2065', '2070', '2075', '2080', '2085', '2090', '2095', '2100');
  
  $json['result']['datasets'][0]['label'] = 'Dataset 1';
  $json['result']['datasets'][0]['strokeColor'] = '#f5442d';
  $json['result']['datasets'][0]['pointColor'] = '#fff';
  $json['result']['datasets'][0]['pointStrokeColor'] = '#f5442d';
  $json['result']['datasets'][0]['pointHighlightFill'] = '#f5442d';
  
  $json['result']['datasets'][1]['label'] = 'Dataset 2';
  $json['result']['datasets'][1]['strokeColor'] = '#0058cf';
  $json['result']['datasets'][1]['pointColor'] = '#fff';
  $json['result']['datasets'][1]['pointStrokeColor'] = '#0058cf';
  $json['result']['datasets'][1]['pointHighlightFill'] = '#0058cf';

}

echo json_encode($json);