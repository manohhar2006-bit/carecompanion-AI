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
  },
];

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
          <p className="text-slate-500 text-sm leading-relaxed">
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
  const [selectedMeds, setSelectedMeds] = useState<number[]>([0, 1]); // default select all
  const [isImported, setIsImported] = useState(false);

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
      triggerMockAnalysis();
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

  const handleToggleSelect = (index: number) => {
    setSelectedMeds((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleFieldChange = (index: number, field: keyof ExtractedMed, value: any) => {
    setExtractedMeds((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
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
    setExtractedMeds(mockParsedMeds);
    setSelectedMeds([0, 1]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Prescription Scanner</h1>
          <p className="text-slate-500 text-sm">Upload written prescription sheets to simulate automated schedule logs.</p>
        </div>
        <div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-lg transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Scanner</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-800 mb-4">Select Prescription File</h2>

            {!previewUrl ? (
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100/50 hover:border-teal-500 transition-all duration-200 relative">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-teal-50 text-teal-650 flex items-center justify-center">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Drag and drop file here</p>
                    <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, or PDF (Max 10MB)</p>
                  </div>
                  <div className="relative flex justify-center py-2">
                    <span className="bg-slate-55 px-2 text-xs font-bold text-slate-400">or</span>
                  </div>
                  <button
                    type="button"
                    onClick={triggerDemo}
                    className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-all"
                  >
                    Use Sample Medical Script
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 relative min-h-[300px] flex items-center justify-center">
                  {file?.name === "demo_prescription.png" ? (
                    <div className="p-6 text-center space-y-4 max-w-xs">
                      <FileText className="h-16 w-16 text-teal-600 mx-auto opacity-75" />
                      <div className="border-t border-slate-200 pt-3 text-left font-serif space-y-2">
                        <p className="text-xs font-bold text-teal-955 uppercase">Metro General Cardiology Clinic</p>
                        <p className="text-[10px] text-slate-400">Date: June 15, 2026 • Patient: Ramesh</p>
                        <p className="text-xs text-slate-700 mt-2 font-semibold">Rx:</p>
                        <p className="text-xs italic text-slate-700 pl-2">1. Atorvastatin 10mg - QD tab hs #30</p>
                        <p className="text-xs italic text-slate-700 pl-2">2. Levothyroxine 50mcg - QD tab qam ac #90</p>
                        <p className="text-[9px] text-slate-400 mt-4 text-right">Signed: Dr. Sarah Alcott, MD</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center space-y-2">
                      <FileText className="h-12 w-12 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-600">{file?.name}</p>
                      <p className="text-[10px] text-slate-400">{(file?.size ? file.size / 1024 : 0).toFixed(1)} KB</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 text-center py-2 px-4 border border-slate-200 text-xs font-bold text-slate-650 bg-white hover:bg-slate-55 rounded-lg transition-all"
                  >
                    Clear File
                  </button>
                  <button
                    onClick={triggerMockAnalysis}
                    className="flex-1 text-center py-2 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-all"
                  >
                    Re-Scan
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-teal-50 border border-teal-150 rounded-xl p-4 flex gap-3 text-teal-900">
            <Info className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-bold">Clinic OCR Guide</h4>
              <p className="leading-relaxed">
                The scanner simulates scanning doctor handwriting notation (e.g. <em>QD</em> daily, <em>hs</em> at bedtime, <em>ac</em> before food) 
                and translating them into scheduled medication logs.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-teal-650" />
                <h2 className="text-sm font-bold text-slate-800">AI Extraction Status</h2>
              </div>
              <div>
                {!previewUrl && <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">Waiting for file</span>}
                {isProcessing && <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold animate-pulse">Processing...</span>}
                {isDone && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5"><Check className="h-3 w-3" /> Ready</span>}
              </div>
            </div>

            <div className="p-6">
              
              {!previewUrl && !isProcessing && (
                <div className="text-center py-16 space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-700">No Document Uploaded</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
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
                    <h3 className="text-sm font-bold text-slate-700">Extracting Medication Data</h3>
                    <p className="text-xs text-teal-600 font-semibold animate-pulse">{processingSteps[processStep]}</p>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 max-w-sm mx-auto overflow-hidden">
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
                    <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-250 text-emerald-800 text-sm font-bold flex items-center gap-2 animate-pulse mb-4">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <span>Medicines imported! Returning to Dashboard...</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-amber-50 border border-amber-100 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-amber-550 shrink-0" />
                    <span>Please verify the extracted values against the original prescription sheet for accuracy.</span>
                  </div>

                  <div className="space-y-4">
                    {extractedMeds.map((med, index) => {
                      const isSelected = selectedMeds.includes(index);
                      return (
                        <div 
                          key={med.id} 
                          className={`border rounded-xl p-4 transition-all relative ${
                            isSelected 
                              ? "border-teal-500 bg-teal-50/20" 
                              : "border-slate-200 bg-white opacity-70"
                          }`}
                        >
                          <div className="absolute top-4 right-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(index)}
                              className="h-4 w-4 rounded-sm border-slate-350 text-teal-650 focus:ring-teal-500"
                            />
                          </div>

                          <div className="space-y-3 pr-8">
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-md">
                                Extracted {index + 1}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase">Medication Name</label>
                                <input
                                  type="text"
                                  value={med.name}
                                  onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                                  className="w-full text-sm font-semibold text-slate-800 border-b border-slate-200 focus:border-teal-500 focus:outline-hidden py-0.5 bg-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase">Dosage</label>
                                <input
                                  type="text"
                                  value={med.dosage}
                                  onChange={(e) => handleFieldChange(index, "dosage", e.target.value)}
                                  className="w-full text-sm text-slate-800 border-b border-slate-200 focus:border-teal-500 focus:outline-hidden py-0.5 bg-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase">Timeslots Scheduled</label>
                                <div className="flex gap-1.5 mt-1">
                                  {["morning", "afternoon", "evening", "night"].map((slot) => {
                                    const active = med.timeOfDay.includes(slot);
                                    return (
                                      <span 
                                        key={slot} 
                                        className={`text-[10px] uppercase px-2 py-0.5 rounded-md font-bold ${
                                          active 
                                            ? "bg-teal-650 text-white" 
                                            : "bg-slate-100 text-slate-400"
                                        }`}
                                      >
                                        {slot}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase">Duration & Time</label>
                                <div className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    value={med.exactTime}
                                    onChange={(e) => handleFieldChange(index, "exactTime", e.target.value)}
                                    className="w-14 text-sm text-slate-800 border-b border-slate-200 focus:border-teal-500 focus:outline-hidden py-0.5 bg-transparent"
                                  />
                                  <span className="text-xs text-slate-400">for</span>
                                  <input
                                    type="number"
                                    value={med.duration}
                                    onChange={(e) => handleFieldChange(index, "duration", parseInt(e.target.value) || 0)}
                                    className="w-12 text-sm text-slate-800 border-b border-slate-200 focus:border-teal-500 focus:outline-hidden py-0.5 bg-transparent"
                                  />
                                  <span className="text-xs text-slate-400">days</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase">Special Instructions</label>
                              <input
                                type="text"
                                value={med.notes}
                                onChange={(e) => handleFieldChange(index, "notes", e.target.value)}
                                className="w-full text-xs text-slate-650 border-b border-slate-200 focus:border-teal-500 focus:outline-hidden py-0.5 bg-transparent"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex gap-4">
                    <button
                      onClick={handleImport}
                      disabled={selectedMeds.length === 0 || isImported}
                      className="flex-1 py-3 px-6 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs hover:shadow-md transition-all duration-200 text-center flex items-center justify-center gap-2"
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
