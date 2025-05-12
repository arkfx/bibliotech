<?php
require_once __DIR__ . '/../db/Database.php';
require_once __DIR__ . '/../dao/CarrinhoDAO.php';

header('Content-Type: application/json');

$pdo = Database::getInstance()->getConnection();
$dao = new CarrinhoDAO($pdo);

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['id'])){
            $livroId = $data['id'];
            $userId = $data['userId'];
            $quantidade = $data['quantidade'];
            try {
                $result = $dao->addItem($livroId, $userId, $quantidade);
                if ($result) {
                    echo json_encode(['status' => 'success', 'message' => 'Livro adicionado ao carrinho com sucesso!']);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Erro ao adicionar livro ao carrinho.']);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Erro na requisição: ' . $e->getMessage()]);
            }
    
        } else {
            echo json_encode(['status' => 'error', 'message' => 'ID do livro é obrigatório.']);
        }
        break;
}
