import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTDF } from '../../context/TDFContext';
import { TDF_RIDERS, getRiderById } from '../../data/tdfRiders';

const SPECIALTY_COLOR = {
  'GC':       '#E30613',
  'GC/CLM':   '#C20010',
  'Sprinter': '#1A6FE3',
  'Classique':'#16A34A',
  'Grimpeur': '#9333EA',
  'Baroudeur':'#D97706',
};

export default function TDFDrawScreen({ navigation }) {
  const { participants, draw, hasDraw, performDraw } = useTDF();
  const [spinning, setSpinning] = useState(false);

  const handleDraw = () => {
    if (participants.length < 2) {
      Alert.alert('Impossible', 'Ajoutez au moins 2 participants avant de faire le tirage.');
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
    }, 800);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#E30613" />

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
              style={[styles.drawBtn, participants.length < 2 && styles.drawBtnDisabled]}
              onPress={handleDraw}
              disabled={participants.length < 2}
            >
              <Text style={styles.drawBtnIcon}>🎲</Text>
              <Text style={styles.drawBtnText}>
                {hasDraw ? 'Refaire le tirage' : 'Lancer le tirage'}
              </Text>
              <Text style={styles.drawBtnSub}>
                {participants.length} joueur(s) · {TDF_RIDERS.length} coureurs
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {!hasDraw && !spinning && participants.length >= 2 && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              🎯 Chaque participant recevra au moins un coureur.
              Les {TDF_RIDERS.length} leaders d'équipe seront répartis aléatoirement.
            </Text>
          </View>
        )}

        {participants.length < 2 && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              👥 Ajoutez au moins 2 participants pour effectuer le tirage.
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
                  <Text style={styles.participantSub}>{riderIds.length} coureur(s)</Text>
                </View>
              </View>
              <View style={styles.ridersGrid}>
                {riderIds.map(riderId => {
                  const rider = getRiderById(riderId);
                  if (!rider) return null;
                  const specColor = SPECIALTY_COLOR[rider.specialty] || '#888';
                  return (
                    <View key={riderId} style={styles.riderChip}>
                      <Text style={styles.riderFlag}>{rider.flag}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.riderName} numberOfLines={1}>{rider.name}</Text>
                        <Text style={styles.riderTeam} numberOfLines={1}>{rider.team}</Text>
                      </View>
                      <View style={[styles.specBadge, { backgroundColor: specColor + '22', borderColor: specColor + '55' }]}>
                        <Text style={[styles.specText, { color: specColor }]}>{rider.specialty}</Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backBtn: { padding: 4, width: 40 },
  backArrow: { fontSize: 24, fontWeight: '700' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', textAlign: 'center' },

  content: { padding: 16 },

  drawSection: { marginBottom: 16 },
  drawBtn: {
    backgroundColor: '#E30613',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#E30613',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  drawBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  drawBtnIcon: { fontSize: 40, marginBottom: 8 },
  drawBtnText: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  drawBtnSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  spinBox: { alignItems: 'center', padding: 32 },
  spinEmoji: { fontSize: 52, marginBottom: 12 },
  spinText: { fontSize: 18, fontWeight: '700', color: '#E30613' },

  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoText: { fontSize: 13, color: '#1E40AF', lineHeight: 19 },

  warningBox: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  warningText: { fontSize: 14, color: '#856404', marginBottom: 12, textAlign: 'center' },
  addParticipantsBtn: {
    backgroundColor: '#FFCC00',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  addParticipantsBtnText: { fontWeight: '700', fontSize: 14, color: '#1A1A1A' },

  participantCard: {
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
  participantHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFCC00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  participantName: { fontSize: 17, fontWeight: '800', color: '#1A1A1A' },
  participantSub: { fontSize: 12, color: '#888', marginTop: 2 },

  ridersGrid: { gap: 8 },
  riderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  riderFlag: { fontSize: 20 },
  riderName: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
  riderTeam: { fontSize: 11, color: '#888', marginTop: 1 },
  specBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  specText: { fontSize: 10, fontWeight: '700' },
});
