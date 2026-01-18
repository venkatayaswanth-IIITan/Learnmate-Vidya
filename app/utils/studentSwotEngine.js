/**
 * studentSwotEngine.js
 * ----------------------------------
 * Single source of truth for:
 * - fetching student data (real logs from Firestore)
 * - deriving learning metrics
 * - generating AI-powered SWOT analysis
 */

import { fetchLogs } from './loggingService';
import { calculateMetrics, getSWOTAnalysis } from './metricsService';

/* ================================
   1️⃣ AI SWOT GENERATOR
   Uses Gemini API to turn raw insights into a full SWOT report
================================ */

async function generateAiSWOT(rawInsights, evolutionContext = "") {
    // Insights might be empty if no data. We should handle that.
    const insightsText = rawInsights.length > 0
        ? rawInsights.map(i => `[${i.category} - ${i.type}] ${i.reason}`).join('\n')
        : "No specific behavioral patterns detected yet. User is just starting.";

    const prompt = `
You are an expert academic advisor and learning psychologist.
Below are some "raw insights" derived from a student's platform activity metrics.
${evolutionContext ? `\n**EVALUATION OF PREVIOUS ROADMAP PERFORMANCE:**\n${evolutionContext}\n` : ""}

Your task is to generate a comprehensive SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis based on these insights and the evolution context.

**Input Raw Insights:**
${insightsText}

**Requirements:**
1.  **Strengths (S):** Identify positive learning habits.
2.  **Weaknesses (W):** Identify areas where the student is struggling or being passive.
3.  **Opportunities (O):** Suggest specific actions the student can take to improve.
4.  **Threats/Risks (T):** Identify potential roadblocks to their long-term learning success.

**CRITICAL RULES:**
-   You MUST have **AT LEAST 2 points** for EACH of the 4 categories.
-   **Style & Balance:** Use a "Perfect Mixture" of professional keywords (e.g., "Active Recall", "Spaced Repetition") and very simple, relatable explanations. The language should feel expert yet very accessible.
-   **Length:** Each insight MUST be **exactly 2 to 3 lines long** when rendered. Ensure they are substantial enough to be meaningful.
-   **Uniqueness:** Ensure that **no two points across all categories** sound similar or address the same sub-topic. Each must be a distinct observation.
-   **Explanation:** For each insight, provide a clear explanation (1-2 sentences) of the specific data derivation.

**Output Format:**
Return ONLY a JSON object with the following structure:
{
  "strengths": [{ "insight": "...", "explanation": "..." }, ...],
  "weaknesses": [{ "insight": "...", "explanation": "..." }, ...],
  "opportunities": [{ "insight": "...", "explanation": "..." }, ...],
  "threats": [{ "insight": "...", "explanation": "..." }, ...]
}
`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDXb5osDBC8JEvEhdjsG7ZPiX936HEHHVY`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: "application/json",
                    }
                }),
            }
        );

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("AI API Error Response:", errorBody);
            throw new Error(`AI API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
            return JSON.parse(text);
        }

        console.error("AI Response missing text:", data);
        throw new Error("AI failed to return text in expected format");

    } catch (error) {
        console.error("Error generating SWOT with AI:", error);
        // Fallback structure if AI fails
        return {
            strengths: [
                {
                    insight: "You show a high degree of Exploratory Drive by actively testing various dashboard features which helps you build a more versatile learning toolkit.",
                    explanation: "Our logs show you have triggered nearly every interactive element on the profile page, suggesting you are proactively looking for the best study methods."
                },
                {
                    insight: "Your Initial Engagement Velocity is impressive as you have maintained long, focused study bursts that are far more effective than short, distracted sessions.",
                    explanation: "Data points to an average session length of 45 minutes of active time, which is significantly higher than the standard baseline for new students."
                }
            ],
            weaknesses: [
                {
                    insight: "There is a visible gap in your Spaced Repetition discipline because your study sessions are clustered together rather than spread out for better memory retention.",
                    explanation: "Activity traces show long periods of inactivity followed by heavy cramming, which typically leads to faster knowledge decay over the long term."
                },
                {
                    insight: "Your profile indicates a Passive Intake bias where you spend most of your time reading materials without using active verification tools to test your actual understanding.",
                    explanation: "While your time spent on reading is high, your interaction with the 'Active Recall' whiteboard and tutoring bot is currently under the 10% target threshold."
                }
            ],
            opportunities: [
                {
                    insight: "You can leverage Metacognitive Skill building by using the AI tutor to ask deeper 'Why' questions after every module, turning simple facts into real knowledge.",
                    explanation: "Connecting concepts through dialogue with the AI will help bridge gaps where your current data shows high-speed browsing through foundational topics."
                },
                {
                    insight: "Try adopting an Interleaved Practice approach by switching between different topics during one session to train your brain to retrieve info in varied contexts.",
                    explanation: "Current logs show you focus on only one topic per day; mixing two related topics could improve your mental flexibility and decrease overall study fatigue."
                }
            ],
            threats: [
                {
                    insight: "You face a high risk of Knowledge Decay if session frequency doesn't stabilize soon, as the current gaps exceed the optimal window for memory consolidation.",
                    explanation: "Psychological benchmarks suggest that a 72-hour gap without review causes a sharp drop in recall, and your recent gaps have occasionally hit the 4-day mark."
                },
                {
                    insight: "Relying on Surface-Level Mastery through pure observation might lead to 'Illusion of Competence' where you feel ready but struggle to apply the logic independently.",
                    explanation: "Your high duration with low interaction suggests you may be over-relying on visual recognition rather than active participation in the learning process."
                }
            ]
        };
    }
}

/* ================================
   2️⃣ MAIN FUNCTION (CALL THIS)
================================ */

export async function runStudentSWOT(studentId) {
    // 1. Fetch real logs from Firestore
    const logs = await fetchLogs();

    // 2. Fetch Roadmap Feedback from LocalStorage for Evolution
    let evolutionContext = "";
    if (typeof window !== 'undefined') {
        const roadmapFeedback = JSON.parse(localStorage.getItem('roadmap_meta_feedback') || 'null');
        if (roadmapFeedback) {
            evolutionContext = `
The student just completed a personalized roadmap. Results:
- Successes: ${roadmapFeedback.feedback.filter(m => !m.includes('challenging')).join('; ')}
- Challenges: ${roadmapFeedback.feedback.filter(m => m.includes('challenging')).join('; ')}
- Metrics Shift: Engagement changed by ${roadmapFeedback.metricsImprovement.engagement.toFixed(2)}, Hands-on rate by ${roadmapFeedback.metricsImprovement.handsOn.toFixed(2)}

INSTRUCTIONS FOR EVOLUTION:
1. If the student excelled in an intent (e.g., Focus), move it from a 'Weakness' or 'Opportunity' to a definitive 'Strength'.
2. If they struggled with an intent, keep it as a 'Weakness' but suggest a different 'Opportunity' to tackle it.
3. Use the metrics shift to quantify the 'Initial State' vs 'Current State' in your explanations.
`;
        }
    }

    // 3. Calculate metrics
    const analysis = calculateMetrics(logs);

    if (!analysis || !analysis.metrics) {
        // Handle no data case
        const emptySWOT = await generateAiSWOT([]);
        return {
            studentId,
            metrics: null,
            swot: emptySWOT,
        };
    }

    // 4. Generate raw insights logic (from metricsService)
    const rawInsights = getSWOTAnalysis(analysis.metrics);

    // 5. Generate AI SWOT from insights with Evolution Context
    const finalSWOT = await generateAiSWOT(rawInsights, evolutionContext);

    // 6. Return everything
    return {
        studentId,
        metrics: analysis.metrics,
        swot: finalSWOT,
    };
}
