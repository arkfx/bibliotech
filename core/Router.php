<?php

namespace BiblioTech\Core;
use BiblioTech\Core\Route;  
use ReflectionClass;
use ReflectionMethod;

class Router
{
    private array $routes = [];

    public function register(string $controllerClass): void
    {
        $reflection = new ReflectionClass($controllerClass);

        foreach ($reflection->getMethods(ReflectionMethod::IS_PUBLIC) as $method) {
            $attributes = $method->getAttributes(Route::class);

            foreach ($attributes as $attr) {
                /** @var Route $route */
                $route = $attr->newInstance();

                $pattern = preg_replace('#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#', '(?P<\1>[^/]+)', $route->path);
                $pattern = "#^{$pattern}$#";

                $this->routes[] = [
                    'pattern' => $pattern,
                    'method' => strtoupper($route->method),
                    'controller' => $controllerClass,
                    'action' => $method->getName()
                ];
            }
        }
    }

    public function dispatch(string $requestUri, string $requestMethod, $pdo): void
    {
        $path = parse_url($requestUri, PHP_URL_PATH);
        
        // Handle multiple possible base paths
        $possibleBasePaths = [
            '/bibliotech/public',
            '/bibliotech',
            ''
        ];
        
        foreach ($possibleBasePaths as $basePath) {
            if ($basePath && str_starts_with($path, $basePath)) {
                $path = substr($path, strlen($basePath));
                break;
            }
        }
        
        // Ensure path starts with /
        if (!str_starts_with($path, '/')) {
            $path = '/' . $path;
        }

        $method = strtoupper($requestMethod);

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) continue;

            if (preg_match($route['pattern'], $path, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                $controller = new $route['controller']($pdo);
                call_user_func_array([$controller, $route['action']], $params);
                return;
            }
        }

        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Rota não encontrada.']);
    }
}
