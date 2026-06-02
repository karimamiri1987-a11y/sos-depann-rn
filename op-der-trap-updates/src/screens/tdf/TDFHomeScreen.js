import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTDF } from '../../context/TDFContext';

const { width: W } = Dimensions.get('window');

export default function TDFHomeScreen({ navigation }) {
  const {
    participants, stageResults, hasDraw, isComplete, scores,
    nbRequis, coureursParJoueur, totalCoureurs,
  } = useTDF();

  const completedStages = Object.keys(stageResults).length;
  const nb = participants.length;
  const pct = Math.min(100, Math.round((nb / nbRequis) * 100));

  const leader = hasDraw
    ? Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
    : null;
  const leaderName = leader ? participants.find(p => p.id === leader[0])?.name : null;

  const MENU = [
    {
      id: 'participants', icon: '👥', label: 'Participants',
      sub: `${nb} / ${nbRequis} inscrits`, route: 'TDFParticipants',
      color: ['#1A1A2E', '#16213E'], locked: false,
    },
    {
      id: 'stages', icon: '🏁', label: 'Étapes',
      sub: `${completedStages} / 21 saisies`, route: 'TDFStages',
      color: ['#1A1A2E', '#16213E'], locked: !hasDraw,
    },
    {
      id: 'leaderboard', icon: '🏆', label: 'Classement',
      sub: leaderName ? `Leader : ${leaderName}` : 'Voir le palmarès', route: 'TDFLeaderboard',
      color: ['#D97706', '#B45309'], locked: !hasDraw,
    },
    {
      id: 'draw', icon: '🎲', label: hasDraw ? 'Mon tirage' : 'Tirage',
      sub: hasDraw ? 'Voir mes coureurs' : 'En attente du tirage',
      route: 'TDFDraw',
      color: hasDraw ? ['#16A34A', '#15803D'] : ['#9CA3AF', '#6B7280'],
      locked: !hasDraw,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#FFCC00' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFCC00" />

      {/* Header */}
      <LinearGradient colors={['#FFCC00', '#FFD700', '#FFC200']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.emoji}>🚴</Text>
            <Text style={styles.title}>Tour de France</Text>
            <Text style={styles.subtitle}>Le grand pronostic du café</Text>
            <View style={styles.cafeBadge}>
              <Text style={styles.cafeText}>☕ Op der Trap · Martelange</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1, backgroundColor: '#F9F9F9' }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress card : inscriptions */}
        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressLabel}>Inscriptions</Text>
            <Text style={styles.progressCount}>
              <Text style={{ color: isComplete ? '#16A34A' : '#E30613' }}>{nb}</Text>
              <Text style={{ color: '#888' }}> / {nbRequis}</Text>
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: isComplete ? '#16A34A' : '#FFCC00' }]} />
          </View>
          <Text style={styles.progressNote}>
            {isComplete
              ? (hasDraw ? '✅ Tirage effectué — la course peut commencer !' : '🎯 Liste complète ! Lancez le tirage au sort.')
              : `Encore ${nbRequis - nb} participant${nbRequis - nb > 1 ? 's' : ''} avant le tirage.`}
          </Text>
        </View>

        {/* Stats bar */}
        <View style={styles.statsRow}>
          <StatChip icon="🚴" value={totalCoureurs} label="Coureurs" />
          <StatChip icon="🎽" value={coureursParJoueur} label="Par joueur" />
          <StatChip icon="🏁" value={`${completedStages}/21`} label="Étapes" />
        </View>

        {/* Menu grid */}
        <View style={styles.grid}>
          {MENU.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(item.route)}
            >
              <LinearGradient colors={item.color} style={styles.cardGradient}>
                {item.locked && <Text style={styles.lock}>🔒</Text>}
                <Text style={styles.cardIcon}>{item.icon}</Text>
                <Text style={styles.cardLabel}>{item.label}</Text>
                <Text style={styles.cardSub}>{item.sub}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Règles */}
        <View style={styles.rules}>
          <Text style={styles.rulesTitle}>📋 Comment ça marche ?</Text>
          <Text style={styles.rulesBody}>
            <Text style={styles.bold}>{nbRequis} participants</Text> s'inscrivent. Une fois la liste
            complète, le tirage au sort distribue à chacun <Text style={styles.bold}>{coureursParJoueur} coureurs</Text> :
            {'\n'}• 1ᵉʳ coureur : un favori (dossard finissant par <Text style={styles.bold}>1</Text>)
            {'\n'}• 2ᵉ coureur : un dossard finissant par <Text style={styles.bold}>2</Text>
            {'\n'}• … jusqu'au 8ᵉ coureur (dossard finissant par <Text style={styles.bold}>8</Text>)
            {'\n'}Chaque "pot" est réparti aléatoirement entre tous les joueurs.
          </Text>

          <Text style={[styles.rulesTitle, { marginTop: 16 }]}>🏆 Points par étape</Text>
          <RuleRow points={5} color="#FFCC00" label="Vainqueur d'étape" />
          <RuleRow points={4} color="#E30613" label="Combatif du jour" textLight />
          <RuleRow points={3} color="#C0C0C0" label="2ᵉ de l'étape" />
          <RuleRow points={1} color="#CD7F32" label="3ᵉ de l'étape" />
        </View>
      </ScrollView>
    </View>
  );
}

function StatChip({ icon, value, label }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipIcon}>{icon}</Text>
      <Text style={styles.chipValue}>{value}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

function RuleRow({ points, label, color, textLight }) {
  return (
    <View style={styles.ruleRow}>
      <View style={[styles.pointsBadge, { backgroundColor: color }]}>
        <Text style={[styles.pointsText, textLight && { color: '#fff' }]}>{points}pts</Text>
      </View>
      <Text style={styles.ruleLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 10 },
  backBtn: { position: 'absolute', top: 4, left: 12, padding: 8, zIndex: 2 },
  backArrow: { fontSize: 22, color: '#1A1A1A', fontWeight: '800' },
  headerContent: { alignItems: 'center', paddingTop: 6, paddingBottom: 4 },
  emoji: { fontSize: 30, marginBottom: 2 },
  title: { fontSize: 20, fontWeight: '900', color: '#1A1A1A' },
  subtitle: { fontSize: 12, fontWeight: '600', color: '#1A1A1A', opacity: 0.7, marginBottom: 6 },
  cafeBadge: { backgroundColor: 'rgba(0,0,0,0.10)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  cafeText: { fontSize: 11, fontWeight: '600', color: '#1A1A1A' },

  content: { paddingHorizontal: 16, paddingBottom: 32 },

  progressCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18, marginTop: -12, marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  progressLabel: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  progressCount: { fontSize: 22, fontWeight: '900' },
  progressBar: { height: 10, backgroundColor: '#F3F4F6', borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: 10, borderRadius: 5 },
  progressNote: { fontSize: 12, color: '#666', fontWeight: '600', lineHeight: 17 },

  statsRow: {
    flexDirection: 'row', gap: 10, marginBottom: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  chip: { flex: 1, alignItems: 'center' },
  chipIcon: { fontSize: 20, marginBottom: 2 },
  chipValue: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  chipLabel: { fontSize: 10, color: '#888', marginTop: 1 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  card: {
    width: (W - 44) / 2, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  cardGradient: { padding: 20, minHeight: 116, justifyContent: 'flex-end' },
  lock: { position: 'absolute', top: 12, right: 12, fontSize: 16 },
  cardIcon: { fontSize: 32, marginBottom: 8 },
  cardLabel: { fontSize: 17, fontWeight: '800', color: '#fff' },
  cardSub: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  rules: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  rulesTitle: { fontSize: 15, fontWeight: '800', color: '#1A1A1A', marginBottom: 12 },
  rulesBody: { fontSize: 13, color: '#444', lineHeight: 21 },
  bold: { fontWeight: '800', color: '#1A1A1A' },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  pointsBadge: { width: 52, paddingVertical: 4, borderRadius: 8, alignItems: 'center' },
  pointsText: { fontSize: 13, fontWeight: '800', color: '#1A1A1A' },
  ruleLabel: { fontSize: 14, color: '#444', fontWeight: '500' },
});
