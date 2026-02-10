import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { VisitProvider } from './context/VisitContext';
import { ViewModeProvider } from './context/ViewModeContext';
import { ServiceProvider } from './context/ServiceContext';
import { SpecialistProvider, useSpecialists } from './context/SpecialistContext';
import { AvailabilityProvider } from './context/AvailabilityContext';
import { ClientProvider } from './context/ClientContext';
import { ThemeProvider } from './context/ThemeContext';
import StyleGuide from './pages/StyleGuide';
import SettingsPage from './pages/SettingsPage';
import ClientsPage from './pages/ClientsPage';
import VisitFormPage from './pages/VisitFormPage';
import Timeline from './components/stitch/Timeline';
import AppShell from './components/stitch/AppShell';
import BottomNav from './components/stitch/BottomNav';
import DateScroller from './components/stitch/DateScroller';
import { formatDateFull } from './utils/dateUtils';
import type { Visit } from './types';
import { Plus } from 'lucide-react';

function Header({ selectedDate, onDateChange }: { selectedDate: Date, onDateChange: (d: Date) => void }) {
  const { selectedSpecialistId, setSelectedSpecialistId, specialists } = useSpecialists();

  return (
    <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-black text-text-main tracking-tightest capitalize">{formatDateFull(selectedDate)}</h1>
      </div>

      {/* Sub-Header Controls */}
      <div className="px-4 pb-2">
        <DateScroller selectedDate={selectedDate} onDateChange={onDateChange} />

        {/* Specialist Filter - Horizontal Scroll */}
        <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar py-3 px-2 -my-1">
          <button
            onClick={() => setSelectedSpecialistId(null)}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-[13px] font-bold border transition-all ${!selectedSpecialistId
              ? 'bg-text-main text-white border-text-main shadow-lg shadow-text-main/10'
              : 'bg-white text-text-muted border-gray-200 hover:border-gray-300'
              }`}
          >
            All Team
          </button>
          {specialists.map(spec => (
            <button
              key={spec.id}
              onClick={() => setSelectedSpecialistId(spec.id)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-[13px] font-bold border transition-all ${selectedSpecialistId === spec.id
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                : 'bg-white text-text-muted border-gray-200 hover:border-gray-300'
                }`}
            >
              {spec.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { selectedSpecialistId } = useSpecialists();

  const handleSlotClick = (date: Date, specialistId?: string) => {
    navigate(`/visit/new?date=${date.toISOString()}&specialistId=${specialistId || ''}`);
  };

  const handleVisitClick = (visit: Visit) => {
    navigate(`/visit/edit/${visit.id}`);
  };

  return (
    <div className="relative min-h-full">
      <Header selectedDate={selectedDate} onDateChange={setSelectedDate} />
      <Timeline
        selectedDate={selectedDate}
        onSlotClick={handleSlotClick}
        onVisitClick={handleVisitClick}
        filterSpecialistId={selectedSpecialistId}
      />

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/visit/new')}
        className="fixed bottom-24 right-6 bg-primary text-white px-6 py-4 rounded-full shadow-xl shadow-primary/40 flex items-center gap-2 animate-bounce-subtle z-30 hover:scale-105 transition-transform"
      >
        <Plus size={24} strokeWidth={3} />
        <span className="font-black text-sm uppercase tracking-wider">New Visit</span>
      </button>
    </div>
  );
}

function Layout() {
  // If in settings or design, just render content without the main timeline layout (for now)
  // But we want to keep AppShell

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto no-scrollbar relative w-full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/design" element={<StyleGuide />} />
          <Route path="/visit/new" element={<VisitFormPage />} />
          <Route path="/visit/edit/:id" element={<VisitFormPage />} />
        </Routes>
      </div>
      <BottomNav />
    </AppShell>
  );
}

function App() {
  return (
    <ThemeProvider>
      <VisitProvider>
        <ViewModeProvider>
          <ServiceProvider>
            <SpecialistProvider>
              <AvailabilityProvider>
                <ClientProvider>
                  <BrowserRouter>
                    <Layout />
                  </BrowserRouter>
                </ClientProvider>
              </AvailabilityProvider>
            </SpecialistProvider>
          </ServiceProvider>
        </ViewModeProvider>
      </VisitProvider>
    </ThemeProvider>
  );
}

export default App;
