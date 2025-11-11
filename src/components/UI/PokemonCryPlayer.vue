<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

interface Props {
  pokemonId: number;
  autoPlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoPlay: false
});

const emit = defineEmits<{
  (e: 'play-start'): void;
  (e: 'play-end'): void;
}>();

const isPlaying = ref(false);
const audioRef = ref<HTMLAudioElement | null>(null);

const cryUrl = computed(() => {
  return `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${props.pokemonId}.ogg`;
});

const playCry = () => {
  if (!audioRef.value || isPlaying.value) return;
  
  isPlaying.value = true;
  audioRef.value.play();
  emit('play-start');
  
  audioRef.value.onended = () => {
    isPlaying.value = false;
    emit('play-end');
  };
};

const stopCry = () => {
  if (!audioRef.value || !isPlaying.value) return;
  
  audioRef.value.pause();
  audioRef.value.currentTime = 0;
  isPlaying.value = false;
};

// Auto-play on mount if requested
onMounted(() => {
  audioRef.value = new Audio();
  audioRef.value.src = cryUrl.value;
  
  audioRef.value.addEventListener('ended', () => {
    isPlaying.value = false;
    emit('play-end');
  });
  
  audioRef.value.addEventListener('error', (e) => {
    console.error('Error loading Pokemon cry:', e);
    isPlaying.value = false;
  });
  
  if (props.autoPlay) {
    // Small delay to ensure audio is loaded
    setTimeout(() => {
      playCry();
    }, 500);
  }
});

onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause();
    audioRef.value = null;
  }
});

// Expose methods for parent component
defineExpose({
  playCry,
  stopCry,
  isPlaying
});
</script>

<template>
  <div class="cry-player">
    <button 
      class="cry-button"
      @click="isPlaying ? stopCry() : playCry()"
      :disabled="!cryUrl"
      :class="{ playing: isPlaying }"
    >
      <span class="cry-icon">
        {{ isPlaying ? '🔊' : '🔈' }}
      </span>
      <span class="cry-text">
        {{ isPlaying ? 'Parar' : 'Tocar CRY' }}
      </span>
    </button>
    
    <!-- Hidden audio element -->
    <audio 
      ref="audioRef" 
      :src="cryUrl" 
      preload="none"
    />
  </div>
</template>

<style scoped>
.cry-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.cry-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 2rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--primary-font);
  font-weight: 600;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.playing {
    background: rgba(255, 67, 87, 0.2);
    border-color: rgba(255, 67, 87, 0.5);
    animation: pulse 1.5s infinite;
  }
}

.cry-icon {
  font-size: 1.5rem;
  animation: bounce 1.5s infinite alternate;
}

.cry-text {
  font-size: 0.9rem;
  font-weight: 500;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 67, 87, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(255, 67, 87, 0.8);
  }
}

@media (max-width: 768px) {
  .cry-button {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
  
  .cry-icon {
    font-size: 1.2rem;
  }
  
  .cry-text {
    font-size: 0.8rem;
  }
}
</style>