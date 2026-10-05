import React, { useState } from 'react';
import {
  RefreshCw,
  Search,
  ExternalLink,
  BookOpen,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Scale,
} from 'lucide-react';
import {
  CRIMINAL_LAW_MAPPINGS,
  PROCEDURAL_LAW_MAPPINGS,
  CriminalSectionMap,
  ProcedureMap,
} from '../data/legalCorpus';

interface CodeConverterProps {
  initialSearch?: string;
}

export const CodeConverter: React.FC<CodeConverterProps> = ({ initialSearch = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState<'substantive' | 'procedure'>('substantive');

  const filteredSubstantive = CRIMINAL_LAW_MAPPINGS.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      item.offense.toLowerCase().includes(term) ||
      item.bnsSection.toLowerCase().includes(term) ||
      item.oldIpcSection.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      item.keyChanges.toLowerCase().includes(term)
    );
  });

  const filteredProcedure = PROCEDURAL_LAW_MAPPINGS.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      item.topic.toLowerCase().includes(term) ||
      item.bnssSection.toLowerCase().includes(term) ||
      item.crpcSection.toLowerCase().includes(term) ||
      item.ruleExplanation.toLowerCase().includes(term) ||
      item.practicalRight.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
          <span>New Criminal Codes (In Force 1 July 2024) Converter</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          BNS ↔ IPC Criminal Code Converter
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Convert any old IPC, CrPC, or Evidence Act section to the new Bharatiya Nyaya Sanhita (BNS), Bharatiya Nagarik Suraksha Sanhita (BNSS), and Bharatiya Sakshya Adhiniyam (BSA).
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-[#101726] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Section (e.g., '420', '302', '318', '498A') or Offense (e.g., 'cheating', 'theft', 'arrest', 'bail', 'zero fir')..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-24 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Tab switch between Substantive (BNS ↔ IPC) and Procedural (BNSS ↔ CrPC) */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('substantive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'substantive'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Substantive Crimes: BNS 2023 ↔ IPC 1860 ({filteredSubstantive.length})
          </button>
          <button
            onClick={() => setActiveTab('procedure')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'procedure'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Procedure & Arrest: BNSS 2023 ↔ CrPC 1973 ({filteredProcedure.length})
          </button>
        </div>
      </div>

      {/* Quick Jump Tags */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-500 text-[11px] font-semibold">Quick Jump:</span>
        {[
          { label: 'Cheating (420 → 318)', q: 'cheating' },
          { label: 'Theft (379 → 303)', q: 'theft' },
          { label: 'Dowry (498A → 85)', q: 'dowry' },
          { label: 'Murder (302 → 103)', q: 'murder' },
          { label: 'Defamation (499 → 356)', q: 'defamation' },
          { label: 'Zero FIR (BNSS 173)', q: 'zero fir' },
          { label: 'Arrest Rights (BNSS 35)', q: 'arrest' },
          { label: 'Anticipatory Bail (BNSS 482)', q: 'bail' },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => setSearchTerm(item.q)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-amber-500/40 text-[11px] transition-all cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Substantive Offenses (BNS ↔ IPC) */}
      {activeTab === 'substantive' && (
        <div className="space-y-4">
          {filteredSubstantive.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-sm">
              No matching offenses found for "{searchTerm}". Try searching by section number like "420" or "318".
            </div>
          ) : (
            filteredSubstantive.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#101726] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl space-y-3 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {item.offense}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        item.bailable
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {item.bailable ? 'Bailable' : 'Non-Bailable'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        item.cognizable
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.cognizable ? 'Cognizable (Arrest without warrant)' : 'Non-Cognizable'}
                    </span>
                  </div>
                </div>

                {/* Side-by-Side Section Mapping */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* New BNS Section */}
                  <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                        Current Law (Post-1 July 2024)
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">BNS 2023</span>
                    </div>
                    <div className="text-base font-extrabold text-white">
                      {item.bnsSection}
                    </div>
                    <div className="text-xs text-slate-300 font-medium">
                      {item.bnsTitle}
                    </div>
                  </div>

                  {/* Old IPC Section */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                        Legacy Law (Prior to 1 July 2024)
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">IPC 1860</span>
                    </div>
                    <div className="text-base font-extrabold text-slate-300">
                      {item.oldIpcSection}
                    </div>
                    <div className="text-xs text-slate-400">
                      {item.oldIpcTitle}
                    </div>
                  </div>
                </div>

                {/* Punishment & Key Changes */}
                <div className="space-y-2 pt-1 text-xs">
                  <div className="text-slate-300">
                    <strong className="text-white">Prescribed Punishment: </strong>
                    {item.punishment}
                  </div>
                  <div className="text-amber-200/90 bg-amber-950/20 border border-amber-500/20 p-2.5 rounded-xl">
                    <strong className="text-amber-300">Key Modern Changes in BNS: </strong>
                    {item.keyChanges}
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-end">
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-slate-400 hover:text-slate-200 inline-flex items-center gap-1"
                  >
                    <span>India Code Official Gazette</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Procedural Law (BNSS ↔ CrPC) */}
      {activeTab === 'procedure' && (
        <div className="space-y-4">
          {filteredProcedure.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#101726] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">{item.topic}</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/30">
                    {item.bnssSection}
                  </span>
                  <span className="text-slate-500 font-bold">vs</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {item.crpcSection}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {item.ruleExplanation}
              </p>

              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-200">
                <strong className="text-emerald-300 block mb-0.5">Your Practical Citizen Right:</strong>
                {item.practicalRight}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
