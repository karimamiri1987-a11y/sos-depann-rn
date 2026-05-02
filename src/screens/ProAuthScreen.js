import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Image,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { CATEGORIES, F, BRAND } from '../constants/data';
import { CatIcon } from '../components';
import { useApp } from '../context/AppContext';

const STEP_LABELS = ['Profil', 'Métier', 'Sécurité'];

function Field({ label, value, onChangeText, placeholder, keyboardType, secureTextEntry, autoCapitalize, hint }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={BRAND.textMuted}
        keyboardType={keyboardType || 'default'}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize || 'none'}
        style={styles.input}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export default function ProAuthScreen({ navigation }) {
  const { loginPro } = useApp();
  const [tab, setTab] = useState('login');

  // Login
  const [loginEmail, setLoginEmail]       = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register — step 0 : Profil
  const [prenom, setPrenom]               = useState('');
  const [nom, setNom]                     = useState('');
  const [nomEntreprise, setNomEntreprise] = useState('');
  const [email, setEmail]                 = useState('');
  const [phone, setPhone]                 = useState('');
  const [proPhoto, setProPhoto]           = useState(null); // URI

  // Register — step 1 : Métier
  const [selectedCats, setSelectedCats]   = useState([]);
  const [bce, setBce]                     = useState('');
  const [numTVA, setNumTVA]               = useState('');
  const [carteVisite, setCarteVisite]     = useState(null); // URI carte de visite

  // Register — step 2 : Sécurité
  const [password, setPassword]           = useState('');
  const [confirm, setConfirm]             = useState('');

  const [regStep, setRegStep] = useState(0);

  const toggleCat = (id) =>
    setSelectedCats(p => p.includes(id) ? p.filter(c => c !== id) : [...p, id]);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Autorisez l\'accès à la galerie dans les paramètres.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 2], // Format carte de visite
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.length) {
      setProPhoto(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Autorisez l\'accès à la caméra dans les paramètres.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 2],
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.length) {
      setProPhoto(result.assets[0].uri);
    }
  };

  const promptPhoto = () => {
    Alert.alert('Photo de profil', 'Choisissez une option', [
      { text: 'Galerie', onPress: pickPhoto },
      { text: 'Appareil photo', onPress: takePhoto },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const pickCarteVisite = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', "Autorisez l'accès à la galerie dans les paramètres.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [16, 9], quality: 0.85,
    });
    if (!result.canceled && result.assets?.length) setCarteVisite(result.assets[0].uri);
  };

  const validateStep = () => {
    if (regStep === 0) {
      if (!prenom.trim() || !nom.trim())
        return Alert.alert('Champ manquant', 'Entrez votre prénom et nom.');
      if (!nomEntreprise.trim())
        return Alert.alert('Champ manquant', 'Entrez le nom de votre entreprise.');
      if (!email.includes('@'))
        return Alert.alert('Email invalide', 'Entrez un email valide.');
      if (phone.replace(/\s/g,'').length < 10)
        return Alert.alert('Téléphone invalide', 'Entrez un numéro valide.');
    }
    if (regStep === 1) {
      if (selectedCats.length === 0)
        return Alert.alert('Métier requis', 'Sélectionnez au moins un métier.');
      if (bce.replace(/[\s.]/g,'').length !== 10)
        return Alert.alert('BCE invalide', 'Le numéro BCE doit contenir 10 chiffres (ex: 0123.456.789).');
      if (numTVA.trim() && !/^BE\d{10}$/i.test(numTVA.replace(/[\s.]/g,'')))
        return Alert.alert('TVA invalide', 'Format attendu : BE + 10 chiffres (ex: BE0123456789).');
    }
    if (regStep === 2) {
      if (password.length < 8)
        return Alert.alert('Mot de passe trop court', 'Au moins 8 caractères.');
      if (password !== confirm)
        return Alert.alert('Mots de passe différents', 'Les deux mots de passe ne correspondent pas.');
      loginPro({
        prenom, nom, nomEntreprise, email, phone,
        bce: bce.replace(/[\s.]/g,''),
        numTVA: numTVA.toUpperCase().replace(/[\s.]/g,'') || null,
        cats: selectedCats, photo: proPhoto, carteVisite, plan: 'free',
      });
      navigation.replace('ProDashboard');
      return;
    }
    setRegStep(regStep + 1);
  };

  const handleLogin = () => {
    if (!loginEmail.includes('@')) return Alert.alert('Email invalide', 'Entrez un email valide.');
    if (!loginPassword) return Alert.alert('Mot de passe requis', 'Entrez votre mot de passe.');
    loginPro({ email: loginEmail, prenom: 'Pro', plan: 'free' });
    navigation.replace('ProDashboard');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: BRAND.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Header */}
      <LinearGradient colors={['#0C1525', '#0B1220', BRAND.bg]} style={styles.headerGrad}>
        <SafeAreaView edges={['top']}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="arrow-back" size={18} color={BRAND.textSecondary} />
            <Text style={{ color: BRAND.textSecondary, fontSize: 14, fontFamily: F.medium }}>Retour</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.proLogoMark}>
              <MaterialCommunityIcons name="briefcase" size={20} color="#fff" />
            </View>
            <View>
              <Text style={{ fontFamily: F.groteskBold, fontSize: 24, color: BRAND.textPrimary }}>Espace Pro</Text>
              <Text style={{ fontFamily: F.regular, color: BRAND.textSecondary, fontSize: 13, marginTop: 2 }}>
                Rejoignez 15 000+ professionnels
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {[{ id:'login', label:'Connexion', icon:'login' }, { id:'register', label:'Inscription', icon:'account-plus-outline' }].map(t => (
          <TouchableOpacity key={t.id} onPress={() => { setTab(t.id); setRegStep(0); }}
            style={[styles.tabBtn, tab === t.id && styles.tabActive]}>
            <MaterialCommunityIcons name={t.icon} size={15} color={tab === t.id ? BRAND.cyanLight : BRAND.textMuted} />
            <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>

        {/* ── CONNEXION ── */}
        {tab === 'login' && (
          <>
            <Field label="Email professionnel" value={loginEmail} onChangeText={setLoginEmail}
              placeholder="pro@exemple.fr" keyboardType="email-address" />
            <Field label="Mot de passe" value={loginPassword} onChangeText={setLoginPassword}
              placeholder="••••••••" secureTextEntry />
            <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 24 }}>
              <Text style={{ fontFamily: F.medium, fontSize: 13, color: BRAND.cyanLight }}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogin} style={styles.ctaBtn} activeOpacity={0.85}>
              <Text style={{ color: '#fff', fontFamily: F.bold, fontSize: 16 }}>Se connecter</Text>
            </TouchableOpacity>
            <View style={styles.switchHint}>
              <Text style={{ fontFamily: F.regular, fontSize: 13, color: BRAND.textMuted }}>Pas encore de compte ? </Text>
              <TouchableOpacity onPress={() => setTab('register')}>
                <Text style={{ fontFamily: F.bold, fontSize: 13, color: BRAND.cyanLight }}>S'inscrire gratuitement</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── INSCRIPTION ── */}
        {tab === 'register' && (
          <>
            {/* Steps */}
            <View style={styles.stepsRow}>
              {STEP_LABELS.map((s, i) => (
                <React.Fragment key={i}>
                  <View style={{ alignItems: 'center' }}>
                    <View style={[styles.stepCircle, i <= regStep && styles.stepCircleActive]}>
                      {i < regStep
                        ? <MaterialCommunityIcons name="check" size={14} color="#fff" />
                        : <Text style={[styles.stepNum, i === regStep && { color: '#fff' }]}>{i + 1}</Text>
                      }
                    </View>
                    <Text style={[styles.stepLabel, i === regStep && { color: '#0891B2', fontFamily: F.bold }]}>{s}</Text>
                  </View>
                  {i < STEP_LABELS.length - 1 && (
                    <View style={[styles.stepLine, i < regStep && styles.stepLineActive]} />
                  )}
                </React.Fragment>
              ))}
            </View>

            {/* ── Étape 0 : Profil ── */}
            {regStep === 0 && (
              <>
                <Text style={styles.stepTitle}>Votre profil</Text>

                {/* Photo carte de visite */}
                <Text style={styles.label}>Photo de profil / carte de visite</Text>
                <TouchableOpacity onPress={promptPhoto} activeOpacity={0.85} style={styles.photoCard}>
                  {proPhoto ? (
                    <>
                      <Image source={{ uri: proPhoto }} style={styles.photoImage} resizeMode="cover" />
                      <View style={styles.photoEditBadge}>
                        <MaterialCommunityIcons name="pencil" size={14} color="#fff" />
                      </View>
                    </>
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <MaterialCommunityIcons name="card-account-details-outline" size={40} color={BRAND.textMuted} />
                      <Text style={{ fontFamily: F.medium, fontSize: 13, color: BRAND.textMuted, marginTop: 8 }}>
                        Ajouter une photo
                      </Text>
                      <Text style={{ fontFamily: F.regular, fontSize: 11, color: BRAND.textMuted, marginTop: 2, textAlign: 'center' }}>
                        Format carte de visite (3:2)
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                        <View style={styles.photoActionChip}>
                          <MaterialCommunityIcons name="image-outline" size={14} color={BRAND.cyan} />
                          <Text style={{ fontFamily: F.semibold, fontSize: 12, color: BRAND.cyan }}>Galerie</Text>
                        </View>
                        <View style={styles.photoActionChip}>
                          <MaterialCommunityIcons name="camera-outline" size={14} color={BRAND.cyan} />
                          <Text style={{ fontFamily: F.semibold, fontSize: 12, color: BRAND.cyan }}>Photo</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Field label="Prénom" value={prenom} onChangeText={setPrenom} placeholder="Jean" autoCapitalize="words" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field label="Nom" value={nom} onChangeText={setNom} placeholder="Dupont" autoCapitalize="words" />
                  </View>
                </View>

                <Field label="Nom de l'entreprise *" value={nomEntreprise} onChangeText={setNomEntreprise}
                  placeholder="Dupont Plomberie SARL" autoCapitalize="words" />

                <Field label="Email professionnel *" value={email} onChangeText={setEmail}
                  placeholder="pro@exemple.fr" keyboardType="email-address" />

                <Field label="Téléphone *" value={phone} onChangeText={setPhone}
                  placeholder="06 12 34 56 78" keyboardType="phone-pad" />
              </>
            )}

            {/* ── Étape 1 : Métier ── */}
            {regStep === 1 && (
              <>
                <Text style={styles.stepTitle}>Votre activité</Text>
                <Text style={{ fontFamily: F.regular, fontSize: 13, color: BRAND.textMuted, marginBottom: 14 }}>
                  Sélectionnez vos spécialités (plusieurs possibles)
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                  {CATEGORIES.map(cat => {
                    const sel = selectedCats.includes(cat.id);
                    return (
                      <TouchableOpacity key={cat.id} onPress={() => toggleCat(cat.id)}
                        style={[styles.catChip, sel && { backgroundColor: cat.color + '20', borderColor: cat.color }]}>
                        <CatIcon cat={cat} size={14} color={sel ? cat.color : BRAND.textMuted} />
                        <Text style={[styles.catChipText, sel && { color: cat.color, fontFamily: F.bold }]}>{cat.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Field label="Numéro BCE * (10 chiffres)" value={bce} onChangeText={setBce}
                  placeholder="0123.456.789" keyboardType="numeric" />

                <Field label="Numéro de TVA belge" value={numTVA} onChangeText={setNumTVA}
                  placeholder="BE0123456789"
                  hint="Optionnel — Format : BE + 10 chiffres"
                  autoCapitalize="characters" />

                {/* Carte de visite */}
                <Text style={[styles.label, { marginTop: 6 }]}>Carte de visite / Photo professionnelle</Text>
                <TouchableOpacity onPress={pickCarteVisite} activeOpacity={0.85} style={[styles.photoCard, { height: 130, marginBottom: 16 }]}>
                  {carteVisite ? (
                    <>
                      <Image source={{ uri: carteVisite }} style={styles.photoImage} resizeMode="cover" />
                      <View style={styles.photoEditBadge}>
                        <MaterialCommunityIcons name="pencil" size={14} color="#fff" />
                      </View>
                    </>
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <MaterialCommunityIcons name="image-outline" size={32} color={BRAND.textMuted} />
                      <Text style={{ fontFamily: F.medium, fontSize: 12, color: BRAND.textMuted, marginTop: 6 }}>
                        Ajouter une photo (façade, camion, chantier…)
                      </Text>
                      <View style={styles.photoActionChip}>
                        <MaterialCommunityIcons name="image-outline" size={13} color={BRAND.cyan} />
                        <Text style={{ fontFamily: F.semibold, fontSize: 12, color: BRAND.cyan }}>Choisir une image</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.infoBox}>
                  <MaterialCommunityIcons name="shield-check-outline" size={14} color={BRAND.cyanLight} />
                  <Text style={{ fontFamily: F.regular, fontSize: 12, color: BRAND.textSecondary, lineHeight: 18, flex: 1 }}>
                    Votre numéro BCE est requis pour vérifier votre statut professionnel et activer votre badge{' '}
                    <Text style={{ fontFamily: F.bold, color: BRAND.cyanLight }}>Vérifié</Text>.
                  </Text>
                </View>
              </>
            )}

            {/* ── Étape 2 : Sécurité ── */}
            {regStep === 2 && (
              <>
                <Text style={styles.stepTitle}>Sécurisez votre compte</Text>
                <Field label="Mot de passe" value={password} onChangeText={setPassword}
                  placeholder="Minimum 8 caractères" secureTextEntry />
                <Field label="Confirmer le mot de passe" value={confirm} onChangeText={setConfirm}
                  placeholder="Retapez le mot de passe" secureTextEntry />

                {/* Récap */}
                {nomEntreprise ? (
                  <View style={styles.recapBox}>
                    <Text style={{ fontFamily: F.bold, fontSize: 13, color: BRAND.textPrimary, marginBottom: 10 }}>
                      Récapitulatif
                    </Text>
                    {proPhoto && (
                      <Image source={{ uri: proPhoto }} style={{ width: '100%', height: 100, borderRadius: 10, marginBottom: 10 }} resizeMode="cover" />
                    )}
                    {[
                      { icon: 'account', label: `${prenom} ${nom}` },
                      { icon: 'office-building', label: nomEntreprise },
                      { icon: 'email-outline', label: email },
                      { icon: 'phone-outline', label: phone },
                      { icon: 'card-account-details', label: `BCE : ${bce}` },
                      numTVA ? { icon: 'receipt', label: `TVA : ${numTVA}` } : null,
                    ].filter(Boolean).map((r, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <MaterialCommunityIcons name={r.icon} size={14} color={BRAND.textMuted} />
                        <Text style={{ fontFamily: F.regular, fontSize: 13, color: BRAND.textSecondary }}>{r.label}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                <View style={styles.cgvBox}>
                  <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#64748B', lineHeight: 18, textAlign: 'center' }}>
                    En créant un compte vous acceptez nos{' '}
                    <Text style={{ color: '#0891B2', fontFamily: F.medium }}>Conditions d'utilisation</Text>
                    {' '}et notre{' '}
                    <Text style={{ color: '#0891B2', fontFamily: F.medium }}>Politique de confidentialité</Text>.
                  </Text>
                </View>
              </>
            )}

            {/* Navigation */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              {regStep > 0 && (
                <TouchableOpacity onPress={() => setRegStep(regStep - 1)} style={styles.prevBtn}>
                  <Text style={{ fontFamily: F.semibold, fontSize: 15, color: '#64748B' }}>← Retour</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={validateStep}
                style={[styles.ctaBtn, { flex: 1, flexDirection: 'row', gap: 8 }]} activeOpacity={0.85}>
                <Text style={{ color: '#fff', fontFamily: F.bold, fontSize: 16 }}>
                  {regStep < 2 ? 'Continuer' : 'Créer mon compte'}
                </Text>
                <MaterialCommunityIcons name={regStep < 2 ? 'arrow-right' : 'check'} size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.switchHint}>
              <Text style={{ fontFamily: F.regular, fontSize: 13, color: BRAND.textMuted }}>Déjà un compte ? </Text>
              <TouchableOpacity onPress={() => setTab('login')}>
                <Text style={{ fontFamily: F.bold, fontSize: 13, color: BRAND.cyanLight }}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerGrad: { paddingHorizontal: 20, paddingBottom: 24 },
  proLogoMark: { width: 44, height: 44, borderRadius: 13, backgroundColor: BRAND.cyan, justifyContent: 'center', alignItems: 'center' },
  tabRow: { flexDirection: 'row', margin: 16, backgroundColor: BRAND.bgCard, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: BRAND.border },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  tabActive: { backgroundColor: BRAND.bgCard2 },
  tabText: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: BRAND.textMuted },
  tabTextActive: { fontFamily: 'DMSans_700Bold', color: BRAND.cyanLight },
  label: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: BRAND.textSecondary, marginBottom: 6 },
  hint: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: BRAND.textMuted, marginTop: 4 },
  input: { backgroundColor: BRAND.bgCard, borderWidth: 1, borderColor: BRAND.border, borderRadius: 12, padding: 12, paddingHorizontal: 14, fontSize: 15, fontFamily: 'DMSans_400Regular', color: BRAND.textPrimary },
  ctaBtn: { backgroundColor: BRAND.cyan, padding: 16, borderRadius: 16, alignItems: 'center', elevation: 3, shadowColor: BRAND.cyan, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  prevBtn: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: BRAND.border, alignItems: 'center', justifyContent: 'center', backgroundColor: BRAND.bgCard },
  switchHint: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: BRAND.border, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  stepCircleActive: { backgroundColor: BRAND.cyan },
  stepNum: { fontFamily: 'DMSans_700Bold', fontSize: 13, color: BRAND.textMuted },
  stepLabel: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: BRAND.textMuted },
  stepLine: { flex: 1, height: 2, backgroundColor: BRAND.border, marginHorizontal: 4, marginBottom: 20 },
  stepLineActive: { backgroundColor: BRAND.cyan },
  stepTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: BRAND.textPrimary, marginBottom: 16 },
  // Photo
  photoCard: {
    width: '100%', height: 160, borderRadius: 16, borderWidth: 2, borderColor: BRAND.border,
    borderStyle: 'dashed', overflow: 'hidden', marginBottom: 20, backgroundColor: BRAND.bgCard,
  },
  photoImage: { width: '100%', height: '100%' },
  photoEditBadge: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: BRAND.cyan, width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff',
  },
  photoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  photoActionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: BRAND.cyan + '15', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: BRAND.cyan + '30',
  },
  // Categorie chips
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: BRAND.border, backgroundColor: BRAND.bgCard },
  catChipText: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: BRAND.textMuted },
  infoBox: { backgroundColor: BRAND.bgCard, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: BRAND.border, marginTop: 4, flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  cgvBox: { backgroundColor: BRAND.bgCard, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: BRAND.border, marginTop: 8 },
  recapBox: { backgroundColor: BRAND.bgCard, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: BRAND.border, marginBottom: 14 },
});
