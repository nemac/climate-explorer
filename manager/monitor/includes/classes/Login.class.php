<?php
class LoginError extends Exception { }

class Login {
	public $LoggedIn = false;
	public $username = false;
	public $email = false;
	public $id = false;
	
	function __construct() {
		global $db, $cookie;
		
		if($cookie->Exists("LoggedIn_Token") && !$cookie->IsEmpty("LoggedIn_Token")) {
			$token = $db->real_escape_string(html($cookie->Get("LoggedIn_Token")));
			
			$sql = $db->query("SELECT * FROM sessions WHERE hash='{$token}' AND ip='{$_SERVER['REMOTE_ADDR']}'");
			$row = $sql->fetch_assoc();
			if($sql->num_rows == 1) {
				$usercheck = $db->query("SELECT * FROM users WHERE id='{$row['member_id']}'");
				$usercheck_row = $usercheck->fetch_assoc();
				if($usercheck->num_rows == 1) {
					$this->LoggedIn = true;
					
					$this->id = $row['member_id'];
					$this->username = $usercheck_row['username'];
					$this->email = $usercheck_row['email'];
				} else {
					$cookie->Delete("LoggedIn_Token");
				}
			} else {
				$cookie->Delete("LoggedIn_Token");
			}
		}
	}
	
	function SignIn($username, $password, $captcha) {
		global $db, $config;
		
		$username = $db->real_escape_string(html($username));
		$password = $db->real_escape_string(hash("whirlpool", $password));
		$captcha = $db->real_escape_string(html($captcha));
		
		if(empty($username) && empty($password)) {
			throw new LoginError("Please enter an username and password.");
		}elseif($config['captcha'] == "1" && $_SESSION['captcha'] != hash("sha256", $captcha)) {
			throw new LoginError("Your captcha is not correct.");
		}else{
			$sql = $db->query("SELECT * FROM users WHERE (username='{$username}' OR email='{$username}') AND password='{$password}'");
			$row = $sql->fetch_assoc();
			if($sql->num_rows == 0){
				throw new LoginError("This username/email or password was not found.");
			}else{
				unset($_SESSION['captcha']);
				$this->CreateSession($row['id']);
			}
		}
	}
	
	function CreateSession($member_id) {
		global $db, $cookie;
		
		$id = $db->real_escape_string(html($member_id));
		
		$sql = $db->query("SELECT * FROM users WHERE id='{$id}'");
		$row = $sql->fetch_assoc();
		
		if($sql->num_rows == 0) {
			throw new LoginError("This user was not found.");
		}else{
			$db->query("DELETE FROM sessions WHERE member_id='{$id}'");
			
			$uniqid = uniqid("Monitor-");
			$hash = hash("whirlpool", "{$uniqid}{$row['username']}{$row['email']}");
			
			$cookie->Set("LoggedIn_Token", $hash);
			
			$db->query("INSERT INTO sessions (member_id, date, hash, ip) VALUES ('{$id}', NOW(), '{$hash}', '{$_SERVER['REMOTE_ADDR']}')");
		}
	}
	
	function Access() {
		global $db, $config;
		
		if($this->LoggedIn) {
			$user = $db->query("SELECT * FROM users WHERE id='{$this->id}'");
			$user = $user->fetch_assoc();
			if($user['admin'] == "1") {
				return true;
			}else{
				return false;
			}
		}else{
			return false;
		}
	}
	
	function AddUser($username, $email, $password, $password1, $access="0") {
		global $db, $config;
		
		$username = $db->real_escape_string(html($username));
		$email = $db->real_escape_string(html($email));
		$password = $db->real_escape_string(html($password));
		$password1 = $db->real_escape_string(html($password1));
		$access = $db->real_escape_string(html($access));
		
		$check_user = $db->query("SELECT * FROM users WHERE username='{$username}'");
		$check_user_row = $check_user->fetch_assoc();
		
		$email_check = $db->query("SELECT * FROM users WHERE email='{$email}'")->num_rows;
		
		if(empty($username) && empty($email) && empty($password) && empty($password1) && empty($access)) {
			throw new LoginError("Please, fill in all the inputs.");
			
		}elseif(strlen($username) < 4){
			throw new LoginError("Your username must be longer than 4 characters.");
			
		}elseif(strlen($password) < 6){
			throw new LoginError("Your password must be longer than 6 characters.");
			
		}elseif($password != $password1){
			throw new LoginError("Your passwords does not match");
			
		}elseif($check_user->num_rows != 0){
			throw new LoginError("This username is already exist in our system.");
			
		}elseif($email_check != 0) {
			throw new LoginError("This email is already exist in our system.");
			
		}elseif(!filter_var($email, FILTER_VALIDATE_EMAIL)) {
			throw new LoginError("This email address is invalid.");
			
		}else{
			if(DEMO == 0) {
				$db->query("INSERT INTO users (username, password, email, max_servers, admin) VALUES ('{$username}', '".hash("whirlpool", $password)."', '{$email}', '{$config['default_max_servers']}', '{$access}')");
			}

		}
	}
	
	function EditUser($id, $email, $password, $password1, $chart1=0, $chart2=0, $access=0, $max_servers=0) {
		global $db, $config;
		
		$id = $db->real_escape_string(html($id));
		$email = $db->real_escape_string(html($email));
		$password = $db->real_escape_string(html($password));
		$password1 = $db->real_escape_string(html($password1));
		$chart1 = $db->real_escape_string(html($chart1));
		$chart2 = $db->real_escape_string(html($chart2));
		$access = $db->real_escape_string(html($access));
		$max_servers = $db->real_escape_string(html($max_servers));
		
		$check_user = $db->query("SELECT * FROM users WHERE id='{$id}'");
		$check_user_row = $check_user->fetch_assoc();
		
		$chart1_check = $db->query("SELECT * FROM servers WHERE id='{$chart1}' AND member_id='{$id}' AND disabled='0' AND deleted='0'");
		$chart2_check = $db->query("SELECT * FROM servers WHERE id='{$chart2}' AND member_id='{$id}' AND disabled='0' AND deleted='0'");
		
		$email_check = $db->query("SELECT * FROM users WHERE email='{$email}'")->num_rows;
		
		if($check_user->num_rows == 0){
			throw new LoginError("This user does not exist in our system.");
			
		}elseif(!empty($password) && $password != $password1){
			throw new LoginError("Your passwords does not match");
			
		}elseif(!empty($password) && strlen($password) < 6){
			throw new LoginError("Your password must be longer than 6 characters.");
			
		}elseif($chart1 != "0" && $chart1_check->num_rows == 0){
			throw new LoginError("Dashboard chart 1 was not found.");

		}elseif($chart2 != "0" && $chart2_check->num_rows == 0){
			throw new LoginError("Dashboard chart 2 was not found.");
			
		}elseif($check_user_row['email'] != $email && $email_check != 0) {
			throw new LoginError("This email is already exist in our system.");
			
		}elseif($check_user_row['email'] != $email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
			throw new LoginError("This email address is invalid.");
			
		}else{
			if(DEMO == 0) {
				$db->query("UPDATE users SET admin='{$access}', chart_1='{$chart1}', chart_2='{$chart2}', max_servers='{$max_servers}' WHERE id='{$id}'");
				if(!empty($password)) {
					$db->query("UPDATE users SET password='".hash("whirlpool", $password)."' WHERE id='{$id}'");
				}
				if($check_user_row['email'] != $email) {
					$db->query("UPDATE users SET email='{$email}' WHERE id='{$id}'");				
				}
			}
			
		}
	}
}
?>