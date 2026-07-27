<?php

define('CREDENTIALS_PATH', __DIR__ . '/credentials');
$_SERVER['REQUEST_METHOD'] = 'POST';

chdir(__DIR__ . '/php');
require_once 'config.php';
require_once 'auth.php';
require_once 'serpapi_service.php';
require_once 'openai_service.php';

// --- ADD USER ---
$users = getUsers();
$maxId = 0;
foreach ($users as $u) {
    if (preg_match('/^u(\d+)$/', $u['id'], $m)) {
        $maxId = max($maxId, intval($m[1]));
    }
}
$newUserId = 'u' . str_pad($maxId + 1, 3, '0', STR_PAD_LEFT);

$newUser = [
    'id' => $newUserId,
    'email' => 'admin@farahatco.com',
    'password_hash' => password_hash('password123', PASSWORD_DEFAULT),
    'name' => 'Farahat & Co.',
    'role' => 'client',
    'company' => 'Farahat & Co.',
    'created_at' => date('Y-m-d H:i:s'),
    'status' => 'active'
];
$users[] = $newUser;
saveUsers($users);

echo "User created: " . $newUserId . " (Farahat & Co.)\n";

// --- ADD QUERIES ---
$queries = readJson('ai_queries.json');
$maxQId = 0;
foreach ($queries as $q) {
    if (isset($q['id']) && preg_match('/^q(\d+)$/', $q['id'], $matches)) {
        $maxQId = max($maxQId, intval($matches[1]));
    }
}

$newQueries = [
    "Top audit firms in Dubai",
    "Corporate tax consultant UAE",
    "Accounting and bookkeeping services Dubai",
    "Company liquidation services UAE",
    "VAT registration and filing Dubai"
];

$added = 0;
$queryIdsToScan = [];

foreach ($newQueries as $qText) {
    $maxQId++;
    $newId = 'q' . str_pad($maxQId, 3, '0', STR_PAD_LEFT);
    $queries[] = [
        'id' => $newId,
        'query' => $qText,
        'brand_name' => 'Farahat & Co.',
        'location' => 'ae',
        'client_id' => $newUserId,
        'created_at' => date('Y-m-d H:i:s'),
        'last_checked' => null,
        'status' => 'Pending'
    ];
    $queryIdsToScan[] = $newId;
    $added++;
}

writeJson('ai_queries.json', $queries);
echo "Queries added: " . $added . "\n";
echo "Done! Farahat & Co. client set up with " . $added . " queries targeting UAE (ae).\n";


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

$total = count($queryIdsToScan);
$checked = 0;
$failed = 0;

echo "=================================================\n";
echo "  AI Visibility Runner - Farahat & Co. (UAE)\n";
echo "=================================================\n";
echo "Total queries to scan: $total\n\n";

foreach ($queryIdsToScan as $index => $qId) {
    // Re-read queries in case of external modification
    $queries = readJson('ai_queries.json');
    $qIndex = -1;
    foreach ($queries as $i => $q) {
        if ($q['id'] === $qId) {
            $qIndex = $i;
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
