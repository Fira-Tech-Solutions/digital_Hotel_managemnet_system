import { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  { label: 'Room Service', href: '/dining', icon: '🍽' },
  { label: 'Restaurant', href: '/dining', icon: '🍷' },
  { label: 'Spa & Wellness', href: '/wellness', icon: '✨' },
  { label: 'Housekeeping', href: '/contact', icon: '🧹' },
  { label: 'Airport Transfer', href: '/services', icon: '🚗' },
  { label: 'Experiences', href: '/experiences', icon: '🌟' },
  { label: 'Events', href: '/events', icon: '🎉' },
  { label: 'Contact Concierge', href: '/contact', icon: '📞' },
];

export function ConciergeButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-gold text-primary text-[10px] font-semibold tracking-[0.15em] uppercase shadow-lg shadow-gold/20 hover:bg-gold-light transition-all duration-300 hover:scale-105"
        aria-label="Open concierge"
      >
        <MessageSquare className="w-4 h-4" />
        Concierge
      </button>

      {/* Panel */}
      <div
        className={`fixed inset-0 z-[90] flex items-end sm:items-center justify-end sm:justify-end p-0 sm:p-6 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
        <div className={`relative z-10 w-full sm:w-96 bg-surface border border-white/5 shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full sm:translate-y-0 sm:scale-95'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div>
              <h3 className="font-display text-lg text-ivory font-semibold">Concierge</h3>
              <p className="text-ivory/30 text-xs">How may we assist?</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-ivory/40 hover:text-ivory transition-colors" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Services */}
          <div className="p-4 space-y-1">
            {services.map((service) => (
              <Link
                key={service.label}
                to={service.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-ivory/60 hover:text-ivory hover:bg-white/5 transition-colors text-sm"
              >
                <span className="text-base">{service.icon}</span>
                {service.label}
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/5">
            <p className="text-ivory/20 text-xs text-center">Available 24 hours for hotel guests</p>
          </div>
        </div>
      </div>
    </>
  );
}
