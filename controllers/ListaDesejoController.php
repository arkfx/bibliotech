<?php

namespace BiblioTech\Controllers;

use BiblioTech\Core\Route;
use BiblioTech\Core\AppFactory;
use BiblioTech\Services\ListaDesejoService;
use InvalidArgumentException;
use Exception;
use PDOException;


class ListaDesejoController extends BaseController
{
    private ListaDesejoService $service;

    public function __construct(private AppFactory $appFactory)
    {
        session_start();
        $this->service = $this->appFactory->createListaDesejoService();
    }
    

    #[Route('/desejos', 'POST')]
    public function adicionar()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $data = $this->getJsonInput();
        $usuarioId = $_SESSION['userId'];

        try {
            $this->service->adicionar($usuarioId, (int)($data['livro_id'] ?? 0));
            return $this->response(201, ['status' => 'success', 'message' => 'Livro adicionado com sucesso!']);
        } catch (InvalidArgumentException $e) {
            return $this->response(400, ['status' => 'error', 'message' => $e->getMessage()]);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                return $this->response(409, ['status' => 'error', 'message' => 'Livro já está na lista de desejos.']);
            }
            return $this->response(500, ['status' => 'error', 'message' => 'Erro interno: ' . $e->getMessage()]);
        }
    }

    #[Route('/desejos', 'DELETE')]
    public function remover()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $data = $this->getJsonInput();
        $usuarioId = $_SESSION['userId'];

        try {
            $removido = $this->service->remover($usuarioId, (int)($data['livro_id'] ?? 0));
            if ($removido) {
                return $this->response(200, ['status' => 'success', 'message' => 'Livro removido com sucesso!']);
            }
            return $this->response(404, ['status' => 'error', 'message' => 'Livro não encontrado na lista de desejos.']);
        } catch (InvalidArgumentException $e) {
            return $this->response(400, ['status' => 'error', 'message' => $e->getMessage()]);
        } catch (Exception $e) {
            return $this->response(500, ['status' => 'error', 'message' => 'Erro ao remover livro: ' . $e->getMessage()]);
        }
    }

    #[Route('/desejos', 'GET')]
    public function listar()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $usuarioId = $_SESSION['userId'];
        $livroId = $_GET['livro_id'] ?? null;

        try {
            if ($livroId !== null) {
                $existe = $this->service->existe($usuarioId, (int)$livroId);
                return $this->response(200, ['status' => 'success', 'exists' => $existe]);
            }

            $livros = $this->service->listar($usuarioId);
            return $this->response(200, [
                'status' => 'success',
                'data' => array_map(fn($l) => $l->toArray(), $livros)
            ]);
        } catch (Exception $e) {
            return $this->response(500, ['status' => 'error', 'message' => 'Erro ao buscar lista de desejos: ' . $e->getMessage()]);
        }
    }
}
