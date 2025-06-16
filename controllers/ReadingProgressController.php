<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../services/ReadingProgressService.php';

class ReadingProgressController extends BaseController
{
    private ProgressoLeituraService $progressService;

    public function __construct(private PDO $pdo)
    {
        session_start();
        $this->progressService = new ProgressoLeituraService($pdo);
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

        $result = $this->progressService->saveProgress($usuarioId, $data);
        return $this->response($result['statusCode'], $result['body']);
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
        $result = $this->progressService->getProgress($usuarioId, $livroId);
        return $this->response($result['statusCode'], $result['body']);
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
        $result = $this->progressService->getBooksInProgress($usuarioId);
        return $this->response($result['statusCode'], $result['body']);
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
        $result = $this->progressService->getRecentlyReadBooks($usuarioId, $limit);
        return $this->response($result['statusCode'], $result['body']);
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
        $result = $this->progressService->deleteProgress($usuarioId, $livroId);
        return $this->response($result['statusCode'], $result['body']);
    }
}
