# 🔄 Como Reiniciar o Terminal e Parar Processos

## 🛑 Parar o Servidor (se estiver rodando)

### Opção 1: Usar Ctrl+C
1. No terminal onde o servidor está rodando, pressione:
   ```
   Ctrl + C
   ```
   Isso deve parar o processo.

### Opção 2: Se Ctrl+C não funcionar
1. Abra um **NOVO terminal** (não feche o atual ainda)
2. Execute este comando para encontrar e matar o processo Node:
   ```bash
   # Encontrar processos Node rodando
   ps aux | grep node
   
   # Ou matar todos os processos Node (CUIDADO!)
   pkill -f node
   ```

### Opção 3: Matar processo na porta 3000
```bash
# Encontrar processo na porta 3000
lsof -ti:3000

# Matar processo na porta 3000
kill -9 $(lsof -ti:3000)
```

## 🔄 Reiniciar o Terminal

### Opção 1: Fechar e Abrir Novo Terminal
1. Feche o terminal atual completamente
2. Abra um novo terminal
3. Navegue para o projeto:
   ```bash
   cd "/Users/rodrigorochameire/Library/CloudStorage/GoogleDrive-rodrigorochameire@gmail.com/Meu Drive/Pessoal/Tuco Care/TeteCareHub"
   ```

### Opção 2: Resetar o Terminal Atual
1. Pressione `Ctrl + C` várias vezes
2. Digite `reset` e pressione Enter
3. Ou simplesmente digite `clear` para limpar a tela

## ✅ Depois de Parar o Servidor

Execute os comandos novamente:

```bash
# 1. Verificar se não há processos rodando
ps aux | grep node

# 2. Rebuild (se necessário)
pnpm build

# 3. Iniciar servidor
pnpm start
```

## 🐛 Se o Terminal Ainda Não Responder

1. **Force quit do terminal**:
   - Pressione `Cmd + Q` (no macOS) para fechar o terminal completamente
   - Ou use `Cmd + Option + Esc` para abrir o "Force Quit Applications"
   - Selecione o Terminal e clique em "Force Quit"

2. **Abra um novo terminal** e tente novamente

## 💡 Dica: Rodar em Background

Se quiser rodar o servidor em background (para não bloquear o terminal):

```bash
# Rodar em background
pnpm start &

# Ou usar nohup para não parar quando fechar o terminal
nohup pnpm start > server.log 2>&1 &
```

Para ver os logs depois:
```bash
tail -f server.log
```

Para parar:
```bash
pkill -f "pnpm start"
```






## 🛑 Parar o Servidor (se estiver rodando)

### Opção 1: Usar Ctrl+C
1. No terminal onde o servidor está rodando, pressione:
   ```
   Ctrl + C
   ```
   Isso deve parar o processo.

### Opção 2: Se Ctrl+C não funcionar
1. Abra um **NOVO terminal** (não feche o atual ainda)
2. Execute este comando para encontrar e matar o processo Node:
   ```bash
   # Encontrar processos Node rodando
   ps aux | grep node
   
   # Ou matar todos os processos Node (CUIDADO!)
   pkill -f node
   ```

### Opção 3: Matar processo na porta 3000
```bash
# Encontrar processo na porta 3000
lsof -ti:3000

# Matar processo na porta 3000
kill -9 $(lsof -ti:3000)
```

## 🔄 Reiniciar o Terminal

### Opção 1: Fechar e Abrir Novo Terminal
1. Feche o terminal atual completamente
2. Abra um novo terminal
3. Navegue para o projeto:
   ```bash
   cd "/Users/rodrigorochameire/Library/CloudStorage/GoogleDrive-rodrigorochameire@gmail.com/Meu Drive/Pessoal/Tuco Care/TeteCareHub"
   ```

### Opção 2: Resetar o Terminal Atual
1. Pressione `Ctrl + C` várias vezes
2. Digite `reset` e pressione Enter
3. Ou simplesmente digite `clear` para limpar a tela

## ✅ Depois de Parar o Servidor

Execute os comandos novamente:

```bash
# 1. Verificar se não há processos rodando
ps aux | grep node

# 2. Rebuild (se necessário)
pnpm build

# 3. Iniciar servidor
pnpm start
```

## 🐛 Se o Terminal Ainda Não Responder

1. **Force quit do terminal**:
   - Pressione `Cmd + Q` (no macOS) para fechar o terminal completamente
   - Ou use `Cmd + Option + Esc` para abrir o "Force Quit Applications"
   - Selecione o Terminal e clique em "Force Quit"

2. **Abra um novo terminal** e tente novamente

## 💡 Dica: Rodar em Background

Se quiser rodar o servidor em background (para não bloquear o terminal):

```bash
# Rodar em background
pnpm start &

# Ou usar nohup para não parar quando fechar o terminal
nohup pnpm start > server.log 2>&1 &
```

Para ver os logs depois:
```bash
tail -f server.log
```

Para parar:
```bash
pkill -f "pnpm start"
```






