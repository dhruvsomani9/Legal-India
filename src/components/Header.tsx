import React, { useState } from 'react';
import { Scale, ShieldAlert, Globe, PhoneCall, X, AlertTriangle, FileText, MessageSquareQuote, Bot } from 'lucide-react';
import { SUPPORTED_LANGUAGES, EMERGENCY_HELPLINES } from '../data/legalCorpus';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedLanguage,
  setSelectedLanguage,
}) => {
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const mainTabs = [
    { id: 'bot', label: 'AI Legal Bot', labelHi: 'एआई कानूनी बॉट', icon: Bot, badge: 'New' },
    { id: 'advisor', label: 'Legal Advisor', labelHi: 'कानूनी सलाह', icon: MessageSquareQuote },
    { id: 'scam-shield', label: 'Scam Shield', labelHi: 'धोखाधड़ी जांचें', icon: ShieldAlert },
    { id: 'documents', label: 'Draft Notices', labelHi: 'नोटिस प्रारूप', icon: FileText },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0c1220]/95 backdrop-blur-md border-b border-slate-800">
        {/* Simple Emergency Help Ticker */}
        <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-1 text-xs text-amber-200/90">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] sm:text-xs">
                Updated for <strong>BNS 2023</strong> (In effect 1 July 2024) • 100% Free Legal Help
              </span>
            </div>

            <button
              onClick={() => setShowEmergencyModal(true)}
              className="text-[11px] sm:text-xs text-rose-300 hover:text-rose-200 font-bold flex items-center gap-1 cursor-pointer"
            >
              <PhoneCall className="w-3 h-3 text-rose-400 animate-bounce" />
              <span>Emergency: 112 / 1930 / 181</span>
            </button>
          </div>
        </div>

        {/* Brand & Main Controls */}
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActiveTab('bot')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Scale className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight">
                  Legal India
                </span>
                <span className="text-[11px] text-amber-400 font-medium">
                  • {selectedLanguage === 'hi' ? 'भारतीय कानूनी सहायक' : 'Senior Lawyer in Your Pocket'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Navigation & Language */}
          <div className="flex items-center gap-3">
            {/* Main Tabs (Desktop) */}
            <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
              {mainTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{selectedLanguage === 'hi' ? tab.labelHi : tab.label}</span>
                    {tab.badge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-400 text-slate-950">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Language Selector */}
            <div className="relative flex items-center">
              <label htmlFor="language-select" className="sr-only">Select Language</label>
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                id="language-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg pl-7 pr-7 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer appearance-none"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Pills */}
        <div className="md:hidden flex border-t border-slate-800 px-4 py-2 bg-slate-950/80 gap-1.5 overflow-x-auto">
          {mainTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[95px] py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{selectedLanguage === 'hi' ? tab.labelHi : tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Emergency Helplines Popup */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#101726] border border-rose-500/40 rounded-2xl max-w-md w-full p-5 shadow-2xl relative">
            <button
              onClick={() => setShowEmergencyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Emergency Helplines (24/7 Toll-Free)</h3>
                <p className="text-xs text-rose-300">Tap to dial instantly</p>
              </div>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {EMERGENCY_HELPLINES.slice(0, 5).map((item) => (
                <div
                  key={item.number}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{item.name}</div>
                    <div className="text-[11px] text-slate-400">{item.description}</div>
                  </div>
                  <a
                    href={`tel:${item.number}`}
                    className="flex-shrink-0 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>{item.number}</span>
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
              For free court lawyer: <strong className="text-white">15100</strong> (NALSA)
            </div>
          </div>
        </div>
      )}
    </>
  );
};
