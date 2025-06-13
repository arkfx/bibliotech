<?php

require_once __DIR__ . '/../routing/Route.php';
require_once __DIR__ . '/../repositories/EditoraRepository.php';
require_once __DIR__ . '/../models/Editora.php';

class EditoraController extends BaseController
{
    private EditoraRepository $repo;

    public function __construct(private PDO $pdo)
    {
        session_start();
        $this->repo = new EditoraRepository($pdo);
        header('Content-Type: application/json');
    }

    #[Route('/editoras', 'GET')]
    public function listar()
    {
        if (isset($_GET['id'])) {
            $editora = $this->repo->findById((int)$_GET['id']);
            if ($editora) {
                return $this->response(200, ['success' => true, 'data' => $editora->toArray()]);
            }
            return $this->response(404, ['success' => false, 'message' => 'Editora não encontrada']);
        }

        $editoras = $this->repo->findAll();
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
        if (empty($data['nome'])) {
            return $this->response(400, ['success' => false, 'message' => 'Nome da editora é obrigatório']);
        }

        if ($this->repo->existsByName($data['nome'])) {
            return $this->response(409, ['success' => false, 'message' => 'Editora já existente']);
        }

        $id = $this->repo->save(new Editora(['nome' => $data['nome']]));
        return $this->response(201, ['success' => true, 'message' => 'Editora cadastrada com sucesso', 'id' => $id]);
    }

    #[Route('/editoras', 'PUT')]
    public function atualizar()
    {
        if (!$this->isAdmin()) {
            return $this->response(403, ['success' => false, 'message' => 'Acesso negado. Apenas administradores podem atualizar editoras.']);
        }

        $data = $this->getJsonInput();

        if (empty($data['id']) || empty($data['nome'])) {
            return $this->response(400, ['success' => false, 'message' => 'ID e nome da editora são obrigatórios']);
        }

        if ($this->repo->existsByName($data['nome'])) {
            return $this->response(404, ['success' => false, 'message' => 'Editora já existente']);
        }

        $result = $this->repo->update(new Editora($data));
        if ($result) {
            return $this->response(200, ['success' => true, 'message' => 'Editora atualizada com sucesso']);
        }
        return $this->response(404, ['success' => false, 'message' => 'Editora não encontrada']);
    }

    #[Route('/editoras/{id}', 'DELETE')]
    public function excluir(int $id)
    {
        if (!$this->isAdmin()) {
            return $this->response(403, ['success' => false, 'message' => 'Acesso negado. Apenas administradores podem excluir editoras.']);
        }

        try {
            $this->repo->delete($id);
            return $this->response(200, ['success' => true, 'message' => 'Editora removida com sucesso']);
        } catch (Exception $e) {
            return $this->response(500, ['success' => false, 'message' => $e->getMessage()]);
        }
    }
}
