<?
$setting_site_url="http://bigmappers.com/climate-explorer/";
$setting_site_name="Climate Explorer";
$setting_path_main="/";
$setting_path_backend="/manager";
$setting_contact_email="admin@test.com";
$setting_notify_email="admin@test.com";
$setting_dashboard_logo_url="";

$setting_mysql_db_host="localhost";
$setting_mysql_db_user="habitats_climate";
$setting_mysql_db_pass="c0raplok";
$setting_mysql_db_name="habitats_climateexplorer";


$setting_notify_from_email="devtest@bigmapping.com";
$setting_notify_from_name="BigMapping Notification";
$setting_notify_reply_email="devtest@bigmapping.com";
$setting_notify_reply_name="No Reply";
$setting_notify_smtp_host="bigmapping.com";
$setting_notify_smtp_port="26";
$setting_notify_smtp_user="devtest@bigmapping.com";
$setting_notify_smtp_pass="c0raplok";

$setting_contact_from_email="devtest@bigmapping.com";
$setting_contact_from_name="BigMapping Contact";
$setting_contact_reply_email="devtest@bigmapping.com";
$setting_contact_reply_name="No Reply";
$setting_contact_smtp_host="bigmapping.com";
$setting_contact_smtp_port="26";
$setting_contact_smtp_user="devtest@bigmapping.com";
$setting_contact_smtp_pass="c0raplok";


$setting_color_red="f2645f";
$setting_color_yellow="f3b34f";
$setting_color_green="078090";
$setting_color_neutral="0b4f8a";
$setting_color_chart_on="078090";
$setting_color_chart_off="f3eae7";

$setting_sitepath = dirname(__FILE__);


// not using basename(__FILE__, '.php');  because it returns this actual file.
$setting_current_file_slug = basename($_SERVER["SCRIPT_FILENAME"], '.php');



// INLINE DECLARATIONS
$notification = isset($notification) ? $notification : '';
$page_header = isset($page_header) ? $page_header : '';
$page_caption = isset($page_caption) ? $page_caption : '';
