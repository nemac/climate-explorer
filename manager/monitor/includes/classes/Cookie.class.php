<?php
class Cookie
{
	const Session = null;
	const OneDay = 86400;
	const SevenDays = 604800;
	const ThirtyDays = 2592000;
	const SixMonths = 15811200;
	const OneYear = 31536000;
	const Lifetime = -1;

	public function Exists($name)
	{
		return isset($_COOKIE[$name]);
	}
	
	public function IsEmpty($name)
	{
		return empty($_COOKIE[$name]);
	}
	public function Get($name, $default = '')
	{
		return (isset($_COOKIE[$name]) ? $_COOKIE[$name] : $default);
	}
	
	public function Set($name, $value, $expiry = SELF::OneDay, $path = '/', $domain = false)
	{
		$retval = false;
		if (!headers_sent())
		{
			if ($domain === false) {
				$domain = $_SERVER['HTTP_HOST'];
			}
			if ($expiry === -1) {
				$expiry = 1893456000;
			}elseif (is_numeric($expiry)) {
				$expiry += time();
			}else{
				$expiry = strtotime($expiry);
			}

			$retval = @setcookie($name, $value, $expiry, $path, $domain);
			if ($retval)
				$_COOKIE[$name] = $value;
		}
		return $retval;
	}
	
	public function Delete($name, $path = '/', $domain = false, $remove_from_global = false)
	{
		$retval = false;
		if (!headers_sent())
		{
			if ($domain === false)
				$domain = $_SERVER['HTTP_HOST'];
			$retval = setcookie($name, '', time() - 3600, $path, $domain);

			if ($remove_from_global)
				unset($_COOKIE[$name]);
		}
		return $retval;
	}
}
?>