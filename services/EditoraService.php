<?php

namespace BiblioTech\Services;

use BiblioTech\Models\Editora;
use BiblioTech\Repositories\EditoraRepository;
use Exception;

class EditoraService
{
    private EditoraRepository $editoraRepository;

    public function __construct(EditoraRepository $editoraRepository)
    {
        $this->editoraRepository = $editoraRepository;
    }

    public function listarTodos(): array
    {
        return $this->editoraRepository->findAll();
    }

    public function buscarPorId(int $id): ?Editora
    {
        return $this->editoraRepository->findById($id);
    }

    public function criar(array $data): int
    {
        $this->validarNome($data);

        if ($this->editoraRepository->existsByName($data['nome'])) {
            throw new Exception('Editora já existente');
        }

        $editora = new Editora(['nome' => $data['nome']]);
        return $this->editoraRepository->save($editora);
    }

    public function atualizar(array $data): bool
    {
        if (empty($data['id']) || empty($data['nome'])) {
            throw new Exception('ID e nome da editora são obrigatórios');
        }

        if ($this->editoraRepository->existsByName($data['nome'])) {
            throw new Exception('Editora já existente');
        }

        $editora = new Editora($data);
        return $this->editoraRepository->update($editora);
    }

    public function excluir(int $id): void
    {
        $this->editoraRepository->delete($id);
    }

    private function validarNome(array $data): void
    {
        if (empty($data['nome']) || !is_string($data['nome']) || trim($data['nome']) === '') {
            throw new Exception('Nome da editora é obrigatório');
        }
    }
}
