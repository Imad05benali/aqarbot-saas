'use client';

import React from 'react';

export default function GlobalBackground() {
  return (
    <div className="fixed inset-0 z-0 bg-background overflow-hidden pointer-events-none">
      {/* 1. CYBER CONSTELLATION MESH (Theme-Aware Mint Green Nodes) */}
      {/* Cluster Left */}
      <div className="absolute left-[5%] top-[15%] w-[400px] h-[400px] opacity-[0.3] dark:opacity-[0.4] animate-drift">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="40" cy="50" r="2" fill="#10B981" />
          <circle cx="100" cy="40" r="2" fill="#10B981" />
          <circle cx="150" cy="70" r="2" fill="#10B981" />
          <circle cx="90" cy="110" r="2" fill="#10B981" />
          <circle cx="30" cy="130" r="2" fill="#10B981" />
          <path d="M40 50 L100 40 L150 70 L90 110 L30 130 Z" stroke="#10B981" strokeWidth="1" strokeOpacity="0.8" fill="none" />
          <path d="M40 50 L90 110" stroke="#10B981" strokeWidth="1" strokeOpacity="0.5" fill="none" />
          <path d="M100 40 L90 110" stroke="#10B981" strokeWidth="1" strokeOpacity="0.5" fill="none" />
        </svg>
      </div>

      {/* Cluster Right */}
      <div className="absolute right-[5%] top-[40%] w-[500px] h-[500px] opacity-[0.25] dark:opacity-[0.35] animate-drift" style={{ animationDelay: '-5s', animationDuration: '25s' }}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="50" cy="30" r="1.8" fill="#10B981" />
          <circle cx="140" cy="40" r="1.8" fill="#10B981" />
          <circle cx="170" cy="110" r="1.8" fill="#10B981" />
          <circle cx="80" cy="150" r="1.8" fill="#10B981" />
          <circle cx="30" cy="90" r="1.8" fill="#10B981" />
          <path d="M50 30 L140 40 L170 110 L80 150 L30 90 Z" stroke="#10B981" strokeWidth="0.8" strokeOpacity="0.8" fill="none" />
          <path d="M50 30 L80 150" stroke="#10B981" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
          <path d="M140 40 L80 150" stroke="#10B981" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
        </svg>
      </div>

      {/* Cluster Center Bottom */}
      <div className="absolute left-[30%] bottom-[-5%] w-[600px] h-[600px] opacity-[0.28] dark:opacity-[0.38] animate-drift" style={{ animationDelay: '-12s', animationDuration: '30s' }}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="100" r="1.5" fill="#10B981" />
          <circle cx="160" cy="120" r="1.5" fill="#10B981" />
          <circle cx="130" cy="180" r="1.5" fill="#10B981" />
          <circle cx="70" cy="170" r="1.5" fill="#10B981" />
          <circle cx="40" cy="110" r="1.5" fill="#10B981" />
          <path d="M100 100 L160 120 L130 180 L70 170 L40 110 Z" stroke="#10B981" strokeWidth="0.6" strokeOpacity="0.7" fill="none" />
        </svg>
      </div>

      {/* 2. SIDE AMBIENT GLOWS (Custom Palette: Blue & Vibrant Green) */}
      <div 
        className="absolute left-[-10%] top-[10%] w-[1000px] h-[1000px] opacity-[0.25] dark:opacity-[0.2] blur-[160px] rounded-full animate-pulse-slow" 
        style={{ backgroundColor: '#4A90E2' }}
      />
      <div 
        className="absolute right-[-5%] top-[5%] w-[900px] h-[900px] opacity-[0.2] dark:opacity-[0.15] blur-[180px] rounded-full animate-pulse-slow" 
        style={{ backgroundColor: '#7ED321', animationDelay: '-4s' }}
      />
      <div 
        className="absolute left-[20%] bottom-[-10%] w-[1200px] h-[800px] opacity-[0.4] dark:opacity-[0.5] blur-[200px] rounded-full animate-pulse-slow" 
        style={{ backgroundColor: '#3C3C3C', animationDelay: '-2s' }}
      />
    </div>
  );
}
