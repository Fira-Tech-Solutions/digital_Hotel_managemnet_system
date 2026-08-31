import { Heart, Presentation, PartyPopper, MapPin } from 'lucide-react';
import type { ReactNode } from 'react';
import { PageHero } from '../components/ui/PageHero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import { events } from '../data/siteData';

const iconMap: Record<string, ReactNode> = {
  Heart: <Heart className="w-6 h-6 text-gold" />,
  Presentation: <Presentation className="w-6 h-6 text-gold" />,
  PartyPopper: <PartyPopper className="w-6 h-6 text-gold" />,
};

export default function EventsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Celebrations"
        title="Events & Meetings"
        subtitle="Extraordinary venues and impeccable service for your most important occasions."
        image="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80"
      />

      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          {events.map((event) => (
            <div key={event.id} className="grid md:grid-cols-2 gap-12 items-start bg-surface border border-white/5 p-8 sm:p-10">
              <div>
                <div className="mb-4">{iconMap[event.icon]}</div>
                <h3 className="font-display text-2xl sm:text-3xl text-ivory font-semibold mb-4">{event.name}</h3>
                <p className="text-ivory/50 text-sm font-light leading-relaxed mb-6">{event.description}</p>
                <h4 className="text-[10px] text-gold font-semibold tracking-[0.2em] uppercase mb-3">Available Venues</h4>
                <ul className="space-y-2 mb-8">
                  {event.venues.map((v) => (
                    <li key={v} className="text-ivory/40 text-sm flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-gold/60" /> {v}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-primary border border-white/5 p-6 sm:p-8">
                <h4 className="font-display text-lg text-ivory font-semibold mb-4">Plan Your Event</h4>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <input type="text" placeholder="Your Name" className="w-full bg-surface border border-white/10 px-4 py-3 text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold/50 transition-colors" />
                  <input type="email" placeholder="Email Address" className="w-full bg-surface border border-white/10 px-4 py-3 text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold/50 transition-colors" />
                  <input type="tel" placeholder="Phone Number" className="w-full bg-surface border border-white/10 px-4 py-3 text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold/50 transition-colors" />
                  <select className="w-full bg-surface border border-white/10 px-4 py-3 text-sm text-ivory/70 focus:outline-none focus:border-gold/50 transition-colors">
                    <option>Event Type</option>
                    <option>Wedding</option>
                    <option>Conference</option>
                    <option>Private Event</option>
                    <option>Corporate Meeting</option>
                  </select>
                  <input type="number" placeholder="Expected Guests" className="w-full bg-surface border border-white/10 px-4 py-3 text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold/50 transition-colors" />
                  <input type="date" className="w-full bg-surface border border-white/10 px-4 py-3 text-sm text-ivory/70 focus:outline-none focus:border-gold/50 transition-colors" />
                  <textarea placeholder="Tell us about your event..." rows={3} className="w-full bg-surface border border-white/10 px-4 py-3 text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold/50 transition-colors resize-none" />
                  <Button variant="primary" className="w-full">Send Inquiry</Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
