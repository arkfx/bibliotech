<?php
class EditoraDAO
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
        $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, true);
        $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function getAllEditoras()
    {
        $sql = "SELECT * FROM editoras ORDER BY nome";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt->closeCursor();
        return $result;
    }

    public function getEditoraById($id)
    {
        $sql = "SELECT * FROM editoras WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $stmt->closeCursor();
        return $result;
    }

    public function createEditora($nome)
    {
        $sql = "INSERT INTO editoras (nome, created_at, updated_at) 
                VALUES (:nome, NOW(), NOW())";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':nome', $nome);
        $stmt->execute();
        $lastId = $this->conn->lastInsertId();
        $stmt->closeCursor();
        return $lastId;
    }

    public function updateEditora($id, $nome)
    {
        $sql = "UPDATE editoras SET nome = :nome, updated_at = NOW() WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':nome', $nome);
        $result = $stmt->execute();
        $stmt->closeCursor();
        return $result;
    }

    public function deleteEditora($id)
    {
        // Check if publisher is associated with any books
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
} 