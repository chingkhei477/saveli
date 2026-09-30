<?php
/**
 * Saveli contact form handler.
 * Works on any host with PHP mail() enabled (most Indian shared hosting).
 * Returns JSON for the site's script, or redirects back for plain HTML posts.
 */
declare(strict_types=1);

const SAVELI_TO   = 'support@saveli.in';
const SAVELI_FROM = 'no-reply@saveli.in';   // must be an address on your own domain
const TOPICS = ['Missing cashback', 'Payout', 'Account', 'Partnerships', 'Privacy request', 'Grievance', 'Other'];

$wantsJson = isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

function respond(bool $ok, string $error, bool $json, int $code = 200): void {
    if ($json) {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error]);
    } else {
        header('Location: /contact.html?sent=' . ($ok ? '1' : '0'), true, 303);
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(false, 'Please use the form on the contact page.', $wantsJson, 405);
}

$clean = static function (string $key, int $max): string {
    $v = isset($_POST[$key]) && is_string($_POST[$key]) ? trim($_POST[$key]) : '';
    $v = str_replace("\0", '', $v);
    return mb_substr($v, 0, $max);
};
$oneLine = static fn(string $s): string => trim(preg_replace('/[\r\n\t]+/', ' ', $s) ?? '');

// Spam trap: real visitors never fill this hidden field.
if ($clean('website', 200) !== '') {
    respond(true, '', $wantsJson);
}

$name    = $oneLine($clean('name', 120));
$email   = $oneLine($clean('email', 200));
$topic   = $oneLine($clean('topic', 60));
$order   = $oneLine($clean('order', 120));
$message = $clean('message', 5000);
$consent = isset($_POST['consent']);

if (mb_strlen($name) < 2)                          respond(false, 'Enter your name.', $wantsJson, 422);
if (!filter_var($email, FILTER_VALIDATE_EMAIL))    respond(false, 'Enter a valid email address.', $wantsJson, 422);
if (!in_array($topic, TOPICS, true))               respond(false, 'Choose what your message is about.', $wantsJson, 422);
if (mb_strlen($message) < 10)                      respond(false, 'Write a few words so we can help.', $wantsJson, 422);
if (!$consent)                                     respond(false, 'Please agree so we can use your details to reply.', $wantsJson, 422);

// Basic rate limit: one message per IP every 30 seconds.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$stamp = sys_get_temp_dir() . '/saveli_contact_' . hash('sha256', $ip);
if (is_file($stamp) && (time() - (int) @filemtime($stamp)) < 30) {
    respond(false, 'You have just sent a message. Please wait a moment before sending another.', $wantsJson, 429);
}
@touch($stamp);

$subject = '[' . $topic . '] Message from ' . $name . ' via saveli.in';
$body  = "Name: {$name}\nEmail: {$email}\nTopic: {$topic}\n";
$body .= $order !== '' ? "Order / reference: {$order}\n" : '';
$body .= 'Sent: ' . gmdate('Y-m-d H:i') . " UTC\n\n" . $message . "\n";

$headers = [
    'From: Saveli Website <' . SAVELI_FROM . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
];

$sent = @mail(SAVELI_TO, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers), '-f' . SAVELI_FROM);

if (!$sent) {
    respond(false, 'We could not send your message right now. Please email support@saveli.in directly.', $wantsJson, 500);
}
respond(true, '', $wantsJson);
