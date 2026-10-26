import { useState } from "react";
import confetti from "canvas-confetti";
import {
  Bookmark,
  Copy,
  Check,
  Download,
  BarChart2,
  ExternalLink,
  Layers,
  Sparkles,
  Search,
  Calendar,
  PieChart,
  Target,
  FileText,
  Share2,
  Eye,
  SlidersHorizontal
} from "lucide-react";
import { parseCampaignResult } from "../utils/campaignParser";

function InstagramIcon({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function CampaignResultViewer({
  result,
  campaign,
  loading,
  error,
  notice,
  saving,
  onSave,
  onSimulateML,
  onShowToast
}) {
  const [activeViewTab, setActiveViewTab] = useState("visual"); // "visual" | "raw"
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedGoogle, setCopiedGoogle] = useState(false);
  const [copiedMeta, setCopiedMeta] = useState(false);

  const parsed = parseCampaignResult(result, campaign || {});

  function triggerConfetti() {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#38bdf8"]
      });
    } catch (e) {
      // fallback safe
    }
  }

  function handleSaveClick() {
    triggerConfetti();
    onSave();
  }

  async function handleCopyAll() {
    try {
      await navigator.clipboard.writeText(result);
      setCopiedAll(true);
      onShowToast?.("Complete campaign plan copied to clipboard!", "success");
      setTimeout(() => setCopiedAll(false), 2500);
    } catch (err) {
      onShowToast?.("Unable to copy to clipboard", "error");
    }
  }

  async function handleCopyAd(type, text) {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "google") {
        setCopiedGoogle(true);
        setTimeout(() => setCopiedGoogle(false), 2000);
      } else {
        setCopiedMeta(true);
        setTimeout(() => setCopiedMeta(false), 2000);
      }
      onShowToast?.(`Copied ${type === "google" ? "Google" : "Meta"} ad copy!`, "success");
    } catch (err) {
      // ignore
    }
  }

  function handleDownload() {
    const filename = `${(campaign?.business_name || "campaign").toLowerCase().replace(/[^a-z0-9]/g, "-")}-plan.md`;
    const blob = new Blob([result], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast?.(`Downloaded ${filename}`, "success");
  }

  return (
    <div className="card glass-card result-panel">
      {/* Header Bar */}
      <div className="result-header">
        <div className="result-title-group">
          <div className="result-badge-row">
            <span className="live-pill">
              <span className="live-dot" /> AI Output
            </span>
            <span className="model-chip">Gemini 3.5 Agent</span>
          </div>
          <h2 className="result-heading">Campaign Workspace</h2>
          <p className="card-subtitle">
            {campaign?.business_name
              ? `Strategic roadmap for ${campaign.business_name} (${campaign.business_type})`
              : "Review your generated strategy and ad creatives"}
          </p>
        </div>

        {/* View Switcher Tabs (Visual vs Raw) */}
        {result && (
          <div className="view-mode-tabs">
            <button
              type="button"
              className={`view-mode-btn ${activeViewTab === "visual" ? "active" : ""}`}
              onClick={() => setActiveViewTab("visual")}
            >
              <Layers size={14} />
              <span>Visual Suite</span>
            </button>
            <button
              type="button"
              className={`view-mode-btn ${activeViewTab === "raw" ? "active" : ""}`}
              onClick={() => setActiveViewTab("raw")}
            >
              <FileText size={14} />
              <span>Raw Plan</span>
            </button>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="custom-alert alert-error animate-fade-in" role="alert">
          <span className="alert-icon">⚠️</span>
          <div className="alert-body">
            <strong>Connection Notice:</strong> {error}
          </div>
        </div>
      )}

      {notice && (
        <div className="custom-alert alert-success animate-fade-in" role="status">
          <span className="alert-icon">✓</span>
          <div className="alert-body">{notice}</div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state-box animate-fade-in">
          <div className="loading-orb">
            <Sparkles size={28} className="spin-slow text-primary" />
          </div>
          <h3 className="loading-title">Generating Marketing Blueprint...</h3>
          <p className="loading-desc">
            Gemini is reasoning through channel dynamics, calculating optimal budget allocations, 
            and drafting high-converting creative ad variations.
          </p>
          <div className="loading-steps-row">
            <span className="step-tag active">1. Audience Analysis</span>
            <span className="step-tag active">2. Tool Invocations</span>
            <span className="step-tag">3. Creative Synthesis</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !result && (
        <div className="empty-state-box">
          <div className="empty-icon-halo">
            <Sparkles size={36} className="text-primary" />
          </div>
          <h3 className="empty-title">Ready to Launch Your Next Campaign</h3>
          <p className="empty-subtitle">
            Configure your business details on the left, or click any quick-start preset chip above 
            to generate a complete multi-channel marketing campaign.
          </p>
          <div className="empty-features-grid">
            <div className="feature-mini-pill">
              <Search size={14} className="text-cyan" />
              <span>Google Ads Copy</span>
            </div>
            <div className="feature-mini-pill">
              <InstagramIcon size={14} className="text-pink" />
              <span>Meta Ads & Reels</span>
            </div>
            <div className="feature-mini-pill">
              <PieChart size={14} className="text-emerald" />
              <span>Smart Budget Split</span>
            </div>
            <div className="feature-mini-pill">
              <Calendar size={14} className="text-amber" />
              <span>Day-by-Day Schedule</span>
            </div>
          </div>
        </div>
      )}

      {/* Populated Result Content */}
      {!loading && result && (
        <div className="result-content-container animate-fade-in">
          {/* Quick Metrics Strip */}
          <div className="campaign-metrics-strip">
            <div className="metric-pill">
              <span className="metric-label">Business:</span>
              <strong className="metric-val">{campaign?.business_name || "Custom Brand"}</strong>
            </div>
            <div className="metric-pill">
              <span className="metric-label">Budget:</span>
              <strong className="metric-val font-mono">
                ₹{Number(campaign?.budget || 0).toLocaleString("en-IN")}
              </strong>
            </div>
            <div className="metric-pill">
              <span className="metric-label">Duration:</span>
              <strong className="metric-val">{campaign?.duration_days} Days</strong>
            </div>
            <div className="metric-pill">
              <span className="metric-label">Goal:</span>
              <span className="metric-badge">{campaign?.campaign_goal}</span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="action-toolbar">
            <div className="action-group-left">
              <button
                type="button"
                className="btn-toolbar btn-save"
                onClick={handleSaveClick}
                disabled={saving}
              >
                <Bookmark size={15} />
                <span>{saving ? "Saving to Vault..." : "Save to Vault"}</span>
              </button>

              <button
                type="button"
                className="btn-toolbar"
                onClick={handleCopyAll}
              >
                {copiedAll ? <Check size={15} className="text-emerald" /> : <Copy size={15} />}
                <span>{copiedAll ? "Copied All" : "Copy Plan"}</span>
              </button>

              <button
                type="button"
                className="btn-toolbar"
                onClick={handleDownload}
              >
                <Download size={15} />
                <span>Download .md</span>
              </button>
            </div>

            <div className="action-group-right">
              {onSimulateML && (
                <button
                  type="button"
                  className="btn-toolbar btn-accent"
                  onClick={onSimulateML}
                  title="Forecast clicks and conversions with ML"
                >
                  <BarChart2 size={15} />
                  <span>Simulate in ML Predictor</span>
                </button>
              )}
            </div>
          </div>

          {/* Visual View */}
          {activeViewTab === "visual" ? (
            <div className="visual-suite-container">
              {/* Executive Strategy Highlight */}
              <div className="strategy-card">
                <div className="strategy-card-header">
                  <Sparkles size={16} className="text-purple" />
                  <h4>Strategic Approach</h4>
                </div>
                <div className="strategy-text">
                  {parsed.strategy || result.slice(0, 320)}
                </div>
              </div>

              {/* Ad Creatives Gallery */}
              <div className="ad-creatives-section">
                <div className="section-title-row">
                  <h3 className="sub-heading">
                    <Target size={16} className="text-rose" /> Ad Creatives Preview
                  </h3>
                  <span className="helper-hint">High-conversion direct response mockups</span>
                </div>

                <div className="ad-mockup-grid">
                  {/* Google Search Ad Mockup */}
                  <div className="ad-card google-ad-card">
                    <div className="ad-card-topbar">
                      <div className="ad-platform-badge google">
                        <Search size={13} />
                        <span>Google Search Ad Preview</span>
                      </div>
                      <button
                        type="button"
                        className="copy-mini-btn"
                        onClick={() =>
                          handleCopyAd(
                            "google",
                            `Headline: ${parsed.googleAds?.headline}\nDescription: ${parsed.googleAds?.description}`
                          )
                        }
                      >
                        {copiedGoogle ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
                        <span>{copiedGoogle ? "Copied" : "Copy Ad"}</span>
                      </button>
                    </div>

                    <div className="google-ad-box">
                      <div className="google-url-row">
                        <span className="google-sponsor-tag">Sponsored</span>
                        <span className="google-url">{parsed.googleAds?.url}</span>
                      </div>
                      <h4 className="google-ad-headline">
                        {parsed.googleAds?.headline}
                      </h4>
                      <p className="google-ad-desc">
                        {parsed.googleAds?.description}
                      </p>
                      <div className="google-ad-extensions">
                        <span className="ext-pill">✓ Official Brand Store</span>
                        <span className="ext-pill">✓ Secure Payment</span>
                        <span className="ext-pill">✓ 24/7 Support</span>
                      </div>
                    </div>
                  </div>

                  {/* Meta / Instagram Sponsored Feed Ad Mockup */}
                  <div className="ad-card meta-ad-card">
                    <div className="ad-card-topbar">
                      <div className="ad-platform-badge meta">
                        <InstagramIcon size={13} />
                        <span>Meta & Instagram Sponsored Ad</span>
                      </div>
                      <button
                        type="button"
                        className="copy-mini-btn"
                        onClick={() =>
                          handleCopyAd(
                            "meta",
                            `Primary Text: ${parsed.metaAds?.primaryText}\nHeadline: ${parsed.metaAds?.headline}\nCTA: ${parsed.metaAds?.cta}`
                          )
                        }
                      >
                        {copiedMeta ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
                        <span>{copiedMeta ? "Copied" : "Copy Ad"}</span>
                      </button>
                    </div>

                    <div className="meta-ad-box">
                      {/* Brand Header */}
                      <div className="meta-user-row">
                        <div className="meta-avatar">
                          {(campaign?.business_name || "M")[0].toUpperCase()}
                        </div>
                        <div className="meta-user-info">
                          <span className="meta-user-name">
                            {campaign?.business_name || "MarketMate Brand"}
                          </span>
                          <span className="meta-sub">Sponsored · 🌐</span>
                        </div>
                      </div>

                      {/* Primary Text */}
                      <p className="meta-primary-text">
                        {parsed.metaAds?.primaryText}
                      </p>

                      {/* Mock Graphic Media Banner */}
                      <div className="meta-media-banner">
                        <div className="banner-glow-gradient" />
                        <div className="banner-inner-text">
                          <span className="banner-tag">{campaign?.business_type || "Exclusive"}</span>
                          <h5 className="banner-brand">{campaign?.business_name || "Limited Edition"}</h5>
                          <span className="banner-cta-sub">Tap to explore special offers</span>
                        </div>
                      </div>

                      {/* Meta Bottom Action Bar */}
                      <div className="meta-cta-bar">
                        <div className="meta-headline-col">
                          <span className="meta-site-domain">
                            {(campaign?.business_name || "brand").toLowerCase().replace(/[^a-z0-9]/g, "")}.com
                          </span>
                          <strong className="meta-card-title">
                            {parsed.metaAds?.headline}
                          </strong>
                        </div>
                        <button type="button" className="meta-cta-button">
                          {parsed.metaAds?.cta || "Shop Now"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget Allocation Breakdown */}
              <div className="budget-section">
                <div className="section-title-row">
                  <h3 className="sub-heading">
                    <PieChart size={16} className="text-emerald" /> Budget Distribution Strategy
                  </h3>
                  <span className="helper-hint">
                    Total: ₹{Number(campaign?.budget || 20000).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="budget-cards-grid">
                  {parsed.budgetBreakdown.map((item, index) => (
                    <div key={index} className="budget-card">
                      <div className="budget-card-header">
                        <span className="channel-dot dot-color-1" />
                        <span className="budget-channel-name">{item.name}</span>
                      </div>
                      <div className="budget-value font-mono">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Calendar Timeline */}
              {parsed.calendarDays.length > 0 && (
                <div className="calendar-section">
                  <div className="section-title-row">
                    <h3 className="sub-heading">
                      <Calendar size={16} className="text-amber" /> Content & Execution Timeline
                    </h3>
                    <span className="helper-hint">Day-by-day omnichannel schedule</span>
                  </div>

                  <div className="calendar-cards-grid">
                    {parsed.calendarDays.map((item, index) => (
                      <div key={index} className="calendar-day-card">
                        <div className="day-badge-row">
                          <span className="day-number-badge">Day {item.day}</span>
                          {item.format && (
                            <span className="day-format-tag">{item.format}</span>
                          )}
                        </div>
                        {item.theme && (
                          <h5 className="day-theme-title">{item.theme}</h5>
                        )}
                        <p className="day-content-desc">{item.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested KPIs */}
              <div className="kpis-section">
                <div className="section-title-row">
                  <h3 className="sub-heading">
                    <Target size={16} className="text-cyan" /> Suggested Performance Benchmark KPIs
                  </h3>
                </div>
                <div className="kpi-cards-grid">
                  {parsed.kpis.map((kpi, idx) => (
                    <div key={idx} className="kpi-mini-card">
                      <span className="kpi-badge">{kpi.badge}</span>
                      <span className="kpi-label">{kpi.label}</span>
                      <strong className="kpi-val font-mono">{kpi.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Raw Markdown Plan View */
            <div className="raw-markdown-view">
              <div className="raw-toolbar">
                <span className="raw-label">Full Markdown Plan</span>
                <button
                  type="button"
                  className="copy-mini-btn"
                  onClick={handleCopyAll}
                >
                  {copiedAll ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
                  <span>{copiedAll ? "Copied" : "Copy Markdown"}</span>
                </button>
              </div>
              <pre className="raw-markdown-content">{result}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
