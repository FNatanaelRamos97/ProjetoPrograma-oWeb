# Backend — criação do banco de dados, seed, `.env` e execução

Este guia mostra como configurar o backend, criar o banco SQLite, inserir dados iniciais com seed e rodar a API.

---

## 1. Entrar na pasta do backend

No terminal, acesse a pasta do backend:

cd backend

## 2. Instalar as dependências

Execute:

npm install

## 3. Criar o arquivo .env

Dentro da pasta backend, crie um arquivo chamado:

.env

Adicione o conteúdo abaixo:

PORT=3333
DATABASE_URL=./database.sqlite

## 4. Gerar as migrations do banco

npm run db:generate

Depois:

npm run db:migrate

E depois:

npm run db:seed

## 5. Rodando backend

npm run dev