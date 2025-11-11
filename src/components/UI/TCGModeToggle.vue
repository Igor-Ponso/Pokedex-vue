<script setup lang="ts">
import { usePokemonStore } from '@/stores/PokemonStore';
import { storeToRefs } from 'pinia';

const pokemonStore = usePokemonStore();
const { tcgMode } = storeToRefs(pokemonStore);

const handleToggle = async () => {
  await pokemonStore.toggleTCGMode();
};
</script>

<template>
  <button
    class="tcg-mode-toggle"
    @click="handleToggle"
    :class="{ active: tcgMode }"
    :aria-label="tcgMode ? 'Switch to Pokedex Mode' : 'Switch to TCG Mode'"
    :title="tcgMode ? 'Switch to Pokedex Mode' : 'Switch to TCG Mode'"
  >
    <span class="toggle-icon">
      <span v-if="!tcgMode">🎴</span>
      <span v-else>📱</span>
    </span>
    <span class="toggle-label">{{ tcgMode ? 'Pokedex' : 'TCG' }}</span>
  </button>
</template>

<style scoped>
.tcg-mode-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 2rem;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--primary-font);
  font-weight: 500;
  color: white;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.active {
    background: rgba(255, 215, 0, 0.3);
    border-color: rgba(255, 215, 0, 0.5);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
  }
}

.toggle-icon {
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.toggle-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
}

@media (max-width: 768px) {
  .tcg-mode-toggle {
    padding: 0.4rem 0.8rem;
  }

  .toggle-icon {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 1rem;
  }

  .toggle-label {
    font-size: 0.7rem;
  }
}
</style>
