export interface PokemonEntries {
  base_happiness: number;
  capture_rate: number;
  color: Colors;
  egg_groups: EggGroups[];
  evolution_chain: {
    url: string;
  };
  evolves_from_species: {
    name: string;
    url: string;
  };
  flavor_text_entries: FlavorTextEntry[];
}

export interface EggGroups {
  name: string;
  url: string;
}

export interface FlavorTextEntry {
  flavor_text: string;
  language: Language;
  version: Version;
}

export interface Colors {
  name: string;
  url: string;
}

export interface Language {
  name: string;
  url: string;
}

export interface Version {
  name: string;
  url: string;
}
