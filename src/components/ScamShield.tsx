import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  PhoneCall,
  Lock,
  ArrowRight,
  Copy,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { ScamShieldResponse } from '../types/legal';

interface ScamShieldProps {
  initialText?: string;
}

export const ScamShield: React.FC<ScamShieldProps> = ({ initialText = '' }) => {
  const [suspectText, setSuspectText] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScamShieldResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleScams = [
    {
      title: 'Digital Arrest Call (CBI / Police)',
      text: 'Urgent notice from CBI Head Office: A FedEx parcel with your Aadhaar containing drugs was intercepted at Mumbai Airport. You are under DIGITAL ARREST. Join Skype interrogation immediately or face arrest. Transfer ₹98,000 to RBI verification account.',
    },
    {
      title: 'Electricity Power Cutoff Tonight',
      text: 'Dear Consumer, Your electricity will be disconnected tonight at 9:30 PM because your bill is not updated. Please immediately call officer on 98321xxxxx or download the power update APK file.',
    },
    {
      title: 'FedEx Customs Drug Parcel',
      text: 'DHL Express Alert: Your parcel to Cambodia was detained by Mumbai Customs Anti-Narcotics department. 16 fake debit cards found. Call customs inspector on WhatsApp to pay fine and cancel FIR.',
    },
  ];

  const handleScan = async (textToScan?: string) => {
    const text = textToScan || suspectText;
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/legal/scam-shield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspectText: text }),
      });

      const data = await res.json();
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to analyze message.');
      }

      setResult(data.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error running scam scan.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `⚠️ SCAM VERDICT: ${result.verdict}\n\nSummary: ${result.summary}\n\nEmergency Helpline: Call 1930 immediately or visit cybercrime.gov.in`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          <ShieldAlert className="w-7 h-7 text-rose-500" />
          <span>Scam & Fraud Shield</span>
        </h1>
        <p className="text-sm text-slate-300 max-w-lg mx-auto">
          Received a scary call, message, or notice? Paste it here to verify whether it is a real legal notice or a cyber extortion scam.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-[#121929] border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3">
        <textarea
          value={suspectText}
          onChange={(e) => setSuspectText(e.target.value)}
          placeholder="Paste the SMS, WhatsApp message, email, or describe what the caller said... (e.g. 'Caller in police uniform on video call claimed my Aadhaar was used in crime and demanded money')"
          rows={4}
          className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3.5 text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% private. Nothing is stored or logged.</span>
          </div>

          <div className="flex items-center gap-2">
            {suspectText && (
              <button
                type="button"
                onClick={() => {
                  setSuspectText('');
                  setResult(null);
                }}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
              >
                Clear
              </button>
            )}

            <button
              type="button"
              disabled={loading || !suspectText.trim()}
              onClick={() => handleScan()}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 shadow-lg shadow-rose-950/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Checking Threat...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Verify Message Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Common Scams to Test */}
      {!result && !loading && (
        <div className="space-y-2 pt-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Test with common cyber fraud attacks:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {sampleScams.map((scam, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSuspectText(scam.text);
                  handleScan(scam.text);
                }}
                className="text-left bg-slate-900 border border-slate-800 hover:border-rose-500/40 rounded-xl p-3.5 transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-rose-300 block mb-1">
                    {scam.title}
                  </span>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {scam.text}
                  </p>
                </div>
                <div className="mt-2 text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                  <span>Scan</span>
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

      {/* VERDICT DISPLAY */}
      {result && (
        <div className="space-y-4 animate-fadeIn">
          {/* Main Verdict Banner */}
          <div
            className={`border rounded-2xl p-5 shadow-2xl space-y-3 ${
              result.riskScore >= 60
                ? 'bg-gradient-to-br from-rose-950/80 via-[#121929] to-rose-950/30 border-rose-500/60'
                : 'bg-gradient-to-br from-emerald-950/80 via-[#121929] to-emerald-950/30 border-emerald-500/60'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    result.riskScore >= 60
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-emerald-500 text-slate-950'
                  }`}
                >
                  {result.verdict.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  Risk: {result.riskScore}/100
                </span>
              </div>

              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Share Verdict'}</span>
              </button>
            </div>

            <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
              {result.summary}
            </p>

            {/* Emergency Hotline for Scams */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-rose-300 font-semibold">
                Transferred money? Call within the Golden Hour to freeze accounts:
              </span>
              <a
                href="tel:1930"
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Cyber Helpline: 1930</span>
              </a>
            </div>
          </div>

          {/* Red Flags & Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Red Flags */}
            <div className="bg-[#121929] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Detected Red Flags</span>
              </h3>
              <div className="space-y-1.5">
                {result.detectedRedFlags.map((flag, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-rose-200/90 flex items-start gap-2">
                    <span className="text-rose-400">🚩</span>
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Protective Steps */}
            <div className="bg-[#121929] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>What to do right now</span>
              </h3>
              <div className="space-y-1.5">
                {result.immediateProtectiveSteps.map((step, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
