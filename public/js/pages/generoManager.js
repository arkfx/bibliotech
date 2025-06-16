import { showToast } from '../utils/toast.js';
import { getGeneros, createGenero, updateGenero, deleteGenero } from '../api/genero.js';

class GeneroManager {
    constructor() {
        this.generos = [];
        this.modalGenero = document.getElementById('modalGenero');
        this.formGenero = document.querySelector('#modalGenero .form-genero');
        this.tabelaGenerosBody = document.getElementById('tabela-generos'); // tbody
        
        this.btnAdicionarGenero = document.getElementById('btnAdicionarGenero');
        this.closeButtons = document.querySelectorAll('#modalGenero .close-btn, #modalGenero .btn-cancel');
        this.generoIdInput = document.getElementById('genero-id-input');
        this.generoNomeInput = document.getElementById('genero-nome-input');
        this.modalTitulo = document.getElementById('modal-genero-titulo');
        
        this.init();
    }

    init() {
        this.carregarGeneros();
        
        if (this.btnAdicionarGenero) {
            this.btnAdicionarGenero.addEventListener('click', () => this.abrirModalCriar());
        }
        
        this.closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.fecharModal());
        });
        
        if (this.formGenero) {
            this.formGenero.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    async carregarGeneros() {
        try {
            const response = await getGeneros(); 
            if (response.status === 'success' && response.data) {
                this.generos = response.data;
                this.renderizarTabela();
                this.carregarSelectsGenero(); 
            } else {
                console.error('Resposta da API de gêneros não esperada:', response);
                showToast(response.message || 'Erro ao carregar gêneros da API.', 'error');
            }
        } catch (error) {
            console.error('Erro ao carregar gêneros:', error);
            showToast(error.message || 'Erro ao carregar gêneros.', 'error');
        }
    }

    renderizarTabela() {
        if (!this.tabelaGenerosBody) return;
        this.tabelaGenerosBody.innerHTML = '';
        
        this.generos.forEach(genero => {
            const tr = document.createElement('tr');
            const createdDate = genero.created_at ? new Date(genero.created_at).toLocaleDateString('pt-BR') : 'N/A';
            
            tr.innerHTML = `
                <td>${genero.id}</td>
                <td>${genero.nome}</td>
                <td>${createdDate}</td>
                <td class="acoes">
                    <button class="btn-edit" data-id="${genero.id}">Editar</button>
                    <button class="btn-delete" data-id="${genero.id}">Excluir</button>
                </td>
            `;
            
            const btnEdit = tr.querySelector('.btn-edit');
            const btnDelete = tr.querySelector('.btn-delete');
            
            btnEdit.addEventListener('click', () => this.abrirModalEditar(genero));
            btnDelete.addEventListener('click', () => this.confirmarExclusao(genero));
            
            this.tabelaGenerosBody.appendChild(tr);
        });
    }

    async carregarSelectsGenero() {
        const generoSelectLivroForm = document.querySelector('#modalCadastroLivro select#genero');
        if (generoSelectLivroForm) {
            const placeholder = generoSelectLivroForm.options[0]; // "Selecione o gênero"
            generoSelectLivroForm.innerHTML = '';
            if (placeholder) generoSelectLivroForm.appendChild(placeholder);
            
            this.generos.forEach(genero => {
                const option = document.createElement('option');
                option.value = genero.id;
                option.textContent = genero.nome;
                generoSelectLivroForm.appendChild(option);
            });
        }
    }

    abrirModalCriar() {
        if (!this.modalGenero) return;
        this.modalTitulo.textContent = 'Adicionar Gênero';
        this.generoIdInput.value = '';
        this.generoNomeInput.value = '';
        this.modalGenero.classList.remove('hidden');
    }

    abrirModalEditar(genero) {
        if (!this.modalGenero) return;
        this.modalTitulo.textContent = 'Editar Gênero';
        this.generoIdInput.value = genero.id;
        this.generoNomeInput.value = genero.nome;
        this.modalGenero.classList.remove('hidden');
    }

    fecharModal() {
        if (!this.modalGenero) return;
        this.modalGenero.classList.add('hidden');
    }

    async handleSubmit(e) {
        e.preventDefault();
        const id = this.generoIdInput.value;
        const nome = this.generoNomeInput.value.trim();
        const btnSave = this.formGenero.querySelector('.btn-save');

        if (!nome) {
            showToast('O nome do gênero é obrigatório.', 'error');
            return;
        }

        btnSave.classList.add('loading');
        btnSave.disabled = true;

        try {
            let result;
            if (id) {
                result = await updateGenero(id, nome);
            } else {
                result = await createGenero(nome);
            }
            
            if (result.status === 'success' || result.success) { 
                showToast(result.message, 'success');
                this.fecharModal();
                this.carregarGeneros();
            } else {
                showToast(result.message || 'Erro ao salvar gênero.', 'error');
            }
        } catch (error) {
            console.error('Erro ao salvar gênero:', error);
            showToast(error.message || 'Erro desconhecido ao salvar gênero.', 'error');
        } finally {
            btnSave.classList.remove('loading');
            btnSave.disabled = false;
        }
    }

    async confirmarExclusao(genero) {
        if (confirm(`Deseja realmente excluir o gênero "${genero.nome}"?`)) {
            try {
                const result = await deleteGenero(genero.id);
                if (result.status === 'success' || result.success) {
                    showToast(result.message, 'success');
                    this.carregarGeneros(); // Recarrega a tabela e os selects
                } else {
                    showToast(result.message || 'Erro ao excluir gênero.', 'error');
                }
            } catch (error) {
                console.error('Erro ao excluir gênero:', error);
                showToast(error.message || 'Erro desconhecido ao excluir gênero.', 'error');
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('section-generos')) {
         window.generoManager = new GeneroManager();
    }

    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    const adminSections = document.querySelectorAll('.admin-layout .admin-content');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSectionId = `section-${item.getAttribute('data-section')}`;

            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            adminSections.forEach(section => {
                if (section.id === targetSectionId) {
                    section.classList.remove('hidden');
                    if (targetSectionId === 'section-generos' && window.generoManager) {
                       window.generoManager.carregarGeneros(); 
                    }
                    if (targetSectionId === 'section-editoras' && window.editoraManager) {
                       window.editoraManager.carregarEditoras();
                    }

                } else {
                    section.classList.add('hidden');
                }
            });
        });
    });
});