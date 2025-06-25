<?php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../core/env.php';

use BiblioTech\Core\AppFactory;
use BiblioTech\Core\Router;
use function BiblioTech\Core\loadEnv;

loadEnv(__DIR__ . '/../.env');

$appFactory = new AppFactory();

$router = new Router();

$controllerDir = __DIR__ . '/../Controllers';
$namespace = 'BiblioTech\\Controllers';

foreach (scandir($controllerDir) as $file) {
    if (
        str_ends_with($file, 'Controller.php') &&
        is_file($controllerDir . DIRECTORY_SEPARATOR . $file)
    ) {
        $className = pathinfo($file, PATHINFO_FILENAME);
        $fullClass = $namespace . '\\' . $className;

        if (class_exists($fullClass)) {
            $router->register($fullClass);
        }
    }
}

$router->dispatch($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD'], $appFactory);
