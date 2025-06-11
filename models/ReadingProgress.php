<?php

class ReadingProgress
{
    public ?int $id = null;
    public int $usuario_id;
    public int $livro_id;
    public int $current_page;
    public int $total_pages;
    public float $progress_percentage;
    public ?string $last_read_at = null;
    public ?string $created_at = null;
    public ?string $updated_at = null;

    public function __construct(array $data = [])
    {
        $this->id = $data['id'] ?? null;
        $this->usuario_id = (int)($data['usuario_id'] ?? 0);
        $this->livro_id = (int)($data['livro_id'] ?? 0);
        $this->current_page = (int)($data['current_page'] ?? 1);
        $this->total_pages = (int)($data['total_pages'] ?? 1);
        $this->progress_percentage = (float)($data['progress_percentage'] ?? 0.0);
        $this->last_read_at = $data['last_read_at'] ?? null;
        $this->created_at = $data['created_at'] ?? null;
        $this->updated_at = $data['updated_at'] ?? null;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'usuario_id' => $this->usuario_id,
            'livro_id' => $this->livro_id,
            'current_page' => $this->current_page,
            'total_pages' => $this->total_pages,
            'progress_percentage' => $this->progress_percentage,
            'last_read_at' => $this->last_read_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
} 