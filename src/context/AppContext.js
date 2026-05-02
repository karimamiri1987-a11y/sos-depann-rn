import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { DEFAULT_SCHEDULE, DEFAULT_RADIUS_TIERS, MIN_TARIF } from '../constants/data';

const AppContext = createContext();

const KEYS = {
  proUser:         'pro_user',
  schedule:        'pro_schedule',
  radiusTiers:     'pro_radius_tiers',
  urgencySettings: 'pro_urgency_settings',
  calendarSync:    'pro_calendar_sync',
  interventions:   'pro_interventions',
};

async function load(key) {
  try {
    const raw = await SecureStore.getItemAsync(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function save(key, value) {
  try { await SecureStore.setItemAsync(key, JSON.stringify(value)); } catch {}
}

async function remove(key) {
  try { await SecureStore.deleteItemAsync(key); } catch {}
}

export function AppProvider({ children }) {
  const [hydrated, setHydrated] = useState(false);

  const [proUser,            setProUserState]      = useState(null);
  const [schedule,           setSchedule]          = useState(DEFAULT_SCHEDULE);
  const [radiusTiers,        setRadiusTiers]        = useState(DEFAULT_RADIUS_TIERS);
  const [proUrgencySettings, setProUrgencySettings] = useState({
    semaine: { enabled: true },
    '2jours': { enabled: true },
    journee:  { enabled: true },
    express:  { enabled: false },
  });

  const [calendarSync,  setCalendarSyncState] = useState(false);
  const [interventions, setInterventions]    = useState([]);
  const [pendingOffers, setPendingOffers]    = useState([]);
  const [activeSearch,  setActiveSearchState] = useState(null);

  const [user,          setUser]             = useState(null);
  const [proOffer,      setProOfferState]    = useState(null);
  const [clientRequest, setClientRequestState] = useState(null);

  // ── Hydratation au démarrage ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const [u, s, r, p, c, inv] = await Promise.all([
        load(KEYS.proUser),
        load(KEYS.schedule),
        load(KEYS.radiusTiers),
        load(KEYS.urgencySettings),
        load(KEYS.calendarSync),
        load(KEYS.interventions),
      ]);
      if (u)   setProUserState(u);
      if (s)   setSchedule(s);
      if (r)   setRadiusTiers(r);
      if (p)   setProUrgencySettings(p);
      if (c !== null) setCalendarSyncState(c);
      if (inv) setInterventions(inv);
      setHydrated(true);
    })();
  }, []);

  // ── Persistance automatique après hydratation ─────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    if (proUser) save(KEYS.proUser, proUser);
    else         remove(KEYS.proUser);
  }, [proUser, hydrated]);

  useEffect(() => {
    if (hydrated) save(KEYS.schedule, schedule);
  }, [schedule, hydrated]);

  useEffect(() => {
    if (hydrated) save(KEYS.radiusTiers, radiusTiers);
  }, [radiusTiers, hydrated]);

  useEffect(() => {
    if (hydrated) save(KEYS.urgencySettings, proUrgencySettings);
  }, [proUrgencySettings, hydrated]);

  useEffect(() => {
    if (hydrated) save(KEYS.calendarSync, calendarSync);
  }, [calendarSync, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    // Les URIs de photos dépassent la limite de 2048 bytes de SecureStore —
    // on ne persiste que les métadonnées (les URIs restent en mémoire session).
    const slim = interventions.map(({ photos, proPhotos, ...rest }) => rest);
    save(KEYS.interventions, slim);
  }, [interventions, hydrated]);

  // ── Horaires ─────────────────────────────────────────────────────────────
  const toggleDay = (idx) =>
    setSchedule(p => p.map((d, i) => i === idx
      ? { ...d, enabled: !d.enabled, slots: !d.enabled ? [{ start: '08:00', end: '18:00' }] : [] }
      : d));

  const updateSlot = (di, si, f, v) =>
    setSchedule(p => p.map((d, i) => i === di
      ? { ...d, slots: d.slots.map((s, j) => j === si ? { ...s, [f]: v } : s) }
      : d));

  const addSlot = (di) =>
    setSchedule(p => p.map((d, i) => i === di
      ? { ...d, slots: [...d.slots, { start: '14:00', end: '18:00' }] }
      : d));

  const removeSlot = (di, si) =>
    setSchedule(p => p.map((d, i) => i === di
      ? { ...d, slots: d.slots.filter((_, j) => j !== si) }
      : d));

  // ── Zones tarifaires ──────────────────────────────────────────────────────
  const updateTier = (id, f, v) =>
    setRadiusTiers(p => p.map(t => t.id === id
      ? { ...t, [f]: typeof v === 'boolean' ? v : Number(v) }
      : t));

  const addTier = () => {
    const l = radiusTiers[radiusTiers.length - 1];
    const base = Math.max(MIN_TARIF, l.price + 50);
    setRadiusTiers(p => [...p, {
      id: Date.now(), from: l.to, to: l.to + 15, price: base,
      satEnabled: false, satPrice: Math.round(base * 1.4),
      sunEnabled: false, sunPrice: Math.round(base * 1.6),
      holidayEnabled: false, holidayPrice: Math.round(base * 1.8),
    }]);
  };

  const removeTier = (id) => {
    if (radiusTiers.length <= 1) return;
    setRadiusTiers(p => p.filter(t => t.id !== id));
  };

  // ── Interventions ─────────────────────────────────────────────────────────
  const addIntervention = (intervention) =>
    setInterventions(p => [intervention, ...p].slice(0, 100));

  const completeIntervention = (id, proPhotos = []) =>
    setInterventions(p => p.map(i => i.id === id
      ? { ...i, status: 'completed', proPhotos, completedAt: new Date().toISOString() }
      : i));

  // ── Mise en attente / relance ─────────────────────────────────────────────
  const addPendingOffer = (offer) =>
    setPendingOffers(p => [...p, { ...offer, heldAt: Date.now(), heldUntil: Date.now() + 20 * 60 * 1000 }]);

  const removePendingOffer = (id) =>
    setPendingOffers(p => p.filter(o => o.id !== id));

  const clearPendingOffers = () => setPendingOffers([]);

  const setActiveSearch = (params) => setActiveSearchState(params);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const loginPro  = (userData) => setProUserState(userData);
  const logoutPro = () => setProUserState(null);
  const loginUser  = (userData) => setUser(userData);
  const logoutUser = () => setUser(null);

  // ── Devis / Demande ───────────────────────────────────────────────────────
  const setProOffer      = (offer) => setProOfferState(offer);
  const clearProOffer    = () => setProOfferState(null);
  const setClientRequest = (req) => setClientRequestState(req);
  const setCalendarSync  = (val) => setCalendarSyncState(val);

  if (!hydrated) return null; // attend la restauration avant de rendre l'UI

  return (
    <AppContext.Provider value={{
      proUser, loginPro, logoutPro,
      user, loginUser, logoutUser,
      proOffer, setProOffer, clearProOffer,
      clientRequest, setClientRequest,
      calendarSync, setCalendarSync,
      interventions, addIntervention, completeIntervention,
      pendingOffers, addPendingOffer, removePendingOffer, clearPendingOffers,
      activeSearch, setActiveSearch,
      schedule, radiusTiers, proUrgencySettings,
      setProUrgencySettings,
      toggleDay, updateSlot, addSlot, removeSlot,
      updateTier, addTier, removeTier,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
