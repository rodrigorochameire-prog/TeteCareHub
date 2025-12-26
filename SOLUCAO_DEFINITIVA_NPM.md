# 🔧 Solução Definitiva: Forçar npm no Vercel

## 🐛 Problema

O Vercel detecta o `pnpm-lock.yaml` **ANTES** de executar o `installCommand`, causando:
- Parse automático do lockfile
- Tentativa de usar pnpm mesmo com `npm install` configurado
- Erro `ERR_INVALID_THIS` em requisições HTTP

## ✅ Solução Aplicada

### 1. Script Pré-Build (`scripts/pre-build.sh`)
Remove lockfiles antes do Vercel detectá-los:
```bash
rm -f pnpm-lock.yaml yarn.lock
```

### 2. `.npmrc`
Desabilita detecção automática de package manager:
```
package-manager-strict=false
```

### 3. `vercel.json`
Executa o script antes de instalar:
```json
"installCommand": "bash scripts/pre-build.sh && npm install"
```

### 4. `.vercelignore`
Ignora `pnpm-lock.yaml` no deploy (backup)

## 🔄 Alternativa: Remover pnpm-lock.yaml do Git

Se o problema persistir, podemos remover o `pnpm-lock.yaml` do repositório:

```bash
git rm --cached pnpm-lock.yaml
echo "pnpm-lock.yaml" >> .gitignore
git commit -m "chore: remove pnpm-lock.yaml do repositório"
```

**⚠️ Nota:** Isso significa que cada desenvolvedor precisará gerar seu próprio lockfile localmente.

## ✅ Status Atual

- ✅ Script pré-build criado
- ✅ `.npmrc` configurado
- ✅ `vercel.json` atualizado
- ⏳ Aguardando novo build no Vercel

## 🚀 Próximo Passo

Se o erro persistir após este commit, a solução definitiva será remover o `pnpm-lock.yaml` do repositório Git.
