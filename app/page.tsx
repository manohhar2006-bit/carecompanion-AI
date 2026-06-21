"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { 
  HeartPulse, 
  Heart,
  Shield,
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

  const parallaxXBack = `${coords.x * -10}px`;
  const parallaxYBack = `${coords.y * -10}px`;
  const parallaxXMid = `${coords.x * 12}px`;
  const parallaxYMid = `${coords.y * 12}px`;
  const parallaxXFront = `${coords.x * 25}px`;
  const parallaxYFront = `${coords.y * 25}px`;
  const parallaxRotateY = `${coords.x * 6}deg`;
  const parallaxRotateX = `${coords.y * -6}deg`;

  const heroStyle = {
    "--parallax-x-back": parallaxXBack,
    "--parallax-y-back": parallaxYBack,
    "--parallax-x-mid": parallaxXMid,
    "--parallax-y-mid": parallaxYMid,
    "--parallax-x-front": parallaxXFront,
    "--parallax-y-front": parallaxYFront,
    "--parallax-rotate-y": parallaxRotateY,
    "--parallax-rotate-x": parallaxRotateX,
    transition: isHovered ? "none" : "all 0.5s ease-out",
  } as React.CSSProperties;

  const scrollToProblem = () => {
    problemSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative overflow-hidden">
      
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[50%] rounded-full bg-teal-200/10 blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute top-[30%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sky-200/10 blur-3xl -z-10"></div>
      <div className="absolute bottom-[-10%] left-[10%] w-[45%] h-[40%] rounded-full bg-emerald-100/10 blur-3xl -z-10"></div>

      {/* 1. Redesigned Centered Premium Hero Section */}
      <section 
        id="hero" 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={heroStyle}
        className="relative py-24 sm:py-32 bg-white border-b border-slate-200/60 overflow-hidden scroll-mt-20 select-none flex flex-col justify-center items-center"
      >
        {/* Style injection for animations */}
        <style jsx>{`
          @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            14% { transform: scale(1.08); }
            28% { transform: scale(1.02); }
            42% { transform: scale(1.1); }
            70% { transform: scale(1); }
          }
          @keyframes heartbeatBreath {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px rgba(13, 148, 136, 0.15)); }
            50% { transform: scale(1.05); filter: drop-shadow(0 0 20px rgba(13, 148, 136, 0.35)); }
          }
          @keyframes flowLine {
            0% { stroke-dashoffset: 1200; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes ecgVibe {
            0%, 100% { filter: drop-shadow(0 0 3px rgba(13, 148, 136, 0.3)) brightness(1); }
            50% { filter: drop-shadow(0 0 10px rgba(13, 148, 136, 0.6)) brightness(1.2); }
          }
          @keyframes flowHorizontal {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-heartbeat {
            animation: heartbeat 1.8s infinite ease-in-out;
          }
          .animate-heartbeat-breath {
            animation: heartbeatBreath 2s infinite ease-in-out;
          }
          .animate-pulse-wave {
            stroke-dasharray: 1200;
            animation: flowLine 6s infinite linear;
          }
          .animate-ecg-vibe {
            animation: ecgVibe 3s infinite ease-in-out;
          }
          .animate-flow-horizontal {
            background-size: 200% auto;
            animation: flowHorizontal 4s infinite linear;
          }
          .perspective-grid {
            background-image: 
              linear-gradient(to right, rgba(13, 148, 136, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(13, 148, 136, 0.05) 1px, transparent 1px);
            background-size: 60px 60px;
            transform: perspective(280px) rotateX(65deg) translateZ(0);
            transform-origin: top center;
            mask-image: linear-gradient(to bottom, transparent, black 35%, transparent);
          }
          
          .parallax-layer-back {
            transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1);
          }
          .parallax-layer-mid {
            transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1);
          }
          .parallax-layer-front {
            transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1);
          }
          
          @media (min-width: 1024px) {
            .parallax-layer-back {
              transform: translate(var(--parallax-x-back, 0px), var(--parallax-y-back, 0px));
            }
            .parallax-layer-mid {
              transform: translate(var(--parallax-x-mid, 0px), var(--parallax-y-mid, 0px));
            }
            .parallax-layer-front {
              transform: translate(var(--parallax-x-front, 0px), var(--parallax-y-front, 0px)) 
                         perspective(1200px) 
                         rotateY(var(--parallax-rotate-y, 0deg)) 
                         rotateX(var(--parallax-rotate-x, 0deg));
            }
          }
        `}</style>

        {/* Layer 1: Farthest Background Layer (grid floor & decorative hexagons/icons) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden parallax-layer-back">
          {/* Perspective grid floor */}
          <div className="absolute bottom-0 left-0 right-0 h-[220px] perspective-grid opacity-75" />

          {/* Hexagonal frames and icons (matching the reference image layout) */}
          
          {/* Top Left: Hexagon with Heart */}
          <div className="absolute top-[15%] left-[8%] opacity-20 hidden lg:block">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full text-teal-600 animate-heartbeat-breath" viewBox="0 0 100 100" fill="none">
                <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" stroke="currentColor" strokeWidth="1.5" fill="rgba(255,255,255,0.7)" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Heart className="w-6 h-6 text-teal-600 animate-heartbeat" />
              </div>
            </div>
          </div>

          {/* Left Middle: Faint Plus icon */}
          <div className="absolute top-[32%] left-[18%] opacity-25 hidden lg:block">
            <span className="text-3xl text-teal-500 font-extrabold select-none">+</span>
          </div>

          {/* Left Bottom: Users/Elderly couple outline */}
          <div className="absolute bottom-[22%] left-[10%] opacity-20 hidden lg:block">
            <div className="flex flex-col items-center justify-center p-3 bg-white/40 rounded-2xl border border-slate-100/50 backdrop-blur-xs">
              <Users className="w-10 h-10 text-slate-500" strokeWidth={1.2} />
            </div>
          </div>

          {/* Top Right: Hexagon with Pill/Capsule */}
          <div className="absolute top-[16%] right-[10%] opacity-20 hidden lg:block">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full text-teal-600 animate-heartbeat-breath" viewBox="0 0 100 100" fill="none">
                <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" stroke="currentColor" strokeWidth="1.5" fill="rgba(255,255,255,0.7)" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl select-none">💊</span>
              </div>
            </div>
          </div>

          {/* Right Middle Top: Faint Plus icon */}
          <div className="absolute top-[30%] right-[19%] opacity-25 hidden lg:block">
            <span className="text-3xl text-teal-500 font-extrabold select-none">+</span>
          </div>

          {/* Right Middle: Hexagon with Shield */}
          <div className="absolute top-[44%] right-[7%] opacity-20 hidden lg:block">
            <div className="relative w-14 h-14">
              <svg className="w-full h-full text-teal-600" viewBox="0 0 100 100" fill="none">
                <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" stroke="currentColor" strokeWidth="1.5" fill="rgba(255,255,255,0.7)" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-5 h-5 text-teal-600" />
              </div>
            </div>
          </div>

          {/* Right Bottom: Clipboard outline */}
          <div className="absolute bottom-[24%] right-[11%] opacity-20 hidden lg:block">
            <div className="flex flex-col items-center justify-center p-3 bg-white/40 rounded-2xl border border-slate-100/50 backdrop-blur-xs">
              <ClipboardList className="w-10 h-10 text-slate-500" strokeWidth={1.2} />
            </div>
          </div>
        </div>

        {/* Layer 2: Middle Layer (SVG giant heart & ECG lines) */}
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center overflow-hidden parallax-layer-mid">
          <svg className="w-full h-full min-w-[1000px] max-w-[1400px] overflow-visible select-none animate-ecg-vibe" viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="heart-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="12" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="ecg-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="ecg-left-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(13, 148, 136, 0.02)" />
                <stop offset="70%" stopColor="#0d9488" />
                <stop offset="100%" stopColor="rgba(20, 184, 166, 0.5)" />
              </linearGradient>
              <linearGradient id="ecg-right-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(20, 184, 166, 0.5)" />
                <stop offset="30%" stopColor="#0d9488" />
                <stop offset="100%" stopColor="rgba(13, 148, 136, 0.02)" />
              </linearGradient>
            </defs>

            {/* Left side ECG line */}
            <path 
              d="M -50,300 H 220 L 235,285 L 250,300 L 260,315 L 275,160 L 295,410 L 310,300 L 330,275 L 350,300 H 460" 
              stroke="url(#ecg-left-grad)" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              filter="url(#ecg-glow)"
              className="opacity-60 lg:opacity-90 animate-heartbeat"
            />

            {/* Giant Central Heart Outline Frame */}
            <path 
              d="M 600, 155 C 500, 35 360, 95 360, 230 C 360, 370 500, 480 600, 545 C 700, 480 840, 370 840, 230 C 840, 95 700, 35 600, 155 Z" 
              stroke="white" 
              strokeWidth="6" 
              fill="white"
              fillOpacity="0.75"
              filter="url(#heart-glow)"
              className="drop-shadow-[0_0_35px_rgba(20,184,166,0.3)] select-none"
            />
            
            {/* Fine Teal Accent Line on Heart Frame */}
            <path 
              d="M 600, 155 C 500, 35 360, 95 360, 230 C 360, 370 500, 480 600, 545 C 700, 480 840, 370 840, 230 C 840, 95 700, 35 600, 155 Z" 
              stroke="rgba(20, 184, 166, 0.25)" 
              strokeWidth="1.5" 
              fill="none"
              className="select-none"
            />

            {/* Right side ECG line */}
            <path 
              d="M 740,300 H 810 L 825,285 L 840,300 L 850,315 L 865,160 L 885,410 L 900,300 L 920,275 L 940,300 H 1250" 
              stroke="url(#ecg-right-grad)" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              filter="url(#ecg-glow)"
              className="opacity-60 lg:opacity-90 animate-heartbeat"
            />
          </svg>
        </div>

        {/* Layer 3: Front Layer (Centered Content Card) */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center z-20 parallax-layer-front relative select-text">
          
          {/* Top Sparkling Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/5 border border-teal-500/10 text-teal-800 text-[11px] font-bold mb-6 hover:bg-teal-500/10 transition-colors duration-200">
            <Sparkles className="h-3.5 w-3.5 text-teal-600 animate-spin" />
            <span>Introducing Next-Gen Elder Care</span>
          </div>

          {/* Centered Pulsing Logo Box */}
          <div className="rounded-2xl bg-white border border-teal-100 p-3 shadow-md w-16 h-16 flex items-center justify-center animate-heartbeat-breath mb-6">
            <HeartPulse className="h-9 w-9 text-teal-600" />
          </div>

          {/* Main Logo Brand Title */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight mb-4 select-text">
            Care<span className="text-teal-600">Companion</span> AI
          </h1>

          {/* Centered Subtitle */}
          <p className="text-lg sm:text-2xl font-extrabold bg-gradient-to-r from-teal-600 to-sky-600 bg-clip-text text-transparent leading-normal max-w-2xl mb-4 select-text">
            Your AI-Powered Elder Care Companion
          </p>

          {/* Center Descriptive Paragraph */}
          <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed max-w-xl mb-8 select-text">
            Helping elderly patients stay on track with medicines, voice reminders, caregiver monitoring, and doctor-ready health reports.
          </p>

          {/* Centered Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center items-center">
            <Link
              href="/patients"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-sm font-extrabold rounded-full text-white bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 shadow-md hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <button
              onClick={scrollToProblem}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 border border-slate-200 text-sm font-extrabold rounded-full text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200 hover:scale-[1.02] shadow-xs cursor-pointer"
            >
              Learn More
            </button>
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
              
              <p className="text-sm text-slate-600 leading-relaxed">
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
              
              <p className="text-sm text-slate-600 leading-relaxed">
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
            <p className="text-slate-600 max-w-xl mx-auto text-sm">
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
                <p className="text-[11px] text-slate-600 leading-relaxed">
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
                <p className="text-[11px] text-slate-600 leading-relaxed">
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
                <p className="text-[11px] text-slate-600 leading-relaxed">
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
                <p className="text-[11px] text-slate-600 leading-relaxed">
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
                <p className="text-[11px] text-slate-600 leading-relaxed">
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
            <p className="text-slate-600 max-w-xl mx-auto text-sm">
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
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-2 md:mt-0">
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
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-2 md:mt-0">
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
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-2 md:mt-0">
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
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-2 md:mt-0">
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
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-2 md:mt-0">
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
