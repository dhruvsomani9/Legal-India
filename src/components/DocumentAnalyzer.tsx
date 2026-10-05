import React, { useState } from 'react';
import {
  Search,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { DocAnalysisResponse } from '../types/legal';

export const DocumentAnalyzer: React.FC = () => {
  const [docText, setDocText] = useState('');
  const [docType, setDocType] = useState('contract_or_notice');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DocAnalysisResponse | null>(null);

  const sampleDocs = [
    {
      title: 'Unfair Employment Service Bond (2 Years)',
      badge: 'Labour / Contract',
      text: `EMPLOYMENT SERVICE AGREEMENT & BOND CLAUSE:
"Clause 14: The Employee agrees to serve the Company for a minimum mandatory lock-in period of 24 months. In event of resignation prior to 24 months for any reason whatsoever, the Employee shall immediately pay the Company ₹2,50,000 as liquidated damages and training costs.
Clause 15 (Non-Compete): For a period of 2 years after cessation of employment, the Employee is strictly prohibited from joining any competitor company, client, or starting any business in the same industry anywhere in India."`,
    },
    {
      title: 'Unfair Residential Lease Agreement',
      badge: 'Tenancy / Rent',
      text: `RESIDENTIAL LEASE AGREEMENT:
"Clause 6: The Tenant has deposited ₹1,20,000 as interest-free security deposit. Upon termination, 50% of deposit shall be automatically deducted towards mandatory repainting and deep cleaning, regardless of property condition.
Clause 11: The Landlord reserves the absolute right to terminate tenancy without assigning reasons on 48 hours notice. Tenant shall not object to disconnection of power or water supply in case of eviction."`,
    },
    {
      title: 'Aggressive Legal Notice Received',
      badge: 'Notice Received',
      text: `LEGAL NOTICE:
"Under instructions of our client M/s Zenith Finance Ltd, you are called upon to pay alleged outstanding balance of ₹64,200 with 36% compound interest within 7 days. If you fail to pay, our client shall initiate criminal prosecution for cheating and criminal breach of trust under BNS Section 316/318 and attach your movable property without further reference."`,
    },
  ];

  const handleAnalyze = async (textToAnalyze?: string) => {
    const text = textToAnalyze || docText;
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/legal/analyze-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: text,
          docType,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.details || data.error || 'Failed to analyze document.');
      }

      setResult(data.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error running document analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Search className="w-3.5 h-3.5 text-amber-400" />
          <span>Clause-by-Clause Forensic Audit • Red Flags & Hidden Traps</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Legal Document & Contract Analyzer
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Paste any legal notice, employment agreement, rent lease, builder contract, or court order. We will translate the legalese into plain language, flag unfair clauses, and show your legal rights.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-[#101726] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <textarea
          value={docText}
          onChange={(e) => setDocText(e.target.value)}
          placeholder="Paste the contract clauses, legal notice text, employment agreement, or lease terms here..."
          rows={5}
          className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Document Type:</span>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="contract_or_notice">General Contract / Notice</option>
              <option value="employment_agreement">Employment Agreement / Bond</option>
              <option value="rent_agreement">Rent / Tenancy Lease</option>
              <option value="builder_agreement">Builder Buyer Agreement</option>
              <option value="court_order_or_fir">Court Order / FIR Copy</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {docText && (
              <button
                type="button"
                onClick={() => setDocText('')}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
              >
                Clear
              </button>
            )}

            <button
              type="button"
              disabled={loading || !docText.trim()}
              onClick={() => handleAnalyze()}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Auditing Clauses...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>Analyze Document</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sample Docs Chips */}
      {!result && !loading && (
        <div className="space-y-2">
          <div className="text-xs text-slate-400 font-semibold">
            Or test with common oppressive legal contracts:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {sampleDocs.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDocText(sample.text);
                  handleAnalyze(sample.text);
                }}
                className="text-left bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-3 transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      {sample.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {sample.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {sample.text}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                  <span>Analyze Clauses</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-4 text-xs text-rose-200">
          {error}
        </div>
      )}

      {/* ANALYSIS RESULT */}
      {result && (
        <div className="space-y-5 animate-fadeIn">
          {/* Executive Overview */}
          <div className="bg-[#101726] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Document Audit Result
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {result.documentTitle}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Risk Level:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                    result.riskLevel === 'CRITICAL' || result.riskLevel === 'HIGH'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : result.riskLevel === 'MEDIUM'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {result.riskLevel}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Plain Language Meaning:
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {result.plainLanguageSummary}
              </p>
            </div>
          </div>

          {/* One-Sided / Unfair Clauses Flagged */}
          <div className="bg-[#101726] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Flagged One-Sided or Illegal Clauses</span>
            </h4>

            <div className="space-y-3">
              {result.oneSidedClauses.map((clause, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="font-mono text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-amber-200/90 italic">
                    "{clause.clauseText}"
                  </div>

                  <div className="text-xs text-rose-200">
                    <strong className="text-rose-300">Why It Is Unfair / Unenforceable: </strong>
                    {clause.whyItIsUnfair}
                  </div>

                  {clause.applicableLaw && (
                    <div className="text-[11px] text-amber-400/90 font-medium">
                      ⚖️ <strong>Governing Statute:</strong> {clause.applicableLaw}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Key Deadlines & Recommended Action Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Deadlines */}
            <div className="bg-[#101726] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Notice Deadlines & Triggers</span>
              </h4>

              {result.keyDeadlinesFound && result.keyDeadlinesFound.length > 0 ? (
                <div className="space-y-2">
                  {result.keyDeadlinesFound.map((dl, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-rose-300 font-semibold flex items-center gap-2">
                      <span>⏳</span>
                      <span>{dl}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  No strict statutory response deadlines specifically stated in the provided text.
                </p>
              )}
            </div>

            {/* Recommended Reply & Counter-Strategy */}
            <div className="bg-[#101726] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Recommended Strategy & Counter-Action</span>
              </h4>

              <div className="space-y-2">
                {result.recommendedActionPlan.map((action, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                      {idx + 1}
                    </div>
                    <span className="leading-relaxed">{action}</span>
                  </div>
                ))}
              </div>

              {result.recommendedReplyStrategy && (
                <div className="pt-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <strong>Suggested Reply:</strong> {result.recommendedReplyStrategy}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
