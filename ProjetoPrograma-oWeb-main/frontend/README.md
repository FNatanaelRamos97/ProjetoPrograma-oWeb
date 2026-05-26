# ConectServ — Frontend

Interface do marketplace de serviços ConectServ, construída com React + Vite + TypeScript.

## Como executar

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build
```

O frontend roda em `http://localhost:5173` e se comunica com o backend em `http://localhost:3333`.

## Estrutura do projeto

```
frontend/
├── public/                     # Assets estáticos (favicon, ícones PNG)
├── src/
│   ├── components/             # Componentes reutilizáveis
│   │   └── NavBar/             # Barra de navegação principal
│   ├── contexts/               # Contextos React (AuthContext)
│   ├── pages/                  # Páginas da aplicação
│   │   ├── Admin/              # Painel administrativo
│   │   ├── CadastroServico/    # Cadastro de serviço
│   │   ├── Chat/               # Mensagens
│   │   ├── Configuracoes/      # Configurações do usuário
│   │   ├── Hub/                # Página inicial
│   │   ├── Login/              # Login e registro
│   │   ├── MeusPedidos/        # Meus pedidos
│   │   ├── Pagamento/          # Pagamento
│   │   ├── PagamentoRealizado/ # Confirmação de pagamento
│   │   ├── Perfil/             # Perfil do usuário
│   │   ├── PIX/                # Pagamento via PIX
│   │   ├── Profissionais/      # Lista de profissionais
│   │   ├── Produtos/           # Lista de serviços (Explorar)
│   │   ├── SobreConectServ/    # Sobre a plataforma
│   │   ├── TornarSePrestador/  # Onboarding para prestador
│   │   └── VerDetalhes/        # Detalhes do serviço
│   ├── types/                  # Tipos TypeScript
│   └── styles/                 # Estilos globais
├── index.html
├── vite.config.ts
└── package.json
```

## Design System

- Background escuro: gradiente navy (#071B45 → #102B58)
- Azul principal: #2563FF
- Verde: #10B981 / #00B96B
- Cards: fundo branco ou glassmorphism suave
- Inputs: 54px height, 14px border-radius
- Fonte: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto

## Funcionalidades

- Autenticação (cliente, prestador, admin)
- Cadastro e listagem de serviços
- Perfil com nível e progresso
- Solicitação para tornar-se prestador (role: prestador_pendente)
- Painel admin com gráficos e métricas
- Chat, pagamento PIX, meus pedidos
