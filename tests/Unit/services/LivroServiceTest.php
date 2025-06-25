<?php

namespace Tests\Unit\Services;

use BiblioTech\Models\Editora;
use BiblioTech\Models\Genero;
use BiblioTech\Models\Livro;
use BiblioTech\Repositories\EditoraRepository;
use BiblioTech\Repositories\GeneroRepository;
use BiblioTech\Repositories\LivroRepository;
use BiblioTech\Services\LivroService;
use PHPUnit\Framework\TestCase;
use Exception;

class LivroServiceTest extends TestCase
{
    private $livroRepositoryMock;
    private $editoraRepositoryMock;
    private $generoRepositoryMock;
    private LivroService $livroService;

    protected function setUp(): void
    {
        $this->livroRepositoryMock = $this->createMock(LivroRepository::class);
        $this->editoraRepositoryMock = $this->createMock(EditoraRepository::class);
        $this->generoRepositoryMock = $this->createMock(GeneroRepository::class);

        $this->livroService = new LivroService(
            $this->livroRepositoryMock,
            $this->editoraRepositoryMock,
            $this->generoRepositoryMock
        );
    }

    private function criarLivroValido(array $overrides = []): Livro
    {
        $data = array_merge([
            'id' => 1,
            'titulo' => 'Livro de Teste',
            'autor' => 'Autor de Teste',
            'genero_id' => 10,
            'preco' => 49.99,
            'editora_id' => 20,
            'descricao' => 'Uma descrição de teste.',
            'imagem_url' => 'http://example.com/img.png'
        ], $overrides);

        return new Livro($data);
    }

    // --- Testes para criar() ---

    public function testCriarDeveSalvarLivroValido()
    {
        $livro = $this->criarLivroValido();

        $this->editoraRepositoryMock->method('findById')->with($livro->editora_id)->willReturn(new Editora());
        $this->generoRepositoryMock->method('findById')->with($livro->genero_id)->willReturn(new Genero());

        $this->livroRepositoryMock->expects($this->once())->method('save')->with($livro);

        $this->livroService->criar($livro);
    }

    public function testCriarDeveLancarExcecaoParaCampoObrigatorioAusente()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Campo obrigatório ausente: titulo');

        $livro = $this->criarLivroValido(['titulo' => '']); 

        $this->livroService->criar($livro);
    }

    public function testCriarDeveLancarExcecaoParaEditoraInvalida()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Editora inválida.');

        $livro = $this->criarLivroValido();

        $this->editoraRepositoryMock->method('findById')->with($livro->editora_id)->willReturn(null);

        $this->livroService->criar($livro);
    }

    public function testCriarDeveLancarExcecaoParaGeneroInvalido()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Gênero inválido.');

        $livro = $this->criarLivroValido();

        $this->editoraRepositoryMock->method('findById')->with($livro->editora_id)->willReturn(new Editora());
        $this->generoRepositoryMock->method('findById')->with($livro->genero_id)->willReturn(null);

        $this->livroService->criar($livro);
    }

    // --- Testes para atualizar() ---

    public function testAtualizarDeveSalvarLivroValido()
    {
        $livro = $this->criarLivroValido();

        $this->editoraRepositoryMock->method('findById')->willReturn(new Editora());
        $this->generoRepositoryMock->method('findById')->willReturn(new Genero());
        $this->livroRepositoryMock->expects($this->once())->method('save')->with($livro);

        $this->livroService->atualizar($livro);
    }

    public function testAtualizarDeveLancarExcecaoSeIdForVazio()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('ID do livro é obrigatório.');

        $livro = $this->criarLivroValido(['id' => null]);

        $this->livroService->atualizar($livro);
    }

    // --- Testes para excluir() ---

    public function testExcluirDeveChamarDeleteDoRepositorio()
    {
        $livroId = 123;

        $this->livroRepositoryMock->expects($this->once())->method('delete')->with($livroId);

        $this->livroService->excluir($livroId);
    }
}