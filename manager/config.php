<?
if(!isset($_SESSION['user_id'])){
    session_start();
}

$session_first_name = isset($_SESSION['first_name']) ? $_SESSION['first_name'] : '';
$session_last_name = isset($_SESSION['last_name']) ? $_SESSION['last_name'] : '';
$session_organization = isset($_SESSION['user_organization']) ? $_SESSION['user_organization'] : '';
$session_user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : '';
$session_area_type = isset($_SESSION['area_type']) ? $_SESSION['area_type'] : '';
$session_regions_selected = isset($_SESSION['regions_selected']) ? $_SESSION['regions_selected'] : '';
$session_access_level = isset($_SESSION['access_level']) ? $_SESSION['access_level'] : '';




$public = isset($public) ? $public : false;
$page_title = isset($page_title) ? $page_title : false;
$page_slug = isset($page_slug) ? $page_slug : false;


if (!$session_user_id && $public != true) {
    header("Location:./login");
}


include 'settings.php';

$con = mysqli_connect($setting_mysql_db_host,$setting_mysql_db_user,$setting_mysql_db_pass,$setting_mysql_db_name);





function full_url()
{
    $s = empty($_SERVER["HTTPS"]) ? '' : ($_SERVER["HTTPS"] == "on") ? "s" : "";
    $protocol = substr(strtolower($_SERVER["SERVER_PROTOCOL"]), 0, strpos(strtolower($_SERVER["SERVER_PROTOCOL"]), "/")) . $s;
    $port = ($_SERVER["SERVER_PORT"] == "80") ? "" : (":".$_SERVER["SERVER_PORT"]);
    return $protocol . "://" . $_SERVER['SERVER_NAME'] . $port . $_SERVER['REQUEST_URI'];
}

function inlineAlert($type,$caption,$content,$showclose)
{
    $ia = "";
    // types: block, success, info, error
    $ia .= "<div class=\"alert alert-$type\">";
    $ia .= "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-hidden=\"true\">×</button>";
    if ($showclose == 1)
        $ia .= "<a class=\"close\" data-dismiss=\"alert\" href=\"#\">&times;</a>";
    $ia .= "<strong>$caption</strong><br>";
    $ia .= "$content";
    $ia .= "</div>";
    return $ia;
}

function slug($str) {
    $str = strtolower(trim($str));
    $str = preg_replace('/[^a-z0-9-]/', '-', $str);
    $str = preg_replace('/-+/', "-", $str);
    return rtrim($str, '-');
}


function FormatPrice($price) {
    $price = preg_replace("/[^0-9\.]/", "", str_replace(',','.',$price));
    if (substr($price,-3,1)=='.') {
        $sents = '.'.substr($price,-2);
        $price = substr($price,0,strlen($price)-3);
    } elseif (substr($price,-2,1)=='.') {
        $sents = '.'.substr($price,-1);
        $price = substr($price,0,strlen($price)-2);
    } else {
        $sents = '.00';
    }
    $price = preg_replace("/[^0-9]/", "", $price);
    return number_format($price.$sents,2,'.','');
}

function linkify($text)
{
    $text= preg_replace("/(^|[\n ])([\w]*?)([\w]*?:\/\/[\w]+[^ \,\"\n\r\t<]*)/is", "$1$2<a href=\"$3\" target=\"_BLANK\">$3</a>", $text);
    $text= preg_replace("/(^|[\n ])([\w]*?)((www)\.[^ \,\"\t\n\r<]*)/is", "$1$2<a href=\"http://$3\" target=\"_BLANK\">$3</a>", $text);
    $text= preg_replace("/(^|[\n ])([\w]*?)((ftp)\.[^ \,\"\t\n\r<]*)/is", "$1$2<a href=\"ftp://$3\" target=\"_BLANK\">$3</a>", $text);
    $text= preg_replace("/(^|[\n ])([a-z0-9&\-_\.]+?)@([\w\-]+\.([\w\-\.]+)+)/i", "$1<a href=\"mailto:$2@$3\" target=\"_BLANK\">$2@$3</a>", $text);
    return($text);
}

function generatePassword($length=9, $strength=0) {
    $vowels = 'aeuy';
    $consonants = 'bdghjmnpqrstvz';
    if ($strength & 1) {
        $consonants .= 'BDGHJLMNPQRSTVWXZ';
    }
    if ($strength & 2) {
        $vowels .= "AEUY";
    }
    if ($strength & 4) {
        $consonants .= '23456789';
    }
    if ($strength & 8) {
        $consonants .= '@#$%';
    }

    $password = '';
    $alt = time() % 2;
    for ($i = 0; $i < $length; $i++) {
        if ($alt == 1) {
            $password .= $consonants[(rand() % strlen($consonants))];
            $alt = 0;
        } else {
            $password .= $vowels[(rand() % strlen($vowels))];
            $alt = 1;
        }
    }
    return $password;
}

function highlight($x,$var) {//$x is the string, $var is the text to be highlighted
    if ($var != "") {
        $xtemp = "";
        $i=0;
        while($i<strlen($x)){
            if((($i + strlen($var)) <= strlen($x)) && (strcasecmp($var, substr($x, $i, strlen($var))) == 0)) {
                //this version bolds the text. you can replace the html tags with whatever you like.
                $xtemp .= "<font color=red>" . substr($x, $i , strlen($var)) . "</font>";
                $i += strlen($var);
            }
            else {
                $xtemp .= $x{$i};
                $i++;
            }
        }
        $x = $xtemp;
    }
    return $x;
}


function getExtension($str) {
    $i = strrpos($str,".");
    if (!$i) { return ""; }
    $l = strlen($str) - $i;
    $ext = substr($str,$i+1,$l);
    return $ext;
}

function mysql_prep($value){
    global $con;

    $value = htmlentities($value, ENT_QUOTES);

    return $value;
}

function get_one_value($con,$query) {
    $result = mysqli_query($con,$query) or die(mysqli_error($con) . "$query");
    $row = mysqli_fetch_row($result);
    return($row[0]);
}

function get_one_row($con,$query) {
    $result = mysqli_query($con,$query) or die(mysqli_error($con));
    $row = mysqli_fetch_array($result);
    return($row);
}


function getDataValue($metric_id,$table='census',$areas=0,$type='metric',$ramp='',$format=0,$sourceField='CT')
{
    // make sure metric exists
    if ($metric_id > 0) {
        $metricColor = '';
        $boxRampColor = '';
        global $con,
               $setting_color_red,
               $debug,
               $setting_color_yellow,
               $setting_color_green,
               $setting_color_neutral;

        $debug = array();

        if ($table == 'census') {
            $sourceField = 'CT';
        } elseif ($table == 'zip') {
            $sourceField = 'ZIP_CODE';
        } elseif ($table == 'congress') {
            $sourceField = 'CT';
        } elseif ($table == 'senate') {
            $sourceField = 'CT';
        }

        $metricrow = get_one_row($con, "select * from metrics where metric_id = '$metric_id'");
        $type = $metricrow['metric_type'];
        $ramp = $metricrow['metric_ramp'];


        // if the box contains rules to use the color of another score, set the appropriate relations.
        if ($metricrow['metric_box_ramp'] > 0)
        {
            $theBox = get_one_row($con, "select box_main_id, box_main_ramp from boxes where box_id = '$metricrow[metric_box_ramp]'");
            $box_row = get_one_row($con, "select * from metrics left join boxes on boxes.box_id=metrics.metric_box_ramp where metric_id = '$theBox[box_main_id]'");
            if ($areas == 1) {
                if ($box_row['metric_type'] == 3 || $box_row['metric_type'] == 1 || $box_row['metric_type'] == 4 || $box_row['metric_type'] == 5){
                    $boxRampValue = get_one_value($con, "select AVG(" . $box_row['metric_column'] . ") from data_" . $table . "");
                } else {
                    $boxRampValue = get_one_value($con, "select SUM(" . $box_row['metric_column'] . ") from data_" . $table . "");
                }
            } else {
                if ($box_row['metric_type'] == 3 || $box_row['metric_type'] == 1 || $box_row['metric_type'] == 4 || $box_row['metric_type'] == 5){
                    $boxRampValue = get_one_value($con, "select AVG(" . $box_row['metric_column'] . ") from data_" . $table . " where " . $sourceField . " IN ($areas)");
                } else {
                    $boxRampValue = get_one_value($con, "select SUM(" . $box_row['metric_column'] . ") from data_" . $table . " where " . $sourceField . " IN ($areas)");
                }
            }


            // 1 score
            // 2 number
            // 3 percent
            // 4 rate
            // 5 average number

            if ($theBox['box_main_ramp'] == 'GYR'){

                if ($boxRampValue <= 33) {
                    $boxRampColor = $setting_color_green;
                } elseif ($boxRampValue > 33 && $boxRampValue <= 66) {
                    $boxRampColor = $setting_color_yellow;
                } else {
                    $boxRampColor = $setting_color_red;
                }
            } elseif ($theBox['box_main_ramp'] == 'RYG') {
                if ($boxRampValue <= 33) {
                    $boxRampColor = $setting_color_red;
                } elseif ($boxRampValue > 33 && $boxRampValue <= 66) {
                    $boxRampColor = $setting_color_yellow;
                } else {
                    $boxRampColor = $setting_color_green;
                }
            } else {
                $boxRampColor = $setting_color_neutral;
            }
        }

        // GET THE ACTUAL DATA VALUE
        if ($areas == 1) {
            if ($metricrow['metric_type'] == 3 || $metricrow['metric_type'] == 1 || $metricrow['metric_type'] == 4 || $metricrow['metric_type'] == 5){
                $value = get_one_value($con, "select AVG(" . $metricrow['metric_column'] . ") from data_" . $table . "");
                $debug['query'] = "select AVG(" . $metricrow['metric_column'] . ") from data_" . $table . "";
            } else {
                $value = get_one_value($con, "select SUM(" . $metricrow['metric_column'] . ") from data_" . $table . "");
                $debug['query'] = "select SUM(" . $metricrow['metric_column'] . ") from data_" . $table . "";
            }
        } else {
            if ($metricrow['metric_type'] == 3 || $metricrow['metric_type'] == 1 || $metricrow['metric_type'] == 4 || $metricrow['metric_type'] == 5){
                $value = get_one_value($con, "select AVG(" . $metricrow['metric_column'] . ") from data_" . $table . " where " . $sourceField . " IN ($areas)");
                $debug['query'] = "select AVG(" . $metricrow['metric_column'] . ") from data_" . $table . " where " . $sourceField . " IN ($areas)";
            } else {
                $value = get_one_value($con, "select SUM(" . $metricrow['metric_column'] . ") from data_" . $table . " where " . $sourceField . " IN ($areas)");
                $debug['query'] = "select SUM(" . $metricrow['metric_column'] . ") from data_" . $table . " where " . $sourceField . " IN ($areas)";
            }
        }

        //echo "<script>console.log('".$debug['query'].");</script>";


        // 1 score
        // 2 number
        // 3 percent
        // 4 rate
        // 5 average number

        $prepend = '';
        $decimals = '';
        $format = '';

        if ($metricrow['metric_type'] == 3 || $metricrow['metric_type'] == 4){

            $value = $value * 100;
            if ($value > 100){
                $value = 100;
            }
            $append = "%";
        } else {
            $append = '';
        }




            // APPLY COLOR RAMP IF EXISTS
            if ($ramp == 'GYR'){

                if ($value <= 33) {
                    $metricColor = $setting_color_green;
                } elseif ($value > 33 && $value <= 66) {
                    $metricColor = $setting_color_yellow;
                } else {
                    $metricColor = $setting_color_red;
                }
            } elseif ($ramp == 'RYG') {
                if ($value <= 33) {
                    $metricColor = $setting_color_red;
                } elseif ($value > 33 && $value <= 66) {
                    $metricColor = $setting_color_yellow;
                } else {
                    $metricColor = $setting_color_green;
                }
            } else {
                $metricColor = $setting_color_neutral;
            }

            // SET METRIC CAPTION
            $clean_name = $metricrow['metric_clean_name'];

            // ASSIGN OVERRIDE RAMP COLORING
            if ($boxRampColor){
                $metricColor = $boxRampColor;
            }

            // SHOULD WE LINK IT TO ANOTHER SCORE?
            $link=$metricrow['metric_box_link'];


            $column=$metricrow['metric_column'];

            $query_ran = $debug['query'];

            $tinyset = "$value|$append|$clean_name|$metricColor|$link|$prepend|$decimals|$format|$areas|$type|$column";

            return explode("|",$tinyset);

    }
}

function get_areas($geotype)
{
    global $con, $session_user_id;
    if ($geotype == 'zip') {
        $areas = get_one_value($con,"SELECT user_regions_zip from users where user_id = '$session_user_id'");
    } elseif ($geotype == 'census') {
        $areas = get_one_value($con,"SELECT user_regions_census from users where user_id = '$session_user_id'");
    } else {
        $areas = get_one_value($con,"SELECT user_regions_actual_tracts from users where user_id = '$session_user_id'");
    }
    if (!$areas){
        $areas = '1';
    }

    //$check = explode(",",$areas);
    //if (!is_numeric($check[0])){
    //    $areas = implode("','",$check);
    //    $areas = "'$areas'";
    //}

    return $areas;
}

function custom_number_format($n, $precision = 3) {
    if ($n < 1000) {
        // Anything less than a million
        $n_format = number_format($n);
    } else if ($n < 1000000) {
        // Anything less than a million
        $n_format = number_format($n / 1000, $precision) . ' K';
    } else if ($n < 1000000000) {
        // Anything less than a billion
        $n_format = number_format($n / 1000000, $precision) . ' M';
    } else {
        // At least a billion
        $n_format = number_format($n / 1000000000, $precision) . ' B';
    }
    return $n_format;
}

function nicetime($date)
{
    if(empty($date)) {
        return "No date provided";
    }
    $periods         = array("second", "minute", "hour", "day", "week", "month", "year", "decade");
    $lengths         = array("60","60","24","7","4.35","12","10");

    $now             = time();
    $unix_date         = $date;

    // check validity of date
    if(empty($unix_date)) {
        return "Bad date";
    }

    // is it future date or past date
    if($now > $unix_date) {
        $difference     = $now - $unix_date;
        $tense         = "ago";


    } else {
        $difference     = $unix_date - $now;
        $tense         = "from now";
    }

    for($j = 0; $difference >= $lengths[$j] && $j < count($lengths)-1; $j++) {
        $difference /= $lengths[$j];
    }

    $difference = round($difference);

    if($difference != 1) {
        $periods[$j].= "s";

    }
    return "$difference $periods[$j] {$tense}";


}

function fixsearchterm($keyword)
{
    $keyword = trim($keyword);
    return $keyword;
}

function check_email_address($email) {
    $emailregex = '/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/';
    if(!preg_match($emailregex, $email))
    {
        return false;
    }
    return true;
}
function checkInput_LN ($input)
{
    if (!preg_match("/^[a-z0-9A-Z]+$/i", $input))
    {
        return false;
    }
    else
    {
        return true;
    }
}

function num2word($num)
{
    $first_word = array('eth','First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth','Ninth','Tenth','Elevents','Twelfth','Thirteenth','Fourteenth','Fifteenth','Sixteenth','Seventeenth','Eighteenth','Nineteenth','Twentieth');
    $second_word =array('','','Twenty','Thirthy','Forty','Fifty');

    if($num <= 20)
        return $first_word[$num];

    $first_num = substr($num,-1,1);
    $second_num = substr($num,-2,1);

    return $string = str_replace('y-eth','ieth',$second_word[$second_num].'-'.$first_word[$first_num]);
}

function showBoxes($selectname,$selected,$onchange=0)
{
    global $con;
    $result = mysqli_query($con, "SELECT * FROM boxes ORDER BY box_name ASC");
    if (!$result) {
        echo 'Could not run query: ' . mysqli_error($con);
        exit;
    }
    if ($onchange == 1) {
        $showonchange = "onchange=\"form.submit();\"";
    } else {
        $showonchange = '';
    }

    $dropdown = '<select data-plugin-selectTwo  name="'.$selectname.'" id="'.$selectname.'" class="form-control populate"'.$showonchange.'>'."\n";
    $dropdown .= '<option>-- Select One --</option>'."\n";
    if (mysqli_num_rows($result) > 0) {
        while ($row = mysqli_fetch_assoc($result)) {
            if ($selected == $row['box_id']){
                $dropdown .= "<option value=\"$row[box_id]\" selected>$row[box_name]</option>";
            } else {
                $dropdown .= "<option value=\"$row[box_id]\">$row[box_name]</option>";
            }
        }
    }
    $dropdown .= "</select>";
    return $dropdown;
}

function showBoxRamps($selectname,$selected)
{
    global $con;
    $result = mysqli_query($con,"select * from boxes order by box_name asc");
    if (!$result) {
        echo 'Could not run query: ' . mysqli_error($con);
        exit;
    }
    $dropdown = '<select data-plugin-selectTwo  name="'.$selectname.'" id="'.$selectname.'" class="form-control populate">'."\n";
    $dropdown .= '<option>-- Select One --</option>'."\n";
    if (mysqli_num_rows($result) > 0) {
        while ($row = mysqli_fetch_assoc($result)) {
            if ($selected == $row['box_id']){
                $dropdown .= "<option value=\"$row[box_id]\" selected>$row[box_name] [$row[box_main_ramp]]</option>";
            } else {
                $dropdown .= "<option value=\"$row[box_id]\">$row[box_name] [$row[box_main_ramp]]</option>";
            }
        }
    }
    $dropdown .= "</select>";
    return $dropdown;
}

function showMetrics($selectname,$selected,$value_type=0)
{
    global $con;
    $result = mysqli_query($con,"select metric_id, metric_name,metric_column from metrics order by metric_name asc");
    if (!$result) {
        echo 'Could not run query: ' . mysqli_error($con);
        exit;
    }
    $dropdown = '<select data-plugin-selectTwo  name="'.$selectname.'" id="'.$selectname.'" class="form-control populate">'."\n";
    $dropdown .= '<option value="">-- Select One --</option>'."\n";
    if (mysqli_num_rows($result) > 0) {
        while ($row = mysqli_fetch_assoc($result)) {

            if ($value_type == 0) {
                $drop_value = $row['metric_id'];
            } elseif($value_type == 1) {
                $drop_value = $row['metric_column'];

            }

            if ($selected == $drop_value){
                $dropdown .= "<option value=\"$drop_value\" selected>$row[metric_name]</option>";
            } else {
                $dropdown .= "<option value=\"$drop_value\">$row[metric_name]</option>";
            }
        }
    }
    $dropdown .= "</select>";
    return $dropdown;
}

function showOrganizations($selectname,$selected)
{
    global $con;
    $result = mysqli_query($con,"select org_id, org_name from organizations order by org_name asc");
    if (!$result) {
        echo 'Could not run query: ' . mysqli_error($con);
        exit;
    }
    $dropdown = '<select data-plugin-selectTwo  name="'.$selectname.'" id="'.$selectname.'" class="form-control populate">'."\n";
    $dropdown .= '<option>-- Select One --</option>'."\n";
    if (mysqli_num_rows($result) > 0) {
        while ($row = mysqli_fetch_assoc($result)) {
            if ($selected == $row['org_id']){
                $dropdown .= "<option value=\"$row[org_id]\" selected>$row[org_name]</option>";
            } else {
                $dropdown .= "<option value=\"$row[org_id]\">$row[org_name]</option>";
            }
        }
    }
    $dropdown .= "</select>";
    return $dropdown;
}

function showColumns($selectname,$table,$selected)
{
    global $con;
    $result = mysqli_query($con,"SHOW COLUMNS FROM $table");
    if (!$result) {
        echo 'Could not run query: ' . mysqli_error($con);
        exit;
    }
    $dropdown = '<select data-plugin-selectTwo  name="'.$selectname.'" id="'.$selectname.'" class="form-control populate">'."\n";
    $dropdown .= '<option>-- Select One --</option>'."\n";
    if (mysqli_num_rows($result) > 0) {
        while ($row = mysqli_fetch_assoc($result)) {
            if ($selected == $row['Field']){
                $dropdown .= "<option selected>$row[Field]</option>";
            } else {
                $dropdown .= "<option>$row[Field]</option>";
            }
        }
    }
    $dropdown .= "</select>";
    return $dropdown;
}
?>