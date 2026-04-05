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

    $rows = array_reverse($rows);

    // Production mensuelle
    $stmtMonthly = $pdo->prepare("
        SELECT
            DATE_FORMAT(day_date, '%Y-%m') AS month_key,
            MAX(day_total) AS month_end_total
        FROM (
            SELECT
                DATE(captured_at) AS day_date,
                MAX(harvest_total) AS day_total
            FROM production_snapshots
            WHERE greenhouse_id = :greenhouse_id
            GROUP BY DATE(captured_at)
        ) daily
        GROUP BY DATE_FORMAT(day_date, '%Y-%m')
        ORDER BY month_key ASC
    ");
    $stmtMonthly->execute([
        ':greenhouse_id' => $greenhouseId
    ]);
    $monthlyRaw = $stmtMonthly->fetchAll();

    $monthlyProduction = [];
    $prevMonthEnd = 0;

    foreach ($monthlyRaw as $row) {
        $monthKey = $row['month_key'];
        $monthEnd = (int)$row['month_end_total'];

        $produced = $monthEnd - $prevMonthEnd;

        $monthlyProduction[] = [
            'label' => $monthKey,
            'value' => max(0, $produced)
        ];

        $prevMonthEnd = $monthEnd;
    }

    echo json_encode([
        'success' => true,
        'greenhouse_id' => $greenhouseId,
        'last' => $lastRow,
        'history' => $rows,
        'monthly_production' => $monthlyProduction
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}