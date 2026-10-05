import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Copy,
  Download,
  Sparkles,
  Check,
  RefreshCw,
  ExternalLink,
  Info,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { DOCUMENT_TEMPLATES, DocumentTemplate } from '../data/documentTemplates';

interface DocumentDrafterProps {
  initialTemplateId?: string;
  initialUserStory?: string;
  selectedLanguage: string;
}

export const DocumentDrafter: React.FC<DocumentDrafterProps> = ({
  initialTemplateId,
  initialUserStory,
  selectedLanguage,
}) => {
  const [activeTemplateId, setActiveTemplateId] = useState<string>(
    initialTemplateId || DOCUMENT_TEMPLATES[0].id
  );
  const [docLanguage, setDocLanguage] = useState<'en' | 'hi'>('en');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [autofillStory, setAutofillStory] = useState(initialUserStory || '');
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync if initial props change
  useEffect(() => {
    if (initialTemplateId) {
      setActiveTemplateId(initialTemplateId);
    }
  }, [initialTemplateId]);

  useEffect(() => {
    if (initialUserStory) {
      setAutofillStory(initialUserStory);
      handleAiAutofill(initialUserStory, initialTemplateId || activeTemplateId);
    }
  }, [initialUserStory]);

  const currentTemplate =
    DOCUMENT_TEMPLATES.find((t) => t.id === activeTemplateId) ||
    DOCUMENT_TEMPLATES[0];

  const handleFieldChange = (fieldId: string, val: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: val,
    }));
  };

  const handleAiAutofill = async (storyText?: string, tId?: string) => {
    const story = storyText || autofillStory;
    const template = tId || activeTemplateId;
    if (!story.trim()) return;

    setIsAutofilling(true);
    try {
      const res = await fetch('/api/legal/autofill-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template,
          userStory: story,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setFormData((prev) => ({
          ...prev,
          ...data.data,
        }));
      }
    } catch (err) {
      console.error('Error autofilling document:', err);
    } finally {
      setIsAutofilling(false);
    }
  };

  const generatedDoc = currentTemplate.generateDoc(formData, docLanguage);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDoc.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedDoc.body], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${currentTemplate.id}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span>Statutory Document Engine • Ready to File in Indian Courts & Commissions</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Ready-to-Use Legal Document Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Draft legally enforceable notices, RTI applications, consumer petitions, and FIR letters compliant with Indian statutory guidelines. Available in English & Hindi.
        </p>
      </div>

      {/* Template Selector Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {DOCUMENT_TEMPLATES.map((tmpl) => {
          const isActive = tmpl.id === activeTemplateId;
          return (
            <button
              key={tmpl.id}
              onClick={() => {
                setActiveTemplateId(tmpl.id);
                setFormData({});
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{tmpl.title.split(':')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Main Split Interface: Form Editor (Left) & Court Document Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form & AI Autofill */}
        <div className="lg:col-span-5 space-y-4">
          {/* Template Info Card */}
          <div className="bg-[#101726] border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                {currentTemplate.applicableLaw}
              </span>
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setDocLanguage('en')}
                  className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                    docLanguage === 'en' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setDocLanguage('hi')}
                  className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                    docLanguage === 'hi' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>

            <h3 className="text-base font-bold text-white">
              {docLanguage === 'hi' ? currentTemplate.titleHi : currentTemplate.title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {currentTemplate.description}
            </p>
          </div>

          {/* AI Autofill Prompt Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Auto-fill from your situation</span>
              </span>
            </div>
            <textarea
              value={autofillStory}
              onChange={(e) => setAutofillStory(e.target.value)}
              placeholder="e.g. 'I am Ramesh. My client Sunil gave cheque 004521 for ₹1.5 lakh drawn on HDFC bank. It bounced on 28 Sept for insufficient funds...'"
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="button"
              disabled={isAutofilling || !autofillStory.trim()}
              onClick={() => handleAiAutofill()}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
            >
              {isAutofilling ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Extracting Details...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Populate Fields with AI</span>
                </>
              )}
            </button>
          </div>

          {/* Form Fields List */}
          <div className="bg-[#101726] border border-slate-800 rounded-2xl p-4 space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Document Particulars
            </h4>

            {currentTemplate.fields.map((field) => (
              <div key={field.id} className="space-y-1">
                <label className="text-xs font-semibold text-slate-200 block">
                  {docLanguage === 'hi' ? field.labelHi : field.label}
                  {field.required && <span className="text-rose-400 ml-1">*</span>}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    rows={2}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                )}
                <span className="text-[10px] text-slate-500 block leading-tight">
                  {field.helpText}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Court-Ready Document Preview */}
        <div className="lg:col-span-7 space-y-4">
          {/* Action Toolbar */}
          <div className="no-print flex flex-wrap items-center justify-between gap-2 bg-[#101726] border border-slate-800 rounded-xl p-3">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Formatted Preview</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save as File</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>

          {/* Document Sheet Layout (White paper legal styling for court authenticity) */}
          <div className="print-document bg-white text-slate-900 rounded-xl p-6 sm:p-8 shadow-2xl border border-slate-300 font-serif leading-relaxed text-xs sm:text-sm selection:bg-amber-200 whitespace-pre-wrap max-h-[700px] overflow-y-auto">
            {generatedDoc.body}
          </div>

          {/* Statutory Filing Instructions */}
          {generatedDoc.instructions && generatedDoc.instructions.length > 0 && (
            <div className="no-print bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>How to serve & file this document:</span>
              </h4>
              <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                {generatedDoc.instructions.map((inst, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {inst}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
