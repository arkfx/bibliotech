<?php

namespace BiblioTech\Controllers;

use BiblioTech\Core\Route;
use BiblioTech\Core\AppFactory;
use BiblioTech\Services\PedidoService;
use Exception;

class PedidoController extends BaseController
{
    private PedidoService $pedidoService;

    public function __construct(private AppFactory $appFactory)
    {
        session_start();
        $this->pedidoService = $this->appFactory->createPedidoService();
    }

    #[Route('/pedido/finalizar', 'POST')]
    public function finalizar()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, [
                'status' => 'error',
                'message' => 'Usuário não autenticado.'
            ]);
        }

        $usuarioId = $_SESSION['userId'];
        $dadosFinalizacao = $this->getJsonInput();

        try {
            $resultado = $this->pedidoService->finalizarPedido($usuarioId, $dadosFinalizacao);

            return $this->response(200, [
                'status' => 'success',
                'message' => 'Pedido finalizado e confirmado com sucesso!',
                'pedido_id' => $resultado['pedido_id'],
                'total_pedido' => $resultado['total'],
                'valor_frete' => $resultado['valor_frete']
            ]);
        } catch (Exception $e) {
            return $this->response(400, [
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }

    #[Route('/pedido/confirmar', 'POST')]
    public function confirmar()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, [
                'status' => 'error',
                'message' => 'Usuário não autenticado.'
            ]);
        }

        $usuarioId = $_SESSION['userId'];

        $pedido = $this->pedidoService->confirmarPedido($usuarioId);

        if (!$pedido) {
            return $this->response(404, [
                'status' => 'error',
                'message' => 'Nenhum pedido pendente encontrado para confirmação.'
            ]);
        }

        return $this->response(200, [
            'status' => 'success',
            'message' => 'Pedido confirmado com sucesso.',
            'pedido_id' => $pedido->id
        ]);
    }

    #[Route('/pedido', 'GET')]
    public function listarPedidosDoUsuario()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, [
                'status' => 'error',
                'message' => 'Usuário não autenticado.'
            ]);
        }

        $usuarioId = $_SESSION['userId'];
        $pedidos = $this->pedidoService->listarPedidosDoUsuario($usuarioId);

        return $this->response(200, [
            'status' => 'success',
            'data' => $pedidos 
        ]);
    }

    #[Route('/pedido/{id}', 'GET')]
    public function buscarPedidoCompleto(int $id)
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, [
                'status' => 'error',
                'message' => 'Usuário não autenticado.'
            ]);
        }

        $pedido = $this->pedidoService->buscarPedidoCompleto($id);

        if (!$pedido) {
            return $this->response(404, [
                'status' => 'error',
                'message' => 'Pedido não encontrado.'
            ]);
        }

        return $this->response(200, [
            'status' => 'success',
            'data' => $pedido
        ]);
    }
}