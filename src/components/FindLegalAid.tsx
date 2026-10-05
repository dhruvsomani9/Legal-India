import React, { useState } from 'react';
import {
  Scale,
  PhoneCall,
  ExternalLink,
  CheckCircle2,
  Building2,
  Users,
  ShieldCheck,
  Info,
  HelpCircle,
} from 'lucide-react';

export const FindLegalAid: React.FC = () => {
  const [selectedCriteria, setSelectedCriteria] = useState<Record<string, boolean>>({});

  const eligibilityQuestions = [
    { id: 'woman_child', label: 'Woman or Child', reason: 'Section 12(c) - 100% free legal aid regardless of income' },
    { id: 'sc_st', label: 'Member of Scheduled Caste (SC) or Scheduled Tribe (ST)', reason: 'Section 12(a) LSA Act' },
    { id: 'custody', label: 'Person in police custody, undertrial, or jail', reason: 'Section 12(g) LSA Act' },
    { id: 'workman', label: 'Industrial workman / factory labourer / gig worker', reason: 'Section 12(e) LSA Act' },
    { id: 'disability_disaster', label: 'Person with disability or victim of natural disaster / violence', reason: 'Section 12(b) & 12(d)' },
    { id: 'low_income', label: 'Annual income below State ceiling (under ₹3,00,000 / ₹1,50,000/yr)', reason: 'Section 12(h) LSA Act' },
  ];

  const isEligible = Object.values(selectedCriteria).some((val) => val === true);

  const toggleCriteria = (id: string) => {
    setSelectedCriteria((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const portalDirectory = [
    {
      title: 'National Legal Services Authority (NALSA)',
      subtitle: 'Free advocate representation across all District Courts, High Courts & Supreme Court',
      helpline: '15100',
      url: 'https://nalsa.gov.in',
      tag: 'Free Lawyer Right',
      highlight: 'statutory free legal aid under Article 39A of Constitution',
    },
    {
      title: 'e-Daakhil Consumer Disputes Portal',
      subtitle: 'Paperless online filing of consumer complaints across all District, State & National Commissions',
      helpline: '1915',
      url: 'https://edaakhil.nic.in',
      tag: 'Consumer Forum',
      highlight: 'File from home without hiring a lawyer; track hearings digitally',
    },
    {
      title: 'National Cyber Crime Reporting Portal (NCRP)',
      subtitle: 'Ministry of Home Affairs portal for cyber fraud, financial scams & online harassment',
      helpline: '1930',
      url: 'https://cybercrime.gov.in',
      tag: 'Cyber Cells',
      highlight: 'Golden hour account freezing protocol via Indian Cyber Crime Coordination Centre (I4C)',
    },
    {
      title: 'eCourts Services Portal',
      subtitle: 'Check case status, cause lists, daily court orders, and summons tracking across India',
      helpline: 'Online',
      url: 'https://ecourts.gov.in',
      tag: 'Court Records',
      highlight: 'Real-time case tracking via CNR number for District Courts & High Courts',
    },
    {
      title: 'Virtual Courts (e-Challan & Traffic)',
      subtitle: 'Contest and pay traffic e-challans online before Judicial Magistrates without court visit',
      helpline: 'Online',
      url: 'https://vcourts.gov.in',
      tag: 'Traffic Challans',
      highlight: 'Instant online disposal of traffic and petty offenses',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Statutory Free Legal Services • DLSA • NALSA 15100</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Find Free Legal Aid & Court Portals
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Under Article 39A of the Indian Constitution, the state is mandated to provide free advocate representation and legal aid so that justice is not denied to any citizen by reason of economic or other disabilities.
        </p>
      </div>

      {/* Interactive DLSA Eligibility Checker */}
      <div className="bg-[#101726] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Free Advocate Eligibility Checker (Section 12, LSA Act 1987)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Select any category that applies to you:
            </p>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isEligible
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isEligible ? '🎉 100% Entitled to Free State Lawyer' : 'Select your category'}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {eligibilityQuestions.map((q) => {
            const checked = !!selectedCriteria[q.id];
            return (
              <div
                key={q.id}
                onClick={() => toggleCriteria(q.id)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                  checked
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-white'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                    checked
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                      : 'border-slate-700 bg-slate-950'
                  }`}
                >
                  {checked ? '✓' : ''}
                </div>
                <div>
                  <div className="font-bold">{q.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{q.reason}</div>
                </div>
              </div>
            );
          })}
        </div>

        {isEligible && (
          <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-2xl p-4 text-xs text-emerald-200 space-y-2 animate-fadeIn">
            <strong className="text-emerald-300 block text-sm">
              ✅ You are legally entitled to a free court-appointed lawyer:
            </strong>
            <p className="leading-relaxed">
              You can approach your local <strong>District Legal Services Authority (DLSA)</strong> situated inside every District Court complex in India, or call the 24/7 national helpline <strong className="text-white">15100</strong>. The state will bear all litigation fees, court fees, and advocate honorarium.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="tel:15100"
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 shadow"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call NALSA: 15100</span>
              </a>
              <a
                href="https://nalsa.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-300 hover:text-white font-semibold underline underline-offset-2 flex items-center gap-1"
              >
                <span>Visit NALSA Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Government Legal & Dispute Portals Directory */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>Official Government Legal & Grievance Portals</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portalDirectory.map((portal, idx) => (
            <div
              key={idx}
              className="bg-[#101726] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    {portal.tag}
                  </span>
                  <span className="text-xs font-bold text-slate-300 font-mono">
                    Helpline: {portal.helpline}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-1">
                  {portal.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {portal.subtitle}
                </p>
                <div className="text-[11px] text-amber-300/90 pt-1">
                  💡 {portal.highlight}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                {portal.helpline !== 'Online' ? (
                  <a
                    href={`tel:${portal.helpline}`}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Call {portal.helpline}</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-500">Self-serve digital portal</span>
                )}

                <a
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-800 hover:border-amber-500/40 transition-colors"
                >
                  <span>Open Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
