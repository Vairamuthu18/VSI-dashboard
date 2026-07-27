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
    'email' => 'cegeka',
    'password_hash' => password_hash('password', PASSWORD_DEFAULT),
    'name' => 'Cegeka',
    'role' => 'client',
    'company' => 'Cegeka',
    'created_at' => date('Y-m-d H:i:s'),
    'status' => 'active'
];
$users[] = $newUser;
saveUsers($users);

echo "User created: " . $newUserId . " (Cegeka)\n";

// --- ADD QUERIES ---
$queries = readJson('ai_queries.json');
$maxQId = 0;
foreach ($queries as $q) {
    if (isset($q['id']) && preg_match('/^q(\d+)$/', $q['id'], $matches)) {
        $maxQId = max($maxQId, intval($matches[1]));
    }
}

$newQueries = [
    "Sovereign Cloud: what is a good strategy",
    "Digitale autonomie",
    "What is a Sovereign datacenter",
    "Cloud solutions europe",
    "european cloud providers",
    "Top sovereign cloud providers",
    "What is a good cloud transformation approach",
    "Public, private or hybrid cloud",
    "open sovereign cloud",
    "microsoft cloud for sovereignty",
];

$added = 0;
foreach ($newQueries as $qText) {
    $maxQId++;
    $newId = 'q' . str_pad($maxQId, 3, '0', STR_PAD_LEFT);
    $queries[] = [
        'id' => $newId,
        'query' => $qText,
        'brand_name' => 'Cegeka',
        'location' => 'nl',
        'client_id' => $newUserId,
        'created_at' => date('Y-m-d H:i:s'),
        'last_checked' => null,
        'status' => 'Pending'
    ];
    $added++;
}

writeJson('ai_queries.json', $queries);
echo "Queries added: " . $added . "\n";
echo "Done! Cegeka client set up with " . $added . " queries targeting Netherlands (nl).\n";
?>
