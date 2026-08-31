import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { navigation } from '../../data/siteData';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-primary/95 backdrop-blur-md border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 h-16 sm:h-20 flex items-center justify-between" aria-label="Main navigation">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden text-ivory/80 hover:text-ivory transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop left nav */}
          <div className="hidden md:flex items-center gap-7">
            {navigation.slice(0, 4).map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-[10px] font-medium tracking-[0.15em] uppercase transition-colors duration-300 ${
                  location.pathname === item.href
                    ? 'text-gold'
                    : 'text-ivory/60 hover:text-ivory'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="font-display text-xl sm:text-2xl tracking-[0.2em] text-gold font-semibold">
              ADAMA
            </span>
          </Link>

          {/* Desktop right nav */}
          <div className="hidden md:flex items-center gap-7">
            {navigation.slice(4).map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-[10px] font-medium tracking-[0.15em] uppercase transition-colors duration-300 ${
                  location.pathname === item.href
                    ? 'text-gold'
                    : 'text-ivory/60 hover:text-ivory'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Book CTA */}
          <div className="hidden md:block">
            <Link
              to="/booking"
              className="px-6 py-2.5 border border-gold/50 text-gold text-[10px] font-medium tracking-[0.15em] uppercase hover:bg-gold hover:text-primary transition-all duration-300"
            >
              Book Your Stay
            </Link>
          </div>

          {/* Mobile spacer */}
          <div className="w-6 md:hidden" />
        </nav>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[100] bg-primary/98 backdrop-blur-xl flex flex-col transition-opacity duration-400 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-6 h-16">
          <span className="font-display text-lg tracking-[0.2em] text-gold font-semibold">ADAMA</span>
          <button onClick={() => setIsOpen(false)} className="text-ivory/60 hover:text-ivory transition-colors" aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          {navigation.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`font-display text-2xl tracking-wider transition-colors ${
                location.pathname === item.href ? 'text-gold' : 'text-ivory/70 hover:text-ivory'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/booking"
            className="mt-4 px-8 py-3 border border-gold text-gold text-xs tracking-[0.2em] uppercase font-medium hover:bg-gold hover:text-primary transition-all"
          >
            Book Your Stay
          </Link>
        </div>
      </div>
    </>
  );
}
