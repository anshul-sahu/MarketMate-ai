from pathlib import Path

import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "campaign_performance_model.joblib"

if not MODEL_PATH.exists():
    raise RuntimeError(
        "Trained model not found. Run this command first:\n"
        "python -m ml.train_regression"
    )

model = joblib.load(MODEL_PATH)

def predict_campaign(
        budget, duration_days, channel, audience, business_type, goal
):
    input_data = pd.DataFrame([{
        "budget": float(budget),
        "duration_days": int(duration_days),
        "channel": channel,
        "audience": audience,
        "business_type": business_type,
        "goal": goal,
    }])

    predictions = model.predict(input_data)[0]
    clicks = max(0, int(round(predictions[0])))
    leads = max(0, int(round(predictions[1])))
    conversions = max(0, int(round(predictions[2])))

    cost_per_lead = (
        round(float(budget) / leads, 2)
        if leads > 0
        else None
    )

    return {
        "expected_clicks": clicks,
        "expected_leads": leads,
        "expected_conversions": conversions,
        "estimated_cost_per_lead": cost_per_lead,
        "currency": "INR",
        "model_type": "RandomForestRegressor",
        "data_note": (
            "Demo estimates based on synthetic training data. "
            "Not validated real-world forecasts."
        ),
    }