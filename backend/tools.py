import json
from langchain_core.tools import tool

@tool
def calculate_budget(budget: float) -> str:
    """Calculate marketing budget allocation for social media, search advertisements, and content creation. Budget is in INR."""

    if budget <= 0:
        return "Error: Budget must be greater than zero."

    allocation = {
        "Social Media Ads": round(budget*0.40,2),
        "Search Ads": round(budget*0.35,2),
        "Content Creation": round(budget*0.25, 2),
        "Total Budget": round(budget, 2)
    }

    return json.dumps(allocation, ensure_ascii=False)

@tool
def create_content_calendar(
    duration_days: int,
    business_type: str,
    campaign_goal: str
) -> str:
    """Create a day-by-day marketing content calendar for a business. Use the campaign duration in days, business type, and campaign goal."""

    if duration_days < 1 or duration_days > 30:
        return "Error: Campaign duration must be between 1 and 30 days."

    content_types = [
        "Educational post",
        "Product or service highlight",
        "Customer problem and solution",
        "Behind the scene post",
        "Customer testimonial concept",
        "Promotional offer",
        "Frequently asked question"
    ]

    calendar = []

    for day in range(1, duration_days + 1):
        content_type = content_types[(day-1) % len(content_types)]

        calendar.append({
            "day": day,
            "content_type": content_type,
            "business": business_type,
            "goal": campaign_goal,
            "suggestion": (
                f"Create a {content_type.lower()} for "
                f"the {business_type} business."
            )
        })
    return json.dumps(calendar, ensure_ascii=False)

@tool
def recommend_marketing_channels(
    business_type: str,
    target_audience: str,
    campaign_goal: str
) -> str:
    """Recommend marketing channels based on the business, audience, and campaign objective."""

    goal = campaign_goal.lower()
    business = business_type.lower()

    channels = []

    if any(word in goal for word in ["sale","sales","purchase","lead"]):
        channels.append({
            "channel":"Google search ads",
            "reason": "Reach people actively searching for relevant products or services."
        })

    if any(word in goal for word in ["awareness", "brand", "reach"]):
        channels.append({
            "channel":"Instagram and facebook",
            "reason":"Build awareness through visual and engaging content."
        })

    if any(word in business for word in ["fashion","clothing","food","beauty"]):
        channels.append({
            "channel":"Instagram Reels",
            "reason": "Show producs through short, visual content."
        })

    if not channels:
        channels = [
             {
                "channel": "Instagram and Facebook",
                "reason": "Test audience engagement and creative variations."
            },
            {
                "channel": "Google Search Ads",
                "reason": "Test demand from people searching for the offering."
            }
        ]

    result = {
        "target_audience": target_audience,
        "campaign_goal": campaign_goal,
        "recommended_channels": channels,
        "note": "These are initial suggestions, not guaranteed performance predictions."
    }

    return json.dumps(result, ensure_ascii=False)