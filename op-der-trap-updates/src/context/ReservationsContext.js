import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as FileSystem from 'expo-file-system/legacy';

const ReservationsContext = createContext(null);
const FILE_URI = FileSystem.documentDirectory + 'reservations.json';

export function ReservationsProvider({ children }) {
  const [reservations, setReservations] = useState([]);
  const [loaded, setLoaded] = useState(false);

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
    return entry.id;
  }, [persist]);

  const cancelReservation = useCallback((id) => {
    setReservations(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const updateReservation = useCallback((id, data) => {
    setReservations(prev => {
      const updated = prev.map(r =>
        r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
      );
      persist(updated);
      return updated;
    });
  }, [persist]);

  const deleteReservation = useCallback((id) => {
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
