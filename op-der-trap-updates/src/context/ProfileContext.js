import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as FileSystem from 'expo-file-system/legacy';

const ProfileContext = createContext();
const FILE_URI = FileSystem.documentDirectory + 'profile.json';

const EMPTY = { prenom: '', nom: '', phone: '', email: '', notifEnabled: true };

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const info = await FileSystem.getInfoAsync(FILE_URI);
        if (info.exists) {
          const raw = await FileSystem.readAsStringAsync(FILE_URI);
          setProfile({ ...EMPTY, ...JSON.parse(raw) });
        }
      } catch {}
      setLoaded(true);
    })();
  }, []);

  const saveProfile = useCallback(async (data) => {
    const next = { ...EMPTY, ...data };
    setProfile(next);
    try {
      await FileSystem.writeAsStringAsync(FILE_URI, JSON.stringify(next));
    } catch {}
  }, []);

  const hasProfile = !!(profile.prenom.trim() && profile.phone.trim());

  return (
    <ProfileContext.Provider value={{ profile, saveProfile, hasProfile, loaded }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
