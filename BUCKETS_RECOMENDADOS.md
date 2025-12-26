# 📦 BUCKETS RECOMENDADOS - ANÁLISE COMPLETA

## 🎯 BUCKETS ESSENCIAIS (Já configurados)
- ✅ **pets** - Fotos de pets
- ✅ **documents** - Documentos gerais (privado)

## 💡 BUCKETS RECOMENDADOS ADICIONAIS

### 1. **financial** ou **financeiro** ⭐⭐⭐ (MUITO RECOMENDADO)
**Uso**: Comprovantes de pagamento, recibos, notas fiscais, extratos bancários

**Por quê?**
- Sistema tem integração com Stripe (pagamentos)
- Tabela `transactions` e `payments` no banco
- Necessário para auditoria financeira
- Comprovantes precisam ser armazenados

**Configuração sugerida:**
- Público: **NÃO** (privado)
- Política: Apenas admins podem acessar
- Estrutura: `financial/{year}/{month}/comprovante-{id}.pdf`

**Exemplos de arquivos:**
- Comprovantes Stripe
- Recibos de pagamento
- Notas fiscais
- Extratos bancários
- Comprovantes de despesas

---

### 2. **staff** ou **colaboradores** ⭐⭐⭐ (MUITO RECOMENDADO)
**Uso**: Documentos de funcionários, fotos de perfil, contratos de trabalho

**Por quê?**
- Sistema tem gestão de usuários/admins
- Pode ter funcionários da creche
- Documentos trabalhistas (CLT, contratos)
- Fotos de perfil de colaboradores

**Configuração sugerida:**
- Público: **NÃO** (privado)
- Política: Apenas admins e o próprio colaborador
- Estrutura: `staff/{employeeId}/documento.pdf`

**Exemplos de arquivos:**
- Contratos de trabalho
- Documentos pessoais (RG, CPF)
- Fotos de perfil
- Certificados profissionais
- Avaliações de desempenho

---

### 3. **reports** ou **relatorios** ⭐⭐ (RECOMENDADO)
**Uso**: Relatórios gerados em PDF (financeiros, mensais, de saúde)

**Por quê?**
- Sistema tem funcionalidade de relatórios
- Exportação de dados (mencionado no código)
- Relatórios mensais para tutores
- Históricos de saúde

**Configuração sugerida:**
- Público: **NÃO** (privado)
- Política: Admins podem gerar, tutores podem ver seus próprios
- Estrutura: `reports/{type}/{year}-{month}/relatorio-{id}.pdf`

**Exemplos de arquivos:**
- Relatórios financeiros mensais
- Relatórios de saúde dos pets
- Relatórios de uso de créditos
- Exportações de dados

---

### 4. **partnerships** ou **parcerias** ⭐ (OPCIONAL)
**Uso**: Logos de parceiros, contratos de parceria, materiais de marketing conjunto

**Por quê?**
- Pode ter parcerias com veterinárias, pet shops
- Logos para exibir no site/app
- Contratos de parceria
- Materiais promocionais

**Configuração sugerida:**
- Público: **SIM** (para logos serem acessíveis)
- Política: SELECT público, INSERT apenas admins
- Estrutura: `partnerships/{partnerId}/logo.png`

**Exemplos de arquivos:**
- Logos de parceiros
- Contratos de parceria
- Materiais promocionais
- Certificados de parceria

---

### 5. **marketing** ou **marketing** ⭐ (OPCIONAL)
**Uso**: Banners, materiais promocionais, imagens para redes sociais

**Por quê?**
- Materiais de marketing
- Banners para o site
- Imagens para redes sociais
- Vídeos promocionais

**Configuração sugerida:**
- Público: **SIM** (para serem acessíveis)
- Política: SELECT público, INSERT apenas admins
- Estrutura: `marketing/{type}/banner-{id}.jpg`

**Exemplos de arquivos:**
- Banners promocionais
- Imagens para redes sociais
- Vídeos promocionais
- Materiais de campanha

---

### 6. **tutors** ou **tutores** ⭐⭐ (RECOMENDADO)
**Uso**: Fotos de perfil de tutores (já discutido anteriormente)

**Configuração sugerida:**
- Público: **SIM** (para fotos de perfil)
- Política: SELECT público, INSERT apenas o próprio tutor
- Estrutura: `tutors/{tutorId}/profile.jpg`

---

## 📊 RESUMO POR PRIORIDADE

### 🔴 ALTA PRIORIDADE (Criar agora)
1. **financial** - Essencial para auditoria e comprovantes
2. **staff** - Se tiver funcionários/colaboradores
3. **tutors** - Para fotos de perfil de tutores

### 🟡 MÉDIA PRIORIDADE (Criar quando necessário)
4. **reports** - Quando implementar geração de relatórios em PDF

### 🟢 BAIXA PRIORIDADE (Criar se houver necessidade)
5. **partnerships** - Se tiver parcerias
6. **marketing** - Se precisar de materiais promocionais

---

## 🎯 RECOMENDAÇÃO FINAL

### Mínimo necessário agora:
1. ✅ **pets** (já configurado)
2. ✅ **documents** (já configurado)
3. ⭐ **financial** (criar agora)
4. ⭐ **tutors** (criar agora)

### Adicionar depois (conforme necessidade):
5. **staff** (se tiver funcionários)
6. **reports** (quando implementar relatórios PDF)

### Opcionais (só se realmente usar):
7. **partnerships** (se tiver parcerias)
8. **marketing** (se precisar de materiais promocionais)

---

## 💰 CONSIDERAÇÕES DE CUSTO

- Supabase Free: 1GB de storage total
- Cada bucket não tem custo adicional
- Custo vem do espaço usado
- Organizar bem ajuda a gerenciar custos

**Dica**: Comece com os buckets essenciais e adicione os outros conforme a necessidade real.






## 🎯 BUCKETS ESSENCIAIS (Já configurados)
- ✅ **pets** - Fotos de pets
- ✅ **documents** - Documentos gerais (privado)

## 💡 BUCKETS RECOMENDADOS ADICIONAIS

### 1. **financial** ou **financeiro** ⭐⭐⭐ (MUITO RECOMENDADO)
**Uso**: Comprovantes de pagamento, recibos, notas fiscais, extratos bancários

**Por quê?**
- Sistema tem integração com Stripe (pagamentos)
- Tabela `transactions` e `payments` no banco
- Necessário para auditoria financeira
- Comprovantes precisam ser armazenados

**Configuração sugerida:**
- Público: **NÃO** (privado)
- Política: Apenas admins podem acessar
- Estrutura: `financial/{year}/{month}/comprovante-{id}.pdf`

**Exemplos de arquivos:**
- Comprovantes Stripe
- Recibos de pagamento
- Notas fiscais
- Extratos bancários
- Comprovantes de despesas

---

### 2. **staff** ou **colaboradores** ⭐⭐⭐ (MUITO RECOMENDADO)
**Uso**: Documentos de funcionários, fotos de perfil, contratos de trabalho

**Por quê?**
- Sistema tem gestão de usuários/admins
- Pode ter funcionários da creche
- Documentos trabalhistas (CLT, contratos)
- Fotos de perfil de colaboradores

**Configuração sugerida:**
- Público: **NÃO** (privado)
- Política: Apenas admins e o próprio colaborador
- Estrutura: `staff/{employeeId}/documento.pdf`

**Exemplos de arquivos:**
- Contratos de trabalho
- Documentos pessoais (RG, CPF)
- Fotos de perfil
- Certificados profissionais
- Avaliações de desempenho

---

### 3. **reports** ou **relatorios** ⭐⭐ (RECOMENDADO)
**Uso**: Relatórios gerados em PDF (financeiros, mensais, de saúde)

**Por quê?**
- Sistema tem funcionalidade de relatórios
- Exportação de dados (mencionado no código)
- Relatórios mensais para tutores
- Históricos de saúde

**Configuração sugerida:**
- Público: **NÃO** (privado)
- Política: Admins podem gerar, tutores podem ver seus próprios
- Estrutura: `reports/{type}/{year}-{month}/relatorio-{id}.pdf`

**Exemplos de arquivos:**
- Relatórios financeiros mensais
- Relatórios de saúde dos pets
- Relatórios de uso de créditos
- Exportações de dados

---

### 4. **partnerships** ou **parcerias** ⭐ (OPCIONAL)
**Uso**: Logos de parceiros, contratos de parceria, materiais de marketing conjunto

**Por quê?**
- Pode ter parcerias com veterinárias, pet shops
- Logos para exibir no site/app
- Contratos de parceria
- Materiais promocionais

**Configuração sugerida:**
- Público: **SIM** (para logos serem acessíveis)
- Política: SELECT público, INSERT apenas admins
- Estrutura: `partnerships/{partnerId}/logo.png`

**Exemplos de arquivos:**
- Logos de parceiros
- Contratos de parceria
- Materiais promocionais
- Certificados de parceria

---

### 5. **marketing** ou **marketing** ⭐ (OPCIONAL)
**Uso**: Banners, materiais promocionais, imagens para redes sociais

**Por quê?**
- Materiais de marketing
- Banners para o site
- Imagens para redes sociais
- Vídeos promocionais

**Configuração sugerida:**
- Público: **SIM** (para serem acessíveis)
- Política: SELECT público, INSERT apenas admins
- Estrutura: `marketing/{type}/banner-{id}.jpg`

**Exemplos de arquivos:**
- Banners promocionais
- Imagens para redes sociais
- Vídeos promocionais
- Materiais de campanha

---

### 6. **tutors** ou **tutores** ⭐⭐ (RECOMENDADO)
**Uso**: Fotos de perfil de tutores (já discutido anteriormente)

**Configuração sugerida:**
- Público: **SIM** (para fotos de perfil)
- Política: SELECT público, INSERT apenas o próprio tutor
- Estrutura: `tutors/{tutorId}/profile.jpg`

---

## 📊 RESUMO POR PRIORIDADE

### 🔴 ALTA PRIORIDADE (Criar agora)
1. **financial** - Essencial para auditoria e comprovantes
2. **staff** - Se tiver funcionários/colaboradores
3. **tutors** - Para fotos de perfil de tutores

### 🟡 MÉDIA PRIORIDADE (Criar quando necessário)
4. **reports** - Quando implementar geração de relatórios em PDF

### 🟢 BAIXA PRIORIDADE (Criar se houver necessidade)
5. **partnerships** - Se tiver parcerias
6. **marketing** - Se precisar de materiais promocionais

---

## 🎯 RECOMENDAÇÃO FINAL

### Mínimo necessário agora:
1. ✅ **pets** (já configurado)
2. ✅ **documents** (já configurado)
3. ⭐ **financial** (criar agora)
4. ⭐ **tutors** (criar agora)

### Adicionar depois (conforme necessidade):
5. **staff** (se tiver funcionários)
6. **reports** (quando implementar relatórios PDF)

### Opcionais (só se realmente usar):
7. **partnerships** (se tiver parcerias)
8. **marketing** (se precisar de materiais promocionais)

---

## 💰 CONSIDERAÇÕES DE CUSTO

- Supabase Free: 1GB de storage total
- Cada bucket não tem custo adicional
- Custo vem do espaço usado
- Organizar bem ajuda a gerenciar custos

**Dica**: Comece com os buckets essenciais e adicione os outros conforme a necessidade real.






