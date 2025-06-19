<?php

namespace BiblioTech\Controllers;

use BiblioTech\Core\Route;
use BiblioTech\Core\AppFactory;
use BiblioTech\Models\Livro;
use BiblioTech\Services\LivroService;
use Exception;

class LivroController extends BaseController
{
    private LivroService $livroService;

    public function __construct(private AppFactory $appFactory)
    {
        session_start();
        $this->livroService = $this->appFactory->createLivroService();
    }

    #[Route('/livros', 'GET')]
    public function listar()
    {
        $termo = $_GET['q'] ?? null;
        $genero_id = isset($_GET['genero_id']) ? (int)$_GET['genero_id'] : null;
        $ordem = isset($_GET['ordem']) && in_array(strtoupper($_GET['ordem']), ['ASC', 'DESC']) ? strtoupper($_GET['ordem']) : 'DESC';

        $livros = $this->livroService->listar($termo, $genero_id, $ordem);

        return $this->response(200, [
            'status' => 'success',
            'data' => array_map(fn($l) => $l->toArray(), $livros)
        ]);
    }

    #[Route('/livros/{id}', 'GET')]
    public function buscar(int $id)
    {
        $livro = $this->livroService->buscar($id);

        if ($livro) {
            return $this->response(200, ['status' => 'success', 'data' => $livro->toArray()]);
        }

        return $this->response(404, ['status' => 'error', 'message' => 'Livro não encontrado.']);
    }

    #[Route('/livros', 'POST')]
    public function criar()
    {
        if (!$this->isAdmin()) {
            return $this->response(403, ['status' => 'error', 'message' => 'Acesso negado. Apenas administradores podem realizar essa ação.']);
        }

        $input = $this->getJsonInput();
        $livro = new Livro((object)$input);

        try {
            $this->livroService->criar($livro);
            return $this->response(201, ['status' => 'success', 'message' => 'Livro cadastrado com sucesso!']);
        } catch (Exception $e) {
            return $this->response(400, ['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    #[Route('/livros', 'PUT')]
    public function atualizar()
    {
        if (!$this->isAdmin()) {
            return $this->response(403, ['status' => 'error', 'message' => 'Acesso negado. Apenas administradores podem realizar essa ação.']);
        }

        $input = $this->getJsonInput();
        $livro = new Livro((object)$input);

        try {
            $this->livroService->atualizar($livro);
            return $this->response(200, ['status' => 'success', 'message' => 'Livro atualizado com sucesso!']);
        } catch (Exception $e) {
            return $this->response(400, ['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    #[Route('/livros/{id}', 'DELETE')]
    public function excluir(int $id)
    {
        if (!$this->isAdmin()) {
            return $this->response(403, ['status' => 'error', 'message' => 'Acesso negado. Apenas administradores podem realizar essa ação.']);
        }

        try {
            $this->livroService->excluir($id);
            return $this->response(200, ['status' => 'success', 'message' => 'Livro excluído com sucesso!']);
        } catch (Exception $e) {
            return $this->response(404, ['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
