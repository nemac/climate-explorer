<?php
class CSRF {
	function CreateToken () {
		if(!isset($_SESSION['CSRF_TOKEN'])) {
			$_SESSION['CSRF_TOKEN'] = md5(uniqid());
		}
	}
	
	function RegenerateToken () {
		$_SESSION['CSRF_TOKEN'] = md5(uniqid());
	}

	function CheckToken () {
		if(isset($_SESSION['CSRF_TOKEN']) && isset($_POST['csrf_token'])) {
			if($_SESSION['CSRF_TOKEN'] == $_POST['csrf_token']) {
				return true;
			}
		}
		return false;
	}
	
	function CreateInput () {
		$this->RegenerateToken();
		return "<input type='hidden' name='csrf_token' value='{$_SESSION['CSRF_TOKEN']}' />";
	}
	
	function CheckForms($array) {
		foreach($array as $forms => $value) {
			if(!isset($_POST[$forms])) {
				return false;
			}elseif($value['required'] == 1 && empty($_POST[$forms])) {
				return false;
			}
		}
		return true;
	}
}
?>