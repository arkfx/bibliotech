<?php

require_once __DIR__ . '/../models/Livro.php';
require_once __DIR__ . '/../repositories/LivroRepository.php';
require_once __DIR__ . '/../repositories/EditoraRepository.php';
require_once __DIR__ . '/../repositories/GeneroRepository.php';

class LivroService
{
    private LivroRepository $livroRepository;
    private EditoraRepository $editoraRepository;
    private GeneroRepository $generoRepository;

    public function __construct(private PDO $pdo)
    {
        $this->livroRepository = new LivroRepository($pdo);
        $this->editoraRepository = new EditoraRepository($pdo);
        $this->generoRepository = new GeneroRepository($pdo);
    }

    public function listar(?string $termo, ?int $genero_id, string $ordem): array
    {
        return $this->livroRepository->search($termo, $genero_id, $ordem);
    }

    public function buscar(int $id): ?Livro
    {
        return $this->livroRepository->findById($id);
    }

    public function criar(Livro $livro): void
    {
        $this->validarLivro($livro);
        $this->livroRepository->save($livro);
    }

    public function atualizar(Livro $livro): void
    {
        if (empty($livro->id)) {
            throw new Exception('ID do livro é obrigatório.');
        }

        $this->validarLivro($livro);
        $this->livroRepository->save($livro);
    }

    public function excluir(int $id): void
    {
        $this->livroRepository->delete($id);
    }

    private function validarLivro(Livro $livro): void
    {
        $campos = ['titulo', 'autor', 'genero_id', 'preco', 'editora_id', 'descricao', 'imagem_url'];

        foreach ($campos as $campo) {
            if (empty($livro->$campo)) {
                throw new Exception("Campo obrigatório ausente: {$campo}");
            }
        }

        if (!$this->editoraRepository->findById($livro->editora_id)) {
            throw new Exception('Editora inválida.');
        }

        if (!$this->generoRepository->findById($livro->genero_id)) {
            throw new Exception('Gênero inválido.');
        }
    }
}
