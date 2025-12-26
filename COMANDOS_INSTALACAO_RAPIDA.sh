#!/bin/bash
# ============================================
# Script de Instalação Rápida - Node.js e pnpm
# Execute este script no terminal
# ============================================

echo "🚀 Instalando Node.js e pnpm..."

# Verificar se Homebrew está instalado
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew não encontrado. Instalando Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Instalar Node.js 22
echo "📦 Instalando Node.js 22..."
brew install node@22

# Adicionar ao PATH
echo 'export PATH="/opt/homebrew/opt/node@22/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile

# Verificar instalação do Node.js
echo "✅ Verificando Node.js..."
node --version
npm --version

# Instalar pnpm
echo "📦 Instalando pnpm..."
npm install -g pnpm

# Verificar instalação do pnpm
echo "✅ Verificando pnpm..."
pnpm --version

echo ""
echo "🎉 Instalação concluída!"
echo ""
echo "Próximos passos:"
echo "1. cd '/Users/rodrigorochameire/Library/CloudStorage/GoogleDrive-rodrigorochameire@gmail.com/Meu Drive/Pessoal/Tuco Care/TeteCareHub'"
echo "2. pnpm install"
echo "3. pnpm build"





# ============================================
# Script de Instalação Rápida - Node.js e pnpm
# Execute este script no terminal
# ============================================

echo "🚀 Instalando Node.js e pnpm..."

# Verificar se Homebrew está instalado
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew não encontrado. Instalando Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Instalar Node.js 22
echo "📦 Instalando Node.js 22..."
brew install node@22

# Adicionar ao PATH
echo 'export PATH="/opt/homebrew/opt/node@22/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile

# Verificar instalação do Node.js
echo "✅ Verificando Node.js..."
node --version
npm --version

# Instalar pnpm
echo "📦 Instalando pnpm..."
npm install -g pnpm

# Verificar instalação do pnpm
echo "✅ Verificando pnpm..."
pnpm --version

echo ""
echo "🎉 Instalação concluída!"
echo ""
echo "Próximos passos:"
echo "1. cd '/Users/rodrigorochameire/Library/CloudStorage/GoogleDrive-rodrigorochameire@gmail.com/Meu Drive/Pessoal/Tuco Care/TeteCareHub'"
echo "2. pnpm install"
echo "3. pnpm build"






