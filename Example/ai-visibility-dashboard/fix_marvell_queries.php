<?php
$queriesFile = __DIR__ . '/data/ai_queries.json';
$queriesData = json_decode(file_get_contents($queriesFile), true);

$updated = 0;
foreach ($queriesData as &$q) {
    if (isset($q['brand_name']) && $q['brand_name'] === 'Marvell') {
        if (!isset($q['client_id'])) {
            $q['client_id'] = 'u007';
            $updated++;
        }
    }
}

if ($updated > 0) {
    file_put_contents($queriesFile, json_encode($queriesData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    echo "Fixed client_id for $updated Marvell queries.\n";
} else {
    echo "No queries needed fixing.\n";
}
