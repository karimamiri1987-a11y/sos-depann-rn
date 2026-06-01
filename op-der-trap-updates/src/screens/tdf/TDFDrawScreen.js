import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTDF } from '../../context/TDFContext';
import { getRiderById } from '../../data/tdfRiders';

export default function TDFDrawScreen({ navigation }) {
  const {
    participants, draw, hasDraw, isComplete, performDraw,
    nbRequis, totalCoureurs,
  } = useTDF();
  const [spinning, setSpinning] = useState(false);

  const handleDraw = () => {
    if (!isComplete) {
      Alert.alert('Liste incomplète', `Il faut ${nbRequis} participants inscrits avant de lancer le tirage.`);
      return;
    }
    if (hasDraw) {
      Alert.alert(
        'Nouveau tirage',
        'Refaire le tirage effacera les attributions actuelles. Continuer ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Refaire', style: 'destructive', onPress: doSpin },
        ]
      );
    } else {
      doSpin();
    }
  };

  const doSpin = () => {
    setSpinning(true);
    setTimeout(() => {
      performDraw();
      setSpinning(false);
    }, 900);
  };

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

        {/* Draw button */}
        <View style={styles.drawSection}>
          {spinning ? (
            <View style={styles.spinBox}>
              <Text style={styles.spinEmoji}>🎰</Text>
              <Text style={styles.spinText}>Tirage en cours...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.drawBtn, !isComplete && styles.drawBtnDisabled]}
              onPress={handleDraw}
              disabled={!isComplete}
            >
              <Text style={styles.drawBtnIcon}>🎲</Text>
              <Text style={styles.drawBtnText}>
                {hasDraw ? 'Refaire le tirage' : 'Lancer le tirage'}
              </Text>
              <Text style={styles.drawBtnSub}>
                {participants.length}/{nbRequis} joueurs · {totalCoureurs} coureurs
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {!hasDraw && !spinning && isComplete && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              🎯 Chaque joueur recevra 8 coureurs : un favori (dossard finissant par 1),
              puis un coureur pour chaque chiffre jusqu'à 8, répartis aléatoirement entre les {nbRequis} joueurs.
            </Text>
          </View>
        )}

        {!isComplete && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              👥 Il faut {nbRequis} participants inscrits ({participants.length} pour l'instant)
              pour effectuer le tirage.
            </Text>
            <TouchableOpacity
              style={styles.addParticipantsBtn}
              onPress={() => navigation.navigate('TDFParticipants')}
            >
              <Text style={styles.addParticipantsBtnText}>Gérer les participants</Text>
            </TouchableOpacity>
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

  drawSection: { marginBottom: 16 },
  drawBtn: {
    backgroundColor: '#E30613', borderRadius: 16, padding: 24, alignItems: 'center',
    shadowColor: '#E30613', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  drawBtnDisabled: { backgroundColor: '#9CA3AF', shadowOpacity: 0 },
  drawBtnIcon: { fontSize: 40, marginBottom: 8 },
  drawBtnText: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  drawBtnSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  spinBox: { alignItems: 'center', padding: 32 },
  spinEmoji: { fontSize: 52, marginBottom: 12 },
  spinText: { fontSize: 18, fontWeight: '700', color: '#E30613' },

  infoBox: {
    backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, marginBottom: 16,
    borderLeftWidth: 4, borderLeftColor: '#3B82F6',
  },
  infoText: { fontSize: 13, color: '#1E40AF', lineHeight: 19 },

  warningBox: { backgroundColor: '#FFF3CD', borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center' },
  warningText: { fontSize: 14, color: '#856404', marginBottom: 12, textAlign: 'center', lineHeight: 20 },
  addParticipantsBtn: { backgroundColor: '#FFCC00', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  addParticipantsBtnText: { fontWeight: '700', fontSize: 14, color: '#1A1A1A' },

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
