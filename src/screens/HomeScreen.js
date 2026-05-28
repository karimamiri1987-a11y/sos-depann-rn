import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { CATEGORIES, F, BRAND } from '../constants/data';
import { PulsingDot, CatIcon } from '../components';
import { useApp } from '../context/AppContext';

const { width: W } = Dimensions.get('window');
const CARD_W = (W - 32 - 20) / 3;

export default function HomeScreen({ navigation }) {
  const { proUser, user } = useApp();
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? CATEGORIES : CATEGORIES.slice(0, 9);

  const handleProPress = () => {
    if (proUser) navigation.navigate('ProDashboard');
    else navigation.navigate('ProAuth');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0C1525" />

      {/* Header */}
      <LinearGradient
        colors={['#0C1525', '#0B1220', BRAND.bg]}
        style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>

            {/* Logo */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <LinearGradient
                colors={['#0891B2', '#06B6D4']}
                style={styles.logoMark}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <MaterialCommunityIcons name="wrench" size={18} color="#fff" />
              </LinearGradient>
              <View>
                <Text style={styles.logoText}>SOS Dépann'</Text>
                <Text style={styles.logoSub}>Un pro en minutes</Text>
              </View>
            </View>

            {/* Nav buttons */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('UserProfile')}
                style={styles.navBtn}>
                <Ionicons name="person-outline" size={16} color="#fff" />
                {user && <Text style={styles.navBtnText}>{user.prenom}</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleProPress} style={styles.navBtn}>
                <MaterialCommunityIcons name="briefcase-outline" size={16} color="#fff" />
                <Text style={styles.navBtnText}>Pro</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Location bar */}
          <View style={styles.locBar}>
            <Ionicons name="location" size={16} color={BRAND.cyanLight} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={{ color: BRAND.textMuted, fontSize: 10, fontFamily: F.regular }}>Votre position</Text>
              <Text style={{ color: '#fff', fontSize: 13, fontFamily: F.bold }}>12 Rue de la Paix, Paris 75002</Text>
            </View>
            <PulsingDot />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>

        {/* Emergency banner */}
        <TouchableOpacity
          style={styles.urgBanner}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Diagnostic', { catId: 'autres' })}>
          <LinearGradient
            colors={['#7F1D1D', '#991B1B']}
            style={styles.urgGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <View style={styles.urgIconWrap}>
              <MaterialCommunityIcons name="alert-octagram" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: F.groteskBold, fontSize: 15, color: '#fff' }}>Urgence ?</Text>
              <Text style={{ fontFamily: F.regular, fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                Un professionnel en moins de 2h
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Categories */}
        <Text style={styles.sectionTitle}>De quoi avez-vous besoin ?</Text>
        <View style={styles.grid}>
          {visible.map(cat => (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('Diagnostic', { catId: cat.id })}
              style={[styles.catCard, { width: CARD_W }]}>
              <View style={[styles.catIconWrap, { backgroundColor: cat.color + '20' }]}>
                <CatIcon cat={cat} size={22} />
              </View>
              <Text style={styles.catLabel}>{cat.label}</Text>
              <Text style={styles.catPrice}>Dès {cat.basePrice}€</Text>
            </TouchableOpacity>
          ))}
        </View>
        {CATEGORIES.length > 9 && (
          <TouchableOpacity onPress={() => setShowAll(!showAll)} style={styles.moreBtn}>
            <Text style={{ color: BRAND.cyanLight, fontSize: 13, fontFamily: F.semibold }}>
              {showAll ? 'Réduire' : `Voir tout (${CATEGORIES.length})`}
            </Text>
            <Ionicons name={showAll ? 'chevron-up' : 'chevron-down'} size={14} color={BRAND.cyanLight} />
          </TouchableOpacity>
        )}

        {/* How it works */}
        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Comment ça marche ?</Text>
        <View style={styles.stepsCard}>
          {[
            { icon: "cellphone-text",    lib: "MaterialCommunityIcons", t: "1. Décrivez",     s: "Répondez à quelques questions + photos" },
            { icon: "bell-ring-outline", lib: "MaterialCommunityIcons", t: "2. Alertez",      s: "Les pros reçoivent votre demande" },
            { icon: "file-document-outline", lib: "MaterialCommunityIcons", t: "3. Estimez", s: "Le pro envoie son devis sous 10 min" },
            { icon: "credit-card-outline", lib: "MaterialCommunityIcons", t: "4. Validez",    s: "Payez un acompte pour confirmer" },
            { icon: "car-wrench",         lib: "MaterialCommunityIcons", t: "5. C'est parti !", s: "Le pro intervient chez vous" },
          ].map((s, i) => (
            <View key={i} style={[styles.stepRow, i < 4 && styles.stepRowBorder]}>
              <View style={styles.stepIconWrap}>
                <MaterialCommunityIcons name={s.icon} size={18} color={BRAND.cyanLight} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#0F172A' }}>{s.t}</Text>
                <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#64748B', marginTop: 2 }}>{s.s}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Tour de France Pronostic Banner */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate('TDFHome')}
          style={styles.tdfBanner}
        >
          <LinearGradient
            colors={['#FFCC00', '#FFD700']}
            style={styles.tdfGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.tdfEmoji}>🚴</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.tdfTitle}>Tour de France — Pronostic</Text>
              <Text style={styles.tdfSub}>☕ Café Op der Trap · Martelange</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#1A1A1A" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsBar}>
          {[
            { n: "15k+", l: "Pros certifiés",  icon: "shield-check" },
            { n: "4.8",  l: "Note moyenne",     icon: "star" },
            { n: "10min",l: "Temps de réponse", icon: "clock-fast" },
          ].map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={{ width: 1, height: 36, backgroundColor: BRAND.border }} />}
              <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <MaterialCommunityIcons name={s.icon} size={16} color="#0891B2" />
                <Text style={{ fontFamily: F.groteskBold, fontSize: 18, color: '#0891B2' }}>{s.n}</Text>
                <Text style={{ fontFamily: F.regular, fontSize: 10, color: '#94A3B8', textAlign: 'center' }}>{s.l}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#fff',
    letterSpacing: -0.3,
  },
  logoSub: {
    fontFamily: 'DMSans_400Regular',
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  navBtnText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: F.semibold,
  },
  locBar: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  urgBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  urgGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  urgIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 17,
    color: '#0F172A',
    marginBottom: 14,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  catIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  catLabel: {
    fontSize: 11,
    fontFamily: F.bold,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 2,
  },
  catPrice: {
    fontSize: 10,
    fontFamily: F.regular,
    color: '#94A3B8',
  },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  stepsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 4,
    marginBottom: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  stepRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stepIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tdfBanner: {
    marginTop: 20,
    marginBottom: 4,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#FFCC00',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  tdfGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  tdfEmoji: { fontSize: 30 },
  tdfTitle: { fontSize: 15, fontFamily: F.bold, color: '#1A1A1A', marginBottom: 2 },
  tdfSub: { fontSize: 11, color: '#555' },

  statsBar: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
});
