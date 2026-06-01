import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  CAFE_INFO, HORAIRES, MENU_SEMAINE, PLATS_PERMANENTS, DESSERTS,
} from '../../data/opderTrap/menuDuJour';
import { ODT } from '../../constants/brand';
import { getOpenStatus } from '../../utils/openStatus';
import { useProfile } from '../../context/ProfileContext';

export default function MenuScreen({ navigation }) {
  const status = getOpenStatus();
  const { profile, hasProfile } = useProfile();

  return (
    <View style={{ flex: 1, backgroundColor: ODT.cream }}>
      <StatusBar barStyle="light-content" backgroundColor={ODT.primary} />

      {/* Header */}
      <LinearGradient colors={[ODT.primary, '#2D5A42']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cafeLabel}>☕ {CAFE_INFO.sousTitre}</Text>
              <Text style={styles.headerTitle}>Op der Trap</Text>
              <View style={styles.dateBadge}>
                <Ionicons name="location-outline" size={13} color={ODT.gold} />
                <Text style={styles.dateText}>{CAFE_INFO.cp}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 10 }}>
              {/* Badge ouvert/fermé */}
              <View style={[styles.openBadge, status.open ? styles.openBadgeGreen : styles.openBadgeRed]}>
                <View style={[styles.openDot, { backgroundColor: status.open ? '#4ADE80' : '#F87171' }]} />
                <Text style={[styles.openText, { color: status.open ? '#4ADE80' : '#F87171' }]}>
                  {status.open ? 'Ouvert' : 'Fermé'}
                </Text>
              </View>
              {/* Profil */}
              <TouchableOpacity
                style={styles.profileBtn}
                onPress={() => navigation.navigate('Profile')}
              >
                <Ionicons name={hasProfile ? 'person-circle' : 'person-circle-outline'} size={28} color={hasProfile ? ODT.gold : 'rgba(255,255,255,0.7)'} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Horaires */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color={ODT.primary} />
            <Text style={styles.infoText}>{HORAIRES.menuJour}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="close-circle-outline" size={16} color={ODT.red} />
            <Text style={styles.infoText}>{HORAIRES.fermeture}</Text>
          </View>
        </View>

        {/* Menu de la semaine */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionIcon}>📅</Text>
          <Text style={styles.sectionTitle}>Menu de la semaine</Text>
        </View>

        {MENU_SEMAINE.map(day => (
          <TouchableOpacity
            key={day.id}
            style={styles.dayCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('TableReservation', { dayName: day.jour })}
          >
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>{day.jour}</Text>
              <Text style={styles.dayDate}>{day.date}</Text>
            </View>
            <View style={styles.courseRow}>
              <View style={styles.courseTag}>
                <Text style={styles.courseTagText}>Entrée</Text>
              </View>
              <Text style={styles.courseText}>{day.entree}</Text>
            </View>
            <View style={styles.courseRow}>
              <View style={[styles.courseTag, styles.courseTagPlat]}>
                <Text style={[styles.courseTagText, { color: '#fff' }]}>Plat</Text>
              </View>
              <Text style={styles.courseText}>{day.plat}</Text>
            </View>
            <View style={styles.reserveHint}>
              <Ionicons name="calendar-outline" size={13} color={ODT.primary} />
              <Text style={styles.reserveHintText}>Réserver ce jour</Text>
              <Ionicons name="chevron-forward" size={14} color={ODT.gray} />
            </View>
          </TouchableOpacity>
        ))}

        {/* Plats permanents */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionIcon}>♾️</Text>
          <Text style={styles.sectionTitle}>Toujours disponible</Text>
        </View>
        <View style={styles.permCard}>
          {PLATS_PERMANENTS.map((p, i) => (
            <View
              key={p.id}
              style={[styles.permRow, i < PLATS_PERMANENTS.length - 1 && styles.permRowBorder]}
            >
              <Text style={styles.permIcon}>{p.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.permName}>{p.name}</Text>
                <Text style={styles.permDesc}>{p.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Reservation CTA */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => navigation.navigate('TableReservation')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[ODT.primary, '#2D5A42']}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Ionicons name="calendar-outline" size={22} color={ODT.gold} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.ctaTitle}>Réserver une table</Text>
              <Text style={styles.ctaSub}>Choisissez votre formule en quelques secondes</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Carte des desserts */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionIcon}>🍨</Text>
          <Text style={styles.sectionTitle}>Nos desserts</Text>
        </View>
        <Text style={styles.dessertHours}>{HORAIRES.desserts}</Text>

        <View style={styles.dessertCard}>
          <Text style={styles.dessertGroupTitle}>⭐ Les suggestions du moment</Text>
          {DESSERTS.suggestions.map(d => (
            <DessertRow key={d.id} item={d} />
          ))}
          <View style={styles.dessertDivider} />
          <Text style={styles.dessertGroupTitle}>🍦 Les grands classiques</Text>
          {DESSERTS.classiques.map(d => (
            <DessertRow key={d.id} item={d} />
          ))}
        </View>

        {/* Footer note */}
        <Text style={styles.footnote}>
          🌿 Cuisine maison · ☎ {CAFE_INFO.tel}
        </Text>

        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

function DessertRow({ item }) {
  return (
    <View style={styles.dessertRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.dessertName}>{item.name}</Text>
        <Text style={styles.dessertDesc}>{item.desc}</Text>
      </View>
      <View style={styles.priceBadge}>
        <Text style={styles.priceText}>{item.price}</Text>
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
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 6 },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { color: ODT.gold, fontSize: 13, fontWeight: '600' },
  openBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14,
  },
  openBadgeGreen: { backgroundColor: 'rgba(74,222,128,0.18)' },
  openBadgeRed:   { backgroundColor: 'rgba(248,113,113,0.18)' },
  openDot: { width: 7, height: 7, borderRadius: 4 },
  openText: { fontSize: 12, fontWeight: '800' },
  profileBtn: { padding: 2 },

  content: { padding: 16 },

  infoCard: {
    backgroundColor: ODT.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 13, color: ODT.dark, fontWeight: '600', flex: 1 },

  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 4 },
  sectionIcon: { fontSize: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: ODT.dark },

  dayCard: {
    backgroundColor: ODT.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: ODT.gold,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 10,
  },
  dayName: { fontSize: 16, fontWeight: '800', color: ODT.primary },
  dayDate: { fontSize: 12, color: ODT.gray, fontWeight: '600' },
  courseRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  courseTag: {
    backgroundColor: ODT.lightGray,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 52,
    alignItems: 'center',
  },
  courseTagPlat: { backgroundColor: ODT.primary },
  courseTagText: { fontSize: 10, fontWeight: '800', color: ODT.gray },
  courseText: { flex: 1, fontSize: 14, color: ODT.dark, fontWeight: '600', lineHeight: 19 },

  reserveHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: ODT.border,
  },
  reserveHintText: { flex: 1, fontSize: 12, fontWeight: '700', color: ODT.primary },

  permCard: {
    backgroundColor: ODT.white,
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  permRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  permRowBorder: { borderBottomWidth: 1, borderBottomColor: ODT.border },
  permIcon: { fontSize: 26 },
  permName: { fontSize: 15, fontWeight: '700', color: ODT.dark, marginBottom: 2 },
  permDesc: { fontSize: 12, color: ODT.gray, lineHeight: 16 },

  ctaBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 22,
    shadowColor: ODT.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    paddingHorizontal: 20,
  },
  ctaTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  ctaSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  dessertHours: { fontSize: 12, color: ODT.gray, fontStyle: 'italic', marginBottom: 12, marginTop: -4 },
  dessertCard: {
    backgroundColor: ODT.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dessertGroupTitle: { fontSize: 14, fontWeight: '800', color: ODT.primary, marginBottom: 12 },
  dessertDivider: { height: 1, backgroundColor: ODT.border, marginVertical: 14 },
  dessertRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  dessertName: { fontSize: 14, fontWeight: '700', color: ODT.dark, marginBottom: 3 },
  dessertDesc: { fontSize: 12, color: ODT.gray, lineHeight: 17 },
  priceBadge: {
    backgroundColor: '#EAF5EC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  priceText: { fontSize: 13, fontWeight: '900', color: ODT.green },

  footnote: {
    textAlign: 'center',
    fontSize: 12,
    color: ODT.gray,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
