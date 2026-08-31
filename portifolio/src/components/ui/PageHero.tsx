import { ReactNode } from 'react';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image?: string;
  children?: ReactNode;
}

export function PageHero({ eyebrow, title, subtitle, image, children }: PageHeroProps) {
  return (
    <section className="relative h-[60vh] min-h-[400px] flex items-end overflow-hidden">
      {image && (
        <div className="absolute inset-0">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-primary/20" />
        </div>
      )}
      {!image && (
        <div className="absolute inset-0 bg-gradient-to-b from-surface to-primary" />
      )}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-16 sm:pb-20">
        {eyebrow && (
          <p className="text-gold text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase mb-4 animate-fadeUp">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-ivory leading-tight mb-4 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-ivory/60 text-sm sm:text-base font-light max-w-xl leading-relaxed animate-fadeUp" style={{ animationDelay: '0.2s' }}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
