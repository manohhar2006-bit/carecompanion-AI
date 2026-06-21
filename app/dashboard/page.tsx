"use client";

import React, { useState, useEffect } from "react";
import { useAppState, ReminderHistoryItem } from "@/context/AppContext";
import { 
  Check, 
  X, 
  RotateCcw, 
  Pill, 
  Plus, 
  CalendarDays, 
  Volume2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  User,
  Users,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Trash2,
  Edit2,
  BellRing,
  Activity,
  History
} from "lucide-react";
import Link from "next/link";
import { formatTime12h, getLanguageCode, getLocalizedReminder, speakTextWithVoice } from "@/components/ReminderEngine";

export default function PatientDashboard() {
  const { 
    activeProfile,
    medicines, 
    trackingLogs, 
    markAsTaken, 
    markAsMissed, 
    resetLogStatus,
    deleteMedicine,
    updateMedicine,
    
    activeReminders,
    reminderHistory,
    voiceReminderStatus,
    lastReminderTriggered,
    isFastDemoMode,
    setIsFastDemoMode
  } = useAppState();

  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedDemoMedId, setSelectedDemoMedId] = useState("");

  // Set default demo medicine if medicines are loaded
  useEffect(() => {
    if (medicines.length > 0 && !selectedDemoMedId) {
      setSelectedDemoMedId(medicines[0].id);
    }
  }, [medicines, selectedDemoMedId]);

  // Handle case where no patient is active yet
  if (!activeProfile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 animate-pulse shadow-sm">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800">No Patient Profile Loaded</h2>
          <p className="text-slate-800 text-sm leading-relaxed">
            Please select an existing patient file or register a new one to unlock daily adherence logs and schedules.
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

  // Filter logs for today
  const todayLogs = trackingLogs.filter(log => log.date === currentDate);

  // Group medications by schedule slot for "today"
  const timeSlots = [
    { id: "morning", name: "Morning Routine", timeRange: "06:00 - 11:59" },
    { id: "afternoon", name: "Afternoon Routine", timeRange: "12:00 - 16:59" },
    { id: "evening", name: "Evening Routine", timeRange: "17:00 - 19:59" },
    { id: "night", name: "Night Routine", timeRange: "20:00 - 23:59" },
  ];

  interface ScheduledDose {
    reminderTimeId: string;
    medicineId: string;
    medicineName: string;
    dosage: string;
    notes: string;
    timeSlot: string;
    exactTime: string;
    status: "taken" | "missed" | "pending";
    timestamp?: string;
  }

  const todayDoses: ScheduledDose[] = [];
  let totalScheduledToday = 0;
  let takenCount = 0;
  let missedCount = 0;
  let pendingCount = 0;

  medicines.forEach((med) => {
    if (!med.active) return;
    
    med.reminderTimes.forEach((rt) => {
      const log = todayLogs.find(
        (l) => l.medicineId === med.id && l.timeSlot === rt.timeSlot
      );
      
      const status = log ? log.status : "pending";
      totalScheduledToday++;
      
      if (status === "taken") takenCount++;
      else if (status === "missed") missedCount++;
      else pendingCount++;

      todayDoses.push({
        reminderTimeId: rt.id,
        medicineId: med.id,
        medicineName: med.name,
        dosage: med.dosage,
        notes: med.notes,
        timeSlot: rt.timeSlot,
        exactTime: rt.time,
        status,
        timestamp: log?.timestamp,
      });
    });
  });

  // Calculate adherence rate
  const adherencePercentage = totalScheduledToday > 0 
    ? Math.round((takenCount / totalScheduledToday) * 100) 
    : 100;

  // Determine next reminder time (sort pending doses by time)
  const pendingDoses = todayDoses
    .filter(d => d.status === "pending")
    .sort((a, b) => (a.exactTime || "").localeCompare(b.exactTime || ""));
  
  const nextReminderTime = pendingDoses.length > 0 
    ? `${formatTime12h(pendingDoses[0].exactTime)} (${pendingDoses[0].medicineName})`
    : "All Doses Logged";

  // List of missed medicines for alerts
  const missedDoses = todayDoses.filter(d => d.status === "missed");

  const renderStatusBadge = (status: "taken" | "missed" | "pending") => {
    switch (status) {
      case "taken":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-250 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Taken
          </span>
        );
      case "missed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-800 bg-red-50 border border-red-250 rounded-md animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            Missed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-250 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Pending
          </span>
        );
    }
  };

  const triggerVoiceReminder = (medName: string, dosage: string, timeSlot: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const { langCode, speechText } = getLocalizedReminder(
        activeProfile?.language,
        activeProfile.name,
        medName,
        dosage,
        timeSlot
      );
      
      speakTextWithVoice(
        speechText,
        langCode,
        activeProfile?.language
      );
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  // Demo scheduler action
  const handleScheduleDemo = (minutes: number) => {
    if (!selectedDemoMedId) {
      alert("Please log at least one medicine first!");
      return;
    }
    const med = medicines.find(m => m.id === selectedDemoMedId);
    if (!med) return;

    const targetTime = new Date(Date.now() + minutes * 60 * 1000);
    const timeStr = `${String(targetTime.getHours()).padStart(2, "0")}:${String(targetTime.getMinutes()).padStart(2, "0")}`;

    const newReminderTime = {
      id: `rt-demo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timeSlot: (med.timeOfDay[0] || "morning") as any,
      time: timeStr
    };

    const updatedTimes = [...med.reminderTimes, newReminderTime];
    const updatedSlots = Array.from(new Set([...med.timeOfDay, newReminderTime.timeSlot]));

    updateMedicine(med.id, {
      reminderTimes: updatedTimes,
      timeOfDay: updatedSlots
    });

    resetLogStatus(med.id, currentDate, newReminderTime.timeSlot);

    alert(`Successfully scheduled ${med.name} reminder for ${formatTime12h(timeStr)} (${minutes} minute${minutes > 1 ? "s" : ""} from now). The engine will check and speak automatically.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full space-y-8 animate-fade-in">
      
      {/* Clinic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-800 bg-teal-100/60 border border-teal-200 px-3 py-1 rounded-full uppercase tracking-wider">
              Clinical Portal
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live Reminders Sync Active
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1.5">
            Today’s Care Routine
          </h1>
          <p className="text-slate-800 text-xs font-bold uppercase tracking-wide">
            {new Date(currentDate).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • Care Plan Adherence Monitoring
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/add-medicine"
            className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-xs font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Medication
          </Link>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center px-4 py-2.5 border border-slate-200 text-xs font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200 shadow-xs"
          >
            <Clock className="mr-1.5 h-4 w-4 text-teal-600" />
            Parse Script
          </Link>
          <Link
            href="/patients"
            className="inline-flex items-center justify-center px-4 py-2.5 border border-teal-200 text-xs font-bold rounded-xl text-teal-700 bg-teal-50/50 hover:bg-teal-50 transition-all duration-200"
          >
            Switch Patient
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Columns (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Patient Profile Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full -translate-y-8 translate-x-8 blur-lg"></div>
            <h3 className="text-xs font-black text-slate-850 uppercase tracking-widest mb-4">Patient Profile</h3>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                <User className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-slate-900 leading-tight">{activeProfile.name}</h4>
                <p className="text-xs text-slate-600">{activeProfile.gender} • Age {activeProfile.age}</p>
                <div className="pt-2 text-xs text-slate-800 space-y-1">
                  <p>⚕️ <span className="font-semibold text-slate-800">Condition:</span> {activeProfile.condition}</p>
                  <p>👥 <span className="font-semibold text-slate-800">Caregiver:</span> {activeProfile.caregiverName}</p>
                  <p>🔊 <span className="font-semibold text-slate-800">Reminders in:</span> {activeProfile.language || "English"}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4 flex justify-between items-center text-xs">
              <Link href="/patients" className="text-teal-650 hover:text-teal-700 font-bold flex items-center gap-1">
                Switch Patient Profile
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/caregiver" className="text-slate-800 hover:text-slate-950 font-bold">
                Edit Care Plan
              </Link>
            </div>
          </div>

          {/* Today's Care Snapshot */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <h3 className="text-xs font-black text-slate-850 uppercase tracking-widest flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-teal-600" />
              Today’s Care Snapshot
            </h3>

            {/* Adherence Rate Circular Banner */}
            <div className="flex items-center gap-4 bg-teal-50/30 border border-teal-100 p-4 rounded-xl">
              <div className="w-14 h-14 rounded-full bg-teal-600 text-white flex items-center justify-center font-extrabold text-base border-4 border-teal-100 shrink-0">
                {adherencePercentage}%
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-800">Medication Adherence</h4>
                <p className="text-[10px] text-slate-800 leading-normal">
                  {takenCount} of {totalScheduledToday} doses logged taken today.
                </p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                <span className="text-[9px] uppercase font-bold text-slate-800 block">Scheduled</span>
                <strong className="text-xl font-bold text-slate-800 block mt-1">{totalScheduledToday} Doses</strong>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                <span className="text-[9px] uppercase font-bold text-slate-800 block">Completed</span>
                <strong className="text-xl font-bold text-emerald-600 block mt-1">{takenCount} Doses</strong>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                <span className="text-[9px] uppercase font-bold text-slate-800 block">Missed Logs</span>
                <strong className="text-xl font-bold text-red-500 block mt-1">{missedCount} Doses</strong>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                <span className="text-[9px] uppercase font-bold text-slate-800 block">Next Reminder</span>
                <strong className="text-xs font-bold text-slate-800 block mt-1.5 truncate" title={nextReminderTime}>
                  {nextReminderTime}
                </strong>
              </div>
            </div>
          </div>

          {/* Voice Reminder Engine Status Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-slate-850 uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-teal-650" />
              Live Reminder Assistant Monitor
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-teal-50/50 border border-teal-100 rounded-xl">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-800 uppercase">Voice Assistant Status</span>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {voiceReminderStatus}
                  </div>
                </div>
                {voiceReminderStatus.includes("Speaking") && (
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 bg-teal-600 h-1.5 animate-[bounce_0.6s_infinite_100ms] rounded-full"></span>
                    <span className="w-0.5 bg-teal-500 h-3 animate-[bounce_0.6s_infinite_200ms] rounded-full"></span>
                    <span className="w-0.5 bg-sky-500 h-2 animate-[bounce_0.6s_infinite_300ms] rounded-full"></span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-slate-800 uppercase">Upcoming Reminder Alert</span>
                {pendingDoses.length > 0 ? (
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">
                      🕒 {formatTime12h(pendingDoses[0].exactTime)} - {pendingDoses[0].medicineName}
                    </p>
                    <p className="text-slate-655 mt-0.5">
                      Dosage: {pendingDoses[0].dosage} ({pendingDoses[0].timeSlot} routine)
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-800 italic">No upcoming reminders pending for today.</p>
                )}
              </div>

              <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-slate-800 uppercase">Last Reminder Triggered</span>
                {lastReminderTriggered ? (
                  <div className="text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">
                        📢 {formatTime12h(lastReminderTriggered.scheduledTime)}: {lastReminderTriggered.medicineName}
                      </p>
                      <p className="text-[10px] text-slate-800 font-semibold">Triggered today at {formatTime12h(lastReminderTriggered.timestamp)}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                      lastReminderTriggered.status === "taken" ? "bg-emerald-50 text-emerald-800 border-emerald-250" :
                      lastReminderTriggered.status === "missed" ? "bg-red-50 text-red-800 border-red-250" :
                      lastReminderTriggered.status === "snoozed" ? "bg-amber-50 text-amber-800 border-amber-250" :
                      "bg-teal-50 text-teal-800 border-teal-250 animate-pulse"
                    }`}>
                      {lastReminderTriggered.status}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-800 italic">No reminders triggered yet today.</p>
                )}
              </div>
            </div>
          </div>

          {/* Reminder History Log */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-slate-850 uppercase tracking-widest flex items-center gap-1.5">
              <History className="h-4 w-4 text-teal-655" />
              Reminder History Log
            </h3>
            
            {reminderHistory.length === 0 ? (
              <p className="text-xs text-slate-800 italic text-center py-6">No reminder operations recorded yet.</p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {reminderHistory.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="p-2.5 rounded-xl border border-slate-150 text-xs flex justify-between items-center bg-white shadow-2xs hover:bg-slate-55 transition-colors">
                    <div className="space-y-0.5 pr-2">
                      <p className="font-bold text-slate-800">{item.medicineName}</p>
                      <p className="text-[10px] text-slate-800 font-semibold">
                        {item.date} • {formatTime12h(item.scheduledTime)} routine
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        item.status === "taken" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                        item.status === "missed" ? "bg-red-50 text-red-800 border-red-200" :
                        item.status === "snoozed" ? "bg-amber-50 text-amber-800 border-amber-200" :
                        "bg-teal-50 text-teal-800 border-teal-200"
                      }`}>
                        {item.status}
                      </span>
                      <p className="text-[9px] text-slate-800 font-semibold mt-0.5">at {formatTime12h(item.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missed Doses Banner */}
          {missedDoses.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-red-955 animate-pulse">
              <AlertCircle className="h-5 w-5 text-red-650 shrink-0 mt-0.5 animate-bounce" />
              <div className="text-xs space-y-1">
                <h4 className="font-bold">Missed Medication Alert</h4>
                <p className="leading-relaxed">
                  Mr. Ramesh has bypassed {missedDoses.length} dose{missedDoses.length > 1 ? "s" : ""} today. Caregivers are notified. Please click "Undo" or mark them taken if delayed.
                </p>
              </div>
            </div>
          )}

          {/* Judge's Demo Controller Panel */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-teal-400 animate-spin" />
                <h3 className="text-sm font-black text-white">Judge's Demo & Test Panel</h3>
              </div>
              <span className="text-[9px] font-black uppercase bg-teal-500/10 border border-teal-500/30 text-teal-400 px-2 py-0.5 rounded-md">
                Fast Testing
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Instantly simulate medication scheduling offsets to test the automatic voice assistant triggers, snooze cycles, and missed dose reports without waiting hours.
            </p>

            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Select Medication</label>
                <select
                  value={selectedDemoMedId}
                  onChange={(e) => setSelectedDemoMedId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-xs font-semibold rounded-lg p-2.5 focus:outline-hidden text-white"
                >
                  {medicines.map(med => (
                    <option key={med.id} value={med.id}>{med.name} ({med.dosage})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Schedule Offset</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleScheduleDemo(1)}
                    className="py-2.5 px-1 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-[10px] font-black tracking-tight transition-all active:scale-95"
                  >
                    ⏰ In 1 Minute
                  </button>
                  <button
                    onClick={() => handleScheduleDemo(2)}
                    className="py-2.5 px-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black tracking-tight transition-all active:scale-95 border border-slate-700"
                  >
                    ⏰ In 2 Minutes
                  </button>
                  <button
                    onClick={() => handleScheduleDemo(5)}
                    className="py-2.5 px-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black tracking-tight transition-all active:scale-95 border border-slate-700"
                  >
                    ⏰ In 5 Minutes
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                <div>
                  <span className="font-bold text-slate-200 block">Fast-Forward Demo Intervals</span>
                  <span className="text-[10px] text-slate-400">1-min snooze/unattended cycles</span>
                </div>
                <button
                  onClick={() => setIsFastDemoMode(!isFastDemoMode)}
                  className={`w-12 h-6.5 rounded-full p-1 transition-all ${isFastDemoMode ? "bg-teal-500" : "bg-slate-700"}`}
                >
                  <div className={`bg-slate-900 w-4.5 h-4.5 rounded-full transition-all ${isFastDemoMode ? "translate-x-5.5" : "translate-x-0"}`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Caregiver status card */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1">
                <Users className="h-4 w-4 shrink-0" />
                Caregiver Synced
              </h4>
              <p className="text-xs text-white font-bold leading-tight pt-1">Primary Connection: {activeProfile.caregiverName}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Logs synced across patient and caregiver views in real time.</p>
            </div>
            <Link 
              href="/caregiver"
              className="text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 py-1.5 px-3 rounded-lg transition-colors shrink-0"
            >
              Open Link
            </Link>
          </div>

        </div>

        {/* Right Column: Today's schedule timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="h-5.5 w-5.5 text-teal-605" />
              Hourly Medication Schedule
            </h2>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold uppercase">
              {todayDoses.length} active doses
            </span>
          </div>

          {todayDoses.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-650 flex items-center justify-center mx-auto">
                <Pill className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-850">No Medication Configured</h3>
              <p className="text-xs text-slate-650 max-w-xs mx-auto">
                No active medication routines exist for this patient profile. Add a medicine or scan a script.
              </p>
              <div className="pt-2">
                <Link
                  href="/add-medicine"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-bold rounded-lg text-white bg-teal-600 hover:bg-teal-700 shadow-xs"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Medicine
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {timeSlots.map((slot) => {
                const slotDoses = todayDoses.filter(d => d.timeSlot === slot.id);
                return (
                  <div key={slot.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    {/* Slot Header */}
                    <div className="bg-slate-50 border-b border-slate-150 px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider capitalize">{slot.name}</h3>
                        <span className="text-[10px] text-slate-800 font-bold">({slot.timeRange})</span>
                      </div>
                      <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full font-bold">
                        {slotDoses.length} Meds
                      </span>
                    </div>

                    {/* Slot Body */}
                    <div className="p-6">
                      {slotDoses.length === 0 ? (
                        <p className="text-xs text-slate-650 italic">No medications scheduled for this routine.</p>
                      ) : (
                        <div className="space-y-4">
                          {slotDoses.map((dose) => (
                            <div
                              key={dose.reminderTimeId}
                              className={`border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:scale-[1.01] hover:shadow-xs transition-all duration-200 ${
                                dose.status === "taken" 
                                  ? "bg-emerald-50/15 border-emerald-200" 
                                  : dose.status === "missed"
                                  ? "bg-red-50/10 border-red-200 animate-pulse"
                                  : "bg-white border-slate-200"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-teal-50 text-teal-600 p-2 shrink-0 border border-teal-100">
                                  <Pill className="h-5 w-5" />
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="text-base font-bold text-slate-900">{dose.medicineName}</h4>
                                  <p className="text-xs text-slate-800 font-medium">
                                    Dosage: <strong className="text-slate-900">{dose.dosage}</strong> at <strong className="text-slate-900">{formatTime12h(dose.exactTime)}</strong>
                                  </p>
                                  {dose.notes && (
                                    <p className="text-[11px] text-slate-800 font-semibold italic mt-1 leading-relaxed">★ Instruction: {dose.notes}</p>
                                  )}
                                  {dose.timestamp && (
                                    <p className="text-[10px] text-emerald-650 font-black pt-1">Logged taken at: {formatTime12h(dose.timestamp.split(" ")[1])}</p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-4 justify-between sm:justify-end">
                                <div>{renderStatusBadge(dose.status)}</div>
                                
                                <div className="flex items-center gap-1.5">
                                  {/* Speech synthesizer quick trigger */}
                                  <button
                                    onClick={() => triggerVoiceReminder(dose.medicineName, dose.dosage, slot.id)}
                                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-850 rounded-lg transition-colors border border-slate-250"
                                    title="Listen to Spoken Caregiver Reminder"
                                  >
                                    <Volume2 className="h-4 w-4 text-teal-650" />
                                  </button>

                                  {dose.status === "pending" ? (
                                    <>
                                      <button
                                        onClick={() => markAsTaken(dose.medicineId, currentDate, slot.id)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-2xs transition-colors"
                                      >
                                        <Check className="h-3.5 w-3.5" />
                                        <span>Taken</span>
                                      </button>
                                      <button
                                        onClick={() => markAsMissed(dose.medicineId, currentDate, slot.id)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-red-750 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                        <span>Miss</span>
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => resetLogStatus(dose.medicineId, currentDate, slot.id)}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-250 transition-colors"
                                    >
                                      <RotateCcw className="h-3.5 w-3.5 text-slate-650" />
                                      <span>Undo</span>
                                    </button>
                                  )}

                                  {/* Edit medicine option */}
                                  <Link
                                    href={`/add-medicine?id=${dose.medicineId}`}
                                    className="p-1.5 text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                    title="Edit medicine schedule"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Link>

                                  {/* Delete medicine option */}
                                  <button
                                    onClick={() => {
                                      if (confirm(`Remove ${dose.medicineName} from the routine schedule?`)) {
                                        deleteMedicine(dose.medicineId);
                                      }
                                    }}
                                    className="p-1.5 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete medicine"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
