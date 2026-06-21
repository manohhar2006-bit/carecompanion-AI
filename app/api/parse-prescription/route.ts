import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json();
    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const prompt = `You are reading a doctor's prescription image. Extract every medicine mentioned and return ONLY a valid JSON array (no markdown, no explanation), format:
[{"name": "Medicine name", "dosage": "e.g. 5mg", "frequency": "e.g. Daily", "timeOfDay": ["morning"], "exactTime": "HH:MM", "duration": 30, "notes": "special instructions"}]
timeOfDay must only use: morning, afternoon, evening, night. If unclear, return [].`;

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
              { inline_data: { mime_type: mediaType || "image/jpeg", data: imageBase64 } },
              { text: prompt },
            ],
          }],
          generationConfig: { response_mime_type: "application/json" },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("GEMINI API ERROR:", JSON.stringify(data));
      return NextResponse.json({ error: data?.error?.message || "AI parsing failed" }, { status: 500 });
    }

    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textOutput) {
      console.error("GEMINI: no text in response", JSON.stringify(data));
      return NextResponse.json({ error: "No text response from AI" }, { status: 500 });
    }

    const cleaned = textOutput.replace(/```json|```/g, "").trim();
    const parsedMeds = JSON.parse(cleaned);
    const medsWithIds = parsedMeds.map((med: any, i: number) => {
      const exactTime = med.exactTime && med.exactTime !== "" ? med.exactTime : "00:00";
      return {
        id: `ext-med-${Date.now()}-${i}`,
        name: med.name ?? "",
        dosage: med.dosage ?? "",
        frequency: med.frequency ?? "",
        timeOfDay: Array.isArray(med.timeOfDay) ? med.timeOfDay : [],
        exactTime,
        duration: typeof med.duration === "number" ? med.duration : 0,
        notes: med.notes ?? "",
        reminderStatus: exactTime !== "00:00" ? "Scheduled" : "Needs Time",
        originalOcrData: {
          name: med.name ?? "",
          dosage: med.dosage ?? "",
          exactTime: med.exactTime ?? "",
          duration: typeof med.duration === "number" ? med.duration : 0,
          notes: med.notes ?? ""
        }
      };
    });

    return NextResponse.json({ meds: medsWithIds });
  } catch (err) {
    console.error("Prescription parsing error:", err);
    return NextResponse.json({ error: "Failed to process prescription" }, { status: 500 });
  }
}
