<?php
class Functions {
	public function Active_Page($pagename, $classname='active') {
		if(isset($_GET['p'])) {
			if($_GET['p'] == $pagename) {
				return $classname;   
			}
		}elseif($pagename == "/") {
			return $classname;
		}
	}

	public function Redirect($url, $timeout=2) {
		return '<meta http-equiv="refresh" content="'.$timeout.'; url='.$url.'">';
		
	}

	public function Tooltip($title, $pos='top') {
		return 'data-toggle="tooltip" data-placement="'.$pos.'" title="'.$title.'"';
		
	}

	public function Procent($totaal,$deel){
		if($totaal!="0"){
			$percent=100*($deel/$totaal);
			if($percent > 100) {
				return 100;
			}else{
				return round($percent, 0);
			}
		}
	}

	public function Uptime($totaal, $deel){
		if($totaal!="0"){
			$percent=100*($deel/$totaal);
			if($percent > 100) {
				return 100;
			}else{
				return 100 - round($percent, 2);
			}
		}
	}

	public function SendMail($to, $subject, $message) {
		global $config;
		$headers  = 'MIME-Version: 1.0' . "\r\n";
		$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";

		$headers .= 'From: '.$config['name'].' <'.$config['email'].'>' . "\r\n";

		mail($to, $subject, $message, $headers);
	}
	
	public function IsInstalled() {
		global $ds;
		if(is_dir(dirname(__FILE__)."{$ds}..{$ds}..{$ds}install")) {
			if(DB_USERNAME == "<db_username>") {
				return 1;
			}else{
				return 2;
			}
		}else{
			return 0;
		}
	}
}
?>