import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Linking, Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CAFE_INFO, HORAIRES_SEMAINE } from '../../data/opderTrap/menuDuJour';
import { getOpenStatus, todayHoursIndex } from '../../utils/openStatus';
import { ODT } from '../../constants/brand';

const MAP_OSM_URL =
  `https://www.openstreetmap.org/export/embed.html?bbox=5.731,49.829,5.757,49.845` +
  `&layer=mapnik&marker=${CAFE_INFO.lat},${CAFE_INFO.lon}`;

export default function InfosScreen() {
  const status   = getOpenStatus();
  const todayIdx = todayHoursIndex();

  const openMaps = () => {
    const q = encodeURIComponent(CAFE_INFO.adresseComplete);
    const url = Platform.select({
      ios:     `http://maps.apple.com/?q=${q}`,
      android: `geo:0,0?q=${q}`,
      default: `https://www.google.com/maps/search/?api=1&query=${q}`,
    });
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`)
    );
  };

  const callPhone  = () => Linking.openURL(`tel:${CAFE_INFO.telLien}`);
  const openWA     = () => Linking.openURL(`https://wa.me/${CAFE_INFO.telLien}`);
  const openEmail  = () => CAFE_INFO.email && Linking.openURL(`mailto:${CAFE_INFO.email}`);
  const openFB     = () => CAFE_INFO.facebook && Linking.openURL(CAFE_INFO.facebook);
  const openIG     = () => CAFE_INFO.instagram && Linking.openURL(CAFE_INFO.instagram);

  const hasSocial = !!(CAFE_INFO.facebook || CAFE_INFO.instagram || CAFE_INFO.email);

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
          {/* Statut d'ouverture en direct */}
          <View style={[styles.statusBadge, status.open ? styles.statusOpen : styles.statusClosed]}>
            <View style={[styles.statusDot, { backgroundColor: status.open ? ODT.green : ODT.red }]} />
            <Text style={[styles.statusText, { color: status.open ? ODT.green : ODT.red }]}>
              {status.label}
            </Text>
          </View>

          {/* Carte */}
          <View style={styles.mapCard}>
            <View pointerEvents="none" style={styles.mapWebContainer}>
              <WebView
                source={{ uri: MAP_OSM_URL }}
                style={styles.mapImg}
                scrollEnabled={false}
                javaScriptEnabled
                domStorageEnabled={false}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              />
            </View>
            <TouchableOpacity style={styles.mapBtn} onPress={openMaps} activeOpacity={0.85}>
              <Ionicons name="navigate" size={16} color="#fff" />
              <Text style={styles.mapBtnText}>Itinéraire</Text>
            </TouchableOpacity>
          </View>

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

          {/* Contact : téléphone */}
          <TouchableOpacity style={[styles.contactBtn, styles.contactBtnPhone, { marginBottom: 12 }]} onPress={callPhone} activeOpacity={0.8}>
            <Ionicons name="call" size={20} color="#fff" />
            <View>
              <Text style={styles.contactBtnLabel}>Appeler</Text>
              <Text style={styles.contactBtnSub}>{CAFE_INFO.tel}</Text>
            </View>
          </TouchableOpacity>

          {/* Email + réseaux (uniquement si configurés) */}
          {hasSocial && (
            <View style={styles.socialRow}>
              {!!CAFE_INFO.email && (
                <TouchableOpacity style={styles.socialBtn} onPress={openEmail}>
                  <Ionicons name="mail" size={22} color="#fff" />
                  <Text style={styles.socialLabel}>E-mail</Text>
                </TouchableOpacity>
              )}
              {!!CAFE_INFO.facebook && (
                <TouchableOpacity style={[styles.socialBtn, styles.socialFB]} onPress={openFB}>
                  <Text style={styles.socialIcon}>f</Text>
                  <Text style={styles.socialLabel}>Facebook</Text>
                </TouchableOpacity>
              )}
              {!!CAFE_INFO.instagram && (
                <TouchableOpacity style={[styles.socialBtn, styles.socialIG]} onPress={openIG}>
                  <Ionicons name="logo-instagram" size={22} color="#fff" />
                  <Text style={styles.socialLabel}>Instagram</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Horaires */}
          <View style={styles.hoursCard}>
            <View style={styles.hoursHeader}>
              <Ionicons name="time-outline" size={20} color={ODT.primary} />
              <Text style={styles.hoursTitle}>Heures d'ouverture</Text>
            </View>
            {HORAIRES_SEMAINE.map((h, i) => {
              const isToday = i === todayIdx;
              return (
                <View
                  key={h.jour}
                  style={[
                    styles.hourRow,
                    i < HORAIRES_SEMAINE.length - 1 && styles.hourRowBorder,
                    isToday && styles.hourRowToday,
                  ]}
                >
                  <View style={styles.hourDayWrap}>
                    {isToday && <View style={styles.todayDot} />}
                    <Text style={[styles.hourDay, h.ferme && styles.hourClosed, isToday && styles.hourTodayText]}>
                      {h.jour}
                    </Text>
                  </View>
                  <Text style={[styles.hourTime, h.ferme && styles.hourClosed, isToday && styles.hourTodayText]}>
                    {h.heures}
                  </Text>
                </View>
              );
            })}
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

  statusBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
    gap: 8, paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 22, marginBottom: 14, borderWidth: 1.5,
  },
  statusOpen:   { backgroundColor: '#EAF7EE', borderColor: '#BFE6CB' },
  statusClosed: { backgroundColor: '#FDECEC', borderColor: '#F5C2C2' },
  statusDot:    { width: 9, height: 9, borderRadius: 5 },
  statusText:   { fontSize: 13, fontWeight: '800' },

  mapCard: {
    height: 180, borderRadius: 16, overflow: 'hidden', marginBottom: 14,
    backgroundColor: '#DDE3DA',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  mapWebContainer: { flex: 1 },
  mapImg: { width: '100%', height: '100%' },
  mapPin: { position: 'absolute', top: '50%', left: '50%', marginLeft: -14, marginTop: -28 },
  mapBtn: {
    position: 'absolute', bottom: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: ODT.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  mapBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: ODT.white, borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  iconCircle: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#EAF5EC', alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: { fontSize: 12, color: ODT.gray, fontWeight: '700', marginBottom: 3 },
  rowValue: { fontSize: 14, color: ODT.dark, fontWeight: '600', lineHeight: 19 },
  rowSub:   { fontSize: 12, color: ODT.gray, marginTop: 2 },

  // Contact phone + WhatsApp
  contactRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  contactBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  contactBtnPhone: { backgroundColor: ODT.primary },
  contactBtnWA:    { backgroundColor: '#25D366' },
  contactBtnLabel: { fontSize: 13, fontWeight: '800', color: '#fff' },
  contactBtnSub:   { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  waIcon: { fontSize: 20 },

  // Réseaux sociaux
  socialRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  socialBtn: {
    flex: 1, alignItems: 'center', gap: 6, paddingVertical: 14,
    borderRadius: 14, backgroundColor: ODT.primary,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  socialFB:    { backgroundColor: '#1877F2' },
  socialIG:    { backgroundColor: '#C13584' },
  socialIcon:  { fontSize: 20, fontWeight: '900', color: '#fff' },
  socialLabel: { fontSize: 11, fontWeight: '700', color: '#fff' },

  // Horaires
  hoursCard: {
    backgroundColor: ODT.white, borderRadius: 14, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  hoursHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  hoursTitle:  { fontSize: 16, fontWeight: '800', color: ODT.dark },
  hourRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9 },
  hourRowBorder: { borderBottomWidth: 1, borderBottomColor: ODT.border },
  hourRowToday: {
    backgroundColor: '#EAF5EC', borderRadius: 10,
    paddingHorizontal: 10, marginHorizontal: -10, borderBottomWidth: 0,
  },
  hourDayWrap:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  todayDot:       { width: 7, height: 7, borderRadius: 4, backgroundColor: ODT.primary },
  hourDay:        { fontSize: 14, color: ODT.dark, fontWeight: '600' },
  hourTime:       { fontSize: 14, color: ODT.dark, fontWeight: '700' },
  hourTodayText:  { color: ODT.primary, fontWeight: '800' },
  hourClosed:     { color: ODT.red },
  kitchenNote: { marginTop: 12, backgroundColor: ODT.cream, borderRadius: 10, padding: 12 },
  kitchenText: { fontSize: 12, color: ODT.gray, lineHeight: 17 },

  footer: { textAlign: 'center', fontSize: 13, color: ODT.gray, fontStyle: 'italic', fontWeight: '600' },
});
