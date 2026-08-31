import { Link, useParams } from 'react-router-dom';
import { Users, Maximize, BedDouble, Eye, ChevronRight } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import { rooms } from '../data/siteData';

export function RoomsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Accommodation"
        title="Rooms & Suites"
        subtitle="Each space has been thoughtfully designed to provide the ultimate in comfort and elegance."
        image="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80"
      />
      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <Link key={room.id} to={`/rooms/${room.id}`} className="group bg-surface border border-white/5 hover:border-gold/20 transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-primary/60 backdrop-blur-sm text-[10px] text-gold font-semibold tracking-[0.15em] uppercase">{room.type}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl text-ivory font-semibold mb-2 group-hover:text-gold transition-colors">{room.name}</h3>
                  <div className="flex items-center gap-4 text-ivory/30 text-xs mb-3">
                    <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" /> {room.bedType}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {room.capacity}</span>
                    <span className="flex items-center gap-1"><Maximize className="w-3 h-3" /> {room.size} m²</span>
                  </div>
                  <p className="text-ivory/50 text-sm font-light leading-relaxed mb-4 line-clamp-2">{room.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-gold font-display text-lg">From ${room.price}<span className="text-ivory/30 text-xs font-sans">/night</span></span>
                    <span className="text-[10px] text-ivory/40 tracking-[0.15em] uppercase flex items-center gap-1 group-hover:text-gold transition-colors">
                      Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 sm:py-32 px-6 bg-surface/50 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ivory mb-6">Need Help Choosing?</h2>
          <p className="text-ivory/50 text-sm font-light leading-relaxed mb-8">Our reservations team is available 24/7 to help you find the perfect room for your stay.</p>
          <Button variant="secondary" href="/contact">Contact Reservations</Button>
        </div>
      </section>
    </div>
  );
}

export function RoomDetailPage() {
  const { id } = useParams();
  const room = rooms.find((r) => r.id === id);

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl text-ivory mb-4">Room Not Found</h1>
          <Button variant="secondary" href="/rooms">View All Rooms</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Gallery */}
      <section className="h-[60vh] min-h-[400px] relative overflow-hidden">
        <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/30 to-transparent" />
        <div className="absolute bottom-8 left-6 right-6 max-w-7xl mx-auto">
          <span className="text-gold text-[10px] font-semibold tracking-[0.3em] uppercase">{room.type}</span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ivory font-semibold mt-2">{room.name}</h1>
        </div>
      </section>

      {/* Details */}
      <section className="py-16 sm:py-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12">
          {/* Main */}
          <div className="lg:col-span-2">
            <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-white/5">
              <div className="flex items-center gap-2 text-ivory/50 text-sm"><BedDouble className="w-4 h-4 text-gold" /> {room.bedType}</div>
              <div className="flex items-center gap-2 text-ivory/50 text-sm"><Users className="w-4 h-4 text-gold" /> {room.capacity} Guests</div>
              <div className="flex items-center gap-2 text-ivory/50 text-sm"><Maximize className="w-4 h-4 text-gold" /> {room.size} m²</div>
              <div className="flex items-center gap-2 text-ivory/50 text-sm"><Eye className="w-4 h-4 text-gold" /> {room.view}</div>
            </div>
            <h2 className="font-display text-2xl text-ivory font-semibold mb-4">About This Room</h2>
            <p className="text-ivory/50 text-sm font-light leading-relaxed mb-8">{room.longDescription}</p>
            <p className="text-ivory/30 text-xs mb-6">Floor: {room.floor}</p>

            <h3 className="font-display text-xl text-ivory font-semibold mb-4">Amenities</h3>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {room.amenities.map((a) => (
                <div key={a} className="flex items-center gap-2 text-ivory/50 text-sm">
                  <span className="w-1 h-1 rounded-full bg-gold" /> {a}
                </div>
              ))}
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-white/5 p-6 sm:p-8 sticky top-24">
              <div className="mb-6">
                <span className="text-gold font-display text-3xl">${room.price}</span>
                <span className="text-ivory/30 text-sm ml-1">/ night</span>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-ivory/40">Check-in</span>
                  <span className="text-ivory/70">From 15:00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ivory/40">Check-out</span>
                  <span className="text-ivory/70">Until 11:00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ivory/40">Cancellation</span>
                  <span className="text-ivory/70">Free up to 24h</span>
                </div>
              </div>
              <Button variant="primary" href="/booking" className="w-full">Book This Room</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Similar rooms */}
      <section className="py-16 sm:py-24 px-6 bg-surface/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="More Options" title="Similar Rooms" />
          <div className="grid md:grid-cols-3 gap-8">
            {rooms.filter((r) => r.id !== room.id).slice(0, 3).map((r) => (
              <Link key={r.id} to={`/rooms/${r.id}`} className="group">
                <div className="relative aspect-[4/3] overflow-hidden mb-4">
                  <img src={r.images[0]} alt={r.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                </div>
                <h3 className="font-display text-lg text-ivory font-semibold group-hover:text-gold transition-colors">{r.name}</h3>
                <p className="text-gold text-sm mt-1">From ${r.price}/night</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
