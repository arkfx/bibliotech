# BiblioTech - Livraria Digital

## Universidade Federal do Tocantins (UFT)

**Curso:** Ciência da Computação  
**Disciplina:** Engenharia de Software  
**Semestre:** 1º Semestre de 2025  
**Professor:** Edeilson Milhomem

## 👥 Integrantes do Time

- Guilherme Thomaz Brito
- Ítalo Henrik Batista Reis
- Jhennifer da Silva Azevedo
- Luiz Felipe da Paz Leal
- Marcos Freire de Melo

## 📌 Navegação

- [📚 Requisitos Funcionais](#requisitos-funcionais)
- [🎭 User Stories](#user-stories)
- [🔁 Iterações](#iterações)
- [🚀 Executar o Projeto](#como-executar-o-projeto)


## 📖 Sobre o Projeto

O **BiblioTech** é uma livraria digital que permite a venda de livros digitais (ebooks) e livros físicos de forma acessível e organizada. Os usuários poderão explorar um catálogo de livros, realizar compras e acessar sua biblioteca digital para leitura dos ebooks adquiridos.

## Requisitos Funcionais 

### RF01: Cadastro do Usuário

- O sistema deve permitir que novos usuários se cadastrem.

### RF02: Login do Usuário

- O sistema deve permitir que usuários já cadastrados façam login.

### RF03: Navegação no Catálogo

- O sistema deve exibir um catálogo de livros disponíveis para compra.
- O sistema deve permitir a navegação por categorias e subcategorias de livros.
- O sistema deve exibir livros em destaque.

### RF04: Busca e Filtragem

- O sistema deve permitir a busca de livros por título.
- O sistema deve permitir a busca de livros por gênero literário.
- O sistema deve permitir a busca de livros por palavras-chave e conteúdo.
- O sistema deve permitir a filtragem de resultados por preço.

### RF05: Visualização de Detalhes do Livro

- O sistema deve exibir informações detalhadas sobre cada livro.
- O sistema deve mostrar a capa, sinopse, informações do autor e editora.

### RF06: Carrinho de Compras

- O sistema deve permitir que usuários adicionem livros ao carrinho de compras.
- O sistema deve permitir que usuários removam livros do carrinho.
- O sistema deve permitir que usuários alterem a quantidade de itens.
- O sistema deve salvar o carrinho para acesso posterior, mesmo após logout.
- O sistema deve calcular automaticamente o valor total da compra.

### RF07: Finalização do pedido

- O sistema deve adicionar automaticamente os livros comprados à biblioteca do usuário.
- O sistema deve permitir que o usuário visualize o status e detalhes de seus pedidos anteriores.
- O sistema deve armazenar o histórico de compras do usuário.

### RF08: Gerenciamento de Perfil

- O sistema deve permitir que usuários visualizem seus dados de perfil.
- O sistema deve permitir que usuários editem suas informações pessoais.
- O sistema deve permitir que usuários alterem suas senhas.

### RF09: Biblioteca do Usuário

- O sistema deve exibir todos os livros adquiridos pelo usuário.
- O sistema deve permitir a ordenação dos livros por data de compra, título ou autor.
- O sistema deve permitir a busca de livros na biblioteca do usuário.
- O sistema deve permitir a filtragem de livros por categoria ou status de leitura.

### RF010: Leitor de eBooks

- O sistema deve fornecer um leitor de ebooks integrado.
- O sistema deve permitir a navegação entre capítulos e páginas.
- O sistema deve permitir retornar à última página lida.

### RF11: Gerenciamento de Catalógo

- O sistema deve permitir que administradores adicionem novos livros ao catálogo.
- O sistema deve permitir que administradores editem informações de livros existentes.
- O sistema deve permitir que administradores removam livros do catálogo.
- O sistema deve permitir que administradores categorizem livros em gêneros e coleções.

### RF12: Lista de desejos

- O sistema deve permitir que o usuário adicione livros à sua lista de desejos.
- O sistema deve permitir que o usuário remova livros da sua lista de desejos.
- O sistema deve exibir todos os livros salvos na lista de desejos do usuário.
- O sistema deve refletir as alterações feitas na lista de desejos em tempo real, como adições ou remoções.

## User Stories

#### **RF01: Cadastro do Usuário**

**Eu, como usuário, desejo me cadastrar na plataforma BiblioTech.**  
Para isso, eu devo acessar a página inicial e clicar na opção de **Cadastrar**. Para completar o cadastro, preciso inserir informações como **nome , e-mail, senha e confirmação da senha**. Caso eu já tenha uma conta, posso clicar na opção **"Faça login"** e ser direcionado para a tela de login.

![imagem de cadastro](prototipos/cadastro.png)

---

#### **RF02: Login do Usuário**

**Eu, como usuário, desejo acessar minha conta na BiblioTech.**  
Para isso, preciso estar previamente cadastrado. Na tela de login, devo inserir meu **e-mail e senha cadastrados**. Caso eu não tenha uma conta, posso clicar na opção **"Cadastre-se"** e ser direcionado para a tela de cadastro.

![alt text](prototipos/login.png)

---

#### **RF03: Navegação no Catálogo**

**Eu, como usuário, desejo visualizar os livros disponíveis na BiblioTech, para escolher que livro desejo ver detalhes ou comprar.**  
Para isso, ao acessar a **página inicial**, devo encontrar uma **lista de livros exibidos de forma organizada**, incluindo **livros em destaque, lançamentos**.

---

#### **RF04: Busca e Filtragem**

**Eu, como usuário, desejo buscar livros específicos na plataforma.**  
Para isso, devo poder utilizar a **barra de pesquisa**, onde poderei inserir o **título do livro ou palavras-chave**.

**Eu, como usuário, desejo filtrar os livros exibidos.**  
Para isso, a plataforma deve disponibilizar filtros por **gênero literário, preço**, facilitando a busca pelos livros do meu interesse.

![alt text](prototipos/home.png)

---

#### **RF05: Visualização de Detalhes do Livro**

**Eu, como usuário, desejo visualizar detalhes de um livro antes de comprá-lo.**  
Ao clicar em um livro no catálogo, devo ser direcionado para uma página que contém **a capa do livro, título, autor, sinopse, editora e preço**.

![alt text](prototipos/detalhes.png)

---

#### RF06: Carrinho de Compras

**Eu, como usuário, desejo adicionar livros ao meu carrinho de compras.**
Assim, poderei **selecionar os livros** que desejo comprar e finalizá-los todos juntos no momento apropriado.

**Eu, como usuário, desejo remover livros do meu carrinho.**
Para isso, poderei **acessar o carrinho** e excluir os livros que não quero mais comprar.

**Eu, como usuário, desejo alterar a quantidade de livros no meu carrinho.**
Para isso, poderei ajustar a **quantidade desejada** antes de finalizar a compra (no caso de livros com múltiplos volumes ou coleções).

**Eu, como usuário, desejo que o sistema salve meu carrinho mesmo que eu saia da conta.**
Assim, ao retornar para o sistema, poderei **continuar minhas compras** de onde parei.

**Eu, como usuário, desejo visualizar o valor total da compra no carrinho.**
Para isso, o sistema deve calcular e exibir o **valor atualizado** conforme modifico o conteúdo do carrinho.

![alt text](prototipos/carrinho.png)

---

#### RF07: Finalização do Pedido

**Eu, como usuário, desejo visualizar uma confirmação clara após finalizar minha compra.**
Para isso, o sistema deve exibir uma tela com a mensagem **“Compra finalizada com sucesso 🎉”**, listando os livros adquiridos, suas quantidades, e seus respectivos preços.

**Eu, como usuário, desejo visualizar o endereço de entrega cadastrado para a compra.**
Assim, posso confirmar que os dados estão corretos. O sistema deve exibir o endereço completo com **quadra, alameda, QI, cidade e estado**.

**Eu, como usuário, desejo acompanhar o status da entrega dos meus livros físicos (quando aplicável).**
Para isso, a tela de finalização deve mostrar um indicador visual de rastreio.

![alt text](prototipos/finalizada.png)

---

#### RF08: Gerenciamento de Perfil

**Eu, como usuário, desejo visualizar meus dados pessoais cadastrados.**
Assim, poderei conferir minhas informações diretamente na plataforma.

**Eu, como usuário, desejo editar minhas informações pessoais.**
Para isso, devo conseguir atualizar dados como nome, e-mail ou outras preferências.

**Eu, como usuário, desejo alterar minha senha.**
Para isso, a plataforma deve disponibilizar uma opção segura para redefinir ou atualizar minha senha.

![perfil](prototipos/perfil.png)

---

#### RF09: Biblioteca do Usuário

**Eu, como usuário, desejo visualizar todos os livros que comprei.**
Assim, poderei acessá-los a qualquer momento em minha biblioteca digital.

**Eu, como usuário, desejo buscar livros específicos dentro da minha biblioteca.**
Para isso, uma barra de pesquisa deve estar **disponível** na tela da biblioteca.

**Eu, como usuário, desejo filtrar os livros da minha biblioteca por categoria.**
Assim, consigo localizar com facilidade os **livros que ainda não li** ou que fazem parte de um gênero específico.

![alt text](prototipos/biblioteca.png)

---

#### RF10: Leitor de eBooks

**Eu, como usuário, desejo ler meus livros digitais diretamente na plataforma.**
Para isso, o sistema deve disponibilizar um **leitor de ebooks** integrado, acessível a partir da biblioteca.

![alt text](prototipos/leitor.png)

---

#### RF11: Gerenciamento de Catálogo (Administrador)

**Eu, como administrador, desejo adicionar novos livros ao catálogo.**
Assim, posso manter a livraria sempre **atualizada** com novos títulos.

**Eu, como administrador, desejo editar as informações dos livros já cadastrados.**
Para isso, devo acessar a área de gerenciamento e **alterar** os dados necessários, como título, sinopse ou preço.

**Eu, como administrador, desejo remover livros do catálogo.**
Assim, consigo **excluir** conteúdos desatualizados ou que não devem mais ser vendidos.

![alt text](prototipos/administrador.png)

---

#### RF12: Lista de Desejos

**Eu, como usuário, desejo adicionar livros à minha lista de desejos.**  
Assim, posso salvar livros que me interessam para acessá-los facilmente no futuro.

**Eu, como usuário, desejo remover livros da minha lista de desejos.**  
Para isso, devo poder acessar minha lista de desejos e excluir os livros que não quero mais manter.

**Eu, como usuário, desejo visualizar todos os livros salvos na minha lista de desejos.**  
Assim, posso acessar uma página dedicada onde todos os livros salvos são exibidos de forma organizada.

**Eu, como usuário, desejo que a lista de desejos seja atualizada em tempo real.**  
Assim, ao adicionar ou remover livros, o sistema deve refletir imediatamente as alterações na interface.

## Iterações
---

### Iteração 1 - Cadastro e Visualização de livros

_Valor_: Permitir que o administrador gerencie os livros disponíveis na livraria digital, incluindo cadastro, edição e remoção de títulos, enquanto o usuário pode visualizar o catálogo de livros, com opções de busca e filtragem

_Objetivo_: Como administrador, desejo acessar o sistema para cadastrar, editar e remover livros do catálogo, de forma organizada, para que os usuários tenham acesso aos títulos corretos.

_Requisitos_:

- RF02 – Login do Usuário
- RF11 – Gerenciamento de Catálogo

_Objetivo_: Como usuário, desejo visualizar os livros disponíveis na plataforma, podendo buscar por título, filtrar por gênero ou preço, para encontrar facilmente os livros do meu interesse.

_Requisitos_:

- RF03 – Navegação no Catálogo

- RF04 – Busca e Filtragem

[Acesse o relatório](relatorios/iteracao-1.md)

---

### Iteração 2 - Autenticação do usuário e Carrinho de Compras.

_Valor_: Garantir que os usuários possam se cadastrar, fazer login, visualizar detalhes dos livros, adicionar ao carrinho, e salvar o carrinho após o logout.

_Objetivo_: Permitir que o usuário se cadastre e faça login na plataforma, visualize os detalhes dos livros, adicione livros ao carrinho e, ao dar logout, o carrinho seja salvo para que possa continuar a compra posteriormente.

_Requisitos_:

- RF01 - Cadastro do Usuário
- RF05 - Visualização de Detalhes do Livro
- RF06 - Carrinho de Compras

[Acesse o relatório](relatorios/iteracao-2.md)

---

### Iteração 3 - Finalização do Pedido e Gerenciamento de Perfil com Histórico de Pedidos e Lista de desejos

_Valor_: Proporcionar uma experiência completa de compra, permitindo que os usuários finalizem pedidos, acompanhem seu histórico de compras e gerenciem suas listas de desejos. Além disso, oferecer funcionalidades para gerenciar o perfil e visualizar informações pessoais.

_Objetivo_: Implementar as funcionalidades de finalização de pedidos e gerenciamento de perfil, incluindo o histórico de pedidos e a exibição dos livros salvos na lista de desejos. Isso melhora a experiência do usuário, garantindo que ele tenha acesso às informações de suas compras, dados pessoais e livros de interesse.


_Requisitos_:

- RF07 - Finalização do Pedido
- RF08 - Gerenciamento de Perfil
- RF12 - Lista de desejos

[Acesse o relatório](relatorios/iteracao-3.md)

---

### Iteração 4 - Biblioteca do Usuário e Leitor de eBooks

_Valor_: Permitir que os usuários acessem e leiam os livros digitais que adquiriram, além de gerenciar sua biblioteca pessoal.

_Objetivo_: Como usuário, desejo acessar minha biblioteca de livros comprados, organizar e buscar títulos, e ler meus eBooks diretamente na plataforma, para ter uma experiência de leitura digital completa e integrada.

Requisitos:

- RF09 – Biblioteca do Usuário
- RF10 – Leitor de eBooks

[Acesse o relatório](relatorios/iteracao-4.md)

---

### Iteração 5 - Refinamento da Plataforma e Melhorias de Usabilidade

_Valor_: Aprimorar a experiência do usuário e a robustez do sistema através da implementação de funcionalidades de navegação otimizadas, gerenciamento de dados mais completo e refinamento de recursos existentes, além de garantir a qualidade do código com a introdução de testes unitários.

_Objetivo_: Como equipe de desenvolvimento, desejamos refinar a plataforma BiblioTech implementando paginação em listagens extensas, melhorando o gerenciamento de endereços para pedidos, criando uma tela de catálogo mais interativa com opções de ordenação, adicionando o gerenciamento de gêneros no painel administrativo, aprimorando o leitor de eBooks e iniciando a cobertura de testes unitários para aumentar a confiabilidade e a manutenibilidade do sistema.


[Acesse o relatório](relatorios/iteracao-5.md)

---


## Como Executar o Projeto

Siga os passos abaixo para configurar e executar o projeto **BiblioTech** em seu ambiente de desenvolvimento local.

### 🔹 Pré-requisitos

Certifique-se de que você tem os seguintes softwares instalados e configurados em sua máquina:

-   **Git** para clonar o repositório.
    
-   **XAMPP** com o módulo **Apache** e **PHP**.
    
-   **Docker Desktop** para executar o banco de dados.
    
-   **DBeaver** (ou qualquer outro cliente SQL de sua preferência) para gerenciar o banco de dados.
    

### 🔹 1. Clonando o Repositório


```
# Clone o repositório do projeto para a sua máquina
git clone https://github.com/thomazllr/bibliotech.git
```

### 🔹 2. Configuração do Ambiente

#### Backend (PHP + Apache)

1.  Mova a pasta do projeto `bibliotech` que você clonou para dentro do diretório `htdocs` do XAMPP (geralmente `C:\xampp\htdocs`).

2.  Navegue até o diretório do projeto e instale as dependências do PHP usando o Composer. Se você não tiver o Composer instalado, [siga as instruções de instalação aqui](https://getcomposer.org/download/).
    
    ```
    cd C:\xampp\htdocs\bibliotech
    composer install
    ```

3.  Abra o arquivo de configuração do PHP, `php.ini`, geralmente localizado em `C:\xampp\php\php.ini`.
    
4.  Procure e descomente (remova o `;` do início) as seguintes extensões para permitir a comunicação com o PostgreSQL:
        
    ```
    extension=pgsql
    extension=pdo_pgsql
    ```
    
5.  Reinicie o serviço do **Apache** no painel de controle do XAMPP para que as alterações tenham efeito.
    

#### Banco de Dados (PostgreSQL com Docker)

1.  Certifique-se de que o **Docker Desktop** está em execução.
    
2.  No seu terminal (Prompt de Comando, PowerShell, etc.), execute o comando abaixo para criar e rodar um container Docker com o PostgreSQL.
    
    ```
    docker run --name postgres-bibliotech -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=bibliotech_db -p 5432:5432 -d postgres
    ```
    
    -   Este comando irá criar um container chamado `postgres-bibliotech`.
        
    -   Um banco de dados chamado `bibliotech_db` será criado automaticamente.
        
    -   O banco ficará acessível na porta `5432` da sua máquina.
        

#### Populando o Banco de Dados (DBeaver)

1.  Abra o **DBeaver** e crie uma nova conexão com o banco de dados utilizando os seguintes dados:
    
    -   **Tipo de Conexão:** PostgreSQL
        
    -   **Host:** `localhost`
        
    -   **Porta:** `5432`
        
    -   **Banco de Dados:** `bibliotech_db`
        
    -   **Usuário:** `postgres`
        
    -   **Senha:** `postgres`
        
2.  Teste a conexão para garantir que tudo está funcionando.
    
3.  Após conectar, abra um Editor SQL e execute os scripts para criar a estrutura do banco e popular os dados. Os scripts estão na raiz do projeto `data.sql`.
    
    -   **Execute o script de criação das tabelas e inserção de dados** (`data.sql`).
     
### 🔹 3. Executando o Projeto

1.  Garanta que os serviços **Apache** (pelo XAMPP) e **Docker Desktop** (com o container `postgres-bibliotech`) estão em execução.
    
2.  Abra seu navegador de internet e acesse a URL do projeto:
    
    ```
    http://localhost/bibliotech/view
    ```

Pronto! Agora o sistema **BiblioTech** deve estar funcionando em seu ambiente local.
