import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Earth3D from './components/three/Earth3D';
import EarthWaves from './components/three/EarthWaves';
import GooeyNavbar from './components/layout/GooeyNavbar';
import VoiceFloatingButton from './components/layout/VoiceFloatingButton';
import OfflineIndicator from './components/features/OfflineIndicator';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import FaceAuth from './pages/FaceAuth';
import FarmerDashboard from './pages/FarmerDashboard';
import EquipmentAnalyzer from './pages/EquipmentAnalyzer';
import MarkMyLand from './components/MarkMyLand/MarkMyLand';
import CropHealthDashboard from './components/CropHealth/Dashboard';
import InsuranceForm from './components/CropHealth/InsuranceForm';
import FarmDashboard from './components/Feature3/FarmDashboard';
import TrustReport from './components/Feature3/TrustReport';
import CropRecommendation from './components/features/CropRecommendation/CropRecommendation';
import SchemesPage from './pages/SchemesPage';
import BlockchainManager from './components/Feature6/BlockchainManager';
import ProtectedRoute from './components/ProtectedRoute';

import { useThemeStore } from './store/themeStore';
import PageIntroHandler from './components/layout/PageIntroHandler';

function App() {
  const theme = useThemeStore((state) => state.theme);

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ErrorBoundary>
      <Router>
        <PageIntroHandler />
        <main className={`relative min-h-screen font-sans selection:bg-organic-green selection:text-dark-navy transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-dark-navy'}`}>
          {/* Global Background */}
          <ErrorBoundary>
            <Earth3D />
          </ErrorBoundary>

          {/* Global Navigation */}
          <ErrorBoundary>
            <GooeyNavbar />
          </ErrorBoundary>

          <OfflineIndicator />

          {/* Routes */}
          <Routes>
            <Route path="/" element={<ErrorBoundary><LandingPage /></ErrorBoundary>} />
            {/* Authentication */}
            <Route path="/auth-face" element={<ErrorBoundary><FaceAuth /></ErrorBoundary>} />
            <Route path="/auth" element={<ErrorBoundary><AuthPage /></ErrorBoundary>} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><ErrorBoundary><FarmerDashboard /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/equipment" element={<ProtectedRoute><ErrorBoundary><EquipmentAnalyzer /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/mark-my-land" element={<ProtectedRoute><ErrorBoundary><MarkMyLand /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/crop-health" element={<ProtectedRoute><ErrorBoundary><CropHealthDashboard /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/insurance-claim" element={<ProtectedRoute><ErrorBoundary><InsuranceForm /></ErrorBoundary></ProtectedRoute>} />

            {/* Feature 3: Autonomous Farm */}
            <Route path="/autonomous-farm" element={<ProtectedRoute><ErrorBoundary><FarmDashboard /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/trust-report/:batchId" element={<ProtectedRoute><ErrorBoundary><TrustReport /></ErrorBoundary></ProtectedRoute>} />

            {/* Feature 4: Smart Crop Recommender */}
            <Route path="/crop-recommendation" element={<ProtectedRoute><ErrorBoundary><CropRecommendation /></ErrorBoundary></ProtectedRoute>} />

            {/* Feature 4: Schemes Agent */}
            <Route path="/schemes-assistant" element={<ProtectedRoute><ErrorBoundary><SchemesPage /></ErrorBoundary></ProtectedRoute>} />

            {/* Feature 6: Inventory & Commerce System */}
            <Route path="/inventory" element={<ProtectedRoute><ErrorBoundary><BlockchainManager /></ErrorBoundary></ProtectedRoute>} />

            {/* Placeholder routes */}
            <Route path="/features" element={<div className="pt-32 text-center text-2xl">Features Coming Soon</div>} />

            {/* Teammate Showcase Route */}
            <Route path="/showcase/waves" element={
              <ErrorBoundary>
                <div className="w-full h-screen relative">
                  <div className="absolute top-24 left-0 w-full text-center z-10 pointer-events-none">
                    <h1 className="text-4xl font-bold text-white drop-shadow-lg">Original Waves Design</h1>
                    <p className="text-gray-300">For Team Review</p>
                  </div>
                  <EarthWaves mode="hero" />
                </div>
              </ErrorBoundary>
            } />
          </Routes>

          {/* Global Voice Assistant */}
          <ErrorBoundary>
            <VoiceFloatingButton />
          </ErrorBoundary>
        </main>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
