import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Vibration } from 'react-native';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

// ── Configuration handler (notifications visibles même app ouverte) ──
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ── Son d'alarme (instance globale) ──
let alarmSound = null;
let vibrationInterval = null;

// ── Demande de permissions ──
export async function requestNotificationPermissions() {
  if (!Device.isDevice) {
    console.log('Notifications: émulateur détecté, simulation activée');
    return true;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('pro-requests', {
      name: "Demandes d'intervention",
      description: 'Alertes pour les nouvelles demandes clients',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 300, 200, 300],
      lightColor: '#DC2626',
      sound: 'default',
      enableVibrate: true,
      bypassDnd: true, // Priorité absolue, passe le mode Ne pas déranger
    });
  }

  return finalStatus === 'granted';
}

// ── Envoi de la notification système ──
export async function sendProRequestNotification({ catLabel, urgencyLabel, clientLocation, catId, urgencyId, deposit }) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const notifData = { type: 'pro_request', catId, urgencyId, deposit, clientLocation };

  // Notification immédiate (choc visuel + son système)
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `[!] Nouvelle demande − ${catLabel}`,
      body: `${urgencyLabel} · ${clientLocation}`,
      data: notifData,
      sound: true,
      priority: 'max',
      ...(Platform.OS === 'android' && { channelId: 'pro-requests' }),
    },
    trigger: null,
  });

  // Rappels toutes les 8 secondes tant que pas de réponse (max 10 rappels)
  for (let i = 1; i <= 10; i++) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `En attente de ta réponse (${i}/10)`,
        body: `${catLabel} · Client en attente !`,
        data: notifData,
        sound: true,
        priority: 'max',
        ...(Platform.OS === 'android' && { channelId: 'pro-requests' }),
      },
      trigger: { seconds: i * 8 },
    });
  }
}

// ── Annuler seulement les notifications système (pas l'alarme) ──
export async function cancelScheduledNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ── Rappel 2h avant une intervention planifiée (semaine / 2jours) ──
export async function scheduleInterventionReminder({ catLabel, scheduledDate, scheduledTime, clientLocation }) {
  try {
    // scheduledDate = "DD/MM/YYYY", scheduledTime = "10h - 12h"
    const [day, month, year] = scheduledDate.split('/').map(Number);
    const startHour = parseInt(scheduledTime.split('h')[0], 10);
    const reminderDate = new Date(year, month - 1, day, startHour - 2, 0, 0);
    if (reminderDate <= new Date()) return; // déjà passé

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Rappel — ${catLabel} dans 2h`,
        body: `${scheduledTime} · ${clientLocation}`,
        data: { type: 'intervention_reminder' },
        sound: true,
        priority: 'high',
        ...(Platform.OS === 'android' && { channelId: 'pro-requests' }),
      },
      trigger: { date: reminderDate },
    });
  } catch {}
}

// ── Notification de fin d'intervention (simule la réception côté client) ──
export async function sendCompletionNotification({ catLabel }) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Intervention terminée — ${catLabel}`,
        body: 'Le professionnel a marqué votre intervention comme terminée. Confirmez et laissez un avis !',
        data: { type: 'intervention_completed' },
        sound: true,
        priority: 'high',
        ...(Platform.OS === 'android' && { channelId: 'pro-requests' }),
      },
      trigger: null,
    });
  } catch {}
}

// ── Démarrer l'alarme in-app (son + vibration en boucle) ──
export async function startAlarm() {
  try {
    await setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true, // Joue même si iPhone en silencieux
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
    });

    // ⬇ Remplace par require('../../assets/sounds/alarm.mp3') si tu as le fichier
    alarmSound = createAudioPlayer({ uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3' });
    alarmSound.loop   = true;
    alarmSound.volume = 1.0;
    alarmSound.play();
  } catch (e) {
    // Fallback : vibration si le son ne charge pas
    console.log('Son non disponible, fallback vibration');
  }

  // Vibration en boucle (fonctionne sur tous les appareils)
  const PATTERN = Platform.OS === 'android'
    ? [0, 400, 200, 400, 200, 400] // Android : séquence répétée
    : [0, 400, 200];               // iOS : pattern court répété

  Vibration.vibrate(PATTERN, true);
}

// ── Arrêter l'alarme ──
export async function stopAlarm() {
  Vibration.cancel();

  if (alarmSound) {
    try {
      alarmSound.pause();
      alarmSound.remove();
    } catch (e) { /* silence */ }
    alarmSound = null;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
}
