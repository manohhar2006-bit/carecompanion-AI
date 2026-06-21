"use client";

import React, { useState, useEffect } from "react";
import { useAppState } from "@/context/AppContext";
import { 
  Users, 
  AlertTriangle, 
  Clock, 
  Activity, 
  ChevronRight, 
  ClipboardList, 
  Phone,
  Plus,
  Trash2,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Brain,
  Sparkles,
  Loader2,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { formatTime12h } from "@/components/ReminderEngine";

export default function CaregiverDashboard() {
  const { 
    activeProfile,
    medicines, 
    trackingLogs, 
    symptomLogs, 
    updateProfile, 
    addSymptomLog,
    deleteSymptomLog,
    caregiverAlerts,
    clearAlertsForPatient
  } = useAppState();

  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split("T")[0]);
  
  // Caregiver form states
  const [diagnosis, setDiagnosis] = useState(activeProfile?.condition || "");
  const [precautions, setPrecautions] = useState(activeProfile?.precautions || "");
  const [followUpDate, setFollowUpDate] = useState(activeProfile?.followUpDate || "");
  const [doctorName, setDoctorName] = useState(activeProfile?.doctorName || "");
  const [caregiverName, setCaregiverName] = useState(activeProfile?.caregiverName || "");
  const [language, setLanguage] = useState(activeProfile?.language || "English");
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editInstructions, setEditInstructions] = useState("");
  const [editDoctorName, setEditDoctorName] = useState("");
  const [editClinicName, setEditClinicName] = useState("");
  const [editFollowUpDate, setEditFollowUpDate] = useState("");
  const [editCaregiverName, setEditCaregiverName] = useState("");
  const [editLanguage, setEditLanguage] = useState("English");
  const [editRemarks, setEditRemarks] = useState("");
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");

  const openEditModal = () => {
    if (activeProfile) {
      setEditTitle(activeProfile.condition || "");
      setEditInstructions(activeProfile.precautions || "");
      setEditDoctorName(activeProfile.doctorName || "");
      setEditClinicName(activeProfile.clinicName || "");
      setEditFollowUpDate(activeProfile.followUpDate || "");
      setEditCaregiverName(activeProfile.caregiverName || "");
      setEditLanguage(activeProfile.language || "English");
      setEditRemarks(activeProfile.caregiverRemarks || "");
      setIsEditModalOpen(true);
    }
  };

  const handleSaveCarePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfile) return;
    updateProfile(activeProfile.id, {
      condition: editTitle,
      precautions: editInstructions,
      doctorName: editDoctorName,
      clinicName: editClinicName,
      followUpDate: editFollowUpDate,
      caregiverName: editCaregiverName,
      language: editLanguage,
      caregiverRemarks: editRemarks,
    });
    setIsEditModalOpen(false);
    setSaveSuccessMessage("Care plan updated successfully!");
    setTimeout(() => {
      setSaveSuccessMessage("");
    }, 3000);
  };

  // Symptom logger form states
  const [symptomNote, setSymptomNote] = useState("");
  const [symptomSeverity, setSymptomSeverity] = useState<"mild" | "moderate" | "severe">("mild");

  // AI Health Insight states
  const [insight, setInsight] = useState<{ riskLevel: string; summary: string; recommendation?: string } | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState("");
  const [mounted, setMounted] = useState(false);

  // Call simulation states
  const [isCalling, setIsCalling] = useState(false);

  // Sync state if activeProfile shifts
  useEffect(() => {
    if (activeProfile) {
      setDiagnosis(activeProfile.condition);
      setPrecautions(activeProfile.precautions);
      setFollowUpDate(activeProfile.followUpDate);
      setDoctorName(activeProfile.doctorName);
      setCaregiverName(activeProfile.caregiverName);
      setLanguage(activeProfile.language || "English");
    }
  }, [activeProfile]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 text-teal-650 flex items-center justify-center mx-auto animate-spin">
          <Loader2 className="h-5 w-5" />
        </div>
        <p className="text-xs text-slate-800 font-semibold">Loading caregiver dashboard...</p>
      </div>
    );
  }

  // Safety check if profile is loaded
  if (!activeProfile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 text-amber-655 flex items-center justify-center border border-amber-200 animate-pulse shadow-sm">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800">No Patient Profile Loaded</h2>
          <p className="text-slate-800 text-sm leading-relaxed">
            Please select an existing patient file or register a new one to access caregiver monitoring services.
          </p>
        </div>
        <Link
          href="/patients"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 shadow-md transition-all"
        >
          Go to Patients Portal
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Calculate statistics
  let totalScheduled = 0;
  let takenCount = 0;
  let missedCount = 0;
  
  const todayLogs = trackingLogs.filter(log => log.date === currentDate);
  const activityTimeline: { text: string; time: string; type: "taken" | "missed" | "pending" }[] = [];

  medicines.forEach((med) => {
    if (!med.active) return;
    med.reminderTimes.forEach((rt) => {
      const log = todayLogs.find(l => l.medicineId === med.id && l.timeSlot === rt.timeSlot);
      const status = log ? log.status : "pending";
      
      totalScheduled++;
      if (status === "taken") {
        takenCount++;
        activityTimeline.push({
          text: `Patient logged taking ${med.name} (${med.dosage})`,
          time: log?.timestamp?.split(" ")[1] || rt.time,
          type: "taken",
        });
      } else if (status === "missed") {
        missedCount++;
        activityTimeline.push({
          text: `ALERT: Missed scheduled dose of ${med.name}`,
          time: rt.time,
          type: "missed",
        });
      } else {
        activityTimeline.push({
          text: `Scheduled dose of ${med.name} is upcoming`,
          time: rt.time,
          type: "pending",
        });
      }
    });
  });

  // Sort timeline by time
  activityTimeline.sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  const adherenceRate = totalScheduled > 0 
    ? Math.round((takenCount / totalScheduled) * 100) 
    : 100;

  const handleUpdateCarePlan = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(activeProfile.id, {
      condition: diagnosis,
      precautions,
      followUpDate,
      doctorName,
      caregiverName,
      language,
    });
    alert(`Clinical care plan for ${activeProfile.name} updated successfully!`);
  };

  const handleLogSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomNote.trim()) return;

    addSymptomLog({
      date: new Date().toISOString().split("T")[0],
      severity: symptomSeverity,
      notes: symptomNote.trim(),
    });

    setSymptomNote("");
    alert(`Symptom entry logged in ${activeProfile.name}'s clinical file.`);
  };

  const startSimulatedCall = () => {
    setIsCalling(true);
    setTimeout(() => {
      setIsCalling(false);
      alert(`Simulated phone call completed with ${activeProfile.name}.`);
    }, 2500);
  };

  const activeAlerts = caregiverAlerts.filter(a => a.patientId === activeProfile.id);

  const handleGenerateInsight = async () => {
    setInsightError("");
    setInsightLoading(true);
    try {
      const response = await fetch("/api/health-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientName: activeProfile.name,
          symptomLogs: symptomLogs,
          missedDoseCount: missedCount,
          takenDoseCount: takenCount,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate health insights.");
      }

      setInsight(data.insight);
    } catch (err: any) {
      console.error(err);
      setInsightError(err.message || "Insight generation failed. Please try again.");
    } finally {
      setInsightLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-800 bg-teal-55 px-3 py-1 rounded-full border border-teal-100">
            Caregiver Synced Portal
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">
            Family Monitoring Hub
          </h1>
          <p className="text-slate-700 text-xs mt-0.5 font-medium">
            Active Patient: <strong className="text-slate-900">{activeProfile.name}</strong> • Real-time adherence logs and clinical alerts.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-bold rounded-lg text-white bg-teal-600 hover:bg-teal-700 shadow-xs"
          >
            Access Schedule Timeline
          </Link>
          <Link
            href="/patients"
            className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-xs font-bold rounded-lg text-slate-800 bg-white hover:bg-slate-55 transition-all shadow-xs"
          >
            Switch Patient
          </Link>
        </div>
      </div>

      {/* Critical Alert Panel for Missed Doses */}
      {activeAlerts.length > 0 && (
        <div className="bg-red-55 border border-red-200 rounded-xl p-5 shadow-sm space-y-4 animate-pulse relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-655 shrink-0 mt-0.5 animate-bounce" />
            <div className="flex-1 space-y-1">
              <h3 className="text-base font-black text-red-950">URGENT COMPLIANCE WARNING</h3>
              <p className="text-xs text-red-800 leading-normal">
                {activeProfile.name} has bypassed scheduled medication routines today. Immediate caregiver review recommended.
              </p>
              
              <div className="mt-3 space-y-2">
                {activeAlerts.map((alert) => (
                  <div key={alert.id} className="bg-white rounded-lg p-3 border border-red-150 text-xs flex justify-between items-center text-red-900 max-w-lg shadow-2xs">
                    <div className="font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      <span>{alert.message}</span>
                    </div>
                    <span className="text-[10px] uppercase bg-red-100 text-red-700 font-black px-2 py-0.5 rounded-md tracking-wider">
                      Missed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t border-red-150 justify-end">
            <button
              onClick={startSimulatedCall}
              disabled={isCalling}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-650 hover:bg-red-700 rounded-lg shadow-sm transition-all"
            >
              <Phone className="h-3.5 w-3.5 animate-pulse" />
              <span>{isCalling ? "Connecting..." : `Dial Patient (${activeProfile.name})`}</span>
            </button>
            <button
              onClick={() => clearAlertsForPatient(activeProfile.id)}
              className="px-4 py-2 text-xs font-bold text-red-700 bg-red-100/60 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
            >
              Acknowledge Missed Doses
            </button>
          </div>
        </div>
      )}

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Area (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Adherence Charts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-1.5">
              <Activity className="h-5 w-5 text-teal-605" />
              Compliance Analytics for {activeProfile.name}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Compliance Visual */}
              <div className="border border-slate-155 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                    <circle cx="48" cy="48" r="40" stroke="#0f766e" strokeWidth="8" fill="transparent" 
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * adherenceRate) / 100}
                    />
                  </svg>
                  <span className="absolute text-xl font-extrabold text-slate-900">{adherenceRate}%</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 mt-3">Compliance Index</h4>
                <p className="text-[10px] text-slate-800 mt-1 font-semibold">Today's medication schedule</p>
              </div>

              {/* Progress Detail */}
              <div className="sm:col-span-2 border border-slate-150 rounded-xl p-5 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>Taken Doses</span>
                    <span>{takenCount} of {totalScheduled}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${totalScheduled > 0 ? (takenCount/totalScheduled)*100 : 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>Missed Doses</span>
                    <span>{missedCount} of {totalScheduled}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${totalScheduled > 0 ? (missedCount/totalScheduled)*100 : 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>Primary Caregiver Link</span>
                    <span className="text-teal-700 font-semibold">{activeProfile.caregiverName}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
                    <div className="bg-teal-600 h-2 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity event timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-black text-slate-900 mb-5 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Clock className="h-5 w-5 text-teal-650" />
              Intake Log & Activity Events
            </h2>

            {activityTimeline.length === 0 ? (
              <p className="text-xs text-slate-800 italic">No activity recorded for this patient.</p>
            ) : (
              <div className="space-y-6">
                {activityTimeline.map((item, idx) => {
                  const eventKey = `${item.type}-${item.time}-${item.text.replace(/\s+/g, '')}-${idx}`;
                  return (
                    <div key={eventKey} className="flex gap-4 items-start pb-4 last:pb-0">
                      <div className="text-[10px] font-extrabold text-slate-900 bg-slate-100/90 border border-slate-250 px-2 py-0.5 rounded-md w-16 text-center shrink-0 shadow-3xs">
                        {formatTime12h(item.time)}
                      </div>
                      
                      <div className="relative flex flex-col items-center shrink-0 self-stretch pt-1">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 ${
                          item.type === "taken" ? "bg-emerald-500 border-emerald-300" :
                          item.type === "missed" ? "bg-red-500 border-red-350 animate-pulse" :
                          "bg-slate-350 border-slate-400"
                        }`}></div>
                        {idx < activityTimeline.length - 1 && (
                          <div className="w-0.5 flex-grow bg-slate-300 my-1"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold leading-relaxed ${
                          item.type === "taken" ? "text-emerald-950" :
                          item.type === "missed" ? "text-red-950" :
                          "text-slate-900"
                        }`}>
                          {item.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Symptoms journal */}
          <div className="bg-white border border-slate-205 rounded-2xl p-6 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <ClipboardList className="h-5 w-5 text-teal-650" />
              Symptom Log & Patient Diary
            </h2>

            {/* Input Form */}
            <form onSubmit={handleLogSymptom} className="bg-slate-55 p-4 rounded-xl border border-slate-150 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Log Symptom Entry</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="sym-note" className="block text-[10px] font-bold text-slate-700 uppercase">Symptom Note</label>
                  <input
                    type="text"
                    id="sym-note"
                    value={symptomNote}
                    onChange={(e) => setSymptomNote(e.target.value)}
                    placeholder="e.g. Felt dizzy after afternoon metformin, BP read 130/80"
                    className="w-full text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg p-2 bg-white focus:outline-hidden focus:border-teal-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="sym-sev" className="block text-[10px] font-bold text-slate-700 uppercase">Severity</label>
                  <select
                    id="sym-sev"
                    value={symptomSeverity}
                    onChange={(e) => setSymptomSeverity(e.target.value as any)}
                    className="w-full text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg p-2 bg-white focus:outline-hidden focus:border-teal-500"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>
              <div className="text-right">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 py-1.5 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Log Entry</span>
                </button>
              </div>
            </form>

            {/* List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Logged Symptoms History</h3>
              {symptomLogs.length === 0 ? (
                <p className="text-xs text-slate-800 italic">No symptom logs recorded for this patient.</p>
              ) : (
                <div className="space-y-3">
                  {symptomLogs.map((log) => (
                    <div key={log.id} className="border border-slate-150 p-4 rounded-xl flex items-start justify-between gap-4 bg-white hover:bg-slate-55/55 transition-colors shadow-2xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded-md ${
                            log.severity === "severe" ? "bg-red-100 text-red-700 animate-pulse" :
                            log.severity === "moderate" ? "bg-amber-100 text-amber-700" :
                            "bg-slate-200 text-slate-800 border border-slate-300"
                          }`}>
                            {log.severity}
                          </span>
                          <span className="text-[10px] text-slate-800 font-semibold">{log.date}</span>
                        </div>
                        <p className="text-xs text-slate-900 font-bold">{log.notes}</p>
                      </div>
                      <button
                        onClick={() => deleteSymptomLog(log.id)}
                        className="text-slate-600 hover:text-red-500 p-1 rounded-lg transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI Health Insight */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <Brain className="h-5 w-5 text-teal-650" />
                AI Health Insight
              </h2>
              {insight && (
                <span className={`px-2 py-0.5 border rounded-md text-[10px] font-black uppercase tracking-wider ${
                  insight.riskLevel.toLowerCase() === "high" 
                    ? "bg-rose-50 text-rose-800 border-rose-200" 
                    : (insight.riskLevel.toLowerCase() === "low" || insight.riskLevel.toLowerCase() === "moderate") 
                    ? "bg-amber-50 text-amber-800 border-amber-200" 
                    : "bg-slate-100 text-slate-800 border-slate-200"
                }`}>
                  {insight.riskLevel} Risk
                </span>
              )}
            </div>

            {insightError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold leading-relaxed">
                ⚠️ {insightError}
              </div>
            )}

            {insight ? (
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
                  <span className="block text-[9px] font-bold text-slate-800 uppercase tracking-wide">Analysis Summary</span>
                  <p className="text-xs text-slate-850 font-bold leading-relaxed">
                    {insight.summary}
                  </p>
                </div>
                {insight.recommendation && (
                  <div className="p-4 bg-teal-50/30 border border-teal-100 rounded-xl space-y-1">
                    <span className="block text-[9px] font-bold text-teal-800 uppercase tracking-wide">Actionable Recommendation</span>
                    <p className="text-xs text-teal-950 font-black leading-relaxed">
                      💡 {insight.recommendation}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-800 italic">
                No health insights generated yet. Click "Generate Insight" to analyze symptoms and compliance patterns.
              </p>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleGenerateInsight}
                disabled={insightLoading}
                className="inline-flex items-center gap-1.5 py-2 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm disabled:opacity-40 disabled:pointer-events-none"
              >
                {insightLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Generate Insight</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Area: Clinical Care Plan Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <ClipboardList className="h-5 w-5 text-teal-650" />
                Clinical Care Plan
              </h2>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-md uppercase">
                Active
              </span>
            </div>

            {saveSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-250 text-xs text-emerald-800 font-bold rounded-lg animate-pulse flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                {saveSuccessMessage}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <span className="block text-[10px] font-extrabold text-slate-800 uppercase tracking-wide">Care Plan Title / Condition</span>
                <strong className="text-sm text-slate-900 block mt-0.5">{activeProfile.condition}</strong>
              </div>

              <div>
                <span className="block text-[10px] font-extrabold text-slate-800 uppercase tracking-wide">Clinical Instructions</span>
                <p className="text-xs text-slate-855 font-bold leading-relaxed mt-0.5 whitespace-pre-line bg-slate-50/50 p-2.5 rounded-lg border border-slate-150">
                  {activeProfile.precautions}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-extrabold text-slate-800 uppercase tracking-wide">Doctor</span>
                  <strong className="text-xs text-slate-900 block mt-0.5">{activeProfile.doctorName}</strong>
                </div>
                <div>
                  <span className="block text-[10px] font-extrabold text-slate-800 uppercase tracking-wide">Clinic</span>
                  <strong className="text-xs text-slate-900 block mt-0.5 truncate" title={activeProfile.clinicName}>{activeProfile.clinicName}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-extrabold text-slate-800 uppercase tracking-wide">Next Follow-Up</span>
                  <strong className="text-xs text-slate-900 block mt-0.5">📅 {activeProfile.followUpDate}</strong>
                </div>
                <div>
                  <span className="block text-[10px] font-extrabold text-slate-800 uppercase tracking-wide">Reminder Language</span>
                  <strong className="text-xs text-slate-900 block mt-0.5 capitalize">{activeProfile.language || "English"}</strong>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="block text-[10px] font-extrabold text-slate-800 uppercase tracking-wide">Caregiver Remarks</span>
                <p className="text-xs text-slate-850 font-bold italic mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                  {activeProfile.caregiverRemarks || "No remarks entered."}
                </p>
              </div>

              <button
                type="button"
                onClick={openEditModal}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-all text-center flex items-center justify-center gap-1.5"
              >
                <span>Edit Clinical Care Plan</span>
              </button>
            </div>
          </div>

          <div className="bg-teal-950 text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm">Need Doctor Summary?</h4>
              <p className="text-[11px] text-teal-200 mt-1 leading-normal">
                Generate a physical diagnostic report detailing {activeProfile.name}'s medication adherence rates and caregiver journals.
              </p>
            </div>
            <Link
              href="/report"
              className="inline-flex items-center justify-center py-2 px-3 text-xs font-bold text-slate-905 bg-teal-305 hover:bg-teal-250 rounded-lg transition-all text-center gap-1.5"
            >
              <ClipboardList className="h-4 w-4" />
              <span>Go to Doctor Report</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Edit Care Plan Modal Overlay */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-teal-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">Edit Patient Care Plan</h3>
                <p className="text-[10px] text-teal-200 font-medium">Update medical directives and caregiver instructions for {activeProfile.name}</p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-white hover:text-teal-200 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveCarePlan} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="modal-title" className="block text-[10px] font-extrabold text-slate-800 uppercase">Care Plan Title (Condition)</label>
                  <input
                    type="text"
                    id="modal-title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 border border-slate-355 rounded-lg p-2.5 bg-white focus:outline-hidden focus:border-teal-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="modal-cgname" className="block text-[10px] font-extrabold text-slate-800 uppercase">Caregiver Name</label>
                  <input
                    type="text"
                    id="modal-cgname"
                    value={editCaregiverName}
                    onChange={(e) => setEditCaregiverName(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 border border-slate-355 rounded-lg p-2.5 bg-white focus:outline-hidden focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="modal-notes" className="block text-[10px] font-extrabold text-slate-800 uppercase">Clinical Instructions / Precautions</label>
                <textarea
                  id="modal-notes"
                  rows={3}
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 border border-slate-350 rounded-lg p-2.5 bg-white focus:outline-hidden focus:border-teal-500 resize-none leading-relaxed"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="modal-doc" className="block text-[10px] font-extrabold text-slate-800 uppercase">Assigned Doctor</label>
                  <input
                    type="text"
                    id="modal-doc"
                    value={editDoctorName}
                    onChange={(e) => setEditDoctorName(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 border border-slate-350 rounded-lg p-2.5 bg-white focus:outline-hidden focus:border-teal-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="modal-clinic" className="block text-[10px] font-extrabold text-slate-800 uppercase">Clinic Name</label>
                  <input
                    type="text"
                    id="modal-clinic"
                    value={editClinicName}
                    onChange={(e) => setEditClinicName(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 border border-slate-350 rounded-lg p-2.5 bg-white focus:outline-hidden focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="modal-fdate" className="block text-[10px] font-extrabold text-slate-800 uppercase">Follow-Up Date</label>
                  <input
                    type="date"
                    id="modal-fdate"
                    value={editFollowUpDate}
                    onChange={(e) => setEditFollowUpDate(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 border border-slate-350 rounded-lg p-2.5 bg-white focus:outline-hidden focus:border-teal-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="modal-lang" className="block text-[10px] font-extrabold text-slate-800 uppercase">Reminder Language</label>
                  <select
                    id="modal-lang"
                    value={editLanguage}
                    onChange={(e) => setEditLanguage(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden focus:border-teal-500 text-sm"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="modal-remarks" className="block text-[10px] font-extrabold text-slate-800 uppercase">Caregiver Remarks</label>
                <textarea
                  id="modal-remarks"
                  rows={2}
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  placeholder="e.g. Patient has been adhering well to diet guidelines..."
                  className="w-full text-xs font-semibold text-slate-800 border border-slate-350 rounded-lg p-2.5 bg-white focus:outline-hidden focus:border-teal-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-teal-650 hover:bg-teal-700 rounded-lg shadow-sm transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
