<?php
$check_user = $db->query("SELECT * FROM users WHERE id='{$login->id}'");
$row = $check_user->fetch_assoc();
$email = $row['email'];
$chart1 = $row['chart_1'];
$chart2 = $row['chart_2'];
if(isset($_POST['submit'])) {
	$email = $_POST['email'];
	$chart1 = $_POST['chart1'];
	$chart2 = $_POST['chart2'];
	try {
		$new_password = "";
		$login->EditUser($login->id, $_POST['email'], $_POST['password'], $_POST['r_password'], $_POST['chart1'], $_POST['chart2'], $row['admin'], $row['max_servers']);
		if(!empty($_POST['password'])) {
			$new_password = "<b>New Password:</b> ".$_POST['password'];
		}
		echo "<div class='alert alert-success'>Account settings saved successfully<br />{$new_password}</div>";
	}
	catch(LoginError $e) {
		echo "<div class='alert alert-danger'>{$e->getMessage()}</div>";
	}
}
?>
<form method="POST">
	<div class="form-group">
		<label for="username">Username</label>
		<input type="text" class="form-control" id="username" value="<?php echo $row['username']; ?>" readonly>
	</div>
	
	<div class="form-group">
		<label for="email">E-mail</label>
		<input type="email" class="form-control" id="email" name="email" value="<?php echo $email; ?>" required>
	</div>

	<div class="form-group">
		<label for="chart1">Dashboard Chart 1</label>
		<select name="chart1" id="chart1" class="form-control">
			<?php
				echo '<option '.(($chart1 == "0") ? "selected" : "").' value="0">Disabled</option>';
				$sql = $db->query("SELECT id, display_name, state FROM servers WHERE member_id='{$login->id}' AND disabled='0' AND deleted='0'");
				while($row = $sql->fetch_assoc()) {
					echo '<option '.(($chart1 == $row['id']) ? "selected" : "").' value="'.$row['id'].'">'.$row['display_name'].' ('.$row['state'].')</option>';
				}
			?>
		</select>
	</div>
	
	<div class="form-group">
		<label for="chart2">Dashboard Chart 2</label>
		<select name="chart2" id="chart2" class="form-control">
			<?php
				echo '<option '.(($chart2 == "0") ? "selected" : "").' value="0">Disabled</option>';
				$sql = $db->query("SELECT id, display_name, state FROM servers WHERE member_id='{$login->id}' AND disabled='0' AND deleted='0'");
				while($row = $sql->fetch_assoc()) {
					echo '<option '.(($chart2 == $row['id']) ? "selected" : "").' value="'.$row['id'].'">'.$row['display_name'].' ('.$row['state'].')</option>';
				}
			?>
		</select>
	</div>
	
	<div class="form-group">
		<label for="password">Password</label>
		<input type="password" class="form-control" id="password" name="password" placeholder="Leave blank if you don't want to change the password">
	</div>
	
	<div class="form-group">
		<label for="r_password">Repeat password</label>
		<input type="password" class="form-control" id="r_password" name="r_password" placeholder="Leave blank if you don't want to change the password">
	</div>
	<button type="submit" class="btn btn-success" name="submit">Save settings</button>
</form>