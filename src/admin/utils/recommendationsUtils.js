// src/admin/utils/recommendationsUtils.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Fallback recommendations when Gemini is unavailable
const getFallbackRecommendations = (dashboardData) => {
  const { lowProducts, avgRating, ratingsDistribution, topProducts, totalFeedback } = dashboardData;
  const recommendations = [];

  // Calculate percentages
  const fiveStarPercent = ((ratingsDistribution[5] || 0) / totalFeedback * 100).toFixed(1);
  const oneStarPercent = ((ratingsDistribution[1] || 0) / totalFeedback * 100).toFixed(1);

  // Recommendation 1: Overall Performance
  if (avgRating >= 4.5) {
    recommendations.push({
      type: "success",
      icon: "🌟",
      title: "Excellent Customer Satisfaction",
      message: `Your coffee shop maintains an outstanding ${avgRating}/5 rating with ${totalFeedback} reviews. ${fiveStarPercent}% of customers gave 5-star ratings, indicating strong customer loyalty and product quality.`,
      action: "Continue maintaining quality standards. Consider launching a customer referral program to leverage positive sentiment and expand your customer base."
    });
  } else if (avgRating >= 3.5) {
    recommendations.push({
      type: "warning",
      icon: "⚠️",
      title: "Customer Experience Improvement Needed",
      message: `Current rating of ${avgRating}/5 suggests room for improvement. Only ${fiveStarPercent}% of reviews are 5-star, while ${oneStarPercent}% are 1-star. This indicates inconsistent customer experiences.`,
      action: "Conduct customer feedback analysis to identify pain points. Focus on staff training and quality control to reduce negative reviews by 25% in the next quarter."
    });
  } else {
    recommendations.push({
      type: "critical",
      icon: "🚨",
      title: "Urgent: Customer Satisfaction Crisis",
      message: `Rating of ${avgRating}/5 is critically low. ${oneStarPercent}% of customers gave 1-star reviews, indicating serious service or product quality issues requiring immediate attention.`,
      action: "Implement emergency action plan: review all negative feedback, retrain staff, audit product quality, and personally reach out to dissatisfied customers within 48 hours."
    });
  }

  // Recommendation 2: Top Products
  if (topProducts && topProducts.length > 0) {
    const topProduct = topProducts[0];
    recommendations.push({
      type: "success",
      icon: "🏆",
      title: "Leverage Best-Selling Products",
      message: `"${topProduct.name}" is your star product with ${topProduct.averageRating}/5 rating and ${topProduct.reviewCount} reviews. This represents a proven customer favorite and revenue opportunity.`,
      action: "Feature this product prominently in marketing materials. Consider creating variations or combo deals. Ensure consistent availability and quality to maintain customer satisfaction."
    });
  }

  // Recommendation 3: Low Products
  if (lowProducts && lowProducts.length > 0) {
    const lowProduct = lowProducts[0];
    recommendations.push({
      type: "warning",
      icon: "📉",
      title: "Product Quality Concerns Identified",
      message: `"${lowProduct.name}" has the lowest rating at ${lowProduct.averageRating}/5 with ${lowProduct.reviewCount} reviews. This impacts overall brand perception and customer trust.`,
      action: "Review recipe and preparation process immediately. Gather specific customer feedback about this product. Consider reformulation, staff retraining, or removal from menu if issues persist."
    });
  }

  // Recommendation 4: Customer Engagement
  if (totalFeedback < 50) {
    recommendations.push({
      type: "info",
      icon: "💬",
      title: "Boost Customer Feedback Collection",
      message: `Only ${totalFeedback} reviews collected. More feedback provides better insights for decision-making and builds social proof for potential customers.`,
      action: "Implement feedback incentive program. Offer 5% discount on next purchase for leaving a review. Train staff to politely request reviews from satisfied customers."
    });
  } else if (totalFeedback > 100) {
    recommendations.push({
      type: "success",
      icon: "📊",
      title: "Strong Customer Engagement Achieved",
      message: `${totalFeedback} reviews demonstrate excellent customer engagement. This valuable data provides reliable insights for business decisions and attracts new customers.`,
      action: "Use this engagement for testimonial marketing. Feature top reviews on social media and website. Consider creating a loyalty program to maintain engagement momentum."
    });
  }

  // Recommendation 5: Rating Distribution Analysis
  const lowRatings = (ratingsDistribution[1] || 0) + (ratingsDistribution[2] || 0);
  if (lowRatings > totalFeedback * 0.15) {
    recommendations.push({
      type: "critical",
      icon: "🔍",
      title: "High Rate of Negative Reviews",
      message: `${lowRatings} reviews (${(lowRatings / totalFeedback * 100).toFixed(1)}%) are 2-star or below. This suggests systemic issues affecting customer satisfaction that require immediate investigation.`,
      action: "Analyze negative reviews for patterns. Address common complaints immediately. Implement quality control checkpoints and customer service recovery procedures."
    });
  }

  // Recommendation 6: Excellence Recognition
  if (avgRating >= 4.7 && totalFeedback > 50) {
    recommendations.push({
      type: "success",
      icon: "🎯",
      title: "Market Leader Performance",
      message: `Exceptional ${avgRating}/5 rating with ${totalFeedback}+ reviews positions you as a market leader. This competitive advantage drives customer acquisition and retention.`,
      action: "Capitalize on this success with premium positioning strategy. Consider slight price increases, expand product line, or open additional locations to scale your success."
    });
  }

  return recommendations.slice(0, 6); // Return max 6 recommendations
};

export const generateRecommendationsWithGemini = async (dashboardData) => {
  if (!dashboardData) return [];

  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not configured in .env file");
    return getFallbackRecommendations(dashboardData);
  }

  const { lowProducts, avgRating, ratingsDistribution, topProducts, totalFeedback } = dashboardData;

  // Retry configuration
  const maxRetries = 3;
  let retryDelay = 2000;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`🤖 Gemini API attempt ${attempt + 1}/${maxRetries}...`);

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Calculate key metrics for smarter analysis
      const totalReviews = Object.values(ratingsDistribution).reduce((a, b) => a + b, 0);
      const positiveRate = (((ratingsDistribution[5] || 0) + (ratingsDistribution[4] || 0)) / totalReviews * 100).toFixed(1);
      const negativeRate = (((ratingsDistribution[1] || 0) + (ratingsDistribution[2] || 0)) / totalReviews * 100).toFixed(1);
      const neutralRate = ((ratingsDistribution[3] || 0) / totalReviews * 100).toFixed(1);

      const prompt = `You are an expert coffee shop business consultant with 15+ years of experience in the Philippines food & beverage industry. Analyze this performance data and provide 4-6 strategic, actionable recommendations specifically for a local coffee shop.

📊 BUSINESS PERFORMANCE DATA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Rating: ${avgRating}/5.0 (based on ${totalFeedback} customer reviews)

Rating Breakdown:
  ⭐⭐⭐⭐⭐ (5-star): ${ratingsDistribution[5] || 0} reviews (${((ratingsDistribution[5] || 0) / totalReviews * 100).toFixed(1)}%)
  ⭐⭐⭐⭐ (4-star): ${ratingsDistribution[4] || 0} reviews (${((ratingsDistribution[4] || 0) / totalReviews * 100).toFixed(1)}%)
  ⭐⭐⭐ (3-star): ${ratingsDistribution[3] || 0} reviews (${((ratingsDistribution[3] || 0) / totalReviews * 100).toFixed(1)}%)
  ⭐⭐ (2-star): ${ratingsDistribution[2] || 0} reviews (${((ratingsDistribution[2] || 0) / totalReviews * 100).toFixed(1)}%)
  ⭐ (1-star): ${ratingsDistribution[1] || 0} reviews (${((ratingsDistribution[1] || 0) / totalReviews * 100).toFixed(1)}%)

Satisfaction Metrics:
  • Positive Reviews (4-5★): ${positiveRate}%
  • Neutral Reviews (3★): ${neutralRate}%
  • Negative Reviews (1-2★): ${negativeRate}%

🏆 TOP PERFORMING PRODUCTS:
${topProducts?.length > 0 
  ? topProducts.map((p, i) => `  ${i + 1}. "${p.name}" - ${p.averageRating}/5 (${p.reviewCount} reviews)`).join('\n') 
  : '  No sufficient data yet'}

📉 UNDERPERFORMING PRODUCTS:
${lowProducts?.length > 0 
  ? lowProducts.map((p, i) => `  ${i + 1}. "${p.name}" - ${p.averageRating}/5 (${p.reviewCount} reviews)`).join('\n')
  : '  All products performing well'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 YOUR TASK:
Provide 4-6 strategic recommendations that are:
1. DATA-DRIVEN: Reference specific numbers, products, and percentages
2. ACTIONABLE: Give clear steps that can be implemented immediately
3. LOCALIZED: Consider Philippine coffee shop context (pricing in ₱, local competition, Filipino customer preferences)
4. PRIORITIZED: Focus on highest-impact actions first

📋 RECOMMENDATION GUIDELINES:

**Type Classification:**
- "critical" → Use ONLY for: Overall rating <3.5, negative reviews >20%, serious quality issues
- "warning" → Use for: Rating 3.5-4.2, negative reviews 10-20%, product inconsistencies
- "success" → Use for: Rating >4.3, positive trends, strong performers to leverage
- "info" → Use for: Growth opportunities, optimization tips, market insights

**Quality Standards:**
- Title: 4-8 words, professional and specific (e.g., "Optimize Spanish Latte Recipe Quality")
- Message: 2-3 sentences (60-120 words). Include specific data points and explain WHY it matters
- Action: 1-2 concrete steps (40-80 words). Include WHAT to do, HOW to measure success
- Icon: Use relevant emoji that matches the recommendation type

**Content Focus Areas:**
✓ Menu optimization (promote winners, fix/remove losers)
✓ Customer experience improvements (service, ambiance, consistency)
✓ Pricing strategy (value perception, upselling opportunities)
✓ Marketing tactics (leverage high ratings, address concerns)
✓ Operational efficiency (staff training, quality control)
✓ Revenue growth opportunities (new products, customer retention)

**CRITICAL RULES:**
- Always mention specific product names from the data
- Include actual percentages and ratings in messages
- Make actions measurable (e.g., "increase to 80%", "within 2 weeks")
- Consider Philippine coffee shop context (₱ pricing, local tastes)
- Be professional but conversational
- No generic advice - everything must be data-specific

🔄 RESPONSE FORMAT (STRICT):
Return ONLY valid JSON. No markdown, no code blocks, no extra text.

{
  "recommendations": [
    {
      "type": "success",
      "icon": "🏆",
      "title": "Capitalize on Caramel Macchiato Success",
      "message": "Your Caramel Macchiato leads with 4.8/5 rating and 45 reviews, representing 30% of total positive feedback. This indicates strong product-market fit and customer preference for caramel-based drinks.",
      "action": "Create a 'Caramel Collection' featuring 2-3 variations (Salted Caramel, Iced Caramel). Train baristas on consistent preparation. Set monthly sales target of 150 units to capitalize on proven demand."
    }
  ]
}

NOW ANALYZE THE DATA AND GENERATE YOUR RECOMMENDATIONS:`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Clean up response
      let cleanText = responseText.trim();
      
      // Remove markdown code blocks if present
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Extract JSON
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Could not parse Gemini response - invalid JSON format");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate structure
      if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
        throw new Error("Invalid recommendations structure");
      }

      // Validate and format each recommendation
      const recommendations = parsed.recommendations.map((rec, index) => {
        // Ensure all required fields exist
        if (!rec.type || !rec.title || !rec.message || !rec.action) {
          console.warn(`⚠️ Recommendation ${index + 1} missing required fields, using fallback`);
          return null;
        }

        // Validate type
        const validTypes = ['critical', 'warning', 'success', 'info'];
        if (!validTypes.includes(rec.type)) {
          rec.type = 'info';
        }

        // Ensure reasonable length limits
        return {
          type: rec.type,
          icon: rec.icon || '💡',
          title: rec.title.length > 100 ? rec.title.substring(0, 97) + '...' : rec.title,
          message: rec.message.length > 500 ? rec.message.substring(0, 497) + '...' : rec.message,
          action: rec.action.length > 300 ? rec.action.substring(0, 297) + '...' : rec.action
        };
      }).filter(rec => rec !== null); // Remove any invalid recommendations

      // Ensure we have at least some recommendations
      if (recommendations.length === 0) {
        throw new Error("No valid recommendations generated");
      }

      console.log(`✅ Gemini API success! Generated ${recommendations.length} recommendations`);
      return recommendations.slice(0, 6); // Max 6 recommendations

    } catch (error) {
      console.error(`❌ Gemini API Error (attempt ${attempt + 1}):`, error.message);
      
      // Check if it's a retryable error
      const retryableErrors = ['503', 'overloaded', 'fetch', 'timeout', 'ECONNRESET', 'network'];
      const isRetryable = retryableErrors.some(errType => 
        error.message.toLowerCase().includes(errType.toLowerCase())
      );
      
      if (isRetryable && attempt < maxRetries - 1) {
        console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay *= 2; // Exponential backoff: 2s, 4s, 8s
        continue;
      }
      
      // Last attempt or non-retryable error
      if (attempt === maxRetries - 1) {
        console.log('🔄 All retries exhausted. Using fallback recommendations...');
        return getFallbackRecommendations(dashboardData);
      }
    }
  }

  // Fallback if loop completes without returning
  console.log('🔄 Using fallback recommendations...');
  return getFallbackRecommendations(dashboardData);
};