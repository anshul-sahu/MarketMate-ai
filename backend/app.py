from flask import Flask,request,jsonify
from flask_cors import CORS

from agent import generate_campaign
from database import init_db,save_campaign, get_campaigns

from ml.predictor import predict_campaign

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173", "*"]}})

init_db()

@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "message": "MarketMate AI backend is running"
    })

@app.post("/api/generate")
def generate():
    data = request.get_json(silent=True) or {}

    required_fields = [
         "business_name",
        "business_type",
        "target_audience",
        "budget",
        "duration_days",
        "campaign_goal"
    ]

    missing = [
        field for field in required_fields if data.get(field) is None or str(data.get(field)).strip() == ""
    ]

    if missing:
        return jsonify({
            "error": "Please provide all required fields.",
            "missing_fields": missing
        }),400

    try:
        budget = float(data["budget"])
        duration_days = int(data["duration_days"])

        if budget <= 0:
            return jsonify({"error":"budget must be greater than zero."}),400

        if duration_days < 1 or duration_days > 30:
            return jsonify({"error":"Duration must be between 1 and 30 days."}),400

        result = generate_campaign(
            business_name=str(data["business_name"]).strip(),
            business_type=str(data["business_type"]).strip(),
            target_audience=str(data["target_audience"]).strip(),
            budget=budget,
            duration_days=duration_days,
            campaign_goal=str(data["campaign_goal"]).strip()
        )

        return jsonify({
            "result" : result,
            "campaign": {
                "business_name": str(data["business_name"]).strip(),
                "business_type": str(data["business_type"]).strip(),
                "target_audience": str(data["target_audience"]).strip(),
                "budget": budget,
                "duration_days": duration_days,
                "campaign_goal": str(data["campaign_goal"]).strip()
            }
        })

    except ValueError:
        return jsonify({
            "error":"Budget and duration must be valid numbers."
        }),400

    except Exception as error:
        app.logger.exception("Campaign generation failed")
        return jsonify({
            "error": (
                "Could not generate the campaign. "
                "Check the Gemini API key, model availability, "
                "network connection, and API quota."
            )
        }), 502

@app.post("/api/campaigns")
def create_campaign():
    data = request.get_json(silent=True) or {}

    required_fields = [
        "business_name",
        "business_type",
        "target_audience",
        "budget",
        "duration_days",
        "campaign_goal",
        "result"
    ]

    if any(
        data.get(field) is None or str(data.get(field)).strip() == ""
        for field in required_fields
    ):
        return jsonify({
            "error": "Campaign details and generated result are required."
        }), 400

    try:
        budget = float(data["budget"])
        duration_days = int(data["duration_days"])

        if budget <= 0 or not 1 <= duration_days <= 30:
            return jsonify({"error": "Invalid budget or duration."}), 400

        campaign = {
            "business_name": str(data["business_name"]).strip(),
            "business_type": str(data["business_type"]).strip(),
            "target_audience": str(data["target_audience"]).strip(),
            "budget": budget,
            "duration_days": duration_days,
            "campaign_goal": str(data["campaign_goal"]).strip(),
            "result": str(data["result"])
        }

        campaign_id = save_campaign(campaign)

        return jsonify({
            "message": "Campaign saved successfully.",
            "id": campaign_id
        }), 201

    except (ValueError, TypeError):
        return jsonify({"error": "Invalid budget or duration."}), 400


@app.get("/api/campaigns")
def list_campaigns():
    return jsonify(get_campaigns())


@app.route("/api/predict-performance", methods=["POST"])
def predict_performance():
    data = request.get_json(silent=True) or {}

    required_fields = [
        "budget",
        "duration_days",
        "channel",
        "audience",
        "business_type",
        "goal",
    ]

    missing = [
        field for field in required_fields
        if field not in data or data[field] in (None, "")
    ]

    if missing:
        return jsonify({
            "error": "Missing required fields",
            "fields": missing,
        }), 400

    try:
        budget = float(data["budget"])
        duration_days = int(data["duration_days"])

        if not 100 <= budget <= 10000000:
            return jsonify({
                "error": "Budget must be between 100 and 10000000."
            }), 400

        if not 1 <= duration_days <= 365:
            return jsonify({
                "error": "Duration must be between 1 and 365 days."
            }), 400

        valid_values = {
            "channel": [
                "Google Ads",
                "Meta Ads",
                "LinkedIn Ads",
            ],
            "audience": [
                "Young Adults",
                "Professionals",
                "Small Businesses",
            ],
            "business_type": [
                "E-commerce",
                "Education",
                "Software",
                "Local Business",
            ],
            "goal": [
                "Brand Awareness",
                "Lead Generation",
                "Sales",
            ],
        }

        for field, allowed in valid_values.items():
            if data[field] not in allowed:
                return jsonify({
                    "error": f"Invalid value for {field}",
                    "allowed_values": allowed,
                }), 400

        result = predict_campaign(
            budget=budget,
            duration_days=duration_days,
            channel=data["channel"],
            audience=data["audience"],
            business_type=data["business_type"],
            goal=data["goal"],
        )

        return jsonify(result), 200

    except (ValueError, TypeError):
        return jsonify({
            "error": "Budget and duration must be valid numbers."
        }), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)
