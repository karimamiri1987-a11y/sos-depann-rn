import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { F, BRAND } from '../constants/data';
import { useApp } from '../context/AppContext';

export default function SplashScreen({ navigation }) {
  const { proUser } = useApp();
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  const load  = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 700, useNativeDriver: true }),
      Animated.timing(load,  { toValue: 0, duration: 2100, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => {
      navigation.replace(proUser ? 'ProDashboard' : 'Home');
    }, 2400);
    return () => clearTimeout(t);
  }, []);

  return (
    <LinearGradient colors={['#0C1525', '#0F2744', '#0891B2']} style={styles.container}>
      <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], alignItems: 'center' }}>

        {/* Logo mark */}
        <View style={styles.logoMark}>
          <MaterialCommunityIcons name="wrench" size={40} color="#fff" />
        </View>

        {/* Brand name */}
        <Text style={styles.title}>SOS Dépann'</Text>
        <Text style={styles.sub}>Un pro à votre porte en minutes</Text>

        {/* Load bar */}
        <View style={styles.barWrap}>
          <Animated.View style={[styles.barFill, { transform: [{ translateX: load }] }]} />
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>Fiable · Rapide · Garanti</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoMark: {
    width: 88,
    height: 88,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  title: {
    fontFamily: F.groteskBold,
    fontSize: 34,
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  sub: {
    fontFamily: F.regular,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    marginBottom: 36,
  },
  barWrap: {
    width: 180,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  barFill: {
    width: 180,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  tagline: {
    fontFamily: F.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
