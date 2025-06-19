<?php

// Define o fuso horário padrão da aplicação.
date_default_timezone_set('America/Sao_Paulo');

// Inicia a sessão.
session_start();

// Carrega o autoloader do Composer, que torna a classe Dotenv disponível.
require_once __DIR__ . '/vendor/autoload.php';

// Usa a classe Dotenv do namespace global.
use Dotenv\Dotenv;

try {
    // Cria uma instância do Dotenv apontando para o diretório raiz do projeto.
    $dotenv = Dotenv::createImmutable(__DIR__);
    
    // Carrega as variáveis do .env para o ambiente ($_ENV, $_SERVER).
    $dotenv->load();

    // (Opcional, mas recomendado) Valida se as variáveis essenciais existem.
    // O script irá parar se alguma dessas variáveis não estiver no .env.
    $dotenv->required(['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASS', 'DB_DRIVER'])->notEmpty();

} catch (\Dotenv\Exception\InvalidPathException $e) {
    // Interrompe a execução se o arquivo .env não for encontrado.
    die("Erro Crítico: O arquivo de configuração '.env' não foi encontrado. Por favor, crie um a partir do '.env.example'.");
} catch (\RuntimeException $e) {
    // Captura erros de validação do ->required().
    die("Erro de Configuração: " . $e->getMessage());
}