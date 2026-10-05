import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Info,
  Scale,
} from 'lucide-react';
import { LIMITATION_PERIODS, LimitationGuide } from '../data/legalCorpus';

export const LimitationCalculator: React.FC = () => {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);
  const [triggerDate, setTriggerDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  const currentGuide = LIMITATION_PERIODS[selectedCaseIdx] || LIMITATION_PERIODS[0];

  const calculateDeadline = () => {
    if (!triggerDate) return null;
    const base = new Date(triggerDate);
    if (isNaN(base.getTime())) return null;

    let deadline = new Date(base);

    switch (currentGuide.caseType) {
      case 'Cheque Bounce (Dishonour)':
        // 30 days for notice
        deadline.setDate(deadline.getDate() + 30);
        break;
      case 'Consumer Complaint (Defective goods/service)':
        // 2 years
        deadline.setFullYear(deadline.getFullYear() + 2);
        break;
      case 'RTI First Appeal':
        // 30 days
        deadline.setDate(deadline.getDate() + 30);
        break;
      case 'Recovery of Money / Unpaid Salary / Debt':
      case 'Tenant Security Deposit Recovery':
      case 'Breach of Contract Damages':
        // 3 years
        deadline.setFullYear(deadline.getFullYear() + 3);
        break;
      default:
        deadline.setDate(deadline.getDate() + 30);
    }

    const today = new Date();
    const diffMs = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return {
      deadlineDate: deadline.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      diffDays,
      isExpired: diffDays < 0,
    };
  };

  const calcResult = calculateDeadline();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Statutory Limitation Act, 1963 Calculator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Limitation Period & Filing Deadline Calculator
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Under Section 3 of the Limitation Act, 1963, courts must dismiss any case filed after the deadline, even if the other party doesn't raise it. Never miss your limitation clock.
        </p>
      </div>

      {/* Main Interactive Calculator */}
      <div className="bg-[#101726] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Select Case Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
              1. Select Legal Dispute Category
            </label>
            <select
              value={selectedCaseIdx}
              onChange={(e) => setSelectedCaseIdx(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              {LIMITATION_PERIODS.map((item, idx) => (
                <option key={idx} value={idx}>
                  {item.caseType}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-amber-400 block font-mono">
              Governing Law: {currentGuide.actName}
            </span>
          </div>

          {/* Trigger Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
              2. Enter Cause of Action / Trigger Date
            </label>
            <input
              type="date"
              value={triggerDate}
              onChange={(e) => setTriggerDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <span className="text-[11px] text-slate-400 block">
              Trigger Event: {currentGuide.triggerEvent}
            </span>
          </div>
        </div>

        {/* Calculation Result Display */}
        {calcResult && (
          <div
            className={`rounded-2xl p-5 border shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              calcResult.isExpired
                ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                : 'bg-emerald-950/20 border-emerald-500/50 text-emerald-200'
            }`}
          >
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider block">
                {calcResult.isExpired ? '⚠️ STATUTORY LIMITATION EXPIRED' : '✅ ACTIVE FILING WINDOW'}
              </span>
              <div className="text-xl sm:text-2xl font-black text-white">
                Deadline Date: {calcResult.deadlineDate}
              </div>
              <p className="text-xs">
                {calcResult.isExpired
                  ? `This limitation clock expired ${Math.abs(calcResult.diffDays)} days ago. You may require a Section 5 Condonation of Delay application.`
                  : `You have approximately ${calcResult.diffDays} days remaining to issue notice or lodge petition.`}
              </p>
            </div>

            <div className="flex-shrink-0 text-center bg-slate-900/90 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Statutory Window</span>
              <span className="text-base font-extrabold text-amber-300">
                {currentGuide.limitationPeriod}
              </span>
            </div>
          </div>
        )}

        {/* Risk of Delay Note */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-1">
          <strong className="text-white block font-bold">Consequence of Exceeding Limitation:</strong>
          <p>{currentGuide.riskOfDelay}</p>
        </div>

        {/* Section 5 Limitation Act Note */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-200/90 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <Scale className="w-4 h-4" />
            <span>Section 5, Limitation Act, 1963 (Condonation of Delay)</span>
          </div>
          <p className="leading-relaxed">
            Courts can admit an appeal or application after the limitation period only if the applicant satisfies the court that they had <em>sufficient cause</em> (e.g., severe illness, fraud concealed by opponent, official lockdown). <strong>Note:</strong> Section 5 does NOT apply to original civil suits or Section 138 notices.
          </p>
        </div>
      </div>

      {/* Reference Table of Limitation Periods */}
      <div className="bg-[#101726] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Statutory Limitation Reference Guide</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {LIMITATION_PERIODS.map((guide, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white">{guide.caseType}</h4>
                <span className="text-[11px] font-bold text-amber-300 font-mono">
                  {guide.limitationPeriod}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                <strong>Act:</strong> {guide.actName}
              </div>
              <div className="text-[11px] text-slate-400">
                <strong>Clock Starts On:</strong> {guide.triggerEvent}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
