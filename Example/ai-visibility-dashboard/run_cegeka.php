<?php
/**
 * Local CLI runner for Cegeka queries (Netherlands / nl)
 * Usage: php run_cegeka.php
 */

define('CREDENTIALS_PATH', __DIR__ . '/credentials');
$_SERVER['REQUEST_METHOD'] = 'POST';

chdir(__DIR__ . '/php');
require_once 'config.php';
require_once 'auth.php';
require_once 'serpapi_service.php';

// ── Load API keys ─────────────────────────────────────────────
$envPath = CREDENTIALS_PATH . '/.env';
if (!file_exists($envPath)) {
    die("ERROR: credentials/.env not found.\n");
}
$env        = parse_ini_file($envPath);
$serpApiKey = $env['SERPAPI_KEY']     ?? '';
$openApiKey = $env['OPENAI_API_KEY']  ?? '';

if (empty($serpApiKey)) {
    die("ERROR: SERPAPI_KEY is not set in credentials/.env\n");
}

// ── Find all Cegeka queries (client_id=u013, location=nl) ─────
$queries   = readJson('ai_queries.json');
$cegekaQs  = array_values(array_filter($queries, fn($q) =>
    ($q['brand_name'] ?? '') === 'Cegeka'
));

if (empty($cegekaQs)) {
    die("No Cegeka queries found. Did you run add_cegeka.php first?\n");
}

$total   = count($cegekaQs);
$checked = 0;
$failed  = 0;

echo "=================================================\n";
echo "  AI Visibility Runner – Cegeka (Netherlands)\n";
echo "=================================================\n";
echo "Total queries: $total\n\n";

// ── Run each query ────────────────────────────────────────────
foreach ($queries as &$q) {
    if (($q['brand_name'] ?? '') !== 'Cegeka') continue;

    $num = $checked + $failed + 1;
    echo "[$num/$total] " . $q['query'] . "\n";

    $result = scanWithSerpAPI(
        $q['query'],
        $serpApiKey,
        'Cegeka',
        'nl',
        $openApiKey
    );

    if (isset($result['error'])) {
        echo "  ✗ ERROR: " . $result['error'] . "\n\n";
        $q['status']       = 'Error';
        $q['last_checked'] = date('Y-m-d H:i:s');
        $failed++;
    } else {
        $mentioned = $result['brand_mentioned'] ? '✓ Mentioned' : '✗ Not Mentioned';
        $sentiment = $result['sentiment'] ?? 'neutral';
        $position  = $result['position']  ?? 'N/A';
        $comps     = implode(', ', $result['competitors_mentioned'] ?? []);

        echo "  Brand : $mentioned\n";
        echo "  Sentiment  : $sentiment\n";
        echo "  Position   : $position\n";
        if ($comps) echo "  Competitors: $comps\n";
        echo "\n";

        $q['last_checked']  = date('Y-m-d H:i:s');
        $q['status']        = 'Checked';
        $q['latest_result'] = [
            'timestamp' => date('Y-m-d H:i:s'),
            'google'    => $result
        ];
        $checked++;
    }

    // Save after each query so progress is not lost on interruption
    writeJson('ai_queries.json', $queries);

    // Brief pause to avoid hitting rate limits
    if ($num < $total) sleep(2);
}

echo "=================================================\n";
echo "  Done! Checked: $checked  |  Failed: $failed\n";
echo "=================================================\n";
?>
