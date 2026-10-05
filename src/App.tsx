/**
 * Legal India - Ultra-Premium Indian Legal AI
 */

import React from 'react';
import { LegalBot } from './components/LegalBot';

export default function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#080c14] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <LegalBot />
    </div>
  );
}
