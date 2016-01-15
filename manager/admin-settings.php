<?
include 'header.php';

$post_edit = isset($_POST['edit']) ? $_POST['edit'] : '';

$setting_notify_from_name = isset($_POST['setting_notify_from_name']) ? $_POST['setting_notify_from_name'] : '';
$setting_notify_from_email = isset($_POST['setting_notify_from_email']) ? $_POST['setting_notify_from_email'] : '';
$setting_notify_reply_name = isset($_POST['setting_notify_reply_name']) ? $_POST['setting_notify_reply_name'] : '';
$setting_notify_reply_email = isset($_POST['setting_notify_reply_email']) ? $_POST['setting_notify_reply_email'] : '';
$setting_notify_smtp_host = isset($_POST['setting_notify_smtp_host']) ? $_POST['setting_notify_smtp_host'] : '';
$setting_notify_smtp_port = isset($_POST['setting_notify_smtp_port']) ? $_POST['setting_notify_smtp_port'] : '';
$setting_notify_smtp_user = isset($_POST['setting_notify_smtp_user']) ? $_POST['setting_notify_smtp_user'] : '';
$setting_notify_smtp_pass = isset($_POST['setting_notify_smtp_pass']) ? $_POST['setting_notify_smtp_pass'] : '';

$setting_contact_from_name = isset($_POST['setting_contact_from_name']) ? $_POST['setting_contact_from_name'] : '';
$setting_contact_from_email = isset($_POST['setting_contact_from_email']) ? $_POST['setting_contact_from_email'] : '';
$setting_contact_reply_name = isset($_POST['setting_contact_reply_name']) ? $_POST['setting_contact_reply_name'] : '';
$setting_contact_reply_email = isset($_POST['setting_contact_reply_email']) ? $_POST['setting_contact_reply_email'] : '';
$setting_contact_smtp_host = isset($_POST['setting_contact_smtp_host']) ? $_POST['setting_contact_smtp_host'] : '';
$setting_contact_smtp_port = isset($_POST['setting_contact_smtp_port']) ? $_POST['setting_contact_smtp_port'] : '';
$setting_contact_smtp_user = isset($_POST['setting_contact_smtp_user']) ? $_POST['setting_contact_smtp_user'] : '';
$setting_contact_smtp_pass = isset($_POST['setting_contact_smtp_pass']) ? $_POST['setting_contact_smtp_pass'] : '';


$setting_account_manager_name = isset($_POST['setting_account_manager_name']) ? $_POST['setting_account_manager_name'] : '';
$setting_account_manager_email = isset($_POST['setting_account_manager_email']) ? $_POST['setting_account_manager_email'] : '';

$setting_color_red = isset($_POST['setting_color_red']) ? $_POST['setting_color_red'] : '';
$setting_color_yellow = isset($_POST['setting_color_yellow']) ? $_POST['setting_color_yellow'] : '';
$setting_color_green = isset($_POST['setting_color_green']) ? $_POST['setting_color_green'] : '';
$setting_color_neutral = isset($_POST['setting_color_neutral']) ? $_POST['setting_color_neutral'] : '';
$setting_color_chart_on = isset($_POST['setting_color_chart_on']) ? $_POST['setting_color_chart_on'] : '';
$setting_color_chart_off = isset($_POST['setting_color_chart_off']) ? $_POST['setting_color_chart_off'] : '';

$setting_mysql_db_user = isset($_POST['setting_mysql_db_user']) ? $_POST['setting_mysql_db_user'] : '';
$setting_mysql_db_pass = isset($_POST['setting_mysql_db_pass']) ? $_POST['setting_mysql_db_pass'] : '';
$setting_mysql_db_host = isset($_POST['setting_mysql_db_host']) ? $_POST['setting_mysql_db_host'] : '';
$setting_mysql_db_name = isset($_POST['setting_mysql_db_name']) ? $_POST['setting_mysql_db_name'] : '';

$setting_site_name = isset($_POST['setting_site_name']) ? $_POST['setting_site_name'] : '';
$setting_site_url = isset($_POST['setting_site_url']) ? $_POST['setting_site_url'] : '';
$setting_path_main = isset($_POST['setting_path_main']) ? $_POST['setting_path_main'] : '';
$setting_path_backend = isset($_POST['setting_path_backend']) ? $_POST['setting_path_backend'] : '';

$setting_dashboard_logo_url = isset($_POST['setting_dashboard_logo_url']) ? $_POST['setting_dashboard_logo_url'] : '';

if ($post_edit) {
    $configfile = "settings.php";
    $fd = fopen($configfile, "r");
    $cfg = fread($fd, filesize($configfile));
    if (isset($_POST['csv_headers']) && is_array($_POST['csv_headers']) && count($_POST['csv_headers']) > 0) {
        $_POST['csv_headers'] = implode(',', $_POST['csv_headers']);
    }
    fclose($fd);
    $cfg = preg_replace('/\$setting_mysql_db_user=\"(.*?)\";/', '$setting_mysql_db_user="' . $setting_mysql_db_user . '";', $cfg);
    $cfg = preg_replace('/\$setting_mysql_db_pass=\"(.*?)\";/', '$setting_mysql_db_pass="' . $setting_mysql_db_pass . '";', $cfg);
    $cfg = preg_replace('/\$setting_mysql_db_host=\"(.*?)\";/', '$setting_mysql_db_host="' . $setting_mysql_db_host . '";', $cfg);
    $cfg = preg_replace('/\$setting_mysql_db_name=\"(.*?)\";/', '$setting_mysql_db_name="' . $setting_mysql_db_name . '";', $cfg);

    $cfg = preg_replace('/\$setting_site_name=\"(.*?)\";/', '$setting_site_name="' . $setting_site_name . '";', $cfg);
    $cfg = preg_replace('/\$setting_site_url=\"(.*?)\";/', '$setting_site_url="' . $setting_site_url . '";', $cfg);
    $cfg = preg_replace('/\$setting_dashboard_logo_url=\"(.*?)\";/', '$setting_dashboard_logo_url="' . $setting_dashboard_logo_url . '";', $cfg);

    $cfg = preg_replace('/\$setting_path_main=\"(.*?)\";/', '$setting_path_main="' . $setting_path_main . '";', $cfg);
    $cfg = preg_replace('/\$setting_path_backend=\"(.*?)\";/', '$setting_path_backend="' . $setting_path_backend . '";', $cfg);

    $cfg = preg_replace('/\$setting_notify_from_email=\"(.*?)\";/', '$setting_notify_from_email="' . $_POST['setting_notify_from_email'] . '";', $cfg);
    $cfg = preg_replace('/\$setting_notify_from_name=\"(.*?)\";/', '$setting_notify_from_name="' . $_POST['setting_notify_from_name'] . '";', $cfg);
    $cfg = preg_replace('/\$setting_notify_reply_email=\"(.*?)\";/', '$setting_notify_reply_email="' . $_POST['setting_notify_reply_email'] . '";', $cfg);
    $cfg = preg_replace('/\$setting_notify_reply_name=\"(.*?)\";/', '$setting_notify_reply_name="' . $_POST['setting_notify_reply_name'] . '";', $cfg);
    $cfg = preg_replace('/\$setting_notify_smtp_host=\"(.*?)\";/', '$setting_notify_smtp_host="' . $_POST['setting_notify_smtp_host'] . '";', $cfg);
    $cfg = preg_replace('/\$setting_notify_smtp_port=\"(.*?)\";/', '$setting_notify_smtp_port="' . $_POST['setting_notify_smtp_port'] . '";', $cfg);
    $cfg = preg_replace('/\$setting_notify_smtp_user=\"(.*?)\";/', '$setting_notify_smtp_user="' . $_POST['setting_notify_smtp_user'] . '";', $cfg);
    $cfg = preg_replace('/\$setting_notify_smtp_pass=\"(.*?)\";/', '$setting_notify_smtp_pass="' . $_POST['setting_notify_smtp_pass'] . '";', $cfg);

    $cfg = preg_replace('/\$setting_account_manager_email=\"(.*?)\";/', '$setting_account_manager_email="' . $_POST['setting_account_manager_email'] . '";', $cfg);
    $cfg = preg_replace('/\$setting_account_manager_name=\"(.*?)\";/', '$setting_account_manager_name="' . $_POST['setting_account_manager_name'] . '";', $cfg);


    $fixed_setting_color_red = str_replace("#", "", $setting_color_red);
    $fixed_setting_color_yellow = str_replace("#", "", $setting_color_yellow);
    $fixed_setting_color_green = str_replace("#", "", $setting_color_green);
    $fixed_setting_color_neutral = str_replace("#", "", $setting_color_neutral);
    $fixed_setting_color_chart_on = str_replace("#", "", $setting_color_chart_on);
    $fixed_setting_color_chart_off = str_replace("#", "", $setting_color_chart_off);

    $cfg = preg_replace('/\$setting_color_red=\"(.*?)\";/', '$setting_color_red="' . $fixed_setting_color_red . '";', $cfg);
    $cfg = preg_replace('/\$setting_color_yellow=\"(.*?)\";/', '$setting_color_yellow="' . $fixed_setting_color_yellow . '";', $cfg);
    $cfg = preg_replace('/\$setting_color_green=\"(.*?)\";/', '$setting_color_green="' . $fixed_setting_color_green . '";', $cfg);
    $cfg = preg_replace('/\$setting_color_neutral=\"(.*?)\";/', '$setting_color_neutral="' . $fixed_setting_color_neutral . '";', $cfg);
    $cfg = preg_replace('/\$setting_color_chart_on=\"(.*?)\";/', '$setting_color_chart_on="' . $fixed_setting_color_chart_on . '";', $cfg);
    $cfg = preg_replace('/\$setting_color_chart_off=\"(.*?)\";/', '$setting_color_chart_off="' . $fixed_setting_color_chart_off . '";', $cfg);

    $cfg = preg_replace('/\$setting_contact_from_email=\"(.*?)\";/', '$setting_contact_from_email="' . $_POST['setting_contact_from_email'] . '";', $cfg);
    $cfg = preg_replace('/\$setting_contact_from_name=\"(.*?)\";/', '$setting_contact_from_name="' . $_POST['setting_contact_from_name'] . '";', $cfg);
    $cfg = preg_replace('/\$setting_contact_reply_email=\"(.*?)\";/', '$setting_contact_reply_email="' . $_POST['setting_contact_reply_email'] . '";', $cfg);
    $cfg = preg_replace('/\$setting_contact_reply_name=\"(.*?)\";/', '$setting_contact_reply_name="' . $_POST['setting_contact_reply_name'] . '";', $cfg);
    $cfg = preg_replace('/\$setting_contact_smtp_host=\"(.*?)\";/', '$setting_contact_smtp_host="' . $_POST['setting_contact_smtp_host'] . '";', $cfg);
    $cfg = preg_replace('/\$setting_contact_smtp_port=\"(.*?)\";/', '$setting_contact_smtp_port="' . $_POST['setting_contact_smtp_port'] . '";', $cfg);
    $cfg = preg_replace('/\$setting_contact_smtp_user=\"(.*?)\";/', '$setting_contact_smtp_user="' . $_POST['setting_contact_smtp_user'] . '";', $cfg);
    $cfg = preg_replace('/\$setting_contact_smtp_pass=\"(.*?)\";/', '$setting_contact_smtp_pass="' . $_POST['setting_contact_smtp_pass'] . '";', $cfg);


    $fd = fopen($configfile, "w");
    fputs($fd, $cfg);
    fclose($fd);
    $notification = inlineAlert("success", "Updated", "Admin settings have been updated", 0);
}
include 'settings.php';
?>
    <div class="row">
        <div class="col-md-12 col-lg-12">
            <section class="panel">
                <header class="panel-heading">
                    <h2 class="panel-title">Site Settings</h2>
                </header>
                <div class="panel-body">
                    <form class="form-horizontal form-bordered" method="post" action="./admin-settings">
                        <?= $notification ?>


                        <div class="panel-group" id="accordion">
                            <div class="panel panel-accordion">
                                <div class="panel-heading">
                                    <h4 class="panel-title">
                                        <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#general">
                                            General Settings
                                        </a>
                                    </h4>
                                </div>
                                <div id="general" class="accordion-body collapse">
                                    <div class="panel-body">

                                        <fieldset>
                                            <div class="form-group">
                                                <label class="col-md-3 control-label" for="setting_site_name">Site Name</label>

                                                <div class="col-md-8">
                                                    <input type="text" class="form-control" id="setting_site_name" name="setting_site_name" value="<?= $setting_site_name ?>">
                                                </div>
                                            </div>
                                            <div class="form-group">
                                                <label class="col-md-3 control-label" for="setting_site_url">Site URL</label>

                                                <div class="col-md-8">
                                                    <input type="text" class="form-control" id="setting_site_url" name="setting_site_url" value="<?= $setting_site_url ?>">
                                                </div>
                                            </div>
                                            <div class="form-group">
                                                <label class="col-md-3 control-label" for="setting_dashboard_logo_url">Logo URL</label>

                                                <div class="col-md-8">
                                                    <input type="text" class="form-control" id="setting_dashboard_logo_url" name="setting_dashboard_logo_url" value="<?= $setting_dashboard_logo_url ?>">
                                                </div>
                                            </div>
                                            <div class="form-group">
                                                <label class="col-md-3 control-label" for="setting_path_main">Site Directory Path</label>

                                                <div class="col-md-8">
                                                    <input type="text" class="form-control" id="setting_path_main" name="setting_path_main" value="<?= $setting_path_main ?>">
                                                </div>
                                            </div>
                                            <div class="form-group">
                                                <label class="col-md-3 control-label" for="setting_path_backend">Backend Directory Path</label>

                                                <div class="col-md-8">
                                                    <input type="text" class="form-control" id="setting_path_backend" name="setting_path_backend" value="<?= $setting_path_backend ?>">
                                                </div>
                                            </div>

                                        </fieldset>

                                    </div>
                                </div>
                            </div>
                            <div class="panel panel-accordion">
                                <div class="panel-heading">
                                    <h4 class="panel-title">
                                        <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#colors">
                                            Color Settings
                                        </a>
                                    </h4>
                                </div>
                                <div id="colors" class="accordion-body collapse">
                                    <div class="panel-body">

                                        <fieldset>


                                            <div class="form-group">
                                                <label class="col-md-3 control-label">Red Data</label>

                                                <div class="col-md-6">
                                                    <div class="input-group color" data-color="#<?= $setting_color_red ?>" data-color-format="hex" data-plugin-colorpicker>
                                                        <span class="input-group-addon"><i></i></span>
                                                        <input type="text" class="form-control" name="setting_color_red" value="#<?= $setting_color_red ?>">
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="form-group">
                                                <label class="col-md-3 control-label">Yellow Data</label>

                                                <div class="col-md-6">
                                                    <div class="input-group color" data-color="#<?= $setting_color_yellow ?>" data-color-format="hex" data-plugin-colorpicker>
                                                        <span class="input-group-addon"><i></i></span>
                                                        <input type="text" class="form-control" name="setting_color_yellow" value="#<?= $setting_color_yellow ?>">
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="form-group">
                                                <label class="col-md-3 control-label">Green Data</label>

                                                <div class="col-md-6">
                                                    <div class="input-group color" data-color="#<?= $setting_color_green ?>" data-color-format="hex" data-plugin-colorpicker>
                                                        <span class="input-group-addon"><i></i></span>
                                                        <input type="text" class="form-control" name="setting_color_green" value="#<?= $setting_color_green ?>">
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="form-group">
                                                <label class="col-md-3 control-label">Neutral Data</label>

                                                <div class="col-md-6">
                                                    <div class="input-group color" data-color="#<?= $setting_color_neutral ?>" data-color-format="hex" data-plugin-colorpicker>
                                                        <span class="input-group-addon"><i></i></span>
                                                        <input type="text" class="form-control" name="setting_color_neutral" value="#<?= $setting_color_neutral ?>">
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="form-group">
                                                <label class="col-md-3 control-label">Pie Chart Active</label>

                                                <div class="col-md-6">
                                                    <div class="input-group color" data-color="#<?= $setting_color_chart_on ?>" data-color-format="hex" data-plugin-colorpicker>
                                                        <span class="input-group-addon"><i></i></span>
                                                        <input type="text" class="form-control" name="setting_color_chart_on" value="#<?= $setting_color_chart_on ?>">
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="form-group">
                                                <label class="col-md-3 control-label">Pie Chart Neutral</label>

                                                <div class="col-md-6">
                                                    <div class="input-group color" data-color="#<?= $setting_color_chart_off ?>" data-color-format="hex" data-plugin-colorpicker>
                                                        <span class="input-group-addon"><i></i></span>
                                                        <input type="text" class="form-control" name="setting_color_chart_off" value="#<?= $setting_color_chart_off ?>">
                                                    </div>
                                                </div>
                                            </div>

                                        </fieldset>

                                    </div>
                                </div>
                            </div>
                            <div class="panel panel-accordion">
                                <div class="panel-heading">
                                    <h4 class="panel-title">
                                        <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#database">
                                            Database Settings
                                        </a>
                                    </h4>
                                </div>
                                <div id="database" class="accordion-body collapse">
                                    <div class="panel-body">
                                        <fieldset>
                                            <div class="form-group">
                                                <label class="col-md-3 control-label" for="setting_mysql_db_host">MySQL Host</label>

                                                <div class="col-md-8">
                                                    <input type="text" class="form-control" id="setting_mysql_db_host" name="setting_mysql_db_host" value="<?= $setting_mysql_db_host ?>">
                                                </div>
                                            </div>
                                            <div class="form-group">
                                                <label class="col-md-3 control-label" for="setting_mysql_db_name">MySQL Database</label>

                                                <div class="col-md-8">
                                                    <input type="text" class="form-control" id="setting_mysql_db_name" name="setting_mysql_db_name" value="<?= $setting_mysql_db_name ?>">
                                                </div>
                                            </div>
                                            <div class="form-group">
                                                <label class="col-md-3 control-label" for="setting_mysql_db_user">MySQL Username</label>

                                                <div class="col-md-8">
                                                    <input type="text" class="form-control" id="setting_mysql_db_user" name="setting_mysql_db_user" value="<?= $setting_mysql_db_user ?>">
                                                </div>
                                            </div>
                                            <div class="form-group">
                                                <label class="col-md-3 control-label" for="setting_mysql_db_pass">MySQL Password</label>

                                                <div class="col-md-8">
                                                    <input type="password" class="form-control" id="setting_mysql_db_pass" name="setting_mysql_db_pass" value="<?= $setting_mysql_db_pass ?>">
                                                </div>
                                            </div>
                                        </fieldset>
                                    </div>
                                </div>
                            </div>
                            <div class="panel panel-accordion">
                                <div class="panel-heading">
                                    <h4 class="panel-title">
                                        <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#mail">
                                            Mail Settings
                                        </a>
                                    </h4>
                                </div>

                                <div id="mail" class="accordion-body collapse">
                                    <div class="panel-body">

                                        <div class="tabs">
                                            <ul class="nav nav-tabs">
                                                <li class="active">
                                                    <a href="#account-manager" data-toggle="tab">Lead Developer Contact</a>
                                                </li>
                                                <li>
                                                    <a href="#notify" data-toggle="tab">Notification E-Mail</a>
                                                </li>
                                                <li>
                                                    <a href="#contact" data-toggle="tab">Contact E-Mail</a>
                                                </li>
                                            </ul>
                                            <div class="tab-content">

                                                <div id="account-manager" class="tab-pane active">

                                                    <div class="form-group">

                                                        <label class="col-md-3 control-label" for="setting_account_manager_name">Full Name</label>

                                                        <div class="col-md-3">
                                                            <input type="text" class="form-control" id="setting_account_manager_name" name="setting_account_manager_name" value="<?= $setting_account_manager_name ?>">
                                                        </div>


                                                    </div>

                                                    <div class="form-group">


                                                        <label class="col-md-3 control-label" for="setting_account_manager_email">E-Mail Address:</label>

                                                        <div class="col-md-3">
                                                            <input type="text" class="form-control" id="setting_account_manager_email" name="setting_account_manager_email" value="<?= $setting_account_manager_email ?>">
                                                        </div>


                                                    </div>


                                                </div>

                                                <div id="notify" class="tab-pane">

                                                    <div class="form-group">

                                                        <label class="col-md-3 control-label" for="setting_notify_from_email">From E-Mail</label>

                                                        <div class="col-md-3">
                                                            <input type="text" class="form-control" id="setting_notify_from_email" name="setting_notify_from_email" value="<?= $setting_notify_from_email ?>">
                                                        </div>

                                                        <label class="col-md-3 control-label" for="setting_notify_from_name">From Name</label>

                                                        <div class="col-md-3">
                                                            <input type="text" class="form-control" id="setting_notify_from_name" name="setting_notify_from_name" value="<?= $setting_notify_from_name ?>">
                                                        </div>


                                                    </div>


                                                    <div class="form-group">

                                                        <label class="col-md-3 control-label" for="setting_notify_reply_email">Reply E-Mail</label>

                                                        <div class="col-md-3">
                                                            <input type="text" class="form-control" id="setting_notify_reply_email" name="setting_notify_reply_email" value="<?= $setting_notify_reply_email ?>">
                                                        </div>

                                                        <label class="col-md-3 control-label" for="setting_notify_reply_name">Reply Name</label>

                                                        <div class="col-md-3">
                                                            <input type="text" class="form-control" id="setting_notify_reply_name" name="setting_notify_reply_name" value="<?= $setting_notify_reply_name ?>">
                                                        </div>

                                                    </div>

                                                    <div class="form-group">
                                                        <label class="col-md-3 control-label" for="setting_notify_smtp_host">SMTP Host</label>

                                                        <div class="col-md-3">
                                                            <input type="text" class="form-control modal-block-lg" id="setting_notify_smtp_host" name="setting_notify_smtp_host" value="<?= $setting_notify_smtp_host ?>">
                                                        </div>

                                                        <label class="col-md-3 control-label">SMTP Port</label>

                                                        <div class="col-md-3">
                                                            <div data-plugin-spinner="">
                                                                <div class="input-group input-small">
                                                                    <input type="text" id="setting_notify_smtp_port" name="setting_notify_smtp_port" value="<?= $setting_notify_smtp_port ?>" class="spinner-input form-control" maxlength="3">

                                                                    <div class="spinner-buttons input-group-btn btn-group-vertical">
                                                                        <button type="button" class="btn spinner-up btn-xs btn-default">
                                                                            <i class="fa fa-angle-up"></i>
                                                                        </button>
                                                                        <button type="button" class="btn spinner-down btn-xs btn-default">
                                                                            <i class="fa fa-angle-down"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>

                                                    <div class="form-group">

                                                        <label class="col-md-3 control-label" for="setting_notify_smtp_user">SMTP User</label>

                                                        <div class="col-md-3">
                                                            <input type="text" class="form-control" id="setting_notify_smtp_user" name="setting_notify_smtp_user" value="<?= $setting_notify_smtp_user ?>">
                                                        </div>

                                                        <label class="col-md-3 control-label" for="setting_notify_smtp_pass">SMTP Pass</label>

                                                        <div class="col-md-3">
                                                            <input type="password" class="form-control" id="setting_notify_smtp_pass" name="setting_notify_smtp_pass" value="<?= $setting_notify_smtp_pass ?>">
                                                        </div>

                                                    </div>

                                                </div>
                                                <div id="contact" class="tab-pane">

                                                    <div class="form-group">

                                                        <label class="col-md-3 control-label" for="setting_contact_from_email">From E-Mail</label>

                                                        <div class="col-md-3">
                                                            <input type="text" class="form-control" id="setting_contact_from_email" name="setting_contact_from_email" value="<?= $setting_contact_from_email ?>">
                                                        </div>

                                                        <label class="col-md-3 control-label" for="setting_contact_from_name">From Name</label>

                                                        <div class="col-md-3">
                                                            <input type="text" class="form-control" id="setting_contact_from_name" name="setting_contact_from_name" value="<?= $setting_contact_from_name ?>">
                                                        </div>

                                                    </div>


                                                    <div class="form-group">

                                                        <label class="col-md-3 control-label" for="setting_contact_reply_email">Reply E-Mail</label>

                                                        <div class="col-md-3">
                                                            <input type="text" class="form-control" id="setting_contact_reply_email" name="setting_contact_reply_email" value="<?= $setting_contact_reply_email ?>">
                                                        </div>

                                                        <label class="col-md-3 control-label" for="setting_contact_reply_name">Reply Name</label>

                                                        <div class="col-md-3">
                                                            <input type="text" class="form-control" id="setting_contact_reply_name" name="setting_contact_reply_name" value="<?= $setting_contact_reply_name ?>">
                                                        </div>


                                                    </div>

                                                    <div class="form-group">
                                                        <label class="col-md-3 control-label" for="setting_contact_smtp_host">SMTP Host</label>

                                                        <div class="col-md-3">
                                                            <input type="text" class="form-control modal-block-lg" id="setting_contact_smtp_host" name="setting_contact_smtp_host" value="<?= $setting_contact_smtp_host ?>">
                                                        </div>

                                                        <label class="col-md-3 control-label">SMTP Port</label>

                                                        <div class="col-md-3">
                                                            <div data-plugin-spinner="">
                                                                <div class="input-group input-small">
                                                                    <input type="text" id="setting_contact_smtp_port" name="setting_contact_smtp_port" value="<?= $setting_contact_smtp_port ?>" class="spinner-input form-control" maxlength="3">

                                                                    <div class="spinner-buttons input-group-btn btn-group-vertical">
                                                                        <button type="button" class="btn spinner-up btn-xs btn-default">
                                                                            <i class="fa fa-angle-up"></i>
                                                                        </button>
                                                                        <button type="button" class="btn spinner-down btn-xs btn-default">
                                                                            <i class="fa fa-angle-down"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>

                                                    <div class="form-group">

                                                        <label class="col-md-3 control-label" for="setting_contact_smtp_user">SMTP User</label>

                                                        <div class="col-md-3">
                                                            <input type="text" class="form-control" id="setting_contact_smtp_user" name="setting_contact_smtp_user" value="<?= $setting_contact_smtp_user ?>">
                                                        </div>

                                                        <label class="col-md-3 control-label" for="setting_contact_smtp_pass">SMTP Pass</label>

                                                        <div class="col-md-3">
                                                            <input type="password" class="form-control" id="setting_contact_smtp_pass" name="setting_contact_smtp_pass" value="<?= $setting_contact_smtp_pass ?>">
                                                        </div>

                                                    </div>

                                                </div>
                                            </div>
                                        </div>


                                    </div>
                                </div>
                            </div>
                        </div>


                </div>
                <div class="panel-footer">
                    <div class="form-group">
                        <div class="col-md-offset-3 col-md-9">
                            <button type="submit" name="edit" value="1" class="btn btn-primary">Save Changes</button>
                            <button type="reset" class="btn btn-default pull-right">Start Over</button>
                        </div>
                    </div>
                </div>
                </form>
            </section>
        </div>
    </div>
<? include 'footer.php'; ?>