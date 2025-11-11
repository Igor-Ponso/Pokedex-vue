// Tipos de composição para reutilização em toda a aplicação
export interface BaseComponentProps {
  class?: string | string[] | Record<string, boolean>;
  style?: string | Record<string, any>;
}

export interface LoadingState {
  loading: boolean;
  text?: string;
  type?: 'pokemon' | 'api' | 'initial';
  size?: 'small' | 'medium' | 'large';
}

export interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

export interface PokemonFilter {
  generation: number;
  types: string[];
  searchQuery: string;
}

export interface PokemonCard {
  id: number;
  name: string;
  types: {
    type: {
      name: string;
      url: string;
    };
  }[];
  height: number;
  weight: number;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  species?: any;
}

export interface PokemonWithSpecies extends PokemonCard {
  species?: any;
}

export interface FavoritePokemon {
  id: number;
  name: string;
  types: {
    type: {
      name: string;
      url: string;
    };
  }[];
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
}

export interface GameBoyModalProps {
  pokemon: PokemonCard;
  species?: any;
  isOpen: boolean;
}

export interface DarkModeState {
  isDark: boolean;
  toggleDarkMode: () => void;
}

export interface AudioState {
  isPlaying: boolean;
  playCry: () => void;
  stopCry: () => void;
}

export interface CryPlayerProps {
  pokemonId: number;
  autoPlay?: boolean;
}

export interface TeamState {
  favorites: number[];
  pokemons: FavoritePokemon[];
  isFull: boolean;
  isEmpty: boolean;
  addFavorite: (pokemonId: number) => void;
  removeFavorite: (pokemonId: number) => void;
  clearFavorites: () => void;
}

export interface ModalState {
  isOpen: boolean;
  pokemon: PokemonCard | null;
  pokemonId: number | null;
  openModal: (pokemon: PokemonCard) => void;
  closeModal: () => void;
}

export interface UIState {
  loading: LoadingState;
  toast: ToastOptions;
  darkMode: DarkModeState;
  audio: AudioState;
  team: TeamState;
  modal: ModalState;
}