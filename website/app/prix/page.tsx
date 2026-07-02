'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Pricing from '@/components/Pricing';
import ScrollReveal from '@/components/ScrollReveal';

export default function PrixPage() {
  return (
    <main className="selection:bg-brand-emerald/30 min-h-screen">
      <Navbar />
      <div className="pt-32 pb-20">
        <Pricing />
      </div>
    </main>
  );
}
