<div class="row marketing">
<?php
if(!$login->Access("admin")) {
	echo "<div class='alert alert-danger'>You don't have permissions to view this page.</div>";
}elseif(isset($_GET['add'])) {
	$username = "";
	$email = "";
	$admin = "";
	if(isset($_POST['submit'])) {
		$username = $_POST['username'];
		$email = $_POST['email'];
		if(isset($_POST['admin'])) { $admin = "1"; }else{ $admin = "0"; }

		try {
			$login->AddUser($_POST['username'], $_POST['email'], $_POST['password'], $_POST['r_password'], $admin);
			echo "<div class='alert alert-success'>This user was added successfully.<br /><b>Username:</b> ".html($_POST['username'])."<br /><b>Password:</b> ".html($_POST['password'])."</div>";
		}
		catch(LoginError $e) {
			echo "<div class='alert alert-danger'>{$e->getMessage()}</div>";
		}
	}
?>
<form method="POST">
	<div class="form-group">
		<label for="username">Username</label>
		<input type="text" class="form-control" id="username" name="username" value="<?php echo $username; ?>" required>
	</div>
	
	<div class="form-group">
		<label for="email">E-mail</label>
		<input type="email" class="form-control" id="email" name="email" value="<?php echo $email; ?>" required>
	</div>
	
	<div class="form-group">
		<label for="password">Password</label>
		<input type="password" class="form-control" id="password" name="password" placeholder="" required>
	</div>
	
	<div class="form-group">
		<label for="r_password">Repeat password</label>
		<input type="password" class="form-control" id="r_password" name="r_password" placeholder="" required>
	</div>
	
	<div class="checkbox">
		<label>
			<input type="checkbox" name="admin" value="1" <?php if($admin == "1") { echo "checked"; } ?>> Admin
		</label>
	</div>
	<button type="submit" class="btn btn-success" name="submit">Save settings</button>
</form>
<?php
}elseif(isset($_GET['edit'])) {
	$id = $db->real_escape_string($_GET['edit']);
	$check_user = $db->query("SELECT * FROM users WHERE id='{$id}'");
	$row = $check_user->fetch_assoc();
	if($check_user->num_rows == 0){
		echo "<div class='alert alert-danger'>This user does not exist in our system.</div>";
		
	}else{
		$email = $row['email'];
		$chart1 = $row['chart_1'];
		$chart2 = $row['chart_2'];
		$servers = $row['max_servers'];
		$admin = $row['admin'];
		if(isset($_POST['submit'])) {
			$email = $_POST['email'];
			$chart1 = $_POST['chart1'];
			$chart2 = $_POST['chart2'];
			$servers = $_POST['servers'];
			if(isset($_POST['admin'])) { $admin = "1"; }else{ $admin = "0"; }
			
			try {
				$new_password = "";
				$login->EditUser($id, $_POST['email'], $_POST['password'], $_POST['r_password'], $_POST['chart1'], $_POST['chart2'], $admin, $servers);
				if(!empty($_POST['password'])) {
					$new_password = "<br /><b>New Password:</b> ".$_POST['password'];
				}
				echo "<div class='alert alert-success'>This user was edited successfully.<br />{$new_password}</div>";
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
				$sql = $db->query("SELECT id, display_name, state FROM servers WHERE member_id='{$row['id']}' AND disabled='0' AND deleted='0'");
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
				$sql = $db->query("SELECT id, display_name, state FROM servers WHERE member_id='{$row['id']}' AND disabled='0' AND deleted='0'");
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
	
	<div class="form-group">
		<label for="servers">Maximum servers</label>
		<input type="number" min="0" max="50" class="form-control" id="servers" name="servers" value="<?php echo $servers; ?>" required>
		<p class="help-block">0 = Unlimited</p>
	</div>
	
	<div class="checkbox">
		<label>
			<input type="checkbox" name="admin" value="1" <?php if($admin == "1") { echo "checked"; } ?>> Admin
		</label>
	</div>
	<button type="submit" class="btn btn-success" name="submit">Save settings</button>
</form>
<?php
	}
}elseif(isset($_GET['delete'])) {
		$id = $db->real_escape_string($_GET['delete']);
		$sql = $db->query("SELECT * FROM users WHERE id='{$id}'");
		if($sql->num_rows == 0) {
			echo "This user was not found.";
		}else{
			$row = $sql->fetch_assoc();
			if(isset($_POST['submit'])) {
				if(DEMO == 0) {
					$db->query("DELETE FROM users WHERE id='{$id}'");
					$db->query("DELETE FROM sessions WHERE member_id='{$id}'");
				}
				echo "<div class='alert alert-success'>This user is now deleted.</div>";
				echo $function->Redirect("index.php?p=users");
			}
?>
		<form method="POST">
			Are you sure you want delete the user <i><?php echo $row['username']; ?></i>? This cannot be undone.<br /><br />
			<button type="submit" class="btn btn-success" name="submit">Yes</button>
			<button type="button" class="btn btn-danger"  onclick="location.href='index.php?p=users'">No</button>
		</form>
<?php
	}
}else{
	$sql = $db->query("SELECT * FROM users");
?>
		<p class="pull-right">
			<button type="button" class="btn btn-primary" onclick="location.href='index.php?p=users&add'">Add User</button>
		</p>
		<table class="table table-striped">
			<thead>
				<tr>
					<th>ID</th>
					<th>Username</th>
					<th>Email</th>
					<th>Limit</th>
					<th>Admin</th>
					<th>Options</th>
				</tr>
			</thead>
			<tbody>
				<?php 
					while($row = $sql->fetch_assoc()) {
						$servers = $db->query("SELECT * FROM servers WHERE member_id='{$row['id']}'")->num_rows;
				?>
					<tr>
						<td><?php echo $row['id']; ?></td>
						<td><?php echo $row['username']; ?></td>
						<td><?php echo $row['email']; ?></td>
						<td><?php echo (($row['max_servers'] == "0") ? "&infin;" : (($servers >= $row['max_servers']) ? "<font color='red'>{$servers}/{$row['max_servers']}</font>" : "<font color='green'>{$servers}/{$row['max_servers']}</font>")); ?></td>
						<td><?php echo (($row['admin'] == 1) ? "Yes" : "No"); ?></td>
						<td>
							<span style="cursor: pointer;" onclick="location.href='index.php?p=users&edit=<?php echo $row['id']; ?>'" class="label label-info" <?php echo $function->Tooltip("Edit user"); ?>><span class="fa fa-pencil"></span></span>
							<span style="cursor: pointer;" onclick="location.href='index.php?p=users&delete=<?php echo $row['id']; ?>'" class="label label-danger" <?php echo $function->Tooltip("Delete user"); ?>><span class="fa fa-trash"></span></span>
						</td>
					</tr>
				<?php } ?>
			</tbody>
		</table>
<?php } ?>
</div>