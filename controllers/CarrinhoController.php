<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../repositories/CarrinhoRepository.php';
require_once __DIR__ . '/../repositories/UsuarioRepository.php';
require_once __DIR__ . '/../models/Carrinho.php';

class CarrinhoController extends BaseController
{
    private CarrinhoRepository $repo;
    private UsuarioRepository $usuarioRepo;

    public function __construct(private PDO $pdo)
    {
        session_start();
        $this->repo = new CarrinhoRepository($pdo);
        $this->usuarioRepo = new UsuarioRepository($pdo);
    }

    #[Route('/carrinho', 'GET')]
    public function listar()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $usuarioId = $_SESSION['userId'];

        if (!$this->usuarioRepo->findById((int)$usuarioId)) {
            return $this->response(404, ['status' => 'error', 'message' => 'Usuário não encontrado.']);
        }

        $items = $this->repo->listarPorUsuario((int)$usuarioId);

        return $this->response(200, [
            'status' => 'success',
            'data' => array_map(fn($item) => $item instanceof Carrinho ? $item->toArray() : $item, $items)
        ]);
    }

    #[Route('/carrinho', 'POST')]
    public function adicionar()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $data = $this->getJsonInput();
        $usuarioId = $_SESSION['userId'];

        if (!isset($data['id'], $data['quantidade'])) {
            return $this->response(400, ['status' => 'error', 'message' => 'ID do livro e quantidade são obrigatórios.']);
        }

        if (!$this->usuarioRepo->findById((int)$usuarioId)) {
            return $this->response(404, ['status' => 'error', 'message' => 'Usuário não encontrado.']);
        }

        $carrinho = new Carrinho([
            'livro_id' => (int)$data['id'],
            'usuario_id' => (int)$usuarioId,
            'quantidade' => (int)$data['quantidade'],
        ]);

        if ($this->repo->adicionar($carrinho)) {
            return $this->response(200, ['status' => 'success', 'message' => 'Livro adicionado ao carrinho com sucesso!']);
        }

        return $this->response(400, ['status' => 'error', 'message' => 'Erro ao adicionar livro ao carrinho.']);
    }

    #[Route('/carrinho', 'PUT')]
    public function atualizar()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $data = $this->getJsonInput();
        $usuarioId = $_SESSION['userId'];

        if (!isset($data['id'], $data['quantidade'])) {
            return $this->response(400, ['status' => 'error', 'message' => 'ID do livro e nova quantidade são obrigatórios.']);
        }

        $carrinho = new Carrinho([
            'livro_id' => (int)$data['id'],
            'usuario_id' => (int)$usuarioId,
            'quantidade' => (int)$data['quantidade'],
        ]);

        if ($this->repo->atualizarQuantidade($carrinho)) {
            return $this->response(200, ['status' => 'success', 'message' => 'Quantidade atualizada com sucesso.']);
        }

        return $this->response(404, ['status' => 'error', 'message' => 'Falha ao atualizar quantidade.']);
    }

    #[Route('/carrinho', 'DELETE')]
    public function remover()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $data = $this->getJsonInput();
        $usuarioId = $_SESSION['userId'];

        if (!isset($data['id'])) {
            return $this->response(400, ['status' => 'error', 'message' => 'ID do livro é obrigatório.']);
        }

        if ($this->repo->remover((int)$usuarioId, (int)$data['id'])) {
            return $this->response(200, ['status' => 'success', 'message' => 'Livro removido do carrinho com sucesso!']);
        }

        return $this->response(404, ['status' => 'error', 'message' => 'Erro ao remover livro do carrinho.']);
    }
}
