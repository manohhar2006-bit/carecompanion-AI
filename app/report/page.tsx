"use client";

import React, { useState, useEffect } from "react";
import { useAppState } from "@/context/AppContext";
import { 
  FileText, 
  Printer, 
  ArrowLeft, 
  Info,
  Stethoscope,
  Heart,
  TrendingUp,
  AlertCircle,
  UserCheck,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { formatTime12h } from "@/components/ReminderEngine";

export default function DoctorReportPage() {
  const { activeProfile, medicines, trackingLogs, symptomLogs, consultationSummaries, deleteConsultationSummary } = useAppState();

  const [currentDate, setCurrentDate] = useState("2026-06-20");
  const [mounted, setMounted] = useState(false);
  
  // Interactive consultation notes
  const [clinicalAssessment, setClinicalAssessment] = useState("");
  const [dosageAdjustments, setDosageAdjustments] = useState("");
  const [physicianSignature, setPhysicianSignature] = useState("Dr. Sarah Alcott, MD");

  useEffect(() => {
    setMounted(true);
    setCurrentDate(new Date().toISOString().split("T")[0]);
  }, []);

  // Reset default comments if the patient profile changes
  useEffect(() => {
    if (activeProfile) {
      setClinicalAssessment(
        `Patient (${activeProfile.name}) is showing medication adherence variations. BP/Sugar medications are generally taken, but there is some routine displacement. Caregiver is coordinating schedule synchronization.`
      );
      setDosageAdjustments(
        `Continue current guidelines for ${activeProfile.condition}. Consider automated voice alerts for morning routines. Follow-up scheduled in 4 weeks.`
      );
    }
  }, [activeProfile]);

  if (!mounted) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 text-teal-650 flex items-center justify-center mx-auto animate-spin">
          <Loader2 className="h-5 w-5" />
        </div>
        <p className="text-xs text-slate-800 font-bold">Loading clinical report...</p>
      </div>
    );
  }

  // Safety check if profile is loaded
  if (!activeProfile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 animate-pulse shadow-sm">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800">No Patient Profile Loaded</h2>
          <p className="text-slate-800 text-sm leading-relaxed">
            Please select an existing patient file or register a new one to generate clinical adherence reports.
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

  // Calculate statistics
  let totalScheduled = 0;
  let takenCount = 0;
  let missedCount = 0;

  const todayLogs = trackingLogs.filter(log => log.date === currentDate);
  const missedDosesList: { id: string; name: string; date: string; timeSlot: string; time?: string }[] = [];

  // Get all tracking logs that are missed
  trackingLogs.forEach((log) => {
    if (log.status === "missed") {
      const med = medicines.find(m => m.id === log.medicineId);
      if (med) {
        const matchingTime = med.reminderTimes.find(rt => rt.timeSlot === log.timeSlot)?.time;
        missedDosesList.push({
          id: log.id,
          name: med.name,
          date: log.date,
          timeSlot: log.timeSlot,
          time: matchingTime
        });
      }
    }
  });

  // Calculate today's adherence rate
  medicines.forEach((med) => {
    if (!med.active) return;
    med.reminderTimes.forEach((rt) => {
      totalScheduled++;
      const log = todayLogs.find(l => l.medicineId === med.id && l.timeSlot === rt.timeSlot);
      if (log && log.status === "taken") {
        takenCount++;
      } else if (log && log.status === "missed") {
        missedCount++;
      }
    });
  });

  const rawCompliance = totalScheduled > 0 ? Math.round((takenCount / totalScheduled) * 100) : 100;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full space-y-6 animate-fade-in">
      
      {/* Action panel (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-teal-705 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex gap-2">
          <Link
            href="/patients"
            className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-lg text-slate-700 dark:text-white bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all shadow-xs"
          >
            Switch Patient
          </Link>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* Guide Banner (Hidden on Print) */}
      <div className="bg-teal-50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/50 rounded-xl p-4 flex gap-3 text-teal-950 dark:text-teal-200 print:hidden">
        <Info className="h-5 w-5 text-teal-650 dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-bold">Clinical Report Generator</h4>
          <p className="leading-relaxed">
            Fill out the <strong>Interactive Physician Consultation Form</strong> on the left. 
            The comments merge immediately into the report paper. Click <strong>Print Report</strong> to open the printable PDF document preview.
          </p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Interactive Consultation Form (Hidden on Print) */}
        <div className="lg:col-span-4 space-y-6 print:hidden">
          <div className="bg-white dark:bg-dark-bg-card border border-slate-202 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Stethoscope className="h-4.5 w-4.5 text-teal-700 dark:text-teal-400" />
              Doctor Consultation Notes
            </h3>
            
            {/* Observation Notes */}
            <div className="space-y-1">
              <label htmlFor="assessment" className="block text-[10px] font-bold text-slate-800 dark:text-dark-text-secondary uppercase">
                Clinical Observation Notes
              </label>
              <textarea
                id="assessment"
                rows={5}
                value={clinicalAssessment}
                onChange={(e) => setClinicalAssessment(e.target.value)}
                placeholder="Write specific observations..."
                className="w-full text-xs font-semibold text-slate-800 dark:text-white border border-slate-400 dark:border-slate-800 rounded-lg p-2.5 bg-white dark:bg-slate-900 focus:outline-hidden focus:border-teal-500"
              />
            </div>

            {/* Adjustments */}
            <div className="space-y-1">
              <label htmlFor="adjust" className="block text-[10px] font-bold text-slate-800 dark:text-dark-text-secondary uppercase">
                Directions / Adjustments
              </label>
              <textarea
                id="adjust"
                rows={3}
                value={dosageAdjustments}
                onChange={(e) => setDosageAdjustments(e.target.value)}
                placeholder="Write medication adjustments..."
                className="w-full text-xs font-semibold text-slate-805 dark:text-white border border-slate-400 dark:border-slate-800 rounded-lg p-2.5 bg-white dark:bg-slate-900 focus:outline-hidden focus:border-teal-500"
              />
            </div>

            {/* Signature */}
            <div className="space-y-1">
              <label htmlFor="sig" className="block text-[10px] font-bold text-slate-800 dark:text-dark-text-secondary uppercase">
                Physician Signature Name
              </label>
              <input
                type="text"
                id="sig"
                value={physicianSignature}
                onChange={(e) => setPhysicianSignature(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 dark:text-white border border-slate-400 dark:border-slate-800 rounded-lg p-2 bg-white dark:bg-slate-900 focus:outline-hidden focus:border-teal-500"
                required
              />
            </div>

            <button
              onClick={handlePrint}
              className="w-full py-2.5 text-xs font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-900 hover:bg-slate-205 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 rounded-lg transition-all text-center flex items-center justify-center gap-1"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Preview Print Layout</span>
            </button>
          </div>
        </div>

        {/* Printable medical report page */}
        <div className="lg:col-span-8 bg-white dark:bg-dark-bg-card border border-slate-202 dark:border-slate-800 shadow-sm rounded-xl p-8 print:p-0 print:border-none print:shadow-none space-y-8 w-full max-w-3xl mx-auto text-slate-900 dark:text-slate-100 print:dark:bg-white print:dark:text-slate-900">
          
          {/* Header Clinic block */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 dark:border-slate-700 print:dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white print:dark:text-slate-900">
                <Stethoscope className="h-6 w-6 text-teal-700 print:text-slate-850 dark:text-teal-400 shrink-0" />
                <h2 className="text-xl font-black uppercase tracking-tight">Metro General Health Alliance</h2>
              </div>
              <p className="text-xs font-bold text-teal-900 print:text-slate-800 dark:text-teal-400 print:dark:text-slate-800 mt-1 uppercase tracking-wide">
                Department of Geriatric Compliance & Care Coordination
              </p>
              <p className="text-[10px] text-slate-800 dark:text-slate-300 print:dark:text-slate-800 mt-0.5">
                400 Metro Parkway, Suite 400 • Helpline: 1-800-555-0199
              </p>
            </div>
            <div className="text-right">
              <span className="text-[9px] bg-slate-100 dark:bg-slate-900 print:dark:bg-slate-100 border border-slate-400 dark:border-slate-800 print:dark:border-slate-400 text-slate-900 dark:text-white print:dark:text-slate-900 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider block mb-1">
                Clinical Health Record
              </span>
              <p className="text-[10px] text-slate-800 dark:text-slate-300 print:dark:text-slate-800 font-semibold">Record ID: <strong>#CC-{activeProfile.id.toUpperCase().split("-")[1] || "7281"}</strong></p>
              <p className="text-[10px] text-slate-800 dark:text-slate-300 print:dark:text-slate-800 font-semibold">Date: <strong>{new Date(currentDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</strong></p>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-lg font-black uppercase text-slate-805 dark:text-white print:dark:text-slate-800 tracking-wider bg-slate-50 dark:bg-slate-900/60 print:dark:bg-slate-50 border border-slate-300 dark:border-slate-800 print:dark:border-slate-300 py-1.5 rounded-md">
              Medication Adherence & Compliance Summary
            </h1>
          </div>

          {/* Patient Details */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-dark-text-secondary print:dark:text-slate-800 border-b border-slate-300 dark:border-slate-800 print:dark:border-slate-300 pb-1">Patient Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-xs bg-slate-50/50 dark:bg-slate-900/40 print:dark:bg-slate-50/50 p-4 rounded-lg border border-slate-300 dark:border-slate-800 print:dark:border-slate-300">
              <div>
                <span className="block font-bold text-slate-800 dark:text-dark-text-muted print:dark:text-slate-800 uppercase text-[9px]">Patient Name</span>
                <strong className="text-sm text-slate-900 dark:text-white print:dark:text-slate-900">{activeProfile.name}</strong>
              </div>
              <div>
                <span className="block font-bold text-slate-800 dark:text-dark-text-muted print:dark:text-slate-800 uppercase text-[9px]">Age & Gender</span>
                <strong className="text-slate-900 dark:text-white print:dark:text-slate-900">{activeProfile.age} Years • {activeProfile.gender}</strong>
              </div>
              <div>
                <span className="block font-bold text-slate-800 dark:text-dark-text-muted print:dark:text-slate-800 uppercase text-[9px]">Reporting Period</span>
                <strong className="text-slate-900 dark:text-white print:dark:text-slate-900">Current Cycle Adherence</strong>
              </div>
              <div>
                <span className="block font-bold text-slate-800 dark:text-dark-text-muted print:dark:text-slate-800 uppercase text-[9px]">Caregiver Contact</span>
                <strong className="text-slate-900 dark:text-white print:dark:text-slate-900">{activeProfile.caregiverName}</strong>
              </div>
              <div>
                <span className="block font-bold text-slate-800 dark:text-dark-text-muted print:dark:text-slate-800 uppercase text-[9px]">Medical Diagnosis</span>
                <strong className="text-slate-900 dark:text-white print:dark:text-slate-900">{activeProfile.condition}</strong>
              </div>
              <div>
                <span className="block font-bold text-slate-805 dark:text-dark-text-muted print:dark:text-slate-800 uppercase text-[9px]">Compliance Rate</span>
                <strong className="text-teal-900 dark:text-teal-400 print:dark:text-teal-900 font-bold">{rawCompliance}% Adherence Today</strong>
              </div>
            </div>
          </div>

          {/* Active Prescription Schedule */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-dark-text-secondary print:dark:text-slate-800 border-b border-slate-300 dark:border-slate-800 print:dark:border-slate-300 pb-1">Active Prescription Schedule</h3>
            <div className="overflow-x-auto border border-slate-300 dark:border-slate-800 print:dark:border-slate-300 rounded-lg">
              <table className="min-w-full divide-y divide-slate-300 dark:divide-slate-800 print:dark:divide-slate-300 text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900 print:dark:bg-slate-100">
                  <tr className="divide-x divide-slate-300 dark:divide-slate-800 print:dark:divide-slate-300 font-bold text-slate-905 dark:text-white print:dark:text-slate-900">
                    <th scope="col" className="px-4 py-2">Medication</th>
                    <th scope="col" className="px-3 py-2">Dosage</th>
                    <th scope="col" className="px-3 py-2">Frequency</th>
                    <th scope="col" className="px-3 py-2">Schedule Slots & Times</th>
                    <th scope="col" className="px-4 py-2">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 dark:divide-slate-800 bg-white dark:bg-dark-bg-card print:dark:bg-white">
                  {medicines.filter(m => m.active).map((med) => {
                    const timesStr = med.reminderTimes.map(rt => `${rt.timeSlot} (${formatTime12h(rt.time)})`).join(", ");
                    return (
                      <tr key={med.id} className="divide-x divide-slate-300 dark:divide-slate-800 print:dark:divide-slate-300 text-slate-900 dark:text-slate-200 print:dark:text-slate-900">
                        <td className="px-4 py-2 font-bold">{med.name}</td>
                        <td className="px-3 py-2">{med.dosage}</td>
                        <td className="px-3 py-2">{med.frequency}</td>
                        <td className="px-3 py-2 capitalize">{timesStr || med.exactTime}</td>
                        <td className="px-4 py-2 italic text-slate-800 dark:text-slate-300 print:dark:text-slate-800">{med.notes || "None"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Missed Doses logs */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-dark-text-secondary print:dark:text-slate-800 border-b border-slate-300 dark:border-slate-800 print:dark:border-slate-300 pb-1">Non-Adherence Log (Missed Doses)</h3>
            {missedDosesList.length === 0 ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 print:dark:bg-emerald-50 border border-emerald-250 dark:border-emerald-900/50 print:dark:border-emerald-200 text-emerald-955 dark:text-emerald-300 print:dark:text-emerald-955 text-xs rounded-lg font-semibold flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-450 print:dark:text-emerald-700 shrink-0" />
                <span>No missed medication slots logged in reporting timeline. 100% compliance rate.</span>
              </div>
            ) : (
              <div className="border border-slate-300 dark:border-slate-800 print:dark:border-slate-300 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-slate-300 dark:divide-slate-800 print:dark:divide-slate-300 text-left text-xs">
                  <thead className="bg-red-55 dark:bg-red-950/30 print:dark:bg-red-50 text-red-955 dark:text-red-305 print:dark:text-red-955">
                    <tr className="font-bold">
                      <th scope="col" className="px-4 py-2">Date</th>
                      <th scope="col" className="px-4 py-2">Medication</th>
                      <th scope="col" className="px-4 py-2">Scheduled Slot & Time</th>
                      <th scope="col" className="px-4 py-2 text-right">Adherence Alert</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 dark:divide-slate-800 bg-white dark:bg-dark-bg-card print:dark:bg-white text-slate-900 dark:text-slate-200 print:dark:text-slate-900">
                    {missedDosesList.map((log) => (
                      <tr key={log.id}>
                        <td className="px-4 py-2 font-semibold">{log.date}</td>
                        <td className="px-4 py-2 font-bold text-red-900 dark:text-red-400 print:dark:text-red-900">{log.name}</td>
                        <td className="px-4 py-2 capitalize">{log.timeSlot} slot {log.time ? `(${formatTime12h(log.time)})` : ""}</td>
                        <td className="px-4 py-2 text-right text-red-800 dark:text-red-400 print:dark:text-red-800 font-bold">Logged Missed Dosing</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Symptom logs section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-dark-text-secondary print:dark:text-slate-800 border-b border-slate-300 dark:border-slate-800 print:dark:border-slate-300 pb-1">Symptom Journal & Caregiver Diaries</h3>
            {symptomLogs.length === 0 ? (
              <p className="text-xs text-slate-800 dark:text-slate-305 italic">No physical symptoms logged by patient or caregiver.</p>
            ) : (
              <div className="space-y-2">
                {symptomLogs.map((log) => (
                  <div key={log.id} className="border border-slate-300 dark:border-slate-800 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 print:dark:bg-slate-50 flex justify-between text-xs text-slate-900 dark:text-slate-200 print:dark:text-slate-900">
                    <div>
                      <span className="text-slate-900 dark:text-slate-400 print:dark:text-slate-900 font-bold mr-2">[{log.date}]</span>
                      <strong className="text-slate-900 dark:text-white print:dark:text-slate-900 font-bold">{log.notes}</strong>
                    </div>
                    <span className="font-bold uppercase text-[9px] text-slate-900 dark:text-slate-300 print:dark:text-slate-900 shrink-0 capitalize">{log.severity} severity</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Doctor Consultations Section */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-dark-text-secondary print:dark:text-slate-800 border-b border-slate-300 dark:border-slate-800 print:dark:border-slate-300 pb-1">
              Doctor Consultation & AI Clinical Summaries
            </h3>
            {(!consultationSummaries || consultationSummaries.length === 0) ? (
              <p className="text-xs text-slate-800 dark:text-slate-305 italic">No saved AI consultation summaries exist for this patient profile.</p>
            ) : (
              <div className="space-y-6">
                {consultationSummaries.map((cs) => {
                  const isHigh = cs.summary.riskLevel.toLowerCase().includes("high") || cs.summary.riskLevel.toLowerCase().includes("severe");
                  const isMedium = cs.summary.riskLevel.toLowerCase().includes("medium") || cs.summary.riskLevel.toLowerCase().includes("moderate");
                  const riskBadgeColor = isHigh 
                    ? "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50" 
                    : isMedium 
                    ? "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-955/40 dark:text-amber-300 dark:border-amber-900/50" 
                    : "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50";

                  return (
                    <div key={cs.id} className="border border-slate-300 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-950/40 print:dark:bg-white space-y-4 shadow-sm relative">
                      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 dark:border-slate-800 print:dark:border-slate-200 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white print:dark:text-slate-900">
                            📅 {new Date(cs.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className={`px-2 py-0.5 border rounded-md text-[10px] font-black uppercase tracking-wider ${riskBadgeColor}`}>
                            {cs.summary.riskLevel} Risk
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this consultation summary?")) {
                              deleteConsultationSummary(cs.id);
                            }
                          }}
                          className="text-[10px] text-slate-700 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-bold print:hidden"
                        >
                          Delete
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="block text-[10px] font-bold text-slate-800 dark:text-dark-text-secondary uppercase">Diagnosis</span>
                          <strong className="text-xs text-slate-900 dark:text-white print:dark:text-slate-905 font-bold block bg-slate-50 dark:bg-slate-900 print:dark:bg-slate-50 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-800 print:dark:border-slate-300">
                            {cs.summary.diagnosis}
                          </strong>
                        </div>
                        <div className="space-y-1">
                          <span className="block text-[10px] font-bold text-slate-800 dark:text-dark-text-secondary uppercase">Follow-Up Date</span>
                          <strong className="text-xs text-slate-900 dark:text-white print:dark:text-slate-905 font-bold block bg-slate-50 dark:bg-slate-900 print:dark:bg-slate-50 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-800 print:dark:border-slate-300">
                            {cs.summary.followUpDate}
                          </strong>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="block text-[10px] font-bold text-slate-800 dark:text-dark-text-secondary uppercase">Medicines Mentioned</span>
                        {cs.summary.medicinesMentioned && cs.summary.medicinesMentioned.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {cs.summary.medicinesMentioned.map((med, idx) => (
                              <span key={idx} className="inline-flex bg-teal-50 dark:bg-teal-950/30 print:dark:bg-teal-50 border border-teal-100 dark:border-teal-900/50 text-teal-800 dark:text-teal-300 print:dark:text-teal-850 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                💊 {med}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-800 dark:text-slate-300 print:dark:text-slate-800 italic">None logged</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="block text-[10px] font-bold text-slate-800 dark:text-dark-text-secondary uppercase">Instructions & Precautions</span>
                          <p className="text-xs text-slate-850 dark:text-slate-205 print:dark:text-slate-850 leading-relaxed font-semibold bg-white dark:bg-slate-900 print:dark:bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-800 print:dark:border-slate-300 whitespace-pre-line">
                            {cs.summary.instructions}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="block text-[10px] font-bold text-slate-800 dark:text-dark-text-secondary uppercase">Action Items</span>
                          {cs.summary.actionItems && cs.summary.actionItems.length > 0 ? (
                            <ul className="space-y-1 bg-white dark:bg-slate-900 print:dark:bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-800 print:dark:border-slate-300">
                              {cs.summary.actionItems.map((item, idx) => (
                                <li key={idx} className="text-xs text-slate-855 dark:text-slate-200 print:dark:text-slate-850 flex items-start gap-1 font-semibold">
                                  <span className="text-teal-600 dark:text-teal-400 text-xs select-none">✔</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-800 dark:text-slate-300 print:dark:text-slate-808 italic bg-white dark:bg-slate-900 print:dark:bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-800 print:dark:border-slate-300">None</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="block text-[10px] font-bold text-slate-805 dark:text-dark-text-secondary uppercase">Clinical Summary</span>
                        <p className="text-xs text-slate-800 dark:text-slate-205 print:dark:text-slate-800 leading-relaxed font-semibold bg-white dark:bg-slate-900 print:dark:bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-800 print:dark:border-slate-300">
                          {cs.summary.summary}
                        </p>
                      </div>

                      <details className="text-xs border border-slate-300 dark:border-slate-800 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900/50 print:hidden">
                        <summary className="font-bold text-slate-800 dark:text-white cursor-pointer hover:text-slate-900 select-none">View Original Audio Transcript</summary>
                        <p className="text-[11px] text-slate-800 dark:text-slate-300 leading-relaxed whitespace-pre-line mt-2 italic font-semibold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-850 p-2.5 rounded-md">
                          {cs.transcript}
                        </p>
                      </details>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Doctor Assessment Observations */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-dark-text-secondary print:dark:text-slate-800 border-b border-slate-300 dark:border-slate-800 print:dark:border-slate-300 pb-1">Physician Assessment & Directions</h3>
            
            <div className="space-y-4">
              <div>
                <span className="block font-bold text-slate-800 dark:text-dark-text-muted print:dark:text-slate-800 uppercase text-[9px]">Clinical Observations & Diagnostics</span>
                <p className="text-xs text-slate-900 dark:text-slate-200 print:dark:text-slate-900 leading-relaxed font-serif whitespace-pre-line mt-1 bg-slate-50/20 dark:bg-slate-900/40 print:dark:bg-slate-50/20 p-3 rounded-lg border border-slate-300 dark:border-slate-800 print:dark:border-slate-300">
                  {clinicalAssessment || "No assessments logged."}
                </p>
              </div>

              <div>
                <span className="block font-bold text-slate-800 dark:text-dark-text-muted print:dark:text-slate-800 uppercase text-[9px]">Prescription Plan Modalities / Adjustments</span>
                <p className="text-xs text-slate-900 dark:text-slate-200 print:dark:text-slate-900 leading-relaxed font-serif whitespace-pre-line mt-1 bg-slate-50/20 dark:bg-slate-900/40 print:dark:bg-slate-50/20 p-3 rounded-lg border border-slate-300 dark:border-slate-800 print:dark:border-slate-300">
                  {dosageAdjustments || "No plan modifications logged."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-dashed border-slate-300 dark:border-slate-800 print:dark:border-slate-300">
                <div>
                  <span className="block font-bold text-slate-800 dark:text-dark-text-muted print:dark:text-slate-800 uppercase text-[9px]">Next Clinical Appointment</span>
                  <strong className="text-slate-900 dark:text-white print:dark:text-slate-900">{activeProfile.followUpDate}</strong>
                </div>
                <div>
                  <span className="block font-bold text-slate-800 dark:text-dark-text-muted print:dark:text-slate-800 uppercase text-[9px]">Primary Geriatric Specialist</span>
                  <strong className="text-slate-900 dark:text-white print:dark:text-slate-900">{activeProfile.doctorName}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Signature block */}
          <div className="pt-12 flex justify-between items-end">
            <div className="text-xs">
              <p className="text-slate-800 dark:text-dark-text-muted print:dark:text-slate-800 text-[10px] uppercase">Compliance Authority Badge</p>
              <div className="flex items-center gap-1 text-teal-900 dark:text-teal-400 print:dark:text-teal-900 font-bold mt-1">
                <Heart className="h-4.5 w-4.5" />
                <span>CareCompanion AI Secured</span>
              </div>
            </div>
            <div className="text-right w-64 border-t border-slate-850 dark:border-slate-700 print:dark:border-slate-850 pt-2 text-xs">
              <span className="font-serif italic text-sm text-slate-900 dark:text-white print:dark:text-slate-900 block mb-1">{physicianSignature}</span>
              <p className="text-slate-800 dark:text-dark-text-muted print:dark:text-slate-805 text-[9px] uppercase tracking-wide">Authorized Medical Signature Line</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
