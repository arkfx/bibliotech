<?php
class GeneroDAO {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAllGeneros() {
        $query = "SELECT * FROM generos";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getGeneroById($id) {
        $query = "SELECT * FROM generos WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function insertGenero($nome) {
        $query = "INSERT INTO generos (nome) VALUES (:nome)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':nome', $nome, PDO::PARAM_STR);
        return $stmt->execute();
    }

    public function deleteGenero($id) {
        $query = "DELETE FROM generos WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}