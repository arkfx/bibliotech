CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_reading_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================
-- TABELA: cargo
-- ========================
CREATE TABLE public.cargo (
  id serial NOT NULL,
  nome TEXT NOT NULL,
  CONSTRAINT cargo_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

INSERT INTO "public"."cargo" ("id", "nome") VALUES ('1', 'USUARIO'), ('2', 'ADMIN');

-- ========================
-- TABELA: usuario
-- ========================
CREATE TABLE public.usuario (
  id serial NOT NULL,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  senha TEXT NOT NULL,
  cargo_id INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  telefone VARCHAR(20),
  data_nascimento DATE,
  cpf VARCHAR(14),
  CONSTRAINT usuario_pkey PRIMARY KEY (id),
  CONSTRAINT usuario_email_key UNIQUE (email),
  CONSTRAINT fk_cargo FOREIGN KEY (cargo_id) REFERENCES cargo (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Inserir usuário admin com senha hash
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO usuario (nome, email, senha, cargo_id)
VALUES ('Admin', 'admin@gmail.com', crypt('123456', gen_salt('bf')), 2);

-- ========================
-- TABELA: endereco
-- ========================
CREATE TABLE public.endereco (
  id serial NOT NULL,
  usuario_id INTEGER NOT NULL,
  endereco VARCHAR(255) NOT NULL,
  numero VARCHAR(20) NOT NULL,
  complemento VARCHAR(100),
  bairro VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  estado CHAR(2) NOT NULL,
  cep VARCHAR(10),
  is_principal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT endereco_pkey PRIMARY KEY (id),
  CONSTRAINT endereco_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_endereco_updated_at
BEFORE UPDATE ON endereco
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========================
-- TABELA: editoras
-- ========================
CREATE TABLE public.editoras (
  id serial NOT NULL,
  nome VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT editoras_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- ========================
-- TABELA: generos
-- ========================
CREATE TABLE public.generos (
  id serial NOT NULL,
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT generos_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- ========================
-- TABELA: livros
-- ========================
CREATE TABLE public.livros (
  id serial NOT NULL,
  titulo TEXT NOT NULL,
  autor TEXT NOT NULL,
  preco NUMERIC(10, 2) NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  genero_id INTEGER NOT NULL,
  imagem_url TEXT,
  editora_id INTEGER NOT NULL,
  pdf_url TEXT,
  CONSTRAINT livros_pkey PRIMARY KEY (id),
  CONSTRAINT fk_genero FOREIGN KEY (genero_id) REFERENCES generos (id) ON DELETE CASCADE,
  CONSTRAINT fk_livros_editoras FOREIGN KEY (editora_id) REFERENCES editoras (id) ON DELETE RESTRICT
) TABLESPACE pg_default;

-- ========================
-- TABELA: biblioteca
-- ========================
CREATE TABLE public.biblioteca (
  id serial NOT NULL,
  usuario_id INTEGER,
  livro_id INTEGER,
  data_adquirido TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT biblioteca_pkey PRIMARY KEY (id),
  CONSTRAINT biblioteca_usuario_id_livro_id_key UNIQUE (usuario_id, livro_id),
  CONSTRAINT biblioteca_livro_id_fkey FOREIGN KEY (livro_id) REFERENCES livros (id) ON DELETE CASCADE,
  CONSTRAINT biblioteca_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- ========================
-- TABELA: carrinho
-- ========================
CREATE TABLE public.carrinho (
  id serial NOT NULL,
  usuario_id INTEGER,
  livro_id INTEGER,
  quantidade INTEGER NOT NULL,
  criado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tipo TEXT NOT NULL DEFAULT 'fisico'::TEXT,
  CONSTRAINT carrinho_pkey PRIMARY KEY (id),
  CONSTRAINT carrinho_livro_id_fkey FOREIGN KEY (livro_id) REFERENCES livros (id),
  CONSTRAINT carrinho_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuario (id),
  CONSTRAINT carrinho_quantidade_check CHECK ((quantidade > 0)),
  CONSTRAINT carrinho_tipo_check CHECK ((tipo = ANY (ARRAY['ebook'::TEXT, 'fisico'::TEXT])))
) TABLESPACE pg_default;

-- ========================
-- TABELA: lista_desejos
-- ========================
CREATE TABLE public.lista_desejos (
  id serial NOT NULL,
  usuario_id INTEGER NOT NULL,
  livro_id INTEGER NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT lista_desejos_pkey PRIMARY KEY (id),
  CONSTRAINT lista_desejos_unica UNIQUE (usuario_id, livro_id),
  CONSTRAINT lista_desejos_livro_id_fkey FOREIGN KEY (livro_id) REFERENCES livros (id) ON DELETE CASCADE,
  CONSTRAINT lista_desejos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- ========================
-- TABELA: reading_progress
-- ========================
CREATE TABLE public.reading_progress (
  id serial NOT NULL,
  usuario_id INTEGER NOT NULL,
  livro_id INTEGER NOT NULL,
  current_page INTEGER NOT NULL DEFAULT 1,
  total_pages INTEGER NOT NULL DEFAULT 1,
  progress_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  last_read_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT reading_progress_pkey PRIMARY KEY (id),
  CONSTRAINT reading_progress_usuario_id_livro_id_key UNIQUE (usuario_id, livro_id),
  CONSTRAINT reading_progress_livro_id_fkey FOREIGN KEY (livro_id) REFERENCES livros (id) ON DELETE CASCADE,
  CONSTRAINT reading_progress_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Indexes para leitura rápida
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_book ON public.reading_progress (usuario_id, livro_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_progress ON public.reading_progress (usuario_id, progress_percentage) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_reading_progress_last_read ON public.reading_progress (usuario_id, last_read_at DESC) TABLESPACE pg_default;

-- Trigger para updated_at
CREATE TRIGGER reading_progress_updated_at
BEFORE UPDATE ON reading_progress
FOR EACH ROW
EXECUTE FUNCTION update_reading_progress_updated_at();

-- ========================
-- TABELA: pedidos
-- ========================
CREATE TABLE public.pedidos (
  id serial NOT NULL,
  usuario_id INTEGER,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'pendente'::TEXT,
  criado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  valor_frete NUMERIC(10, 2) DEFAULT 0.00,
  endereco_id INTEGER,
  CONSTRAINT pedidos_pkey PRIMARY KEY (id),
  CONSTRAINT fk_pedidos_endereco FOREIGN KEY (endereco_id) REFERENCES endereco (id),
  CONSTRAINT pedidos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuario (id)
) TABLESPACE pg_default;

-- ========================
-- TABELA: pedido_itens
-- ========================
CREATE TABLE public.pedido_itens (
  id serial NOT NULL,
  pedido_id INTEGER,
  livro_id INTEGER,
  quantidade INTEGER NOT NULL,
  preco_unitario NUMERIC(10, 2) NOT NULL,
  tipo VARCHAR(10),
  CONSTRAINT pedido_itens_pkey PRIMARY KEY (id),
  CONSTRAINT pedido_itens_livro_id_fkey FOREIGN KEY (livro_id) REFERENCES livros (id),
  CONSTRAINT pedido_itens_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES pedidos (id) ON DELETE CASCADE,
  CONSTRAINT pedido_itens_quantidade_check CHECK ((quantidade > 0))
) TABLESPACE pg_default;


-- =================================================================
-- Limpar os dados existentes para inserir a nova lista de livros.
-- O comando TRUNCATE...RESTART IDENTITY garante que a contagem dos IDs comece em 1.
-- =================================================================
TRUNCATE TABLE public.generos, public.editoras, public.livros RESTART IDENTITY CASCADE;

-- Inserindo dados na tabela 'editoras'
INSERT INTO public.editoras (nome) VALUES
('Companhia das Letras'), -- ID será 1
('Sextante'),             -- ID será 2
('Rocco'),                -- ID será 3
('HarperCollins Brasil'); -- ID será 4

-- Inserindo dados na tabela 'generos'
INSERT INTO public.generos (nome) VALUES
('Ficção Científica'),      -- ID será 1
('Mistério'),             -- ID será 2
('Divulgação Científica'),-- ID será 3
('Fantasia'),             -- ID será 4
('Biografia');            -- ID será 5


-- =================================================================
-- Inserir livros 
-- =================================================================

INSERT INTO public.livros (titulo, autor, preco, descricao, genero_id, editora_id, imagem_url, pdf_url) VALUES
(
  '1984',
  'George Orwell',
  48.20,
  'Um romance distópico sobre uma sociedade totalitária que vigia todos os seus cidadãos e controla o pensamento.',
  1, -- Gênero: Ficção Científica
  1, -- Editora: Companhia das Letras
  'https://m.media-amazon.com/images/I/61t0bwt1s3L._AC_UF1000,1000_QL80_.jpg',
  'https://gwgmjgyiyrhwgnspuaud.supabase.co/storage/v1/object/public/livros//1984.pdf'
),
(
  'O Código Da Vinci',
  'Dan Brown',
  52.50,
  'Um professor de simbologia de Harvard se torna o principal suspeito de um assassinato bizarro no Museu do Louvre.',
  2, -- Gênero: Mistério
  2, -- Editora: Sextante
  'https://m.media-amazon.com/images/I/815WORuYMML.jpg',
  'https://gwgmjgyiyrhwgnspuaud.supabase.co/storage/v1/object/public/livros//codigo%20da%20vinci.pdf'
),
(
  'Cosmos',
  'Carl Sagan',
  89.90,
  'Uma jornada deslumbrante através do tempo e do espaço, explorando as maravilhas do universo de forma acessível.',
  3, -- Gênero: Divulgação Científica
  1, -- Editora: Companhia das Letras
  'https://m.media-amazon.com/images/I/81i3QCLGUzL._UF894,1000_QL80_DpWeblab_.jpg',
  'https://gwgmjgyiyrhwgnspuaud.supabase.co/storage/v1/object/public/livros//cosmos.pdf'
),
(
  'Harry Potter e a Pedra Filosofal',
  'J.K. Rowling',
  45.00,
  'A vida de um garoto órfão muda para sempre quando ele descobre que é um bruxo e é convidado para Hogwarts.',
  4, -- Gênero: Fantasia
  3, -- Editora: Rocco
  'https://m.media-amazon.com/images/I/71-++hbbERL.jpg',
  'https://gwgmjgyiyrhwgnspuaud.supabase.co/storage/v1/object/public/livros//harry%20potter.pdf'
),
(
  'O Hobbit',
  'J.R.R. Tolkien',
  55.90,
  'A aventura de Bilbo Bolseiro, um hobbit pacato que é arrastado para uma jornada épica para recuperar um tesouro de um dragão.',
  4, -- Gênero: Fantasia
  4, -- Editora: HarperCollins Brasil
  'https://harpercollins.com.br/cdn/shop/products/9788595085800_54e043c2-1006-48e6-bf16-7db869ccc415.jpg?v=1692287307',
  'https://gwgmjgyiyrhwgnspuaud.supabase.co/storage/v1/object/public/livros//hobbit.pdf'
),
(
  'O Senhor dos Anéis: A Sociedade do Anel',
  'J.R.R. Tolkien',
  75.00,
  'Em uma terra fantástica, um jovem hobbit recebe a missão de destruir um anel poderoso para salvar o mundo das trevas.',
  4, -- Gênero: Fantasia
  4, -- Editora: HarperCollins Brasil
  'https://harpercollins.com.br/cdn/shop/products/9786555114249.jpg?v=1691738136',
  'https://gwgmjgyiyrhwgnspuaud.supabase.co/storage/v1/object/public/livros//senhor%20dos%20aneis.pdf'
),
(
  'Steve Jobs',
  'Walter Isaacson',
  69.90,
  'A biografia autorizada do cofundador da Apple, baseada em mais de quarenta entrevistas com Jobs e centenas de outras fontes.',
  5, -- Gênero: Biografia
  1, -- Editora: Companhia das Letras
  'https://m.media-amazon.com/images/I/71sVQDj0SCL.jpg',
  'https://gwgmjgyiyrhwgnspuaud.supabase.co/storage/v1/object/public/livros//steve%20jobs.pdf'
);