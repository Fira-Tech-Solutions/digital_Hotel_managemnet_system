import { useState } from 'react';
import { X } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { galleryImages } from '../data/siteData';

const categories = ['All', 'Hotel', 'Rooms', 'Dining', 'Wellness', 'Pool', 'Events'];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = activeCategory === 'All'
    ? galleryImages
    : galleryImages.filter((img) => img.category === activeCategory);

  return (
    <div>
      <PageHero
        eyebrow="Gallery"
        title="Visual Journey"
        subtitle="Glimpses of the Adama Hotel experience."
        image="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80"
      />
      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 text-[10px] font-semibold tracking-[0.15em] uppercase transition-all duration-300 border ${
                  activeCategory === cat
                    ? 'bg-gold text-primary border-gold'
                    : 'border-white/10 text-ivory/50 hover:text-ivory hover:border-white/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4">
            {filtered.map((img, i) => (
              <button
                key={i}
                onClick={() => setLightbox(i)}
                className="relative overflow-hidden group mb-3 sm:mb-4 break-inside-avoid cursor-pointer"
              >
                <img src={img.src} alt={img.alt} className="w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[200] bg-primary/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 text-ivory/60 hover:text-ivory transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={filtered[lightbox].src}
            alt={filtered[lightbox].alt}
            className="max-w-full max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-0 right-0 text-center">
            <p className="text-ivory/40 text-xs">{filtered[lightbox].alt}</p>
            <p className="text-ivory/20 text-xs mt-1">{lightbox + 1} / {filtered.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
