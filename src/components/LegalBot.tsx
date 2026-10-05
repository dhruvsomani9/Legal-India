import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Square,
  RotateCcw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  FileText,
  Copy,
  Check,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Printer,
  X,
  Globe,
  Download,
  PhoneCall,
  ShieldAlert,
  ArrowUp,
  User,
  MessageSquare,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, EMERGENCY_HELPLINES } from '../data/legalCorpus';
import { DOCUMENT_TEMPLATES } from '../data/documentTemplates';
import { LegalIndiaLogo } from './LegalIndiaLogo';
import { MarkdownMessage } from './MarkdownMessage';

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

interface PendingPrompt {
  sessionId: string;
  text: string;
  messagesForApi: { role: string; content: string }[];
  botMessageId: string;
}

const STORAGE_SESSIONS_KEY = 'legalindia_chat_sessions_v4';
const STORAGE_ACTIVE_ID_KEY = 'legalindia_active_id_v4';

export const LegalBot: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);
  const [documentModalOpen, setDocumentModalOpen] = useState<boolean>(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string>('cheque-bounce-notice');
  const [docFormData, setDocFormData] = useState<Record<string, string>>({});
  const [docLanguage, setDocLanguage] = useState<'en' | 'hi'>('en');

  // Welcome message generator
  const createWelcomeMessage = (lang: string): ChatMessage => ({
    id: 'welcome_' + Date.now(),
    role: 'model',
    content:
      lang === 'hi'
        ? `नमस्ते। मैं **लीगल इंडिया एआई (Legal India AI)** हूँ — भारत का निःशुल्क, विश्वसनीय कानूनी सलाहकार।

आप अपनी किसी भी कानूनी समस्या को अपनी भाषा या बोली में साझा कर सकते हैं। मैं:
* **भारतीय कानूनों (BNS 2023, BNSS 2023, उपभोक्ता संरक्षण 2019, एनआई एक्ट)** के तहत आपके अधिकारों का विश्लेषण करता हूँ;
* आपको न्यायालय और पुलिस से जुड़े तत्काल कदम बताता हूँ;
* आवश्यक **लीगल डिमांड नोटिस या शिकायत पत्र** तैयार कर सकता हूँ।

आज मैं आपकी किस कानूनी समस्या में सहायता कर सकता हूँ?`
        : `Namaste! I am **Legal India AI**, your senior Indian legal counsel and access-to-justice companion.

You can describe your legal situation in your own words, upload dispute details, or use voice dictation in any Indian language. I will:
* **Analyze your legal standing** under current Indian statutes (Bharatiya Nyaya Sanhita 2023, Consumer Protection Act 2019, Section 138 NI Act, Model Tenancy Act);
* **Identify strict limitation deadlines** and applicable judicial forums;
* **Draft ready-to-serve court notices** and police complaint petitions.

What legal issue or question can I assist you with today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  // State: All Sessions (Persisted via localStorage across page reloads)
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
      console.warn('Error reading stored sessions from localStorage:', e);
    }
    const defaultId = 'session_' + Date.now();
    return [
      {
        id: defaultId,
        title: 'New Consultation',
        createdAt: Date.now(),
        lastUpdatedAt: Date.now(),
        language: 'en',
        messages: [createWelcomeMessage('en')],
      },
    ];
  });

  // State: Active Session ID (Persisted via localStorage across page reloads)
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const storedId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
      if (storedId) return storedId;
    } catch (e) {
      // ignore
    }
    return sessions[0]?.id || 'session_' + Date.now();
  });

  // Ensure activeSessionId is always aligned with a valid session in state
  useEffect(() => {
    if (sessions.length > 0 && !sessions.some((s) => s.id === activeSessionId)) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  // Persist conversation and sessions to localStorage on every update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
      localStorage.setItem(STORAGE_ACTIVE_ID_KEY, activeSessionId);
    } catch (e) {
      console.error('Failed to persist sessions to localStorage:', e);
    }
  }, [sessions, activeSessionId]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [];

  // Chat inputs & states
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [docCopied, setDocCopied] = useState(false);

  // Dedicated pending prompt state to trigger the Gemini API communication useEffect hook
  const [pendingPrompt, setPendingPrompt] = useState<PendingPrompt | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);

  // Curated quick scenarios
  const curatedPrompts = [
    {
      title: 'Tenant Security Deposit',
      desc: 'Landlord refusing to refund deposit after vacating flat',
      tag: 'Tenancy Act',
      prompt: 'My landlord in Bengaluru is refusing to return my ₹75,000 security deposit even after I vacated peacefully 2 weeks ago and cleared all utility bills. What legal notice should I send?',
    },
    {
      title: 'Cheque Bounce Section 138',
      desc: 'Client issued cheque of ₹1.5L returned for insufficient funds',
      tag: 'NI Act 1881',
      prompt: 'A business client gave me a cheque of ₹1,50,000 which bounced due to "Funds Insufficient" 5 days ago. What are the strict limitation deadlines under Section 138?',
    },
    {
      title: 'Fake Digital Arrest Threat',
      desc: 'Fake police / CBI Skype video call demanding money',
      tag: 'Extortion Scam',
      prompt: 'I received a video call from someone in a police uniform claiming to be CBI Mumbai, saying my Aadhaar is linked to a parcel with contraband and demanding money.',
    },
    {
      title: 'Defective Product Refund',
      desc: 'Online platform delivered broken goods and refused return',
      tag: 'Consumer Protection',
      prompt: 'Bought a 55-inch LED TV online for ₹42,000. It arrived with a broken display and the seller is refusing replacement or refund citing return policy.',
    },
  ];

  // =========================================================================
  // Robust Gemini API Communication useEffect Hook
  // Handles streaming or updating the AI response into the conversation history
  // =========================================================================
  useEffect(() => {
    if (!pendingPrompt) return;

    const { sessionId, messagesForApi, botMessageId, text } = pendingPrompt;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsStreaming(true);

    let accumulatedContent = '';

    const streamGeminiResponse = async () => {
      try {
        const response = await fetch('/api/legal/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messagesForApi,
            language: selectedLanguage,
          }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Server returned status ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split('\n');

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') break;

            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                accumulatedContent += data.text;

                // Stream/update AI response directly in UI state
                setSessions((prev) => {
                  const idx = prev.findIndex((s) => s.id === sessionId);
                  if (idx === -1) return prev;
                  const copy = [...prev];
                  const sessionMsgs = [...copy[idx].messages];
                  const msgIdx = sessionMsgs.findIndex((m) => m.id === botMessageId);

                  if (msgIdx !== -1) {
                    sessionMsgs[msgIdx] = {
                      ...sessionMsgs[msgIdx],
                      content: accumulatedContent,
                    };
                  }
                  copy[idx] = {
                    ...copy[idx],
                    lastUpdatedAt: Date.now(),
                    messages: sessionMsgs,
                  };
                  return copy;
                });
              }
            } catch (e) {
              // Non-JSON SSE line ignored
            }
          }
        }

        // Determine if a legal notice template matches
        let matchedTemplate: string | undefined = undefined;
        const lower = (text + ' ' + accumulatedContent).toLowerCase();
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

        if (matchedTemplate) {
          setSessions((prev) => {
            const idx = prev.findIndex((s) => s.id === sessionId);
            if (idx === -1) return prev;
            const copy = [...prev];
            const sessionMsgs = [...copy[idx].messages];
            const msgIdx = sessionMsgs.findIndex((m) => m.id === botMessageId);
            if (msgIdx !== -1) {
              sessionMsgs[msgIdx] = {
                ...sessionMsgs[msgIdx],
                templateHint: matchedTemplate,
              };
            }
            copy[idx] = { ...copy[idx], messages: sessionMsgs };
            return copy;
          });
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Stream generation aborted by user.');
        } else {
          console.warn('Streaming error, falling back to batch API:', err);
          try {
            const fbRes = await fetch('/api/legal/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messages: messagesForApi,
                language: selectedLanguage,
              }),
            });
            const fbData = await fbRes.json();
            const fallbackReply = fbData.reply || 'Under Indian law, your rights are protected.';

            setSessions((prev) => {
              const idx = prev.findIndex((s) => s.id === sessionId);
              if (idx === -1) return prev;
              const copy = [...prev];
              const sessionMsgs = [...copy[idx].messages];
              const msgIdx = sessionMsgs.findIndex((m) => m.id === botMessageId);
              if (msgIdx !== -1) {
                sessionMsgs[msgIdx] = {
                  ...sessionMsgs[msgIdx],
                  content: fallbackReply,
                };
              }
              copy[idx] = { ...copy[idx], messages: sessionMsgs };
              return copy;
            });
          } catch (e2) {
            console.error('Final fallback error:', e2);
          }
        }
      } finally {
        setIsStreaming(false);
        setPendingPrompt(null);
        abortControllerRef.current = null;
      }
    };

    streamGeminiResponse();

    return () => {
      controller.abort();
    };
  }, [pendingPrompt, selectedLanguage]);

  // Auto-scroll on new tokens or messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  // Web Speech Recognition setup
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
      const cleanText = text.replace(/[*#`_>]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
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
    if (isStreaming) handleStopGenerating();

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
    if (isStreaming && id === activeSessionId) handleStopGenerating();

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

  // Stop generating stream
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setPendingPrompt(null);
  };

  // Send message: appends user message immediately and triggers Gemini API useEffect
  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isStreaming) return;

    const currentId = activeSession ? activeSession.id : sessions[0]?.id;
    if (!currentId) return;

    const userMessage: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const isFirstUserMessage = messages.filter((m) => m.role === 'user').length === 0;
    const computedTitle = isFirstUserMessage
      ? text.slice(0, 32) + (text.length > 32 ? '...' : '')
      : activeSession.title;

    const botMessageId = 'bot_' + Date.now();
    const initialBotMessage: ChatMessage = {
      id: botMessageId,
      role: 'model',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedWithUser = [...messages, userMessage];

    // 1. Immediately append user message & placeholder to chat history
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === currentId);
      if (idx === -1) {
        return [
          {
            id: currentId,
            title: computedTitle,
            createdAt: Date.now(),
            lastUpdatedAt: Date.now(),
            language: selectedLanguage,
            messages: [...updatedWithUser, initialBotMessage],
          },
          ...prev,
        ];
      }
      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        title: computedTitle,
        lastUpdatedAt: Date.now(),
        messages: [...updatedWithUser, initialBotMessage],
      };
      return copy;
    });

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // 2. Queue pending prompt to trigger the Gemini API communication useEffect hook
    const messagesForApi = updatedWithUser.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setPendingPrompt({
      sessionId: currentId,
      text,
      messagesForApi,
      botMessageId,
    });
  };

  // Regenerate last response
  const handleRegenerate = () => {
    if (isStreaming) return;
    const userMessages = messages.filter((m) => m.role === 'user');
    if (userMessages.length === 0) return;
    const lastUserMessage = userMessages[userMessages.length - 1];

    const currentId = activeSession ? activeSession.id : sessions[0]?.id;
    if (!currentId) return;

    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === currentId);
      if (idx === -1) return prev;
      const copy = [...prev];
      const withoutLastBot = copy[idx].messages.filter(
        (m, i) => !(i === copy[idx].messages.length - 1 && m.role === 'model')
      );
      copy[idx] = { ...copy[idx], messages: withoutLastBot };
      return copy;
    });

    handleSend(lastUserMessage.content);
  };

  // Handle Enter key submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
      {/* 1. Left Sidebar: Sessions & Conversation History */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0c1220] border-r border-white/[0.08] flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <LegalIndiaLogo size="md" showSubtitle={true} />

          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Consultation CTA */}
        <div className="p-3">
          <button
            onClick={handleNewSession}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
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
                onClick={() => {
                  if (isStreaming) handleStopGenerating();
                  setActiveSessionId(sess.id);
                }}
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

            <div className="flex items-center gap-2.5">
              <LegalIndiaLogo size="sm" />
              <span className="text-slate-600 text-xs hidden sm:inline">·</span>
              <span className="text-xs text-amber-300/90 hidden sm:inline font-mono truncate max-w-[220px]">
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
          {messages.map((msg, index) => {
            const isBot = msg.role === 'model';
            const isLastMessage = index === messages.length - 1;

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3.5 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-[#0e1626] border border-white/15 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm overflow-hidden p-1">
                    <LegalIndiaLogo variant="icon" size="sm" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed transition-all ${
                    isBot
                      ? 'bg-[#0f172a]/95 border border-white/[0.08] text-slate-200 shadow-md backdrop-blur-sm'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium shadow-md shadow-amber-500/10'
                  }`}
                >
                  {/* Rich Formatted Markdown Content */}
                  {isBot ? (
                    msg.content ? (
                      <MarkdownMessage
                        content={msg.content}
                        isStreaming={isStreaming && isLastMessage}
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400 py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                        <span className="text-xs text-slate-400 font-medium ml-1">
                          Analyzing legal facts under current Indian statutes...
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed font-medium">
                      {msg.content}
                    </div>
                  )}

                  {/* Bot Interactive Actions */}
                  {isBot && msg.content && (
                    <div className="mt-3.5 pt-2.5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                      <span>{msg.timestamp}</span>

                      <div className="flex items-center gap-2.5">
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
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Regenerate button after stream completes */}
          {!isStreaming && messages.some((m) => m.role === 'user') && (
            <div className="flex justify-center pt-1 pb-2">
              <button
                onClick={handleRegenerate}
                className="px-3 py-1.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>Regenerate response</span>
              </button>
            </div>
          )}

          {/* Starter Cards with Hero Logo Banner (Visible when empty or only initial welcome message is present) */}
          {messages.length <= 1 && (
            <div className="space-y-4 pt-2">
              <div className="text-center py-4 space-y-2">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/[0.02] border border-white/[0.08] shadow-xl">
                  <LegalIndiaLogo size="xl" showSubtitle={true} />
                </div>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  24/7 AI Legal Counsel for Indian Law (Bharatiya Nyaya Sanhita 2023, Consumer Protection Act, NI Act, Model Tenancy Act).
                </p>
              </div>

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

        {/* Bottom Floating Multiline Input Bar (ChatGPT & Gemini Style) */}
        <div className="p-4 max-w-3xl w-full mx-auto">
          {/* Stop generation button when streaming */}
          {isStreaming && (
            <div className="flex justify-center mb-2.5">
              <button
                onClick={handleStopGenerating}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span>Stop generating</span>
              </button>
            </div>
          )}

          <div className="bg-[#0f172a] border border-white/[0.12] rounded-2xl p-2 sm:p-2.5 flex items-end gap-2 shadow-2xl focus-within:border-amber-500/60 transition-colors">
            {/* Voice Dictation */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-all cursor-pointer flex-shrink-0 ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'text-slate-400 hover:text-amber-400 hover:bg-white/[0.06]'
              }`}
              title="Speak in your language"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Auto-growing multiline Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about Indian law, paste your dispute facts, or request a legal notice..."
              className="flex-1 bg-transparent border-0 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:ring-0 resize-none max-h-44 py-1.5 scrollbar-thin leading-relaxed"
            />

            {/* Submit / Send button */}
            <button
              onClick={() => handleSend()}
              disabled={isStreaming || !input.trim()}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow cursor-pointer flex-shrink-0"
              title="Send message (Enter)"
            >
              <ArrowUp className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          <div className="text-[10px] text-slate-500 text-center mt-2 flex items-center justify-center gap-3">
            <span>Free Indian Legal AI</span>
            <span>·</span>
            <span>Press Enter to send, Shift+Enter for new line</span>
          </div>
        </div>
      </main>

      {/* 3. Document Drafter Modal (Court-Ready Document Generator) */}
      {documentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0c1220] border border-white/[0.12] rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#080c14]">
              <div className="flex items-center gap-3">
                <LegalIndiaLogo size="sm" />
                <span className="text-slate-600 text-xs hidden sm:inline">|</span>
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
                <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-4 select-none">
                  <LegalIndiaLogo size="sm" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-sans font-bold">
                    Statutory Legal Notice
                  </span>
                </div>
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
