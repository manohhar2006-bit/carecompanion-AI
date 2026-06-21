"use client";

import React, { useState, useEffect } from "react";
import { useAppState } from "@/context/AppContext";
import { 
  Mic, 
  MicOff, 
  Square, 
  Save, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  ArrowLeft, 
  CheckCircle, 
  Calendar, 
  Pill, 
  Stethoscope, 
  Loader2,
  Bookmark,
  Activity,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

export default function ConsultationPage() {
  const { activeProfile, addConsultationSummary } = useAppState();

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [recognition, setRecognition] = useState<any>(null);

  // Summarizer states
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      } else {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          // Append or set transcript
          if (finalTranscript !== "") {
            setTranscript((prev) => {
              const cleanedPrev = prev.trim();
              return cleanedPrev ? `${cleanedPrev} ${finalTranscript}` : finalTranscript;
            });
          }
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === "not-allowed") {
            setApiError("Microphone access blocked. Please enable microphone permissions in your browser settings.");
            setIsRecording(false);
          }
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        setRecognition(rec);
      }
    }
  }, []);

  if (!activeProfile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 animate-pulse shadow-sm">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800">No Patient Profile Loaded</h2>
          <p className="text-slate-800 text-sm leading-relaxed">
            Please select an existing patient profile or register a new one to use the consultation summarizer.
          </p>
        </div>
        <Link
          href="/patients"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 shadow-md transition-all"
        >
          Go to Patients Portal
        </Link>
      </div>
    );
  }

  // Toggle recording
  const handleToggleRecording = () => {
    if (!recognition) return;
    setApiError("");
    setSaveSuccess(false);

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setTranscript("");
      setAiSummary(null);
      setIsRecording(true);
      try {
        recognition.start();
      } catch (err) {
        console.error("Error starting speech recognition", err);
      }
    }
  };

  // Summarization API call
  const handleSummarize = async (textToSummarize: string) => {
    const text = textToSummarize || transcript;
    setApiError("");
    setSaveSuccess(false);

    if (!text || text.trim().length < 10) {
      setApiError("Transcript is too short. Please speak or enter at least 10 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/summarize-consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: text,
          patientId: activeProfile.id,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to process transcript");
      }

      setAiSummary(data);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "An error occurred while generating the summary. Please check your connection and API keys.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopAndSummarize = () => {
    if (recognition && isRecording) {
      recognition.stop();
      setIsRecording(false);
    }
    handleSummarize(transcript);
  };

  // Load demo transcript
  const handleLoadDemo = () => {
    setSaveSuccess(false);
    setApiError("");
    const demoTranscript = `Doctor: Good afternoon Mr. Ramesh, let's go over your recent health status.
Patient: Hello Doctor, I've had some mild headaches in the afternoons, and I felt a bit dizzy last Tuesday.
Doctor: I see. I checked your morning vitals; your blood pressure is 142/90, which is slightly hypertensive. To manage this better, we're going to adjust your medication. I want you to increase your daily Amlodipine BP tablet from 5mg to 10mg. You should continue to take it once daily in the morning, immediately after breakfast.
Patient: Okay, I will increase it to 10mg.
Doctor: In addition, we need to monitor this closely. Please check your blood pressure twice daily—once in the morning before taking Amlodipine, and once in the evening. Write down the numbers. Also, maintain a strict low-sodium diet and try to walk for 30 minutes every evening.
Patient: Got it. Any other medications?
Doctor: Keep taking your Metformin 500mg daily with lunch as usual, and Vitamin D3 at night. Let's schedule a clinical follow-up appointment in three weeks, on July 10, 2026, to check if the new Amlodipine dosage has stabilized your BP. If you feel any extreme dizziness, contact Anil, your caregiver, or come to the clinic immediately.
Patient: Sure doctor. Thank you.`;
    setTranscript(demoTranscript);
    handleSummarize(demoTranscript);
  };

  // Save to patient profile
  const handleSaveToProfile = () => {
    if (!aiSummary) return;

    addConsultationSummary({
      transcript: aiSummary.originalTranscript || transcript,
      summary: {
        diagnosis: aiSummary.diagnosis,
        medicinesMentioned: aiSummary.medicinesMentioned,
        instructions: aiSummary.instructions,
        actionItems: aiSummary.actionItems,
        riskLevel: aiSummary.riskLevel,
        followUpDate: aiSummary.followUpDate,
        summary: aiSummary.summary
      }
    });

    setSaveSuccess(true);
  };

  // Helper for risk badge colors
  const getRiskColor = (risk: string = "Low") => {
    const r = risk.toLowerCase();
    if (r.includes("high") || r.includes("severe")) {
      return "bg-rose-50 text-rose-800 border-rose-200";
    }
    if (r.includes("medium") || r.includes("moderate")) {
      return "bg-amber-50 text-amber-800 border-amber-200";
    }
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full space-y-6 animate-fade-in">
      
      {/* Back button & Patient Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
            Doctor Consultation Summarizer
          </h1>
          <p className="text-slate-800 text-xs font-bold uppercase tracking-wider">
            Patient File: <strong className="text-teal-700">{activeProfile.name}</strong> • Age {activeProfile.age} • Primary Caregiver: {activeProfile.caregiverName}
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleLoadDemo}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-xl transition-all shadow-2xs"
          >
            <Sparkles className="h-4 w-4 text-teal-605" />
            <span>Load Demo Consultation</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Speech Input & Raw Transcript (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-850 flex items-center gap-2">
                <Mic className="h-4.5 w-4.5 text-teal-700" />
                Live Audio & Voice Intake
              </h3>
              {isRecording && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-100 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Recording...
                </span>
              )}
            </div>

            {/* Recording Controls */}
            {isSupported ? (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleToggleRecording}
                  className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
                    isRecording 
                      ? "bg-slate-200 text-slate-850 border-slate-350 hover:bg-slate-250" 
                      : "bg-teal-600 text-white border-transparent hover:bg-teal-700 shadow-sm"
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-4 w-4 shrink-0" />
                      <span>Pause Speech</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 shrink-0" />
                      <span>Start Recording</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleStopAndSummarize}
                  disabled={isRecording === false && transcript.trim().length === 0}
                  className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border border-transparent disabled:opacity-40 disabled:pointer-events-none shadow-sm"
                >
                  <Square className="h-3.5 w-3.5 shrink-0" />
                  <span>Stop & Summarize</span>
                </button>
              </div>
            ) : (
              <div className="p-4 bg-amber-50/70 border border-amber-250 rounded-xl text-xs text-amber-900 flex gap-2.5">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold mb-0.5">Voice recording isn’t supported in this browser — try Chrome</h4>
                  <p className="leading-relaxed opacity-90">You can still type or paste the consultation text manually below to evaluate the AI summarizer.</p>
                </div>
              </div>
            )}

            {/* Transcript Textarea */}
            <div className="space-y-1.5">
              <label htmlFor="transcript-input" className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Consultation Transcript
              </label>
              <textarea
                id="transcript-input"
                rows={12}
                value={transcript}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  setSaveSuccess(false);
                }}
                placeholder="Microphone results will appear here as you speak. Or, you can type/paste doctor's consultation notes here..."
                className="w-full text-sm font-medium text-slate-850 border border-slate-300 rounded-xl p-3.5 bg-slate-50/30 focus:outline-hidden focus:border-teal-500 focus:bg-white transition-all resize-none"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-800 font-bold">
                <span>{transcript.trim().length} characters</span>
                <span>Requires min 10 chars</span>
              </div>
            </div>

            {/* Manual summarize button */}
            {!isRecording && (
              <button
                onClick={() => handleSummarize(transcript)}
                disabled={isLoading || transcript.trim().length < 10}
                className="w-full py-3 text-sm font-bold text-teal-950 bg-teal-100 hover:bg-teal-200 border border-teal-200 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin text-teal-800" />
                    <span>Analyzing Transcript...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4.5 w-4.5 text-teal-700" />
                    <span>Summarize Transcript</span>
                  </>
                )}
              </button>
            )}

            {apiError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold leading-relaxed">
                ⚠️ {apiError}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: AI summary result card (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {isLoading ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm animate-pulse">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-150 animate-spin">
                <Loader2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-850">AI Clinical Processor Active</h3>
                <p className="text-xs text-slate-800 max-w-xs mx-auto mt-1 leading-normal">
                  Gemini 2.5 Flash is extracting diagnoses, medications, safety directions, and caregiver action items...
                </p>
              </div>
            </div>
          ) : aiSummary ? (
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm space-y-6">
              
              {/* Card Header */}
              <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white p-5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/10 p-2.5">
                    <Stethoscope className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black leading-tight">AI Clinical Summary</h3>
                    <p className="text-[10px] text-teal-100 uppercase tracking-wider mt-0.5">CareCompanion Audit Sheet</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase border tracking-wider ${getRiskColor(aiSummary.riskLevel)}`}>
                    {aiSummary.riskLevel || "Low"} Risk
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 space-y-5">
                {saveSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-250 text-xs text-emerald-850 font-bold flex items-center gap-2 animate-bounce">
                    <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>Clinical consultation report successfully saved to {activeProfile.name}'s profile!</span>
                  </div>
                )}

                {/* Primary Diagnosis */}
                <div className="space-y-1">
                  <span className="block text-[10px] font-black text-slate-800 uppercase tracking-wider">Clinical Diagnosis</span>
                  <div className="text-sm font-bold text-slate-900 bg-slate-55 border border-slate-200 p-3 rounded-xl">
                    {aiSummary.diagnosis || "N/A"}
                  </div>
                </div>

                {/* Medicines Mentioned */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                    <Pill className="h-3.5 w-3.5 text-teal-700" />
                    Prescriptions & Medications Mentioned
                  </span>
                  {aiSummary.medicinesMentioned && aiSummary.medicinesMentioned.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {aiSummary.medicinesMentioned.map((med: string, idx: number) => (
                        <span key={idx} className="inline-flex items-center bg-teal-50/60 border border-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-lg">
                          💊 {med}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-800 italic">No specific medications detected in the transcript.</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Instructions */}
                  <div className="space-y-1 bg-slate-55 border border-slate-200 p-4.5 rounded-xl space-y-2">
                    <span className="block text-[10px] font-black text-slate-800 uppercase tracking-wider">Instructions & Guidelines</span>
                    <p className="text-xs text-slate-850 leading-relaxed whitespace-pre-line font-semibold">
                      {aiSummary.instructions || "No direct guidelines provided."}
                    </p>
                  </div>

                  {/* Action Items */}
                  <div className="space-y-2 bg-slate-55 border border-slate-200 p-4.5 rounded-xl">
                    <span className="block text-[10px] font-black text-slate-800 uppercase tracking-wider">Action Items</span>
                    {aiSummary.actionItems && aiSummary.actionItems.length > 0 ? (
                      <ul className="space-y-1.5">
                        {aiSummary.actionItems.map((item: string, idx: number) => (
                          <li key={idx} className="text-xs text-slate-850 flex items-start gap-1.5 font-semibold leading-relaxed">
                            <span className="text-teal-600 text-xs select-none shrink-0 mt-0.5">✔</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-800 italic">No direct action items identified.</p>
                    )}
                  </div>
                </div>

                {/* Follow up & Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div className="space-y-0.5">
                    <span className="block text-[10px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-750" />
                      Follow-Up Timeline
                    </span>
                    <strong className="text-xs text-slate-900 font-bold block bg-slate-55 px-3 py-2 rounded-lg border border-slate-200 mt-1">
                      📅 {aiSummary.followUpDate || "None"}
                    </strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-[10px] font-black text-slate-800 uppercase tracking-wider">Caregiver Summary</span>
                    <p className="text-xs text-slate-800 leading-relaxed font-semibold mt-1">
                      {aiSummary.summary || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Save button */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={handleSaveToProfile}
                    disabled={saveSuccess}
                    className="w-full sm:w-auto py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-sm hover:shadow-md"
                  >
                    <Save className="h-4.5 w-4.5 shrink-0" />
                    <span>Save to Patient Profile</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-slate-50 text-slate-800 flex items-center justify-center mx-auto border border-slate-200">
                <FileText className="h-6 w-6 text-slate-800" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-850">Awaiting Transcript Processing</h3>
                <p className="text-xs text-slate-800 max-w-xs mx-auto mt-1 leading-normal">
                  Transcribe a consultation or load the high-fidelity demo sample to generate an AI summary log.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleLoadDemo}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 text-xs font-bold rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-2xs transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                  <span>Use Demo Consultation</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
