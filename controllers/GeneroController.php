<?php

require_once __DIR__ . '/../routing/Route.php';
require_once __DIR__ . '/../services/GeneroService.php';
require_once __DIR__ . '/../models/Genero.php';
require_once __DIR__ . '/BaseController.php';

class GeneroController extends BaseController
{
    private GeneroService $generoService;

    public function __construct(private PDO $pdo)
    {
        session_start();
        $this->generoService = new GeneroService($pdo);
    }

    #[Route('/generos', 'GET')]
    public function listar()
    {
        if (isset($_GET['id'])) {
            $genero = $this->generoService->buscarPorId((int)$_GET['id']);
            if ($genero) {
                return $this->response(200, ['status' => 'success', 'data' => $genero->toArray()]);
            }
            return $this->response(404, ['status' => 'error', 'message' => 'Gênero não encontrado.']);
        }

        $generos = $this->generoService->listarTodos();
        return $this->response(200, [
            'status' => 'success',
            'data' => array_map(fn($g) => $g->toArray(), $generos)
        ]);
    }

    #[Route('/generos/{id}', 'GET')]
    public function buscar(int $id)
    {
        $genero = $this->generoService->buscarPorId($id);
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

        $input = $this->getJsonInput();
        $genero = new Genero((object)$input);

        try {
            $this->generoService->criar($genero);
            return $this->response(201, ['status' => 'success', 'message' => 'Gênero criado com sucesso.']);
        } catch (Exception $e) {
            return $this->response(400, ['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    #[Route('/generos/{id}', 'DELETE')]
    public function excluir(int $id)
    {
        if (!$this->isAdmin()) {
            return $this->response(403, ['status' => 'error', 'message' => 'Acesso negado. Apenas administradores podem excluir gêneros.']);
        }

        try {
            $this->generoService->excluir($id);
            return $this->response(200, ['status' => 'success', 'message' => 'Gênero excluído com sucesso.']);
        } catch (Exception $e) {
            return $this->response(500, ['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
