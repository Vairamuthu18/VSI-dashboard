<?php
// openai_service.php

function scanPromptWithOpenAI($prompt, $apiKey, $brandName = '') {
    if (empty($apiKey)) {
        return ['error' => 'OpenAI API Key not configured.'];
    }

    $url = 'https://api.openai.com/v1/chat/completions';
    
    // Construct the system instruction to ensure JSON output
    $systemMsg = "You are a helpful AI assistant. You will answer the user's query and checks for specific brand mentions. You must return your response in valid JSON format.";
    
    // Construct the user prompt
    $userMsg = "Query: \"$prompt\"\n\n";
    $userMsg .= "1. Provide a comprehensive answer to the query using HTML formatting (use <h3>, <p>, <ul>, <li>). Do not use markdown backticks.\n";
    $userMsg .= "2. Check if the brand \"$brandName\" is explicitly mentioned in your answer text.\n";
    $userMsg .= "3. Return a JSON object with this structure:\n";
    $userMsg .= "{\n  \"response_text\": \"<html answer>\",\n  \"brand_mentioned\": true/false,\n  \"sentiment\": \"positive|neutral|negative\",\n";
    $userMsg .= "  \"position\": \"<e.g. 1st, 2nd, Top, Not Mentioned>\",\n";
    $userMsg .= "  \"description_exact_words\": \"<exact words used to describe the brand, or empty>\",\n";
    $userMsg .= "  \"competitors_before_brand\": [\"competitor 1\"],\n";
    $userMsg .= "  \"omitted_competitors\": [\"competitor A\"]\n}";

    $data = [
        'model' => 'gpt-4o', // or gpt-3.5-turbo if prefered
        'messages' => [
            ['role' => 'system', 'content' => $systemMsg],
            ['role' => 'user', 'content' => $userMsg]
        ],
        'temperature' => 0.7,
        'response_format' => ['type' => 'json_object'] // Ensure strict JSON
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($httpCode !== 200) {
        return ['error' => 'OpenAI API Error: ' . $httpCode . ' ' . $curlError . ' Response: ' . $response];
    }

    $result = json_decode($response, true);
    $content = $result['choices'][0]['message']['content'] ?? '';
    
    if (empty($content)) {
        return ['error' => 'Empty response from OpenAI'];
    }

    // Decode the JSON content from the LLM
    $parsedContent = json_decode($content, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        // Fallback if strict JSON failed (rare with response_format)
        return [
            'response_text' => $content,
            'brand_mentioned' => false,
            'sentiment' => 'neutral'
        ];
    }
    
    // Highlight Brand Name in text if mentioned
    $responseText = $parsedContent['response_text'] ?? '';
    if (!empty($brandName) && !empty($responseText)) {
        $escapedBrand = preg_quote($brandName, '/');
        $pattern = "/\b($escapedBrand)\b/i";
        $replacement = "<span style='background-color: #dcfce7; color: #166534; padding: 2px 4px; border-radius: 4px; font-weight: bold;'>$1</span>";
        $responseText = preg_replace($pattern, $replacement, $responseText);
    }

    return [
        'response_text' => $responseText,
        'brand_mentioned' => $parsedContent['brand_mentioned'] ?? false,
        'sentiment' => $parsedContent['sentiment'] ?? 'neutral',
        'position' => $parsedContent['position'] ?? 'Not Mentioned',
        'description_exact_words' => $parsedContent['description_exact_words'] ?? '',
        'competitors_before_brand' => $parsedContent['competitors_before_brand'] ?? [],
        'omitted_competitors' => $parsedContent['omitted_competitors'] ?? [],
        'citations' => [] // ChatGPT standard doesn't provide citations easily without browsing
    ];
}

function extractMetricsFromText($text, $apiKey, $brandName) {
    if (empty($apiKey) || empty($text)) return [];
    
    $url = 'https://api.openai.com/v1/chat/completions';
    $systemMsg = "You are a data extraction assistant. Return ONLY a valid JSON object.";
    $userMsg = "Text from Google AI Overview:\n\"$text\"\n\n";
    $userMsg .= "Extract these details regarding the brand \"$brandName\":\n";
    $userMsg .= "{\n  \"position\": \"<e.g. 1st, 2nd, Top, Not Mentioned>\",\n";
    $userMsg .= "  \"description_exact_words\": \"<exact words used to describe the brand in the text>\",\n";
    $userMsg .= "  \"competitors_before_brand\": [\"competitor 1\"],\n";
    $userMsg .= "  \"omitted_competitors\": [\"competitor A\"]\n}";

    $data = [
        'model' => 'gpt-4o',
        'messages' => [
            ['role' => 'system', 'content' => $systemMsg],
            ['role' => 'user', 'content' => $userMsg]
        ],
        'temperature' => 0.1,
        'response_format' => ['type' => 'json_object']
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        $result = json_decode($response, true);
        $content = $result['choices'][0]['message']['content'] ?? '';
        return json_decode($content, true) ?: [];
    }
    return [];
}
?>
