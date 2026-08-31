import { useState, FormEvent } from 'react';
import { Wine, Droplets, Sparkles, Car, ReceiptText, Bell, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { ConciergeRequest } from '../types';

interface ConciergeViewProps {
  tableNumber: string;
  suiteNumber: string;
  requests: ConciergeRequest[];
  onSendRequest: (type: string, title: string, details?: string) => void;
}

export function ConciergeView({
  tableNumber,
  suiteNumber,
  requests,
  onSendRequest,
}: ConciergeViewProps) {
  const [customNote, setCustomNote] = useState('');
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  const handleQuickRequest = (type: string, title: string, details?: string) => {
    onSendRequest(type, title, details);
    setSentNotice(`Request dispatched: ${title}`);
    setTimeout(() => setSentNotice(null), 3500);
  };

  const handleCustomSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!customNote.trim()) return;
    onSendRequest('custom', 'Custom Table Request', customNote.trim());
    setCustomNote('');
    setSentNotice('Your request has been routed to your dedicated host.');
    setTimeout(() => setSentNotice(null), 3500);
  };

  const serviceButtons = [
    {
      id: 'sommelier',
      title: 'Call Sommelier',
      desc: 'Wine pairing advice & cellar selections',
      icon: Wine,
      action: () => handleQuickRequest('sommelier', 'Sommelier Visit', 'Guest requested wine recommendation'),
    },
    {
      id: 'water',
      title: 'Refresh Table Water',
      desc: 'Still Acqua Panna or Sparkling San Pellegrino',
      icon: Droplets,
      action: () => handleQuickRequest('water', 'Water Service', 'Still & Sparkling water refresh'),
    },
    {
      id: 'cutlery',
      title: 'Fresh Silverware',
      desc: 'Clean cutlery, linen napkins, or bread plate',
      icon: Sparkles,
      action: () => handleQuickRequest('cutlery', 'Cutlery Refresh', 'Silverware and hot towel service'),
    },
    {
      id: 'bill',
      title: 'Request Bill to Suite',
      desc: `Settle final folio to ${suiteNumber}`,
      icon: ReceiptText,
      action: () => handleQuickRequest('bill', 'Final Bill', `Direct folio charge to ${suiteNumber}`),
    },
    {
      id: 'valet',
      title: 'Retrieve Valet Vehicle',
      desc: 'Notify hotel valet service to bring your vehicle',
      icon: Car,
      action: () => handleQuickRequest('valet', 'Valet Vehicle Retrieval', 'Vehicle ready at hotel porte-cochère'),
    },
  ];

  return (
    <div
      id="adama-concierge-view"
      className="min-h-screen pb-32 pt-3 px-4 max-w-md mx-auto space-y-5"
    >
      {/* Title */}
      <div className="pt-2">
        <h2 className="font-serif-luxury text-3xl font-bold text-[#f7eedc] tracking-tight">
          Table Concierge
        </h2>
        <p className="text-xs text-[#9e8f7c] mt-1 font-sans">
          Discrete, instantaneous hospitality for {tableNumber} • {suiteNumber}
        </p>
      </div>

      {/* Dispatched Notification Toast */}
      {sentNotice && (
        <div className="p-3 rounded-xl bg-[#292014] border border-[#e5be52]/60 text-xs text-[#f7e096] flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#e5be52] shrink-0" />
          <span>{sentNotice}</span>
        </div>
      )}

      {/* Quick Services Grid */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-semibold tracking-wider text-[#d4af37] uppercase font-sans">
          Instant Table Services
        </h3>

        <div className="space-y-2.5">
          {serviceButtons.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                onClick={btn.action}
                className="w-full p-4 rounded-2xl bg-[#161310] hover:bg-[#201a14] active:scale-[0.99] border border-[#2b251d] hover:border-[#4d3e2a] text-left flex items-center justify-between gap-3.5 transition-all shadow-md group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#221c15] border border-[#382d1f] flex items-center justify-center text-[#e5be52] shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <div>
                    <h4 className="font-serif-luxury text-base font-bold text-[#f5ebd6] group-hover:text-[#f8df95] transition-colors leading-tight">
                      {btn.title}
                    </h4>
                    <p className="text-[11px] text-[#918270] mt-0.5 font-sans">
                      {btn.desc}
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-[#201b15] flex items-center justify-center text-[#998772] group-hover:text-[#e5be52] group-hover:bg-[#2e2417] transition-colors">
                  <Bell className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Note to Host */}
      <div className="p-4 rounded-2xl bg-[#161310] border border-[#2b251d] space-y-3 shadow-lg">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#e5c365]" />
          <h3 className="text-[11px] font-semibold tracking-wider text-[#d4af37] uppercase font-sans">
            Bespoke Request to Butler
          </h3>
        </div>

        <form onSubmit={handleCustomSubmit} className="space-y-3">
          <textarea
            rows={2}
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g. Can we dim our table lamp slightly, or prepare birthday candle for dessert..."
            className="w-full p-3 bg-[#110e0c] border border-[#2d261e] rounded-xl text-xs text-[#eae2d5] placeholder-[#6e6354] focus:outline-none focus:border-[#d4af37]/60 resize-none font-sans"
          />
          <button
            type="submit"
            disabled={!customNote.trim()}
            className="w-full py-2.5 rounded-xl bg-[#241e17] hover:bg-[#332a1e] disabled:opacity-40 text-[#f5ebd6] text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2 border border-[#403423]"
          >
            <Send className="w-3.5 h-3.5 text-[#e5be52]" />
            <span>Transmit Request</span>
          </button>
        </form>
      </div>

      {/* Recent Dispatched Activity */}
      {requests.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#161310] border border-[#2b251d] space-y-3">
          <h3 className="text-[11px] font-semibold tracking-wider text-[#a3937f] uppercase font-sans">
            Active Service Tickets
          </h3>
          <div className="space-y-2">
            {requests.slice(-3).reverse().map((req) => (
              <div
                key={req.id}
                className="p-2.5 rounded-xl bg-[#1b1713] border border-[#2d251c] flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-medium text-[#e8dfd1]">{req.title}</p>
                  <p className="text-[10px] text-[#8c7e6c]">{req.timestamp}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#332717] text-[#e5be52] text-[10px] font-medium border border-[#594426]/60">
                  {req.status === 'sent' ? 'Dispatched' : 'In Progress'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
