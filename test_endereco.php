<?php
// filepath: c:\xampp\htdocs\bibliotech\test_endereco.php

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testando carregamento das classes de endereço...\n<br>";

try {
    // Testar se as classes podem ser carregadas
    require_once __DIR__ . '/core/Database.php';
    echo "✓ Database carregado\n<br>";
    
    require_once __DIR__ . '/models/Endereco.php';
    echo "✓ Model Endereco carregado\n<br>";
    
    require_once __DIR__ . '/repositories/BaseRepository.php';
    echo "✓ BaseRepository carregado\n<br>";
    
    require_once __DIR__ . '/repositories/EnderecoRepository.php';
    echo "✓ EnderecoRepository carregado\n<br>";
    
    require_once __DIR__ . '/services/EnderecoService.php';
    echo "✓ EnderecoService carregado\n<br>";
    
    require_once __DIR__ . '/core/AppFactory.php';
    echo "✓ AppFactory carregado\n<br>";
    
    require_once __DIR__ . '/controllers/BaseController.php';
    echo "✓ BaseController carregado\n<br>";
    
    require_once __DIR__ . '/controllers/EnderecoController.php';
    echo "✓ EnderecoController carregado\n<br>";
    
    // Testar conexão com banco
    $db = \BiblioTech\Core\Database::getInstance();
    $conn = $db->getConnection();
    echo "✓ Conexão com banco de dados estabelecida\n<br>";
    
    // Testar se a tabela endereco existe
    $stmt = $conn->query("SHOW TABLES LIKE 'endereco'");
    if ($stmt->rowCount() > 0) {
        echo "✓ Tabela 'endereco' existe no banco de dados\n<br>";
    } else {
        echo "❌ Tabela 'endereco' NÃO existe no banco de dados\n<br>";
    }
    
    echo "\n<br>Todos os testes passaram! A API de endereço deve estar funcionando.";
    
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "\n<br>";
    echo "Stack trace: " . $e->getTraceAsString() . "\n<br>";
}