<?php
require_once __DIR__ . '/../db/Database.php';
require_once __DIR__ . '/../dao/LivroDAO.php';

header('Content-Type: application/json');

$pdo = Database::getInstance()->getConnection();
$dao = new LivroDAO($pdo);

$data = json_decode(file_get_contents('php://input'), true);
if (isset($data['titulo']) && isset($data['autor']) && isset($data['genero']) && isset($data['preco']) && isset($data['editora']) && isset($data['descricao'])) {
    $livro = $dao->createBook($data['titulo'], $data['autor'], $data['genero'], $data['preco'], $data['editora'], $data['descricao']);
    if ($livro) {
        echo json_encode(['status' => 'success', 'message' => 'Livro cadastrado com sucesso!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Erro ao cadastrar livro.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Todos os campos são obrigatórios.']);
}