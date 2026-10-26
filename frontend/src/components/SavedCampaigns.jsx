import { useState } from "react";
import {
  Bookmark,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  IndianRupee,
  ExternalLink,
  Copy,
  Check,
  X,
  FileText,
  Sparkles,
  Layers
} from "lucide-react";

export default function SavedCampaigns({
  campaigns = [],
  onLoadCampaign,
  onRefresh,
  loading,
  onShowToast
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [activeModalCampaign, setActiveModalCampaign] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const businessTypes = [
    "ALL",
    ...new Set(campaigns.map((c) => c.business_type).filter(Boolean))
  ];

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      (c.business_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.campaign_goal || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.target_audience || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === "ALL" || c.business_type === selectedType;

    return matchesSearch && matchesType;
  });

  const totalTrackedBudget = campaigns.reduce(
    (acc, curr) => acc + (Number(curr.budget) || 0),
    0
  );

  async function handleCopyResult(campaign) {
    try {
      await navigator.clipboard.writeText(campaign.result);
      setCopiedId(campaign.id);
      onShowToast?.(`Copied plan for ${campaign.business_name}!`, "success");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      // ignore
    }
  }

  return (
    <div className="saved-vault-container animate-fade-in">
      {/* Header Summary */}
      <div className="section-intro-card glass-card">
        <div className="d-flex justify-between align-center flex-wrap gap-3">
          <div>
            <div className="intro-badge">
              <Bookmark size={15} className="text-purple" />
              <span>SQLite Persistent Storage</span>
            </div>
            <h2 className="section-main-title">Campaign Vault</h2>
            <p className="section-main-desc">
              Review and retrieve your historical AI marketing strategies saved in the database.
            </p>
          </div>

          <div className="vault-stats-row">
            <div className="vault-stat-box">
              <span className="stat-label">Total Saved</span>
              <strong className="stat-num">{campaigns.length}</strong>
            </div>
            <div className="vault-stat-box">
              <span className="stat-label">Tracked Budget</span>
              <strong className="stat-num font-mono">
                ₹{totalTrackedBudget.toLocaleString("en-IN")}
              </strong>
            </div>
            <button
              type="button"
              className="btn-refresh-vault"
              onClick={onRefresh}
              disabled={loading}
              title="Refresh campaigns list"
            >
              <RefreshCw size={15} className={loading ? "spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="vault-filters-bar glass-card">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon text-muted" />
          <input
            type="text"
            className="search-input"
            placeholder="Search campaigns by name, goal, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="category-pills-scroll">
          {businessTypes.map((type) => (
            <button
              key={type}
              type="button"
              className={`category-pill ${selectedType === type ? "active" : ""}`}
              onClick={() => setSelectedType(type)}
            >
              {type === "ALL" ? "All Categories" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign Cards Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="card glass-card empty-vault-box">
          <div className="empty-icon-halo">
            <Bookmark size={32} className="text-muted" />
          </div>
          <h3 className="empty-title">
            {campaigns.length === 0
              ? "No Campaigns Saved Yet"
              : "No Campaigns Match Your Search"}
          </h3>
          <p className="empty-subtitle">
            {campaigns.length === 0
              ? "Generate a campaign in the Studio and click 'Save to Vault' to preserve it here."
              : "Try adjusting your search keywords or category filters above."}
          </p>
        </div>
      ) : (
        <div className="vault-cards-grid">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="card glass-card saved-campaign-card">
              <div className="card-top-row">
                <span className="business-type-badge">
                  {campaign.business_type}
                </span>
                <span className="campaign-date font-mono">
                  {campaign.created_at
                    ? new Date(campaign.created_at).toLocaleDateString()
                    : "Saved"}
                </span>
              </div>

              <h3 className="saved-business-title">{campaign.business_name}</h3>
              <p className="saved-goal-line">
                <span className="text-secondary">Goal:</span> {campaign.campaign_goal}
              </p>

              <div className="saved-card-stats-strip">
                <div className="stat-item">
                  <IndianRupee size={13} className="text-emerald" />
                  <span className="font-mono font-bold">
                    ₹{Number(campaign.budget).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="stat-item">
                  <Calendar size={13} className="text-amber" />
                  <span>{campaign.duration_days} Days</span>
                </div>
              </div>

              <div className="saved-card-actions">
                <button
                  type="button"
                  className="btn-card-action primary"
                  onClick={() => onLoadCampaign(campaign)}
                  title="Open this plan in Campaign Studio"
                >
                  <Sparkles size={14} />
                  <span>Load into Studio</span>
                </button>

                <button
                  type="button"
                  className="btn-card-action secondary"
                  onClick={() => setActiveModalCampaign(campaign)}
                  title="Quick View plan text"
                >
                  <FileText size={14} />
                  <span>View</span>
                </button>

                <button
                  type="button"
                  className="btn-card-action icon-only"
                  onClick={() => handleCopyResult(campaign)}
                  title="Copy full campaign plan text"
                >
                  {copiedId === campaign.id ? (
                    <Check size={14} className="text-emerald" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick View Modal */}
      {activeModalCampaign && (
        <div className="modal-backdrop" onClick={() => setActiveModalCampaign(null)}>
          <div
            className="card glass-card modal-panel animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="business-type-badge">
                  {activeModalCampaign.business_type}
                </span>
                <h3 className="modal-title">{activeModalCampaign.business_name}</h3>
                <span className="modal-sub">
                  Budget: ₹{Number(activeModalCampaign.budget).toLocaleString("en-IN")} · {activeModalCampaign.duration_days} Days · {activeModalCampaign.campaign_goal}
                </span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveModalCampaign(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <pre className="modal-pre-content">{activeModalCampaign.result}</pre>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-toolbar"
                onClick={() => handleCopyResult(activeModalCampaign)}
              >
                <Copy size={15} />
                <span>Copy Plan</span>
              </button>

              <button
                type="button"
                className="btn-primary-gradient"
                onClick={() => {
                  onLoadCampaign(activeModalCampaign);
                  setActiveModalCampaign(null);
                }}
              >
                <Sparkles size={15} />
                <span>Load in Studio</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
