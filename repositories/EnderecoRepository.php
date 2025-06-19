<?php

namespace BiblioTech\Repositories;
use BiblioTech\Models\Endereco;
use PDO;

class EnderecoRepository extends BaseRepository
{
    public function criar(Endereco $endereco): int
    {
        $sql = "INSERT INTO endereco (usuario_id, endereco, numero, complemento, bairro, cidade, estado, cep, is_principal) 
                VALUES (:usuario_id, :endereco, :numero, :complemento, :bairro, :cidade, :estado, :cep, :is_principal)";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':usuario_id' => $endereco->usuario_id,
            ':endereco' => $endereco->endereco,
            ':numero' => $endereco->numero,
            ':complemento' => $endereco->complemento,
            ':bairro' => $endereco->bairro,
            ':cidade' => $endereco->cidade,
            ':estado' => $endereco->estado,
            ':cep' => $endereco->cep,
            ':is_principal' => $endereco->is_principal ? 1 : 0,
        ]);

        return (int) $this->conn->lastInsertId();
    }

    public function buscarPorUsuario(int $usuarioId): array
    {
        $sql = "SELECT * FROM endereco WHERE usuario_id = :usuario_id ORDER BY is_principal DESC, created_at DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':usuario_id' => $usuarioId]);
        
        $enderecos = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $enderecos[] = new Endereco($row);
        }
        
        return $enderecos;
    }

    public function buscarPorId(int $id): ?Endereco
    {
        $sql = "SELECT * FROM endereco WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':id' => $id]);
        
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $data ? new Endereco($data) : null;
    }

    public function buscarPrincipalDoUsuario(int $usuarioId): ?Endereco
    {
        $sql = "SELECT * FROM endereco WHERE usuario_id = :usuario_id AND is_principal = 1 LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':usuario_id' => $usuarioId]);
        
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $data ? new Endereco($data) : null;
    }

    public function definirComoPrincipal(int $enderecoId, int $usuarioId): bool
    {
        // Primeiro, remove o status principal de todos os endereços do usuário
        $sql1 = "UPDATE endereco SET is_principal = 0 WHERE usuario_id = :usuario_id";
        $stmt1 = $this->conn->prepare($sql1);
        $stmt1->execute([':usuario_id' => $usuarioId]);

        // Depois define o endereço especificado como principal
        $sql2 = "UPDATE endereco SET is_principal = 1 WHERE id = :id AND usuario_id = :usuario_id";
        $stmt2 = $this->conn->prepare($sql2);
        
        return $stmt2->execute([':id' => $enderecoId, ':usuario_id' => $usuarioId]);
    }

    public function atualizar(Endereco $endereco): bool
    {
        $sql = "UPDATE endereco SET 
                endereco = :endereco, 
                numero = :numero, 
                complemento = :complemento, 
                bairro = :bairro, 
                cidade = :cidade, 
                estado = :estado, 
                cep = :cep,
                is_principal = :is_principal,
                updated_at = CURRENT_TIMESTAMP
                WHERE id = :id";
        
        $stmt = $this->conn->prepare($sql);
        
        return $stmt->execute([
            ':endereco' => $endereco->endereco,
            ':numero' => $endereco->numero,
            ':complemento' => $endereco->complemento,
            ':bairro' => $endereco->bairro,
            ':cidade' => $endereco->cidade,
            ':estado' => $endereco->estado,
            ':cep' => $endereco->cep,
            ':is_principal' => $endereco->is_principal ? 1 : 0,
            ':id' => $endereco->id,
        ]);
    }

    public function excluir(int $id): bool
    {
        $sql = "DELETE FROM endereco WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        
        return $stmt->execute([':id' => $id]);
    }
}