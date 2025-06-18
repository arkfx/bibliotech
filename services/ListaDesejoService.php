<?php

require_once __DIR__ . '/../repositories/ListaDesejoRepository.php';

class ListaDesejoService
{
    private ListaDesejosRepository $repo;

    public function __construct(private PDO $pdo)
    {
        $this->repo = new ListaDesejosRepository($pdo);
    }

    public function adicionar(int $usuarioId, int $livroId): void
    {
        if (empty($livroId)) {
            throw new InvalidArgumentException('ID do livro é obrigatório.');
        }

        $this->repo->add($usuarioId, $livroId);
    }

    public function remover(int $usuarioId, int $livroId): bool
    {
        if (empty($livroId)) {
            throw new InvalidArgumentException('ID do livro é obrigatório.');
        }

        return $this->repo->remove($usuarioId, $livroId);
    }

    public function listar(int $usuarioId): array
    {
        return $this->repo->listByUsuario($usuarioId);
    }

    public function existe(int $usuarioId, int $livroId): bool
    {
        return $this->repo->exists($usuarioId, $livroId);
    }
}
