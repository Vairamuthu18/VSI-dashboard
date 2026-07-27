<?php
// Mock necessary environment for api.php
define('CREDENTIALS_PATH', __DIR__ . '/credentials'); // Adjust if needed
if (!is_dir(CREDENTIALS_PATH)) mkdir(CREDENTIALS_PATH);

// Mock global variables for requests
$_SERVER['REQUEST_METHOD'] = 'POST';

// Function to capture output of api.php
function call_api($action, $data = []) {
    $_GET['action'] = $action;
    
    // Create a temporary stream for input
    $stream = fopen('php://memory', 'r+');
    fwrite($stream, json_encode($data));
    rewind($stream);
    
    // We need to mock file_get_contents('php://input')
    // Since we can't easily override file_get_contents for standard input in a script without runkit,
    // we might need to modify api.php to read from a wrapper or just use a different approach.
    // simpler approach: modify $_SERVER['REQUEST_METHOD'] and set a global that api.php checks, but api.php uses file_get_contents('php://input').
    
    // Alternative: Use a small helper in api.php or just use `php -S` ?
    // Let's try to stick to file creation if possible.
    // Actually, simplest way to test `php://input` reading script is to pipe data to it.
    // So we will write separate small scripts for each action and run them via shell.
}

?>
