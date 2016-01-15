<?php
class PBPage {
	public function CheckExists($id, $member_id) {
		global $db;
		$id = $db->real_escape_string(html($id));
		$member_id = $db->real_escape_string(html($member_id));
		
		$sql = $db->query("SELECT * FROM pushbullet WHERE id='{$id}' AND member_id='{$member_id}'");
		if($sql->num_rows == 0) {
			return false;
		}else{
			return true;
		}
	}
	
	public function IdToToken($id) {
		global $db;
		$id = $db->real_escape_string(html($id));
		
		$sql = $db->query("SELECT * FROM pushbullet WHERE id='{$id}'");
		$row = $sql->fetch_assoc();
		if($sql->num_rows == 0) {
			return false;
		}else{
			return $row['access_token'];
		}
	}
	
	public function IdToDevice($id) {
		global $db;
		$id = $db->real_escape_string(html($id));
		
		$sql = $db->query("SELECT * FROM pushbullet WHERE id='{$id}'");
		$row = $sql->fetch_assoc();
		if($sql->num_rows == 0) {
			return false;
		}else{
			preg_match_all('/,([a-zA-Z0-9]+),/', $row['devices'], $devices);
			return (($row['devices'] == "all") ? "all" : $devices[1]);
		}
	}
}
?>