import { useState, useId } from "react";
import {
  Briefcase,
  Layers,
  Users,
  IndianRupee,
  Calendar,
  Target,
  Wand2,
  Sparkles,
  HelpCircle,
  Play
} from "lucide-react";

const SUGGESTED_AUDIENCE_TAGS = [
  "Tech Professionals & Founders",
  "Gen-Z & College Students",
  "Working Mothers 28-45",
  "Fitness & Wellness Enthusiasts",
  "High Net-Worth Investors",
  "Local Foodies & Brunch Seekers"
];

const DURATION_PRESETS = [7, 14, 21, 30];

export default function CampaignForm({
  form,
  setForm,
  onGenerate,
  onLoadSample,
  loading,
  backendOnline
}) {
  const budgetId = useId();
  const durationId = useId();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  function handleAudienceTagClick(tag) {
    setForm((prev) => {
      const current = prev.target_audience ? prev.target_audience.trim() : "";
      if (current.includes(tag)) return prev;
      const updated = current ? `${current}, ${tag}` : tag;
      return {
        ...prev,
        target_audience: updated
      };
    });
  }

  const budgetNum = Number(form.budget) || 0;
  const durationNum = Number(form.duration_days) || 1;
  const dailySpend = Math.round(budgetNum / Math.max(1, durationNum));

  return (
    <div className="card glass-card form-panel">
      <div className="card-header-row">
        <div>
          <h2 className="card-title">Campaign Blueprint</h2>
          <p className="card-subtitle">Define your business parameters for Gemini reasoning.</p>
        </div>
        <div className="card-header-badge">
          <Wand2 size={14} className="text-primary" />
          <span>Agent Prompt</span>
        </div>
      </div>

      <form onSubmit={onGenerate} className="campaign-form">
        {/* Business Name */}
        <div className="form-group">
          <label className="input-label" htmlFor="business_name">
            <Briefcase size={14} className="label-icon text-indigo" />
            <span>Business / Brand Name</span>
            <span className="required-star">*</span>
          </label>
          <div className="input-with-icon">
            <input
              id="business_name"
              type="text"
              name="business_name"
              className="styled-input"
              value={form.business_name}
              onChange={handleChange}
              placeholder="e.g. Urban Threads Apparel"
              required
            />
          </div>
        </div>

        {/* Business Type */}
        <div className="form-group">
          <label className="input-label" htmlFor="business_type">
            <Layers size={14} className="label-icon text-purple" />
            <span>Industry & Category</span>
          </label>
          <select
            id="business_type"
            name="business_type"
            className="styled-select"
            value={form.business_type}
            onChange={handleChange}
          >
            <option value="E-commerce">🛒 E-commerce & Retail</option>
            <option value="Clothing and Fashion">👗 Clothing & Fashion</option>
            <option value="Food and Restaurant">🍽️ Food, Dining & Restaurant</option>
            <option value="Education">🎓 Education & Online Courses</option>
            <option value="Software and Technology">💻 Software, SaaS & Technology</option>
            <option value="Healthcare">🩺 Health, Wellness & Medical</option>
            <option value="Real Estate">🏡 Real Estate & Property</option>
            <option value="Other">✨ Other Direct-to-Consumer</option>
          </select>
        </div>

        {/* Target Audience */}
        <div className="form-group">
          <div className="label-row">
            <label className="input-label" htmlFor="target_audience">
              <Users size={14} className="label-icon text-cyan" />
              <span>Target Audience Profile</span>
              <span className="required-star">*</span>
            </label>
            <span className="helper-hint">Add persona tags below</span>
          </div>
          <textarea
            id="target_audience"
            name="target_audience"
            className="styled-textarea"
            rows="3"
            value={form.target_audience}
            onChange={handleChange}
            placeholder="e.g. Urban college students and young professionals (18–30) looking for stylish sustainable fashion"
            required
          />
          {/* Quick Audience Tag Chips */}
          <div className="audience-tags-container">
            {SUGGESTED_AUDIENCE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className="audience-tag-btn"
                onClick={() => handleAudienceTagClick(tag)}
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Budget & Duration Grid */}
        <div className="form-row-grid">
          {/* Budget */}
          <div className="form-group">
            <div className="label-row">
              <label className="input-label" htmlFor={budgetId}>
                <IndianRupee size={14} className="label-icon text-emerald" />
                <span>Budget (₹)</span>
              </label>
              <span className="daily-burn-tag">
                ~₹{dailySpend.toLocaleString("en-IN")}/day
              </span>
            </div>
            <input
              id={budgetId}
              type="number"
              name="budget"
              className="styled-input font-mono"
              min="1000"
              max="5000000"
              step="500"
              value={form.budget}
              onChange={handleChange}
              required
            />
            <input
              type="range"
              name="budget"
              className="styled-range"
              min="5000"
              max="200000"
              step="2500"
              value={Math.min(200000, Math.max(5000, Number(form.budget) || 5000))}
              onChange={handleChange}
            />
          </div>

          {/* Duration */}
          <div className="form-group">
            <div className="label-row">
              <label className="input-label" htmlFor={durationId}>
                <Calendar size={14} className="label-icon text-amber" />
                <span>Duration</span>
              </label>
              <span className="duration-count-tag">{form.duration_days} Days</span>
            </div>
            <input
              id={durationId}
              type="number"
              name="duration_days"
              className="styled-input font-mono"
              min="1"
              max="30"
              value={form.duration_days}
              onChange={handleChange}
              required
            />
            {/* Quick Duration Pills */}
            <div className="duration-pills-row">
              {DURATION_PRESETS.map((days) => (
                <button
                  key={days}
                  type="button"
                  className={`duration-pill-btn ${Number(form.duration_days) === days ? "active" : ""}`}
                  onClick={() => setForm((prev) => ({ ...prev, duration_days: String(days) }))}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Campaign Objective */}
        <div className="form-group">
          <label className="input-label" htmlFor="campaign_goal">
            <Target size={14} className="label-icon text-rose" />
            <span>Primary Campaign Objective</span>
          </label>
          <select
            id="campaign_goal"
            name="campaign_goal"
            className="styled-select"
            value={form.campaign_goal}
            onChange={handleChange}
          >
            <option value="Increase sales">📈 Increase Sales & Conversions</option>
            <option value="Generate leads">🎯 High-Intent Lead Generation</option>
            <option value="Brand awareness">🌟 Maximum Brand Awareness & Reach</option>
            <option value="Increase website traffic">🚀 Drive Quality Website Traffic</option>
            <option value="Promote a new product">✨ Launch & Promote a New Product</option>
          </select>
        </div>

        {/* Submit Actions */}
        <div className="form-actions-group">
          <button
            type="submit"
            className="btn-primary-gradient w-100"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading-content">
                <span className="spinner-glow" />
                <span>Agent Orchestrating Strategy...</span>
              </span>
            ) : (
              <span className="btn-content">
                <Sparkles size={18} />
                <span>Generate Campaign Plan</span>
              </span>
            )}
          </button>

          {!backendOnline && (
            <div className="offline-helper-box">
              <span className="offline-tip">
                <HelpCircle size={14} className="text-amber" />
                Backend not detected yet. Want to test immediately?
              </span>
              <button
                type="button"
                className="btn-ghost-sample"
                onClick={onLoadSample}
              >
                <Play size={13} />
                <span>Preview With Sample Campaign</span>
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
