import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTDF } from '../../context/TDFContext';
import { getRiderById } from '../../data/tdfRiders';

export default function TDFDrawScreen({ navigation }) {
  const { participants, draw, hasDraw } = useTDF();

  return (
    <View style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
      <StatusBar barStyle="light-content" backgroundColor="#E30613" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#E30613' }]}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={[styles.backArrow, { color: '#fff' }]}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: '#fff' }]}>🎲 Tirage au sort</Text>
            <View style={{ width: 32 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {!hasDraw && (
          <View style={styles.pendingBox}>
            <Text style={styles.pendingEmoji}>⏳</Text>
            <Text style={styles.pendingTitle}>Tirage en attente</Text>
            <Text style={styles.pendingText}>
              Le tirage au sort sera effectué par l'administrateur une fois la liste des participants complète.
            </Text>
          </View>
        )}

        {/* Results */}
        {hasDraw && participants.map(participant => {
          const riderIds = draw[participant.id] || [];
          return (
            <View key={participant.id} style={styles.participantCard}>
              <View style={styles.participantHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{participant.name[0].toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.participantName}>{participant.name}</Text>
                  <Text style={styles.participantSub}>{riderIds.length} coureurs</Text>
                </View>
              </View>
              <View style={styles.ridersGrid}>
                {riderIds.map(riderId => {
                  const rider = getRiderById(riderId);
                  if (!rider) return null;
                  return (
                    <View
                      key={riderId}
                      style={[styles.riderChip, rider.isFavorite && styles.riderChipFav]}
                    >
                      <View style={[styles.bibBadge, rider.isFavorite && styles.bibBadgeFav]}>
                        <Text style={[styles.bibText, rider.isFavorite && styles.bibTextFav]}>
                          {rider.bib}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.riderName} numberOfLines={1}>
                          {rider.isFavorite && '⭐ '}{rider.name}
                        </Text>
                        <Text style={styles.riderTeam} numberOfLines={1}>{rider.flag} {rider.team}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  backBtn: { padding: 4, width: 40 },
  backArrow: { fontSize: 24, fontWeight: '700' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', textAlign: 'center' },

  content: { padding: 16 },

  pendingBox: {
    backgroundColor: '#FFF8E1', borderRadius: 16, padding: 28, marginBottom: 20,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#FFCC00',
  },
  pendingEmoji: { fontSize: 40, marginBottom: 12 },
  pendingTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', marginBottom: 8 },
  pendingText: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20 },

  participantCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  participantHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFCC00', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  participantName: { fontSize: 17, fontWeight: '800', color: '#1A1A1A' },
  participantSub: { fontSize: 12, color: '#888', marginTop: 2 },

  ridersGrid: { gap: 8 },
  riderChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', borderRadius: 10,
    padding: 10, gap: 10, borderWidth: 1, borderColor: '#EEEEEE',
  },
  riderChipFav: { backgroundColor: '#FFFBEB', borderColor: '#FFCC00' },
  bibBadge: {
    width: 38, height: 32, borderRadius: 6, backgroundColor: '#1A1A2E',
    alignItems: 'center', justifyContent: 'center',
  },
  bibBadgeFav: { backgroundColor: '#FFCC00' },
  bibText: { fontSize: 14, fontWeight: '900', color: '#fff' },
  bibTextFav: { color: '#1A1A1A' },
  riderName: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
  riderTeam: { fontSize: 11, color: '#888', marginTop: 1 },
});
