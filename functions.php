<?php
  
  // current page URL
  
  function current_URL() {
  	$pageURL = 'http';
  	$pageURL .= "://";
  	if ($_SERVER["SERVER_PORT"] != "80") {
  		$pageURL .= $_SERVER["SERVER_NAME"].":".$_SERVER["SERVER_PORT"].$_SERVER["REQUEST_URI"];
  	} else {
  		$pageURL .= $_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"];
  	}
  	return htmlentities($pageURL);
  }
  
  // output open graph tags
  
  function opengraph_output($data) {
    
    $site_url = 'http://climateexplorer.habitatseven.work';
    
    // url
    
    if (isset($data['url'])) {
      $output_data['url'] = $data['url'];
    } else {
      $output_data['url'] = current_URL();
    }
    
    // title
    
    if (isset($data['title'])) {
      $output_data['title'] = $data['title'];
    } else {
      $output_data['title'] = 'Climate Explorer';
    }
    
    // type
    
    if (isset($data['type'])) {
      $output_data['type'] = $data['type'];
    } else {
      $output_data['type'] = 'article';
    }
    
    // description
    
    if (isset($data['description'])) {
      $output_data['description'] = $data['description'];
    } else {
      $output_data['description'] = 'The Climate Explorer allows you to view historical and projected climate trends and assess the impacts of climate change on the things you care about';
    }
    
    // image
    
    if (isset($data['image'])) {
      $output_data['image'] = $data['image'];
    } else {
      $output_data['image'] = $site_url . '/resources/img/og.jpg';
    }
    
    $output = '';
    
    $output .= "\n\t" . '<meta property="og:url" content="' . $output_data['url'] . '" />';
    $output .= "\n\t" . '<meta property="og:type" content="' . $output_data['type'] . '" />';
    $output .= "\n\t" . '<meta property="og:title" content="' . $output_data['title'] . '" />';
    $output .= "\n\t" . '<meta property="og:description" content="' . $output_data['description'] . '" />';
    $output .= "\n\t" . '<meta property="og:image" content="' . $output_data['image'] . '" />';
    
    return $output;
  }