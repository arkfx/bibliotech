<?php

namespace BiblioTech\Repositories;

use BiblioTech\Models\Livro;
use PDO;
use Exception;

class LivroRepository extends BaseRepository
{
    public function save(Livro $livro)
    {
        if ($livro->id) {
            return $this->update($livro);
        }

        $sql = "INSERT INTO livros (
                    titulo, autor, genero_id, preco, editora_id, descricao, imagem_url, pdf_url, created_at, updated_at
                ) VALUES (
                    :titulo, :autor, :genero_id, :preco, :editora_id, :descricao, :imagem_url, :pdf_url, NOW(), NOW()
                )";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':titulo'     => $livro->titulo,
            ':autor'      => $livro->autor,
            ':genero_id'  => $livro->genero_id,
            ':preco'      => $livro->preco,
            ':editora_id' => $livro->editora_id,
            ':descricao'  => $livro->descricao,
            ':imagem_url' => $livro->imagem_url,
            ':pdf_url'    => $livro->pdf_url,
        ]);

        $livro->id = $this->conn->lastInsertId();
        return $livro;
    }

    public function update(Livro $livro)
    {
        $sql = "UPDATE livros 
                SET titulo = :titulo, autor = :autor, genero_id = :genero_id, preco = :preco,
                    editora_id = :editora_id, descricao = :descricao, imagem_url = :imagem_url,
                    pdf_url = :pdf_url, updated_at = NOW()
                WHERE id = :id";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':id'         => $livro->id,
            ':titulo'     => $livro->titulo,
            ':autor'      => $livro->autor,
            ':genero_id'  => $livro->genero_id,
            ':preco'      => $livro->preco,
            ':editora_id' => $livro->editora_id,
            ':descricao'  => $livro->descricao,
            ':imagem_url' => $livro->imagem_url,
            ':pdf_url'    => $livro->pdf_url,
        ]);

        return $livro;
    }

    public function delete($id)
    {
        // Excluir registros relacionados ao livro
        $this->conn->prepare("DELETE FROM carrinho WHERE livro_id = :id")->execute([':id' => $id]);
        $this->conn->prepare("DELETE FROM pedido_itens WHERE livro_id = :id")->execute([':id' => $id]);
        $this->conn->prepare("DELETE FROM pedidos WHERE id IN (
        SELECT pedido_id FROM pedido_itens WHERE livro_id = :id
    )")->execute([':id' => $id]);

        // Excluir o livro
        $stmt = $this->conn->prepare("DELETE FROM livros WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            throw new Exception("Livro com ID $id não encontrado.");
        }

        return true;
    }

    public function findById($id): ?Livro
    {
        $sql = "
        SELECT 
            livros.*, 
            generos.nome AS genero_nome,
            editoras.nome AS editora_nome
        FROM livros
        INNER JOIN generos ON livros.genero_id = generos.id
        INNER JOIN editoras ON livros.editora_id = editoras.id
        WHERE livros.id = :id
        LIMIT 1
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', (int)$id, PDO::PARAM_INT);
        $stmt->execute();

        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$data) {
            return null;
        }

        return new Livro([
            'id'           => $data['id'],
            'titulo'       => $data['titulo'],
            'autor'        => $data['autor'],
            'genero_id'    => $data['genero_id'],
            'genero_nome'  => $data['genero_nome'],
            'preco'        => $data['preco'],
            'editora_id'   => $data['editora_id'],
            'editora_nome' => $data['editora_nome'],
            'descricao'    => $data['descricao'],
            'imagem_url'   => $data['imagem_url'],
            'pdf_url'      => $data['pdf_url'],
            'created_at'   => $data['created_at'],
            'updated_at'   => $data['updated_at'],
        ]);
    }
    public function search($termo = null, $genero_id = null, $ordem = 'DESC', $limite = 8, $offset = 0)
    {
        $sql = "SELECT 
                livros.*, 
                generos.nome AS genero_nome,
                editoras.nome AS editora_nome
            FROM livros
            LEFT JOIN generos ON livros.genero_id = generos.id
            LEFT JOIN editoras ON livros.editora_id = editoras.id
            WHERE 1=1";

        $params = [];

        if (!empty($termo)) {
            $sql .= " AND (LOWER(livros.titulo) LIKE :termo OR LOWER(livros.autor) LIKE :termo)";
            $params[':termo'] = '%' . strtolower($termo) . '%';
        }

        if (!empty($genero_id)) {
            $sql .= " AND livros.genero_id = :genero_id";
            $params[':genero_id'] = $genero_id;
        }

        $ordem = strtoupper($ordem) === 'ASC' ? 'ASC' : 'DESC';
        $sql .= " ORDER BY livros.created_at $ordem LIMIT :limite OFFSET :offset";

        $stmt = $this->conn->prepare($sql);

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->bindValue(':limite', (int)$limite, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);

        $stmt->execute();
        $results = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $results[] = new Livro($row);
        }

        return $results;
    }


    public function findAll()
    {
        $stmt = $this->conn->query("SELECT * FROM livros ORDER BY created_at DESC");
        $livros = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $livros[] = new Livro($row);
        }

        return $livros;
    }

    public function count($termo = null, $genero_id = null): int
    {
        $sql = "SELECT COUNT(*) FROM livros WHERE 1=1";
        $params = [];

        if (!empty($termo)) {
            $sql .= " AND (LOWER(titulo) LIKE :termo OR LOWER(autor) LIKE :termo)";
            $params[':termo'] = '%' . strtolower($termo) . '%';
        }

        if (!empty($genero_id)) {
            $sql .= " AND genero_id = :genero_id";
            $params[':genero_id'] = $genero_id;
        }

        $stmt = $this->conn->prepare($sql);

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->execute();
        return (int)$stmt->fetchColumn();
    }
}
