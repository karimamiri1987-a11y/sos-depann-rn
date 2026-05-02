import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COMMISSION_RATE, URGENCY_LEVELS, F, BRAND } from '../constants/data';

export default function DepositConfirmedScreen({ route, navigation }) {
  const { pro, estimate, deposit, urgency, scheduledDate, scheduledTime } = route.params;
  const commission = Math.round(deposit * COMMISSION_RATE);
  const currentUrgency = URGENCY_LEVELS.find(u => u.id === urgency);
  const hasSchedule = scheduledDate && scheduledTime;
  const isUrgent = urgency === 'journee' || urgency === 'express';
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, tension: 40, friction: 6, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 24, paddingBottom: 60 }}>

        {/* Check */}
        <Animated.View style={[styles.checkCircle, { transform: [{ scale }] }]}>
          <MaterialCommunityIcons name="check-bold" size={36} color="#fff" />
        </Animated.View>

        <Text style={styles.title}>Acompte versé !</Text>
        <Text style={{ fontFamily: F.regular, color: '#64748B', fontSize: 14, marginBottom: 28 }}>
          {hasSchedule ? `Intervention planifiée avec ${pro.name}` : `${pro.name} est en route`}
        </Text>

        {/* Booking Card */}
        <View style={styles.card}>

          {/* ETA ou Date planifiée */}
          {hasSchedule ? (
            <LinearGradient
              colors={['#EFF6FF', '#F8FAFC']}
              style={styles.etaRow}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <View style={[styles.etaIcon, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                <MaterialCommunityIcons name="calendar-check" size={22} color="#0891B2" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#94A3B8' }}>Intervention planifiée</Text>
                <Text style={{ fontFamily: F.groteskBold, fontSize: 18, color: '#0F172A' }}>{scheduledDate}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <MaterialCommunityIcons name="clock-outline" size={13} color="#0891B2" />
                  <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#0891B2' }}>{scheduledTime}</Text>
                </View>
              </View>
            </LinearGradient>
          ) : (
            <LinearGradient
              colors={['#0891B220', '#F1F5F9']}
              style={styles.etaRow}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <View style={styles.etaIcon}>
                <MaterialCommunityIcons name="car-wrench" size={22} color="#0891B2" />
              </View>
              <View>
                <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#94A3B8' }}>Arrivée estimée</Text>
                <Text style={{ fontFamily: F.groteskBold, fontSize: 26, color: '#0F172A' }}>{pro.time}</Text>
              </View>
            </LinearGradient>
          )}

          <View style={{ height: 1, backgroundColor: '#E2E8F0', marginVertical: 14 }} />

          {[
            { l: 'Acompte payé',                              v: `${deposit}€`,      vc: '#22C55E',   icon: 'check-circle-outline' },
            { l: `Dont commission (${(COMMISSION_RATE*100).toFixed(0)}%)`, v: `${commission}€`, vc: '#94A3B8', icon: 'percent-outline' },
            { l: 'Reste à payer au pro',                      v: `${estimate - deposit}€`, vc: '#F59E0B', icon: 'cash-clock' },
          ].map((r, i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                <MaterialCommunityIcons name={r.icon} size={14} color={r.vc} />
                <Text style={{ fontFamily: F.regular, fontSize: 13, color: '#64748B' }}>{r.l}</Text>
              </View>
              <Text style={{ fontFamily: F.bold, fontSize: 13, color: r.vc }}>{r.v}</Text>
            </View>
          ))}

          <View style={{ height: 1, backgroundColor: '#E2E8F0', marginVertical: 10 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: F.bold, fontSize: 14, color: '#0F172A' }}>Total intervention</Text>
            <Text style={{ fontFamily: F.groteskBold, fontSize: 22, color: '#0891B2' }}>{estimate}€</Text>
          </View>

          {/* Garantie */}
          <View style={styles.garantie}>
            <View style={styles.garantieIcon}>
              <MaterialCommunityIcons name="shield-check" size={20} color={'#F59E0B'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#0F172A' }}>Garantie SOS</Text>
              <Text style={{ fontFamily: F.regular, fontSize: 11, color: '#64748B', marginTop: 2 }}>
                Satisfait ou re-intervention gratuite
              </Text>
            </View>
            <TouchableOpacity style={styles.garantieBtn}>
              <Text style={{ color: '#fff', fontSize: 12, fontFamily: F.bold }}>+4,99€</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={() => navigation.replace('Home')} style={styles.homeBtn} activeOpacity={0.85}>
          <Ionicons name="home-outline" size={18} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 15, fontFamily: F.bold }}>Retour à l'accueil</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    color: '#0F172A',
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 14,
    padding: 14,
    marginBottom: 4,
  },
  etaIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0891B2' + '20',
    borderWidth: 1,
    borderColor: '#0891B2' + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  garantie: {
    marginTop: 16,
    backgroundColor: '#F59E0B' + '10',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B' + '30',
    gap: 10,
  },
  garantieIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F59E0B' + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  garantieBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0891B2',
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    width: '100%',
    maxWidth: 360,
    elevation: 3,
    shadowColor: '#0891B2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
