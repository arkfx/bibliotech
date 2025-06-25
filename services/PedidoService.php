<?php

namespace BiblioTech\Services;

use BiblioTech\Models\Pedido;
use BiblioTech\Models\PedidoItem;
use BiblioTech\Models\Biblioteca;
use BiblioTech\Repositories\PedidoRepository;
use BiblioTech\Repositories\PedidoItemRepository;
use BiblioTech\Repositories\CarrinhoRepository;
use BiblioTech\Repositories\LivroRepository;
use BiblioTech\Repositories\BibliotecaRepository;
use Exception;

class PedidoService
{
    private PedidoRepository $pedidoRepository;
    private PedidoItemRepository $itemRepository;
    private CarrinhoRepository $carrinhoRepository;
    private LivroRepository $livroRepository;
    private BibliotecaRepository $bibliotecaRepository;

    public function __construct(
        PedidoRepository $pedidoRepository,
        PedidoItemRepository $itemRepository,
        CarrinhoRepository $carrinhoRepository,
        LivroRepository $livroRepository,
        BibliotecaRepository $bibliotecaRepository
    ) {
        $this->pedidoRepository = $pedidoRepository;
        $this->itemRepository = $itemRepository;
        $this->carrinhoRepository = $carrinhoRepository;
        $this->livroRepository = $livroRepository;
        $this->bibliotecaRepository = $bibliotecaRepository;
    }

    public function finalizarPedido(int $usuarioId, array $dadosFinalizacao = []): array
    {
        $carrinhoItens = $this->carrinhoRepository->listarPorUsuario($usuarioId);
        if (empty($carrinhoItens)) {
            throw new Exception('Carrinho vazio.');
        }

        $subtotalPedido = 0.00;
        $contemItemFisico = false;
        $itensPedidoParaSalvar = [];

        foreach ($carrinhoItens as $itemCarrinho) {
            $livroId = is_array($itemCarrinho) ? $itemCarrinho['livro_id'] : $itemCarrinho->livro_id;
            $quantidade = is_array($itemCarrinho) ? $itemCarrinho['quantidade'] : $itemCarrinho->quantidade;
            $tipo = is_array($itemCarrinho) ? $itemCarrinho['tipo'] : $itemCarrinho->tipo;

            $livro = $this->livroRepository->findById($livroId);
            if (!$livro) {
                throw new Exception("Livro ID $livroId não encontrado.");
            }

            if ($tipo === 'ebook') {
                $itemBiblioteca = new Biblioteca(['usuario_id' => $usuarioId, 'livro_id' => $livroId]);
                if ($this->bibliotecaRepository->existeNaBiblioteca($itemBiblioteca)) {
                    continue;
                }
                $this->bibliotecaRepository->adicionarLivro($itemBiblioteca);
            }

            if ($tipo === 'fisico') {
                $contemItemFisico = true;
            }

            $subtotalPedido += $livro->preco * $quantidade;

            $itensPedidoParaSalvar[] = new PedidoItem([
                'livro_id' => $livroId,
                'quantidade' => $quantidade,
                'preco_unitario' => $livro->preco,
                'tipo' => $tipo,
            ]);
        }

        if (empty($itensPedidoParaSalvar)) {
            throw new Exception('Nenhum item válido no pedido.');
        }

        $valorFrete = $contemItemFisico ? 24.99 : 0.00;
        $total = $subtotalPedido + $valorFrete;

        // Dados básicos do pedido
        $dadosPedido = [
            'usuario_id' => $usuarioId,
            'total' => $total,
            'status' => 'confirmado',
            'valor_frete' => $valorFrete,
        ];

        // MODIFICAÇÃO: Só incluir endereço se há itens físicos E se foi fornecido
        if ($contemItemFisico && isset($dadosFinalizacao['endereco_id']) && $dadosFinalizacao['endereco_id']) {
            $dadosPedido['endereco_id'] = (int) $dadosFinalizacao['endereco_id'];
        } elseif ($contemItemFisico && (!isset($dadosFinalizacao['endereco_id']) || !$dadosFinalizacao['endereco_id'])) {
            // Se há itens físicos mas não há endereço, é erro
            throw new Exception('Endereço de entrega é obrigatório para itens físicos.');
        }
        // Se só há ebooks, não precisa de endereço

        $pedido = new Pedido($dadosPedido);

        $pedidoId = $this->pedidoRepository->criar($pedido);
        if (!$pedidoId) {
            throw new Exception('Erro ao criar o pedido.');
        }

        foreach ($itensPedidoParaSalvar as $item) {
            $item->pedido_id = $pedidoId;
            if (!$this->itemRepository->criar($item)) {
                throw new Exception("Erro ao salvar item do pedido (Livro ID {$item->livro_id}).");
            }
        }

        $this->carrinhoRepository->limparCarrinho($usuarioId);

        return [
            'pedido_id' => $pedidoId,
            'total' => $total,
            'valor_frete' => $valorFrete
        ];
    }

    public function confirmarPedido(int $usuarioId): ?Pedido
    {
        $pedido = $this->pedidoRepository->buscarPedidoPendenteDoUsuario($usuarioId);
        if (!$pedido) {
            return null;
        }

        $this->pedidoRepository->atualizarStatus($pedido->id, 'confirmado');
        return $pedido;
    }

    public function listarPedidosDoUsuario(int $usuarioId): array
    {
        $pedidos = $this->pedidoRepository->buscarPorUsuario($usuarioId);

        foreach ($pedidos as &$pedido) {
            $pedidoId = is_object($pedido) ? $pedido->id : $pedido['id'];
            $itens = $this->itemRepository->buscarPorPedido($pedidoId);

            if (is_object($pedido)) {
                $pedido->itens = $itens;
            } else {
                $pedido['itens'] = $itens;
            }
        }

        return $pedidos;
    }

    public function buscarPedidoCompleto(int $pedidoId): ?array
    {
        return $this->pedidoRepository->buscarPedidoCompletoPorId($pedidoId);
    }
}