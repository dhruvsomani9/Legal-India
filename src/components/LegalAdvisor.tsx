import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  Building,
  Scale,
  Sparkles,
  PhoneCall,
  RotateCcw,
} from 'lucide-react';
import { LegalConsultationResponse } from '../types/legal';
import { EmergencyBanner } from './EmergencyBanner';
import { SUPPORTED_LANGUAGES } from '../data/legalCorpus';

interface LegalAdvisorProps {
  selectedLanguage: string;
  onNavigateToDocument: (templateId?: string, userStory?: string) => void;
  onNavigateToScamCheck: (text?: string) => void;
}

export const LegalAdvisor: React.FC<LegalAdvisorProps> = ({
  selectedLanguage,
  onNavigateToDocument,
  onNavigateToScamCheck,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LegalConsultationResponse | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const recognitionRef = useRef<any>(null);

  const sampleSituations = [
    {
      title: 'Landlord withholding security deposit',
      text: 'My landlord in Bengaluru is refusing to return my ₹80,000 security deposit after I vacated peacefully 2 weeks ago.',
      tag: 'Tenancy',
    },
    {
      title: 'Cheque bounced of ₹1,50,000',
      text: 'A business client gave me a cheque of ₹1,50,000 which bounced due to "Funds Insufficient" 5 days ago.',
      tag: 'NI Act s.138',
    },
    {
      title: 'Digital arrest call from fake police',
      text: 'Received a video call on Skype from a person in police uniform claiming to be CBI Mumbai, threatening arrest unless I pay ₹95,000.',
      tag: 'Cyber Scam',
    },
    {
      title: 'Online shopping defective product',
      text: 'Bought a smart TV online for ₹38,000. It arrived with a broken display and the seller is refusing replacement or refund.',
      tag: 'Consumer Rights',
    },
    {
      title: 'Police refusing to lodge FIR',
      text: 'My phone was snatched in the street. Police station refuses to register my FIR saying the incident happened in another police station area.',
      tag: 'Zero FIR BNSS',
    },
    {
      title: 'Company unpaid 2 months salary',
      text: 'My employer suddenly terminated my job without notice and has not paid my past 2 months pending salary of ₹1,10,000.',
      tag: 'Salary Claim',
    },
  ];

  // Voice Input Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage);
      recognition.lang = langObj ? langObj.speechCode : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [selectedLanguage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please type your question.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage);
        recognitionRef.current.lang = langObj ? langObj.speechCode : 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
        setIsListening(false);
      }
    }
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (result) {
      const textToRead = `${result.summary}. Immediate steps: ${result.stepsNow.slice(0, 3).join('. ')}. Where to file: ${result.whereToFile.forum}.`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage);
      if (langObj) utterance.lang = langObj.speechCode;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleConsult = async (queryText?: string) => {
    const textToSubmit = queryText || query;
    if (!textToSubmit.trim()) return;

    setLoading(true);
    setError(null);
    setCompletedSteps({});
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const res = await fetch('/api/legal/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSubmit,
          language: selectedLanguage,
        }),
      });

      const data = await res.json();
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to process request.');
      }

      setResult(data.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to legal engine.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Friendly Hero Heading */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Legal help in your language. Free and verified.
        </h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Describe any legal dispute — rent, bounced cheque, cyber fraud, defective goods, or police issue. Get your rights, immediate steps, and ready notices.
        </p>
      </div>

      {/* Main Big Input Card */}
      <div className="bg-[#121929] border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your situation in simple words or click the mic to speak... (e.g. 'My landlord refuses to return my deposit', 'चेक बाउंस हो गया क्या करूँ?')"
          rows={3}
          className="w-full bg-slate-900/90 border border-slate-700/90 rounded-xl p-3.5 text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                : 'bg-slate-800 text-slate-200 hover:text-white border-slate-700 hover:border-slate-600'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-amber-400" />}
            <span>{isListening ? 'Listening...' : 'Speak in your language'}</span>
          </button>

          {/* Action Button */}
          <div className="flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResult(null);
                }}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
              >
                Clear
              </button>
            )}

            <button
              type="button"
              disabled={loading || !query.trim()}
              onClick={() => handleConsult()}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Checking Indian Law...</span>
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4 stroke-[2.5]" />
                  <span>Get My Rights & Advice</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 6 Common Situation Pills (shown when empty or no result) */}
      {!result && !loading && (
        <div className="space-y-3 pt-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Common questions in India:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {sampleSituations.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(item.text);
                  handleConsult(item.text);
                }}
                className="text-left bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-xl p-3.5 transition-all flex items-start justify-between gap-2 cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-amber-300 block mb-0.5">
                    {item.title}
                  </span>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {item.text}
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 flex-shrink-0 border border-slate-700">
                  {item.tag}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Card */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-4 text-xs text-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* ADVICE RESULT - CLEAN, CALM & BEAUTIFUL */}
      {result && (
        <div className="space-y-5 animate-fadeIn">
          {/* Emergency Alert if detected */}
          {result.isEmergency && (
            <EmergencyBanner
              emergencyType={result.emergencyType}
              helplines={result.emergencyHelplines}
            />
          )}

          {/* 1. Primary Answer Box */}
          <div className="bg-[#121929] border border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Verified Legal Answer
                </span>
                <span className="text-xs text-slate-400">Current Indian Law</span>
              </div>

              {/* Voice Readout */}
              <button
                onClick={toggleSpeech}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isSpeaking
                    ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                    : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
                <span>{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
              </button>
            </div>

            {/* Plain language summary */}
            <div className="space-y-1">
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-300">
                What this means for you:
              </h2>
              <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
                {result.summary}
              </p>
            </div>

            {/* Action Bar at bottom of answer */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2.5">
              {result.readyDocumentTemplateId && (
                <button
                  onClick={() => onNavigateToDocument(result.readyDocumentTemplateId, query)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Draft Legal Notice / Complaint For Me</span>
                </button>
              )}

              <a
                href="tel:15100"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call NALSA Free Lawyer (15100)</span>
              </a>

              <button
                onClick={() => onNavigateToScamCheck(query)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 border border-slate-700"
              >
                <span>Check for Cyber Scam</span>
              </button>
            </div>
          </div>

          {/* 2. Immediate Steps To Take (Simple Checklist) */}
          <div className="bg-[#121929] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>What to do right now (Step-by-step checklist)</span>
              </h3>
              <span className="text-[11px] text-slate-400">Tap to check off</span>
            </div>

            <div className="space-y-2">
              {result.stepsNow.map((step, idx) => {
                const done = !!completedSteps[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 cursor-pointer transition-all ${
                      done
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-400 line-through'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border text-xs font-bold ${
                        done
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-slate-600 bg-slate-800 text-slate-300'
                      }`}
                    >
                      {done ? '✓' : idx + 1}
                    </div>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. The Law On Your Side & Filing Deadlines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Applicable Sections */}
            <div className="bg-[#121929] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>The Law On Your Side</span>
              </h3>

              <div className="space-y-2.5">
                {result.applicableLaws.map((law, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">
                        {law.section} — {law.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block font-medium">
                      {law.act}
                    </span>
                    <p className="text-xs text-slate-300 pt-0.5 leading-relaxed">
                      {law.description}
                    </p>
                    {law.oldLawMapping && (
                      <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                        Pre-2024 equivalent: <strong className="text-amber-200">{law.oldLawMapping.act} {law.oldLawMapping.section}</strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Where to file & Deadlines */}
            <div className="space-y-4">
              {/* Where to File */}
              <div className="bg-[#121929] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-400" />
                  <span>Where To Go / File</span>
                </h3>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1">
                  <div className="text-xs font-bold text-white">{result.whereToFile.forum}</div>
                  <div className="text-xs text-slate-300">{result.whereToFile.procedure}</div>
                  {result.whereToFile.portalUrl && (
                    <a
                      href={result.whereToFile.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold pt-1"
                    >
                      <span>Open Government Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Time Limits */}
              <div className="bg-[#121929] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-1.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-400" />
                  <span>Deadline (Limitation Period)</span>
                </h3>
                <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-200 leading-relaxed">
                  {result.timeLimits}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
