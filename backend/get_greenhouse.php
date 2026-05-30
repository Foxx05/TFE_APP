<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$host = 'theocortheocorwp.mysql.db';
$dbname = 'theocortheocorwp';
$user = 'theocortheocorwp';
$pass = 'theocorWP5150';

$demoUserId = 1;

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

    $stmt = $pdo->prepare("
        SELECT greenhouse_id, name
        FROM greenhouses
        WHERE user_id = :user_id
        ORDER BY greenhouse_id ASC
    ");

    $stmt->execute([
        ':user_id' => $demoUserId
    ]);

    echo json_encode([
        "success" => true,
        "greenhouses" => $stmt->fetchAll()
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}
