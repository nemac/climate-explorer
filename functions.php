<?php
// load HTMLPurifier
require_once 'htmlpurifier/HTMLPurifier.standalone.php';

$config = HTMLPurifier_Config::createDefault();
//$config->set('HTML.DefinitionID', 'enduser-customize.html tutorial');
//$config->set('HTML.DefinitionRev', 1);
$config->set('Cache.DefinitionImpl', null);
//$def = $config->getHTMLDefinition(true);

$purifier = new HTMLPurifier($config);
//    $clean_html = $purifier->purify($dirty_html);


function validate_alphanumeric_underscore($str)
{
    return preg_match('/^[a-zA-Z0-9_.]+$/',$str);
}


// output open graph tags

function opengraph_output($data)
{

    $site_url = '/';

    // url

    if (isset($data['url'])) {
        $output_data['url'] = $data['url'];
    } else {
        $output_data['url'] = $_SERVER["REQUEST_URI"];
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

class xss_clean {
    /*
     * Recursive worker to strip risky elements
     *
     * @param   string  $input      Content to be cleaned. It MAY be modified in output
     * @return  string  $output     Modified $input string
     */
    public function clean_input( $input, $safe_level = 0 ) {
        $output = $input;
        do {
            // Treat $input as buffer on each loop, faster than new var
            $input = $output;

            // Remove unwanted tags
            $output = $this->strip_tags( $input );
            $output = $this->strip_encoded_entities( $output );
            // Use 2nd input param if not empty or '0'
            if ( $safe_level !== 0 ) {
                $output = $this->strip_base64( $output );
            }
        } while ( $output !== $input );
        return $output;
    }
    /*
     * Focuses on stripping encoded entities
     * *** This appears to be why people use this sample code. Unclear how well Kses does this ***
     *
     * @param   string  $input  Content to be cleaned. It MAY be modified in output
     * @return  string  $input  Modified $input string
     */
    private function strip_encoded_entities( $input ) {
        // Fix &entity\n;
        $input = str_replace(array('&amp;','&lt;','&gt;'), array('&amp;amp;','&amp;lt;','&amp;gt;'), $input);
        $input = preg_replace('/(&#*\w+)[\x00-\x20]+;/u', '$1;', $input);
        $input = preg_replace('/(&#x*[0-9A-F]+);*/iu', '$1;', $input);
        $input = html_entity_decode($input, ENT_COMPAT, 'UTF-8');
        // Remove any attribute starting with "on" or xmlns
        $input = preg_replace('#(<[^>]+?[\x00-\x20"\'])(?:on|xmlns)[^>]*+[>\b]?#iu', '$1>', $input);
        // Remove javascript: and vbscript: protocols
        $input = preg_replace('#([a-z]*)[\x00-\x20]*=[\x00-\x20]*([`\'"]*)[\x00-\x20]*j[\x00-\x20]*a[\x00-\x20]*v[\x00-\x20]*a[\x00-\x20]*s[\x00-\x20]*c[\x00-\x20]*r[\x00-\x20]*i[\x00-\x20]*p[\x00-\x20]*t[\x00-\x20]*:#iu', '$1=$2nojavascript...', $input);
        $input = preg_replace('#([a-z]*)[\x00-\x20]*=([\'"]*)[\x00-\x20]*v[\x00-\x20]*b[\x00-\x20]*s[\x00-\x20]*c[\x00-\x20]*r[\x00-\x20]*i[\x00-\x20]*p[\x00-\x20]*t[\x00-\x20]*:#iu', '$1=$2novbscript...', $input);
        $input = preg_replace('#([a-z]*)[\x00-\x20]*=([\'"]*)[\x00-\x20]*-moz-binding[\x00-\x20]*:#u', '$1=$2nomozbinding...', $input);
        // Only works in IE: <span style="width: expression(alert('Ping!'));"></span>
        $input = preg_replace('#(<[^>]+?)style[\x00-\x20]*=[\x00-\x20]*[`\'"]*.*?expression[\x00-\x20]*\([^>]*+>#i', '$1>', $input);
        $input = preg_replace('#(<[^>]+?)style[\x00-\x20]*=[\x00-\x20]*[`\'"]*.*?behaviour[\x00-\x20]*\([^>]*+>#i', '$1>', $input);
        $input = preg_replace('#(<[^>]+?)style[\x00-\x20]*=[\x00-\x20]*[`\'"]*.*?s[\x00-\x20]*c[\x00-\x20]*r[\x00-\x20]*i[\x00-\x20]*p[\x00-\x20]*t[\x00-\x20]*:*[^>]*+>#iu', '$1>', $input);
        return $input;
    }
    /*
     * Focuses on stripping unencoded HTML tags & namespaces
     *
     * @param   string  $input  Content to be cleaned. It MAY be modified in output
     * @return  string  $input  Modified $input string
     */
    private function strip_tags( $input ) {
        // Remove tags
        $input = preg_replace('#</*(?:applet|b(?:ase|gsound|link)|embed|frame(?:set)?|i(?:frame|layer)|l(?:ayer|ink)|meta|object|s(?:cript|tyle)|title|xml)[^>]*+>#i', '', $input);
        // Remove namespaced elements
        $input = preg_replace('#</*\w+:\w[^>]*+>#i', '', $input);
        return $input;
    }
    /*
     * Focuses on stripping entities from Base64 encoded strings
     *
     * NOT ENABLED by default!
     * To enable 2nd param of clean_input() can be set to anything other than 0 or '0':
     * ie: xssClean->clean_input( $input_string, 1 )
     *
     * @param   string  $input      Maybe Base64 encoded string
     * @return  string  $output     Modified & re-encoded $input string
     */
    private function strip_base64( $input ) {
        $decoded = base64_decode( $input );
        $decoded = $this->strip_tags( $decoded );
        $decoded = $this->strip_encoded_entities( $decoded );
        $output = base64_encode( $decoded );
        return $output;
    }
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
