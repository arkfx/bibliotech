<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../repositories/ReadingProgressRepository.php';

class ReadingProgressController extends BaseController
{
    private ReadingProgressRepository $progressRepository;

    public function __construct(private PDO $pdo)
    {
        session_start();
        $this->progressRepository = new ReadingProgressRepository($pdo);
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

        // Validação dos dados de entrada
        if (!isset($data['livro_id'], $data['current_page'], $data['total_pages'], $data['progress_percentage'])) {
            return $this->response(400, [
                'status' => 'error',
                'message' => 'Dados obrigatórios faltando.'
            ]);
        }

        $progress = new ReadingProgress([
            'usuario_id' => $usuarioId,
            'livro_id' => (int)$data['livro_id'],
            'current_page' => (int)$data['current_page'],
            'total_pages' => (int)$data['total_pages'],
            'progress_percentage' => (float)$data['progress_percentage']
        ]);

        if ($this->progressRepository->saveProgress($progress)) {
            return $this->response(200, [
                'status' => 'success',
                'message' => 'Progresso salvo com sucesso.'
            ]);
        }

        return $this->response(500, [
            'status' => 'error',
            'message' => 'Erro ao salvar progresso.'
        ]);
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
        $progress = $this->progressRepository->getProgress($usuarioId, $livroId);

        if ($progress) {
            return $this->response(200, [
                'status' => 'success',
                'data' => $progress->toArray()
            ]);
        }

        return $this->response(404, [
            'status' => 'error',
            'message' => 'Progresso não encontrado.'
        ]);
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
        $booksInProgress = $this->progressRepository->getBooksInProgress($usuarioId);

        return $this->response(200, [
            'status' => 'success',
            'data' => $booksInProgress
        ]);
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
        $recentBooks = $this->progressRepository->getRecentlyReadBooks($usuarioId, $limit);

        return $this->response(200, [
            'status' => 'success',
            'data' => $recentBooks
        ]);
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

        if ($this->progressRepository->deleteProgress($usuarioId, $livroId)) {
            return $this->response(200, [
                'status' => 'success',
                'message' => 'Progresso removido com sucesso.'
            ]);
        }

        return $this->response(500, [
            'status' => 'error',
            'message' => 'Erro ao remover progresso.'
        ]);
    }
} 