"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppState } from "@/context/AppContext";
import { HeartPulse, Menu, X, User, Sun, Moon } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const { activeProfile, theme, toggleTheme } = useAppState();
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-dark-bg-primary/80 backdrop-blur-lg shadow-2xs print:hidden transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo & Brand & Active Patient Badge */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="rounded-lg bg-teal-50 dark:bg-teal-950/40 p-1.5 text-teal-600 dark:text-teal-400 transition-colors group-hover:bg-teal-100 dark:group-hover:bg-teal-900/40">
                <HeartPulse className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-dark-text-primary">
                Care<span className="text-teal-600 dark:text-teal-400">Companion</span> AI
              </span>
            </Link>

            {/* Active patient badge only visible when inside application */}
            {isInternalRoute && mounted && (
              activeProfile ? (
                <Link 
                  href="/patients" 
                  className="hidden md:flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 py-1 px-2.5 rounded-full text-xs font-bold transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                >
                  <User className="h-3.5 w-3.5" />
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Active: {activeProfile.name}</span>
                </Link>
              ) : (
                <Link 
                  href="/patients" 
                  className="hidden md:flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-450 border border-amber-100 dark:border-amber-900/40 py-1 px-2.5 rounded-full text-xs font-bold transition-all hover:bg-amber-100 dark:hover:bg-amber-900/60"
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
                    ? "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-455 shadow-2xs font-semibold"
                    : "text-slate-800 dark:text-dark-text-secondary hover:bg-slate-50 dark:hover:bg-dark-bg-elevated hover:text-teal-600 dark:hover:text-teal-400"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Section Button + Theme Toggle */}
          <div className="hidden xl:flex items-center gap-3">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-800 dark:text-dark-text-primary hover:bg-slate-50 dark:hover:bg-dark-bg-elevated border border-slate-200 dark:border-slate-705 transition-all cursor-pointer flex items-center justify-center"
                title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
              >
                {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
              </button>
            )}

            {isInternalRoute ? (
              <Link
                href="/"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-slate-700 dark:text-dark-text-primary hover:text-slate-905 dark:hover:text-white bg-slate-50 dark:bg-dark-bg-secondary hover:bg-slate-100 dark:hover:bg-dark-bg-elevated border border-slate-200 dark:border-slate-700 rounded-full transition-all duration-200"
              >
                Exit App
              </Link>
            ) : (
              <Link
                href="/patients"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white bg-teal-600 dark:bg-teal-550 hover:bg-teal-700 dark:hover:bg-teal-500 rounded-full shadow-xs hover:shadow-md transition-all duration-200"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex xl:hidden gap-2 items-center">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-800 dark:text-dark-text-primary hover:bg-slate-50 dark:hover:bg-dark-bg-elevated border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center"
                title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-dark-bg-elevated hover:text-slate-900 dark:hover:text-white focus:outline-hidden"
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
        <div className="xl:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-dark-bg-secondary" id="mobile-menu">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {isInternalRoute && mounted && activeProfile && (
              <div className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-dark-text-secondary bg-slate-50 dark:bg-dark-bg-card border border-slate-200 dark:border-slate-700 rounded-md m-2 flex items-center justify-between">
                <span>Current Patient: {activeProfile.name}</span>
                <Link href="/patients" onClick={() => setIsOpen(false)} className="text-teal-605 dark:text-teal-400 hover:underline">Change</Link>
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
                    ? "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 font-semibold"
                    : "text-slate-800 dark:text-dark-text-secondary hover:bg-slate-50 dark:hover:bg-dark-bg-elevated hover:text-teal-600 dark:hover:text-teal-400"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-4 px-3 flex flex-col gap-2 pb-2">
              {isInternalRoute ? (
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center block px-4 py-2.5 text-base font-bold text-slate-800 dark:text-dark-text-secondary bg-slate-100 dark:bg-dark-bg-card hover:bg-slate-200 dark:hover:bg-dark-bg-elevated border border-slate-200 dark:border-slate-700 rounded-md shadow-xs"
                >
                  Exit App
                </Link>
              ) : (
                <Link
                  href="/patients"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center block px-4 py-2.5 text-base font-bold text-white bg-teal-600 dark:bg-teal-555 hover:bg-teal-700 dark:hover:bg-teal-500 rounded-md shadow-xs"
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
