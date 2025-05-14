<?php
class ListaDesejosDAO {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function addBook($usuarioId, $livroId) {
        $sql = "INSERT INTO lista_desejos (
                    usuario_id, livro_id, created_at, updated_at
                ) VALUES (
                    :usuario_id, :livro_id, NOW(), NOW()
                )";
        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(':usuario_id', $usuarioId);
        $stmt->bindParam(':livro_id', $livroId);
        $stmt->execute();
    }

    public function removeBook($usuarioId, $livroId) {
        $sql = "DELETE FROM lista_desejos WHERE usuario_id = :usuario_id AND livro_id = :livro_id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':usuario_id', $usuarioId);
        $stmt->bindParam(':livro_id', $livroId);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    public function listBooks($usuarioId) {
        $sql = "SELECT livro_id FROM lista_desejos WHERE usuario_id = :usuario_id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':usuario_id', $usuarioId);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    public function checkBook($usuarioId, $livroId) {
        $sql = "SELECT COUNT(*) FROM lista_desejos WHERE usuario_id = :usuario_id AND livro_id = :livro_id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':usuario_id', $usuarioId);
        $stmt->bindParam(':livro_id', $livroId);
        $stmt->execute();
        return $stmt->fetchColumn() > 0;
    }
}
