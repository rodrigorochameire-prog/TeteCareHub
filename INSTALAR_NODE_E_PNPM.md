# 📦 Instalar Node.js e pnpm no macOS

## 🎯 Objetivo

Instalar Node.js e pnpm para poder executar `pnpm build` e fazer deploy do projeto.

---

## 🚀 Método 1: Usando Homebrew (Recomendado)

Você já tem o Homebrew instalado, então vamos usá-lo:

### Passo 1: Instalar Node.js

```bash
# Instalar Node.js (versão LTS recomendada)
brew install node@22

# Adicionar ao PATH (se necessário)
echo 'export PATH="/opt/homebrew/opt/node@22/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile
```

### Passo 2: Verificar instalação

```bash
# Verificar versão do Node.js
node --version
# Deve mostrar: v22.x.x

# Verificar versão do npm
npm --version
# Deve mostrar: 10.x.x ou superior
```

### Passo 3: Instalar pnpm

```bash
# Instalar pnpm globalmente
npm install -g pnpm

# Verificar instalação
pnpm --version
# Deve mostrar: 9.x.x ou superior
```

---

## 🚀 Método 2: Usando nvm (Node Version Manager)

Se preferir gerenciar múltiplas versões do Node.js:

### Passo 1: Instalar nvm

```bash
# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recarregar o shell
source ~/.zshrc
```

### Passo 2: Instalar Node.js via nvm

```bash
# Instalar Node.js 22 (LTS)
nvm install 22

# Usar Node.js 22
nvm use 22

# Definir como padrão
nvm alias default 22
```

### Passo 3: Instalar pnpm

```bash
# Instalar pnpm globalmente
npm install -g pnpm

# Verificar instalação
pnpm --version
```

---

## ✅ Verificar Instalação Completa

Após instalar, execute estes comandos para verificar:

```bash
# Verificar Node.js
node --version
# Resultado esperado: v22.x.x

# Verificar npm
npm --version
# Resultado esperado: 10.x.x ou superior

# Verificar pnpm
pnpm --version
# Resultado esperado: 9.x.x ou superior
```

---

## 🧪 Testar no Projeto

Após instalar, vá para o diretório do projeto e teste:

```bash
# Navegar para o diretório do projeto
cd "/Users/rodrigorochameire/Library/CloudStorage/GoogleDrive-rodrigorochameire@gmail.com/Meu Drive/Pessoal/Tuco Care/TeteCareHub"

# Instalar dependências
pnpm install

# Testar build
pnpm build
```

---

## 🐛 Troubleshooting

### Problema: "command not found: node"

**Solução:**
```bash
# Verificar se Node.js está no PATH
which node

# Se não encontrar, adicionar ao PATH
echo 'export PATH="/opt/homebrew/opt/node@22/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile
```

### Problema: "command not found: pnpm"

**Solução:**
```bash
# Reinstalar pnpm
npm install -g pnpm

# Verificar instalação
pnpm --version
```

### Problema: "Permission denied"

**Solução:**
```bash
# Se der erro de permissão, usar sudo (não recomendado)
# Ou configurar npm para usar diretório local
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zprofile
source ~/.zprofile
```

---

## 📝 Próximos Passos

Após instalar Node.js e pnpm:

1. **Instalar dependências do projeto:**
   ```bash
   cd "/Users/rodrigorochameire/Library/CloudStorage/GoogleDrive-rodrigorochameire@gmail.com/Meu Drive/Pessoal/Tuco Care/TeteCareHub"
   pnpm install
   ```

2. **Testar build:**
   ```bash
   pnpm build
   ```

3. **Se funcionar, seguir o guia de deploy:**
   - Abrir `GUIA_DEPLOY_SUPABASE.md`
   - Escolher plataforma (Vercel, Railway ou Render)
   - Fazer deploy

---

**🚀 Boa sorte com a instalação!**






## 🎯 Objetivo

Instalar Node.js e pnpm para poder executar `pnpm build` e fazer deploy do projeto.

---

## 🚀 Método 1: Usando Homebrew (Recomendado)

Você já tem o Homebrew instalado, então vamos usá-lo:

### Passo 1: Instalar Node.js

```bash
# Instalar Node.js (versão LTS recomendada)
brew install node@22

# Adicionar ao PATH (se necessário)
echo 'export PATH="/opt/homebrew/opt/node@22/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile
```

### Passo 2: Verificar instalação

```bash
# Verificar versão do Node.js
node --version
# Deve mostrar: v22.x.x

# Verificar versão do npm
npm --version
# Deve mostrar: 10.x.x ou superior
```

### Passo 3: Instalar pnpm

```bash
# Instalar pnpm globalmente
npm install -g pnpm

# Verificar instalação
pnpm --version
# Deve mostrar: 9.x.x ou superior
```

---

## 🚀 Método 2: Usando nvm (Node Version Manager)

Se preferir gerenciar múltiplas versões do Node.js:

### Passo 1: Instalar nvm

```bash
# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recarregar o shell
source ~/.zshrc
```

### Passo 2: Instalar Node.js via nvm

```bash
# Instalar Node.js 22 (LTS)
nvm install 22

# Usar Node.js 22
nvm use 22

# Definir como padrão
nvm alias default 22
```

### Passo 3: Instalar pnpm

```bash
# Instalar pnpm globalmente
npm install -g pnpm

# Verificar instalação
pnpm --version
```

---

## ✅ Verificar Instalação Completa

Após instalar, execute estes comandos para verificar:

```bash
# Verificar Node.js
node --version
# Resultado esperado: v22.x.x

# Verificar npm
npm --version
# Resultado esperado: 10.x.x ou superior

# Verificar pnpm
pnpm --version
# Resultado esperado: 9.x.x ou superior
```

---

## 🧪 Testar no Projeto

Após instalar, vá para o diretório do projeto e teste:

```bash
# Navegar para o diretório do projeto
cd "/Users/rodrigorochameire/Library/CloudStorage/GoogleDrive-rodrigorochameire@gmail.com/Meu Drive/Pessoal/Tuco Care/TeteCareHub"

# Instalar dependências
pnpm install

# Testar build
pnpm build
```

---

## 🐛 Troubleshooting

### Problema: "command not found: node"

**Solução:**
```bash
# Verificar se Node.js está no PATH
which node

# Se não encontrar, adicionar ao PATH
echo 'export PATH="/opt/homebrew/opt/node@22/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile
```

### Problema: "command not found: pnpm"

**Solução:**
```bash
# Reinstalar pnpm
npm install -g pnpm

# Verificar instalação
pnpm --version
```

### Problema: "Permission denied"

**Solução:**
```bash
# Se der erro de permissão, usar sudo (não recomendado)
# Ou configurar npm para usar diretório local
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zprofile
source ~/.zprofile
```

---

## 📝 Próximos Passos

Após instalar Node.js e pnpm:

1. **Instalar dependências do projeto:**
   ```bash
   cd "/Users/rodrigorochameire/Library/CloudStorage/GoogleDrive-rodrigorochameire@gmail.com/Meu Drive/Pessoal/Tuco Care/TeteCareHub"
   pnpm install
   ```

2. **Testar build:**
   ```bash
   pnpm build
   ```

3. **Se funcionar, seguir o guia de deploy:**
   - Abrir `GUIA_DEPLOY_SUPABASE.md`
   - Escolher plataforma (Vercel, Railway ou Render)
   - Fazer deploy

---

**🚀 Boa sorte com a instalação!**






