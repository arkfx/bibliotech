<?php

namespace Tests\Unit\Services;

use BiblioTech\Models\Biblioteca;
use BiblioTech\Models\Livro;
use BiblioTech\Models\Pedido;
use BiblioTech\Models\PedidoItem;
use BiblioTech\Repositories\BibliotecaRepository;
use BiblioTech\Repositories\CarrinhoRepository;
use BiblioTech\Repositories\LivroRepository;
use BiblioTech\Repositories\PedidoItemRepository;
use BiblioTech\Repositories\PedidoRepository;
use BiblioTech\Services\PedidoService;
use PHPUnit\Framework\TestCase;
use Exception;

class PedidoServiceTest extends TestCase
{
    private $pedidoRepositoryMock;
    private $itemRepositoryMock;
    private $carrinhoRepositoryMock;
    private $livroRepositoryMock;
    private $bibliotecaRepositoryMock;
    private PedidoService $pedidoService;

    protected function setUp(): void
    {
        $this->pedidoRepositoryMock = $this->createMock(PedidoRepository::class);
        $this->itemRepositoryMock = $this->createMock(PedidoItemRepository::class);
        $this->carrinhoRepositoryMock = $this->createMock(CarrinhoRepository::class);
        $this->livroRepositoryMock = $this->createMock(LivroRepository::class);
        $this->bibliotecaRepositoryMock = $this->createMock(BibliotecaRepository::class);

        $this->pedidoService = new PedidoService(
            $this->pedidoRepositoryMock,
            $this->itemRepositoryMock,
            $this->carrinhoRepositoryMock,
            $this->livroRepositoryMock,
            $this->bibliotecaRepositoryMock
        );
    }

    // --- Testes para finalizarPedido ---

    public function testFinalizarPedidoComSucessoComItemFisicoEEbook()
    {
        $usuarioId = 1;
        $enderecoId = 5; 
        $carrinhoItens = [
            (object)['livro_id' => 10, 'quantidade' => 1, 'tipo' => 'fisico'],
            (object)['livro_id' => 11, 'quantidade' => 1, 'tipo' => 'ebook'],
        ];
        $livroFisico = new Livro(['id' => 10, 'preco' => 50.00]);
        $livroEbook = new Livro(['id' => 11, 'preco' => 25.00]);

        $this->carrinhoRepositoryMock->method('listarPorUsuario')->with($usuarioId)->willReturn($carrinhoItens);
        $this->livroRepositoryMock->method('findById')->willReturnMap([
            [10, $livroFisico],
            [11, $livroEbook],
        ]);
        $this->bibliotecaRepositoryMock->method('existeNaBiblioteca')->willReturn(false);
        
        $this->pedidoRepositoryMock->method('criar')
            ->with($this->callback(function (Pedido $pedido) use ($usuarioId, $enderecoId) {
                return $pedido->usuario_id === $usuarioId && $pedido->endereco_id === $enderecoId;
            }))
            ->willReturn(123);

        $this->itemRepositoryMock->method('criar')->willReturn(true);

        $this->bibliotecaRepositoryMock->expects($this->once())->method('adicionarLivro'); 
        $this->itemRepositoryMock->expects($this->exactly(2))->method('criar'); 
        $this->carrinhoRepositoryMock->expects($this->once())->method('limparCarrinho')->with($usuarioId);

        $resultado = $this->pedidoService->finalizarPedido($usuarioId, ['endereco_id' => $enderecoId]);

        $this->assertEquals(123, $resultado['pedido_id']);
        $this->assertEquals(24.99, $resultado['valor_frete']);
        $this->assertEquals(99.99, $resultado['total']);
    }

    public function testFinalizarPedidoComSucessoApenasComEbook()
    {
        $usuarioId = 1;
        $carrinhoItens = [(object)['livro_id' => 11, 'quantidade' => 1, 'tipo' => 'ebook']];
        $livroEbook = new Livro(['id' => 11, 'preco' => 25.00]);

        $this->carrinhoRepositoryMock->method('listarPorUsuario')->willReturn($carrinhoItens);
        $this->livroRepositoryMock->method('findById')->willReturn($livroEbook);
        $this->bibliotecaRepositoryMock->method('existeNaBiblioteca')->willReturn(false);
        
        $this->pedidoRepositoryMock->method('criar')
            ->with($this->callback(function (Pedido $pedido) {
                return $pedido->endereco_id === null;
            }))
            ->willReturn(124);

        $this->itemRepositoryMock->method('criar')->willReturn(true);

        $resultado = $this->pedidoService->finalizarPedido($usuarioId, []);

        $this->assertEquals(124, $resultado['pedido_id']);
        $this->assertEquals(0.00, $resultado['valor_frete']); 
        $this->assertEquals(25.00, $resultado['total']);
    }

    public function testFinalizarPedidoDeveLancarExcecaoSeCarrinhoEstiverVazio()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Carrinho vazio.');

        $usuarioId = 1;
        $this->carrinhoRepositoryMock->method('listarPorUsuario')->with($usuarioId)->willReturn([]);

        $this->pedidoService->finalizarPedido($usuarioId, []);
    }

    public function testFinalizarPedidoDeveIgnorarEbookJaExistenteNaBiblioteca()
    {
        $usuarioId = 1;
        $enderecoId = 7; 
        $carrinhoItens = [
            (object)['livro_id' => 10, 'quantidade' => 1, 'tipo' => 'fisico'],
            (object)['livro_id' => 11, 'quantidade' => 1, 'tipo' => 'ebook'],
        ];
        $livroFisico = new Livro(['id' => 10, 'preco' => 50.00]);
        $livroEbook = new Livro(['id' => 11, 'preco' => 25.00]);

        $this->carrinhoRepositoryMock->method('listarPorUsuario')->willReturn($carrinhoItens);
        $this->livroRepositoryMock->method('findById')->willReturnMap([
            [10, $livroFisico],
            [11, $livroEbook],
        ]);
        $this->bibliotecaRepositoryMock->method('existeNaBiblioteca')->willReturn(true);
        
        // MODIFICADO: Verificar se o endereco_id correto é passado, pois há um item físico
        $this->pedidoRepositoryMock->method('criar')
             ->with($this->callback(function (Pedido $pedido) use ($enderecoId) {
                 return $pedido->endereco_id === $enderecoId;
             }))
            ->willReturn(125);

        $this->itemRepositoryMock->method('criar')->willReturn(true);

        $this->bibliotecaRepositoryMock->expects($this->never())->method('adicionarLivro');
        $this->itemRepositoryMock->expects($this->once())->method('criar');

        $resultado = $this->pedidoService->finalizarPedido($usuarioId, ['endereco_id' => $enderecoId]);

        $this->assertEquals(74.99, $resultado['total']);
    }

    // --- Novo Teste ---

    public function testFinalizarPedidoDeveLancarExcecaoParaItemFisicoSemEndereco()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Endereço de entrega é obrigatório para itens físicos.');

        $usuarioId = 1;
        $carrinhoItens = [
            (object)['livro_id' => 10, 'quantidade' => 1, 'tipo' => 'fisico']
        ];
        $livroFisico = new Livro(['id' => 10, 'preco' => 50.00]);

        $this->carrinhoRepositoryMock->method('listarPorUsuario')->willReturn($carrinhoItens);
        $this->livroRepositoryMock->method('findById')->willReturn($livroFisico);

        // Chamar sem o endereco_id nos dados de finalização
        $this->pedidoService->finalizarPedido($usuarioId, []);
    }
}