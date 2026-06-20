"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { 
  HeartPulse, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle, 
  Brain, 
  Volume2, 
  Users, 
  FileText, 
  CheckCircle,
  FileImage,
  ArrowUpRight,
  ShieldAlert,
  ClipboardList,
  Activity
} from "lucide-react";

export default function Home() {
  const problemSectionRef = useRef<HTMLDivElement>(null);

  // 3D Parallax Tilt state
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCoords({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const rotationX = coords.y * -15; // max 15 degrees tilt
  const rotationY = coords.x * 15;  // max 15 degrees tilt
  const cardStyle = {
    transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale3d(${isHovered ? 1.01 : 1}, ${isHovered ? 1.01 : 1}, 1)`,
    transition: isHovered ? "transform 0.05s linear" : "transform 0.4s ease-out",
  };

  const scrollToProblem = () => {
    problemSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative overflow-hidden">
      
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[50%] rounded-full bg-teal-200/10 blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute top-[30%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sky-200/10 blur-3xl -z-10"></div>
      <div className="absolute bottom-[-10%] left-[10%] w-[45%] h-[40%] rounded-full bg-emerald-100/10 blur-3xl -z-10"></div>

      {/* 1. Startup-Style Hero Section */}
      <section id="hero" className="relative py-16 sm:py-24 bg-white/40 backdrop-blur-md border-b border-slate-200/60 overflow-hidden scroll-mt-20">
        {/* Style injection for animations */}
        <style jsx>{`
          @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            14% { transform: scale(1.08); }
            28% { transform: scale(1.02); }
            42% { transform: scale(1.1); }
            70% { transform: scale(1); }
          }
          @keyframes flowLine {
            0% { stroke-dashoffset: 800; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes flowHorizontal {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-heartbeat {
            animation: heartbeat 1.5s infinite ease-in-out;
          }
          .animate-pulse-wave {
            stroke-dasharray: 800;
            animation: flowLine 5s infinite linear;
          }
          .animate-flow-horizontal {
            background-size: 200% auto;
            animation: flowHorizontal 4s infinite linear;
          }
        `}</style>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-center lg:text-left">
          
          {/* Left Column (Content) */}
          <div className="lg:col-span-7 space-y-6 flex flex-col items-center lg:items-start">
            {/* Sparkle Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-teal-500/10 to-sky-500/10 border border-teal-200/60 text-teal-800 text-xs font-semibold animate-fade-in">
              <Sparkles className="h-3.5 w-3.5 text-teal-600 animate-spin" />
              <span>Introducing Next-Gen Elder Care</span>
            </div>

            {/* Logo Brand Title */}
            <div className="flex items-center gap-2.5">
              <div className="rounded-2xl bg-teal-50 p-2 text-teal-600 border border-teal-100/80 shadow-xs">
                <HeartPulse className="h-10 w-10" />
              </div>
              <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Care<span className="text-teal-600">Companion</span> AI
              </span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6.5xl font-black tracking-tight text-slate-900 leading-tight max-w-4xl">
              CareCompanion AI
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-teal-600 to-sky-600 bg-clip-text text-transparent leading-normal max-w-2xl">
              Your AI-Powered Elder Care Companion
            </p>
            
            {/* Project Description */}
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl">
              Helping elderly patients stay on track with medicines, voice reminders, caregiver monitoring, and doctor-ready health reports.
            </p>
            
            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto justify-center lg:justify-start items-center">
              <Link
                href="/patients"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-extrabold rounded-2xl text-white bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              
              <button
                onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-slate-200 text-base font-extrabold rounded-2xl text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200 hover:scale-[1.02] shadow-xs cursor-pointer"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right Column (Lightweight 3D Vitals Device Visual) */}
          <div className="lg:col-span-5 flex justify-center items-center relative min-h-[420px] w-full">
            
            {/* ECG background graph grid */}
            <div className="absolute inset-0 -z-20 opacity-30 flex items-center justify-center w-full">
              <svg className="w-full h-full max-h-[360px]" viewBox="0 0 400 400" fill="none">
                <defs>
                  <pattern id="ecg-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(13, 148, 136, 0.08)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#ecg-grid)" />
                
                {/* Scrolling ECG Line */}
                <path
                  d="M 0 200 L 100 200 L 115 170 L 130 230 L 145 150 L 160 250 L 175 200 L 190 205 L 200 200 L 400 200"
                  stroke="url(#ecg-gradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-pulse-wave"
                />
                
                <defs>
                  <linearGradient id="ecg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(13, 148, 136, 0.1)" />
                    <stop offset="50%" stopColor="#0d9488" />
                    <stop offset="100%" stopColor="rgba(13, 148, 136, 0.1)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Glowing background halo */}
            <div className="absolute w-[280px] h-[280px] rounded-full bg-teal-500/5 blur-3xl -z-10 animate-pulse"></div>

            {/* 3D Glassmorphic Device Card */}
            <div 
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="relative w-full max-w-[360px] h-[360px] rounded-3xl border border-slate-200/80 bg-white/70 backdrop-blur-md shadow-2xl p-6 flex flex-col justify-between overflow-hidden cursor-pointer select-none"
              style={cardStyle}
            >
              {/* Card top banner */}
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Live Health Monitor</span>
                </div>
                <span className="text-[9px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-full">
                  98 BPM
                </span>
              </div>

              {/* Central Heart Visual */}
              <div className="relative flex-1 flex items-center justify-center">
                {/* Extra floating glow */}
                <div className="absolute w-24 h-24 rounded-full bg-teal-500/10 blur-xl"></div>
                
                <img
                  src="/heartbeat.avif"
                  alt="Heartbeat Vitals"
                  className="w-40 h-40 object-contain rounded-full shadow-lg border-4 border-slate-50 bg-slate-50/50 animate-heartbeat relative z-10"
                />
              </div>

              {/* Card bottom diagnostics panel */}
              <div className="w-full grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
                <div>
                  <span className="text-[8px] uppercase font-bold text-slate-400 block">SYS</span>
                  <span className="text-xs font-black text-slate-800">120 mmHg</span>
                </div>
                <div className="border-x border-slate-100">
                  <span className="text-[8px] uppercase font-bold text-slate-400 block">DIA</span>
                  <span className="text-xs font-black text-slate-800">80 mmHg</span>
                </div>
                <div>
                  <span className="text-[8px] uppercase font-bold text-slate-400 block">SPO2</span>
                  <span className="text-xs font-black text-teal-700">99%</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. Problem & Solution Section */}
      <section id="about" ref={problemSectionRef} className="py-20 sm:py-28 bg-slate-50/50 scroll-mt-20 border-b border-slate-200/55">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-extrabold text-teal-600 tracking-wider">The Challenge & The Answer</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Understanding Geriatric Adherence</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* The Problem Card */}
            <div className="bg-white rounded-3xl p-8 border border-red-100 shadow-xs hover:shadow-md transition-all space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2.5 h-full bg-red-400"></div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800">The Problem</h3>
              </div>
              
              <blockquote className="text-base font-bold text-slate-600 leading-relaxed italic">
                "Elderly patients often forget medicines and healthcare instructions."
              </blockquote>
              
              <p className="text-sm text-slate-500 leading-relaxed">
                Aging patients face complicated dosing schedules, fine-print instructions, and medical terms that are difficult to recall. Bypassing critical medications or mixing schedule times leads to emergency hospitalizations and places immense stress on families.
              </p>
            </div>

            {/* The Solution Card */}
            <div className="bg-white rounded-3xl p-8 border border-teal-100 shadow-xs hover:shadow-md transition-all space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2.5 h-full bg-teal-500"></div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800">The Solution</h3>
              </div>
              
              <blockquote className="text-base font-bold text-slate-600 leading-relaxed italic">
                "CareCompanion AI provides prescription understanding, voice reminders, caregiver monitoring, and doctor-ready reports."
              </blockquote>
              
              <p className="text-sm text-slate-500 leading-relaxed">
                We automate elder routines by reading scripts natively, speaking friendly instructions out loud on schedule, logging adherence logs, notifying family members of missed doses, and creating print-ready physical charts for medical reviews.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="py-20 sm:py-28 bg-white border-b border-slate-200/55 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-extrabold text-teal-600 tracking-wider">Features Overview</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Equipped for Modern Elder Care</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">
              A comprehensive clinical suite built to secure patients, empower caregivers, and streamline physician verification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md hover:bg-white hover:scale-[1.02] hover:border-teal-200 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center">
                  <FileImage className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800">AI Prescription Reader</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Scan printed paper prescriptions. Simulated AI OCR analyzes text and drafts medicine schedule configurations automatically.
                </p>
              </div>
              <span className="text-[10px] font-bold text-teal-600 flex items-center gap-0.5">
                Simulated OCR <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md hover:bg-white hover:scale-[1.02] hover:border-teal-200 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center">
                  <Volume2 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Smart Voice Reminders</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Speech synthesis alerts read exact schedule details out loud using the active patient's name for elder-friendly compliance.
                </p>
              </div>
              <span className="text-[10px] font-bold text-teal-600 flex items-center gap-0.5">
                Speech Cue <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md hover:bg-white hover:scale-[1.02] hover:border-teal-200 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Caregiver Monitoring</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Synchronized access for family members to view adherence progress, check log histories, and log patient feedback.
                </p>
              </div>
              <span className="text-[10px] font-bold text-teal-600 flex items-center gap-0.5">
                Family Link <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md hover:bg-white hover:scale-[1.02] hover:border-teal-200 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Doctor Reports</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Generate print-ready clinical PDF charts containing schedules, compliance rates, non-adherence logs, and physician notes.
                </p>
              </div>
              <span className="text-[10px] font-bold text-teal-600 flex items-center gap-0.5">
                Print Layout <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md hover:bg-white hover:scale-[1.02] hover:border-teal-200 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Medication Tracking</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Real-time tracker for compliance rates, logs, and schedule configurations to prevent adverse drug events.
                </p>
              </div>
              <span className="text-[10px] font-bold text-teal-600 flex items-center gap-0.5">
                Compliance Log <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-slate-50/50 border-b border-slate-200/55 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-extrabold text-teal-600 tracking-wider">Step-by-Step Flow</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">How CareCompanion AI Operates</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">
              Follow this structured visual timeline mapping prescription uploads all the way to doctor verification.
            </p>
          </div>

          {/* Visual Timeline (Horizontal on Desktop, Connected Pathway on Mobile) */}
          <div className="relative">
            {/* Center line connector for timeline on desktop */}
            <div className="hidden md:block absolute top-[24px] left-[8%] right-[8%] h-[3px] bg-slate-200 -z-0"></div>
            
            {/* Moving glowing line connector on desktop */}
            <div className="hidden md:block absolute top-[24px] left-[8%] right-[8%] h-[3px] bg-gradient-to-r from-teal-500 via-sky-400 to-teal-500 animate-flow-horizontal -z-0"></div>

            {/* Vertical connector line on mobile */}
            <div className="md:hidden absolute left-[24px] top-6 bottom-6 w-[3px] bg-slate-200 z-0"></div>
            <div className="md:hidden absolute left-[24px] top-6 bottom-6 w-[3px] bg-gradient-to-b from-teal-500 via-sky-400 to-teal-500 z-0 opacity-40"></div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
              
              {/* Step 1 */}
              <div className="flex flex-col items-start md:items-center text-left md:text-center group">
                <div className="flex items-center md:justify-center w-full gap-4 md:flex-col">
                  <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-black text-sm border-4 border-white shadow-md z-10 shrink-0 group-hover:scale-110 transition-transform">
                    1
                  </div>
                  <div className="md:hidden font-bold text-slate-800 text-base">Step 1: Upload Prescription</div>
                </div>
                
                <div className="bg-white rounded-2xl p-5 border border-slate-100/80 shadow-2xs hover:shadow-md hover:border-teal-200 transition-all flex flex-col justify-between h-[190px] mt-4 w-full ml-16 md:ml-0">
                  <div>
                    <span className="hidden md:block text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">Step 1</span>
                    <h4 className="hidden md:block text-sm font-bold text-slate-800 leading-tight">Upload Prescription</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-2 md:mt-0">
                      The caregiver or patient uploads a doctor prescription.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-start md:items-center text-left md:text-center group">
                <div className="flex items-center md:justify-center w-full gap-4 md:flex-col">
                  <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-black text-sm border-4 border-white shadow-md z-10 shrink-0 group-hover:scale-110 transition-transform">
                    2
                  </div>
                  <div className="md:hidden font-bold text-slate-800 text-base">Step 2: AI Extracts Medicines</div>
                </div>
                
                <div className="bg-white rounded-2xl p-5 border border-slate-100/80 shadow-2xs hover:shadow-md hover:border-teal-200 transition-all flex flex-col justify-between h-[190px] mt-4 w-full ml-16 md:ml-0">
                  <div>
                    <span className="hidden md:block text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">Step 2</span>
                    <h4 className="hidden md:block text-sm font-bold text-slate-800 leading-tight">AI Extracts Medicines</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-2 md:mt-0">
                      AI extracts medicines, dosage, and schedules.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-start md:items-center text-left md:text-center group">
                <div className="flex items-center md:justify-center w-full gap-4 md:flex-col">
                  <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-black text-sm border-4 border-white shadow-md z-10 shrink-0 group-hover:scale-110 transition-transform">
                    3
                  </div>
                  <div className="md:hidden font-bold text-slate-800 text-base">Step 3: Voice Reminder</div>
                </div>
                
                <div className="bg-white rounded-2xl p-5 border border-slate-100/80 shadow-2xs hover:shadow-md hover:border-teal-200 transition-all flex flex-col justify-between h-[190px] mt-4 w-full ml-16 md:ml-0">
                  <div>
                    <span className="hidden md:block text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">Step 3</span>
                    <h4 className="hidden md:block text-sm font-bold text-slate-800 leading-tight">Voice Reminder</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-2 md:mt-0 italic font-semibold text-teal-700 bg-teal-50/50 p-2 rounded-lg border border-teal-100/40">
                      "Hello Mr. Ramesh, it is time for your medication."
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-start md:items-center text-left md:text-center group">
                <div className="flex items-center md:justify-center w-full gap-4 md:flex-col">
                  <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-black text-sm border-4 border-white shadow-md z-10 shrink-0 group-hover:scale-110 transition-transform">
                    4
                  </div>
                  <div className="md:hidden font-bold text-slate-800 text-base">Step 4: Patient Marks Taken</div>
                </div>
                
                <div className="bg-white rounded-2xl p-5 border border-slate-100/80 shadow-2xs hover:shadow-md hover:border-teal-200 transition-all flex flex-col justify-between h-[190px] mt-4 w-full ml-16 md:ml-0">
                  <div>
                    <span className="hidden md:block text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">Step 4</span>
                    <h4 className="hidden md:block text-sm font-bold text-slate-800 leading-tight">Patient Marks Taken</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-2 md:mt-0">
                      Patient records medicine intake.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex flex-col items-start md:items-center text-left md:text-center group">
                <div className="flex items-center md:justify-center w-full gap-4 md:flex-col">
                  <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-black text-sm border-4 border-white shadow-md z-10 shrink-0 group-hover:scale-110 transition-transform">
                    5
                  </div>
                  <div className="md:hidden font-bold text-slate-800 text-base">Step 5: Caregiver Monitors Progress</div>
                </div>
                
                <div className="bg-white rounded-2xl p-5 border border-slate-100/80 shadow-2xs hover:shadow-md hover:border-teal-200 transition-all flex flex-col justify-between h-[190px] mt-4 w-full ml-16 md:ml-0">
                  <div>
                    <span className="hidden md:block text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">Step 5</span>
                    <h4 className="hidden md:block text-sm font-bold text-slate-800 leading-tight">Caregiver Monitors Progress</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-2 md:mt-0">
                      Family members track adherence.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="flex flex-col items-start md:items-center text-left md:text-center group">
                <div className="flex items-center md:justify-center w-full gap-4 md:flex-col">
                  <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-black text-sm border-4 border-white shadow-md z-10 shrink-0 group-hover:scale-110 transition-transform">
                    6
                  </div>
                  <div className="md:hidden font-bold text-slate-800 text-base">Step 6: Doctor Report Generated</div>
                </div>
                
                <div className="bg-white rounded-2xl p-5 border border-slate-100/80 shadow-2xs hover:shadow-md hover:border-teal-200 transition-all flex flex-col justify-between h-[190px] mt-4 w-full ml-16 md:ml-0">
                  <div>
                    <span className="hidden md:block text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">Step 6</span>
                    <h4 className="hidden md:block text-sm font-bold text-slate-800 leading-tight">Doctor Report Generated</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-2 md:mt-0">
                      Generate health and medication compliance reports.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Final Call to Action */}
          <div className="text-center pt-8">
            <Link
              href="/patients"
              className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-base font-extrabold rounded-2xl text-white bg-teal-600 hover:bg-teal-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
