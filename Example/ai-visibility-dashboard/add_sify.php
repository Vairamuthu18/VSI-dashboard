<?php
chdir(__DIR__ . '/php');
require_once 'config.php';
require_once 'auth.php';

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
    'email' => 'sify',
    'password_hash' => password_hash('password', PASSWORD_DEFAULT),
    'name' => 'Sify',
    'role' => 'client',
    'company' => 'Sify',
    'created_at' => date('Y-m-d H:i:s'),
    'status' => 'active'
];
$users[] = $newUser;
saveUsers($users);

echo "User created: " . $newUserId . "\n";

$queries = readJson('ai_queries.json');
$maxQId = 0;
foreach ($queries as $q) {
    if (isset($q['id']) && preg_match('/^q(\d+)$/', $q['id'], $matches)) {
        $maxQId = max($maxQId, intval($matches[1]));
    }
}

$newQueries = [
    "Top Colo Data Center in India",
    "Best Colocation Data Center",
    "India Data Colocation Center",
    "Trusted Colo Server Solutions",
    "Sify Data Center Colocation",
    "Data Center Colocation Service",
    "Top Colocation Hosting Service",
    "Reliable Colocation Partner",
    "Best Server Hosting Colocation",
    "Best Colo Data Center",
    "Hyperscale Hyperconnected Data Center",
    "Colocation Hosting Service",
    "Colocation Hosting by Sify",
    "Colocation Data Center",
    "Secured Colocation Services",
    "Data Colocation Center",
    "Reliable Colocation Provider",
    "High Uptime Guarantee",
    "Your Trusted Colo Partner",
    "Top Colocation Providers",
    "Scalable Colocation Hosting",
    "Premium Colocation Space",
    "Carrier Neutral Colocation",
    "Colocation for Enterprises",
    "Colocation Hosting Provider",
    "Top Data Center in India",
    "Edge Data Center Solutions",
    "AI Ready Data Center Services",
    "Data Center Hosting Providers",
    "Certified Green Data Centers",
    "Data Center Server Rack",
    "Energy Efficient Data Center",
    "Data Center 10X Security",
    "Best Colo Providers in India",
    "AI ML Led Data Center",
    "Data Center Hosting Company",
    "Best Data Centers Company",
    "Top Data Center Services",
    "Next Gen Data Center in India",
    "AI Ready Data Center in India",
    "Enhanced 10 Levels of Security",
    "Rich Interconnect Ecosystem",
    "Liquid and Air Cooling",
    "Get Maximum Uptime",
    "India's First NVIDIA Certified",
    "NVIDIA Certified Data Center",
    "10 Level Security Access",
    "Carbon Neutral Green Data Centers",
    "Liquid Cooling Data Center",
    "Air Cooling Data Center",
    "Renewable Energy Data Center",
    "AI Ready Infrastructure",
    "Sify Technologies",
    "Best Colo Data Center Sify",
    "Hyperscale Data Center",
    "Hyperconnected Data Center",
    "Carrier Neutral Data Center",
    "Enterprise Colocation",
    "Server Rack Hosting",
    "High Power Rack Data Center"
];

$added = 0;
foreach ($newQueries as $qText) {
    $maxQId++;
    $newId = 'q' . str_pad($maxQId, 3, '0', STR_PAD_LEFT);
    $queries[] = [
        'id' => $newId,
        'query' => $qText,
        'brand_name' => 'Sify',
        'location' => 'in',
        'client_id' => $newUserId,
        'created_at' => date('Y-m-d H:i:s'),
        'last_checked' => null,
        'status' => 'Pending'
    ];
    $added++;
}

writeJson('ai_queries.json', $queries);
echo "Queries added: " . $added . "\n";
?>
