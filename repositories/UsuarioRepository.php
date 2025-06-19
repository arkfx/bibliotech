<?php

namespace BiblioTech\Repositories;

use BiblioTech\Models\Usuario;
use PDO;

class UsuarioRepository extends BaseRepository
{
    public function findById(int $id): ?Usuario
    {
        $sql = "SELECT * FROM usuario WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':id' => $id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? new Usuario($data) : null;
    }

    public function findByEmail(string $email): ?Usuario
    {
        $sql = "SELECT * FROM usuario WHERE email = :email";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':email' => $email]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? new Usuario($data) : null;
    }

    public function save(Usuario $usuario): bool
    {
        $sql = "INSERT INTO usuario (nome, email, senha, telefone, data_nascimento, cpf) 
                VALUES (:nome, :email, :senha, :telefone, :data_nascimento, :cpf)";
        
        $stmt = $this->conn->prepare($sql);
        $hashed = password_hash($usuario->senha, PASSWORD_BCRYPT);

        return $stmt->execute([
            ':nome' => $usuario->nome,
            ':email' => $usuario->email,
            ':senha' => $hashed,
            ':telefone' => $usuario->telefone,
            ':data_nascimento' => $usuario->data_nascimento,
            ':cpf' => $usuario->cpf
        ]);
    }

    public function update(Usuario $usuario): bool
    {
        $sql = "UPDATE usuario SET 
                    nome = :nome, 
                    email = :email, 
                    telefone = :telefone, 
                    data_nascimento = :data_nascimento, 
                    cpf = :cpf 
                WHERE id = :id";
    
        $stmt = $this->conn->prepare($sql);
        
        return $stmt->execute([
            ':nome' => $usuario->nome,
            ':email' => $usuario->email,
            ':telefone' => $usuario->telefone,
            ':data_nascimento' => $usuario->data_nascimento,
            ':cpf' => $usuario->cpf,
            ':id' => $usuario->id
        ]);
    }

    public function alterarSenha(int $id, string $novaSenha): bool
    {
        $sql = "UPDATE usuario SET senha = :senha WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        
        $hashed = password_hash($novaSenha, PASSWORD_BCRYPT);
        
        return $stmt->execute([
            ':senha' => $hashed,
            ':id' => $id
        ]);
    }
}