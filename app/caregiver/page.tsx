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
  ArrowRight
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
  
  // Symptom logger form states
  const [symptomNote, setSymptomNote] = useState("");
  const [symptomSeverity, setSymptomSeverity] = useState<"mild" | "moderate" | "severe">("mild");

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
    }
  }, [activeProfile]);

  // Safety check if profile is loaded
  if (!activeProfile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 text-amber-655 flex items-center justify-center border border-amber-200 animate-pulse shadow-sm">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-805">No Patient Profile Loaded</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
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
  activityTimeline.sort((a, b) => a.time.localeCompare(b.time));

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
          <p className="text-slate-500 text-xs mt-0.5">
            Active Patient: <strong>{activeProfile.name}</strong> • Real-time adherence logs and clinical alerts.
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
            className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 text-xs font-bold rounded-lg text-slate-705 bg-white hover:bg-slate-50 transition-all shadow-xs"
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
                  <span className="absolute text-xl font-extrabold text-slate-800">{adherenceRate}%</span>
                </div>
                <h4 className="text-xs font-bold text-slate-705 mt-3">Compliance Index</h4>
                <p className="text-[10px] text-slate-400 mt-1">Today's medication schedule</p>
              </div>

              {/* Progress Detail */}
              <div className="sm:col-span-2 border border-slate-150 rounded-xl p-5 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-650">
                    <span>Taken Doses</span>
                    <span>{takenCount} of {totalScheduled}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${totalScheduled > 0 ? (takenCount/totalScheduled)*100 : 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-655">
                    <span>Missed Doses</span>
                    <span>{missedCount} of {totalScheduled}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${totalScheduled > 0 ? (missedCount/totalScheduled)*100 : 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-655">
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
            <h2 className="text-base font-bold text-slate-805 mb-5 flex items-center gap-1.5">
              <Clock className="h-5 w-5 text-teal-650" />
              Intake Log & Activity Events
            </h2>

            {activityTimeline.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No activity recorded for this patient.</p>
            ) : (
              <div className="space-y-4">
                {activityTimeline.map((item, idx) => {
                  const eventKey = `${item.type}-${item.time}-${item.text.replace(/\s+/g, '')}-${idx}`;
                  return (
                    <div key={eventKey} className="flex gap-4 items-start">
                      <div className="text-xs font-semibold text-slate-400 w-12 pt-0.5 text-right">{formatTime12h(item.time)}</div>
                      
                      <div className="relative flex flex-col items-center shrink-0">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 ${
                          item.type === "taken" ? "bg-emerald-500 border-emerald-300" :
                          item.type === "missed" ? "bg-red-500 border-red-350 animate-pulse" :
                          "bg-slate-200 border-slate-350"
                        }`}></div>
                        {idx < activityTimeline.length - 1 && (
                          <div className="w-0.5 h-10 bg-slate-100 mt-1"></div>
                        )}
                      </div>

                      <div className="flex-1">
                        <p className={`text-xs font-semibold ${
                          item.type === "taken" ? "text-emerald-800" :
                          item.type === "missed" ? "text-red-700" :
                          "text-slate-550"
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
                  <label htmlFor="sym-note" className="block text-[10px] font-bold text-slate-500 uppercase">Symptom Note</label>
                  <input
                    type="text"
                    id="sym-note"
                    value={symptomNote}
                    onChange={(e) => setSymptomNote(e.target.value)}
                    placeholder="e.g. Felt dizzy after afternoon metformin, BP read 130/80"
                    className="w-full text-xs font-medium text-slate-800 border border-slate-300 rounded-lg p-2 bg-white focus:outline-hidden"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="sym-sev" className="block text-[10px] font-bold text-slate-500 uppercase">Severity</label>
                  <select
                    id="sym-sev"
                    value={symptomSeverity}
                    onChange={(e) => setSymptomSeverity(e.target.value as any)}
                    className="w-full text-xs font-medium text-slate-800 border border-slate-300 rounded-lg p-2 bg-white focus:outline-hidden"
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
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logged Symptoms History</h3>
              {symptomLogs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No symptom logs recorded for this patient.</p>
              ) : (
                <div className="space-y-3">
                  {symptomLogs.map((log) => (
                    <div key={log.id} className="border border-slate-150 p-4 rounded-xl flex items-start justify-between gap-4 bg-white hover:bg-slate-50/50 transition-colors shadow-2xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded-md ${
                            log.severity === "severe" ? "bg-red-100 text-red-700 animate-pulse" :
                            log.severity === "moderate" ? "bg-amber-100 text-amber-700" :
                            "bg-slate-100 text-slate-700"
                          }`}>
                            {log.severity}
                          </span>
                          <span className="text-[10px] text-slate-400">{log.date}</span>
                        </div>
                        <p className="text-xs text-slate-750 font-semibold">{log.notes}</p>
                      </div>
                      <button
                        onClick={() => deleteSymptomLog(log.id)}
                        className="text-slate-300 hover:text-red-500 p-1 rounded-lg transition-colors"
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
        </div>

        {/* Right Area: Clinical Care Plan Updates Form (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-800">Edit Clinical Care Plan</h2>

            <form onSubmit={handleUpdateCarePlan} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="cg-name" className="block text-[10px] font-bold text-slate-500 uppercase">Caregiver Name</label>
                <input
                  type="text"
                  id="cg-name"
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-855 border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden focus:border-teal-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="doc-name" className="block text-[10px] font-bold text-slate-500 uppercase">Assigned Doctor</label>
                <input
                  type="text"
                  id="doc-name"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-855 border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden focus:border-teal-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="diag-sum" className="block text-[10px] font-bold text-slate-500 uppercase">Medical Condition</label>
                <input
                  type="text"
                  id="diag-sum"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-855 border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden focus:border-teal-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="prec-notes" className="block text-[10px] font-bold text-slate-500 uppercase">Clinical Precautions</label>
                <textarea
                  id="prec-notes"
                  rows={3}
                  value={precautions}
                  onChange={(e) => setPrecautions(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-855 border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden focus:border-teal-500 resize-none leading-relaxed"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="f-date" className="block text-[10px] font-bold text-slate-500 uppercase">Next Follow-Up</label>
                <input
                  type="date"
                  id="f-date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-855 border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden focus:border-teal-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
              >
                Update Clinical Details
              </button>
            </form>
          </div>

          <div className="bg-teal-950 text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm">Need Doctor Summary?</h4>
              <p className="text-[11px] text-teal-200 mt-1 leading-normal">
                Generate a physical diagnostic report detailing Ramesh's medication adherence rates and caregiver journals.
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

    </div>
  );
}
