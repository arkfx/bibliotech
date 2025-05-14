<?php
class GeneroDAO {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
        $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, true);
        $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function getAllGeneros() {
        $query = "SELECT * FROM generos";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt->closeCursor();
        return $result;
    }

    public function getGeneroById($id) {
        $query = "SELECT * FROM generos WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $stmt->closeCursor();
        return $result;
    }

    public function insertGenero($nome) {
        $query = "INSERT INTO generos (nome) VALUES (:nome)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':nome', $nome, PDO::PARAM_STR);
        $result = $stmt->execute();
        $stmt->closeCursor();
        return $result;
    }

    public function deleteGenero($id) {
        $query = "DELETE FROM generos WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $result = $stmt->execute();
        $stmt->closeCursor();
        return $result;
    }
}