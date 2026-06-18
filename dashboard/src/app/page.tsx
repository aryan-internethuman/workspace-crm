"use client";

import React, { useState, useEffect } from "react";

// ── Mock Data ──────────────────────────────────────────

const kpis = [
  { label: "Active Leads", value: "142", trend: "+12", isPositive: true },
  { label: "Open Opportunities", value: "38", trend: "+4", isPositive: true },
  { label: "Awaiting Response", value: "9", trend: "-3", isPositive: false },
  { label: "AI Influenced Rev", value: "₹2.4M", trend: "+18%", isPositive: true },
];

interface ApiConversation {
  id: string;
  customer: string;
  channel: string;
  status: string;
  intent: string | null;
  assigned_to: string | null;
  handler_type: string;
  ai_paused: boolean;
  updated_at: string;
}

const leads = [
  { id: "L1", lead: "Sarah M.", company: "Acme Corp", stage: "Qualified", value: "₹50,000", lastAct: "2h ago", next: "Schedule Demo" },
  { id: "L2", lead: "John Smith", company: "Wayne Enterprises", stage: "Proposal", value: "₹90,000", lastAct: "Yesterday", next: "Follow Up" },
  { id: "L3", lead: "Emily Davis", company: "Stark Ind.", stage: "New", value: "₹30,000", lastAct: "4h ago", next: "Send Info" },
  { id: "L4", lead: "Mike Chen", company: "Oscorp", stage: "Qualified", value: "₹75,000", lastAct: "1d ago", next: "Prepare Pitch" },
  { id: "L5", lead: "Jessica Alba", company: "FutureTech", stage: "Won", value: "₹120,000", lastAct: "2d ago", next: "Onboarding" },
];

const pipelineStages = [
  { name: "New", items: [
      { id: 101, name: "Acme Corp", val: "₹50,000", lastAct: "2h ago" },
      { id: 102, name: "Stark Ind.", val: "₹30,000", lastAct: "4h ago" },
      { id: 103, name: "Wayne Ent.", val: "₹90,000", lastAct: "1d ago" },
  ]},
  { name: "Qualified", items: [
      { id: 104, name: "Sarah M.", val: "₹75,000", lastAct: "3h ago" },
      { id: 105, name: "LexCorp", val: "₹110,000", lastAct: "1d ago" },
  ]},
  { name: "Proposal", items: [
      { id: 106, name: "Oscorp", val: "₹80,000", lastAct: "Yesterday" },
      { id: 107, name: "FutureTech", val: "₹120,000", lastAct: "2d ago" },
  ]},
  { name: "Won", items: [
      { id: 108, name: "Daily Planet", val: "₹200,000", lastAct: "Just now" },
  ]},
];

const activities = [
  { id: 1, action: "Recovered Cart", customer: "Sarah M.", outcome: "Purchase Completed", impact: "₹4,500 Recovered", time: "5 min ago" },
  { id: 2, action: "Qualified Lead", customer: "John D.", outcome: "Moved To Qualified", impact: "Potential ₹12,000", time: "1 hour ago" },
  { id: 3, action: "Escalated Support", customer: "LexCorp", outcome: "Human Review Required", impact: "Escalated Status", time: "2 hours ago" },
  { id: 4, action: "Sent Welcome Sequence", customer: "Emily Davis", outcome: "Delivered", impact: "Sequence Started", time: "Yesterday" },
];

const insights = [
  { id: "i1", title: "High Intent Buyer", target: "Sarah M.", stats: ["87% Purchase Probability", "Potential Revenue ₹75,000"], action: "Book Demo" },
  { id: "i2", title: "Churn Risk Detected", target: "LexCorp", stats: ["Usage dropped 40%", "Revenue At Risk: ₹120,000"], action: "Schedule Call" },
  { id: "i3", title: "Upsell Opportunity", target: "Wayne Enterprises", stats: ["Likely interested in Premium", "Potential Revenue ₹60,000"], action: "Send Offer" },
];

// ── Main Component ────────────────────────────────
export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeNav, setActiveNav] = useState("ih");
  const [leadFilter, setLeadFilter] = useState("All");
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchConversations();
    
    // Connect to WebSocket for real-time updates
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/conversations");
    ws.onmessage = (event) => {
      if (event.data === "refresh") {
        fetchConversations();
      }
    };
    
    return () => {
      ws.close();
    };
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/conversations");
      if (!res.ok) throw new Error("Failed to fetch");
      const data: ApiConversation[] = await res.json();
      
      const formatted = data.map(c => ({
        id: c.id,
        customer: c.customer,
        channel: c.channel,
        lastMsg: "...", // Not in DB yet
        intent: c.intent || "Unknown",
        status: c.handler_type === "human" ? "Human Handling" : "AI Handling",
        owner: c.handler_type === "human" ? (c.assigned_to || "Human") : "Aanya",
        lastAct: "Just now", // Simplification
        canTakeover: c.handler_type === "ai"
      }));
      setConversations(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTakeover = async (id: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/conversations/${id}/takeover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operator_id: "op_123" })
      });
      if (!res.ok) throw new Error("Failed to take over");
      
      // Update local state immediately for snappy UI
      setConversations(prev => prev.map(c => 
        c.id === id ? { ...c, status: "Human Handling", owner: "op_123", canTakeover: false } : c
      ));
    } catch (err) {
      console.error(err);
      alert("Failed to take over conversation.");
    }
  };

  const handleReturnToAi = async (id: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/conversations/${id}/return-to-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operator_id: "op_123" })
      });
      if (!res.ok) throw new Error("Failed to return to AI");
      
      // Update local state immediately for snappy UI
      setConversations(prev => prev.map(c => 
        c.id === id ? { ...c, status: "AI Handling", owner: "Aanya", canTakeover: true } : c
      ));
    } catch (err) {
      console.error(err);
      alert("Failed to return to AI.");
    }
  };

  if (!mounted) return null;

  return (
    <div className="app-shell">
      {/* ── SIDEBAR ────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect width="14" height="14" rx="3" fill="var(--bg-surface)" />
              <path d="M4 7h6M7 4v6" stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="sidebar-logo-text">White Gloves</div>
        </div>

        <div className="sidebar-section-label">Main</div>
        <div className={`sidebar-nav-item ${activeNav === "overview" ? "active" : ""}`} onClick={() => setActiveNav("overview")}>
          <div className="sidebar-nav-left"><NavIcon id="overview" /> Workspace</div>
        </div>
        <div className={`sidebar-nav-item ${activeNav === "ih" ? "active" : ""}`} onClick={() => setActiveNav("ih")}>
          <div className="sidebar-nav-left"><NavIcon id="ih" /> Internet Human</div>
        </div>

        <div className="sidebar-section-label">CRM Gateway</div>
        <div className={`sidebar-nav-item ${activeNav === "conv" ? "active" : ""}`} onClick={() => setActiveNav("conv")}>
          <div className="sidebar-nav-left"><NavIcon id="conv" /> Conversations</div>
        </div>
        <div className={`sidebar-nav-item ${activeNav === "pipeline" ? "active" : ""}`} onClick={() => setActiveNav("pipeline")}>
          <div className="sidebar-nav-left"><NavIcon id="pipeline" /> Pipeline</div>
        </div>
        <div className={`sidebar-nav-item ${activeNav === "customers" ? "active" : ""}`} onClick={() => setActiveNav("customers")}>
          <div className="sidebar-nav-left"><NavIcon id="customers" /> Customers</div>
        </div>

        <div className="sidebar-section-label">System</div>
        <div className="sidebar-nav-item"><div className="sidebar-nav-left"><NavIcon id="settings" /> Settings</div></div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">O</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Operator Name</div>
              <div className="sidebar-user-email">aryan@internethuman.co</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN AREA ─────────────────────────── */}
      <div className="main-area">
        <div className="main-scroll">
          
          {/* 1. Header & KPIs */}
          <div style={{ marginBottom: "40px" }}>
            <h1 className="page-title">Workspace</h1>
            <p className="page-desc">Your Internet Human is actively handling conversations and qualifying leads.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "48px" }}>
            {kpis.map((m) => (
              <div key={m.label} className="card" style={{ padding: "16px 20px" }}>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>{m.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                  <div style={{ fontSize: "24px", fontWeight: "600", color: "var(--text-primary)" }}>{m.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 2. Active Conversations */}
          <div style={{ marginBottom: "48px" }}>
            <h2 className="sec-head">Active Conversations</h2>
            <div className="card table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Channel</th>
                    <th>Last Message</th>
                    <th>Intent</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Last Activity</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {conversations.map((c) => (
                    <tr key={c.id}>
                      <td className="font-medium">{c.customer}</td>
                      <td>{c.channel}</td>
                      <td style={{ color: "var(--text-secondary)" }}>{c.lastMsg}</td>
                      <td>{c.intent}</td>
                      <td><span className={`tag ${c.status === "Human Handling" ? "human" : "ai"}`}>{c.status}</span></td>
                      <td>{c.owner}</td>
                      <td className="text-muted">{c.lastAct}</td>
                      <td style={{ textAlign: "right" }}>
                        {c.canTakeover ? (
                          <button className="btn btn-secondary" onClick={() => handleTakeover(c.id)}>Take Over</button>
                        ) : (
                          <button className="btn btn-secondary" onClick={() => handleReturnToAi(c.id)} style={{ color: "var(--text-primary)", border: "1px solid var(--border)" }}>Return to AI</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Lead Management */}
          <div style={{ marginBottom: "48px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 className="sec-head" style={{ marginBottom: 0 }}>Leads Requiring Attention</h2>
              <div style={{ display: "flex", gap: "8px" }}>
                {["All", "Qualified", "Proposal", "Won"].map(f => (
                  <button key={f} 
                          onClick={() => setLeadFilter(f)}
                          style={{ 
                            padding: "6px 12px", fontSize: "13px", fontWeight: "500", borderRadius: "6px", cursor: "pointer",
                            background: leadFilter === f ? "var(--bg-surface)" : "transparent", 
                            color: leadFilter === f ? "var(--text-primary)" : "var(--text-secondary)", 
                            border: leadFilter === f ? "1px solid var(--border)" : "1px solid transparent",
                            boxShadow: leadFilter === f ? "var(--shadow-sm)" : "none"
                          }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="card table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Company</th>
                    <th>Stage</th>
                    <th>Value</th>
                    <th>Last Activity</th>
                    <th style={{ textAlign: "right" }}>Next Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.filter(l => leadFilter === "All" || l.stage === leadFilter).map((l) => (
                    <tr key={l.id}>
                      <td className="font-medium">{l.lead}</td>
                      <td>{l.company}</td>
                      <td><span className="tag">{l.stage}</span></td>
                      <td className="font-medium">{l.value}</td>
                      <td className="text-muted">{l.lastAct}</td>
                      <td style={{ textAlign: "right" }}><button className="btn btn-secondary">{l.next}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Active Pipeline */}
          <div style={{ marginBottom: "48px" }}>
            <h2 className="sec-head">Active Pipeline</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
              {pipelineStages.map((stage) => (
                <div key={stage.name} className="pipeline-col">
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    {stage.name} <span style={{ float: "right", color: "var(--text-muted)" }}>{stage.items.length}</span>
                  </div>
                  {stage.items.map(item => (
                    <div key={item.id} className="pipeline-card">
                       <div style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)", marginBottom: "8px" }}>{item.name}</div>
                       <div style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "12px" }}>{item.val}</div>
                       <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{item.lastAct}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* 5. Two Columns: Activity & Actions */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px", marginBottom: "48px" }}>
            
            {/* Activity Feed */}
            <div>
              <h2 className="sec-head">Aanya's Recent Activity</h2>
              <div className="card" style={{ padding: "24px" }}>
                {activities.map((item, idx) => (
                  <div key={item.id} className="timeline-item">
                    <div className="timeline-dot" />
                    <div style={{ flex: 1, paddingBottom: idx === activities.length - 1 ? 0 : 24 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)" }}>{item.action}</span>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{item.time}</span>
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>Customer: {item.customer}</div>
                      
                      <div style={{ display: "flex", gap: "16px", background: "var(--bg-app)", padding: "12px", borderRadius: "6px" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "4px", fontWeight: "500" }}>Outcome</div>
                          <div style={{ fontSize: "13px", color: "var(--text-primary)" }}>{item.outcome}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "4px", fontWeight: "500" }}>Impact</div>
                          <div style={{ fontSize: "13px", color: "var(--text-primary)" }}>{item.impact}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Actions */}
            <div>
              <h2 className="sec-head">Recommended Actions</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {insights.map(i => (
                  <div key={i.id} className="card" style={{ padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-secondary)" }}>
                        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                      </svg>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>{i.title}</span>
                    </div>
                    <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px" }}>Customer: <span style={{ color: "var(--text-primary)", fontWeight: "500" }}>{i.target}</span></div>
                    
                    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px 0", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {i.stats.map((s, idx) => (
                        <li key={idx} style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--text-muted)" }} />
                          {s}
                        </li>
                      ))}
                    </ul>
                    
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>RECOMMENDED ACTION</span>
                      <button className="btn btn-primary">{i.action}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

// ── Icon helpers ──────────────────────────────────
function NavIcon({ id }: { id: string }) {
  const s = { width: 16, height: 16, style: { flexShrink: 0 } };
  const icons: Record<string, React.ReactNode> = {
    overview: <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    ih:       <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a7 7 0 0113 0"/><circle cx="19" cy="5" r="3" fill="currentColor" stroke="none"/></svg>,
    conv:     <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 6.18a2 2 0 012-2.18h3"/></svg>,
    pipeline: <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    customers:<svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    settings: <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  };
  return (icons[id] || <span style={{ width: 16, flexShrink: 0 }} />) as React.ReactElement;
}
