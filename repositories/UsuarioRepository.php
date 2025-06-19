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
        $sql = "INSERT INTO usuario (nome, email, senha, telefone, data_nascimento, cpf) 
                VALUES (:nome, :email, :senha, :telefone, :data_nascimento, :cpf)";
        $stmt = $this->conn->prepare($sql);

        $hashed = password_hash($usuario->senha, PASSWORD_BCRYPT);

        $stmt->bindValue(':nome', $usuario->nome);
        $stmt->bindValue(':email', $usuario->email);
        $stmt->bindValue(':senha', $hashed);
        $stmt->bindValue(':telefone', $usuario->telefone ?? null, PDO::PARAM_NULL);
        $stmt->bindValue(':data_nascimento', $usuario->data_nascimento ?? null, PDO::PARAM_NULL);
        $stmt->bindValue(':cpf', $usuario->cpf ?? null, PDO::PARAM_NULL);

        $success = $stmt->execute();
        $stmt->closeCursor();
        return $success;
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
        
        $stmt->bindValue(':nome', $usuario->nome);
        $stmt->bindValue(':email', $usuario->email);
        $stmt->bindValue(':telefone', $usuario->telefone, $usuario->telefone !== null ? PDO::PARAM_STR : PDO::PARAM_NULL);
        $stmt->bindValue(':data_nascimento', $usuario->data_nascimento, $usuario->data_nascimento !== null ? PDO::PARAM_STR : PDO::PARAM_NULL);
        $stmt->bindValue(':cpf', $usuario->cpf, $usuario->cpf !== null ? PDO::PARAM_STR : PDO::PARAM_NULL);
        $stmt->bindValue(':id', $usuario->id, PDO::PARAM_INT);
    
        return $stmt->execute();
    }

    public function alterarSenha(int $id, string $novaSenha): bool
    {
        $sql = "UPDATE usuario SET senha = :senha WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        
        $hashed = password_hash($novaSenha, PASSWORD_BCRYPT);
        
        $stmt->bindValue(':senha', $hashed);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        
        return $stmt->execute();
    }
}