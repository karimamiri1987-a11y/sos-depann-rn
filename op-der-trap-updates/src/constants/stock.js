// Ressources consommées par chaque formule lors d'une réservation.
// menu      = une portion de menu du jour (entrée+plat) → partagée par f_menu ET f_menu_dessert
// spaghetti = une portion de spaghetti → partagée par f_spag ET f_spag_seul
// dessert   = un dessert → partagé par f_menu_dessert ET f_spag
// f_croque  = illimité (pas de limite de stock)
export const RESOURCE_CONSUMPTION = {
  f_menu:         { menu: 1 },
  f_menu_dessert: { menu: 1, dessert: 1 },
  f_spag:         { spaghetti: 1, dessert: 1 },
  f_spag_seul:    { spaghetti: 1 },
  f_croque:       {},
};
