<?php

require_once __DIR__ . '/../models/Genero.php';
require_once __DIR__ . '/../repositories/GeneroRepository.php';

class GeneroService
{
    private GeneroRepository $generoRepository;

    public function __construct(private PDO $pdo)
    {
        $this->generoRepository = new GeneroRepository($pdo);
    }

    public function listarTodos(): array
    {
        return $this->generoRepository->findAll();
    }

    public function buscarPorId(int $id): ?Genero
    {
        return $this->generoRepository->findById($id);
    }

    public function criar(array $data): Genero
    {
        if (empty($data['nome']) || trim($data['nome']) === '') {
            throw new Exception("Nome do gênero é obrigatório.");
        }

        $nome = trim($data['nome']);

        if ($this->generoRepository->existsByName($nome)) {
            throw new Exception("Gênero já existe.");
        }

        $genero = new Genero();
        $genero->nome = $nome;

        $salvo = $this->generoRepository->save($genero);

        if (!$salvo) {
            throw new Exception("Erro ao salvar o gênero.");
        }

        return $salvo;
    }

    public function atualizar(int $id, array $data): Genero
    {
        $genero = $this->generoRepository->findById($id);

        if (!$genero) {
            throw new Exception("Gênero não encontrado.");
        }

        if (empty($data['nome']) || trim($data['nome']) === '') {
            throw new Exception("Nome do gênero é obrigatório.");
        }

        $novoNome = trim($data['nome']);

        if ($this->generoRepository->existsByName($novoNome) && $genero->nome !== $novoNome) {
            throw new Exception("Já existe um gênero com este nome.");
        }

        $genero->nome = $novoNome;

        $atualizado = $this->generoRepository->save($genero);

        if (!$atualizado) {
            throw new Exception("Erro ao atualizar o gênero.");
        }

        return $atualizado;
    }

    public function excluir(int $id): void
    {
        $this->generoRepository->delete($id);
    }
}
