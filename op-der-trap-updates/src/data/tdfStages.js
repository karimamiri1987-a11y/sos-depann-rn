// ─── Tour de France 2026 — 113ᵉ édition ──────────────────────────────────
// Grand Départ à Barcelone (4 juillet), arrivée à Paris (26 juillet).
// 21 étapes · 3 333 km · 7 plates · 4 accidentées · 8 montagne · 2 CLM.
// Étapes plates (sprint massif) : 5, 7, 8, 9, 11, 13, 17.
export const TDF_STAGES = [
  { id: 's1',  num: 1,  date: '4 juil.',  from: 'Barcelone',          to: 'Barcelone',            type: 'CLM',       km: 19,  },
  { id: 's2',  num: 2,  date: '5 juil.',  from: 'Tarragone',          to: 'Barcelone',            type: 'Accidenté', km: 182, },
  { id: 's3',  num: 3,  date: '6 juil.',  from: 'Granollers',         to: 'Les Angles',           type: 'Montagne',  km: 196, },
  { id: 's4',  num: 4,  date: '7 juil.',  from: 'Carcassonne',        to: 'Foix',                 type: 'Montagne',  km: 182, },
  { id: 's5',  num: 5,  date: '8 juil.',  from: 'Lannemezan',         to: 'Pau',                  type: 'Plat',      km: 158, },
  { id: 's6',  num: 6,  date: '9 juil.',  from: 'Pau',                to: 'Gavarnie-Gèdre',       type: 'Montagne',  km: 186, },
  { id: 's7',  num: 7,  date: '10 juil.', from: 'Hagetmau',           to: 'Bordeaux',             type: 'Plat',      km: 175, },
  { id: 's8',  num: 8,  date: '11 juil.', from: 'Périgueux',          to: 'Bergerac',             type: 'Plat',      km: 182, },
  { id: 's9',  num: 9,  date: '12 juil.', from: 'Malemort',           to: 'Ussel',                type: 'Plat',      km: 185, },
  { id: 's10', num: 10, date: '14 juil.', from: 'Aurillac',           to: 'Le Lioran',            type: 'Montagne',  km: 167, },
  { id: 's11', num: 11, date: '15 juil.', from: 'Vichy',              to: 'Nevers',               type: 'Plat',      km: 161, },
  { id: 's12', num: 12, date: '16 juil.', from: 'Magny-Cours',        to: 'Chalon-sur-Saône',     type: 'Accidenté', km: 179, },
  { id: 's13', num: 13, date: '17 juil.', from: 'Dole',               to: 'Belfort',              type: 'Plat',      km: 206, },
  { id: 's14', num: 14, date: '18 juil.', from: 'Mulhouse',           to: 'Le Markstein',         type: 'Accidenté', km: 155, },
  { id: 's15', num: 15, date: '19 juil.', from: 'Champagnole',        to: 'Plateau de Solaison',  type: 'Montagne',  km: 184, },
  { id: 's16', num: 16, date: '21 juil.', from: 'Évian-les-Bains',    to: 'Thonon-les-Bains',     type: 'CLM',       km: 26,  },
  { id: 's17', num: 17, date: '22 juil.', from: 'Chambéry',           to: 'Voiron',               type: 'Plat',      km: 175, },
  { id: 's18', num: 18, date: '23 juil.', from: 'Voiron',             to: 'Orcières-Merlette',    type: 'Montagne',  km: 185, },
  { id: 's19', num: 19, date: '24 juil.', from: 'Gap',                to: "Alpe d'Huez",          type: 'Montagne',  km: 128, },
  { id: 's20', num: 20, date: '25 juil.', from: "Le Bourg-d'Oisans",  to: "Alpe d'Huez",          type: 'Montagne',  km: 171, },
  { id: 's21', num: 21, date: '26 juil.', from: 'Thoiry',             to: 'Paris Champs-Élysées', type: 'Accidenté', km: 133, },
];

export const STAGE_TYPE_ICON = {
  'Plat':      '🟢',
  'Accidenté': '🟡',
  'Montagne':  '🔴',
  'CLM':       '⏱️',
};

export const getStageById = (id) => TDF_STAGES.find(s => s.id === id);
