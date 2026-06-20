"use client";

import React, { useState, useEffect } from "react";
import { useAppState } from "@/context/AppContext";
import { 
  Volume2, 
  VolumeX, 
  Settings, 
  Check, 
  Clock, 
  AlertCircle,
  HelpCircle,
  Megaphone,
  Pill,
  BellRing
} from "lucide-react";
import Link from "next/link";
import { formatTime12h } from "@/components/ReminderEngine";

export default function VoiceRemindersPage() {
  const { activeProfile, medicines, trackingLogs, markAsTaken } = useAppState();

  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [speechRate, setSpeechRate] = useState(0.82); // Slower friendly speed
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState<string | null>(null); // key of playing item
  
  // Alert Simulator states
  const [activeAlert, setActiveAlert] = useState<{
    medicineId: string;
    name: string;
    dosage: string;
    timeSlot: string;
    notes: string;
    exactTime: string;
  } | null>(null);
  
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentDate(new Date().toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  if (!mounted) return null;

  // Safety check if profile is loaded
  if (!activeProfile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 animate-pulse shadow-sm">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-805">No Patient Profile Loaded</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Please select an existing patient file or register a new one to configure voice reminder schedules.
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

  // Generate today's schedule for voice playback
  interface TodayDose {
    reminderTimeId: string;
    medicineId: string;
    name: string;
    dosage: string;
    notes: string;
    timeSlot: string;
    exactTime: string;
    status: "taken" | "missed" | "pending";
  }

  const todayDoses: TodayDose[] = [];

  medicines.forEach((med) => {
    if (!med.active) return;
    med.reminderTimes.forEach((rt) => {
      const log = trackingLogs.find(
        (l) => l.medicineId === med.id && l.date === currentDate && l.timeSlot === rt.timeSlot
      );
      todayDoses.push({
        reminderTimeId: rt.id,
        medicineId: med.id,
        name: med.name,
        dosage: med.dosage,
        notes: med.notes,
        timeSlot: rt.timeSlot,
        exactTime: rt.time,
        status: log ? log.status : "pending",
      });
    });
  });

  // Get current active English female voice
  const getFemaleVoice = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.startsWith("en"));
    const femaleKeywords = ["google us english", "microsoft zira", "samantha", "victoria", "hazel", "siri", "female", "natural", "zira", "english"];
    for (const keyword of femaleKeywords) {
      const found = englishVoices.find(v => v.name.toLowerCase().includes(keyword));
      if (found) return found;
    }
    return englishVoices[0] || voices[0] || null;
  };

  const playVoiceReminder = (medName: string, dosage: string, timeSlot: string, idKey: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(idKey);

      const slotGreetings = {
        morning: "Good morning",
        afternoon: "Good afternoon",
        evening: "Good evening",
        night: "Good night"
      };
      const slotGreeting = slotGreetings[timeSlot as keyof typeof slotGreetings] || "Hello";

      const speechText = `${slotGreeting}, ${activeProfile.name}. This is your caregiver voice assistant. It is time to take your medication. Please take ${dosage} of ${medName}.`;

      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.rate = speechRate;
      utterance.pitch = speechPitch;

      const voice = getFemaleVoice();
      if (voice) utterance.voice = voice;
      
      utterance.onend = () => {
        setIsPlaying(null);
      };

      utterance.onerror = () => {
        setIsPlaying(null);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Voice synthesis is not supported on this browser.");
    }
  };

  const playGeneralTest = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying("test-general");
      const text = `Hello ${activeProfile.name}. This is Care Companion's voice assistant calibration test. Speed is configured at ${Math.round(speechRate * 100)} percent. This caring female voice is active.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechRate;
      utterance.pitch = speechPitch;

      const voice = getFemaleVoice();
      if (voice) utterance.voice = voice;

      utterance.onend = () => setIsPlaying(null);
      utterance.onerror = () => setIsPlaying(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const triggerSimulation = () => {
    const pendingDoses = todayDoses.filter(d => d.status === "pending");
    const target = pendingDoses.length > 0 
      ? pendingDoses[Math.floor(Math.random() * pendingDoses.length)]
      : todayDoses[0]; 

    if (!target) {
      alert("Please log at least one medicine first!");
      return;
    }

    setActiveAlert({
      medicineId: target.medicineId,
      name: target.name,
      dosage: target.dosage,
      timeSlot: target.timeSlot,
      notes: target.notes,
      exactTime: target.exactTime,
    });
    setIsAlertVisible(true);

    if (!isAudioMuted && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const slotGreetings = {
        morning: "Good morning",
        afternoon: "Good afternoon",
        evening: "Good evening",
        night: "Good night"
      };
      const slotGreeting = slotGreetings[target.timeSlot as keyof typeof slotGreetings] || "Hello";
      
      const speechText = `Attention. ${slotGreeting}, ${activeProfile.name}. Medical schedule alert! It is time to take ${target.dosage} of ${target.name}.`;
      
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.rate = speechRate;
      utterance.pitch = speechPitch;
      
      const voice = getFemaleVoice();
      if (voice) utterance.voice = voice;

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAlertTaken = () => {
    if (activeAlert) {
      markAsTaken(activeAlert.medicineId, currentDate, activeAlert.timeSlot);
      setIsAlertVisible(false);
      
      if (!isAudioMuted && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(`Thank you, ${activeProfile.name}. Dose marked as taken. Caregivers notified.`);
        utterance.rate = speechRate;
        const voice = getFemaleVoice();
        if (voice) utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
      }

      setActiveAlert(null);
    }
  };



  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-800 bg-teal-100/60 border border-teal-200 px-3 py-1 rounded-full uppercase tracking-wider">
              Adherence Cues
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Voice Reminders Active
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1.5">Voice Companion Reminders</h1>
          <p className="text-slate-500 text-xs mt-0.5">Custom text-to-speech loops built for elder visual support and scheduling compliance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Voice engine settings */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <Settings className="h-5 w-5 text-teal-650" />
                Voice Synthesizer Calibration
              </h2>
              {isPlaying && (
                <div className="flex items-end gap-0.5 h-4 shrink-0" title="Audio Synthesis Outputting">
                  <span className="w-0.75 bg-teal-650 h-2 animate-[bounce_0.8s_infinite_100ms] rounded-full"></span>
                  <span className="w-0.75 bg-teal-500 h-4 animate-[bounce_0.8s_infinite_200ms] rounded-full"></span>
                  <span className="w-0.75 bg-sky-500 h-3 animate-[bounce_0.8s_infinite_300ms] rounded-full"></span>
                  <span className="w-0.75 bg-emerald-500 h-1 animate-[bounce_0.8s_infinite_400ms] rounded-full"></span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Rate */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Spoken Pace (Speed)</label>
                <div className="flex items-center gap-3">
                  <input
                    suppressHydrationWarning
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                  <span className="text-xs font-bold text-slate-700 w-10 text-right">{Math.round(speechRate * 100)}%</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">Configured for elder comprehension.</p>
              </div>

              {/* Pitch */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Speaker Frequency (Pitch)</label>
                <div className="flex items-center gap-3">
                  <input
                    suppressHydrationWarning
                    type="range"
                    min="0.7"
                    max="1.3"
                    step="0.05"
                    value={speechPitch}
                    onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                  <span className="text-xs font-bold text-slate-700 w-10 text-right">{Math.round(speechPitch * 100)}%</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">Calibrated for friendly tone ranges.</p>
              </div>

              {/* Test button */}
              <div className="flex items-end">
                <button
                  suppressHydrationWarning
                  onClick={playGeneralTest}
                  disabled={isPlaying !== null}
                  className="w-full py-2.5 px-4 border border-slate-200 text-xs font-bold text-slate-700 bg-slate-55 hover:bg-slate-100 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Volume2 className="h-4 w-4 text-teal-650" />
                  <span>Test Female Voice</span>
                </button>
              </div>
            </div>
          </div>

          {/* Today's Schedule Announcers */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-805 flex items-center gap-1.5">
              <Clock className="h-5 w-5 text-teal-650" />
              Medication Announcement Deck
            </h2>

            {todayDoses.length === 0 ? (
              <div className="text-center py-10 text-slate-400 italic text-xs">
                No medications configured on the current schedule for {activeProfile.name}.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {todayDoses.map((dose) => {
                  const uniqKey = dose.reminderTimeId;
                  const isCurrentPlaying = isPlaying === uniqKey;
                  return (
                    <div key={uniqKey} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0 hover:bg-slate-50/50 rounded-lg transition-colors px-1">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-655 flex items-center justify-center shrink-0 border border-teal-100">
                          <Pill className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{dose.name}</h4>
                          <p className="text-xs text-slate-500 capitalize">
                            {dose.timeSlot} Routine • {dose.dosage} at {formatTime12h(dose.exactTime)}
                          </p>
                          {dose.notes && <p className="text-[10px] text-slate-400 italic mt-0.5">★ Direction: {dose.notes}</p>}
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          suppressHydrationWarning
                          onClick={() => playVoiceReminder(dose.name, dose.dosage, dose.timeSlot, uniqKey)}
                          disabled={isPlaying !== null && !isCurrentPlaying}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                            isCurrentPlaying
                              ? "bg-teal-650 text-white border-teal-655 shadow-xs animate-pulse"
                              : "bg-teal-55 text-teal-700 hover:bg-teal-100 border-teal-200"
                          }`}
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                          <span>{isCurrentPlaying ? "Speaking..." : "Announce"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Simulation launcher */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-teal-800 text-teal-455 flex items-center justify-center">
              <Megaphone className="h-5 w-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Manual Alert Simulator</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Manually trigger a local popup alert to preview how the care engine speaks details out loud in real time.
              </p>
            </div>

            <div className="pt-2">
              <button
                suppressHydrationWarning
                onClick={triggerSimulation}
                className="w-full py-3 px-4 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-350 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-teal-550/10 hover:scale-[1.02]"
              >
                <BellRing className="h-4 w-4 text-slate-950 animate-bounce" />
                <span>Trigger Manual Simulation</span>
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
              <span>Speech Voice Output</span>
              <button 
                suppressHydrationWarning
                onClick={() => setIsAudioMuted(!isAudioMuted)} 
                className="text-teal-455 hover:underline font-semibold"
              >
                {isAudioMuted ? "Unmute Spoken Cues" : "Mute Spoken Cues"}
              </button>
            </div>
          </div>

          {/* Active notification card */}
          {isAlertVisible && activeAlert && (
            <div className="bg-white border-2 border-red-500 rounded-2xl p-6 shadow-xl space-y-4 animate-bounce relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-650 flex items-center justify-center shrink-0 border border-red-100">
                  <BellRing className="h-5 w-5 text-red-500 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                    REMINDER DUE NOW
                  </span>
                  
                  <h4 className="text-sm font-bold text-slate-900 pt-2">
                    {activeProfile.name}, your medication is due now.
                  </h4>
                  
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 text-xs text-slate-700 mt-2 space-y-1">
                    <p>💊 <strong className="text-slate-800">{activeAlert.name}</strong> • {activeAlert.dosage}</p>
                    <p>🕒 Scheduled Slot: <span className="capitalize font-semibold">{activeAlert.timeSlot} routine</span> ({formatTime12h(activeAlert.exactTime)})</p>
                    {activeAlert.notes && <p className="italic text-slate-400 text-[10px] pt-1">★ Note: {activeAlert.notes}</p>}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  suppressHydrationWarning
                  onClick={handleAlertTaken}
                  className="flex-1 py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Mark as Taken</span>
                </button>
                <button
                  suppressHydrationWarning
                  onClick={() => setIsAlertVisible(false)}
                  className="py-2 px-3 text-xs font-semibold text-slate-550 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                >
                  Snooze
                </button>
              </div>
            </div>
          )}

          {/* Guide box */}
          <div className="bg-teal-50 border border-teal-150 rounded-2xl p-4 flex gap-3 text-teal-950">
            <HelpCircle className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-bold">Presentation Tip</h4>
              <p className="leading-relaxed">
                Use the synthesizer calibration sliders to demonstrate voice speeds and pitch adjustments suitable for geriatric users with hearing impairments.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
