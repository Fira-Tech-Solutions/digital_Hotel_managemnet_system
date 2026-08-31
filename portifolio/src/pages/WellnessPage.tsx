import { Sparkles, Gem, Dumbbell } from 'lucide-react';
import type { ReactNode } from 'react';
import { PageHero } from '../components/ui/PageHero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import { wellnessServices } from '../data/siteData';

const iconMap: Record<string, ReactNode> = {
  Sparkles: <Sparkles className="w-5 h-5 text-gold" />,
  Gem: <Gem className="w-5 h-5 text-gold" />,
  Dumbbell: <Dumbbell className="w-5 h-5 text-gold" />,
};

export default function WellnessPage() {
  return (
    <div>
      <PageHero
        eyebrow="Wellness"
        title="Restore. Rebalance. Renew."
        subtitle="A sanctuary dedicated to your wellbeing, offering world-class treatments and facilities."
        image="https://images.unsplash.com/photo-1544161515-4ab6ce6db85b?w=1200&q=80"
      />

      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Our Offerings"
            title="Wellness Services"
            subtitle="Each treatment is designed to restore your natural balance and leave you feeling renewed."
          />
          <div className="space-y-16">
            {wellnessServices.map((category) => (
              <div key={category.category}>
                <div className="flex items-center gap-3 mb-8">
                  {iconMap[category.icon]}
                  <h3 className="font-display text-2xl text-ivory font-semibold">{category.category}</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {category.services.map((service) => (
                    <div key={service.name} className="bg-surface border border-white/5 p-6 hover:border-gold/20 transition-colors duration-300">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-ivory text-base font-medium">{service.name}</h4>
                        <span className="text-gold text-sm font-medium whitespace-nowrap ml-4">{service.price > 0 ? `$${service.price}` : 'Complimentary'}</span>
                      </div>
                      <p className="text-ivory/40 text-xs mb-3">{service.duration}</p>
                      <p className="text-ivory/50 text-sm font-light leading-relaxed">{service.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32 px-6 bg-surface/50 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ivory mb-4">Book a Treatment</h2>
          <p className="text-ivory/50 text-sm font-light leading-relaxed mb-8">
            Reserve your wellness experience in advance to guarantee your preferred time and treatment.
          </p>
          <Button variant="primary" href="/contact">Request Appointment</Button>
        </div>
      </section>
    </div>
  );
}
