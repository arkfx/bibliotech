<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../repositories/PedidoRepository.php';
require_once __DIR__ . '/../repositories/PedidoItemRepository.php';
require_once __DIR__ . '/../repositories/CarrinhoRepository.php';
require_once __DIR__ . '/../repositories/LivroRepository.php';
require_once __DIR__ . '/../repositories/BibliotecaRepository.php';
require_once __DIR__ . '/../models/Pedido.php';
require_once __DIR__ . '/../models/Biblioteca.php';
require_once __DIR__ . '/../models/PedidoItem.php';

class PedidoController extends BaseController
{
    private PedidoRepository $pedidoRepository;
    private PedidoItemRepository $itemRepository;
    private CarrinhoRepository $carrinhoRepository;
    private LivroRepository $livroRepository;
    private BibliotecaRepository $bibliotecaRepository;

    public function __construct(private PDO $pdo)
    {
        session_start();
        $this->pedidoRepository = new PedidoRepository($pdo);
        $this->itemRepository = new PedidoItemRepository($pdo);
        $this->carrinhoRepository = new CarrinhoRepository($pdo);
        $this->livroRepository = new LivroRepository($pdo);
        $this->bibliotecaRepository = new BibliotecaRepository($pdo);
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
        $carrinhoItens = $this->carrinhoRepository->listarPorUsuario($usuarioId);

        if (empty($carrinhoItens)) {
            return $this->response(400, [
                'status' => 'error',
                'message' => 'Carrinho vazio.'
            ]);
        }

        $subtotalPedido = 0.00;
        $contemItemFisico = false;
        $itensPedidoParaSalvar = []; // Itens que realmente farão parte do pedido

        foreach ($carrinhoItens as $itemCarrinho) {
            $livroId = is_array($itemCarrinho) ? $itemCarrinho['livro_id'] : $itemCarrinho->livro_id;
            $quantidade = is_array($itemCarrinho) ? $itemCarrinho['quantidade'] : $itemCarrinho->quantidade;
            $tipo = is_array($itemCarrinho) ? $itemCarrinho['tipo'] : $itemCarrinho->tipo;
            
            $livro = $this->livroRepository->findById($livroId);

            if (!$livro) {
                error_log("Livro com ID $livroId não encontrado durante finalização do pedido para usuário $usuarioId.");
                return $this->response(400, [
                    'status' => 'error',
                    'message' => "Um dos livros no seu carrinho (ID: $livroId) não foi encontrado. Por favor, remova-o e tente novamente."
                ]);
            }

            // Lógica para e-books: verificar se já existe na biblioteca
            if ($tipo === 'ebook') {
                $itemBiblioteca = new Biblioteca(['usuario_id' => $usuarioId, 'livro_id' => $livroId]);
                if ($this->bibliotecaRepository->existeNaBiblioteca($itemBiblioteca)) {
                    continue; // Pula para o próximo item do carrinho
                }
                $this->bibliotecaRepository->adicionarLivro($itemBiblioteca);
            }
            
            if ($tipo === 'fisico') {
                $contemItemFisico = true;
            }

            $subtotalItemUnico = $livro->preco * $quantidade;
            $subtotalPedido += $subtotalItemUnico;

            $itensPedidoParaSalvar[] = new PedidoItem([
                'livro_id' => $livroId,
                'quantidade' => $quantidade,
                'preco_unitario' => $livro->preco,
                'tipo' => $tipo,
            ]);
        }
        
        if (empty($itensPedidoParaSalvar)) {
            return $this->response(400, [
                'status' => 'error',
                'message' => 'Nenhum item válido para processar no pedido. Verifique se você já possui os e-books selecionados.'
            ]);
        }

        // Calcula o frete
        $valorFrete = $contemItemFisico ? 24.99 : 0.00;
        $totalFinalPedido = $subtotalPedido + $valorFrete;

        $pedido = new Pedido([
            'usuario_id' => $usuarioId,
            'total' => $totalFinalPedido,
            'status' => 'confirmado' ,
            'valor_frete' => $valorFrete 
        ]);

        $pedidoId = $this->pedidoRepository->criar($pedido);

        if (!$pedidoId) {
             return $this->response(500, [
                'status' => 'error',
                'message' => 'Erro ao criar o registro do pedido.'
            ]);
        }

        foreach ($itensPedidoParaSalvar as $item) {
            $item->pedido_id = $pedidoId;
            if (!$this->itemRepository->criar($item)) {
                error_log("Falha ao criar item para o pedido ID $pedidoId: Livro ID {$item->livro_id}");
                return $this->response(500, [
                    'status' => 'error',
                    'message' => 'Erro ao salvar os itens do pedido.'
                ]);
            }
        }

        $this->carrinhoRepository->limparCarrinho($usuarioId);

        return $this->response(200, [
            'status' => 'success',
            'message' => 'Pedido finalizado e confirmado com sucesso!',
            'pedido_id' => $pedidoId,
            'total_pedido' => $totalFinalPedido,
            'valor_frete' => $valorFrete   
        ]);
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

        $pedido = $this->pedidoRepository->buscarPedidoPendenteDoUsuario($usuarioId);

        if (!$pedido) {
            return $this->response(404, [
                'status' => 'error',
                'message' => 'Nenhum pedido pendente encontrado para confirmação.'
            ]);
        }

        $this->pedidoRepository->atualizarStatus($pedido->id, 'confirmado');

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
        $pedidos = $this->pedidoRepository->buscarPorUsuario($usuarioId);

        // Para cada pedido, busque os itens/livros
        foreach ($pedidos as &$pedido) {
            $pedidoId = is_object($pedido) ? $pedido->id : $pedido['id'];
            $itens = $this->itemRepository->buscarPorPedido($pedidoId);
            if (is_object($pedido)) {
                $pedido->itens = $itens;
            } else {
                $pedido['itens'] = $itens;
            }
        }

        return $this->response(200, [
            'status' => 'success',
            'data' => array_map(fn($p) => $p->toArray(), $pedidos)
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

        $pedido = $this->pedidoRepository->buscarPedidoCompletoPorId($id);

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
