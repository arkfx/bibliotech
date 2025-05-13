import { API_BASE } from '../config.js';
import { obterUserId } from '../utils/auth-utils.js';

const BASE_URL = `${API_BASE}/lista_desejos.php`;

export async function getListaDesejos(usuarioId) {
    const response = await fetch(`${BASE_URL}?usuario_id=${usuarioId}`);
    return response.json();
}

export async function adicionarLivroListaDesejos(livroId) {
    const usuarioId = await obterUserId();
    if (!usuarioId) {
        throw new Error('Usuário não está logado');
    }

    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuarioId, livro_id: livroId })
    });
    return response.json();
}

export async function removerLivroListaDesejos(livroId) {
    const usuarioId = await obterUserId();
    if (!usuarioId) {
        throw new Error('Usuário não está logado');
    }

    const response = await fetch(BASE_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `usuario_id=${usuarioId}&livro_id=${livroId}`
    });
    return response.json();
}
