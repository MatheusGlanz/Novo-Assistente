Assistente Pessoal - Dashboard Completo 📖 Sobre o Projeto Este é um projeto Full-Stack de um Assistente Pessoal, desenvolvido como um dashboard centralizado para gerenciar diversas áreas da vida cotidiana. A aplicação conta com um sistema de autenticação seguro e uma interface reativa construída em React, oferecendo uma experiência de usuário fluida para organização pessoal.

O objetivo é centralizar o gerenciamento de tarefas, compromissos, finanças e listas de compras em um único lugar, com uma interface intuitiva e agradável.

✨ Funcionalidades Atualmente, o projeto conta com as seguintes funcionalidades:

🔐 Sistema de Autenticação Completo:

Cadastro de novos usuários.

Faça login seguro com JWT (JSON Web Tokens).

Funcionalidade de "Esqueci minha senha" com envio de e-mail.

📊 Painel Principal:

Página central que dá acesso a todas as outras funcionalidades.

Saudação personalizada com o nome do usuário.

✔️ Gerenciador de Tarefas:

Adicione, edite e exclua tarefas.

Campos para descrição, observações, dados e horário.

Filtro de visualização por mês.

📅 Agenda de Compromissos:

Cadastre compromissos com dados, horário e nível de importância.

Filtro por mês para melhor visualização.

Funcionalidades completas de CRUD (Criar, Ler, Atualizar, Deletar).

💰 Controle Financeiro:

Registrar gastos com nome, valor, dados e categoria pré-definida.

Dashboard financeiro com gráficos de distribuição de gastos por categoria.

Cálculo do total de gastos de acordo com os filtros.

Filtros interativos por categoria, mês e ano.

Funcionalidades completas do CRUD.

🛒 Lista de Mercado:

Crie uma lista de compras com nome do item, quantidade e categoria.

Filtre os itens por categoria.

Marque/desmarque itens como "comprados".

Funcionalidades completas do CRUD.

🛠️ Tecnologias Utilizadas O projeto foi construído com as seguintes tecnologias:

Backend Node.js

Express.js (para o servidor e rotas da API)

PostgreSQL (banco de dados relacional)

JWT (JSON Web Token) (para autenticação)

Bcrypt.js (para criptografia de senhas)

Nodemailer (para envio de e-mails de recuperação de senha)

Dotenv (para gerenciamento de variáveis ​​de ambiente)

Frontend React (com Vite)

React Router (para navegação e rotas)

Axios (para chamadas à API)

Chart.js (com react-chartjs-2 para os gráficos de finanças)

Ícones React (para a iconografia da interface)

CSS (módulos de CSS puro para estilização)

🚀 Como Executar o Projeto Siga os passos abaixo para rodar a aplicação localmente.

Pré-requisitos Você precisa ter o Node.js (versão 18 ou superior) instalado.

Você precisa ter o PostgreSQL instalado e rodando em sua máquina.

Configuração do Backend Bash
Clone ou repositório
git clone https://github.com/MatheusGlanz/Novo-Assistente.git

Navegue até a pasta do backend
cd Novo-Assistente/backend

Instalar as dependências
instalação npm

Crie um arquivo .env na raiz da pasta /backend e preencha com suas credenciais:
Arquivo .env (exemplo):

Banco de Dados
DB_HOST=localhost DB_USER=seu_usuario_postgres DB_PASSWORD=sua_senha_postgres DB_DATABASE=auth_system DB_PORT=5432

Segredo para o JWT
JWT_SECRET=crie_um_segredo_muito_forte_aqui

Credenciais do E-mail (use o Ethereal para testes)
EMAIL_HOST=smtp.ethereal.email EMAIL_PORT=587 EMAIL_USER= seu-email@ethereal.email EMAIL_PASS=sua-senha-ethereal 2. Configuração do Banco de Dados Abra seu gerenciador de PostgreSQL (pgAdmin, DBeaver, etc.) e execute os seguintes comandos SQL para criar o banco e as tabelas:

SQL

-- 1. Crie o banco de dados CREATE DATABASE auth_system;

-- 2. Conecte-se ao banco auth_system e execute os comandos abaixo:

-- Tabela de Usuários CREATE TABLE users ( id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP );

-- Tabela de Tarefas CREATE TABLE tasks ( id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, description VARCHAR(255) NOT NULL, notes TEXT, due_date TIMESTAMP WITH TIME ZONE NOT NULL, status VARCHAR(50) DEFAULT 'pendente', created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP );

-- Tabela da Agenda (Compromissos) CREATE TABLE appointments ( id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, commitment VARCHAR(255) NOT NULL, notes TEXT, appointment_date TIMESTAMP WITH TIME ZONE NOT NULL, is_important BOOLEAN DEFAULT FALSE, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP );

-- Tabela de Finanças CREATE TABLE finances ( id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, name VARCHAR(255) NOT NULL, amount DECIMAL(10, 2) NOT NULL, category VARCHAR(50) NOT NULL, transaction_date DATE NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP );

-- Tabela da Lista de Mercado CREATE TABLE supermercado_items ( id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, item_name VARCHAR(255) NOT NULL, quantidade VARCHAR(100), categoria VARCHAR(100) NOT NULL, is_checked BOOLEAN DEFAULT FALSE, criado_at TIMESTAMP WITH TIME ZONA PADRÃO CURRENT_TIMESTAMP ); 3. Executando a aplicação Com tudo configurado, abra dois terminais.

No primeiro terminal (para o Backend):

Bash

Na pasta /backend
npm executar dev

O servidor será iniciado, geralmente na porta 4000
No segundo terminal (para o Frontend):

Bash

Navegue até a pasta do frontend
cd ../front-end

Instalar as dependências
instalação npm

Montei uma aplicação
npm executar dev

O frontend iniciará, geralmente na porta 5173
Agora, acesse o endereço do frontend no seu navegador para usar o aplicativo!

👨‍💻 Autor Desenvolvido por Matheus Glanz.

GitHub: @MatheusGlanz
