// ── Brand Design Tokens ──────────────────────────────────────────
export const BRAND = {
  // Backgrounds (thème clair)
  bg:       '#F8FAFC',
  bgCard:   '#FFFFFF',
  bgCard2:  '#F1F5F9',
  border:   '#E2E8F0',
  // Accent
  cyan:     '#0891B2',
  cyanLight:'#0891B2',
  // Text
  textPrimary:   '#0F172A',
  textSecondary: '#475569',
  textMuted:     '#94A3B8',
  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  danger:  '#EF4444',
  // Plan colors
  starter: '#64748B',
  pro:     '#0891B2',
  elite:   '#D97706',
};

// ── Font aliases ─────────────────────────────────────────────────
export const F = {
  regular:     'DMSans_400Regular',
  medium:      'DMSans_500Medium',
  semibold:    'DMSans_600SemiBold',
  bold:        'DMSans_700Bold',
  grotesk:     'SpaceGrotesk_600SemiBold',
  groteskBold: 'SpaceGrotesk_700Bold',
};

// ── Categories (iconLib + iconName for @expo/vector-icons) ───────
export const CATEGORIES = [
  { id: "plomberie",     iconLib: "MaterialCommunityIcons", iconName: "faucet",                  label: "Plomberie",     color: "#0891B2", basePrice: 80  },
  { id: "electricite",   iconLib: "MaterialCommunityIcons", iconName: "lightning-bolt",           label: "Électricité",   color: "#D97706", basePrice: 75  },
  { id: "serrurerie",    iconLib: "MaterialCommunityIcons", iconName: "lock-outline",             label: "Serrurerie",    color: "#7C3AED", basePrice: 90  },
  { id: "nuisibles",     iconLib: "MaterialCommunityIcons", iconName: "bug",                      label: "Nuisibles",     color: "#DC2626", basePrice: 120 },
  { id: "vitrerie",      iconLib: "MaterialCommunityIcons", iconName: "view-grid-outline",        label: "Vitrerie",      color: "#0EA5E9", basePrice: 100 },
  { id: "chauffage",     iconLib: "MaterialCommunityIcons", iconName: "radiator",                 label: "Chauffage",     color: "#EA580C", basePrice: 95  },
  { id: "peinture",      iconLib: "MaterialCommunityIcons", iconName: "format-paint",             label: "Peinture",      color: "#E11D48", basePrice: 60  },
  { id: "jardinage",     iconLib: "MaterialCommunityIcons", iconName: "mower",                    label: "Jardinage",     color: "#16A34A", basePrice: 50  },
  { id: "electromenager",iconLib: "MaterialCommunityIcons", iconName: "washing-machine",          label: "Petit Électro", color: "#6366F1", basePrice: 65  },
  { id: "depanneuse",    iconLib: "MaterialCommunityIcons", iconName: "tow-truck",                label: "Dépannage Auto",color: "#475569", basePrice: 130 },
  { id: "toiture",       iconLib: "MaterialCommunityIcons", iconName: "home-roof",                label: "Toiture",       color: "#B45309", basePrice: 110 },
  { id: "autres",        iconLib: "MaterialCommunityIcons", iconName: "cog-outline",              label: "Bricolage",     color: "#64748B", basePrice: 55  },
];

export const DIAGNOSTIC_QUESTIONS = {
  plomberie: [
    { id: "type", q: "Quel est le problème ?", options: ["Fuite d'eau", "WC bouché", "Chauffe-eau en panne", "Canalisation bouchée", "Robinet cassé", "Autre"] },
    { id: "severity", q: "Quelle est la gravité ?", options: ["Dégât des eaux en cours", "Fuite active mais contrôlée", "Pas de fuite, juste une panne", "Simple entretien"] },
    { id: "access", q: "L'accès est-il facile ?", options: ["Oui, facilement accessible", "Espace restreint", "En hauteur / sous-sol", "Je ne sais pas"] },
  ],
  electricite: [
    { id: "type", q: "Quel est le problème ?", options: ["Coupure de courant", "Prise/interrupteur HS", "Court-circuit", "Tableau électrique", "Installation neuve", "Autre"] },
    { id: "severity", q: "Y a-t-il un danger ?", options: ["Odeur de brûlé / étincelles", "Disjoncteur qui saute", "Pas de danger immédiat", "Simple remplacement"] },
    { id: "age", q: "Âge de l'installation ?", options: ["< 10 ans", "10-30 ans", "Plus de 30 ans", "Je ne sais pas"] },
  ],
  serrurerie: [
    { id: "type", q: "Quelle situation ?", options: ["Porte claquée", "Clé cassée dans la serrure", "Serrure forcée / cambriolage", "Changement de serrure", "Autre"] },
    { id: "door", q: "Type de porte ?", options: ["Porte blindée", "Porte en bois standard", "Porte vitrée", "Porte de garage", "Je ne sais pas"] },
    { id: "urgency_detail", q: "Êtes-vous bloqué dehors ?", options: ["Oui, je suis dehors", "Non, j'ai un accès"] },
  ],
  nuisibles: [
    { id: "type", q: "Quel type de nuisible ?", options: ["Nid de guêpes/frelons", "Rats / souris", "Cafards / blattes", "Punaises de lit", "Fourmis", "Autre"] },
    { id: "location", q: "Où se trouve le problème ?", options: ["Intérieur maison", "Jardin / extérieur", "Toiture / combles", "Cave / sous-sol", "Autre"] },
    { id: "severity", q: "Niveau d'infestation ?", options: ["Juste apparu", "Depuis quelques jours", "Problème récurrent", "Invasion importante"] },
  ],
  vitrerie: [
    { id: "type", q: "Quel type de vitrage ?", options: ["Fenêtre cassée", "Double vitrage fendu", "Verre de porte", "Baie vitrée / véranda", "Miroir", "Autre"] },
    { id: "location", q: "Où se trouve la vitre ?", options: ["Rez-de-chaussée", "Étage", "Cave / sous-sol", "Extérieur / jardin"] },
    { id: "severity", q: "État actuel de la vitre ?", options: ["Brisée — danger immédiat", "Fêlée mais entière", "Joint décollé / infiltration d'air", "Remplacement préventif"] },
  ],
  chauffage: [
    { id: "type", q: "Quel est le problème ?", options: ["Chaudière en panne", "Radiateur qui chauffe mal", "Fuite sur le circuit", "Pas d'eau chaude", "Entretien annuel", "Autre"] },
    { id: "system", q: "Type de chauffage ?", options: ["Chaudière gaz", "Chaudière mazout", "Poêle à pellet", "Pompe à chaleur", "Électrique / convecteurs", "Je ne sais pas"] },
    { id: "severity", q: "Situation actuelle ?", options: ["Plus de chauffage du tout", "Chauffage insuffisant", "Bruit anormal", "Simple entretien planifié"] },
  ],
  peinture: [
    { id: "type", q: "Quel type de travaux ?", options: ["Peinture intérieure", "Peinture extérieure / façade", "Remise en état après sinistre", "Pose de papier peint", "Enduit / plâtre", "Autre"] },
    { id: "surface", q: "Surface concernée ?", options: ["1 pièce", "Plusieurs pièces", "Façade extérieure complète", "Plafond uniquement", "Couloir / escalier"] },
    { id: "state", q: "État actuel des murs ?", options: ["Bon état — repeindre seulement", "Fissures légères", "Dégâts importants (humidité, impacts)", "Première mise en peinture"] },
  ],
  jardinage: [
    { id: "type", q: "Quel besoin ?", options: ["Tonte de pelouse", "Taille de haies / arbres", "Désherbage", "Entretien complet", "Abattage d'arbre", "Aménagement paysager"] },
    { id: "frequency", q: "À quelle fréquence ?", options: ["Une seule fois", "Mensuel", "Bimensuel", "Hebdomadaire"] },
    { id: "surface", q: "Taille du jardin ?", options: ["Petit (< 50 m²)", "Moyen (50–200 m²)", "Grand (> 200 m²)", "Je ne sais pas"] },
  ],
  electromenager: [
    { id: "type", q: "Quel appareil ?", options: ["Lave-linge", "Lave-vaisselle", "Réfrigérateur / congélateur", "Four / micro-ondes", "Sèche-linge", "Autre"] },
    { id: "problem", q: "Quel problème ?", options: ["Ne s'allume plus", "Fuite d'eau", "Bruit anormal", "Surchauffe", "Code d'erreur affiché", "Entretien / nettoyage"] },
    { id: "age", q: "Âge de l'appareil ?", options: ["< 2 ans (garantie ?)", "2 à 5 ans", "5 à 10 ans", "Plus de 10 ans"] },
  ],
  depanneuse: [
    { id: "type", q: "Quel problème ?", options: ["Panne sur route", "Pneu crevé", "Batterie déchargée", "Accident / sortie de route", "Clé enfermée dans le véhicule", "Autre"] },
    { id: "location", q: "Où êtes-vous ?", options: ["Autoroute / nationale", "En ville", "Parking souterrain", "Zone rurale / isolée"] },
    { id: "vehicle", q: "Type de véhicule ?", options: ["Voiture particulière", "Utilitaire / camionnette", "Moto / scooter", "Camping-car / caravane"] },
  ],
  toiture: [
    { id: "type", q: "Quel problème ?", options: ["Tuiles / ardoises cassées", "Infiltration d'eau / fuite", "Mousse ou végétation", "Gouttières bouchées ou cassées", "Toiture plate détériorée", "Autre"] },
    { id: "severity", q: "Urgence ?", options: ["Infiltration active en ce moment", "Constaté après intempéries", "Problème sans urgence immédiate", "Entretien préventif"] },
    { id: "roof_type", q: "Type de toiture ?", options: ["Pente douce (< 30°)", "Pente forte (> 30°)", "Toiture plate", "Je ne sais pas"] },
  ],
  autres: [
    { id: "type", q: "Type de travaux ?", options: ["Montage de meuble / équipement", "Réparation mécanique", "Installation / fixation", "Maintenance générale", "Petits travaux divers", "Autre"] },
    { id: "location", q: "Où ?", options: ["Intérieur maison / appartement", "Garage / atelier", "Jardin / extérieur", "Bureau / local commercial"] },
    { id: "urgency_detail", q: "Niveau de priorité ?", options: ["Urgent — aujourd'hui", "Sous 48h", "Cette semaine", "Quand disponible"] },
  ],
  _default: [
    { id: "type", q: "Décrivez votre besoin", options: ["Réparation", "Installation", "Entretien", "Diagnostic / Devis", "Urgence", "Autre"] },
    { id: "severity", q: "Niveau d'urgence ressenti ?", options: ["Critique - immédiat", "Important - aujourd'hui", "Modéré - cette semaine", "Pas urgent"] },
    { id: "access", q: "Informations d'accès ?", options: ["RDC / facile d'accès", "Étage avec ascenseur", "Étage sans ascenseur", "Autre"] },
  ],
};

export const URGENCY_LEVELS = [
  { id: "semaine",  label: "Non urgent",      sub: "Dans la semaine", iconName: "calendar-month-outline", mult: 1,   color: "#22C55E", bg: "#052E16" },
  { id: "2jours",   label: "Sous 2 jours",    sub: "48h max",         iconName: "calendar-week",           mult: 1.2, color: "#F59E0B", bg: "#451A03" },
  { id: "journee",  label: "Dans la journée", sub: "Aujourd'hui",     iconName: "lightning-bolt",          mult: 1.5, color: "#F97316", bg: "#431407" },
  { id: "express",  label: "Express",         sub: "< 2 heures",      iconName: "alert-octagram",          mult: 2,   color: "#EF4444", bg: "#450A0A" },
];

export const PROS = [
  { id:1, name:"Marc Dupont",   cat:"plomberie",     rating:4.9, reviews:234, distance:"1.2 km", distKm:1.2, time:"15 min", verified:true, premium:true,  price:85  },
  { id:2, name:"Sophie Martin", cat:"plomberie",     rating:4.7, reviews:189, distance:"2.8 km", distKm:2.8, time:"25 min", verified:true, premium:false, price:75  },
  { id:3, name:"Lucas Bernard", cat:"plomberie",     rating:4.8, reviews:312, distance:"3.5 km", distKm:3.5, time:"30 min", verified:true, premium:true,  price:90  },
  { id:4, name:"Jean Moreau",   cat:"electricite",   rating:4.6, reviews:156, distance:"1.8 km", distKm:1.8, time:"20 min", verified:true, premium:false, price:70  },
  { id:5, name:"Claire Petit",  cat:"nuisibles",     rating:5.0, reviews:98,  distance:"4.2 km", distKm:4.2, time:"35 min", verified:true, premium:true,  price:130 },
  { id:6, name:"Thomas Leroy",  cat:"serrurerie",    rating:4.8, reviews:276, distance:"0.8 km", distKm:0.8, time:"10 min", verified:true, premium:true,  price:95  },
  { id:7, name:"Alain Roche",   cat:"electromenager",rating:4.5, reviews:67,  distance:"3.1 km", distKm:3.1, time:"28 min", verified:true, premium:false, price:65  },
  { id:8, name:"Pierre Blanc",  cat:"depanneuse",    rating:4.9, reviews:445, distance:"5.0 km", distKm:5,   time:"18 min", verified:true, premium:true,  price:140 },
  { id:9, name:"Yves Garnier",  cat:"toiture",       rating:4.7, reviews:123, distance:"6.2 km", distKm:6.2, time:"40 min", verified:true, premium:false, price:115 },
  { id:10, name:"Nadia Faure",  cat:"autres",        rating:4.6, reviews:89,  distance:"2.0 km", distKm:2,   time:"22 min", verified:true, premium:false, price:55  },
];

export const PRO_PLANS = [
  { id:"free",  name:"Starter", price:0,     commission:20, features:["Profil basique","7 demandes/semaine","Support email"],                                     color:"#64748B" },
  { id:"pro",   name:"Pro",     price:29.99, commission:12, features:["Profil mis en avant","Illimité","Badge vérifié","Support prioritaire","Stats avancées"],      color:"#0891B2", popular:true },
  { id:"elite", name:"Élite",   price:59.99, commission:8,  features:["Position #1","Illimité","Badge Or","Support 24/7","Stats+CRM","Zone +20km"],                  color:"#D97706" },
];

// Commission par plan (Starter 20%, Pro 12%, Élite 8%)
export const PLAN_COMMISSION = { free: 0.20, pro: 0.12, elite: 0.08 };
export const COMMISSION_RATE = 0.12; // taux par défaut (plan Pro) utilisé côté client

export const MIN_TARIF = 60; // tarif minimum absolu en €

export const DAYS      = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
export const DAYS_FULL = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];

export const DEFAULT_SCHEDULE = DAYS.map((d, i) => ({
  day: d, dayFull: DAYS_FULL[i], enabled: i < 5,
  slots: i < 5 ? [{ start:"08:00", end:"12:00" }, { start:"14:00", end:"18:00" }] : [],
}));

export const DEFAULT_RADIUS_TIERS = [
  { id:1, from:0,  to:10, price:60,  satEnabled:true,  satPrice:90,  sunEnabled:true,  sunPrice:110, holidayEnabled:true,  holidayPrice:130 },
  { id:2, from:10, to:20, price:100, satEnabled:true,  satPrice:140, sunEnabled:true,  sunPrice:160, holidayEnabled:false, holidayPrice:190 },
  { id:3, from:20, to:35, price:150, satEnabled:false, satPrice:200, sunEnabled:false, sunPrice:220, holidayEnabled:false, holidayPrice:250 },
];
