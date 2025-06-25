import { 
  listarEnderecos, 
  criarEndereco, 
  atualizarEndereco, 
  definirEnderecoPrincipal,
  excluirEndereco
} from '../../../api/endereco.js';
import { showToast } from '../../../utils/toast.js';

// Estado da aplicação
let enderecosUsuario = [];
let editandoEndereco = null;
let enderecoParaExcluir = null;

// Elementos do DOM
let enderecosLista, enderecosVazio, formularioEndereco, formEndereco;
let btnNovoEndereco, btnPrimeiroEndereco, btnCancelarEndereco, btnCancelarForm, btnSalvarEndereco, formTitulo;

export async function inicializarGerenciadorEnderecos() {
  console.log('Inicializando gerenciador de endereços...');
  
  // Buscar elementos do DOM
  enderecosLista = document.getElementById('enderecos-lista');
  enderecosVazio = document.getElementById('enderecos-vazio');
  formularioEndereco = document.getElementById('formulario-endereco');
  formEndereco = document.getElementById('endereco-form');
  btnNovoEndereco = document.getElementById('btn-novo-endereco');
  btnPrimeiroEndereco = document.getElementById('btn-primeiro-endereco');
  btnCancelarEndereco = document.getElementById('btn-cancelar-endereco');
  btnCancelarForm = document.getElementById('btn-cancelar-form');
  btnSalvarEndereco = document.getElementById('btn-salvar-endereco');
  formTitulo = document.getElementById('form-titulo');

  console.log('Elementos encontrados:', {
    enderecosLista: !!enderecosLista,
    btnNovoEndereco: !!btnNovoEndereco,
    btnPrimeiroEndereco: !!btnPrimeiroEndereco,
    formularioEndereco: !!formularioEndereco
  });

  // Verificar se os elementos existem
  if (!enderecosLista || !btnNovoEndereco || !formularioEndereco) {
    console.error('Elementos necessários não encontrados no DOM');
    return;
  }

  // Adicionar event listeners
  btnNovoEndereco.addEventListener('click', abrirFormularioNovoEndereco);
  btnPrimeiroEndereco?.addEventListener('click', abrirFormularioNovoEndereco);
  btnCancelarEndereco?.addEventListener('click', cancelarFormulario);
  btnCancelarForm?.addEventListener('click', cancelarFormulario);
  formEndereco?.addEventListener('submit', salvarEndereco);

  // Formatação automática do CEP
  const cepInput = document.getElementById('cep');
  if (cepInput) {
    cepInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 5) {
        value = value.replace(/^(\d{5})(\d{1,3})/, '$1-$2');
      }
      e.target.value = value;
    });
  }

  console.log('Event listeners adicionados, carregando endereços...');
  
  // Carregar endereços
  await carregarEnderecos();
}

// Função para carregar e exibir endereços
async function carregarEnderecos() {
  try {
    console.log('Carregando endereços da API...');
    const response = await listarEnderecos();
    
    if (response.status === 'success') {
      enderecosUsuario = response.data || [];
      console.log('Endereços carregados:', enderecosUsuario);
      renderizarEnderecos();
    } else {
      console.error('Erro ao carregar endereços:', response.message);
      enderecosUsuario = [];
      renderizarEnderecos();
    }
  } catch (error) {
    console.error('Erro ao carregar endereços:', error);
    enderecosUsuario = [];
    renderizarEnderecos();
  }
}

// Função para renderizar a lista de endereços
function renderizarEnderecos() {
  console.log('Renderizando endereços, quantidade:', enderecosUsuario.length);
  
  if (enderecosUsuario.length === 0) {
    // Mostrar estado vazio
    enderecosLista.classList.add('hidden');
    enderecosVazio.classList.remove('hidden');
  } else {
    // Mostrar lista de endereços
    enderecosLista.classList.remove('hidden');
    enderecosVazio.classList.add('hidden');
    
    enderecosLista.innerHTML = '';
    
    // Primeiro os endereços principais
    const principal = enderecosUsuario.find(e => e.is_principal);
    const outrosEnderecos = enderecosUsuario.filter(e => !e.is_principal);
    
    // Renderizar o endereço principal primeiro, se existir
    if (principal) {
      const enderecoElement = criarElementoEndereco(principal, true);
      enderecosLista.appendChild(enderecoElement);
    }
    
    // Renderizar os outros endereços
    outrosEnderecos.forEach((endereco) => {
      const enderecoElement = criarElementoEndereco(endereco, false);
      enderecosLista.appendChild(enderecoElement);
    });
  }
}

// Função para criar elemento de endereço
function criarElementoEndereco(endereco, isPrincipal) {
  const div = document.createElement('div');
  div.className = `address-item ${isPrincipal ? 'principal' : ''}`;
  div.dataset.enderecoId = endereco.id;
  
  div.innerHTML = `
    <div class="address-header">
      <h3>${isPrincipal ? '🏠 Endereço Principal' : '📍 Endereço Secundário'}</h3>
      <div class="address-actions">
        <button class="btn-icon edit-address" data-id="${endereco.id}" title="Editar endereço">✏️</button>
        ${!isPrincipal ? 
          `<button class="btn-icon set-principal" data-id="${endereco.id}" title="Definir como principal">🏠</button>` 
          : ''}
        ${enderecosUsuario.length > 1 ? 
          `<button class="btn-icon delete-address" data-id="${endereco.id}" title="Excluir endereço">🗑️</button>` 
          : ''}
      </div>
    </div>
    <div class="address-details">
      <p><strong>${endereco.endereco}, ${endereco.numero}</strong></p>
      ${endereco.complemento ? `<p>${endereco.complemento}</p>` : ''}
      <p>${endereco.bairro}, ${endereco.cidade}/${endereco.estado}</p>
      ${endereco.cep ? `<p>CEP: ${formatarCEP(endereco.cep)}</p>` : ''}
    </div>
  `;
  
  // Adicionar event listeners
  const btnEdit = div.querySelector('.edit-address');
  if (btnEdit) {
    btnEdit.addEventListener('click', () => editarEndereco(endereco.id));
  }
  
  const btnSetPrincipal = div.querySelector('.set-principal');
  if (btnSetPrincipal) {
    btnSetPrincipal.addEventListener('click', () => definirComoPrincipal(endereco.id));
  }
  
  // CORREÇÃO: usar o seletor correto para o botão de deletar
  const btnDelete = div.querySelector(".delete-address");
  if (btnDelete) {
    btnDelete.addEventListener("click", () => confirmarExclusaoEndereco(endereco.id));
  }
  
  return div;
}

// Função para abrir formulário de novo endereço
function abrirFormularioNovoEndereco() {
  console.log('Abrindo formulário de novo endereço...');
  editandoEndereco = null;
  formTitulo.textContent = 'Adicionar Novo Endereço';
  limparFormulario();
  
  formularioEndereco.classList.remove('hidden');
  const enderecoInput = document.getElementById('endereco');
  if (enderecoInput) {
    enderecoInput.focus();
  }
}

// Função para editar endereço
function editarEndereco(enderecoId) {
  const endereco = enderecosUsuario.find(e => e.id == enderecoId);
  if (!endereco) return;
  
  editandoEndereco = endereco;
  formTitulo.textContent = 'Editar Endereço';
  
  // Preencher formulário
  document.getElementById('endereco-id').value = endereco.id;
  document.getElementById('endereco').value = endereco.endereco || '';
  document.getElementById('numero').value = endereco.numero || '';
  document.getElementById('complemento').value = endereco.complemento || '';
  document.getElementById('bairro').value = endereco.bairro || '';
  document.getElementById('cidade').value = endereco.cidade || '';
  document.getElementById('estado').value = endereco.estado || '';
  document.getElementById('cep').value = endereco.cep ? formatarCEP(endereco.cep) : '';
  document.getElementById('is_principal').checked = endereco.is_principal;
  
  formularioEndereco.classList.remove('hidden');
  document.getElementById('endereco').focus();
}

// Função para definir como principal
async function definirComoPrincipal(enderecoId) {
  try {
    const response = await definirEnderecoPrincipal(enderecoId);
    
    if (response.status === 'success') {
      showToast('✅ Endereço definido como principal com sucesso!', 'success');
      await carregarEnderecos();
    } else {
      showToast('❌ ' + (response.message || 'Erro ao definir endereço como principal.'), 'error');
    }
  } catch (error) {
    console.error('Erro ao definir endereço como principal:', error);
    showToast('❌ Erro ao definir endereço como principal: ' + error.message, 'error');
  }
}

// Função para excluir endereço
function confirmarExclusaoEndereco(enderecoId) {
  const endereco = enderecosUsuario.find(e => e.id == enderecoId);
  if (!endereco) {
    console.error('Endereço não encontrado:', enderecoId);
    return;
  }
  
  console.log('Confirmando exclusão do endereço:', endereco);
  
  enderecoParaExcluir = enderecoId;
  
  // Verificar se o modal existe
  const modal = document.getElementById('modalConfirmarExclusao');
  const mensagemExclusao = document.getElementById('mensagem-exclusao');
  
  if (!modal || !mensagemExclusao) {
    // Se o modal não existir, usar confirm nativo como fallback
    const confirmacao = confirm(
      `Tem certeza que deseja excluir este endereço?\n\n${endereco.endereco}, ${endereco.numero}\n${endereco.bairro}, ${endereco.cidade}/${endereco.estado}`
    );
    
    if (confirmacao) {
      excluirEnderecoFinal(enderecoId);
    }
    return;
  }
  
  // Atualizar mensagem do modal
  mensagemExclusao.innerHTML = `
    Tem certeza que deseja excluir este endereço?<br><br>
    <strong>${endereco.endereco}, ${endereco.numero}</strong><br>
    ${endereco.bairro}, ${endereco.cidade}/${endereco.estado}
  `;
  
  // Mostrar modal
  modal.style.display = 'flex';
}

async function excluirEnderecoFinal(enderecoId) {
  try {
    console.log('Excluindo endereço:', enderecoId);
    
    const response = await excluirEndereco(enderecoId);
    
    if (response.status === 'success') {
      showToast('✅ Endereço excluído com sucesso!', 'success');
      await carregarEnderecos();
    } else {
      showToast('❌ ' + (response.message || 'Erro ao excluir endereço.'), 'error');
    }
  } catch (error) {
    console.error('Erro ao excluir endereço:', error);
    showToast('❌ Erro ao excluir endereço: ' + error.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btnCancelarExclusao = document.getElementById('btn-cancelar-exclusao');
  const btnConfirmarExclusao = document.getElementById('btn-confirmar-exclusao');
  
  if (btnCancelarExclusao) {
    btnCancelarExclusao.addEventListener('click', () => {
      const modal = document.getElementById('modalConfirmarExclusao');
      if (modal) {
        modal.style.display = 'none';
      }
      enderecoParaExcluir = null;
    });
  }
  
  if (btnConfirmarExclusao) {
    btnConfirmarExclusao.addEventListener('click', async () => {
      if (!enderecoParaExcluir) return;
      
      await excluirEnderecoFinal(enderecoParaExcluir);
      
      // Fechar modal
      const modal = document.getElementById('modalConfirmarExclusao');
      if (modal) {
        modal.style.display = 'none';
      }
      
      enderecoParaExcluir = null;
    });
  }
});

function mostrarModalPadrao(icone, titulo, mensagem) {
  // Verificar se existe o modal no DOM
  const modal = document.getElementById('cadastroModal');
  if (modal) {
    const modalIcon = document.querySelector('.modal-icon');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalClose = document.getElementById('modal-close');
    
    if (modalIcon) modalIcon.textContent = icone;
    if (modalTitle) modalTitle.textContent = titulo;
    if (modalMessage) modalMessage.textContent = mensagem;
    if (modalClose) modalClose.textContent = 'OK';
    
    modal.style.display = 'flex';
    
    // Event listener para fechar o modal
    if (modalClose) {
      modalClose.onclick = () => {
        modal.style.display = 'none';
      };
    }
  } else {
    // Fallback para alert se modal não existir
    alert(`${titulo}: ${mensagem}`);
  }
}

document.getElementById('btn-cancelar-exclusao')?.addEventListener('click', () => {
  const modal = document.getElementById('modalConfirmarExclusao');
  modal.style.display = 'none';
  enderecoParaExcluir = null;
});

document.getElementById('btn-confirmar-exclusao')?.addEventListener('click', async () => {
  if (!enderecoParaExcluir) return;
  
  try {
    await excluirEndereco(enderecoParaExcluir);
    await carregarEnderecos();
    
    // Fechar modal
    const modal = document.getElementById('modalConfirmarExclusao');
    modal.style.display = 'none';
    
    // Mostrar mensagem de sucesso
    mostrarModalPadrao("✅", "Sucesso", "Endereço excluído com sucesso!");
    
    enderecoParaExcluir = null;
  } catch (error) {
    console.error('Erro ao excluir endereço:', error);
    mostrarModalPadrao("❌", "Erro", "Erro ao excluir endereço: " + error.message);
  }
});

// Função para cancelar formulário
function cancelarFormulario() {
  formularioEndereco.classList.add('hidden');
  editandoEndereco = null;
  limparFormulario();
}

// Função para limpar formulário
function limparFormulario() {
  formEndereco.reset();
  document.getElementById('endereco-id').value = '';
}

// Função para salvar endereço
async function salvarEndereco(event) {
  event.preventDefault();
  
  btnSalvarEndereco.disabled = true;
  btnSalvarEndereco.classList.add('loading');
  
  try {
    const formData = new FormData(formEndereco);
    const dados = {
      endereco: formData.get('endereco')?.trim(),
      numero: formData.get('numero')?.trim(),
      complemento: formData.get('complemento')?.trim() || null,
      bairro: formData.get('bairro')?.trim(),
      cidade: formData.get('cidade')?.trim(),
      estado: formData.get('estado')?.trim()?.toUpperCase(),
      cep: formData.get('cep')?.replace(/\D/g, '') || null,
      is_principal: formData.get('is_principal') === 'on'
    };
    
    // Validação básica
    const camposObrigatorios = ['endereco', 'numero', 'bairro', 'cidade', 'estado'];
    for (const campo of camposObrigatorios) {
      if (!dados[campo]) {
        throw new Error(`O campo ${campo} é obrigatório.`);
      }
    }
    
    if (dados.estado.length !== 2) {
      throw new Error('O estado deve ter exatamente 2 caracteres.');
    }
    
    let response;
    if (editandoEndereco) {
      // Atualizar endereço existente
      response = await atualizarEndereco(editandoEndereco.id, dados);
    } else {
      // Criar novo endereço
      response = await criarEndereco(dados);
    }
    
    if (response.status === 'success') {
      showToast('✅ Endereço salvo com sucesso!', 'success');
      await carregarEnderecos();
      cancelarFormulario();
    } else {
      showToast('❌ ' + (response.message || 'Erro ao salvar endereço.'), 'error');
    }
  } catch (error) {
    console.error('Erro ao salvar endereço:', error);
    showToast('❌ ' + error.message, 'error');
  } finally {
    btnSalvarEndereco.disabled = false;
    btnSalvarEndereco.classList.remove('loading');
  }
}

// Função para formatar CEP
function formatarCEP(cep) {
  if (!cep) return '';
  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length === 8) {
    return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`;
  }
  return cepLimpo;
}