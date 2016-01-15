<?php
$dirname = dirname(__FILE__)."/../";
require_once($dirname."includes/autoload.php");

$sql = $db->query("SELECT * FROM servers WHERE disabled='0'");

//if(date("H:i") == "00:00") {
//	$db->query("TRUNCATE server_stats");
//	$db->query("UPDATE servers SET last_load='0'");
//}

while($row = $sql->fetch_assoc()) {
//	if($row['deleted'] == 1) {
//		$db->query("DELETE FROM servers WHERE id='{$row['id']}'");
//		$db->query("DELETE FROM server_stats WHERE server_id='{$row['id']}'");
//	}else{
		$headers["Keep-Alive"] = "300";
		$headers["Connection"] = "Keep-Alive";
		$headers["User-Agent"] = "Website Monitor Checker";
		
		$ch = curl_init($row['server_url']);
		curl_setopt($ch, CURLOPT_HEADER, true);
		curl_setopt($ch, CURLOPT_NOBODY, true);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_TIMEOUT, $config['timeout']);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($ch, CURLOPT_CAINFO, $dirname.'includes/cert/ca-bundle.crt');

		$output = curl_exec($ch);
		$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		$load_Time = round(curl_getinfo($ch, CURLINFO_TOTAL_TIME), 3);
		$curl_errno = curl_errno($ch);
		$curl_error = curl_error($ch);
		curl_close($ch);

		if($curl_errno != 0) {
			$message = "We've detected an unknown error on your website. Details that we know:<br /><b>Error Code:</b> {$curl_errno}<br /><b>Error:</b> {$curl_error}<br /><b>Website:</b> {$row['server_url']}<br /><b>HTTP Code:</b> {$httpcode}";
			$message_push = "We've detected an unknown error on your website. Details that we know:\nError Code: {$curl_errno}\nError: {$curl_error}\nWebsite: {$row['server_url']}\nHTTP Code: {$httpcode}";
			if($curl_errno == 28) { $httpcode = 504; }
			
			if($row['state'] != "down") {
				$db->query("UPDATE servers SET last_down=NOW() WHERE id='{$row['id']}'");
				if(!empty($row['email_to'])) {
					$function->SendMail($row['email_to'], $row['display_name']." is down!", $message);
				}
				
				if($row['pushbullet'] != "0") {
					$pushbullet = new Pushbullet($pb->IdToToken($row['pushbullet']));
					if($pb->IdToDevice($row['pushbullet']) != "all") {
						foreach($pb->IdToDevice($row['pushbullet']) as $device) {
							$pushbullet->PushNote($device, $row['display_name']." is down!", $message_push);
						}
					}else{
						$pushbullet->PushNote("all", $row['display_name']." is down!", $message_push);
					}
				}
			}
			
			$db->query("UPDATE servers SET last_check=NOW(), last_load='{$load_Time}', state='down', response_code='{$httpcode}' WHERE id='{$row['id']}'");
			$db->query("INSERT INTO server_stats (server_id, member_id, response_code, load_time, check_date, state) VALUES ('{$row['id']}', '{$row['member_id']}', '{$httpcode}', '{$load_Time}', NOW(), 'down')");
		}else{
			if($httpcode >= 200 && $httpcode <= 415) {
				$message = "We've detected that your site is back online. Your site had a load time of {$load_Time} seconds.<br /><b>Website:</b> {$row['server_url']}<br /><b>HTTP Code:</b> {$httpcode}";
				$message_push = "We've detected that your site is back online. Your site had a load time of {$load_Time} seconds.\nWebsite: {$row['server_url']}\nHTTP Code: {$httpcode}";
				
				if($row['state'] == "down") {
					$db->query("UPDATE servers SET back_online=NOW() WHERE id='{$row['id']}'");
					if(!empty($row['email_to'])) {
						$function->SendMail($row['email_to'], $row['display_name']." is back online!", $message);
					}
					
					if($row['pushbullet'] != "0") {
						$pushbullet = new Pushbullet($pb->IdToToken($row['pushbullet']));
						if($pb->IdToDevice($row['pushbullet']) != "all") {
							foreach($pb->IdToDevice($row['pushbullet']) as $device) {
								$pushbullet->PushLink($device, $row['server_url'], $row['display_name']." is back online!", $message_push);
							}
						}else{
							$pushbullet->PushLink("all", $row['server_url'], $row['display_name']." is back online!", $message_push);
						}
					}
				}
				
				$db->query("UPDATE servers SET last_check=NOW(), last_load='{$load_Time}', state='active', response_code='{$httpcode}' WHERE id='{$row['id']}'");
				$db->query("INSERT INTO server_stats (server_id, member_id, response_code, load_time, check_date, state) VALUES ('{$row['id']}', '{$row['member_id']}', '{$httpcode}', '{$load_Time}', NOW(), 'active')");
			}else{
				$message = "We've detected that your site is down. Your site had a load time of {$load_Time} seconds.<br /><b>Website:</b> {$row['server_url']}<br /><b>HTTP Code:</b> {$httpcode}";
				$message_push = "We've detected that your site is down. Your site had a load time of {$load_Time} seconds.\Website: {$row['server_url']}\nHTTP Code: {$httpcode}";
				
				if($row['state'] != "down") {
					$db->query("UPDATE servers SET last_down=NOW() WHERE id='{$row['id']}'");
					if(!empty($row['email_to'])) {
						$function->SendMail($row['email_to'], $row['display_name']." is down!", $message);
						$db->query("UPDATE servers SET last_down=NOW() WHERE id='{$row['id']}'");
					}
					
					if($row['pushbullet'] != "0") {
						$pushbullet = new Pushbullet($pb->IdToToken($row['pushbullet']));
						if($pb->IdToDevice($row['pushbullet']) != "all") {
							foreach($pb->IdToDevice($row['pushbullet']) as $device) {
								$pushbullet->PushLink($device, $row['server_url'], $row['display_name']." is down!", $message_push);
							}
						}else{
							$pushbullet->PushLink("all", $row['server_url'], $row['display_name']." is down!", $message_push);
						}
					}
				}
			
				$db->query("UPDATE servers SET last_check=NOW(), last_load='{$load_Time}', state='down', response_code='{$httpcode}' WHERE id='{$row['id']}'");
				$db->query("INSERT INTO server_stats (server_id, member_id, response_code, load_time, check_date, state) VALUES ('{$row['id']}', '{$row['member_id']}', '{$httpcode}', '{$load_Time}', NOW(), 'down')");
			}
		}
//	}
}
$db->query("OPTIMIZE TABLE config, pushbullet, servers, server_stats, users");
$db->close();
?>