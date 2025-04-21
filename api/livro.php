<?php
require_once __DIR__ . '/../db/Database.php';
require_once __DIR__ . '/../dao/LivroDAO.php';

header('Content-Type: application/json');

$pdo = Database::getInstance()->getConnection();
$dao = new LivroDAO($pdo);

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['titulo'], $data['autor'], $data['genero'], $data['preco'], $data['editora'], $data['descricao'])) {
            $livro = $dao->createBook($data['titulo'], $data['autor'], $data['genero'], $data['preco'], $data['editora'], $data['descricao']);
            if ($livro) {
                echo json_encode(['status' => 'success', 'message' => 'Livro cadastrado com sucesso!']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Erro ao cadastrar livro.']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Todos os campos são obrigatórios.']);
        }
        break;

    // TODO: Implementar método GET
    case 'GET':
        echo json_encode(['status' => 'pending', 'message' => 'Método GET ainda não implementado.']);
        break;

    // TODO: Implementar método DELETE - Luiz
    case 'DELETE':
        echo json_encode(['status' => 'pending', 'message' => 'Método DELETE ainda não implementado.']);
        break;
    // TODO: Implementar método PUT - Jhennifer
    case 'PUT':
        echo json_encode(['status' => 'pending', 'message' => 'Método PUT ainda não implementado.']);
        break;
    default:
        http_response_code(405); // Método não permitido
        echo json_encode(['status' => 'error', 'message' => 'Método HTTP não suportado.']);
        break;
}
