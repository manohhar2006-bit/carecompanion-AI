"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartPulse } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Internal routes detection
  const isInternalRoute = [
    "/dashboard",
    "/add-medicine",
    "/upload",
    "/reminders",
    "/caregiver",
    "/report",
    "/consultation"
  ].some((path) => pathname.startsWith(path));

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === "/" && href.startsWith("/#")) {
      e.preventDefault();
      const id = href.replace("/#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", href);
      }
    }
  };
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-dark-bg-secondary text-slate-300 print:hidden">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Contact details */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="rounded-lg bg-teal-900 p-1.5 text-teal-400">
                <HeartPulse className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Care<span className="text-teal-400">Companion</span> AI
              </span>
            </Link>
            <p className="text-xs text-slate-300">
              Providing medical compliance solutions and family monitoring frameworks to support dignified aging.
            </p>
            <div className="text-xs text-slate-300 space-y-1">
              <p>📍 Metro Health Parkway, Suite 400</p>
              <p>📞 Adherence Helpline: 1-800-555-0199</p>
              <p>✉️ clinic-support@carecompanion.ai</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-100">
              {isInternalRoute ? "Patient Workspace" : "Platform Links"}
            </h3>
            {isInternalRoute ? (
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>
                  <Link href="/dashboard" className="hover:text-teal-400 transition-colors">
                    Daily Schedule
                  </Link>
                </li>
                <li>
                  <Link href="/add-medicine" className="hover:text-teal-400 transition-colors">
                    Log New Medication
                  </Link>
                </li>
                <li>
                  <Link href="/upload" className="hover:text-teal-400 transition-colors">
                    Upload Prescription
                  </Link>
                </li>
                <li>
                  <Link href="/reminders" className="hover:text-teal-400 transition-colors">
                    Voice Reminders Setup
                  </Link>
                </li>
              </ul>
            ) : (
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>
                  <Link href="/#hero" onClick={(e) => handleAnchorClick(e, "/#hero")} className="hover:text-teal-400 transition-colors">
                    Home Overview
                  </Link>
                </li>
                <li>
                  <Link href="/#features" onClick={(e) => handleAnchorClick(e, "/#features")} className="hover:text-teal-400 transition-colors">
                    Platform Features
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" onClick={(e) => handleAnchorClick(e, "/#how-it-works")} className="hover:text-teal-400 transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/#about" onClick={(e) => handleAnchorClick(e, "/#about")} className="hover:text-teal-400 transition-colors">
                    About Adherence
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Caregiver Portal */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-100">
              {isInternalRoute ? "Portals & Summary" : "Get Started"}
            </h3>
            {isInternalRoute ? (
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>
                  <Link href="/caregiver" className="hover:text-teal-400 transition-colors">
                    Caregiver Monitoring Panel
                  </Link>
                </li>
                <li>
                  <Link href="/consultation" className="hover:text-teal-400 transition-colors">
                    Consultation Summarizer
                  </Link>
                </li>
                <li>
                  <Link href="/report" className="hover:text-teal-400 transition-colors">
                    Doctor-Friendly Summary
                  </Link>
                </li>
                <li>
                  <Link href="/report" className="hover:text-teal-400 transition-colors">
                    Print Patient Report
                  </Link>
                </li>
              </ul>
            ) : (
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>
                  <Link href="/patients" className="hover:text-teal-400 transition-colors">
                    Register New Account
                  </Link>
                </li>
                <li>
                  <Link href="/patients" className="hover:text-teal-400 transition-colors">
                    Select Patient File
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Help & FAQs
                  </a>
                </li>
              </ul>
            )}
          </div>

        </div>

        <div className="mt-8 border-t border-slate-800 pt-8 space-y-4">
          <p className="text-[11px] text-slate-300 leading-relaxed">
            <strong>Disclaimer:</strong> CareCompanion AI is an interactive wellness tool and does not provide professional medical advice, diagnosis, or treatment. Always consult a physician for health concerns.
          </p>
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-300 pt-4 border-t border-slate-800/40">
            <p>© {new Date().getFullYear()} CareCompanion AI Clinic Portal. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms of Service</a>
              <a href="#" className="hover:underline">Clinic Directory</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
