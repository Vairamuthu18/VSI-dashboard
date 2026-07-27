<?php
chdir(__DIR__ . '/php');
require_once 'config.php';
require_once 'auth.php';

// --- ADD USER ---
$users = getUsers();

// Generate max ID
$maxId = 0;
foreach ($users as $u) {
    if (preg_match('/^u(\d+)$/', $u['id'], $m)) {
        $maxId = max($maxId, intval($m[1]));
    }
}
$newUserId = 'u' . str_pad($maxId + 1, 3, '0', STR_PAD_LEFT);

$newUser = [
    'id' => $newUserId,
    'email' => 'nesto',
    'password_hash' => password_hash('password', PASSWORD_DEFAULT),
    'name' => 'Nesto',
    'role' => 'client',
    'company' => 'Nesto',
    'created_at' => date('Y-m-d H:i:s'),
    'status' => 'active'
];
$users[] = $newUser;
saveUsers($users);

echo "User created: " . $newUserId . " (Nesto)\n";

// --- ADD QUERY ---
$queries = readJson('ai_queries.json');
$maxQId = 0;
foreach ($queries as $q) {
    if (isset($q['id']) && preg_match('/^q(\d+)$/', $q['id'], $matches)) {
        $maxQId = max($maxQId, intval($matches[1]));
    }
}

$newQueryText = "biggest hypermarket in uae";
$maxQId++;
$newQueryId = 'q' . str_pad($maxQId, 3, '0', STR_PAD_LEFT);

$queries[] = [
    'id' => $newQueryId,
    'query' => $newQueryText,
    'brand_name' => 'Nesto',
    'location' => 'ae',
    'client_id' => $newUserId,
    'created_at' => date('Y-m-d H:i:s'),
    'last_checked' => null,
    'status' => 'Pending'
];

writeJson('ai_queries.json', $queries);
echo "Query added: " . $newQueryId . " (" . $newQueryText . ")\n";
?>
