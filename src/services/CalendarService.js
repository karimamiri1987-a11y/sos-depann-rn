import * as Calendar from 'expo-calendar';
import { Platform, Alert } from 'react-native';

async function getOrCreateCalendar() {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

  if (Platform.OS === 'ios') {
    // iOS : cherche le calendrier par défaut, sinon crée un local
    const def = calendars.find(c => c.allowsModifications && c.type === Calendar.CalendarType.LOCAL)
      || calendars.find(c => c.allowsModifications);
    if (def) return def.id;

    const id = await Calendar.createCalendarAsync({
      title: "SOS Dépann'",
      color: '#0891B2',
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: (await Calendar.getSourcesAsync()).find(s => s.type === Calendar.SourceType.LOCAL)?.id,
      source: { isLocalAccount: true, name: "SOS Dépann'" },
      name: "sos-depann",
      ownerAccount: 'personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });
    return id;
  }

  // Android : calendrier principal
  const def = calendars.find(c => c.isPrimary && c.allowsModifications)
    || calendars.find(c => c.allowsModifications);
  return def?.id || null;
}

export async function addInterventionToCalendar({ catLabel, scheduledDate, scheduledTime, clientLocation, amount }) {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Accès refusé", "Autorisez l'accès au calendrier dans les réglages.");
      return false;
    }

    const calendarId = await getOrCreateCalendar();
    if (!calendarId) return false;

    // Parse date "DD/MM/YYYY" et heure "10h - 12h"
    const [day, month, year] = scheduledDate.split('/').map(Number);
    const [startH, endH] = scheduledTime.split(' - ').map(s => parseInt(s, 10));

    const startDate = new Date(year, month - 1, day, startH, 0, 0);
    const endDate   = new Date(year, month - 1, day, endH,   0, 0);

    await Calendar.createEventAsync(calendarId, {
      title: `Intervention ${catLabel}`,
      location: clientLocation || '',
      startDate,
      endDate,
      notes: `Montant estimé : ${amount} €\nAcompte perçu via SOS Dépann'`,
      alarms: [{ relativeOffset: -120 }], // rappel 2h avant
      timeZone: 'Europe/Brussels',
    });

    return true;
  } catch { return false; }
}
