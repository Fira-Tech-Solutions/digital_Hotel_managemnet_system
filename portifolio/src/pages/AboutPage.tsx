import { PageHero } from '../components/ui/PageHero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { hotel } from '../data/siteData';

export default function AboutPage() {
  return (
    <div>
      <PageHero
        eyebrow="About"
        title="Our Story"
        subtitle="A legacy of extraordinary hospitality."
        image="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80"
      />

      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionHeader eyebrow="Philosophy" title="The Art of Extraordinary Hospitality" />
          <div className="space-y-6 text-ivory/50 text-sm sm:text-base font-light leading-relaxed">
            <p>
              Founded in {hotel.yearEstablished}, Adama Hotel was born from a singular vision: to create a sanctuary where luxury is not merely observed, but genuinely felt. Every corner, every detail, every interaction has been thoughtfully curated to offer an experience that transcends the ordinary.
            </p>
            <p>
              Our name, "Adama," reflects our commitment to timeless elegance — a place where heritage meets contemporary sophistication, where warm hospitality meets uncompromising standards.
            </p>
            <p>
              From our meticulously designed rooms and suites to our award-winning dining venues, from our world-class wellness center to our bespoke experiences, every element of Adama Hotel has been crafted with a deep respect for our guests' comfort and satisfaction.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32 px-6 bg-surface/50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          {[
            { number: `${new Date().getFullYear() - hotel.yearEstablished}+`, label: 'Years of Excellence' },
            { number: '500+', label: 'Satisfied Guests Monthly' },
            { number: '4.9', label: 'Guest Rating' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-4xl sm:text-5xl text-gold font-semibold mb-2">{stat.number}</p>
              <p className="text-ivory/40 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionHeader eyebrow="Values" title="What We Stand For" />
          <div className="grid sm:grid-cols-2 gap-8">
            {[
              { title: 'Exceptional Service', desc: 'Anticipating needs before they arise, delivering with warmth and genuine care.' },
              { title: 'Attention to Detail', desc: 'Every element considered, from thread count to turndown amenities.' },
              { title: 'Culinary Excellence', desc: 'World-class dining experiences celebrating local and international flavors.' },
              { title: 'Sustainability', desc: 'Committed to responsible practices that protect our community and environment.' },
            ].map((value) => (
              <div key={value.title} className="bg-surface border border-white/5 p-6">
                <h3 className="font-display text-lg text-ivory font-semibold mb-2">{value.title}</h3>
                <p className="text-ivory/40 text-sm font-light leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
