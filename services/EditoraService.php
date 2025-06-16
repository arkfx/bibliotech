<?php

require_once __DIR__ . '/../repositories/EditoraRepository.php';
require_once __DIR__ . '/../models/Editora.php';

class EditoraService
{
    private EditoraRepository $editoraRepository;

    public function __construct(private PDO $pdo)
    {
        $this->editoraRepository = new EditoraRepository($pdo);
    }

    public function listarTodos(): array
    {
        return $this->editoraRepository->findAll();
    }

    public function buscarPorId(int $id): ?Editora
    {
        return $this->editoraRepository->findById($id);
    }

    public function criar(Editora $editora): int
    {
        $this->validar($editora);
        return $this->editoraRepository->save($editora);
    }

    public function atualizar(Editora $editora): bool
    {
        if (empty($editora->id)) {
            throw new Exception('ID da editora é obrigatório.');
        }

        $this->validar($editora);
        return $this->editoraRepository->update($editora);
    }

    public function excluir(int $id): void
    {
        $this->editoraRepository->delete($id);
    }

    private function validar(Editora $editora): void
    {
        if (empty(trim($editora->nome))) {
            throw new Exception('Nome da editora é obrigatório.');
        }
    }
}
