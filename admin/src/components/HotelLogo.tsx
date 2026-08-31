import React from 'react';

interface HotelLogoProps {
  variant?: 'full' | 'icon' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const HotelLogo: React.FC<HotelLogoProps> = ({ 
  variant = 'full', 
  size = 'md', 
  className = '' 
}) => {
  const sizeMap = {
    sm: { iconSize: 28, textSize: 'text-sm' },
    md: { iconSize: 38, textSize: 'text-base' },
    lg: { iconSize: 56, textSize: 'text-lg' },
    xl: { iconSize: 96, textSize: 'text-2xl' },
  };

  const currentSize = sizeMap[size];

  // The Cloche with stylized H monogram vector
  const ClocheIcon = (
    <svg 
      width={currentSize.iconSize} 
      height={currentSize.iconSize} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-sm flex-shrink-0"
    >
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F9E79F" />
          <stop offset="35%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#AA820A" />
          <stop offset="100%" stopColor="#E5B83B" />
        </linearGradient>
        <linearGradient id="goldShine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF4D0" />
          <stop offset="100%" stopColor="#B38F24" />
        </linearGradient>
        <linearGradient id="darkSlate" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>

      {/* Cloche Knob */}
      <path 
        d="M 45 28 C 45 25, 55 25, 55 28 L 54 33 L 46 33 Z" 
        fill="url(#goldGrad)" 
      />
      <rect x="42" y="24" width="16" height="4" rx="2" fill="url(#goldShine)" />

      {/* Cloche Dome Outer Silhouette */}
      <path 
        d="M 18 64 C 18 36, 40 33, 50 33 C 60 33, 82 36, 82 64 Z" 
        fill="url(#goldGrad)" 
      />

      {/* Cloche Inner Cutout / Dark H Shadow Accent */}
      {/* Dark stylized 'H' central cutout path */}
      <path 
        d="M 38 41 L 43 41 L 43 51 C 46 48, 54 48, 57 41 L 62 41 L 62 64 L 57 64 L 57 51 C 54 55, 46 54, 43 64 L 38 64 Z" 
        fill="url(#darkSlate)" 
      />

      {/* Golden Highlight Arch Over H */}
      <path 
        d="M 23 63 C 27 45, 40 38, 50 38 C 43 43, 33 48, 29 63 Z" 
        fill="#FFF9E6" 
        opacity="0.5" 
      />

      {/* Cloche Base Tray */}
      <rect x="14" y="65" width="72" height="4" rx="2" fill="url(#goldGrad)" />
      <rect x="12" y="67" width="76" height="3" rx="1.5" fill="url(#goldShine)" />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {ClocheIcon}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`flex flex-col items-center justify-center p-4 text-center ${className}`}>
        <div className="w-20 h-20 rounded-2xl bg-amber-50/10 border border-amber-500/20 flex items-center justify-center mb-3 shadow-inner">
          <svg width="56" height="56" viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id="badgeGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F9E79F" />
                <stop offset="50%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#996515" />
              </linearGradient>
            </defs>
            <path d="M 45 28 C 45 25, 55 25, 55 28 L 54 33 L 46 33 Z" fill="url(#badgeGold)" />
            <rect x="42" y="24" width="16" height="4" rx="2" fill="#FFE89E" />
            <path d="M 18 64 C 18 36, 40 33, 50 33 C 60 33, 82 36, 82 64 Z" fill="url(#badgeGold)" />
            <path d="M 38 41 L 43 41 L 43 51 C 46 48, 54 48, 57 41 L 62 41 L 62 64 L 57 64 L 57 51 C 54 55, 46 54, 43 64 L 38 64 Z" fill="#1E293B" />
            <rect x="14" y="65" width="72" height="4" rx="2" fill="url(#badgeGold)" />
          </svg>
        </div>
        <span className="font-['Cinzel',serif] tracking-[0.25em] text-xs font-bold text-amber-900 uppercase">
          Adama Hotel Admin
        </span>
        <div className="w-5 h-5 rounded-full border border-amber-600/40 mt-2 flex items-center justify-center text-[10px] text-amber-600 font-serif font-bold">
          H
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 shadow-sm">
        <span className="font-serif font-extrabold text-amber-400 text-lg">H</span>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-white font-bold text-sm tracking-tight leading-tight truncate">
          Adama Hotel Admin
        </span>
        <span className="text-slate-400 text-[11px] font-medium tracking-wide truncate">
          Premium Management
        </span>
      </div>
    </div>
  );
};
