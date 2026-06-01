import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTDF } from '../../context/TDFContext';
import { TDF_STAGES } from '../../data/tdfStages';
import { getRiderById } from '../../data/tdfRiders';

const MEDAL = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = [
  ['#FFD700', '#FFC200'],
  ['#C0C0C0', '#A0A0A0'],
  ['#CD7F32', '#B8722A'],
];

const POINTS_MAP = { p1: 5, p2: 3, p3: 1 };

export default function TDFLeaderboardScreen({ navigation }) {
  const { participants, rankedParticipants, draw, stageResults, scores, hasDraw } = useTDF();

  const completedStages = Object.keys(stageResults).length;
  const totalPossible = completedStages * (5 + 3 + 1);

  // Build per-participant point breakdown
  const buildBreakdown = (participantId) => {
    const myRiders = draw[participantId] || [];
    let pts5 = 0, pts3 = 0, pts1 = 0;
    const winStages = [];

    Object.entries(stageResults).forEach(([stageId, result]) => {
      const stage = TDF_STAGES.find(s => s.id === stageId);
      if (!result) return;
      if (myRiders.includes(result.p1)) { pts5++; winStages.push({ stageNum: stage?.num, place: 1, riderId: result.p1 }); }
      if (myRiders.includes(result.p2)) { pts3++; winStages.push({ stageNum: stage?.num, place: 2, riderId: result.p2 }); }
      if (myRiders.includes(result.p3)) { pts1++; winStages.push({ stageNum: stage?.num, place: 3, riderId: result.p3 }); }
    });
    return { pts5, pts3, pts1, winStages };
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#D97706" />

      {/* Header */}
      <LinearGradient colors={['#D97706', '#B45309']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={[styles.backArrow, { color: '#fff' }]}>←</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, { color: '#fff' }]}>🏆 Classement</Text>
              <Text style={styles.headerSub}>{completedStages} étape(s) saisie(s)</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {!hasDraw ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🎲</Text>
            <Text style={styles.emptyTitle}>Tirage non effectué</Text>
            <Text style={styles.emptySub}>
              Faites le tirage au sort pour voir le classement.
            </Text>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('TDFDraw')}
            >
              <Text style={styles.actionBtnText}>Faire le tirage</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Podium top 3 */}
            {rankedParticipants.length >= 3 && (
              <View style={styles.podiumRow}>
                {/* 2nd */}
                <PodiumBlock
                  rank={2}
                  participant={rankedParticipants[1]}
                  score={scores[rankedParticipants[1]?.id] || 0}
                  height={80}
                />
                {/* 1st */}
                <PodiumBlock
                  rank={1}
                  participant={rankedParticipants[0]}
                  score={scores[rankedParticipants[0]?.id] || 0}
                  height={110}
                  big
                />
                {/* 3rd */}
                <PodiumBlock
                  rank={3}
                  participant={rankedParticipants[2]}
                  score={scores[rankedParticipants[2]?.id] || 0}
                  height={60}
                />
              </View>
            )}

            {/* Full ranking */}
            {rankedParticipants.map((participant, index) => {
              const pts = scores[participant.id] || 0;
              const breakdown = buildBreakdown(participant.id);
              const pct = totalPossible > 0 ? (pts / totalPossible) * 100 : 0;

              return (
                <View key={participant.id} style={styles.rankCard}>
                  <View style={styles.rankTop}>
                    <View style={styles.rankLeft}>
                      <Text style={styles.rankMedal}>
                        {index < 3 ? MEDAL[index] : `${index + 1}.`}
                      </Text>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{participant.name[0].toUpperCase()}</Text>
                      </View>
                      <Text style={styles.rankName}>{participant.name}</Text>
                    </View>
                    <View style={styles.rankRight}>
                      <Text style={styles.rankPts}>{pts}</Text>
                      <Text style={styles.rankPtsLabel}>pts</Text>
                    </View>
                  </View>

                  {/* Progress bar */}
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%` }]} />
                  </View>

                  {/* Points breakdown */}
                  <View style={styles.breakdown}>
                    <BreakItem icon="🥇" count={breakdown.pts5} pts={5} />
                    <BreakItem icon="🥈" count={breakdown.pts3} pts={3} />
                    <BreakItem icon="🥉" count={breakdown.pts1} pts={1} />
                  </View>

                  {/* Recent wins */}
                  {breakdown.winStages.length > 0 && (
                    <View style={styles.winsRow}>
                      {breakdown.winStages.slice(-5).map((w, i) => {
                        const rider = getRiderById(w.riderId);
                        return (
                          <View key={i} style={styles.winChip}>
                            <Text style={styles.winChipText}>
                              Ét.{w.stageNum} {['🥇', '🥈', '🥉'][w.place - 1]} {rider?.name.split(' ').pop()}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function PodiumBlock({ rank, participant, score, height, big }) {
  const colors = MEDAL_COLORS[rank - 1] || ['#ccc', '#aaa'];
  return (
    <View style={styles.podiumBlock}>
      <Text style={[styles.podiumName, big && { fontSize: 14, fontWeight: '800' }]} numberOfLines={1}>
        {participant?.name || '—'}
      </Text>
      <Text style={[styles.podiumPts, big && { fontSize: 20 }]}>{score}pts</Text>
      <LinearGradient
        colors={colors}
        style={[styles.podiumPillar, { height }]}
      >
        <Text style={styles.podiumRankText}>{rank}</Text>
      </LinearGradient>
    </View>
  );
}

function BreakItem({ icon, count, pts }) {
  return (
    <View style={styles.breakItem}>
      <Text style={styles.breakIcon}>{icon}</Text>
      <Text style={styles.breakCount}>{count}×</Text>
      <Text style={styles.breakPts}>{count * pts}pts</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 24, fontWeight: '700' },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  content: { padding: 16 },

  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
  emptySub: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 20 },
  actionBtn: {
    backgroundColor: '#D97706',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  actionBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  podiumBlock: { flex: 1, alignItems: 'center' },
  podiumName: { fontSize: 12, fontWeight: '700', color: '#1A1A1A', marginBottom: 2, textAlign: 'center' },
  podiumPts: { fontSize: 14, fontWeight: '800', color: '#D97706', marginBottom: 6 },
  podiumPillar: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumRankText: { fontSize: 22, fontWeight: '900', color: '#fff' },

  rankCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  rankTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  rankLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rankMedal: { fontSize: 22, width: 32 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFCC00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  rankName: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  rankRight: { alignItems: 'center' },
  rankPts: { fontSize: 28, fontWeight: '900', color: '#1A1A1A', lineHeight: 30 },
  rankPtsLabel: { fontSize: 11, color: '#888' },

  progressBar: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, marginBottom: 10 },
  progressFill: { height: 6, backgroundColor: '#FFCC00', borderRadius: 3 },

  breakdown: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  breakItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  breakIcon: { fontSize: 14 },
  breakCount: { fontSize: 12, color: '#888' },
  breakPts: { fontSize: 12, fontWeight: '700', color: '#1A1A1A' },

  winsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  winChip: {
    backgroundColor: '#FFF9E6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#FFE066',
  },
  winChipText: { fontSize: 10, fontWeight: '600', color: '#856404' },
});
