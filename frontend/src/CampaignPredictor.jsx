
import { useState } from "react";

export default function CampaignPredictor() {
  const [form, setForm] = useState({
    budget: 10000,
    duration_days: 14,
    channel: "Google Ads",
    audience: "Professionals",
    business_type: "Software",
    goal: "Lead Generation",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "budget" || name === "duration_days"
          ? value
          : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/predict-performance",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            budget: Number(form.budget),
            duration_days: Number(form.duration_days),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Prediction failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to connect to Flask.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4">
      <h2 className="mb-2">Campaign Performance Predictor</h2>
      <p className="text-secondary mb-4">
        Predict clicks, leads, conversions, and estimated cost per lead.
      </p>

      <form onSubmit={handleSubmit} className="card shadow-sm p-4 mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Budget (₹)</label>
            <input
              className="form-control"
              type="number"
              name="budget"
              min="100"
              max="10000000"
              value={form.budget}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Duration (days)</label>
            <input
              className="form-control"
              type="number"
              name="duration_days"
              min="1"
              max="365"
              value={form.duration_days}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Advertising Channel</label>
            <select
              className="form-select"
              name="channel"
              value={form.channel}
              onChange={handleChange}
            >
              <option>Google Ads</option>
              <option>Meta Ads</option>
              <option>LinkedIn Ads</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Target Audience</label>
            <select
              className="form-select"
              name="audience"
              value={form.audience}
              onChange={handleChange}
            >
              <option>Young Adults</option>
              <option>Professionals</option>
              <option>Small Businesses</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Business Type</label>
            <select
              className="form-select"
              name="business_type"
              value={form.business_type}
              onChange={handleChange}
            >
              <option>Software</option>
              <option>E-commerce</option>
              <option>Education</option>
              <option>Local Business</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Campaign Goal</label>
            <select
              className="form-select"
              name="goal"
              value={form.goal}
              onChange={handleChange}
            >
              <option>Lead Generation</option>
              <option>Brand Awareness</option>
              <option>Sales</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary mt-4"
          disabled={loading}
        >
          {loading ? "Predicting..." : "Predict Performance"}
        </button>
      </form>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {result && (
        <div className="card shadow-sm p-4">
          <h4 className="mb-4">Prediction Results</h4>

          <div className="row g-3">
            <div className="col-md-3 col-6">
              <div className="border rounded p-3 h-100">
                <p className="text-secondary mb-1">Expected Clicks</p>
                <h3>
                  {result.expected_clicks.toLocaleString()}
                </h3>
              </div>
            </div>

            <div className="col-md-3 col-6">
              <div className="border rounded p-3 h-100">
                <p className="text-secondary mb-1">Expected Leads</p>
                <h3>
                  {result.expected_leads.toLocaleString()}
                </h3>
              </div>
            </div>

            <div className="col-md-3 col-6">
              <div className="border rounded p-3 h-100">
                <p className="text-secondary mb-1">Conversions</p>
                <h3>
                  {result.expected_conversions.toLocaleString()}
                </h3>
              </div>
            </div>

            <div className="col-md-3 col-6">
              <div className="border rounded p-3 h-100">
                <p className="text-secondary mb-1">Cost Per Lead</p>
                <h3>
                  {result.estimated_cost_per_lead == null
                    ? "N/A"
                    : `₹${result.estimated_cost_per_lead.toLocaleString(
                        "en-IN"
                      )}`}
                </h3>
              </div>
            </div>
          </div>

          <div className="alert alert-warning mt-4 mb-0">
            <strong>Demo prediction:</strong> {result.data_note}
          </div>
        </div>
      )}
    </div>
  );
}
