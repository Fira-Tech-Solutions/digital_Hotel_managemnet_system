import { ReactNode } from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  light?: boolean;
  children?: ReactNode;
}

export function SectionHeader({ eyebrow, title, subtitle, align = 'center', light = false, children }: SectionHeaderProps) {
  return (
    <div className={`mb-16 ${align === 'center' ? 'text-center' : 'text-left'}`}>
      {eyebrow && (
        <p className="text-gold text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase mb-4">
          {eyebrow}
        </p>
      )}
      <h2 className={`font-display text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-4 ${light ? 'text-primary' : 'text-ivory'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-sm sm:text-base font-light leading-relaxed max-w-2xl ${align === 'center' ? 'mx-auto' : ''} ${light ? 'text-muted' : 'text-ivory/60'}`}>
          {subtitle}
        </p>
      )}
      <div className="w-16 h-[1px] bg-gold/30 mx-auto mt-6" />
      {children}
    </div>
  );
}
