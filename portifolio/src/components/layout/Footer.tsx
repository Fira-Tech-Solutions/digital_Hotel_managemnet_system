import { Link } from 'react-router-dom';
import { hotel, navigation } from '../../data/siteData';

export function Footer() {
  return (
    <footer className="bg-primary border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="font-display text-2xl tracking-[0.2em] text-gold font-semibold">
              ADAMA
            </Link>
            <p className="text-ivory/40 text-sm font-light leading-relaxed mt-4 max-w-xs">
              {hotel.description.slice(0, 120)}...
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-ivory/40 mb-5">Explore</h3>
            <ul className="space-y-3">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="text-sm text-ivory/50 hover:text-gold transition-colors duration-300">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-ivory/40 mb-5">Contact</h3>
            <ul className="space-y-3 text-sm text-ivory/50">
              <li>{hotel.address}</li>
              <li><a href={`tel:${hotel.phone}`} className="hover:text-gold transition-colors">{hotel.phone}</a></li>
              <li><a href={`mailto:${hotel.email}`} className="hover:text-gold transition-colors">{hotel.email}</a></li>
              <li className="pt-2 text-ivory/30 text-xs">Reception: 24 Hours</li>
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div>
            <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-ivory/40 mb-5">Follow</h3>
            <div className="flex gap-4 mb-6">
              {['Instagram', 'Facebook', 'TripAdvisor'].map((name) => (
                <a key={name} href="#" className="text-xs text-ivory/40 hover:text-gold transition-colors tracking-wider uppercase">
                  {name}
                </a>
              ))}
            </div>
            <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-ivory/40 mb-3 mt-6">Newsletter</h3>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-surface border border-white/10 px-4 py-2.5 text-xs text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold/50 transition-colors"
                aria-label="Email for newsletter"
              />
              <button className="px-4 py-2.5 bg-gold text-primary text-[10px] font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-ivory/25 text-xs">
            &copy; {new Date().getFullYear()} {hotel.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-ivory/25 text-xs hover:text-ivory/50 transition-colors">Privacy Policy</a>
            <a href="#" className="text-ivory/25 text-xs hover:text-ivory/50 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
