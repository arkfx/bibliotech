<?php

require_once __DIR__ . '/../models/Genero.php';
require_once __DIR__ . '/BaseRepository.php';

class GeneroRepository extends BaseRepository
{
    public function findAll()
    {
        $query = "SELECT * FROM generos";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        $generos = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $generos[] = new Genero($row);
        }

        $stmt->closeCursor();
        return $generos;
    }

    public function findById($id)
    {
        $query = "SELECT * FROM generos WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        $stmt->closeCursor();

        return $data ? new Genero($data) : null;
    }

    public function save(Genero $genero)
    {
        if ($genero->id) {
            throw new Exception("Atualização de gênero não implementada.");
        }

        $query = "INSERT INTO generos (nome) VALUES (:nome)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':nome', $genero->nome, PDO::PARAM_STR);
        $stmt->execute();

        $genero->id = $this->conn->lastInsertId();
        $stmt->closeCursor();
        return $genero;
    }

    public function delete($id)
    {
        $query = "DELETE FROM generos WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $stmt->closeCursor();
        return $stmt->rowCount() > 0;
    }
}
