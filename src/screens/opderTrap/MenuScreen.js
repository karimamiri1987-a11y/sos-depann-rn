import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MENU_DU_JOUR } from '../../data/opderTrap/menuDuJour';
import { ODT } from '../../constants/brand';

const SECTIONS = [
  { key: 'entrees',  label: 'Entrées',  icon: '🥗', color: '#16A34A' },
  { key: 'plats',    label: 'Plats',    icon: '🍽️', color: '#1B3A2D' },
  { key: 'desserts', label: 'Desserts', icon: '🍮', color: '#C9A84C' },
];

export default function MenuScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: ODT.cream }}>
      <StatusBar barStyle="light-content" backgroundColor={ODT.primary} />

      {/* Header */}
      <LinearGradient colors={[ODT.primary, '#2D5A42']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.cafeLabel}>☕ Op der Trap · Martelange</Text>
              <Text style={styles.headerTitle}>Menu du Jour</Text>
              <View style={styles.dateBadge}>
                <Ionicons name="calendar-outline" size={13} color={ODT.gold} />
                <Text style={styles.dateText}>{MENU_DU_JOUR.date}</Text>
              </View>
            </View>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🍽️</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Formules */}
        <View style={styles.formulesCard}>
          <Text style={styles.formulesTitle}>💶 Nos formules</Text>
          <View style={styles.formulesRow}>
            {MENU_DU_JOUR.formules.map(f => (
              <View
                key={f.id}
                style={[styles.formule, f.popular && styles.formulePop]}
              >
                {f.popular && (
                  <Text style={styles.formulePoplabel}>⭐ Populaire</Text>
                )}
                <Text style={[styles.formuleName, f.popular && { color: ODT.white }]}>
                  {f.name}
                </Text>
                <Text style={[styles.formulePrice, f.popular && { color: ODT.gold }]}>
                  {f.price}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu sections */}
        {SECTIONS.map(section => (
          <View key={section.key} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>{section.icon}</Text>
              <Text style={styles.sectionLabel}>{section.label}</Text>
              <View style={[styles.sectionLine, { backgroundColor: section.color }]} />
            </View>
            {MENU_DU_JOUR[section.key].map((item, i) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemBullet}>
                  <View style={[styles.bullet, { backgroundColor: section.color }]} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.itemNameRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.itemDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* Reservation CTA */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => navigation.navigate('TableReservation')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[ODT.primary, '#2D5A42']}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Ionicons name="calendar-outline" size={22} color={ODT.gold} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.ctaTitle}>Réserver une table</Text>
              <Text style={styles.ctaSub}>Réservation rapide et gratuite</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer note */}
        <Text style={styles.footnote}>
          🌿 Produits frais du marché · Cuisine maison · Menu change chaque jour
        </Text>

        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 20 },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  cafeLabel: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 4 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 6 },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { color: ODT.gold, fontSize: 13, fontWeight: '600' },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 26 },

  content: { padding: 16 },

  formulesCard: {
    backgroundColor: ODT.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  formulesTitle: { fontSize: 14, fontWeight: '700', color: ODT.dark, marginBottom: 12 },
  formulesRow: { flexDirection: 'row', gap: 10 },
  formule: {
    flex: 1,
    backgroundColor: ODT.lightGray,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  formulePop: { backgroundColor: ODT.primary },
  formulePoplabel: { fontSize: 10, color: ODT.gold, fontWeight: '700', marginBottom: 4 },
  formuleName: { fontSize: 11, fontWeight: '700', color: ODT.dark, textAlign: 'center', marginBottom: 4 },
  formulePrice: { fontSize: 15, fontWeight: '900', color: ODT.primary, textAlign: 'center' },

  section: {
    backgroundColor: ODT.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionIcon: { fontSize: 20 },
  sectionLabel: { fontSize: 16, fontWeight: '800', color: ODT.dark },
  sectionLine: { flex: 1, height: 2, borderRadius: 1 },

  itemRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  itemBullet: { width: 20, paddingTop: 5 },
  bullet: { width: 7, height: 7, borderRadius: 4 },
  itemNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 2 },
  itemName: { fontSize: 14, fontWeight: '700', color: ODT.dark },
  badge: {
    backgroundColor: '#FFF9E6',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#FFE066',
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#856404' },
  itemDesc: { fontSize: 12, color: ODT.gray, lineHeight: 17 },

  ctaBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: ODT.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    paddingHorizontal: 20,
  },
  ctaTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  ctaSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  footnote: {
    textAlign: 'center',
    fontSize: 12,
    color: ODT.gray,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
