import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ODT } from '../../constants/brand';
import { useReservations } from '../../context/ReservationsContext';

const CYAN = '#0891B2';

export default function ReservationsScreen({ navigation }) {
  const { reservations, cancelReservation, deleteReservation } = useReservations();

  const active    = reservations.filter(r => r.status !== 'cancelled');
  const cancelled = reservations.filter(r => r.status === 'cancelled');
  const sorted    = [...active, ...cancelled];

  const handleCancel = (r) => {
    Alert.alert(
      'Annuler la réservation',
      `Annuler la réservation du ${r.dayLabel} à ${r.time} ?`,
      [
        { text: 'Non', style: 'cancel' },
        { text: 'Oui, annuler', style: 'destructive', onPress: () => cancelReservation(r.id) },
      ]
    );
  };

  const handleDelete = (r) => {
    Alert.alert(
      'Supprimer',
      'Supprimer définitivement cette réservation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteReservation(r.id) },
      ]
    );
  };

  const handleEdit = (r) => {
    if (r.type === 'bowling') {
      // L'écran bowling est dans l'onglet « Événements »
      navigation.navigate('Événements', { screen: 'BowlingReservation', params: { edit: r } });
    } else {
      navigation.navigate('TableReservation', { edit: r });
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
            <Text style={styles.headerTitle}>Mes réservations</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{active.length}</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {sorted.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={64} color="#C8D8CC" />
            <Text style={styles.emptyTitle}>Aucune réservation</Text>
            <Text style={styles.emptySub}>
              Vos réservations de table et bowling{'\n'}apparaîtront ici après confirmation
            </Text>
          </View>
        ) : (
          <>
            {active.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>À venir · {active.length}</Text>
                {active.map(r => (
                  <ReservationCard
                    key={r.id}
                    r={r}
                    onCancel={() => handleCancel(r)}
                    onEdit={() => handleEdit(r)}
                  />
                ))}
              </>
            )}
            {cancelled.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, styles.sectionLabelGray]}>
                  Annulées · {cancelled.length}
                </Text>
                {cancelled.map(r => (
                  <ReservationCard
                    key={r.id}
                    r={r}
                    onDelete={() => handleDelete(r)}
                  />
                ))}
              </>
            )}
          </>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function ReservationCard({ r, onCancel, onDelete, onEdit }) {
  const isBowling   = r.type === 'bowling';
  const isCancelled = r.status === 'cancelled';
  const accent      = isBowling ? CYAN : ODT.primary;

  return (
    <View style={[styles.card, isCancelled && styles.cardCancelled]}>
      {/* Bandeau type */}
      <View style={[styles.typeBar, { backgroundColor: accent }]}>
        <Text style={styles.typeBarText}>
          {isBowling ? '🎳 Bowling' : '🍽️ Table'}
        </Text>
        {isCancelled && <Text style={styles.cancelledLabel}>Annulée</Text>}
        <Text style={styles.refText}>{r.ref}</Text>
      </View>

      <View style={styles.body}>
        {/* Date + heure */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color={ODT.gray} />
          <Text style={styles.infoText}>{r.dayLabel}</Text>
          <View style={styles.dot} />
          <Ionicons name="time-outline" size={14} color={ODT.gray} />
          <Text style={styles.infoText}>{r.time}</Text>
        </View>

        {/* Nom */}
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={14} color={ODT.gray} />
          <Text style={styles.infoText}>{r.name}</Text>
          {r.phone ? (
            <>
              <View style={styles.dot} />
              <Text style={styles.infoText}>{r.phone}</Text>
            </>
          ) : null}
        </View>

        {/* Table : mode + convives + formules */}
        {!isBowling && (
          <>
            <View style={styles.infoRow}>
              <Ionicons
                name={r.mode === 'emporter' ? 'bag-handle-outline' : 'restaurant-outline'}
                size={14}
                color={ODT.gray}
              />
              <Text style={styles.infoText}>
                {r.mode === 'emporter'
                  ? '🥡 À emporter'
                  : `🪑 Sur place${r.guests > 0 ? ` · ${r.guests} personne${r.guests > 1 ? 's' : ''}` : ''}`}
              </Text>
            </View>
            {r.items && r.items.length > 0 && (
              <View style={styles.itemsList}>
                {r.items.map((it, i) => (
                  <Text key={i} style={styles.itemText}>· {it.qty}× {it.name}</Text>
                ))}
              </View>
            )}
            {r.totalStr ? (
              <Text style={[styles.totalText, { color: ODT.green }]}>{r.totalStr} €</Text>
            ) : null}
          </>
        )}

        {/* Bowling : joueurs + durée + estimation */}
        {isBowling && (
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={14} color={ODT.gray} />
            <Text style={styles.infoText}>
              {r.players} joueur{r.players > 1 ? 's' : ''} · ⏱ {r.duration}
            </Text>
            <View style={styles.dot} />
            <Text style={[styles.infoText, { color: CYAN, fontWeight: '800' }]}>~{r.total}€</Text>
          </View>
        )}

        {/* Notes */}
        {r.notes ? (
          <View style={styles.notesRow}>
            <Ionicons name="chatbubble-outline" size={13} color={ODT.gray} />
            <Text style={styles.notesText}>{r.notes}</Text>
          </View>
        ) : null}

        {/* Actions */}
        {!isCancelled && (onEdit || onCancel) && (
          <View style={styles.actionsRow}>
            {onEdit && (
              <TouchableOpacity style={styles.editBtn} onPress={onEdit} activeOpacity={0.8}>
                <Ionicons name="create-outline" size={16} color={accent} />
                <Text style={[styles.editBtnText, { color: accent }]}>Modifier</Text>
              </TouchableOpacity>
            )}
            {onCancel && (
              <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
                <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {isCancelled && onDelete && (
          <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={14} color={ODT.gray} />
            <Text style={styles.deleteBtnText}>Supprimer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 16 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 10, gap: 12,
  },
  backBtn: { padding: 4, width: 38 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: '#fff' },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 3, minWidth: 30, alignItems: 'center',
  },
  countText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  content: { padding: 16 },

  sectionLabel: {
    fontSize: 13, fontWeight: '800', color: ODT.primary,
    marginBottom: 10, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  sectionLabelGray: { color: ODT.gray },

  empty: { alignItems: 'center', paddingTop: 80, paddingBottom: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: ODT.dark, marginTop: 16 },
  emptySub: {
    fontSize: 13, color: ODT.gray, textAlign: 'center', lineHeight: 20, marginTop: 8,
  },

  card: {
    backgroundColor: ODT.white, borderRadius: 16, marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
    overflow: 'hidden',
  },
  cardCancelled: { opacity: 0.65 },

  typeBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, gap: 8,
  },
  typeBarText: { fontSize: 13, fontWeight: '800', color: '#fff', flex: 1 },
  cancelledLabel: {
    fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.85)',
    backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  refText: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700' },

  body: { padding: 14, gap: 8 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  infoText: { fontSize: 13, color: ODT.dark, fontWeight: '600' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: ODT.border },

  itemsList: { paddingLeft: 4, marginTop: 2 },
  itemText: { fontSize: 12, color: ODT.gray, lineHeight: 20 },
  totalText: { fontSize: 15, fontWeight: '900', marginTop: 4 },

  notesRow: { flexDirection: 'row', gap: 6, marginTop: 2, alignItems: 'flex-start' },
  notesText: { fontSize: 12, color: ODT.gray, fontStyle: 'italic', flex: 1 },

  actionsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: ODT.border,
  },
  editBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: ODT.border,
    backgroundColor: ODT.cream,
  },
  editBtnText: { fontSize: 13, fontWeight: '800' },
  cancelBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  cancelBtnText: { fontSize: 13, fontWeight: '800', color: '#DC2626' },

  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: ODT.border,
    alignSelf: 'flex-start',
  },
  deleteBtnText: { fontSize: 12, color: ODT.gray, fontWeight: '600' },
});
