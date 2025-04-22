<?php

require_once '../db/Database.php';
try {
    $db = Database::getInstance();
    $conn = $db->getConnection();

    // Executar uma query simples para testar
    $stmt = $conn->query("SELECT NOW()");
    $now = $stmt->fetchColumn();

    echo "<strong>✅ Conectado com sucesso!</strong><br>";
    echo "Data e hora do servidor PostgreSQL: <code>$now</code>";
} catch (PDOException $e) {
    echo "<strong>❌ Falha na conexão:</strong> " . $e->getMessage();
}
