// script.js - Script que carrega o modal dinamicamente

document.addEventListener('DOMContentLoaded', function() {
    const btnCadastrar = document.getElementById('cadastrar-livro');
    const modalBackdrop = document.getElementById('modal-backdrop');
    
    // Função para carregar o modal
    async function carregarModal() {
        try {
            // Carregar o HTML do modal
            const response = await fetch('../view/cadastrar-livros.html');
            if (!response.ok) {
                throw new Error('Não foi possível carregar o modal');
            }
            
            const htmlModal = await response.text();
            
            // Inserir o HTML do modal no backdrop
            modalBackdrop.innerHTML = htmlModal;
            
            // Mostrar o modal
            modalBackdrop.style.display = 'flex';
            
            // Configurar os eventos do modal depois que ele for carregado
            configurarEventosModal();
            
        } catch (error) {
            console.error('Erro ao carregar o modal:', error);
            alert('Não foi possível carregar o formulário de cadastro. Por favor, tente novamente.');
        }
    }
    
    // Função para configurar os eventos do modal
    function configurarEventosModal() {
        const btnFechar = document.getElementById('fechar-modal');
        const btnLimpar = document.getElementById('limpar-campos');
        const btnSalvar = document.getElementById('salvar');
        const form = document.getElementById('form-cadastro');
        const fileInputs = document.querySelectorAll('.file-input');
        
        // Evento para fechar o modal
        btnFechar.addEventListener('click', fecharModal);
        
        // Evento para limpar campos
        btnLimpar.addEventListener('click', function() {
            form.reset();
        });
        
        // Evento para salvar
        btnSalvar.addEventListener('click', function() {
            alert('Livro cadastrado com sucesso!');
            fecharModal();
        });
        
        // Fechar o modal ao clicar fora dele
        modalBackdrop.addEventListener('click', function(event) {
            if (event.target === modalBackdrop) {
                fecharModal();
            }
        });
        
        // Evitar que o formulário seja enviado
        form.addEventListener('submit', function(event) {
            event.preventDefault();
        });
        
        // Funcionalidade para os botões de upload de arquivo
        fileInputs.forEach(function(input) {
            input.addEventListener('click', function() {
                alert('Função de upload não implementada nesta demonstração');
            });
        });
    }
    
    // Função para fechar o modal
    function fecharModal() {
        modalBackdrop.style.display = 'none';
    }
    
    // Adicionar evento para abrir o modal ao clicar no botão
    btnCadastrar.addEventListener('click', carregarModal);
});