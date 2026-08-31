import { ArrowRight } from 'lucide-react';

interface LandingViewProps {
  onViewMenu: () => void;
}

export function LandingView({ onViewMenu }: LandingViewProps) {
  return (
    <div
      id="adama-landing-view"
      className="relative min-h-[100dvh] w-full flex flex-col justify-between overflow-hidden bg-[#0a0908]"
    >
      {/* Background Hero Image with Vignette */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=85"
          alt="Adama Hotel Culinary Masterpiece"
          className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.08] scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Soft dark vignette overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090807] via-[#090807]/40 to-[#090807]/70" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#090807]/30 to-[#090807]/80" />
      </div>

      {/* Spacer for Header */}
      <div className="pt-24" />

      {/* Center Callout */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        <div className="space-y-4 max-w-xs sm:max-w-sm flex flex-col items-center">
          <h2
            id="landing-hero-tagline"
            className="font-sans text-[13px] sm:text-[14px] font-semibold tracking-[0.24em] text-[#e8c76b] uppercase"
          >
            An Intimate Culinary Experience
          </h2>

          {/* Thin Gold Line */}
          <div className="w-16 h-[1.5px] bg-[#c59d3e]/80 rounded-full my-1" />

          {/* View Menu CTA Button */}
          <div className="pt-4 w-full flex justify-center">
            <button
              id="btn-view-menu"
              onClick={onViewMenu}
              className="group relative px-8 py-3.5 rounded-full bg-[#3d271a]/70 hover:bg-[#4d3222]/85 active:scale-95 border border-[#8f6d38]/70 text-[#f5ebd6] font-medium text-sm tracking-[0.14em] uppercase transition-all duration-300 flex items-center justify-center gap-2.5 shadow-2xl backdrop-blur-md hover:border-[#dfb65c] hover:text-[#fff8e7] gold-glow"
            >
              <span>View Menu</span>
              <ArrowRight className="w-4 h-4 text-[#e5c365] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="relative z-10 pb-10 pt-6 text-center space-y-1.5">
        <p className="text-[11px] font-medium tracking-[0.28em] text-[#9c8e7a] uppercase">
          Located Within
        </p>
        <p className="font-cinzel text-[13px] font-semibold tracking-[0.22em] text-[#e2d5c1] uppercase">
          Adama Hotel
        </p>
      </div>
    </div>
  );
}
