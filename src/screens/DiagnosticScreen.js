import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { CATEGORIES, DIAGNOSTIC_QUESTIONS, URGENCY_LEVELS, F } from '../constants/data';
import { CatIcon, UrgencyIcon } from '../components';

export default function DiagnosticScreen({ route, navigation }) {
  const { catId } = route.params;
  const cat = CATEGORIES.find(c => c.id === catId);
  const questions = DIAGNOSTIC_QUESTIONS[catId] || DIAGNOSTIC_QUESTIONS._default;
  const totalSteps = questions.length + 3;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [urgency, setUrgency] = useState('semaine');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);

  // Adresse d'intervention
  const [clientAddress, setClientAddress] = useState({});
  const [addrQuery, setAddrQuery] = useState('');
  const [addrResults, setAddrResults] = useState([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrError, setAddrError] = useState('');
  const debounceTimer = useRef(null);

  // Coordonnées du client
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  // Validation
  const isAddressComplete = !!(clientAddress?.lat && clientAddress?.rue && clientAddress?.codePostal && clientAddress?.ville);
  const isContactValid = clientPhone.trim().length >= 9 && clientEmail.includes('@') && clientEmail.includes('.');

  const progress = ((step + 1) / totalSteps) * 100;
  const isQuestion = step < questions.length;
  const isUrgency = step === questions.length;
  const isDesc = step === questions.length + 1;
  const isAddress = step === questions.length + 2;
  const currentUrgency = URGENCY_LEVELS.find(u => u.id === urgency);

  // Autocomplétion adresse (Nominatim Belgique)
  useEffect(() => {
    if (!isAddress || clientAddress?.lat) {
      setAddrResults([]);
      return;
    }
    if (addrQuery.length < 3) {
      setAddrResults([]);
      setAddrLoading(false);
      return;
    }
    setAddrLoading(true);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addrQuery)}&format=json&limit=5&addressdetails=1&countrycodes=be`,
          { headers: { 'User-Agent': 'SOSDepannApp/1.0' } }
        );
        const data = await res.json();
        setAddrResults(data);
      } catch {
        setAddrResults([]);
      }
      setAddrLoading(false);
    }, 450);
    return () => clearTimeout(debounceTimer.current);
  }, [addrQuery, isAddress]);

  const goBack = () => {
    if (step > 0) setStep(step - 1);
    else navigation.goBack();
  };

  const pickPhoto = async () => {
    if (photos.length >= 5) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', "Autorisez l'accès à la galerie dans les réglages.");
      return;
    }
    const remaining = 5 - photos.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
    });
    if (!result.canceled) {
      const uris = result.assets.map(a => a.uri);
      setPhotos(p => [...p, ...uris].slice(0, 5));
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F8FAFC' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={'#0891B2'} />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <CatIcon cat={cat} size={18} />
            <Text style={{ fontFamily: F.groteskBold, fontSize: 16, color: '#0F172A' }}>{cat.label}</Text>
          </View>
          <Text style={{ fontFamily: F.semibold, fontSize: 12, color: '#94A3B8' }}>{step + 1}/{totalSteps}</Text>
        </View>
        {/* Progress bar */}
        <View style={{ height: 3, backgroundColor: '#E2E8F0' }}>
          <View style={{ height: 3, backgroundColor: cat.color, width: `${progress}%`, borderRadius: 2 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* Questions */}
        {isQuestion && (() => {
          const q = questions[step];
          return (
            <View>
              <Text style={styles.questionTitle}>{q.q}</Text>
              {q.options.map((opt, i) => {
                const selected = answers[q.id] === opt;
                return (
                  <TouchableOpacity key={i} activeOpacity={0.75}
                    onPress={() => { setAnswers(p => ({ ...p, [q.id]: opt })); setTimeout(() => setStep(step + 1), 300); }}
                    style={[styles.optionBtn, {
                      borderColor: selected ? cat.color : '#E2E8F0',
                      backgroundColor: selected ? cat.color + '15' : '#fff',
                    }]}>
                    <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selected ? cat.color : '#334155', justifyContent: 'center', alignItems: 'center' }}>
                      {selected && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: cat.color }} />}
                    </View>
                    <Text style={{ fontFamily: F.semibold, fontSize: 15, color: selected ? cat.color : '#0F172A', flex: 1 }}>{opt}</Text>
                    {selected && <MaterialCommunityIcons name="check" size={18} color={cat.color} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })()}

        {/* Urgency */}
        {isUrgency && (
          <View>
            <Text style={styles.questionTitle}>Quel délai souhaitez-vous ?</Text>
            <Text style={{ fontFamily: F.regular, fontSize: 13, color: '#94A3B8', marginBottom: 20, marginTop: -10 }}>
              Cela influence le tarif et la disponibilité des pros
            </Text>
            {URGENCY_LEVELS.map(u => (
              <TouchableOpacity key={u.id} activeOpacity={0.75}
                onPress={() => { setUrgency(u.id); setTimeout(() => setStep(step + 1), 300); }}
                style={[styles.urgBtn, {
                  borderColor: urgency === u.id ? u.color : '#E2E8F0',
                  backgroundColor: urgency === u.id ? u.color + '15' : '#fff',
                }]}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: u.bg, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <UrgencyIcon urgency={u} size={22} color={u.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: F.bold, fontSize: 15, color: urgency === u.id ? u.color : '#0F172A' }}>{u.label}</Text>
                  <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#64748B', marginTop: 2 }}>{u.sub}</Text>
                </View>
                <Text style={{ fontFamily: F.groteskBold, fontSize: 16, color: u.color }}>x{u.mult}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Description + Photos */}
        {isDesc && (
          <View>
            <Text style={styles.questionTitle}>Détaillez votre problème</Text>
            <Text style={{ fontFamily: F.regular, fontSize: 13, color: '#94A3B8', marginBottom: 16, marginTop: -10 }}>
              Plus d'infos = devis plus précis
            </Text>

            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline numberOfLines={4}
              placeholder="Décrivez la situation en quelques mots…"
              placeholderTextColor={'#94A3B8'}
              style={styles.textarea}
            />

            {/* Photos */}
            <View style={{ marginTop: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons name="camera-outline" size={16} color={'#0F172A'} />
                  <Text style={{ fontFamily: F.bold, fontSize: 14, color: '#0F172A' }}>Photos (optionnel)</Text>
                </View>
                <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#94A3B8' }}>{photos.length}/5</Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {photos.map((uri, i) => (
                  <View key={i} style={styles.photoThumb}>
                    <Image source={{ uri }} style={{ width: '100%', height: '100%', borderRadius: 11 }} resizeMode="cover" />
                    <TouchableOpacity onPress={() => setPhotos(p => p.filter((_, j) => j !== i))} style={styles.photoRemove}>
                      <Ionicons name="close" size={11} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {photos.length < 5 && (
                  <TouchableOpacity onPress={pickPhoto} style={styles.photoAdd}>
                    <MaterialCommunityIcons name="plus" size={24} color={'#94A3B8'} />
                    <Text style={{ fontSize: 10, color: '#94A3B8', fontFamily: F.semibold }}>
                      {photos.length === 0 ? 'Ajouter' : `+${5 - photos.length}`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Summary */}
            <View style={styles.recap}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <MaterialCommunityIcons name="clipboard-list-outline" size={16} color={'#0891B2'} />
                <Text style={{ fontFamily: F.bold, fontSize: 14, color: '#0F172A' }}>Récapitulatif</Text>
              </View>
              {Object.entries(answers).map(([k, v]) => (
                <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
                  <Text style={{ fontFamily: F.regular, fontSize: 13, color: '#94A3B8', flex: 1 }}>
                    {questions.find(q => q.id === k)?.q.replace('?', '')}
                  </Text>
                  <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#0F172A' }}>{v}</Text>
                </View>
              ))}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                <Text style={{ fontFamily: F.regular, fontSize: 13, color: '#94A3B8' }}>Délai</Text>
                <Text style={{ fontFamily: F.bold, fontSize: 13, color: currentUrgency.color }}>{currentUrgency.label}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setStep(step + 1)}
              style={[styles.cta, { backgroundColor: cat.color }]}
              activeOpacity={0.85}>
              <Text style={{ color: '#fff', fontSize: 15, fontFamily: F.bold }}>Continuer</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* ── ADRESSE D'INTERVENTION ── */}
        {isAddress && (
          <View>
            <Text style={styles.questionTitle}>Adresse d'intervention</Text>
            <Text style={{ fontFamily: F.regular, fontSize: 13, color: '#94A3B8', marginBottom: 8, marginTop: -10 }}>
              Indiquez l'adresse exacte (numéro + rue + ville) pour calculer le tarif de déplacement
            </Text>

            {/* Hint numéro de rue */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EFF6FF', borderRadius: 10, padding: 10, marginBottom: 16 }}>
              <Ionicons name="information-circle-outline" size={15} color="#0891B2" />
              <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#0369A1', flex: 1 }}>
                Le numéro de rue est obligatoire pour un tarif précis — ex. : 42 Rue de la Paix, 1000 Bruxelles
              </Text>
            </View>

            {/* Champ de recherche */}
            <View style={[styles.addrWrap, addrError && { borderColor: '#EF4444' }]}>
              <Ionicons name="search" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                value={addrQuery}
                onChangeText={v => {
                  setAddrQuery(v);
                  setAddrError('');
                  if (!v) { setClientAddress({}); setAddrResults([]); }
                }}
                placeholder="Ex : 42 Rue de la Paix, 1000 Bruxelles"
                placeholderTextColor="#94A3B8"
                style={{ flex: 1, fontFamily: F.regular, fontSize: 14, color: '#0F172A' }}
                returnKeyType="search"
                autoFocus
              />
              {addrLoading
                ? <ActivityIndicator size="small" color="#0891B2" />
                : addrQuery
                  ? <TouchableOpacity onPress={() => { setAddrQuery(''); setAddrResults([]); setClientAddress({}); setAddrError(''); }}>
                      <Ionicons name="close-circle" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  : null
              }
            </View>

            {/* Message d'erreur */}
            {addrError ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, marginTop: 2 }}>
                <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
                <Text style={{ fontFamily: F.medium, fontSize: 12, color: '#EF4444', flex: 1 }}>{addrError}</Text>
              </View>
            ) : null}

            {/* Liste de résultats */}
            {addrResults.length > 0 && !clientAddress?.lat && (
              <View style={styles.addrResults}>
                {addrResults.map((item, i) => {
                  const a = item.address || {};
                  const rue = [a.road || a.pedestrian || a.street, a.house_number].filter(Boolean).join(' ');
                  const codePostal = a.postcode || '';
                  const ville = a.city || a.town || a.village || a.municipality || '';
                  const isComplete = !!(rue && codePostal && ville);
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        if (!isComplete) {
                          setAddrError('Adresse incomplète — précisez le numéro de rue, le code postal et la ville.');
                          return;
                        }
                        setClientAddress({ rue, codePostal, ville, lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
                        setAddrQuery([rue, codePostal, ville].filter(Boolean).join(', '));
                        setAddrResults([]);
                        setAddrError('');
                      }}
                      style={[styles.addrItem, i < addrResults.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }]}>
                      <Ionicons name="location-outline" size={15} color={isComplete ? '#0891B2' : '#94A3B8'} style={{ marginTop: 1, flexShrink: 0 }} />
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={{ fontFamily: F.regular, fontSize: 13, color: '#0F172A' }} numberOfLines={2}>
                          {item.display_name}
                        </Text>
                        {!isComplete && (
                          <Text style={{ fontFamily: F.regular, fontSize: 11, color: '#F59E0B', marginTop: 2 }}>
                            Adresse incomplète (manque : {!rue ? 'rue ' : ''}{!codePostal ? 'CP ' : ''}{!ville ? 'ville' : ''})
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Adresse confirmée */}
            {isAddressComplete ? (
              <View style={styles.addrConfirmed}>
                <MaterialCommunityIcons name="map-marker-check" size={20} color="#22C55E" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ fontFamily: F.bold, fontSize: 14, color: '#0F172A' }}>{clientAddress.rue}</Text>
                  <Text style={{ fontFamily: F.regular, fontSize: 13, color: '#64748B', marginTop: 2 }}>
                    {clientAddress.codePostal}  {clientAddress.ville}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => { setClientAddress({}); setAddrQuery(''); setAddrError(''); }}>
                  <Ionicons name="close-circle-outline" size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* ── Coordonnées de contact (visibles par le pro après paiement) ── */}
            {isAddressComplete && (
              <View style={styles.contactSection}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <MaterialCommunityIcons name="shield-lock-outline" size={15} color="#7C3AED" />
                  <Text style={{ fontFamily: F.bold, fontSize: 14, color: '#0F172A' }}>Vos coordonnées</Text>
                </View>
                <Text style={{ fontFamily: F.regular, fontSize: 11, color: '#94A3B8', marginBottom: 12 }}>
                  Transmises au pro uniquement après paiement de l'acompte
                </Text>

                {/* Téléphone */}
                <View style={styles.contactInput}>
                  <Ionicons name="call-outline" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                  <TextInput
                    value={clientPhone}
                    onChangeText={setClientPhone}
                    placeholder="Numéro de téléphone"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    style={{ flex: 1, fontFamily: F.regular, fontSize: 14, color: '#0F172A' }}
                  />
                  {clientPhone.trim().length >= 9 && (
                    <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                  )}
                </View>

                {/* Email */}
                <View style={[styles.contactInput, { marginTop: 8 }]}>
                  <Ionicons name="mail-outline" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                  <TextInput
                    value={clientEmail}
                    onChangeText={setClientEmail}
                    placeholder="Adresse e-mail"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{ flex: 1, fontFamily: F.regular, fontSize: 14, color: '#0F172A' }}
                  />
                  {clientEmail.includes('@') && clientEmail.includes('.') && (
                    <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                  )}
                </View>
              </View>
            )}

            {/* Bouton envoyer */}
            <TouchableOpacity
              onPress={() => {
                if (!isAddressComplete) {
                  setAddrError('Veuillez sélectionner une adresse complète avec numéro de rue, code postal et ville.');
                  return;
                }
                if (!isContactValid) return;
                navigation.navigate('Searching', { catId, urgency, answers, description, photos, clientAddress, clientPhone: clientPhone.trim(), clientEmail: clientEmail.trim() });
              }}
              activeOpacity={(isAddressComplete && isContactValid) ? 0.85 : 0.6}
              style={[styles.cta, { backgroundColor: (isAddressComplete && isContactValid) ? cat.color : '#94A3B8', marginTop: 20 }]}>
              <Text style={{ color: '#fff', fontSize: 15, fontFamily: F.bold }}>Envoyer ma demande aux pros</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: { padding: 4 },
  questionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#0F172A',
    marginBottom: 20,
    lineHeight: 28,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  urgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  textarea: {
    width: '100%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: '#0F172A',
    backgroundColor: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  photoRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoAdd: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  recap: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
    elevation: 3,
    shadowColor: '#0891B2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addrWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  addrResults: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  addrItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
  },
  addrConfirmed: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    padding: 14,
    marginTop: 4,
    marginBottom: 4,
  },
  contactSection: {
    backgroundColor: '#FAF5FF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    padding: 14,
    marginTop: 16,
  },
  contactInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
});
