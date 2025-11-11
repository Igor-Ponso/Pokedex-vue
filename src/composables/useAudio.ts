import { audioService } from '@/services/AudioService';
import { ref } from 'vue';

// Composable para encapsular AudioService com estado reativo
export function useAudio() {
  const isPlaying = ref(false);
  const currentId = ref<number | null>(null);
  const error = ref<string | null>(null);

  const playCry = async (pokemonId: number) => {
    error.value = null;
    try {
      currentId.value = pokemonId;
      isPlaying.value = true;
      await audioService.playPokemonCry(pokemonId);
    } catch (e: any) {
      error.value = e?.message || 'Erro ao reproduzir áudio';
    } finally {
      isPlaying.value = false;
    }
  };

  const stopCry = () => {
    audioService.stopCurrentAudio();
    isPlaying.value = false;
  };

  const clearCache = () => {
    audioService.clearCache();
  };

  const cacheInfo = () => audioService.getCacheInfo();

  return {
    // state
    isPlaying,
    currentId,
    error,
    // actions
    playCry,
    stopCry,
    clearCache,
    cacheInfo,
  };
}
