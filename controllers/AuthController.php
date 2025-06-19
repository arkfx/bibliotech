<?php

namespace BiblioTech\Controllers;
use BiblioTech\Repositories\UsuarioRepository;
use BiblioTech\Core\Route;
use PDO;

class AuthController extends BaseController
{
    private UsuarioRepository $repo;

    public function __construct(private PDO $pdo)
    {
        session_start();
        $this->repo = new UsuarioRepository($pdo);
    }

    #[Route('/login', 'POST')]
    public function login()
    {
        $data = $this->getJsonInput();
        $email = trim($data['email'] ?? '');
        $senha = trim($data['senha'] ?? '');
        if ($email === '' || $senha === '') {
            return $this->response(400, ['status' => 'error', 'message' => 'Email e senha são obrigatórios.']);
        }

        $usuario = $this->repo->findByEmail($email);

        if (!$usuario || !password_verify($senha, $usuario->senha)) {
            return $this->response(401, ['status' => 'error', 'message' => 'Email ou senha incorretos.']);
        }

        $_SESSION['isLoggedIn'] = true;
        $_SESSION['userId'] = $usuario->id;
        $_SESSION['isAdmin'] = isset($usuario->cargo_id) && $usuario->cargo_id == 2;

        return $this->response(200, [
            'status' => 'success',
            'message' => 'Login realizado com sucesso!',
            'is_admin' => $_SESSION['isAdmin']
        ]);
    }

    #[Route('/logout', 'POST')]
    public function logout()
    {
        session_unset();
        session_destroy();

        return $this->response(200, [
            'status' => 'success',
            'message' => 'Logout realizado com sucesso.'
        ]);
    }

    #[Route('/session', 'GET')]
    public function status()
    {
        if ($this->isAuthenticated()) {
            return $this->response(200, [
                'status' => 'success',
                'isLoggedIn' => true,
                'isAdmin' => $_SESSION['isAdmin'] ?? false,
                'userId' => $_SESSION['userId'] ?? null
            ]);
        }

        return $this->response(200, [
            'status' => 'success',
            'isLoggedIn' => false,
            'isAdmin' => false,
            'userId' => null
        ]);
    }
}
