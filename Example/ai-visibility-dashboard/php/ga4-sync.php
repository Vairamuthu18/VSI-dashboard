<?php
// ga4-sync.php

use Google\Analytics\Data\V1beta\BetaAnalyticsDataClient;
use Google\Analytics\Data\V1beta\DateRange;
use Google\Analytics\Data\V1beta\Dimension;
use Google\Analytics\Data\V1beta\Metric;

function syncGA4Data() {
    $credentialsFile = CREDENTIALS_PATH . '/google-credentials.json';
    
    if (!file_exists($credentialsFile)) {
        return [
            'status' => 'warning', 
            'message' => 'Credentials not found. Skipping GA4 sync. Using cached data.'
        ];
    }

    require_once BASE_PATH . '/vendor/autoload.php';

    try {
        $client = new BetaAnalyticsDataClient([
            'credentials' => $credentialsFile
        ]);
        
        $env = parse_ini_file(CREDENTIALS_PATH . '/.env');
        $propertyId = $env['GA4_PROPERTY_ID'] ?? '';
        
        if (!$propertyId) {
             return ['status' => 'error', 'message' => 'GA4 Property ID not set in .env'];
        }
        
        $response = $client->runReport([
            'property' => 'properties/' . $propertyId,
            'dateRanges' => [
                new DateRange([
                    'start_date' => '30daysAgo',
                    'end_date' => 'today',
                ]),
            ],
            'dimensions' => [
                new Dimension(['name' => 'date']),
                new Dimension(['name' => 'sessionSource']),
                new Dimension(['name' => 'sessionMedium']),
            ],
            'metrics' => [
                new Metric(['name' => 'sessions']),
                new Metric(['name' => 'newUsers']),
                new Metric(['name' => 'conversions']),
            ],
        ]);
        
        $data = [];
        foreach ($response->getRows() as $row) {
            $data[] = [
                'date' => $row->getDimensionValues()[0]->getValue(),
                'source' => $row->getDimensionValues()[1]->getValue(),
                'medium' => $row->getDimensionValues()[2]->getValue(),
                'sessions' => $row->getMetricValues()[0]->getValue(),
                'new_users' => $row->getMetricValues()[1]->getValue(),
                'conversions' => $row->getMetricValues()[2]->getValue()
            ];
        }
        
        writeJson('ga4_data.json', $data);
        return ['status' => 'success', 'count' => count($data)];
        
    } catch (Exception $e) {
        return ['status' => 'error', 'message' => $e->getMessage()];
    }
}
?>
