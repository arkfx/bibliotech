<?php

require_once __DIR__ . '/../routing/Route.php';
require_once __DIR__ . '/../services/EditoraService.php';
require_once __DIR__ . '/../models/Editora.php';
require_once __DIR__ . '/BaseController.php';

class EditoraController extends BaseController
{
    private EditoraService $editoraService;

    public function __construct(private PDO $pdo)
    {
        session_start();
        $this->editoraService = new EditoraService($pdo);
        header('Content-Type: application/json');
    }

    #[Route('/editoras', 'GET')]
    public function listar()
    {
        if (isset($_GET['id'])) {
            $editora = $this->editoraService->buscarPorId((int)$_GET['id']);
            if ($editora) {
                return $this->response(200, ['success' => true, 'data' => $editora->toArray()]);
            }
            return $this->response(404, ['success' => false, 'message' => 'Editora não encontrada']);
        }

        $editoras = $this->editoraService->listarTodos();
        return $this->response(200, [
            'success' => true,
            'data' => array_map(fn($e) => $e->toArray(), $editoras)
        ]);
    }

    #[Route('/editoras', 'POST')]
    public function criar()
    {
        if (!$this->isAdmin()) {
            return $this->response(403, ['success' => false, 'message' => 'Acesso negado. Apenas administradores podem criar editoras.']);
        }

        $data = $this->getJsonInput();

        try {
            $id = $this->editoraService->criar($data);
            return $this->response(201, [
                'success' => true,
                'message' => 'Editora cadastrada com sucesso',
                'id' => $id
            ]);
        } catch (Exception $e) {
            return $this->response(400, ['success' => false, 'message' => $e->getMessage()]);
        }
    }

    #[Route('/editoras', 'PUT')]
    public function atualizar()
    {
        if (!$this->isAdmin()) {
            return $this->response(403, ['success' => false, 'message' => 'Acesso negado. Apenas administradores podem atualizar editoras.']);
        }

        $data = $this->getJsonInput();

        try {
            $sucesso = $this->editoraService->atualizar($data);
            if ($sucesso) {
                return $this->response(200, ['success' => true, 'message' => 'Editora atualizada com sucesso']);
            }
            return $this->response(404, ['success' => false, 'message' => 'Editora não encontrada']);
        } catch (Exception $e) {
            return $this->response(400, ['success' => false, 'message' => $e->getMessage()]);
        }
    }

    #[Route('/editoras/{id}', 'DELETE')]
    public function excluir(int $id)
    {
        if (!$this->isAdmin()) {
            return $this->response(403, ['success' => false, 'message' => 'Acesso negado. Apenas administradores podem excluir editoras.']);
        }

        try {
            $this->editoraService->excluir($id);
            return $this->response(200, ['success' => true, 'message' => 'Editora removida com sucesso']);
        } catch (Exception $e) {
            return $this->response(500, ['success' => false, 'message' => $e->getMessage()]);
        }
    }
}
