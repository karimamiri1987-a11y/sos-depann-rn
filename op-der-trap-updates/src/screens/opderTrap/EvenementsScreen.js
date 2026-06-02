import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BOWLING } from '../../data/opderTrap/eventsData';
import { ODT } from '../../constants/brand';
import { useMenu } from '../../context/MenuContext';

export default function EvenementsScreen({ navigation }) {
  const { events, tarifBowling } = useMenu();
  return (
    <View style={{ flex: 1, backgroundColor: ODT.cream }}>
      <StatusBar barStyle="light-content" backgroundColor="#1C3A5E" />

      {/* Header */}
      <LinearGradient colors={['#1C3A5E', '#2D5A8E']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.cafeLabel}>☕ Op der Trap · Martelange</Text>
              <Text style={styles.headerTitle}>Événements & Bowling</Text>
            </View>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🎳</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Bowling section — en haut de la page */}
        <Text style={styles.sectionTitle}>🎳 Le Bowling</Text>
        <View style={styles.bowlingCard}>
          <LinearGradient colors={['#0891B2', '#0E7490']} style={styles.bowlingHeader}>
            <Text style={styles.bowlingTitle}>Notre piste de bowling</Text>
            <Text style={styles.bowlingPrice}>{tarifBowling}€ / heure / pers.</Text>
          </LinearGradient>
          <View style={styles.bowlingBody}>
            <View style={styles.horaireRow}>
              <Ionicons name="time-outline" size={16} color={ODT.primary} />
              <Text style={styles.horaire}>{BOWLING.horaires}</Text>
            </View>
            {BOWLING.avantages.map((a, i) => (
              <View key={i} style={styles.advantageRow}>
                <Text style={styles.advantageText}>{a}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.bowlingBtn}
            onPress={() => navigation.navigate('BowlingReservation')}
          >
            <Ionicons name="calendar-outline" size={20} color="#fff" />
            <Text style={styles.bowlingBtnText}>Réserver la piste</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Featured event */}
        <Text style={styles.sectionTitle}>⭐ Événement à la une</Text>
        {events[0] && <EventCard event={events[0]} featured />}

        {/* All events */}
        <Text style={styles.sectionTitle}>📅 Prochains événements</Text>
        {events.slice(1).map(event => (
          <EventCard key={event.id} event={event} />
        ))}

        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

function EventCard({ event, featured }) {
  if (featured) {
    return (
      <View style={[styles.featCard, { borderLeftColor: event.color }]}>
        <LinearGradient
          colors={[event.color + '18', event.color + '05']}
          style={styles.featGradient}
        >
          <View style={styles.featTop}>
            <View style={[styles.iconCircle, { backgroundColor: event.color + '22' }]}>
              <Text style={styles.eventIcon}>{event.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featTitle}>{event.title}</Text>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={13} color={ODT.gray} />
                <Text style={styles.eventDate}>{event.date} · {event.time}</Text>
              </View>
            </View>
            <View style={[styles.priceBadge, { backgroundColor: event.color }]}>
              <Text style={styles.priceText}>{event.price}</Text>
            </View>
          </View>
          <Text style={styles.eventDesc}>{event.desc}</Text>
          <View style={styles.spotsRow}>
            <Ionicons name="people-outline" size={14} color={event.color} />
            <Text style={[styles.spotsText, { color: event.color }]}>{event.spots}</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.eventCard}>
      <View style={[styles.eventColorBar, { backgroundColor: event.color }]} />
      <View style={styles.eventCardBody}>
        <View style={styles.eventCardTop}>
          <Text style={styles.eventIconSmall}>{event.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDate2}>{event.date} · {event.time}</Text>
          </View>
          <Text style={[styles.priceTag, { color: event.color }]}>{event.price}</Text>
        </View>
        <Text style={styles.eventDescSmall}>{event.desc}</Text>
        <Text style={[styles.spotsSmall, { color: event.color }]}>{event.spots}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 20 },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  cafeLabel: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 4 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  logoCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji: { fontSize: 26 },

  content: { padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: ODT.dark, marginBottom: 12, marginTop: 4 },

  // Featured event
  featCard: {
    borderRadius: 16, overflow: 'hidden', marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  featGradient: { padding: 16 },
  featTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  eventIcon: { fontSize: 22 },
  featTitle: { fontSize: 17, fontWeight: '800', color: ODT.dark, marginBottom: 4 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  eventDate: { fontSize: 12, color: ODT.gray, fontWeight: '600' },
  priceBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  priceText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  eventDesc: { fontSize: 13, color: ODT.dark, lineHeight: 19, marginBottom: 10 },
  spotsRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  spotsText: { fontSize: 12, fontWeight: '700' },

  // Regular event card
  eventCard: {
    flexDirection: 'row',
    backgroundColor: ODT.white,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  eventColorBar: { width: 5 },
  eventCardBody: { flex: 1, padding: 14 },
  eventCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  eventIconSmall: { fontSize: 22 },
  eventTitle: { fontSize: 15, fontWeight: '700', color: ODT.dark, flex: 1 },
  eventDate2: { fontSize: 11, color: ODT.gray, marginTop: 2 },
  priceTag: { fontSize: 12, fontWeight: '800', marginTop: 2 },
  eventDescSmall: { fontSize: 12, color: ODT.gray, lineHeight: 17, marginBottom: 6 },
  spotsSmall: { fontSize: 11, fontWeight: '700' },

  // Bowling
  bowlingCard: {
    backgroundColor: ODT.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  bowlingHeader: { padding: 16, paddingBottom: 14 },
  bowlingTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  bowlingPrice: { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  bowlingBody: { padding: 16 },
  horaireRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  horaire: { fontSize: 13, color: ODT.dark, fontWeight: '600', flex: 1 },
  advantageRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  advantageText: { fontSize: 13, color: ODT.dark },
  bowlingBtn: {
    backgroundColor: '#0891B2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    paddingHorizontal: 20,
  },
  bowlingBtnText: { flex: 1, fontSize: 15, fontWeight: '800', color: '#fff' },
});
