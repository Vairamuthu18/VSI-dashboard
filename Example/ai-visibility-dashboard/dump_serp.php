<?php
require_once 'credentials/.env';
$env = parse_ini_file('credentials/.env');
$apiKey = $env['SERPAPI_KEY'];

$url = "https://serpapi.com/search.json?engine=google&q=how+to+bake+a+cake&api_key=" . $apiKey . "&location=United+Arab+Emirates&gl=ae&hl=en";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

file_put_contents('serp_dump.json', $response);
echo "Dumped to serp_dump.json";
?>
