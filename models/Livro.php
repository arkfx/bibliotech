<?php
class Livro
{
    public $id;
    public $titulo;
    public $autor;
    public $genero_id;
    public $genero_nome;
    public $preco;
    public $editora_id;
    public $editora_nome;
    public $descricao;
    public $imagem_url;
    public $pdf_url;
    public $created_at;
    public $updated_at;

    public function __construct($data = [])
    {
        $this->id = $data['id'] ?? null;
        $this->titulo = $data['titulo'] ?? '';
        $this->autor = $data['autor'] ?? '';
        $this->genero_id = $data['genero_id'] ?? null;
        $this->genero_nome = $data['genero_nome'] ?? null;
        $this->preco = $data['preco'] ?? 0.0;
        $this->editora_id = $data['editora_id'] ?? null;
        $this->editora_nome = $data['editora_nome'] ?? null;
        $this->descricao = $data['descricao'] ?? '';
        $this->imagem_url = $data['imagem_url'] ?? '';
        $this->pdf_url = $data['pdf_url'] ?? '';
        $this->created_at = $data['created_at'] ?? null;
        $this->updated_at = $data['updated_at'] ?? null;
    }

    public function toArray()
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'autor' => $this->autor,
            'genero_id' => $this->genero_id,
            'genero_nome' => $this->genero_nome,
            'preco' => $this->preco,
            'editora_id' => $this->editora_id,
            'editora_nome' => $this->editora_nome,
            'descricao' => $this->descricao,
            'imagem_url' => $this->imagem_url,
            'pdf_url' => $this->pdf_url, // ← AQUI
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
