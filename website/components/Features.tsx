import React from 'react';
import ScrollReveal from './ScrollReveal';
import { Search, Globe, Users } from 'lucide-react';

const features = [
  {
    title: "Recherche SQL Directe & Nationale",
    description: "Accédez à une base de données temps réel sans les lenteurs des recherches vectorielles. Trouvez des biens à Tanger, Agadir ou Meknès en quelques ms.",
    icon: <Search className="w-6 h-6 text-brand-emerald" />
  },
  {
    title: "Fuzzy Vowel Matching",
    description: "Résilient aux variations d'orthographe (Darija / Français). 'Meknes' ou 'Meknès', notre IA comprend parfaitement chaque intention locale.",
    icon: <Globe className="w-6 h-6 text-brand-emerald" />
  },
  {
    title: "Génération Automatique de Leads",
    description: "Enregistrement automatique des profils, noms et numéros. Transformez chaque message WhatsApp en une opportunité qualifiée dans votre CRM.",
    icon: <Users className="w-6 h-6 text-brand-emerald" />
  }
];

export default function Features() {
  return (
    <section className="py-20 w-full flex flex-col items-center">
      <div className="container px-4 md:px-6">
        <ScrollReveal>
          <div className="text-center mb-16 animate-reveal">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Pourquoi choisir AqarBot ?</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-[600px] mx-auto font-medium">
              Une technologie de pointe conçue spécifiquement pour le marché immobilier marocain.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} stagger={i * 0.2}>
              <div 
                className="glass-card p-8 rounded-2xl hover:border-brand-emerald/50 transition-all group hover-tilt shine-effect animate-reveal"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-emerald/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-emerald/20 transition-all duration-500 animate-float" style={{ animationDelay: `${i * 0.3}s` }}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-brand-emerald transition-colors">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed group-hover:text-slate-900 dark:group-hover:text-slate-300 transition-colors font-medium">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
