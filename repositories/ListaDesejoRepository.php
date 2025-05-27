<?php

require_once __DIR__ . '/../models/ListaDesejo.php';
require_once __DIR__ . '/BaseRepository.php';


class ListaDesejosRepository extends BaseRepository
{

    public function add(int $usuarioId, int $livroId): bool
    {
        $sql = "INSERT INTO lista_desejos (usuario_id, livro_id, created_at, updated_at)
                VALUES (:usuario_id, :livro_id, NOW(), NOW())";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':usuario_id', $usuarioId);
        $stmt->bindParam(':livro_id', $livroId);
        return $stmt->execute();
    }

    public function remove(int $usuarioId, int $livroId): bool
    {
        $sql = "DELETE FROM lista_desejos WHERE usuario_id = :usuario_id AND livro_id = :livro_id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':usuario_id', $usuarioId);
        $stmt->bindParam(':livro_id', $livroId);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    public function listByUsuario(int $usuarioId): array
    {
        $sql = "SELECT * FROM lista_desejos WHERE usuario_id = :usuario_id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':usuario_id', $usuarioId);
        $stmt->execute();
        $dados = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => new ListaDesejo($row), $dados);
    }

    public function exists(int $usuarioId, int $livroId): bool
    {
        $sql = "SELECT COUNT(*) FROM lista_desejos WHERE usuario_id = :usuario_id AND livro_id = :livro_id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':usuario_id', $usuarioId);
        $stmt->bindParam(':livro_id', $livroId);
        $stmt->execute();
        return $stmt->fetchColumn() > 0;
    }
}
