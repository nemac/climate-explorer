<?php
require_once("../includes/autoload.php");

if(!$login->LoggedIn) {
	die("<div class='alert alert-danger'>Login Token expired, please login again.</div>");
}

$user = $db->query("SELECT * FROM users WHERE id='{$login->id}'")->fetch_assoc();

$s1_name['display_name'] = "NaN";
$s2_name['display_name'] = "NaN";
$s1_avg = "0";
$s2_avg = "0";
$total_avg = "0";

if($user['chart_1'] != "0") {
	$s1_name = $db->query("SELECT display_name FROM servers WHERE id='".$user['chart_1']."'")->fetch_assoc();
	
	$count_total = $db->query("SELECT * FROM server_stats WHERE server_id='".$user['chart_1']."'");
	$s1_avg = "0";
	if($count_total->num_rows != 0) {
		$s1_avg_sum = $db->query("SELECT SUM(load_time) AS s1_c FROM server_stats WHERE server_id='".$user['chart_1']."'")->fetch_assoc();
		$s1_avg_num = $db->query("SELECT * FROM server_stats WHERE server_id='".$user['chart_1']."'")->num_rows;
		$s1_avg = $s1_avg_sum['s1_c'] / $s1_avg_num;
	}
}

if($user['chart_2'] != "0") {
	$s2_name = $db->query("SELECT display_name FROM servers WHERE id='".$user['chart_2']."'")->fetch_assoc();
	
	$count_total = $db->query("SELECT * FROM server_stats WHERE server_id='".$user['chart_2']."'");
	$s2_avg = "0";
	if($count_total->num_rows != 0) {
		$s2_avg_sum = $db->query("SELECT SUM(load_time) AS s2_c FROM server_stats WHERE server_id='".$user['chart_2']."'")->fetch_assoc();
		$s2_avg_num = $db->query("SELECT * FROM server_stats WHERE server_id='".$user['chart_2']."'")->num_rows;
		$s2_avg = $s2_avg_sum['s2_c'] / $s2_avg_num;
	}
}

$count_total = $db->query("SELECT * FROM server_stats ".((!$login->Access()) ? "WHERE member_id='{$login->id}'" : ""));
if($count_total->num_rows != 0) {
	$total_avg_sum = $db->query("SELECT SUM(load_time) AS total_c FROM server_stats ".((!$login->Access()) ? "WHERE member_id='{$login->id}'" : ""))->fetch_assoc();
	$total_avg_num = $db->query("SELECT * FROM server_stats ".((!$login->Access()) ? "WHERE member_id='{$login->id}'" : ""))->num_rows;
	$total_avg = $total_avg_sum['total_c'] / $total_avg_num;
}
?>
<script src="assets/js/jquery.knob.min.js"></script>
<script type="text/javascript">
	$(function () {
		$('[data-toggle="tooltip"]').tooltip()
		$(".dial").knob();
	})
	
<?php
$up = $db->query("SELECT * FROM servers WHERE ".((!$login->Access()) ? "member_id='{$login->id}' AND" : "")."  state='active' AND desktop_notif='1'");
while($row = $up->fetch_assoc()) {
	if(isset($_SESSION['down_'.$row['id']])) {
		unset($_SESSION['down_'.$row['id']]);
?>
function up<?php echo $row['id']; ?>() {
	document.getElementById('audiotag').play();
	if (!Notification) {
		return;
	}else{
		if (Notification.permission !== "granted") {
			Notification.requestPermission();
		} else {
			var notification = new Notification('<?php echo $row['display_name']; ?> is back online', {
				icon: 'assets/images/icon.png',
				body: "Url: <?php echo $row['server_url']; ?>\nResponse code: <?php echo $row['response_code']; ?>\nLoadtime: <?php echo $row['last_load']; ?>\nCheck date: <?php echo date("H:i:s", strtotime($row['last_check'])); ?>",
			});

			notification.onclick = function () {
				window.open("<?php echo $row['server_url']; ?>");			
				notification.close();
			};
			setInterval(function() {
				notification.close();
			}, 15000);
		}
	}
}
up<?php echo $row['id']; ?>();
<?php
	}
}
$down = $db->query("SELECT * FROM servers WHERE ".((!$login->Access()) ? "member_id='{$login->id}' AND" : "")." state='down' AND desktop_notif='1'");
while($row = $down->fetch_assoc()) {
	if(!isset($_SESSION['down_'.$row['id']])) {
		$_SESSION['down_'.$row['id']] = "true";
?>
function down<?php echo $row['id']; ?>() {
	document.getElementById('audiotag').play();
	if (!Notification) {
		return;
	}else{
		if (Notification.permission !== "granted") {
			Notification.requestPermission();
		} else {
			var notification = new Notification('<?php echo $row['display_name']; ?> is offline', {
				icon: 'assets/images/icon.png',
				body: "Url: <?php echo $row['server_url']; ?>\nResponse code: <?php echo $row['response_code']; ?>\nLoadtime: <?php echo $row['last_load']; ?>\nCheck date: <?php echo date("H:i:s", strtotime($row['last_check'])); ?>",
			});

			notification.onclick = function () {
				window.open("<?php echo $row['server_url']; ?>");			
				notification.close();
			};
			setInterval(function() {
				notification.close();
			}, 15000);
		}
	}
}
down<?php echo $row['id']; ?>();
<?php 
	}
}
?>
</script>
<audio id="audiotag" src="assets/alert.wav" preload="auto"></audio>
<div class="row marketing">
	<div class="col-lg-4">
		<center>
			<h4>Average (<?php echo $s1_name['display_name']; ?>)</h4>
			<p><input type="text" value="<?php echo round($s1_avg, 2); ?>" data-readOnly="true" data-angleArc="250" data-max="20" data-angleOffset="-125" class="dial"></p>
		</center>
	</div>
	<div class="col-lg-4">
		<center>
			<h4 style="margin-left: 20px;">Average (<?php echo $s2_name['display_name']; ?>)</h4>
			<p><input type="text" value="<?php echo round($s2_avg, 2); ?>" data-readOnly="true" data-angleArc="250" data-max="20" data-angleOffset="-125" class="dial"></p>
		</center>
	</div>
	<div class="col-lg-4">
		<center>
			<h4 style="margin-left: 30px;">Average (all servers)</h4>
			<p><input type="text" value="<?php echo round($total_avg, 2); ?>" data-readOnly="true" data-angleArc="250" data-max="20" data-angleOffset="-125" class="dial"></p>
		</center>
	</div>
</div>

<div class="row marketing">
	<div class="col-lg-6">
		<?php
			$sql = $db->query("SELECT * FROM servers WHERE ".((!$login->Access()) ? "member_id='{$login->id}' AND" : "")." state='down'");
		?>
		<h4>Currently Down</h4>
		<?php
		if($sql->num_rows == 0) {
			echo "No servers are down at this moment.";
		}else{
		?>
		<table class="table table-striped">
			<thead>
				<tr>
					<th>Server</th>
					<th>Response</th>
					<th>Load Time</th>
				</tr>
			</thead>
			<tbody>
			<?php 
				while($row = $sql->fetch_assoc()) { 
			?>
				<tr>
					<td><a href="index.php?p=dashboard&s=<?php echo $row['id']; ?>"><?php echo $row['display_name']; ?></a></td>
					<td>
						<?php if($row['response_code'] >= 200 && $row['response_code'] <= 415) {?>
							<div class="label label-success" <?php echo $function->Tooltip($server->ResponseName($row['response_code'])); ?>><?php echo $row['response_code']; ?></div>
						<?php }else{ ?>
							<div class="label label-danger" <?php echo $function->Tooltip($server->ResponseName($row['response_code'])); ?>><?php echo $row['response_code']; ?></div>
						<?php } ?>
					</td>
					<td><div class="progress" <?php echo $function->Tooltip($row['last_load']." seconds"); ?>>
							<div class="progress-bar progress-bar-<?php echo $server->ProgressColor($function->Procent($config['timeout'], $row['last_load'])); ?> progress-bar-striped active" role="progressbar" aria-valuenow="<?php echo $function->Procent($config['timeout'], $row['last_load']); ?>" aria-valuemin="0" aria-valuemax="100" style="width: <?php echo $function->Procent($config['timeout'], $row['last_load']); ?>%"></div>
						</div>
					</td>
				</tr>
			<?php } ?>
			</tbody>
		</table>
		<?php } ?>
	</div>
	<div class="col-lg-6">
		<?php
			$sql = $db->query("SELECT DISTINCT response_code FROM server_stats ".((!$login->Access()) ? "WHERE member_id='{$login->id}'" : "")." ORDER BY response_code ASC");
		?>
		<h4>Total Response Codes</h4>
		<table class="table table-striped">
			<thead>
				<tr>
					<th>Response Code</th>
					<th>Total</th>
				</tr>
			</thead>
			<tbody>
			<?php 
				while($row = $sql->fetch_assoc()) { 
				$count = $db->query("SELECT * FROM server_stats WHERE ".((!$login->Access()) ? "member_id='{$login->id}' AND" : "")." response_code='{$row['response_code']}'");
				$count = $count->num_rows;
			?>
				<tr>
					<td><span  <?php echo $function->Tooltip($server->ResponseName($row['response_code'])); ?>><?php echo $row['response_code']; ?></span></td>
					<td><?php echo $count; ?></td>
				</tr>
			<?php } ?>
			</tbody>
		</table>
	</div>
</div>
<div class="row marketing">
	<div class="col-lg-12">
		<h4>Response Times last hour (all servers)</h4>
		<table class="table table-striped table-condensed" style="margin: 0px;">
			<tr>
				<th width="30%">Server</th>
				<th width="20%">Date</th>
				<th width="20%">Response Code</th>
				<th width="20%">Response Time</th>
				<th width="40%">State</th>
			</tr>
		</table>
		<div style="height: 500px; overflow-y: scroll;">
			<table class="table table-striped table-condensed">
				<?php
					$sql = $db->query("SELECT * FROM server_stats WHERE ".((!$login->Access()) ? "member_id='{$login->id}' AND" : "")." check_date > DATE_SUB(NOW(), INTERVAL 1 HOUR) ORDER BY id DESC");
					while($row = $sql->fetch_assoc()) {
						if($row['response_code'] >= 200 && $row['response_code'] <= 415) {
							$state = '<div class="label label-success">Online</div>';
							$color = 'success';
						}else{
							$state = '<div class="label label-danger">Down</div>';
							$color = 'danger';
						}
						$server_name = $db->query("SELECT id, display_name FROM servers WHERE id='{$row['server_id']}'");
						$server_name = $server_name->fetch_assoc();
				?>
				<tr class="<?php echo $color; ?>">
					<td width="30%"><a href="index.php?p=dashboard&s=<?php echo $row['server_id']; ?>"><?php echo $server_name['display_name']; ?></a></td>
					<td width="20%"><?php echo date("d-m-Y H:i:s", strtotime($row['check_date'])); ?></td>
					<td width="20%"><span  <?php echo $function->Tooltip($server->ResponseName($row['response_code'])); ?>><?php echo $row['response_code']; ?></span></td>
					<td width="20%"><?php echo $row['load_time']; ?></td>
					<td width="40%"><?php echo $state; ?></td>
				</tr>
				<?php
					}
				?>
			</table>
		</div>
	</div>
</div>
<?php
$db->close();
?>