import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, Switch, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import { CATEGORIES, F, PLAN_COMMISSION, PRO_PLANS } from '../constants/data';
import { CatIcon, StarRating, AddressAutocomplete } from '../components';

const FAKE_REVIEWS = [
  { name: 'Sophie M.', rating: 5, comment: 'Très professionnel, rapide et efficace !', date: '10 avr.' },
  { name: 'Pierre L.', rating: 5, comment: 'Intervention en 20 min, problème réglé.', date: '2 avr.' },
  { name: 'Marie B.',  rating: 4, comment: 'Bon travail, tarif correct.',              date: '25 mars' },
];

// ── Champ texte simple ────────────────────────────────────────────────────────
function Field({ label, value, onChangeText, placeholder, multiline, editable = true }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        multiline={multiline}
        editable={editable}
        numberOfLines={multiline ? 3 : 1}
        style={[styles.input, multiline && { minHeight: 80, textAlignVertical: 'top' }, !editable && { backgroundColor: '#F1F5F9', color: '#94A3B8' }]}
      />
    </View>
  );
}

export default function ProProfileScreen({ navigation }) {
  const { proUser, loginPro, calendarSync, setCalendarSync } = useApp();
  const [editing, setEditing] = useState(false);

  const [prenom, setPrenom]             = useState(proUser?.prenom || 'Marc');
  const [nom, setNom]                   = useState(proUser?.nom || 'Dupont');
  const [nomEntreprise, setNomEntreprise] = useState(proUser?.nomEntreprise || 'Dupont Plomberie SARL');
  const [phone, setPhone]               = useState(proUser?.phone || '06 12 34 56 78');
  const [address, setAddress]           = useState(
    proUser?.address && typeof proUser.address === 'object'
      ? proUser.address
      : { rue: '', codePostal: '', ville: '' }
  );
  const [bio, setBio]                   = useState(proUser?.bio || 'Plombier certifié avec 10 ans d\'expérience. Intervention rapide, devis gratuit.');
  const [selectedCats, setSelectedCats] = useState(proUser?.cats || ['plomberie']);
  const [disponible, setDisponible]     = useState(true);
  const [photo, setPhoto]               = useState(proUser?.photo || null);
  const [carteVisite, setCarteVisite]   = useState(proUser?.carteVisite || null);

  const planId     = proUser?.plan || 'free';
  const planInfo   = PRO_PLANS.find(p => p.id === planId) || PRO_PLANS[0];
  const commission = PLAN_COMMISSION[planId] ?? 0.20;

  const rating       = 4.9;
  const reviews      = 234;
  const interventions = 847;
  const initials = `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();

  const openPicker = async (aspect, onPick) => {
    if (!editing) return;
    Alert.alert('Choisir une image', '', [
      { text: 'Galerie', onPress: async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return;
        const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect, quality: 0.85 });
        if (!r.canceled && r.assets?.length) onPick(r.assets[0].uri);
      }},
      { text: 'Appareil photo', onPress: async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return;
        const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect, quality: 0.85 });
        if (!r.canceled && r.assets?.length) onPick(r.assets[0].uri);
      }},
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const pickPhoto       = () => openPicker([1, 1], setPhoto);
  const pickCarteVisite = () => openPicker([16, 9], setCarteVisite);

  const toggleCat = (id) => {
    if (!editing) return;
    setSelectedCats(p => p.includes(id) ? p.filter(c => c !== id) : [...p, id]);
  };

  const handleSave = () => {
    loginPro({ ...proUser, prenom, nom, nomEntreprise, phone, address, bio, cats: selectedCats, photo, carteVisite });
    setEditing(false);
    Alert.alert('Profil mis à jour', 'Vos modifications ont été enregistrées.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0C1222' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Header gradient — scrollable avec le reste */}
        <LinearGradient colors={['#0C1222', '#0F172A', '#0D5F7A']} style={styles.headerGrad}>
          <SafeAreaView edges={['top']}>
            <TouchableOpacity
              onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('ProDashboard')}
              style={{ marginBottom: 20 }}>
              <Text style={{ color: '#94A3B8', fontSize: 15, fontFamily: F.medium }}>← Retour</Text>
            </TouchableOpacity>

            {/* Avatar + infos */}
            <View style={{ alignItems: 'center', paddingBottom: 8 }}>
              <TouchableOpacity onPress={pickPhoto} style={styles.avatarWrap} activeOpacity={editing ? 0.8 : 1}>
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.avatarPhoto} resizeMode="cover" />
                ) : (
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                )}
                {editing ? (
                  <View style={[styles.crownBadge, { backgroundColor: '#0891B2' }]}>
                    <MaterialCommunityIcons name="camera" size={12} color="#fff" />
                  </View>
                ) : (
                  <View style={styles.crownBadge}>
                    <MaterialCommunityIcons name="crown" size={14} color="#F59E0B" />
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.proName}>{prenom} {nom}</Text>
              {nomEntreprise ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <MaterialCommunityIcons name="office-building-outline" size={12} color="#94A3B8" />
                  <Text style={{ fontFamily: F.medium, color: '#94A3B8', fontSize: 12 }}>{nomEntreprise}</Text>
                </View>
              ) : null}

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <StarRating rating={rating} size={16} />
                <Text style={{ fontFamily: F.bold, color: '#fff', fontSize: 14 }}>{rating}</Text>
                <Text style={{ fontFamily: F.regular, color: '#94A3B8', fontSize: 13 }}>({reviews} avis)</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons name="check-circle" size={11} color="#0891B2" />
                  <Text style={{ color: '#0891B2', fontFamily: F.bold, fontSize: 11 }}>Pro Vérifié</Text>
                </View>
                <View style={[styles.verifiedBadge, { backgroundColor: planInfo.color + '20', flexDirection: 'row', gap: 4 }]}>
                  <MaterialCommunityIcons name="crown" size={11} color={planInfo.color} />
                  <Text style={{ color: planInfo.color, fontFamily: F.bold, fontSize: 11 }}>Plan {planInfo.name} · {(commission * 100).toFixed(0)}%</Text>
                </View>
              </View>

              {/* Disponibilité */}
              <View style={styles.disponRow}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: disponible ? '#22C55E' : '#94A3B8', marginRight: 6 }} />
                <Text style={{ fontFamily: F.medium, fontSize: 13, color: '#fff', marginRight: 8 }}>
                  {disponible ? 'Disponible' : 'Indisponible'}
                </Text>
                <Switch
                  value={disponible} onValueChange={setDisponible}
                  trackColor={{ false: '#475569', true: '#22C55E' }} thumbColor="#fff"
                  style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                />
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Contenu scrollable */}
        <View style={{ padding: 20, backgroundColor: '#F8FAFC' }}>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { icon: 'tools',           color: '#0891B2', val: interventions, label: 'Interventions' },
            { icon: 'star',            color: '#F59E0B', val: rating,        label: 'Note moyenne' },
            { icon: 'comment-outline', color: '#7C3AED', val: reviews,       label: 'Avis clients' },
            { icon: 'clock-fast',      color: '#22C55E', val: '< 3 min',     label: 'Tps réponse' },
          ].map((s, i) => (
            <View key={i} style={styles.statBox}>
              <MaterialCommunityIcons name={s.icon} size={18} color={s.color} style={{ marginBottom: 4 }} />
              <Text style={{ fontFamily: F.groteskBold, fontSize: 16, color: '#0F172A' }}>{s.val}</Text>
              <Text style={{ fontFamily: F.regular, fontSize: 10, color: '#94A3B8', marginTop: 2, textAlign: 'center' }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Informations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Informations</Text>
            <TouchableOpacity
              onPress={() => editing ? handleSave() : setEditing(true)}
              style={[styles.editBtn, editing && styles.saveBtnStyle, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
              <MaterialCommunityIcons name={editing ? 'check' : 'pencil-outline'} size={13} color={editing ? '#fff' : '#0891B2'} />
              <Text style={{ fontFamily: F.bold, fontSize: 13, color: editing ? '#fff' : '#0891B2' }}>
                {editing ? 'Enregistrer' : 'Modifier'}
              </Text>
            </TouchableOpacity>
          </View>

          <Field label="Nom de l'entreprise" value={nomEntreprise} onChangeText={setNomEntreprise}
            placeholder="Dupont Plomberie SARL" editable={editing} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Field label="Prénom" value={prenom} onChangeText={setPrenom} placeholder="Jean" editable={editing} />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Nom" value={nom} onChangeText={setNom} placeholder="Dupont" editable={editing} />
            </View>
          </View>
          <Field label="Téléphone" value={phone} onChangeText={setPhone} placeholder="0470 12 34 56" editable={editing} />

          {/* Adresse avec autocomplétion */}
          <AddressAutocomplete value={address} onChange={setAddress} editable={editing} />

          <Field label="Bio / Présentation" value={bio} onChangeText={setBio}
            placeholder="Décrivez votre expertise..." multiline editable={editing} />

          {editing && (
            <TouchableOpacity onPress={() => setEditing(false)} style={styles.cancelBtn}>
              <Text style={{ fontFamily: F.semibold, fontSize: 14, color: '#64748B' }}>Annuler</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Spécialités */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Spécialités</Text>
            {!editing && (
              <TouchableOpacity onPress={() => setEditing(true)} style={[styles.editBtn, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                <MaterialCommunityIcons name="pencil-outline" size={13} color="#0891B2" />
                <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#0891B2' }}>Modifier</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map(cat => {
              const sel = selectedCats.includes(cat.id);
              return (
                <TouchableOpacity key={cat.id} onPress={() => toggleCat(cat.id)}
                  style={[styles.catChip, sel && { backgroundColor: cat.color + '15', borderColor: cat.color }, !editing && !sel && { opacity: 0.35 }]}>
                  <CatIcon cat={cat} size={14} color={sel ? cat.color : '#94A3B8'} />
                  <Text style={[styles.catChipText, sel && { color: cat.color, fontFamily: F.bold }]}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {editing && (
            <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#94A3B8', marginTop: 10 }}>
              Appuyez sur une spécialité pour l'ajouter ou la retirer.
            </Text>
          )}
        </View>

        {/* Carte de visite */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Carte de visite</Text>
            {editing && (
              <TouchableOpacity onPress={pickCarteVisite} style={[styles.editBtn, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                <MaterialCommunityIcons name="camera-outline" size={13} color="#0891B2" />
                <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#0891B2' }}>Modifier</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={pickCarteVisite} activeOpacity={editing ? 0.8 : 1} style={styles.carteVisiteCard}>
            {carteVisite ? (
              <>
                <Image source={{ uri: carteVisite }} style={{ width: '100%', height: '100%', borderRadius: 12 }} resizeMode="cover" />
                {editing && (
                  <View style={[styles.crownBadge, { backgroundColor: '#0891B2', bottom: 8, right: 8 }]}>
                    <MaterialCommunityIcons name="camera" size={12} color="#fff" />
                  </View>
                )}
              </>
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="image-outline" size={36} color="#94A3B8" />
                <Text style={{ fontFamily: F.medium, fontSize: 13, color: '#94A3B8' }}>
                  {editing ? 'Appuyez pour ajouter une photo' : 'Aucune carte de visite'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Informations légales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations légales</Text>
          <View style={{ marginTop: 12 }}>
            <Field label="Numéro BCE" value={proUser?.bce
              ? proUser.bce.replace(/(\d{4})(\d{3})(\d{3})/, '$1.$2.$3')
              : '0123.456.789'} editable={false} />
            <Field label="Numéro de TVA" value={proUser?.numTVA || 'Non renseigné'} editable={false} />
            <View style={styles.infoNote}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                <MaterialCommunityIcons name="lock" size={14} color="#1E40AF" style={{ marginTop: 2 }} />
                <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#1E40AF', lineHeight: 18, flex: 1 }}>
                  Le numéro BCE et la TVA ne peuvent pas être modifiés. Contactez le support si nécessaire.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Avis clients */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Avis clients</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <StarRating rating={rating} size={12} />
              <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#0F172A' }}>{rating}</Text>
            </View>
          </View>
          {FAKE_REVIEWS.map((r, i) => (
            <View key={i} style={[styles.reviewCard, i < FAKE_REVIEWS.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#0891B220', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#0891B2' }}>{r.name[0]}</Text>
                  </View>
                  <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#0F172A' }}>{r.name}</Text>
                </View>
                <Text style={{ fontFamily: F.regular, fontSize: 11, color: '#94A3B8' }}>{r.date}</Text>
              </View>
              <StarRating rating={r.rating} size={12} />
              <Text style={{ fontFamily: F.regular, fontSize: 13, color: '#475569', marginTop: 6, lineHeight: 18 }}>{r.comment}</Text>
            </View>
          ))}
        </View>

        {/* Paramètres — Synchronisation agenda */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: calendarSync ? '#0891B220' : '#F1F5F9', justifyContent: 'center', alignItems: 'center' }}>
                <MaterialCommunityIcons name="calendar-sync-outline" size={20} color={calendarSync ? '#0891B2' : '#94A3B8'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: F.bold, fontSize: 14, color: '#0F172A' }}>Sync. agenda</Text>
                <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                  Ajouter les interventions à votre calendrier
                </Text>
              </View>
            </View>
            <Switch
              value={calendarSync}
              onValueChange={setCalendarSync}
              trackColor={{ false: '#E2E8F0', true: '#0891B2' }}
              thumbColor={calendarSync ? '#fff' : '#94A3B8'}
            />
          </View>

          {calendarSync && (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10, backgroundColor: '#EFF6FF', borderRadius: 10, padding: 10 }}>
              <MaterialCommunityIcons name="information-outline" size={14} color="#0891B2" style={{ marginTop: 1 }} />
              <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#0369A1', flex: 1, lineHeight: 17 }}>
                Chaque intervention acceptée sera ajoutée à votre agenda avec un rappel 2h avant. L'accès au calendrier sera demandé lors de la prochaine acceptation.
              </Text>
            </View>
          )}
        </View>

        </View>{/* fin contenu scrollable */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerGrad:    { paddingHorizontal: 20, paddingBottom: 24 },
  avatarWrap:    { position: 'relative', marginBottom: 12 },
  avatarCircle:  { width: 90, height: 90, borderRadius: 45, backgroundColor: '#0891B2', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.25)' },
  avatarPhoto:   { width: 90, height: 90, borderRadius: 45, borderWidth: 4, borderColor: 'rgba(255,255,255,0.25)' },
  avatarText:    { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 32, color: '#fff' },
  crownBadge:    { position: 'absolute', bottom: -2, right: -2, width: 28, height: 28, borderRadius: 14, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  proName:       { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#fff', marginBottom: 2 },
  verifiedBadge: { backgroundColor: '#ECFEFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  disponRow:     { flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  statsRow:      { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statBox:       { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  section:       { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle:  { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#0F172A' },
  editBtn:       { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5, borderColor: '#0891B2' },
  saveBtnStyle:  { backgroundColor: '#0891B2', borderColor: '#0891B2' },
  cancelBtn:     { width: '100%', padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center', marginTop: 4 },
  label:         { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: '#0F172A', marginBottom: 6 },
  input:         { backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 12, padding: 12, paddingHorizontal: 14, fontSize: 15, fontFamily: 'DMSans_400Regular', color: '#0F172A' },
  catChip:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#fff' },
  catChipText:   { fontFamily: 'DMSans_500Medium', fontSize: 12, color: '#64748B' },
  infoNote:      { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#BFDBFE' },
  reviewCard:    { paddingVertical: 12 },
  carteVisiteCard: { width: '100%', height: 160, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', borderStyle: 'dashed', backgroundColor: '#F8FAFC', overflow: 'hidden', position: 'relative' },
});
