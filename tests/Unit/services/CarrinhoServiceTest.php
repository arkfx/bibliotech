<?php

namespace Tests\Unit\Services;

use BiblioTech\Models\Carrinho;
use BiblioTech\Models\Livro;
use BiblioTech\Repositories\BibliotecaRepository;
use BiblioTech\Repositories\CarrinhoRepository;
use BiblioTech\Repositories\LivroRepository;
use BiblioTech\Services\CarrinhoService;
use PHPUnit\Framework\TestCase;
use Exception;

class CarrinhoServiceTest extends TestCase
{
    private $carrinhoRepositoryMock;
    private $livroRepositoryMock;
    private $bibliotecaRepositoryMock;
    private CarrinhoService $carrinhoService;

    protected function setUp(): void
    {
        $this->carrinhoRepositoryMock = $this->createMock(CarrinhoRepository::class);
        $this->livroRepositoryMock = $this->createMock(LivroRepository::class);
        $this->bibliotecaRepositoryMock = $this->createMock(BibliotecaRepository::class);

        $this->carrinhoService = new CarrinhoService(
            $this->carrinhoRepositoryMock,
            $this->livroRepositoryMock,
            $this->bibliotecaRepositoryMock
        );
    }

    // --- Testes para adicionarItem ---

    public function testAdicionarItemFisicoComSucesso()
    {
        $usuarioId = 1;
        $data = ['id' => 10, 'quantidade' => 2, 'tipo' => 'fisico'];
        $livro = new Livro(data: ['id' => 10]);

        $this->livroRepositoryMock->method('findById')->with($data['id'])->willReturn($livro);
        
        $this->carrinhoRepositoryMock->expects($this->once())->method('adicionar')->willReturn(true);

        $this->carrinhoService->adicionarItem($usuarioId, $data);
    }

    public function testAdicionarItemEbookComSucesso()
    {
        $usuarioId = 1;
        $data = ['id' => 11, 'quantidade' => 1, 'tipo' => 'ebook'];
        $livro = new Livro(['id' => 11]);

        $this->livroRepositoryMock->method('findById')->with($data['id'])->willReturn($livro);
        $this->bibliotecaRepositoryMock->method('existeNaBiblioteca')->willReturn(false);
        $this->carrinhoRepositoryMock->expects($this->once())->method('adicionar')->willReturn(true);

        $this->carrinhoService->adicionarItem($usuarioId, $data);
    }

    public function testAdicionarItemDeveLancarExcecaoSeLivroNaoEncontrado()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Livro não encontrado.');

        $usuarioId = 1;
        $data = ['id' => 999, 'quantidade' => 1, 'tipo' => 'fisico'];
        $this->livroRepositoryMock->method('findById')->with($data['id'])->willReturn(null);

        $this->carrinhoService->adicionarItem($usuarioId, $data);
    }

    public function testAdicionarItemDeveLancarExcecaoSeEbookJaExistirNaBiblioteca()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Você já possui este e-book em sua biblioteca.');

        $usuarioId = 1;
        $data = ['id' => 12, 'quantidade' => 1, 'tipo' => 'ebook'];
        $livro = new Livro(['id' => 12]);

        $this->livroRepositoryMock->method('findById')->with($data['id'])->willReturn($livro);
        $this->bibliotecaRepositoryMock->method('existeNaBiblioteca')->willReturn(true);

        $this->carrinhoRepositoryMock->expects($this->never())->method('adicionar');

        $this->carrinhoService->adicionarItem($usuarioId, $data);
    }


    public function testRemoverItemComSucesso()
    {
        // Arrange
        $usuarioId = 1;
        $data = ['id' => 10, 'tipo' => 'fisico'];

        $this->carrinhoRepositoryMock
             ->expects($this->once())
             ->method('remover')
             ->willReturn(true);

        // Act
        $this->carrinhoService->removerItem($usuarioId, $data);
    }

    public function testRemoverItemDeveLancarExcecaoSeDadosFaltando()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('ID do livro e tipo são obrigatórios.');

        $usuarioId = 1;
        $data = ['id' => 10];

        $this->carrinhoService->removerItem($usuarioId, $data);
    }


    public function testAtualizarItemComSucesso()
    {
        $usuarioId = 1;
        $data = ['id' => 10, 'quantidade' => 5, 'tipo' => 'fisico'];

        $this->carrinhoRepositoryMock
             ->expects($this->once())
             ->method('atualizarQuantidade')
             ->willReturn(true);

        $this->carrinhoService->atualizarItem($usuarioId, $data);
    }

    public function testAtualizarItemDeveLancarExcecaoSeQuantidadeForZero()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('A quantidade deve ser maior que zero.');

        $usuarioId = 1;
        $data = ['id' => 10, 'quantidade' => 0, 'tipo' => 'fisico'];

        $this->carrinhoService->atualizarItem($usuarioId, $data);
    }
}