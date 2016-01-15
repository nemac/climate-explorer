<?php
if(isset($_GET['s'])) {
	$id = $db->real_escape_string($_GET['s']);
	$sql = $db->query("SELECT * FROM servers WHERE id='{$id}' AND deleted='0' ".((!$login->Access()) ? "AND member_id='{$login->id}'" : ""));
	$row = $sql->fetch_assoc();
	if($sql->num_rows == 0){
		echo "<div class='alert alert-danger'>This server was not found.</div>";
	}else{
		$count = $db->query("SELECT id FROM server_stats WHERE server_id='{$id}'");
		$avg = "0";
		$uptime = "0";
		$succeed = "0";
		$failed = "0";
		
		if($count->num_rows != "0") {
			$avg_sum = $db->query("SELECT SUM(load_time) AS c FROM server_stats WHERE server_id='{$id}'");
			$avg_sum = $avg_sum->fetch_assoc();
			$avg_num = $db->query("SELECT * FROM server_stats WHERE server_id='{$id}'");
			$avg = $avg_sum['c'] / $avg_num->num_rows;

			$succeed = $db->query("SELECT * FROM server_stats WHERE server_id='{$id}' AND (response_code >='200' OR response_code<='415')");
			$succeed = $succeed->num_rows;
			$failed = $db->query("SELECT * FROM server_stats WHERE server_id='{$id}' AND (response_code <'200' OR response_code>='415')");
			$failed = $failed->num_rows;
			$uptime = $function->Uptime($succeed, $failed);
		}
?>
<div class="row marketing">
	<div class="col-lg-6">
		<h4>Statistics Today</h4>
		<table style="width: 400px;" class="table table-striped">
			<?php
				if($login->Access()) {
					$user = $db->query("SELECT * FROM users WHERE id='{$row['member_id']}'")->fetch_assoc();
			?>
				<tr>
					<th>Owner</th>
					<td><a href="index.php?p=users&edit=<?php echo $row['id']; ?>"><?php echo $user['username']; ?> (<?php echo $user['email']; ?>)</a></td>
				</tr>
			<?php } ?>
			<tr>
				<th>Name</th>
				<td><?php echo $row['display_name']; ?></td>
			</tr>
			<tr>
				<th>URL</th>
				<td><a href="<?php echo $row['server_url']; ?>" target="_blank"><?php echo $row['server_url']; ?></a></td>
			</tr>
			<tr>
				<th>Today Uptime</th>
				<td><?php echo $uptime; ?>%</td>
			</tr>
			<tr>
				<th>Last load time</th>
				<td><?php echo $row['last_load']; ?> seconds</td>
			</tr>
			<tr>
				<th>Average</th>
				<td><?php echo round($avg, 3); ?></td>
			</tr>
			<tr>
				<th>Requests succeed</th>
				<td><?php echo $succeed; ?></td>
			</tr>
			<tr>
				<th>Requests failed</th>
				<td><?php echo $failed; ?></td>
			</tr>
		</table>
	</div>
	<div class="col-lg-6">
		<h4>Downtime today</h4>
		<table style="width: 400px;" class="table table-striped">
			<tr>
				<th>Current</th>
				<td><?php if($row['deleted'] == "1") { echo $server->Color("deleted"); }elseif($row['disabled'] == "1") { echo $server->Color("disabled"); }else{ echo $server->Color($row['state']); } ?></td>
			</tr>
			<tr>
				<th>Last Down</th>
				<td><?php echo (($row['last_down'] == "0000-00-00 00:00:00") ? "Never" : $row['last_down']); ?></td>
			</tr>
			<tr>
				<th>Back Online</th>
				<td><?php echo (($row['back_online'] == "0000-00-00 00:00:00") ? "Never" : $row['back_online']); ?></td>
			</tr>
			<tr>
				<th>Time down</th>
				<td>
					<?php 
						if($row['last_down'] != "0000-00-00 00:00:00") {
							if($row['back_online'] == "0000-00-00 00:00:00") { $date = date("Y-m-d H:i:s"); }else{ $date = $row['back_online']; }
							if($row['state'] == 'down') { $date = date("Y-m-d H:i:s"); }
							$datetime1 = new DateTime($row['last_down']);
							$datetime2 = new DateTime($date);
							$date = $datetime1->diff($datetime2);
							echo $date->format('%a days, %h hour, %i minutes, %s seconds');
						}else{
							echo "Unknown";
						}
					?>
				</td>
			</tr>
		</table>
		<br />
		<?php
		$sql = $db->query("SELECT * FROM server_stats WHERE server_id='{$id}' AND (response_code <'200' OR response_code>='415') GROUP BY response_code ORDER BY response_code DESC");
		if($sql->num_rows == 0) {
			echo "There is now Down time today";
		}else{
		?>
		<table class="table table-striped">
			<thead>
				<tr>
					<th>Given</th>
					<th>Response</th>
					<th>Load Time</th>
				</tr>
			</thead>
			<tbody>
			<?php 
				while($row = $sql->fetch_assoc()) { 
					$count = $db->query("SELECT * FROM server_stats WHERE server_id='{$id}' AND response_code='{$row['response_code']}'");
					$count = $count->num_rows;
			?>
				<tr>
					<td><?php echo $count; ?>x</td>
					<td><div class="label label-danger" <?php echo $function->Tooltip($server->ResponseName($row['response_code'])); ?>><?php echo $row['response_code']; ?></div></td>
					<td><div class="progress" <?php echo $function->Tooltip($row['load_time']." seconds"); ?>>
							<div class="progress-bar progress-bar-<?php echo $server->ProgressColor($function->Procent($config['timeout'], $row['load_time'])); ?> progress-bar-striped active" role="progressbar" aria-valuenow="<?php echo $function->Procent($config['timeout'], $row['load_time']); ?>" aria-valuemin="0" aria-valuemax="100" style="width: <?php echo $function->Procent($config['timeout'], $row['load_time']); ?>%"></div>
						</div>
					</td>
				</tr>
			<?php } ?>
			</tbody>
		</table>
		<?php } ?>
	</div>
</div>
<div class="row marketing">
	<div class="col-lg-12">
		<h4>Response Times last day</h4>
		<table class="table table-striped table-condensed" style="margin: 0px;">
			<tr>
				<th width="20%">Date</th>
				<th width="20%">Response Code</th>
				<th width="20%">Response Time</th>
				<th width="40%">State</th>
			</tr>
		</table>
		<div style="height: 500px; overflow-y: scroll;">
			<table class="table table-striped table-condensed">
				<?php
					$sql = $db->query("SELECT * FROM server_stats WHERE server_id='{$id}' ORDER BY id DESC");
					while($row = $sql->fetch_assoc()) {
						if($row['response_code'] >= 200 && $row['response_code'] <= 415) {
							$state = '<div class="label label-success">Online</div>';
							$color = 'success';
						}else{
							$state = '<div class="label label-danger">Down</div>';
							$color = 'danger';
						}
				?>
				<tr class="<?php echo $color; ?>">
					<td width="20%"><?php echo date("d-m-Y H:i:s", strtotime($row['check_date'])); ?></td>
					<td width="20%"><span <?php echo $function->Tooltip($server->ResponseName($row['response_code'])); ?>><?php echo $row['response_code']; ?></span></td>
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
	}
}else{
?>
<script>
function Reload() {
	$( "#Loading" ).load( "ajax/Dashboard.php" );
}

$( window ).load(function() {
	Reload();
	setInterval(function() {
		Reload();
	}, 15000);
});
</script>

<div id="Loading"><div class="alert alert-info">Loading Dashboard</div></div>

<?php } ?>