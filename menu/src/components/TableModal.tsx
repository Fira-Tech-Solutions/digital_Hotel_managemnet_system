import { useState, FormEvent } from 'react';
import { X, Check, MapPin, BedDouble } from 'lucide-react';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTable: string;
  currentSuite: string;
  onSave: (table: string, suite: string) => void;
}

export function TableModal({
  isOpen,
  onClose,
  currentTable,
  currentSuite,
  onSave,
}: TableModalProps) {
  if (!isOpen) return null;

  const [table, setTable] = useState(currentTable);
  const [suite, setSuite] = useState(currentSuite);

  const predefinedTables = [
    'Table 12',
    'Table 4 (Terrace)',
    'Table 8 (Chef Counter)',
    'Table 16 (Private Salon)',
    'Booth 3 (Alcove)',
  ];

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    onSave(table, suite);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm bg-[#14110e] border border-[#382d20] rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[#29221a] pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#e5be52]" />
            <h3 className="font-serif-luxury text-xl font-bold text-[#f5ebd6]">
              Table & Suite Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#1e1914] text-[#a89884] hover:text-white flex items-center justify-center border border-[#332b21]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Table Selection */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold tracking-wider text-[#d4af37] uppercase font-sans">
              Select Dining Table
            </label>
            <div className="space-y-1.5">
              {predefinedTables.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTable(t)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                    table === t
                      ? 'bg-[#292015] border-[#e5be52] text-[#f7e096]'
                      : 'bg-[#181410] border-[#2d261e] text-[#a89985] hover:border-[#42372a]'
                  }`}
                >
                  <span>{t}</span>
                  {table === t && <Check className="w-3.5 h-3.5 text-[#e5be52]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Suite Number Input */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-[11px] font-semibold tracking-wider text-[#d4af37] uppercase font-sans">
              Hotel Suite Folio
            </label>
            <div className="relative">
              <BedDouble className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7e6e]" />
              <input
                type="text"
                value={suite}
                onChange={(e) => setSuite(e.target.value)}
                placeholder="e.g. Suite 402, Penthouse B"
                className="w-full pl-10 pr-3 py-2.5 bg-[#181410] border border-[#2d261e] rounded-xl text-xs text-[#f0e8dc] focus:outline-none focus:border-[#e5be52]/80"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#1d1813] text-[#ab9a85] text-xs font-semibold uppercase tracking-wider border border-[#362c20]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#e5be52] hover:bg-[#f3cc5e] text-[#0e0d0b] text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
