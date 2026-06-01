import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, StatusBar, Linking, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CAFE_INFO, HORAIRES_SEMAINE } from '../../data/opderTrap/menuDuJour';
import { ODT } from '../../constants/brand';

// Aperçu carte (OpenStreetMap, sans clé)
const MAP_IMG =
  `https://staticmap.openstreetmap.de/staticmap.php?center=${CAFE_INFO.lat},${CAFE_INFO.lon}` +
  `&zoom=15&size=600x320&markers=${CAFE_INFO.lat},${CAFE_INFO.lon},red-pushpin`;

export default function InfosScreen() {
  const openMaps = () => {
    const q = encodeURIComponent(CAFE_INFO.adresseComplete);
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${q}`,
      android: `geo:0,0?q=${q}`,
      default: `https://www.google.com/maps/search/?api=1&query=${q}`,
    });
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`)
    );
  };

  const callPhone = () => Linking.openURL(`tel:${CAFE_INFO.telLien}`);

  return (
    <View style={{ flex: 1, backgroundColor: ODT.cream }}>
      <StatusBar barStyle="light-content" backgroundColor="#2B2B2B" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Logo header */}
        <View style={styles.logoHeader}>
          <SafeAreaView edges={['top']}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoTop}>BAR & VINTAGE BOWLING</Text>
              <Text style={styles.logoMain}>
                <Text style={{ color: ODT.gold }}>OP DER </Text>
                <Text style={{ color: '#fff' }}>TRAP</Text>
              </Text>
              <Text style={styles.logoBottom}>ROMBACH · MARTELANGE</Text>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          {/* Carte */}
          <TouchableOpacity style={styles.mapCard} onPress={openMaps} activeOpacity={0.9}>
            <Image source={{ uri: MAP_IMG }} style={styles.mapImg} resizeMode="cover" />
            <View style={styles.mapPin}>
              <Ionicons name="location" size={28} color={ODT.red} />
            </View>
            <View style={styles.mapBtn}>
              <Ionicons name="navigate" size={16} color="#fff" />
              <Text style={styles.mapBtnText}>Itinéraire</Text>
            </View>
          </TouchableOpacity>

          {/* Adresse */}
          <TouchableOpacity style={styles.row} onPress={openMaps} activeOpacity={0.7}>
            <View style={styles.iconCircle}>
              <Ionicons name="location-outline" size={20} color={ODT.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Adresse</Text>
              <Text style={styles.rowValue}>{CAFE_INFO.adresse}</Text>
              <Text style={styles.rowValue}>{CAFE_INFO.cp} {CAFE_INFO.ville}</Text>
              <Text style={styles.rowSub}>{CAFE_INFO.pays}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={ODT.gray} />
          </TouchableOpacity>

          {/* Téléphone */}
          <TouchableOpacity style={styles.row} onPress={callPhone} activeOpacity={0.7}>
            <View style={styles.iconCircle}>
              <Ionicons name="call-outline" size={20} color={ODT.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Téléphone</Text>
              <Text style={[styles.rowValue, { color: ODT.primary, fontWeight: '800' }]}>
                {CAFE_INFO.tel}
              </Text>
            </View>
            <Ionicons name="call" size={18} color={ODT.green} />
          </TouchableOpacity>

          {/* Horaires */}
          <View style={styles.hoursCard}>
            <View style={styles.hoursHeader}>
              <Ionicons name="time-outline" size={20} color={ODT.primary} />
              <Text style={styles.hoursTitle}>Heures d'ouverture</Text>
            </View>
            {HORAIRES_SEMAINE.map((h, i) => (
              <View
                key={h.jour}
                style={[styles.hourRow, i < HORAIRES_SEMAINE.length - 1 && styles.hourRowBorder]}
              >
                <Text style={[styles.hourDay, h.ferme && styles.hourClosed]}>{h.jour}</Text>
                <Text style={[styles.hourTime, h.ferme && styles.hourClosed]}>{h.heures}</Text>
              </View>
            ))}
            <View style={styles.kitchenNote}>
              <Text style={styles.kitchenText}>
                🍽️ Cuisine : menu du jour & spaghetti du mardi au vendredi, 12h–14h ·
                croque-monsieur toute la journée
              </Text>
            </View>
          </View>

          <Text style={styles.footer}>☕ {CAFE_INFO.nom} · {CAFE_INFO.sousTitre}</Text>
          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  logoHeader: { backgroundColor: '#2B2B2B', paddingBottom: 28 },
  logoBadge: { alignItems: 'center', paddingTop: 20, paddingHorizontal: 20 },
  logoTop: { color: ODT.gold, fontSize: 12, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  logoMain: { fontSize: 42, fontWeight: '900', letterSpacing: 1 },
  logoBottom: { color: ODT.gold, fontSize: 12, fontWeight: '700', letterSpacing: 2, marginTop: 6 },

  content: { padding: 16, marginTop: -16 },

  mapCard: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: '#DDE3DA',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  mapImg: { width: '100%', height: '100%' },
  mapPin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -14,
    marginTop: -28,
  },
  mapBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ODT.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  mapBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: ODT.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { fontSize: 12, color: ODT.gray, fontWeight: '700', marginBottom: 3 },
  rowValue: { fontSize: 14, color: ODT.dark, fontWeight: '600', lineHeight: 19 },
  rowSub: { fontSize: 12, color: ODT.gray, marginTop: 2 },

  hoursCard: {
    backgroundColor: ODT.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  hoursHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  hoursTitle: { fontSize: 16, fontWeight: '800', color: ODT.dark },
  hourRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9 },
  hourRowBorder: { borderBottomWidth: 1, borderBottomColor: ODT.border },
  hourDay: { fontSize: 14, color: ODT.dark, fontWeight: '600' },
  hourTime: { fontSize: 14, color: ODT.dark, fontWeight: '700' },
  hourClosed: { color: ODT.red },

  kitchenNote: {
    marginTop: 12,
    backgroundColor: ODT.cream,
    borderRadius: 10,
    padding: 12,
  },
  kitchenText: { fontSize: 12, color: ODT.gray, lineHeight: 17 },

  footer: { textAlign: 'center', fontSize: 13, color: ODT.gray, fontStyle: 'italic', fontWeight: '600' },
});
