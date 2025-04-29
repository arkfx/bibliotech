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

        if (isset($data['titulo'], $data['autor'], $data['genero'], $data['preco'], $data['editora'], $data['descricao'], $data['imagem_url'])) {
            $livro = $dao->createBook($data['titulo'], $data['autor'], $data['genero'], $data['preco'], $data['editora'], $data['descricao'], $data['imagem_url']);
            if ($livro) {
                echo json_encode(['status' => 'success', 'message' => 'Livro cadastrado com sucesso!']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Erro ao cadastrar livro.']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Todos os campos são obrigatórios.']);
        }
        break;

    case 'GET':
        try {
            if (isset($_GET['id'])) {
                $id = intval($_GET['id']);
                $livro = $dao->getBookById($id);

                if ($livro) {
                    echo json_encode(['status' => 'success', 'data' => $livro]);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Livro não encontrado.']);
                }
            } else {
                $termo = isset($_GET['q']) ? $_GET['q'] : null;
                $genero = isset($_GET['genero']) && $_GET['genero'] !== '' ? $_GET['genero'] : null;
                $ordem = isset($_GET['ordem']) && in_array(strtoupper($_GET['ordem']), ['ASC', 'DESC']) ? strtoupper($_GET['ordem']) : 'DESC';


                $livros = $dao->searchBooks($termo, $genero, $ordem);

                if ($livros) {
                    echo json_encode(['status' => 'success', 'data' => $livros]);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Nenhum livro encontrado.']);
                }
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Erro na requisição: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            $id = intval($_GET['id']);
            try {
                $deleted = $dao->deleteBook($id);
                if ($deleted) {
                    echo json_encode(['status' => 'success', 'message' => 'Livro excluído com sucesso!']);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Erro ao excluir o livro.']);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Erro na exclusão: ' . $e->getMessage()]);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'ID do livro não fornecido.']);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['id'], $data['titulo'], $data['autor'], $data['genero'], $data['preco'], $data['editora'], $data['descricao'], $data['imagem_url'])) {
            $updated = $dao->updateBook(
                $data['id'],
                $data['titulo'],
                $data['autor'],
                $data['genero'],
                $data['preco'],
                $data['editora'],
                $data['descricao'],
                $data['imagem_url']
            );

            if ($updated) {
                echo json_encode(['status' => 'success', 'message' => 'Livro atualizado com sucesso!']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Erro ao atualizar o livro.']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Todos os campos, incluindo o ID, são obrigatórios.']);
        }
        break;
    default:
        http_response_code(405); // Método não permitido
        echo json_encode(['status' => 'error', 'message' => 'Método HTTP não suportado.']);
        break;
}
