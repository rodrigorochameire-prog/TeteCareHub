# 🐾 TeteCare v2

Sistema de gestão de creche para pets, reconstruído do zero com Next.js 14.

## ✅ Status do Projeto

**BUILD: ✓ SUCESSO**

O projeto está pronto para uso com:

- [x] **Next.js 14.2** com App Router
- [x] **TypeScript** com configuração estrita
- [x] **Tailwind CSS 3.4** para estilos
- [x] **shadcn/ui** componentes base
- [x] **Drizzle ORM** para PostgreSQL (Supabase)
- [x] **tRPC** para API type-safe
- [x] **Sistema de autenticação** com JWT
- [x] **Layouts responsivos** para admin e tutor
- [x] **CRUD de Pets** completo
- [x] **Dashboards** funcionais
- [x] **Tratamento de erros** robusto
- [x] **Validações Zod** completas
- [x] **Scripts de utilidade** (seed, test-db, create-admin)

---

## 🚀 Guia Rápido de Instalação

### 1. Instalar Dependências

```bash
cd tetecare-v2
npm install
```

### 2. O arquivo `.env.local` já está configurado com o Supabase!

Se precisar reconfigurar, edite o arquivo `.env.local`:

```env
# Supabase (já configurado)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
DATABASE_URL=postgresql://postgres:senha@db.xxx.supabase.co:5432/postgres

# JWT Secret (já configurado)
AUTH_SECRET=sua-chave-secreta

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Criar Tabelas no Banco

```bash
npm run db:push
```

### 4. Popular com Dados Iniciais (Opcional)

```bash
npm run db:seed
```

Isso cria:
- Admin: `admin@tetecare.com` / `admin123`
- Tutor: `maria@email.com` / `tutor123`
- 3 pets de exemplo
- Biblioteca de vacinas
- Pacotes de créditos

### 5. Executar em Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 📋 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Cria build de produção |
| `npm run start` | Inicia servidor de produção |
| `npm run lint` | Verifica código com ESLint |
| `npm run typecheck` | Verifica tipos TypeScript |
| `npm run db:push` | Aplica schema ao banco |
| `npm run db:generate` | Gera migrations |
| `npm run db:studio` | Abre Drizzle Studio |
| `npm run db:test` | Testa conexão com banco |
| `npm run db:seed` | Popula banco com dados iniciais |
| `npm run db:create-admin` | Cria usuário admin interativamente |

---

## 📁 Estrutura do Projeto

```
tetecare-v2/
├── src/
│   ├── app/                    # App Router (páginas)
│   │   ├── (auth)/            # Login e registro
│   │   ├── (dashboard)/       # Área protegida
│   │   │   ├── admin/         # Páginas admin
│   │   │   └── tutor/         # Páginas tutor
│   │   └── api/trpc/          # API tRPC
│   │
│   ├── components/
│   │   ├── layouts/           # Sidebar, header
│   │   └── ui/                # Button, Input, Card...
│   │
│   └── lib/
│       ├── auth/              # JWT, sessão, senha
│       ├── db/                # Drizzle schema
│       ├── trpc/              # Routers tRPC
│       ├── errors.ts          # Tratamento de erros
│       ├── security.ts        # Rate limiting, sanitização
│       ├── validations.ts     # Schemas Zod
│       └── utils.ts           # Helpers
│
├── scripts/                   # Scripts de utilidade
│   ├── seed.ts               # Popular banco
│   ├── test-db.ts            # Testar conexão
│   └── create-admin.ts       # Criar admin
│
├── drizzle/                   # Migrations
└── public/                    # Assets estáticos
```

---

## 🔐 Sistema de Autenticação

- **JWT** com cookies httpOnly
- Sessão válida por **30 dias**
- **Roles**: `admin` e `user` (tutor)
- Proteção automática de rotas

### Fluxo:
1. Login → Valida credenciais → Cria sessão JWT
2. Cada request → Verifica cookie → Carrega usuário
3. tRPC → Verifica role → Permite/bloqueia acesso

---

## 🗃️ Banco de Dados

### Schema Principal

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários (admin/tutor) |
| `pets` | Pets cadastrados |
| `pet_tutors` | Relação N:N pet-tutor |
| `calendar_events` | Eventos do calendário |
| `vaccine_library` | Biblioteca de vacinas |
| `pet_vaccinations` | Vacinações por pet |
| `credit_packages` | Pacotes de créditos |
| `booking_requests` | Solicitações de reserva |
| `notifications` | Notificações |
| `daily_logs` | Logs diários |

### Conexão

O projeto usa **Supabase PostgreSQL** com:
- Pool de conexões (max 10)
- SSL obrigatório
- Prepared statements desabilitados (serverless-friendly)

---

## 🚀 Deploy na Vercel

### 1. Push para GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/tetecare-v2.git
git push -u origin main
```

### 2. Conectar na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Importe o repositório
3. Configure variáveis de ambiente:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 3. Deploy!

A Vercel fará o build automaticamente.

---

## 🔧 Próximos Passos de Desenvolvimento

### Fase 2: Calendário e Reservas
- [ ] Componente de calendário visual
- [ ] CRUD de eventos
- [ ] Sistema de reservas online
- [ ] Check-in/check-out

### Fase 3: Saúde
- [ ] CRUD de vacinas
- [ ] CRUD de medicamentos
- [ ] Alertas de vencimento
- [ ] Relatórios de saúde

### Fase 4: Créditos e Pagamentos
- [ ] Integração Stripe
- [ ] Compra de pacotes
- [ ] Débito automático

### Fase 5: Comunicação
- [ ] Push notifications
- [ ] Chat interno
- [ ] Galeria de fotos
- [ ] WhatsApp (opcional)

---

## 🐛 Solução de Problemas

### Erro de conexão com banco
```bash
npm run db:test
```
Verifique se a `DATABASE_URL` está correta no `.env.local`.

### Erro de build
```bash
npm run typecheck
```
Corrige erros de TypeScript antes do build.

### Limpar cache
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## 📝 Licença

MIT License

---

**Desenvolvido com ❤️ para TeteCare**
