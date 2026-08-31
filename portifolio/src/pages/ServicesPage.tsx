import { ConciergeBell, Car, Briefcase, Baby } from 'lucide-react';
import type { ReactNode } from 'react';
import { PageHero } from '../components/ui/PageHero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { services } from '../data/siteData';

const iconMap: Record<string, ReactNode> = {
  ConciergeBell: <ConciergeBell className="w-5 h-5 text-gold" />,
  Car: <Car className="w-5 h-5 text-gold" />,
  Briefcase: <Briefcase className="w-5 h-5 text-gold" />,
  Baby: <Baby className="w-5 h-5 text-gold" />,
};

export default function ServicesPage() {
  return (
    <div>
      <PageHero
        eyebrow="Services"
        title="Hotel Services"
        subtitle="Every detail attended to, every need anticipated."
        image="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80"
      />
      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10">
          {services.map((category) => (
            <div key={category.category} className="bg-surface border border-white/5 p-8">
              <div className="flex items-center gap-3 mb-6">
                {iconMap[category.icon]}
                <h3 className="font-display text-xl text-ivory font-semibold">{category.category}</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {category.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-ivory/50 text-sm">
                    <span className="w-1 h-1 rounded-full bg-gold/60" /> {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="py-24 sm:py-32 px-6 bg-surface/50 text-center">
        <div className="max-w-2xl mx-auto">
          <SectionHeader eyebrow="Assistance" title="Need Something Special?" subtitle="Our concierge team is available 24/7 to arrange any service you may need." />
          <p className="text-ivory/50 text-sm font-light mb-8">From airport transfers to private chefs, from theater tickets to personalized excursions — no request is too large or too small.</p>
        </div>
      </section>
    </div>
  );
}
