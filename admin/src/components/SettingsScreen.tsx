import React, { useState } from 'react';
import { 
  Building2, 
  Clock, 
  PhoneCall, 
  Globe, 
  Save, 
  RotateCcw, 
  Check, 
  Sparkles, 
  ShieldAlert,
  Languages,
  CheckCircle2
} from 'lucide-react';
import { HotelProfileConfig } from '../types';

interface SettingsScreenProps {
  hotelProfile: HotelProfileConfig;
  onSaveProfile: (profile: HotelProfileConfig) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  hotelProfile,
  onSaveProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'hours' | 'contact' | 'languages'>('profile');
  const [formData, setFormData] = useState<HotelProfileConfig>({ ...hotelProfile });
  const [saveToast, setSaveToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleDiscard = () => {
    setFormData({ ...hotelProfile });
  };

  const handleToggleDay = (dayIndex: number) => {
    const updated = [...formData.operatingHours];
    updated[dayIndex].isOpen = !updated[dayIndex].isOpen;
    setFormData({ ...formData, operatingHours: updated });
  };

  const handleHourChange = (dayIndex: number, field: 'openTime' | 'closeTime' | 'kitchenCutoff', val: string) => {
    const updated = [...formData.operatingHours];
    updated[dayIndex][field] = val;
    setFormData({ ...formData, operatingHours: updated });
  };

  const handleToggleLanguage = (code: string) => {
    const updated = formData.languages.map((l) => 
      l.code === code ? { ...l, isEnabled: !l.isEnabled } : l
    );
    setFormData({ ...formData, languages: updated });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#121417] text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 bg-[#111317]/50">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Hotel & Restaurant Settings
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure property profile, meal service schedules, guest menu locales, and reservation hotlines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveToast && (
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg animate-fadeIn flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Settings Saved & Synced!</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleDiscard}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Discard Changes</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile</span>
          </button>
        </div>
      </div>

      {/* Main split settings view matching Image 16.png */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Left Settings Tabs */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800/80 bg-[#14181F] p-4 flex flex-col space-y-1.5 overflow-y-auto">
          <button
            id="tab-btn-profile"
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Hotel Profile</span>
          </button>

          <button
            id="tab-btn-hours"
            onClick={() => setActiveTab('hours')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'hours'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Operating Hours</span>
          </button>

          <button
            id="tab-btn-contact"
            onClick={() => setActiveTab('contact')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'contact'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Contact Info</span>
          </button>

          <button
            id="tab-btn-languages"
            onClick={() => setActiveTab('languages')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'languages'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>Guest Menu Languages</span>
          </button>
        </div>

        {/* Right Settings Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* TAB 1: HOTEL PROFILE (Matches Image 16.png) */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Adama Hotel Profile
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure your property details, branding tagline, and official address.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Hotel & Restaurant Name
                  </label>
                  <input
                    type="text"
                    id="setting-hotel-name"
                    value={formData.hotelName}
                    onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Brand Slogan / Tagline
                  </label>
                  <input
                    type="text"
                    id="setting-slogan"
                    value={formData.slogan}
                    onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Primary Address
                  </label>
                  <textarea
                    rows={3}
                    id="setting-address"
                    value={formData.primaryAddress}
                    onChange={(e) => setFormData({ ...formData, primaryAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Official Website URL
                  </label>
                  <input
                    type="url"
                    id="setting-website"
                    value={formData.officialWebsite}
                    onChange={(e) => setFormData({ ...formData, officialWebsite: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OPERATING HOURS */}
          {activeTab === 'hours' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Operating Hours & Kitchen Cutoff
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Define daily dining room openings and kitchen last-call order cutoffs.
                </p>
              </div>

              <div className="rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg overflow-hidden divide-y divide-slate-800/80">
                {formData.operatingHours.map((schedule, idx) => (
                  <div key={schedule.day} className="p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-32">
                      <button
                        onClick={() => handleToggleDay(idx)}
                        className={`w-8 h-4 rounded-full transition-colors relative ${
                          schedule.isOpen ? 'bg-amber-500' : 'bg-slate-700'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-slate-950 transition-all ${
                          schedule.isOpen ? 'right-0.5' : 'left-0.5'
                        }`} />
                      </button>
                      <span className={`text-xs font-bold ${schedule.isOpen ? 'text-white' : 'text-slate-500'}`}>
                        {schedule.day}
                      </span>
                    </div>

                    {schedule.isOpen ? (
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-700">
                          <span className="text-[10px] text-slate-400">Open:</span>
                          <input
                            type="text"
                            value={schedule.openTime}
                            onChange={(e) => handleHourChange(idx, 'openTime', e.target.value)}
                            className="w-20 bg-transparent text-white focus:outline-none font-mono"
                          />
                        </div>

                        <span className="text-slate-600">-</span>

                        <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-700">
                          <span className="text-[10px] text-slate-400">Close:</span>
                          <input
                            type="text"
                            value={schedule.closeTime}
                            onChange={(e) => handleHourChange(idx, 'closeTime', e.target.value)}
                            className="w-20 bg-transparent text-white focus:outline-none font-mono"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20">
                          <span className="text-[10px] text-amber-400 font-bold">Kitchen Last Call:</span>
                          <input
                            type="text"
                            value={schedule.kitchenCutoff}
                            onChange={(e) => handleHourChange(idx, 'kitchenCutoff', e.target.value)}
                            className="w-20 bg-transparent text-amber-300 focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                        Closed for Service
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT INFO */}
          {activeTab === 'contact' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Hotlines & Inquiries
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Emergency contact channels and concierge reservation numbers.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Reservations Phone Line
                  </label>
                  <input
                    type="text"
                    value={formData.contactInfo.reservationsPhone}
                    onChange={(e) => setFormData({
                      ...formData,
                      contactInfo: { ...formData.contactInfo, reservationsPhone: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Concierge Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactInfo.conciergeEmail}
                    onChange={(e) => setFormData({
                      ...formData,
                      contactInfo: { ...formData.contactInfo, conciergeEmail: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Emergency Duty Manager Contact
                  </label>
                  <input
                    type="text"
                    value={formData.contactInfo.emergencyManager}
                    onChange={(e) => setFormData({
                      ...formData,
                      contactInfo: { ...formData.contactInfo, emergencyManager: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Official Social Handle (@)
                  </label>
                  <input
                    type="text"
                    value={formData.contactInfo.socialHandle}
                    onChange={(e) => setFormData({
                      ...formData,
                      contactInfo: { ...formData.contactInfo, socialHandle: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LANGUAGES */}
          {activeTab === 'languages' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Guest Digital Menu Languages
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enable international translations for foreign guests scanning table QR codes.
                </p>
              </div>

              <div className="rounded-2xl bg-[#16191F] border border-slate-800/90 shadow-lg divide-y divide-slate-800/80">
                {formData.languages.map((lang) => (
                  <div key={lang.code} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{lang.flag}</span>
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          {lang.name}
                          {lang.isDefault && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                              Default
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-mono">
                          Locale: {lang.code}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleLanguage(lang.code)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                        lang.isEnabled
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                    >
                      {lang.isEnabled ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
