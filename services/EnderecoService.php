<?php

namespace BiblioTech\Services;

use BiblioTech\Models\Endereco;
use BiblioTech\Repositories\EnderecoRepository;
use Exception;

class EnderecoService
{
    private EnderecoRepository $enderecoRepository;

    public function __construct(EnderecoRepository $enderecoRepository)
    {
        $this->enderecoRepository = $enderecoRepository;
    }

    public function criar(array $data, int $usuarioId): int
    {
        $this->validarDadosEndereco($data);

        // Verifica se é o primeiro endereço ou se foi marcado como principal
        $enderecosExistentes = $this->enderecoRepository->buscarPorUsuario($usuarioId);
        $isPrincipal = isset($data['is_principal']) ? (bool) $data['is_principal'] : empty($enderecosExistentes);

        $endereco = new Endereco([
            'usuario_id' => $usuarioId,
            'endereco' => trim($data['endereco']),
            'numero' => trim($data['numero']),
            'complemento' => isset($data['complemento']) ? trim($data['complemento']) : null,
            'bairro' => trim($data['bairro']),
            'cidade' => trim($data['cidade']),
            'estado' => strtoupper(trim($data['estado'])),
            'cep' => isset($data['cep']) ? preg_replace('/\D/', '', $data['cep']) : null,
            'is_principal' => $isPrincipal,
        ]);

        $enderecoId = $this->enderecoRepository->criar($endereco);

        // Se foi marcado como principal, atualiza os outros endereços
        if ($isPrincipal && !empty($enderecosExistentes)) {
            $this->enderecoRepository->definirComoPrincipal($enderecoId, $usuarioId);
        }

        return $enderecoId;
    }

    public function buscarPorId(int $id, int $usuarioId): ?Endereco
    {
        $endereco = $this->enderecoRepository->buscarPorId($id);

        if (!$endereco || $endereco->usuario_id !== $usuarioId) {
            return null;
        }

        return $endereco;
    }

    public function listarPorUsuario(int $usuarioId): array
    {
        return $this->enderecoRepository->buscarPorUsuario($usuarioId);
    }

    public function buscarPrincipal(int $usuarioId): ?Endereco
    {
        return $this->enderecoRepository->buscarPrincipalDoUsuario($usuarioId);
    }

    public function atualizar(int $id, array $data, int $usuarioId): bool
    {
        $endereco = $this->buscarPorId($id, $usuarioId);
        if (!$endereco) {
            throw new Exception('Endereço não encontrado ou não pertence ao usuário.');
        }

        $this->validarDadosEndereco($data);

        // Atualiza os dados do endereço
        $endereco->endereco = trim($data['endereco']);
        $endereco->numero = trim($data['numero']);
        $endereco->complemento = isset($data['complemento']) ? trim($data['complemento']) : null;
        $endereco->bairro = trim($data['bairro']);
        $endereco->cidade = trim($data['cidade']);
        $endereco->estado = strtoupper(trim($data['estado']));
        $endereco->cep = isset($data['cep']) ? preg_replace('/\D/', '', $data['cep']) : null;

        // Gerencia o status principal
        if (isset($data['is_principal']) && (bool) $data['is_principal']) {
            $endereco->is_principal = true;
            $this->enderecoRepository->definirComoPrincipal($id, $usuarioId);
        }

        return $this->enderecoRepository->atualizar($endereco);
    }

    public function definirComoPrincipal(int $enderecoId, int $usuarioId): bool
    {
        $endereco = $this->buscarPorId($enderecoId, $usuarioId);
        if (!$endereco) {
            throw new Exception('Endereço não encontrado ou não pertence ao usuário.');
        }

        return $this->enderecoRepository->definirComoPrincipal($enderecoId, $usuarioId);
    }

    public function excluir(int $id, int $usuarioId): bool
    {
        $endereco = $this->buscarPorId($id, $usuarioId);
        if (!$endereco) {
            throw new Exception('Endereço não encontrado ou não pertence ao usuário.');
        }

        // Verifica se é o endereço principal e se existem outros endereços
        $enderecosDoUsuario = $this->enderecoRepository->buscarPorUsuario($usuarioId);
        
        if ($endereco->is_principal && count($enderecosDoUsuario) > 1) {
            // Define outro endereço como principal antes de excluir
            foreach ($enderecosDoUsuario as $outroEndereco) {
                if ($outroEndereco->id !== $id) {
                    $this->enderecoRepository->definirComoPrincipal($outroEndereco->id, $usuarioId);
                    break;
                }
            }
        }

        return $this->enderecoRepository->excluir($id);
    }

    public function validarEnderecoCompleto(int $usuarioId): bool
    {
        $enderecoPrincipal = $this->buscarPrincipal($usuarioId);
        
        if (!$enderecoPrincipal) {
            return false;
        }

        // Verifica se todos os campos obrigatórios estão preenchidos
        return !empty($enderecoPrincipal->endereco) &&
               !empty($enderecoPrincipal->numero) &&
               !empty($enderecoPrincipal->bairro) &&
               !empty($enderecoPrincipal->cidade) &&
               !empty($enderecoPrincipal->estado);
    }

    public function formatarEnderecoParaExibicao(Endereco $endereco): string
    {
        return $endereco->getEnderecoCompleto();
    }

    public function buscarOuCriarPadrao(int $usuarioId, array $dadosFormulario): Endereco
    {
        // Busca o endereço principal existente
        $enderecoPrincipal = $this->buscarPrincipal($usuarioId);

        if ($enderecoPrincipal) {
            // Atualiza o endereço existente com os novos dados
            $this->atualizar($enderecoPrincipal->id, $dadosFormulario, $usuarioId);
            return $this->buscarPorId($enderecoPrincipal->id, $usuarioId);
        } else {
            // Cria um novo endereço principal
            $enderecoId = $this->criar($dadosFormulario, $usuarioId);
            return $this->buscarPorId($enderecoId, $usuarioId);
        }
    }

    private function validarDadosEndereco(array $data): void
    {
        $camposObrigatorios = ['endereco', 'numero', 'bairro', 'cidade', 'estado'];
        
        foreach ($camposObrigatorios as $campo) {
            if (empty($data[$campo]) || trim($data[$campo]) === '') {
                throw new Exception("O campo {$campo} é obrigatório.");
            }
        }

        // Validação específica do estado (2 caracteres)
        if (strlen(trim($data['estado'])) !== 2) {
            throw new Exception('O estado deve ter exatamente 2 caracteres.');
        }

        // Validação do CEP se fornecido
        if (isset($data['cep']) && !empty($data['cep'])) {
            $cepLimpo = preg_replace('/\D/', '', $data['cep']);
            if (strlen($cepLimpo) !== 8) {
                throw new Exception('CEP deve ter 8 dígitos.');
            }
        }

        // Validação de tamanhos máximos
        $limitesCaracteres = [
            'endereco' => 255,
            'numero' => 20,
            'complemento' => 100,
            'bairro' => 100,
            'cidade' => 100
        ];

        foreach ($limitesCaracteres as $campo => $limite) {
            if (isset($data[$campo]) && strlen(trim($data[$campo])) > $limite) {
                throw new Exception("O campo {$campo} deve ter no máximo {$limite} caracteres.");
            }
        }
    }
}