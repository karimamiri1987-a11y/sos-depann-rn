import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ODT } from '../../constants/brand';
import { FORMULES } from '../../data/opderTrap/menuDuJour';

const TIME_SLOTS = ['12:00', '12:30', '13:00', '13:30', '19:00', '19:30', '20:00', '20:30'];

function getNextDays(n = 14) {
  const days = [];
  const JOURS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const MOIS  = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      id: i,
      label: `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`,
      short: d.getDate().toString(),
      day: JOURS[d.getDay()],
    });
  }
  return days;
}

export default function TableReservationScreen({ navigation }) {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);
  const [guests, setGuests] = useState(2);
  const [selectedFormule, setSelectedFormule] = useState(null);
  const [loading, setLoading] = useState(false);

  const days = getNextDays(14);
  const formuleObj = FORMULES.find(f => f.id === selectedFormule);
  const isValid = prenom.trim() && nom.trim() && phone.trim() && selectedTime && selectedFormule;

  const handleSubmit = () => {
    if (!isValid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const ref = `ODT-${Math.floor(10000 + Math.random() * 90000)}`;
      Alert.alert(
        '✅ Réservation confirmée !',
        `Bonjour ${prenom} !\n\nVotre table pour ${guests} personne(s) est réservée :\n📅 ${days[selectedDay].label}\n⏰ ${selectedTime}\n🍽️ ${formuleObj ? formuleObj.name : ''}\n\nRéférence : ${ref}\n\nNous vous attendons !`,
        [{ text: 'Parfait !', onPress: () => navigation.goBack() }]
      );
    }, 1200);
  };

  return (
    <View style={{ flex: 1, backgroundColor: ODT.cream }}>
      <StatusBar barStyle="light-content" backgroundColor={ODT.primary} />
      <View style={[styles.header, { backgroundColor: ODT.primary }]}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Réserver une table</Text>
            <View style={{ width: 38 }} />
          </View>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          <View style={styles.card}>
            <Label icon="person-outline" text="Vos coordonnées" />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Prénom *</Text>
                <TextInput style={styles.input} value={prenom} onChangeText={setPrenom} placeholder="Prénom" maxLength={30} />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Nom *</Text>
                <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholder="Nom" maxLength={30} />
              </View>
            </View>
            <Text style={styles.fieldLabel}>Téléphone *</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+352 xxx xxx xxx" keyboardType="phone-pad" maxLength={20} />
          </View>

          <View style={styles.card}>
            <Label icon="calendar-outline" text="Date" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.daysRow}>
                {days.map(d => (
                  <TouchableOpacity key={d.id} style={[styles.dayChip, selectedDay === d.id && styles.dayChipActive]} onPress={() => setSelectedDay(d.id)}>
                    <Text style={[styles.dayShort, selectedDay === d.id && styles.dayShortActive]}>{d.day}</Text>
                    <Text style={[styles.dayNum, selectedDay === d.id && styles.dayNumActive]}>{d.short}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.card}>
            <Label icon="time-outline" text="Heure *" />
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map(t => (
                <TouchableOpacity key={t} style={[styles.timeChip, selectedTime === t && styles.timeChipActive]} onPress={() => setSelectedTime(t)}>
                  <Text style={[styles.timeText, selectedTime === t && styles.timeTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Label icon="restaurant-outline" text="Votre formule *" />
            {FORMULES.map(f => {
              const active = selectedFormule === f.id;
              return (
                <TouchableOpacity key={f.id} style={[styles.formuleRow, active && styles.formuleRowActive]} onPress={() => setSelectedFormule(f.id)} activeOpacity={0.8}>
                  <Text style={styles.formuleIcon}>{f.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.formuleName, active && { color: ODT.primary }]}>{f.name}</Text>
                    <Text style={styles.formuleDesc}>{f.desc}</Text>
                    {f.price && <Text style={[styles.formulePrice, active && { color: ODT.primary }]}>{f.price}</Text>}
                  </View>
                  <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={22} color={active ? ODT.primary : '#CBD5E1'} />
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.card}>
            <Label icon="people-outline" text="Nombre de personnes" />
            <View style={styles.stepperRow}>
              <TouchableOpacity style={[styles.stepBtn, guests <= 1 && styles.stepBtnDisabled]} onPress={() => setGuests(Math.max(1, guests - 1))} disabled={guests <= 1}>
                <Ionicons name="remove" size={22} color={guests <= 1 ? '#ccc' : ODT.primary} />
              </TouchableOpacity>
              <Text style={styles.stepCount}>{guests}</Text>
              <TouchableOpacity style={[styles.stepBtn, guests >= 20 && styles.stepBtnDisabled]} onPress={() => setGuests(Math.min(20, guests + 1))} disabled={guests >= 20}>
                <Ionicons name="add" size={22} color={guests >= 20 ? '#ccc' : ODT.primary} />
              </TouchableOpacity>
              <Text style={styles.stepLabel}>personne{guests > 1 ? 's' : ''}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Label icon="chatbubble-outline" text="Notes (optionnel)" />
            <TextInput style={[styles.input, styles.notesInput]} value={notes} onChangeText={setNotes} placeholder="Allergie, occasion spéciale, chaise haute..." multiline numberOfLines={3} maxLength={200} />
          </View>

          <TouchableOpacity style={[styles.submitBtn, (!isValid || loading) && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={!isValid || loading}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.submitText}>{loading ? 'Réservation en cours...' : 'Confirmer la réservation'}</Text>
          </TouchableOpacity>

          <Text style={styles.legalNote}>Réservation gratuite · Annulation possible jusqu'à 2h avant</Text>
          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Label({ icon, text }) {
  return (
    <View style={styles.labelRow}>
      <Ionicons name={icon} size={16} color={ODT.primary} />
      <Text style={styles.label}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10 },
  backBtn: { padding: 4, width: 38 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: '#fff' },
  content: { padding: 16 },
  card: { backgroundColor: ODT.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  label: { fontSize: 15, fontWeight: '700', color: ODT.dark },
  row: { flexDirection: 'row', marginBottom: 12 },
  fieldLabel: { fontSize: 12, color: ODT.gray, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: ODT.cream, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: ODT.dark, borderWidth: 1.5, borderColor: ODT.border, marginBottom: 10 },
  notesInput: { height: 80, textAlignVertical: 'top', marginBottom: 0 },
  daysRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  dayChip: { alignItems: 'center', borderRadius: 12, borderWidth: 1.5, borderColor: ODT.border, paddingHorizontal: 14, paddingVertical: 10, minWidth: 60, backgroundColor: ODT.lightGray },
  dayChipActive: { borderColor: ODT.primary, backgroundColor: ODT.primary },
  dayShort: { fontSize: 10, fontWeight: '700', color: ODT.gray, marginBottom: 2 },
  dayShortActive: { color: 'rgba(255,255,255,0.75)' },
  dayNum: { fontSize: 18, fontWeight: '800', color: ODT.dark },
  dayNumActive: { color: '#fff' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: ODT.border, backgroundColor: ODT.lightGray },
  timeChipActive: { borderColor: ODT.primary, backgroundColor: ODT.primary },
  timeText: { fontSize: 14, fontWeight: '700', color: ODT.dark },
  timeTextActive: { color: '#fff' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: ODT.lightGray, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: ODT.border },
  stepBtnDisabled: { opacity: 0.4 },
  stepCount: { fontSize: 28, fontWeight: '900', color: ODT.primary, minWidth: 36, textAlign: 'center' },
  stepLabel: { fontSize: 15, color: ODT.gray, fontWeight: '600' },
  submitBtn: { backgroundColor: ODT.primary, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10, shadowColor: ODT.primary, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  submitBtnDisabled: { opacity: 0.45, shadowOpacity: 0 },
  submitText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  legalNote: { textAlign: 'center', fontSize: 12, color: ODT.gray, fontStyle: 'italic' },
  formuleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: ODT.border, backgroundColor: ODT.cream, marginBottom: 10 },
  formuleRowActive: { borderColor: ODT.primary, backgroundColor: '#EAF5EC' },
  formuleIcon: { fontSize: 24 },
  formuleName: { fontSize: 14, fontWeight: '700', color: ODT.dark, marginBottom: 2 },
  formuleDesc: { fontSize: 12, color: ODT.gray, lineHeight: 16 },
  formulePrice: { fontSize: 13, fontWeight: '800', color: ODT.green, marginTop: 3 },
});
