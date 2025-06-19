<?php

namespace BiblioTech\Controllers;
use BiblioTech\Core\Route;
use BiblioTech\Core\AppFactory;
use BiblioTech\Services\ProgressoLeituraService;
use Exception;


class ProgressoLeituraController extends BaseController
{
    private ProgressoLeituraService $progressService;

    public function __construct(private AppFactory $appFactory)
    {
        session_start();
        $this->progressService = $this->appFactory->createProgressoLeituraService();
    }

    #[Route('/progresso-leitura', 'POST')]
    public function saveProgress()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, [
                'status' => 'error',
                'message' => 'Usuário não autenticado.'
            ]);
        }

        $data = $this->getJsonInput();
        $usuarioId = $_SESSION['userId'];

        try {
            $sucesso = $this->progressService->salvar($data, $usuarioId);
            if ($sucesso) {
                return $this->response(200, ['status' => 'success', 'message' => 'Progresso salvo com sucesso.']);
            }
            return $this->response(500, ['status' => 'error', 'message' => 'Erro ao salvar progresso.']);
        } catch (Exception $e) {
            return $this->response(400, ['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    #[Route('/progresso-leitura/{livroId}', 'GET')]
    public function getProgress(int $livroId)
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, [
                'status' => 'error',
                'message' => 'Usuário não autenticado.'
            ]);
        }

        $usuarioId = $_SESSION['userId'];
        $progress = $this->progressService->buscarPorLivro($usuarioId, $livroId);

        if ($progress) {
            return $this->response(200, ['status' => 'success', 'data' => $progress->toArray()]);
        }

        return $this->response(404, ['status' => 'error', 'message' => 'Progresso não encontrado.']);
    }

    #[Route('/livros-em-progresso', 'GET')]
    public function getBooksInProgress()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, [
                'status' => 'error',
                'message' => 'Usuário não autenticado.'
            ]);
        }

        $usuarioId = $_SESSION['userId'];
        $books = $this->progressService->livrosEmProgresso($usuarioId);

        return $this->response(200, ['status' => 'success', 'data' => $books]);
    }

    #[Route('/livros-lidos-recentemente', 'GET')]
    public function getRecentlyReadBooks()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, [
                'status' => 'error',
                'message' => 'Usuário não autenticado.'
            ]);
        }

        $usuarioId = $_SESSION['userId'];
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;
        $books = $this->progressService->livrosRecentes($usuarioId, $limit);

        return $this->response(200, ['status' => 'success', 'data' => $books]);
    }

    #[Route('/progresso-leitura/{livroId}', 'DELETE')]
    public function deleteProgress(int $livroId)
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, [
                'status' => 'error',
                'message' => 'Usuário não autenticado.'
            ]);
        }

        $usuarioId = $_SESSION['userId'];
        $sucesso = $this->progressService->excluir($usuarioId, $livroId);

        if ($sucesso) {
            return $this->response(200, ['status' => 'success', 'message' => 'Progresso removido com sucesso.']);
        }

        return $this->response(500, ['status' => 'error', 'message' => 'Erro ao remover progresso.']);
    }
}
