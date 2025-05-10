function selecionarOpcao(elemento) {
    // Remove a classe ativo de todos os botões
    const botoes = document.querySelectorAll('.opcao');
    botoes.forEach(btn => btn.classList.remove('ativo'));
    

    elemento.classList.add('ativo');
}