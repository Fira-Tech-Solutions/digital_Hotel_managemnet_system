import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Rooms', href: '/rooms' },
  { label: 'Dining', href: '/dining' },
  { label: 'Experiences', href: '/experiences' },
  { label: 'Wellness', href: '/wellness' },
  { label: 'Contact', href: '/contact' },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

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
            : 'bg-gradient-to-b from-primary/60 to-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 h-16 sm:h-20 grid grid-cols-[1fr_auto_1fr] items-center" aria-label="Main navigation">
          {/* Left nav */}
          <div className="hidden lg:flex items-center justify-start gap-7">
            {navItems.slice(0, 3).map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-[10px] font-medium tracking-[0.15em] uppercase transition-colors duration-300 whitespace-nowrap ${
                  isActive(location.pathname, item.href)
                    ? 'text-gold'
                    : 'text-ivory/50 hover:text-ivory'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Logo — always centered via grid */}
          <Link to="/" className="flex justify-center" aria-label="Adama Hotel Home">
            <span className="font-display text-xl sm:text-2xl tracking-[0.25em] text-gold font-semibold">
              ADAMA
            </span>
          </Link>

          {/* Right nav */}
          <div className="hidden lg:flex items-center justify-end gap-7">
            {navItems.slice(3).map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-[10px] font-medium tracking-[0.15em] uppercase transition-colors duration-300 whitespace-nowrap ${
                  isActive(location.pathname, item.href)
                    ? 'text-gold'
                    : 'text-ivory/50 hover:text-ivory'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/booking"
              className="ml-2 px-6 py-2 border border-gold/50 text-gold text-[10px] font-medium tracking-[0.15em] uppercase hover:bg-gold hover:text-primary transition-all duration-300"
            >
              Book Stay
            </Link>
          </div>

          {/* Mobile: hamburger left + logo center + spacer right */}
          <button
            onClick={() => setIsOpen(true)}
            className="lg:hidden col-start-1 justify-self-start text-ivory/80 hover:text-ivory transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="lg:hidden col-start-2 justify-self-center" aria-label="Adama Hotel Home">
            <span className="font-display text-xl tracking-[0.25em] text-gold font-semibold">ADAMA</span>
          </Link>

          <div className="lg:hidden col-start-3" />
        </nav>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-primary/80 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsOpen(false)}
        />

        {/* Panel */}
        <div
          className={`absolute inset-y-0 left-0 w-[80%] max-w-sm bg-surface border-r border-white/5 flex flex-col transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-white/5">
            <span className="font-display text-lg tracking-[0.2em] text-gold font-semibold">ADAMA</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-ivory/40 hover:text-ivory transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav links */}
          <div className="flex-1 flex flex-col justify-center px-8 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`py-3 font-display text-xl tracking-wider transition-colors border-b border-white/5 last:border-0 ${
                  isActive(location.pathname, item.href)
                    ? 'text-gold'
                    : 'text-ivory/60 hover:text-ivory'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Drawer footer */}
          <div className="px-8 pb-8 pt-4 border-t border-white/5">
            <Link
              to="/booking"
              className="block w-full text-center px-8 py-3 border border-gold text-gold text-xs tracking-[0.2em] uppercase font-medium hover:bg-gold hover:text-primary transition-all"
            >
              Book Your Stay
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
