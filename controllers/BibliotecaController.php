<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../repositories/BibliotecaRepository.php';

class BibliotecaController extends BaseController
{
    private BibliotecaRepository $bibliotecaRepository;

    public function __construct(private PDO $pdo)
    {
        session_start();
        $this->bibliotecaRepository = new BibliotecaRepository($pdo);
    }

    #[Route('/biblioteca', 'GET')]
    public function listarLivrosDaBiblioteca()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, [
                'status' => 'error',
                'message' => 'Usuário não autenticado. Faça login para ver sua biblioteca.'
            ]);
        }

        $usuarioId = $_SESSION['userId'];

        try {
            $livrosDaBiblioteca = $this->bibliotecaRepository->listarPorUsuario($usuarioId);

            if (empty($livrosDaBiblioteca)) {
                return $this->response(200, [
                    'status' => 'success',
                    'message' => 'Sua biblioteca está vazia.',
                    'data' => []
                ]);
            }

            return $this->response(200, [
                'status' => 'success',
                'data' => $livrosDaBiblioteca
            ]);
        } catch (Exception $e) {
            error_log("Erro ao buscar livros da biblioteca: " . $e->getMessage());
            return $this->response(500, [
                'status' => 'error',
                'message' => 'Erro ao buscar os livros da biblioteca.'
            ]);
        }
    }

    #[Route('/biblioteca/ler/{id}', 'GET')]
    public function lerLivro(int $id)
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, [
                'status' => 'error',
                'message' => 'Usuário não autenticado.'
            ]);
        }

        $usuarioId = $_SESSION['userId'];

        try {
            $livro = $this->bibliotecaRepository->buscarLivroDaBiblioteca($usuarioId, $id);

            if (!$livro) {
                return $this->response(403, [
                    'status' => 'error',
                    'message' => 'Você não tem acesso a este livro.'
                ]);
            }

            if (empty($livro->pdf_url)) {
                return $this->response(404, [
                    'status' => 'error',
                    'message' => 'Este livro não possui PDF disponível.'
                ]);
            }

            return $this->response(200, [
                'status' => 'success',
                'data' => [
                    'pdf_url' => $livro->pdf_url
                ]
            ]);
        } catch (Exception $e) {
            error_log("Erro ao tentar acessar livro da biblioteca: " . $e->getMessage());
            return $this->response(500, [
                'status' => 'error',
                'message' => 'Erro ao acessar o livro.'
            ]);
        }
    }
}
