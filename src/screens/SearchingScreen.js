import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RadarRing } from '../components';
import { F, BRAND, CATEGORIES, URGENCY_LEVELS, MIN_TARIF } from '../constants/data';
import { sendProRequestNotification } from '../services/NotificationService';
import { useApp } from '../context/AppContext';

// Formule de Haversine : distance en km entre deux coordonnées GPS
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const MSGS = [
  "Envoi de votre demande...",
  "Alerte des pros à proximité...",
  "Vérification des disponibilités...",
  "Attente des réponses...",
];

export default function SearchingScreen({ route, navigation }) {
  const { catId, urgency, answers, description = '', photos = [], clientAddress, clientPhone = '', clientEmail = '' } = route.params;
  const { setClientRequest, proUser, radiusTiers, setActiveSearch } = useApp();
  const [msgIdx, setMsgIdx] = useState(0);
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const cat = CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];
    const urgencyObj = URGENCY_LEVELS.find(u => u.id === urgency) || URGENCY_LEVELS[0];

    // Adresse client formatée
    const clientLocation = clientAddress
      ? [clientAddress.rue, clientAddress.codePostal, clientAddress.ville].filter(Boolean).join(', ')
      : 'Adresse non précisée';

    // Acompte de base (fallback si pas de zone calculée)
    let finalDeposit = Math.max(Math.round(cat.basePrice * urgencyObj.mult), MIN_TARIF);
    let finalMatchedZone = null;

    // Calcul asynchrone de la zone basé sur la distance réelle
    const prepare = async () => {
      if (clientAddress?.lat && proUser?.address?.rue) {
        try {
          const q = [proUser.address.rue, proUser.address.codePostal, proUser.address.ville].filter(Boolean).join(', ');
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=be`,
            { headers: { 'User-Agent': 'SOSDepannApp/1.0' } }
          );
          const data = await res.json();
          if (data[0]) {
            const proLat = parseFloat(data[0].lat);
            const proLng = parseFloat(data[0].lon);
            const distKm = haversineKm(clientAddress.lat, clientAddress.lng, proLat, proLng);
            const sorted = [...radiusTiers].sort((a, b) => a.to - b.to);
            const zone = sorted.find(t => distKm <= t.to) || sorted[sorted.length - 1];
            if (zone) {
              finalMatchedZone = { ...zone, distKm: Math.round(distKm * 10) / 10 };
              finalDeposit = Math.max(Math.round(zone.price * urgencyObj.mult), MIN_TARIF);
            }
          }
        } catch {}
      }
      // Stocker la demande enrichie pour que le pro puisse la consulter
      setClientRequest({ catId, urgency, answers, description, photos, clientLocation, clientPhone, clientEmail, deposit: finalDeposit, matchedZone: finalMatchedZone });
    };

    prepare(); // démarre en parallèle (se termine bien avant les 3,6 s de l'intervalle)

    let i = 0;
    const iv = setInterval(async () => {
      i++;
      if (i < MSGS.length) {
        setMsgIdx(i);
      } else {
        clearInterval(iv);
        await sendProRequestNotification({
          catLabel: cat.label,
          urgencyLabel: urgencyObj.label,
          clientLocation,
          catId,
          urgencyId: urgency,
          deposit: finalDeposit,
        });
        setActiveSearch({ catId, urgency, answers, description, photos, clientAddress, clientPhone, clientEmail });
        navigation.replace('ProAlert', { catId, urgency, answers });
      }
    }, 900);

    Animated.timing(barAnim, { toValue: 1, duration: 3600, useNativeDriver: false }).start();

    return () => clearInterval(iv);
  }, []);

  const barWidth = barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.container}>
      {/* Radar */}
      <View style={styles.radar}>
        <RadarRing />
        <View style={styles.dot} />
      </View>

      <Text style={styles.title}>Recherche en cours</Text>
      <Text style={styles.msg}>{MSGS[msgIdx]}</Text>

      {/* Step dots */}
      <View style={styles.steps}>
        {MSGS.map((m, i) => (
          <View key={i} style={[styles.stepDot, i <= msgIdx && styles.stepDotActive]} />
        ))}
      </View>

      <View style={styles.barWrap}>
        <Animated.View style={[styles.barFill, { width: barWidth }]} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <MaterialCommunityIcons name="shield-check-outline" size={13} color={BRAND.textMuted} />
        <Text style={styles.hint}>Pros certifiés · Assurés · Notés</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  radar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#BFDBFE',
    marginBottom: 32,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0891B2',
  },
  title: {
    fontFamily: F.groteskBold,
    fontSize: 22,
    color: '#0F172A',
    marginBottom: 10,
  },
  msg: {
    fontFamily: F.regular,
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
    textAlign: 'center',
  },
  steps: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  stepDotActive: {
    backgroundColor: '#0891B2',
  },
  barWrap: {
    width: 220,
    height: 3,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  barFill: {
    height: 3,
    backgroundColor: '#0891B2',
    borderRadius: 3,
  },
  hint: {
    fontFamily: F.regular,
    fontSize: 12,
    color: '#94A3B8',
  },
});
