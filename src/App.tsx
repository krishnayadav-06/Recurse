import React from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/sections/HeroSection';
import { FeaturesSection } from './components/sections/FeaturesSection';
import { ManifestoSection } from './components/sections/ManifestoSection';
import { ProtocolSection } from './components/sections/ProtocolSection';
import { PricingSection } from './components/sections/PricingSection';

export const App: React.FC = () => {
  return (
    <div className="relative w-full overflow-hidden selection:bg-accent selection:text-white pb-24">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ManifestoSection />
      <ProtocolSection />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default App;
