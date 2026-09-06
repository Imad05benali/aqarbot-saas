import { Star } from 'lucide-react';

export default function Pricing() {
  return (
    <div className="w-full relative pb-32 text-slate-100">
      <div className="max-w-7xl mx-auto pt-10">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-16">
          <h2 className="text-[clamp(2.5rem,5vw,5rem)] font-black leading-[0.85] tracking-tighter uppercase text-white">
            Choisissez<br />
            votre <span className="text-emerald-400 relative inline-block">niveau.<span className="absolute -bottom-1 left-0 w-full h-[2px] bg-emerald-400/80" /></span>
          </h2>
          <div className="max-w-xs text-sm font-medium text-slate-400 leading-relaxed mb-4">
            Avec Agence, votre site web immobilier est offert : créé, connecté au CRM, hébergé et maintenu. Essai 14 jours sans carte bancaire.
          </div>
        </div>

        <p className="text-[10px] text-slate-500 font-bold mb-4">Prix facturés en MAD · montants indicatifs.</p>

        <div className="card-modern grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
          
          <div className="p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-700/50 flex flex-col hover:bg-slate-800/30 transition-colors">
            <span className="text-xs font-black text-slate-500 mb-8">01</span>
            <p className="text-[9px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">Agent solo - indépendant</p>
            <h3 className="text-3xl font-bold tracking-tight mb-6 leading-none text-white">Solo</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-5xl font-black tracking-tighter text-white">499</span>
              <span className="text-sm font-bold text-slate-500">DH /mois</span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 mb-6">≈ 49 €</p>
            <p className="text-[13px] font-medium text-slate-400 leading-relaxed max-w-[250px] mb-8">
              Le CRM complet pour l'agent indépendant : contacts WhatsApp, biens, matching, pipeline et agenda.
            </p>

            <div className="mt-auto">
              <button className="btn-brand-outline w-full flex items-center justify-center py-3.5 text-sm">
                S'abonner
              </button>
            </div>
          </div>

          <div className="p-8 lg:p-10 bg-emerald-500/5 text-white flex flex-col relative shadow-[0_0_40px_rgba(110,231,183,0.08)] z-10 lg:scale-[1.01] border border-emerald-500/20 rounded-lg" style={{ margin: '-1px 0' }}>
            <div className="flex justify-between items-start mb-8">
              <span className="text-xs font-black text-emerald-400">02</span>
              <div className="bg-emerald-500 text-[#0B1120] text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-sm flex items-center gap-1.5 shadow-md">
                <Star className="w-3 h-3 fill-[#0B1120]" /> Recommandé
              </div>
            </div>
            <p className="text-[9px] uppercase tracking-[0.1em] font-bold text-emerald-400 mb-2">Agence - 3 agents inclus</p>
            <h3 className="text-3xl font-bold tracking-tight mb-6 leading-none text-white">Agence</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-5xl font-black tracking-tighter text-emerald-400">1290</span>
              <span className="text-sm font-bold text-emerald-400/60">DH /mois</span>
            </div>
            <p className="text-[10px] font-bold text-emerald-400/60 mb-6">≈ 129 €</p>
            <p className="text-[13px] font-medium text-slate-300 leading-relaxed max-w-[250px] mb-6">
              Le CRM d'équipe pour suivre, collaborer et qualifier à plusieurs sur un dashboard unifié.
            </p>

            <div className="bg-[#0B1120]/50 border border-emerald-500/20 rounded-md p-4 mb-6">
              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-wider mb-2">Inclus avec agence</p>
              <p className="text-lg font-medium mb-1 text-white">Site web offert</p>
              <p className="text-xs text-slate-400 font-medium">Créé, connecté au CRM, hébergé et maintenu.</p>
            </div>

            <div className="mt-auto">
              <button className="btn-brand w-full flex items-center justify-center py-3.5 text-xs">
                Passer à l'Agence
              </button>
            </div>
          </div>

          <div className="p-8 lg:p-10 flex flex-col hover:bg-slate-800/30 transition-colors border-l border-slate-700/50">
            <span className="text-xs font-black text-slate-500 mb-8">03</span>
            <p className="text-[9px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">Tout métier immobilier</p>
            <h3 className="text-3xl font-bold tracking-tight mb-6 leading-none text-white">Sur-mesure</h3>
            <div className="flex items-baseline gap-2 mb-2 mt-3">
              <span className="text-5xl font-black tracking-tighter text-white">Devis</span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 mb-6 mt-1">Mise en place dès 20 000 MAD</p>
            <p className="text-[13px] font-medium text-slate-400 leading-relaxed max-w-[250px] mb-8 mt-1">
              Votre logiciel façonné par notre équipe sur notre socle CRM. Votre métier définit le produit, maintenu à vos côtés.
            </p>

            <div className="mt-auto">
              <a href="mailto:contact@aqarbot.ma" className="btn-brand-outline w-full flex items-center justify-center py-3.5 text-sm">
                Planifier un appel
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
