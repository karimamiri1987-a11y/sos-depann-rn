import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, Image, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { F } from '../constants/data';
import { AddressAutocomplete } from '../components';

const FAKE_HISTORY = [
  { id: 1, icon: 'faucet',     color: '#0891B2', label: 'Plomberie',   pro: 'Marc Dupont',  date: '12 avr. 2026', status: 'Terminé', amount: 145 },
  { id: 2, icon: 'lightning-bolt', color: '#D97706', label: 'Électricité', pro: 'Jean Moreau',  date: '28 mars 2026', status: 'Terminé', amount: 110 },
  { id: 3, icon: 'lock-outline', color: '#7C3AED', label: 'Serrurerie',  pro: 'Thomas Leroy', date: '5 mars 2026',  status: 'Annulé',  amount: 0 },
];

function Field({ label, value, onChangeText, placeholder, keyboardType, editable = true }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType || 'default'}
        editable={editable}
        style={[styles.input, !editable && { backgroundColor: '#F1F5F9', color: '#94A3B8' }]}
      />
    </View>
  );
}

function AuthForm({ onSuccess }) {
  const [tab, setTab] = useState('login');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleLogin = () => {
    if (!email.includes('@')) return Alert.alert('Email invalide', 'Entrez un email valide.');
    if (!password) return Alert.alert('Mot de passe requis', '');
    onSuccess({ prenom: 'Utilisateur', nom: '', email, phone: '' });
  };

  const handleRegister = () => {
    if (!prenom.trim() || !nom.trim()) return Alert.alert('Champ manquant', 'Entrez votre prénom et nom.');
    if (!email.includes('@')) return Alert.alert('Email invalide', 'Entrez un email valide.');
    if (phone.length < 10) return Alert.alert('Téléphone invalide', '');
    if (password.length < 8) return Alert.alert('Mot de passe trop court', 'Au moins 8 caractères.');
    if (password !== confirm) return Alert.alert('Mots de passe différents', '');
    onSuccess({ prenom, nom, email, phone });
  };

  return (
    <View style={{ padding: 20 }}>
      {/* Tab switcher */}
      <View style={styles.tabRow}>
        {[{ id: 'login', label: 'Connexion' }, { id: 'register', label: 'Inscription' }].map(t => (
          <TouchableOpacity key={t.id} onPress={() => setTab(t.id)}
            style={[styles.tabBtn, tab === t.id && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'login' && (
        <>
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="vous@exemple.fr" keyboardType="email-address" />
          <Field label="Mot de passe" value={password} onChangeText={setPassword} placeholder="••••••••" />
          <TouchableOpacity onPress={handleLogin} style={styles.ctaBtn}>
            <Text style={{ color: '#fff', fontFamily: F.bold, fontSize: 16 }}>Se connecter</Text>
          </TouchableOpacity>
          <View style={styles.switchRow}>
            <Text style={{ fontFamily: F.regular, fontSize: 13, color: '#64748B' }}>Pas de compte ? </Text>
            <TouchableOpacity onPress={() => setTab('register')}>
              <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#0891B2' }}>S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {tab === 'register' && (
        <>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}><Field label="Prénom" value={prenom} onChangeText={setPrenom} placeholder="Jean" /></View>
            <View style={{ flex: 1 }}><Field label="Nom" value={nom} onChangeText={setNom} placeholder="Dupont" /></View>
          </View>
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="vous@exemple.fr" keyboardType="email-address" />
          <Field label="Téléphone" value={phone} onChangeText={setPhone} placeholder="06 12 34 56 78" keyboardType="phone-pad" />
          <Field label="Mot de passe" value={password} onChangeText={setPassword} placeholder="Minimum 8 caractères" />
          <Field label="Confirmer le mot de passe" value={confirm} onChangeText={setConfirm} placeholder="Retapez le mot de passe" />
          <TouchableOpacity onPress={handleRegister} style={styles.ctaBtn}>
            <Text style={{ color: '#fff', fontFamily: F.bold, fontSize: 16 }}>Créer mon compte</Text>
          </TouchableOpacity>
          <View style={styles.switchRow}>
            <Text style={{ fontFamily: F.regular, fontSize: 13, color: '#64748B' }}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => setTab('login')}>
              <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#0891B2' }}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

export default function UserProfileScreen({ navigation }) {
  const { user, loginUser, logoutUser } = useApp();
  const [editing, setEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [prenom, setPrenom] = useState(user?.prenom || '');
  const [nom, setNom] = useState(user?.nom || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(
    user?.address && typeof user.address === 'object'
      ? user.address
      : { rue: '', codePostal: '', ville: '' }
  );

  const handleSave = () => {
    loginUser({ ...user, prenom, nom, email, phone, address });
    setEditing(false);
  };

  const initials = user ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() || '?' : '?';
  const fullName = user ? `${user.prenom} ${user.nom}`.trim() : '';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Header */}
      <LinearGradient colors={['#0C1222', '#0F172A', '#0D5F7A']} style={styles.headerGrad}>
        <SafeAreaView edges={['top']}>
          <TouchableOpacity
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')}
            style={{ marginBottom: 16 }}>
            <Text style={{ color: '#94A3B8', fontSize: 15, fontFamily: F.medium }}>← Retour</Text>
          </TouchableOpacity>

          {user ? (
            <View style={{ alignItems: 'center', paddingBottom: 8 }}>
              {/* Avatar */}
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <Text style={styles.userName}>{fullName || 'Mon profil'}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.memberBadge}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MaterialCommunityIcons name="check-circle" size={11} color="#0891B2" />
                  <Text style={{ color: '#0891B2', fontFamily: F.bold, fontSize: 11 }}>Membre vérifié</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={{ paddingBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="person-circle-outline" size={28} color="#fff" />
                <Text style={{ fontFamily: F.groteskBold, fontSize: 26, color: '#fff' }}>Mon profil</Text>
              </View>
              <Text style={{ fontFamily: F.regular, color: '#94A3B8', fontSize: 14, marginTop: 4 }}>
                Connectez-vous pour accéder à votre profil
              </Text>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>

      {!user ? (
        /* ── NON CONNECTÉ ── */
        <ScrollView>
          <AuthForm onSuccess={(data) => { loginUser(data); setPrenom(data.prenom); setNom(data.nom); setEmail(data.email); setPhone(data.phone || ''); }} />
        </ScrollView>
      ) : (
        /* ── CONNECTÉ ── */
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>

          {/* Stats rapides */}
          <View style={styles.statsRow}>
            {[
              { icon: 'tools',              iconColor: '#0891B2', val: FAKE_HISTORY.filter(h => h.status === 'Terminé').length, label: 'Interventions' },
              { icon: 'star',               iconColor: '#F59E0B', val: '4.8', label: 'Note moy.' },
              { icon: 'calendar-month-outline', iconColor: '#7C3AED', val: 'Avr. 2026', label: 'Membre depuis' },
            ].map((s, i) => (
              <View key={i} style={styles.statBox}>
                <MaterialCommunityIcons name={s.icon} size={18} color={s.iconColor} style={{ marginBottom: 4 }} />
                <Text style={{ fontFamily: F.groteskBold, fontSize: 18, color: '#0F172A' }}>{s.val}</Text>
                <Text style={{ fontFamily: F.regular, fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Infos personnelles */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Informations personnelles</Text>
              <TouchableOpacity onPress={() => editing ? handleSave() : setEditing(true)} style={[styles.editBtn, editing && styles.saveBtn2]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MaterialCommunityIcons name={editing ? 'check' : 'pencil-outline'} size={13} color={editing ? '#fff' : '#0891B2'} />
                  <Text style={{ fontFamily: F.bold, fontSize: 13, color: editing ? '#fff' : '#0891B2' }}>
                    {editing ? 'Enregistrer' : 'Modifier'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <Field label="Prénom" value={prenom} onChangeText={setPrenom} placeholder="Jean" editable={editing} />
            <Field label="Nom" value={nom} onChangeText={setNom} placeholder="Dupont" editable={editing} />
            <Field label="Email" value={email} onChangeText={setEmail} placeholder="vous@exemple.fr" keyboardType="email-address" editable={editing} />
            <Field label="Téléphone" value={phone} onChangeText={setPhone} placeholder="06 12 34 56 78" keyboardType="phone-pad" editable={editing} />
            <AddressAutocomplete value={address} onChange={setAddress} editable={editing} />

            {editing && (
              <TouchableOpacity onPress={() => setEditing(false)} style={styles.cancelBtn}>
                <Text style={{ fontFamily: F.semibold, fontSize: 14, color: '#64748B' }}>Annuler</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Historique */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historique des interventions</Text>
            {FAKE_HISTORY.map(h => (
              <TouchableOpacity key={h.id} style={styles.historyCard} activeOpacity={0.75} onPress={() => setSelectedItem(h)}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: h.color + '15', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <MaterialCommunityIcons name={h.icon} size={22} color={h.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: F.bold, fontSize: 14, color: '#0F172A' }}>{h.label}</Text>
                  <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#64748B', marginTop: 2 }}>
                    {h.pro} · {h.date}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: F.groteskBold, fontSize: 15, color: h.amount > 0 ? '#0F172A' : '#94A3B8' }}>
                    {h.amount > 0 ? `${h.amount}€` : '—'}
                  </Text>
                  <View style={[styles.statusPill, { backgroundColor: h.status === 'Terminé' ? '#DCFCE7' : '#FEF2F2' }]}>
                    <Text style={{ fontFamily: F.bold, fontSize: 10, color: h.status === 'Terminé' ? '#16A34A' : '#DC2626' }}>
                      {h.status}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Detail modal */}
          <Modal visible={!!selectedItem} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedItem(null)}>
            {selectedItem && (
              <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
                {/* Modal header */}
                <LinearGradient colors={['#0C1222', '#0F172A', '#0D5F7A']} style={detSt.header}>
                  <SafeAreaView edges={['top']}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <TouchableOpacity onPress={() => setSelectedItem(null)} style={detSt.backBtn}>
                        <Ionicons name="arrow-back" size={20} color="#fff" />
                      </TouchableOpacity>
                      <Text style={detSt.headerTitle}>Détail de l'intervention</Text>
                      <View style={{ width: 40 }} />
                    </View>
                    {/* Icon + label */}
                    <View style={{ alignItems: 'center', paddingTop: 20, paddingBottom: 8 }}>
                      <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: selectedItem.color + '30', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 1.5, borderColor: selectedItem.color + '60' }}>
                        <MaterialCommunityIcons name={selectedItem.icon} size={30} color={selectedItem.color} />
                      </View>
                      <Text style={detSt.catLabel}>{selectedItem.label}</Text>
                      <View style={[detSt.statusBadge, { backgroundColor: selectedItem.status === 'Terminé' ? '#DCFCE7' : '#FEF2F2' }]}>
                        <Text style={{ fontFamily: F.bold, fontSize: 12, color: selectedItem.status === 'Terminé' ? '#16A34A' : '#DC2626' }}>
                          {selectedItem.status}
                        </Text>
                      </View>
                    </View>
                  </SafeAreaView>
                </LinearGradient>

                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
                  {/* Pro */}
                  <View style={detSt.card}>
                    <Text style={detSt.cardTitle}>Professionnel</Text>
                    <View style={detSt.row}>
                      <MaterialCommunityIcons name="account-hard-hat" size={16} color="#0891B2" />
                      <Text style={detSt.rowLabel}>Nom</Text>
                      <Text style={detSt.rowValue}>{selectedItem.pro}</Text>
                    </View>
                  </View>

                  {/* Date */}
                  <View style={detSt.card}>
                    <Text style={detSt.cardTitle}>Date</Text>
                    <View style={detSt.row}>
                      <MaterialCommunityIcons name="calendar" size={16} color="#0891B2" />
                      <Text style={detSt.rowLabel}>Intervention</Text>
                      <Text style={detSt.rowValue}>{selectedItem.date}</Text>
                    </View>
                  </View>

                  {/* Facturation */}
                  <View style={detSt.card}>
                    <Text style={detSt.cardTitle}>Facturation</Text>
                    {selectedItem.amount > 0 ? (
                      <>
                        <View style={detSt.row}>
                          <MaterialCommunityIcons name="cash-multiple" size={16} color="#0891B2" />
                          <Text style={detSt.rowLabel}>Total payé</Text>
                          <Text style={[detSt.rowValue, { color: '#0891B2', fontFamily: F.groteskBold }]}>{selectedItem.amount}€</Text>
                        </View>
                        <View style={detSt.row}>
                          <MaterialCommunityIcons name="cash-check" size={16} color="#16A34A" />
                          <Text style={detSt.rowLabel}>Acompte</Text>
                          <Text style={[detSt.rowValue, { color: '#16A34A' }]}>{Math.round(selectedItem.amount * 0.3)}€</Text>
                        </View>
                        <View style={[detSt.row, { borderBottomWidth: 0 }]}>
                          <MaterialCommunityIcons name="cash" size={16} color="#64748B" />
                          <Text style={detSt.rowLabel}>Solde réglé</Text>
                          <Text style={detSt.rowValue}>{selectedItem.amount - Math.round(selectedItem.amount * 0.3)}€</Text>
                        </View>
                      </>
                    ) : (
                      <View style={[detSt.row, { borderBottomWidth: 0 }]}>
                        <MaterialCommunityIcons name="cancel" size={16} color="#DC2626" />
                        <Text style={detSt.rowLabel}>Montant</Text>
                        <Text style={[detSt.rowValue, { color: '#DC2626' }]}>Annulé — non facturé</Text>
                      </View>
                    )}
                  </View>

                  {/* Close button */}
                  <TouchableOpacity onPress={() => setSelectedItem(null)} style={detSt.closeBtn}>
                    <Text style={{ fontFamily: F.bold, fontSize: 15, color: '#64748B' }}>Fermer</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}
          </Modal>

          {/* Déconnexion */}
          <TouchableOpacity onPress={() => Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Déconnexion', style: 'destructive', onPress: () => { logoutUser(); navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home'); } },
          ])} style={styles.logoutBtn}>
            <MaterialCommunityIcons name="logout" size={16} color="#DC2626" style={{ marginRight: 6 }} />
            <Text style={{ fontFamily: F.bold, fontSize: 15, color: '#DC2626' }}>Se déconnecter</Text>
          </TouchableOpacity>

        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerGrad: { paddingHorizontal: 20, paddingBottom: 28 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0891B2', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  avatarText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 28, color: '#fff' },
  userName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#fff', marginBottom: 2 },
  userEmail: { fontFamily: 'DMSans_400Regular', color: '#94A3B8', fontSize: 14 },
  memberBadge: { marginTop: 8, backgroundColor: '#ECFEFF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  tabRow: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 14, padding: 4, marginBottom: 20 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
  tabText: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: '#94A3B8' },
  tabTextActive: { fontFamily: 'DMSans_700Bold', color: '#0F172A' },
  label: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: '#0F172A', marginBottom: 6 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 12, padding: 12, paddingHorizontal: 14, fontSize: 15, fontFamily: 'DMSans_400Regular', color: '#0F172A' },
  ctaBtn: { backgroundColor: '#0891B2', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 8, elevation: 3, shadowColor: '#0891B2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  section: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#0F172A' },
  editBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5, borderColor: '#0891B2' },
  saveBtn2: { backgroundColor: '#0891B2', borderColor: '#0891B2' },
  cancelBtn: { width: '100%', padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center', marginTop: 4 },
  historyCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  statusPill: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  logoutBtn: { backgroundColor: '#FEF2F2', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECACA' },
});

const detSt = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#fff' },
  catLabel: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#fff', marginBottom: 8 },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 2, marginBottom: 14 },
  cardTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 10 },
  rowLabel: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#64748B', flex: 1 },
  rowValue: { fontFamily: 'DMSans_700Bold', fontSize: 13, color: '#0F172A' },
  closeBtn: { backgroundColor: '#F1F5F9', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 8 },
});
