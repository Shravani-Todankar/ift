<?php
header('Content-Type: application/json');

$ZEPTOMAIL_TOKEN = 'PHtE6r1eQeu/2m56phQJ5fXqE8H1MNgt+r5uLAARs40WDKdQFk0GrtovmmTi+R1+B/QRFaTPndhqt7rJ5+zWLG+4MWcaWGqyqK3sx/VYSPOZsbq6x00at1kTcEbeUIPpcdJt3CPXuNbZNA==';
$RECIPIENT_EMAIL = 'info@enlearning.in';
$FROM_EMAIL      = 'info@enlearning.in';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['subject']) || empty($input['htmlbody'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing subject or htmlbody']);
    exit;
}

$payload = json_encode([
    'from' => ['address' => $FROM_EMAIL, 'name' => 'IFT Website'],
    'to'   => [['email_address' => ['address' => $RECIPIENT_EMAIL, 'name' => 'IFT Team']]],
    'subject'  => $input['subject'],
    'htmlbody' => $input['htmlbody']
]);

$ch = curl_init('https://api.zeptomail.in/v1.1/email');
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => [
        'accept: application/json',
        'content-type: application/json',
        'authorization: Zoho-enczapikey ' . $ZEPTOMAIL_TOKEN
    ]
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode(['error' => 'cURL error: ' . $curlError]);
    exit;
}

http_response_code($httpCode);
echo $response;
