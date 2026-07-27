<?php
$dataDir = __DIR__ . '/data';
$usersFile = $dataDir . '/users.json';
$queriesFile = $dataDir . '/ai_queries.json';

// Deduplicate users
$users = json_decode(file_get_contents($usersFile), true) ?: [];
$filteredUsers = [];
$seenInfo = false;
foreach ($users as $user) {
    if ($user['email'] === 'manoj@infoskaters.com') {
        if (!$seenInfo) {
            $filteredUsers[] = $user;
            $seenInfo = true;
        }
    } else {
        $filteredUsers[] = $user;
    }
}
file_put_contents($usersFile, json_encode($filteredUsers, JSON_PRETTY_PRINT));
echo "Users deduplicated.\n";

// Deduplicate queries
$queries = json_decode(file_get_contents($queriesFile), true) ?: [];
$filteredQueries = [];
$seenQueriesMap = [];

foreach ($queries as $query) {
    if ($query['brand_name'] === 'Infoskaters') {
        $qText = $query['query'];
        if (!isset($seenQueriesMap[$qText])) {
            $filteredQueries[] = $query;
            $seenQueriesMap[$qText] = true;
        }
    } else {
        $filteredQueries[] = $query;
    }
}
file_put_contents($queriesFile, json_encode($filteredQueries, JSON_PRETTY_PRINT));
echo "Queries deduplicated.\n";
?>
