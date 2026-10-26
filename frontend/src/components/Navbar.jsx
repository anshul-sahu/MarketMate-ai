import { Sparkles, BarChart3, BookmarkCheck, Activity, RefreshCw } from "lucide-react";

export default function Navbar({
  activeTab,
  setActiveTab,
  backendStatus,
  checkBackendHealth,
  savedCount = 0
}) {
  return (
    <header className="app-header">
      <div className="container nav-container">
        <div className="nav-brand" onClick={() => setActiveTab("studio")}>
          <div className="brand-logo">
            <span className="logo-sparkle">✦</span>
          </div>
          <div className="brand-info">
            <div className="brand-title-row">
              <span className="brand-name">MarketMate</span>
              <span className="brand-ai-badge">AI 3.5</span>
            </div>
            <span className="brand-subtitle">Autonomous Campaign Intelligence</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs" aria-label="Main Navigation">
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === "studio" ? "active" : ""}`}
            onClick={() => setActiveTab("studio")}
          >
            <Sparkles size={16} className="nav-icon" />
            <span>Campaign Studio</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === "predictor" ? "active" : ""}`}
            onClick={() => setActiveTab("predictor")}
          >
            <BarChart3 size={16} className="nav-icon" />
            <span>ML Predictor</span>
            <span className="tab-pill-badge">Random Forest</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === "saved" ? "active" : ""}`}
            onClick={() => setActiveTab("saved")}
          >
            <BookmarkCheck size={16} className="nav-icon" />
            <span>Saved Vault</span>
            {savedCount > 0 && (
              <span className="count-pill">{savedCount}</span>
            )}
          </button>
        </nav>

        {/* Status & Quick Action */}
        <div className="nav-actions">
          <div
            className={`status-indicator-badge ${backendStatus.online ? "online" : "offline"}`}
            title={backendStatus.online ? "Connected to Flask on port 5000" : "Backend unreachable on port 5000"}
          >
            <span className="status-dot" />
            <span className="status-label">
              {backendStatus.loading ? (
                "Checking..."
              ) : backendStatus.online ? (
                "API Online"
              ) : (
                "Flask Offline"
              )}
            </span>
            <button
              type="button"
              className="status-refresh-btn"
              onClick={checkBackendHealth}
              title="Re-check backend status"
              disabled={backendStatus.loading}
            >
              <RefreshCw size={12} className={backendStatus.loading ? "spin" : ""} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
