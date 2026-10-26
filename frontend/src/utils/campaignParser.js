// Utility to parse Gemini-generated campaign plans into structured data for visual components

export function parseCampaignResult(text = "", campaign = {}) {
  if (!text || typeof text !== "string") {
    return {
      raw: "",
      hasStructuredData: false,
      strategy: "",
      channels: [],
      googleAds: null,
      metaAds: null,
      budgetBreakdown: [],
      calendarDays: [],
      kpis: []
    };
  }

  const cleanText = text.replace(/\r\n/g, "\n");
  const lines = cleanText.split("\n");

  // Strategy extraction
  let strategy = "";
  const strategyMatch = cleanText.match(/(?:Campaign Strategy|Strategy|Executive Summary)[:\n]+([\s\S]*?)(?=(?:Recommended Channels|Google Ads|Meta Ads|Budget|Content Calendar|Performance Metrics|Suggested Metrics|\n##|\n###|\n\*\*Google|\n\*\*Meta))/i);
  if (strategyMatch) {
    strategy = strategyMatch[1].trim();
  } else {
    // Take the first 2-3 paragraphs as general strategy
    strategy = cleanText.split("\n\n").slice(0, 2).join("\n\n").trim();
  }

  // Google Ads extraction
  let googleAds = null;
  const googleMatch = cleanText.match(/(?:Google Ads|Google Ad Copy|Google Search Ad)[:\n]+([\s\S]*?)(?=(?:Meta Ads|Instagram Ads|Budget|Content Calendar|Performance Metrics|\n##|\n###|\n\*\*Meta))/i);
  if (googleMatch) {
    const block = googleMatch[1];
    const headlineMatch = block.match(/(?:Headline|Headlines|Titles?)[:\s]+([^\n]+)/i);
    const descMatch = block.match(/(?:Description|Descriptions?)[:\s]+([^\n]+)/i);
    const keywordsMatch = block.match(/(?:Keywords?|Targeting)[:\s]+([^\n]+)/i);

    googleAds = {
      headline: headlineMatch ? headlineMatch[1].replace(/^\*+/, "").replace(/\*+$/, "").trim() : `${campaign.business_name || "Premium Store"} | Special Offer`,
      description: descMatch ? descMatch[1].replace(/^\*+/, "").replace(/\*+$/, "").trim() : `Discover top quality solutions for ${campaign.target_audience || "you"}. Fast shipping & guaranteed satisfaction.`,
      url: `www.${(campaign.business_name || "marketmate").toLowerCase().replace(/[^a-z0-9]/g, "")}.com/${(campaign.campaign_goal || "offer").toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      keywords: keywordsMatch ? keywordsMatch[1].trim() : `${campaign.business_type || "Marketing"}, Online Deals, Best Value`,
      fullBlock: block.trim()
    };
  } else {
    // Sensible fallback based on campaign info
    googleAds = {
      headline: `${campaign.business_name || "Special Campaign"} — Up to 30% Off Today`,
      description: `Elevate your ${campaign.business_type || "experience"} with our tailored solutions. Designed for ${campaign.target_audience || "discerning customers"}.`,
      url: `www.${(campaign.business_name || "marketmate").toLowerCase().replace(/[^a-z0-9]/g, "")}.com/campaign`,
      keywords: `${campaign.business_type || "Marketing"}, Deals, Official Store`,
      fullBlock: ""
    };
  }

  // Meta Ads extraction
  let metaAds = null;
  const metaMatch = cleanText.match(/(?:Meta Ads|Meta Ad Copy|Facebook & Instagram Ads?|Instagram Ads?)[:\n]+([\s\S]*?)(?=(?:Google Ads|Budget|Content Calendar|Performance Metrics|\n##|\n###|\n\*\*Budget|\n\*\*Content))/i);
  if (metaMatch) {
    const block = metaMatch[1];
    const primaryMatch = block.match(/(?:Primary Text|Caption|Body|Ad Copy)[:\s]+([^\n]+(?:\n[^\n]+)?)/i);
    const headlineMatch = block.match(/(?:Headline|Title)[:\s]+([^\n]+)/i);
    const ctaMatch = block.match(/(?:Call to Action|CTA)[:\s]+([^\n]+)/i);

    metaAds = {
      primaryText: primaryMatch ? primaryMatch[1].replace(/^\*+/, "").replace(/\*+$/, "").trim() : `Ready to achieve your goal? Check out how ${campaign.business_name || "our brand"} helps ${campaign.target_audience || "customers"} succeed.`,
      headline: headlineMatch ? headlineMatch[1].replace(/^\*+/, "").replace(/\*+$/, "").trim() : `${campaign.business_name || "Exclusive Collection"} — Limited Time Only`,
      cta: ctaMatch ? ctaMatch[1].replace(/^\*+/, "").replace(/\*+$/, "").trim() : "Shop Now",
      fullBlock: block.trim()
    };
  } else {
    metaAds = {
      primaryText: `Transform your journey with ${campaign.business_name || "us"}. Crafted specifically for ${campaign.target_audience || "our community"} looking to ${campaign.campaign_goal || "excel"}.`,
      headline: `Experience the Difference — ${campaign.business_name || "MarketMate"}`,
      cta: "Learn More",
      fullBlock: ""
    };
  }

  // Budget Breakdown extraction
  const budgetBreakdown = [];
  const budgetTotal = Number(campaign.budget || 20000);
  const budgetMatch = cleanText.match(/(?:Budget Allocation|Budget Distribution|Budget Breakdown)[:\n]+([\s\S]*?)(?=(?:Content Calendar|Performance Metrics|Suggested Metrics|\n##|\n###))/i);
  
  if (budgetMatch) {
    const bLines = budgetMatch[1].split("\n");
    for (const line of bLines) {
      const itemMatch = line.match(/[-*•]\s*([^:\d]+)[:\s]+(?:₹|INR)?\s*([\d,]+(?:\.\d+)?|\d+%\s*-\s*₹?[\d,]+|\d+%)/i);
      if (itemMatch) {
        const channelName = itemMatch[1].replace(/^\*+/, "").replace(/\*+$/, "").trim();
        const rawVal = itemMatch[2].trim();
        budgetBreakdown.push({
          name: channelName,
          value: rawVal
        });
      }
    }
  }

  if (budgetBreakdown.length === 0) {
    budgetBreakdown.push(
      { name: "Google Search & Shopping Ads", value: `₹${Math.round(budgetTotal * 0.45).toLocaleString("en-IN")} (45%)`, pct: 45 },
      { name: "Meta (Instagram & Facebook) Ads", value: `₹${Math.round(budgetTotal * 0.35).toLocaleString("en-IN")} (35%)`, pct: 35 },
      { name: "Retargeting & Creative Production", value: `₹${Math.round(budgetTotal * 0.20).toLocaleString("en-IN")} (20%)`, pct: 20 }
    );
  }

  // Content Calendar extraction
  const calendarDays = [];
  const calendarRegex = /(?:Day\s*(\d+)|\*\*Day\s*(\d+)\*\*)[:\s]+([^\n]+(?:\n(?!(?:Day\s*\d+|\*\*Day|\n##|\n###))[-*•\s\w:,'"-]+)?)/gi;
  let match;
  while ((match = calendarRegex.exec(cleanText)) !== null) {
    const dayNum = match[1] || match[2];
    const details = match[3].trim().replace(/^\*+/, "").replace(/\*+$/, "");
    calendarDays.push({
      day: Number(dayNum),
      content: details
    });
    if (calendarDays.length >= 14) break; // cap to 14 for clean display
  }

  // If no calendar days extracted via regex, generate smart structured timeline
  if (calendarDays.length === 0) {
    const days = Math.min(Number(campaign.duration_days || 7), 7);
    const themes = [
      { format: "Reel / Short Video", theme: "Brand Hook & Problem Statement", copy: "Introduce the core frustration your audience experiences and reveal your solution." },
      { format: "Carousel Post", theme: "Feature Spotlight & Key Benefits", copy: "Swipe to see the top 3 reasons why customers love our approach." },
      { format: "Story with Poll", theme: "Audience Engagement & Social Proof", copy: "Share real customer review + interactive poll sticker to drive engagement." },
      { format: "Static Ad Graphic", theme: "Limited Time Urgency & Offer", copy: "Direct response graphic announcing special pricing or promotional bonus." },
      { format: "Behind the Scenes", theme: "Authenticity & Quality Showcase", copy: "Take viewers behind the scenes of how your products or services are prepared." },
      { format: "Educational Infographic", theme: "Value First & Expert Tips", copy: "Provide practical actionable advice for your niche to build organic authority." },
      { format: "Countdown / Final Push", theme: "Last Call & Retargeting Push", copy: "Final reminder reel before special campaign window concludes." }
    ];

    for (let i = 1; i <= days; i++) {
      const t = themes[(i - 1) % themes.length];
      calendarDays.push({
        day: i,
        format: t.format,
        theme: t.theme,
        content: t.copy
      });
    }
  }

  // KPIs
  const kpis = [
    { label: "Target Click-Through Rate", value: "3.2% - 4.8%", badge: "CTR" },
    { label: "Estimated Cost Per Click", value: "₹4.50 - ₹12.00", badge: "CPC" },
    { label: "Target Return on Ad Spend", value: "2.8x - 4.2x", badge: "ROAS" },
    { label: "Target Conversion Rate", value: "3.5% - 6.0%", badge: "CR" }
  ];

  return {
    raw: text,
    hasStructuredData: true,
    strategy,
    googleAds,
    metaAds,
    budgetBreakdown,
    calendarDays,
    kpis
  };
}
