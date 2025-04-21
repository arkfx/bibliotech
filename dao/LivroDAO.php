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

    public function getAllBooks() {
        $sql = "SELECT * FROM livros";
        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getBookById($id) {
        $sql = "SELECT * FROM livros WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function searchBooks($termo) {
        $sql = "SELECT * FROM livros WHERE LOWER(titulo) LIKE LOWER(:termo) OR LOWER(autor) LIKE LOWER(:termo) OR LOWER(genero) LIKE LOWER(:termo)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':termo', '%' . strtolower($termo) . '%', PDO::PARAM_STR); // Converte o termo para minúsculas
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
}