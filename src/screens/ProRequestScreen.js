import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions,
  StatusBar, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { CATEGORIES, URGENCY_LEVELS, DIAGNOSTIC_QUESTIONS, F, BRAND } from '../constants/data';
import { CatIcon } from '../components';
import { useApp } from '../context/AppContext';
import { stopAlarm, cancelScheduledNotifications, scheduleInterventionReminder } from '../services/NotificationService';
import { addInterventionToCalendar } from '../services/CalendarService';

const { width: W, height: H } = Dimensions.get('window');
const TIMEOUT_SECS = 300; // 5 minutes

// ── Visionneuse photo plein écran avec zoom ─────────────────────────────────
function PhotoViewer({ photos, initialIndex, onClose }) {
  const [idx, setIdx] = useState(initialIndex);

  return (
    <Modal visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: '#000' }}>

        {/* Header */}
        <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
            <TouchableOpacity onPress={onClose} style={pvStyles.headerBtn}>
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={{ fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: '#fff' }}>
              {idx + 1} / {photos.length}
            </Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>

        {/* Image zoomable via ScrollView (pinch natif iOS + double-tap) */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ width: W, height: H, justifyContent: 'center', alignItems: 'center' }}
          maximumZoomScale={5}
          minimumZoomScale={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          centerContent
          bouncesZoom
        >
          <Image
            source={{ uri: photos[idx] }}
            style={{ width: W, height: H * 0.8 }}
            resizeMode="contain"
          />
        </ScrollView>

        {/* Navigation gauche */}
        {idx > 0 && (
          <TouchableOpacity
            onPress={() => setIdx(i => i - 1)}
            style={[pvStyles.navBtn, { left: 12 }]}
            activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Navigation droite */}
        {idx < photos.length - 1 && (
          <TouchableOpacity
            onPress={() => setIdx(i => i + 1)}
            style={[pvStyles.navBtn, { right: 12 }]}
            activeOpacity={0.8}>
            <Ionicons name="chevron-forward" size={26} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Bande de miniatures en bas */}
        {photos.length > 1 && (
          <SafeAreaView style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}>
              {photos.map((uri, i) => (
                <TouchableOpacity key={i} onPress={() => setIdx(i)} activeOpacity={0.8}>
                  <Image
                    source={{ uri }}
                    style={[pvStyles.strip, { borderColor: i === idx ? '#0891B2' : 'transparent', opacity: i === idx ? 1 : 0.5 }]}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>
        )}

      </View>
    </Modal>
  );
}

const pvStyles = StyleSheet.create({
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  navBtn: { position: 'absolute', top: '50%', marginTop: -26, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 26, padding: 10 },
  strip: { width: 54, height: 54, borderRadius: 8, borderWidth: 2 },
});

function buildDateOptions() {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];
  return [0, 1, 2, 3].map(offset => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      key: offset,
      label: offset === 0 ? "Aujourd'hui" : offset === 1 ? 'Demain' : `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`,
      date: `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`,
    };
  });
}

const TIME_SLOTS = ['08h - 10h', '10h - 12h', '14h - 16h', '16h - 18h', '18h - 20h'];

export default function ProRequestScreen({ route, navigation }) {
  const { catId, urgencyId, deposit, clientLocation = '12 Rue de la Paix, Paris' } = route.params;
  const { setProOffer, clientRequest, calendarSync, addIntervention } = useApp();

  const cat     = CATEGORIES.find(c => c.id === catId)      || CATEGORIES[0];
  const urgency = URGENCY_LEVELS.find(u => u.id === urgencyId) || URGENCY_LEVELS[0];
  const isExpress = urgency.id === 'express';   // intervention immédiate, pas de créneau
  const isJournee = urgency.id === 'journee';   // aujourd'hui, créneau obligatoire
  const isUrgent  = isExpress;                  // alias pour la logique de confirmation

  // Client details from context (set by SearchingScreen)
  const clientAnswers     = clientRequest?.answers     || {};
  const clientDescription = clientRequest?.description || '';
  const clientPhotos      = clientRequest?.photos      || [];
  const questions         = DIAGNOSTIC_QUESTIONS[catId] || DIAGNOSTIC_QUESTIONS._default;

  const [timer, setTimer]               = useState(TIMEOUT_SECS);
  const [answered, setAnswered]         = useState(false);
  const [showModal, setShowModal]       = useState(false);
  const [viewerIndex, setViewerIndex]   = useState(null);

  // Devis form state
  const [amount, setAmount]             = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const dateOptions = buildDateOptions();

  // Animations
  const pulse       = useRef(new Animated.Value(1)).current;
  const ringScale   = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;
  const flashAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');

    // Arrêter l'alarme et les rappels dès que le pro ouvre l'écran
    cancelScheduledNotifications();
    stopAlarm();

    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.08, duration: 600, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1,    duration: 600, useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.parallel([
      Animated.sequence([
        Animated.timing(ringScale,   { toValue: 2.2, duration: 1400, useNativeDriver: true }),
        Animated.timing(ringScale,   { toValue: 1,   duration: 0,    useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(ringOpacity, { toValue: 0,   duration: 1400, useNativeDriver: true }),
        Animated.timing(ringOpacity, { toValue: 0.6, duration: 0,    useNativeDriver: true }),
      ]),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ])).start();

    const iv = setInterval(() => {
      setTimer(p => {
        if (p <= 1) { clearInterval(iv); handleRefuse('timeout'); return 0; }
        return p - 1;
      });
    }, 1000);

    return () => clearInterval(iv);
  }, []);

  const handleAccept = () => {
    if (answered) return;
    setShowModal(true);
  };

  const handleConfirmOffer = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    if (!isExpress && !selectedTime) return;
    if (!isExpress && !isJournee && !selectedDate) return;

    const finalDate      = isJournee ? dateOptions[0].date  : (selectedDate?.date  || null);
    const finalDateLabel = isJournee ? "Aujourd'hui"        : (selectedDate?.label || null);

    setAnswered(true);

    const newIntervention = {
      id: Date.now(),
      catId,
      urgencyId,
      answers:         clientRequest?.answers        || {},
      description:     clientRequest?.description    || '',
      photos:          clientRequest?.photos         || [],
      clientLocation:  clientRequest?.clientLocation || '',
      clientPhone:     clientRequest?.clientPhone    || '',
      clientEmail:     clientRequest?.clientEmail    || '',
      deposit:         clientRequest?.deposit        || deposit,
      amount:          Number(amount),
      scheduledDate:      finalDate,
      scheduledDateLabel: finalDateLabel,
      scheduledTime:      selectedTime,
      status:    'in_progress',
      acceptedAt: new Date().toISOString(),
    };
    addIntervention(newIntervention);

    setProOffer({
      amount: Number(amount),
      deposit: clientRequest?.deposit || deposit,
      catId,
      urgencyId,
      scheduledDate: finalDate,
      scheduledDateLabel: finalDateLabel,
      scheduledTime: selectedTime,
      interventionId: newIntervention.id,
    });

    // Rappel 2h avant pour les interventions planifiées ≥ 24h (semaine / 2jours)
    if (!isExpress && !isJournee && finalDate && selectedTime) {
      await scheduleInterventionReminder({
        catLabel: cat.label,
        scheduledDate: finalDate,
        scheduledTime: selectedTime,
        clientLocation: clientRequest?.clientLocation || '',
      });
    }

    // Synchronisation agenda si activée
    if (calendarSync && !isExpress && finalDate && selectedTime) {
      await addInterventionToCalendar({
        catLabel: cat.label,
        scheduledDate: finalDate,
        scheduledTime: selectedTime,
        clientLocation: clientRequest?.clientLocation || '',
        amount: Number(amount),
      });
    }

    navigation.replace('ProDashboard');
  };

  const handleRefuse = (reason = 'manual') => {
    if (answered) return;
    setAnswered(true);
    navigation.replace('ProDashboard');
  };

  const mins = String(Math.floor(timer / 60)).padStart(2, '0');
  const secs = String(timer % 60).padStart(2, '0');
  const timerColor = timer < 30 ? '#FF4444' : timer < 60 ? '#FF8C00' : '#fff';

  const flashOpacity = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, timer < 30 ? 0.12 : 0.05],
  });

  const canConfirm = amount && Number(amount) > 0
    && (isExpress || selectedTime)
    && (isExpress || isJournee || selectedDate);

  const hasClientDetails = Object.keys(clientAnswers).length > 0 || clientDescription || clientPhotos.length > 0;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#7F1D1D" />
      <LinearGradient colors={['#7F1D1D', '#991B1B', '#B91C1C']} style={{ flex: 1 }}>

        <Animated.View pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: '#FF0000', opacity: flashOpacity }]} />

        <SafeAreaView style={{ flex: 1 }}>

          {/* Timer fixe en haut */}
          <View style={{ alignItems: 'center', paddingTop: 10, paddingHorizontal: 20 }}>
            <View style={styles.timerPill}>
              <Text style={{ color: '#94A3B8', fontFamily: F.regular, fontSize: 12 }}>Répond avant</Text>
              <Text style={[styles.timerText, { color: timerColor }]}>{mins}:{secs}</Text>
            </View>
            <Text style={styles.title}>NOUVELLE DEMANDE</Text>
            <Text style={styles.subtitle}>Un client a besoin de toi</Text>
          </View>

          {/* Contenu scrollable */}
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, alignItems: 'center' }}
            showsVerticalScrollIndicator={false}>

            {/* Radar */}
            <View style={styles.radarWrap}>
              <Animated.View style={[styles.ring, styles.ring3, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
              <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: ringScale }], opacity: Animated.multiply(ringOpacity, 0.6) }]} />
              <Animated.View style={[styles.ring, styles.ring1]} />
              <Animated.View style={[styles.centerCircle, { transform: [{ scale: pulse }] }]}>
                <CatIcon cat={cat} size={46} color="#fff" />
              </Animated.View>
            </View>

            {/* Info card */}
            <View style={[styles.infoCard, { width: W - 32 }]}>

              {/* Badges catégorie + urgence */}
              <View style={styles.infoRow}>
                <View style={[styles.infoBadge, { backgroundColor: cat.color + '25', borderColor: cat.color + '60', flexDirection: 'row', gap: 6 }]}>
                  <CatIcon cat={cat} size={14} color="#fff" />
                  <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#fff' }}>{cat.label}</Text>
                </View>
                <View style={[styles.infoBadge, { backgroundColor: urgency.bg + '30', borderColor: urgency.color + '60', flexDirection: 'row', gap: 6 }]}>
                  <MaterialCommunityIcons name={urgency.iconName} size={14} color={urgency.color} />
                  <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#fff' }}>{urgency.label}</Text>
                </View>
              </View>

              {/* Localisation */}
              <View style={styles.locRow}>
                <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(8,145,178,0.2)', justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="location" size={16} color="#0891B2" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ fontFamily: F.regular, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Adresse du client</Text>
                  <Text style={{ fontFamily: F.bold, fontSize: 14, color: '#fff', marginTop: 1 }}>{clientRequest?.clientLocation || clientLocation}</Text>
                </View>
              </View>

              {/* Zone d'intervention calculée */}
              {clientRequest?.matchedZone && (
                <View style={styles.zoneRow}>
                  <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(245,158,11,0.2)', justifyContent: 'center', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="map-marker-radius" size={16} color="#F59E0B" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ fontFamily: F.regular, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Zone tarifaire</Text>
                    <Text style={{ fontFamily: F.bold, fontSize: 14, color: '#fff', marginTop: 1 }}>
                      {clientRequest.matchedZone.distKm} km · Zone {clientRequest.matchedZone.from}–{clientRequest.matchedZone.to} km
                    </Text>
                  </View>
                  <Text style={{ fontFamily: F.groteskBold, fontSize: 18, color: '#F59E0B' }}>
                    {clientRequest.matchedZone.price} €
                  </Text>
                </View>
              )}

              {/* Acompte */}
              <View style={styles.depositRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons name="shield-check-outline" size={16} color="#4ADE80" />
                  <Text style={{ fontFamily: F.regular, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Acompte garanti</Text>
                </View>
                <Text style={{ fontFamily: F.groteskBold, fontSize: 26, color: '#4ADE80' }}>{clientRequest?.deposit || deposit}€</Text>
              </View>

              {/* ── Contact client (masqué jusqu'au paiement de l'acompte) ── */}
              <View style={styles.contactLocked}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <MaterialCommunityIcons name="shield-lock" size={15} color="#A78BFA" />
                  <Text style={{ fontFamily: F.bold, fontSize: 12, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Coordonnées client
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Ionicons name="call-outline" size={14} color="rgba(255,255,255,0.35)" />
                  <Text style={{ fontFamily: F.regular, fontSize: 13, color: 'rgba(255,255,255,0.35)', letterSpacing: 3 }}>
                    •••• •••• ••••
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="mail-outline" size={14} color="rgba(255,255,255,0.35)" />
                  <Text style={{ fontFamily: F.regular, fontSize: 13, color: 'rgba(255,255,255,0.35)', letterSpacing: 2 }}>
                    ••••@••••.••
                  </Text>
                </View>
                <Text style={{ fontFamily: F.regular, fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8, textAlign: 'center' }}>
                  Visible dès que l'acompte est perçu
                </Text>
              </View>

              {/* ── Détails du client ── */}
              {hasClientDetails && (
                <View style={styles.clientDetails}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <MaterialCommunityIcons name="clipboard-text-outline" size={15} color="rgba(255,255,255,0.6)" />
                    <Text style={{ fontFamily: F.bold, fontSize: 13, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Détails de la demande
                    </Text>
                  </View>

                  {/* Réponses au questionnaire */}
                  {Object.entries(clientAnswers).map(([key, val]) => {
                    const q = questions.find(q => q.id === key);
                    if (!q) return null;
                    return (
                      <View key={key} style={styles.answerRow}>
                        <Text style={styles.answerLabel} numberOfLines={1}>{q.q.replace(' ?', '')}</Text>
                        <Text style={styles.answerVal}>{val}</Text>
                      </View>
                    );
                  })}

                  {/* Description libre */}
                  {clientDescription ? (
                    <View style={styles.descBlock}>
                      <MaterialCommunityIcons name="text" size={13} color="rgba(255,255,255,0.5)" style={{ marginTop: 1 }} />
                      <Text style={styles.descText}>{clientDescription}</Text>
                    </View>
                  ) : null}

                  {/* Photos — tap pour ouvrir la visionneuse */}
                  {clientPhotos.length > 0 && (
                    <View style={{ marginTop: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <MaterialCommunityIcons name="image-multiple-outline" size={13} color="rgba(255,255,255,0.55)" />
                        <Text style={{ fontFamily: F.semibold, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                          Photos ({clientPhotos.length}) — appuyer pour agrandir
                        </Text>
                      </View>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
                        {clientPhotos.map((uri, i) => (
                          <TouchableOpacity key={i} onPress={() => setViewerIndex(i)} activeOpacity={0.85}>
                            <Image source={{ uri }} style={styles.photoThumb} resizeMode="cover" />
                            <View style={styles.photoZoomHint}>
                              <Ionicons name="expand-outline" size={12} color="#fff" />
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}

            </View>

            <View style={{ height: 16 }} />
          </ScrollView>

          {/* Boutons fixés en bas */}
          <View style={styles.btnRow}>
            <TouchableOpacity onPress={() => handleRefuse()} style={styles.refuseBtn} activeOpacity={0.85}>
              <Ionicons name="close" size={26} color="#fff" />
              <Text style={{ fontFamily: F.bold, fontSize: 12, color: '#fff', marginTop: 3 }}>Refuser</Text>
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: pulse }] }}>
              <TouchableOpacity onPress={handleAccept} style={styles.acceptBtn} activeOpacity={0.85}>
                <MaterialCommunityIcons name="check-bold" size={34} color="#fff" />
                <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#fff', marginTop: 3 }}>Accepter</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

        </SafeAreaView>
      </LinearGradient>

      {/* ── Visionneuse photo plein écran ── */}
      {viewerIndex !== null && (
        <PhotoViewer
          photos={clientPhotos}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}

      {/* ── Modal devis ── */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <View style={styles.modalSheet}>

              <View style={styles.modalHandle} />

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#16A34A20', justifyContent: 'center', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="file-document-edit-outline" size={22} color="#16A34A" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Votre devis</Text>
                  <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#64748B' }}>
                    {cat.label} · {urgency.label}
                  </Text>
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>

                {/* Montant */}
                <Text style={styles.fieldLabel}>Montant total estimé</Text>
                <View style={styles.amountRow}>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#94A3B8"
                    autoFocus
                  />
                  <View style={styles.euroBadge}>
                    <Text style={{ fontFamily: F.groteskBold, fontSize: 22, color: '#0891B2' }}>€</Text>
                  </View>
                </View>

                <View style={styles.acompteLine}>
                  <MaterialCommunityIcons name="shield-check-outline" size={13} color="#16A34A" />
                  <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#64748B', flex: 1 }}>
                    Acompte déjà perçu : <Text style={{ fontFamily: F.bold, color: '#16A34A' }}>{clientRequest?.deposit || deposit}€</Text>
                    {amount && Number(amount) > 0
                      ? <Text> · Reste dû au pro : <Text style={{ fontFamily: F.bold, color: '#0F172A' }}>{Math.max(0, Number(amount) - (clientRequest?.deposit || deposit))}€</Text></Text>
                      : null}
                  </Text>
                </View>

                {/* Express : intervention immédiate */}
                {isExpress && (
                  <View style={[styles.scheduleConfirm, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                    <MaterialCommunityIcons name="lightning-bolt" size={16} color="#D97706" />
                    <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#D97706', flex: 1 }}>
                      Intervention immédiate — vous serez en route dès acceptation
                    </Text>
                  </View>
                )}

                {/* Journée : aujourd'hui + créneau horaire obligatoire */}
                {isJournee && (
                  <>
                    <View style={styles.divider} />
                    <View style={[styles.scheduleConfirm, { marginBottom: 16 }]}>
                      <MaterialCommunityIcons name="calendar-today" size={16} color="#0891B2" />
                      <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#0891B2', flex: 1 }}>
                        Intervention aujourd'hui · {dateOptions[0].date}
                      </Text>
                    </View>
                    <Text style={styles.fieldLabel}>Créneau horaire — obligatoire</Text>
                    <View style={styles.chipRow}>
                      {TIME_SLOTS.map(slot => (
                        <TouchableOpacity
                          key={slot}
                          onPress={() => setSelectedTime(slot)}
                          style={[styles.chip, selectedTime === slot && styles.chipSelected]}>
                          <MaterialCommunityIcons
                            name="clock-outline" size={12}
                            color={selectedTime === slot ? '#fff' : '#64748B'}
                            style={{ marginRight: 4 }}
                          />
                          <Text style={[styles.chipText, selectedTime === slot && styles.chipTextSelected]}>
                            {slot}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {selectedTime && (
                      <View style={[styles.scheduleConfirm, { marginTop: 12 }]}>
                        <MaterialCommunityIcons name="calendar-check" size={16} color="#0891B2" />
                        <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#0891B2', flex: 1 }}>
                          Aujourd'hui · {selectedTime}
                        </Text>
                      </View>
                    )}
                  </>
                )}

                {/* Semaine / 2 jours : date + créneau */}
                {!isExpress && !isJournee && (
                  <>
                    <View style={styles.divider} />
                    <Text style={styles.fieldLabel}>Date d'intervention</Text>
                    <View style={styles.chipRow}>
                      {dateOptions.map(opt => (
                        <TouchableOpacity
                          key={opt.key}
                          onPress={() => setSelectedDate(opt)}
                          style={[styles.chip, selectedDate?.key === opt.key && styles.chipSelected]}>
                          <Text style={[styles.chipText, selectedDate?.key === opt.key && styles.chipTextSelected]}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Créneau horaire</Text>
                    <View style={styles.chipRow}>
                      {TIME_SLOTS.map(slot => (
                        <TouchableOpacity
                          key={slot}
                          onPress={() => setSelectedTime(slot)}
                          style={[styles.chip, selectedTime === slot && styles.chipSelected]}>
                          <MaterialCommunityIcons
                            name="clock-outline" size={12}
                            color={selectedTime === slot ? '#fff' : '#64748B'}
                            style={{ marginRight: 4 }}
                          />
                          <Text style={[styles.chipText, selectedTime === slot && styles.chipTextSelected]}>
                            {slot}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {selectedDate && selectedTime && (
                      <View style={[styles.scheduleConfirm, { marginTop: 12 }]}>
                        <MaterialCommunityIcons name="calendar-check" size={16} color="#0891B2" />
                        <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#0891B2', flex: 1 }}>
                          {selectedDate.label} · {selectedTime}
                        </Text>
                      </View>
                    )}
                  </>
                )}

                <View style={{ height: 20 }} />

                <TouchableOpacity
                  onPress={handleConfirmOffer}
                  activeOpacity={canConfirm ? 0.85 : 1}
                  style={[styles.confirmBtn, !canConfirm && { opacity: 0.4 }]}>
                  <MaterialCommunityIcons name="send" size={18} color="#fff" />
                  <Text style={{ fontFamily: F.bold, fontSize: 15, color: '#fff' }}>
                    Envoyer le devis au client
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowModal(false)} style={styles.cancelModalBtn}>
                  <Text style={{ fontFamily: F.semibold, fontSize: 14, color: '#94A3B8' }}>Retour</Text>
                </TouchableOpacity>

              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  timerPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 12,
  },
  timerText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 36, letterSpacing: 2, marginTop: 2 },
  title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#fff', letterSpacing: 1, textAlign: 'center' },
  subtitle: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4, textAlign: 'center', marginBottom: 8 },
  radarWrap: { width: 180, height: 180, justifyContent: 'center', alignItems: 'center', marginVertical: 12 },
  ring: { position: 'absolute', borderRadius: 200, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  ring1: { width: 110, height: 110 },
  ring2: { width: 148, height: 148, borderColor: 'rgba(255,255,255,0.3)' },
  ring3: { width: 180, height: 180, borderColor: 'rgba(255,255,255,0.15)' },
  centerCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 22,
    padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  infoRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  infoBadge: { flex: 1, paddingVertical: 9, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  locRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, marginBottom: 10 },
  zoneRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', marginBottom: 10 },
  depositRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(74,222,128,0.12)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)', marginBottom: 10 },
  contactLocked: { backgroundColor: 'rgba(167,139,250,0.1)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(167,139,250,0.25)', marginBottom: 0 },
  // Client details section
  clientDetails: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  answerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    gap: 8,
  },
  answerLabel: {
    fontFamily: F.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    flex: 1,
  },
  answerVal: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#fff',
    textAlign: 'right',
    flexShrink: 1,
  },
  descBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    padding: 10,
  },
  descText: {
    fontFamily: F.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    flex: 1,
    lineHeight: 18,
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  photoZoomHint: {
    position: 'absolute',
    bottom: 4,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 6,
    padding: 3,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  refuseBtn: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center',
  },
  acceptBtn: {
    width: 115, height: 115, borderRadius: 58, backgroundColor: '#16A34A',
    borderWidth: 4, borderColor: '#4ADE80', justifyContent: 'center', alignItems: 'center',
    elevation: 8, shadowColor: '#4ADE80', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 18,
  },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end', alignItems: 'center',
  },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 36, width: '100%', maxHeight: '90%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0',
    alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#0F172A' },
  fieldLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: '#0F172A', marginBottom: 10 },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  amountInput: {
    flex: 1, backgroundColor: '#F8FAFC', borderWidth: 2, borderColor: '#0891B2',
    borderRadius: 16, padding: 16, fontSize: 32, fontFamily: 'SpaceGrotesk_700Bold',
    color: '#0F172A', textAlign: 'center',
  },
  euroBadge: {
    width: 56, height: 56, borderRadius: 14, backgroundColor: '#EFF6FF',
    borderWidth: 1.5, borderColor: '#BFDBFE', justifyContent: 'center', alignItems: 'center',
  },
  acompteLine: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: '#F0FDF4', borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: '#BBF7D0', marginBottom: 4,
  },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC',
  },
  chipSelected: { backgroundColor: '#0891B2', borderColor: '#0891B2' },
  chipText: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: '#475569' },
  chipTextSelected: { color: '#fff', fontFamily: 'DMSans_700Bold' },
  scheduleConfirm: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14,
    backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#BFDBFE',
  },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#0891B2', padding: 16, borderRadius: 16,
    elevation: 3, shadowColor: '#0891B2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  cancelModalBtn: {
    padding: 14, alignItems: 'center', marginTop: 8,
  },
});
