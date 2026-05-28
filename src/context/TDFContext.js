import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { TDF_RIDERS } from '../data/tdfRiders';

const TDFContext = createContext();

const KEY = 'tdf_state_v1';

const DEMO_PARTICIPANTS = [
  { id: 'p1', name: 'Marcel' },
  { id: 'p2', name: 'Jean-Pierre' },
  { id: 'p3', name: 'Sophie' },
  { id: 'p4', name: 'Kurt' },
  { id: 'p5', name: 'Anne' },
  { id: 'p6', name: 'Luc' },
];

// Pre-filled demo results for stages 1-4
const DEMO_STAGES = {
  s1: { p1: 'r3', p2: 'r2', p3: 'r4' },
  s2: { p1: 'r11', p2: 'r12', p3: 'r15' },
  s3: { p1: 'r12', p2: 'r11', p3: 'r16' },
  s4: { p1: 'r1',  p2: 'r2',  p3: 'r3'  },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function distributeDraw(participants, riders) {
  const shuffled = shuffle(riders);
  const draw = {};
  participants.forEach(p => { draw[p.id] = []; });
  shuffled.forEach((rider, idx) => {
    const participant = participants[idx % participants.length];
    draw[participant.id].push(rider.id);
  });
  return draw;
}

// Returns { participantId: totalPoints, ... }
function computeScores(participants, draw, stageResults) {
  const scores = {};
  participants.forEach(p => { scores[p.id] = 0; });

  Object.values(stageResults).forEach(result => {
    if (!result) return;
    participants.forEach(p => {
      const myRiders = draw[p.id] || [];
      if (myRiders.includes(result.p1)) scores[p.id] += 5;
      if (myRiders.includes(result.p2)) scores[p.id] += 3;
      if (myRiders.includes(result.p3)) scores[p.id] += 1;
    });
  });
  return scores;
}

export function TDFProvider({ children }) {
  const [participants, setParticipants] = useState(DEMO_PARTICIPANTS);
  const [draw, setDraw] = useState({});
  const [stageResults, setStageResults] = useState(DEMO_STAGES);
  const [loaded, setLoaded] = useState(false);

  // Load persisted state
  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.participants?.length) setParticipants(saved.participants);
          if (saved.draw) setDraw(saved.draw);
          if (saved.stageResults) setStageResults(saved.stageResults);
        }
      } catch {}
      setLoaded(true);
    })();
  }, []);

  // Persist state whenever it changes
  useEffect(() => {
    if (!loaded) return;
    SecureStore.setItemAsync(KEY, JSON.stringify({ participants, draw, stageResults })).catch(() => {});
  }, [participants, draw, stageResults, loaded]);

  const addParticipant = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setParticipants(prev => [...prev, { id: `p${Date.now()}`, name: trimmed }]);
    setDraw({});
  }, []);

  const removeParticipant = useCallback((id) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
    setDraw(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const performDraw = useCallback(() => {
    if (participants.length === 0) return;
    const newDraw = distributeDraw(participants, TDF_RIDERS);
    setDraw(newDraw);
  }, [participants]);

  const setStageResult = useCallback((stageId, p1, p2, p3) => {
    setStageResults(prev => ({ ...prev, [stageId]: { p1, p2, p3 } }));
  }, []);

  const clearStageResult = useCallback((stageId) => {
    setStageResults(prev => {
      const next = { ...prev };
      delete next[stageId];
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setParticipants(DEMO_PARTICIPANTS);
    setDraw({});
    setStageResults(DEMO_STAGES);
  }, []);

  const scores = computeScores(participants, draw, stageResults);

  const rankedParticipants = [...participants]
    .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));

  const hasDraw = participants.length > 0 && Object.keys(draw).length > 0;

  return (
    <TDFContext.Provider value={{
      participants, draw, stageResults, scores, rankedParticipants,
      hasDraw, loaded,
      addParticipant, removeParticipant, performDraw,
      setStageResult, clearStageResult, resetAll,
    }}>
      {children}
    </TDFContext.Provider>
  );
}

export const useTDF = () => useContext(TDFContext);
