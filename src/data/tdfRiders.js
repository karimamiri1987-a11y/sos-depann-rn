export const TDF_RIDERS = [
  { id: 'r1',  name: 'Tadej Pogačar',        team: 'UAE Team Emirates',        flag: '🇸🇮', specialty: 'GC' },
  { id: 'r2',  name: 'Jonas Vingegaard',      team: 'Visma-Lease a Bike',       flag: '🇩🇰', specialty: 'GC' },
  { id: 'r3',  name: 'Remco Evenepoel',       team: 'Soudal Quick-Step',        flag: '🇧🇪', specialty: 'GC/CLM' },
  { id: 'r4',  name: 'Primož Roglič',         team: 'Red Bull-Bora-Hansgrohe',  flag: '🇸🇮', specialty: 'GC' },
  { id: 'r5',  name: 'Carlos Rodríguez',      team: 'INEOS Grenadiers',         flag: '🇪🇸', specialty: 'GC' },
  { id: 'r6',  name: 'Enric Mas',             team: 'Movistar Team',            flag: '🇪🇸', specialty: 'GC' },
  { id: 'r7',  name: 'David Gaudu',           team: 'Groupama-FDJ',             flag: '🇫🇷', specialty: 'GC' },
  { id: 'r8',  name: "Ben O'Connor",          team: 'AG2R La Mondiale',         flag: '🇦🇺', specialty: 'GC' },
  { id: 'r9',  name: 'Wout van Aert',         team: 'Visma-Lease a Bike',       flag: '🇧🇪', specialty: 'Classique' },
  { id: 'r10', name: 'Mathieu van der Poel',  team: 'Alpecin-Deceuninck',       flag: '🇳🇱', specialty: 'Classique' },
  { id: 'r11', name: 'Jasper Philipsen',      team: 'Alpecin-Deceuninck',       flag: '🇧🇪', specialty: 'Sprinter' },
  { id: 'r12', name: 'Biniam Girmay',         team: 'Intermarché-Wanty',        flag: '🇪🇷', specialty: 'Sprinter' },
  { id: 'r13', name: 'Mads Pedersen',         team: 'Lidl-Trek',                flag: '🇩🇰', specialty: 'Classique' },
  { id: 'r14', name: 'Julian Alaphilippe',    team: 'Soudal Quick-Step',        flag: '🇫🇷', specialty: 'Classique' },
  { id: 'r15', name: 'Christophe Laporte',    team: 'Visma-Lease a Bike',       flag: '🇫🇷', specialty: 'Sprinter' },
  { id: 'r16', name: 'Mark Cavendish',        team: 'Astana Qazaqstan',         flag: '🇮🇲', specialty: 'Sprinter' },
  { id: 'r17', name: 'Simon Yates',           team: 'Team Jayco-AlUla',         flag: '🇬🇧', specialty: 'Grimpeur' },
  { id: 'r18', name: 'Felix Gall',            team: 'AG2R La Mondiale',         flag: '🇦🇹', specialty: 'Grimpeur' },
  { id: 'r19', name: 'Guillaume Martin',      team: 'Cofidis',                  flag: '🇫🇷', specialty: 'Grimpeur' },
  { id: 'r20', name: 'Neilson Powless',       team: 'EF Education-EasyPost',    flag: '🇺🇸', specialty: 'Baroudeur' },
];

export const getRiderById = (id) => TDF_RIDERS.find(r => r.id === id);
