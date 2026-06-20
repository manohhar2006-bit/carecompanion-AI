"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string; // Medical Condition / Notes
  caregiverName: string; // Primary Caregiver Name
  language: string; // Preferred Reminder Language
  reminderStyle: "voice" | "popup" | "both";
  doctorName: string;
  clinicName: string;
  precautions: string;
  followUpDate: string;
}

export interface ReminderTime {
  id: string;
  timeSlot: "morning" | "afternoon" | "evening" | "night";
  time: string; // e.g. "08:00" (24h format)
}

export interface Medicine {
  id: string;
  patientId: string; // link to profile
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: string[]; // e.g. ["morning", "afternoon", "evening", "night"] (keeps compatibility)
  exactTime: string; // e.g. "08:00" (keeps compatibility)
  reminderTimes: ReminderTime[]; // new advanced field
  duration: number; // in days
  startDate: string; // YYYY-MM-DD
  notes: string;
  active: boolean;
}

export interface TrackingLog {
  id: string;
  patientId: string; // link to profile
  date: string; // YYYY-MM-DD
  medicineId: string;
  timeSlot: string; // "morning" | "afternoon" | "evening" | "night"
  status: "taken" | "missed" | "pending";
  timestamp?: string; // YYYY-MM-DD HH:MM
}

export interface SymptomLog {
  id: string;
  patientId: string; // link to profile
  date: string;
  severity: "mild" | "moderate" | "severe";
  notes: string;
}

export interface ActiveReminder {
  id: string; // Unique trigger ID
  medicineId: string;
  medicineName: string;
  dosage: string;
  timeSlot: "morning" | "afternoon" | "evening" | "night";
  scheduledTime: string; // "HH:MM"
  date: string; // "YYYY-MM-DD"
  triggerCount: number; // 1, 2, or 3
  lastTriggeredTime: number; // timestamp in ms
  nextTriggerTime: number; // timestamp in ms
  status: "active" | "snoozed" | "taken" | "missed";
  notes?: string;
  isDemo?: boolean;
}

export interface ReminderHistoryItem {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  timeSlot: string;
  scheduledTime: string;
  timestamp: string; // "HH:MM" or datetime
  date: string; // "YYYY-MM-DD"
  status: "triggered" | "snoozed" | "taken" | "missed";
}

export interface CaregiverAlert {
  id: string;
  patientId: string;
  message: string;
  timestamp: string;
  date: string;
  medicineId: string;
  exactTime: string;
}

interface AppContextType {
  profiles: PatientProfile[];
  activeProfileId: string | null;
  activeProfile: PatientProfile | null;
  medicines: Medicine[]; // Filtered by activeProfileId
  allMedicines: Medicine[]; // Full list
  trackingLogs: TrackingLog[]; // Filtered by activeProfileId
  allTrackingLogs: TrackingLog[]; // Full list
  symptomLogs: SymptomLog[]; // Filtered by activeProfileId
  allSymptomLogs: SymptomLog[]; // Full list
  
  // Reminder States
  activeReminders: ActiveReminder[];
  reminderHistory: ReminderHistoryItem[];
  caregiverAlerts: CaregiverAlert[];
  isFastDemoMode: boolean;
  voiceReminderStatus: string;
  lastReminderTriggered: ReminderHistoryItem | null;
  
  // Actions
  addMedicine: (medicine: Omit<Medicine, "id" | "active" | "patientId" | "reminderTimes"> & { reminderTimes?: ReminderTime[] }) => void;
  addMedicines: (medicines: (Omit<Medicine, "id" | "active" | "patientId" | "reminderTimes"> & { reminderTimes?: ReminderTime[] })[]) => void;
  updateMedicine: (id: string, updated: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  markAsTaken: (medicineId: string, date: string, timeSlot: string) => void;
  markAsMissed: (medicineId: string, date: string, timeSlot: string) => void;
  resetLogStatus: (medicineId: string, date: string, timeSlot: string) => void;
  addSymptomLog: (log: Omit<SymptomLog, "id" | "patientId">) => void;
  deleteSymptomLog: (id: string) => void;
  selectProfile: (id: string) => void;
  createProfile: (profile: Omit<PatientProfile, "id">) => void;
  updateProfile: (id: string, updated: Partial<PatientProfile>) => void;
  deleteProfile: (id: string) => void;

  // Reminder Setters & Handlers
  setActiveReminders: React.Dispatch<React.SetStateAction<ActiveReminder[]>>;
  setReminderHistory: React.Dispatch<React.SetStateAction<ReminderHistoryItem[]>>;
  setCaregiverAlerts: React.Dispatch<React.SetStateAction<CaregiverAlert[]>>;
  setIsFastDemoMode: (enabled: boolean) => void;
  setVoiceReminderStatus: (status: string) => void;
  setLastReminderTriggered: (item: ReminderHistoryItem | null) => void;
  clearAlertsForPatient: (patientId: string) => void;
}

// Truly unique ID generator with fallback
export const generateUniqueId = (prefix: string = "") => {
  let uuid = "";
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    uuid = window.crypto.randomUUID();
  } else {
    // Robust high-entropy fallback using high-resolution performance timer + multiple random strings
    const randomStr1 = Math.random().toString(36).substring(2, 11);
    const randomStr2 = Math.random().toString(36).substring(2, 11);
    const timestamp = Date.now();
    uuid = `${timestamp}-${randomStr1}-${randomStr2}`;
  }
  return prefix ? `${prefix}-${uuid}` : uuid;
};

// Seed Patient Profiles
const defaultProfiles: PatientProfile[] = [
  {
    id: "profile-ramesh",
    name: "Mr. Ramesh",
    age: 72,
    gender: "Male",
    condition: "Blood Pressure & Hypertension",
    caregiverName: "Anil",
    language: "English",
    reminderStyle: "both",
    doctorName: "Dr. Sarah Alcott",
    clinicName: "Metro Health Cardiology Clinic",
    precautions: "Maintain low sodium diet, avoid refined sugars, and walk 30 minutes daily.",
    followUpDate: "2026-07-15",
  },
  {
    id: "profile-kamla",
    name: "Mrs. Kamla",
    age: 68,
    gender: "Female",
    condition: "Type-2 Diabetes Mellitus",
    caregiverName: "Priya",
    language: "Hindi & English",
    reminderStyle: "both",
    doctorName: "Dr. Keith Miller",
    clinicName: "Endocrinology Care Center",
    precautions: "Check blood glucose twice daily. Avoid high glycemic load foods.",
    followUpDate: "2026-07-20",
  }
];

// Seed Medicines associated with Ramesh & Kamla
const defaultMedicines: Medicine[] = [
  // Mr. Ramesh medicines
  {
    id: "med-1",
    patientId: "profile-ramesh",
    name: "Amlodipine (BP tablet)",
    dosage: "5mg",
    frequency: "Daily",
    timeOfDay: ["morning"],
    exactTime: "08:00",
    reminderTimes: [
      { id: "rt-med-1-morning", timeSlot: "morning", time: "08:00" }
    ],
    duration: 30,
    startDate: "2026-06-15",
    notes: "Take after breakfast",
    active: true,
  },
  {
    id: "med-2",
    patientId: "profile-ramesh",
    name: "Metformin (Sugar tablet)",
    dosage: "500mg",
    frequency: "Daily",
    timeOfDay: ["afternoon"],
    exactTime: "13:00",
    reminderTimes: [
      { id: "rt-med-2-afternoon", timeSlot: "afternoon", time: "13:00" }
    ],
    duration: 60,
    startDate: "2026-06-15",
    notes: "Take with lunch",
    active: true,
  },
  {
    id: "med-3",
    patientId: "profile-ramesh",
    name: "Vitamin D3",
    dosage: "1000 IU",
    frequency: "Daily",
    timeOfDay: ["night"],
    exactTime: "20:00",
    reminderTimes: [
      { id: "rt-med-3-night", timeSlot: "night", time: "20:00" }
    ],
    duration: 90,
    startDate: "2026-06-15",
    notes: "Take after dinner",
    active: true,
  },
  // Mrs. Kamla medicines
  {
    id: "med-4",
    patientId: "profile-kamla",
    name: "Glipizide",
    dosage: "5mg",
    frequency: "Daily",
    timeOfDay: ["morning"],
    exactTime: "07:30",
    reminderTimes: [
      { id: "rt-med-4-morning", timeSlot: "morning", time: "07:30" }
    ],
    duration: 30,
    startDate: "2026-06-16",
    notes: "Take 30 mins before breakfast",
    active: true,
  },
  {
    id: "med-5",
    patientId: "profile-kamla",
    name: "Atorvastatin",
    dosage: "20mg",
    frequency: "Daily",
    timeOfDay: ["night"],
    exactTime: "21:00",
    reminderTimes: [
      { id: "rt-med-5-night", timeSlot: "night", time: "21:00" }
    ],
    duration: 60,
    startDate: "2026-06-16",
    notes: "Take before bedtime",
    active: true,
  }
];

// Seed initial tracking logs matching 2026-06-18
const defaultLogs: TrackingLog[] = [
  {
    id: "log-1",
    patientId: "profile-ramesh",
    date: "2026-06-18",
    medicineId: "med-1",
    timeSlot: "morning",
    status: "taken",
    timestamp: "2026-06-18 08:15",
  },
  {
    id: "log-2",
    patientId: "profile-ramesh",
    date: "2026-06-18",
    medicineId: "med-2",
    timeSlot: "afternoon",
    status: "missed",
  },
  {
    id: "log-3",
    patientId: "profile-ramesh",
    date: "2026-06-18",
    medicineId: "med-3",
    timeSlot: "night",
    status: "pending",
  },
  {
    id: "log-4",
    patientId: "profile-kamla",
    date: "2026-06-18",
    medicineId: "med-4",
    timeSlot: "morning",
    status: "taken",
    timestamp: "2026-06-18 07:45",
  },
  {
    id: "log-5",
    patientId: "profile-kamla",
    date: "2026-06-18",
    medicineId: "med-5",
    timeSlot: "night",
    status: "pending",
  }
];

const defaultSymptomLogs: SymptomLog[] = [
  {
    id: "sym-1",
    patientId: "profile-ramesh",
    date: "2026-06-16",
    severity: "mild",
    notes: "Slight headache in the afternoon, subsided after rest.",
  },
  {
    id: "sym-2",
    patientId: "profile-ramesh",
    date: "2026-06-17",
    severity: "mild",
    notes: "Felt slightly dizzy after morning medication. BP read 132/84.",
  },
  {
    id: "sym-3",
    patientId: "profile-kamla",
    date: "2026-06-17",
    severity: "moderate",
    notes: "Post-lunch blood sugar read 185. Rested for 1 hour.",
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<PatientProfile[]>(defaultProfiles);
  const [activeProfileId, setActiveProfileId] = useState<string | null>("profile-ramesh");
  const [allMedicines, setAllMedicines] = useState<Medicine[]>(defaultMedicines);
  const [allTrackingLogs, setAllTrackingLogs] = useState<TrackingLog[]>(defaultLogs);
  const [allSymptomLogs, setAllSymptomLogs] = useState<SymptomLog[]>(defaultSymptomLogs);
  
  // Reminder States
  const [activeReminders, setActiveReminders] = useState<ActiveReminder[]>([]);
  const [reminderHistory, setReminderHistory] = useState<ReminderHistoryItem[]>([]);
  const [caregiverAlerts, setCaregiverAlerts] = useState<CaregiverAlert[]>([]);
  const [isFastDemoMode, setIsFastDemoMode] = useState<boolean>(true); // default true for presentation
  const [voiceReminderStatus, setVoiceReminderStatus] = useState<string>("Active • Voice Synthesizer Ready");
  const [lastReminderTriggered, setLastReminderTriggered] = useState<ReminderHistoryItem | null>(null);

  const [isHydrated, setIsHydrated] = useState(false);

  // Load from LocalStorage & Self-Healing Database Migration
  useEffect(() => {
    try {
      const storedProfiles = localStorage.getItem("cc_profiles");
      const storedActiveId = localStorage.getItem("cc_activeProfileId");
      const storedMeds = localStorage.getItem("cc_allMedicines");
      const storedLogs = localStorage.getItem("cc_allTrackingLogs");
      const storedSymptoms = localStorage.getItem("cc_allSymptomLogs");

      const storedActiveReminders = localStorage.getItem("cc_activeReminders");
      const storedReminderHistory = localStorage.getItem("cc_reminderHistory");
      const storedCaregiverAlerts = localStorage.getItem("cc_caregiverAlerts");
      const storedFastDemo = localStorage.getItem("cc_isFastDemoMode");

      if (storedProfiles) setProfiles(JSON.parse(storedProfiles));
      if (storedActiveId) setActiveProfileId(JSON.parse(storedActiveId));
      if (storedLogs) setAllTrackingLogs(JSON.parse(storedLogs));
      if (storedSymptoms) setAllSymptomLogs(JSON.parse(storedSymptoms));

      if (storedActiveReminders) setActiveReminders(JSON.parse(storedActiveReminders));
      if (storedReminderHistory) setReminderHistory(JSON.parse(storedReminderHistory));
      if (storedCaregiverAlerts) setCaregiverAlerts(JSON.parse(storedCaregiverAlerts));
      if (storedFastDemo) setIsFastDemoMode(JSON.parse(storedFastDemo));

      // Load medicines & perform migration checks
      let loadedMeds: Medicine[] = storedMeds ? JSON.parse(storedMeds) : defaultMedicines;
      let loadedLogs: TrackingLog[] = storedLogs ? JSON.parse(storedLogs) : defaultLogs;

      // 1. Ensure all medicines have the new reminderTimes structure
      loadedMeds = loadedMeds.map(m => {
        if (!m.reminderTimes || m.reminderTimes.length === 0) {
          const slot = (m.timeOfDay && m.timeOfDay[0]) || "morning";
          const time = m.exactTime || "08:00";
          return {
            ...m,
            reminderTimes: [{ id: generateUniqueId("rt"), timeSlot: slot as any, time }]
          };
        }
        return m;
      });

      // 2. SELF-HEALING DATABASE MIGRATION FOR DUPLICATE MEDICINE IDs
      const seenIds = new Set<string>();
      const duplicateIds = new Set<string>();
      
      loadedMeds.forEach(m => {
        if (seenIds.has(m.id)) {
          duplicateIds.add(m.id);
        }
        seenIds.add(m.id);
      });

      if (duplicateIds.size > 0) {
        console.warn("Self-Healing Migration: Duplicate medicine IDs detected, resolving duplicates...", Array.from(duplicateIds));
        
        const medIdMap = new Map<string, string>(); // maps old duplicate index key -> new unique ID
        const finalSeenIds = new Set<string>();

        const resolvedMeds = loadedMeds.map((med, index) => {
          if (finalSeenIds.has(med.id)) {
            // Duplicate instance found! Generate a new unique ID
            const newId = generateUniqueId("med");
            medIdMap.set(`${med.id}-${index}`, newId);
            finalSeenIds.add(newId);
            return {
              ...med,
              id: newId
            };
          }
          finalSeenIds.add(med.id);
          return med;
        });

        // Update tracking logs to match the newly generated unique medicine IDs
        const resolvedLogs = loadedLogs.map(log => {
          // Find if this log matched a duplicated medicine that got reassigned
          let updatedMedId = log.medicineId;
          
          loadedMeds.forEach((originalMed, idx) => {
            if (originalMed.id === log.medicineId && medIdMap.has(`${originalMed.id}-${idx}`)) {
              // Map the log to the new medicine ID
              updatedMedId = medIdMap.get(`${originalMed.id}-${idx}`)!;
            }
          });

          return {
            ...log,
            medicineId: updatedMedId
          };
        });

        loadedMeds = resolvedMeds;
        loadedLogs = resolvedLogs;
      }

      // 3. SELF-HEALING DATABASE MIGRATION FOR DUPLICATE REMINDER TIME IDs GLOBALLY
      const seenRtIds = new Set<string>();
      let migratedRtCount = 0;

      loadedMeds = loadedMeds.map(m => {
        if (m.reminderTimes) {
          const updatedRtList = m.reminderTimes.map(rt => {
            if (!rt.id || seenRtIds.has(rt.id) || rt.id.startsWith("rt-init-") || rt.id.startsWith("rt-mig-")) {
              const newRtId = generateUniqueId("rt");
              seenRtIds.add(newRtId);
              migratedRtCount++;
              return {
                ...rt,
                id: newRtId
              };
            }
            seenRtIds.add(rt.id);
            return rt;
          });
          return {
            ...m,
            reminderTimes: updatedRtList
          };
        }
        return m;
      });

      if (duplicateIds.size > 0 || migratedRtCount > 0) {
        console.warn(`Self-Healing Migration: Completed updates. Fixed duplicates (meds: ${duplicateIds.size > 0}, reminderTimes: ${migratedRtCount})`);
        localStorage.setItem("cc_allMedicines", JSON.stringify(loadedMeds));
        localStorage.setItem("cc_allTrackingLogs", JSON.stringify(loadedLogs));
      }

      setAllMedicines(loadedMeds);
      setAllTrackingLogs(loadedLogs);

    } catch (e) {
      console.error("Failed to load or migrate local storage data", e);
    }
    setIsHydrated(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("cc_profiles", JSON.stringify(profiles));
  }, [profiles, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("cc_activeProfileId", JSON.stringify(activeProfileId));
  }, [activeProfileId, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("cc_allMedicines", JSON.stringify(allMedicines));
  }, [allMedicines, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("cc_allTrackingLogs", JSON.stringify(allTrackingLogs));
  }, [allTrackingLogs, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("cc_allSymptomLogs", JSON.stringify(allSymptomLogs));
  }, [allSymptomLogs, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("cc_activeReminders", JSON.stringify(activeReminders));
  }, [activeReminders, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("cc_reminderHistory", JSON.stringify(reminderHistory));
  }, [reminderHistory, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("cc_caregiverAlerts", JSON.stringify(caregiverAlerts));
  }, [caregiverAlerts, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("cc_isFastDemoMode", JSON.stringify(isFastDemoMode));
  }, [isFastDemoMode, isHydrated]);

  // Compute active profile
  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

  // Filter lists by active profile
  const medicines = allMedicines.filter(m => m.patientId === activeProfileId);
  const trackingLogs = allTrackingLogs.filter(l => l.patientId === activeProfileId);
  const symptomLogs = allSymptomLogs.filter(s => s.patientId === activeProfileId);

  // Profile management
  const selectProfile = (id: string) => {
    setActiveProfileId(id);
  };

  const createProfile = (profile: Omit<PatientProfile, "id">) => {
    // Generate unique ID with prefix protection
    const newId = generateUniqueId("profile");
    const newProfile: PatientProfile = {
      ...profile,
      id: newId,
    };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
  };

  const updateProfile = (id: string, updated: Partial<PatientProfile>) => {
    setProfiles(prev =>
      prev.map(p => p.id === id ? { ...p, ...updated } : p)
    );
  };

  const deleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    setAllMedicines(prev => prev.filter(m => m.patientId !== id));
    setAllTrackingLogs(prev => prev.filter(l => l.patientId !== id));
    setAllSymptomLogs(prev => prev.filter(s => s.patientId !== id));
    if (activeProfileId === id) {
      setActiveProfileId(profiles.find(p => p.id !== id)?.id || null);
    }
  };

  // Medicine management
  const addMedicine = (medicine: Omit<Medicine, "id" | "active" | "patientId" | "reminderTimes"> & { reminderTimes?: ReminderTime[] }) => {
    if (!activeProfileId) return;
    
    // Generate unique sub-IDs for reminderTimes, ensuring no temporary or duplicated static keys
    const computedReminderTimes = (medicine.reminderTimes || medicine.timeOfDay.map((slot) => ({
      id: generateUniqueId("rt"),
      timeSlot: slot as any,
      time: medicine.exactTime || "08:00"
    }))).map(rt => {
      if (!rt.id || rt.id.startsWith("rt-init-") || rt.id.startsWith("rt-mig-")) {
        return { ...rt, id: generateUniqueId("rt") };
      }
      return rt;
    });

    // Ensure we create a truly unique medicine ID and verify it doesn't already exist
    let medId = generateUniqueId("med");
    while (allMedicines.some(m => m.id === medId)) {
      medId = generateUniqueId("med");
    }

    const newMed: Medicine = {
      ...medicine,
      id: medId,
      patientId: activeProfileId,
      active: true,
      reminderTimes: computedReminderTimes
    };
    
    setAllMedicines((prev) => [...prev, newMed]);

    const todayStr = new Date().toISOString().split("T")[0];
    const newLogs: TrackingLog[] = newMed.reminderTimes.map((rt) => ({
      id: generateUniqueId("log"),
      patientId: activeProfileId,
      date: todayStr,
      medicineId: newMed.id,
      timeSlot: rt.timeSlot,
      status: "pending",
    }));

    setAllTrackingLogs((prev) => [...prev, ...newLogs]);
  };

  const addMedicines = (newMedsInput: (Omit<Medicine, "id" | "active" | "patientId" | "reminderTimes"> & { reminderTimes?: ReminderTime[] })[]) => {
    if (!activeProfileId) return;

    const addedMeds: Medicine[] = [];
    const addedLogs: TrackingLog[] = [];
    const todayStr = new Date().toISOString().split("T")[0];
    const generatedIds = new Set<string>();

    newMedsInput.forEach((medicine) => {
      // Generate unique sub-IDs for reminderTimes
      const computedReminderTimes = (medicine.reminderTimes || medicine.timeOfDay.map((slot) => ({
        id: generateUniqueId("rt"),
        timeSlot: slot as any,
        time: medicine.exactTime || "08:00"
      }))).map(rt => {
        if (!rt.id || rt.id.startsWith("rt-init-") || rt.id.startsWith("rt-mig-")) {
          return { ...rt, id: generateUniqueId("rt") };
        }
        return rt;
      });

      // Ensure we create a truly unique medicine ID and verify it doesn't already exist
      let medId = generateUniqueId("med");
      while (allMedicines.some(m => m.id === medId) || generatedIds.has(medId)) {
        medId = generateUniqueId("med");
      }
      generatedIds.add(medId);

      const newMed: Medicine = {
        ...medicine,
        id: medId,
        patientId: activeProfileId,
        active: true,
        reminderTimes: computedReminderTimes
      };
      addedMeds.push(newMed);

      newMed.reminderTimes.forEach((rt) => {
        addedLogs.push({
          id: generateUniqueId("log"),
          patientId: activeProfileId,
          date: todayStr,
          medicineId: newMed.id,
          timeSlot: rt.timeSlot,
          status: "pending",
        });
      });
    });

    setAllMedicines((prev) => [...prev, ...addedMeds]);
    setAllTrackingLogs((prev) => [...prev, ...addedLogs]);
  };

  const updateMedicine = (id: string, updated: Partial<Medicine>) => {
    setAllMedicines((prev) =>
      prev.map((med) => (med.id === id ? { ...med, ...updated } : med))
    );
  };

  const deleteMedicine = (id: string) => {
    setAllMedicines((prev) => prev.filter((med) => med.id !== id));
    setAllTrackingLogs((prev) => prev.filter((log) => log.medicineId !== id));
    setActiveReminders((prev) => prev.filter((ar) => ar.medicineId !== id));
  };

  // Log management
  const markAsTaken = (medicineId: string, date: string, timeSlot: string) => {
    if (!activeProfileId) return;
    setAllTrackingLogs((prev) => {
      const existingIndex = prev.findIndex(
        (log) =>
          log.medicineId === medicineId &&
          log.date === date &&
          log.timeSlot === timeSlot &&
          log.patientId === activeProfileId
      );

      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(now.getDate()).padStart(2, "0")} ${String(
        now.getHours()
      ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status: "taken",
          timestamp: timeStr,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: generateUniqueId("log"),
            patientId: activeProfileId,
            date,
            medicineId,
            timeSlot,
            status: "taken",
            timestamp: timeStr,
          },
        ];
      }
    });
  };

  const markAsMissed = (medicineId: string, date: string, timeSlot: string) => {
    if (!activeProfileId) return;
    setAllTrackingLogs((prev) => {
      const existingIndex = prev.findIndex(
        (log) =>
          log.medicineId === medicineId &&
          log.date === date &&
          log.timeSlot === timeSlot &&
          log.patientId === activeProfileId
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status: "missed",
          timestamp: undefined,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: generateUniqueId("log"),
            patientId: activeProfileId,
            date,
            medicineId,
            timeSlot,
            status: "missed",
          },
        ];
      }
    });
  };

  const resetLogStatus = (medicineId: string, date: string, timeSlot: string) => {
    if (!activeProfileId) return;
    setAllTrackingLogs((prev) => {
      const existingIndex = prev.findIndex(
        (log) =>
          log.medicineId === medicineId &&
          log.date === date &&
          log.timeSlot === timeSlot &&
          log.patientId === activeProfileId
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status: "pending",
          timestamp: undefined,
        };
        return updated;
      }
      return prev;
    });

    // Clear active/snoozed reminders matching this
    setActiveReminders((prev) => prev.filter(ar => !(ar.medicineId === medicineId && ar.timeSlot === timeSlot)));
  };

  // Symptom management
  const addSymptomLog = (log: Omit<SymptomLog, "id" | "patientId">) => {
    if (!activeProfileId) return;
    const newLog: SymptomLog = {
      ...log,
      id: generateUniqueId("sym"),
      patientId: activeProfileId,
    };
    setAllSymptomLogs((prev) => [newLog, ...prev]);
  };

  const deleteSymptomLog = (id: string) => {
    setAllSymptomLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const clearAlertsForPatient = (patientId: string) => {
    setCaregiverAlerts(prev => prev.filter(alert => alert.patientId !== patientId));
  };

  return (
    <AppContext.Provider
      value={{
        profiles,
        activeProfileId,
        activeProfile,
        medicines,
        allMedicines,
        trackingLogs,
        allTrackingLogs,
        symptomLogs,
        allSymptomLogs,
        
        activeReminders,
        reminderHistory,
        caregiverAlerts,
        isFastDemoMode,
        voiceReminderStatus,
        lastReminderTriggered,

        addMedicine,
        addMedicines,
        updateMedicine,
        deleteMedicine,
        markAsTaken,
        markAsMissed,
        resetLogStatus,
        addSymptomLog,
        deleteSymptomLog,
        selectProfile,
        createProfile,
        updateProfile,
        deleteProfile,

        setActiveReminders,
        setReminderHistory,
        setCaregiverAlerts,
        setIsFastDemoMode,
        setVoiceReminderStatus,
        setLastReminderTriggered,
        clearAlertsForPatient
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppProvider");
  }
  return context;
}
