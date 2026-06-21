import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { patientName, symptomLogs, missedDoseCount, takenDoseCount } = await req.json();

    if ((!symptomLogs || symptomLogs.length === 0) && missedDoseCount === 0) {
      return NextResponse.json({
        insight: {
          riskLevel: "none",
          summary: "Not enough data yet to generate a meaningful health insight. Insights will appear once symptoms or missed doses are logged.",
          recommendation: "",
        },
      });
    }

    const prompt = `You are a clinical decision-support assistant. Based on this patient's recent data, identify any concerning patterns and give a brief, plain-language insight.
Patient: ${patientName}
Missed doses (recent period): ${missedDoseCount}
Doses taken on time: ${takenDoseCount}
Recent symptom logs: ${JSON.stringify(symptomLogs)}

Return ONLY valid JSON in this format (no markdown):
{"riskLevel": "none" | "low" | "moderate" | "high", "summary": "1-2 sentence plain-language summary of the pattern observed", "recommendation": "1 short actionable recommendation, e.g. consider scheduling a doctor visit, or empty string if riskLevel is none"}`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("GEMINI INSIGHT ERROR:", JSON.stringify(data));
      return NextResponse.json({ error: "Insight generation failed" }, { status: 500 });
    }

    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleaned = textOutput.replace(/```json|```/g, "").trim();
    const insight = JSON.parse(cleaned);

    return NextResponse.json({ insight });
  } catch (err) {
    console.error("Health insight error:", err);
    return NextResponse.json({ error: "Failed to generate insight" }, { status: 500 });
  }
}
