import { buscarPedidosDoUsuario } from "../../../api/pedido.js";
import { getBookById } from "../../../api/livro.js";

export function renderSkeletonPedidos() {
  const container = document.querySelector(
    "#section-historico-pedidos .order-list"
  );
  if (!container) return;
  container.innerHTML = `
    <div class="order-skeleton-list">
      ${Array(2)
        .fill(
          `
        <div class="order-item skeleton">
          <div class="order-header">
            <div class="order-info">
              <span class="order-id skeleton-box" style="width: 120px; height: 20px;"></span>
              <span class="order-date skeleton-box" style="width: 80px; height: 16px;"></span>
            </div>
            <div class="order-status skeleton-box" style="width: 90px; height: 20px;"></div>
          </div>
          <div class="order-books">
            <div class="order-book">
              <span class="order-book-cover skeleton-box" style="width: 60px; height: 90px;"></span>
              <div class="order-book-info">
                <span class="skeleton-box" style="width: 120px; height: 18px;"></span>
                <span class="skeleton-box" style="width: 80px; height: 14px;"></span>
                <span class="skeleton-box" style="width: 60px; height: 14px;"></span>
              </div>
            </div>
          </div>
          <div class="order-summary">
            <span class="skeleton-box" style="width: 80px; height: 16px;"></span>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

export async function carregarHistoricoPedidos() {
  const container = document.querySelector(
    "#section-historico-pedidos .order-list"
  );
  renderSkeletonPedidos();

  try {
    // Aguarda pelo menos 600ms para o skeleton aparecer
    await new Promise((resolve) => setTimeout(resolve, 600));

    const response = await buscarPedidosDoUsuario();

    if (response.status === "success" && response.data) {
      preencherTabela(response.data);
    } else {
      preencherTabela([]);
    }
  } catch (error) {
    preencherTabela([]);
    console.error("Erro ao carregar histórico de pedidos:", error);
  }
}

function preencherTabela(pedidos) {
  const container = document.querySelector(".order-list");
  if (!container) return;

  if (!pedidos || pedidos.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Nenhum pedido realizado</h3>
        <p>Seus pedidos aparecerão aqui quando você fizer compras em nossa loja.</p>
        <a href="home.html" class="btn">Explorar Livros</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="order-list">
      ${pedidos
        .map((pedido) => {
          const pedidoId = pedido.id || pedido.pedido_id || "";
          
          let dataFormatada = "Data não disponível";
          try {
            if (pedido.criado_em) {
              dataFormatada = new Date(pedido.criado_em).toLocaleDateString();
            }
          } catch (e) {
            console.error("Erro ao formatar data:", e);
          }

          const status = (pedido.status || "pendente").toLowerCase();
          const statusFormatado = status.charAt(0).toUpperCase() + status.slice(1);
          const statusClass = status === "entregue" ? "delivered" : status === "processando" ? "processing" : "";

          let itens = [];
          if (Array.isArray(pedido.itens)) {
            itens = pedido.itens;
          } else if (Array.isArray(pedido.items)) {
            itens = pedido.items;
          } else if (Array.isArray(pedido.livros)) {
            itens = pedido.livros;
          }

          const valorFreteApi = parseFloat(pedido.valor_frete);
          const totalPedidoApi = parseFloat(pedido.total);
          const frete = !isNaN(valorFreteApi) ? valorFreteApi : 0;
          const total = !isNaN(totalPedidoApi) ? totalPedidoApi : 0;
          let subtotal = total - frete;
          if (subtotal < 0) subtotal = 0;

          const rastreio = pedido.rastreio || pedido.codigo_rastreio || "";

          // CORREÇÃO: Endereço do pedido
          let enderecoHtml = "";
          if (pedido.endereco && pedido.endereco.endereco) {
            const e = pedido.endereco;
            enderecoHtml = `
              <div class="order-address">
                <strong>Endereço de entrega:</strong><br>
                ${e.endereco}, ${e.numero}${e.complemento ? " - " + e.complemento : ""}<br>
                ${e.bairro}, ${e.cidade}/${e.estado}${e.cep ? " - CEP: " + e.cep : ""}
              </div>
            `;
          } else if (pedido.endereco_id) {
            enderecoHtml = `
              <div class="order-address">
                <strong>Endereço:</strong> Informações não disponíveis
              </div>
            `;
          }

          return `
        <div class="order-item">
          <div class="order-header">
            <div class="order-info">
              <span class="order-id">Pedido #${pedidoId}</span>
              <span class="order-date">${dataFormatada}</span>
            </div>
            <div class="order-status ${statusClass}">
              ${statusFormatado}
            </div>
          </div>
          
          ${enderecoHtml}
          
          <div class="order-books">
            ${
              itens.length > 0
                ? itens
                    .map((item) => {
                      try {
                        const titulo = item.titulo || item.title || "Título não disponível";
                        const autor = item.autor || item.author || "Autor não disponível";
                        const imagemUrl = item.imagem_url || item.image_url || "/bibliotech/public/images/placeholder-book.png";

                        let precoUnitario = 0;
                        if (item.preco_unitario !== undefined && item.preco_unitario !== null) {
                          precoUnitario = Number(item.preco_unitario);
                        } else if (item.preco !== undefined && item.preco !== null) {
                          precoUnitario = Number(item.preco);
                        }

                        let precoFormatado = "0,00";
                        if (!isNaN(precoUnitario)) {
                          precoFormatado = precoUnitario.toFixed(2).replace(".", ",");
                        }

                        const quantidade = parseInt(item.quantidade || 1);
                        const tipoItem = item.tipo || "Não especificado";
                        const tipoFormatado = tipoItem.toLowerCase() === "ebook" ? "E-book" : "Físico";

                        return `
                  <div class="order-book">
                    <img src="${imagemUrl}" alt="Capa do Livro" class="order-book-cover">
                    <div class="order-book-info">
                      <h4>${titulo}</h4>
                      <p>${autor}</p>
                      <p class="order-book-type">Tipo: ${tipoFormatado}</p> 
                      <div class="order-book-price">
                        R$ ${precoFormatado}
                        <span class="order-quantity">x${quantidade}</span>
                      </div>
                    </div>
                  </div>
                `;
                      } catch (e) {
                        console.error("Erro ao renderizar item:", e);
                        return "<div>Erro ao carregar item</div>";
                      }
                    })
                    .join("")
                : "<p>Nenhum livro neste pedido.</p>"
            }
          </div>
          
          <div class="order-summary">
            <div class="summary-item">
              <span>Subtotal:</span>
              <span>R$ ${isNaN(subtotal) ? "0.00" : subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-item">
              <span>Frete:</span>
              <span>R$ ${isNaN(frete) ? "0.00" : frete.toFixed(2)}</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-item total">
              <span>Total:</span>
              <span>R$ ${isNaN(total) ? "0.00" : total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="order-footer">
            ${
              rastreio
                ? `
              <div class="order-tracking">
                <div class="tracking-info">
                  <span class="tracking-label">Código de rastreio:</span>
                  <span class="tracking-number">${rastreio}</span>
                </div>
              </div>
            `
                : ""
            }
          </div>
        </div>
      `;
        })
        .join("")}
    </div>
  `;
}

async function obterDetalhesLivro(livroId) {
  try {
    const response = await getBookById(livroId);
    if (response.status === "success") {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error(`Erro ao buscar detalhes do livro ${livroId}:`, error);
    return null;
  }
}
