import { Zap, Sparkles, TrendingUp, Cpu } from "lucide-react";
import { PRESET_CAMPAIGNS } from "../utils/presets";

export default function Hero({ onSelectPreset }) {
  return (
    <section className="hero-banner">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-glow-dot" />
          <Sparkles size={14} className="badge-icon" />
          <span>Multi-Agent Marketing Assistant & ML Forecasting Suite</span>
        </div>

        <h1 className="hero-title">
          Architect High-Impact Marketing Campaigns <span className="text-gradient">In Seconds.</span>
        </h1>

        <p className="hero-lead">
          Describe your business, set a budget, and let Gemini AI draft end-to-end multi-channel strategies, 
          Google & Meta ad copy, budget breakdowns, and daily content calendars.
        </p>

        {/* Quick Launch Presets */}
        <div className="presets-wrapper">
          <span className="presets-label">
            <Zap size={13} className="text-amber" /> Quick start with curated presets:
          </span>
          <div className="presets-chip-row">
            {PRESET_CAMPAIGNS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="preset-chip"
                onClick={() => onSelectPreset(preset)}
                title={`Load "${preset.name}" preset`}
              >
                <span className="preset-icon">{preset.icon}</span>
                <span className="preset-name">{preset.name}</span>
                <span className="preset-tag">{preset.tag}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
