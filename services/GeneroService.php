<?php

require_once __DIR__ . '/../repositories/GeneroRepository.php';
require_once __DIR__ . '/../models/Genero.php';

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

    public function criar(Genero $genero): void
    {
        $this->validar($genero);
        $this->generoRepository->save($genero);
    }

    public function excluir(int $id): void
    {
        $this->generoRepository->delete($id);
    }

    private function validar(Genero $genero): void
    {
        if (empty(trim($genero->nome))) {
            throw new Exception('Nome do gênero é obrigatório.');
        }
    }
}
