"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState, generateUniqueId } from "@/context/AppContext";
import { 
  Upload, 
  FileText, 
  Sparkles, 
  Check, 
  AlertCircle, 
  ArrowRight,
  Info,
  RotateCcw,
  CheckCircle
} from "lucide-react";
import Link from "next/link";

interface ExtractedMed {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: string[];
  exactTime: string;
  duration: number;
  notes: string;
  reminderStatus?: string;
  originalOcrData?: {
    name?: string;
    dosage?: string;
    exactTime?: string;
    duration?: number;
    notes?: string;
  };
}

const mockParsedMeds: ExtractedMed[] = [
  {
    id: "ext-med-atorvastatin",
    name: "Atorvastatin (Cholesterol tablet)",
    dosage: "10mg",
    frequency: "Daily",
    timeOfDay: ["night"],
    exactTime: "21:00",
    duration: 30,
    notes: "Take before bedtime",
    reminderStatus: "Scheduled",
    originalOcrData: {
      name: "Atorvastatin (Cholesterol tablet)",
      dosage: "10mg",
      exactTime: "21:00",
      duration: 30,
      notes: "Take before bedtime"
    }
  },
  {
    id: "ext-med-levothyroxine",
    name: "Levothyroxine (Thyroid tablet)",
    dosage: "50mcg",
    frequency: "Daily",
    timeOfDay: ["morning"],
    exactTime: "07:00",
    duration: 90,
    notes: "Take on an empty stomach, 30 mins before breakfast",
    reminderStatus: "Scheduled",
    originalOcrData: {
      name: "Levothyroxine (Thyroid tablet)",
      dosage: "50mcg",
      exactTime: "07:00",
      duration: 90,
      notes: "Take on an empty stomach, 30 mins before breakfast"
    }
  },
  {
    id: "ext-med-augmentin",
    name: "Augmentin",
    dosage: "625mg",
    frequency: "Three times daily",
    timeOfDay: ["morning", "afternoon", "night"],
    exactTime: "00:00",
    duration: 5,
    notes: "after meals",
    reminderStatus: "Needs Time",
    originalOcrData: {
      name: "Augmentin",
      dosage: "625mg",
      exactTime: "00:00",
      duration: 5,
      notes: "after meals"
    }
  }
];

const formatTime12h = (time24: string) => {
  if (!time24 || time24 === "00:00") return "00:00";
  const [hourStr, minStr] = time24.split(":");
  const hour = parseInt(hourStr);
  if (isNaN(hour)) return "00:00";
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minStr} ${ampm}`;
};

export default function PrescriptionUploadPage() {
  const router = useRouter();
  const { activeProfile, addMedicines } = useAppState();

  if (!activeProfile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 animate-pulse shadow-sm">
          <Upload className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800">No Patient Profile Loaded</h2>
          <p className="text-slate-800 text-sm leading-relaxed">
            Please select an existing patient file or register a new one to scan prescription scripts.
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

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [extractedMeds, setExtractedMeds] = useState<ExtractedMed[]>(mockParsedMeds);
  const [selectedMeds, setSelectedMeds] = useState<number[]>([0, 1, 2]); // default select all
  const [isImported, setIsImported] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isEditingTime, setIsEditingTime] = useState<number | null>(null);

  const processingSteps = [
    "Analyzing image contours and layout...",
    "Scanning handwritten text lines (AI OCR)...",
    "Identifying FDA database medication matches...",
    "Extracting frequency and clinical dosage metadata...",
    "Structuring schedule slots...",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      triggerRealAnalysis(selectedFile);
    }
  };

  const triggerDemo = () => {
    setPreviewUrl("/demo_prescription.png");
    setFile(new File([""], "demo_prescription.png"));
    triggerMockAnalysis();
  };

  const triggerMockAnalysis = () => {
    setIsProcessing(true);
    setProcessStep(0);
    setIsDone(false);
    setScanError(null);

    const interval = setInterval(() => {
      setProcessStep((prev) => {
        if (prev >= processingSteps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setIsProcessing(false);
            setIsDone(true);
          }, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const triggerRealAnalysis = async (uploadedFile: File) => {
    setIsProcessing(true);
    setProcessStep(0);
    setIsDone(false);
    setScanError(null);

    const stepInterval = setInterval(() => {
      setProcessStep((prev) => (prev < processingSteps.length - 1 ? prev + 1 : prev));
    }, 900);

    try {
      const base64 = await fileToBase64(uploadedFile);
      const res = await fetch("/api/parse-prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType: uploadedFile.type || "image/jpeg" }),
      });
      
      const data = await res.json();
      clearInterval(stepInterval);

      if (!res.ok || data.error) {
        setScanError(data.error || `Server error (${res.status})`);
        setExtractedMeds(mockParsedMeds);
        setSelectedMeds(mockParsedMeds.map((_, i) => i));
      } else if (data.meds?.length > 0) {
        setExtractedMeds(data.meds);
        setSelectedMeds(data.meds.map((_: any, i: number) => i));
      } else {
        setScanError("No medications could be extracted");
        setExtractedMeds(mockParsedMeds);
        setSelectedMeds(mockParsedMeds.map((_, i) => i));
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setScanError(err.message || "Failed to contact parser API");
      setExtractedMeds(mockParsedMeds);
      setSelectedMeds(mockParsedMeds.map((_, i) => i));
    } finally {
      setTimeout(() => { setIsProcessing(false); setIsDone(true); }, 400);
    }
  };

  const handleToggleSelect = (index: number) => {
    setSelectedMeds((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleFieldChange = (index: number, field: keyof ExtractedMed, value: any) => {
    setExtractedMeds((prev) => {
      const updated = [...prev];
      const updatedMed = {
        ...updated[index],
        [field]: value,
      };
      if (field === "exactTime") {
        updatedMed.reminderStatus = value !== "00:00" ? "Scheduled" : "Needs Time";
      }
      updated[index] = updatedMed;
      return updated;
    });
  };

  const handleImport = () => {
    if (selectedMeds.length === 0) return;

    const medsToImport = selectedMeds.map((index) => {
      const med = extractedMeds[index];
      // Generate unique schedules with correct slot matching
      const reminderTimes = med.timeOfDay.map((slot) => ({
        id: generateUniqueId("rt"),
        timeSlot: slot as any,
        time: med.exactTime
      }));

      return {
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        timeOfDay: med.timeOfDay,
        exactTime: med.exactTime,
        reminderTimes, // Pass unique schedules explicitly
        duration: med.duration,
        startDate: new Date().toISOString().split("T")[0],
        notes: med.notes,
        originalOcrData: med.originalOcrData || {
          name: med.name,
          dosage: med.dosage,
          exactTime: med.exactTime,
          duration: med.duration,
          notes: med.notes
        }
      };
    });

    addMedicines(medsToImport);

    setIsImported(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setIsProcessing(false);
    setIsDone(false);
    setIsImported(false);
    setScanError(null);
    setExtractedMeds(mockParsedMeds);
    setSelectedMeds(mockParsedMeds.map((_, i) => i));
    setIsEditingTime(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-dark-text-primary tracking-tight">AI Prescription Scanner</h1>
          <p className="text-slate-700 dark:text-dark-text-secondary text-sm">Upload written prescription sheets to simulate automated schedule logs.</p>
        </div>
        <div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-white bg-white dark:bg-dark-bg-secondary border border-slate-250 dark:border-slate-700 px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Scanner</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-dark-bg-card rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-850 dark:text-dark-text-primary mb-4">Select Prescription File</h2>

            {!previewUrl ? (
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-750 rounded-xl p-8 text-center bg-slate-50 dark:bg-dark-bg-secondary hover:bg-slate-100/50 dark:hover:bg-dark-bg-elevated/40 hover:border-teal-500 transition-all duration-200 relative">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-650 dark:text-teal-400 flex items-center justify-center">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-dark-text-primary">Drag and drop file here</p>
                    <p className="text-xs text-slate-700 dark:text-dark-text-secondary mt-1">Supports PNG, JPG, or PDF (Max 10MB)</p>
                  </div>
                  <div className="relative flex justify-center py-2">
                    <span className="bg-slate-55 dark:bg-dark-bg-secondary px-2 text-xs font-bold text-slate-700 dark:text-dark-text-secondary">or</span>
                  </div>
                  <button
                    type="button"
                    onClick={triggerDemo}
                    className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/40 rounded-lg transition-all cursor-pointer"
                  >
                    Use Sample Medical Script
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-100 dark:bg-dark-bg-secondary relative min-h-[300px] flex items-center justify-center">
                  {file?.name === "demo_prescription.png" ? (
                    <div className="p-6 text-center space-y-4 max-w-xs">
                      <FileText className="h-16 w-16 text-teal-650 dark:text-teal-400 mx-auto opacity-75 animate-pulse" />
                      <div className="border-t border-slate-200 dark:border-slate-800 pt-3 text-left font-serif space-y-2">
                        <p className="text-xs font-bold text-teal-900 dark:text-teal-400 uppercase">Metro General Cardiology Clinic</p>
                        <p className="text-[10px] text-slate-700 dark:text-dark-text-secondary">Date: June 15, 2026 • Patient: Ramesh</p>
                        <p className="text-xs text-slate-800 dark:text-dark-text-primary mt-2 font-semibold">Rx:</p>
                        <p className="text-xs italic text-slate-750 dark:text-dark-text-secondary pl-2">1. Atorvastatin 10mg - QD tab hs #30</p>
                        <p className="text-xs italic text-slate-755 dark:text-dark-text-secondary pl-2">2. Levothyroxine 50mcg - QD tab qam ac #90</p>
                        <p className="text-[9px] text-slate-700 dark:text-dark-text-muted mt-4 text-right">Signed: Dr. Sarah Alcott, MD</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center space-y-2">
                      <FileText className="h-12 w-12 text-slate-800 dark:text-dark-text-secondary mx-auto" />
                      <p className="text-xs font-bold text-slate-800 dark:text-dark-text-primary">{file?.name}</p>
                      <p className="text-[10px] text-slate-750 dark:text-dark-text-secondary">{(file?.size ? file.size / 1024 : 0).toFixed(1)} KB</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 text-center py-2 px-4 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-dark-text-secondary bg-white dark:bg-dark-bg-secondary hover:bg-slate-50 dark:hover:bg-dark-bg-elevated rounded-lg transition-all cursor-pointer"
                  >
                    Clear File
                  </button>
                  <button
                    onClick={triggerMockAnalysis}
                    className="flex-1 text-center py-2 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-all cursor-pointer"
                  >
                    Re-Scan
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-teal-50 dark:bg-teal-950/15 border border-teal-150 dark:border-teal-900/40 rounded-xl p-4 flex gap-3 text-teal-900 dark:text-teal-300">
            <Info className="h-5 w-5 text-teal-600 dark:text-teal-450 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-slate-850 dark:text-dark-text-primary">Clinic OCR Guide</h4>
              <p className="leading-relaxed">
                The scanner simulates scanning doctor handwriting notation (e.g. <em>QD</em> daily, <em>hs</em> at bedtime, <em>ac</em> before food) 
                and translating them into scheduled medication logs.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-dark-bg-card rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            
            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between bg-slate-50 dark:bg-dark-bg-secondary">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-teal-650 dark:text-teal-400" />
                <h2 className="text-sm font-bold text-slate-800 dark:text-dark-text-primary">AI Extraction Status</h2>
              </div>
              <div>
                {!previewUrl && <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-dark-text-secondary px-2 py-0.5 rounded-full font-bold">Waiting for file</span>}
                {isProcessing && <span className="text-[10px] bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-400 px-2 py-0.5 rounded-full font-bold animate-pulse">Processing...</span>}
                {isDone && <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 border border-emerald-200 dark:border-emerald-900/40"><Check className="h-3 w-3" /> Ready</span>}
              </div>
            </div>

            <div className="p-6">
              
              {!previewUrl && !isProcessing && (
                <div className="text-center py-16 space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-dark-bg-secondary text-slate-800 dark:text-dark-text-secondary flex items-center justify-center">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-850 dark:text-dark-text-primary">No Document Uploaded</h3>
                    <p className="text-xs text-slate-700 dark:text-dark-text-secondary mt-1 max-w-xs mx-auto">
                      Upload a prescription or click "Use Sample Medical Script" to verify the AI parser.
                    </p>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="py-12 space-y-6">
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin"></div>
                  </div>
                  <div className="text-center space-y-1.5">
                    <h3 className="text-sm font-bold text-slate-850 dark:text-dark-text-primary">Extracting Medication Data</h3>
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold animate-pulse">{processingSteps[processStep]}</p>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-dark-bg-secondary rounded-full h-1.5 max-w-sm mx-auto overflow-hidden">
                    <div 
                       className="bg-teal-650 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${((processStep + 1) / processingSteps.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {isDone && (
                <div className="space-y-6">
                  {isImported && (
                    <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400 text-sm font-bold flex items-center gap-2 animate-pulse mb-4">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <span>Medicines imported! Returning to Dashboard...</span>
                    </div>
                  )}

                  {scanError && (
                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/40 text-amber-800 dark:text-amber-400 text-sm font-bold flex items-center gap-2 mb-4">
                      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                      <span>Real-time AI scanning failed: {scanError}. Displaying mock demo data as fallback.</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-amber-550 shrink-0" />
                    <span>Please verify the extracted values against the original prescription sheet for accuracy.</span>
                  </div>

                  <div className="space-y-4">
                    {extractedMeds.map((med, index) => {
                      const isSelected = selectedMeds.includes(index);
                      return (
                        <div 
                          key={med.id} 
                          className={`border rounded-xl p-5 transition-all relative ${
                            isSelected 
                              ? "border-teal-500 bg-teal-50/10 dark:bg-teal-950/10 shadow-xs" 
                              : "border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-dark-bg-secondary/40 opacity-80"
                          }`}
                        >
                          {/* Selection Checkbox */}
                          <div className="absolute top-4 right-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(index)}
                              className="h-4 w-4 rounded-sm border-slate-300 dark:border-slate-700 text-teal-600 focus:ring-teal-500 cursor-pointer"
                            />
                          </div>

                          <div className="space-y-4">
                            {/* Card Header with Badges */}
                            <div className="flex flex-wrap items-center gap-2 pr-8">
                              <span className="text-[10px] bg-teal-150 dark:bg-teal-950/40 text-teal-800 dark:text-teal-400 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                Extracted {index + 1}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                med.exactTime === "00:00"
                                  ? "bg-amber-50 dark:bg-amber-955/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40 animate-pulse"
                                  : "bg-emerald-50 dark:bg-emerald-955/10 text-emerald-700 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900/40"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${med.exactTime === "00:00" ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`}></span>
                                {med.exactTime === "00:00" ? "Needs Time" : "Scheduled"}
                              </span>
                            </div>

                            {/* Main Grid: Card details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                {/* Medicine Name Row */}
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-800 dark:text-dark-text-muted uppercase w-20 shrink-0">Medicine:</span>
                                  <input
                                    type="text"
                                    value={med.name ?? ""}
                                    onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                                    className="flex-1 text-sm font-semibold text-slate-800 dark:text-white border-b border-dashed border-slate-350 dark:border-slate-700 hover:border-teal-500 focus:border-teal-500 focus:outline-hidden py-0.5 bg-transparent transition-colors px-1 hover:bg-slate-55/50 dark:hover:bg-dark-bg-secondary rounded-xs"
                                    placeholder="e.g. Augmentin"
                                  />
                                </div>

                                {/* Dosage Row */}
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-800 dark:text-dark-text-muted uppercase w-20 shrink-0">Dosage:</span>
                                  <input
                                    type="text"
                                    value={med.dosage ?? ""}
                                    onChange={(e) => handleFieldChange(index, "dosage", e.target.value)}
                                    className="flex-1 text-sm text-slate-800 dark:text-white border-b border-dashed border-slate-350 dark:border-slate-700 hover:border-teal-500 focus:border-teal-500 focus:outline-hidden py-0.5 bg-transparent transition-colors px-1 hover:bg-slate-50/50 dark:hover:bg-dark-bg-secondary rounded-xs"
                                    placeholder="e.g. 625mg"
                                  />
                                </div>

                                {/* Duration Row */}
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-800 dark:text-dark-text-muted uppercase w-20 shrink-0">Duration:</span>
                                  <div className="flex items-center gap-2 flex-1">
                                    <input
                                      type="number"
                                      value={med.duration || ""}
                                      onChange={(e) => handleFieldChange(index, "duration", parseInt(e.target.value) || 0)}
                                      className="w-16 text-sm text-slate-800 dark:text-white border-b border-dashed border-slate-350 dark:border-slate-700 hover:border-teal-500 focus:border-teal-500 focus:outline-hidden py-0.5 bg-transparent transition-colors px-1 hover:bg-slate-50/50 dark:hover:bg-dark-bg-secondary rounded-xs"
                                      placeholder="e.g. 5"
                                    />
                                    <span className="text-xs text-slate-800 dark:text-dark-text-secondary font-semibold">
                                      {med.duration ? `for ${med.duration} days` : "days (missing duration)"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                {/* Time Row */}
                                <div className="flex items-start gap-2">
                                  <span className="text-xs font-bold text-slate-800 dark:text-dark-text-muted uppercase w-20 shrink-0 mt-1">Time:</span>
                                  <div className="flex flex-wrap items-center gap-2 flex-1">
                                    {isEditingTime === index ? (
                                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-dark-bg-secondary p-1 border border-slate-200 dark:border-slate-700 rounded-lg">
                                        <input
                                          type="time"
                                          value={med.exactTime || "00:00"}
                                          onChange={(e) => handleFieldChange(index, "exactTime", e.target.value)}
                                          className="text-xs font-semibold text-slate-800 dark:text-white bg-transparent border-0 focus:ring-0 focus:outline-hidden p-0.5"
                                        />
                                        <button
                                          onClick={() => setIsEditingTime(null)}
                                          className="text-[10px] font-bold text-teal-650 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/40 px-2 py-1 rounded-md border border-teal-200 dark:border-teal-900/40 transition-colors cursor-pointer"
                                        >
                                          Done
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <span className={`text-sm font-extrabold px-2.5 py-1 rounded-lg shadow-2xs border ${
                                          med.exactTime === "00:00"
                                            ? "bg-amber-50 text-amber-800 dark:bg-amber-955/15 dark:text-amber-400 border-amber-200 dark:border-amber-900/40"
                                            : "bg-teal-50 text-teal-800 dark:bg-teal-955/15 dark:text-teal-400 border-teal-200 dark:border-teal-900/40"
                                        }`}>
                                          {med.exactTime && med.exactTime !== "00:00" ? formatTime12h(med.exactTime) : "00:00"}
                                        </span>
                                        <button
                                          onClick={() => setIsEditingTime(index)}
                                          className="text-[10px] font-bold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 flex items-center gap-1 px-2 py-1 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/40 rounded-md border border-teal-150 dark:border-teal-900/40 transition-all active:scale-95 cursor-pointer"
                                        >
                                          {med.exactTime === "00:00" ? "Set Time" : "Edit Time"}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Instructions Row */}
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-800 dark:text-dark-text-muted uppercase w-20 shrink-0">Instructions:</span>
                                  <input
                                    type="text"
                                    value={med.notes ?? ""}
                                    onChange={(e) => handleFieldChange(index, "notes", e.target.value)}
                                    className="flex-1 text-xs text-slate-800 dark:text-white border-b border-dashed border-slate-350 dark:border-slate-700 hover:border-teal-500 focus:border-teal-500 focus:outline-hidden py-0.5 bg-transparent transition-colors px-1 hover:bg-slate-55/50 dark:hover:bg-dark-bg-secondary rounded-xs"
                                    placeholder="e.g. after meals"
                                  />
                                </div>
 
                                {/* Time Slot Row */}
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-800 dark:text-dark-text-muted uppercase w-20 shrink-0">Time Slot:</span>
                                  <div className="flex flex-wrap gap-1 flex-1">
                                    {["morning", "afternoon", "evening", "night"].map((slot) => {
                                      const active = med.timeOfDay.includes(slot);
                                      return (
                                        <button
                                          key={slot}
                                          type="button"
                                          onClick={() => {
                                            const updatedSlots = active
                                              ? med.timeOfDay.filter((s) => s !== slot)
                                              : [...med.timeOfDay, slot];
                                            handleFieldChange(index, "timeOfDay", updatedSlots);
                                          }}
                                          className={`text-[9px] uppercase px-2 py-0.5 rounded-md font-bold transition-all border cursor-pointer ${
                                            active
                                              ? "bg-teal-650 text-white border-teal-700 shadow-xs"
                                              : "bg-slate-50 dark:bg-dark-bg-secondary text-slate-800 dark:text-dark-text-secondary border-slate-205 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-dark-bg-elevated"
                                          }`}
                                        >
                                          {slot}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Original OCR Output Snapshot (Data Consistency Guarantee) */}
                            {med.originalOcrData && (
                              <div className="mt-2 text-[10px] text-slate-800 dark:text-dark-text-secondary bg-slate-50/50 dark:bg-dark-bg-secondary/50 border border-slate-250 dark:border-slate-800 rounded-lg p-2.5 space-y-1">
                                <div className="font-bold text-slate-850 dark:text-dark-text-muted flex items-center gap-1 uppercase tracking-wider text-[9px]">
                                  <span>🔍 AI OCR Preserved Record</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-2 gap-y-0.5 leading-normal">
                                  <div>Name: <span className="font-semibold text-slate-800 dark:text-dark-text-primary">"{med.originalOcrData.name || "N/A"}"</span></div>
                                  <div>Dosage: <span className="font-semibold text-slate-800 dark:text-dark-text-primary">"{med.originalOcrData.dosage || "N/A"}"</span></div>
                                  <div>Time: <span className="font-semibold text-slate-800 dark:text-dark-text-primary">"{med.originalOcrData.exactTime || "N/A"}"</span></div>
                                  <div>Duration: <span className="font-semibold text-slate-800 dark:text-dark-text-primary">{med.originalOcrData.duration ? `${med.originalOcrData.duration} days` : "N/A"}</span></div>
                                </div>
                                {med.originalOcrData.notes && (
                                  <div className="truncate">Instructions: <span className="font-semibold text-slate-800 dark:text-dark-text-primary">"{med.originalOcrData.notes}"</span></div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                    <button
                      onClick={handleImport}
                      disabled={selectedMeds.length === 0 || isImported}
                      className="flex-1 py-3 px-6 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs hover:shadow-md transition-all duration-200 text-center flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Use Extracted Medications ({selectedMeds.length})</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
