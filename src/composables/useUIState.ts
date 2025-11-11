import { useAppToast } from '@/composables/useAppToast';
import { UIState } from '@/types';
import { computed, reactive } from 'vue';

// Estado global da UI
const uiState = reactive<UIState>({
  loading: {
    loading: false,
    text: '',
    type: 'pokemon',
    size: 'medium'
  },
  toast: {
    message: '',
    type: 'info',
    duration: 3000,
    position: 'top-right'
  },
  darkMode: {
    isDark: false,
    toggleDarkMode: () => {
      uiState.darkMode.isDark = !uiState.darkMode.isDark;
      localStorage.setItem('darkMode', uiState.darkMode.isDark.toString());
    }
  },
  audio: {
    isPlaying: false,
    playCry: () => {
      // Implementação será feita pelo componente específico
    },
    stopCry: () => {
      // Implementação será feita pelo componente específico
    }
  },
  team: {
    favorites: [],
    pokemons: [],
    isFull: false,
    isEmpty: true,
    addFavorite: (pokemonId: number) => {
      if (uiState.team.favorites.length < 6) {
        uiState.team.favorites.push(pokemonId);
        uiState.team.isEmpty = false;
        uiState.team.isFull = uiState.team.favorites.length >= 6;
      }
    },
    removeFavorite: (pokemonId: number) => {
      const index = uiState.team.favorites.indexOf(pokemonId);
      if (index !== -1) {
        uiState.team.favorites.splice(index, 1);
        uiState.team.isEmpty = uiState.team.favorites.length === 0;
        uiState.team.isFull = false;
      }
    },
    clearFavorites: () => {
      uiState.team.favorites = [];
      uiState.team.isEmpty = true;
      uiState.team.isFull = false;
    }
  },
  modal: {
    isOpen: false,
    pokemon: null,
    pokemonId: null,
    openModal: (pokemon: any) => {
      uiState.modal.isOpen = true;
      uiState.modal.pokemon = pokemon;
      uiState.modal.pokemonId = pokemon.id;
    },
    closeModal: () => {
      uiState.modal.isOpen = false;
      uiState.modal.pokemon = null;
      uiState.modal.pokemonId = null;
    }
  }
});

// Computed properties para facilitar o acesso
const isLoading = computed(() => uiState.loading.loading);
const isDarkMode = computed(() => uiState.darkMode.isDark);
const isAudioPlaying = computed(() => uiState.audio.isPlaying);
const favoritesCount = computed(() => uiState.team.favorites.length);
const isTeamFull = computed(() => uiState.team.isFull);
const isTeamEmpty = computed(() => uiState.team.isEmpty);
const isModalOpen = computed(() => uiState.modal.isOpen);

// Inicialização do dark mode a partir do localStorage
if (typeof window !== 'undefined') {
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode !== null) {
    uiState.darkMode.isDark = savedDarkMode === 'true';
  }
}

// Funções de atualização do estado
const setLoading = (loading: boolean, text?: string, type?: 'pokemon' | 'api' | 'initial', size?: 'small' | 'medium' | 'large') => {
  uiState.loading.loading = loading;
  if (text) uiState.loading.text = text;
  if (type) uiState.loading.type = type;
  if (size) uiState.loading.size = size;
};

const showToast = (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number, position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center') => {
  uiState.toast.message = message;
  if (type) uiState.toast.type = type;
  if (duration) uiState.toast.duration = duration;
  if (position) uiState.toast.position = position;
  // Dispara toast usando wrapper centralizado
  useAppToast().show({
    message,
    type: type || uiState.toast.type,
    duration: duration || uiState.toast.duration,
    position: position || uiState.toast.position
  });
};

const setAudioPlaying = (isPlaying: boolean) => {
  uiState.audio.isPlaying = isPlaying;
};

export const useUIState = () => {
  return {
    // Estado reativo
    uiState,
    
    // Computed properties
    isLoading,
    isDarkMode,
    isAudioPlaying,
    favoritesCount,
    isTeamFull,
    isTeamEmpty,
    isModalOpen,
    
    // Actions
    setLoading,
    showToast,
    setAudioPlaying,
    
    // Acesso direto às seções
    loading: uiState.loading,
    toast: uiState.toast,
    darkMode: uiState.darkMode,
    audio: uiState.audio,
    team: uiState.team,
    modal: uiState.modal
  };
};