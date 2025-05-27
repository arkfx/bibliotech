import { buscarPedidoCompletoPorId } from "../api/pedido.js";
import { verificarSessao } from "../api/session.js";

// Elementos da página
const loadingState = document.getElementById("loading-state");
const successContent = document.getElementById("success-content");
const errorContent = document.getElementById("error-content");

// Elementos de dados
const pedidoNumero = document.getElementById("pedido-numero");
const pedidoData = document.getElementById("pedido-data");
const pedidoStatus = document.getElementById("pedido-status");
const orderItemsList = document.getElementById("order-items-list");
const subtotalValue = document.getElementById("subtotal-value");
const totalValue = document.getElementById("total-value");
const timelineConfirmado = document.getElementById("timeline-confirmado");

document.addEventListener("DOMContentLoaded", async () => {
    await inicializarPagina();
});

async function inicializarPagina() {
    try {
        // Verificar se usuário está logado
        const session = await verificarSessao();
        if (!session.isLoggedIn) {
            window.location.href = "login.html";
            return;
        }

        // Obter ID do pedido da URL
        const pedidoId = obterPedidoIdDaUrl();
        
        if (!pedidoId) {
            mostrarErro();
            return;
        }

        // Carregar dados do pedido
        await carregarDadosPedido(pedidoId);

    } catch (error) {
        console.error("Erro ao inicializar página:", error);
        mostrarErro();
    }
}

function obterPedidoIdDaUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
}

async function carregarDadosPedido(pedidoId) {
    try {
        const response = await buscarPedidoCompletoPorId(pedidoId);
        
        if (response.status === "success" && response.data) {
            processarDadosPedido(response.data);
            mostrarSucesso();
        } else {
            mostrarErro();
        }
    } catch (error) {
        console.error("Erro ao carregar pedido:", error);
        mostrarErro();
    }
}

function processarDadosPedido(dadosPedido) {
    if (!dadosPedido || dadosPedido.length === 0) {
        mostrarErro();
        return;
    }

    // O primeiro item contém os dados do pedido
    const pedidoInfo = dadosPedido[0];
    
    // Preencher informações básicas do pedido
    preencherInformacoesPedido(pedidoInfo);
    
    // Processar e exibir itens do pedido
    const itensProcessados = processarItensPedido(dadosPedido);
    exibirItensPedido(itensProcessados);
    
    // Calcular e exibir totais
    calcularEExibirTotais(itensProcessados, pedidoInfo.total);
    
    // Configurar timeline
    configurarTimeline(pedidoInfo.criado_em);
}

function preencherInformacoesPedido(pedidoInfo) {
    pedidoNumero.textContent = `#${pedidoInfo.pedido_id.toString().padStart(4, '0')}`;
    
    const dataFormatada = formatarData(pedidoInfo.criado_em);
    pedidoData.textContent = dataFormatada;
    
    const statusFormatado = formatarStatus(pedidoInfo.status);
    pedidoStatus.textContent = statusFormatado;
    pedidoStatus.className = `value status-badge status-${pedidoInfo.status}`;
}

function processarItensPedido(dadosPedido) {
    const itensMap = new Map();
    
    dadosPedido.forEach(item => {
        const livroId = item.livro_id;
        if (!itensMap.has(livroId)) {
            itensMap.set(livroId, {
                livro_id: livroId,
                titulo: item.titulo,
                imagem_url: item.imagem_url,
                quantidade: item.quantidade,
                preco_unitario: parseFloat(item.preco_unitario),
                total: parseFloat(item.preco_unitario) * item.quantidade
            });
        }
    });
    
    return Array.from(itensMap.values());
}

function exibirItensPedido(itens) {
    orderItemsList.innerHTML = "";
    
    itens.forEach(item => {
        const itemElement = criarElementoItem(item);
        orderItemsList.appendChild(itemElement);
    });
}

function criarElementoItem(item) {
    const div = document.createElement("div");
    div.className = "order-item";
    
    const imagemUrl = item.imagem_url;
    
    div.innerHTML = `
        <div class="order-item-image">
            ${imagemUrl 
                ? `<img src="${imagemUrl}" alt="${item.titulo}" onerror="this.style.display='none'; this.parentElement.classList.add('placeholder')">` 
                : '<div class="book-placeholder">📚</div>'
            }
        </div>
        <div class="order-item-details">
            <h3 class="order-item-title">${item.titulo}</h3>
            <div class="order-item-info-row">
                <span>Quantidade: ${item.quantidade}</span>
                <span>Preço unitário: ${formatarPreco(item.preco_unitario)}</span>
            </div>
            <div class="order-item-info-row">
                <span></span>
                <span class="order-item-price">Total: ${formatarPreco(item.total)}</span>
            </div>
        </div>
    `;
    
    return div;
}

function calcularEExibirTotais(itens, totalPedido) {
    const subtotal = itens.reduce((acc, item) => acc + item.total, 0);
    const frete = 24.99; // Valor fixo conforme o sistema
    
    subtotalValue.textContent = formatarPreco(subtotal);
    totalValue.textContent = formatarPreco(totalPedido);
}

function configurarTimeline(criadoEm) {
    const dataFormatada = formatarDataHora(criadoEm);
    timelineConfirmado.textContent = dataFormatada;
}

function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit", 
        year: "numeric"
    });
}

function formatarDataHora(dataString) {
    const data = new Date(dataString);
    return data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatarPreco(valor) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(valor);
}

function formatarStatus(status) {
    const statusMap = {
        "confirmado": "Confirmado",
        "pendente": "Pendente",
        "processando": "Processando",
        "enviado": "Enviado",
        "entregue": "Entregue",
        "cancelado": "Cancelado"
    };
    
    return statusMap[status] || status;
}

function mostrarSucesso() {
    loadingState.classList.add("hidden");
    errorContent.classList.add("hidden");
    successContent.classList.remove("hidden");
}

function mostrarErro() {
    loadingState.classList.add("hidden");
    successContent.classList.add("hidden");
    errorContent.classList.remove("hidden");
}

// Função para redirecionamento (para uso em outras páginas)
function redirecionarParaPedidoFinalizado(pedidoId) {
    window.location.href = `pedido-finalizado.html?id=${pedidoId}`;
}

// Disponibilizar globalmente
window.redirecionarParaPedidoFinalizado = redirecionarParaPedidoFinalizado;

// Exportar para uso em outras páginas
export { redirecionarParaPedidoFinalizado }; 