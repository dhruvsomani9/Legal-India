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
  // Sizing definitions
  const dimensions = {
    sm: { height: 26, width: 110, fontSize: 24, pillarHeight: 22 },
    md: { height: 34, width: 145, fontSize: 32, pillarHeight: 28 },
    lg: { height: 46, width: 195, fontSize: 44, pillarHeight: 38 },
    xl: { height: 60, width: 255, fontSize: 56, pillarHeight: 48 },
  };

  const { height, width } = dimensions[size];

  if (variant === 'icon') {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl bg-[#0e1626] border border-white/10 shadow-sm ${className}`}
        style={{ width: height, height }}
      >
        <svg
          viewBox="0 0 40 40"
          width={height * 0.75}
          height={height * 0.75}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stylized L & I in Saffron and Green */}
          <path d="M8 8H14V26H24V32H8V8Z" fill="#FF671F" />
          <path d="M26 6L31 3V32H26V6Z" fill="#FF671F" />
          <path d="M33 3L38 0V32H33V3Z" fill="#D1CDC4" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-start leading-none select-none ${className}`}>
      <svg
        viewBox="0 0 380 95"
        width={width}
        height={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
        aria-label="LegalIndia"
      >
        <defs>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@800&display=swap');
            .brand-font {
              font-family: 'Plus Jakarta Sans', -apple-system, system-ui, sans-serif;
              font-weight: 800;
              letter-spacing: -0.04em;
            }
          `}</style>
        </defs>

        <g transform="translate(4, 76)">
          {/* "Legal" in Indian Saffron (#FF671F / #F97316) */}
          <text
            x="0"
            y="0"
            className="brand-font"
            fontSize="78"
            fill="#FF671F"
          >
            Legal
          </text>

          {/* Stylized "I": Left Pillar in Saffron (angled top) */}
          <path
            d="M 194 -56 L 204 -62 L 204 0 L 194 0 Z"
            fill="#FF671F"
          />

          {/* Stylized "I": Right Pillar in Ash / Silver (angled top) */}
          <path
            d="M 209 -62 L 219 -68 L 219 0 L 209 0 Z"
            fill="#D1CDC4"
          />

          {/* "ndia" in Indian Green (#229944 / #16A34A) */}
          <g transform="translate(225, 0)">
            <text
              x="0"
              y="0"
              className="brand-font"
              fontSize="78"
              fill="#229944"
            >
              ndia
            </text>
          </g>
        </g>
      </svg>

      {showSubtitle && (
        <span className="text-[10px] text-amber-300/80 font-sans tracking-wider font-semibold pl-1 mt-0.5">
          AI LEGAL ASSISTANT FOR INDIA
        </span>
      )}
    </div>
  );
};
