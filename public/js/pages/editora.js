/**
 * Arquivo de gerenciamento de editoras
 */

import { showToast } from '../utils/toast.js';
import { 
    getAllEditoras, 
    getEditoraById, 
    createEditora, 
    updateEditora, 
    deleteEditora 
} from '../api/editora.js';

class EditoraManager {
    constructor() {
        this.editoras = [];
        this.modalEditora = document.getElementById('modalEditora');
        this.formEditora = document.querySelector('.form-editora');
        this.tabela = document.getElementById('tabela-editoras');
        
        // Botões e elementos
        this.btnAdicionarEditora = document.getElementById('btnAdicionarEditora');
        this.closeButtons = document.querySelectorAll('#modalEditora .close-btn, #modalEditora .btn-cancel');
        this.editoraIdInput = document.getElementById('editora-id');
        this.editoraNomeInput = document.getElementById('editora-nome');
        this.modalTitulo = document.getElementById('modal-editora-titulo');
        
        this.init();
    }
    
    init() {
        // Carregar editoras
        this.carregarEditoras();
        
        // Event listeners
        if (this.btnAdicionarEditora) {
            this.btnAdicionarEditora.addEventListener('click', () => this.abrirModalCriar());
        }
        
        this.closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.fecharModal());
        });
        
        if (this.formEditora) {
            this.formEditora.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }
    
    async carregarEditoras() {
        try {
            const data = await getAllEditoras();
            
            if (data.success) {
                this.editoras = data.data;
                this.renderizarTabela();
                this.carregarSelectsEditora();
            }
        } catch (error) {
            console.error('Erro ao carregar editoras:', error);
            showToast('Erro ao carregar editoras', 'error');
        }
    }
    
    renderizarTabela() {
        if (!this.tabela) return;
        
        this.tabela.innerHTML = '';
        
        this.editoras.forEach(editora => {
            const tr = document.createElement('tr');
            
            // Formatar data
            const createdDate = new Date(editora.created_at);
            const formattedDate = createdDate.toLocaleDateString('pt-BR');
            
            tr.innerHTML = `
                <td>${editora.id}</td>
                <td>${editora.nome}</td>
                <td>${formattedDate}</td>
                <td class="acoes">
                    <button class="btn-edit" data-id="${editora.id}">Editar</button>
                    <button class="btn-delete" data-id="${editora.id}">Excluir</button>
                </td>
            `;
            
            // Adicionar event listeners aos botões
            const btnEdit = tr.querySelector('.btn-edit');
            const btnDelete = tr.querySelector('.btn-delete');
            
            btnEdit.addEventListener('click', () => this.abrirModalEditar(editora));
            btnDelete.addEventListener('click', () => this.confirmarExclusao(editora));
            
            this.tabela.appendChild(tr);
        });
    }
    
    async carregarSelectsEditora() {
        // Carregar todos os selects de editora na página
        const selects = document.querySelectorAll('select#editora');
        
        selects.forEach(select => {
            // Manter apenas a primeira opção (placeholder)
            const placeholder = select.options[0];
            select.innerHTML = '';
            select.appendChild(placeholder);
            
            // Adicionar as editoras como opções
            this.editoras.forEach(editora => {
                const option = document.createElement('option');
                option.value = editora.id;
                option.textContent = editora.nome;
                select.appendChild(option);
            });
        });
    }
    
    abrirModalCriar() {
        this.modalTitulo.textContent = 'Adicionar Editora';
        this.editoraIdInput.value = '';
        this.editoraNomeInput.value = '';
        this.modalEditora.classList.remove('hidden');
    }
    
    abrirModalEditar(editora) {
        this.modalTitulo.textContent = 'Editar Editora';
        this.editoraIdInput.value = editora.id;
        this.editoraNomeInput.value = editora.nome;
        this.modalEditora.classList.remove('hidden');
    }
    
    fecharModal() {
        this.modalEditora.classList.add('hidden');
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const id = this.editoraIdInput.value;
        const nome = this.editoraNomeInput.value;
        const btnSave = this.formEditora.querySelector('.btn-save');
        
        if (!nome.trim()) {
            showToast('O nome da editora é obrigatório', 'error');
            return;
        }

        btnSave.classList.add('loading');
        btnSave.disabled = true;
        
        try {
            let result;
            
            // Se tem ID, é edição, senão é criação
            if (id) {
                result = await updateEditora(id, nome);
            } else {
                result = await createEditora(nome);
            }
            
            if (result.success) {
                showToast(result.message, 'success');
                this.fecharModal();
                this.carregarEditoras();
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            console.error('Erro ao salvar editora:', error);
            showToast(error.message || 'Erro ao salvar editora', 'error');
        } finally {
            btnSave.classList.remove('loading');
            btnSave.disabled = false;
        }
    }
    
    async confirmarExclusao(editora) {
        if (confirm(`Deseja realmente excluir a editora "${editora.nome}"?`)) {
            try {

                const result = await deleteEditora(editora.id);
                
                if (result.success) {
                    showToast(result.message, 'success');
                    this.carregarEditoras();
                } else {
                    showToast(result.message, 'error');
                }
            } catch (error) {
                console.error('Erro ao excluir editora:', error);
                showToast(error.message || 'Erro ao excluir editora', 'error');
            }
        }
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const editoraManager = new EditoraManager();
    
    // Exportar para uso global
    window.editoraManager = editoraManager;
    
    // Event listeners para navegação entre seções do admin
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.admin-content');
    
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSection = item.getAttribute('data-section');
            
            // Atualizar classes dos itens do menu
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Mostrar seção correspondente
            sections.forEach(section => {
                if (section.id === `section-${targetSection}`) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });
            
            // Se a seção for editoras, recarregar os dados
            if (targetSection === 'editoras') {
                editoraManager.carregarEditoras();
            }
        });
    });
}); 