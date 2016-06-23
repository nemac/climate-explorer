<?php

//  recommended by OWASP; added in htaccess but here just in case.
// current page URL

function current_URL()
{
    $pageURL = 'http';
    $pageURL .= "://";
    if ($_SERVER["SERVER_PORT"] != "80") {
        $pageURL .= $_SERVER["SERVER_NAME"] . ":" . $_SERVER["SERVER_PORT"] . $_SERVER["REQUEST_URI"];
    } else {
        $pageURL .= $_SERVER["SERVER_NAME"] . $_SERVER["REQUEST_URI"];
    }
    return $pageURL;
}

// output open graph tags

function opengraph_output($data)
{

    $site_url = '/';

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

    $output .= "\n\t" . '<meta property="fb:app_id" content="187816851587993" />';
    $output .= "\n\t" . '<meta property="og:url" content="' . $output_data['url'] . '" />';
    $output .= "\n\t" . '<meta property="og:type" content="' . $output_data['type'] . '" />';
    $output .= "\n\t" . '<meta property="og:title" content="' . $output_data['title'] . '" />';
    $output .= "\n\t" . '<meta property="og:description" content="' . $output_data['description'] . '" />';
    $output .= "\n\t" . '<meta property="og:image" content="' . $output_data['image'] . '" />';

    return $output;
}

function xss_clean($data)
{
// Fix &entity\n;
    $data = str_replace(array('&amp;', '&lt;', '&gt;'), array('&amp;amp;', '&amp;lt;', '&amp;gt;'), $data);
    $data = preg_replace('/(&#*\w+)[\x00-\x20]+;/u', '$1;', $data);
    $data = preg_replace('/(&#x*[0-9A-F]+);*/iu', '$1;', $data);
    $data = html_entity_decode($data, ENT_COMPAT, 'UTF-8');

// Remove any attribute starting with "on" or xmlns
    $data = preg_replace('#(<[^>]+?[\x00-\x20"\'])(?:on|xmlns)[^>]*+>#iu', '$1>', $data);

// Remove javascript: and vbscript: protocols
    $data = preg_replace('#([a-z]*)[\x00-\x20]*=[\x00-\x20]*([`\'"]*)[\x00-\x20]*j[\x00-\x20]*a[\x00-\x20]*v[\x00-\x20]*a[\x00-\x20]*s[\x00-\x20]*c[\x00-\x20]*r[\x00-\x20]*i[\x00-\x20]*p[\x00-\x20]*t[\x00-\x20]*:#iu', '$1=$2nojavascript...', $data);
    $data = preg_replace('#([a-z]*)[\x00-\x20]*=([\'"]*)[\x00-\x20]*v[\x00-\x20]*b[\x00-\x20]*s[\x00-\x20]*c[\x00-\x20]*r[\x00-\x20]*i[\x00-\x20]*p[\x00-\x20]*t[\x00-\x20]*:#iu', '$1=$2novbscript...', $data);
    $data = preg_replace('#([a-z]*)[\x00-\x20]*=([\'"]*)[\x00-\x20]*-moz-binding[\x00-\x20]*:#u', '$1=$2nomozbinding...', $data);

// Only works in IE: <span style="width: expression(alert('Ping!'));"></span>
    $data = preg_replace('#(<[^>]+?)style[\x00-\x20]*=[\x00-\x20]*[`\'"]*.*?expression[\x00-\x20]*\([^>]*+>#i', '$1>', $data);
    $data = preg_replace('#(<[^>]+?)style[\x00-\x20]*=[\x00-\x20]*[`\'"]*.*?behaviour[\x00-\x20]*\([^>]*+>#i', '$1>', $data);
    $data = preg_replace('#(<[^>]+?)style[\x00-\x20]*=[\x00-\x20]*[`\'"]*.*?s[\x00-\x20]*c[\x00-\x20]*r[\x00-\x20]*i[\x00-\x20]*p[\x00-\x20]*t[\x00-\x20]*:*[^>]*+>#iu', '$1>', $data);

// Remove namespaced elements (we do not need them)
    $data = preg_replace('#</*\w+:\w[^>]*+>#i', '', $data);

    do {
        // Remove really unwanted tags
        $old_data = $data;
        $data = preg_replace('#</*(?:applet|b(?:ase|gsound|link)|embed|frame(?:set)?|i(?:frame|layer)|l(?:ayer|ink)|meta|object|s(?:cript|tyle)|title|xml)[^>]*+>#i', '', $data);
    } while ($old_data !== $data);

// we are done...
    return $data;
}

function isValidLongitude($longitude)
{
    if (preg_match("/^[-]?((((1[0-7][0-9])|([0-9]?[0-9]))\.(\d+))|180(\.0+)?)$/",
        $longitude)) {
        return true;
    } else {
        return false;
    }
}



function isValidLatitude($latitude)
{
    if (preg_match("/^[-]?(([0-8]?[0-9])\.(\d+))|(90(\.0+)?)$/", $latitude)) {
        return true;
    } else {
        return false;
    }
}
