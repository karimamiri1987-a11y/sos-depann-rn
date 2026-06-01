export const MENU_DU_JOUR = {
  date: 'Lundi 2 Juin 2026',
  entrees: [
    { id: 'e1', name: 'Salade de chèvre chaud',    desc: 'Noix, miel, mesclun maison',        badge: null },
    { id: 'e2', name: 'Soupe du jour',              desc: 'Potage de légumes frais du jardin',  badge: null },
    { id: 'e3', name: 'Croquettes aux crevettes',  desc: 'Crevettes grises, salade verte',     badge: '⭐ Maison' },
  ],
  plats: [
    { id: 'p1', name: 'Carbonade flamande',    desc: 'Frites maison, salade fraîche',       badge: '🇧🇪 Spécialité' },
    { id: 'p2', name: 'Pavé de saumon',        desc: 'Sauce vierge aux herbes, riz pilaf',  badge: null },
    { id: 'p3', name: 'Steak 200g',            desc: 'Sauce béarnaise, frites maison',      badge: null },
    { id: 'p4', name: 'Tomates-crevettes',     desc: 'Mayonnaise maison, pain gris',        badge: '🌿 Léger' },
  ],
  desserts: [
    { id: 'd1', name: 'Dame blanche',           desc: 'Glace vanille, sauce chocolat chaud', badge: null },
    { id: 'd2', name: 'Mousse au chocolat',     desc: 'Chocolat belge Callebaut',            badge: '🇧🇪' },
    { id: 'd3', name: 'Tarte du jour',          desc: 'Fruits de saison, crème fraîche',     badge: null },
  ],
  formules: [
    { id: 'f1', name: 'Entrée + Plat',          price: '18.50€', popular: false },
    { id: 'f2', name: 'Plat + Dessert',         price: '17.50€', popular: false },
    { id: 'f3', name: 'Menu Complet',           price: '24.00€', popular: true  },
  ],
};
