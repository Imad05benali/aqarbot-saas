'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Pricing from '@/components/Pricing';
import ScrollReveal from '@/components/ScrollReveal';

export default function PrixPage() {
  return (
    <main className="bg-[#0B1120] text-slate-100 selection:bg-[#6EE7B7]/30 min-h-screen">
      <div className="pt-20 pb-20">
        <Pricing />
      </div>
    </main>
  );
}
