import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Search, 
  Download, 
  Plus, 
  RefreshCw, 
  ExternalLink, 
  Printer, 
  Tablet, 
  Sparkles, 
  Smartphone, 
  Check, 
  X,
  MoreVertical
} from 'lucide-react';
import { TableQR } from '../types';
import { HotelLogo } from './HotelLogo';

interface QrCodeScreenProps {
  tables: TableQR[];
  onAddTable: (tableNumber: string, zone: TableQR['zone']) => void;
  onToggleTableStatus: (tableId: string) => void;
  onRegenerateQR: (tableId: string) => void;
  onOpenGuestPreviewForTable: (tableNumber: string) => void;
}

export const QrCodeScreen: React.FC<QrCodeScreenProps> = ({
  tables,
  onAddTable,
  onToggleTableStatus,
  onRegenerateQR,
  onOpenGuestPreviewForTable,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});
  const [selectedTableForModal, setSelectedTableForModal] = useState<TableQR | null>(null);
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);
  const [newTableNum, setNewTableNum] = useState('');
  const [newTableZone, setNewTableZone] = useState<TableQR['zone']>('MAIN DINING');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Generate real QR code image data for each table
  useEffect(() => {
    tables.forEach(async (t) => {
      if (t.codeGenerated) {
        try {
          const url = `${window.location.origin}?table=${encodeURIComponent(t.tableNumber)}`;
          const dataUrl = await QRCode.toDataURL(url, {
            width: 320,
            margin: 1.5,
            color: {
              dark: '#111827',
              light: '#FFFFFF',
            },
          });
          setQrDataUrls((prev) => ({ ...prev, [t.id]: dataUrl }));
        } catch (err) {
          console.error('Error generating QR:', err);
        }
      }
    });
  }, [tables]);

  const filteredTables = tables.filter((t) => 
    t.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.zone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadSingle = (table: TableQR) => {
    const dataUrl = qrDataUrls[table.id];
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `QR-${table.tableNumber.replace(/\s+/g, '-')}.png`;
    link.href = dataUrl;
    link.click();

    setDownloadSuccess(table.id);
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  const handleDownloadAll = () => {
    tables.forEach((t) => {
      if (t.codeGenerated && qrDataUrls[t.id]) {
        const link = document.createElement('a');
        link.download = `QR-${t.tableNumber.replace(/\s+/g, '-')}.png`;
        link.href = qrDataUrls[t.id];
        link.click();
      }
    });
  };

  const handleCreateNewTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTableNum.trim()) {
      onAddTable(newTableNum.trim(), newTableZone);
      setNewTableNum('');
      setIsAddTableModalOpen(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#121417] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            id="input-qr-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tables by number or zone (e.g. Table 01, Terrace)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-download-all-qrs"
            onClick={handleDownloadAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Download All</span>
          </button>

          <button
            id="btn-add-table"
            onClick={() => setIsAddTableModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add New Table</span>
          </button>
        </div>
      </div>

      {/* Grid of Table QR Cards matching Image 10.png */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTables.map((table) => {
          const isActive = table.status === 'Active' && table.codeGenerated;
          const qrImage = qrDataUrls[table.id];

          return (
            <div
              key={table.id}
              id={`table-qr-card-${table.id}`}
              className={`rounded-2xl bg-[#16191F] border p-5 transition-all flex flex-col justify-between ${
                isActive 
                  ? 'border-slate-800/90 hover:border-amber-500/40 hover:shadow-xl' 
                  : 'border-dashed border-slate-800 opacity-75'
              }`}
            >
              {/* Card Top: Table Name, Zone Badge & 3-dot menu */}
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-slate-800/80">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {table.tableNumber}
                    </h3>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-slate-800 text-slate-300">
                      {table.zone}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {table.status}
                    </span>
                    <button 
                      onClick={() => onToggleTableStatus(table.id)}
                      className="p-1 text-slate-400 hover:text-white rounded"
                      title="Toggle Active/Inactive"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* QR Code Stand Visual Frame / Mockup Preview */}
                <div className="my-5 flex flex-col items-center justify-center">
                  {isActive && qrImage ? (
                    <div 
                      onClick={() => setSelectedTableForModal(table)}
                      className="relative p-3.5 bg-white rounded-2xl shadow-xl border-4 border-amber-500/40 cursor-pointer group transition-transform hover:scale-105"
                    >
                      {/* Luxury Gold Banner Top on Stand */}
                      <div className="text-center pb-1.5 border-b border-amber-200">
                        <span className="font-['Cinzel',serif] text-[9px] font-bold text-amber-900 tracking-wider uppercase block">
                          Adama Hotel
                        </span>
                        <span className="text-[8px] text-slate-600 block">
                          Scan to View Digital Menu
                        </span>
                      </div>

                      {/* Actual QR Image */}
                      <img 
                        src={qrImage} 
                        alt={`QR Code for ${table.tableNumber}`} 
                        className="w-36 h-36 mx-auto my-1 object-contain"
                      />

                      {/* Table Identifier in Stand Footer */}
                      <div className="text-center pt-1 border-t border-amber-200">
                        <span className="text-[10px] font-bold text-slate-900">
                          {table.tableNumber}
                        </span>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-slate-950/70 rounded-xl flex items-center justify-center transition-opacity text-white text-xs font-semibold">
                        Click to Enlarge / Test
                      </div>
                    </div>
                  ) : (
                    /* Inactive dashed box matching Table 04 in Image 10.png */
                    <div className="h-44 w-44 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-4 text-center">
                      <Smartphone className="w-8 h-8 text-slate-600 mb-2" />
                      <span className="text-xs text-slate-400 font-medium">QR Code Inactive</span>
                      <button
                        onClick={() => onRegenerateQR(table.id)}
                        className="mt-3 px-3 py-1 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-amber-400"
                      >
                        + Generate Code
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: [PNG] and [Regenerate] */}
              {isActive && (
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDownloadSingle(table)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {downloadSuccess === table.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Saved!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>PNG</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onRegenerateQR(table.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
                    title="Regenerate QR Token"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenGuestPreviewForTable(table.tableNumber)}
                    className="py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    title="Test Guest Menu for this table"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Test</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Enlarged QR Stand Modal with Printable Template */}
      {selectedTableForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-[#161920] border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col items-center text-center relative">
            <button
              onClick={() => setSelectedTableForModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {selectedTableForModal.tableNumber} Stand Template
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              High resolution vector-rendered table placard with NFC / QR link
            </p>

            {/* Printable Frame */}
            <div className="w-64 p-6 bg-white rounded-2xl shadow-2xl border-4 border-amber-600/30 text-slate-900 mb-6">
              <HotelLogo variant="badge" size="sm" className="mb-2" />
              
              {qrDataUrls[selectedTableForModal.id] && (
                <img 
                  src={qrDataUrls[selectedTableForModal.id]} 
                  alt="QR Code" 
                  className="w-44 h-44 mx-auto rounded-lg"
                />
              )}

              <div className="mt-3 pt-2 border-t border-amber-200">
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-900 block">
                  {selectedTableForModal.tableNumber}
                </span>
                <span className="text-[10px] text-slate-600 font-medium block">
                  Scan for Food & Beverage Service
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => handleDownloadSingle(selectedTableForModal)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-700"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download Print File</span>
              </button>

              <button
                onClick={() => {
                  onOpenGuestPreviewForTable(selectedTableForModal.tableNumber);
                  setSelectedTableForModal(null);
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Smartphone className="w-4 h-4" />
                <span>Simulate Guest Scan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Table Modal */}
      {isAddTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-[#151921] border border-slate-700 rounded-2xl p-6 text-slate-200">
            <h3 className="text-base font-bold text-white mb-3">Add Dining Table</h3>
            <form onSubmit={handleCreateNewTable} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Table Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Table 07 or Cabana 01"
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Dining Zone</label>
                <select
                  value={newTableZone}
                  onChange={(e) => setNewTableZone(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="MAIN DINING">MAIN DINING</option>
                  <option value="TERRACE">TERRACE</option>
                  <option value="BAR AREA">BAR AREA</option>
                  <option value="VIP LOUNGE">VIP LOUNGE</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTableModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Create Table & QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
