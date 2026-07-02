'use client';

import React, { useState, useEffect, useRef } from 'react';

interface MetricCardProps {
  value: string;
  prefix?: string;
  suffix?: string;
  label: string;
  delay: string;
}

export default function MetricCard({ value, prefix = "", suffix = "", label, delay }: MetricCardProps) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let start = 0;
    const end = parseInt(value);
    const duration = 2000;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Use easeOutExpo for smooth finish
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easedProgress * (end - start) + start));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end); // Ensure exact final value
      }
    };

    requestAnimationFrame(animate);
  }, [hasStarted, value]);

  return (
    <div 
      ref={containerRef}
      className="p-8 rounded-[32px] bg-white/50 dark:bg-white/5 border border-neutral-100 dark:border-neutral-800 text-center hover:bg-white dark:hover:bg-white/10 transition-colors duration-500 animate-reveal" 
      style={{ transitionDelay: delay }}
    >
      <p className="text-4xl font-black text-brand-emerald mb-2">
        {prefix}{count}{suffix}
      </p>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
    </div>
  );
}
