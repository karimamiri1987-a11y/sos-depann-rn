// ─── Tour de France — 23 équipes × 8 coureurs = 184 coureurs ──────────────
// Numérotation des dossards : équipe i (0-based), coureur j (0-based)
//   dossard = i * 10 + (j + 1)
//   → équipe 1 : 1..8, équipe 2 : 11..18, équipe 3 : 21..28, etc.
// Le chiffre des unités du dossard = la position dans l'équipe (1 à 8).
//   • dossard finissant par 1 = le leader / favori de l'équipe
//   • dossard finissant par 2 = 2ᵉ coureur, etc.
// Le premier coureur de chaque équipe (slot 0) est le favori.

const TEAMS = [
  { name: 'UAE Team Emirates',          flag: '🇦🇪', riders: ['Tadej Pogačar', 'João Almeida', 'Adam Yates', 'Juan Ayuso', 'Marc Soler', 'Tim Wellens', 'Nils Politt', 'Pavel Sivakov'] },
  { name: 'Visma | Lease a Bike',       flag: '🇳🇱', riders: ['Jonas Vingegaard', 'Wout van Aert', 'Sepp Kuss', 'Matteo Jorgenson', 'Tiesj Benoot', 'Christophe Laporte', 'Wilco Kelderman', 'Jan Tratnik'] },
  { name: 'Soudal Quick-Step',          flag: '🇧🇪', riders: ['Remco Evenepoel', 'Mikel Landa', 'Tim Merlier', 'Kasper Asgreen', 'Yves Lampaert', 'Ilan Van Wilder', 'Mattia Cattaneo', 'Bert Van Lerberghe'] },
  { name: 'Red Bull–BORA–hansgrohe',    flag: '🇩🇪', riders: ['Primož Roglič', 'Aleksandr Vlasov', 'Daniel Martínez', 'Jai Hindley', 'Bob Jungels', 'Danny van Poppel', 'Nico Denz', 'Marco Haller'] },
  { name: 'INEOS Grenadiers',           flag: '🇬🇧', riders: ['Carlos Rodríguez', 'Tom Pidcock', 'Egan Bernal', 'Geraint Thomas', 'Michał Kwiatkowski', 'Jonathan Castroviejo', 'Jhonatan Narváez', 'Ben Turner'] },
  { name: 'Movistar Team',              flag: '🇪🇸', riders: ['Enric Mas', 'Nairo Quintana', 'Alex Aranburu', 'Gorka Izagirre', 'Iván García Cortina', 'Ruben Guerreiro', 'Albert Torres', 'Will Barta'] },
  { name: 'Groupama–FDJ',               flag: '🇫🇷', riders: ['David Gaudu', 'Stefan Küng', 'Valentin Madouas', 'Romain Grégoire', 'Lenny Martinez', 'Quentin Pacher', 'Kévin Geniets', 'Clément Davy'] },
  { name: 'Decathlon AG2R La Mondiale', flag: '🇫🇷', riders: ['Felix Gall', "Ben O'Connor", 'Sam Bennett', 'Aurélien Paret-Peintre', 'Oliver Naesen', 'Clément Berthet', 'Bastien Tronchon', 'Andrea Vendrame'] },
  { name: 'Alpecin–Deceuninck',         flag: '🇧🇪', riders: ['Mathieu van der Poel', 'Jasper Philipsen', 'Kaden Groves', 'Silvan Dillier', 'Søren Kragh Andersen', 'Gianni Vermeersch', 'Jonas Rickaert', 'Quinten Hermans'] },
  { name: 'Lidl–Trek',                  flag: '🇺🇸', riders: ['Mads Pedersen', 'Jonathan Milan', 'Giulio Ciccone', 'Tao Geoghegan Hart', 'Mattias Skjelmose', 'Toms Skujiņš', 'Jasper Stuyven', 'Tony Gallopin'] },
  { name: 'Intermarché–Wanty',          flag: '🇧🇪', riders: ['Biniam Girmay', 'Louis Meintjes', 'Georg Zimmermann', 'Mike Teunissen', 'Hugo Page', 'Rui Costa', 'Laurenz Rex', 'Adrien Petit'] },
  { name: 'Team Jayco AlUla',           flag: '🇦🇺', riders: ['Simon Yates', 'Dylan Groenewegen', 'Michael Matthews', 'Luke Plapp', 'Eddie Dunbar', 'Chris Harper', 'Luka Mezgec', 'Elmar Reinders'] },
  { name: 'Astana Qazaqstan',           flag: '🇰🇿', riders: ['Mark Cavendish', 'Alexey Lutsenko', 'Cees Bol', 'Harold Tejada', 'Davide Ballerini', 'Yevgeniy Fedorov', 'Michele Gazzoli', 'Simone Velasco'] },
  { name: 'EF Education–EasyPost',      flag: '🇺🇸', riders: ['Richard Carapaz', 'Neilson Powless', 'Ben Healy', 'Alberto Bettiol', 'Stefan Bissegger', 'Marijn van den Berg', 'Rui Oliveira', 'James Shaw'] },
  { name: 'Bahrain Victorious',         flag: '🇧🇭', riders: ['Pello Bilbao', 'Wout Poels', 'Matej Mohorič', 'Phil Bauhaus', 'Jack Haig', 'Santiago Buitrago', 'Nikias Arndt', 'Fred Wright'] },
  { name: 'Team dsm-firmenich PostNL',  flag: '🇳🇱', riders: ['Romain Bardet', 'Fabio Jakobsen', 'Warren Barguil', 'John Degenkolb', 'Frank van den Broek', 'Pavel Bittner', 'Sean Flynn', 'Niklas Märkl'] },
  { name: 'Cofidis',                    flag: '🇫🇷', riders: ['Guillaume Martin', 'Bryan Coquard', 'Ion Izagirre', 'Victor Lafay', 'Axel Zingle', 'Alexis Renard', 'Simon Geschke', 'Benjamin Thomas'] },
  { name: 'Arkéa–B&B Hotels',           flag: '🇫🇷', riders: ['Kévin Vauquelin', 'Arnaud Démare', 'Cristián Rodríguez', 'Luca Mozzato', 'Clément Russo', 'Amaury Capiot', 'Ewen Costiou', 'Matîs Louvel'] },
  { name: 'Israel–Premier Tech',        flag: '🇮🇱', riders: ['Michael Woods', 'Stevie Williams', 'Derek Gee', 'Hugo Houle', 'Corbin Strong', 'Pascal Ackermann', 'Krists Neilands', 'Nick Schultz'] },
  { name: 'TotalEnergies',              flag: '🇫🇷', riders: ['Anthony Turgis', 'Mathieu Burgaudeau', 'Steff Cras', 'Valentin Ferron', 'Sandy Dujardin', 'Geoffrey Soupe', 'Alexandre Delettre', 'Daniel Oss'] },
  { name: 'Lotto Dstny',                flag: '🇧🇪', riders: ['Arnaud De Lie', 'Maxim Van Gils', 'Victor Campenaerts', 'Lennert Van Eetvelt', 'Jasper De Buyst', 'Florian Vermeersch', 'Brent Van Moer', 'Jacopo Guarnieri'] },
  { name: 'Uno-X Mobility',             flag: '🇳🇴', riders: ['Alexander Kristoff', 'Tobias Halland Johannessen', 'Magnus Cort', 'Jonas Abrahamsen', 'Søren Wærenskjold', 'Andreas Leknessund', 'Rasmus Tiller', 'Markus Hoelgaard'] },
  { name: 'Tudor Pro Cycling',          flag: '🇨🇭', riders: ['Julian Alaphilippe', 'Marc Hirschi', 'Matteo Trentin', 'Michael Storer', 'Alberto Dainese', 'Fabian Lienhard', 'Yannis Voisard', 'Maikel Zijlaard'] },
];

export const NB_EQUIPES = TEAMS.length;       // 23
export const COUREURS_PAR_EQUIPE = 8;
export const NB_COUREURS = NB_EQUIPES * COUREURS_PAR_EQUIPE; // 184

export const TDF_TEAMS = TEAMS.map((t, i) => ({ id: `t${i + 1}`, ...t }));

// Liste à plat des coureurs avec dossard, équipe et slot (position dans l'équipe)
export const TDF_RIDERS = TEAMS.flatMap((team, ti) =>
  team.riders.map((name, ri) => {
    const bib = ti * 10 + (ri + 1);
    return {
      id: `r${bib}`,
      name,
      team: team.name,
      flag: team.flag,
      bib,
      slot: ri,
      isFavorite: ri === 0,
    };
  })
);

export const getRiderById = (id) => TDF_RIDERS.find(r => r.id === id);

// Coureurs regroupés par slot (utile pour le tirage) : index 0 → favoris, etc.
export const RIDERS_BY_SLOT = Array.from({ length: COUREURS_PAR_EQUIPE }, (_, slot) =>
  TDF_RIDERS.filter(r => r.slot === slot)
);
