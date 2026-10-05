import React from 'react';
import { AlertCircle, PhoneCall, ShieldAlert, ArrowRight } from 'lucide-react';

interface EmergencyBannerProps {
  emergencyType?: string;
  helplines?: string[];
  onOpenHelplineModal?: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  emergencyType,
  helplines,
}) => {
  return (
    <div className="bg-gradient-to-r from-rose-950 via-rose-900/90 to-rose-950 border border-rose-500/50 rounded-2xl p-4 sm:p-5 shadow-xl shadow-rose-950/40 my-4 text-white animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/30 border border-rose-400 flex items-center justify-center flex-shrink-0 text-rose-200">
            <ShieldAlert className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-rose-500 text-white">
                CRITICAL / EMERGENCY DETECTED
              </span>
              {emergencyType && (
                <span className="text-xs text-rose-200 font-semibold">
                  ({emergencyType.replace(/_/g, ' ')})
                </span>
              )}
            </div>
            <h4 className="text-base font-bold text-white mt-1">
              Safety First: Immediate Emergency Protocol
            </h4>
            <p className="text-xs text-rose-100/90 mt-0.5 max-w-2xl leading-relaxed">
              If you or someone else is in immediate physical danger, facing an unauthorized financial debit in the last 2-3 hours (Golden Hour), or subject to unlawful arrest, take safety and helpline actions before legal documentation.
            </p>
          </div>
        </div>

        {/* Action Call Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <a
            href="tel:112"
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-white text-rose-950 hover:bg-rose-50 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
            <span>Police: 112</span>
          </a>

          <a
            href="tel:1930"
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5 text-slate-900" />
            <span>Cyber Fraud: 1930</span>
          </a>

          <a
            href="tel:181"
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Women: 181</span>
          </a>
        </div>
      </div>

      {helplines && helplines.length > 0 && (
        <div className="mt-3 pt-3 border-t border-rose-500/30 flex flex-wrap items-center gap-2 text-xs text-rose-200">
          <span className="font-semibold">Recommended Contacts:</span>
          {helplines.map((line, idx) => (
            <span key={idx} className="bg-rose-900/60 border border-rose-500/40 px-2 py-0.5 rounded text-[11px]">
              {line}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
