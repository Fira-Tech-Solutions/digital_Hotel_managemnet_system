import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Star, ChevronRight } from 'lucide-react';
import ScrollRevealHero from '../components/ScrollRevealHero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import { hotel, rooms, diningRestaurants, wellnessServices, experiences, events, galleryImages, testimonials } from '../data/siteData';

export default function HomePage() {
  const featuredRooms = rooms.filter((r) => r.featured);
  const featuredRestaurants = diningRestaurants.filter((r) => r.featured);
  const featuredExperiences = experiences.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <ScrollRevealHero
        framePath="/hero_frames"
        framePrefix="ezgif-frame-"
        frameCount={176}
        framePadding={3}
        frameExt="jpg"
        scrollHeight={450}
        overlays={[
          { text: 'ADAMA HOTEL', range: [0, 0.22], position: 'center', style: 'headline', instant: true },
          { text: 'An estate at the edge of the Rift Valley', range: [0, 0.22], position: 'lower-subline', style: 'subline', instant: true },

          { text: 'Nestled among ancient acacia trees', range: [0.18, 0.38], position: 'mid-left', style: 'subline' },
          { text: 'Where the land meets the sky', range: [0.22, 0.42], position: 'bottom-right', style: 'eyebrow' },

          { text: '12 Suites of Distinction', range: [0.35, 0.55], position: 'mid-right', style: 'subline' },
          { text: 'Handcrafted interiors, panoramic views', range: [0.38, 0.58], position: 'top-left', style: 'eyebrow' },

          { text: 'Farm-to-Table Dining', range: [0.5, 0.68], position: 'mid-left', style: 'subline' },
          { text: 'Executive Chef James Kariuki', range: [0.52, 0.7], position: 'bottom-right', style: 'eyebrow' },

          { text: 'The Rift Valley Wellness Spa', range: [0.62, 0.8], position: 'mid-right', style: 'subline' },
          { text: 'Restore · Rejuvenate · Renew', range: [0.65, 0.82], position: 'top-left', style: 'eyebrow' },

          { text: 'Your Story Begins Here', range: [0.78, 0.95], position: 'center', style: 'headline' },
          { text: 'Book Your Stay', range: [0.82, 0.95], position: 'lower-button', style: 'button' },
        ]}
      />

      {/* Hotel Introduction */}
      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="relative aspect-[4/5] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"
              alt="Adama Hotel exterior"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
          </div>
          <div>
            <p className="text-gold text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase mb-4">The Art of Hospitality</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ivory leading-tight mb-6">
              A Place Designed for Extraordinary Stays
            </h2>
            <div className="w-16 h-[1px] bg-gold/30 mb-6" />
            <p className="text-ivory/50 text-sm sm:text-base font-light leading-relaxed mb-4">
              {hotel.description}
            </p>
            <p className="text-ivory/50 text-sm sm:text-base font-light leading-relaxed mb-8">
              Every detail has been considered, every comfort anticipated. From the moment you arrive, our dedicated team ensures your stay transcends the ordinary.
            </p>
            <Button variant="secondary" href="/about">
              Discover Our Story <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Rooms & Suites */}
      <section className="py-24 sm:py-32 px-6 bg-surface/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Accommodation"
            title="Rooms & Suites"
            subtitle="Spaces designed for rest, comfort, and unforgettable stays."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {featuredRooms.map((room) => (
              <Link key={room.id} to={`/rooms/${room.id}`} className="group">
                <div className="relative aspect-[3/4] overflow-hidden mb-5">
                  <img
                    src={room.images[0]}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-[10px] text-gold font-semibold tracking-[0.2em] uppercase">{room.type}</span>
                  </div>
                </div>
                <h3 className="font-display text-xl sm:text-2xl text-ivory font-semibold mb-2 group-hover:text-gold transition-colors">{room.name}</h3>
                <p className="text-ivory/40 text-xs mb-3">{room.bedType} · {room.capacity} Guests · {room.size} m²</p>
                <p className="text-ivory/50 text-sm font-light leading-relaxed mb-4 line-clamp-2">{room.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-gold font-display text-lg">From ${room.price}<span className="text-ivory/30 text-xs font-sans">/night</span></span>
                  <span className="text-[10px] text-ivory/40 tracking-[0.15em] uppercase flex items-center gap-1 group-hover:text-gold transition-colors">
                    Explore <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button variant="secondary" href="/rooms">View All Rooms</Button>
          </div>
        </div>
      </section>

      {/* Dining */}
      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Culinary"
            title="The Dining Experience"
            subtitle="A symphony of flavors in settings designed for memorable occasions."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {featuredRestaurants.map((restaurant) => (
              <Link key={restaurant.id} to="/dining" className="group">
                <div className="relative aspect-[4/3] overflow-hidden mb-5">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-primary/60 backdrop-blur-sm text-[10px] text-gold font-semibold tracking-[0.15em] uppercase">{restaurant.type}</span>
                  </div>
                </div>
                <h3 className="font-display text-xl sm:text-2xl text-ivory font-semibold mb-2 group-hover:text-gold transition-colors">{restaurant.name}</h3>
                <p className="text-ivory/40 text-xs mb-3">{restaurant.cuisine} · {restaurant.hours}</p>
                <p className="text-ivory/50 text-sm font-light leading-relaxed line-clamp-2">{restaurant.description}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button variant="secondary" href="/dining">Explore Dining</Button>
          </div>
        </div>
      </section>

      {/* Wellness */}
      <section className="py-24 sm:py-32 px-6 bg-surface/50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="order-2 md:order-1">
            <p className="text-gold text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase mb-4">Wellness & Spa</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ivory leading-tight mb-6">
              Restore. Rebalance. Renew.
            </h2>
            <div className="w-16 h-[1px] bg-gold/30 mb-6" />
            <p className="text-ivory/50 text-sm sm:text-base font-light leading-relaxed mb-6">
              Our wellness sanctuary offers a comprehensive range of treatments designed to nurture body and soul. From invigorating massages to rejuvenating facials, each experience is crafted to restore your natural equilibrium.
            </p>
            <div className="space-y-3 mb-8">
              {wellnessServices[0].services.slice(0, 3).map((service) => (
                <div key={service.name} className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <p className="text-ivory text-sm font-medium">{service.name}</p>
                    <p className="text-ivory/30 text-xs">{service.duration}</p>
                  </div>
                  <span className="text-gold text-sm">${service.price}</span>
                </div>
              ))}
            </div>
            <Button variant="secondary" href="/wellness">Discover Wellness</Button>
          </div>
          <div className="order-1 md:order-2 relative aspect-[3/4] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db85b?w=800&q=80"
              alt="Spa treatment"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
          </div>
        </div>
      </section>

      {/* Experiences */}
      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Curated"
            title="Experiences"
            subtitle="Bespoke moments crafted to create lasting memories."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {featuredExperiences.map((exp) => (
              <Link key={exp.id} to={`/experiences/${exp.id}`} className="group">
                <div className="relative aspect-[4/3] overflow-hidden mb-5">
                  <img
                    src={exp.image}
                    alt={exp.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-primary/60 backdrop-blur-sm text-[10px] text-gold font-semibold tracking-[0.15em] uppercase">{exp.category}</span>
                  </div>
                </div>
                <h3 className="font-display text-xl sm:text-2xl text-ivory font-semibold mb-2 group-hover:text-gold transition-colors">{exp.name}</h3>
                <p className="text-ivory/40 text-xs mb-3">{exp.duration} · From ${exp.price}</p>
                <p className="text-ivory/50 text-sm font-light leading-relaxed line-clamp-2">{exp.description}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button variant="secondary" href="/experiences">All Experiences</Button>
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="py-24 sm:py-32 px-6 bg-surface/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Celebrations"
            title="Events & Meetings"
            subtitle="Extraordinary venues for extraordinary occasions."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.id} className="bg-primary border border-white/5 p-8 hover:border-gold/20 transition-colors duration-300">
                <h3 className="font-display text-xl sm:text-2xl text-ivory font-semibold mb-4">{event.name}</h3>
                <p className="text-ivory/50 text-sm font-light leading-relaxed mb-6">{event.description}</p>
                <ul className="space-y-2 mb-6">
                  {event.venues.slice(0, 3).map((v) => (
                    <li key={v} className="text-ivory/30 text-xs flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-gold/60" /> {v}
                    </li>
                  ))}
                </ul>
                <Link to="/events" className="text-[10px] text-gold tracking-[0.15em] uppercase font-semibold hover:text-gold-light transition-colors flex items-center gap-1">
                  Plan Your Event <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            eyebrow="Guest Voices"
            title="What Our Guests Say"
          />
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-surface/50 border border-white/5 p-6 sm:p-8">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-3 h-3 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-ivory/60 text-sm font-light leading-relaxed italic mb-6">"{t.text}"</p>
                <div>
                  <p className="text-ivory text-sm font-medium">{t.author}</p>
                  <p className="text-ivory/30 text-xs">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-24 sm:py-32 px-6 bg-surface/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Gallery"
            title="Visual Journey"
            subtitle="Glimpses of the Adama experience."
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {galleryImages.slice(0, 8).map((img, i) => (
              <Link
                key={i}
                to="/gallery"
                className={`relative overflow-hidden group ${i === 0 || i === 5 ? 'md:col-span-2 md:row-span-2' : ''}`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i === 0 || i === 5 ? 'aspect-square' : 'aspect-[4/3]'}`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300" />
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button variant="secondary" href="/gallery">View Full Gallery</Button>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-gold text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase mb-4">Location</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ivory leading-tight mb-6">
              Find Us
            </h2>
            <div className="w-16 h-[1px] bg-gold/30 mb-6" />
            <div className="space-y-4 text-ivory/50 text-sm font-light">
              <p className="flex items-start gap-3"><MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" /> {hotel.address}</p>
              <p className="flex items-center gap-3"><Phone className="w-4 h-4 text-gold shrink-0" /> {hotel.phone}</p>
              <p className="flex items-center gap-3">
                <span className="w-4 h-4 text-gold shrink-0 text-center text-xs">✦</span>
                {hotel.email}
              </p>
            </div>
            <Button variant="secondary" href="/contact" className="mt-8">Contact Us</Button>
          </div>
          <div className="aspect-[4/3] bg-surface border border-white/5 flex items-center justify-center">
            <div className="text-center text-ivory/20">
              <MapPin className="w-8 h-8 mx-auto mb-3" />
              <p className="text-xs">Map Integration</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="py-24 sm:py-32 px-6 bg-forest text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-gold text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase mb-4">Reservations</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ivory leading-tight mb-6">
            Book Your Stay
          </h2>
          <p className="text-ivory/50 text-sm sm:text-base font-light leading-relaxed mb-10">
            Begin your journey at Adama Hotel. Select your dates, choose your room, and let us prepare an unforgettable experience.
          </p>
          <Button variant="primary" href="/booking" size="lg">Reserve Now</Button>
        </div>
      </section>
    </div>
  );
}
