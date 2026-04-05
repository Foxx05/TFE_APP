<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

$host = 'theocortheocorwp.mysql.db';
$dbname = 'theocortheocorwp';
$user = 'theocortheocorwp';
$pass = 'theocorWP5150';

$greenhouseId = isset($_GET['greenhouse_id']) ? (int)$_GET['greenhouse_id'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;

if ($limit < 10) {
    $limit = 10;
}
if ($limit > 1000) {
    $limit = 1000;
}

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

    // Dernière mesure
    $stmtLast = $pdo->prepare("
        SELECT
            id,
            greenhouse_id,
            captured_at,
            flowers_white,
            fruits_green,
            fruits_yellow,
            fruits_red,
            status,
            temperature_air_c,
            humidity_pct,
            pressure_hpa,
            lux,
            harvested_now,
            harvest_total
        FROM production_snapshots
        WHERE greenhouse_id = :greenhouse_id
        ORDER BY captured_at DESC
        LIMIT 1
    ");
    $stmtLast->execute([
        ':greenhouse_id' => $greenhouseId
    ]);
    $lastRow = $stmtLast->fetch();

    // Historique
    $stmtHistory = $pdo->prepare("
        SELECT
            captured_at,
            flowers_white,
            fruits_green,
            fruits_yellow,
            fruits_red,
            status,
            temperature_air_c,
            humidity_pct,
            pressure_hpa,
            lux,
            harvested_now,
            harvest_total
        FROM production_snapshots
        WHERE greenhouse_id = :greenhouse_id
        ORDER BY captured_at DESC
        LIMIT $limit
    ");
    $stmtHistory->execute([
        ':greenhouse_id' => $greenhouseId
    ]);
    $rows = $stmtHistory->fetchAll();

    // ordre chronologique pour graphes futurs
    $rows = array_reverse($rows);

    echo json_encode([
        'success' => true,
        'greenhouse_id' => $greenhouseId,
        'last' => $lastRow,
        'history' => $rows
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}