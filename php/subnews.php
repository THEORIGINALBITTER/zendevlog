<?php
/* ═══════════════════════════════════════════════════════════
   ZenPost Dev Log — Newsletter Subscribe (Double Opt-In)
   ═══════════════════════════════════════════════════════════ */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../libs/PHPMailer/Exception.php';
require __DIR__ . '/../libs/PHPMailer/PHPMailer.php';
require __DIR__ . '/../libs/PHPMailer/SMTP.php';

// ── CORS ──────────────────────────────────────────────────
$allowed_origins = [
    'http://localhost:5002',
    'http://localhost:5003',
    'https://www.denisbitter.de',
    'https://denisbitter.de',
    'https://zenpostmobil.denisbitter.de',
    'https://zenpostapp.denisbitter.de',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 86400');
header('Vary: Origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

// ── Only POST ─────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// ── Parse JSON body ───────────────────────────────────────
$body  = file_get_contents('php://input');
$data  = json_decode($body, true);
$email = isset($data['email']) ? trim($data['email']) : '';

// ── Validate ──────────────────────────────────────────────
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Ungültige E-Mail-Adresse.']);
    exit;
}

// ── DB ────────────────────────────────────────────────────
require_once 'db.php'; // provides $conn (mysqli)

// Check existing entry
$stmt = $conn->prepare('SELECT id, confirmed FROM newsletter_subscribers WHERE email = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$existing = $result->fetch_assoc();
$stmt->close();

if ($existing) {
    if ((int)$existing['confirmed'] === 1) {
        // Already confirmed — do not re-send
        echo json_encode([
            'success' => false,
            'already' => true,
            'message' => 'Diese E-Mail ist bereits bestätigt. Du bekommst alle neuen Posts automatisch.',
        ]);
        exit;
    }

    // Pending — delete old entry so we can re-insert with fresh token
    $del = $conn->prepare('DELETE FROM newsletter_subscribers WHERE id = ?');
    $del->bind_param('i', $existing['id']);
    $del->execute();
    $del->close();
}

// ── Generate token ────────────────────────────────────────
$token = bin2hex(random_bytes(32)); // 64 hex chars

// ── INSERT ────────────────────────────────────────────────
$ins = $conn->prepare('INSERT INTO newsletter_subscribers (email, token, confirmed) VALUES (?, ?, 0)');
$ins->bind_param('ss', $email, $token);
if (!$ins->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Datenbankfehler. Bitte versuche es später.']);
    $ins->close();
    exit;
}
$ins->close();

// ── Send confirmation email via PHPMailer ─────────────────
$confirmUrl = 'https://denisbitter.de/stage01/api/newsletter-confirm.php?token=' . urlencode($token);

$mail = new PHPMailer(true);
try {
    $mail->isMail();
    $mail->CharSet = 'UTF-8';

    $mail->setFrom('saghallo@denisbitter.de', 'Denis Bitter · ZenPost Studio');
    $mail->addAddress($email);

    $mail->isHTML(true);
    $mail->Subject = 'ZenPost Dev Log — Bestätige deine Anmeldung';

    $mail->Body = '<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bestätige deine Newsletter-Anmeldung</title>
</head>
<body style="margin:0;padding:0;background:#d0cbb8;font-family:\'IBM Plex Mono\',\'Courier New\',monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#d0cbb8;padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#d0cbb8;border:0.5px solid #2a2a2a;border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#1a1a1a;border-bottom:0.5px solid #2a2a2a;padding:28px 40px;">
              <span style="color:#AC8E66;font-size:12px;letter-spacing:0.3px;">禅 ZenPost Studio · Dev Log</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:10px;color:#AC8E66;letter-spacing:2px;text-transform:uppercase;font-weight:300;">Newsletter</p>
              <h1 style="margin:0 0 20px;font-size:22px;font-weight:300;color:#383838;line-height:1.25;letter-spacing:-0.3px;">Fast dabei.</h1>
              <p style="margin:0 0 28px;font-size:12px;color:#1a1a1a;line-height:1.7;font-weight:100;">
                Noch ein Klick, und du bekommst jeden neuen Dev Log Post direkt in dein Postfach — kein Spam, jederzeit abbestellbar.
              </p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#AC8E66;border-radius:6px;">
                    <a href="' . htmlspecialchars($confirmUrl, ENT_QUOTES) . '"
                       style="display:inline-block;padding:12px 28px;font-family:\'IBM Plex Mono\',monospace;font-size:12px;font-weight:400;color:#0f0f0f;text-decoration:none;letter-spacing:0.3px;">
                      Anmeldung bestätigen →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:11px;color:#1a1a1a;line-height:1.6;">
                Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br />
                <a href="' . htmlspecialchars($confirmUrl, ENT_QUOTES) . '" style="color:#AC8E66;word-break:break-all;">' . htmlspecialchars($confirmUrl, ENT_QUOTES) . '</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1a1a1a;border-top:0.5px solid #2a2a2a;padding:20px 40px;">
              <p style="margin:0;font-size:10px;color:#d0cbb8;font-weight:300;line-height:1.6;">
                Du erhältst diese E-Mail,<br /> weil du dich auf <a href="https://zenpostapp.denisbitter.de" style="color:#AC8E66;">zenpostapp.denisbitter.de</a> angemeldet hast.<br />
                Wenn das nicht du warst, kannst du diese E-Mail einfach ignorieren.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>';

    $mail->AltBody = "ZenPost Dev Log — Bestätige deine Anmeldung\n\n"
        . "Klicke auf diesen Link um deine Anmeldung zu bestätigen:\n"
        . $confirmUrl . "\n\n"
        . "Wenn du dich nicht angemeldet hast, ignoriere diese E-Mail einfach.";

    $mail->send();

} catch (Exception $e) {
    // Log but don't expose SMTP details to client
    error_log('PHPMailer error [newsletter-subscribe]: ' . $mail->ErrorInfo);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'E-Mail konnte nicht gesendet werden. Bitte versuche es später.']);
    exit;
}

// ── Success ───────────────────────────────────────────────
echo json_encode([
    'success' => true,
    'message' => 'Fast geschafft! Schau in dein Postfach und klicke auf den Bestätigungslink.',
]);
