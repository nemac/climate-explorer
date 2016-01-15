<?php
class PushError extends Exception { }

class Pushbullet {
	private $Token;
	private $APIVersion = "https://api.pushbullet.com/v2";
	
	public function __construct($token = "") {
		if(empty($token)) {
			throw new PushError("Access token is missing.");
		}else{
			$this->Token = $token;
		}
	}
	
	private function cURLRequest($url, $method="GET", $post=array()) {
		$header = array();
		$header[] = "Authorization: Bearer ".$this->Token;
		$header[] = "Content-Type: application/json";
		
        $ch = curl_init(); 
		curl_setopt($ch, CURLOPT_URL, $this->APIVersion.$url); 
        curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_CAINFO, dirname(__FILE__).'/../cert/ca-bundle.crt');
		
		if($method == "POST") {
			curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($post));
			curl_setopt($ch, CURLOPT_POST, 1);
		}
		
        $output = curl_exec($ch); 
        curl_close($ch);
		
		return $output;
	}
	
	public function Validate() {
		$output = json_decode($this->cURLRequest("/users/me"));
		if(isset($output->error)) {
			return false;
		}else{
			return $output;
		}
	}
	
	public function GetDevices() {
		$request = json_decode($this->cURLRequest("/devices"));
		if(!isset($request->error)) {
			return $request->devices;
		}else{
			return false;
		}
	}
	
	public function PushNote($device="all", $title="", $body="") {
		if($device == "all") {
			$devices = $this->GetDevices();
			if($devices) {
				foreach($devices as $device) {
					if($device->pushable == "1") {
						$output = $this->cURLRequest(
							"/pushes",
							"POST",
							array(
								"device_iden" => $device->iden,
								"type" => "note",
								"title" => $title,
								"body" => $body
							)
						);
						
						if(!isset(json_decode($output)->error)) {
							return false;
						}
					}
				}
				return true;
			}
		}else{
			$output = $this->cURLRequest(
				"/pushes",
				"POST",
				array(
					"device_iden" => $device,
					"type" => "note",
					"title" => $title,
					"body" => $body
				)
			);
			
			if(!isset(json_decode($output)->error)) {
				return false;
			}
			return true;
		}
		
		return false;
	}
	
	public function PushLink($device="all", $link="", $title="", $body="") {
		if($device == "all") {
			$devices = $this->GetDevices();
			if($devices) {
				foreach($devices as $device) {
					if($device->pushable == "1") {
						$output = $this->cURLRequest(
							"/pushes",
							"POST",
							array(
								"device_iden" => $device->iden,
								"type" => "link",
								"title" => $title,
								"body" => $body,
								"url" => $link
							)
						);
						
						if(!isset(json_decode($output)->error)) {
							return false;
						}
					}
				}
				return true;
			}
		}else{
			$output = $this->cURLRequest(
				"/pushes",
				"POST",
				array(
					"device_iden" => $device,
					"type" => "link",
					"title" => $title,
					"body" => $body,
					"url" => $link
				)
			);
			
			if(!isset(json_decode($output)->error)) {
				return false;
			}
			return true;
		}
		
		return false;
	}
}
?>