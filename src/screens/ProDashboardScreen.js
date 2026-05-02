import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Alert, Modal, Dimensions, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import { Toggle, UrgencyIcon } from '../components';
import { CATEGORIES, URGENCY_LEVELS, PRO_PLANS, PLAN_COMMISSION, MIN_TARIF, F, BRAND } from '../constants/data';
import { sendCompletionNotification } from '../services/NotificationService';
import * as Print        from 'expo-print';
import * as MailComposer from 'expo-mail-composer';
import * as Sharing      from 'expo-sharing';

// ── Visualisation des zones (cercles concentriques natifs) ────────────────────
const ZONE_COLORS = ['#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];
const MAP_SIZE    = Dimensions.get('window').width - 48;
const { width: W, height: H } = Dimensions.get('window');

function ZoneMap({ tiers }) {
  if (!tiers || tiers.length === 0) return null;
  const maxKm   = tiers[tiers.length - 1].to;
  const center  = MAP_SIZE / 2;

  return (
    <View style={{ width: MAP_SIZE, height: MAP_SIZE, alignSelf: 'center', position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
      {/* Grille de fond */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <View key={f} style={{
          position: 'absolute',
          width: MAP_SIZE * f, height: MAP_SIZE * f,
          borderRadius: MAP_SIZE * f / 2,
          borderWidth: 1, borderColor: 'rgba(148,163,184,0.2)',
        }} />
      ))}

      {/* Cercles de zones (du plus grand au plus petit pour le rendu) */}
      {[...tiers].reverse().map((tier, ri) => {
        const i    = tiers.length - 1 - ri;
        const size = (tier.to / maxKm) * (MAP_SIZE - 16);
        return (
          <View key={tier.id} style={{
            position: 'absolute',
            width: size, height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: ZONE_COLORS[i % 4],
            backgroundColor: ZONE_COLORS[i % 4] + '18',
            justifyContent: 'center', alignItems: 'center',
          }}>
            {/* Label km sur le bord */}
            <View style={{
              position: 'absolute', top: 6,
              backgroundColor: ZONE_COLORS[i % 4] + 'CC',
              paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10,
            }}>
              <Text style={{ fontFamily: F.bold, fontSize: 10, color: '#fff' }}>
                {tier.to} km · {tier.price} €
              </Text>
            </View>
          </View>
        );
      })}

      {/* Marqueur central */}
      <View style={{
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: BRAND.cyan,
        borderWidth: 3, borderColor: '#fff',
        elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
      }} />
    </View>
  );
}

// ── Sélecteur d'heure (grille heures + minutes) ───────────────────────────
const HOURS   = Array.from({ length: 17 }, (_, i) => i + 6); // 06h → 22h
const MINUTES = [0, 15, 30, 45];

function TimePicker({ value, onChange }) {
  const parse = (v) => {
    const [h = 8, m = 0] = (v || '08:00').split(':').map(Number);
    return { h, m };
  };

  const [visible, setVisible] = useState(false);
  const [selH, setSelH]       = useState(() => parse(value).h);
  const [selM, setSelM]       = useState(() => parse(value).m);

  const open = () => {
    const { h, m } = parse(value);
    setSelH(h); setSelM(m);
    setVisible(true);
  };

  const confirm = () => {
    onChange(`${String(selH).padStart(2, '0')}:${String(selM).padStart(2, '0')}`);
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity onPress={open} style={styles.timeBtn}>
        <MaterialCommunityIcons name="clock-outline" size={13} color={BRAND.cyanLight} />
        <Text style={styles.timeBtnText}>{value}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={styles.timeModalOverlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.timeModalCard}>
            <Text style={styles.timeModalTitle}>Choisir l'heure</Text>

            <Text style={styles.timePickerSect}>Heure</Text>
            <View style={styles.hoursGrid}>
              {HOURS.map(hr => (
                <TouchableOpacity key={hr} onPress={() => setSelH(hr)}
                  style={[styles.timeCell, selH === hr && styles.timeCellSel]}>
                  <Text style={[styles.timeCellText, selH === hr && styles.timeCellTextSel]}>{hr}h</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.timePickerSect, { marginTop: 14 }]}>Minutes</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {MINUTES.map(mn => (
                <TouchableOpacity key={mn} onPress={() => setSelM(mn)}
                  style={[styles.timeCell, { flex: 1, alignItems: 'center' }, selM === mn && styles.timeCellSel]}>
                  <Text style={[styles.timeCellText, selM === mn && styles.timeCellTextSel]}>
                    :{String(mn).padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
              <Text style={{ fontFamily: F.groteskBold, fontSize: 34, color: BRAND.cyan }}>
                {String(selH).padStart(2, '0')}:{String(selM).padStart(2, '0')}
              </Text>
              <TouchableOpacity onPress={confirm} style={styles.timeConfirmBtn}>
                <Text style={{ fontFamily: F.bold, fontSize: 14, color: '#fff' }}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

/**
 * TextInput numérique avec état local pour éviter les blocages de frappe.
 * Valide et pousse vers le parent uniquement si la valeur est un nombre valide.
 */
function NumericInput({ value, onCommit, style, min = 0 }) {
  const [local, setLocal] = useState(String(value));
  const committed = useRef(value);

  // Sync si la valeur externe change hors édition
  useEffect(() => {
    if (Number(local) !== value && committed.current !== local) {
      setLocal(String(value));
    }
  }, [value]);

  return (
    <TextInput
      value={local}
      onChangeText={v => {
        // Accepte chiffres et chaîne vide pendant la frappe
        if (/^\d*$/.test(v)) setLocal(v);
      }}
      onBlur={() => {
        const n = parseInt(local, 10);
        if (!isNaN(n) && local !== '') {
          committed.current = String(n);
          onCommit(n);
          setLocal(String(n));
        } else {
          // Revert à la valeur commitée si invalide
          setLocal(String(value));
        }
      }}
      keyboardType="number-pad"
      style={style}
    />
  );
}

const TABS = [
  { id: 'stats',    icon: 'chart-bar',           label: 'Stats'    },
  { id: 'urgency',  icon: 'lightning-bolt',       label: 'Modes'    },
  { id: 'schedule', icon: 'calendar-month-outline', label: 'Horaires' },
  { id: 'radius',   icon: 'map-marker-radius',   label: 'Tarifs'   },
  { id: 'plans',    icon: 'crown-outline',        label: 'Plans'    },
  { id: 'profile',  icon: 'account-circle-outline', label: 'Profil' },
];

function Toast({ visible }) {
  if (!visible) return null;
  return (
    <View style={styles.toast}>
      <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
      <Text style={{ color: '#fff', fontFamily: F.semibold, fontSize: 14 }}>Enregistré</Text>
    </View>
  );
}

function SpecialDayBlock({ title, icon, color, enabledKey, priceKey, tier, updateTier, commission }) {
  return (
    <View style={[styles.specialBlock, { marginBottom: 10 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MaterialCommunityIcons name={icon} size={16} color={color} />
          <Text style={{ fontFamily: F.bold, fontSize: 14, color: BRAND.textPrimary }}>{title}</Text>
        </View>
        <Toggle on={tier[enabledKey]} onToggle={() => updateTier(tier.id, enabledKey, !tier[enabledKey])} size="small" />
      </View>
      {tier[enabledKey] && (
        <View style={{ marginTop: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontFamily: F.bold, color, fontSize: 13 }}>Tarif {title}</Text>
              {tier[priceKey] < MIN_TARIF && (
                <Text style={{ fontFamily: F.regular, fontSize: 11, color: '#EF4444', marginTop: 2 }}>
                  Minimum {MIN_TARIF}€ requis
                </Text>
              )}
            </View>
            <NumericInput
              value={tier[priceKey]}
              onCommit={v => updateTier(tier.id, priceKey, v)}
              style={[styles.tierInput, { width: 80, borderColor: tier[priceKey] < MIN_TARIF ? '#EF4444' : color + '40' }]}
            />
          </View>
          {tier[priceKey] >= MIN_TARIF && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, backgroundColor: BRAND.bg, borderRadius: 8, padding: 8 }}>
              <Text style={{ fontFamily: F.regular, fontSize: 11, color: BRAND.textMuted }}>
                Commission ({(commission * 100).toFixed(0)}%)
              </Text>
              <Text style={{ fontFamily: F.bold, fontSize: 11, color: BRAND.textMuted }}>
                -{Math.round(tier[priceKey] * commission)}€ → versé : {Math.round(tier[priceKey] * (1 - commission))}€
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ── Helpers PDF ───────────────────────────────────────────────────────────────
function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generateInvoiceHTML({ invoiceNum, dateStr, prestataire, proUser, clientName, intervention, prestation, montantHT, tvaRate, montantTVA, montantTTC, depositNum, resteDu, notes }) {
  const cat = CATEGORIES.find(c => c.id === intervention?.catId) || CATEGORIES[0];

  const proLines = [
    proUser?.nomEntreprise ? `<strong>${escHtml(proUser.nomEntreprise)}</strong>` : '',
    prestataire             ? escHtml(prestataire) : '',
    proUser?.address?.rue
      ? escHtml([proUser.address.rue, proUser.address.codePostal, proUser.address.ville].filter(Boolean).join(', '))
      : '',
    proUser?.phone ? `Tél&nbsp;: ${escHtml(proUser.phone)}` : '',
    proUser?.bce   ? `N°&nbsp;BCE&nbsp;: ${escHtml(String(proUser.bce).replace(/(\d{4})(\d{3})(\d{3})/, '$1.$2.$3'))}` : '',
  ].filter(Boolean).join('<br>');

  const clientLines = [
    clientName
      ? `<strong>${escHtml(clientName)}</strong>`
      : (intervention?.clientEmail ? `<strong>${escHtml(intervention.clientEmail)}</strong>` : ''),
    intervention?.clientLocation ? escHtml(intervention.clientLocation) : '',
    intervention?.clientPhone    ? `Tél&nbsp;: ${escHtml(intervention.clientPhone)}` : '',
    intervention?.clientEmail    ? escHtml(intervention.clientEmail) : '',
  ].filter(Boolean).join('<br>');

  const interventionDate = intervention?.scheduledDateLabel
    ? escHtml(intervention.scheduledDateLabel + (intervention.scheduledTime ? ` · ${intervention.scheduledTime}` : ''))
    : escHtml(dateStr);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; background: #ffffff; color: #1e293b; font-size: 14px; }
  .page { width: 740px; margin: 0 auto; padding: 48px 0; }
  table { border-collapse: collapse; }

  /* Brand */
  .brand-name    { font-size: 22px; font-weight: bold; color: #0891B2; }
  .brand-tagline { font-size: 11px; color: #94a3b8; padding-top: 3px; }

  /* Invoice title */
  .inv-title { font-size: 38px; font-weight: bold; color: #0f172a; text-align: right; }
  .inv-meta  { font-size: 13px; color: #64748b; text-align: right; padding-top: 4px; }

  /* Separator */
  .stripe { height: 4px; background-color: #0891B2; margin: 24px 0 28px; }

  /* Parties */
  .party-label {
    font-size: 9px; font-weight: bold; color: #0891B2;
    text-transform: uppercase; letter-spacing: 2px;
    border-bottom: 2px solid #e2e8f0; padding-bottom: 7px; margin-bottom: 10px;
  }
  .party-content { font-size: 13px; line-height: 1.9; color: #334155; }

  /* Prestation */
  .section-title { font-size: 9px; font-weight: bold; color: #475569; text-transform: uppercase; letter-spacing: 1.5px; padding-bottom: 8px; }
  .prest-head th {
    background-color: #f8fafc; padding: 10px 14px; text-align: left;
    font-size: 11px; font-weight: bold; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.5px;
    border-top: 2px solid #e2e8f0; border-bottom: 2px solid #e2e8f0;
  }
  .prest-body td { padding: 14px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
  .badge {
    background-color: #eff6ff; color: #0891B2; padding: 2px 9px;
    border-radius: 12px; font-size: 11px; font-weight: bold;
    border: 1px solid #bfdbfe;
  }

  /* Totals */
  .tot-row td       { padding: 8px 0;  font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9; }
  .tot-row td.r     { text-align: right; }
  .tot-ttc td       { padding: 12px 0; font-size: 19px; font-weight: bold; color: #0f172a; border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; }
  .tot-ttc td.r     { text-align: right; }
  .tot-aco td       { padding: 8px 0;  font-size: 13px; font-weight: 600; color: #16a34a; }
  .tot-aco td.r     { text-align: right; }
  .tot-reste td     { padding: 13px 14px; font-size: 16px; font-weight: bold; color: #dc2626; background-color: #fef2f2; }
  .tot-reste td.r   { text-align: right; background-color: #fef2f2; }

  /* Notes */
  .notes-box   { background-color: #f8fafc; border-left: 4px solid #0891B2; padding: 14px 18px; margin-top: 28px; }
  .notes-title { font-size: 9px; font-weight: bold; color: #0891B2; text-transform: uppercase; letter-spacing: 1.5px; padding-bottom: 7px; }
  .notes-text  { font-size: 13px; color: #475569; line-height: 1.6; }

  /* Footer */
  .footer       { border-top: 1px solid #e2e8f0; padding-top: 18px; text-align: center; margin-top: 40px; }
  .footer-brand { font-size: 14px; font-weight: bold; color: #0891B2; padding-bottom: 4px; }
  .footer-text  { font-size: 11px; color: #94a3b8; }
</style>
</head>
<body>
<div class="page">

  <!-- ── HEADER ── -->
  <table width="100%" style="margin-bottom: 0;">
    <tr>
      <td valign="top">
        <div class="brand-name">SOS Dépann'</div>
        <div class="brand-tagline">Plateforme d'interventions à domicile · Belgique</div>
      </td>
      <td valign="top" align="right">
        <div class="inv-title">FACTURE</div>
        <div class="inv-meta">N°&nbsp;${escHtml(invoiceNum)}</div>
        <div class="inv-meta">Date&nbsp;: ${escHtml(dateStr)}</div>
      </td>
    </tr>
  </table>

  <div class="stripe"></div>

  <!-- ── PARTIES ── -->
  <table width="100%" style="margin-bottom: 32px;">
    <tr>
      <td width="50%" valign="top" style="padding-right: 32px;">
        <div class="party-label">Prestataire</div>
        <div class="party-content">${proLines || '—'}</div>
      </td>
      <td width="50%" valign="top" style="padding-left: 32px;">
        <div class="party-label">Client</div>
        <div class="party-content">${clientLines || '—'}</div>
      </td>
    </tr>
  </table>

  <!-- ── PRESTATION ── -->
  <div class="section-title">Détail de la prestation</div>
  <table width="100%" style="margin-bottom: 32px;">
    <thead class="prest-head">
      <tr>
        <th width="40%">Description</th>
        <th width="20%">Catégorie</th>
        <th width="22%">Date</th>
        <th width="18%">Créneau</th>
      </tr>
    </thead>
    <tbody class="prest-body">
      <tr>
        <td><strong>${escHtml(prestation || cat?.label || '—')}</strong></td>
        <td><span class="badge">${escHtml(cat?.label || '—')}</span></td>
        <td>${interventionDate}</td>
        <td>${escHtml(intervention?.scheduledTime || '—')}</td>
      </tr>
    </tbody>
  </table>

  <!-- ── TOTALS ── -->
  <table width="100%" style="margin-bottom: 8px;">
    <tr>
      <td></td>
      <td width="320" valign="top">
        <table width="100%">
          <tr class="tot-row"><td>Montant HT</td><td class="r">${escHtml(String(montantHT))} €</td></tr>
          <tr class="tot-row"><td>TVA (${escHtml(String(tvaRate))}%)</td><td class="r">${escHtml(String(montantTVA))} €</td></tr>
          <tr class="tot-ttc"><td>Total TTC</td><td class="r">${escHtml(String(montantTTC))} €</td></tr>
          <tr class="tot-aco"><td>✓ Acompte perçu</td><td class="r">−${depositNum} €</td></tr>
        </table>
        <table width="100%" style="margin-top: 8px; border-radius: 8px; overflow: hidden;">
          <tr class="tot-reste"><td>Reste dû</td><td class="r">${escHtml(String(resteDu))} €</td></tr>
        </table>
      </td>
    </tr>
  </table>

  ${notes ? `
  <div class="notes-box">
    <div class="notes-title">Notes</div>
    <div class="notes-text">${escHtml(notes).replace(/\n/g, '<br>')}</div>
  </div>` : ''}

  <div class="footer">
    <div class="footer-brand">SOS Dépann'</div>
    <div class="footer-text">Pros certifiés · Assurés · Notés · Merci de votre confiance</div>
  </div>

</div>
</body>
</html>`;
}

// ── Visionneuse photo plein écran (historique) ────────────────────────────────
function HistPhotoViewer({ photos, initialIndex, onClose }) {
  const [idx, setIdx] = useState(initialIndex);
  return (
    <Modal visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}>
          <TouchableOpacity onPress={onClose} style={{ margin: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </SafeAreaView>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ width: W, height: H, justifyContent: 'center', alignItems: 'center' }} maximumZoomScale={5} minimumZoomScale={1} centerContent bouncesZoom showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
          <Image source={{ uri: photos[idx] }} style={{ width: W, height: H * 0.8 }} resizeMode="contain" />
        </ScrollView>
        {idx > 0 && (
          <TouchableOpacity onPress={() => setIdx(i => i - 1)} style={{ position: 'absolute', left: 12, top: '50%', marginTop: -26, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 26, padding: 10 }}>
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>
        )}
        {idx < photos.length - 1 && (
          <TouchableOpacity onPress={() => setIdx(i => i + 1)} style={{ position: 'absolute', right: 12, top: '50%', marginTop: -26, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 26, padding: 10 }}>
            <Ionicons name="chevron-forward" size={26} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

// ── Modal : Terminer l'intervention ──────────────────────────────────────────
function TerminateModal({ visible, onClose, onConfirm }) {
  const [proPhotos, setProPhotos] = useState([]);

  const pickPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      selectionLimit: 5 - proPhotos.length,
      quality: 0.7,
    });
    if (!result.canceled) {
      setProPhotos(p => [...p, ...result.assets.map(a => a.uri)].slice(0, 5));
    }
  };

  const handleConfirm = () => {
    onConfirm(proPhotos);
    setProPhotos([]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={invStyles.modalOverlay}>
        <View style={invStyles.modalSheet}>
          <View style={invStyles.modalHandle} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#16A34A20', justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name="check-circle-outline" size={24} color="#16A34A" />
            </View>
            <View>
              <Text style={invStyles.modalTitle}>Terminer l'intervention</Text>
              <Text style={{ fontFamily: F.regular, fontSize: 12, color: BRAND.textMuted }}>Ajoutez des photos de preuve (optionnel)</Text>
            </View>
          </View>

          <TouchableOpacity onPress={pickPhotos} disabled={proPhotos.length >= 5} style={invStyles.photoPickBtn}>
            <MaterialCommunityIcons name="camera-plus-outline" size={20} color={BRAND.cyan} />
            <Text style={{ fontFamily: F.semibold, fontSize: 14, color: BRAND.cyan }}>
              {proPhotos.length >= 5 ? 'Maximum atteint' : `Ajouter des photos (${proPhotos.length}/5)`}
            </Text>
          </TouchableOpacity>

          {proPhotos.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {proPhotos.map((uri, i) => (
                <View key={i} style={{ position: 'relative', marginRight: 8 }}>
                  <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 10 }} resizeMode="cover" />
                  <TouchableOpacity
                    onPress={() => setProPhotos(p => p.filter((_, j) => j !== i))}
                    style={{ position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, padding: 2 }}>
                    <Ionicons name="close" size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FEF3C7', borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#FDE68A' }}>
            <MaterialCommunityIcons name="information-outline" size={16} color="#D97706" />
            <Text style={{ fontFamily: F.regular, fontSize: 12, color: '#D97706', flex: 1 }}>
              Une notification sera envoyée au client pour confirmer la fin de l'intervention et lui demander de laisser un avis.
            </Text>
          </View>

          <TouchableOpacity onPress={handleConfirm} style={invStyles.confirmBtn}>
            <MaterialCommunityIcons name="check-bold" size={18} color="#fff" />
            <Text style={{ fontFamily: F.bold, fontSize: 15, color: '#fff' }}>Confirmer la fin d'intervention</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={{ padding: 14, alignItems: 'center' }}>
            <Text style={{ fontFamily: F.semibold, fontSize: 14, color: BRAND.textMuted }}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Modal : Facture ───────────────────────────────────────────────────────────
function InvoiceModal({ visible, onClose, intervention, proUser }) {
  const cat = CATEGORIES.find(c => c.id === intervention?.catId) || CATEGORIES[0];
  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

  const [invoiceNum,  setInvoiceNum]  = useState('');
  const [prestataire, setPrestataire] = useState('');
  const [clientName,  setClientName]  = useState('');
  const [prestation,  setPrestation]  = useState('');
  const [montantHT,   setMontantHT]   = useState('');
  const [tvaRate,     setTvaRate]     = useState('21');
  const [notes,       setNotes]       = useState('');
  const [sending,     setSending]     = useState(false);

  useEffect(() => {
    if (visible && intervention) {
      setInvoiceNum(`FAC-${String(Date.now()).slice(-6)}`);
      setPrestataire([proUser?.prenom, proUser?.nom].filter(Boolean).join(' '));
      setClientName('');
      setPrestation(cat?.label || '');
      setMontantHT(String(intervention.amount || ''));
      setTvaRate('21');
      setNotes('');
    }
  }, [visible, intervention]);

  if (!intervention) return null;

  const montantHTNum  = parseFloat(montantHT)  || 0;
  const tvaNum        = parseFloat(tvaRate)    || 0;
  const montantTVA    = (montantHTNum * tvaNum / 100).toFixed(2);
  const montantTTC    = (montantHTNum + parseFloat(montantTVA)).toFixed(2);
  const depositNum    = intervention.deposit   || 0;
  const resteDu       = Math.max(0, parseFloat(montantTTC) - depositNum).toFixed(2);

  const handleSend = async () => {
    if (sending) return;
    setSending(true);
    try {
      const html = generateInvoiceHTML({
        invoiceNum, dateStr, prestataire, proUser, clientName,
        intervention, prestation, montantHT, tvaRate,
        montantTVA, montantTTC, depositNum, resteDu, notes,
      });
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, {
        mimeType:    'application/pdf',
        dialogTitle: `Facture ${invoiceNum}`,
        UTI:         'com.adobe.pdf',
      });
      onClose();
    } catch (e) {
      Alert.alert('Erreur', `Impossible de générer la facture PDF.\n${e?.message || ''}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={invStyles.modalOverlay}>
          <View style={[invStyles.modalSheet, { maxHeight: '92%' }]}>
            <View style={invStyles.modalHandle} />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: BRAND.cyan + '18', justifyContent: 'center', alignItems: 'center' }}>
                <MaterialCommunityIcons name="file-document-outline" size={24} color={BRAND.cyan} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={invStyles.modalTitle}>Facture</Text>
                <Text style={{ fontFamily: F.regular, fontSize: 12, color: BRAND.textMuted }} numberOfLines={1}>
                  Envoi à {intervention.clientEmail || '—'}
                </Text>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              {/* N° + date */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={invStyles.fieldLabel}>N° Facture</Text>
                  <TextInput style={invStyles.input} value={invoiceNum} onChangeText={setInvoiceNum} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={invStyles.fieldLabel}>Date</Text>
                  <View style={[invStyles.input, { justifyContent: 'center' }]}>
                    <Text style={{ fontFamily: F.regular, fontSize: 14, color: BRAND.textPrimary }}>{dateStr}</Text>
                  </View>
                </View>
              </View>

              <Text style={invStyles.fieldLabel}>Prestataire</Text>
              <TextInput style={[invStyles.input, { marginBottom: 10 }]} value={prestataire} onChangeText={setPrestataire} placeholder="Votre nom" placeholderTextColor={BRAND.textMuted} />

              <Text style={invStyles.fieldLabel}>Nom du client</Text>
              <TextInput style={[invStyles.input, { marginBottom: 10 }]} value={clientName} onChangeText={setClientName} placeholder="Nom du client" placeholderTextColor={BRAND.textMuted} />

              <Text style={invStyles.fieldLabel}>Prestation</Text>
              <TextInput style={[invStyles.input, { marginBottom: 10 }]} value={prestation} onChangeText={setPrestation} multiline />

              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                <View style={{ flex: 2 }}>
                  <Text style={invStyles.fieldLabel}>Montant HT (€)</Text>
                  <TextInput style={invStyles.input} value={montantHT} onChangeText={setMontantHT} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={invStyles.fieldLabel}>TVA (%)</Text>
                  <TextInput style={invStyles.input} value={tvaRate} onChangeText={setTvaRate} keyboardType="numeric" />
                </View>
              </View>

              {/* Récapitulatif financier */}
              <View style={{ backgroundColor: '#F0F9FF', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#BAE6FD' }}>
                {[
                  { label: `Montant HT`, value: `${montantHT || '0'} €`, bold: false },
                  { label: `TVA (${tvaRate}%)`, value: `${montantTVA} €`, bold: false },
                ].map((r, i) => (
                  <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontFamily: F.regular, fontSize: 13, color: BRAND.textSecondary }}>{r.label}</Text>
                    <Text style={{ fontFamily: F.bold, fontSize: 13, color: BRAND.textPrimary }}>{r.value}</Text>
                  </View>
                ))}
                <View style={{ height: 1, backgroundColor: '#BAE6FD', marginBottom: 8 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontFamily: F.bold, fontSize: 14, color: BRAND.textPrimary }}>Total TTC</Text>
                  <Text style={{ fontFamily: F.groteskBold, fontSize: 18, color: BRAND.cyan }}>{montantTTC} €</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontFamily: F.regular, fontSize: 12, color: BRAND.textMuted }}>Acompte perçu</Text>
                  <Text style={{ fontFamily: F.bold, fontSize: 12, color: '#16A34A' }}>−{depositNum} €</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: F.bold, fontSize: 14, color: BRAND.textPrimary }}>Reste dû</Text>
                  <Text style={{ fontFamily: F.groteskBold, fontSize: 18, color: '#EF4444' }}>{resteDu} €</Text>
                </View>
              </View>

              <Text style={invStyles.fieldLabel}>Notes (optionnel)</Text>
              <TextInput
                style={[invStyles.input, { minHeight: 72, textAlignVertical: 'top', marginBottom: 20 }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Remarques, coordonnées bancaires, conditions..."
                placeholderTextColor={BRAND.textMuted}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                onPress={handleSend}
                disabled={sending}
                style={[invStyles.confirmBtn, sending && { opacity: 0.65 }]}>
                <MaterialCommunityIcons
                  name={sending ? 'file-pdf-box' : 'email-send-outline'}
                  size={18} color="#fff" />
                <Text style={{ fontFamily: F.bold, fontSize: 15, color: '#fff' }}>
                  {sending ? 'Génération du PDF...' : 'Envoyer la facture en PDF'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} style={{ padding: 14, alignItems: 'center' }}>
                <Text style={{ fontFamily: F.semibold, fontSize: 14, color: BRAND.textMuted }}>Fermer</Text>
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Carte historique + Modal de détail (pro) ─────────────────────────────────
function InterventionHistoryCard({ intervention, onOpenInvoice, canSendInvoice }) {
  const [visible,   setVisible]   = useState(false);
  const [viewerIdx, setViewerIdx] = useState(null);

  const cat = CATEGORIES.find(c => c.id === intervention.catId) || CATEGORIES[0];
  const urg = URGENCY_LEVELS.find(u => u.id === intervention.urgencyId) || URGENCY_LEVELS[0];

  const fmt = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
  };

  const allPhotos = [...(intervention.photos || []), ...(intervention.proPhotos || [])];
  const resteDu   = intervention.amount - (intervention.deposit || 0);

  return (
    <>
      {/* ── Carte cliquable ── */}
      <TouchableOpacity onPress={() => setVisible(true)} activeOpacity={0.75} style={invStyles.histCard}>
        <View style={invStyles.histHeader}>
          <View style={[invStyles.histCatDot, { backgroundColor: cat.color + '25' }]}>
            <MaterialCommunityIcons name="tools" size={16} color={cat.color} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 14, color: BRAND.textPrimary }}>{cat.label}</Text>
            <Text style={{ fontFamily: F.regular, fontSize: 12, color: BRAND.textMuted, marginTop: 1 }} numberOfLines={1}>
              {fmt(intervention.completedAt)} · {intervention.clientLocation || '—'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', marginRight: 8 }}>
            <Text style={{ fontFamily: F.groteskBold, fontSize: 16, color: BRAND.textPrimary }}>{intervention.amount} €</Text>
            <View style={invStyles.statusBadge}>
              <Text style={{ fontFamily: F.bold, fontSize: 10, color: '#16A34A' }}>Terminée</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={BRAND.textMuted} />
        </View>
      </TouchableOpacity>

      {/* ── Modal de détail ── */}
      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>

          {/* Header modal */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
            <TouchableOpacity onPress={() => setVisible(false)} style={{ padding: 4 }}>
              <Ionicons name="arrow-back" size={22} color={BRAND.cyan} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: F.groteskBold, fontSize: 17, color: BRAND.textPrimary }}>Détail de l'intervention</Text>
              <Text style={{ fontFamily: F.regular, fontSize: 12, color: BRAND.textMuted }}>
                {cat.label} · {fmt(intervention.completedAt)}
              </Text>
            </View>
            <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
              <Text style={{ fontFamily: F.bold, fontSize: 11, color: '#16A34A' }}>Terminée</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

            {/* Catégorie + urgence */}
            <View style={invStyles.detailCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: cat.color + '20', justifyContent: 'center', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="tools" size={22} color={cat.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: F.groteskBold, fontSize: 16, color: BRAND.textPrimary }}>{cat.label}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <UrgencyIcon urgency={urg} size={13} />
                    <Text style={{ fontFamily: F.regular, fontSize: 13, color: urg.color }}>{urg.label}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Dates */}
            <View style={invStyles.detailCard}>
              <Text style={invStyles.detailSectionTitle}>Dates</Text>
              {intervention.scheduledDateLabel ? (
                <View style={invStyles.detailRow}>
                  <Ionicons name="calendar-outline" size={15} color={BRAND.textMuted} />
                  <Text style={invStyles.detailRowLabel}>Planifiée</Text>
                  <Text style={invStyles.detailRowValue}>
                    {intervention.scheduledDateLabel}{intervention.scheduledTime ? ` · ${intervention.scheduledTime}` : ''}
                  </Text>
                </View>
              ) : null}
              <View style={invStyles.detailRow}>
                <Ionicons name="checkmark-circle-outline" size={15} color="#22C55E" />
                <Text style={invStyles.detailRowLabel}>Terminée le</Text>
                <Text style={invStyles.detailRowValue}>{fmt(intervention.completedAt)}</Text>
              </View>
              <View style={invStyles.detailRow}>
                <Ionicons name="time-outline" size={15} color={BRAND.textMuted} />
                <Text style={invStyles.detailRowLabel}>Acceptée le</Text>
                <Text style={invStyles.detailRowValue}>{fmt(intervention.acceptedAt)}</Text>
              </View>
            </View>

            {/* Client */}
            {(intervention.clientLocation || intervention.clientPhone || intervention.clientEmail) && (
              <View style={invStyles.detailCard}>
                <Text style={invStyles.detailSectionTitle}>Client</Text>
                {intervention.clientLocation ? (
                  <View style={invStyles.detailRow}>
                    <Ionicons name="location-outline" size={15} color={BRAND.textMuted} />
                    <Text style={invStyles.detailRowLabel}>Adresse</Text>
                    <Text style={[invStyles.detailRowValue, { flex: 1 }]} numberOfLines={2}>{intervention.clientLocation}</Text>
                  </View>
                ) : null}
                {intervention.clientPhone ? (
                  <View style={invStyles.detailRow}>
                    <Ionicons name="call-outline" size={15} color={BRAND.textMuted} />
                    <Text style={invStyles.detailRowLabel}>Téléphone</Text>
                    <Text style={invStyles.detailRowValue}>{intervention.clientPhone}</Text>
                  </View>
                ) : null}
                {intervention.clientEmail ? (
                  <View style={invStyles.detailRow}>
                    <Ionicons name="mail-outline" size={15} color={BRAND.textMuted} />
                    <Text style={invStyles.detailRowLabel}>Email</Text>
                    <Text style={[invStyles.detailRowValue, { flex: 1 }]} numberOfLines={1}>{intervention.clientEmail}</Text>
                  </View>
                ) : null}
              </View>
            )}

            {/* Facturation */}
            <View style={invStyles.detailCard}>
              <Text style={invStyles.detailSectionTitle}>Facturation</Text>
              <View style={invStyles.detailRow}>
                <MaterialCommunityIcons name="currency-eur" size={15} color={BRAND.textMuted} />
                <Text style={invStyles.detailRowLabel}>Total devis</Text>
                <Text style={[invStyles.detailRowValue, { fontFamily: F.groteskBold, color: BRAND.textPrimary }]}>{intervention.amount} €</Text>
              </View>
              {intervention.deposit ? (
                <View style={invStyles.detailRow}>
                  <MaterialCommunityIcons name="credit-card-outline" size={15} color={BRAND.textMuted} />
                  <Text style={invStyles.detailRowLabel}>Acompte encaissé</Text>
                  <Text style={invStyles.detailRowValue}>{intervention.deposit} €</Text>
                </View>
              ) : null}
              {intervention.deposit ? (
                <View style={[invStyles.detailRow, { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10, marginTop: 4 }]}>
                  <MaterialCommunityIcons name="hand-coin-outline" size={15} color="#22C55E" />
                  <Text style={[invStyles.detailRowLabel, { fontFamily: F.bold }]}>Reste encaissé au pro</Text>
                  <Text style={[invStyles.detailRowValue, { color: '#22C55E', fontFamily: F.groteskBold }]}>{resteDu} €</Text>
                </View>
              ) : null}
            </View>

            {/* Description */}
            {intervention.description ? (
              <View style={invStyles.detailCard}>
                <Text style={invStyles.detailSectionTitle}>Description</Text>
                <Text style={{ fontFamily: F.regular, fontSize: 14, color: BRAND.textSecondary, lineHeight: 20, marginTop: 8 }}>
                  {intervention.description}
                </Text>
              </View>
            ) : null}

            {/* Photos */}
            {allPhotos.length > 0 && (
              <View style={invStyles.detailCard}>
                <Text style={invStyles.detailSectionTitle}>Photos ({allPhotos.length})</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                  {allPhotos.map((uri, i) => (
                    <TouchableOpacity key={i} onPress={() => setViewerIdx(i)} activeOpacity={0.85}>
                      <Image source={{ uri }} style={{ width: 90, height: 90, borderRadius: 10 }} resizeMode="cover" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Bouton facture */}
            <TouchableOpacity
              onPress={() => {
                if (!canSendInvoice) {
                  Alert.alert('Fonctionnalité Pro / Élite', "L'envoi de factures PDF est réservé aux plans Pro et Élite.", [{ text: 'OK' }]);
                  return;
                }
                setVisible(false);
                onOpenInvoice(intervention);
              }}
              style={[invStyles.histInvoiceBtn, !canSendInvoice && { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]}>
              <MaterialCommunityIcons
                name={canSendInvoice ? 'file-send-outline' : 'lock-outline'}
                size={16} color={canSendInvoice ? BRAND.cyan : '#94A3B8'} />
              <Text style={{ fontFamily: F.semibold, fontSize: 14, color: canSendInvoice ? BRAND.cyan : '#94A3B8' }}>
                {canSendInvoice ? 'Envoyer la facture PDF' : 'Facture PDF — Plan Pro/Élite'}
              </Text>
            </TouchableOpacity>

          </ScrollView>
        </SafeAreaView>
      </Modal>

      {viewerIdx !== null && allPhotos.length > 0 && (
        <HistPhotoViewer photos={allPhotos} initialIndex={viewerIdx} onClose={() => setViewerIdx(null)} />
      )}
    </>
  );
}

export default function ProDashboardScreen({ navigation }) {
  const { proUser, logoutPro, schedule, radiusTiers, proUrgencySettings, setProUrgencySettings,
    toggleDay, updateSlot, addSlot, removeSlot, updateTier, addTier, removeTier,
    proOffer, clearProOffer, clientRequest,
    interventions, completeIntervention } = useApp();

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: () => { logoutPro(); navigation.replace('Home'); } },
    ]);
  };

  const [tab, setTab] = useState('stats');
  const [editDay, setEditDay] = useState(null);
  const [expandedTier, setExpandedTier] = useState(null);
  const [toast, setToast] = useState(false);
  const [showTerminateModal,        setShowTerminateModal]        = useState(false);
  const [showInvoiceModal,          setShowInvoiceModal]          = useState(false);
  const [selectedInvoiceIntervention, setSelectedInvoiceIntervention] = useState(null);

  const currentIntervention    = interventions?.find(i => i.id === proOffer?.interventionId);
  const completedInterventions = (interventions || []).filter(i => i.status === 'completed');

  const handleTerminate = async (proPhotos) => {
    const cat = CATEGORIES.find(c => c.id === proOffer?.catId) || CATEGORIES[0];
    const invForInvoice = currentIntervention
      ? { ...currentIntervention, proPhotos, status: 'completed', completedAt: new Date().toISOString() }
      : { ...clientRequest, ...proOffer, proPhotos, status: 'completed', completedAt: new Date().toISOString() };
    if (currentIntervention) {
      completeIntervention(currentIntervention.id, proPhotos);
    }
    await sendCompletionNotification({ catLabel: cat.label });
    setShowTerminateModal(false);
    clearProOffer();
    if (planId !== 'free') {
      setSelectedInvoiceIntervention(invForInvoice);
      setShowInvoiceModal(true);
    }
  };

  const showToast = () => { setToast(true); setTimeout(() => setToast(false), 2000); };

  const planId     = proUser?.plan || 'free';
  const commission = PLAN_COMMISSION[planId] ?? 0.20;
  const planInfo   = PRO_PLANS.find(p => p.id === planId);
  const planLabel  = planInfo?.name || 'Starter';
  const planColor  = planInfo?.color || BRAND.textMuted;

  return (
    <View style={{ flex: 1, backgroundColor: BRAND.bg }}>
      <Toast visible={toast} />

      <SafeAreaView edges={['top']} style={{ backgroundColor: BRAND.bgCard, borderBottomWidth: 1, borderBottomColor: BRAND.border }}>
        <View style={styles.header}>
          {navigation.canGoBack() ? (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
              <Ionicons name="arrow-back" size={22} color={BRAND.cyanLight} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 30 }} />
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialCommunityIcons name="hand-wave-outline" size={18} color={BRAND.warning} />
            <Text style={{ fontFamily: F.groteskBold, fontSize: 17, color: BRAND.textPrimary }}>
              {proUser?.prenom ? proUser.prenom : 'Espace Pro'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={{ padding: 4 }}>
            <MaterialCommunityIcons name="logout" size={20} color={BRAND.textMuted} />
          </TouchableOpacity>
        </View>
        {/* Tab bar */}
        <View style={styles.tabBar}>
          {TABS.map(t => (
            <TouchableOpacity key={t.id}
              onPress={() => t.id === 'profile' ? navigation.navigate('ProProfile') : setTab(t.id)}
              style={[styles.tabBtn, tab === t.id && styles.tabActive]}>
              <MaterialCommunityIcons name={t.icon} size={18} color={tab === t.id ? BRAND.cyanLight : BRAND.textMuted} />
              <Text style={{ fontSize: 9, fontFamily: tab === t.id ? F.bold : F.regular, color: tab === t.id ? BRAND.cyanLight : BRAND.textMuted }}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>


      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>

        {/* ── STATS ── */}
        {tab === 'stats' && (
          <>
            {/* Intervention en cours */}
            {proOffer && clientRequest && (() => {
              const cat = CATEGORIES.find(c => c.id === proOffer.catId) || CATEGORIES[0];
              const urg = URGENCY_LEVELS.find(u => u.id === proOffer.urgencyId) || URGENCY_LEVELS[0];
              return (
                <View style={styles.interventionCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: F.groteskBold, fontSize: 16, color: BRAND.textPrimary }}>Intervention acceptée</Text>
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                        <View style={[styles.offerBadge, { backgroundColor: cat.color + '20', borderColor: cat.color + '50' }]}>
                          <Text style={{ fontFamily: F.bold, fontSize: 12, color: cat.color }}>{cat.label}</Text>
                        </View>
                        <View style={[styles.offerBadge, { backgroundColor: urg.color + '20', borderColor: urg.color + '50' }]}>
                          <Text style={{ fontFamily: F.bold, fontSize: 12, color: urg.color }}>{urg.label}</Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity onPress={clearProOffer} style={{ padding: 4 }}>
                      <Ionicons name="close-circle-outline" size={20} color={BRAND.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {/* Date / heure */}
                  {proOffer.scheduledDateLabel && (
                    <View style={styles.offerRow}>
                      <Ionicons name="calendar-outline" size={15} color={BRAND.cyan} />
                      <Text style={styles.offerText}>
                        {proOffer.scheduledDateLabel}{proOffer.scheduledTime ? ` · ${proOffer.scheduledTime}` : ''}
                      </Text>
                    </View>
                  )}

                  {/* Adresse */}
                  {clientRequest.clientLocation && (
                    <View style={styles.offerRow}>
                      <Ionicons name="location-outline" size={15} color={BRAND.cyan} />
                      <Text style={styles.offerText} numberOfLines={1}>{clientRequest.clientLocation}</Text>
                    </View>
                  )}

                  {/* Montant */}
                  <View style={[styles.offerRow, { justifyContent: 'space-between' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <MaterialCommunityIcons name="currency-eur" size={15} color={BRAND.success} />
                      <Text style={styles.offerText}>Devis envoyé</Text>
                    </View>
                    <Text style={{ fontFamily: F.groteskBold, fontSize: 18, color: BRAND.success }}>{proOffer.amount} €</Text>
                  </View>

                  {/* Contact client — révélé (acompte pre-payé) */}
                  <View style={styles.contactRevealed}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <MaterialCommunityIcons name="shield-check" size={15} color="#22C55E" />
                      <Text style={{ fontFamily: F.bold, fontSize: 12, color: '#22C55E', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Acompte perçu · Coordonnées client
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.contactRow}>
                      <View style={styles.contactIcon}>
                        <Ionicons name="call" size={16} color={BRAND.cyan} />
                      </View>
                      <Text style={{ fontFamily: F.bold, fontSize: 15, color: BRAND.textPrimary, flex: 1 }}>
                        {clientRequest.clientPhone || '—'}
                      </Text>
                      <Ionicons name="copy-outline" size={14} color={BRAND.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.contactRow, { marginTop: 8 }]}>
                      <View style={styles.contactIcon}>
                        <Ionicons name="mail" size={16} color={BRAND.cyan} />
                      </View>
                      <Text style={{ fontFamily: F.bold, fontSize: 15, color: BRAND.textPrimary, flex: 1 }}>
                        {clientRequest.clientEmail || '—'}
                      </Text>
                      <Ionicons name="copy-outline" size={14} color={BRAND.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {/* Bouton terminer */}
                  <TouchableOpacity
                    onPress={() => setShowTerminateModal(true)}
                    style={invStyles.terminateBtn}
                    activeOpacity={0.85}>
                    <MaterialCommunityIcons name="check-circle-outline" size={18} color="#fff" />
                    <Text style={{ fontFamily: F.bold, fontSize: 14, color: '#fff' }}>
                      Terminer l'intervention
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })()}

            <View style={styles.dashCard}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: F.regular, fontSize: 13 }}>Revenus ce mois</Text>
              <Text style={{ color: '#fff', fontFamily: F.groteskBold, fontSize: 36, marginTop: 4 }}>2 847 €</Text>
              <Text style={{ color: '#A7F3D0', fontFamily: F.semibold, fontSize: 13, marginTop: 4 }}>↑ +23%</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {[
                { l: 'Interventions', v: String(completedInterventions.length || 0), icon: 'tools' },
                { l: 'Note',         v: '4.9',   icon: 'star' },
                { l: 'Acceptation',  v: '94%',   icon: 'check-circle-outline' },
                { l: 'Réponse moy.', v: '2 min', icon: 'clock-fast' },
              ].map((s, i) => (
                <View key={i} style={styles.statBox}>
                  <MaterialCommunityIcons name={s.icon} size={16} color={BRAND.cyan} />
                  <Text style={{ fontFamily: F.regular, fontSize: 11, color: BRAND.textMuted, marginBottom: 2, marginTop: 4 }}>{s.l}</Text>
                  <Text style={{ fontFamily: F.groteskBold, fontSize: 20, color: BRAND.textPrimary }}>{s.v}</Text>
                </View>
              ))}
            </View>

            {/* Historique des interventions terminées */}
            {completedInterventions.length > 0 && (
              <View style={{ marginTop: 20 }}>
                <Text style={{ fontFamily: F.groteskBold, fontSize: 16, color: BRAND.textPrimary, marginBottom: 12 }}>
                  Historique des interventions
                </Text>
                {completedInterventions.map(inv => (
                  <InterventionHistoryCard
                    key={inv.id}
                    intervention={inv}
                    canSendInvoice={planId !== 'free'}
                    onOpenInvoice={(inv) => {
                      setSelectedInvoiceIntervention(inv);
                      setShowInvoiceModal(true);
                    }}
                  />
                ))}
              </View>
            )}
          </>
        )}

        {/* ── MODES URGENCE ── */}
        {tab === 'urgency' && (
          <>
            {URGENCY_LEVELS.map(l => {
              const on = proUrgencySettings[l.id]?.enabled;
              return (
                <View key={l.id} style={[styles.urgCard, { borderColor: on ? l.color + '50' : BRAND.border, opacity: on ? 1 : 0.5 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: l.bg, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                        <UrgencyIcon urgency={l} size={22} />
                      </View>
                      <View>
                        <Text style={{ fontFamily: F.bold, fontSize: 15, color: BRAND.textPrimary }}>{l.label}</Text>
                        <Text style={{ fontFamily: F.regular, fontSize: 12, color: BRAND.textMuted, marginTop: 2 }}>{l.sub}</Text>
                      </View>
                    </View>
                    <Toggle on={on} onToggle={() => setProUrgencySettings(p => ({ ...p, [l.id]: { enabled: !on } }))} />
                  </View>
                  {on && (
                    <View style={{ marginTop: 12, backgroundColor: BRAND.bg, borderRadius: 10, padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontFamily: F.regular, fontSize: 13, color: BRAND.textSecondary }}>Multiplicateur</Text>
                      <Text style={{ fontFamily: F.groteskBold, fontSize: 20, color: l.color }}>x{l.mult}</Text>
                    </View>
                  )}
                </View>
              );
            })}
            <TouchableOpacity onPress={showToast} style={styles.saveBtn}>
              <Text style={{ color: '#fff', fontFamily: F.bold, fontSize: 16 }}>Enregistrer</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── HORAIRES ── */}
        {tab === 'schedule' && (
          <>
            {/* Week overview */}
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 20 }}>
              {schedule.map((day, i) => (
                <TouchableOpacity key={i} onPress={() => setEditDay(editDay === i ? null : i)}
                  style={[styles.dayDot, {
                    backgroundColor: day.enabled ? (editDay === i ? '#0891B2' : '#DCFCE7') : (editDay === i ? '#94A3B8' : '#F1F5F9'),
                    borderColor: editDay === i ? '#0891B2' : 'transparent',
                  }]}>
                  <Text style={{ fontSize: 11, fontFamily: F.bold, color: editDay === i ? '#fff' : day.enabled ? '#166534' : '#94A3B8' }}>{day.day}</Text>
                  <Text style={{ fontSize: 9, fontFamily: F.regular, color: editDay === i ? '#fff' : day.enabled ? '#166534' : '#94A3B8' }}>
                    {day.enabled ? `${day.slots.length}cr.` : 'OFF'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {editDay !== null && (
              <View style={styles.dayEditor}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontFamily: F.groteskBold, fontSize: 17, color: '#0F172A' }}>{schedule[editDay].dayFull}</Text>
                  <Toggle on={schedule[editDay].enabled} onToggle={() => toggleDay(editDay)} />
                </View>
                {schedule[editDay].enabled ? (
                  <>
                    {schedule[editDay].slots.map((slot, si) => (
                      <View key={si} style={styles.slotRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <View style={{ alignItems: 'center', gap: 4 }}>
                            <Text style={styles.slotLabel}>DÉBUT</Text>
                            <TimePicker value={slot.start} onChange={v => updateSlot(editDay, si, 'start', v)} />
                          </View>
                          <Ionicons name="arrow-forward" size={16} color={BRAND.textMuted} style={{ marginTop: 16 }} />
                          <View style={{ alignItems: 'center', gap: 4 }}>
                            <Text style={styles.slotLabel}>FIN</Text>
                            <TimePicker value={slot.end} onChange={v => updateSlot(editDay, si, 'end', v)} />
                          </View>
                          {schedule[editDay].slots.length > 1 && (
                            <TouchableOpacity onPress={() => removeSlot(editDay, si)}
                              style={[styles.removeBtn, { marginTop: 16 }]}>
                              <Ionicons name="close" size={14} color={BRAND.danger} />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))}
                    <TouchableOpacity onPress={() => addSlot(editDay)} style={styles.addBtn}>
                      <Text style={{ color: '#64748B', fontFamily: F.semibold, fontSize: 14 }}>+ Créneau</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={{ alignItems: 'center', padding: 20 }}>
                    <MaterialCommunityIcons name="sleep" size={36} color={BRAND.textMuted} />
                    <Text style={{ fontFamily: F.regular, color: BRAND.textMuted, marginTop: 8 }}>Repos</Text>
                  </View>
                )}
              </View>
            )}
            <TouchableOpacity onPress={showToast} style={styles.saveBtn}>
              <Text style={{ color: '#fff', fontFamily: F.bold, fontSize: 16 }}>Enregistrer</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── TARIFS / ZONES ── */}
        {tab === 'radius' && (
          <>
            {/* Adresse (lecture seule — modifiable dans le Profil) */}
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.fieldLabel, { fontSize: 15, color: BRAND.textPrimary, marginBottom: 10 }]}>
                Adresse de base
              </Text>
              {proUser?.address?.rue || proUser?.address?.ville ? (
                <View style={styles.addrReadOnly}>
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: BRAND.cyan + '15', justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="location" size={20} color={BRAND.cyan} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontFamily: F.bold, fontSize: 14, color: BRAND.textPrimary }}>
                      {proUser.address.rue || '—'}
                    </Text>
                    <Text style={{ fontFamily: F.regular, fontSize: 13, color: BRAND.textMuted, marginTop: 2 }}>
                      {[proUser.address.codePostal, proUser.address.ville].filter(Boolean).join('  ')}
                    </Text>
                  </View>
                </View>
              ) : (
                <TouchableOpacity onPress={() => navigation.navigate('ProProfile')} style={styles.addrEmpty}>
                  <Ionicons name="location-outline" size={20} color={BRAND.textMuted} />
                  <Text style={{ fontFamily: F.medium, fontSize: 14, color: BRAND.textMuted, flex: 1, marginLeft: 10 }}>
                    Adresse non renseignée — définir dans le Profil
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={BRAND.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Zones d'intervention — carte toujours visible */}
            <View style={styles.zoneMapCard}>
              <Text style={[styles.fieldLabel, { fontSize: 15, color: BRAND.textPrimary, marginBottom: 12 }]}>
                Zones d'intervention
              </Text>

              {/* Légende */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {radiusTiers.map((t, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: ZONE_COLORS[i % 4] + '18', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: ZONE_COLORS[i % 4] + '50' }}>
                    <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: ZONE_COLORS[i % 4] }} />
                    <Text style={{ fontFamily: F.semibold, fontSize: 12, color: BRAND.textPrimary }}>
                      Z{i + 1} · {t.from}–{t.to} km · {t.price} €
                    </Text>
                  </View>
                ))}
              </View>

              {/* Carte concentrique */}
              <ZoneMap tiers={radiusTiers} />

              {/* Tableau récapitulatif */}
              <View style={{ marginTop: 16, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: BRAND.border }}>
                {radiusTiers.map((t, i) => (
                  <View key={t.id} style={[
                    { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10, backgroundColor: BRAND.bgCard },
                    i < radiusTiers.length - 1 && { borderBottomWidth: 1, borderBottomColor: BRAND.border },
                  ]}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: ZONE_COLORS[i % 4] }} />
                    <Text style={{ fontFamily: F.bold, fontSize: 13, color: BRAND.textPrimary, flex: 1 }}>
                      Zone {i + 1} — {t.from} à {t.to} km
                    </Text>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontFamily: F.groteskBold, fontSize: 15, color: ZONE_COLORS[i % 4] }}>{t.price} €</Text>
                      {t.satEnabled && <Text style={{ fontFamily: F.regular, fontSize: 10, color: BRAND.textMuted }}>Sam. {t.satPrice} €</Text>}
                      {t.sunEnabled && <Text style={{ fontFamily: F.regular, fontSize: 10, color: BRAND.textMuted }}>Dim. {t.sunPrice} €</Text>}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Commission badge */}
            <View style={[styles.commissionBadge, { borderColor: planColor + '40', backgroundColor: planColor + '10' }]}>
              <MaterialCommunityIcons name="percent-outline" size={16} color={planColor} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: F.bold, fontSize: 13, color: planColor }}>
                  Commission plan {planLabel} : {(commission * 100).toFixed(0)}%
                </Text>
                <Text style={{ fontFamily: F.regular, fontSize: 11, color: BRAND.textSecondary, marginTop: 2 }}>
                  Prélevée sur l'acompte. Passez au plan Pro ou Élite pour réduire votre commission.
                </Text>
              </View>
            </View>

            <Text style={[styles.fieldLabel, { marginBottom: 12 }]}>Zones tarifaires</Text>
            {radiusTiers.map((tier, idx) => {
              const tc = ["#22C55E","#F59E0B","#EF4444","#8B5CF6"][idx % 4];
              const isExp = expandedTier === tier.id;
              const priceTooLow = Number(tier.price) < MIN_TARIF;
              return (
                <View key={tier.id} style={[styles.tierCard, { borderColor: priceTooLow ? '#EF4444' : isExp ? tc + '50' : '#E2E8F0', borderWidth: isExp || priceTooLow ? 2 : 1 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: tc, marginRight: 8 }} />
                      <Text style={{ fontFamily: F.bold, fontSize: 15, color: '#0F172A' }}>Zone {idx + 1}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <TouchableOpacity onPress={() => setExpandedTier(isExp ? null : tier.id)}
                        style={[styles.expandBtn, { backgroundColor: isExp ? tc + '20' : '#F1F5F9' }]}>
                        <Text style={{ color: isExp ? tc : '#64748B', fontSize: 12, fontFamily: F.bold }}>{isExp ? '▲' : '▼'}</Text>
                      </TouchableOpacity>
                      {radiusTiers.length > 1 && (
                        <TouchableOpacity onPress={() => removeTier(tier.id)} style={styles.removeBtn}>
                          <MaterialCommunityIcons name="close" size={14} color="#DC2626" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Km + tarif minimum */}
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                    {[
                      { label: 'De (km)', field: 'from', value: tier.from },
                      { label: 'À (km)',  field: 'to',   value: tier.to   },
                    ].map(f => (
                      <View key={f.field} style={{ flex: 1 }}>
                        <Text style={styles.slotLabel}>{f.label.toUpperCase()}</Text>
                        <NumericInput value={f.value} onCommit={v => updateTier(tier.id, f.field, v)}
                          style={styles.tierInput} />
                      </View>
                    ))}
                    <View style={{ flex: 1.4 }}>
                      <Text style={styles.slotLabel}>TARIF MIN (€)</Text>
                      <NumericInput
                        value={tier.price}
                        onCommit={v => updateTier(tier.id, 'price', v)}
                        style={[styles.tierInput, priceTooLow && { borderColor: '#EF4444', color: '#EF4444' }]}
                      />
                      {priceTooLow && (
                        <Text style={{ fontSize: 10, color: '#EF4444', fontFamily: F.regular, marginTop: 2 }}>
                          Min {MIN_TARIF}€
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Commission preview sur tarif normal */}
                  {!priceTooLow && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, backgroundColor: BRAND.bg, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: BRAND.border }}>
                      <Text style={{ fontFamily: F.regular, fontSize: 12, color: BRAND.textMuted }}>
                        Acompte client : <Text style={{ fontFamily: F.bold, color: BRAND.textPrimary }}>{tier.price}€</Text>
                      </Text>
                      <Text style={{ fontFamily: F.regular, fontSize: 12, color: BRAND.textMuted }}>
                        Vous recevez :{' '}
                        <Text style={{ fontFamily: F.bold, color: '#22C55E' }}>
                          {Math.round(tier.price * (1 - commission))}€
                        </Text>
                      </Text>
                    </View>
                  )}

                  {/* Tarifs spéciaux */}
                  {isExp && (
                    <View style={{ marginTop: 14 }}>
                      <View style={{ height: 1, backgroundColor: '#E2E8F0', marginBottom: 14 }} />
                      <SpecialDayBlock title="Samedi" icon="calendar-weekend" color="#7C3AED"
                        enabledKey="satEnabled" priceKey="satPrice" tier={tier}
                        updateTier={updateTier} commission={commission} />
                      <SpecialDayBlock title="Dimanche" icon="weather-sunny" color="#F97316"
                        enabledKey="sunEnabled" priceKey="sunPrice" tier={tier}
                        updateTier={updateTier} commission={commission} />
                      <SpecialDayBlock title="Jours fériés" icon="calendar-star" color="#EF4444"
                        enabledKey="holidayEnabled" priceKey="holidayPrice" tier={tier}
                        updateTier={updateTier} commission={commission} />
                    </View>
                  )}
                </View>
              );
            })}
            {(() => {
              const atLimit = planId === 'free' && radiusTiers.length >= 2;
              return (
                <TouchableOpacity
                  onPress={() => {
                    if (atLimit) {
                      Alert.alert(
                        'Plan Pro / Élite requis',
                        'Le plan Starter est limité à 2 zones tarifaires.\n\nPassez au plan Pro ou Élite pour ajouter des zones illimitées.',
                        [{ text: 'OK' }]
                      );
                      return;
                    }
                    addTier();
                  }}
                  style={[styles.addBtn, atLimit && { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]}>
                  {atLimit ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <MaterialCommunityIcons name="lock-outline" size={14} color="#94A3B8" />
                      <Text style={{ color: '#94A3B8', fontFamily: F.semibold, fontSize: 14 }}>
                        2 zones max (Starter)
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ color: '#64748B', fontFamily: F.semibold, fontSize: 14 }}>+ Ajouter une zone</Text>
                  )}
                </TouchableOpacity>
              );
            })()}
            <TouchableOpacity onPress={() => {
              const hasInvalid = radiusTiers.some(t =>
                Number(t.price) < MIN_TARIF ||
                (t.satEnabled && Number(t.satPrice) < MIN_TARIF) ||
                (t.sunEnabled && Number(t.sunPrice) < MIN_TARIF) ||
                (t.holidayEnabled && Number(t.holidayPrice) < MIN_TARIF)
              );
              if (hasInvalid) {
                Alert.alert('Tarif invalide', `Le tarif minimum est de ${MIN_TARIF}€. Corrigez les zones en rouge avant d'enregistrer.`);
                return;
              }
              showToast();
            }} style={styles.saveBtn}>
              <Text style={{ color: '#fff', fontFamily: F.bold, fontSize: 16 }}>Enregistrer</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── PLANS ── */}
        {tab === 'plans' && (
          <>
            {PRO_PLANS.map(plan => (
              <View key={plan.id} style={[styles.planCard, {
                borderColor: plan.popular ? plan.color : BRAND.border,
                borderWidth: plan.popular ? 2 : 1,
                backgroundColor: plan.popular ? plan.color + '12' : BRAND.bgCard,
              }]}>
                {plan.popular && (
                  <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
                    <Text style={{ color: '#fff', fontSize: 11, fontFamily: F.bold }}>POPULAIRE</Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View>
                    <Text style={{ fontFamily: F.groteskBold, fontSize: 18, color: plan.color }}>{plan.name}</Text>
                    <Text style={{ fontFamily: F.regular, fontSize: 13, color: BRAND.textMuted, marginTop: 4 }}>Commission : {plan.commission}%</Text>
                  </View>
                  <Text style={{ fontFamily: F.groteskBold, fontSize: 26, color: BRAND.textPrimary }}>
                    {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                  </Text>
                </View>
                {plan.features.map((feat, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 }}>
                    <MaterialCommunityIcons name="check-circle-outline" size={14} color={plan.color} />
                    <Text style={{ fontFamily: F.regular, fontSize: 13, color: BRAND.textSecondary, flex: 1 }}>{feat}</Text>
                  </View>
                ))}
                <TouchableOpacity style={[styles.planBtn, { backgroundColor: plan.color }]}>
                  <Text style={{ color: '#fff', fontFamily: F.bold, fontSize: 14 }}>Choisir ce plan</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

      </ScrollView>

      <TerminateModal
        visible={showTerminateModal}
        onClose={() => setShowTerminateModal(false)}
        onConfirm={handleTerminate}
      />

      <InvoiceModal
        visible={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        intervention={selectedInvoiceIntervention}
        proUser={proUser}
      />
    </View>
  );
}

const invStyles = StyleSheet.create({
  // ── Modals partagés ──
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet:   { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36, width: '100%' },
  modalHandle:  { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 20 },
  modalTitle:   { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#0F172A' },
  fieldLabel:   { fontFamily: 'DMSans_700Bold', fontSize: 12, color: BRAND.textSecondary, marginBottom: 6 },
  input:        { backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: BRAND.border, borderRadius: 12, padding: 12, fontSize: 14, fontFamily: 'DMSans_400Regular', color: BRAND.textPrimary },
  photoPickBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: BRAND.cyan + '60', borderStyle: 'dashed', borderRadius: 12, padding: 14, marginBottom: 14, justifyContent: 'center' },
  confirmBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#16A34A', padding: 16, borderRadius: 16, elevation: 3, shadowColor: '#16A34A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  // ── Bouton terminer intervention ──
  terminateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#16A34A', borderRadius: 14, padding: 14, marginTop: 14, elevation: 2, shadowColor: '#16A34A', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6 },
  // ── Cartes historique ──
  histCard:       { backgroundColor: BRAND.bgCard, borderRadius: 16, borderWidth: 1, borderColor: BRAND.border, marginBottom: 10, overflow: 'hidden' },
  histHeader:     { flexDirection: 'row', alignItems: 'center', padding: 14 },
  histCatDot:     { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  histBody:       { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: BRAND.border },
  histRow:        { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  histRowText:    { fontFamily: 'DMSans_400Regular', fontSize: 13, color: BRAND.textSecondary, flex: 1 },
  histInvoiceBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, borderWidth: 1, borderColor: BRAND.cyan + '50', backgroundColor: BRAND.cyan + '10', padding: 11, marginTop: 14, justifyContent: 'center' },
  statusBadge:    { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: '#86EFAC', backgroundColor: '#DCFCE7', marginTop: 4 },
});

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  tabBar: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 6 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: 10, gap: 2 },
  tabActive: { backgroundColor: BRAND.cyan + '15' },
  toast: { position: 'absolute', top: 60, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: BRAND.success, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, zIndex: 100, elevation: 10 },
  dashCard: { background: BRAND.cyan, backgroundColor: BRAND.cyan, borderRadius: 20, padding: 24, marginBottom: 16 },
  statBox: { flex: 1, minWidth: '45%', backgroundColor: BRAND.bgCard, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: BRAND.border },
  urgCard: { backgroundColor: BRAND.bgCard, borderRadius: 18, padding: 18, marginBottom: 14 },
  dayDot: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 2 },
  dayEditor: { backgroundColor: BRAND.bgCard, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: BRAND.border, marginBottom: 20 },
  slotRow: { backgroundColor: BRAND.bg, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: BRAND.border },
  slotLabel: { fontSize: 10, fontFamily: 'DMSans_600SemiBold', color: BRAND.textMuted, textTransform: 'uppercase', marginBottom: 4 },
  removeBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: BRAND.danger + '20', justifyContent: 'center', alignItems: 'center' },
  addBtn: { width: '100%', paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, borderColor: BRAND.border, borderStyle: 'dashed', alignItems: 'center', marginBottom: 16 },
  saveBtn: { width: '100%', padding: 16, borderRadius: 16, backgroundColor: BRAND.success, alignItems: 'center', marginTop: 4, elevation: 3, shadowColor: BRAND.success, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  fieldLabel: { fontFamily: 'DMSans_700Bold', fontSize: 13, color: BRAND.textSecondary, marginBottom: 8 },
  // Adresse lecture seule
  addrReadOnly: { flexDirection: 'row', alignItems: 'center', backgroundColor: BRAND.bgCard, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: BRAND.border },
  addrEmpty: { flexDirection: 'row', alignItems: 'center', backgroundColor: BRAND.bgCard, borderRadius: 16, padding: 14, borderWidth: 1.5, borderColor: BRAND.border, borderStyle: 'dashed' },
  zoneMapCard: { backgroundColor: BRAND.bgCard, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: BRAND.border, marginBottom: 16 },
  tierCard: { backgroundColor: BRAND.bgCard, borderRadius: 18, padding: 18, marginBottom: 14 },
  tierInput: { padding: 8, borderRadius: 10, borderWidth: 1, borderColor: BRAND.border, fontSize: 15, fontFamily: 'SpaceGrotesk_700Bold', color: BRAND.textPrimary, backgroundColor: BRAND.bg, textAlign: 'center' },
  specialBlock: { backgroundColor: BRAND.bg, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: BRAND.border },
  expandBtn: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  commissionBadge: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 14, padding: 14, borderWidth: 1.5, marginBottom: 16 },
  planCard: { borderRadius: 16, padding: 20, marginBottom: 14, position: 'relative' },
  popularBadge: { position: 'absolute', top: -10, right: 16, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  planBtn: { marginTop: 16, padding: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  // Carte intervention en cours
  interventionCard: { backgroundColor: BRAND.bgCard, borderRadius: 20, padding: 18, borderWidth: 2, borderColor: BRAND.success + '40', marginBottom: 16 },
  offerBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  offerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderTopWidth: 1, borderTopColor: BRAND.border },
  offerText: { fontFamily: F.regular, fontSize: 13, color: BRAND.textSecondary, flex: 1 },
  contactRevealed: { marginTop: 12, backgroundColor: '#F0FDF4', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#BBF7D0' },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  contactIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: BRAND.cyan + '15', justifyContent: 'center', alignItems: 'center' },
  // TimePicker
  timeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: BRAND.border, backgroundColor: BRAND.bg },
  timeBtnText: { fontFamily: F.groteskBold, fontSize: 17, color: BRAND.textPrimary },
  timeModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  timeModalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', maxWidth: 360 },
  timeModalTitle: { fontFamily: F.groteskBold, fontSize: 18, color: BRAND.textPrimary, marginBottom: 18 },
  timePickerSect: { fontFamily: F.semibold, fontSize: 11, color: BRAND.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
  hoursGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeCell: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: BRAND.border, backgroundColor: BRAND.bg },
  timeCellSel: { backgroundColor: BRAND.cyan, borderColor: BRAND.cyan },
  timeCellText: { fontFamily: F.bold, fontSize: 14, color: BRAND.textPrimary },
  timeCellTextSel: { color: '#fff' },
  timeConfirmBtn: { backgroundColor: BRAND.success, paddingHorizontal: 22, paddingVertical: 13, borderRadius: 14 },
});
