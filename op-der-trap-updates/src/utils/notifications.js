// Utilitaire de notifications locales (rappels de réservation).
//
// ⚠️ Nécessite le package expo-notifications :
//     npx expo install expo-notifications
//
// Le require est protégé : si le package n'est pas (encore) installé,
// toutes les fonctions deviennent des no-ops et l'app ne plante pas.
//
// Les rappels locaux fonctionnent dans Expo Go ET dans un build de dev.
// Les notifications PUSH à distance (envoyées par le café) nécessitent
// en plus un serveur + un build de développement — voir NOTIFICATIONS.md.

import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import Constants from 'expo-constants';

let Notifications = null;
try {
  // eslint-disable-next-line global-require
  Notifications = require('expo-notifications');
} catch {
  Notifications = null;
}

let handlerSet = false;

export function isAvailable() {
  return !!Notifications;
}

// À appeler une fois au démarrage de l'app.
export async function initNotifications() {
  if (!Notifications) return;
  try {
    if (!handlerSet) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      handlerSet = true;
    }
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('reservations', {
        name: 'Rappels de réservation',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 100, 80, 120],
        lightColor: '#1B3A2D',
      });
    }
  } catch {}
}

// Demande la permission (renvoie true si accordée).
export async function ensurePermissions() {
  if (!Notifications) return false;
  try {
    const settings = await Notifications.getPermissionsAsync();
    let status = settings.status;
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    return status === 'granted';
  } catch {
    return false;
  }
}

// Construit le message d'un rappel selon le type de réservation.
function buildContent(res, when) {
  const isBowling = res.type === 'bowling';
  const heure = res.time || '';
  const title = isBowling ? '🎳 Rappel bowling — Op der Trap' : '🍽️ Rappel réservation — Op der Trap';
  let body;
  if (isBowling) {
    body = `Votre partie de bowling est à ${heure} (${res.players || ''} joueur(s)).`;
  } else if (res.mode === 'emporter') {
    body = `Votre commande à emporter est à récupérer à ${heure}.`;
  } else {
    body = `Votre table est réservée à ${heure}${res.guests > 0 ? ` pour ${res.guests} personne(s)` : ''}.`;
  }
  return { title, body, data: { reservationId: res.id }, channelId: 'reservations' };
}

// Programme les rappels d'une réservation. Renvoie la liste des IDs créés.
// Deux rappels : la veille à 18h00, et 2h avant l'heure.
export async function scheduleReservationReminders(res) {
  if (!Notifications || !res || !res.whenISO) return [];
  const granted = await ensurePermissions();
  if (!granted) return [];

  const when = new Date(res.whenISO);
  if (isNaN(when.getTime())) return [];
  const now = Date.now();
  const ids = [];

  const triggers = [];

  // 2h avant
  const h2 = new Date(when.getTime() - 2 * 60 * 60 * 1000);
  if (h2.getTime() > now + 60 * 1000) {
    triggers.push({ date: h2, prefix: '⏰ Dans 2h — ' });
  }

  // La veille à 18h00 (si la réservation est au moins le lendemain)
  const veille = new Date(when);
  veille.setDate(veille.getDate() - 1);
  veille.setHours(18, 0, 0, 0);
  if (veille.getTime() > now + 60 * 1000 && veille.getTime() < h2.getTime()) {
    triggers.push({ date: veille, prefix: '📅 Demain — ' });
  }

  for (const t of triggers) {
    try {
      const content = buildContent(res, when);
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: t.prefix + content.body,
          data: content.data,
        },
        trigger:
          Platform.OS === 'android'
            ? { type: 'date', date: t.date, channelId: 'reservations' }
            : { type: 'date', date: t.date },
      });
      ids.push(id);
    } catch {}
  }
  return ids;
}

// Enregistre le token push de l'appareil dans Supabase (upsert par token).
export async function registerPushToken(profile) {
  if (!Notifications) return;
  try {
    const granted = await ensurePermissions();
    if (!granted) return;
    // Expo SDK 53+ exige le projectId — on le lit depuis la config EAS injectée au build
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;
    const result = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : {}
    );
    const token = result?.data;
    if (!token) return;
    await supabase.from('push_tokens').upsert(
      {
        token,
        prenom: profile?.prenom || '',
        nom:    profile?.nom    || '',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'token' }
    );
  } catch {}
}

// Annule une liste de rappels.
export async function cancelReminders(ids) {
  if (!Notifications || !Array.isArray(ids)) return;
  for (const id of ids) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {}
  }
}
