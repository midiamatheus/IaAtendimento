# 🦫 Beaver CS Assistant — Guia de Uso Imediato

## ✅ Solução que funciona AGORA (sem deploy)

A equipe pode usar o assistente **hoje mesmo** direto no Claude.ai, sem precisar de deploy, domínio ou configurações.

---

## 📱 Como usar

### 1. Acesse claude.ai
Qualquer membro da equipe CS acessa: https://claude.ai

### 2. Crie uma conta gratuita
- A conta gratuita já permite envio de PDF e imagens
- Cada pessoa da equipe precisa ter sua própria conta

### 3. Salve os prompts abaixo

---

## 💬 PROMPT 1: Atendimento ao Cliente

Cole este prompt sempre que precisar de ajuda com atendimento:

```
Você é o assistente interno de atendimento da Agência Beaver. Analise a situação e responda em JSON com este formato:

{"tag":"Categoria","internal":"Orientação para a equipe CS","clientMsg":"Mensagem pronta para o cliente"}

REGRAS BEAVER:
- Tempo resposta: 5 min | Última mensagem sempre do atendimento
- NUNCA diminutivos | Use "sentimos muito" em vez de "desculpa"
- Tom padrão: humano, empático, emoji 💜
- Sistema iClips: https://app.iclips.com.br/beaver/ | Posts até 12h→mesmo dia, após 12h→próximo dia
- Orçamentos: fornecedor × 1,2 × 1,33 = valor final | Comissão 15%
- Gravações: confirmar 1 dia antes | Tolerância 15 min
- Gestão de Crise: 1.Líder 2.E-mail "Gestão de Crise | Cliente" 3.Plano 30 dias
- Onboarding: 1.Grupo WhatsApp 2.Boas-vindas 3.Agenda 4.Drive 5.Reunião 6.Estratégia 7.Acessos 8.Apresentação
- Beaver Time: primeira quinzena | Roteiro: boas-vindas→pauta→relatório→ações→dúvidas

SITUAÇÃO:
[Cole aqui a situação do cliente]

CLIENTE: [nome do cliente]
TOM: [padrao/formal/direto]
```

**Como usar:**
1. Copie o prompt acima
2. Substitua `[Cole aqui a situação do cliente]` pela situação real
3. Preencha o nome do cliente e tom desejado
4. Cole no Claude.ai
5. A IA retorna a orientação interna + mensagem pronta

---

## 📊 PROMPT 2: Análise de Relatórios

Cole este prompt + anexe o PDF/imagem do Reportei:

```
Você é especialista em análise de marketing digital da Agência Beaver. Analise este relatório do Reportei e responda em JSON:

{
  "periodo": "Período do relatório",
  "destaques": ["array com 3-5 pontos principais"],
  "internal": "Análise técnica completa para a equipe CS: números, o que está bem, o que precisa de atenção, benchmarks, recomendações para próximo mês",
  "clientMsg": "Mensagem humanizada para o cliente no tom Beaver 💜. REGRAS: Celebre resultados positivos com destaque. Pontos negativos de forma proativa com plano de ação embutido. NUNCA use: queda, piora, problema, ruim. Use: oportunidade de melhoria, estamos otimizando, ajustando estratégia. Finalize com próximos passos motivadores."
}

CLIENTE: [nome do cliente]
CONTEXTO: [ex: meta era 50 leads, houve lançamento em outubro]
```

**Como usar:**
1. Exporte o relatório do Reportei como PDF ou tire um print
2. Abra uma nova conversa no Claude.ai
3. Cole o prompt acima
4. **Anexe o PDF ou imagem** (botão 📎 no chat)
5. Preencha nome do cliente e contexto
6. Envie
7. A IA analisa e gera análise interna + mensagem pronta

---

## 💾 Dica: Salve os prompts

**No computador:**
- Crie um documento no Google Docs com os dois prompts
- Compartilhe com toda a equipe CS
- Sempre que precisar, copie o prompt e use

**No celular:**
- Salve os prompts nas notas do celular
- Ou crie um atalho de teclado

---

## 🎯 Vantagens desta solução

✅ Funciona **agora**, sem precisar de deploy
✅ **Grátis** (conta gratuita do Claude.ai)
✅ Sem necessidade de conhecimento técnico
✅ Toda a equipe pode usar ao mesmo tempo
✅ Suporta PDF e imagem nativamente

---

## 🚀 Próximo passo (opcional)

Quando a equipe se acostumar e quiser:
- Um link único que toda a equipe acessa
- Interface mais bonita com a identidade Beaver
- Sem precisar copiar prompts toda vez

Aí vocês fazem o deploy na Vercel seguindo o **README.md** que está junto com os arquivos.

**Custo:** ~R$25-75/mês (depende do uso)
**Tempo:** ~1 hora seguindo o guia passo a passo

---

**Equipe Beaver 🦫💜**
