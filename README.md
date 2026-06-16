# ConectServ

## Equipe

| Matrícula | Nome | Atribuições |
|---|---|---|
|UC24100355 |David Beckhan Santana Vieira |Criação do frontend com todas as atualizações e melhorias que envolveram |
|UC24101229 |Davi Araújo Chagas |Criação, estruturação e melhorias no backend/banco de dados drizzle |
|UC24101947 |Enzo Vieira de Souza | |
|UC24101445 |Francisco Natanael Ramos dos Santos |Atualização e melhorias no SQLite/ Alimentação de informações no site ideias de melhorias e pequenos ajustes nos layouts |
|UC24102644 |João Paulo Batista dos Santos |Alimentação de informações no site ideias de melhorias e ajustes na frontend |

---

## Pré-requisitos

- Node.js instalado
- Git
- Stripe CLI
- ngrok (para expor o servidor publicamente)

Para conferir no terminal nos sistemas Unix-like (Linux e macOS) ou gitbash do Windows, use o comando:

```bash
echo "node version $(node -v)" && echo "npm version $(npm -v)" && git --version && stripe --version && ngrok --version
```

Para conferir no WindowsPowerShell, use o comando:

```powershell
Write-Host "node version $(node -v)"; Write-Host "npm version $(npm -v)"; git --version; stripe --version; ngrok --version
```

---

## Instalando o Stripe CLI

Caso o seu sistema não possua o stripe instalado, use um dos gerenciadores de acordo com o seu sistema operacional:

- **Linux debian ou ubuntu** - `APT`;
- **Windows** - `WinGet` ou `Scoop`;
- **macOS** - `Homebrew`;

### Linux debian ou ubuntu

Na linha de comando desse sistema siga os seguintes passos:

1. Baixe a chave pública da Stripe e a converta para o formato usado pelo repositório APT

```bash
curl -fsSL https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | sudo gpg --dearmor -o /usr/share/keyrings/stripe.gpg
```

2. Adicionando o repositório da Stripe e salvando-o na configuração do APT

```bash
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee /etc/apt/sources.list.d/stripe.list
```

3. Atualize os índices do APT e instale o Stripe CLI

```bash
sudo apt update && sudo apt install stripe
```

### No WindowsPowerShell

#### WinGet

Abra o PowerShell do Windows e digite os seguintes comandos:

1. Instale o Stripe CLI

```powershell
winget install Stripe.StripeCLI
```

2. Confirme a instalação

```
stripe --version
```

3. Faça o login

```powershell
stripe login
```

A CLI exibirá um código e abrirá o navegador para autenticar sua conta Stripe.

#### Scoop

1. Verifique se o Scoop está instalado

```powershell
scoop --version
```

2. Adicione o bucket da Stripe

```powershell
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
```

3. Instale a Stripe CLI

```powershell
scoop install stripe
```

4. Confirme a instalação

```powershell
stripe --version
```

5. Faça o login

```powershell
stripe login
```

A CLI exibirá um código e abrirá o navegador para autenticar sua conta Stripe.

### No macOS

Abra o terminal no macOS e siga os seguintes passos:

1. Instale a Stripe CLI

```bash
brew install stripe/stripe-cli/stripe
```

2. Faça o login

```bash
stripe login
```

A Stripe CLI vai abrir o navegador e você pode logar com suas credenciais.

---

## Instalando o ngrok

### Windows

```powershell
winget install ngrok
```

Ou baixe o instalador em: https://ngrok.com/download

### macOS

```bash
brew install ngrok
```

### Linux

```bash
curl -fsSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
```

Após instalar, faça o cadastro gratuito em https://ngrok.com e copie o token de autenticação. Depois rode:

```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

---

## Baixar projeto

```bash
git clone https://github.com/DavidBeckhan010/ProjetoPrograma-oWeb
cd ProjetoPrograma-oWeb-main
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
MERCADOPAGO_ACCESS_TOKEN=TEST_COLE_SEU_TOKEN_AQUI
ABACATEPAY_API_KEY=abc_dev_COLE_SUA_KEY_AQUI
FRONTEND_URL=http://localhost:3333
PLATFORM_COMMISSION_PERCENT=10
```

*OBSERVAÇÃO: Os valores de cada chave são explicados nas seções específicas de cada gateway de pagamento.*

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

### 3. Rodando frontend em desenvolvimento

```bash
npm run dev
```

O frontend roda em `http://localhost:5173` e se comunica com o backend em `http://localhost:3333`.

### 4. Build para produção

Quando for publicar o site (via ngrok), faça o build do frontend:

```bash
npm run build
```

Os arquivos serão gerados em `frontend/dist/`. Com o build pronto, o backend passa a servir o frontend na mesma URL (porta 3333), eliminando a necessidade do `npm run dev` do frontend.

---

## Expondo o servidor com ngrok

Para receber webhooks de pagamento (Stripe, Mercado Pago, Abacate Pay), o backend precisa estar acessível publicamente.

Com o backend rodando na porta 3333, abra um terminal e execute:

```bash
ngrok http 3333
```

O ngrok vai gerar uma URL do tipo `https://xxxx-xx-xx-xx-xx.ngrok-free.app`. Copie essa URL e:

1. Atualize a variável `FRONTEND_URL` no arquivo `backend/.env` com a URL do ngrok
2. Reinicie o backend (Ctrl+C e `npm run dev` novamente)

---

## Stripe

### Criar conta

Acesse o link abaixo, crie uma conta e faça login:

- https://dashboard.stripe.com/register

*COMO É APENAS PARA TESTE, NÃO PRECISA SER ESPECÍFICO NA HORA DE CRIAR A CONTA, COLOQUE UM EMAIL E DEPOIS VÁ PULANDO QUESTIONAMENTOS SOBRE SUA EMPRESA.*

### Obter a chave secreta

Clique em "Desenvolvedores", e depois selecione "Chaves da API". Verifique se você está em modo de teste.

Caso não esteja, tem um botão "Modo de teste". Clique nele para ativá-lo.

Copie o valor de **Chave secreta** (começa com `sk_test_...`) e cole na variável `STRIPE_SECRET_KEY` no arquivo `.env`.

### Configurar o webhook

Com o ngrok rodando e a URL pública gerada, abra um terminal e execute:

```bash
stripe login
```

O terminal vai mostrar um código de pareamento e pedir para abrir o navegador. Faça login na Stripe e autorize o Stripe CLI.

Com o backend rodando na porta 3333, rode:

```bash
stripe listen --forward-to SEU_NGROK_URL/payments/webhook
```

O terminal vai mostrar algo parecido com:

```
Your webhook signing secret is whsec_...
```

Copie o valor que começa com `whsec_` e cole na variável `STRIPE_WEBHOOK_SECRET` no arquivo `.env`.

Depois salve o arquivo `.env`, pare o backend (Ctrl+C) e rode novamente:

```bash
npm run dev
```

**Importante:** o terminal do `stripe listen` precisa ficar aberto durante os testes de pagamento.

---

## Mercado Pago

### Obter o Access Token

1. Acesse https://www.mercadopago.com.br/developers e faça login ou crie uma conta
2. Vá em "Seus Integrações" → "Credenciais"
3. Certifique-se de estar em **modo de teste**
4. Copie o **Access Token** (começa com `TEST-...`) e cole na variável `MERCADOPAGO_ACCESS_TOKEN` no arquivo `.env`

*Para testar, não é necessário configurar webhook — o Mercado Pago redireciona o usuário de volta para o site após o pagamento.*

---

## Abacate Pay

### Obter a API Key

1. Acesse https://www.abacatepay.com e crie uma conta
2. Vá no painel → "Desenvolvedores" → "Chaves de API"
3. Gere uma chave de **teste** (começa com `abc_dev_...`)
4. Cole na variável `ABACATEPAY_API_KEY` no arquivo `.env`

---

## Executando o projeto (produção com ngrok)

Para testar tudo, use os seguintes terminais:

### Terminal 1 — ngrok

```bash
ngrok http 3333
```

Anote a URL gerada e atualize `FRONTEND_URL` no `.env` do backend.

### Terminal 2 — Backend (após build do frontend)

```bash
cd backend
npm run dev
```

### Terminal 3 — Webhook Stripe (apenas se for testar Stripe)

```bash
stripe listen --forward-to SEU_NGROK_URL/payments/webhook
```

Com isso o site estará acessível publicamente via URL do ngrok.

---

## Usuários de teste

Após rodar o seed, use estes acessos:

| Perfil | Email | Senha |
|---|---|---|
| Administrador | admin@conectserv.com | admin123 |
| Cliente | maria@teste.com | 123456 |
| Prestador | joao@teste.com | 123456 |

---

## Testando pagamentos

### Stripe

Use este cartão de teste no checkout da Stripe:

| Campo | Valor |
|---|---|
| Número | `4242 4242 4242 4242` |
| Validade | Qualquer data futura (ex: 12/30) |
| CVC | Qualquer 3 dígitos (ex: 123) |
| Nome | Qualquer nome |

### Mercado Pago

Use um destes cartões no checkout do Mercado Pago:

| Bandeira | Número | CVV | Validade |
|---|---|---|---|
| Mastercard | `5031 4332 1540 6351` | 123 | Qualquer data futura |
| Visa | `4235 6477 2802 5682` | 123 | Qualquer data futura |
| American Express | `3753 6512 4688 003` | 1234 | Qualquer data futura |

**CPF do titular:** `12345678909`

### Abacate Pay

O Abacate Pay redireciona para o checkout deles. Em modo de teste, o método disponível é **PIX**. O pagamento é simulado automaticamente — basta clicar em "Pagar com PIX" e confirmar.
