#!/bin/bash

# Script para parar processos Node/servidor
# Execute: bash parar-servidor.sh

echo "🔍 Procurando processos Node..."
ps aux | grep -E "node|pnpm|npm" | grep -v grep

echo ""
echo "🛑 Parando processos na porta 3000..."
PORT_PID=$(lsof -ti:3000)
if [ ! -z "$PORT_PID" ]; then
  echo "Processo encontrado na porta 3000: $PORT_PID"
  kill -9 $PORT_PID
  echo "✅ Processo parado"
else
  echo "ℹ️  Nenhum processo na porta 3000"
fi

echo ""
echo "🛑 Parando processos pnpm/node relacionados ao projeto..."
pkill -f "pnpm start" 2>/dev/null
pkill -f "node.*dist/index.js" 2>/dev/null

echo ""
echo "✅ Limpeza concluída!"
echo ""
echo "Agora você pode executar: pnpm start"






# Script para parar processos Node/servidor
# Execute: bash parar-servidor.sh

echo "🔍 Procurando processos Node..."
ps aux | grep -E "node|pnpm|npm" | grep -v grep

echo ""
echo "🛑 Parando processos na porta 3000..."
PORT_PID=$(lsof -ti:3000)
if [ ! -z "$PORT_PID" ]; then
  echo "Processo encontrado na porta 3000: $PORT_PID"
  kill -9 $PORT_PID
  echo "✅ Processo parado"
else
  echo "ℹ️  Nenhum processo na porta 3000"
fi

echo ""
echo "🛑 Parando processos pnpm/node relacionados ao projeto..."
pkill -f "pnpm start" 2>/dev/null
pkill -f "node.*dist/index.js" 2>/dev/null

echo ""
echo "✅ Limpeza concluída!"
echo ""
echo "Agora você pode executar: pnpm start"






