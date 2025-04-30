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

        return $result ? $result : []; //retorna o resultado ou um array vazio
    }

    public function createUsuario($usuario): array
    {
        $query = "INSERT INTO usuario (nome, email, senha) VALUES (:nome, :email, :senha)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':nome', $usuario['nome']);
        $stmt->bindParam(':email', $usuario['email']);
        $stmt->bindParam(':senha', password_hash($usuario['senha'], PASSWORD_BCRYPT));

        if ($stmt->execute()) {
            return ['status' => 'success', 'message' => 'Usuario created successfully.'];
        } else {
            return ['status' => 'error', 'message' => 'Failed to create usuario.'];
        }
    }
}
