<script setup lang="ts">
import { Pokemon } from '@/interfaces/Pokemon';
import { PokemonEntries } from '@/interfaces/PokemonEntries';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  pokemonData: Pokemon;
  pokemonEntries?: PokemonEntries;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { locale, t } = useI18n();
const audioPlaying = ref(false);

// Pré-carrega ícones de tipo
const typeIcons = import.meta.glob('@/assets/svgs/type/*.svg', { eager: true, import: 'default' }) as Record<string, string>;

const getTypeIcon = (typeName: string) => {
  const key = `/src/assets/svgs/type/${typeName}.svg`;
  return typeIcons[key] || '';
};

const padWithLeadingZeros = (num: number, totalLength: number) => {
  return String(num).padStart(totalLength, '0');
};

const flavorText = computed(() => {
  if (!props.pokemonEntries?.flavor_text_entries) return 'A bewitching aroma wafts from its flower. The fragrance becalms those engaged in a battle.';

  // Busca pela língua atual
  const currentLangEntry = props.pokemonEntries.flavor_text_entries.find(
    entry => entry.language?.name === (locale.value === 'pt' ? 'en' : locale.value)
  );

  const englishEntry = props.pokemonEntries.flavor_text_entries.find(
    entry => entry.language?.name === 'en'
  );

  return currentLangEntry?.flavor_text || englishEntry?.flavor_text || props.pokemonEntries.flavor_text_entries[0]?.flavor_text || 'No description available';
});

const primaryType = computed(() => props.pokemonData.types[0]?.type.name || 'normal');

const playCry = async () => {
  if (audioPlaying.value) return;

  try {
    audioPlaying.value = true;
    const audio = new Audio(props.pokemonData.cries.latest || props.pokemonData.cries.legacy);
    audio.volume = 0.3;
    await audio.play();
    audio.onended = () => {
      audioPlaying.value = false;
    };
  } catch (error) {
    console.error('Error playing cry:', error);
    audioPlaying.value = false;
  }
};

// Prevenir scroll no body quando modal está aberto
onMounted(() => {
  document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<template>
  <div class="gameboy-modal" :style="{
    background: `linear-gradient(135deg, var(--color-${primaryType}) 0%, var(--color-type-${primaryType}) 100%)`
  }">
    <!-- Número do Pokémon em fade gigante melhorado -->
    <div class="pokemon-number-bg">
      #{{ padWithLeadingZeros(pokemonData.id, 4) }}
    </div>

    <!-- Botão fechar com z-index correto -->
    <button @click="emit('close')" class="close-btn" aria-label="Close">✕</button>

    <!-- Container principal -->
    <div class="modal-content">
      <!-- Header com nome, número e cry button -->
      <div class="pokemon-header">
        <div class="header-left">
          <h2 class="pokemon-name">{{ pokemonData.name.toUpperCase() }}</h2>
          <div class="pokemon-types">
            <div
              v-for="typeItem in pokemonData.types"
              :key="typeItem.type.name"
              class="type-badge-modal"
              :style="{ background: `var(--color-type-${typeItem.type.name})` }"
            >
              <img
                v-if="getTypeIcon(typeItem.type.name)"
                :src="getTypeIcon(typeItem.type.name)"
                :alt="typeItem.type.name"
                class="type-icon-modal"
              />
              <span>{{ typeItem.type.name.toUpperCase() }}</span>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <span class="pokemon-number-header">#{{ padWithLeadingZeros(pokemonData.id, 3) }}</span>
          <button
            class="cry-btn"
            @click="playCry"
            :disabled="audioPlaying"
            :class="{ playing: audioPlaying }"
          >
            <span class="cry-icon">{{ audioPlaying ? '🔊' : '🔉' }}</span>
            <span class="cry-label">{{ t('pokemon.cry') }}</span>
          </button>
        </div>
      </div>

      <!-- Grid principal -->
      <div class="modal-grid">
        <!-- Coluna esquerda - Info -->
        <div class="left-column">
          <div class="info-section">
            <div class="info-item">
              <span class="label">{{ t('pokemon.weight').toUpperCase() }}</span>
              <span class="value">{{ (pokemonData.weight / 10).toFixed(1) }}KG</span>
            </div>
            <div class="info-item">
              <span class="label">{{ t('pokemon.height').toUpperCase() }}</span>
              <span class="value">{{ (pokemonData.height / 10).toFixed(1) }}M</span>
            </div>
          </div>

          <div class="abilities-section">
            <span class="section-title">{{ t('pokemon.abilities').toUpperCase() }}</span>
            <div class="abilities-list">
              <span v-for="(ability, index) in pokemonData.abilities" :key="ability.ability.name">
                {{ ability.ability.name.toUpperCase() }}
              </span>
            </div>
          </div>

          <div class="stats-section">
            <span class="section-title">{{ t('pokemon.stats').toUpperCase() }}</span>
            <div class="stats-list">
              <div v-for="stat in pokemonData.stats" :key="stat.stat.name" class="stat-item">
                <span class="stat-name">{{ stat.stat.name.toUpperCase().replace('-', ' ') }}</span>
                <div class="stat-bar-container">
                  <div class="stat-bar">
                    <div class="stat-bar-fill" :style="{ width: (stat.base_stat / 255 * 100) + '%' }"></div>
                  </div>
                  <span class="stat-value">{{ stat.base_stat }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Coluna direita - Imagem maior -->
        <div class="right-column">
          <img
            :src="pokemonData.sprites.other['official-artwork'].front_default"
            :alt="pokemonData.name"
            class="pokemon-image"
          />
        </div>
      </div>

      <!-- Descrição -->
      <div class="description-section">
        <p class="description-text">{{ flavorText }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gameboy-modal {
  position: relative;
  width: 90%;
  max-width: 1400px;
  max-height: 85vh;
  border-radius: 1.5rem;
  padding: 3rem;
  overflow: hidden;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    inset 0 -2px 10px rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
}

.pokemon-number-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--retro-font);
  font-size: clamp(6rem, 18vw, 18rem);
  font-weight: 900;
  color: rgba(255, 255, 255, 0.12);
  text-shadow:
    2px 2px 8px rgba(0,0,0,0.2),
    -1px -1px 4px rgba(255, 255, 255, 0.1);
  z-index: 0;
  pointer-events: none;
  user-select: none;
  letter-spacing: 0.05em;
  line-height: 1;
  opacity: 0.8;
}

.close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: rgba(0, 0, 0, 0.4);
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 0, 0, 0.6);
    border-color: rgba(255, 255, 255, 0.8);
    transform: scale(1.15) rotate(90deg);
    box-shadow: 0 8px 20px rgba(0,0,0,0.4);
  }
}

.modal-content {
  position: relative;
  z-index: 1;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  padding-right: 0.5rem;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;

    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
}

.pokemon-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 3px solid rgba(255, 255, 255, 0.4);
  gap: 2rem;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.pokemon-name {
  font-family: var(--retro-font);
  font-size: clamp(1.8rem, 5vw, 3rem);
  text-transform: uppercase;
  color: white;
  margin: 0;
  text-shadow:
    4px 4px 0px rgba(0,0,0,0.6),
    -1px -1px 0px rgba(255,255,255,0.4);
  letter-spacing: 0.15em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.cry-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 2rem;
  color: white;
  font-family: var(--retro-font);
  font-size: 0.65rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.8);
    transform: scale(1.1);
    box-shadow: 0 8px 20px rgba(0,0,0,0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.playing {
    background: rgba(255, 215, 0, 0.4);
    border-color: gold;
    animation: pulse 1s infinite;
  }

  .cry-icon {
    font-size: 1.2rem;
  }

  .cry-label {
    letter-spacing: 0.1em;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.pokemon-number-header {
  font-family: var(--retro-font);
  font-size: clamp(1rem, 3vw, 1.8rem);
  color: white;
  text-shadow: 3px 3px 0px rgba(0,0,0,0.6);
  background: rgba(0, 0, 0, 0.3);
  padding: 0.8rem 1.5rem;
  border-radius: 2rem;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  white-space: nowrap;
}

.pokemon-types {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.type-badge-modal {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 2rem;
  border: 2px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(5px);
  font-family: var(--retro-font);
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
  text-shadow: 2px 2px 0px rgba(0,0,0,0.6);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.4);
  }
}

.type-icon-modal {
  width: 1.4rem;
  height: 1.4rem;
  filter: brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}

.modal-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 3rem;
  margin-bottom: 2rem;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.info-section {
  display: flex;
  gap: 2.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.label {
  font-family: var(--retro-font);
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.value {
  font-family: var(--retro-font);
  font-size: 1.2rem;
  color: white;
  text-shadow: 3px 3px 0px rgba(0,0,0,0.6);
}

.abilities-section,
.stats-section {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.section-title {
  font-family: var(--retro-font);
  font-size: 0.9rem;
  color: white;
  text-shadow: 2px 2px 0px rgba(0,0,0,0.6);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.abilities-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  font-family: var(--retro-font);
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.95);
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-family: var(--retro-font);
  font-size: 0.65rem;
  color: white;
}

.stat-name {
  opacity: 0.9;
  letter-spacing: 0.05em;
}

.stat-bar-container {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.stat-bar {
  flex: 1;
  height: 1rem;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.stat-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80 0%, #22c55e 50%, #16a34a 100%);
  border-radius: 1rem;
  transition: width 0.6s ease;
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.4);
}

.stat-value {
  font-weight: bold;
  text-shadow: 2px 2px 0px rgba(0,0,0,0.6);
  min-width: 2.5rem;
  text-align: right;
}

.right-column {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.pokemon-image {
  width: 100%;
  height: auto;
  max-width: 500px;
  filter: drop-shadow(0 15px 40px rgba(0, 0, 0, 0.6));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-25px);
  }
}

.description-section {
  background: rgba(0, 0, 0, 0.4);
  border-radius: 1.2rem;
  padding: 2rem;
  backdrop-filter: blur(15px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.description-text {
  font-family: var(--retro-font);
  font-size: 0.7rem;
  line-height: 2;
  color: white;
  margin: 0;
  text-shadow: 2px 2px 0px rgba(0,0,0,0.6);
  text-align: center;
}

@media (max-width: 768px) {
  .gameboy-modal {
    padding: 2rem 1.5rem;
  }

  .modal-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .pokemon-number-bg {
    font-size: 10rem;
    top: 40%;
  }

  .info-section {
    flex-direction: column;
    gap: 1.5rem;
  }

  .pokemon-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
