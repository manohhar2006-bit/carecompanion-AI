"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppState } from "@/context/AppContext";
import { HeartPulse, Menu, X, User } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const { activeProfile } = useAppState();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Internal routes of the application
  const isInternalRoute = [
    "/dashboard",
    "/add-medicine",
    "/upload",
    "/reminders",
    "/caregiver",
    "/report",
    "/consultation"
  ].some((path) => pathname.startsWith(path));

  // Determine navigation menu items dynamically
  const navItems = isInternalRoute
    ? [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Medicines", href: "/add-medicine" },
        { name: "Prescription Upload", href: "/upload" },
        { name: "Voice Reminders", href: "/reminders" },
        { name: "Caregiver Dashboard", href: "/caregiver" },
        { name: "Doctor Reports", href: "/report" },
        { name: "Consultation Summarizer", href: "/consultation" },
      ]
    : [
        { name: "Home", href: "/#hero", sectionId: "hero" },
        { name: "Features", href: "/#features", sectionId: "features" },
        { name: "How It Works", href: "/#how-it-works", sectionId: "how-it-works" },
        { name: "About", href: "/#about", sectionId: "about" },
      ];

  // Active section tracking on scroll
  useEffect(() => {
    if (pathname !== "/" || isInternalRoute) return;

    const handleScroll = () => {
      const sections = ["hero", "features", "how-it-works", "about"];
      const scrollPosition = window.scrollY + 120; // sticky navbar + buffer

      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, isInternalRoute]);

  // Handle smooth scroll clicks for public homepage anchors
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === "/" && href.startsWith("/#")) {
      e.preventDefault();
      const id = href.replace("/#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", href);
      }
      setIsOpen(false);
    }
  };

  const isLinkActive = (item: { href: string; sectionId?: string }) => {
    if (isInternalRoute) {
      return pathname.startsWith(item.href);
    }
    if (pathname === "/") {
      return activeSection === item.sectionId;
    }
    return pathname === item.href;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-lg shadow-2xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo & Brand & Active Patient Badge */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="rounded-lg bg-teal-50 p-1.5 text-teal-600 transition-colors group-hover:bg-teal-100">
                <HeartPulse className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">
                Care<span className="text-teal-600">Companion</span> AI
              </span>
            </Link>

            {/* Active patient badge only visible when inside application */}
            {isInternalRoute && mounted && (
              activeProfile ? (
                <Link 
                  href="/patients" 
                  className="hidden md:flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-255 border-emerald-100 py-1 px-2.5 rounded-full text-xs font-bold transition-all hover:bg-emerald-100"
                >
                  <User className="h-3.5 w-3.5" />
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Active: {activeProfile.name}</span>
                </Link>
              ) : (
                <Link 
                  href="/patients" 
                  className="hidden md:flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-100 py-1 px-2.5 rounded-full text-xs font-bold transition-all hover:bg-amber-100"
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                  <span>Select Patient</span>
                </Link>
              )
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isLinkActive(item)
                    ? "bg-teal-50 text-teal-700 shadow-2xs font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-teal-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Section Button */}
          <div className="hidden xl:flex items-center">
            {isInternalRoute ? (
              <Link
                href="/"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-all duration-200"
              >
                Exit App
              </Link>
            ) : (
              <Link
                href="/patients"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-full shadow-xs hover:shadow-md transition-all duration-200"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex xl:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="xl:hidden border-t border-slate-100 bg-white" id="mobile-menu">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {isInternalRoute && mounted && activeProfile && (
              <div className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-md m-2 flex items-center justify-between">
                <span>Current Patient: {activeProfile.name}</span>
                <Link href="/patients" onClick={() => setIsOpen(false)} className="text-teal-600 hover:underline">Change</Link>
              </div>
            )}
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  handleNavClick(e, item.href);
                  if (!item.href.startsWith("/#")) setIsOpen(false);
                }}
                className={`block px-3 py-2.5 rounded-md text-base font-medium ${
                  isLinkActive(item)
                    ? "bg-teal-50 text-teal-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-teal-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-4 px-3">
              {isInternalRoute ? (
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center block px-4 py-2.5 text-base font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md shadow-xs"
                >
                  Exit App
                </Link>
              ) : (
                <Link
                  href="/patients"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center block px-4 py-2.5 text-base font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-xs"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

