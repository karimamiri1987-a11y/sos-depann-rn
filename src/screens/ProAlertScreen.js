import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CATEGORIES, URGENCY_LEVELS, PROS, COMMISSION_RATE, F } from '../constants/data';
import { useApp } from '../context/AppContext';
import { Avatar, StarRating, RadarRing } from '../components';

function formatCountdown(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function ProAlertScreen({ route, navigation }) {
  const { catId, urgency, answers } = route.params;
  const {
    radiusTiers, proOffer, clearProOffer,
    pendingOffers, addPendingOffer, clearPendingOffers,
    activeSearch,
  } = useApp();

  const cat            = CATEGORIES.find(c => c.id === catId);
  const currentUrgency = URGENCY_LEVELS.find(u => u.id === urgency);
  const isUrgent       = urgency === 'journee' || urgency === 'express';

  const [timer, setTimer]               = useState(600);
  const [responded, setResponded]       = useState(false);
  const [respondingPro, setRespondingPro] = useState(null);
  const [estimate, setEstimate]         = useState(null);
  const [offerDeposit, setOfferDeposit] = useState(null);
  const [scheduledDate, setScheduledDate] = useState(null);
  const [scheduledTime, setScheduledTime] = useState(null);
  const [tick, setTick]                 = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const getDeposit = (pro) => {
    const tier = radiusTiers.find(t => pro.distKm >= t.from && pro.distKm < t.to) || radiusTiers[0];
    return tier.price;
  };

  // Tick pour les comptes à rebours des devis en attente
  useEffect(() => {
    if (pendingOffers.length === 0) return;
    const iv = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, [pendingOffers.length]);

  useEffect(() => {
    const iv = setInterval(() => setTimer(p => {
      if (p <= 0) { clearInterval(iv); return 0; }
      return p - 1;
    }), 1000);

    const resolveOffer = (pro, deposit) => {
      if (proOffer && proOffer.catId === catId) {
        setEstimate(proOffer.amount);
        setOfferDeposit(proOffer.deposit || deposit);
        setScheduledDate(proOffer.scheduledDateLabel || null);
        setScheduledTime(proOffer.scheduledTime || null);
        clearProOffer();
      } else {
        const est = Math.round(deposit * (currentUrgency?.mult || 1) * (1.2 + Math.random() * 0.8));
        setEstimate(est);
        setOfferDeposit(deposit);
      }
    };

    const resp = setTimeout(() => {
      const pros = PROS.filter(p => p.cat === catId);
      const pro  = (pros.length ? pros : PROS).sort((a, b) => a.distKm - b.distKm)[0];
      const deposit = getDeposit(pro);
      setRespondingPro(pro);
      resolveOffer(pro, deposit);
      setResponded(true);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 4000);

    return () => { clearInterval(iv); clearTimeout(resp); };
  }, []);

  const handleHold = () => {
    if (!respondingPro) return;
    addPendingOffer({
      id: Date.now(),
      pro: respondingPro,
      estimate,
      deposit: offerDeposit || getDeposit(respondingPro),
      scheduledDate,
      scheduledTime,
      catId,
      urgency,
    });
    const search = activeSearch || { catId, urgency, answers: answers || {} };
    navigation.replace('Searching', {
      catId:         search.catId,
      urgency:       search.urgency,
      answers:       search.answers       || {},
      description:   search.description   || '',
      photos:        search.photos        || [],
      clientAddress: search.clientAddress || null,
      clientPhone:   search.clientPhone   || '',
      clientEmail:   search.clientEmail   || '',
    });
  };

  const handleChooseCurrent = () => {
    clearPendingOffers();
    const dep = offerDeposit || getDeposit(respondingPro);
    navigation.replace('DepositConfirmed', {
      pro: respondingPro, estimate, deposit: dep, urgency,
      scheduledDate, scheduledTime,
    });
  };

  const handleChooseHeld = (offer) => {
    clearPendingOffers();
    navigation.replace('DepositConfirmed', {
      pro:           offer.pro,
      estimate:      offer.estimate,
      deposit:       offer.deposit,
      urgency:       offer.urgency,
      scheduledDate: offer.scheduledDate,
      scheduledTime: offer.scheduledTime,
    });
  };

  const mins = Math.floor(timer / 60);
  const secs = timer % 60;

  // ── Écran d'attente ──
  if (!responded) {
    return (
      <View style={styles.waitContainer}>
        <View style={styles.bellWrap}>
          <RadarRing />
          <MaterialCommunityIcons name="bell-ring" size={40} color="#0891B2" />
        </View>

        <Text style={styles.waitTitle}>Demande envoyée !</Text>
        <Text style={styles.waitSub}>Les pros à proximité ont reçu votre alerte</Text>

        <View style={styles.timerCard}>
          <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>
            Temps restant pour répondre
          </Text>
          <Text style={[styles.timerText, { color: timer < 120 ? '#EF4444' : '#0F172A' }]}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </Text>
          <View style={styles.timerBarWrap}>
            <View style={[styles.timerBarFill, {
              width: `${(timer / 600) * 100}%`,
              backgroundColor: timer < 120 ? '#EF4444' : '#F59E0B',
            }]} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 }}>
            <MaterialCommunityIcons name="loading" size={14} color="#94A3B8" />
            <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#94A3B8' }}>
              En attente d'un professionnel...
            </Text>
          </View>
        </View>

        {/* Devis en attente pendant la recherche */}
        {pendingOffers.length > 0 && (
          <View style={{ width: '100%', maxWidth: 340, marginTop: 20 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#64748B', marginBottom: 8 }}>
              Devis en attente ({pendingOffers.length})
            </Text>
            {pendingOffers.map(o => {
              const rem = o.heldUntil - Date.now();
              const expired = rem <= 0;
              return (
                <View key={o.id} style={[styles.heldCard, expired && { opacity: 0.5 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Avatar name={o.pro.name} size={36} premium={o.pro.premium} />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={{ fontFamily: F.bold, fontSize: 14, color: '#0F172A' }}>{o.pro.name}</Text>
                      <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#64748B' }}>{o.estimate}€</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: F.regular, fontSize: 11, color: expired ? '#EF4444' : '#F59E0B' }}>
                      {expired ? 'Expiré' : formatCountdown(rem)}
                    </Text>
                    {!expired && (
                      <TouchableOpacity onPress={() => handleChooseHeld(o)} style={styles.chooseSmallBtn}>
                        <Text style={{ fontFamily: F.bold, fontSize: 11, color: '#fff' }}>Choisir</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  }

  const deposit    = offerDeposit || getDeposit(respondingPro);
  const commission = Math.round(deposit * COMMISSION_RATE);
  const hasSchedule = scheduledDate && scheduledTime;

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, backgroundColor: '#F8FAFC' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <View style={styles.successIcon}>
            <MaterialCommunityIcons name="check-circle" size={44} color="#22C55E" />
          </View>
          <Text style={styles.respTitle}>Un pro a répondu !</Text>
          <Text style={{ fontFamily: F.regular, fontSize: 14, color: '#64748B' }}>
            Voici son devis
          </Text>
        </View>

        {/* Pro Card */}
        <View style={styles.proCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Avatar name={respondingPro.name} size={56} premium={respondingPro.premium} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ fontFamily: F.groteskBold, fontSize: 18, color: '#0F172A' }}>
                {respondingPro.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <StarRating rating={respondingPro.rating} size={13} />
                <Text style={{ fontFamily: F.regular, fontSize: 13, color: '#94A3B8', marginLeft: 6 }}>
                  {respondingPro.rating} ({respondingPro.reviews} avis)
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="location-outline" size={13} color="#94A3B8" />
                  <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#94A3B8' }}>{respondingPro.distance}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="time-outline" size={13} color="#94A3B8" />
                  <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#94A3B8' }}>{respondingPro.time}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Montant devis */}
          <LinearGradient
            colors={['#0891B220', '#0891B210']}
            style={styles.estimateBox}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>
              Devis total proposé par le pro
            </Text>
            <Text style={{ fontFamily: F.groteskBold, fontSize: 38, color: '#0891B2' }}>{estimate}€</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <MaterialCommunityIcons name={currentUrgency?.iconName || 'clock-outline'} size={14} color={currentUrgency?.color} />
              <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#64748B' }}>
                {currentUrgency?.label}
                {currentUrgency?.mult > 1 ? ` · Majoration ×${currentUrgency.mult}` : ''}
              </Text>
            </View>
          </LinearGradient>

          {/* Date planifiée */}
          {hasSchedule && (
            <View style={styles.scheduleBox}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', justifyContent: 'center', alignItems: 'center' }}>
                <MaterialCommunityIcons name="calendar-check" size={22} color="#0891B2" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontFamily: F.regular, fontSize: 11, color: '#94A3B8', marginBottom: 2 }}>
                  Date d'intervention prévue
                </Text>
                <Text style={{ fontFamily: F.bold, fontSize: 15, color: '#0F172A' }}>
                  {scheduledDate}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <MaterialCommunityIcons name="clock-outline" size={13} color="#0891B2" />
                  <Text style={{ fontFamily: F.semibold, fontSize: 13, color: '#0891B2' }}>
                    {scheduledTime}
                  </Text>
                </View>
              </View>
              <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                <Text style={{ fontFamily: F.bold, fontSize: 11, color: '#16A34A' }}>Confirmé</Text>
              </View>
            </View>
          )}

          {!hasSchedule && !isUrgent && (
            <View style={[styles.scheduleBox, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
              <MaterialCommunityIcons name="clock-fast" size={20} color="#D97706" />
              <Text style={{ fontFamily: F.regular, fontSize: 13, color: '#92400E', flex: 1, marginLeft: 10 }}>
                Le pro vous contactera pour convenir d'un créneau
              </Text>
            </View>
          )}

          {/* Acompte */}
          <View style={styles.depositBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <MaterialCommunityIcons name="credit-card-outline" size={16} color="#F59E0B" />
              <Text style={{ fontFamily: F.bold, fontSize: 14, color: '#F59E0B' }}>Acompte à verser maintenant</Text>
            </View>
            <View style={styles.row}>
              <Text style={{ fontFamily: F.regular, fontSize: 13, color: '#64748B', flex: 1 }}>Acompte (déplacement)</Text>
              <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#0F172A' }}>{deposit}€</Text>
            </View>
            <View style={styles.row}>
              <Text style={{ fontFamily: F.regular, fontSize: 13, color: '#64748B', flex: 1 }}>
                Commission plateforme ({(COMMISSION_RATE * 100).toFixed(0)}%)
              </Text>
              <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#EF4444' }}>-{commission}€</Text>
            </View>
            <View style={{ height: 1, backgroundColor: '#E2E8F0', marginVertical: 10 }} />
            <View style={styles.row}>
              <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#0F172A' }}>Reste à régler au pro</Text>
              <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#22C55E' }}>{estimate - deposit}€</Text>
            </View>
            <View style={styles.infoNote}>
              <MaterialCommunityIcons name="information-outline" size={13} color="#94A3B8" />
              <Text style={{ fontFamily: F.regular, fontSize: 11, color: '#94A3B8', lineHeight: 16, flex: 1 }}>
                L'acompte de <Text style={{ fontFamily: F.bold }}>{deposit}€</Text> est débité maintenant. Le reste (<Text style={{ fontFamily: F.bold }}>{estimate - deposit}€</Text>) sera réglé directement au pro après l'intervention.
              </Text>
            </View>
          </View>
        </View>

        {/* CTA principal */}
        <TouchableOpacity onPress={handleChooseCurrent} style={styles.ctaBtn} activeOpacity={0.85}>
          <MaterialCommunityIcons name="lock-check" size={18} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 15, fontFamily: F.bold }}>
            Valider et payer l'acompte de {deposit}€
          </Text>
        </TouchableOpacity>

        {/* Bouton mise en attente + relance */}
        <TouchableOpacity onPress={handleHold} style={styles.holdBtn} activeOpacity={0.85}>
          <MaterialCommunityIcons name="timer-sand" size={18} color="#D97706" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 14, color: '#D97706' }}>
              Mettre en attente 20 min & relancer
            </Text>
            <Text style={{ fontFamily: F.regular, fontSize: 11, color: '#92400E', marginTop: 2 }}>
              Chercher d'autres pros · Comparez les devis
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color="#D97706" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { clearPendingOffers(); navigation.replace('Home'); }} style={styles.secondaryBtn}>
          <Text style={{ color: '#94A3B8', fontSize: 14, fontFamily: F.semibold }}>
            Refuser et chercher un autre pro
          </Text>
        </TouchableOpacity>

        {/* ── Comparaison des devis en attente ── */}
        {pendingOffers.length > 0 && (
          <View style={{ marginTop: 28 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <MaterialCommunityIcons name="compare" size={18} color="#0891B2" />
              <Text style={{ fontFamily: F.groteskBold, fontSize: 16, color: '#0F172A' }}>
                Devis en attente ({pendingOffers.length})
              </Text>
            </View>

            {pendingOffers.map((o) => {
              const rem     = o.heldUntil - Date.now();
              const expired = rem <= 0;
              const odep    = o.deposit;
              const ocomm   = Math.round(odep * COMMISSION_RATE);
              return (
                <View key={o.id} style={[styles.heldFullCard, expired && { opacity: 0.55 }]}>
                  {/* En-tête */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Avatar name={o.pro.name} size={44} premium={o.pro.premium} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ fontFamily: F.groteskBold, fontSize: 15, color: '#0F172A' }}>{o.pro.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                        <StarRating rating={o.pro.rating} size={12} />
                        <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#94A3B8', marginLeft: 5 }}>
                          {o.pro.rating} ({o.pro.reviews} avis)
                        </Text>
                      </View>
                    </View>
                    {/* Badge compte à rebours */}
                    <View style={[styles.holdBadge, expired && { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
                      <MaterialCommunityIcons
                        name="timer-outline"
                        size={12}
                        color={expired ? '#EF4444' : '#D97706'}
                      />
                      <Text style={{ fontFamily: F.bold, fontSize: 11, color: expired ? '#EF4444' : '#D97706', marginLeft: 3 }}>
                        {expired ? 'Expiré' : formatCountdown(rem)}
                      </Text>
                    </View>
                  </View>

                  {/* Montant */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F0F9FF', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                    <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#64748B' }}>Devis total</Text>
                    <Text style={{ fontFamily: F.groteskBold, fontSize: 22, color: '#0891B2' }}>{o.estimate}€</Text>
                  </View>

                  {/* Détail acompte */}
                  <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <View style={styles.row}>
                      <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#64748B', flex: 1 }}>Acompte</Text>
                      <Text style={{ fontFamily: F.bold, fontSize: 12, color: '#0F172A' }}>{odep}€</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#64748B', flex: 1 }}>Commission ({(COMMISSION_RATE * 100).toFixed(0)}%)</Text>
                      <Text style={{ fontFamily: F.bold, fontSize: 12, color: '#EF4444' }}>-{ocomm}€</Text>
                    </View>
                    <View style={{ height: 1, backgroundColor: '#E2E8F0', marginVertical: 6 }} />
                    <View style={styles.row}>
                      <Text style={{ fontFamily: F.bold, fontSize: 12, color: '#0F172A' }}>Reste à régler</Text>
                      <Text style={{ fontFamily: F.bold, fontSize: 12, color: '#22C55E' }}>{o.estimate - odep}€</Text>
                    </View>
                  </View>

                  {/* Date si disponible */}
                  {o.scheduledDate && o.scheduledTime && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                      <MaterialCommunityIcons name="calendar-check" size={14} color="#0891B2" />
                      <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#0891B2' }}>
                        {o.scheduledDate} · {o.scheduledTime}
                      </Text>
                    </View>
                  )}

                  {!expired ? (
                    <TouchableOpacity onPress={() => handleChooseHeld(o)} style={styles.chooseBtn} activeOpacity={0.85}>
                      <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
                      <Text style={{ fontFamily: F.bold, fontSize: 14, color: '#fff' }}>Choisir ce pro</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.expiredLabel}>
                      <MaterialCommunityIcons name="clock-remove-outline" size={14} color="#EF4444" />
                      <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#EF4444', marginLeft: 6 }}>
                        Ce devis a expiré
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  waitContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F8FAFC' },
  bellWrap: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff',
    borderWidth: 2, borderColor: '#E2E8F0',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  waitTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#0F172A', marginBottom: 6 },
  waitSub: { fontFamily: 'DMSans_400Regular', color: '#64748B', fontSize: 14, marginBottom: 24, textAlign: 'center' },
  timerCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    width: '100%', maxWidth: 340, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center',
  },
  timerText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 42, marginBottom: 16 },
  timerBarWrap: { width: '100%', height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, overflow: 'hidden' },
  timerBarFill: { height: 4, borderRadius: 2 },
  successIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#22C55E15', borderWidth: 2, borderColor: '#22C55E40',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  respTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#0F172A', marginBottom: 4 },
  proCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  estimateBox: {
    borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 14,
    borderWidth: 1, borderColor: '#0891B230',
  },
  scheduleBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF',
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#BFDBFE', marginBottom: 14,
  },
  depositBox: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  infoNote: {
    marginTop: 12, backgroundColor: '#fff', borderRadius: 10, padding: 10,
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#0891B2', padding: 16, borderRadius: 16,
    elevation: 3, shadowColor: '#0891B2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  holdBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFFBEB', borderWidth: 1.5, borderColor: '#FDE68A',
    padding: 14, borderRadius: 16, marginTop: 10,
  },
  secondaryBtn: {
    padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0',
    alignItems: 'center', marginTop: 10, backgroundColor: '#fff',
  },
  heldCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8,
  },
  chooseSmallBtn: {
    marginTop: 4, backgroundColor: '#0891B2', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  heldFullCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6,
  },
  holdBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A',
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4,
  },
  chooseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#0891B2', padding: 12, borderRadius: 12,
  },
  expiredLabel: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 10, backgroundColor: '#FEF2F2', borderRadius: 10,
  },
});
