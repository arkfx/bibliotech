<?php
require_once __DIR__ . '/../db/Database.php';

header('Content-Type: application/json');

$pdo = Database::getInstance()->getConnection();

try {
    $stmt = $pdo->query("SELECT id, nome FROM generos ORDER BY nome ASC");
    $generos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'data' => $generos]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Erro ao buscar gêneros: ' . $e->getMessage()]);
}