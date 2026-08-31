import { useParams, Link } from 'react-router-dom';
import { Clock, DollarSign, Check } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import { experiences } from '../data/siteData';

export function ExperiencesPage() {
  return (
    <div>
      <PageHero
        eyebrow="Curated"
        title="Experiences"
        subtitle="Bespoke moments crafted to create lasting memories."
        image="https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200&q=80"
      />
      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {experiences.map((exp) => (
              <Link key={exp.id} to={`/experiences/${exp.id}`} className="group bg-surface border border-white/5 hover:border-gold/20 transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={exp.image} alt={exp.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-primary/60 backdrop-blur-sm text-[10px] text-gold font-semibold tracking-[0.15em] uppercase">{exp.category}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl text-ivory font-semibold mb-2 group-hover:text-gold transition-colors">{exp.name}</h3>
                  <div className="flex items-center gap-4 text-ivory/30 text-xs mb-3">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exp.duration}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> From ${exp.price}</span>
                  </div>
                  <p className="text-ivory/50 text-sm font-light leading-relaxed line-clamp-2">{exp.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function ExperienceDetailPage() {
  const { id } = useParams();
  const exp = experiences.find((e) => e.id === id);

  if (!exp) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl text-ivory mb-4">Experience Not Found</h1>
          <Button variant="secondary" href="/experiences">View All Experiences</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="h-[50vh] min-h-[350px] relative overflow-hidden">
        <img src={exp.image} alt={exp.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/30 to-transparent" />
        <div className="absolute bottom-8 left-6 right-6 max-w-7xl mx-auto">
          <span className="text-gold text-[10px] font-semibold tracking-[0.3em] uppercase">{exp.category}</span>
          <h1 className="font-display text-4xl sm:text-5xl text-ivory font-semibold mt-2">{exp.name}</h1>
        </div>
      </section>
      <section className="py-16 sm:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-white/5">
            <div className="flex items-center gap-2 text-ivory/50 text-sm"><Clock className="w-4 h-4 text-gold" /> {exp.duration}</div>
            <div className="flex items-center gap-2 text-ivory/50 text-sm"><DollarSign className="w-4 h-4 text-gold" /> From ${exp.price} per person</div>
          </div>
          <p className="text-ivory/60 text-base font-light leading-relaxed mb-10">{exp.description}</p>
          <h3 className="font-display text-xl text-ivory font-semibold mb-4">What's Included</h3>
          <ul className="space-y-3 mb-10">
            {exp.includes.map((item) => (
              <li key={item} className="flex items-center gap-3 text-ivory/50 text-sm">
                <Check className="w-4 h-4 text-gold shrink-0" /> {item}
              </li>
            ))}
          </ul>
          <Button variant="primary" href="/booking">Book This Experience</Button>
        </div>
      </section>
    </div>
  );
}
