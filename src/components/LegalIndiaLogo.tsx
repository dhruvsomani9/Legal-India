import React from 'react';

interface LegalIndiaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  showSubtitle?: boolean;
}

export const LegalIndiaLogo: React.FC<LegalIndiaLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  showSubtitle = false,
}) => {
  // Sizing mappings
  const config = {
    sm: {
      emblemSize: 26,
      textSize: 'text-sm sm:text-base',
      badgeSize: 'text-[9px] px-1 py-0.2',
      subSize: 'text-[9px]',
      gap: 'gap-2',
    },
    md: {
      emblemSize: 34,
      textSize: 'text-base sm:text-lg',
      badgeSize: 'text-[10px] px-1.5 py-0.5',
      subSize: 'text-[10px]',
      gap: 'gap-2.5',
    },
    lg: {
      emblemSize: 44,
      textSize: 'text-xl sm:text-2xl',
      badgeSize: 'text-xs px-2 py-0.5',
      subSize: 'text-xs',
      gap: 'gap-3',
    },
    xl: {
      emblemSize: 56,
      textSize: 'text-2xl sm:text-3xl',
      badgeSize: 'text-xs px-2 py-0.5',
      subSize: 'text-xs sm:text-sm',
      gap: 'gap-3.5',
    },
  }[size];

  // Pure SVG Emblem: Scales of Justice with Ashoka Chakra accents in Indian Tricolor
  const Emblem = ({ sizePx }: { sizePx: number }) => (
    <div
      className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#121c2e] via-[#0c1322] to-[#080d18] border border-amber-500/25 shadow-md shadow-black/40 flex-shrink-0"
      style={{ width: sizePx, height: sizePx }}
    >
      <svg
        viewBox="0 0 64 64"
        width={sizePx * 0.78}
        height={sizePx * 0.78}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
        aria-hidden="true"
      >
        {/* Subtle Background Glow Ring */}
        <circle cx="32" cy="32" r="28" stroke="url(#logo-tricolor-gradient)" strokeWidth="1.5" strokeOpacity="0.4" />

        {/* Central Justice Pillar (Base & Shaft) */}
        <path d="M22 54H42V51H22V54Z" fill="#F59E0B" />
        <path d="M26 51H38V48H26V51Z" fill="#D97706" />
        <path d="M30 18H34V48H30V18Z" fill="url(#gold-column-grad)" />

        {/* Ashoka Chakra Center Hub */}
        <circle cx="32" cy="20" r="4.5" fill="#1E3A8A" stroke="#F59E0B" strokeWidth="1.5" />
        <circle cx="32" cy="20" r="1.5" fill="#FCD34D" />

        {/* Scales Balance Beam */}
        <path d="M12 21.5C12 20.67 12.67 20 13.5 20H50.5C51.33 20 52 21.5 50.5 21.5H13.5C12.67 21.5 12 21.5 12 21.5Z" fill="#F59E0B" />
        <rect x="14" y="19" width="36" height="3" rx="1.5" fill="url(#gold-beam-grad)" />

        {/* Left Scale Suspension Strings & Pan (Tricolor Saffron) */}
        <path d="M16 22L10 36M16 22L22 36" stroke="#FF671F" strokeWidth="1.2" strokeLinecap="round" />
        <path
          d="M8 36C8 39.5 11.58 42 16 42C20.42 42 24 39.5 24 36H8Z"
          fill="#FF671F"
          fillOpacity="0.9"
          stroke="#FDBA74"
          strokeWidth="0.8"
        />

        {/* Right Scale Suspension Strings & Pan (Tricolor Green) */}
        <path d="M48 22L42 36M48 22L54 36" stroke="#16A34A" strokeWidth="1.2" strokeLinecap="round" />
        <path
          d="M40 36C40 39.5 43.58 42 48 42C52.42 42 56 39.5 56 36H40Z"
          fill="#16A34A"
          fillOpacity="0.9"
          stroke="#86EFAC"
          strokeWidth="0.8"
        />

        {/* Top Finial / Ashok Finial */}
        <path d="M30 14L32 10L34 14H30Z" fill="#FCD34D" />

        {/* Linear Gradients */}
        <defs>
          <linearGradient id="logo-tricolor-gradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF671F" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#16A34A" />
          </linearGradient>
          <linearGradient id="gold-column-grad" x1="30" y1="18" x2="34" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="gold-beam-grad" x1="14" y1="20" x2="50" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#FEF3C7" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );

  // Icon only variant
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <Emblem sizePx={config.emblemSize} />
      </div>
    );
  }

  // Full brand logo (Emblem + Rock-Solid HTML/CSS Wordmark)
  return (
    <div className={`inline-flex items-center ${config.gap} select-none ${className}`}>
      <Emblem sizePx={config.emblemSize} />

      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1.5">
          {/* "Legal" in Indian Saffron */}
          <span className={`font-black tracking-tight text-[#FF671F] font-sans ${config.textSize}`}>
            Legal
          </span>

          {/* "India" in Indian Green */}
          <span className={`font-black tracking-tight text-[#16A34A] font-sans ${config.textSize}`}>
            India
          </span>

          {/* "AI" Badge */}
          <span
            className={`font-black font-mono rounded bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider ${config.badgeSize}`}
          >
            AI
          </span>
        </div>

        {showSubtitle && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`font-bold tracking-widest uppercase text-slate-400 font-sans ${config.subSize}`}>
              AI Legal Assistant for India
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
