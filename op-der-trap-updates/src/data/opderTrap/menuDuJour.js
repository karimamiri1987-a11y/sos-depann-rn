// ─── Café Op der Trap · Rombach-Martelange ───────────────────────────────
// Coordonnées de l'établissement
export const CAFE_INFO = {
  nom: 'Op der Trap',
  sousTitre: 'Bar & Vintage Bowling',
  adresse: '1, Rue des Tilleuls',
  cp: 'L-8832 Rombach Martelange',
  tel: '00352 23 640 626',
  telLien: '+35223640626',
};

// Horaires de service
export const HORAIRES = {
  fermeture: 'Fermé tous les lundis',
  menuJour: 'Menu du jour : du mardi au vendredi, 12h – 14h',
  spaghetti: 'Spaghetti : du mardi au vendredi, 12h – 14h',
  croque: 'Croque-monsieur : servi toute la journée',
  desserts: 'Coupes & desserts : du mardi au vendredi, 11h – 17h',
};

// ─── Menu de la semaine (mardi → vendredi) ───────────────────────────────
export const MENU_SEMAINE = [
  {
    id: 'mar',
    jour: 'Mardi',
    date: '2 Juin 2026',
    entree: 'Potage Maison',
    plat: 'Penne au Poulet',
  },
  {
    id: 'mer',
    jour: 'Mercredi',
    date: '3 Juin 2026',
    entree: 'Assiette Froide',
    plat: 'Lasagne Maison et Salade',
  },
  {
    id: 'jeu',
    jour: 'Jeudi',
    date: '4 Juin 2026',
    entree: 'Assiette Froide',
    plat: 'Cordon Bleu, Sauce Champignons, Frites Maison et Salade',
  },
  {
    id: 'ven',
    jour: 'Vendredi',
    date: '5 Juin 2026',
    entree: 'Potage Maison',
    plat: 'Petites Saucisses, Sauce Moutarde, Purée et Compote',
  },
];

// ─── Plats disponibles en permanence ─────────────────────────────────────
export const PLATS_PERMANENTS = [
  {
    id: 'spag',
    name: 'Spaghetti Bolognaise',
    desc: 'Servis du mardi au vendredi, de 12h à 14h',
    icon: '🍝',
  },
  {
    id: 'croque',
    name: 'Croque-Monsieur',
    desc: 'Servi toute la journée',
    icon: '🥪',
  },
];

// ─── Carte des desserts ──────────────────────────────────────────────────
export const DESSERTS = {
  suggestions: [
    {
      id: 'ds1',
      name: 'Le Dessert du Moment',
      desc: 'Mousse au Chocolat — une texture aérienne et un chocolat intensément gourmand',
      price: '6,00 €',
    },
    {
      id: 'ds2',
      name: 'La Coupe du Moment',
      desc: 'La Coupe Snickers — glace caramel, cacahuètes caramélisées, nappage caramel et sauce chocolat',
      price: '10,00 €',
    },
  ],
  classiques: [
    {
      id: 'dc1',
      name: 'Dame Blanche',
      desc: "L'incontournable : glace vanille, sauce chocolat chaud, chantilly, meringue et gaufrette",
      price: '8,00 €',
    },
    {
      id: 'dc2',
      name: 'Brésilienne',
      desc: "Caramel onctueux, croquant d'arachides caramélisées et chantilly",
      price: '8,00 €',
    },
    {
      id: 'dc3',
      name: 'La Coupe Colonne',
      desc: '2 boules de sorbet citron et vodka',
      price: '8,00 €',
    },
    {
      id: 'dc4',
      name: 'Café Liégeois',
      desc: 'Glace café, café froid et chantilly',
      price: '8,00 €',
    },
  ],
};

// ─── Formules proposées à la réservation ─────────────────────────────────
export const FORMULES = [
  {
    id: 'f_menu',
    name: 'Menu du jour (Entrée + Plat)',
    desc: 'Entrée et plat du jour — du mardi au vendredi, 12h–14h',
    price: '15,50 €',
    icon: '🍽️',
  },
  {
    id: 'f_menu_dessert',
    name: 'Menu du jour + Dessert du moment',
    desc: 'Entrée, plat du jour et dessert du moment',
    price: '21,50 €',
    icon: '🍽️',
  },
  {
    id: 'f_spag',
    name: 'Formule Spaghetti + Dessert du moment',
    desc: 'Spaghetti bolognaise et dessert du moment — 12h–14h',
    price: null,
    icon: '🍝',
  },
  {
    id: 'f_spag_seul',
    name: 'Spaghetti seul',
    desc: 'Une assiette de spaghetti bolognaise — 12h–14h',
    price: null,
    icon: '🍝',
  },
  {
    id: 'f_croque',
    name: 'Croque-monsieur',
    desc: 'Servi toute la journée',
    price: '6,50 €',
    icon: '🥪',
  },
];
