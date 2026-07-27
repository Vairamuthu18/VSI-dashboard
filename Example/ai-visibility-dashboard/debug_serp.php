<?php
// debug_serp.php

// Load API Key from env or hardcoded for test
// I'll assume the user has the env file, I'll copy the loader logic
define('CREDENTIALS_PATH', __DIR__ . '/..'); // Adjust as needed
$apiKey = '';
if (file_exists(CREDENTIALS_PATH . '/.env')) {
    $env = parse_ini_file(CREDENTIALS_PATH . '/.env');
    $apiKey = $env['SERP_API_KEY'] ?? '';
}

if (!$apiKey) {
    die("No API Key found in .env\n");
}

$query = "tax relief guide";
$url = "https://serpapi.com/search.json?engine=google&q=" . urlencode($query) . "&api_key=" . $apiKey . "&location=United+Arab+Emirates&gl=ae&hl=en";

echo "Calling URL: $url\n";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$json = json_decode($response, true);

if (isset($json['error'])) {
    echo "Error: " . $json['error'] . "\n";
    exit;
}

echo "Search Status: Success\n";

if (isset($json['ai_overview'])) {
    echo "AI Overview Found.\n";
    echo "Keys in ai_overview: " . implode(", ", array_keys($json['ai_overview'])) . "\n";
    
    if (isset($json['ai_overview']['serpapi_link'])) {
        echo "SerpApi Link: " . $json['ai_overview']['serpapi_link'] . "\n";
    }
    
    // Check for references
    if (isset($json['ai_overview']['references'])) {
        echo "References found: " . count($json['ai_overview']['references']) . "\n";
    } else {
        echo "No references in standard response.\n";
    }

} else {
    echo "No AI Overview in response.\n";
}
?>
