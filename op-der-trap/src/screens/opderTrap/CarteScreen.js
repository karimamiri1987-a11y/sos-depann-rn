import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CARTE_CATEGORIES, CARTE_ITEMS } from '../../data/opderTrap/carteData';
import { ODT } from '../../constants/brand';

const AMBER = '#92400E';
const HEADER_BG = '#3D1F07';

export default function CarteScreen() {
  const [activeCategory, setActiveCategory] = useState('bieres');
  const scrollRef = useRef(null);

  const items = CARTE_ITEMS[activeCategory] || [];

  return (
    <View style={{ flex: 1, backgroundColor: ODT.cream }}>
      <StatusBar barStyle="light-content" backgroundColor={HEADER_BG} />

      {/* Header */}
      <LinearGradient colors={[HEADER_BG, '#5C2D0A']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.cafeLabel}>☕ Op der Trap · Martelange</Text>
              <Text style={styles.headerTitle}>La Carte</Text>
              <Text style={styles.headerSub}>Boissons · Cuisine · Desserts</Text>
            </View>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>📋</Text>
            </View>
          </View>
        </SafeAreaView>

        {/* Category tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {CARTE_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.tab, activeCategory === cat.id && styles.tabActive]}
              onPress={() => { setActiveCategory(cat.id); scrollRef.current?.scrollTo({ y: 0 }); }}
            >
              <Text style={styles.tabIcon}>{cat.icon}</Text>
              <Text style={[styles.tabLabel, activeCategory === cat.id && styles.tabLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Items list */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>
            {CARTE_CATEGORIES.find(c => c.id === activeCategory)?.icon}{' '}
            {CARTE_CATEGORIES.find(c => c.id === activeCategory)?.label}
          </Text>
          <Text style={styles.categoryCount}>{items.length} articles</Text>
        </View>

        {items.map((item, i) => (
          <View key={i} style={[styles.itemCard, i === items.length - 1 && styles.itemCardLast]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDesc}>{item.desc}</Text>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.priceText}>{item.price}</Text>
            </View>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🌿 Produits frais · Cuisine maison · Prix TTC · Service compris
          </Text>
          <Text style={styles.footerText2}>
            Nous contacter pour tout événement privé ou groupe
          </Text>
          <Text style={styles.footerPhone}>📞 +32 63 xx xx xx</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 0 },
  headerContent: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
  },
  cafeLabel: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 4 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 2 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  logoCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji: { fontSize: 26 },

  tabsContent: { paddingHorizontal: 12, paddingBottom: 14, gap: 8 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  tabActive: { backgroundColor: ODT.gold, borderColor: ODT.gold },
  tabIcon: { fontSize: 14 },
  tabLabel: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  tabLabelActive: { color: '#3D1F07' },

  content: { padding: 16, paddingBottom: 32 },

  categoryHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14,
  },
  categoryTitle: { fontSize: 18, fontWeight: '800', color: ODT.dark },
  categoryCount: { fontSize: 12, color: ODT.gray, fontWeight: '600' },

  itemCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 2,
    borderBottomWidth: 1, borderBottomColor: ODT.border,
    gap: 12,
  },
  itemCardLast: { borderBottomWidth: 0 },
  itemName: { fontSize: 14, fontWeight: '700', color: ODT.dark, marginBottom: 3 },
  itemDesc: { fontSize: 12, color: ODT.gray, lineHeight: 17 },
  priceBox: {
    backgroundColor: ODT.primary,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    minWidth: 58, alignItems: 'center',
  },
  priceText: { fontSize: 13, fontWeight: '800', color: ODT.gold },

  footer: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 14, padding: 18,
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  footerText: { fontSize: 12, color: ODT.gray, textAlign: 'center', fontStyle: 'italic', marginBottom: 6 },
  footerText2: { fontSize: 12, color: ODT.dark, textAlign: 'center', marginBottom: 8 },
  footerPhone: { fontSize: 16, fontWeight: '700', color: ODT.primary },
});
