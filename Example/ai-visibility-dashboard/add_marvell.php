<?php

// 1. Add User Marvell
$usersFile = __DIR__ . '/data/users.json';
$usersData = json_decode(file_get_contents($usersFile), true);

$lastUserIdNum = 0;
foreach ($usersData as $u) {
    if (preg_match('/^u(\d+)$/', $u['id'], $m)) {
        $lastUserIdNum = max($lastUserIdNum, (int)$m[1]);
    }
}
$newUserId = 'u' . str_pad($lastUserIdNum + 1, 3, '0', STR_PAD_LEFT);

$newUser = [
    "id" => $newUserId,
    "email" => "marvell@marvell.com",
    "password_hash" => password_hash("marvell123", PASSWORD_DEFAULT),
    "name" => "Marvell",
    "role" => "client",
    "company" => "Marvell",
    "created_at" => date("Y-m-d H:i:s"),
    "status" => "active"
];

$usersData[] = $newUser;
file_put_contents($usersFile, json_encode($usersData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

echo "Added user Marvell.\n";

// 2. Add Queries
$queriesFile = __DIR__ . '/data/ai_queries.json';
$queriesData = json_decode(file_get_contents($queriesFile), true);

$lastQueryIdNum = 0;
foreach ($queriesData as $q) {
    if (preg_match('/^q(\d+)$/', $q['id'], $m)) {
        $lastQueryIdNum = max($lastQueryIdNum, (int)$m[1]);
    }
}

$newQueries = [
    "AI data center networking solutions",
    "Custom AI processors for enterprise workloads",
    "High-performance AI compute accelerators",
    "Data processing units for AI applications",
    "Memory and interconnect technology for AI systems"
];

foreach ($newQueries as $nq) {
    $lastQueryIdNum++;
    $newId = 'q' . str_pad($lastQueryIdNum, 3, '0', STR_PAD_LEFT);
    $queriesData[] = [
        "query" => $nq,
        "brand_name" => "Marvell",
        "location" => "us",
        "id" => $newId,
        "created_at" => date("Y-m-d H:i:s"),
        "status" => "Pending"
    ];
}

file_put_contents($queriesFile, json_encode($queriesData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

echo "Added 5 queries for Marvell.\n";
