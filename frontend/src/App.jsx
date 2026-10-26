import { useEffect, useState } from "react";
import "./App.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CampaignForm from "./components/CampaignForm";
import CampaignResultViewer from "./components/CampaignResultViewer";
import PerformancePredictor from "./components/PerformancePredictor";
import SavedCampaigns from "./components/SavedCampaigns";
import Toast from "./components/Toast";
import { SAMPLE_GENERATED_RESULT } from "./utils/presets";

const API = "http://127.0.0.1:5000/api";

const initialForm = {
  business_name: "",
  business_type: "E-commerce",
  target_audience: "",
  budget: "25000",
  duration_days: "7",
  campaign_goal: "Increase sales"
};

export default function App() {
  const [activeTab, setActiveTab] = useState("studio"); // "studio" | "predictor" | "saved"
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState("");
  const [generatedCampaign, setGeneratedCampaign] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [toast, setToast] = useState(null);
  const [backendStatus, setBackendStatus] = useState({ online: false, loading: true });
  const [predictorParams, setPredictorParams] = useState({});

  function showToast(message, type = "info") {
    setToast({ message, type });
  }

  // Check Flask backend health
  async function checkBackendHealth() {
    setBackendStatus((prev) => ({ ...prev, loading: true }));
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${API}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        setBackendStatus({ online: true, loading: false });
      } else {
        setBackendStatus({ online: false, loading: false });
      }
    } catch (err) {
      setBackendStatus({ online: false, loading: false });
    }
  }

  // Load saved campaigns from database
  async function loadCampaigns() {
    try {
      const response = await fetch(`${API}/campaigns`);
      if (!response.ok) {
        throw new Error("Could not load saved campaigns.");
      }
      const data = await response.json();
      setCampaigns(data);
    } catch (err) {
      console.warn("Could not fetch campaigns from server:", err);
    }
  }

  useEffect(() => {
    checkBackendHealth();
    loadCampaigns();
  }, []);

  // Quick Preset Selection
  function handleSelectPreset(preset) {
    setForm(preset.data);
    setActiveTab("studio");
    showToast(`Loaded "${preset.name}" preset`, "success");
    window.scrollTo({ top: 400, behavior: "smooth" });
  }

  // Generate Campaign via Backend
  async function handleGenerate(event) {
    if (event) event.preventDefault();

    setLoading(true);
    setError("");
    setNotice("");
    setResult("");
    setGeneratedCampaign(null);

    try {
      const response = await fetch(`${API}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          budget: Number(form.budget),
          duration_days: Number(form.duration_days)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Campaign generation failed.");
      }

      setResult(data.result);
      setGeneratedCampaign(data.campaign);
      showToast("Marketing plan generated successfully!", "success");
    } catch (err) {
      setError(
        err.message ||
        "Unable to connect to Flask backend. Make sure 'python app.py' is running on port 5000."
      );
      showToast("Backend connection failed", "error");
    } finally {
      setLoading(false);
    }
  }

  // Instant Sample Preview
  function handleLoadSample() {
    const sampleCampaign = {
      business_name: form.business_name || "Aura Apparel",
      business_type: form.business_type || "Clothing and Fashion",
      target_audience: form.target_audience || "Urban millennials and Gen-Z seeking sustainable streetwear",
      budget: Number(form.budget) || 25000,
      duration_days: Number(form.duration_days) || 7,
      campaign_goal: form.campaign_goal || "Increase sales"
    };

    setForm({
      business_name: sampleCampaign.business_name,
      business_type: sampleCampaign.business_type,
      target_audience: sampleCampaign.target_audience,
      budget: String(sampleCampaign.budget),
      duration_days: String(sampleCampaign.duration_days),
      campaign_goal: sampleCampaign.campaign_goal
    });

    setGeneratedCampaign(sampleCampaign);
    setResult(SAMPLE_GENERATED_RESULT);
    setError("");
    setNotice("");
    showToast("Loaded demonstration campaign plan!", "success");
  }

  // Save Campaign to SQLite Database
  async function handleSave() {
    if (!generatedCampaign || !result) {
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API}/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...generatedCampaign,
          result
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save campaign.");
      }

      setNotice(data.message || "Campaign saved successfully to database!");
      showToast("Campaign stored in Vault!", "success");
      await loadCampaigns();
    } catch (err) {
      // Local fallback save so user never loses their work
      const fallbackCampaign = {
        id: Date.now(),
        ...generatedCampaign,
        result,
        created_at: new Date().toISOString()
      };
      setCampaigns((prev) => [fallbackCampaign, ...prev]);
      setNotice("Campaign saved locally in session vault.");
      showToast("Saved locally to session vault", "info");
    } finally {
      setSaving(false);
    }
  }

  // Load Saved Campaign into Workspace
  function handleLoadSavedCampaign(campaign) {
    setForm({
      business_name: campaign.business_name,
      business_type: campaign.business_type,
      target_audience: campaign.target_audience,
      budget: String(campaign.budget),
      duration_days: String(campaign.duration_days),
      campaign_goal: campaign.campaign_goal
    });

    setGeneratedCampaign({
      business_name: campaign.business_name,
      business_type: campaign.business_type,
      target_audience: campaign.target_audience,
      budget: campaign.budget,
      duration_days: campaign.duration_days,
      campaign_goal: campaign.campaign_goal
    });

    setResult(campaign.result);
    setError("");
    setNotice("");
    setActiveTab("studio");
    showToast(`Loaded ${campaign.business_name} into Studio`, "success");
    window.scrollTo({ top: 380, behavior: "smooth" });
  }

  // Send campaign parameters to ML Predictor
  function handleSimulateInML() {
    if (!generatedCampaign) return;

    let mappedAudience = "Professionals";
    const audLower = (generatedCampaign.target_audience || "").toLowerCase();
    if (audLower.includes("student") || audLower.includes("young") || audLower.includes("gen-z")) {
      mappedAudience = "Young Adults";
    } else if (audLower.includes("business") || audLower.includes("owner") || audLower.includes("startup")) {
      mappedAudience = "Small Businesses";
    }

    let mappedType = "Software";
    const typeLower = (generatedCampaign.business_type || "").toLowerCase();
    if (typeLower.includes("commerce") || typeLower.includes("fashion") || typeLower.includes("clothing")) {
      mappedType = "E-commerce";
    } else if (typeLower.includes("education")) {
      mappedType = "Education";
    } else if (typeLower.includes("restaurant") || typeLower.includes("real estate") || typeLower.includes("health")) {
      mappedType = "Local Business";
    }

    let mappedGoal = "Sales";
    const goalLower = (generatedCampaign.campaign_goal || "").toLowerCase();
    if (goalLower.includes("lead")) {
      mappedGoal = "Lead Generation";
    } else if (goalLower.includes("awareness")) {
      mappedGoal = "Brand Awareness";
    }

    setPredictorParams({
      budget: Number(generatedCampaign.budget) || 15000,
      duration_days: Number(generatedCampaign.duration_days) || 14,
      channel: "Google Ads",
      audience: mappedAudience,
      business_type: mappedType,
      goal: mappedGoal
    });

    setActiveTab("predictor");
    showToast("Parameters transferred to ML Performance Predictor!", "info");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app-shell">
      {/* Background ambient lighting */}
      <div className="ambient-glow-mesh" />

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendStatus={backendStatus}
        checkBackendHealth={checkBackendHealth}
        savedCount={campaigns.length}
      />

      <main className="main-content">
        <div className="container">
          {/* Active View 1: Campaign Studio */}
          {activeTab === "studio" && (
            <div className="studio-view animate-fade-in">
              <Hero onSelectPreset={handleSelectPreset} />

              <div className="studio-grid-layout" id="workspace">
                <CampaignForm
                  form={form}
                  setForm={setForm}
                  onGenerate={handleGenerate}
                  onLoadSample={handleLoadSample}
                  loading={loading}
                  backendOnline={backendStatus.online}
                />

                <CampaignResultViewer
                  result={result}
                  campaign={generatedCampaign}
                  loading={loading}
                  error={error}
                  notice={notice}
                  saving={saving}
                  onSave={handleSave}
                  onSimulateML={handleSimulateInML}
                  onShowToast={showToast}
                />
              </div>
            </div>
          )}

          {/* Active View 2: ML Performance Predictor */}
          {activeTab === "predictor" && (
            <PerformancePredictor
              initialParams={predictorParams}
              onShowToast={showToast}
            />
          )}

          {/* Active View 3: Saved Vault */}
          {activeTab === "saved" && (
            <SavedCampaigns
              campaigns={campaigns}
              onLoadCampaign={handleLoadSavedCampaign}
              onRefresh={loadCampaigns}
              loading={loading}
              onShowToast={showToast}
            />
          )}
        </div>
      </main>

      {/* Floating Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Footer */}
      <footer className="app-footer">
        <div className="container footer-content">
          <div className="footer-brand">
            MarketMate AI · Autonomous Digital Marketing Suite
          </div>
          <div className="footer-tech-stack">
            <span>Powered by Gemini 3.5 Flash · Scikit-Learn ML · LangChain</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
