<?php
class LivroDAO {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function createBook($titulo, $autor, $genero, $preco, $editora, $descricao) {
        $sql = "INSERT INTO livros (titulo, autor, genero, preco, editora, descricao, created_at, updated_at)
                VALUES (:titulo, :autor, :genero, :preco, :editora, :descricao, NOW(), NOW())";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(':titulo', $titulo);
        $stmt->bindParam(':autor', $autor);
        $stmt->bindParam(':genero', $genero);
        $stmt->bindParam(':preco', $preco);
        $stmt->bindParam(':editora', $editora);
        $stmt->bindParam(':descricao', $descricao);

        return $stmt->execute();
    }
}