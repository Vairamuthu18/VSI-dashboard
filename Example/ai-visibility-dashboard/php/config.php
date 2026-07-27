<?php
session_start();
// Configuration

// Base path
define('BASE_PATH', dirname(__DIR__));
define('DATA_PATH', BASE_PATH . '/data');
define('CREDENTIALS_PATH', BASE_PATH . '/credentials');

// Timezone
date_default_timezone_set('Asia/Dubai');

// Response Headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Helper function to read JSON
function readJson($filename) {
    if (!file_exists(DATA_PATH . '/' . $filename)) {
        return [];
    }
    $content = file_get_contents(DATA_PATH . '/' . $filename);
    return json_decode($content, true) ?: [];
}

// Helper function to write JSON
function writeJson($filename, $data) {
    return file_put_contents(DATA_PATH . '/' . $filename, json_encode($data, JSON_PRETTY_PRINT));
}
?>
