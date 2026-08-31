'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  TrendingUp,
  Grid3X3,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  Moon,
  Sun,
  Database,
  Cpu,
  RefreshCw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  currentDatasetName?: string;
  onSelectDataset?: (type: 'electronics' | 'automotive' | 'aerospace') => void;
  isBackendConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentDatasetName = 'Global Electronics Dataset (520 POs)',
  onSelectDataset,
  isBackendConnected = false
}) => {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [datasetDropdownOpen, setDatasetDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    // Check initial theme from document
    const isDark = document.documentElement.classList.contains('dark') || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const navItems = [
    { name: 'Executive Overview', href: '/', icon: BarChart3 },
    { name: 'Predictive Analytics', href: '/analytics', icon: TrendingUp },
    { name: '3x3 Risk Matrix', href: '/risk-matrix', icon: Grid3X3 },
    { name: 'Disruption & 50% Loss', href: '/disruption', icon: AlertTriangle },
    { name: 'Strategy & Audit Log', href: '/strategies', icon: Layers },
    { name: 'Data Ingestion', href: '/import', icon: FileSpreadsheet },
    { name: 'A3 Poster Studio', href: '/poster', icon: Sparkles }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-md transition-colors duration-200">
      {/* Top Banner with exact branding & developer credits */}
      <div className="border-b border-border/40 bg-gradient-to-r from-brand-950 via-slate-900 to-brand-900 px-4 py-2 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 shadow-md">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-white">Provendex</span>
                <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-semibold text-brand-300 border border-brand-400/30">
                  AI Procurement & Risk OS
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-300 tracking-wide">
                Developed by <span className="font-semibold text-brand-300">HAJANDIKA | ISMAIL | RISHIBH | RITHIN</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Dual Engine Indicator */}
            <div className="hidden sm:flex items-center gap-2 rounded-md bg-slate-800/80 px-2.5 py-1 border border-slate-700">
              <Cpu className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">Engine:</span>
              <span className="font-semibold text-emerald-400">Client ML Core (Vercel Ready)</span>
            </div>

            {/* Dark/Light Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-brand-300" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5">
        <nav className="flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Quick Dataset Selector Dropdown */}
        {onSelectDataset && (
          <div className="relative ml-2 shrink-0">
            <button
              onClick={() => setDatasetDropdownOpen(!datasetDropdownOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <Database className="h-3.5 w-3.5 text-brand-500" />
              <span className="hidden md:inline max-w-[170px] truncate">{currentDatasetName}</span>
              <span className="md:hidden">Dataset</span>
              <RefreshCw className="h-3 w-3 text-muted-foreground ml-1" />
            </button>

            {datasetDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-popover p-1.5 shadow-xl z-50 text-xs">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Load Preset Scenario
                </div>
                <button
                  onClick={() => {
                    onSelectDataset('electronics');
                    setDatasetDropdownOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-secondary text-foreground flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold">Electronics & Chips</div>
                    <div className="text-[10px] text-muted-foreground">520 POs • 8 Suppliers</div>
                  </div>
                  <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                </button>
                <button
                  onClick={() => {
                    onSelectDataset('automotive');
                    setDatasetDropdownOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-secondary text-foreground flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold">Automotive Mechanical</div>
                    <div className="text-[10px] text-muted-foreground">380 POs • Precision Parts</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onSelectDataset('aerospace');
                    setDatasetDropdownOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-secondary text-foreground flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold">Aerospace & Medical</div>
                    <div className="text-[10px] text-muted-foreground">260 POs • High Reliability</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
