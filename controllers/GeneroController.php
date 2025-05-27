<?php

require_once __DIR__ . '/../routing/Route.php';
require_once __DIR__ . '/../repositories/GeneroRepository.php';
require_once __DIR__ . '/../models/Genero.php';

class GeneroController extends BaseController
{
    private GeneroRepository $repo;

    public function __construct(private PDO $pdo)
    {
        session_start();
        $this->repo = new GeneroRepository($pdo);
    }

    #[Route('/generos', 'GET')]
    public function listar()
    {
        if (isset($_GET['id'])) {
            $genero = $this->repo->findById((int)$_GET['id']);
            if ($genero) {
                return $this->response(200, ['status' => 'success', 'data' => $genero->toArray()]);
            }
            return $this->response(404, ['status' => 'error', 'message' => 'Gênero não encontrado.']);
        }

        $generos = $this->repo->findAll();
        return $this->response(200, [
            'status' => 'success',
            'data' => array_map(fn($g) => $g->toArray(), $generos)
        ]);
    }

    #[Route('/generos/{id}', 'GET')]
    public function buscar(int $id)
    {
        $genero = $this->repo->findById($id);
        if ($genero) {
            return $this->response(200, ['status' => 'success', 'data' => $genero->toArray()]);
        }
        return $this->response(404, ['status' => 'error', 'message' => 'Gênero não encontrado.']);
    }

    #[Route('/generos', 'POST')]
    public function criar()
    {
        if (!$this->isAdmin()) {
            return $this->response(403, ['status' => 'error', 'message' => 'Acesso negado. Apenas administradores podem criar gêneros.']);
        }

        $data = $this->getJsonInput();
        if (!isset($data['nome']) || empty(trim($data['nome']))) {
            return $this->response(400, ['status' => 'error', 'message' => 'Nome do gênero é obrigatório.']);
        }

        $genero = new Genero(['nome' => $data['nome']]);
        $this->repo->save($genero);

        return $this->response(201, ['status' => 'success', 'message' => 'Gênero criado com sucesso.']);
    }

    #[Route('/generos/{id}', 'DELETE')]
    public function excluir(int $id)
    {
        if (!$this->isAdmin()) {
            return $this->response(403, ['status' => 'error', 'message' => 'Acesso negado. Apenas administradores podem excluir gêneros.']);
        }

        try {
            $this->repo->delete($id);
            return $this->response(200, ['status' => 'success', 'message' => 'Gênero excluído com sucesso.']);
        } catch (Exception $e) {
            return $this->response(500, ['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
