import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, Modal,
  StyleSheet, StatusBar, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTDF } from '../../context/TDFContext';
import { TDF_STAGES, STAGE_TYPE_ICON } from '../../data/tdfStages';
import { TDF_RIDERS, getRiderById } from '../../data/tdfRiders';

const TYPE_COLOR = {
  'Plat':       '#16A34A',
  'Accidenté':  '#D97706',
  'Montagne':   '#E30613',
  'CLM':        '#7C3AED',
};

const EMPTY_PICKS = { p1: '', p2: '', p3: '', combatif: '' };

export default function TDFStagesScreen({ navigation }) {
  const { stageResults, setStageResult, clearStageResult, hasDraw } = useTDF();
  const [modalStage, setModalStage] = useState(null);
  const [picks, setPicks] = useState(EMPTY_PICKS);

  const openModal = (stage) => {
    const result = stageResults[stage.id];
    setPicks(result ? { ...EMPTY_PICKS, ...result } : EMPTY_PICKS);
    setModalStage(stage);
  };

  const saveResult = () => {
    if (!picks.p1 || !picks.p2 || !picks.p3) return;
    if (new Set([picks.p1, picks.p2, picks.p3]).size < 3) return;
    setStageResult(modalStage.id, {
      p1: picks.p1, p2: picks.p2, p3: picks.p3, combatif: picks.combatif || '',
    });
    setModalStage(null);
  };

  const completedCount = Object.keys(stageResults).length;

  if (!hasDraw) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
        <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />
        <View style={[styles.header, { backgroundColor: '#1A1A2E' }]}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={[styles.backArrow, { color: '#fff' }]}>←</Text>
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: '#fff' }]}>🏁 Étapes</Text>
              <View style={{ width: 32 }} />
            </View>
          </SafeAreaView>
        </View>
        <View style={styles.lockBox}>
          <Text style={styles.lockIcon}>🎲</Text>
          <Text style={styles.lockTitle}>Tirage requis</Text>
          <Text style={styles.lockSub}>
            Effectuez d'abord le tirage au sort pour pouvoir saisir les résultats des étapes.
          </Text>
          <TouchableOpacity style={styles.lockBtn} onPress={() => navigation.navigate('TDFDraw')}>
            <Text style={styles.lockBtnText}>Aller au tirage</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#1A1A2E' }]}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={[styles.backArrow, { color: '#fff' }]}>←</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, { color: '#fff' }]}>🏁 Étapes</Text>
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressText}>{completedCount}/21</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <FlatList
        data={TDF_STAGES}
        keyExtractor={s => s.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: stage }) => {
          const result = stageResults[stage.id];
          const done = !!result;
          const typeColor = TYPE_COLOR[stage.type] || '#888';

          return (
            <TouchableOpacity
              style={[styles.stageRow, done && styles.stageRowDone]}
              onPress={() => openModal(stage)}
              activeOpacity={0.8}
            >
              <View style={[styles.stageNum, { backgroundColor: done ? '#FFCC00' : '#1A1A2E' }]}>
                <Text style={[styles.stageNumText, { color: done ? '#1A1A1A' : '#fff' }]}>
                  {stage.num}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stageRoute} numberOfLines={1}>
                  {stage.from} → {stage.to}
                </Text>
                <View style={styles.stageMeta}>
                  <View style={[styles.typeChip, { backgroundColor: typeColor + '20', borderColor: typeColor + '60' }]}>
                    <Text style={[styles.typeText, { color: typeColor }]}>
                      {STAGE_TYPE_ICON[stage.type]} {stage.type}
                    </Text>
                  </View>
                  <Text style={styles.stageKm}>{stage.km} km</Text>
                </View>
                {done && (
                  <View style={styles.resultRow}>
                    {[
                      { key: 'p1', label: '🥇' },
                      { key: 'p2', label: '🥈' },
                      { key: 'p3', label: '🥉' },
                      { key: 'combatif', label: '🔥' },
                    ].map(({ key, label }) => {
                      const rider = getRiderById(result[key]);
                      return rider ? (
                        <Text key={key} style={styles.resultChip} numberOfLines={1}>
                          {label} {rider.name.split(' ').pop()}
                        </Text>
                      ) : null;
                    })}
                  </View>
                )}
              </View>
              <Text style={styles.chevron}>{done ? '✏️' : '▶'}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Stage result modal */}
      <Modal visible={!!modalStage} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {modalStage && (
              <StageResultPicker
                stage={modalStage}
                picks={picks}
                setPicks={setPicks}
                onSave={saveResult}
                onClear={() => { clearStageResult(modalStage.id); setModalStage(null); }}
                onClose={() => setModalStage(null)}
                hasSaved={!!stageResults[modalStage.id]}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StageResultPicker({ stage, picks, setPicks, onSave, onClear, onClose, hasSaved }) {
  const podium = [
    { key: 'p1', label: '🥇 1er', color: '#FFCC00', pts: '+5 pts' },
    { key: 'p2', label: '🥈 2ème', color: '#C0C0C0', pts: '+3 pts' },
    { key: 'p3', label: '🥉 3ème', color: '#CD7F32', pts: '+1 pt' },
  ];

  const isValid =
    picks.p1 && picks.p2 && picks.p3 &&
    new Set([picks.p1, picks.p2, picks.p3]).size === 3;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalStageNum}>Étape {stage.num}</Text>
        <Text style={styles.modalRoute}>{stage.from} → {stage.to}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Podium : 3 coureurs différents */}
      {podium.map(pos => (
        <View key={pos.key} style={styles.posSection}>
          <View style={styles.posHeader}>
            <Text style={styles.posLabel}>{pos.label}</Text>
            <Text style={styles.posPts}>{pos.pts}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.riderPicker}>
              {TDF_RIDERS.map(rider => {
                const selected = picks[pos.key] === rider.id;
                const usedElsewhere = ['p1', 'p2', 'p3']
                  .some(k => k !== pos.key && picks[k] === rider.id);
                return (
                  <RiderPickChip
                    key={rider.id}
                    rider={rider}
                    selected={selected}
                    disabled={usedElsewhere}
                    color={pos.color}
                    onPress={() => !usedElsewhere && setPicks(prev => ({ ...prev, [pos.key]: rider.id }))}
                  />
                );
              })}
            </View>
          </ScrollView>
        </View>
      ))}

      {/* Combatif : n'importe quel coureur (+4 pts) */}
      <View style={[styles.posSection, styles.combatifSection]}>
        <View style={styles.posHeader}>
          <Text style={styles.posLabel}>🔥 Combatif du jour</Text>
          <Text style={[styles.posPts, { color: '#E30613' }]}>+4 pts</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.riderPicker}>
            {TDF_RIDERS.map(rider => {
              const selected = picks.combatif === rider.id;
              return (
                <RiderPickChip
                  key={rider.id}
                  rider={rider}
                  selected={selected}
                  color="#E30613"
                  onPress={() => setPicks(prev => ({
                    ...prev,
                    combatif: prev.combatif === rider.id ? '' : rider.id,
                  }))}
                />
              );
            })}
          </View>
        </ScrollView>
        <Text style={styles.combatifHint}>Optionnel · touchez à nouveau pour désélectionner</Text>
      </View>

      <View style={styles.modalActions}>
        {hasSaved && (
          <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
            <Text style={styles.clearBtnText}>Effacer</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
          onPress={onSave}
          disabled={!isValid}
        >
          <Text style={styles.saveBtnText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>

      {!isValid && picks.p1 && picks.p2 && picks.p3 && (
        <Text style={styles.dupError}>⚠️ Sélectionnez 3 coureurs différents sur le podium</Text>
      )}
      <View style={{ height: 12 }} />
    </ScrollView>
  );
}

function RiderPickChip({ rider, selected, disabled, color, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.riderPickChip,
        selected && { borderColor: color, backgroundColor: color + '22' },
        disabled && styles.riderPickDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.pickBib}>
        <Text style={styles.pickBibText}>{rider.bib}</Text>
      </View>
      <Text style={[styles.riderPickName, disabled && { color: '#bbb' }]} numberOfLines={1}>
        {rider.name.split(' ').pop()}
      </Text>
      {selected && <Text style={[styles.selectedCheck, { color }]}>✓</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 24, fontWeight: '700' },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  progressBadge: { backgroundColor: '#FFCC00', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  progressText: { fontWeight: '800', fontSize: 13, color: '#1A1A1A' },

  lockBox: { alignItems: 'center', paddingTop: 70, paddingHorizontal: 32 },
  lockIcon: { fontSize: 52, marginBottom: 12 },
  lockTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
  lockSub: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  lockBtn: { backgroundColor: '#E30613', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  lockBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  list: { padding: 12, paddingBottom: 32 },
  stageRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14,
    padding: 14, marginBottom: 8, gap: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  stageRowDone: { borderLeftWidth: 4, borderLeftColor: '#FFCC00' },
  stageNum: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stageNumText: { fontWeight: '800', fontSize: 14 },
  stageRoute: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  stageMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeChip: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  typeText: { fontSize: 10, fontWeight: '700' },
  stageKm: { fontSize: 11, color: '#888' },
  resultRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  resultChip: { fontSize: 11, color: '#555', fontWeight: '600' },
  chevron: { fontSize: 14, color: '#aaa' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '90%', paddingBottom: 32,
  },
  modalHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee', position: 'relative' },
  modalStageNum: { fontSize: 12, color: '#888', fontWeight: '600', marginBottom: 2 },
  modalRoute: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  closeBtn: { position: 'absolute', right: 20, top: 20, padding: 4 },
  closeBtnText: { fontSize: 18, color: '#888' },

  posSection: { paddingHorizontal: 16, paddingTop: 14 },
  combatifSection: { borderTopWidth: 1, borderTopColor: '#F0F0F0', marginTop: 8, paddingTop: 16 },
  posHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  posLabel: { fontSize: 15, fontWeight: '800', color: '#1A1A1A' },
  posPts: { fontSize: 13, fontWeight: '600', color: '#888' },

  riderPicker: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  riderPickChip: {
    alignItems: 'center', borderWidth: 2, borderColor: '#eee', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8, minWidth: 72,
  },
  riderPickDisabled: { opacity: 0.35 },
  pickBib: {
    minWidth: 30, paddingHorizontal: 4, height: 20, borderRadius: 4, backgroundColor: '#1A1A2E',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  pickBibText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  riderPickName: { fontSize: 11, fontWeight: '600', color: '#1A1A1A' },
  selectedCheck: { fontSize: 12, fontWeight: '800', marginTop: 2 },
  combatifHint: { fontSize: 11, color: '#aaa', fontStyle: 'italic', marginTop: 6 },

  modalActions: { flexDirection: 'row', gap: 12, margin: 16, marginTop: 20 },
  saveBtn: { flex: 1, backgroundColor: '#1A1A2E', borderRadius: 12, padding: 16, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontSize: 15, fontWeight: '800', color: '#FFCC00' },
  clearBtn: { backgroundColor: '#FEE2E2', borderRadius: 12, padding: 16, paddingHorizontal: 20, alignItems: 'center' },
  clearBtnText: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
  dupError: { textAlign: 'center', fontSize: 12, color: '#DC2626', marginBottom: 8 },
});
