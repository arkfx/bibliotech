<?php

require_once __DIR__ . '/../routing/Route.php';
require_once __DIR__ . '/../services/LivroService.php';
require_once __DIR__ . '/../models/Livro.php';
require_once __DIR__ . '/BaseController.php';

class LivroController extends BaseController
{
    private LivroService $livroService;

    public function __construct(private PDO $pdo)
    {
        session_start();
        $this->livroService = new LivroService($pdo);
    }

    #[Route('/livros', 'GET')]
    public function listar()
    {
        $termo = $_GET['q'] ?? null;
        $genero_id = isset($_GET['genero_id']) ? (int)$_GET['genero_id'] : null;
        $ordem = isset($_GET['ordem']) && in_array(strtoupper($_GET['ordem']), ['ASC', 'DESC']) ? strtoupper($_GET['ordem']) : 'DESC';

        $pagina = isset($_GET['pagina']) ? max((int)$_GET['pagina'], 1) : 1;
        $limite = isset($_GET['limite']) ? max((int)$_GET['limite'], 1) : 6;
        $offset = ($pagina - 1) * $limite;

        $livros = $this->livroService->listar($termo, $genero_id, $ordem, $limite, $offset);
        $total = $this->livroService->contar($termo, $genero_id);

        return $this->response(200, [
            'status' => 'success',
            'data' => array_map(fn($l) => $l->toArray(), $livros),
            'paginacao' => [
                'pagina' => $pagina,
                'limite' => $limite,
                'total' => $total,
                'totalPaginas' => ceil($total / $limite),
            ]
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
