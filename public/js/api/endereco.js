import { API_BASE } from "../config.js";

export async function listarEnderecos() {
  try {
    const response = await fetch(`${API_BASE}/endereco`);
    
    const contentType = response.headers.get("content-type");
    
    if (!response.ok) {
      let errorMessage = `Erro HTTP ${response.status}`;
      
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        const textResponse = await response.text();
        console.error("Resposta não-JSON recebida:", textResponse.substring(0, 500));
        errorMessage = "Erro no servidor. Verifique os logs.";
      }
      
      throw new Error(errorMessage);
    }

    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.error("Resposta não-JSON recebida:", textResponse.substring(0, 500));
      throw new Error("Resposta do servidor não está no formato JSON esperado.");
    }

    const data = await response.json();

    if (data.status !== "success") {
      throw new Error(data.message || "Erro ao listar endereços.");
    }

    return data;
  } catch (error) {
    console.error("Erro ao listar endereços:", error);
    throw error;
  }
}

export async function criarEndereco(dadosEndereco) {
  try {
    const response = await fetch(`${API_BASE}/endereco`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosEndereco),
    });

    const contentType = response.headers.get("content-type");
    
    if (!response.ok) {
      let errorMessage = `Erro HTTP ${response.status}`;
      
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        const textResponse = await response.text();
        console.error("Resposta não-JSON recebida:", textResponse.substring(0, 500));
        errorMessage = "Erro no servidor. Verifique os logs.";
      }
      
      throw new Error(errorMessage);
    }

    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.error("Resposta não-JSON recebida:", textResponse.substring(0, 500));
      throw new Error("Resposta do servidor não está no formato JSON esperado.");
    }

    const data = await response.json();

    if (data.status !== "success") {
      throw new Error(data.message || "Erro ao criar endereço.");
    }

    return data;
  } catch (error) {
    console.error("Erro ao criar endereço:", error);
    throw error;
  }
}

export async function atualizarEndereco(id, dadosEndereco) {
  try {
    const response = await fetch(`${API_BASE}/endereco/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosEndereco),
    });

    const contentType = response.headers.get("content-type");
    
    if (!response.ok) {
      let errorMessage = `Erro HTTP ${response.status}`;
      
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        const textResponse = await response.text();
        console.error("Resposta não-JSON recebida:", textResponse.substring(0, 500));
        errorMessage = "Erro no servidor. Verifique os logs.";
      }
      
      throw new Error(errorMessage);
    }

    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.error("Resposta não-JSON recebida:", textResponse.substring(0, 500));
      throw new Error("Resposta do servidor não está no formato JSON esperado.");
    }

    const data = await response.json();

    if (data.status !== "success") {
      throw new Error(data.message || "Erro ao atualizar endereço.");
    }

    return data;
  } catch (error) {
    console.error("Erro ao atualizar endereço:", error);
    throw error;
  }
}

export async function definirEnderecoPrincipal(id) {
  try {
    const response = await fetch(`${API_BASE}/endereco/${id}/principal`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const contentType = response.headers.get("content-type");
    
    if (!response.ok) {
      let errorMessage = `Erro HTTP ${response.status}`;
      
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        const textResponse = await response.text();
        console.error("Resposta não-JSON recebida:", textResponse.substring(0, 500));
        errorMessage = "Erro no servidor. Verifique os logs.";
      }
      
      throw new Error(errorMessage);
    }

    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.error("Resposta não-JSON recebida:", textResponse.substring(0, 500));
      throw new Error("Resposta do servidor não está no formato JSON esperado.");
    }

    const data = await response.json();

    if (data.status !== "success") {
      throw new Error(data.message || "Erro ao definir endereço principal.");
    }

    return data;
  } catch (error) {
    console.error("Erro ao definir endereço principal:", error);
    throw error;
  }
}

export async function excluirEndereco(id) {
  try {
    const response = await fetch(`${API_BASE}/endereco/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const contentType = response.headers.get("content-type");
    
    if (!response.ok) {
      let errorMessage = `Erro HTTP ${response.status}`;
      
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        const textResponse = await response.text();
        console.error("Resposta não-JSON recebida:", textResponse.substring(0, 500));
        errorMessage = "Erro no servidor. Verifique os logs.";
      }
      
      throw new Error(errorMessage);
    }

    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.error("Resposta não-JSON recebida:", textResponse.substring(0, 500));
      throw new Error("Resposta do servidor não está no formato JSON esperado.");
    }

    const data = await response.json();

    if (data.status !== "success") {
      throw new Error(data.message || "Erro ao excluir endereço.");
    }

    return data;
  } catch (error) {
    console.error("Erro ao excluir endereço:", error);
    throw error;
  }
}

export async function buscarEnderecoPrincipal() {
  try {
    const response = await fetch(`${API_BASE}/endereco/principal`);
    
    const contentType = response.headers.get("content-type");
    
    if (!response.ok) {
      if (response.status === 404) {
        // 404 é esperado quando não há endereço principal
        return { status: "error", message: "Nenhum endereço principal encontrado." };
      }
      
      let errorMessage = `Erro HTTP ${response.status}`;
      
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        const textResponse = await response.text();
        console.error("Resposta não-JSON recebida:", textResponse.substring(0, 500));
        
        // Se contém tags HTML, é provavelmente um erro do PHP
        if (textResponse.includes('<br') || textResponse.includes('<!DOCTYPE')) {
          errorMessage = "Erro interno do servidor PHP. Verifique se todas as classes estão disponíveis.";
        } else {
          errorMessage = "Erro no servidor. Verifique os logs.";
        }
      }
      
      throw new Error(errorMessage);
    }

    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.error("Resposta não-JSON recebida:", textResponse.substring(0, 500));
      
      // Se contém tags HTML, é provavelmente um erro do PHP
      if (textResponse.includes('<br') || textResponse.includes('<!DOCTYPE')) {
        throw new Error("Erro interno do servidor PHP. Verifique se todas as classes estão disponíveis.");
      } else {
        throw new Error("Resposta do servidor não está no formato JSON esperado.");
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar endereço principal:", error);
    throw error;
  }
}

export async function salvarEnderecoDoFormulario(dadosEndereco) {
  try {
    const response = await fetch(`${API_BASE}/endereco/formulario`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosEndereco),
    });

    const contentType = response.headers.get("content-type");
    
    if (!response.ok) {
      let errorMessage = `Erro HTTP ${response.status}`;
      
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        const textResponse = await response.text();
        console.error("Resposta não-JSON recebida:", textResponse.substring(0, 500));
        errorMessage = "Erro no servidor. Verifique os logs.";
      }
      
      throw new Error(errorMessage);
    }

    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.error("Resposta não-JSON recebida:", textResponse.substring(0, 500));
      throw new Error("Resposta do servidor não está no formato JSON esperado.");
    }

    const data = await response.json();

    if (data.status !== "success") {
      throw new Error(data.message || "Erro ao salvar endereço.");
    }

    return data;
  } catch (error) {
    console.error("Erro ao salvar endereço:", error);
    throw error;
  }
}