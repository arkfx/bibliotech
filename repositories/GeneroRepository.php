<?php

namespace BiblioTech\Repositories;
use BiblioTech\Models\Genero;

use PDO;

class GeneroRepository extends BaseRepository
{
    public function findAll() {
        $query = "SELECT * FROM generos ORDER BY nome";
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
            // Atualizar gênero existente
            $query = "UPDATE generos SET nome = :nome, updated_at = NOW() WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':nome', $genero->nome, PDO::PARAM_STR);
            $stmt->bindParam(':id', $genero->id, PDO::PARAM_INT);
            $stmt->execute();
            $stmt->closeCursor();
            return $genero; 
        } else {
            // Inserir novo gênero
            $query = "INSERT INTO generos (nome, created_at, updated_at) VALUES (:nome, NOW(), NOW())";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':nome', $genero->nome, PDO::PARAM_STR);
            $stmt->execute();

            $genero->id = $this->conn->lastInsertId();
            $stmt->closeCursor(); 
            
            return $genero;
        }
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
    
    public function existsByName($nome)
    {
        $query = "SELECT COUNT(*) FROM generos WHERE nome = :nome";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':nome', $nome, PDO::PARAM_STR);
        $stmt->execute();
        
        $count = $stmt->fetchColumn();
        $stmt->closeCursor();
        
        return $count > 0;
    }
}


