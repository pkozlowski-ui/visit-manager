
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { VisitProvider } from './context/VisitContext';
import { ViewModeProvider } from './context/ViewModeContext';
import { ServiceProvider } from './context/ServiceContext';
import { SpecialistProvider } from './context/SpecialistContext';
import { AvailabilityProvider } from './context/AvailabilityContext';
import { ClientProvider } from './context/ClientContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import StyleGuide from './pages/StyleGuide';
import SettingsPage from './pages/SettingsPage';
import ClientsPage from './pages/ClientsPage';
import VisitFormPage from './pages/VisitFormPage';
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';
import MainLayout from './components/layout/MainLayout';
import { MotionWrapper } from './components/ui/MotionWrapper';


import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

function AppContent() {
  const location = useLocation();

  return (
    <MainLayout>
      <AnimatePresence mode="wait">

        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<MotionWrapper className="h-full"><HomePage /></MotionWrapper>} />
          <Route path="/stats" element={<MotionWrapper className="h-full"><StatsPage /></MotionWrapper>} />
          <Route path="/clients" element={<MotionWrapper className="h-full"><ClientsPage /></MotionWrapper>} />
          <Route path="/settings" element={<MotionWrapper className="h-full"><SettingsPage /></MotionWrapper>} />
          <Route path="/design" element={<MotionWrapper className="h-full"><StyleGuide /></MotionWrapper>} />
          <Route path="/visit/new" element={<MotionWrapper className="h-full"><VisitFormPage /></MotionWrapper>} />
          <Route path="/visit/edit/:id" element={<MotionWrapper className="h-full"><VisitFormPage /></MotionWrapper>} />
        </Routes>
      </AnimatePresence>
    </MainLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <VisitProvider>
          <ViewModeProvider>
            <ServiceProvider>
              <SpecialistProvider>
                <AvailabilityProvider>
                  <ClientProvider>
                    <BrowserRouter>
                      <AppContent />
                    </BrowserRouter>
                  </ClientProvider>
                </AvailabilityProvider>
              </SpecialistProvider>
            </ServiceProvider>
          </ViewModeProvider>
        </VisitProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
