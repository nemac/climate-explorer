<div class="row marketing">
	<?php
	if(isset($_GET['add'])) {
		if(@$_SESSION['pb_step'] == '1' || isset($_POST['step1'])) {
			$token = $db->real_escape_string(html($_SESSION['pb_token']));
			$pushbullet = new Pushbullet($token);
			$val = $pushbullet->Validate();
			if($val) {
				if(isset($_POST['cancel'])) {
					unset($_SESSION['pb_step']);
					unset($_SESSION['pb_token']);
					echo "<div class='alert alert-danger'>Job canceled.</div>";
					echo $function->Redirect("index.php?p=pushbullet");
					
				}elseif(isset($_POST['save']) && isset($_POST['devices'])) {
					if($_POST['devices'] == "option1") {
						unset($_SESSION['pb_step']);
						unset($_SESSION['pb_token']);
						if(DEMO == 0) { $db->query("INSERT INTO pushbullet (member_id, access_token, devices, email) VALUES ('{$login->id}', '{$token}', 'all', '{$val->email}')"); }
						echo "<div class='alert alert-success'>Pushbullet has been added for all devices</div>";
						echo $function->Redirect("index.php?p=pushbullet");

					}elseif($_POST['devices'] == "option2" && isset($_POST['option2'])) {
						unset($_SESSION['pb_step']);
						unset($_SESSION['pb_token']);
					
						$devices = $pushbullet->GetDevices();
						$output = "";
						foreach ($_POST['option2'] as $selectedOption){
							$output .= ",{$selectedOption},";
						}
						$output = $db->real_escape_string(html($output));
						preg_match_all('/,[a-zA-Z0-9]+,/', $output, $count);
						echo "<div class='alert alert-success'>Pushbullet has been added for ".((count($count[0]) == 1) ? "1 device" : count($count[0])." devices")."</div>";
						if(DEMO == 0) { $db->query("INSERT INTO pushbullet (member_id, access_token, devices, email) VALUES ('{$login->id}', '{$token}', '{$output}', '{$val->email}')"); }
						echo $function->Redirect("index.php?p=pushbullet");
						
					}else{
						echo "<div class='alert alert-danger'>You forgot someting.</div>";
					}
				}
	?>
		<h3>Access Token <?php echo html($val->email); ?></h3>
		<form method="post">
			<label for="devices" class="col-sm-2 control-label">Devices</label><br />
			<div class="radio">
				<label>
					<input type="radio" name="devices" id="devices" value="option1" onfocus="$('#option2').hide();" checked>
					All Devices
				</label>
			</div>
			<div class="radio">
				<label>
					<input type="radio" name="devices" id="devices" value="option2" onfocus="$('#option2').show();">
					Specific Device
				</label>
			</div>
			<div style="display:none;" id="option2">
				<select multiple class="form-control" name="option2[]" rows="5">
					<?php
						$devices = $pushbullet->GetDevices();
						foreach($devices as $device) {
							if($device->pushable == "1") {
								echo "<option value='{$device->iden}'>{$device->nickname}</option>";
							}
						}
					?>
				</select>
				<b><i>Hold the "ctrl" key to select more devices.</i></b><br />
			</div>
			<br />
			<button type="submit" class="btn btn-danger" name="cancel">Cancel</button>
			<button type="submit" class="btn btn-success" name="save">Save</button>
		</form>
	<?php
			}else{
				unset($_SESSION['pb_step']);
				unset($_SESSION['pb_token']);
				echo "<div class='alert alert-danger'>This Pushbullet access token is not valid!</div>";
			}
		}else{
			$valid = false;
			if(isset($_POST['access_token'])) {
				$token = $db->real_escape_string(html($_POST['access_token']));
				$num = $db->query("SELECT * FROM pushbullet WHERE access_token='{$token}' ".((!$login->Access()) ? "AND member_id='{$login->id}'" : ""));
				
				if($num->num_rows != 0) {
					echo "<div class='alert alert-danger'>This Access Token does already exist in our system.</div>";		
				}else{
					$pushbullet = new Pushbullet($_POST['access_token']);
					$val = $pushbullet->Validate();
					if($val) {
						$valid = true;
						$_SESSION['pb_step'] = "1";
						$_SESSION['pb_token'] = $_POST['access_token'];
						echo "<div class='alert alert-success'>Token is valid. Pushbullet email: ".html($val->email)."</div>";
					}else{
						echo "<div class='alert alert-danger'>This Pushbullet access token is not valid!</div>";
					}
				}
			}
	?>
		<form method="post">
			<?php if($valid == false) { ?>
				<a href="https://www.pushbullet.com/#settings/account" target="_blank">Get your access token</a><br /><br />
				<div class="form-group">
					<label for="access_token">Pushbullet Access Token:</label>
					<input type="text" class="form-control" id="access_token" name="access_token" placeholder="FxkPzoyjjf1JOp7b1PCEENj0jIPnWdvq" required>
				</div>
				<button type="submit" class="btn btn-success" name="check">Check</button>
			<?php }else{ ?>
				<button type="submit" class="btn btn-success" name="step1">Next Step</button>
			<?php } ?>
		</form>
	<?php
		}
	}elseif(isset($_GET['delete'])) {
			$id = $db->real_escape_string($_GET['delete']);
			$sql = $db->query("SELECT * FROM pushbullet WHERE id='{$id}' ".((!$login->Access()) ? "AND member_id='{$login->id}'" : ""));
			if($sql->num_rows == 0){ 
				echo "<div class='alert alert-danger'>Pushbullet account was not found.</div>";
			}else{
				if(isset($_POST['submit'])) {
					if(DEMO == 0) { 
						$db->query("DELETE FROM pushbullet WHERE id='{$id}'");
						$db->query("UPDATE servers SET pushbullet='0' WHERE pushbullet='{$id}'");
					}
					echo $function->Redirect("index.php?p=pushbullet");
					echo "<div class='alert alert-success'>This pushbullet account is successfully deleted.</div>";
				}
	?>
		<form method="POST">
			Are you sure you want delete this Pushbullet account?<br />
			The pushbullet notifications from all servers with this pushbullet account will be disabled.<br />
			<button type="submit" class="btn btn-success" name="submit">Yes</button>
			<button type="button" class="btn btn-danger"  onclick="location.href='index.php?p=pushbullet'">No</button>
		</form>
	<?php
			}
	}else{
		$sql = $db->query("SELECT * FROM pushbullet ".((!$login->Access()) ? "WHERE member_id='{$login->id}'" : ""));
	?>
		<p class="pull-right">
			<button type="button" class="btn btn-primary" onclick="location.href='index.php?p=pushbullet&add'">Add Pushbullet</button>
		</p>
		<table class="table table-striped">
			<thead>
				<tr>
					<th>Email</th>
					<th>Access Token</th>
					<th>Devices</th>
					<th>Options</th>
				</tr>
			</thead>
			<tbody>
				<?php 
					while($row = $sql->fetch_assoc()) {
						preg_match_all('/,[a-zA-Z0-9]+,/', $row['devices'], $count);
				?>
					<tr>
						<td><?php echo $row['email']; ?></td>
						<td><?php echo $row['access_token']; ?></td>
						<td><?php echo (($row['devices'] == "all") ? "all" : count($count[0])); ?></td>
						<td>
							<?php 
								if($login->Access()) {
									$user = $db->query("SELECT * FROM users WHERE id='{$row['member_id']}'")->fetch_assoc();
							?>
								<span class="label label-default" <?php echo $function->Tooltip("{$user['username']} ({$user['email']})"); ?>><span class="fa fa-user"></span></span>
							<?php } ?>
							<span style="cursor: pointer;" onclick="location.href='index.php?p=pushbullet&delete=<?php echo $row['id']; ?>'" class="label label-danger" <?php echo $function->Tooltip("Delete"); ?>><span class="fa fa-trash"></span></span>
						</td>
					</tr>
				<?php } ?>
			</tbody>
		</table>
	<?php } ?>
</div>