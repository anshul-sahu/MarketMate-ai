import os

from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain_google_genai import ChatGoogleGenerativeAI

from tools import (
    calculate_budget,
    create_content_calendar,
    recommend_marketing_channels
)

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
model_name = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")

if not api_key:
    raise RuntimeError(
        "GEMINI_API_KEY is missing. Add it to backend/.env"
    )

model = ChatGoogleGenerativeAI(
    model=model_name,
    google_api_key=api_key,
    temperature=0.4
)

tools = [
    calculate_budget,
    create_content_calendar,
    recommend_marketing_channels
]

def _build_agent(target_model_name: str):
    m = ChatGoogleGenerativeAI(
        model=target_model_name,
        google_api_key=api_key,
        temperature=0.4
    )
    return create_agent(
        model=m,
        tools=tools,
        system_prompt=system_prompt
    )

system_prompt = """
    You are MarketMate AI, an experienced digital marketing assistant.

    Your job is to prepare practical marketing campaigns.

    Instructions:
    1. Understand the user's business and marketing objective.
    2. Use the budget tool when budget allocation is relevant.
    3. Use the channel recommendation tool to choose suitable channels.
    4. Use the content calendar tool when a calendar is requested.
    5. Never invent tool results or claim a tool was called if it was not.
    6. Clearly label estimates and recommendations.
    7. Do not guarantee sales, conversions, or advertising results.
    8. Present the response using clear headings and bullet points.

    Return a useful campaign plan containing:
    - Campaign strategy
    - Recommended channels
    - Google Ads copy
    - Meta Ads copy
    - Budget allocation when a budget is supplied
    - Content calendar when requested
    - Suggested performance metrics
"""

agent = _build_agent(model_name)

def generate_campaign(
        business_name: str,
        business_type: str,
        target_audience: str,
        budget: float,
        duration_days: int,
        campaign_goal: str
) -> str:

    request = f"""
        Create a marketing campaign using these details:

        Business name: {business_name}
        Business type: {business_type}
        Target audience: {target_audience}
        Budget in INR: {budget}
        Campaign duration in days: {duration_days}
        Campaign goal: {campaign_goal}

        Use the relevant tools to calculate and plan the campaign.
        Include sample Google Ads and Meta Ads copy.
        Provide a day-by-day content calendar for the requested duration.
    """

    try:
        response = agent.invoke({
            "messages": [
                {"role": "user", "content": request}
            ]
        })
    except Exception:
        # Fallback to gemini-3.5-flash-lite if primary model fails
        fallback_agent = _build_agent("gemini-3.5-flash-lite")
        response = fallback_agent.invoke({
            "messages": [
                {"role": "user", "content": request}
            ]
        })

    final_message = response["messages"][-1]
    content = final_message.content

    if isinstance(content, str):
        return content

    text_parts = [
        block["text"]
        for block in content
        if isinstance(block, dict) and "text" in block
    ]

    return "\n".join(text_parts) or str(content)