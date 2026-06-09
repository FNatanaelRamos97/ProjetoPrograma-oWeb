# ConectServ

## Pré-requisitos

- Node.js instalado
- Git
- Stripe CLI

Para conferir no terminal:

node -v
npm -v
git --version
stripe --version

---
## Baixar projeto

```bash
git clone https://github.com/DavidBeckhan010/ProjetoPrograma-oWeb
cd ProjetoPrograma-oWeb-main
```

## Instalando o Stripe CLI

No PowerShell ou Git Bash:

```bash
powershell -ExecutionPolicy Bypass -Command "irm get.scoop.sh | iex"
```
Confira se está instalado com o comando:

```bash
scoop --version
```
Instale o stripe:

```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git scoop install stripe
```

---

## Backend

### 1. Entrar na pasta do backend

```bash
cd backend
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Criar o arquivo .env

Dentro da pasta `backend`, crie um arquivo chamado `.env` com o conteúdo abaixo:

```env
PORT=3333
DATABASE_URL=./database.sqlite
JWT_SECRET=conectserv_secret_dev_123
JWT_EXPIRES_IN=1d

STRIPE_SECRET_KEY=sk_test_COLE_SUA_CHAVE_AQUI
STRIPE_WEBHOOK_SECRET=whsec_COLE_O_WEBHOOK_SECRET_AQUI
FRONTEND_URL=http://localhost:5173
PLATFORM_COMMISSION_PERCENT=10
```

*OBSERVAÇÃO: SERÁ MOSTRADO MAIS ABAIXO O VALOR QUE DEVE FICAR NAS CHAVES STRIPE E COMO OBTÊ-LOS

```

### 4. Gerar as migrations do banco

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 5. Rodando backend

```bash
npm run dev
```

O backend roda em `http://localhost:3333`.

---

## Frontend

### 1. Entrar na pasta do frontend

```bash
cd frontend
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Rodando frontend

```bash
npm run dev
```

O frontend roda em `http://localhost:5173` e se comunica com o backend em `http://localhost:3333`.

## Simulação de pagamentos com STRIPE

Acesse o link abaixo, crie uma conta e faça login:

- https://dashboard.stripe.com/register

*COMO É APENAS PARA TESTE, NÃO PRECISA SER ESPECÍFICO NA HORA DE CRIAR A CONTA, COLOQUE UM EMAIL E DEPOIS VÁ PULANDO QUESTIONAMENTOS SOBRE SUA EMPRESA.

Clique em "Desenvolvedores", e depois selecione "Chaves da API". Verifique se você está em modo restrito.

Caso não esteja, tem um botão "Modo de teste". Clique nele para ativá-lo.

Copie o valor de Chave secreta ("O valor deve começar com sk_test_..."), e cole na variável: STRIPE_SECRET_KEY, que é para estar no arquivo .env da pasta backend.

Abra um terminal na pasta do seu projeto, e rode o comando:

```bash
stripe login
```

O terminal vai mostrar um código de pareamento e pedir para abrir o navegador.

Faça login na Stripe e autorize o Stripe CLI.

Com o backend rodando na porta 3333, rode:

```bash
stripe listen --forward-to localhost:3333/payments/webhook
```

O terminal vai mostrar algo parecido com:

```bash
Your webhook signing secret is whsec_...
```

Copie o valor que começa com:

```bash
whsec_
```

Cole no arquivo:

```bash
backend/.env
```

Na variável:

```bash
STRIPE_WEBHOOK_SECRET=whsec_COLE_O_VALOR_AQUI
```

Depois salve o arquivo .env.

Pare o backend com:

CTRL + C

Rode novamente:

```bash
npm run dev
```

Importante: o terminal do stripe listen precisa ficar aberto durante os testes de pagamento.

Para testar tudo, use 3 terminais abertos.

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

### Terminal 3 — Stripe webhook

```bash
stripe listen --forward-to localhost:3333/payments/webhook
```

### Usuários de teste

Após rodar o seed, use estes acessos:

Administrador

email: admin@conectserv.com
senha: admin123

Cliente

email: maria@teste.com
senha: 123456

Prestador

email: joao@teste.com
senha: 123456

### Testando pagamento com Stripe

A Stripe deve estar em modo teste.

Use este cartão de teste:

Número: 4242 4242 4242 4242
Validade: qualquer data futura
CVC: qualquer número de 3 dígitos
Nome: qualquer nome

Exemplo:

Número: 4242 4242 4242 4242
Validade: 12/30
CVC: 123
Nome: Maria Teste

Não use cartão real.
