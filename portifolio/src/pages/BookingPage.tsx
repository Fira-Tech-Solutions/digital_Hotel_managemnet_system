import { useState } from 'react';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Button } from '../components/ui/Button';
import { rooms, hotel } from '../data/siteData';

const steps = ['Dates', 'Room', 'Details', 'Review'];

export default function BookingPage() {
  const [step, setStep] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    checkIn: '', checkOut: '', guests: '2', firstName: '', lastName: '', email: '', phone: '', notes: '',
  });

  const selectedRoomData = rooms.find((r) => r.id === selectedRoom);

  const updateForm = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <PageHero
        eyebrow="Reservations"
        title="Book Your Stay"
        subtitle="Begin your journey at Adama Hotel."
      />

      <section className="py-16 sm:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-12">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 sm:gap-4">
                <div className={`flex items-center gap-2 ${i <= step ? 'text-gold' : 'text-ivory/20'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border ${
                    i < step ? 'bg-gold text-primary border-gold' : i === step ? 'border-gold text-gold' : 'border-white/10 text-ivory/20'
                  }`}>
                    {i < step ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className="text-xs font-medium tracking-wider uppercase hidden sm:block">{s}</span>
                </div>
                {i < steps.length - 1 && <div className={`w-8 sm:w-16 h-[1px] ${i < step ? 'bg-gold' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="bg-surface border border-white/5 p-6 sm:p-10">
            {step === 0 && (
              <div className="space-y-6">
                <h3 className="font-display text-xl text-ivory font-semibold mb-4">Select Your Dates</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-ivory/40 tracking-wider uppercase mb-2">Check-in Date</label>
                    <input type="date" value={formData.checkIn} onChange={(e) => updateForm('checkIn', e.target.value)}
                      className="w-full bg-primary border border-white/10 px-4 py-3 text-sm text-ivory focus:outline-none focus:border-gold/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-ivory/40 tracking-wider uppercase mb-2">Check-out Date</label>
                    <input type="date" value={formData.checkOut} onChange={(e) => updateForm('checkOut', e.target.value)}
                      className="w-full bg-primary border border-white/10 px-4 py-3 text-sm text-ivory focus:outline-none focus:border-gold/50 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-ivory/40 tracking-wider uppercase mb-2">Number of Guests</label>
                  <select value={formData.guests} onChange={(e) => updateForm('guests', e.target.value)}
                    className="w-full bg-primary border border-white/10 px-4 py-3 text-sm text-ivory focus:outline-none focus:border-gold/50 transition-colors">
                    {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h3 className="font-display text-xl text-ivory font-semibold mb-6">Choose Your Room</h3>
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room.id)}
                      className={`w-full flex items-center gap-4 sm:gap-6 p-4 border text-left transition-all duration-300 ${
                        selectedRoom === room.id
                          ? 'border-gold bg-gold/5'
                          : 'border-white/5 bg-primary hover:border-white/20'
                      }`}
                    >
                      <img src={room.images[0]} alt={room.name} className="w-20 h-16 object-cover shrink-0" loading="lazy" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-ivory text-sm font-medium">{room.name}</h4>
                        <p className="text-ivory/30 text-xs mt-0.5">{room.bedType} · {room.size}m² · Up to {room.capacity} guests</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-gold font-display text-lg">${room.price}</p>
                        <p className="text-ivory/20 text-xs">/night</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="font-display text-xl text-ivory font-semibold mb-4">Guest Information</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-ivory/40 tracking-wider uppercase mb-2">First Name</label>
                    <input type="text" value={formData.firstName} onChange={(e) => updateForm('firstName', e.target.value)}
                      className="w-full bg-primary border border-white/10 px-4 py-3 text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold/50 transition-colors" placeholder="First name" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-ivory/40 tracking-wider uppercase mb-2">Last Name</label>
                    <input type="text" value={formData.lastName} onChange={(e) => updateForm('lastName', e.target.value)}
                      className="w-full bg-primary border border-white/10 px-4 py-3 text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold/50 transition-colors" placeholder="Last name" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-ivory/40 tracking-wider uppercase mb-2">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => updateForm('email', e.target.value)}
                    className="w-full bg-primary border border-white/10 px-4 py-3 text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold/50 transition-colors" placeholder="Email address" />
                </div>
                <div>
                  <label className="block text-[10px] text-ivory/40 tracking-wider uppercase mb-2">Phone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => updateForm('phone', e.target.value)}
                    className="w-full bg-primary border border-white/10 px-4 py-3 text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold/50 transition-colors" placeholder="Phone number" />
                </div>
                <div>
                  <label className="block text-[10px] text-ivory/40 tracking-wider uppercase mb-2">Special Requests</label>
                  <textarea value={formData.notes} onChange={(e) => updateForm('notes', e.target.value)} rows={3}
                    className="w-full bg-primary border border-white/10 px-4 py-3 text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold/50 transition-colors resize-none" placeholder="Any special requests or preferences..." />
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 className="font-display text-xl text-ivory font-semibold mb-6">Review Your Booking</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-ivory/40 text-sm">Check-in</span>
                    <span className="text-ivory text-sm">{formData.checkIn || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-ivory/40 text-sm">Check-out</span>
                    <span className="text-ivory text-sm">{formData.checkOut || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-ivory/40 text-sm">Guests</span>
                    <span className="text-ivory text-sm">{formData.guests}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-ivory/40 text-sm">Room</span>
                    <span className="text-ivory text-sm">{selectedRoomData?.name || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-ivory/40 text-sm">Guest</span>
                    <span className="text-ivory text-sm">{formData.firstName} {formData.lastName}</span>
                  </div>
                  {selectedRoomData && (
                    <div className="flex justify-between py-3">
                      <span className="text-ivory/40 text-sm">Estimated Total</span>
                      <span className="text-gold font-display text-xl">${selectedRoomData.price} <span className="text-ivory/30 text-xs font-sans">/night</span></span>
                    </div>
                  )}
                </div>
                <div className="bg-primary border border-gold/20 p-4 text-center">
                  <p className="text-ivory/40 text-xs">This is a demo booking flow. No real reservation will be made.</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
              {step > 0 ? (
                <Button variant="ghost" onClick={() => setStep(step - 1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              ) : <div />}
              {step < steps.length - 1 ? (
                <Button variant="primary" onClick={() => setStep(step + 1)}>
                  Continue <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button variant="primary">Confirm Reservation</Button>
              )}
            </div>
          </div>

          <p className="text-center text-ivory/20 text-xs mt-8">
            For immediate assistance, call <a href={`tel:${hotel.phone}`} className="text-gold hover:text-gold-light transition-colors">{hotel.phone}</a>
          </p>
        </div>
      </section>
    </div>
  );
}
