import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, TextInput, Modal, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { F } from '../constants/data';

// ── Category icon renderer ────────────────────────────────────────
export function CatIcon({ cat, size = 24, color }) {
  const c = color || cat.color;
  if (cat.iconLib === 'MaterialCommunityIcons') {
    return <MaterialCommunityIcons name={cat.iconName} size={size} color={c} />;
  }
  return <Ionicons name={cat.iconName} size={size} color={c} />;
}

// ── Urgency icon renderer ─────────────────────────────────────────
export function UrgencyIcon({ urgency, size = 20, color }) {
  const c = color || urgency.color;
  return <MaterialCommunityIcons name={urgency.iconName} size={size} color={c} />;
}

// ── Star rating ───────────────────────────────────────────────────
export function StarRating({ rating, size = 14 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[1,2,3,4,5].map(s => (
        <MaterialCommunityIcons
          key={s}
          name={s <= Math.round(rating) ? 'star' : 'star-outline'}
          size={size}
          color={s <= Math.round(rating) ? '#F59E0B' : '#334155'}
        />
      ))}
    </View>
  );
}

// ── Avatar with initials ──────────────────────────────────────────
export function Avatar({ name, size = 48, premium }) {
  const COLORS = ["#0891B2","#7C3AED","#DC2626","#16A34A","#D97706","#E11D48"];
  const i = name.charCodeAt(0) % COLORS.length;
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: COLORS[i],
      justifyContent: 'center', alignItems: 'center',
      borderWidth: premium ? 2 : 0, borderColor: '#F59E0B',
    }}>
      <Text style={{ color: '#fff', fontFamily: F.groteskBold, fontSize: size * 0.36 }}>{initials}</Text>
      {premium && (
        <View style={{
          position: 'absolute', bottom: -4, right: -4,
          backgroundColor: '#F59E0B', borderRadius: 10, width: 18, height: 18,
          justifyContent: 'center', alignItems: 'center',
        }}>
          <MaterialCommunityIcons name="crown" size={10} color="#fff" />
        </View>
      )}
    </View>
  );
}

// ── Animated green pulsing dot ────────────────────────────────────
export function PulsingDot() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale,   { toValue: 2.2, duration: 1500, useNativeDriver: true }),
          Animated.timing(scale,   { toValue: 1,   duration: 0,    useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0,   duration: 1500, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.4, duration: 0,    useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={{ width: 12, height: 12, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View style={{
        position: 'absolute', width: 10, height: 10, borderRadius: 5,
        backgroundColor: '#22C55E', opacity, transform: [{ scale }],
      }} />
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E' }} />
    </View>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────
export function Toggle({ on, onToggle, size = 'normal' }) {
  const w    = size === 'small' ? 36 : 44;
  const h    = size === 'small' ? 20 : 24;
  const k    = size === 'small' ? 16 : 20;
  const dest = w - k - 4;
  const anim = useRef(new Animated.Value(on ? dest : 2)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: on ? dest : 2, duration: 200, useNativeDriver: true }).start();
  }, [on]);

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.8}
      style={{ width: w, height: h, borderRadius: h / 2, backgroundColor: on ? '#22C55E' : '#334155', justifyContent: 'center' }}>
      <Animated.View style={{
        width: k, height: k, borderRadius: k / 2, backgroundColor: '#fff',
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3,
        transform: [{ translateX: anim }],
      }} />
    </TouchableOpacity>
  );
}

// ── Radar ring (animated) ─────────────────────────────────────────
export function RadarRing() {
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale,   { toValue: 2, duration: 1500, useNativeDriver: true }),
          Animated.timing(scale,   { toValue: 1, duration: 0,    useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.5, duration: 0,  useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute', width: 120, height: 120, borderRadius: 60,
      borderWidth: 2, borderColor: '#0891B2', opacity, transform: [{ scale }],
    }} />
  );
}

// ── Saisie d'adresse avec autocomplétion Nominatim (Belgique) ─────────────────
export function AddressAutocomplete({ value = {}, onChange, editable = true }) {
  const [visible,    setVisible]    = useState(false);
  const [query,      setQuery]      = useState('');
  const [results,    setResults]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const debounceRef                 = useRef(null);

  const isConfirmed = !!(value.rue && value.codePostal && value.ville);

  const update = (field, val) => { if (editable) onChange({ ...value, [field]: val }); };

  const openSearch = () => {
    if (!editable) return;
    setQuery([value.rue, value.codePostal, value.ville].filter(Boolean).join(' '));
    setResults([]);
    setVisible(true);
  };

  const search = (text) => {
    setQuery(text);
    clearTimeout(debounceRef.current);
    if (text.length < 3) { setResults([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=6&countrycodes=be&addressdetails=1`,
          { headers: { 'User-Agent': 'SOSDepannApp/1.0', 'Accept-Language': 'fr' } }
        );
        setResults(await res.json());
      } catch { setResults([]); }
      finally   { setLoading(false); }
    }, 450);
  };

  const pick = (item) => {
    const a = item.address || {};
    onChange({
      rue:        [a.road || a.pedestrian, a.house_number].filter(Boolean).join(' ') || value.rue || '',
      codePostal: a.postcode || value.codePostal || '',
      ville:      a.city || a.town || a.village || a.municipality || value.ville || '',
    });
    setVisible(false);
  };

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={addrSt.label}>Adresse</Text>

      {/* Bouton de recherche / état vide */}
      {!isConfirmed && (
        <TouchableOpacity
          onPress={openSearch}
          activeOpacity={editable ? 0.75 : 1}
          style={[addrSt.searchTrigger, !editable && addrSt.triggerDisabled]}>
          <Ionicons name="search" size={16} color={editable ? '#0891B2' : '#94A3B8'} />
          <Text style={[addrSt.triggerText, !editable && { color: '#94A3B8' }]}>
            {editable ? 'Rechercher une adresse...' : 'Aucune adresse renseignée'}
          </Text>
          {editable && <Ionicons name="chevron-forward" size={16} color="#94A3B8" />}
        </TouchableOpacity>
      )}

      {/* Adresse confirmée */}
      {isConfirmed && (
        <View style={addrSt.confirmedCard}>
          <MaterialCommunityIcons name="map-marker-check" size={20} color="#22C55E" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 14, color: '#0F172A' }}>{value.rue}</Text>
            <Text style={{ fontFamily: F.regular, fontSize: 13, color: '#64748B', marginTop: 2 }}>
              {value.codePostal}  {value.ville}
            </Text>
          </View>
          {editable && (
            <TouchableOpacity onPress={openSearch} style={addrSt.editBtn}>
              <Ionicons name="pencil" size={14} color="#0891B2" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Champs éditables rue / CP / ville (après confirmation) */}
      {editable && isConfirmed && (
        <View style={{ marginTop: 10, gap: 8 }}>
          <View style={addrSt.field}>
            <TextInput
              value={value.rue}
              onChangeText={v => update('rue', v)}
              placeholder="Rue et numéro"
              placeholderTextColor="#94A3B8"
              style={{ fontFamily: F.medium, fontSize: 14, color: '#0F172A' }}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={[addrSt.field, { width: 100 }]}>
              <TextInput
                value={value.codePostal}
                onChangeText={v => update('codePostal', v.replace(/\D/g, ''))}
                placeholder="1000"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={4}
                style={{ fontFamily: F.groteskBold, fontSize: 15, color: '#0F172A', textAlign: 'center' }}
              />
            </View>
            <View style={[addrSt.field, { flex: 1 }]}>
              <TextInput
                value={value.ville}
                onChangeText={v => update('ville', v)}
                placeholder="Bruxelles"
                placeholderTextColor="#94A3B8"
                style={{ fontFamily: F.medium, fontSize: 14, color: '#0F172A' }}
              />
            </View>
          </View>
        </View>
      )}

      {/* Modal de recherche */}
      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={addrSt.modalHeader}>
            <TouchableOpacity onPress={() => setVisible(false)} style={{ padding: 4 }}>
              <Ionicons name="arrow-back" size={22} color="#0891B2" />
            </TouchableOpacity>
            <Text style={{ fontFamily: F.groteskBold, fontSize: 17, color: '#0F172A' }}>
              Rechercher une adresse
            </Text>
          </View>

          <View style={addrSt.searchWrap}>
            <Ionicons name="search" size={16} color="#0891B2" />
            <TextInput
              value={query}
              onChangeText={search}
              autoFocus
              placeholder="Ex : Rue de la Loi 16, Bruxelles"
              placeholderTextColor="#94A3B8"
              style={{ flex: 1, fontFamily: F.medium, fontSize: 15, color: '#0F172A', paddingHorizontal: 10 }}
            />
            {loading
              ? <ActivityIndicator size="small" color="#0891B2" />
              : query
                ? <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                : null}
          </View>

          <ScrollView keyboardShouldPersistTaps="always">
            {results.map((item, i) => {
              const a    = item.address || {};
              const rue  = [a.road || a.pedestrian, a.house_number].filter(Boolean).join(' ') || item.display_name.split(', ')[0];
              const cp   = a.postcode || '';
              const city = a.city || a.town || a.village || a.municipality || '';
              return (
                <TouchableOpacity key={i} onPress={() => pick(item)} style={addrSt.resultItem}>
                  <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#0891B215', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                    <Ionicons name="location-outline" size={18} color="#0891B2" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: F.bold, fontSize: 14, color: '#0F172A' }}>{rue}</Text>
                    <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                      {[cp, city].filter(Boolean).join('  ')}
                    </Text>
                  </View>
                  {cp ? (
                    <View style={{ backgroundColor: '#0891B215', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#0891B230', marginLeft: 8 }}>
                      <Text style={{ fontFamily: F.bold, fontSize: 11, color: '#0891B2' }}>{cp}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
            {query.length >= 3 && results.length === 0 && !loading && (
              <View style={{ alignItems: 'center', padding: 40 }}>
                <MaterialCommunityIcons name="map-search-outline" size={42} color="#94A3B8" />
                <Text style={{ fontFamily: F.regular, color: '#94A3B8', marginTop: 10 }}>
                  Aucun résultat trouvé
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const addrSt = StyleSheet.create({
  label:          { fontFamily: F.semibold, fontSize: 13, color: '#0F172A', marginBottom: 6 },
  searchTrigger:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, gap: 8 },
  triggerDisabled:{ backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  triggerText:    { fontFamily: F.regular, fontSize: 14, color: '#0891B2', flex: 1 },
  confirmedCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderRadius: 12, borderWidth: 1.5, borderColor: '#BBF7D0', padding: 14 },
  editBtn:        { width: 32, height: 32, borderRadius: 10, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  field:          { backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  modalHeader:    { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  searchWrap:     { flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14, paddingVertical: 12 },
  resultItem:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
});
