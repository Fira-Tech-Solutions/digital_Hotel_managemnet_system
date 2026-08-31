import { Link } from 'react-router-dom';
import { Clock, Shirt } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import { diningRestaurants, menuCategories } from '../data/siteData';

export default function DiningPage() {
  return (
    <div>
      <PageHero
        eyebrow="Culinary"
        title="The Dining Experience"
        subtitle="A symphony of flavors crafted with passion, served with elegance."
        image="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80"
      />

      {/* Restaurants */}
      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Venues"
            title="Our Restaurants & Bars"
            subtitle="Four distinct venues, each offering a unique culinary perspective."
          />
          <div className="space-y-16">
            {diningRestaurants.map((restaurant, i) => (
              <div key={restaurant.id} className={`grid md:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? 'md:[direction:rtl]' : ''}`}>
                <div className={`${i % 2 === 1 ? 'md:[direction:ltr]' : ''}`}>
                  <span className="text-[10px] text-gold font-semibold tracking-[0.2em] uppercase">{restaurant.type}</span>
                  <h3 className="font-display text-2xl sm:text-3xl text-ivory font-semibold mt-2 mb-3">{restaurant.name}</h3>
                  <p className="text-ivory/50 text-sm font-light leading-relaxed mb-4">{restaurant.description}</p>
                  <div className="flex flex-wrap gap-4 text-ivory/30 text-xs mb-6">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {restaurant.hours}</span>
                    <span className="flex items-center gap-1"><Shirt className="w-3 h-3" /> {restaurant.dressCode}</span>
                    <span>{restaurant.priceRange}</span>
                  </div>
                  <Button variant="secondary" size="sm" href="/booking">Reserve a Table</Button>
                </div>
                <div className={`relative aspect-[4/3] overflow-hidden ${i % 2 === 1 ? 'md:[direction:ltr]' : ''}`}>
                  <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu */}
      <section className="py-24 sm:py-32 px-6 bg-surface/50">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            eyebrow="Tasting Menu"
            title="A Culinary Journey"
            subtitle="Our seasonal menu features the finest ingredients, thoughtfully prepared."
          />
          <div className="space-y-12">
            {menuCategories.map((category) => (
              <div key={category.name}>
                <h3 className="font-display text-xl sm:text-2xl text-gold font-semibold mb-6 pb-3 border-b border-white/5">{category.name}</h3>
                <div className="space-y-4">
                  {category.items.map((item) => (
                    <div key={item.name} className="flex items-start justify-between gap-4 py-3 border-b border-white/5 last:border-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-ivory text-sm font-medium">{item.name}</h4>
                          {item.dietary.map((d) => (
                            <span key={d} className="px-1.5 py-0.5 bg-gold/10 text-gold text-[9px] font-medium tracking-wider uppercase rounded">{d}</span>
                          ))}
                        </div>
                        <p className="text-ivory/30 text-xs mt-1">{item.description}</p>
                      </div>
                      <span className="text-gold text-sm font-medium whitespace-nowrap">${item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* In-Room Dining CTA */}
      <section className="py-24 sm:py-32 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ivory mb-4">In-Room Dining</h2>
          <p className="text-ivory/50 text-sm font-light leading-relaxed mb-8">
            Enjoy our complete menu from the comfort of your room. Available 24 hours for hotel guests.
          </p>
          <Button variant="primary" href="/booking">Order In-Room</Button>
        </div>
      </section>
    </div>
  );
}
