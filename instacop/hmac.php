<?php

# Parameters.
$index = 0;
$locale = urldecode($_REQUEST['locale']);
$url = urldecode($_REQUEST['hmacpage']);
$ua = $_SERVER['HTTP_USER_AGENT'];
$headers = array(
	'Accept-Encoding: gzip, deflate',
	'Upgrade-Insecure-Requests: 1',
	'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	'User-Agent: ' . $ua,
	'Accept-Language: ' . $locale . '-' . $locale,
);

# cURL operation.
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 0);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_ENCODING, '');
$html = curl_exec($ch);
curl_close($ch);

# Parse HTMl.
$dom = new DOMDocument();
@$dom->loadHTML($html);

# Find HMAC image link.
foreach($dom->getElementsByTagName('img') as $img) {

	$imgsrc = $img->getAttribute('src');
	
	if ((strpos($imgsrc, 'hmac') !== false) && ($index == 0)) {
		# Localize HMAC link.
		$hmaclink = str_replace(parse_url($imgsrc, PHP_URL_HOST), 'www.adidas.' . $locale, $imgsrc);
		$index = $index + 1;
		echo $hmaclink;
	}

}

?>