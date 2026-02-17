import { useState, useRef, useEffect } from "react";

// ─── PROMPTS ────────────────────────────────────────────────────────────────

const CS_SYSTEM_PROMPT = `Você é o assistente interno de atendimento da Agência Beaver, especializado em ajudar a equipe de Customer Success (CS) a responder clientes com agilidade, profissionalismo e no padrão da agência.

PADRÃO DE COMUNICAÇÃO DA BEAVER:
- Tempo máximo de resposta: 5 minutos via e-mail ou WhatsApp
- A última mensagem no grupo de WhatsApp deve SEMPRE ser do atendimento
- NUNCA usar diminutivos: "rapidinho", "ajustezinho", etc.
- Usar "sentimos muito", "equívoco" ou "transtorno" em vez de "desculpa" e "erro"
- Sempre informar prazo claro para cada solicitação
- Sempre mencionar o nome do cliente quando possível
- Emoji padrão: 💜
- Nome dos grupos: "Marketing + Nome do Cliente"

SISTEMA ICLIPS: URL https://app.iclips.com.br/beaver/ | Posts até 12h → mesmo dia | Após 12h → próximo dia útil

ORÇAMENTOS: Fórmula: fornecedor × 1,2 × 1,33 = valor final ao cliente | Comissão padrão 15% | Faturamento direto para agência

GRAVAÇÕES: Confirmar 1 dia antes | Tolerância 15 min | Ficha técnica ao produtor Pedro Bursoni

GESTÃO DE CRISE: 1.Comunicar líder de área 2.E-mail "Gestão de Crise | [Cliente]" 3.Plano de ação 4.Reavaliação em 30 dias 5.Acompanhar 30 dias

ONBOARDING MENSAL: 1.Grupo WhatsApp 2.Boas-vindas + agenda 3.Convite Google Agenda 4.Drive + identidade visual 5.Reunião inicial 6.Direcionamento estratégico 7.Acessos plataformas 8.Reunião apresentação

CICLO MENSAL (BEAVER TIME): Reunião na primeira quinzena | Título: "[Cliente] | Beaver Time | [Modalidade]" | Roteiro: boas-vindas→pauta→relatório→ações→dúvidas | Após: ata por e-mail + repasse à Estratégia

ACESSOS: midia@beavercomunicacao.com | Facebook: https://www.facebook.com/profile.php?id=100086479462702 | LinkedIn: https://www.linkedin.com/in/clara-beaver-3ba853279/

HOSPEDAGEM: Opção 1 R$360/ano | Opção 2 R$280/mês (hospedagem+10 e-mails+manutenção+suporte+backup) | https://hourglass.com.br/pmsw

EVENTOS: Agência NÃO oferece cerimonial. MÍDIA OOH: 15% BV ao fornecedor, comunicar diretora operacional ao fechar.

---
REGRA CRÍTICA: Responda APENAS com JSON válido, sem texto antes ou depois:
{"tag":"Categoria curta","internal":"Orientação interna detalhada para a equipe CS","clientMsg":"Mensagem pronta para o cliente no tom Beaver"}

Tons: padrao=humano empático emoji 💜 | formal=profissional sem emojis | direto=máximo 3 frases`;

const REPORT_SYSTEM_PROMPT = `Você é um especialista em análise de resultados de marketing digital da Agência Beaver. Sua função é analisar relatórios do Reportei (Instagram, Facebook, Google Ads, Meta Ads) e gerar dois tipos de output:

1. ANÁLISE INTERNA: explicação técnica e estratégica para a equipe CS entender os dados em profundidade
2. MENSAGEM AO CLIENTE: comunicação humanizada, proativa e estratégica

REGRAS PARA A MENSAGEM AO CLIENTE:
- Tom sempre positivo e estratégico, nunca alarmista
- Resultados POSITIVOS: destacar com entusiasmo, mostrar evolução, conectar ao crescimento da marca
- Resultados NEGATIVOS ou ABAIXO DO ESPERADO: mencionar de forma proativa e construtiva, já com uma proposta de ação ("estamos ajustando X para Y"), nunca com destaque negativo
- Nunca use palavras como "queda", "piora", "problema", "ruim" — prefira "oportunidade de melhoria", "estamos otimizando", "ajustando a estratégia"
- Sempre termine com próximos passos concretos e motivadores
- Tom Beaver: humano, empático, parceiro estratégico, emoji 💜
- Mencionar o nome do cliente se fornecido

REGRA CRÍTICA: Responda APENAS com JSON válido, sem texto antes ou depois:
{
  "periodo": "Período identificado no relatório",
  "destaques": ["array com 3-5 pontos principais dos dados"],
  "internal": "Análise técnica completa para a equipe CS: o que os números significam, o que está indo bem, o que precisa de atenção, benchmarks do setor, recomendações estratégicas para o próximo mês",
  "clientMsg": "Mensagem completa pronta para enviar ao cliente via WhatsApp ou e-mail, no padrão Beaver. Celebra resultados positivos com destaque. Trata pontos de atenção de forma proativa com plano de ação já embutido. Finaliza com próximos passos animadores."
}`;

// ─── QUICK ACTIONS ───────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { icon: "📋", label: "Aprovação pendente no iClips", text: "O cliente quer saber o status de aprovação de um post no iClips." },
  { icon: "🎬", label: "Confirmar gravação", text: "Precisamos confirmar a gravação de amanhã com o cliente." },
  { icon: "⚠️", label: "Gestão de crise", text: "O cliente está insatisfeito com uma entrega e reclamou formalmente." },
  { icon: "🚀", label: "Onboarding novo cliente", text: "Novo cliente assinou contrato. Qual o primeiro passo do onboarding?" },
  { icon: "💰", label: "Calcular orçamento + comissão", text: "Como calcular o valor final de um orçamento? O fornecedor cobrou R$ 800." },
  { icon: "📅", label: "Reunião mensal (Beaver Time)", text: "Preciso agendar a reunião mensal com o cliente." },
  { icon: "✏️", label: "Solicitação de ajuste", text: "O cliente pediu um ajuste no post que enviamos para aprovação." },
  { icon: "🔑", label: "Solicitar acessos plataformas", text: "Preciso solicitar os acessos às plataformas de anúncio do cliente." },
];

// ─── STYLES ──────────────────────────────────────────────────────────────────

const C = {
  beaver: "#7B3FE4", beaverLight: "#9B6FF0", beaverDark: "#5A2DB0",
  cream: "#FAF8F5", ink: "#1A1025", inkSoft: "#3D2E52",
  mist: "#EDE8F7", mistDeep: "#D9D0F0",
  green: "#2DCB85", amber: "#F0A500", red: "#E84040",
  border: "rgba(123,63,228,0.12)",
};

const s = {
  root: { fontFamily: "'DM Sans', sans-serif", background: C.cream, height: "100vh", display: "flex", flexDirection: "column", fontSize: 14, overflow: "hidden" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: C.ink, borderBottom: `2px solid ${C.beaver}`, flexShrink: 0 },
  logoWrap: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { width: 30, height: 30, background: C.beaver, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 },
  logoText: { fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, color: "#fff" },
  badge: { display: "flex", alignItems: "center", gap: 6, background: "rgba(45,203,133,0.15)", border: "1px solid rgba(45,203,133,0.3)", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 500, color: C.green },
  dot: { width: 6, height: 6, background: C.green, borderRadius: "50%" },
  tabBar: { display: "flex", background: C.ink, borderBottom: `1px solid rgba(123,63,228,0.2)`, paddingLeft: 24, flexShrink: 0 },
  tab: (active) => ({ padding: "10px 20px", fontSize: 12.5, fontWeight: active ? 600 : 400, color: active ? "#fff" : "rgba(255,255,255,0.45)", borderBottom: active ? `2px solid ${C.beaver}` : "2px solid transparent", cursor: "pointer", background: "none", border: "none", borderBottom: active ? `2px solid ${C.beaver}` : "2px solid transparent", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s", letterSpacing: 0.2 }),
  main: { display: "grid", gridTemplateColumns: "250px 1fr", flex: 1, overflow: "hidden" },
  aside: { background: C.ink, borderRight: `1px solid rgba(123,63,228,0.2)`, display: "flex", flexDirection: "column", overflowY: "auto", padding: "18px 13px", gap: 16 },
  sideTitle: { fontFamily: "Syne, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", paddingLeft: 3, marginBottom: 6 },
  quickBtn: { width: "100%", textAlign: "left", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(123,63,228,0.15)", borderRadius: 9, padding: "9px 10px", color: "rgba(255,255,255,0.72)", fontFamily: "'DM Sans', sans-serif", fontSize: 11.5, cursor: "pointer", lineHeight: 1.4, marginBottom: 4, display: "flex", alignItems: "flex-start", gap: 7 },
  divider: { border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: 0 },
  toneBtn: (a) => ({ display: "flex", alignItems: "center", gap: 7, padding: "7px 10px", borderRadius: 8, border: a ? `1px solid ${C.beaver}` : "1px solid rgba(255,255,255,0.07)", background: a ? "rgba(123,63,228,0.15)" : "transparent", cursor: "pointer", color: a ? "#fff" : "rgba(255,255,255,0.55)", fontSize: 11.5, marginBottom: 4, width: "100%", textAlign: "left", fontFamily: "'DM Sans', sans-serif" }),
  kbText: { fontSize: 11, color: "rgba(255,255,255,0.38)", lineHeight: 1.8, paddingLeft: 3 },

  // Chat
  chatArea: { display: "flex", flexDirection: "column", overflow: "hidden" },
  msgs: { flex: 1, overflowY: "auto", padding: "22px 26px", display: "flex", flexDirection: "column", gap: 18 },
  welcomeCard: { background: `linear-gradient(135deg, ${C.beaver} 0%, ${C.beaverDark} 100%)`, borderRadius: 16, padding: "20px 24px", color: "#fff", position: "relative", overflow: "hidden" },
  welcomeH2: { fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 5 },
  welcomeP: { fontSize: 13, opacity: 0.85, lineHeight: 1.5 },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 },
  infoCard: { background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, padding: "11px 12px" },
  infoVal: { fontFamily: "Syne, sans-serif", fontSize: 15, fontWeight: 800, color: C.beaver },
  infoLabel: { fontSize: 10, color: "rgba(26,16,37,0.45)", fontWeight: 500 },
  msgRow: (r) => ({ display: "flex", alignItems: "flex-start", gap: 9, flexDirection: r === "user" ? "row-reverse" : "row" }),
  avatar: (r) => ({ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: r === "user" ? 10 : 13, flexShrink: 0, background: r === "user" ? C.ink : C.beaver, color: "#fff", fontWeight: 700, fontFamily: "Syne, sans-serif" }),
  msgLabel: { fontSize: 9.5, fontWeight: 600, letterSpacing: 0.5, color: "rgba(26,16,37,0.35)", textTransform: "uppercase", paddingLeft: 2, marginBottom: 3 },
  userBubble: { background: C.beaver, borderRadius: 13, borderTopRightRadius: 3, padding: "10px 14px", fontSize: 13.5, lineHeight: 1.6, color: "#fff", maxWidth: "65%" },
  responseWrap: { display: "flex", flexDirection: "column", gap: 7, maxWidth: "76%" },
  tagChip: { display: "inline-flex", alignItems: "center", background: C.mist, border: `1px solid ${C.mistDeep}`, borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 500, color: C.beaverDark, marginBottom: 2 },
  blockInternal: { background: "#fff", border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.amber}`, borderRadius: 12, borderTopLeftRadius: 3, padding: "11px 14px", fontSize: 12.5, lineHeight: 1.6, color: C.inkSoft },
  blockLabel: (color) => ({ fontFamily: "Syne, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }),
  blockMsg: { background: C.mist, border: `1.5px solid ${C.beaver}`, borderRadius: 12, borderTopLeftRadius: 3, padding: "13px 15px" },
  blockMsgText: { whiteSpace: "pre-wrap", fontSize: 13.5, lineHeight: 1.65, color: C.ink, borderLeft: `3px solid ${C.beaverLight}`, paddingLeft: 11, marginTop: 2 },
  actionsRow: { display: "flex", gap: 5, flexWrap: "wrap" },
  copyBtn: (a) => ({ background: a ? "rgba(45,203,133,0.08)" : "none", border: a ? `1px solid ${C.green}` : `1px solid ${C.border}`, borderRadius: 7, padding: "3px 10px", fontSize: 10.5, color: a ? C.green : C.beaver, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, display: "flex", alignItems: "center", gap: 3 }),
  typingDots: { display: "flex", gap: 5, padding: "11px 14px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 13, borderTopLeftRadius: 3 },
  inputArea: { padding: "14px 26px 18px", borderTop: `1px solid ${C.border}`, background: C.cream, flexShrink: 0 },
  inputWrapper: { background: "#fff", border: `1.5px solid ${C.border}`, borderRadius: 13, display: "flex", flexDirection: "column", boxShadow: "0 3px 16px rgba(123,63,228,0.07)", overflow: "hidden" },
  inputMeta: { display: "flex", alignItems: "center", gap: 8, padding: "9px 13px 0" },
  inputMetaLabel: { fontSize: 10, fontWeight: 600, color: "rgba(26,16,37,0.35)", textTransform: "uppercase", letterSpacing: 0.8 },
  clientInput: { border: "none", outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, fontWeight: 500, color: C.beaver, background: "transparent", width: 150 },
  textarea: { border: "none", outline: "none", resize: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, lineHeight: 1.6, color: C.ink, padding: "9px 13px", background: "transparent", minHeight: 60, maxHeight: 130 },
  inputFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px 9px" },
  hint: { fontSize: 11, color: "rgba(26,16,37,0.27)" },
  sendBtn: (d) => ({ background: d ? "rgba(123,63,228,0.4)" : C.beaver, color: "#fff", border: "none", borderRadius: 9, padding: "8px 17px", fontFamily: "Syne, sans-serif", fontSize: 12.5, fontWeight: 700, cursor: d ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 5 }),
  errorBubble: { background: "#fff", border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.red}`, borderRadius: 13, padding: "11px 14px", fontSize: 13, color: "#c0392b", maxWidth: "65%" },

  // Report tab
  reportArea: { flex: 1, overflowY: "auto", padding: "22px 26px", display: "flex", flexDirection: "column", gap: 16 },
  uploadCard: { background: "#fff", border: `2px dashed ${C.mistDeep}`, borderRadius: 16, padding: "28px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, cursor: "pointer", transition: "all 0.2s", textAlign: "center" },
  uploadCardHover: { borderColor: C.beaver, background: C.mist },
  uploadIcon: { fontSize: 36, marginBottom: 4 },
  uploadTitle: { fontFamily: "Syne, sans-serif", fontSize: 15, fontWeight: 700, color: C.ink },
  uploadSub: { fontSize: 12.5, color: "rgba(26,16,37,0.45)", lineHeight: 1.5 },
  filePreview: { background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 15px", display: "flex", alignItems: "center", gap: 12 },
  fileName: { fontSize: 13, fontWeight: 500, color: C.ink, flex: 1 },
  removeBtn: { background: "none", border: `1px solid rgba(232,64,64,0.3)`, borderRadius: 6, padding: "3px 9px", fontSize: 11, color: C.red, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  contextRow: { display: "flex", gap: 10 },
  contextInput: { flex: 1, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 13px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: C.ink, outline: "none", background: "#fff" },
  analyzeBtn: (d) => ({ background: d ? "rgba(123,63,228,0.4)" : C.beaver, color: "#fff", border: "none", borderRadius: 10, padding: "9px 20px", fontFamily: "Syne, sans-serif", fontSize: 13, fontWeight: 700, cursor: d ? "not-allowed" : "pointer", whiteSpace: "nowrap" }),
  reportResult: { display: "flex", flexDirection: "column", gap: 10 },
  periodBadge: { display: "inline-flex", alignItems: "center", gap: 6, background: C.mist, border: `1px solid ${C.mistDeep}`, borderRadius: 20, padding: "4px 14px", fontSize: 11.5, fontWeight: 600, color: C.beaverDark, alignSelf: "flex-start" },
  highlightsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 },
  highlightCard: { background: "#fff", border: `1px solid ${C.border}`, borderRadius: 11, padding: "10px 13px", fontSize: 12.5, color: C.inkSoft, lineHeight: 1.5 },
  highlightDot: { width: 7, height: 7, borderRadius: "50%", background: C.beaver, display: "inline-block", marginRight: 6, flexShrink: 0 },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

async function callAPI(systemPrompt, userContent) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    }),
  });
  const data = await res.json();
  const raw = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
  try { return JSON.parse(raw.replace(/^```json|```$/gm, "").trim()); }
  catch { return null; }
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function BeaverCS() {
  const [tab, setTab] = useState("cs");

  // CS tab state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [clientName, setClientName] = useState("");
  const [tone, setTone] = useState("padrao");
  const [csLoading, setCsLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const bottomRef = useRef(null);

  // Report tab state
  const [reportFile, setReportFile] = useState(null);
  const [reportClientName, setReportClientName] = useState("");
  const [reportContext, setReportContext] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportResult, setReportResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, csLoading]);

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text.trim()).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  // ── CS send ──────────────────────────────────────────────────────────────
  const sendMessage = async (overrideText) => {
    const text = overrideText || input.trim();
    if (!text || csLoading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text }]);
    setCsLoading(true);

    const prompt = [
      clientName ? `Nome do cliente: ${clientName}` : "",
      `Situação: ${text}`,
      `Tom desejado: ${tone}`,
    ].filter(Boolean).join("\n");

    try {
      const parsed = await callAPI(CS_SYSTEM_PROMPT, prompt);
      if (parsed) {
        setMessages(prev => [...prev, { role: "assistant", ...parsed }]);
      } else {
        setMessages(prev => [...prev, { role: "error", text: "Não foi possível gerar a resposta. Tente novamente." }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "error", text: "Erro de conexão. Tente novamente." }]);
    } finally {
      setCsLoading(false);
    }
  };

  // ── Report analysis ───────────────────────────────────────────────────────
  const handleFileDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setReportFile(file);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) setReportFile(e.target.files[0]);
  };

  const analyzeReport = async () => {
    if (!reportFile || reportLoading) return;
    setReportLoading(true);
    setReportResult(null);

    try {
      const base64 = await toBase64(reportFile);
      const isPdf = reportFile.type === "application/pdf";
      const mediaType = isPdf ? "application/pdf" : reportFile.type;

      const contextText = [
        reportClientName ? `Nome do cliente: ${reportClientName}` : "",
        reportContext ? `Contexto adicional: ${reportContext}` : "",
        `Tom desejado: padrao`,
      ].filter(Boolean).join("\n");

      const userContent = [
        {
          type: isPdf ? "document" : "image",
          source: { type: "base64", media_type: mediaType, data: base64 },
        },
        { type: "text", text: contextText || "Analise este relatório de marketing digital." },
      ];

      const parsed = await callAPI(REPORT_SYSTEM_PROMPT, userContent);
      if (parsed) {
        setReportResult(parsed);
      } else {
        setReportResult({ error: "Não foi possível analisar o relatório. Tente novamente." });
      }
    } catch {
      setReportResult({ error: "Erro ao processar o arquivo. Tente novamente." });
    } finally {
      setReportLoading(false);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={s.root}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.logoWrap}>
          <div style={s.logoIcon}>🦫</div>
          <div style={s.logoText}>Beaver <span style={{ color: C.beaverLight }}>CS · IA</span></div>
        </div>
        <div style={s.badge}><div style={s.dot} />IA ativa</div>
      </header>

      {/* Tab Bar */}
      <div style={s.tabBar}>
        <button style={s.tab(tab === "cs")} onClick={() => setTab("cs")}>💬 Atendimento ao Cliente</button>
        <button style={s.tab(tab === "report")} onClick={() => setTab("report")}>📊 Análise de Relatórios</button>
      </div>

      <div style={s.main}>
        {/* Sidebar */}
        <aside style={s.aside}>
          {tab === "cs" ? (
            <>
              <div>
                <div style={s.sideTitle}>Atalhos rápidos</div>
                {QUICK_ACTIONS.map((a, i) => (
                  <button key={i} style={s.quickBtn} onClick={() => sendMessage(a.text)}>
                    <span style={{ flexShrink: 0 }}>{a.icon}</span><span>{a.label}</span>
                  </button>
                ))}
              </div>
              <hr style={s.divider} />
              <div>
                <div style={s.sideTitle}>Tom da resposta</div>
                {[["padrao","💜 Padrão Beaver"],["formal","🎩 Mais formal"],["direto","⚡ Direto e conciso"]].map(([v,l]) => (
                  <button key={v} style={s.toneBtn(tone === v)} onClick={() => setTone(v)}>{l}</button>
                ))}
              </div>
              <hr style={s.divider} />
              <div>
                <div style={s.sideTitle}>Base de conhecimento</div>
                <div style={s.kbText}>✅ Procedimentos CS<br/>✅ Mensagens padrão<br/>✅ Onboarding<br/>✅ Orçamentos<br/>✅ Gestão de crise<br/>✅ Reuniões mensais<br/>✅ Aprovações iClips<br/>✅ Eventos e OOH</div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div style={s.sideTitle}>Como usar</div>
                <div style={s.kbText}>
                  <strong style={{ color: "rgba(255,255,255,0.6)" }}>1.</strong> Envie o PDF ou imagem do Reportei<br/><br/>
                  <strong style={{ color: "rgba(255,255,255,0.6)" }}>2.</strong> Informe o nome do cliente<br/><br/>
                  <strong style={{ color: "rgba(255,255,255,0.6)" }}>3.</strong> Adicione contexto se quiser<br/><br/>
                  <strong style={{ color: "rgba(255,255,255,0.6)" }}>4.</strong> A IA gera a análise interna + mensagem pronta para o cliente
                </div>
              </div>
              <hr style={s.divider} />
              <div>
                <div style={s.sideTitle}>Dados analisados</div>
                <div style={s.kbText}>📸 Instagram<br/>👍 Facebook<br/>📢 Meta Ads<br/>🔍 Google Ads<br/>📈 Google Analytics</div>
              </div>
              <hr style={s.divider} />
              <div>
                <div style={s.sideTitle}>Tom da mensagem</div>
                <div style={s.kbText}>
                  ✅ Positivos em destaque<br/>
                  ⚡ Negativos com plano de ação<br/>
                  💜 Sempre proativo e estratégico
                </div>
              </div>
            </>
          )}
        </aside>

        {/* ── CS TAB ── */}
        {tab === "cs" && (
          <div style={s.chatArea}>
            <div style={s.msgs}>
              <div style={s.welcomeCard}>
                <h2 style={s.welcomeH2}>Olá, equipe Beaver! 💜</h2>
                <p style={s.welcomeP}>Sou seu assistente com IA real. Descreva qualquer situação e gero orientação interna + mensagem pronta para o cliente.</p>
              </div>
              <div style={s.infoGrid}>
                {[["⚡","5 min","Resp. máx."],["💬","iClips","Aprovações"],["💰","15%","Comissão"]].map(([ic,vl,lb],i) => (
                  <div key={i} style={s.infoCard}><div style={{ fontSize: 15 }}>{ic}</div><div style={s.infoVal}>{vl}</div><div style={s.infoLabel}>{lb}</div></div>
                ))}
              </div>

              {messages.map((msg, i) => (
                <div key={i} style={s.msgRow(msg.role)}>
                  <div style={s.avatar(msg.role)}>{msg.role === "user" ? "CS" : "🦫"}</div>
                  {msg.role === "user" && (
                    <div><div style={{ ...s.msgLabel, textAlign: "right" }}>Equipe CS</div><div style={s.userBubble}>{msg.text}</div></div>
                  )}
                  {msg.role === "assistant" && (
                    <div style={s.responseWrap}>
                      <div style={s.msgLabel}>Assistente Beaver</div>
                      {msg.tag && <div><span style={s.tagChip}>📌 {msg.tag}</span></div>}
                      {msg.internal && (
                        <div style={s.blockInternal}>
                          <div style={s.blockLabel(C.amber)}>⚙️ Orientação interna</div>
                          <div style={{ lineHeight: 1.6 }}>{msg.internal}</div>
                        </div>
                      )}
                      <div style={s.blockMsg}>
                        <div style={s.blockLabel(C.beaver)}>💬 Mensagem pronta para o cliente</div>
                        <div style={s.blockMsgText}>{msg.clientMsg}</div>
                      </div>
                      <div style={s.actionsRow}>
                        <button style={s.copyBtn(copied===`${i}-m`)} onClick={() => copyText(msg.clientMsg,`${i}-m`)}>{copied===`${i}-m`?"✓ Copiado!":"📋 Copiar"}</button>
                        <button style={s.copyBtn(copied===`${i}-w`)} onClick={() => copyText(msg.clientMsg,`${i}-w`)}>{copied===`${i}-w`?"✓ Copiado!":"📤 WhatsApp"}</button>
                      </div>
                    </div>
                  )}
                  {msg.role === "error" && (
                    <div><div style={s.msgLabel}>Assistente Beaver</div><div style={s.errorBubble}>{msg.text}</div></div>
                  )}
                </div>
              ))}

              {csLoading && (
                <div style={s.msgRow("assistant")}>
                  <div style={s.avatar("assistant")}>🦫</div>
                  <div style={s.typingDots}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:C.beaverLight,animation:`bounce 1.2s infinite ${i*0.2}s`}}/>)}</div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div style={s.inputArea}>
              <div style={s.inputWrapper}>
                <div style={s.inputMeta}>
                  <span style={s.inputMetaLabel}>Cliente:</span>
                  <input style={s.clientInput} value={clientName} onChange={e=>setClientName(e.target.value)} placeholder="Nome do cliente (opcional)"/>
                </div>
                <textarea style={s.textarea} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage()}}} placeholder="Descreva a situação... Ex: 'Cliente perguntou quando o post aprovado vai ao ar' ou 'Cliente pediu desconto na renovação'"/>
                <div style={s.inputFooter}>
                  <span style={s.hint}>↵ Enviar · Shift+↵ Nova linha</span>
                  <button style={s.sendBtn(csLoading||!input.trim())} onClick={()=>sendMessage()} disabled={csLoading||!input.trim()}>Gerar resposta ↗</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── REPORT TAB ── */}
        {tab === "report" && (
          <div style={s.chatArea}>
            <div style={s.reportArea}>

              {/* Upload zone */}
              {!reportFile ? (
                <div
                  style={{ ...s.uploadCard, ...(dragOver ? s.uploadCardHover : {}) }}
                  onDragOver={e=>{e.preventDefault();setDragOver(true)}}
                  onDragLeave={()=>setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={()=>fileInputRef.current?.click()}
                >
                  <div style={s.uploadIcon}>📄</div>
                  <div style={s.uploadTitle}>Envie o relatório do Reportei</div>
                  <div style={s.uploadSub}>Arraste e solte aqui ou clique para selecionar<br/>Aceita PDF ou imagem (PNG, JPG)</div>
                  <input ref={fileInputRef} type="file" accept=".pdf,image/*" style={{display:"none"}} onChange={handleFileChange}/>
                </div>
              ) : (
                <div style={s.filePreview}>
                  <span style={{ fontSize: 22 }}>{reportFile.type==="application/pdf"?"📄":"🖼️"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={s.fileName}>{reportFile.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(26,16,37,0.4)" }}>{(reportFile.size/1024).toFixed(0)} KB</div>
                  </div>
                  <button style={s.removeBtn} onClick={()=>{setReportFile(null);setReportResult(null);}}>Remover</button>
                </div>
              )}

              {/* Context inputs */}
              <div style={s.contextRow}>
                <input
                  style={{ ...s.contextInput, maxWidth: 200 }}
                  value={reportClientName}
                  onChange={e=>setReportClientName(e.target.value)}
                  placeholder="Nome do cliente"
                />
                <input
                  style={s.contextInput}
                  value={reportContext}
                  onChange={e=>setReportContext(e.target.value)}
                  placeholder="Contexto adicional (ex: lançamento de produto em outubro, meta era 50 leads...)"
                />
                <button
                  style={s.analyzeBtn(!reportFile||reportLoading)}
                  onClick={analyzeReport}
                  disabled={!reportFile||reportLoading}
                >
                  {reportLoading ? "Analisando..." : "Analisar ↗"}
                </button>
              </div>

              {/* Loading */}
              {reportLoading && (
                <div style={{ display:"flex", alignItems:"center", gap:12, padding:"20px 0" }}>
                  <div style={s.avatar("assistant")}>🦫</div>
                  <div style={s.typingDots}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:C.beaverLight,animation:`bounce 1.2s infinite ${i*0.2}s`}}/>)}</div>
                  <span style={{ fontSize:13, color:"rgba(26,16,37,0.45)" }}>Lendo e analisando o relatório...</span>
                </div>
              )}

              {/* Error */}
              {reportResult?.error && (
                <div style={{ ...s.errorBubble, maxWidth:"100%" }}>{reportResult.error}</div>
              )}

              {/* Result */}
              {reportResult && !reportResult.error && (
                <div style={s.reportResult}>
                  {reportResult.periodo && (
                    <div><span style={s.periodBadge}>📅 {reportResult.periodo}</span></div>
                  )}

                  {/* Highlights */}
                  {reportResult.destaques?.length > 0 && (
                    <div>
                      <div style={{ ...s.blockLabel(C.beaverDark), marginBottom:8 }}>⚡ Destaques do período</div>
                      <div style={s.highlightsGrid}>
                        {reportResult.destaques.map((d,i) => (
                          <div key={i} style={s.highlightCard}>
                            <span style={s.highlightDot}/>
                            {d}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Internal analysis */}
                  {reportResult.internal && (
                    <div style={s.blockInternal}>
                      <div style={s.blockLabel(C.amber)}>⚙️ Análise interna — para a equipe CS</div>
                      <div style={{ lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{reportResult.internal}</div>
                    </div>
                  )}

                  {/* Client message */}
                  {reportResult.clientMsg && (
                    <>
                      <div style={s.blockMsg}>
                        <div style={s.blockLabel(C.beaver)}>💬 Mensagem pronta para o cliente</div>
                        <div style={{ ...s.blockMsgText, fontSize: 13.5 }}>{reportResult.clientMsg}</div>
                      </div>
                      <div style={s.actionsRow}>
                        <button style={s.copyBtn(copied==="rep-m")} onClick={()=>copyText(reportResult.clientMsg,"rep-m")}>{copied==="rep-m"?"✓ Copiado!":"📋 Copiar mensagem"}</button>
                        <button style={s.copyBtn(copied==="rep-w")} onClick={()=>copyText(reportResult.clientMsg,"rep-w")}>{copied==="rep-w"?"✓ Copiado!":"📤 Copiar para WhatsApp"}</button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        * { box-sizing: border-box; }
        textarea::placeholder { color: rgba(26,16,37,0.28); }
        input::placeholder { color: rgba(26,16,37,0.3); }
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#D9D0F0;border-radius:10px}
      `}</style>
    </div>
  );
}
