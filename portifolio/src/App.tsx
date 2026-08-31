import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ConciergeButton } from './components/concierge/ConciergeButton';
import HomePage from './pages/HomePage';
import { RoomsPage, RoomDetailPage } from './pages/RoomsPage';
import DiningPage from './pages/DiningPage';
import WellnessPage from './pages/WellnessPage';
import { ExperiencesPage, ExperienceDetailPage } from './pages/ExperiencesPage';
import EventsPage from './pages/EventsPage';
import ServicesPage from './pages/ServicesPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import BookingPage from './pages/BookingPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-primary text-ivory font-sans">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/rooms/:id" element={<RoomDetailPage />} />
            <Route path="/dining" element={<DiningPage />} />
            <Route path="/wellness" element={<WellnessPage />} />
            <Route path="/experiences" element={<ExperiencesPage />} />
            <Route path="/experiences/:id" element={<ExperienceDetailPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <ConciergeButton />
      </div>
    </BrowserRouter>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-4">Error 404</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ivory font-semibold mb-4">Page Not Found</h1>
        <p className="text-ivory/40 text-sm font-light mb-8">The page you are looking for does not exist or has been moved.</p>
        <a href="/" className="inline-flex items-center px-8 py-3.5 bg-gold text-primary text-xs font-medium tracking-[0.15em] uppercase hover:bg-gold-light transition-colors">
          Return Home
        </a>
      </div>
    </div>
  );
}
