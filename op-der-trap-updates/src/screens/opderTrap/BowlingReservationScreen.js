import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, Alert, KeyboardAvoidingView, Platform, Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BOWLING } from '../../data/opderTrap/eventsData';
import { ODT } from '../../constants/brand';
import { useProfile } from '../../context/ProfileContext';

const CYAN = '#0891B2';

// Génère les n prochains jours d'ouverture (le lundi est exclu : fermé)
function getNextDays(n = 14) {
  const JOURS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const MOIS  = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const out = [];
  let i = 0;
  while (out.length < n) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    i++;
    if (d.getDay() === 1) continue; // Fermé le lundi
    out.push({
      id: out.length,
      short: d.getDate().toString(),
      day: JOURS[d.getDay()],
      label: `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`,
    });
  }
  return out;
}

const DURATIONS = ['1h', '1h30', '2h', '3h'];

export default function BowlingReservationScreen({ navigation }) {
  const { profile } = useProfile();
  const [nom, setNom]     = useState(profile.prenom ? `${profile.prenom} ${profile.nom}`.trim() : '');
  const [phone, setPhone] = useState(profile.phone);

  useEffect(() => {
    const fullName = profile.prenom ? `${profile.prenom} ${profile.nom}`.trim() : '';
    if (fullName && !nom)  setNom(fullName);
    if (profile.phone && !phone) setPhone(profile.phone);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);
  const [players, setPlayers] = useState(4);
  const [duration, setDuration] = useState('1h');
  const [loading, setLoading] = useState(false);

  const days = getNextDays(14);
  const isValid = nom.trim() && phone.trim() && selectedTime;

  const missing = [];
  if (!nom.trim() || !phone.trim()) missing.push('vos coordonnées');
  if (!selectedTime) missing.push('une heure');
  const missingText = missing.length ? `Il reste à choisir : ${missing.join(', ')}` : '';
  const total = players * BOWLING.tarifHeure * (duration === '1h' ? 1 : duration === '1h30' ? 1.5 : duration === '2h' ? 2 : 3);

  const handleSubmit = () => {
    if (!isValid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Vibration.vibrate([0, 80, 60, 120]);
      const ref = `BOW-${Math.floor(10000 + Math.random() * 90000)}`;
      Alert.alert(
        '🎳 Réservation bowling confirmée !',
        `Bonjour ${nom} !\n\n📅 ${days[selectedDay].label} à ${selectedTime}\n👥 ${players} joueur(s)\n⏱️ ${duration}\n💶 ~${total.toFixed(0)}€ estimé\n\nRéférence : ${ref}\n\nÀ vos quilles !`,
        [{ text: 'Super !', onPress: () => navigation.goBack() }]
      );
    }, 1200);
  };

  return (
    <View style={{ flex: 1, backgroundColor: ODT.cream }}>
      <StatusBar barStyle="light-content" backgroundColor={CYAN} />

      <View style={[styles.header, { backgroundColor: CYAN }]}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>🎳 Réserver le bowling</Text>
            <View style={{ width: 38 }} />
          </View>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Info banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>
              💡 Tarif : {BOWLING.tarifHeure}€/heure/personne · Ouvert du mardi au dimanche, 8h–21h
            </Text>
          </View>

          {/* Coordonnées */}
          <View style={styles.card}>
            <Label icon="person-outline" text="Vos coordonnées" />
            <Text style={styles.fieldLabel}>Nom et prénom *</Text>
            <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholder="Votre nom" maxLength={50} />
            <Text style={styles.fieldLabel}>Téléphone *</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone}
              placeholder="+32 xxx xx xx xx" keyboardType="phone-pad" maxLength={20} />
          </View>

          {/* Date */}
          <View style={styles.card}>
            <Label icon="calendar-outline" text="Date" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.daysRow}>
                {days.map(d => (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.dayChip, selectedDay === d.id && styles.dayChipActive]}
                    onPress={() => setSelectedDay(d.id)}
                  >
                    <Text style={[styles.dayShort, selectedDay === d.id && styles.dayShortActive]}>{d.day}</Text>
                    <Text style={[styles.dayNum, selectedDay === d.id && styles.dayNumActive]}>{d.short}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Heure */}
          <View style={styles.card}>
            <Label icon="time-outline" text="Heure de début *" />
            <View style={styles.timeGrid}>
              {BOWLING.timeSlots.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.timeChip, selectedTime === t && styles.timeChipActive]}
                  onPress={() => setSelectedTime(t)}
                >
                  <Text style={[styles.timeText, selectedTime === t && styles.timeTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Durée */}
          <View style={styles.card}>
            <Label icon="hourglass-outline" text="Durée" />
            <View style={styles.durationRow}>
              {DURATIONS.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.durationChip, duration === d && styles.durationChipActive]}
                  onPress={() => setDuration(d)}
                >
                  <Text style={[styles.durationText, duration === d && styles.durationTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Joueurs */}
          <View style={styles.card}>
            <Label icon="people-outline" text="Joueurs" />
            <View style={styles.stepperSection}>
              <Text style={styles.stepperLabel}>Nombre de joueurs (max 6)</Text>
              <Stepper value={players} min={1} max={6} onChange={setPlayers} color={CYAN} />
            </View>
          </View>

          {/* Estimation */}
          <View style={styles.estimationCard}>
            <Text style={styles.estimationTitle}>💶 Estimation du coût</Text>
            <Text style={styles.estimationValue}>~{total.toFixed(0)}€</Text>
            <Text style={styles.estimationSub}>
              {players} pers. × {BOWLING.tarifHeure}€ × {duration}
            </Text>
          </View>

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Barre récapitulative collée en bas */}
        <View style={styles.summaryBar}>
          {isValid ? (
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLine} numberOfLines={1}>
                📅 {days[selectedDay].label}  ·  ⏰ {selectedTime}
              </Text>
              <Text style={styles.summaryItems} numberOfLines={1}>
                👥 {players} joueur{players > 1 ? 's' : ''} · ⏱️ {duration}
              </Text>
            </View>
          ) : (
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryMissing} numberOfLines={2}>
                {missingText}
              </Text>
            </View>
          )}

          <View style={styles.summaryRight}>
            <Text style={styles.summaryTotal}>~{total.toFixed(0)}€</Text>
            <TouchableOpacity
              style={[styles.summaryBtn, (!isValid || loading) && styles.summaryBtnDisabled]}
              onPress={handleSubmit}
              disabled={!isValid || loading}
              activeOpacity={0.85}
            >
              <Ionicons
                name={loading ? 'hourglass-outline' : 'checkmark-circle'}
                size={18}
                color="#fff"
              />
              <Text style={styles.summaryBtnText}>{loading ? 'Envoi...' : 'Réserver'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Label({ icon, text }) {
  return (
    <View style={styles.labelRow}>
      <Ionicons name={icon} size={16} color={CYAN} />
      <Text style={styles.label}>{text}</Text>
    </View>
  );
}

function Stepper({ value, min, max, onChange, color }) {
  return (
    <View style={styles.stepRow}>
      <TouchableOpacity
        style={[styles.stepBtn, value <= min && styles.stepBtnDisabled]}
        onPress={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
      >
        <Ionicons name="remove" size={20} color={value <= min ? '#ccc' : color} />
      </TouchableOpacity>
      <Text style={[styles.stepCount, { color }]}>{value}</Text>
      <TouchableOpacity
        style={[styles.stepBtn, value >= max && styles.stepBtnDisabled]}
        onPress={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
      >
        <Ionicons name="add" size={20} color={value >= max ? '#ccc' : color} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10 },
  backBtn: { padding: 4, width: 38 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: '#fff' },

  content: { padding: 16 },

  infoBanner: {
    backgroundColor: '#E0F2FE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: CYAN,
  },
  infoText: { fontSize: 13, color: '#0C4A6E', fontWeight: '600' },

  card: {
    backgroundColor: ODT.white, borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  label: { fontSize: 15, fontWeight: '700', color: ODT.dark },
  fieldLabel: { fontSize: 12, color: ODT.gray, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: ODT.cream, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11,
    fontSize: 15, color: ODT.dark, borderWidth: 1.5, borderColor: ODT.border, marginBottom: 10,
  },

  daysRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  dayChip: {
    alignItems: 'center', borderRadius: 12, borderWidth: 1.5, borderColor: ODT.border,
    paddingHorizontal: 14, paddingVertical: 10, minWidth: 60, backgroundColor: ODT.lightGray,
  },
  dayChipActive: { borderColor: CYAN, backgroundColor: CYAN },
  dayShort: { fontSize: 10, fontWeight: '700', color: ODT.gray, marginBottom: 2 },
  dayShortActive: { color: 'rgba(255,255,255,0.75)' },
  dayNum: { fontSize: 18, fontWeight: '800', color: ODT.dark },
  dayNumActive: { color: '#fff' },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeChip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10,
    borderWidth: 1.5, borderColor: ODT.border, backgroundColor: ODT.lightGray,
  },
  timeChipActive: { borderColor: CYAN, backgroundColor: CYAN },
  timeText: { fontSize: 14, fontWeight: '700', color: ODT.dark },
  timeTextActive: { color: '#fff' },

  durationRow: { flexDirection: 'row', gap: 10 },
  durationChip: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderRadius: 10, borderWidth: 1.5, borderColor: ODT.border, backgroundColor: ODT.lightGray,
  },
  durationChipActive: { borderColor: CYAN, backgroundColor: CYAN },
  durationText: { fontSize: 15, fontWeight: '700', color: ODT.dark },
  durationTextActive: { color: '#fff' },

  stepperSection: { marginBottom: 8 },
  stepperLabel: { fontSize: 13, color: ODT.gray, fontWeight: '600', marginBottom: 8 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: ODT.lightGray,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: ODT.border,
  },
  stepBtnDisabled: { opacity: 0.4 },
  stepCount: { fontSize: 26, fontWeight: '900', minWidth: 30, textAlign: 'center' },

  estimationCard: {
    backgroundColor: CYAN, borderRadius: 16, padding: 20, marginBottom: 14, alignItems: 'center',
  },
  estimationTitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  estimationValue: { fontSize: 36, fontWeight: '900', color: '#fff', marginBottom: 2 },
  estimationSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },

  // Barre récapitulative collée en bas
  summaryBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16,
    backgroundColor: ODT.white, borderTopWidth: 1, borderTopColor: ODT.border,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: -3 }, elevation: 12,
  },
  summaryInfo: { flex: 1 },
  summaryLine: { fontSize: 13, fontWeight: '800', color: ODT.dark },
  summaryItems: { fontSize: 12, color: ODT.gray, marginTop: 2 },
  summaryMissing: { fontSize: 12, color: ODT.gray, fontWeight: '600', lineHeight: 17 },
  summaryRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryTotal: { fontSize: 18, fontWeight: '900', color: CYAN },
  summaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: CYAN, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12,
    shadowColor: CYAN, shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  summaryBtnDisabled: { backgroundColor: '#A9C7D1', shadowOpacity: 0 },
  summaryBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
