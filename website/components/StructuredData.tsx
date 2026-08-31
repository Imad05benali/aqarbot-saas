import React from 'react';

export default function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AqarBot",
    "operatingSystem": "Web",
    "applicationCategory": "BusinessApplication",
    "description": "AqarBot est une plateforme SaaS d'IA immobilière marocaine spécialisée dans l'automatisation WhatsApp, la qualification de leads en Darija et le tracking CRM.",
    "url": "https://aqarbot.ma",
    "author": {
      "@type": "Person",
      "name": "Imad Salim Ben Ali"
    },
    "offers": {
      "@type": "Offer",
      "price": "499",
      "priceCurrency": "MAD",
      "description": "Plan Mensuel Standard"
    },
    "featureList": [
      "IA Conversationnelle Darija",
      "WhatsApp CRM Integration",
      "Qualification de Leads Automatique",
      "Dashboard Analytics",
      "Support 24/7"
    ],
    "applicationSubCategory": "Immobilier, CRM, Automatisation",
    "screenshot": "https://aqarbot.ma/maroc-core-tech.png",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "127"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
