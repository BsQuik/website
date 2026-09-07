<?php
/**
 * php/brawlstars_proxy.php
 * ---------------------------------------------------------
 * Proxy lato server per l'API ufficiale di Brawl Stars
 * (https://developer.brawlstars.com). La chiave API di Supercell
 * richiede l'IP del server autorizzato: per questo la chiamata
 * DEVE passare da qui e non può essere fatta direttamente dal
 * browser dell'utente.
 *
 * Uso:
 *   GET php/brawlstars_proxy.php?type=player&tag=XXXXXXXX
 *   GET php/brawlstars_proxy.php?type=club&tag=XXXXXXXX
 *
 * Il tag va passato SENZA il simbolo #.
 * ---------------------------------------------------------
 * CONFIGURAZIONE RICHIESTA:
 * 1. Registra un account su https://developer.brawlstars.com
 * 2. Crea una chiave API autorizzando l'IP pubblico di QUESTO server
 *    (non il tuo IP locale: l'API blocca le richieste da IP diversi
 *    da quello autorizzato).
 * 3. Inserisci la chiave in BRAWLSTARS_API_KEY qui sotto.
 */

header('Content-Type: application/json; charset=utf-8');

// --- CONFIGURAZIONE -----------------------------------------
define('BRAWLSTARS_API_KEY', getenv('BRAWLSTARS_API_KEY') ?: 'INSERISCI_LA_TUA_API_KEY');
define('BRAWLSTARS_BASE_URL', 'https://api.brawlstars.com/v1');
// --------------------------------------------------------------

$type = isset($_GET['type']) ? $_GET['type'] : '';
$tag  = isset($_GET['tag']) ? strtoupper(trim($_GET['tag'])) : '';

$allowedTypes = ['player', 'club'];

if (!in_array($type, $allowedTypes, true) || $tag === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Parametri mancanti: servono "type" (player|club) e "tag".']);
    exit;
}

if (BRAWLSTARS_API_KEY === 'INSERISCI_LA_TUA_API_KEY') {
    http_response_code(501);
    echo json_encode(['error' => 'BRAWLSTARS_API_KEY non configurata sul server.']);
    exit;
}

// L'API vuole il tag preceduto da "#" ma URL-encodato come %23
$encodedTag = '%23' . urlencode($tag);
$resource = $type === 'player' ? 'players' : 'clubs';
$endpoint = BRAWLSTARS_BASE_URL . '/' . $resource . '/' . $encodedTag;

$ch = curl_init($endpoint);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 8,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . BRAWLSTARS_API_KEY,
        'Accept: application/json',
    ],
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Errore nella richiesta a Brawl Stars API: ' . $curlError]);
    exit;
}

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode(['error' => 'Brawl Stars API ha risposto con codice ' . $httpCode, 'raw' => json_decode($response, true)]);
    exit;
}

// Passa direttamente al frontend i dati grezzi già in JSON
echo $response;
