# Guia de Migração do Banco de Dados

## Sobre o Erro de Coluna Duplicada

Se você encontrou o erro `Duplicate column name 'linkedResourceType'`, siga este guia.

### Entendendo o Problema

O erro ocorre porque:
1. A migração `0050_calendar_auto_integration.sql` adiciona as colunas necessárias
2. As migrações `0052` e `0053` foram criadas como correções mas são agora vazias
3. O Drizzle pode tentar gerar novas migrações se detectar diferenças

### Solução Recomendada

**Opção 1: Aplicar Migrações Normalmente**

Se você está começando um banco novo ou pode resetar:

```bash
# 1. Execute as migrações
npm run db:push
```

As migrações 0052 e 0053 agora são vazias e não causarão problemas.

**Opção 2: Se as Colunas Já Existem**

Se as colunas `linkedResourceType`, `linkedResourceId` e `autoCreated` já existem na tabela `calendar_events`:

```bash
# 1. Não execute npm run db:push novamente
# 2. Apenas faça o build
npm run build

# 3. Inicie a aplicação
npm start
```

**Opção 3: Resetar o Banco (Use com Cuidado)**

Se você pode perder os dados e quer começar limpo:

```bash
# 1. Limpe o banco de dados
# Execute SQL manualmente: DROP DATABASE seu_banco; CREATE DATABASE seu_banco;

# 2. Execute as migrações
npm run db:push

# 3. Build e start
npm run build
npm start
```

### Verificando o Estado do Banco

Para verificar se as colunas já existem:

```sql
DESCRIBE calendar_events;
```

Você deve ver as colunas:
- `linkedResourceType`
- `linkedResourceId`
- `autoCreated`

### Notas Importantes

1. **Não execute `drizzle-kit generate`** a menos que tenha feito mudanças no schema
2. As migrações 0052 e 0053 agora são vazias (apenas marcadores no histórico)
3. A migração 0050 é a que realmente adiciona as colunas necessárias
4. Se você ainda encontrar erros, verifique se executou todas as migrações anteriores

### Estrutura de Migrações

```
0050_calendar_auto_integration.sql  ← Adiciona as colunas
0052_fix_duplicate_columns.sql      ← Vazia (marcador)
0053_fix_calendar_state.sql         ← Vazia (marcador)
```

### Suporte

Se ainda tiver problemas, verifique:
1. Versão do Node.js e npm
2. Conexão com o banco de dados
3. Permissões do usuário do banco
4. Logs completos de erro
