import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import { hotel } from '../data/siteData';

export default function ContactPage() {
  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title="Get in Touch"
        subtitle="Our team is available around the clock to assist with reservations, inquiries, and special requests."
        image="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80"
      />
      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <SectionHeader eyebrow="Reach Us" title="Contact Information" align="left" />
            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-ivory text-sm font-medium mb-1">Address</p>
                  <p className="text-ivory/40 text-sm">{hotel.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-ivory text-sm font-medium mb-1">Phone</p>
                  <a href={`tel:${hotel.phone}`} className="text-ivory/40 text-sm hover:text-gold transition-colors">{hotel.phone}</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-ivory text-sm font-medium mb-1">Email</p>
                  <a href={`mailto:${hotel.email}`} className="text-ivory/40 text-sm hover:text-gold transition-colors">{hotel.email}</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-ivory text-sm font-medium mb-1">Reception</p>
                  <p className="text-ivory/40 text-sm">Open 24 Hours, 7 Days a Week</p>
                </div>
              </div>
            </div>
            <div className="aspect-[4/3] bg-surface border border-white/5 flex items-center justify-center">
              <div className="text-center text-ivory/20">
                <MapPin className="w-8 h-8 mx-auto mb-3" />
                <p className="text-xs">Map Integration</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <SectionHeader eyebrow="Message" title="Send Us a Message" align="left" />
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="First Name" required className="w-full bg-surface border border-white/10 px-4 py-3 text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold/50 transition-colors" />
                <input type="text" placeholder="Last Name" required className="w-full bg-surface border border-white/10 px-4 py-3 text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold/50 transition-colors" />
              </div>
              <input type="email" placeholder="Email Address" required className="w-full bg-surface border border-white/10 px-4 py-3 text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold/50 transition-colors" />
              <input type="tel" placeholder="Phone Number" className="w-full bg-surface border border-white/10 px-4 py-3 text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold/50 transition-colors" />
              <select className="w-full bg-surface border border-white/10 px-4 py-3 text-sm text-ivory/70 focus:outline-none focus:border-gold/50 transition-colors">
                <option>Subject</option>
                <option>Reservation Inquiry</option>
                <option>General Inquiry</option>
                <option>Spa Booking</option>
                <option>Event Planning</option>
                <option>Feedback</option>
              </select>
              <textarea placeholder="Your Message" rows={5} required className="w-full bg-surface border border-white/10 px-4 py-3 text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold/50 transition-colors resize-none" />
              <Button variant="primary" className="w-full">Send Message</Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
