<?php
/**
 * php/youtube_stats.php
 * ---------------------------------------------------------
 * Proxy lato server per YouTube Data API v3.
 * Il frontend (js/main.js) chiama questo file passando il nome
 * del canale come alias interno; qui viene tradotto nello
 * Channel ID reale e viene interrogata l'API ufficiale, così la
 * chiave API non è mai esposta nel codice del browser.
 *
 * Uso: GET php/youtube_stats.php?channel=BsQuik
 * Risposta: { "subscriberCount": 12345 }
 * ---------------------------------------------------------
 * CONFIGURAZIONE RICHIESTA:
 * 1. Crea una API key su https://console.cloud.google.com/
 *    (abilita "YouTube Data API v3").
 * 2. Inseriscila in YOUTUBE_API_KEY qui sotto (o meglio, in una
 *    variabile d'ambiente non versionata).
 * 3. Sostituisci i Channel ID nella mappa $channelMap con quelli
 *    reali dei tuoi canali (li trovi in YouTube Studio > Impostazioni
 *    canale > Info canale > ID canale).
 */

header('Content-Type: application/json; charset=utf-8');

// --- CONFIGURAZIONE -----------------------------------------
define('YOUTUBE_API_KEY', getenv('YOUTUBE_API_KEY') ?: 'INSERISCI_LA_TUA_API_KEY');

// Alias usati dal frontend => Channel ID reale su YouTube
$channelMap = [
    'BsQuik'     => 'INSERISCI_CHANNEL_ID_BSQUIK',
    'ttmPizzaa'  => 'INSERISCI_CHANNEL_ID_TTMPIZZAA',
];
// --------------------------------------------------------------

$alias = isset($_GET['channel']) ? $_GET['channel'] : '';

if ($alias === '' || !isset($channelMap[$alias])) {
    http_response_code(400);
    echo json_encode(['error' => 'Canale non riconosciuto.']);
    exit;
}

$channelId = $channelMap[$alias];

if (YOUTUBE_API_KEY === 'INSERISCI_LA_TUA_API_KEY') {
    // Nessuna chiave configurata: rispondiamo con un errore chiaro
    // invece di far fallire silenziosamente cURL.
    http_response_code(501);
    echo json_encode(['error' => 'YOUTUBE_API_KEY non configurata sul server.']);
    exit;
}

$endpoint = 'https://www.googleapis.com/youtube/v3/channels'
    . '?part=statistics'
    . '&id=' . urlencode($channelId)
    . '&key=' . urlencode(YOUTUBE_API_KEY);

$ch = curl_init($endpoint);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 8,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Errore nella richiesta a YouTube: ' . $curlError]);
    exit;
}

$data = json_decode($response, true);

if ($httpCode !== 200 || empty($data['items'][0]['statistics']['subscriberCount'])) {
    http_response_code($httpCode >= 400 ? $httpCode : 502);
    echo json_encode(['error' => 'Risposta inattesa da YouTube API.']);
    exit;
}

echo json_encode([
    'subscriberCount' => (int) $data['items'][0]['statistics']['subscriberCount'],
]);
