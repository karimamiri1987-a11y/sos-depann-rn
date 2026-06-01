import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { scheduleReservationReminders, cancelReminders } from '../utils/notifications';

const ReservationsContext = createContext(null);
const FILE_URI = FileSystem.documentDirectory + 'reservations.json';

export function ReservationsProvider({ children }) {
  const [reservations, setReservations] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Miroir synchrone pour lire les notifIds sans dépendances stale.
  const resRef = useRef([]);
  useEffect(() => { resRef.current = reservations; }, [reservations]);

  useEffect(() => {
    (async () => {
      try {
        const info = await FileSystem.getInfoAsync(FILE_URI);
        if (info.exists) {
          const raw = await FileSystem.readAsStringAsync(FILE_URI);
          const data = JSON.parse(raw);
          if (Array.isArray(data)) setReservations(data);
        }
      } catch {}
      setLoaded(true);
    })();
  }, []);

  const persist = useCallback(async (list) => {
    try {
      await FileSystem.writeAsStringAsync(FILE_URI, JSON.stringify(list));
    } catch {}
  }, []);

  // Met à jour les notifIds d'une réservation après planification asynchrone.
  const attachNotifIds = useCallback((id, ids) => {
    if (!ids || !ids.length) return;
    setReservations(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, notifIds: ids } : r);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const addReservation = useCallback((data) => {
    const entry = {
      id: `R-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      ...data,
    };
    setReservations(prev => {
      const updated = [entry, ...prev];
      persist(updated);
      return updated;
    });
    // Programmer les rappels (asynchrone, sans bloquer).
    scheduleReservationReminders(entry)
      .then(ids => attachNotifIds(entry.id, ids))
      .catch(() => {});
    return entry.id;
  }, [persist, attachNotifIds]);

  const updateReservation = useCallback((id, data) => {
    const existing = resRef.current.find(r => r.id === id);
    // Annuler les anciens rappels.
    if (existing?.notifIds) cancelReminders(existing.notifIds);

    const merged = { ...existing, ...data, updatedAt: new Date().toISOString(), notifIds: [] };
    setReservations(prev => {
      const updated = prev.map(r => r.id === id ? merged : r);
      persist(updated);
      return updated;
    });
    // Reprogrammer les rappels avec les nouvelles infos.
    scheduleReservationReminders(merged)
      .then(ids => attachNotifIds(id, ids))
      .catch(() => {});
  }, [persist, attachNotifIds]);

  const cancelReservation = useCallback((id) => {
    const existing = resRef.current.find(r => r.id === id);
    if (existing?.notifIds) cancelReminders(existing.notifIds);
    setReservations(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, status: 'cancelled', notifIds: [] } : r);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const deleteReservation = useCallback((id) => {
    const existing = resRef.current.find(r => r.id === id);
    if (existing?.notifIds) cancelReminders(existing.notifIds);
    setReservations(prev => {
      const updated = prev.filter(r => r.id !== id);
      persist(updated);
      return updated;
    });
  }, [persist]);

  return (
    <ReservationsContext.Provider value={{ reservations, addReservation, updateReservation, cancelReservation, deleteReservation, loaded }}>
      {children}
    </ReservationsContext.Provider>
  );
}

export const useReservations = () => useContext(ReservationsContext);
