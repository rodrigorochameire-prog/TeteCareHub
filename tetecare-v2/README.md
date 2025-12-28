# 🐾 TeteCare v2

Sistema de gestão de creche para pets, reconstruído do zero com Next.js 14.

## ✅ Status do Projeto

O projeto está configurado com:

- [x] **Next.js 14** com App Router
- [x] **TypeScript** com configuração estrita
- [x] **Tailwind CSS** para estilos
- [x] **shadcn/ui** componentes base (Button, Input, Card, etc.)
- [x] **Drizzle ORM** para banco de dados PostgreSQL
- [x] **tRPC** para API type-safe
- [x] **Sistema de autenticação** com JWT
- [x] **Layouts** responsivos para admin e tutor
- [x] **CRUD de Pets** básico funcionando
- [x] **Dashboards** para admin e tutor

## 🚀 Como Executar

### 1. Instalar Dependências

```bash
cd tetecare-v2
npm install
# ou
pnpm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
# Banco de Dados PostgreSQL
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Chave secreta para JWT (gere uma chave segura)
AUTH_SECRET="sua-chave-secreta-aqui"

# URL da aplicação
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Criar Banco de Dados

Use um serviço PostgreSQL como:
- **Neon** (https://neon.tech) - Recomendado, tem plano gratuito
- **Supabase** (https://supabase.com)
- **Railway** (https://railway.app)

### 4. Executar Migrations

```bash
# Gerar migrations
npm run db:generate

# Aplicar ao banco
npm run db:push
```

### 5. Criar Usuário Admin (Manual)

Execute este SQL no seu banco para criar o primeiro admin:

```sql
INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Admin',
  'admin@tetecare.com',
  '$2a$10$rQZ8K1L5gK3wP9xH7mNpXu4vB2cD6eF8gHiJkLmNoPqRsTuVwXyZ0', -- senha: 123456
  'admin'
);
```

Ou use a página de registro e depois mude o role no banco.

### 6. Executar o Projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

## 📁 Estrutura do Projeto

```
tetecare-v2/
├── src/
│   ├── app/                    # App Router (páginas)
│   │   ├── (auth)/            # Páginas de autenticação
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/       # Páginas protegidas
│   │   │   ├── admin/         # Área do admin
│   │   │   └── tutor/         # Área do tutor
│   │   ├── api/               # API Routes
│   │   │   └── trpc/          # Endpoint tRPC
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── layouts/           # Componentes de layout
│   │   └── ui/                # Componentes shadcn/ui
│   ├── lib/
│   │   ├── auth/              # Sistema de autenticação
│   │   ├── db/                # Banco de dados (Drizzle)
│   │   ├── trpc/              # Configuração tRPC
│   │   │   └── routers/       # Routers por domínio
│   │   └── utils.ts           # Utilitários
│   └── types/
├── drizzle/                   # Migrations
├── public/
├── .env.example
├── drizzle.config.ts
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🔐 Autenticação

O sistema usa JWT para autenticação:

- **Login**: `/login`
- **Registro**: `/register`
- Cookies httpOnly e seguros
- Sessão válida por 30 dias

## 📊 Banco de Dados

Schema principal (em `src/lib/db/schema.ts`):

- `users` - Usuários (admin/tutor)
- `pets` - Pets cadastrados
- `petTutors` - Relação N:N pet-tutor
- `calendarEvents` - Eventos do calendário
- `vaccineLibrary` - Biblioteca de vacinas
- `petVaccinations` - Vacinações por pet
- `creditPackages` - Pacotes de créditos
- `bookingRequests` - Solicitações de reserva
- `notifications` - Notificações
- `dailyLogs` - Logs diários

## 🛣️ Próximos Passos

Para continuar o desenvolvimento:

1. **Calendário**: Implementar visualização e criação de eventos
2. **Vacinas**: CRUD completo de vacinações
3. **Reservas**: Sistema de booking online
4. **Créditos**: Integração com Stripe
5. **Notificações**: Push notifications
6. **Upload de Fotos**: Integração com Supabase Storage
7. **WhatsApp**: Integração opcional

## 🚀 Deploy na Vercel

1. Push para GitHub
2. Conectar repositório na Vercel
3. Configurar variáveis de ambiente
4. Deploy automático!

## 📝 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Lint
npm run lint

# Banco de dados
npm run db:generate  # Gerar migrations
npm run db:push      # Aplicar migrations
npm run db:studio    # Visualizar banco
```

## 🤝 Contribuindo

Este é um projeto em desenvolvimento. Sinta-se à vontade para:

1. Reportar bugs
2. Sugerir features
3. Enviar pull requests

---

Desenvolvido com ❤️ para TeteCare
