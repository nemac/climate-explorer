<?php
class ServerError extends Exception { }

class Server {
	public function Color($id) { 
		if($id == 'deleted') {
			return '<div class="label label-danger">Deleted</div>';
		}elseif($id == 'disabled') {
			return '<div class="label label-default">Disabled</div>';
		}elseif($id == 'down') {
			return '<div class="label label-danger">Down!</div>';
		}elseif($id == 'active') {
			return '<div class="label label-success">Up</div>';
		}elseif($id == 'unknown') {
			return '<div class="label label-warning">Unknown</div>';
		}
	}
	
	public function ProgressColor($value) {
		if($value < 30) {
			return "success";
		}elseif($value < 75) {
			return "warning";
		}elseif($value < 100) {
			return "danger";
		}else{
			return "danger";
		}
	}
	
	public function Uptime($value) {
		if($value < 30) {
			return "danger";
		}elseif($value < 75) {
			return "warning";
		}elseif($value < 100) {
			return "success";
		}else{
			return "success";
		}
	}
	
	public function Add($disp, $url, $email, $enabled="0", $desktop="0", $pushbullet="0") {
		global $db, $pb, $login;
		
		$disp = $db->real_escape_string(html($disp));
		$url = $db->real_escape_string(html($url));
		$email = $db->real_escape_string(html($email));
		$enabled = $db->real_escape_string(html($enabled));
		$desktop = $db->real_escape_string(html($desktop));
		$pushbullet = $db->real_escape_string(html($pushbullet));
		
		if(empty($url) && empty($disp)) {
			throw new ServerError("You forgot the Server URL or the Display Name");
		}elseif (filter_var($url, FILTER_VALIDATE_URL) === false) {
			throw new ServerError("Please enter valid a server url");
		}elseif(!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL) == false){ 
			throw new ServerError("Please enter valid a email-address");
		}elseif($pushbullet != "0" && !$pb->CheckExists($pushbullet)){ 
			throw new ServerError("This pushbullet account was not found");
		}else{
			if(DEMO == 0) {
				$db->query("INSERT INTO servers (member_id,display_name,server_url,email_to,disabled,desktop_notif,pushbullet) VALUES ('{$login->id}', '{$disp}', '{$url}', '{$email}', '{$enabled}', '{$desktop}', '{$pushbullet}')");
			}
		}
	}
	
	public function Edit($id, $disp, $url, $email, $enabled="0", $desktop="0", $pushbullet="0", $owner="0") {
		global $db, $pb;
		
		$disp = $db->real_escape_string(html($disp));
		$url = $db->real_escape_string(html($url));
		$email = $db->real_escape_string(html($email));
		$enabled = $db->real_escape_string(html($enabled));
		$desktop = $db->real_escape_string(html($desktop));
		$pushbullet = $db->real_escape_string(html($pushbullet));
		$owner = $db->real_escape_string(html($owner));
		
		$check_user = $db->query("SELECT * FROM users WHERE id='{$owner}'")->num_rows;
		$server_check = $db->query("SELECT * FROM servers WHERE id='{$id}'")->fetch_assoc();
		
		if($server_check['member_id'] != $owner) { $pushbullet = 0; }
		
		if(empty($url) && empty($disp)) {
			throw new ServerError("You forgot the Server URL or the Display Name");
		}elseif (filter_var($url, FILTER_VALIDATE_URL) === false) {
			throw new ServerError("Please enter valid a server url");
		}elseif(!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL) == false){ 
			throw new ServerError("Please enter valid a email-address");
		}elseif($pushbullet != "0" && !$pb->CheckExists($pushbullet, $owner)){ 
			throw new ServerError("This pushbullet account was not found");
		}elseif($check_user == 0){ 
			throw new ServerError("This user does not exist.");
		}else{
			if(DEMO == 0) {
				$db->query("UPDATE servers SET member_id='{$owner}', display_name='{$disp}', server_url = '{$url}', email_to = '{$email}', disabled = '{$enabled}', desktop_notif='{$desktop}', pushbullet='{$pushbullet}' WHERE id='{$id}'");
				$db->query("UPDATE server_stats SET member_id='{$owner}' WHERE server_id='{$id}'");
			}
		}
	}
	
	public function GetLastStats($id) {
		global $db;
		
		$id = $db->real_escape_string(html($id));
		if(empty($id)) {
			return "ID was not found!";
		}else{
			$query = $db->query("SELECT * FROM servers WHERE id='{$id}'");
			$query = $query->fetch_assoc();
			return $query;
		}
	}
	
	public function ResponseName($code = NULL) {

		if ($code !== NULL) {
			switch ($code) {
				case 100: $text = 'Continue'; break;
				case 101: $text = 'Switching Protocols'; break;
				case 200: $text = 'OK'; break;
				case 201: $text = 'Created'; break;
				case 202: $text = 'Accepted'; break;
				case 203: $text = 'Non-Authoritative Information'; break;
				case 204: $text = 'No Content'; break;
				case 205: $text = 'Reset Content'; break;
				case 206: $text = 'Partial Content'; break;
				case 300: $text = 'Multiple Choices'; break;
				case 301: $text = 'Moved Permanently'; break;
				case 302: $text = 'Moved Temporarily'; break;
				case 303: $text = 'See Other'; break;
				case 304: $text = 'Not Modified'; break;
				case 305: $text = 'Use Proxy'; break;
				case 400: $text = 'Bad Request'; break;
				case 401: $text = 'Unauthorized'; break;
				case 402: $text = 'Payment Required'; break;
				case 403: $text = 'Forbidden'; break;
				case 404: $text = 'Not Found'; break;
				case 405: $text = 'Method Not Allowed'; break;
				case 406: $text = 'Not Acceptable'; break;
				case 407: $text = 'Proxy Authentication Required'; break;
				case 408: $text = 'Request Time-out'; break;
				case 409: $text = 'Conflict'; break;
				case 410: $text = 'Gone'; break;
				case 411: $text = 'Length Required'; break;
				case 412: $text = 'Precondition Failed'; break;
				case 413: $text = 'Request Entity Too Large'; break;
				case 414: $text = 'Request-URI Too Large'; break;
				case 415: $text = 'Unsupported Media Type'; break;
				case 500: $text = 'Internal Server Error'; break;
				case 501: $text = 'Not Implemented'; break;
				case 502: $text = 'Bad Gateway'; break;
				case 503: $text = 'Service Unavailable'; break;
				case 504: $text = 'Gateway Time-out'; break;
				case 505: $text = 'HTTP Version not supported'; break;
				default:  $text = 'Unknown'; break;
			}
			return $text;
		}
	}
}
?>