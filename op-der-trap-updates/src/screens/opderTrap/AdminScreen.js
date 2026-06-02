import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ODT } from '../../constants/brand';
import { useMenu } from '../../context/MenuContext';

const PIN_LENGTH = 4;

export default function AdminScreen({ navigation }) {
  const { adminPin, loading, lastSync, refresh,
          adminUpdate, adminUpdateSetting,
          menu, formules, desserts, plats, events, tarifBowling } = useMenu();

  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [section, setSection] = useState('menu'); // menu | formules | events | tarifs
  const [saving, setSaving] = useState(false);

  // ── Écran PIN ───────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <View style={{ flex: 1, backgroundColor: ODT.cream }}>
        <StatusBar barStyle="light-content" backgroundColor={ODT.primary} />
        <View style={[styles.header, { backgroundColor: ODT.primary }]}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Administration</Text>
              <View style={{ width: 38 }} />
            </View>
          </SafeAreaView>
        </View>
        <View style={styles.pinContainer}>
          <Ionicons name="lock-closed" size={48} color={ODT.primary} />
          <Text style={styles.pinTitle}>Code administrateur</Text>
          <Text style={styles.pinSub}>Entrez votre code PIN pour accéder au dashboard</Text>
          <View style={styles.pinDots}>
            {[0,1,2,3].map(i => (
              <View key={i} style={[styles.pinDot, pin.length > i && styles.pinDotFilled]} />
            ))}
          </View>
          <View style={styles.pinGrid}>
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.pinKey, k === '' && { opacity: 0 }]}
                onPress={() => {
                  if (k === '') return;
                  if (k === '⌫') { setPin(p => p.slice(0, -1)); return; }
                  const next = pin + k;
                  setPin(next);
                  if (next.length === PIN_LENGTH) {
                    if (next === adminPin) { setUnlocked(true); setPin(''); }
                    else {
                      Alert.alert('Code incorrect', 'Veuillez réessayer.');
                      setTimeout(() => setPin(''), 300);
                    }
                  }
                }}
                disabled={k !== '⌫' && pin.length >= PIN_LENGTH}
              >
                <Text style={styles.pinKeyText}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: ODT.cream }}>
      <StatusBar barStyle="light-content" backgroundColor={ODT.primary} />
      <View style={[styles.header, { backgroundColor: ODT.primary }]}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <TouchableOpacity onPress={refresh} style={styles.refreshBtn}>
              <Ionicons name="refresh" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          {lastSync && (
            <Text style={styles.syncText}>
              Synchro : {lastSync.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </SafeAreaView>
      </View>

      {/* Onglets */}
      <View style={styles.tabs}>
        {[
          { key: 'menu',     label: 'Menu',      icon: 'calendar' },
          { key: 'formules', label: 'Formules',  icon: 'restaurant' },
          { key: 'events',   label: 'Événements',icon: 'star' },
          { key: 'tarifs',   label: 'Tarifs',    icon: 'cash' },
        ].map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, section === t.key && styles.tabActive]}
            onPress={() => setSection(t.key)}
          >
            <Ionicons name={t.icon} size={16} color={section === t.key ? ODT.primary : ODT.gray} />
            <Text style={[styles.tabText, section === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── MENU DE LA SEMAINE ── */}
        {section === 'menu' && (
          <>
            <Text style={styles.sectionTitle}>📅 Menu de la semaine</Text>
            <Text style={styles.sectionHint}>Modifiez et appuyez sur Enregistrer</Text>
            {menu.map((day, idx) => (
              <MenuDayCard
                key={day.id}
                day={day}
                onSave={async (updated) => {
                  setSaving(true);
                  try {
                    await adminUpdate('menu_semaine', {
                      id: updated.id,
                      jour: updated.jour,
                      date_str: updated.date,
                      entree: updated.entree,
                      plat: updated.plat,
                      ordre: idx + 1,
                    });
                    Alert.alert('✅ Enregistré', `Menu ${updated.jour} mis à jour.`);
                  } catch (e) {
                    Alert.alert('Erreur', 'La sauvegarde a échoué. Vérifiez votre connexion.');
                  } finally { setSaving(false); }
                }}
              />
            ))}
          </>
        )}

        {/* ── FORMULES ── */}
        {section === 'formules' && (
          <>
            <Text style={styles.sectionTitle}>🍽️ Formules & prix</Text>
            <Text style={styles.sectionHint}>Modifiez le nom, la description ou le prix</Text>
            {formules.map((f) => (
              <FormuleCard
                key={f.id}
                item={f}
                onSave={async (updated) => {
                  setSaving(true);
                  try {
                    await adminUpdate('formules', {
                      id: updated.id, name: updated.name,
                      desc_fr: updated.desc, price: updated.price, icon: updated.icon,
                    });
                    Alert.alert('✅ Enregistré', `${updated.name} mis à jour.`);
                  } catch { Alert.alert('Erreur', 'La sauvegarde a échoué.'); }
                  finally { setSaving(false); }
                }}
              />
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>🍨 Desserts</Text>
            {[...( desserts.suggestions || []), ...(desserts.classiques || [])].map((d) => (
              <DessertCard
                key={d.id}
                item={d}
                onSave={async (updated) => {
                  setSaving(true);
                  try {
                    await adminUpdate('desserts', {
                      id: updated.id, name: updated.name,
                      desc_fr: updated.desc, price: updated.price,
                    });
                    Alert.alert('✅ Enregistré', `${updated.name} mis à jour.`);
                  } catch { Alert.alert('Erreur', 'La sauvegarde a échoué.'); }
                  finally { setSaving(false); }
                }}
              />
            ))}
          </>
        )}

        {/* ── ÉVÉNEMENTS ── */}
        {section === 'events' && (
          <>
            <Text style={styles.sectionTitle}>🎉 Événements</Text>
            <Text style={styles.sectionHint}>Titre, date, prix, places restantes</Text>
            {events.map((ev) => (
              <EventCard
                key={ev.id}
                item={ev}
                onSave={async (updated) => {
                  setSaving(true);
                  try {
                    await adminUpdate('events', {
                      id: updated.id, title: updated.title,
                      date_str: updated.date, time_str: updated.time,
                      desc_fr: updated.desc, price: updated.price,
                      spots: updated.spots, icon: updated.icon, color: updated.color,
                    });
                    Alert.alert('✅ Enregistré', `${updated.title} mis à jour.`);
                  } catch { Alert.alert('Erreur', 'La sauvegarde a échoué.'); }
                  finally { setSaving(false); }
                }}
              />
            ))}
          </>
        )}

        {/* ── TARIFS & RÉGLAGES ── */}
        {section === 'tarifs' && (
          <TarifsSection
            tarifBowling={tarifBowling}
            onSaveTarif={async (val) => {
              setSaving(true);
              try {
                await adminUpdateSetting('tarif_bowling_heure', String(val));
                Alert.alert('✅ Enregistré', 'Tarif bowling mis à jour.');
              } catch { Alert.alert('Erreur', 'La sauvegarde a échoué.'); }
              finally { setSaving(false); }
            }}
          />
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color={ODT.primary} />
          <Text style={styles.savingText}>Enregistrement…</Text>
        </View>
      )}
    </View>
  );
}

// ── Composants d'édition ──────────────────────────────────────────────────

function MenuDayCard({ day, onSave }) {
  const [entree, setEntree] = useState(day.entree);
  const [plat, setPlat] = useState(day.plat);
  const [date, setDate] = useState(day.date);
  const dirty = entree !== day.entree || plat !== day.plat || date !== day.date;
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{day.jour}</Text>
      <FieldRow label="Date" value={date} onChange={setDate} />
      <FieldRow label="Entrée" value={entree} onChange={setEntree} />
      <FieldRow label="Plat" value={plat} onChange={setPlat} multiline />
      {dirty && (
        <TouchableOpacity style={styles.saveBtn} onPress={() => onSave({ ...day, entree, plat, date })}>
          <Ionicons name="checkmark-circle" size={16} color="#fff" />
          <Text style={styles.saveBtnText}>Enregistrer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function FormuleCard({ item, onSave }) {
  const [name, setName] = useState(item.name);
  const [desc, setDesc] = useState(item.desc);
  const [price, setPrice] = useState(item.price);
  const dirty = name !== item.name || desc !== item.desc || price !== item.price;
  return (
    <View style={styles.card}>
      <Text style={styles.cardIcon}>{item.icon}</Text>
      <FieldRow label="Nom" value={name} onChange={setName} />
      <FieldRow label="Description" value={desc} onChange={setDesc} multiline />
      <FieldRow label="Prix (ex: 15,50 €)" value={price} onChange={setPrice} />
      {dirty && (
        <TouchableOpacity style={styles.saveBtn} onPress={() => onSave({ ...item, name, desc, price })}>
          <Ionicons name="checkmark-circle" size={16} color="#fff" />
          <Text style={styles.saveBtnText}>Enregistrer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function DessertCard({ item, onSave }) {
  const [name, setName] = useState(item.name);
  const [desc, setDesc] = useState(item.desc);
  const [price, setPrice] = useState(item.price);
  const dirty = name !== item.name || desc !== item.desc || price !== item.price;
  return (
    <View style={styles.card}>
      <FieldRow label="Nom" value={name} onChange={setName} />
      <FieldRow label="Description" value={desc} onChange={setDesc} multiline />
      <FieldRow label="Prix (ex: 8,00 €)" value={price} onChange={setPrice} />
      {dirty && (
        <TouchableOpacity style={styles.saveBtn} onPress={() => onSave({ ...item, name, desc, price })}>
          <Ionicons name="checkmark-circle" size={16} color="#fff" />
          <Text style={styles.saveBtnText}>Enregistrer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function EventCard({ item, onSave }) {
  const [title, setTitle] = useState(item.title);
  const [date, setDate] = useState(item.date);
  const [time, setTime] = useState(item.time);
  const [desc, setDesc] = useState(item.desc);
  const [price, setPrice] = useState(item.price);
  const [spots, setSpots] = useState(item.spots);
  const dirty = title !== item.title || date !== item.date || time !== item.time
    || desc !== item.desc || price !== item.price || spots !== item.spots;
  return (
    <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: item.color }]}>
      <Text style={styles.cardIcon}>{item.icon}</Text>
      <FieldRow label="Titre" value={title} onChange={setTitle} />
      <FieldRow label="Date (ex: Vendredi 13 Juin 2026)" value={date} onChange={setDate} />
      <FieldRow label="Heure (ex: 20:00)" value={time} onChange={setTime} />
      <FieldRow label="Description" value={desc} onChange={setDesc} multiline />
      <FieldRow label="Prix (ex: 5€ / pers.)" value={price} onChange={setPrice} />
      <FieldRow label="Places restantes (ex: 8 équipes)" value={spots} onChange={setSpots} />
      {dirty && (
        <TouchableOpacity style={styles.saveBtn} onPress={() => onSave({ ...item, title, date, time, desc, price, spots })}>
          <Ionicons name="checkmark-circle" size={16} color="#fff" />
          <Text style={styles.saveBtnText}>Enregistrer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function TarifsSection({ tarifBowling, onSaveTarif }) {
  const [tarif, setTarif] = useState(String(tarifBowling));
  const dirty = tarif !== String(tarifBowling);
  return (
    <>
      <Text style={styles.sectionTitle}>🎳 Tarif bowling</Text>
      <View style={styles.card}>
        <FieldRow label="Prix par heure par personne (€)" value={tarif} onChange={setTarif} keyboardType="numeric" />
        {dirty && (
          <TouchableOpacity style={styles.saveBtn} onPress={() => onSaveTarif(parseFloat(tarif) || 8)}>
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
            <Text style={styles.saveBtnText}>Enregistrer</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

function FieldRow({ label, value, onChange, multiline, keyboardType }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
        value={value}
        onChangeText={onChange}
        multiline={!!multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType || 'default'}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: { paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10 },
  backBtn: { padding: 4, width: 38 },
  refreshBtn: { padding: 4, width: 38, alignItems: 'flex-end' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: '#fff' },
  syncText: { textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },

  // PIN
  pinContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  pinTitle: { fontSize: 22, fontWeight: '800', color: ODT.dark, marginTop: 20, marginBottom: 8 },
  pinSub: { fontSize: 13, color: ODT.gray, textAlign: 'center', marginBottom: 32 },
  pinDots: { flexDirection: 'row', gap: 16, marginBottom: 40 },
  pinDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: ODT.border, borderWidth: 2, borderColor: ODT.gray },
  pinDotFilled: { backgroundColor: ODT.primary, borderColor: ODT.primary },
  pinGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 260, gap: 12, justifyContent: 'center' },
  pinKey: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: ODT.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  pinKeyText: { fontSize: 26, fontWeight: '700', color: ODT.dark },

  // Onglets
  tabs: { flexDirection: 'row', backgroundColor: ODT.white, borderBottomWidth: 1, borderBottomColor: ODT.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 3 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: ODT.primary },
  tabText: { fontSize: 10, fontWeight: '700', color: ODT.gray },
  tabTextActive: { color: ODT.primary },

  content: { padding: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: ODT.dark, marginBottom: 4, marginTop: 8 },
  sectionHint: { fontSize: 12, color: ODT.gray, fontStyle: 'italic', marginBottom: 14 },

  card: {
    backgroundColor: ODT.white, borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: ODT.primary, marginBottom: 12 },
  cardIcon: { fontSize: 24, marginBottom: 8 },

  fieldRow: { marginBottom: 12 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: ODT.gray, marginBottom: 4, textTransform: 'uppercase' },
  fieldInput: {
    backgroundColor: ODT.cream, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: ODT.dark, borderWidth: 1.5, borderColor: ODT.border,
  },
  fieldInputMulti: { height: 72, textAlignVertical: 'top' },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: ODT.primary, borderRadius: 12, padding: 12, marginTop: 4,
  },
  saveBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  savingOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  savingText: { fontSize: 14, fontWeight: '700', color: ODT.primary },
});
