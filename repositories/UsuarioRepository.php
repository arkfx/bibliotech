<?php

require_once __DIR__ . '/../models/Usuario.php';
require_once __DIR__ . '/BaseRepository.php';

class UsuarioRepository extends BaseRepository
{

    public function findById(int $id): ?Usuario
    {
        $sql = "SELECT * FROM usuario WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        $stmt->closeCursor();

        return $data ? new Usuario($data) : null;
    }


    public function findByEmail(string $email): ?Usuario
    {
        $sql = "SELECT * FROM usuario WHERE email = :email";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        $stmt->closeCursor();

        return $data ? new Usuario($data) : null;
    }

    public function save(Usuario $usuario): bool
    {
        $sql = "INSERT INTO usuario (nome, email, senha) VALUES (:nome, :email, :senha)";
        $stmt = $this->conn->prepare($sql);

        $hashed = password_hash($usuario->senha, PASSWORD_BCRYPT);

        $stmt->bindValue(':nome', $usuario->nome);
        $stmt->bindValue(':email', $usuario->email);
        $stmt->bindValue(':senha', $hashed);

        $success = $stmt->execute();
        $stmt->closeCursor();
        return $success;
    }
}
