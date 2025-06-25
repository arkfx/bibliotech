<?php

namespace BiblioTech\Controllers;

use BiblioTech\Core\Route;
use BiblioTech\Core\AppFactory;
use BiblioTech\Services\GeneroService;
use Exception;

class GeneroController extends BaseController
{
    private GeneroService $generoService;

    public function __construct(private AppFactory $appFactory)
    {
        session_start();
        $this->generoService = $this->appFactory->createGeneroService();
    }

    #[Route('/generos', 'GET')]
    public function listar()
    {
        try {
            if (isset($_GET['id'])) {
                $genero = $this->generoService->buscarPorId((int)$_GET['id']);
                if (!$genero) {
                    return $this->response(404, ['status' => 'error', 'message' => 'Gênero não encontrado.']);
                }
                return $this->response(200, ['status' => 'success', 'data' => $genero->toArray()]);
            }

            $generos = $this->generoService->listarTodos();
            return $this->response(200, [
                'status' => 'success',
                'data' => array_map(fn($g) => $g->toArray(), $generos)
            ]);
        } catch (Exception $e) {
            return $this->response(500, ['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    #[Route('/generos', 'POST')]
    public function criar()
    {
        if (!$this->isAdmin()) {
            return $this->response(403, ['status' => 'error', 'message' => 'Apenas administradores podem criar gêneros.']);
        }

        $data = $this->getJsonInput();

        try {
            $genero = $this->generoService->criar($data);
            return $this->response(201, ['status' => 'success', 'message' => 'Gênero criado com sucesso.', 'data' => $genero->toArray()]);
        } catch (Exception $e) {
            return $this->response(400, ['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    #[Route('/generos/{id}', 'GET')]
    public function buscar(int $id)
    {
        try {
            $genero = $this->generoService->buscarPorId($id);
            if (!$genero) {
                return $this->response(404, ['status' => 'error', 'message' => 'Gênero não encontrado.']);
            }

            return $this->response(200, ['status' => 'success', 'data' => $genero->toArray()]);
        } catch (Exception $e) {
            return $this->response(500, ['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    #[Route('/generos/{id}', 'PUT')]
    public function atualizar(int $id)
    {
        if (!$this->isAdmin()) {
            return $this->response(403, ['status' => 'error', 'message' => 'Apenas administradores podem atualizar gêneros.']);
        }

        $data = $this->getJsonInput();

        try {
            $genero = $this->generoService->atualizar($id, $data);
            return $this->response(200, ['status' => 'success', 'message' => 'Gênero atualizado com sucesso.', 'data' => $genero->toArray()]);
        } catch (Exception $e) {
            return $this->response(400, ['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    #[Route('/generos/{id}', 'DELETE')]
    public function excluir(int $id)
    {
        if (!$this->isAdmin()) {
            return $this->response(403, ['status' => 'error', 'message' => 'Apenas administradores podem excluir gêneros.']);
        }

        try {
            $this->generoService->excluir($id);
            return $this->response(200, ['status' => 'success', 'message' => 'Gênero excluído com sucesso.']);
        } catch (Exception $e) {
            return $this->response(500, ['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
