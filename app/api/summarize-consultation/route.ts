import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { transcript, patientId } = await req.json();
    if (!transcript || transcript.trim().length < 10) {
      return NextResponse.json({ error: "Transcript is too short or empty" }, { status: 400 });
    }

    const prompt = `You are reading a doctor's consultation audio transcript. Extract key medical details and return ONLY a valid JSON object (no markdown, no explanation), using the following schema format:
{
  "diagnosis": "Summarized medical diagnosis or condition discussed",
  "medicinesMentioned": ["Medicine name 1", "Medicine name 2"],
  "instructions": "Specific guidance given to the patient (e.g. dietary precautions, when to take meds)",
  "actionItems": ["Action item 1", "Action item 2"],
  "riskLevel": "Low / Medium / High",
  "followUpDate": "e.g. 2026-07-15, in 2 weeks, or N/A",
  "summary": "A clean, concise paragraph summarizing the appointment highlights for the caregiver"
}
Ensure all keys exist and are populated with correct defaults if not mentioned in the transcript.`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [
              { text: transcript },
              { text: prompt },
            ],
          }],
          generationConfig: { response_mime_type: "application/json" },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("GEMINI CONSULTATION API ERROR:", JSON.stringify(data));
      return NextResponse.json({ error: data?.error?.message || "AI consultation summarization failed" }, { status: 500 });
    }

    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textOutput) {
      console.error("GEMINI CONSULTATION: no text in response", JSON.stringify(data));
      return NextResponse.json({ error: "No text response from AI" }, { status: 500 });
    }

    const cleaned = textOutput.replace(/```json|```/g, "").trim();
    const parsedSummary = JSON.parse(cleaned);

    return NextResponse.json({
      diagnosis: parsedSummary.diagnosis ?? "N/A",
      medicinesMentioned: Array.isArray(parsedSummary.medicinesMentioned) ? parsedSummary.medicinesMentioned : [],
      instructions: parsedSummary.instructions ?? "N/A",
      actionItems: Array.isArray(parsedSummary.actionItems) ? parsedSummary.actionItems : [],
      riskLevel: parsedSummary.riskLevel ?? "Low",
      followUpDate: parsedSummary.followUpDate ?? "N/A",
      summary: parsedSummary.summary ?? "No summary provided.",
      originalTranscript: transcript,
      patientId: patientId || null
    });
  } catch (err: any) {
    console.error("Consultation summarization error:", err);
    return NextResponse.json({ error: "Failed to summarize doctor consultation" }, { status: 500 });
  }
}
