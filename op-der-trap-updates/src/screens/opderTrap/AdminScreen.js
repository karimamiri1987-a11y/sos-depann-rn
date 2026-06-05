import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ODT } from '../../constants/brand';
import { useMenu } from '../../context/MenuContext';
import { useTDF } from '../../context/TDFContext';
import { supabase } from '../../lib/supabase';

const PIN_LENGTH = 4;

export default function AdminScreen({ navigation }) {
  const { adminPin, loading, lastSync, refresh,
          adminUpdate, adminUpdateSetting,
          menu, formules, desserts, plats, events, tarifBowling, stockLimits } = useMenu();

  const {
    participants: tdfParticipants, hasDraw: tdfHasDraw, isComplete: tdfComplete,
    performDraw, addParticipant: addTDFParticipant, removeParticipant: removeTDFParticipant,
    resetAll: resetTDF, nbRequis: tdfNbRequis,
  } = useTDF();

  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [section, setSection] = useState('menu'); // menu | formules | events | tarifs | tdf
  const [saving, setSaving] = useState(false);

  const handleTDFDraw = () => {
    if (tdfHasDraw) {
      Alert.alert(
        'Refaire le tirage',
        'Cela effacera les attributions actuelles. Continuer ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Refaire', style: 'destructive', onPress: performDraw },
        ]
      );
    } else {
      performDraw();
    }
  };

  const handleTDFReset = () => {
    Alert.alert(
      'Réinitialiser',
      'Supprimer tous les participants, le tirage et les résultats ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Réinitialiser', style: 'destructive', onPress: resetTDF },
      ]
    );
  };

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
          { key: 'menu',     label: 'Menu',    icon: 'calendar' },
          { key: 'formules', label: 'Formule', icon: 'restaurant' },
          { key: 'events',   label: 'Events',  icon: 'star' },
          { key: 'tarifs',   label: 'Tarifs',  icon: 'cash' },
          { key: 'tdf',      label: 'TDF',     icon: 'bicycle' },
          { key: 'notifs',   label: 'Notifs',  icon: 'notifications' },
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
            <StockLimitsSection
              stockLimits={stockLimits}
              onSave={async (rows) => {
                setSaving(true);
                try {
                  await adminUpdate('stock_limits', rows);
                  Alert.alert('✅ Enregistré', 'Stocks mis à jour.');
                } catch { Alert.alert('Erreur', 'La sauvegarde a échoué.'); }
                finally { setSaving(false); }
              }}
            />
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

        {/* ── TOUR DE FRANCE ── */}
        {section === 'tdf' && (
          <TDFAdminSection
            participants={tdfParticipants}
            hasDraw={tdfHasDraw}
            isComplete={tdfComplete}
            nbRequis={tdfNbRequis}
            onAdd={addTDFParticipant}
            onRemove={removeTDFParticipant}
            onDraw={handleTDFDraw}
            onReset={handleTDFReset}
            navigation={navigation}
          />
        )}

        {/* ── NOTIFICATIONS ── */}
        {section === 'notifs' && <NotificationsSection />}

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

// ── Stock par ressource et jour de semaine ────────────────────────────────
const STOCK_RESOURCES = [
  { id: 'menu',      label: 'Menu du jour (Entrée + Plat)', icon: '🍽️' },
  { id: 'spaghetti', label: 'Spaghetti',                    icon: '🍝' },
  { id: 'dessert',   label: 'Dessert du moment',            icon: '🍨' },
];
const STOCK_DAYS = [
  { dow: 2, label: 'Mardi' },
  { dow: 3, label: 'Mercredi' },
  { dow: 4, label: 'Jeudi' },
  { dow: 5, label: 'Vendredi' },
];

function StockLimitsSection({ stockLimits, onSave }) {
  const [limits, setLimits] = useState(() => {
    const init = {};
    STOCK_DAYS.forEach(({ dow }) => {
      init[dow] = {};
      STOCK_RESOURCES.forEach(res => {
        init[dow][res.id] = stockLimits?.[res.id]?.[dow] ?? 0;
      });
    });
    return init;
  });

  const setQty = (dow, resId, delta) =>
    setLimits(prev => ({
      ...prev,
      [dow]: { ...prev[dow], [resId]: Math.max(0, (prev[dow][resId] || 0) + delta) },
    }));

  const dirty = STOCK_DAYS.some(({ dow }) =>
    STOCK_RESOURCES.some(res => limits[dow][res.id] !== (stockLimits?.[res.id]?.[dow] ?? 0))
  );

  const handleSave = () => {
    const rows = [];
    STOCK_DAYS.forEach(({ dow }) => {
      STOCK_RESOURCES.forEach(res => {
        rows.push({ resource_id: res.id, day_of_week: dow, max_count: limits[dow][res.id] });
      });
    });
    onSave(rows);
  };

  return (
    <>
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>📦 Stock disponible par jour</Text>
      <Text style={styles.sectionHint}>0 = COMPLET dès l'ouverture · s'applique à toutes les semaines</Text>
      {STOCK_DAYS.map(({ dow, label }) => (
        <View key={dow} style={styles.card}>
          <Text style={styles.stockDayTitle}>{label}</Text>
          {STOCK_RESOURCES.map((res, i) => {
            const qty = limits[dow]?.[res.id] ?? 0;
            const isComplet = qty === 0;
            return (
              <View
                key={res.id}
                style={[styles.stockResRow, i === STOCK_RESOURCES.length - 1 && { borderBottomWidth: 0 }]}
              >
                <Text style={styles.stockResIcon}>{res.icon}</Text>
                <Text style={styles.stockResLabel} numberOfLines={2}>{res.label}</Text>
                <View style={styles.stockStepper}>
                  <TouchableOpacity
                    style={[styles.stockBtn, isComplet && styles.stockBtnDisabled]}
                    onPress={() => setQty(dow, res.id, -1)}
                    disabled={isComplet}
                  >
                    <Ionicons name="remove" size={14} color={isComplet ? '#ccc' : ODT.primary} />
                  </TouchableOpacity>
                  {isComplet ? (
                    <View style={styles.completBadge}>
                      <Text style={styles.completText}>COMPLET</Text>
                    </View>
                  ) : (
                    <Text style={styles.stockQtyText}>{qty}</Text>
                  )}
                  <TouchableOpacity style={styles.stockBtn} onPress={() => setQty(dow, res.id, 1)}>
                    <Ionicons name="add" size={14} color={ODT.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      ))}
      {dirty && (
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="checkmark-circle" size={16} color="#fff" />
          <Text style={styles.saveBtnText}>Enregistrer les stocks</Text>
        </TouchableOpacity>
      )}
    </>
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

function TDFAdminSection({ participants, hasDraw, isComplete, nbRequis, onAdd, onRemove, onDraw, onReset, navigation }) {
  const [tdfName, setTdfName] = useState('');
  const isFull = participants.length >= nbRequis;
  const pct = Math.min(100, Math.round((participants.length / nbRequis) * 100));

  const handleAdd = () => {
    const trimmed = tdfName.trim();
    if (!trimmed || isFull) return;
    onAdd(trimmed);
    setTdfName('');
  };

  return (
    <>
      <Text style={styles.sectionTitle}>🚴 Tour de France</Text>

      {/* Statut */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={styles.fieldLabel}>Participants inscrits</Text>
          <Text style={{ fontSize: 20, fontWeight: '900', color: isComplete ? '#16A34A' : ODT.primary }}>
            {participants.length} / {nbRequis}
          </Text>
        </View>
        <View style={styles.tdfBar}>
          <View style={[styles.tdfBarFill, { width: `${pct}%`, backgroundColor: isComplete ? '#16A34A' : ODT.primary }]} />
        </View>
        <Text style={{ fontSize: 11, color: ODT.gray, marginTop: 8, fontWeight: '600' }}>
          {hasDraw ? '✅ Tirage effectué' : isComplete ? '🎯 Prêt pour le tirage au sort' : `⏳ ${nbRequis - participants.length} participant(s) manquant(s)`}
        </Text>
      </View>

      {/* Tirage au sort */}
      {isComplete && (
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: '#E30613', marginBottom: 10 }]}
          onPress={onDraw}
        >
          <Ionicons name="shuffle" size={18} color="#fff" />
          <Text style={styles.saveBtnText}>
            {hasDraw ? '🎲 Refaire le tirage au sort' : '🎲 Faire le tirage au sort'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Gérer les étapes */}
      {hasDraw && (
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: '#1A1A2E', marginBottom: 16 }]}
          onPress={() => navigation.navigate('TDFStages', { isAdmin: true })}
        >
          <Ionicons name="flag" size={18} color="#FFCC00" />
          <Text style={styles.saveBtnText}>🏁 Gérer les étapes</Text>
        </TouchableOpacity>
      )}

      {/* Ajouter un participant */}
      {!isFull && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ajouter un participant</Text>
          <FieldRow label="Nom du participant" value={tdfName} onChange={setTdfName} />
          <TouchableOpacity
            style={[styles.saveBtn, !tdfName.trim() && { opacity: 0.4 }]}
            onPress={handleAdd}
            disabled={!tdfName.trim()}
          >
            <Ionicons name="person-add" size={16} color="#fff" />
            <Text style={styles.saveBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Liste des participants */}
      {participants.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 12, fontSize: 14 }]}>
            Liste des participants
          </Text>
          {participants.map((p, idx) => (
            <View key={p.id} style={styles.tdfParticipantRow}>
              <View style={styles.tdfNumBadge}>
                <Text style={styles.tdfNumText}>{idx + 1}</Text>
              </View>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: ODT.dark }}>{p.name}</Text>
              {hasDraw && (
                <Text style={{ fontSize: 14, color: '#16A34A', marginRight: 4 }}>✓</Text>
              )}
              <TouchableOpacity onPress={() => onRemove(p.id)} style={{ padding: 6 }}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      {/* Réinitialiser */}
      {(participants.length > 0 || hasDraw) && (
        <TouchableOpacity style={styles.tdfResetBtn} onPress={onReset}>
          <Ionicons name="warning-outline" size={16} color="#EF4444" />
          <Text style={styles.tdfResetBtnText}>Réinitialiser tout (participants + tirage)</Text>
        </TouchableOpacity>
      )}
    </>
  );
}

function NotificationsSection() {
  const [tokens, setTokens]     = useState([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [sending, setSending]   = useState(false);
  const [title, setTitle]       = useState('');
  const [body, setBody]         = useState('');
  const [mode, setMode]         = useState('all'); // 'all' | 'select'
  const [selected, setSelected] = useState({});    // { [id]: true }

  useEffect(() => {
    setLoadingTokens(true);
    supabase.from('push_tokens').select('*').order('updated_at', { ascending: false })
      .then(({ data }) => setTokens(data || []))
      .catch(() => {})
      .finally(() => setLoadingTokens(false));
  }, []);

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev[id] ? { ...prev, [id]: undefined } : { ...prev, [id]: true }
    );
  };

  const isSelected = (id) => !!selected[id];
  const selectedCount = Object.values(selected).filter(Boolean).length;

  const sendNotifs = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Champs manquants', 'Remplissez le titre et le message.');
      return;
    }
    const targets = mode === 'all' ? tokens : tokens.filter(t => isSelected(t.id));
    if (targets.length === 0) {
      Alert.alert('Aucun destinataire', 'Sélectionnez au moins un appareil.');
      return;
    }
    setSending(true);
    try {
      const messages = targets.map(t => ({
        to: t.token,
        title: title.trim(),
        body: body.trim(),
        sound: 'default',
        data: { source: 'admin' },
      }));
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(messages),
      });
      const json = await res.json();
      const errors = (json.data || []).filter(d => d.status === 'error');
      if (errors.length > 0) {
        Alert.alert('Envoi partiel', `${targets.length - errors.length}/${targets.length} notification(s) envoyée(s).`);
      } else {
        Alert.alert('✅ Envoyé', `${targets.length} notification(s) envoyée(s).`);
        setTitle('');
        setBody('');
        setSelected({});
      }
    } catch {
      Alert.alert('Erreur', "L'envoi a échoué. Vérifiez votre connexion.");
    } finally { setSending(false); }
  };

  return (
    <>
      <Text style={styles.sectionTitle}>🔔 Notifications push</Text>
      <Text style={styles.sectionHint}>{tokens.length} appareil(s) enregistré(s)</Text>

      {/* Rédaction */}
      <View style={styles.card}>
        <FieldRow label="Titre" value={title} onChange={setTitle} />
        <FieldRow label="Message" value={body} onChange={setBody} multiline />
      </View>

      {/* Destinataires */}
      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Destinataires</Text>
        <View style={styles.notifModeRow}>
          <TouchableOpacity
            style={[styles.notifModeBtn, mode === 'all' && styles.notifModeBtnActive]}
            onPress={() => setMode('all')}
          >
            <Text style={[styles.notifModeTxt, mode === 'all' && styles.notifModeTxtActive]}>
              Tout le monde
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.notifModeBtn, mode === 'select' && styles.notifModeBtnActive]}
            onPress={() => setMode('select')}
          >
            <Text style={[styles.notifModeTxt, mode === 'select' && styles.notifModeTxtActive]}>
              Sélectif
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'select' && (
          loadingTokens ? (
            <ActivityIndicator color={ODT.primary} style={{ marginTop: 12 }} />
          ) : tokens.length === 0 ? (
            <Text style={{ color: ODT.gray, fontSize: 13, marginTop: 8 }}>Aucun appareil enregistré</Text>
          ) : (
            tokens.map(t => (
              <TouchableOpacity
                key={t.id}
                style={styles.tokenRow}
                onPress={() => toggleSelect(t.id)}
                activeOpacity={0.75}
              >
                <View style={[styles.checkbox, isSelected(t.id) && styles.checkboxChecked]}>
                  {isSelected(t.id) && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tokenName}>
                    {t.prenom || t.nom ? `${t.prenom} ${t.nom}`.trim() : 'Appareil anonyme'}
                  </Text>
                  <Text style={styles.tokenSub} numberOfLines={1}>{t.token}</Text>
                </View>
              </TouchableOpacity>
            ))
          )
        )}
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: '#6D28D9' }, sending && { opacity: 0.6 }]}
        onPress={sendNotifs}
        disabled={sending}
      >
        <Ionicons name="send" size={16} color="#fff" />
        <Text style={styles.saveBtnText}>
          {sending ? 'Envoi…' : `Envoyer${mode === 'select' && selectedCount > 0 ? ` (${selectedCount})` : ''}`}
        </Text>
      </TouchableOpacity>
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

  // TDF
  tdfBar: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  tdfBarFill: { height: 8, borderRadius: 4 },
  tdfParticipantRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: ODT.white, borderRadius: 12, padding: 12, marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },
  tdfNumBadge: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: ODT.primary, alignItems: 'center', justifyContent: 'center',
  },
  tdfNumText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  tdfResetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, marginTop: 8,
    borderWidth: 1.5, borderColor: '#EF4444', borderRadius: 12,
  },
  tdfResetBtnText: { fontSize: 13, fontWeight: '700', color: '#EF4444' },

  // Stock par jour — steppers
  stockDayTitle: { fontSize: 15, fontWeight: '800', color: ODT.dark, marginBottom: 4 },
  stockResRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: ODT.border,
  },
  stockResIcon: { fontSize: 18, width: 26 },
  stockResLabel: { flex: 1, fontSize: 12, fontWeight: '600', color: ODT.dark },
  stockStepper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stockBtn: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: ODT.lightGray,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: ODT.border,
  },
  stockBtnDisabled: { opacity: 0.3 },
  stockQtyText: { fontSize: 16, fontWeight: '800', color: ODT.primary, minWidth: 32, textAlign: 'center' },
  completBadge: {
    backgroundColor: '#FEF2F2', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: '#FECACA', minWidth: 62, alignItems: 'center',
  },
  completText: { fontSize: 10, fontWeight: '800', color: '#EF4444', letterSpacing: 1 },

  // Notifications
  notifModeRow: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 4 },
  notifModeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    borderWidth: 1.5, borderColor: ODT.border, backgroundColor: ODT.cream,
  },
  notifModeBtnActive: { backgroundColor: ODT.primary, borderColor: ODT.primary },
  notifModeTxt: { fontSize: 13, fontWeight: '700', color: ODT.primary },
  notifModeTxtActive: { color: '#fff' },
  tokenRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: ODT.border,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: ODT.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: ODT.primary },
  checkmark: { fontSize: 13, fontWeight: '900', color: '#fff' },
  tokenName: { fontSize: 13, fontWeight: '700', color: ODT.dark },
  tokenSub: { fontSize: 10, color: ODT.gray, marginTop: 1 },
});
