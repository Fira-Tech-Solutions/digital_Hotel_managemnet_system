import React, { useState, useEffect, useCallback } from 'react';
import {
  Hotel,
  ChefHat,
  Wine,
  Bed,
  Settings,
  Wifi,
  AlertCircle,
  Delete,
  Check,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/api';

interface StationLoginProps {
  onLogin?: () => void;
}

const STATIONS = [
  { id: 'kitchen', label: 'Kitchen Operations', code: 'KITCHEN-01', icon: ChefHat, color: '#B08D57' },
  { id: 'bar', label: 'Bar Operations', code: 'BAR-02', icon: Wine, color: '#e8c086' },
  { id: 'housekeeping', label: 'Housekeeping', code: 'FLR-04', icon: Bed, color: '#cbc5c0' },
  { id: 'frontdesk', label: 'Front Desk', code: 'FRONT-01', icon: Hotel, color: '#B08D57' },
];

export const StationLogin: React.FC<StationLoginProps> = ({ onLogin }) => {
  const { pinLogin } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStation, setSelectedStation] = useState(STATIONS[0]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hotelName, setHotelName] = useState('Adama Hotel');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    apiRequest<{ name: string }>('/api/public/hotel')
      .then((data) => setHotelName(data.name))
      .catch(() => {});
  }, []);

  const handleLogin = async (pinValue: string) => {
    setIsLoading(true);
    setError('');
    try {
      const hotel = await apiRequest<{ id: string }>('/api/public/hotel');
      await pinLogin(pinValue, hotel.id);
      onLogin?.();
    } catch (err: any) {
      setError(err.message || 'Invalid PIN');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinInput = useCallback((digit: string) => {
    setPin((prev) => {
      if (prev.length >= 4) return prev;
      const newPin = prev + digit;
      setError('');
      if (newPin.length === 4) {
        setTimeout(() => handleLogin(newPin), 300);
      }
      return newPin;
    });
  }, []);

  const handlePinBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') handlePinInput(e.key);
    else if (e.key === 'Backspace') handlePinBackspace();
    else if (e.key === 'Enter' && pin.length === 4) handleLogin(pin);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden select-none"
      style={{
        background: '#1C1A17',
        fontFamily: "'Manrope', sans-serif",
        color: '#fdf8f7',
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Background radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(230,226,224,0.3) 0%, transparent 70%)',
        }}
      />

      <main className="relative z-10 w-full max-w-[600px] px-6 md:px-10 flex flex-col items-center">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
            style={{
              border: '1px solid rgba(253,248,247,0.1)',
              color: '#B08D57',
            }}
          >
            <StationIcon station={selectedStation} />
          </div>
          <h1
            className="uppercase mb-1"
            style={{
              fontSize: '12px',
              lineHeight: '16px',
              letterSpacing: '0.2em',
              fontWeight: 700,
              color: 'rgba(230,226,224,0.8)',
            }}
          >
            {selectedStation.label}
          </h1>
          <h2
            className="px-3 py-1 rounded-full"
            style={{
              fontSize: '14px',
              lineHeight: '20px',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: '#a07e4a',
              border: '1px solid rgba(160,126,74,0.3)',
              background: 'rgba(160,126,74,0.1)',
            }}
          >
            STATION {selectedStation.code}
          </h2>
        </div>

        {/* PIN Display */}
        <div className="flex space-x-6 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="transition-all duration-200"
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '2px solid',
                borderColor: i < pin.length ? '#B08D57' : 'rgba(253,248,247,0.3)',
                background: i < pin.length ? '#B08D57' : 'transparent',
              }}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 mb-4 text-xs" style={{ color: '#ba1a1a' }}>
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center gap-2 mb-4 text-xs" style={{ color: '#B08D57' }}>
            <div
              className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
              style={{ borderColor: '#B08D57', borderTopColor: 'transparent' }}
            />
            Authenticating...
          </div>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-[320px] mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(50);
                handlePinInput(digit);
              }}
              className="h-16 flex items-center justify-center transition-colors duration-150"
              style={{
                border: '1px solid rgba(253,248,247,0.1)',
                borderRadius: '8px',
                fontSize: '24px',
                lineHeight: '1.2',
                fontWeight: 500,
                color: '#fdf8f7',
                background: 'transparent',
                fontFamily: "'Playfair Display', serif",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(230,226,224,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              onMouseDown={(e) => (e.currentTarget.style.background = 'rgba(230,226,224,0.2)')}
              onMouseUp={(e) => (e.currentTarget.style.background = 'rgba(230,226,224,0.1)')}
            >
              {digit}
            </button>
          ))}
          {/* Backspace */}
          <button
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(30);
              handlePinBackspace();
            }}
            className="h-16 flex items-center justify-center transition-colors duration-150"
            style={{
              border: '1px solid rgba(253,248,247,0.1)',
              borderRadius: '8px',
              color: 'rgba(230,226,224,0.6)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(230,226,224,0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Delete className="w-5 h-5" />
          </button>
          {/* 0 */}
          <button
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(50);
              handlePinInput('0');
            }}
            className="h-16 flex items-center justify-center transition-colors duration-150"
            style={{
              border: '1px solid rgba(253,248,247,0.1)',
              borderRadius: '8px',
              fontSize: '24px',
              lineHeight: '1.2',
              fontWeight: 500,
              color: '#fdf8f7',
              background: 'transparent',
              fontFamily: "'Playfair Display', serif",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(230,226,224,0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            0
          </button>
          {/* Submit/Check */}
          <button
            onClick={() => pin.length === 4 && handleLogin(pin)}
            disabled={pin.length < 4 || isLoading}
            className="h-16 flex items-center justify-center transition-colors duration-150"
            style={{
              border: '1px solid rgba(253,248,247,0.1)',
              borderRadius: '8px',
              color: pin.length === 4 ? '#B08D57' : 'rgba(230,226,224,0.6)',
              background: 'transparent',
              opacity: pin.length < 4 ? 0.5 : 1,
              cursor: pin.length < 4 ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (pin.length === 4) e.currentTarget.style.background = 'rgba(230,226,224,0.1)';
            }}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Check className="w-5 h-5" />
          </button>
        </div>

        {/* Enter Station Button */}
        <button
          onClick={() => pin.length === 4 && handleLogin(pin)}
          disabled={pin.length < 4 || isLoading}
          className="w-full max-w-[320px] h-14 rounded-lg transition-all duration-300"
          style={{
            fontSize: '12px',
            lineHeight: '16px',
            letterSpacing: '0.08em',
            fontWeight: 700,
            textTransform: 'uppercase',
            fontFamily: "'Manrope', sans-serif",
            opacity: pin.length < 4 ? 0.5 : 1,
            cursor: pin.length < 4 ? 'not-allowed' : 'pointer',
            background: pin.length >= 4 ? '#B08D57' : 'rgba(230,226,224,0.9)',
            color: pin.length >= 4 ? '#ffffff' : '#1C1A17',
            border: 'none',
          }}
        >
          {isLoading ? 'Authenticating...' : 'Enter Station'}
        </button>
      </main>

      {/* Footer: Station Variant Preview */}
      <div className="fixed bottom-0 left-0 w-full p-4 flex justify-center gap-3 opacity-40 pointer-events-none hidden md:flex">
        {STATIONS.slice(1).map((station) => {
          const Icon = station.icon;
          return (
            <div
              key={station.id}
              className="flex items-center gap-3 rounded-lg px-4 py-3"
              style={{
                border: '1px solid rgba(253,248,247,0.1)',
                background: '#1C1A17',
              }}
            >
              <Icon className="w-4 h-4" style={{ color: station.color }} />
              <div>
                <div
                  className="uppercase"
                  style={{
                    fontSize: '10px',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                    color: 'rgba(230,226,224,0.6)',
                  }}
                >
                  {station.label}
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 500,
                    color: station.color,
                  }}
                >
                  {station.code}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Station selector (clicking on header icon cycles stations) */}
      <button
        onClick={() => {
          const idx = STATIONS.findIndex((s) => s.id === selectedStation.id);
          setSelectedStation(STATIONS[(idx + 1) % STATIONS.length]);
          setPin('');
          setError('');
        }}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
        style={{
          border: '1px solid rgba(253,248,247,0.1)',
          background: 'rgba(28,26,23,0.8)',
          backdropFilter: 'blur(8px)',
          fontSize: '12px',
          color: 'rgba(230,226,224,0.6)',
          cursor: 'pointer',
        }}
      >
        <Settings className="w-3.5 h-3.5" />
        Switch Station
      </button>
    </div>
  );
};

function StationIcon({ station }: { station: typeof STATIONS[0] }) {
  const Icon = station.icon;
  return <Icon className="w-12 h-12" style={{ color: station.color, strokeWidth: 1 }} />;
}
