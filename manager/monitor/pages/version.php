<?php
$headers["Keep-Alive"] = "300";
$headers["Connection"] = "Keep-Alive";
$headers["User-Agent"] = "Website monitor Checker";

$ch = curl_init("http://monitor.webresolver.nl/docs/server/version.php?v=".$config['version']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$output = curl_exec($ch);
curl_close($ch);

$ch = curl_init("http://monitor.webresolver.nl/docs/server/changelog.html");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$change_log = curl_exec($ch);
curl_close($ch);

$details = json_decode($output);
?>
<div class="row marketing">
<h3>Version Information</h3>
<table style="width: 400px;" class="table table-striped">
	<tr>
		<th>Current Version</th>
		<td><?php echo $config['version']; ?></td>
	</tr>
	<tr>
		<th>Newest Version</th>
		<td><?php echo $details->version; ?></td>
	</tr>
	<tr>
		<th>Verion Release Date</th>
		<td><?php echo $details->release_date; ?></td>
	</tr>
	<tr>
		<th>New version available</th>
		<td><?php echo (($details->new_version == "no") ? "<div class='label label-success'>No</div>" : "<div class='label label-danger'>Yes</div>"); ?></td>
	</tr>
	<tr>
		<th>CodeCanyon.net</th>
		<td><a href="<?php echo $details->codecanyon; ?>" target="_blank">&raquo; CodeCanyon.net page</a></td>
	</tr>
</table>

<h3>Change Log</h3>
<?php echo $change_log; ?>
</div>