<div class="row marketing">
	<?php
	if(isset($_GET['a'])) {
		if($_GET['a'] == "add") {
			$sql = $db->query("SELECT * FROM servers WHERE member_id='{$login->id}'");
			$user = $db->query("SELECT * FROM users WHERE id='{$login->id}'")->fetch_assoc();
			if($user['max_servers'] != "0" && $sql->num_rows >= $user['max_servers']) {
				echo "<div class='alert alert-danger'>You can't create servers anymore because you have reached your limit.</div>";   
			}else{
			$url = "";
			$email = "";
			$disp = "";
			$state = "0";
			$desktop = "1";
			$pushbullet = "0";
			if(isset($_POST['submit'])) {
				$url = $_POST['website'];
				$email = $_POST['email'];
				$disp = $_POST['disp_name'];
				$state = ((isset($_POST['state'])) ? "1" : "0");
				$desktop = ((isset($_POST['desktop'])) ? "1" : "0");
				$pushbullet = $_POST['pushbullet'];
				try {
					$server->Add($_POST['disp_name'], $_POST['website'], $_POST['email'], $state, $desktop, $pushbullet);
					echo "<div class='alert alert-success'>New server added successfully.</div>";
					echo $function->Redirect("index.php?p=server_manager");
				}
				catch(ServerError $e) {
					echo "<div class='alert alert-danger'>{$e->getMessage()}</div>"; 
				}
			}
	?>
	<form method="POST">
		<div class="form-group">
			<label for="disp_name">Display Name</label>
			<input type="text" class="form-control" id="disp_name" name="disp_name" placeholder="Google" value="<?php echo $disp; ?>" required>
		</div>
		<div class="form-group">
			<label for="website">Website To Check</label>
			<input type="url" class="form-control" id="website" name="website" placeholder="http://google.com" value="<?php echo $url; ?>" required>
		</div>
		<div class="form-group">
			<label for="email">Email</label>
			<input type="email" class="form-control" id="email" name="email" placeholder="info@example.com" value="<?php echo $email; ?>">
		</div>
		<div class="form-group">
			<label for="email">Pushbullet</label>
			<select class="form-control" name="pushbullet">
				<?php
					echo "<option value='0' ".(($pushbullet == 0) ? "selected" : "").">Disabled</option>";
					$sql = $db->query("SELECT * FROM pushbullet WHERE member_id='{$row['member_id']}'");
					while($row = $sql->fetch_assoc()) {
						echo "<option value='{$row['id']}' ".(($pushbullet == $row['id']) ? "selected" : "").">".$row['email']."</option>";
					}
				?>
			</select>
		</div>
		<div class="checkbox">
			<label>
				<input type="checkbox" name="state" value="1" <?php if($state == "1") { echo "checked"; } ?>> Disabled
			</label>
		</div>
		<div class="checkbox">
			<label>
				<input type="checkbox" name="desktop" value="1" <?php if($desktop == "1") { echo "checked"; } ?>> Desktop notification
			</label>
		</div>
		<button type="submit" class="btn btn-success" name="submit">Add server</button>
	</form>
	<?php
			}
		}else{
			echo "<div class='alert alert-danger'>This action was not found.</div>";   
		}
	}elseif(isset($_GET['edit'])) {
			$id = $db->real_escape_string($_GET['edit']);
			$sql = $db->query("SELECT * FROM servers WHERE id='{$id}' AND deleted='0' ".((!$login->Access()) ? "AND member_id='{$login->id}'" : ""));
			if($sql->num_rows == 0) {
				echo "<div class='alert alert-danger'>This server was not found.</div>";
			}else{
				 $row = $sql->fetch_assoc();
				$url = $row['server_url'];
				$email = $row['email_to'];
				$disp = $row['display_name'];
				$state = (($row['disabled'] == "0") ? "0" : "1");
				$desktop = (($row['desktop_notif'] == "0") ? "0" : "1");
				$pushbullet = $row['pushbullet'];
				$owner = $row['member_id'];
				if(isset($_POST['submit'])) {
					$url = $_POST['website'];
					$email = $_POST['email'];
					$disp = $_POST['disp_name'];
					$state = ((isset($_POST['state'])) ? "1" : "0");
					$desktop = ((isset($_POST['desktop'])) ? "1" : "0");
					$pushbullet = $_POST['pushbullet'];
					if(isset($_POST['owner'])) { $owner = $_POST['owner']; }
					
					try {
						$server->Edit($id, $_POST['disp_name'], $_POST['website'], $_POST['email'], $state, $desktop, $pushbullet, $owner);
						echo "<div class='alert alert-success'>This server is successfully edited.</div>";
						echo $function->Redirect("index.php?p=server_manager");
					}
					catch(ServerError $e) {
						echo "<div class='alert alert-danger'>{$e->getMessage()}</div>"; 
					}
				}
	?>
		<form method="POST">
			<div class="form-group">
				<label for="disp_name">Display Name</label>
				<input type="text" class="form-control" id="disp_name" name="disp_name" placeholder="Google" value="<?php echo $disp; ?>" required>
			</div>
			<div class="form-group">
				<label for="website">Website To Check</label>
				<input type="url" class="form-control" id="website" name="website" placeholder="http://google.com" value="<?php echo $url; ?>" required>
			</div>
			<div class="form-group">
				<label for="email">Email</label>
				<input type="email" class="form-control" id="email" name="email" placeholder="info@example.com" value="<?php echo $email; ?>">
			</div>
			<div class="form-group">
				<label for="pushbullet">Pushbullet</label>
				<select class="form-control" name="pushbullet">
					<?php
						echo "<option value='0' ".(($pushbullet == 0) ? "selected" : "").">Disabled</option>";
						$sql = $db->query("SELECT * FROM pushbullet WHERE member_id='{$row['member_id']}'");
						while($row = $sql->fetch_assoc()) {
							echo "<option value='{$row['id']}' ".(($pushbullet == $row['id']) ? "selected" : "").">".$row['email']."</option>";
						}
					?>
				</select>
			</div>
			<?php 
				if($login->Access()) {
			?>
				<div class="form-group">
					<label for="owner">Owner</label>
					<select class="form-control" name="owner">
						<?php
							$sql = $db->query("SELECT * FROM users");
							while($row = $sql->fetch_assoc()) {
								echo "<option value='{$row['id']}' ".(($owner == $row['id']) ? "selected" : "").">{$row['username']} ({$row['email']})</option>";
							}
						?>
					</select>
				</div>
			<?php } ?>
			<div class="checkbox">
				<label>
					<input type="checkbox" name="state" value="1" <?php if($state == "1") { echo "checked"; } ?>> Disabled
				</label>
			</div>
			<div class="checkbox">
				<label>
					<input type="checkbox" name="desktop" value="1" <?php if($desktop == "1") { echo "checked"; } ?>> Desktop notification
				</label>
			</div>
			<button type="submit" class="btn btn-success" name="submit">Edit server</button>
		</form>
	<?php
			}
	}elseif(isset($_GET['delete'])) {
			$id = $db->real_escape_string($_GET['delete']);
			$sql = $db->query("SELECT * FROM servers WHERE id='{$id}' AND deleted='0' ".((!$login->Access()) ? "AND member_id='{$login->id}'" : ""));
			if($sql->num_rows == 0) {
				echo "<div class='alert alert-danger'>This server was not found.</div>";
			}else{
				$row = $sql->fetch_assoc();
				if(isset($_POST['submit'])) {
					if(DEMO == 0) { 
						$db->query("UPDATE servers SET deleted = '1' WHERE id='{$id}'");
						
						$user = $db->query("SELECT * FROM users WHERE id='{$row['member_id']}'")->fetch_assoc();
						if($user['chart_1'] == $row['id']) {$db->query("UPDATE users SET chart_1 = '0' AND id='{$row['member_id']}'"); }
						if($user['chart_2'] == $row['id']) {$db->query("UPDATE users SET chart_2 = '0' AND id='{$row['member_id']}'"); }
					}
					echo $function->Redirect("index.php?p=server_manager");
					echo "<div class='alert alert-success'>This server would be deleted at the next check.</div>";
				}
	?>
		<form method="POST">
			Are you sure you want delete server id <i><?php echo $id; ?></i>? This cannot be undone.<br />
			The server would be deleted at the next check<br /><br />
			<button type="submit" class="btn btn-success" name="submit">Yes</button>
			<button type="button" class="btn btn-danger"  onclick="location.href='index.php?p=server_manager'">No</button>
		</form>
	<?php
			}
	}else{
		$sql = $db->query("SELECT * FROM servers ".((!$login->Access()) ? "WHERE member_id='{$login->id}'" : ""));
		$servers = $db->query("SELECT * FROM servers WHERE member_id='{$login->id}'");
		$user = $db->query("SELECT * FROM users WHERE id='{$login->id}'")->fetch_assoc();
	?>
		<b>Server Create limit:</b> <?php echo (($user['max_servers'] == "0") ? "Unlimited" : (($servers->num_rows >= $user['max_servers']) ? "<font color='red'>{$servers->num_rows}/{$user['max_servers']}</font>" : "<font color='green'>{$servers->num_rows}/{$user['max_servers']}</font>")); ?>
		<p class="pull-right">
			<button type="button" class="btn btn-primary" onclick="location.href='index.php?p=server_manager&a=add'">Add Server</button>
		</p>
		<table class="table table-striped">
			<thead>
				<tr>
					<th>Server</th>
					<th width="14%">Server Status</th>
					<th width="20%">Today Uptime</th>
					<th width="14%">Response Code</th>
					<th width="20%">Load</th>
					<th width="10%">Notifications</th>
					<th>Options</th>
				</tr>
			</thead>
			<tbody>
				<?php 
					while($row = $sql->fetch_assoc()) {
						$succeed = $db->query("SELECT * FROM server_stats WHERE server_id='{$row['id']}' AND (response_code >='200' OR response_code<='415')");
						$succeed = $succeed->num_rows;
						$failed = $db->query("SELECT * FROM server_stats WHERE server_id='{$row['id']}' AND (response_code <'200' OR response_code>='415')");
						$failed = $failed->num_rows;
				?>
					<tr>
						<td><a href="index.php?p=dashboard&s=<?php echo $row['id']; ?>"><?php echo $row['display_name']; ?></a></td>
						<td><?php if($row['deleted'] == "1") { echo $server->Color("deleted"); }elseif($row['disabled'] == "1") { echo $server->Color("disabled"); }else{ echo $server->Color($row['state']); } ?></td>
						<td>
							<div class="progress" <?php echo $function->Tooltip("Uptime: ".$function->Uptime($succeed, $failed)."%"); ?>>
								<div class="progress-bar active progress-bar-<?php echo $server->Uptime($function->Uptime($succeed, $failed)); ?> progress-bar-striped" role="progressbar" aria-valuenow="<?php echo $function->Uptime($succeed, $failed); ?>" aria-valuemin="0" aria-valuemax="100" style="width: <?php echo $function->Uptime($succeed, $failed); ?>%"></div>
							</div>
						</td>
						<td>
							<?php if($row['response_code'] >= 200 && $row['response_code'] <= 415) { ?>
								<div class="label label-success" <?php echo $function->Tooltip($server->ResponseName($row['response_code'])); ?>><?php echo $row['response_code']; ?></div>
							<?php }else{ ?>
								<div class="label label-danger" <?php echo $function->Tooltip($server->ResponseName($row['response_code'])); ?>><?php echo $row['response_code']; ?></div>
							<?php } ?>
						</td>
						<td><div class="progress" <?php echo $function->Tooltip($row['last_load']." seconds"); ?>>
								<div class="progress-bar progress-bar-<?php echo $server->ProgressColor($function->Procent($config['timeout'], $row['last_load'])); ?> progress-bar-striped active" role="progressbar" aria-valuenow="<?php echo $function->Procent($config['timeout'], $row['last_load']); ?>" aria-valuemin="0" aria-valuemax="100" style="width: <?php echo $function->Procent($config['timeout'], $row['last_load']); ?>%"></div>
							</div>
						</td>
						<td>
							<div class="fa fa-bell<?php if($row['desktop_notif'] == "0") { echo "-o"; } ?>" <?php echo $function->Tooltip("Desktop notifications"); ?>></div> 
							<div class="fa fa-envelope<?php if($row['email_to'] == "") { echo "-o"; } ?>" <?php echo $function->Tooltip("E-mail Notifications"); ?>></div>
							<div class="fa fa-comment<?php if($row['pushbullet'] == "0") { echo "-o"; } ?>" <?php echo $function->Tooltip("Pushbullet Notifications"); ?>></div>
						</td>
						<td>
							<?php if($row['deleted'] == "0") { ?>
								<?php 
									if($login->Access()) {
										$user = $db->query("SELECT * FROM users WHERE id='{$row['member_id']}'")->fetch_assoc();
								?>
									<span class="label label-default" <?php echo $function->Tooltip("{$user['username']} ({$user['email']})"); ?>><span class="fa fa-user"></span></span>
								<?php } ?>
								<span style="cursor: pointer;" onclick="location.href='index.php?p=dashboard&s=<?php echo $row['id']; ?>'" class="label label-success" <?php echo $function->Tooltip("Statistics"); ?>><span class="fa fa-line-chart"></span></span>
								<span style="cursor: pointer;" onclick="location.href='index.php?p=server_manager&edit=<?php echo $row['id']; ?>'" class="label label-info" <?php echo $function->Tooltip("Edit"); ?>><span class="fa fa-pencil"></span></span>
								<span style="cursor: pointer;" onclick="location.href='index.php?p=server_manager&delete=<?php echo $row['id']; ?>'" class="label label-danger" <?php echo $function->Tooltip("Delete"); ?>><span class="fa fa-trash"></span></span>
							<?php }else{ ?>
								Not available
							<?php } ?>
						</td>
					</tr>
				<?php } ?>
			</tbody>
		</table>
	<?php } ?>
</div>