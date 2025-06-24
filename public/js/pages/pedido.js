import { finalizarPedido } from "../api/pedido.js"; 
import { getCarrinhoDoUsuario } from "../api/carrinho.js";
import { 
  listarEnderecos, 
  criarEndereco, 
  atualizarEndereco, 
  definirEnderecoPrincipal,
  excluirEndereco
} from "../api/endereco.js";
import { obterUserId } from "../utils/auth-utils.js"; 

// Estado da aplicação
let enderecosUsuario = [];
let enderecoSelecionado = null;
let editandoEndereco = null;

// Elementos do DOM
const enderecosLista = document.getElementById("enderecos-lista");
const enderecosVazio = document.getElementById("enderecos-vazio");
const formularioEndereco = document.getElementById("formulario-endereco");
const formEndereco = document.getElementById("checkout-address-form");
const btnNovoEndereco = document.getElementById("btn-novo-endereco");
const btnPrimeiroEndereco = document.getElementById("btn-primeiro-endereco");
const btnCancelarEndereco = document.getElementById("btn-cancelar-endereco");
const btnCancelarForm = document.getElementById("btn-cancelar-form");
const btnSalvarEndereco = document.getElementById("btn-salvar-endereco");
const formTitulo = document.getElementById("form-titulo");
const btnConfirmarFinal = document.getElementById("confirm-order-final");

// Função para carregar e exibir endereços
async function carregarEnderecos() {
  try {
    const response = await listarEnderecos();
    
    if (response.status === "success") {
      enderecosUsuario = response.data || [];
      renderizarEnderecos();
    } else {
      console.error("Erro ao carregar endereços:", response.message);
      enderecosUsuario = [];
      renderizarEnderecos();
    }
  } catch (error) {
    console.error("Erro ao carregar endereços:", error);
    enderecosUsuario = [];
    renderizarEnderecos();
  }
}

// Função para renderizar a lista de endereços
function renderizarEnderecos() {
  if (enderecosUsuario.length === 0) {
    // Mostrar estado vazio
    enderecosLista.classList.add("hidden");
    enderecosVazio.classList.remove("hidden");
    btnConfirmarFinal.disabled = true;
  } else {
    // Mostrar lista de endereços
    enderecosLista.classList.remove("hidden");
    enderecosVazio.classList.add("hidden");
    
    enderecosLista.innerHTML = "";
    
    enderecosUsuario.forEach((endereco, index) => {
      const enderecoElement = criarElementoEndereco(endereco, index);
      enderecosLista.appendChild(enderecoElement);
    });
    
    // Selecionar o primeiro endereço se nenhum estiver selecionado
    if (!enderecoSelecionado && enderecosUsuario.length > 0) {
      const principal = enderecosUsuario.find(e => e.is_principal) || enderecosUsuario[0];
      selecionarEndereco(principal.id);
    }
  }
}

// Função para criar elemento de endereço
function criarElementoEndereco(endereco, index) {
  const div = document.createElement("div");
  div.className = `address-card ${endereco.is_principal ? "principal" : ""}`;
  div.dataset.enderecoId = endereco.id;
  
  div.innerHTML = `
    <div class="address-content">
      <div class="address-selection">
        <input 
          type="radio" 
          name="endereco_selecionado" 
          value="${endereco.id}" 
          id="endereco_${endereco.id}"
          ${endereco.is_principal ? "checked" : ""}
        />
        <label for="endereco_${endereco.id}" class="address-info">
          <div class="address-header">
            <span class="address-title">
              ${endereco.is_principal ? "🏠 Endereço Principal" : `📍 Endereço ${index + 1}`}
            </span>
          </div>
          <div class="address-details">
            <p><strong>${endereco.endereco}, ${endereco.numero}</strong></p>
            ${endereco.complemento ? `<p>${endereco.complemento}</p>` : ""}
            <p>${endereco.bairro}, ${endereco.cidade}/${endereco.estado}</p>
            ${endereco.cep ? `<p>CEP: ${formatarCEP(endereco.cep)}</p>` : ""}
          </div>
        </label>
      </div>
      <div class="address-actions">
        <button 
          type="button" 
          class="btn-icon btn-edit" 
          data-endereco-id="${endereco.id}"
          title="Editar endereço"
        >
          ✏️
        </button>
        ${!endereco.is_principal ? `
          <button 
            type="button" 
            class="btn-icon btn-set-principal" 
            data-endereco-id="${endereco.id}"
            title="Definir como principal"
          >
            🏠
          </button>
        ` : ""}
        ${enderecosUsuario.length > 1 ? `
          <button 
            type="button" 
            class="btn-icon btn-delete" 
            data-endereco-id="${endereco.id}"
            title="Excluir endereço"
          >
            🗑️
          </button>
        ` : ""}
      </div>
    </div>
  `;
  
  // Adicionar event listeners
  const radio = div.querySelector('input[type="radio"]');
  radio.addEventListener("change", () => {
    if (radio.checked) {
      selecionarEndereco(endereco.id);
    }
  });
  
  const btnEdit = div.querySelector(".btn-edit");
  if (btnEdit) {
    btnEdit.addEventListener("click", () => editarEndereco(endereco.id));
  }
  
  const btnSetPrincipal = div.querySelector(".btn-set-principal");
  if (btnSetPrincipal) {
    btnSetPrincipal.addEventListener("click", () => definirComoPrincipal(endereco.id));
  }
  
  const btnDelete = div.querySelector(".btn-delete");
  if (btnDelete) {
    btnDelete.addEventListener("click", () => excluirEnderecoConfirmar(endereco.id));
  }
  
  return div;
}

// Função para selecionar endereço
function selecionarEndereco(enderecoId) {
  enderecoSelecionado = enderecoId;
  
  // Atualizar visualmente
  document.querySelectorAll(".address-card").forEach(card => {
    card.classList.remove("selected");
  });
  
  const cardSelecionado = document.querySelector(`[data-endereco-id="${enderecoId}"]`).closest(".address-card");
  if (cardSelecionado) {
    cardSelecionado.classList.add("selected");
  }
  
  // Habilitar botão de confirmar
  btnConfirmarFinal.disabled = false;
}

// Função para abrir formulário de novo endereço
function abrirFormularioNovoEndereco() {
  editandoEndereco = null;
  formTitulo.textContent = "Adicionar Novo Endereço";
  limparFormulario();
  
  formularioEndereco.classList.remove("hidden");
  document.getElementById("endereco").focus();
}

// Função para editar endereço
function editarEndereco(enderecoId) {
  const endereco = enderecosUsuario.find(e => e.id == enderecoId);
  if (!endereco) return;
  
  editandoEndereco = endereco;
  formTitulo.textContent = "Editar Endereço";
  
  // Preencher formulário
  document.getElementById("endereco-id").value = endereco.id;
  document.getElementById("endereco").value = endereco.endereco || "";
  document.getElementById("numero").value = endereco.numero || "";
  document.getElementById("complemento").value = endereco.complemento || "";
  document.getElementById("bairro").value = endereco.bairro || "";
  document.getElementById("cidade").value = endereco.cidade || "";
  document.getElementById("estado").value = endereco.estado || "";
  document.getElementById("cep").value = endereco.cep ? formatarCEP(endereco.cep) : "";
  document.getElementById("is_principal").checked = endereco.is_principal;
  
  formularioEndereco.classList.remove("hidden");
  document.getElementById("endereco").focus();
}

// Função para definir como principal
async function definirComoPrincipal(enderecoId) {
  try {
    await definirEnderecoPrincipal(enderecoId);
    await carregarEnderecos();
    selecionarEndereco(enderecoId);
  } catch (error) {
    alert("Erro ao definir endereço como principal: " + error.message);
  }
}

// Função para excluir endereço
async function excluirEnderecoConfirmar(enderecoId) {
  const endereco = enderecosUsuario.find(e => e.id == enderecoId);
  if (!endereco) return;
  
  const confirmacao = confirm(
    `Deseja realmente excluir este endereço?\n\n${endereco.endereco}, ${endereco.numero}\n${endereco.bairro}, ${endereco.cidade}/${endereco.estado}`
  );
  
  if (!confirmacao) return;
  
  try {
    await excluirEndereco(enderecoId);
    await carregarEnderecos();
    
    // Se o endereço excluído era o selecionado, limpar seleção
    if (enderecoSelecionado == enderecoId) {
      enderecoSelecionado = null;
    }
  } catch (error) {
    alert("Erro ao excluir endereço: " + error.message);
  }
}

// Função para cancelar formulário
function cancelarFormulario() {
  formularioEndereco.classList.add("hidden");
  editandoEndereco = null;
  limparFormulario();
}

// Função para limpar formulário
function limparFormulario() {
  formEndereco.reset();
  document.getElementById("endereco-id").value = "";
}

// Função para salvar endereço
async function salvarEndereco(event) {
  event.preventDefault();
  
  btnSalvarEndereco.disabled = true;
  btnSalvarEndereco.classList.add("loading");
  
  try {
    const formData = new FormData(formEndereco);
    const dados = {
      endereco: formData.get("endereco")?.trim(),
      numero: formData.get("numero")?.trim(),
      complemento: formData.get("complemento")?.trim() || null,
      bairro: formData.get("bairro")?.trim(),
      cidade: formData.get("cidade")?.trim(),
      estado: formData.get("estado")?.trim()?.toUpperCase(),
      cep: formData.get("cep")?.replace(/\D/g, '') || null,
      is_principal: formData.get("is_principal") === "on"
    };
    
    // Validação básica
    const camposObrigatorios = ['endereco', 'numero', 'bairro', 'cidade', 'estado'];
    for (const campo of camposObrigatorios) {
      if (!dados[campo]) {
        throw new Error(`O campo ${campo} é obrigatório.`);
      }
    }
    
    if (dados.estado.length !== 2) {
      throw new Error("O estado deve ter exatamente 2 caracteres.");
    }
    
    let response;
    if (editandoEndereco) {
      // Atualizar endereço existente
      response = await atualizarEndereco(editandoEndereco.id, dados);
    } else {
      // Criar novo endereço
      response = await criarEndereco(dados);
    }
    
    if (response.status === "success") {
      await carregarEnderecos();
      cancelarFormulario();
      
      // Se foi definido como principal ou é o primeiro endereço, selecionar
      if (dados.is_principal || enderecosUsuario.length === 1) {
        const enderecoId = editandoEndereco?.id || response.endereco_id;
        if (enderecoId) {
          selecionarEndereco(enderecoId);
        }
      }
    }
  } catch (error) {
    alert("Erro ao salvar endereço: " + error.message);
  } finally {
    btnSalvarEndereco.disabled = false;
    btnSalvarEndereco.classList.remove("loading");
  }
}

// Função para formatar CEP
function formatarCEP(cep) {
  if (!cep) return "";
  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length === 8) {
    return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`;
  }
  return cepLimpo;
}

// Event Listeners
btnNovoEndereco?.addEventListener("click", abrirFormularioNovoEndereco);
btnPrimeiroEndereco?.addEventListener("click", abrirFormularioNovoEndereco);
btnCancelarEndereco?.addEventListener("click", cancelarFormulario);
btnCancelarForm?.addEventListener("click", cancelarFormulario);
formEndereco?.addEventListener("submit", salvarEndereco);

// Formatação automática do CEP
document.getElementById("cep")?.addEventListener("input", function(e) {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length > 5) {
    value = value.replace(/^(\d{5})(\d{1,3})/, '$1-$2');
  }
  e.target.value = value;
});

// Função para carregar e exibir o resumo do carrinho na página de finalização
async function carregarResumoDoCarrinho() {
  const orderItemsContainer = document.getElementById("order-items");
  const subtotalEl = document.getElementById("subtotal");
  const freteEl = document.getElementById("frete");
  const totalEl = document.getElementById("total");

  if (!orderItemsContainer || !subtotalEl || !freteEl || !totalEl) {
    console.warn("Elementos do resumo do pedido não encontrados na página de finalização.");
    return;
  }

  try {
    const userId = await obterUserId();
    if (!userId) {
      orderItemsContainer.innerHTML = "<p>Usuário não autenticado. Faça login para continuar.</p>";
      return;
    }

    const carrinhoData = await getCarrinhoDoUsuario(userId);

    if (carrinhoData.status !== "success" || !carrinhoData.data || carrinhoData.data.length === 0) {
      orderItemsContainer.innerHTML = "<p>Seu carrinho está vazio. Não há itens para finalizar.</p>";
      subtotalEl.textContent = "0,00";
      freteEl.textContent = "R$ 0,00";
      totalEl.textContent = "0,00";
      alert("Seu carrinho está vazio. Você será redirecionado para a página de carrinho.");
      window.location.href = "carrinho.html";
      return;
    }

    const itensCarrinho = carrinhoData.data;
    orderItemsContainer.innerHTML = ""; // Limpa o container antes de adicionar novos itens
    let subtotalCalculado = 0;
    let contemItemFisico = false;

    itensCarrinho.forEach((item) => {
      const itemHTML = `
        <div class="item-pedido">
          <img src="${item.imagem_url || '../public/images/placeholder.png'}" alt="${item.titulo}" class="item-img"/>
          <div class="item-info">
            <h3>${item.titulo}</h3>
            <p>Quantidade: ${item.quantidade}</p>
            <p>Tipo: ${item.tipo === 'ebook' ? 'E-book' : 'Físico'}</p>
            <p>Preço unitário: R$ ${parseFloat(item.preco).toFixed(2).replace(".", ",")}</p>
          </div>
        </div>
      `;
      orderItemsContainer.insertAdjacentHTML("beforeend", itemHTML);
      subtotalCalculado += parseFloat(item.preco) * item.quantidade;

      if (item.tipo === 'fisico') {
        contemItemFisico = true;
      }
    });

    let freteCalculado = 0;
    let textoFrete = "R$ 0,00"; 

    if (subtotalCalculado > 0 && contemItemFisico) {
      freteCalculado = 24.99;
      textoFrete = "R$ 24,99";
    }

    const totalCalculado = subtotalCalculado + freteCalculado;

    subtotalEl.textContent = subtotalCalculado.toFixed(2).replace(".", ",");
    freteEl.textContent = textoFrete;
    totalEl.textContent = totalCalculado.toFixed(2).replace(".", ",");

    atualizarParcelas(totalCalculado); // Atualiza parcelas com base no total final
  } catch (error) {
    console.error("Erro ao carregar resumo do carrinho na página de finalização:", error);
    orderItemsContainer.innerHTML = "<p>Erro ao carregar itens do carrinho. Tente recarregar a página.</p>";
  }
}

// Função para coletar dados do pagamento
function coletarDadosPagamento() {
  const formaPagamento = document.querySelector('input[name="payment"]:checked')?.value;
  
  const dadosPagamento = {
    forma_pagamento: formaPagamento
  };

  if (formaPagamento === 'cartao') {
    const parcelas = document.getElementById("parcelas")?.value;
    if (parcelas) {
      dadosPagamento.parcelas = parseInt(parcelas);
    }
  }

  return dadosPagamento;
}

// Evento principal de finalização
btnConfirmarFinal?.addEventListener("click", async (event) => {
  const btnConfirmar = event.currentTarget;
  btnConfirmar.disabled = true;
  btnConfirmar.classList.add("loading");

  try {
    // Verificar se há endereço selecionado
    if (!enderecoSelecionado) {
      throw new Error("Selecione um endereço de entrega.");
    }

    // Coleta dados do pagamento
    const dadosPagamento = coletarDadosPagamento();

    // Finaliza o pedido com os dados completos
    const dadosFinalizacao = {
      endereco_id: enderecoSelecionado,
      ...dadosPagamento
    };

    const res = await finalizarPedido(dadosFinalizacao); 

    if (res.status === "success" && res.pedido_id) {
      // Redirecionar para página de pedido finalizado
      window.location.href = `pedido-finalizado.html?id=${res.pedido_id}`;
    } else {
      throw new Error(res.message || "Erro ao confirmar o pedido. Tente novamente.");
    }
  } catch (error) {
    alert("Erro ao confirmar pedido: " + error.message);
    console.error("Erro na confirmação final do pedido:", error);
  } finally {
    btnConfirmar.disabled = false;
    btnConfirmar.classList.remove("loading");
  }
});

// Gerenciamento de formas de pagamento
document.querySelectorAll('input[name="payment"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    document.querySelectorAll(".payment-form").forEach((form) => {
      form.classList.remove("active");
      form.style.display = "none";
    });

    const selectedForm = document.getElementById(`${radio.value}-form`);
    if (selectedForm) {
      selectedForm.classList.add("active");
      selectedForm.style.display = "block";
    }
  });
});

function atualizarParcelas(total) {
  const select = document.getElementById("parcelas");
  if (!select) return;

  select.innerHTML = "";

  // Até 3 parcelas sem juros
  for (let i = 1; i <= 3; i++) {
    const valorParcela = (total / i).toFixed(2).replace(".", ",");
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${i}x de R$ ${valorParcela}`;
    select.appendChild(option);
  }
}

// Inicialização da página
document.addEventListener("DOMContentLoaded", async () => {
  await carregarResumoDoCarrinho();
  await carregarEnderecos();

  // Garantir que o formulário de pagamento padrão esteja visível
  const formaPagamentoPadrao = document.getElementById('cartao');
  if (formaPagamentoPadrao && formaPagamentoPadrao.checked) {
    const formPadrao = document.getElementById(`${formaPagamentoPadrao.value}-form`);
    if (formPadrao) {
        formPadrao.classList.add('active');
        formPadrao.style.display = 'block';
    }
  }
});