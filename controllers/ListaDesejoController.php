<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../repositories/ListaDesejoRepository.php';

class ListaDesejoController extends BaseController
{
    private ListaDesejosRepository $repo;

    public function __construct(private PDO $pdo)
    {
        session_start();
        $this->repo = new ListaDesejosRepository($pdo);
    }

    #[Route('/desejos', 'POST')]
    public function adicionar()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $data = $this->getJsonInput();
        $usuarioId = $_SESSION['userId'];

        if (!isset($data['livro_id'])) {
            return $this->response(400, ['status' => 'error', 'message' => 'ID do livro é obrigatório.']);
        }

        try {
            $this->repo->add($usuarioId, $data['livro_id']);
            return $this->response(201, ['status' => 'success', 'message' => 'Livro adicionado com sucesso!']);
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

        if (!isset($data['livro_id'])) {
            return $this->response(400, ['status' => 'error', 'message' => 'ID do livro é obrigatório.']);
        }

        try {
            $removido = $this->repo->remove($usuarioId, $data['livro_id']);

            if ($removido) {
                return $this->response(200, ['status' => 'success', 'message' => 'Livro removido com sucesso!']);
            }
            return $this->response(404, ['status' => 'error', 'message' => 'Livro não encontrado na lista de desejos.']);
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
                $existe = $this->repo->exists((int)$usuarioId, (int)$livroId);
                return $this->response(200, ['status' => 'success', 'exists' => $existe]);
            }

            $livros = $this->repo->listByUsuario((int)$usuarioId);
            return $this->response(200, [
                'status' => 'success',
                'data' => array_map(fn($l) => $l->toArray(), $livros)
            ]);
        } catch (Exception $e) {
            return $this->response(500, ['status' => 'error', 'message' => 'Erro ao buscar lista de desejos: ' . $e->getMessage()]);
        }
    }
}
