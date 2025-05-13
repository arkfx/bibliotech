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

        if (!isset($data['id'], $data['userId'], $data['quantidade'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Dados obrigatórios ausentes.']);
            exit;
        }

        $livroId = (int) $data['id'];
        $userId = (int) $data['userId'];
        $quantidade = (int) $data['quantidade'];

        if ($livroId <= 0 || $userId <= 0 || $quantidade <= 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID e quantidade devem ser maiores que zero.']);
            exit;
        }

        try {
            $result = $dao->addItem($livroId, $userId, $quantidade);
            echo json_encode([
                'status' => $result ? 'success' : 'error',
                'message' => $result
                    ? 'Livro adicionado ao carrinho com sucesso!'
                    : 'Erro ao adicionar livro ao carrinho.'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Erro na requisição.', 'details' => $e->getMessage()]);
        }
        break;

    case 'GET':
        if (!isset($_GET['userId'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID do usuário é obrigatório.']);
            exit;
        }

        $userId = (int) $_GET['userId'];
        if ($userId <= 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID de usuário inválido.']);
            exit;
        }

        try {
            $carrinho = $dao->getCarrinhoPorUsuario($userId);
            echo json_encode(['status' => 'success', 'data' => $carrinho]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Erro ao buscar carrinho.', 'details' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['id'], $data['userId'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID do livro e do usuário são obrigatórios.']);
            exit;
        }

        $livroId = (int) $data['id'];
        $userId = (int) $data['userId'];

        if ($livroId <= 0 || $userId <= 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'IDs inválidos.']);
            exit;
        }

        try {
            $result = $dao->removeItem($livroId, $userId);
            echo json_encode([
                'status' => $result ? 'success' : 'error',
                'message' => $result
                    ? 'Livro removido do carrinho com sucesso!'
                    : 'Erro ao remover livro do carrinho.'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Erro ao remover do carrinho.',
                'details' => $e->getMessage()
            ]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['id'], $data['userId'], $data['quantidade'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Parâmetros obrigatórios ausentes.']);
            exit;
        }

        $livroId = (int) $data['id'];
        $userId = (int) $data['userId'];
        $quantidade = (int) $data['quantidade'];

        if ($livroId <= 0 || $userId <= 0 || $quantidade <= 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID e quantidade devem ser maiores que zero.']);
            exit;
        }

        try {
            $result = $dao->atualizarQuantidade($livroId, $userId, $quantidade);
            echo json_encode([
                'status' => $result ? 'success' : 'error',
                'message' => $result
                    ? 'Quantidade atualizada com sucesso.'
                    : 'Falha ao atualizar quantidade.'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Erro no servidor.', 'details' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Método não permitido.']);
        break;
}
