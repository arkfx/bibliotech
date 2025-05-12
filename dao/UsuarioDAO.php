<?php
class UsuarioDAO
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function getUsuarioByEmail($email): array
    {
        $query = "SELECT * FROM usuario WHERE email = :email";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result ? $result : [];
    }

    public function createUsuario($usuario): bool
    {
        $query = "INSERT INTO usuario (nome, email, senha) VALUES (:nome, :email, :senha)";
        $stmt = $this->conn->prepare($query);

        $hashedPassword = password_hash($usuario['senha'], PASSWORD_BCRYPT);

        $stmt->bindParam(':nome', $usuario['nome']);
        $stmt->bindParam(':email', $usuario['email']);
        $stmt->bindParam(':senha', $hashedPassword);

        return $stmt->execute();
    }
}
