<?php

require_once __DIR__ . '/../models/Editora.php';
require_once __DIR__ . '/BaseRepository.php';

class EditoraRepository  extends BaseRepository
{
    public function findAll()
    {
        $sql = "SELECT * FROM editoras ORDER BY nome";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        $editoras = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $editoras[] = new Editora($row);
        }

        $stmt->closeCursor();
        return $editoras;
    }

    public function findById($id)
    {
        $sql = "SELECT * FROM editoras WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        $stmt->closeCursor();

        return $data ? new Editora($data) : null;
    }

    public function save(Editora $editora)
    {
        if ($editora->id) {
            return $this->update($editora);
        }

        $sql = "INSERT INTO editoras (nome, created_at, updated_at)
                VALUES (:nome, NOW(), NOW())";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':nome', $editora->nome);
        $stmt->execute();

        $editora->id = $this->conn->lastInsertId();
        $stmt->closeCursor();
        return $editora;
    }

    public function update(Editora $editora): bool
    {
        $sql = "UPDATE editoras 
                SET nome = :nome, updated_at = NOW()
                WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $editora->id, PDO::PARAM_INT);
        $stmt->bindParam(':nome', $editora->nome);
        $stmt->execute();
        $stmt->closeCursor();

        return $stmt->rowCount() > 0;
    }

    public function delete($id)
    {
        $checkSql = "SELECT COUNT(*) FROM livros WHERE editora_id = :id";
        $checkStmt = $this->conn->prepare($checkSql);
        $checkStmt->bindParam(':id', $id, PDO::PARAM_INT);
        $checkStmt->execute();
        $count = $checkStmt->fetchColumn();
        $checkStmt->closeCursor();

        if ($count > 0) {
            throw new Exception("Esta editora não pode ser removida porque possui livros associados.");
        }

        $sql = "DELETE FROM editoras WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            $stmt->closeCursor();
            throw new Exception("Editora com ID $id não encontrada.");
        }

        $stmt->closeCursor();
        return true;
    }

    public function existsByName($nome)
    {
        $sql = "SELECT COUNT(*) FROM editoras WHERE nome = :nome";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':nome', $nome, PDO::PARAM_STR);
        $stmt->execute();

        $count = $stmt->fetchColumn();
        $stmt->closeCursor();

        return $count > 0;
    }
}
