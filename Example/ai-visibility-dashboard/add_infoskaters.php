<?php
$dataDir = __DIR__ . '/data';
$usersFile = $dataDir . '/users.json';
$queriesFile = $dataDir . '/ai_queries.json';

// --- ADD USER ---
$users = json_decode(file_get_contents($usersFile), true) ?: [];

$maxId = 0;
foreach ($users as $u) {
    if (preg_match('/^u(\d+)$/', $u['id'], $m)) {
        $maxId = max($maxId, intval($m[1]));
    }
}
$newUserId = 'u' . str_pad($maxId + 1, 3, '0', STR_PAD_LEFT);

$newUser = [
    'id' => $newUserId,
    'email' => 'manoj@infoskaters.com',
    'password_hash' => password_hash('password', PASSWORD_DEFAULT),
    'name' => 'Infoskaters',
    'role' => 'client',
    'company' => 'Infoskaters',
    'created_at' => date('Y-m-d H:i:s'),
    'status' => 'active'
];
$users[] = $newUser;
file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));

echo "User created: " . $newUserId . " (Infoskaters)\n";

// --- ADD QUERIES ---
$queries = json_decode(file_get_contents($queriesFile), true) ?: [];
$maxQId = 0;
foreach ($queries as $q) {
    if (isset($q['id']) && preg_match('/^q(\d+)$/', $q['id'], $matches)) {
        $maxQId = max($maxQId, intval($matches[1]));
    }
}

$newQueries = [
    "Which Indian company offers pay-after-sale digital marketing?",
    "Best cashback software company in India",
    "Affordable website and mobile app development company in Bangalore",
    "All-in-one software solutions for small businesses in India",
    "WhatsApp marketing tool with CRM for Indian businesses"
];

foreach ($newQueries as $newQueryText) {
    $maxQId++;
    $newQueryId = 'q' . str_pad($maxQId, 3, '0', STR_PAD_LEFT);

    $queries[] = [
        'id' => $newQueryId,
        'query' => $newQueryText,
        'brand_name' => 'Infoskaters',
        'location' => 'in',
        'client_id' => $newUserId,
        'created_at' => date('Y-m-d H:i:s'),
        'last_checked' => null,
        'status' => 'Pending'
    ];
    echo "Query added: " . $newQueryId . " (" . $newQueryText . ")\n";
}

file_put_contents($queriesFile, json_encode($queries, JSON_PRETTY_PRINT));
echo "Done.\n";
