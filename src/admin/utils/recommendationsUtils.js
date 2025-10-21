import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const generateRecommendationsWithGemini = async (dashboardData) => {
  if (!dashboardData) return [];

  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not configured in .env file");
    return [];
  }

  const { lowProducts, avgRating, ratingsDistribution, topProducts, totalFeedback } = dashboardData;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a business analytics AI for a coffee shop. Analyze this dashboard data and provide 4-6 specific, actionable recommendations in JSON format.

Dashboard Data:
- Average Rating: ${avgRating}/5
- Total Feedback: ${totalFeedback} reviews
- Ratings Distribution: 1★: ${ratingsDistribution[1] || 0}, 2★: ${ratingsDistribution[2] || 0}, 3★: ${ratingsDistribution[3] || 0}, 4★: ${ratingsDistribution[4] || 0}, 5★: ${ratingsDistribution[5] || 0}
- Top Products: ${topProducts?.map(p => `"${p.name}" (${p.averageRating}/5, ${p.reviewCount} reviews)`).join(', ') || 'No data'}
- Low-Rated Products: ${lowProducts?.map(p => `"${p.name}" (${p.averageRating}/5, ${p.reviewCount} reviews)`).join(', ') || 'None'}

Return ONLY valid JSON (no markdown, no code blocks) with this structure:
{
  "recommendations": [
    {
      "type": "critical|warning|success|info",
      "icon": "emoji",
      "title": "Short title",
      "message": "Detailed explanation based on the data",
      "action": "Specific action to take"
    }
  ]
}

Be specific, use the actual product names and numbers from the data. Consider:
1. Quality control for low-rated items
2. Customer satisfaction patterns
3. Inventory and supply optimization
4. Marketing opportunities for top performers
5. Training and operational improvements
6. Customer feedback trends`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Could not parse Gemini response");
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.recommendations || [];

  } catch (error) {
    console.error("Gemini API Error:", error.message);
    return [];
  }
};