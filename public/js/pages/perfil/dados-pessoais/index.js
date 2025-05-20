import { initForm } from './form-handler.js';
import { carregarDadosUsuario } from './data-service.js';

export async function initPersonalInfo() {
  //carregar dados do usuário
  await carregarDadosUsuario();

  // Inicializar formulário
  initForm();

}