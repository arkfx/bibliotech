<?php
namespace BiblioTech\Services;

use BiblioTech\Models\Carrinho;
use BiblioTech\Models\Biblioteca;
use BiblioTech\Repositories\CarrinhoRepository;
use BiblioTech\Repositories\LivroRepository;
use BiblioTech\Repositories\BibliotecaRepository;
use Exception;

class CarrinhoService
{
    private CarrinhoRepository $carrinhoRepository;
    private LivroRepository $livroRepository;
    private BibliotecaRepository $bibliotecaRepository;

    public function __construct(CarrinhoRepository $carrinhoRepository, LivroRepository $livroRepository, BibliotecaRepository $bibliotecaRepository)
    {
        $this->carrinhoRepository = $carrinhoRepository;
        $this->livroRepository = $livroRepository;
        $this->bibliotecaRepository = $bibliotecaRepository;
    }

    public function listarItens(int $usuarioId): array
    {
        return $this->carrinhoRepository->listarPorUsuario($usuarioId);
    }

    public function adicionarItem(int $usuarioId, array $data): void
    {
        $livroId = $data['id'] ?? null;
        $quantidade = (int)($data['quantidade'] ?? 1);
        $tipo = $data['tipo'] ?? null;

        if (!$livroId || !$tipo || $quantidade <= 0) {
            throw new Exception('ID do livro, quantidade e tipo são obrigatórios.');
        }

        if (!in_array($tipo, ['ebook', 'fisico'])) {
            throw new Exception("Tipo inválido. Deve ser 'ebook' ou 'fisico'.");
        }

        $livro = $this->livroRepository->findById($livroId);
        if (!$livro) {
            throw new Exception('Livro não encontrado.');
        }

        if ($tipo === 'ebook') {
            if ($quantidade > 1) {
                throw new Exception('Não é possível adicionar mais de uma unidade de um e-book.');
            }

            $itemBiblioteca = new Biblioteca([
                'usuario_id' => $usuarioId,
                'livro_id' => $livroId
            ]);

            if ($this->bibliotecaRepository->existeNaBiblioteca($itemBiblioteca)) {
                throw new Exception('Você já possui este e-book em sua biblioteca.');
            }
        }

        $carrinho = new Carrinho([
            'usuario_id' => $usuarioId,
            'livro_id' => $livroId,
            'quantidade' => $quantidade,
            'tipo' => $tipo
        ]);

        if (!$this->carrinhoRepository->adicionar($carrinho)) {
            throw new Exception('Erro ao adicionar livro ao carrinho.');
        }
    }

    public function atualizarItem(int $usuarioId, array $data): void
    {
        $livroId = $data['id'] ?? null;
        $quantidade = $data['quantidade'] ?? null;
        $tipo = $data['tipo'] ?? null;

        if (!$livroId || !$quantidade || !$tipo) {
            throw new Exception('ID do livro, quantidade e tipo são obrigatórios.');
        }

        $quantidade = (int)$quantidade;

        if ($quantidade <= 0) {
            throw new Exception('A quantidade deve ser maior que zero.');
        }

        if ($tipo === 'ebook' && $quantidade > 1) {
            throw new Exception('Não é possível ter mais de uma unidade de um e-book.');
        }

        if (!in_array($tipo, ['ebook', 'fisico'])) {
            throw new Exception("Tipo inválido. Deve ser 'ebook' ou 'fisico'.");
        }

        $carrinho = new Carrinho([
            'usuario_id' => $usuarioId,
            'livro_id' => $livroId,
            'quantidade' => $quantidade,
            'tipo' => $tipo
        ]);

        if (!$this->carrinhoRepository->atualizarQuantidade($carrinho)) {
            throw new Exception('Item não encontrado no carrinho para atualizar.');
        }
    }

    public function removerItem(int $usuarioId, array $data): void
    {
        $livroId = $data['id'] ?? null;
        $tipo = $data['tipo'] ?? null;

        if (!$livroId || !$tipo) {
            throw new Exception('ID do livro e tipo são obrigatórios.');
        }

        if (!in_array($tipo, ['ebook', 'fisico'])) {
            throw new Exception("Tipo inválido. Deve ser 'ebook' ou 'fisico'.");
        }

        $carrinho = new Carrinho([
            'usuario_id' => $usuarioId,
            'livro_id' => $livroId,
            'tipo' => $tipo
        ]);

        if (!$this->carrinhoRepository->remover($carrinho)) {
            throw new Exception('Erro ao remover livro do carrinho.');
        }
    }
}
