<?php
require_once __DIR__ . '/../db/Database.php';
require_once __DIR__ . '/../dao/UsuarioDAO.php';

header('Content-Type: application/json');

$pdo = Database::getInstance()->getConnection();
$dao = new UsuarioDAO($pdo);

$data = json_decode(file_get_contents('php://input'), true);
if (isset($data['email']) && isset($data['senha'])) {
    $usuario = $dao->getUsuarioByEmail($data['email']);
    if ($usuario && password_verify($data['senha'], $usuario['senha'])) {
        echo json_encode(['status' => 'success', 'message' => 'Login successful.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid email or password.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Email and password are required.']);
}
        
   
