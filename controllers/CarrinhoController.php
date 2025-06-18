<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../services/CarrinhoService.php';

class CarrinhoController extends BaseController
{
    private CarrinhoService $carrinhoService;

    public function __construct(private PDO $pdo)
    {
        session_start();
        $this->carrinhoService = new CarrinhoService($pdo);
    }

    #[Route('/carrinho', 'GET')]
    public function listar()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $usuarioId = $_SESSION['userId'];
        $itens = $this->carrinhoService->listarItens($usuarioId);

        return $this->response(200, [
            'status' => 'success',
            'data' => array_map(fn($item) => $item->toArray(), $itens)
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

        try {
            $this->carrinhoService->adicionarItem($usuarioId, $data);
            return $this->response(200, ['status' => 'success', 'message' => 'Livro adicionado ao carrinho com sucesso!']);
        } catch (Exception $e) {
            return $this->response(400, ['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    #[Route('/carrinho', 'PUT')]
    public function atualizar()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $data = $this->getJsonInput();
        $usuarioId = $_SESSION['userId'];

        try {
            $this->carrinhoService->atualizarItem($usuarioId, $data);
            return $this->response(200, ['status' => 'success', 'message' => 'Quantidade atualizada com sucesso.']);
        } catch (Exception $e) {
            return $this->response(400, ['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    #[Route('/carrinho', 'DELETE')]
    public function remover()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $data = $this->getJsonInput();
        $usuarioId = $_SESSION['userId'];

        try {
            $this->carrinhoService->removerItem($usuarioId, $data);
            return $this->response(200, ['status' => 'success', 'message' => 'Livro removido do carrinho com sucesso!']);
        } catch (Exception $e) {
            return $this->response(400, ['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
