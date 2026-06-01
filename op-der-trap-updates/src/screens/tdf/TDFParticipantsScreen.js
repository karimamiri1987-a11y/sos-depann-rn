import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, FlatList,
  StyleSheet, StatusBar, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTDF } from '../../context/TDFContext';
import { useProfile } from '../../context/ProfileContext';

export default function TDFParticipantsScreen({ navigation }) {
  const { participants, draw, isComplete, nbRequis, addParticipant, removeParticipant } = useTDF();
  const { profile, hasProfile } = useProfile();
  const [name, setName] = useState('');

  const profileName = profile.prenom ? `${profile.prenom} ${profile.nom}`.trim() : '';
  const alreadyRegistered = profileName
    ? participants.some(p => p.name.toLowerCase() === profileName.toLowerCase())
    : false;

  const handleRegisterSelf = () => {
    if (!profileName || alreadyRegistered || isFull) return;
    addParticipant(profileName);
  };

  const isFull = participants.length >= nbRequis;

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed || isFull) return;
    addParticipant(trimmed);
    setName('');
  };

  const handleRemove = (participant) => {
    Alert.alert(
      'Supprimer',
      `Retirer ${participant.name} de la liste ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => removeParticipant(participant.id),
        },
      ]
    );
  };

  const hasDraw = Object.keys(draw).length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFCC00" />

      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>👥 Participants</Text>
            <View style={[styles.countBadge, isComplete && { backgroundColor: '#16A34A' }]}>
              <Text style={styles.countText}>{participants.length}/{nbRequis}</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Inscription rapide via profil */}
        {!isFull && hasProfile && !alreadyRegistered && (
          <TouchableOpacity style={styles.selfRegisterBtn} onPress={handleRegisterSelf}>
            <Text style={styles.selfRegisterText}>⚡ M'inscrire · {profileName}</Text>
          </TouchableOpacity>
        )}
        {!isFull && hasProfile && alreadyRegistered && (
          <View style={styles.selfRegisteredBox}>
            <Text style={styles.selfRegisteredText}>✅ {profileName} est déjà inscrit(e)</Text>
          </View>
        )}

        {/* Add input */}
        {!isFull && (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Nom du participant..."
              value={name}
              onChangeText={setName}
              onSubmitEditing={handleAdd}
              returnKeyType="done"
              maxLength={30}
            />
            <TouchableOpacity
              style={[styles.addBtn, !name.trim() && styles.addBtnDisabled]}
              onPress={handleAdd}
              disabled={!name.trim()}
            >
              <Text style={styles.addBtnText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
        )}

        {isFull ? (
          <View style={styles.completeBox}>
            <Text style={styles.completeText}>
              ✅ Liste complète ({nbRequis} participants) ! Vous pouvez lancer le tirage au sort.
            </Text>
          </View>
        ) : (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              ⏳ Il manque {nbRequis - participants.length} participant(s). Le tirage se débloque à {nbRequis} inscrits.
            </Text>
          </View>
        )}

        {hasDraw && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              ⚠️ Le tirage est déjà effectué. Modifier les participants réinitialisera le tirage.
            </Text>
          </View>
        )}

        <FlatList
          data={participants}
          keyExtractor={p => p.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>👤</Text>
              <Text style={styles.emptyText}>Aucun participant</Text>
              <Text style={styles.emptySub}>Ajoutez des joueurs pour commencer</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <View style={styles.item}>
              <View style={styles.itemLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {draw[item.id] && (
                    <Text style={styles.itemSub}>{draw[item.id].length} coureur(s) attribué(s)</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={() => handleRemove(item)} style={styles.deleteBtn}>
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        {isComplete && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.drawBtn}
              onPress={() => navigation.navigate('TDFDraw')}
            >
              <Text style={styles.drawBtnText}>🎲 Faire le tirage au sort</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#FFCC00', paddingBottom: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 24, color: '#1A1A1A', fontWeight: '700' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  countBadge: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: { color: '#FFCC00', fontWeight: '800', fontSize: 14 },

  selfRegisterBtn: {
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: '#FFCC00', borderRadius: 12,
    paddingVertical: 13, paddingHorizontal: 16, alignItems: 'center',
    shadowColor: '#FFCC00', shadowOpacity: 0.35, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  selfRegisterText: { fontSize: 15, fontWeight: '800', color: '#1A1A1A' },
  selfRegisteredBox: {
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: '#DCFCE7', borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#86EFAC',
  },
  selfRegisteredText: { fontSize: 13, fontWeight: '700', color: '#166534' },

  inputRow: {
    flexDirection: 'row',
    margin: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 2,
    borderColor: '#FFCC00',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtn: {
    backgroundColor: '#FFCC00',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addBtnDisabled: { opacity: 0.4 },
  addBtnText: { fontSize: 15, fontWeight: '800', color: '#1A1A1A' },

  warning: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  warningText: { fontSize: 12, color: '#856404', lineHeight: 18 },

  completeBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#16A34A',
  },
  completeText: { fontSize: 12, color: '#166534', lineHeight: 18, fontWeight: '600' },

  list: { paddingHorizontal: 16, paddingBottom: 100 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  itemLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFCC00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  itemName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  itemSub: { fontSize: 12, color: '#888', marginTop: 2 },
  deleteBtn: { padding: 8 },
  deleteIcon: { fontSize: 18 },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  emptySub: { fontSize: 13, color: '#888', marginTop: 4 },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(249,249,249,0.95)',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  drawBtn: {
    backgroundColor: '#E30613',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  drawBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
