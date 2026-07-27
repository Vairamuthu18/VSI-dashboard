<?php

define('CREDENTIALS_PATH', __DIR__ . '/credentials');
$_SERVER['REQUEST_METHOD'] = 'POST';

chdir(__DIR__ . '/php');
require_once 'config.php';
require_once 'auth.php';
require_once 'serpapi_service.php';
require_once 'openai_service.php';

// --- NEW QUERIES ---
$newQueriesText = [
    "Best audit firm in Dubai",
    "Corporate tax consultants in UAE",
    "Accounting services in Dubai UAE",
    "Company liquidation services in Dubai",
    "VAT registration experts in UAE"
];

$queries = readJson('ai_queries.json');

// Find existing Farahat queries and update them
$farahatQueryIds = [];
$i = 0;
foreach ($queries as &$q) {
    if ($q['brand_name'] === 'Farahat & Co.') {
        if (isset($newQueriesText[$i])) {
            $q['query'] = $newQueriesText[$i];
            $q['status'] = 'Pending';
            $q['last_checked'] = null;
            $q['latest_result'] = null;
            $farahatQueryIds[] = $q['id'];
            $i++;
        }
    }
}

writeJson('ai_queries.json', $queries);
echo "Replaced $i queries for Farahat & Co.\n";

// --- RUN SCANS ---
$envPath = CREDENTIALS_PATH . '/.env';
if (!file_exists($envPath)) {
    die("ERROR: credentials/.env not found.\n");
}
$env = parse_ini_file($envPath);
$serpApiKey = $env['SERPAPI_KEY'] ?? '';
$openApiKey = $env['OPENAI_API_KEY'] ?? '';

if (empty($serpApiKey)) {
    die("ERROR: SERPAPI_KEY is not set in credentials/.env\n");
}
if (empty($openApiKey)) {
    die("ERROR: OPENAI_API_KEY is not set in credentials/.env\n");
}

$total = count($farahatQueryIds);
$checked = 0;

echo "=================================================\n";
echo "  AI Visibility Runner - Farahat & Co. (UAE)\n";
echo "=================================================\n";
echo "Total queries to scan: $total\n\n";

foreach ($farahatQueryIds as $index => $qId) {
    // Re-read queries in case of external modification
    $queries = readJson('ai_queries.json');
    $qIndex = -1;
    foreach ($queries as $idx => $q) {
        if ($q['id'] === $qId) {
            $qIndex = $idx;
            break;
        }
    }
    
    if ($qIndex === -1) continue;
    $q = $queries[$qIndex];

    $num = $index + 1;
    echo "[$num/$total] " . $q['query'] . "\n";

    $results = [
        'timestamp' => date('Y-m-d H:i:s'),
        'google' => null,
        'chatgpt' => null
    ];

    echo "  -> Running SerpAPI (Google AI)... ";
    $googleAnalysis = scanWithSerpAPI($q['query'], $serpApiKey, $q['brand_name'], $q['location'], $openApiKey);
    if (isset($googleAnalysis['error'])) {
        echo "ERROR\n";
        $results['google'] = ['error' => $googleAnalysis['error']];
    } else {
        echo "OK\n";
        $results['google'] = $googleAnalysis;
    }

    echo "  -> Running OpenAI (ChatGPT)... ";
    $chatGptAnalysis = scanPromptWithOpenAI($q['query'], $openApiKey, $q['brand_name']);
    if (isset($chatGptAnalysis['error'])) {
        echo "ERROR\n";
        $results['chatgpt'] = ['error' => $chatGptAnalysis['error']];
    } else {
        if (function_exists('extractMetricsFromText')) {
            $advancedMetrics = extractMetricsFromText($chatGptAnalysis['response_text'], $openApiKey, $q['brand_name']);
            $chatGptAnalysis['position'] = $advancedMetrics['position'] ?? 'Not Mentioned';
            $chatGptAnalysis['description_exact_words'] = $advancedMetrics['description_exact_words'] ?? '';
            $chatGptAnalysis['competitors_before_brand'] = $advancedMetrics['competitors_before_brand'] ?? [];
            $chatGptAnalysis['omitted_competitors'] = $advancedMetrics['omitted_competitors'] ?? [];
        }
        echo "OK\n";
        $results['chatgpt'] = $chatGptAnalysis;
    }
    
    $queries[$qIndex]['last_checked'] = date('Y-m-d H:i:s');
    $queries[$qIndex]['status'] = 'Checked';
    $queries[$qIndex]['latest_result'] = $results;

    writeJson('ai_queries.json', $queries);
    $checked++;
    
    if ($num < $total) sleep(2);
}

echo "=================================================\n";
echo "  Done! Checked: $checked\n";
echo "=================================================\n";
