import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import ScrollRevealHero from './components/ScrollRevealHero';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans selection:bg-gold/30">
      {/* Navigation Overlay */}
      <div
        className={`fixed inset-0 z-[100] bg-[#0a0a0a]/95 backdrop-blur-md flex flex-col justify-center items-center transition-opacity duration-500 md:hidden ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={() => setIsMenuOpen(false)}
          className="absolute top-6 left-6 text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
        <nav className="flex flex-col items-center gap-10 font-serif text-4xl text-white">
          <a href="#" onClick={() => setIsMenuOpen(false)} className="hover:text-gold transition-colors">Home</a>
          <a href="#" onClick={() => setIsMenuOpen(false)} className="hover:text-gold transition-colors">The Menu</a>
          <a href="#" onClick={() => setIsMenuOpen(false)} className="hover:text-gold transition-colors">Reservations</a>
          <a href="#" onClick={() => setIsMenuOpen(false)} className="hover:text-gold transition-colors">Contact</a>
        </nav>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Left side: Mobile Menu Button OR Desktop Left Nav */}
          <div className="flex-1 flex justify-start">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-[0.2em] uppercase text-gray-300">
              <a href="#" className="hover:text-gold transition-colors">Home</a>
              <a href="#" className="hover:text-gold transition-colors">The Menu</a>
            </nav>
          </div>
          
          {/* Center: Logo */}
          <div className="font-serif text-2xl tracking-widest text-gold text-center">ADAMA</div>
          
          {/* Right side: Mobile Spacer OR Desktop Right Nav */}
          <div className="flex-1 flex justify-end">
            <div className="w-6 md:hidden" /> {/* Spacer for centering on mobile */}
            <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-[0.2em] uppercase text-gray-300">
              <a href="#" className="hover:text-gold transition-colors">Reservations</a>
              <a href="#" className="hover:text-gold transition-colors">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section — scroll-scrubbed frame sequence */}
      <ScrollRevealHero
        framePath="/hero_frames"
        framePrefix="ezgif-frame-"
        frameCount={176}
        framePadding={3}
        frameExt="jpg"
        scrollHeight={450}
        overlays={[
          {
            text: 'THE ART OF THE TABLE',
            range: [0, 0.15],
            position: 'upper-third',
            style: 'eyebrow',
          },
          {
            text: 'An Evening, Set',
            range: [0.7, 0.95],
            position: 'lower-headline',
            style: 'headline',
          },
          {
            text: 'Every detail placed by hand, for you',
            range: [0.72, 1.0],
            position: 'lower-subline',
            style: 'subline',
          },
          {
            text: 'Reserve a Table',
            range: [0.9, 1.0],
            position: 'lower-button',
            style: 'button',
          },
        ]}
      />

      {/* Menu Section */}
      <section className="py-32 px-6 max-w-5xl mx-auto text-center">
        <h2 className="font-serif text-4xl md:text-5xl text-gold mb-6">
          A Culinary Journey
        </h2>
        <div className="w-24 h-[1px] bg-gold/30 mx-auto mb-10"></div>
        <p className="text-gray-300 md:text-lg font-light leading-relaxed mb-24 max-w-2xl mx-auto">
          Our Executive Chef curates a seasonal tasting menu that is as visually arresting as it is satisfying. Each dish emerges from the shadows, illuminated by taste.
        </p>

        <div className="grid md:grid-cols-2 gap-16 md:gap-12 text-left">
          {/* Card 1 */}
          <div className="group cursor-pointer">
            <div className="overflow-hidden mb-6 rounded-sm bg-[#111]">
              <img src="/Image%201.jpeg" alt="Roasted Duck Breast" className="w-full aspect-[4/5] object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100" />
            </div>
            <div className="flex justify-between items-baseline mb-3">
              <h3 className="font-serif text-2xl text-white">Roasted Duck Breast</h3>
              <span className="text-gold font-serif text-xl pl-4">$48</span>
            </div>
            <p className="text-gray-400 font-serif italic tracking-wide text-lg">Blackberry jus, charred pearl onions, micro-thyme</p>
          </div>

          {/* Card 2 */}
          <div className="group cursor-pointer">
            <div className="overflow-hidden mb-6 rounded-sm bg-[#111]">
              <img src="/Image%202.jpeg" alt="Chef's Tasting" className="w-full aspect-[4/5] object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100" />
            </div>
            <div className="flex justify-between items-baseline mb-3">
              <h3 className="font-serif text-2xl text-white">Chef's Tasting</h3>
              <span className="text-gold font-serif text-xl pl-4">$185</span>
            </div>
            <p className="text-gray-400 font-serif italic tracking-wide text-lg">Seven courses, seasonally inspired, meticulously crafted</p>
          </div>
        </div>
      </section>

      {/* Reservation Section */}
      <section className="py-32 px-6 bg-[#0f0f0f] text-center border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl text-white mb-6">Secure Your Table</h2>
          <p className="text-gray-300 font-light leading-relaxed mb-12">
            Reservations are highly recommended to ensure an intimate dining experience.
          </p>
          <button className="border border-gold text-gold hover:bg-gold hover:text-black transition-colors duration-300 px-10 py-4 text-sm tracking-[0.2em] uppercase font-semibold cursor-pointer">
            Reserve a Table
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 text-center text-gray-400 font-light text-sm bg-[#050505]">
        <div className="font-serif text-2xl tracking-widest text-gold mb-10">ADAMA</div>
        <div className="space-y-4 mb-12 text-gray-500">
          <p>Address: 123 Obsidian Way, Midnight District</p>
          <p>Phone: +1 234 567 8900</p>
          <p>Email: concierge@adama.com</p>
        </div>
        <div className="w-16 h-[1px] bg-white/10 mx-auto mb-10"></div>
        <p className="text-gray-600">&copy; 2024 Adama Hotel. All rights reserved.</p>
      </footer>
    </div>
  );
}
