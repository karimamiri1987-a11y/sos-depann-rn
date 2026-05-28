import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTDF } from '../../context/TDFContext';

const { width: W } = Dimensions.get('window');

const MENU = [
  {
    id: 'participants',
    icon: '👥',
    label: 'Participants',
    sub: 'Gérer les joueurs',
    route: 'TDFParticipants',
    color: ['#1A1A2E', '#16213E'],
  },
  {
    id: 'draw',
    icon: '🎲',
    label: 'Tirage au sort',
    sub: 'Distribuer les coureurs',
    route: 'TDFDraw',
    color: ['#E30613', '#B00010'],
  },
  {
    id: 'stages',
    icon: '🏁',
    label: 'Étapes',
    sub: 'Saisir les résultats',
    route: 'TDFStages',
    color: ['#1A1A2E', '#16213E'],
  },
  {
    id: 'leaderboard',
    icon: '🏆',
    label: 'Classement',
    sub: 'Voir le palmarès',
    route: 'TDFLeaderboard',
    color: ['#D97706', '#B45309'],
  },
];

export default function TDFHomeScreen({ navigation }) {
  const { participants, stageResults, hasDraw, scores } = useTDF();
  const completedStages = Object.keys(stageResults).length;
  const leader = hasDraw
    ? Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
    : null;
  const leaderName = leader
    ? participants.find(p => p.id === leader[0])?.name
    : null;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFCC00' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFCC00" />

      {/* Header */}
      <LinearGradient colors={['#FFCC00', '#FFD700', '#FFC200']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Text style={styles.emoji}>🚴</Text>
            <Text style={styles.title}>Tour de France</Text>
            <Text style={styles.subtitle}>Pronostic</Text>
            <View style={styles.cafeBadge}>
              <Text style={styles.cafeText}>☕ Café Op der Trap · Martelange</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1, backgroundColor: '#F9F9F9' }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats bar */}
        <View style={styles.statsRow}>
          <StatChip icon="👥" value={participants.length} label="Joueurs" />
          <StatChip icon="🏁" value={completedStages} label="Étapes saisies" />
          <StatChip icon="🥇" value={leaderName || '—'} label="Leader" small />
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
                <Text style={styles.cardIcon}>{item.icon}</Text>
                <Text style={styles.cardLabel}>{item.label}</Text>
                <Text style={styles.cardSub}>{item.sub}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rules */}
        <View style={styles.rules}>
          <Text style={styles.rulesTitle}>📋 Règles du jeu</Text>
          <RuleRow points={5} label="Vainqueur d'étape" />
          <RuleRow points={3} label="2ème de l'étape" />
          <RuleRow points={1} label="3ème de l'étape" />
          <Text style={styles.rulesNote}>
            Chaque participant reçoit au moins un leader d'équipe par tirage au sort.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function StatChip({ icon, value, label, small }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipIcon}>{icon}</Text>
      <Text style={[styles.chipValue, small && { fontSize: 14 }]}>{value}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

function RuleRow({ points, label }) {
  return (
    <View style={styles.ruleRow}>
      <View style={[styles.pointsBadge, { backgroundColor: points === 5 ? '#FFCC00' : points === 3 ? '#C0C0C0' : '#CD7F32' }]}>
        <Text style={styles.pointsText}>{points}pts</Text>
      </View>
      <Text style={styles.ruleLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 24 },
  headerContent: { alignItems: 'center', paddingTop: 16, paddingBottom: 8 },
  emoji: { fontSize: 52, marginBottom: 4 },
  title: { fontSize: 30, fontWeight: '900', color: '#1A1A1A', letterSpacing: 1 },
  subtitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', opacity: 0.7, marginBottom: 12 },
  cafeBadge: {
    backgroundColor: 'rgba(0,0,0,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  cafeText: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },

  content: { paddingHorizontal: 16, paddingBottom: 32 },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: -12,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  chip: { flex: 1, alignItems: 'center' },
  chipIcon: { fontSize: 20, marginBottom: 2 },
  chipValue: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  chipLabel: { fontSize: 10, color: '#888', marginTop: 1 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  card: {
    width: (W - 44) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardGradient: { padding: 20, minHeight: 110, justifyContent: 'flex-end' },
  cardIcon: { fontSize: 32, marginBottom: 8 },
  cardLabel: { fontSize: 17, fontWeight: '800', color: '#fff' },
  cardSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  rules: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  rulesTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 14 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  pointsBadge: {
    width: 52,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  pointsText: { fontSize: 13, fontWeight: '800', color: '#1A1A1A' },
  ruleLabel: { fontSize: 14, color: '#444', fontWeight: '500' },
  rulesNote: {
    marginTop: 12,
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
