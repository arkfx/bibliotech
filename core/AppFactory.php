<?php

namespace BiblioTech\Core;

use BiblioTech\Repositories\BibliotecaRepository;
use BiblioTech\Repositories\CarrinhoRepository;
use BiblioTech\Repositories\EditoraRepository;
use BiblioTech\Repositories\GeneroRepository;
use BiblioTech\Repositories\ListaDesejoRepository;
use BiblioTech\Repositories\LivroRepository;
use BiblioTech\Repositories\PedidoItemRepository;
use BiblioTech\Repositories\PedidoRepository;
use BiblioTech\Repositories\ReadingProgressRepository;
use BiblioTech\Repositories\UsuarioRepository;
use BiblioTech\Repositories\EnderecoRepository;
use BiblioTech\Services\BibliotecaService;
use BiblioTech\Services\CarrinhoService;
use BiblioTech\Services\EditoraService;
use BiblioTech\Services\GeneroService;
use BiblioTech\Services\ListaDesejoService;
use BiblioTech\Services\LivroService;
use BiblioTech\Services\PedidoService;
use BiblioTech\Services\ProgressoLeituraService;
use BiblioTech\Services\UsuarioService;
use BiblioTech\Services\EnderecoService;
use PDO;


class AppFactory
{
    private static ?PDO $pdo = null;


    private static function getConnection(): PDO
    {
        if (self::$pdo === null) {
            $dbHost = $_ENV['DB_HOST'];
            $dbPort = $_ENV['DB_PORT'];
            $dbName = $_ENV['DB_NAME'];
            $dbUser = $_ENV['DB_USER'];
            $dbPass = $_ENV['DB_PASSWORD'];

            self::$pdo = new PDO("pgsql:host=$dbHost;port=$dbPort;dbname=$dbName", $dbUser, $dbPass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        }
        return self::$pdo;
    }

    public static function getConnectionInstance(): PDO
    {
        return self::getConnection();
    }

    public static function createCarrinhoService(): CarrinhoService
    {
        $conn = self::getConnection();
        return new CarrinhoService(
            new CarrinhoRepository($conn),
            new LivroRepository($conn),
            new BibliotecaRepository($conn)
        );
    }

    public static function createPedidoService(): PedidoService
    {
        $conn = self::getConnection();
        return new PedidoService(
            new PedidoRepository($conn),
            new PedidoItemRepository($conn),
            new CarrinhoRepository($conn),
            new LivroRepository($conn),
            new BibliotecaRepository($conn)
        );
    }

    public static function createUsuarioService(): UsuarioService
    {
        $conn = self::getConnection();
        return new UsuarioService(new UsuarioRepository($conn));
    }

    public static function createLivroService(): LivroService
    {
        $conn = self::getConnection();
        return new LivroService(
            new LivroRepository($conn),
            new EditoraRepository($conn),
            new GeneroRepository($conn)
        );
    }

    public static function createGeneroService(): GeneroService
    {
        $conn = self::getConnection();
        return new GeneroService(new GeneroRepository($conn));
    }

    public static function createEditoraService(): EditoraService
    {
        $conn = self::getConnection();
        return new EditoraService(new EditoraRepository($conn));
    }

    public static function createListaDesejoService(): ListaDesejoService
    {
        $conn = self::getConnection();
        return new ListaDesejoService(new ListaDesejoRepository($conn));
    }

    public static function createBibliotecaService(): BibliotecaService
    {
        $conn = self::getConnection();
        return new BibliotecaService(new BibliotecaRepository($conn));
    }

    public static function createProgressoLeituraService(): ProgressoLeituraService
    {
        $conn = self::getConnection();
        return new ProgressoLeituraService(new ReadingProgressRepository($conn));
    }

    public function createEnderecoService(): EnderecoService // ...existing code...
    {
        $conn = self::getConnection();
        return new EnderecoService(new EnderecoRepository($conn));
    }
}
