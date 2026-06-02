import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../../context/ProfileContext';
import { ODT } from '../../constants/brand';

export default function ProfileScreen({ navigation }) {
  const { profile, saveProfile } = useProfile();
  const [prenom, setPrenom] = useState(profile.prenom);
  const [nom, setNom]       = useState(profile.nom);
  const [phone, setPhone]   = useState(profile.phone);
  const [email, setEmail]   = useState(profile.email);
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    setPrenom(profile.prenom);
    setNom(profile.nom);
    setPhone(profile.phone);
    setEmail(profile.email);
  }, [profile]);

  const isValid = prenom.trim().length > 0 && phone.trim().length > 0;

  const handleSave = async () => {
    if (!isValid) return;
    await saveProfile({ prenom: prenom.trim(), nom: nom.trim(), phone: phone.trim(), email: email.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    Alert.alert(
      'Effacer le profil',
      'Supprimer toutes vos informations enregistrées ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Effacer', style: 'destructive', onPress: () => {
            saveProfile({ prenom: '', nom: '', phone: '', email: '' });
            setPrenom(''); setNom(''); setPhone(''); setEmail('');
          }},
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: ODT.cream }}>
      <StatusBar barStyle="light-content" backgroundColor={ODT.primary} />

      <View style={[styles.header, { backgroundColor: ODT.primary }]}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mon profil</Text>
            <View style={{ width: 38 }} />
          </View>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>
                {prenom ? prenom[0].toUpperCase() : '?'}
              </Text>
            </View>
            <Text style={styles.avatarHint}>
              Enregistrez vos infos une fois, elles pré-rempliront automatiquement les réservations et l'inscription aux pronostics.
            </Text>
          </View>

          {/* Champs */}
          <View style={styles.card}>
            <Field
              label="Prénom *"
              icon="person-outline"
              value={prenom}
              onChangeText={setPrenom}
              placeholder="Votre prénom"
              autoCapitalize="words"
            />
            <Separator />
            <Field
              label="Nom"
              icon="person-outline"
              value={nom}
              onChangeText={setNom}
              placeholder="Votre nom"
              autoCapitalize="words"
            />
            <Separator />
            <Field
              label="Téléphone *"
              icon="call-outline"
              value={phone}
              onChangeText={setPhone}
              placeholder="+352 xx xx xx xx"
              keyboardType="phone-pad"
            />
            <Separator />
            <Field
              label="E-mail"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="votre@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Boutons */}
          <TouchableOpacity
            style={[styles.saveBtn, !isValid && styles.saveBtnDisabled, saved && styles.saveBtnSuccess]}
            onPress={handleSave}
            disabled={!isValid}
          >
            <Ionicons
              name={saved ? 'checkmark-circle' : 'save-outline'}
              size={20}
              color="#fff"
            />
            <Text style={styles.saveBtnText}>
              {saved ? 'Profil enregistré !' : 'Enregistrer'}
            </Text>
          </TouchableOpacity>

          {(profile.prenom || profile.phone) && (
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>Effacer le profil</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.hint}>
            * Champs obligatoires pour utiliser la pré-saisie automatique.
          </Text>

          <TouchableOpacity
            style={styles.adminBtn}
            onPress={() => navigation.navigate('Admin')}
          >
            <Ionicons name="settings-outline" size={14} color={ODT.gray} />
            <Text style={styles.adminBtnText}>Administration</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({ label, icon, value, onChangeText, placeholder, keyboardType, autoCapitalize }) {
  return (
    <View style={styles.fieldRow}>
      <View style={styles.fieldIcon}>
        <Ionicons name={icon} size={18} color={ODT.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#bbb"
          keyboardType={keyboardType || 'default'}
          autoCapitalize={autoCapitalize || 'sentences'}
        />
      </View>
    </View>
  );
}

function Separator() {
  return <View style={styles.sep} />;
}

const styles = StyleSheet.create({
  header: { paddingBottom: 16 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 8, gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center' },

  content: { padding: 16 },

  avatarSection: { alignItems: 'center', marginBottom: 24, paddingTop: 8 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: ODT.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: ODT.primary, shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  avatarLetter: { fontSize: 36, fontWeight: '900', color: '#fff' },
  avatarHint: {
    fontSize: 13, color: ODT.gray, textAlign: 'center',
    lineHeight: 18, paddingHorizontal: 20,
  },

  card: {
    backgroundColor: ODT.white, borderRadius: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
    overflow: 'hidden',
  },
  fieldRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  fieldIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#EAF5EC', alignItems: 'center', justifyContent: 'center',
  },
  fieldLabel: { fontSize: 11, color: ODT.gray, fontWeight: '700', marginBottom: 3 },
  fieldInput: { fontSize: 15, color: ODT.dark, fontWeight: '600', paddingVertical: 0 },
  sep: { height: 1, backgroundColor: ODT.border, marginLeft: 66 },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: ODT.primary, borderRadius: 14,
    paddingVertical: 16, marginBottom: 12,
    shadowColor: ODT.primary, shadowOpacity: 0.3, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  saveBtnDisabled: { backgroundColor: '#9CA3AF', shadowOpacity: 0 },
  saveBtnSuccess:  { backgroundColor: ODT.green },
  saveBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  resetBtn: { alignItems: 'center', paddingVertical: 12, marginBottom: 8 },
  resetBtnText: { fontSize: 14, color: ODT.red, fontWeight: '600' },

  hint: { fontSize: 11, color: '#bbb', textAlign: 'center' },

  adminBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 20, paddingVertical: 10, opacity: 0.45,
  },
  adminBtnText: { fontSize: 12, color: ODT.gray, fontWeight: '600' },
});
