import React, { useState, useEffect, useCallback } from "react";
import { Plus, TrendingUp, TrendingDown, Users, Check, X, Trash2, Wallet } from "lucide-react";

const PAYMENT_MODES = [
  { id: "especes", label: "Espèces", color: "#9FB0A6" },
  { id: "wave", label: "Wave", color: "#3AB5E8" },
  { id: "orange", label: "Orange Money", color: "#FF8200" },
  { id: "mtn", label: "MTN Money", color: "#FFCB05" },
];

function modeInfo(id) {
  return PAYMENT_MODES.find((m) => m.id === id) || PAYMENT_MODES[0];
}

const PALETTE = {
  bg: "#152420",
  surface: "#1E332B",
  surfaceLight: "#284539",
  orange: "#E8722C",
  gold: "#F0B429",
  ivory: "#F2EDE4",
  ivoryDim: "#9FB0A6",
  danger: "#C0392B",
  green: "#4C9A5B",
};

const todayKey = () => new Date().toISOString().slice(0, 10);

function money(n) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " F";
}

export default function CarnetDigital() {
  const [tab, setTab] = useState("jour");
  const [transactions, setTransactions] = useState([]);
  const [ardoises, setArdoises] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(null); // 'vente' | 'depense' | 'ardoise' | null

  const [formAmount, setFormAmount] = useState("");
  const [formLabel, setFormLabel] = useState("");
  const [formMode, setFormMode] = useState("especes");

  useEffect(() => {
    try {
      const t = localStorage.getItem("moncarnet_transactions");
      setTransactions(t ? JSON.parse(t) : []);
    } catch {
      setTransactions([]);
    }
    try {
      const a = localStorage.getItem("moncarnet_ardoises");
      setArdoises(a ? JSON.parse(a) : []);
    } catch {
      setArdoises([]);
    }
    setLoaded(true);
  }, []);

  const saveTransactions = useCallback((next) => {
    setTransactions(next);
    try {
      localStorage.setItem("moncarnet_transactions", JSON.stringify(next));
    } catch {}
  }, []);

  const saveArdoises = useCallback((next) => {
    setArdoises(next);
    try {
      localStorage.setItem("moncarnet_ardoises", JSON.stringify(next));
    } catch {}
  }, []);

  const todayTx = transactions.filter((t) => t.date === todayKey());
  const recettes = todayTx.filter((t) => t.type === "vente").reduce((s, t) => s + t.amount, 0);
  const depenses = todayTx.filter((t) => t.type === "depense").reduce((s, t) => s + t.amount, 0);
  const solde = recettes - depenses;

  const totalArdoises = ardoises.filter((a) => !a.paid).reduce((s, a) => s + a.amount, 0);

  function resetForm() {
    setShowForm(null);
    setFormAmount("");
    setFormLabel("");
    setFormMode("especes");
  }

  function submitTransaction(type) {
    const amount = parseFloat(formAmount);
    if (!amount || amount <= 0) return;
    const next = [
      { id: Date.now().toString(), type, amount, mode: formMode, label: formLabel || (type === "vente" ? "Vente" : "Dépense"), date: todayKey(), time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) },
      ...transactions,
    ];
    saveTransactions(next);
    resetForm();
  }

  function submitArdoise() {
    const amount = parseFloat(formAmount);
    if (!amount || amount <= 0 || !formLabel.trim()) return;
    const next = [
      { id: Date.now().toString(), client: formLabel, amount, paid: false, date: todayKey() },
      ...ardoises,
    ];
    saveArdoises(next);
    resetForm();
  }

  function toggleArdoise(id) {
    saveArdoises(ardoises.map((a) => (a.id === id ? { ...a, paid: !a.paid } : a)));
  }

  function deleteArdoise(id) {
    saveArdoises(ardoises.filter((a) => a.id !== id));
  }

  function deleteTx(id) {
    saveTransactions(transactions.filter((t) => t.id !== id));
  }

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", background: PALETTE.bg, color: PALETTE.ivoryDim, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>
        Chargement du carnet…
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: PALETTE.bg, color: PALETTE.ivory, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
        button:focus-visible, input:focus-visible { outline: 2px solid ${PALETTE.gold}; outline-offset: 2px; }
        input::placeholder { color: ${PALETTE.ivoryDim}; opacity: 0.7; }
      `}</style>

      {/* Header with wax-pattern strip */}
      <div style={{ background: `linear-gradient(135deg, ${PALETTE.orange}, ${PALETTE.gold})`, padding: "3px 0" }}>
        <svg width="100%" height="10" preserveAspectRatio="none" viewBox="0 0 400 10">
          {Array.from({ length: 40 }).map((_, i) => (
            <circle key={i} cx={i * 10 + 5} cy="5" r="2" fill={PALETTE.bg} opacity="0.25" />
          ))}
        </svg>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "28px 20px 100px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: PALETTE.gold }}>
            Mon Carnet
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: "4px 0 0" }}>Aujourd'hui</h1>
        </div>

        {/* Balance card */}
        <div
          style={{
            background: PALETTE.surface,
            borderRadius: 14,
            padding: "22px 20px",
            marginBottom: 20,
            border: `1px solid ${PALETTE.surfaceLight}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 12, color: PALETTE.ivoryDim, marginBottom: 4 }}>Solde du jour</div>
              <div style={{ fontSize: 30, fontWeight: 700, color: solde >= 0 ? PALETTE.green : PALETTE.danger, fontVariantNumeric: "tabular-nums" }}>
                {money(solde)}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${PALETTE.surfaceLight}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <TrendingUp size={16} color={PALETTE.green} />
              <span style={{ fontSize: 14, color: PALETTE.ivoryDim }}>{money(recettes)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <TrendingDown size={16} color={PALETTE.danger} />
              <span style={{ fontSize: 14, color: PALETTE.ivoryDim }}>{money(depenses)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Users size={16} color={PALETTE.gold} />
              <span style={{ fontSize: 14, color: PALETTE.ivoryDim }}>{money(totalArdoises)} dus</span>
            </div>
          </div>
          {recettes > 0 && (
            <div style={{ display: "flex", gap: 8, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${PALETTE.surfaceLight}`, flexWrap: "wrap" }}>
              <Wallet size={14} color={PALETTE.ivoryDim} style={{ marginTop: 2 }} />
              {PAYMENT_MODES.map((m) => {
                const total = todayTx.filter((t) => t.type === "vente" && t.mode === m.id).reduce((s, t) => s + t.amount, 0);
                if (total === 0) return null;
                return (
                  <span key={m.id} style={{ fontSize: 12, color: m.color }}>
                    {m.label}: {money(total)}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <button onClick={() => setShowForm("vente")} style={btnStyle(PALETTE.green)}>
            <Plus size={16} /> Vente
          </button>
          <button onClick={() => setShowForm("depense")} style={btnStyle(PALETTE.danger)}>
            <Plus size={16} /> Dépense
          </button>
          <button onClick={() => setShowForm("ardoise")} style={btnStyle(PALETTE.gold, PALETTE.bg)}>
            <Plus size={16} /> Ardoise
          </button>
        </div>

        {/* Inline form */}
        {showForm && (
          <div style={{ background: PALETTE.surface, borderRadius: 12, padding: 16, marginBottom: 24, border: `1px solid ${PALETTE.orange}` }}>
            <div style={{ fontSize: 13, color: PALETTE.ivoryDim, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {showForm === "vente" && "Nouvelle vente"}
              {showForm === "depense" && "Nouvelle dépense"}
              {showForm === "ardoise" && "Nouvelle ardoise (crédit client)"}
            </div>
            <input
              type="text"
              placeholder={showForm === "ardoise" ? "Nom du client" : "Description (optionnel)"}
              value={formLabel}
              onChange={(e) => setFormLabel(e.target.value)}
              style={inputStyle}
            />
            <input
              type="number"
              placeholder="Montant en FCFA"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              style={{ ...inputStyle, marginTop: 8 }}
            />
            {showForm !== "ardoise" && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, color: PALETTE.ivoryDim, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Mode de paiement
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {PAYMENT_MODES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setFormMode(m.id)}
                      style={{
                        background: formMode === m.id ? m.color : PALETTE.bg,
                        color: formMode === m.id ? PALETTE.bg : PALETTE.ivoryDim,
                        border: `1px solid ${formMode === m.id ? m.color : PALETTE.surfaceLight}`,
                        borderRadius: 8,
                        padding: "6px 10px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={() => (showForm === "ardoise" ? submitArdoise() : submitTransaction(showForm))}
                style={{ ...btnStyle(PALETTE.gold, PALETTE.bg), flex: 1, justifyContent: "center" }}
              >
                <Check size={16} /> Enregistrer
              </button>
              <button onClick={resetForm} style={{ ...btnStyle(PALETTE.surfaceLight), flex: "0 0 auto" }}>
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: `1px solid ${PALETTE.surfaceLight}` }}>
          {[
            ["jour", "Transactions"],
            ["ardoises", "Ardoises"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                background: "none",
                border: "none",
                padding: "10px 6px",
                fontSize: 14,
                color: tab === key ? PALETTE.gold : PALETTE.ivoryDim,
                borderBottom: tab === key ? `2px solid ${PALETTE.gold}` : "2px solid transparent",
                cursor: "pointer",
                fontWeight: tab === key ? 600 : 400,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "jour" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {todayTx.length === 0 && (
              <div style={{ color: PALETTE.ivoryDim, fontSize: 14, textAlign: "center", padding: "24px 0" }}>
                Aucune transaction aujourd'hui. Ajoutez une vente ou une dépense ci-dessus.
              </div>
            )}
            {todayTx.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: PALETTE.surface,
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div>
                  <div style={{ fontSize: 14 }}>{t.label}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <div style={{ fontSize: 12, color: PALETTE.ivoryDim }}>{t.time}</div>
                    {t.mode && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: modeInfo(t.mode).color,
                          border: `1px solid ${modeInfo(t.mode).color}`,
                          borderRadius: 5,
                          padding: "1px 5px",
                        }}
                      >
                        {modeInfo(t.mode).label}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontWeight: 600, color: t.type === "vente" ? PALETTE.green : PALETTE.danger, fontVariantNumeric: "tabular-nums" }}>
                    {t.type === "vente" ? "+" : "-"}{money(t.amount)}
                  </div>
                  <button onClick={() => deleteTx(t.id)} style={{ background: "none", border: "none", color: PALETTE.ivoryDim, cursor: "pointer" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "ardoises" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ardoises.length === 0 && (
              <div style={{ color: PALETTE.ivoryDim, fontSize: 14, textAlign: "center", padding: "24px 0" }}>
                Aucune ardoise enregistrée. Suivez ici les crédits donnés à vos clients.
              </div>
            )}
            {ardoises.map((a) => (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: PALETTE.surface,
                  borderRadius: 10,
                  padding: "12px 14px",
                  opacity: a.paid ? 0.5 : 1,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, textDecoration: a.paid ? "line-through" : "none" }}>{a.client}</div>
                  <div style={{ fontSize: 12, color: PALETTE.ivoryDim }}>{a.date}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontWeight: 600, color: PALETTE.gold, fontVariantNumeric: "tabular-nums" }}>{money(a.amount)}</div>
                  <button
                    onClick={() => toggleArdoise(a.id)}
                    style={{
                      background: a.paid ? PALETTE.surfaceLight : PALETTE.green,
                      border: "none",
                      borderRadius: 6,
                      padding: "5px 8px",
                      color: a.paid ? PALETTE.ivoryDim : PALETTE.bg,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    {a.paid ? "Rouvrir" : "Payé"}
                  </button>
                  <button onClick={() => deleteArdoise(a.id)} style={{ background: "none", border: "none", color: PALETTE.ivoryDim, cursor: "pointer" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function btnStyle(bg, color = "#fff") {
  return {
    background: bg,
    color,
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    flex: 1,
  };
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: PALETTE.bg,
  border: `1px solid ${PALETTE.surfaceLight}`,
  borderRadius: 8,
  padding: "10px 12px",
  color: PALETTE.ivory,
  fontSize: 14,
  fontFamily: "inherit",
};
