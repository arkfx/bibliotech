<?php

require_once __DIR__ . '/../repositories/ReadingProgressRepository.php';
require_once __DIR__ . '/../models/ReadingProgress.php';

class ProgressoLeituraService
{
    private ReadingProgressRepository $repository;

    public function __construct(private PDO $pdo)
    {
        $this->repository = new ReadingProgressRepository($pdo);
    }

    public function salvar(array $data, int $usuarioId): bool
    {
        if (!isset($data['livro_id'], $data['current_page'], $data['total_pages'], $data['progress_percentage'])) {
            throw new InvalidArgumentException('Dados obrigatórios faltando.');
        }

        $progress = new ReadingProgress([
            'usuario_id' => $usuarioId,
            'livro_id' => (int)$data['livro_id'],
            'current_page' => (int)$data['current_page'],
            'total_pages' => (int)$data['total_pages'],
            'progress_percentage' => (float)$data['progress_percentage']
        ]);

        return $this->repository->saveProgress($progress);
    }

    public function buscarPorLivro(int $usuarioId, int $livroId): ?ReadingProgress
    {
        return $this->repository->getProgress($usuarioId, $livroId);
    }

    public function livrosEmProgresso(int $usuarioId): array
    {
        return $this->repository->getBooksInProgress($usuarioId);
    }

    public function livrosRecentes(int $usuarioId, int $limit = 5): array
    {
        return $this->repository->getRecentlyReadBooks($usuarioId, $limit);
    }

    public function excluir(int $usuarioId, int $livroId): bool
    {
        return $this->repository->deleteProgress($usuarioId, $livroId);
    }
}
