<?php
chdir(__DIR__ . '/php');
require_once 'config.php';

// Deduplicate users
$users = readJson('users.json');
$filteredUsers = [];
$seenNesto = false;
foreach ($users as $user) {
    if ($user['name'] === 'Nesto') {
        if (!$seenNesto) {
            $filteredUsers[] = $user;
            $seenNesto = true;
        }
    } else {
        $filteredUsers[] = $user;
    }
}
writeJson('users.json', $filteredUsers);
echo "Users deduplicated.\n";

// Deduplicate queries
$queries = readJson('ai_queries.json');
$filteredQueries = [];
$seenQuery = false;
foreach ($queries as $query) {
    if ($query['query'] === 'biggest hypermarket in uae' && $query['brand_name'] === 'Nesto') {
        if (!$seenQuery) {
            $filteredQueries[] = $query;
            $seenQuery = true;
        }
    } else {
        $filteredQueries[] = $query;
    }
}
writeJson('ai_queries.json', $filteredQueries);
echo "Queries deduplicated.\n";
?>
