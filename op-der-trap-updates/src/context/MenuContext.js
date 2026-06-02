import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../lib/supabase';

// Données statiques en fallback (si pas de réseau au premier lancement)
import {
  MENU_SEMAINE as STATIC_MENU,
  FORMULES as STATIC_FORMULES,
  DESSERTS as STATIC_DESSERTS,
  PLATS_PERMANENTS as STATIC_PLATS,
} from '../data/opderTrap/menuDuJour';
import { EVENTS as STATIC_EVENTS, BOWLING as STATIC_BOWLING } from '../data/opderTrap/eventsData';

const MenuContext = createContext(null);
const CACHE_URI = FileSystem.documentDirectory + 'menu_cache.json';

function buildFallback() {
  return {
    menu: STATIC_MENU,
    formules: STATIC_FORMULES.map(f => ({ ...f, maxParJour: 0 })),
    desserts: STATIC_DESSERTS,
    plats: STATIC_PLATS,
    events: STATIC_EVENTS,
    tarifBowling: STATIC_BOWLING.tarifHeure,
    cafeEmail: '',
    cafeFacebook: '',
    cafeInstagram: '',
    adminPin: '1234',
  };
}

async function loadCache() {
  try {
    const info = await FileSystem.getInfoAsync(CACHE_URI);
    if (info.exists) {
      const raw = await FileSystem.readAsStringAsync(CACHE_URI);
      return JSON.parse(raw);
    }
  } catch {}
  return null;
}

async function saveCache(data) {
  try {
    await FileSystem.writeAsStringAsync(CACHE_URI, JSON.stringify(data));
  } catch {}
}

async function fetchFromSupabase() {
  const [menu, formules, desserts, plats, events, settings] = await Promise.all([
    supabase.from('menu_semaine').select('*').order('ordre'),
    supabase.from('formules').select('*').eq('actif', true).order('ordre'),
    supabase.from('desserts').select('*').eq('actif', true).order('ordre'),
    supabase.from('plats_permanents').select('*').eq('actif', true).order('ordre'),
    supabase.from('events').select('*').eq('actif', true).order('ordre'),
    supabase.from('settings').select('*'),
  ]);

  if (menu.error || formules.error) throw new Error('Supabase fetch failed');

  const settingsMap = {};
  (settings.data || []).forEach(r => { settingsMap[r.key] = r.value; });

  const dessertsData = desserts.data || [];
  return {
    menu: (menu.data || []).map(r => ({
      id: r.id, jour: r.jour, date: r.date_str, entree: r.entree, plat: r.plat,
    })),
    formules: (formules.data || []).map(r => ({
      id: r.id, name: r.name, desc: r.desc_fr, price: r.price, icon: r.icon,
      maxParJour: r.max_par_jour || 0,
    })),
    desserts: {
      suggestions: dessertsData.filter(d => d.groupe === 'suggestion').map(r => ({
        id: r.id, name: r.name, desc: r.desc_fr, price: r.price,
      })),
      classiques: dessertsData.filter(d => d.groupe === 'classique').map(r => ({
        id: r.id, name: r.name, desc: r.desc_fr, price: r.price,
      })),
    },
    plats: (plats.data || []).map(r => ({
      id: r.id, name: r.name, desc: r.desc_fr, icon: r.icon,
    })),
    events: (events.data || []).map(r => ({
      id: r.id, title: r.title, date: r.date_str, time: r.time_str,
      desc: r.desc_fr, icon: r.icon, color: r.color, price: r.price, spots: r.spots,
    })),
    tarifBowling: parseFloat(settingsMap['tarif_bowling_heure'] || '8'),
    cafeEmail:    settingsMap['cafe_email']    || '',
    cafeFacebook: settingsMap['cafe_facebook'] || '',
    cafeInstagram:settingsMap['cafe_instagram']|| '',
    adminPin:     settingsMap['admin_pin']     || '1234',
  };
}

export function MenuProvider({ children }) {
  const [data, setData] = useState(buildFallback());
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const fresh = await fetchFromSupabase();
      setData(fresh);
      setLastSync(new Date());
      await saveCache(fresh);
    } catch {
      const cached = await loadCache();
      if (cached) setData(cached);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Charge le cache immédiatement (affichage instantané)
    loadCache().then(cached => {
      if (cached) setData(cached);
    });
    // Puis synchronise avec Supabase
    refresh();
  }, [refresh]);

  // Sauvegarde admin : écrit dans Supabase puis met à jour le cache
  const adminUpdate = useCallback(async (table, updates) => {
    const { error } = await supabase.from(table).upsert(updates);
    if (error) throw error;
    await refresh();
  }, [refresh]);

  const adminUpdateSetting = useCallback(async (key, value) => {
    const { error } = await supabase.from('settings').upsert({ key, value });
    if (error) throw error;
    await refresh();
  }, [refresh]);

  return (
    <MenuContext.Provider value={{ ...data, loading, lastSync, refresh, adminUpdate, adminUpdateSetting }}>
      {children}
    </MenuContext.Provider>
  );
}

export const useMenu = () => useContext(MenuContext);
