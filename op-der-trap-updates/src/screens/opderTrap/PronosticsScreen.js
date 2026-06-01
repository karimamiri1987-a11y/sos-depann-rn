import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ODT } from '../../constants/brand';

const ACTIVE_PRONOSTICS = [
  {
    id: 'tdf',
    title: 'Tour de France',
    subtitle: 'Pronostic actif — Tirage au sort',
    icon: '🚴',
    colors: ['#FFCC00', '#FFD700'],
    textColor: '#1A1A1A',
    badge: '🟢 En cours',
    screen: 'TDFHome',
    desc: '23 joueurs · 184 coureurs · 8 coureurs / joueur',
  },
];

const COMING_SOON = [
  { id: 'wc',   title: 'Coupe du Monde 2026',    icon: '⚽', colors: ['#374151', '#4B5563'], desc: 'USA · Canada · Mexique' },
  { id: 'rg',   title: 'Roland-Garros 2027',      icon: '🎾', colors: ['#B45309', '#D97706'], desc: 'Tournoi sur terre battue' },
  { id: 'rbs6', title: 'Rugby Six Nations',       icon: '🏉', colors: ['#1E3A5F', '#2D5A8E'], desc: 'Championnat européen' },
  { id: 'f1',   title: 'Formule 1 — Saison',      icon: '🏎️', colors: ['#991B1B', '#DC2626'], desc: 'Pronostics par Grand Prix' },
];

export default function PronosticsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: ODT.cream }}>
      <StatusBar barStyle="light-content" backgroundColor="#4C1D95" />

      <LinearGradient colors={['#4C1D95', '#6D28D9']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.cafeLabel}>☕ Op der Trap · Martelange</Text>
              <Text style={styles.headerTitle}>Pronostics</Text>
              <Text style={styles.headerSub}>Jouez avec vos amis !</Text>
            </View>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🏆</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Active */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>🟢 Pronostic actif</Text>
        </View>

        {ACTIVE_PRONOSTICS.map(p => (
          <TouchableOpacity
            key={p.id}
            style={styles.activeCard}
            onPress={() => navigation.navigate(p.screen)}
            activeOpacity={0.88}
          >
            <LinearGradient colors={p.colors} style={styles.activeGradient}>
              <View style={styles.activeTop}>
                <Text style={styles.activeIcon}>{p.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.activeTitle, { color: p.textColor }]}>{p.title}</Text>
                  <Text style={[styles.activeSub, { color: p.textColor, opacity: 0.7 }]}>{p.subtitle}</Text>
                </View>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>{p.badge}</Text>
                </View>
              </View>
              <View style={styles.activeDivider} />
              <View style={styles.activeBottom}>
                <Text style={[styles.activeDesc, { color: p.textColor, opacity: 0.75 }]}>{p.desc}</Text>
                <View style={[styles.playBtn, { backgroundColor: p.textColor }]}>
                  <Text style={[styles.playText, { color: p.colors[0] }]}>Jouer →</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* Rules reminder */}
        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>📋 Comment ça marche ?</Text>
          <View style={styles.rulesGrid}>
            <RuleStep num="1" text="Inscrivez les 23 participants" />
            <RuleStep num="2" text="Lancez le tirage au sort" />
            <RuleStep num="3" text="Saisissez les résultats" />
            <RuleStep num="4" text="Regardez le classement" />
          </View>
          <View style={styles.pointsRow}>
            <PointChip pts="5" label="1er" color="#FFCC00" />
            <PointChip pts="4" label="Combatif" color="#E30613" light />
            <PointChip pts="3" label="2ème" color="#C0C0C0" />
            <PointChip pts="1" label="3ème" color="#CD7F32" />
          </View>
        </View>

        {/* Coming soon */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>⏳ À venir</Text>
        <View style={styles.comingGrid}>
          {COMING_SOON.map(p => (
            <View key={p.id} style={styles.comingCard}>
              <LinearGradient colors={p.colors} style={styles.comingGradient}>
                <Text style={styles.comingIcon}>{p.icon}</Text>
                <Text style={styles.comingTitle}>{p.title}</Text>
                <Text style={styles.comingDesc}>{p.desc}</Text>
                <View style={styles.soonBadge}>
                  <Text style={styles.soonText}>Bientôt</Text>
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

function RuleStep({ num, text }) {
  return (
    <View style={styles.ruleStep}>
      <View style={styles.ruleNum}>
        <Text style={styles.ruleNumText}>{num}</Text>
      </View>
      <Text style={styles.ruleText}>{text}</Text>
    </View>
  );
}

function PointChip({ pts, label, color, light }) {
  return (
    <View style={[styles.ptChip, { backgroundColor: color }]}>
      <Text style={[styles.ptVal, light && { color: '#fff' }]}>{pts}pts</Text>
      <Text style={[styles.ptLabel, light && { color: '#fff' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 20 },
  headerContent: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: 12,
  },
  cafeLabel: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 4 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 2 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  logoCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji: { fontSize: 28 },

  content: { padding: 16 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: ODT.dark, marginBottom: 12 },

  activeCard: {
    borderRadius: 18, overflow: 'hidden', marginBottom: 16,
    shadowColor: '#FFCC00', shadowOpacity: 0.3, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  activeGradient: { padding: 20 },
  activeTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  activeIcon: { fontSize: 40 },
  activeTitle: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  activeSub: { fontSize: 13, fontWeight: '600' },
  activeBadge: {
    backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
  },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: 'rgba(0,0,0,0.7)' },
  activeDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginBottom: 14 },
  activeBottom: { flexDirection: 'row', alignItems: 'center' },
  activeDesc: { flex: 1, fontSize: 13, fontWeight: '600' },
  playBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  playText: { fontSize: 14, fontWeight: '800' },

  rulesCard: {
    backgroundColor: ODT.white, borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  rulesTitle: { fontSize: 14, fontWeight: '700', color: ODT.dark, marginBottom: 12 },
  rulesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  ruleStep: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '47%' },
  ruleNum: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#4C1D95',
    alignItems: 'center', justifyContent: 'center',
  },
  ruleNumText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  ruleText: { fontSize: 12, color: ODT.dark, flex: 1 },
  pointsRow: { flexDirection: 'row', gap: 10 },
  ptChip: { flex: 1, borderRadius: 10, padding: 10, alignItems: 'center' },
  ptVal: { fontSize: 16, fontWeight: '900', color: '#1A1A1A' },
  ptLabel: { fontSize: 11, fontWeight: '600', color: '#1A1A1A', opacity: 0.7, marginTop: 2 },

  comingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  comingCard: {
    width: '47%', borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  comingGradient: { padding: 16, minHeight: 110, justifyContent: 'space-between' },
  comingIcon: { fontSize: 28, marginBottom: 6 },
  comingTitle: { fontSize: 13, fontWeight: '800', color: '#fff', marginBottom: 3 },
  comingDesc: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginBottom: 8 },
  soonBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start',
  },
  soonText: { fontSize: 10, fontWeight: '700', color: '#fff' },
});
