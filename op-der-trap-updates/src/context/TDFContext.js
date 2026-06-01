import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import * as SecureStore from 'expo-secure-store';
import { TDF_RIDERS, COUREURS_PAR_EQUIPE, RIDERS_BY_SLOT } from '../data/tdfRiders';

const TDFContext = createContext();

// Ancien stockage (limité à 2048 octets) — conservé pour migration.
const LEGACY_KEY = 'tdf_state_v2';
// Nouveau stockage : fichier JSON (aucune limite de taille).
const FILE_URI = FileSystem.documentDirectory + 'tdf_state_v2.json';

// Lecture du state persisté : fichier d'abord, puis migration SecureStore.
async function loadState() {
  try {
    const info = await FileSystem.getInfoAsync(FILE_URI);
    if (info.exists) {
      const raw = await FileSystem.readAsStringAsync(FILE_URI);
      return JSON.parse(raw);
    }
  } catch {}
  // Migration depuis l'ancien SecureStore (données saisies avant la mise à jour).
  try {
    const raw = await SecureStore.getItemAsync(LEGACY_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      await FileSystem.writeAsStringAsync(FILE_URI, raw).catch(() => {});
      await SecureStore.deleteItemAsync(LEGACY_KEY).catch(() => {});
      return saved;
    }
  } catch {}
  return null;
}

async function saveState(state) {
  try {
    await FileSystem.writeAsStringAsync(FILE_URI, JSON.stringify(state));
  } catch {}
}

// Nombre de participants requis avant de pouvoir lancer le tirage
export const NB_PARTICIPANTS_REQUIS = 23;

// Barème de points
export const POINTS = { p1: 5, p2: 3, p3: 1, combatif: 4 };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Distribution par "slot" : pour chaque position (favori, 2ᵉ, …, 8ᵉ),
// on mélange les 23 coureurs concernés et on en attribue un à chaque participant.
// Chaque participant reçoit ainsi 8 coureurs : un favori (dossard finissant
// par 1), un coureur finissant par 2, etc., répartis aléatoirement.
function distributeDraw(participants) {
  const draw = {};
  participants.forEach(p => { draw[p.id] = []; });
  for (let slot = 0; slot < COUREURS_PAR_EQUIPE; slot++) {
    const pot = shuffle(RIDERS_BY_SLOT[slot]);
    participants.forEach((p, idx) => {
      const rider = pot[idx];
      if (rider) draw[p.id].push(rider.id);
    });
  }
  return draw;
}

// Calcule { participantId: totalPoints }
function computeScores(participants, draw, stageResults) {
  const scores = {};
  participants.forEach(p => { scores[p.id] = 0; });

  Object.values(stageResults).forEach(result => {
    if (!result) return;
    participants.forEach(p => {
      const myRiders = draw[p.id] || [];
      if (result.p1 && myRiders.includes(result.p1)) scores[p.id] += POINTS.p1;
      if (result.p2 && myRiders.includes(result.p2)) scores[p.id] += POINTS.p2;
      if (result.p3 && myRiders.includes(result.p3)) scores[p.id] += POINTS.p3;
      if (result.combatif && myRiders.includes(result.combatif)) scores[p.id] += POINTS.combatif;
    });
  });
  return scores;
}

export function TDFProvider({ children }) {
  const [participants, setParticipants] = useState([]);
  const [draw, setDraw] = useState({});
  const [stageResults, setStageResults] = useState({});
  const [loaded, setLoaded] = useState(false);

  // Chargement de l'état persisté
  useEffect(() => {
    (async () => {
      const saved = await loadState();
      if (saved) {
        if (saved.participants?.length) setParticipants(saved.participants);
        if (saved.draw) setDraw(saved.draw);
        if (saved.stageResults) setStageResults(saved.stageResults);
      }
      setLoaded(true);
    })();
  }, []);

  // Sauvegarde à chaque changement
  useEffect(() => {
    if (!loaded) return;
    saveState({ participants, draw, stageResults });
  }, [participants, draw, stageResults, loaded]);

  const addParticipant = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setParticipants(prev => {
      if (prev.length >= NB_PARTICIPANTS_REQUIS) return prev; // liste pleine
      return [...prev, { id: `p${Date.now()}`, name: trimmed }];
    });
    setDraw({}); // un changement de liste annule le tirage
  }, []);

  const removeParticipant = useCallback((id) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
    setDraw({});
  }, []);

  const performDraw = useCallback(() => {
    if (participants.length !== NB_PARTICIPANTS_REQUIS) return;
    setDraw(distributeDraw(participants));
  }, [participants]);

  const setStageResult = useCallback((stageId, result) => {
    setStageResults(prev => ({ ...prev, [stageId]: result }));
  }, []);

  const clearStageResult = useCallback((stageId) => {
    setStageResults(prev => {
      const next = { ...prev };
      delete next[stageId];
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setParticipants([]);
    setDraw({});
    setStageResults({});
  }, []);

  const scores = computeScores(participants, draw, stageResults);

  const rankedParticipants = [...participants]
    .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));

  const isComplete = participants.length === NB_PARTICIPANTS_REQUIS;
  const hasDraw = participants.length > 0 && Object.keys(draw).length > 0;

  return (
    <TDFContext.Provider value={{
      participants, draw, stageResults, scores, rankedParticipants,
      hasDraw, isComplete, loaded,
      nbRequis: NB_PARTICIPANTS_REQUIS,
      coureursParJoueur: COUREURS_PAR_EQUIPE,
      totalCoureurs: TDF_RIDERS.length,
      addParticipant, removeParticipant, performDraw,
      setStageResult, clearStageResult, resetAll,
    }}>
      {children}
    </TDFContext.Provider>
  );
}

export const useTDF = () => useContext(TDFContext);
