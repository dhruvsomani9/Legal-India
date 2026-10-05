import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Scale,
  User,
  Plus,
  RotateCcw,
  Sparkles,
  PhoneCall,
  FileText,
  Copy,
  Check,
  ShieldAlert,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Printer,
  X,
  Globe,
  ExternalLink,
  MessageSquare,
  Clock,
  Building,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, EMERGENCY_HELPLINES } from '../data/legalCorpus';
import { DOCUMENT_TEMPLATES, DocumentTemplate } from '../data/documentTemplates';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  templateHint?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  lastUpdatedAt: number;
  language: string;
  messages: ChatMessage[];
}

const STORAGE_SESSIONS_KEY = 'legalindia_sessions_v2';
const STORAGE_ACTIVE_ID_KEY = 'legalindia_active_session_id_v2';

export const LegalBot: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);
  const [documentModalOpen, setDocumentModalOpen] = useState<boolean>(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string>('cheque-bounce-notice');
  const [docFormData, setDocFormData] = useState<Record<string, string>>({});
  const [docLanguage, setDocLanguage] = useState<'en' | 'hi'>('en');

  // Default initial message
  const createWelcomeMessage = (lang: string): ChatMessage => ({
    id: 'welcome',
    role: 'model',
    content:
      lang === 'hi'
        ? 'नमस्ते। मैं लीगल इंडिया एआई (Legal India AI) हूँ — भारत का निःशुल्क, विश्वसनीय कानूनी सलाहकार।\n\nआप किसी भी भाषा या बोली में अपनी समस्या बता सकते हैं। मैं पूरी बातचीत को याद रखता हूँ, आपको भारतीय कानून (भारतीय न्याय संहिता 2023, उपभोक्ता संरक्षण अधिनियम, एनआई एक्ट, किरायेदारी अधिकार) के तहत आपके अधिकार बताता हूँ और आवश्यक कानूनी नोटिस तैयार कर सकता हूँ।\n\nआज मैं आपकी किस कानूनी समस्या में सहायता कर सकता हूँ?'
        : 'Namaste. I am Legal India AI — your trusted, accessible legal counsel for India.\n\nDescribe your legal situation in your own words or click the microphone to speak in any Indian language. I maintain continuous memory of your case facts, explain your statutory rights under current law (Bharatiya Nyaya Sanhita 2023, Consumer Protection Act, NI Act, Model Tenancy Act), and can draft ready-to-use notices for you.\n\nWhat legal issue can I assist you with today?',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  // State: All Sessions
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SESSIONS_KEY);
      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading stored sessions:', e);
    }
    const defaultId = 'session_' + Date.now();
    return [
      {
        id: defaultId,
        title: 'New Legal Consultation',
        createdAt: Date.now(),
        lastUpdatedAt: Date.now(),
        language: 'en',
        messages: [createWelcomeMessage('en')],
      },
    ];
  });

  // State: Active Session ID
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const storedId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
      if (storedId) return storedId;
    } catch (e) {
      // ignore
    }
    return sessions[0]?.id || 'session_' + Date.now();
  });

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [];

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [docCopied, setDocCopied] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Curated quick scenarios
  const curatedPrompts = [
    {
      title: 'Tenant Security Deposit',
      desc: 'Landlord refusing to refund deposit after vacating flat',
      tag: 'Tenancy Rights',
      prompt: 'My landlord in Bengaluru is refusing to return my ₹75,000 security deposit even after I vacated peacefully 2 weeks ago and cleared all bills. What should I do?',
    },
    {
      title: 'Cheque Bounce Dishonour',
      desc: 'Client issued cheque of ₹1.5L returned for insufficient funds',
      tag: 'Section 138 NI Act',
      prompt: 'A business client gave me a cheque of ₹1,50,000 which bounced due to "Funds Insufficient" 5 days ago. What notice should I send within 30 days?',
    },
    {
      title: 'Digital Arrest Threat',
      desc: 'Fake police / CBI Skype video call demanding money',
      tag: 'Cyber Extortion',
      prompt: 'I received a video call from someone in a police uniform claiming to be CBI Mumbai, saying my Aadhaar is linked to a parcel with contraband and demanding money.',
    },
    {
      title: 'Defective Product Refund',
      desc: 'Online e-commerce platform delivered broken goods and refused return',
      tag: 'Consumer Protection',
      prompt: 'Bought a 55-inch LED TV online for ₹42,000. It arrived with a broken display and the seller is refusing replacement or refund citing policy.',
    },
  ];

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
      localStorage.setItem(STORAGE_ACTIVE_ID_KEY, activeSessionId);
    } catch (e) {
      console.error('Failed to save sessions to localStorage:', e);
    }
  }, [sessions, activeSessionId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage);
      recognition.lang = langObj ? langObj.speechCode : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [selectedLanguage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
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

  const toggleSpeech = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage);
      if (langObj) utterance.lang = langObj.speechCode;

      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);

      window.speechSynthesis.speak(utterance);
      setSpeakingMsgId(msgId);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Start a new session
  const handleNewSession = () => {
    const newId = 'session_' + Date.now();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Consultation',
      createdAt: Date.now(),
      lastUpdatedAt: Date.now(),
      language: selectedLanguage,
      messages: [createWelcomeMessage(selectedLanguage)],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
  };

  // Delete a session
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      handleNewSession();
      return;
    }
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);
    if (activeSessionId === id) {
      setActiveSessionId(remaining[0].id);
    }
  };

  // Handle Send Message
  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update active session title if it's the first user message
    const isFirstUserMessage = messages.filter((m) => m.role === 'user').length === 0;
    const computedTitle = isFirstUserMessage
      ? text.trim().slice(0, 32) + (text.length > 32 ? '...' : '')
      : activeSession.title;

    const updatedMessages = [...messages, userMessage];

    // Update session state
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: computedTitle,
              lastUpdatedAt: Date.now(),
              messages: updatedMessages,
            }
          : s
      )
    );

    setInput('');
    setLoading(true);

    try {
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/legal/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          language: selectedLanguage,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || 'Under Indian law, your rights are protected.';

      // Determine if a legal notice template matches
      let matchedTemplate: string | undefined = undefined;
      const lower = (text + ' ' + replyText).toLowerCase();
      if (lower.includes('cheque') || lower.includes('check') || lower.includes('138')) {
        matchedTemplate = 'cheque-bounce-notice';
      } else if (lower.includes('deposit') || lower.includes('rent') || lower.includes('landlord')) {
        matchedTemplate = 'security-deposit-notice';
      } else if (lower.includes('consumer') || lower.includes('defective') || lower.includes('refund')) {
        matchedTemplate = 'consumer-complaint';
      } else if (lower.includes('fir') || lower.includes('police') || lower.includes('snatch')) {
        matchedTemplate = 'police-complaint-letter';
      } else if (lower.includes('rti') || lower.includes('information')) {
        matchedTemplate = 'rti-application';
      }

      const botMessage: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'model',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        templateHint: matchedTemplate,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                lastUpdatedAt: Date.now(),
                messages: [...updatedMessages, botMessage],
              }
            : s
        )
      );
    } catch (err) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'model',
        content:
          'Under Indian law, your rights are protected. If this involves a bounced cheque, send a notice within 30 days under Section 138 NI Act. If a tenancy deposit is withheld, landlords cannot deduct for normal wear and tear.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                lastUpdatedAt: Date.now(),
                messages: [...updatedMessages, fallbackMsg],
              }
            : s
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // Export full transcript
  const handleExportSession = () => {
    if (messages.length === 0) return;
    const transcript = messages
      .map(
        (m) =>
          `[${m.timestamp}] ${m.role === 'user' ? 'YOU' : 'LEGAL INDIA AI'}:\n${m.content}\n`
      )
      .join('\n----------------------------------------\n\n');

    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LegalIndia-Consultation-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Open Document Drafter Modal
  const openDocumentDrafter = (templateId?: string) => {
    if (templateId) setActiveTemplateId(templateId);
    setDocumentModalOpen(true);
  };

  const selectedTemplate =
    DOCUMENT_TEMPLATES.find((t) => t.id === activeTemplateId) || DOCUMENT_TEMPLATES[0];

  const generatedDoc = selectedTemplate.generateDoc(docFormData, docLanguage);

  const handleCopyDoc = () => {
    navigator.clipboard.writeText(generatedDoc.body);
    setDocCopied(true);
    setTimeout(() => setDocCopied(false), 2000);
  };

  return (
    <div className="flex h-screen w-full bg-[#080c14] text-slate-100 font-sans overflow-hidden">
      {/* 1. Left Sidebar: Sessions & Case History */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0c1220] border-r border-white/[0.08] flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Scale className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-white tracking-wide">
                Legal India
              </div>
              <div className="text-[10px] text-amber-400 font-medium">
                AI Counsel · BNS 2023
              </div>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Consultation CTA */}
        <div className="p-3">
          <button
            onClick={handleNewSession}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-amber-500/5"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>New Consultation</span>
          </button>
        </div>

        {/* Saved Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-none py-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1">
            Consultation History
          </div>

          {sessions.map((sess) => {
            const isActive = sess.id === activeSessionId;
            return (
              <div
                key={sess.id}
                onClick={() => setActiveSessionId(sess.id)}
                className={`group w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer border ${
                  isActive
                    ? 'bg-white/[0.08] text-white border-white/[0.12] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className="truncate">{sess.title}</span>
                </div>

                <button
                  onClick={(e) => handleDeleteSession(sess.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 rounded transition-opacity"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer: Free Legal Aid & Helplines */}
        <div className="p-3 border-t border-white/[0.08] space-y-2 bg-[#090d16]/70">
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="w-full py-2 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Emergency 112 / 1930</span>
            </div>
            <span className="text-[10px] bg-rose-500/20 px-1.5 py-0.5 rounded text-rose-200">24/7</span>
          </button>

          <a
            href="tel:15100"
            className="w-full py-1.5 px-2.5 rounded-lg text-slate-400 hover:text-slate-200 text-[11px] flex items-center justify-between transition-colors"
          >
            <span>NALSA Free Lawyer Helpline</span>
            <span className="font-mono text-amber-300 font-bold">15100</span>
          </a>
        </div>
      </aside>

      {/* 2. Main Chat Panel */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-[#080c14] to-[#0c1220] relative">
        {/* Top Minimal Navigation Bar */}
        <header className="h-14 border-b border-white/[0.08] px-4 flex items-center justify-between bg-[#080c14]/80 backdrop-blur-md z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Toggle sidebar"
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-white">
                Legal India AI
              </span>
              <span className="text-slate-500 text-xs hidden sm:inline">·</span>
              <span className="text-xs text-amber-300/90 hidden sm:inline font-mono">
                {activeSession?.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language Selector */}
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 rounded-lg pl-7 pr-7 py-1 text-xs text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer appearance-none"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Document Drafter Shortcut */}
            <button
              onClick={() => openDocumentDrafter()}
              className="py-1 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Court Notices</span>
            </button>

            {/* Export Session */}
            <button
              onClick={handleExportSession}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Export consultation transcript"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-3xl w-full mx-auto scrollbar-thin">
          {messages.map((msg) => {
            const isBot = msg.role === 'model';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3.5 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm font-bold">
                    <Scale className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed transition-all ${
                    isBot
                      ? 'bg-[#0f172a]/90 border border-white/[0.08] text-slate-200 shadow-md backdrop-blur-sm'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium shadow-md shadow-amber-500/10'
                  }`}
                >
                  {/* Message content */}
                  <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                    {msg.content}
                  </div>

                  {/* Bot Interactive Actions */}
                  {isBot && (
                    <div className="mt-3.5 pt-2.5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                      <span>{msg.timestamp}</span>

                      <div className="flex items-center gap-2">
                        {/* Audio readout */}
                        <button
                          onClick={() => toggleSpeech(msg.id, msg.content)}
                          className="hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {speakingMsgId === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                          <span>{speakingMsgId === msg.id ? 'Stop' : 'Listen'}</span>
                        </button>

                        {/* Copy text */}
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>

                        {/* Direct Document Drafter Action Button */}
                        <button
                          onClick={() => openDocumentDrafter(msg.templateHint)}
                          className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors ml-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Draft Notice</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {!isBot && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm font-bold">
                <Scale className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <div className="bg-[#0f172a]/90 border border-white/[0.08] rounded-2xl p-3.5 text-xs text-slate-400 flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-slate-300 text-xs font-medium">
                  Reviewing current Indian law & case facts...
                </span>
              </div>
            </div>
          )}

          {/* Starter Cards (Visible if only initial welcome message is present) */}
          {messages.length <= 1 && (
            <div className="space-y-3 pt-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Common Legal Matters in India:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {curatedPrompts.map((cp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(cp.prompt)}
                    className="p-3.5 rounded-xl bg-[#0f172a]/70 hover:bg-[#152037] border border-white/[0.08] hover:border-amber-500/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                          {cp.title}
                        </span>
                        <span className="text-[10px] font-mono text-amber-400/90 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                          {cp.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {cp.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Floating Input Bar */}
        <div className="p-4 max-w-3xl w-full mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="bg-[#0f172a] border border-white/[0.12] rounded-2xl p-2 sm:p-2.5 flex items-center gap-2 shadow-2xl focus-within:border-amber-500/60 transition-colors"
          >
            {/* Voice Dictation */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'text-slate-400 hover:text-amber-400 hover:bg-white/[0.06]'
              }`}
              title="Speak in your language"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Input field */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your legal issue or ask a follow-up in any Indian language..."
              className="flex-1 bg-transparent border-0 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:ring-0"
            />

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow cursor-pointer flex-shrink-0"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          <div className="text-[10px] text-slate-500 text-center mt-2 flex items-center justify-center gap-3">
            <span>Free Indian Legal Intelligence</span>
            <span>·</span>
            <span>All conversations saved locally in browser</span>
          </div>
        </div>
      </main>

      {/* 3. Document Drafter Modal (Court-Ready Document Generator) */}
      {documentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0c1220] border border-white/[0.12] rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#080c14]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Court-Ready Document Drafter</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyDoc}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 border border-slate-700 cursor-pointer"
                >
                  {docCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{docCopied ? 'Copied' : 'Copy Notice'}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                <button
                  onClick={() => setDocumentModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Template Selector Pills */}
            <div className="p-3 border-b border-white/[0.08] flex flex-wrap gap-1.5 bg-[#090e1a]">
              {DOCUMENT_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => {
                    setActiveTemplateId(tmpl.id);
                    setDocFormData({});
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    tmpl.id === activeTemplateId
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {tmpl.title.split(':')[0]}
                </button>
              ))}
            </div>

            {/* Document Split View */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
              {/* Form Input Fields (Left) */}
              <div className="md:col-span-5 p-4 border-r border-white/[0.08] overflow-y-auto space-y-3 bg-[#080c14]/40 scrollbar-thin">
                <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
                  <span className="text-xs font-bold text-amber-300">
                    {selectedTemplate.applicableLaw}
                  </span>
                  <div className="flex gap-1 text-[11px]">
                    <button
                      onClick={() => setDocLanguage('en')}
                      className={`px-2 py-0.5 rounded ${docLanguage === 'en' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => setDocLanguage('hi')}
                      className={`px-2 py-0.5 rounded ${docLanguage === 'hi' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                    >
                      हिन्दी
                    </button>
                  </div>
                </div>

                {selectedTemplate.fields.map((field) => (
                  <div key={field.id} className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      {docLanguage === 'hi' ? field.labelHi : field.label}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        rows={2}
                        value={docFormData[field.id] || ''}
                        onChange={(e) =>
                          setDocFormData((prev) => ({ ...prev, [field.id]: e.target.value }))
                        }
                        placeholder={field.placeholder}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={docFormData[field.id] || ''}
                        onChange={(e) =>
                          setDocFormData((prev) => ({ ...prev, [field.id]: e.target.value }))
                        }
                        placeholder={field.placeholder}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Court Document Sheet Preview (Right) */}
              <div className="md:col-span-7 p-6 overflow-y-auto bg-white text-slate-950 font-serif leading-relaxed text-xs sm:text-sm whitespace-pre-wrap selection:bg-amber-200">
                {generatedDoc.body}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Emergency Helplines Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0c1220] border border-rose-500/40 rounded-2xl max-w-md w-full p-5 shadow-2xl relative">
            <button
              onClick={() => setShowEmergencyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Emergency National Helplines</h3>
                <p className="text-[11px] text-rose-300">24/7 Toll-Free Citizen Dispatch in India</p>
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
                    <PhoneCall className="w-3.5 h-3.5" />
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
    </div>
  );
};
