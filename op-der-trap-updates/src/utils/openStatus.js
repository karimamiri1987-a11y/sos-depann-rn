// ─── Statut d'ouverture en temps réel — Op der Trap ──────────────────────
// Horaires : mardi → dimanche, 08h00 – 01h00 (fermeture le lendemain à 1h).
// Fermé le lundi.
//
// getDay() : 0 = dimanche, 1 = lundi, … 6 = samedi.
const FR_DAYS   = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const OPEN_DAYS = [0, 2, 3, 4, 5, 6]; // tous les jours sauf lundi (1)
const OPEN_MIN  = 8 * 60;             // 08h00
const CLOSE_MIN = 1 * 60;             // 01h00 (le lendemain)

// Retourne { open: bool, label: string }.
export function getOpenStatus(now = new Date()) {
  const day  = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  const yesterday = (day + 6) % 7;

  // Ouvert en journée/soirée (08h00 → minuit du jour même)
  const openDaytime = OPEN_DAYS.includes(day) && mins >= OPEN_MIN;
  // Ouvert au petit matin (00h00 → 01h00) si la veille était un jour d'ouverture
  const openCarry = mins < CLOSE_MIN && OPEN_DAYS.includes(yesterday);

  if (openDaytime || openCarry) {
    return { open: true, label: 'Ouvert · ferme à 01h00' };
  }

  // Fermé : on cherche la prochaine ouverture.
  if (OPEN_DAYS.includes(day) && mins < OPEN_MIN) {
    return { open: false, label: "Fermé · ouvre aujourd'hui à 08h00" };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    if (OPEN_DAYS.includes(d)) {
      const quand = i === 1 ? 'demain' : FR_DAYS[d];
      return { open: false, label: `Fermé · ouvre ${quand} à 08h00` };
    }
  }
  return { open: false, label: 'Fermé' };
}

// Indice (0 = Lundi … 6 = Dimanche) du jour courant dans HORAIRES_SEMAINE.
export function todayHoursIndex(now = new Date()) {
  return (now.getDay() + 6) % 7;
}
