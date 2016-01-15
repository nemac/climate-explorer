<div class="row marketing">
<?php
if(!$login->Access()) {
	echo "<div class='alert alert-danger'>You don't have permissions to view this page.</div>";
}else{
$name = $config['name'];
$email = $config['email'];
$timeout = $config['timeout'];
$servers = $config['default_max_servers'];
$captcha = $config['captcha'];
$register = $config['register'];

if(isset($_POST['submit'])) {
	$name = $db->real_escape_string(html($_POST['name']));
	$email = $db->real_escape_string(html($_POST['email']));
	$timeout = $db->real_escape_string(html($_POST['timeout']));
	$servers = $db->real_escape_string(html($_POST['servers']));
	$captcha = $db->real_escape_string(html($_POST['captcha']));
	$register = $db->real_escape_string(html($_POST['register']));

	if(empty($name) || empty($email) || empty($timeout) || !is_numeric($timeout) || !is_numeric($servers)) {
		echo "<div class='alert alert-danger'>You forgot someting.</div>";
		
	}elseif(!filter_var($email, FILTER_VALIDATE_EMAIL)) {
		echo "<div class='alert alert-danger'>Please, enter a valid e-mail address</div>";
		
	}else{
		echo "<div class='alert alert-success'>The setting has been saved.</div>";
		if(DEMO == 0) {
			$db->query("UPDATE config SET name='{$name}', email='{$email}', default_max_servers='{$servers}', timeout='{$timeout}', captcha='{$captcha}', register='{$register}'");
		}
	}
}
?>
<form method="post">
	<div class="form-group">
		<label for="name">Website Name</label>
		<input type="text" class="form-control" id="name" name="name" value="<?php echo $name; ?>" required>
	</div>
	
	<div class="form-group">
		<label for="email">E-Mail</label>
		<input type="email" class="form-control" id="email" name="email" value="<?php echo $email; ?>" required>
	</div>
	
	<div class="form-group">
		<label for="timeout">Timeout (seconds)</label>
		<input type="number" min="5" max="20" class="form-control" id="timeout" name="timeout" value="<?php echo $timeout; ?>" required>
	</div>
	
	<div class="form-group">
		<label for="servers">Users max servers after register</label>
		<input type="number" min="0" max="50" class="form-control" id="servers" name="servers" value="<?php echo $servers; ?>" required>
		<p class="help-block">0 = Unlimited</p>
	</div>

	<div class="form-group">
		<label for="sign">Sign In Captcha</label>
		<select name="captcha" id="sign" class="form-control">
			<?php
				echo '<option '.(($captcha == "1") ? "selected" : "").' value="1">Yes</option>';
				echo '<option '.(($captcha == "0") ? "selected" : "").' value="0">No</option>';
			?>
		</select>
	</div>

	<div class="form-group">
		<label for="register">Register Page</label>
		<select name="register" id="register" class="form-control">
			<?php
				echo '<option '.(($register == "1") ? "selected" : "").' value="1">Yes</option>';
				echo '<option '.(($register == "0") ? "selected" : "").' value="0">No</option>';
			?>
		</select>
	</div>
	
	<div class="form-group">
		<label for="cronjob">Cronjob</label>
		<input type="text" class="form-control" id="cronjob" value="*/1 * * * * /usr/local/bin/php <?php echo PATH; ?>/cronjob/Checker.php >/dev/null 2>&1" onclick="this.setSelectionRange(0, this.value.length)" readonly>
	</div>
	
	<div class="form-group">
		<label for="cronjob">Panel path</label>
		<input type="text" class="form-control" id="cronjob" value="<?php echo PATH; ?>/" onclick="this.setSelectionRange(0, this.value.length)" readonly>
	</div>
	
	<button type="submit" name="submit" class="btn btn-success">Save</button>
</form>
<?php } ?>
</div>