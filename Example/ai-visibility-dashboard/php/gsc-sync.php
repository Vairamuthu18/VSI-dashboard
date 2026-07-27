<?php
// gsc-sync.php

function syncGSCData() {
    // Check if credentials exist
    $credentialsFile = CREDENTIALS_PATH . '/google-credentials.json';
    
    if (!file_exists($credentialsFile)) {
        // Return dummy success if in demo mode/no credentials
        // In a real scenario, this might log a warning or return existing data
        return [
            'status' => 'warning', 
            'message' => 'Credentials not found. Skipping GSC sync. Using cached data.'
        ];
    }

    require_once BASE_PATH . '/vendor/autoload.php';

    try {
        $client = new Google_Client();
        $client->setAuthConfig($credentialsFile);
        $client->addScope(Google_Service_Webmasters::WEBMASTERS_READONLY);
        
        $service = new Google_Service_Webmasters($client);
        
        // Load config from .env or config file
        $env = parse_ini_file(CREDENTIALS_PATH . '/.env');
        $siteUrl = $env['GSC_SITE_URL'] ?? 'https://yourwebsite.com';
        
        $request = new Google_Service_Webmasters_SearchAnalyticsQueryRequest();
        $request->setStartDate(date('Y-m-d', strtotime('-30 days')));
        $request->setEndDate(date('Y-m-d'));
        $request->setDimensions(['query', 'page']);
        
        $response = $service->searchanalytics->query($siteUrl, $request);
        
        $data = [];
        foreach ($response->getRows() as $row) {
            $data[] = [
                'date' => date('Y-m-d'),
                'query' => $row->getKeys()[0],
                'page' => $row->getKeys()[1],
                'clicks' => $row->getClicks(),
                'impressions' => $row->getImpressions(),
                'ctr' => $row->getCtr(),
                'position' => $row->getPosition()
            ];
        }
        
        writeJson('gsc_data.json', $data);
        return ['status' => 'success', 'count' => count($data)];
        
    } catch (Exception $e) {
        return ['status' => 'error', 'message' => $e->getMessage()];
    }
}
?>
