import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, Alert, KeyboardAvoidingView, Platform, Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ODT } from '../../constants/brand';
import { RESOURCE_CONSUMPTION } from '../../constants/stock';
import { useProfile } from '../../context/ProfileContext';
import { useReservations } from '../../context/ReservationsContext';
import { useMenu } from '../../context/MenuContext';
import { supabase } from '../../lib/supabase';

// Service du midi : un créneau toutes les 15 min entre 12h00 et 13h45
const TIME_SLOTS = [
  '12:00', '12:15', '12:30', '12:45',
  '13:00', '13:15', '13:30', '13:45',
];

// Génère les n prochains jours d'ouverture (le lundi est exclu : fermé)
function getNextDays(n = 14) {
  const days = [];
  const JOURS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const MOIS  = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  let i = 0;
  while (days.length < n) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    i++;
    if (d.getDay() === 1) continue; // Fermé le lundi
    days.push({
      id: days.length,
      label: `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`,
      short: d.getDate().toString(),
      day: JOURS[d.getDay()],
      dateISO: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
    });
  }
  return days;
}

function computeWhenISO(dateISO, time) {
  if (!dateISO || !time) return null;
  const [hh, mm] = time.split(':').map(Number);
  const d = new Date(`${dateISO}T00:00:00`);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}

// Agrège les ressources consommées par un objet { formuleId: qty }
function computeResourceDelta(quantitiesObj) {
  const delta = {};
  Object.entries(quantitiesObj).forEach(([fid, qty]) => {
    if (!qty) return;
    Object.entries(RESOURCE_CONSUMPTION[fid] || {}).forEach(([res, perUnit]) => {
      delta[res] = (delta[res] || 0) + perUnit * qty;
    });
  });
  return delta;
}

export default function TableReservationScreen({ navigation, route }) {
  const days = getNextDays(14);
  const { profile } = useProfile();
  const { addReservation, updateReservation } = useReservations();
  const { formules: FORMULES, stockLimits } = useMenu();

  const editRes = route?.params?.edit || null;
  const isEdit = !!editRes;

  const presetDay = route?.params?.dayName;
  const editDayIndex = editRes
    ? Math.max(0, days.findIndex(d => d.label === editRes.dayLabel))
    : -1;
  const presetIndex = editDayIndex >= 0
    ? editDayIndex
    : presetDay
      ? Math.max(0, days.findIndex(d => d.day === presetDay.slice(0, 3)))
      : 0;

  const [prenom, setPrenom] = useState(() => {
    if (!editRes) return profile.prenom;
    if (editRes.prenom) return editRes.prenom;
    const spaceIdx = (editRes.name || '').indexOf(' ');
    return spaceIdx >= 0 ? editRes.name.slice(0, spaceIdx) : (editRes.name || '');
  });
  const [nom, setNom] = useState(() => {
    if (!editRes) return profile.nom;
    if (editRes.nom) return editRes.nom;
    const spaceIdx = (editRes.name || '').indexOf(' ');
    return spaceIdx >= 0 ? editRes.name.slice(spaceIdx + 1) : '';
  });
  const [phone, setPhone] = useState(editRes ? editRes.phone : profile.phone);

  useEffect(() => {
    if (isEdit) return;
    if (profile.prenom && !prenom) setPrenom(profile.prenom);
    if (profile.nom   && !nom)    setNom(profile.nom);
    if (profile.phone && !phone)  setPhone(profile.phone);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const [notes, setNotes] = useState(editRes ? (editRes.notes || '') : '');
  const [selectedDay, setSelectedDay] = useState(presetIndex);
  const [selectedTime, setSelectedTime] = useState(editRes ? editRes.time : null);
  const [quantities, setQuantities] = useState(editRes?.quantities || {});
  const [mode, setMode] = useState(editRes ? (editRes.mode || 'place') : 'place');
  const [stockCounts, setStockCounts] = useState({}); // { 'YYYY-MM-DD': { resource_id: count } }
  const [loading, setLoading] = useState(false);

  // Recharge le stock Supabase à chaque fois que l'écran est affiché
  useFocusEffect(
    useCallback(() => {
      const dateISOs = getNextDays(14).map(d => d.dateISO);
      supabase
        .from('reservation_stock')
        .select('resource_id, date_iso, count')
        .in('date_iso', dateISOs)
        .then(({ data }) => {
          if (!data) return;
          const counts = {};
          data.forEach(r => {
            if (!counts[r.date_iso]) counts[r.date_iso] = {};
            counts[r.date_iso][r.resource_id] = r.count;
          });
          setStockCounts(counts);
        })
        .catch(() => {});
    }, [])
  );

  // Ressources consommées par la sélection en cours (recalcul à chaque render, 5 formules max)
  const currentResourceUsage = (() => {
    const usage = {};
    FORMULES.forEach(f => {
      const qty = quantities[f.id] || 0;
      if (!qty) return;
      Object.entries(RESOURCE_CONSUMPTION[f.id] || {}).forEach(([res, perUnit]) => {
        usage[res] = (usage[res] || 0) + perUnit * qty;
      });
    });
    return usage;
  })();

  // Ressources déjà comptabilisées dans la réservation en cours de modification
  const ownResourceUsage = (() => {
    if (!isEdit) return {};
    const usage = {};
    Object.entries(editRes.quantities || {}).forEach(([fid, qty]) => {
      if (!qty) return;
      Object.entries(RESOURCE_CONSUMPTION[fid] || {}).forEach(([res, perUnit]) => {
        usage[res] = (usage[res] || 0) + perUnit * qty;
      });
    });
    return usage;
  })();

  // Stock disponible pour une formule : basé sur ses ressources, le jour sélectionné
  const getFormuleStock = (formuleId) => {
    const consumed = RESOURCE_CONSUMPTION[formuleId] || {};
    const entries = Object.entries(consumed);
    if (!entries.length) return { soldOut: false, remaining: null };

    const dateISO = days[selectedDay]?.dateISO;
    if (!dateISO) return { soldOut: false, remaining: null };
    const dow = new Date(dateISO + 'T12:00:00').getDay();

    let minCanAdd = Infinity;
    for (const [res, perUnit] of entries) {
      const max = stockLimits?.[res]?.[dow] || 0;
      if (!max) continue; // illimité ce jour-là pour cette ressource

      const dbUsed  = stockCounts[dateISO]?.[res] || 0;
      const own     = ownResourceUsage[res] || 0;
      const current = currentResourceUsage[res] || 0;
      const netUsed = Math.max(0, dbUsed - own) + current;
      const canAdd  = Math.max(0, Math.floor((max - netUsed) / perUnit));
      if (canAdd < minCanAdd) minCanAdd = canAdd;
    }

    return {
      soldOut:   minCanAdd === 0,
      remaining: minCanAdd === Infinity ? null : minCanAdd,
    };
  };

  const isWeekend = days[selectedDay]?.day === 'Sam' || days[selectedDay]?.day === 'Dim';

  useEffect(() => {
    const day = days[selectedDay]?.day;
    if (day === 'Sam' || day === 'Dim') {
      setQuantities(q => {
        const croqueCnt = q['f_croque'] || 0;
        return croqueCnt > 0 ? { f_croque: croqueCnt } : {};
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay]);

  const emporter = mode === 'emporter';

  const setQty = (id, delta) =>
    setQuantities(q => ({ ...q, [id]: Math.max(0, (q[id] || 0) + delta) }));

  const selectedItems = FORMULES
    .filter(f => (quantities[f.id] || 0) > 0)
    .map(f => ({ ...f, qty: quantities[f.id] }));
  const totalItems = selectedItems.reduce((s, f) => s + f.qty, 0);
  const totalPrice = selectedItems.reduce(
    (s, f) => s + parseFloat(String(f.price).replace('€', '').replace(',', '.').trim()) * f.qty,
    0
  );
  const totalStr = totalPrice.toFixed(2).replace('.', ',');

  const isValid = prenom.trim() && nom.trim() && phone.trim() && selectedTime && totalItems > 0;

  const missing = [];
  if (!prenom.trim() || !nom.trim() || !phone.trim()) missing.push('vos coordonnées');
  if (!selectedTime) missing.push('une heure');
  if (totalItems === 0) missing.push('une formule');
  const missingText = missing.length ? `Il reste à choisir : ${missing.join(', ')}` : '';

  const handleSubmit = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    try {
      const ref = isEdit ? editRes.ref : `ODT-${Math.floor(10000 + Math.random() * 90000)}`;
      const itemsText = selectedItems.map(f => `   ${f.qty}× ${f.name}`).join('\n');
      const notesText = notes.trim() ? `\n📝 ${notes.trim()}` : '';
      const intro = isEdit
        ? `Bonjour ${prenom} !\n\nVotre réservation a bien été modifiée :`
        : emporter
          ? `Bonjour ${prenom} !\n\nVotre commande à emporter est enregistrée :`
          : `Bonjour ${prenom} !\n\nVotre table est réservée :`;
      const recap = emporter
        ? `${intro}\n📅 ${days[selectedDay].label}\n⏰ ${selectedTime}\n🍽️ Commande :\n${itemsText}\n💶 Total : ${totalStr} €\n🥡 À emporter${notesText}\n\nRéférence : ${ref}\n\nÀ tout bientôt !`
        : `${intro}\n📅 ${days[selectedDay].label}\n⏰ ${selectedTime}\n🍽️ Menus :\n${itemsText}\n💶 Total : ${totalStr} €${notesText}\n\nRéférence : ${ref}\n\nNous vous attendons !`;
      const newDateISO = days[selectedDay].dateISO;
      const payload = {
        type: 'table', ref,
        dayLabel: days[selectedDay].label,
        dateISO: newDateISO,
        time: selectedTime,
        whenISO: computeWhenISO(newDateISO, selectedTime),
        name: `${prenom} ${nom}`.trim(),
        prenom, nom, phone,
        guests: 0, mode, quantities,
        items: selectedItems.map(f => ({ name: f.name, qty: f.qty })),
        totalStr, notes: notes.trim(),
      };

      // Si édition : libérer l'ancien stock avant de sauvegarder
      if (isEdit) {
        const oldDateISO = editRes.dateISO || editRes.whenISO?.slice(0, 10);
        if (oldDateISO) {
          const oldDelta = computeResourceDelta(editRes.quantities || {});
          await Promise.all(
            Object.entries(oldDelta)
              .filter(([, d]) => d > 0)
              .map(([res, d]) =>
                supabase.rpc('adjust_stock', { p_resource_id: res, p_date_iso: oldDateISO, p_delta: -d }).catch(() => {})
              )
          );
        }
        updateReservation(editRes.id, payload);
      } else {
        addReservation(payload);
      }

      // Incrémenter le stock de la nouvelle réservation (attendu avant de confirmer)
      const newDelta = computeResourceDelta(quantities);
      await Promise.all(
        Object.entries(newDelta)
          .filter(([, d]) => d > 0)
          .map(([res, d]) =>
            supabase.rpc('adjust_stock', { p_resource_id: res, p_date_iso: newDateISO, p_delta: d }).catch(() => {})
          )
      );

      // Mettre à jour l'état local du stock pour que le COMPLET s'affiche immédiatement
      setStockCounts(prev => {
        const next = { ...prev, [newDateISO]: { ...(prev[newDateISO] || {}) } };
        Object.entries(newDelta).forEach(([res, d]) => {
          next[newDateISO][res] = (next[newDateISO][res] || 0) + d;
        });
        return next;
      });

      setLoading(false);
      Vibration.vibrate([0, 80, 60, 120]);
      Alert.alert(
        isEdit ? '✅ Réservation modifiée !' : emporter ? '✅ Commande confirmée !' : '✅ Réservation confirmée !',
        recap,
        [{ text: 'Parfait !', onPress: () => navigation.goBack() }]
      );
    } catch {
      setLoading(false);
      Alert.alert('Erreur', "Impossible d'enregistrer la réservation. Veuillez réessayer.");
    }
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
            <Text style={styles.headerTitle}>{isEdit ? 'Modifier la réservation' : 'Réserver une table'}</Text>
            <View style={{ width: 38 }} />
          </View>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Mode : sur place / à emporter */}
          <View style={styles.modeRow}>
            <TouchableOpacity style={[styles.modeBtn, !emporter && styles.modeBtnActive]} onPress={() => setMode('place')} activeOpacity={0.8}>
              <Ionicons name="restaurant" size={18} color={!emporter ? '#fff' : ODT.primary} />
              <Text style={[styles.modeText, !emporter && styles.modeTextActive]}>Sur place</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modeBtn, emporter && styles.modeBtnActive]} onPress={() => setMode('emporter')} activeOpacity={0.8}>
              <Ionicons name="bag-handle" size={18} color={emporter ? '#fff' : ODT.primary} />
              <Text style={[styles.modeText, emporter && styles.modeTextActive]}>À emporter</Text>
            </TouchableOpacity>
          </View>

          {/* Coordonnées */}
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
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+352 xxx xx xx xx" keyboardType="phone-pad" maxLength={20} />
          </View>

          {/* Date */}
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

          {/* Heure */}
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

          {/* Formules */}
          <View style={styles.card}>
            <Label icon="restaurant-outline" text="Vos formules *" />
            <Text style={styles.formuleHint}>
              {isWeekend ? '🥪 Week-end : croque-monsieur uniquement' : 'Choisissez une ou plusieurs formules · ajustez les quantités'}
            </Text>
            {(isWeekend ? FORMULES.filter(f => f.id === 'f_croque') : FORMULES).map(f => {
              const qty     = quantities[f.id] || 0;
              const active  = qty > 0;
              const stock   = getFormuleStock(f.id);
              const soldOut = stock.soldOut;
              return (
                <View
                  key={f.id}
                  style={[styles.formuleRow, active && styles.formuleRowActive, soldOut && styles.formuleRowSoldOut]}
                >
                  <Text style={styles.formuleIcon}>{f.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.formuleName, active && { color: ODT.primary }]}>{f.name}</Text>
                    <Text style={styles.formuleDesc}>{f.desc}</Text>
                    {f.price && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}>
                        <Text style={[styles.formulePrice, active && { color: ODT.primary }]}>{f.price}</Text>
                        {stock.remaining !== null && !soldOut && (
                          <Text style={styles.stockRemaining}>{stock.remaining} restant{stock.remaining > 1 ? 's' : ''}</Text>
                        )}
                      </View>
                    )}
                  </View>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity style={[styles.qtyBtn, qty === 0 && styles.qtyBtnDisabled]} onPress={() => setQty(f.id, -1)} disabled={qty === 0}>
                      <Ionicons name="remove" size={18} color={qty === 0 ? '#ccc' : ODT.primary} />
                    </TouchableOpacity>
                    <Text style={styles.qtyCount}>{qty}</Text>
                    <TouchableOpacity style={[styles.qtyBtn, soldOut && styles.qtyBtnDisabled]} onPress={() => setQty(f.id, 1)} disabled={soldOut}>
                      <Ionicons name="add" size={18} color={soldOut ? '#ccc' : ODT.primary} />
                    </TouchableOpacity>
                  </View>

                  {soldOut && (
                    <View style={styles.soldOutOverlay} pointerEvents="none">
                      <View style={styles.soldOutBadge}>
                        <Text style={styles.soldOutText}>COMPLET</Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
            {totalItems > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total · {totalItems} article{totalItems > 1 ? 's' : ''}</Text>
                <Text style={styles.totalValue}>{totalStr} €</Text>
              </View>
            )}
          </View>

          {/* Notes */}
          <View style={styles.card}>
            <Label icon="chatbubble-outline" text="Notes (optionnel)" />
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes} onChangeText={setNotes}
              placeholder="Allergie, occasion spéciale, chaise haute..."
              multiline numberOfLines={3} maxLength={200}
            />
          </View>

          <Text style={styles.legalNote}>Réservation gratuite · Annulation possible jusqu'à 2h avant</Text>
          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Barre récapitulative */}
        <View style={styles.summaryBar}>
          {isValid ? (
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLine} numberOfLines={1}>
                📅 {days[selectedDay].label}  ·  ⏰ {selectedTime}{emporter ? '  ·  🥡' : ''}
              </Text>
              <Text style={styles.summaryItems} numberOfLines={1}>
                {totalItems} article{totalItems > 1 ? 's' : ''} · {emporter ? 'à emporter' : 'sur place'}
              </Text>
            </View>
          ) : (
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryMissing} numberOfLines={2}>{missingText}</Text>
            </View>
          )}
          <View style={styles.summaryRight}>
            {totalItems > 0 && <Text style={styles.summaryTotal}>{totalStr} €</Text>}
            <TouchableOpacity
              style={[styles.summaryBtn, (!isValid || loading) && styles.summaryBtnDisabled]}
              onPress={handleSubmit} disabled={!isValid || loading} activeOpacity={0.85}
            >
              <Ionicons name={loading ? 'hourglass-outline' : 'checkmark-circle'} size={18} color="#fff" />
              <Text style={styles.summaryBtnText}>
                {loading ? 'Envoi...' : isEdit ? 'Enregistrer' : emporter ? 'Commander' : 'Réserver'}
              </Text>
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
  card: {
    backgroundColor: ODT.white, borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  label: { fontSize: 15, fontWeight: '700', color: ODT.dark },
  row: { flexDirection: 'row', marginBottom: 12 },
  fieldLabel: { fontSize: 12, color: ODT.gray, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: ODT.cream, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11,
    fontSize: 15, color: ODT.dark, borderWidth: 1.5, borderColor: ODT.border, marginBottom: 10,
  },
  notesInput: { height: 80, textAlignVertical: 'top', marginBottom: 0 },

  daysRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  dayChip: {
    alignItems: 'center', borderRadius: 12, borderWidth: 1.5, borderColor: ODT.border,
    paddingHorizontal: 14, paddingVertical: 10, minWidth: 60, backgroundColor: ODT.lightGray,
  },
  dayChipActive: { borderColor: ODT.primary, backgroundColor: ODT.primary },
  dayShort: { fontSize: 10, fontWeight: '700', color: ODT.gray, marginBottom: 2 },
  dayShortActive: { color: 'rgba(255,255,255,0.75)' },
  dayNum: { fontSize: 18, fontWeight: '800', color: ODT.dark },
  dayNumActive: { color: '#fff' },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: ODT.border, backgroundColor: ODT.lightGray,
  },
  timeChipActive: { borderColor: ODT.primary, backgroundColor: ODT.primary },
  timeText: { fontSize: 14, fontWeight: '700', color: ODT.dark },
  timeTextActive: { color: '#fff' },

  legalNote: { textAlign: 'center', fontSize: 12, color: ODT.gray, fontStyle: 'italic' },

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
  summaryTotal: { fontSize: 18, fontWeight: '900', color: ODT.green },
  summaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: ODT.primary, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12,
    shadowColor: ODT.primary, shadowOpacity: 0.35, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  summaryBtnDisabled: { backgroundColor: '#B8C4BD', shadowOpacity: 0 },
  summaryBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  formuleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12, borderWidth: 1.5,
    borderColor: ODT.border, backgroundColor: ODT.cream, marginBottom: 10,
  },
  formuleRowActive: { borderColor: ODT.primary, backgroundColor: '#EAF5EC' },
  formuleRowSoldOut: { opacity: 0.6, borderColor: '#EF4444' },
  formuleIcon: { fontSize: 24 },
  formuleName: { fontSize: 14, fontWeight: '700', color: ODT.dark, marginBottom: 2 },
  formuleDesc: { fontSize: 12, color: ODT.gray, lineHeight: 16 },
  formulePrice: { fontSize: 13, fontWeight: '800', color: ODT.green, marginTop: 3 },
  formuleHint: { fontSize: 12, color: ODT.gray, fontStyle: 'italic', marginTop: -6, marginBottom: 12 },

  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: ODT.white,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: ODT.border,
  },
  qtyBtnDisabled: { opacity: 0.4 },
  qtyCount: { fontSize: 16, fontWeight: '900', color: ODT.primary, minWidth: 20, textAlign: 'center' },

  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 4, paddingTop: 12, borderTopWidth: 1, borderTopColor: ODT.border,
  },
  totalLabel: { fontSize: 14, fontWeight: '700', color: ODT.dark },
  totalValue: { fontSize: 18, fontWeight: '900', color: ODT.green },

  modeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  modeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: ODT.border, backgroundColor: ODT.white,
  },
  modeBtnActive: { backgroundColor: ODT.primary, borderColor: ODT.primary },
  modeText: { fontSize: 14, fontWeight: '800', color: ODT.primary },
  modeTextActive: { color: '#fff' },

  soldOutOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', borderRadius: 12,
  },
  soldOutBadge: {
    borderWidth: 3, borderColor: '#EF4444',
    paddingHorizontal: 10, paddingVertical: 2,
    borderRadius: 4, transform: [{ rotate: '-18deg' }],
  },
  soldOutText: { fontSize: 20, fontWeight: '900', color: '#EF4444', letterSpacing: 4 },
  stockRemaining: { fontSize: 11, fontWeight: '700', color: '#D97706' },
});
