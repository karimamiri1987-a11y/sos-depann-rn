export const TDF_STAGES = [
  { id: 's1',  num: 1,  from: 'Lille',          to: 'Lille',              type: 'CLM',       km: 13,  },
  { id: 's2',  num: 2,  from: 'Lille',           to: 'Boulogne-sur-Mer',  type: 'Plat',      km: 204, },
  { id: 's3',  num: 3,  from: 'Boulogne',        to: 'Reims',             type: 'Plat',      km: 195, },
  { id: 's4',  num: 4,  from: 'Reims',           to: 'Nancy',             type: 'Plat',      km: 181, },
  { id: 's5',  num: 5,  from: 'Nancy',           to: 'Épinal',            type: 'Accidenté', km: 163, },
  { id: 's6',  num: 6,  from: 'Épinal',          to: 'Mulhouse',          type: 'Montagne',  km: 178, },
  { id: 's7',  num: 7,  from: 'Mulhouse',        to: 'La Super Planche',  type: 'Montagne',  km: 171, },
  { id: 's8',  num: 8,  from: 'Remiremont',      to: 'Dijon',             type: 'Plat',      km: 198, },
  { id: 's9',  num: 9,  from: 'Dijon',           to: 'Châlon-sur-Saône', type: 'Plat',      km: 160, },
  { id: 's10', num: 10, from: 'Mâcon',           to: 'Valence',           type: 'Plat',      km: 167, },
  { id: 's11', num: 11, from: 'Montélimar',      to: 'Montpellier',       type: 'Plat',      km: 174, },
  { id: 's12', num: 12, from: 'Montpellier',     to: 'Carcassonne',       type: 'Accidenté', km: 163, },
  { id: 's13', num: 13, from: 'Carcassonne',     to: 'Foix',              type: 'Montagne',  km: 174, },
  { id: 's14', num: 14, from: 'Foix',            to: 'Peyragudes',        type: 'Montagne',  km: 152, },
  { id: 's15', num: 15, from: 'Luchon',          to: 'Pau',               type: 'Plat',      km: 198, },
  { id: 's16', num: 16, from: 'Pau',             to: 'Cauterets',         type: 'Montagne',  km: 188, },
  { id: 's17', num: 17, from: 'Bayonne',         to: 'Bordeaux',          type: 'Plat',      km: 211, },
  { id: 's18', num: 18, from: 'Bordeaux',        to: 'Libourne',          type: 'CLM',       km: 33,  },
  { id: 's19', num: 19, from: 'Périgueux',       to: 'Clermont-Ferrand',  type: 'Accidenté', km: 185, },
  { id: 's20', num: 20, from: 'Issoire',         to: 'Le Puy-de-Dôme',   type: 'Montagne',  km: 133, },
  { id: 's21', num: 21, from: 'Saint-Quentin-en-Yvelines', to: 'Paris Champs-Élysées', type: 'Plat', km: 121 },
];

export const STAGE_TYPE_ICON = {
  'Plat':      '🟢',
  'Accidenté': '🟡',
  'Montagne':  '🔴',
  'CLM':       '⏱️',
};

export const getStageById = (id) => TDF_STAGES.find(s => s.id === id);
