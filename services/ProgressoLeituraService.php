<?php

namespace BiblioTech\Services;

use BiblioTech\Models\ReadingProgress;
use BiblioTech\Repositories\ReadingProgressRepository;
use InvalidArgumentException;

class ProgressoLeituraService
{
    private ReadingProgressRepository $repository;

    public function __construct(ReadingProgressRepository $repository)
    {
        $this->repository = $repository;
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
