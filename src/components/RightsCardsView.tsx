import React, { useState } from 'react';
import {
  ShieldAlert,
  Home,
  Laptop,
  ShoppingBag,
  HeartHandshake,
  Car,
  Copy,
  Check,
  Share2,
  Printer,
  Sparkles,
} from 'lucide-react';
import { RIGHTS_CARDS, RightsCardData } from '../data/legalCorpus';

export const RightsCardsView: React.FC = () => {
  const [selectedCardId, setSelectedCardId] = useState<string>(RIGHTS_CARDS[0].id);
  const [copied, setCopied] = useState(false);

  const activeCard =
    RIGHTS_CARDS.find((c) => c.id === selectedCardId) || RIGHTS_CARDS[0];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5" />;
      case 'Home':
        return <Home className="w-5 h-5" />;
      case 'Laptop':
        return <Laptop className="w-5 h-5" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-5 h-5" />;
      case 'Car':
        return <Car className="w-5 h-5" />;
      default:
        return <ShieldAlert className="w-5 h-5" />;
    }
  };

  const handleCopyCard = () => {
    const text = `📜 ${activeCard.title.toUpperCase()}\n${activeCard.subtitle}\n\nKey Rule: ${activeCard.keyRule}\n\nYOUR RIGHTS:\n${activeCard.rights
      .map((r, i) => `${i + 1}. ${r.title} (${r.statute})\n   ${r.detail}`)
      .join('\n\n')}\n\n💡 Pro Tip: ${activeCard.proTip}\n📞 Emergency Contact: ${activeCard.emergencyContact}\n\n— Via Legal India (Free Legal Rights Assistant)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>One-Screen Pocket Legal Guides for India</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Citizen Rights Cards
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Shareable, one-screen summaries of your absolute constitutional and statutory rights. Save them on your phone for immediate reference when dealing with authorities.
        </p>
      </div>

      {/* Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {RIGHTS_CARDS.map((card) => {
          const isSelected = card.id === selectedCardId;
          return (
            <button
              key={card.id}
              onClick={() => setSelectedCardId(card.id)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {getIcon(card.icon)}
                </div>
              </div>
              <span className="text-xs font-bold leading-tight">{card.title.split('When')[0].split('as a')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Main Pocket Card View */}
      <div className="bg-gradient-to-br from-[#101726] via-slate-900 to-[#0e1422] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header & Share Buttons */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {activeCard.badge}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {activeCard.category}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {activeCard.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {activeCard.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCard}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share Card'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Key Constitutional Rule Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs sm:text-sm text-amber-200/90 leading-relaxed font-medium">
          ⚖️ <strong className="text-amber-300">Core Legal Shield: </strong>
          {activeCard.keyRule}
        </div>

        {/* Detailed Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCard.rights.map((right, idx) => (
            <div
              key={idx}
              className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span>{right.title}</span>
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {right.detail}
              </p>
              <div className="text-[11px] font-mono text-amber-400/90 pt-1 border-t border-slate-800/80">
                Statute: {right.statute}
              </div>
            </div>
          ))}
        </div>

        {/* Footer: Pro Tip & Emergency Dial */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="text-slate-300 leading-relaxed max-w-xl">
            💡 <strong className="text-amber-300">Pro Tip: </strong>
            {activeCard.proTip}
          </div>

          <div className="bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl font-bold text-slate-200 whitespace-nowrap">
            📞 {activeCard.emergencyContact}
          </div>
        </div>
      </div>
    </div>
  );
};
