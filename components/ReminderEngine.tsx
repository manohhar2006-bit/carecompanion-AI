"use client";

import { useEffect, useRef } from "react";
import { useAppState, ActiveReminder, ReminderHistoryItem, CaregiverAlert } from "@/context/AppContext";

// Helper to convert 24h time to 12h AM/PM
export const formatTime12h = (time24: string) => {
  if (!time24) return "";
  const [hourStr, minStr] = time24.split(":");
  const hour = parseInt(hourStr);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minStr} ${ampm}`;
};

export default function ReminderEngine() {
  const {
    activeProfile,
    medicines,
    trackingLogs,
    activeReminders,
    isFastDemoMode,
    setActiveReminders,
    setReminderHistory,
    setCaregiverAlerts,
    setVoiceReminderStatus,
    setLastReminderTriggered,
    markAsMissed
  } = useAppState();

  const processedKeys = useRef<Set<string>>(new Set());

  // Function to search and trigger Web Speech API with female voices
  const speakReminder = (medName: string, timeSlot: string, patientName: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setVoiceReminderStatus("Inactive • Speech Synthesis unsupported");
      return;
    }

    const greetings = {
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
      night: "Good night"
    };
    const greeting = greetings[timeSlot as keyof typeof greetings] || "Hello";
    
    // Friendly, caring clinical reminder message
    const speechText = `${greeting} ${patientName}. This is your Care Companion. Please remember to take your medication. It is time to take your ${medName}.`;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.82; // Slower pace for easy comprehension
    utterance.pitch = 1.05; // Slightly higher friendly tone

    // Natural English female voice keywords
    const femaleKeywords = ["google us english", "microsoft zira", "samantha", "victoria", "hazel", "siri", "female", "natural", "zira", "english"];
    
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.startsWith("en"));
    
    let selectedVoice = null;
    for (const keyword of femaleKeywords) {
      const found = englishVoices.find(v => v.name.toLowerCase().includes(keyword));
      if (found) {
        selectedVoice = found;
        break;
      }
    }

    if (!selectedVoice && englishVoices.length > 0) {
      selectedVoice = englishVoices[0];
    }
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      setVoiceReminderStatus(`Speaking • Female Voice: ${selectedVoice.name}`);
    } else {
      setVoiceReminderStatus("Speaking • Standard English Voice");
    }

    utterance.onend = () => {
      setVoiceReminderStatus(selectedVoice ? `Active • Female Voice: ${selectedVoice.name}` : "Active • Standard Voice");
    };

    utterance.onerror = () => {
      setVoiceReminderStatus("Active • Synthesis Error");
    };

    window.speechSynthesis.speak(utterance);
  };

  // 1. Check for new scheduled reminders matches
  useEffect(() => {
    if (!activeProfile) return;

    const timer = setInterval(() => {
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const currentHHMM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      medicines.forEach(med => {
        if (!med.active) return;
        
        med.reminderTimes.forEach(rt => {
          if (rt.time === currentHHMM) {
            const matchKey = `${med.id}-${rt.timeSlot}-${todayStr}-${currentHHMM}`;
            if (processedKeys.current.has(matchKey)) return;

            // Check if already completed/missed in tracking log
            const existingLog = trackingLogs.find(
              l => l.medicineId === med.id && 
                   l.date === todayStr && 
                   l.timeSlot === rt.timeSlot && 
                   (l.status === "taken" || l.status === "missed")
            );
            if (existingLog) return;

            // Check if already active in modal
            const isAlreadyActive = activeReminders.some(
              r => r.medicineId === med.id && 
                   r.timeSlot === rt.timeSlot && 
                   r.date === todayStr
            );
            if (isAlreadyActive) return;

            // Mark as processed
            processedKeys.current.add(matchKey);

            // Set countdown durations (5 minutes or 1 minute in demo mode)
            const intervalMs = isFastDemoMode ? 1 * 60 * 1000 : 5 * 60 * 1000;
            
            const newReminder: ActiveReminder = {
              id: `rem-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              medicineId: med.id,
              medicineName: med.name,
              dosage: med.dosage,
              timeSlot: rt.timeSlot,
              scheduledTime: rt.time,
              date: todayStr,
              triggerCount: 1,
              lastTriggeredTime: Date.now(),
              nextTriggerTime: Date.now() + intervalMs,
              status: "active",
              notes: med.notes
            };

            // Insert into active reminders list
            setActiveReminders(prev => [...prev, newReminder]);

            // Add history entry
            const historyItem: ReminderHistoryItem = {
              id: `hist-${Date.now()}`,
              medicineId: med.id,
              medicineName: med.name,
              dosage: med.dosage,
              timeSlot: rt.timeSlot,
              scheduledTime: rt.time,
              timestamp: currentHHMM,
              date: todayStr,
              status: "triggered"
            };
            setReminderHistory(prev => [historyItem, ...prev]);
            setLastReminderTriggered(historyItem);

            // Announce automatically
            speakReminder(med.name, rt.timeSlot, activeProfile.name);
          }
        });
      });

      // Periodically clean old keys from memory (every hour)
      if (now.getSeconds() === 0 && now.getMinutes() === 0) {
        processedKeys.current.clear();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeProfile, medicines, trackingLogs, activeReminders, isFastDemoMode]);

  // 2. Manage ongoing ActiveReminders count-down (Snooze + Unattended escalations)
  useEffect(() => {
    if (!activeProfile) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const todayStr = new Date().toISOString().split("T")[0];
      const currentHHMM = `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`;

      setActiveReminders(prev => {
        let changed = false;
        
        const updated = prev.map(reminder => {
          if (reminder.status !== "active" && reminder.status !== "snoozed") {
            return reminder;
          }

          // Check if time to trigger again (5 mins or 1 min in demo)
          if (now >= reminder.nextTriggerTime) {
            changed = true;
            const nextInterval = isFastDemoMode ? 1 * 60 * 1000 : 5 * 60 * 1000;

            if (reminder.triggerCount < 3) {
              // Trigger reminder #2 or #3
              const newTriggerCount = reminder.triggerCount + 1;
              speakReminder(reminder.medicineName, reminder.timeSlot, activeProfile.name);

              // Log trigger recurrence in history
              const historyItem: ReminderHistoryItem = {
                id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                medicineId: reminder.medicineId,
                medicineName: reminder.medicineName,
                dosage: reminder.dosage,
                timeSlot: reminder.timeSlot,
                scheduledTime: reminder.scheduledTime,
                timestamp: currentHHMM,
                date: todayStr,
                status: "triggered"
              };
              setReminderHistory(h => [historyItem, ...h]);
              setLastReminderTriggered(historyItem);

              return {
                ...reminder,
                triggerCount: newTriggerCount,
                lastTriggeredTime: now,
                nextTriggerTime: now + nextInterval,
                status: "active" as const // Awake popup modal!
              };
            } else {
              // Missed medicine threshold reached (No response after 3 triggers)
              markAsMissed(reminder.medicineId, reminder.date, reminder.timeSlot);

              // Create caregiver alert
              const caregiverMsg = `${activeProfile.name} missed ${activeProfile.gender === "Female" ? "her" : activeProfile.gender === "Male" ? "his" : "their"} ${formatTime12h(reminder.scheduledTime)} medicine.`;
              const newAlert: CaregiverAlert = {
                id: `alert-${Date.now()}`,
                patientId: activeProfile.id,
                message: caregiverMsg,
                timestamp: currentHHMM,
                date: reminder.date,
                medicineId: reminder.medicineId,
                exactTime: reminder.scheduledTime
              };
              setCaregiverAlerts(alerts => [newAlert, ...alerts]);

              // Log missed in history
              const historyItem: ReminderHistoryItem = {
                id: `hist-${Date.now()}`,
                medicineId: reminder.medicineId,
                medicineName: reminder.medicineName,
                dosage: reminder.dosage,
                timeSlot: reminder.timeSlot,
                scheduledTime: reminder.scheduledTime,
                timestamp: currentHHMM,
                date: todayStr,
                status: "missed"
              };
              setReminderHistory(h => [historyItem, ...h]);
              setLastReminderTriggered(historyItem);

              return {
                ...reminder,
                status: "missed" as const
              };
            }
          }
          return reminder;
        });

        // Filter out completed and missed reminders immediately
        const remaining = updated.filter(r => r.status === "active" || r.status === "snoozed");
        if (remaining.length !== prev.length || changed) {
          return remaining;
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeProfile, isFastDemoMode]);

  // Load voices initially so they are ready
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => {
        const voices = window.speechSynthesis.getVoices();
        const englishVoices = voices.filter(v => v.lang.startsWith("en"));
        const femaleKeywords = ["google us english", "microsoft zira", "samantha", "victoria", "hazel", "siri", "female", "natural", "zira", "english"];
        let bestVoice = englishVoices[0];
        for (const kw of femaleKeywords) {
          const found = englishVoices.find(v => v.name.toLowerCase().includes(kw));
          if (found) {
            bestVoice = found;
            break;
          }
        }
        if (bestVoice) {
          setVoiceReminderStatus(`Active • Female Voice: ${bestVoice.name}`);
        } else {
          setVoiceReminderStatus("Active • Standard Voice Loaded");
        }
      };
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      handleVoicesChanged();
    }
  }, []);

  return null; // Silent background engine
}
