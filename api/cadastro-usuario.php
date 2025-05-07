<?php
require_once __DIR__ . '/../db/Database.php';
require_once __DIR__ . '/../dao/UsuarioDAO.php';

header('Content-Type: application/json');

$pdo = Database::getInstance()->getConnection();
$dao = new UsuarioDAO($pdo);

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['nome'], $data['email'], $data['senha'])) {
    echo json_encode(['status' => 'error', 'message' => 'Todos os campos são obrigatórios.']);
    return;
}

if ($dao->getUsuarioByEmail($data['email'])) {
    echo json_encode(['status' => 'error', 'message' => 'Este e-mail já está em uso.']);
    return;
}

$result = $dao->createUsuario([
    'nome' => $data['nome'],
    'email' => $data['email'],
    'senha' => $data['senha']
]);

echo json_encode([
    'status' => $result ? 'success' : 'error',
    'message' => $result ? 'Usuário cadastrado com sucesso!' : 'Erro ao cadastrar usuário.'
]);