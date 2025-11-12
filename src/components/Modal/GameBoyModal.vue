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
  toggleShiny: [];
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

  // Busca até 3 entradas de texto diferentes na língua atual para ter mais conteúdo
  const targetLang = locale.value === 'pt' ? 'en' : locale.value;

  const entries = props.pokemonEntries.flavor_text_entries
    .filter(entry => entry.language?.name === targetLang)
    .slice(0, 3)  // Pega até 3 entradas
    .map(entry => entry.flavor_text)
    .filter((text, index, self) => self.indexOf(text) === index); // Remove duplicatas

  if (entries.length > 0) {
    return entries.join(' ');
  }

  // Fallback para inglês
  const englishEntries = props.pokemonEntries.flavor_text_entries
    .filter(entry => entry.language?.name === 'en')
    .slice(0, 3)
    .map(entry => entry.flavor_text)
    .filter((text, index, self) => self.indexOf(text) === index);

  return englishEntries.join(' ') || 'No description available';
});

const primaryType = computed(() => props.pokemonData.types[0]?.type.name || 'normal');

// Função para obter a cor da barra de stat baseada no tipo de stat
const getStatColor = (statName: string, value: number) => {
  const intensity = value / 255; // Normaliza entre 0 e 1

  const statColors: Record<string, { low: string; mid: string; high: string }> = {
    'hp': {
      low: '#ef4444',  // red
      mid: '#f59e0b',  // amber
      high: '#22c55e'  // green
    },
    'attack': {
      low: '#f59e0b',  // amber
      mid: '#f97316',  // orange
      high: '#dc2626'  // red
    },
    'defense': {
      low: '#3b82f6',  // blue
      mid: '#06b6d4',  // cyan
      high: '#0891b2'  // cyan dark
    },
    'special-attack': {
      low: '#a855f7',  // purple
      mid: '#8b5cf6',  // violet
      high: '#6366f1'  // indigo
    },
    'special-defense': {
      low: '#10b981',  // emerald
      mid: '#14b8a6',  // teal
      high: '#06b6d4'  // cyan
    },
    'speed': {
      low: '#f59e0b',  // amber
      mid: '#eab308',  // yellow
      high: '#84cc16'  // lime
    }
  };

  const colors = statColors[statName] || statColors['hp'];

  if (intensity < 0.4) {
    return `linear-gradient(90deg, ${colors.low} 0%, ${colors.low} 100%)`;
  } else if (intensity < 0.7) {
    return `linear-gradient(90deg, ${colors.low} 0%, ${colors.mid} 50%, ${colors.high} 100%)`;
  } else {
    return `linear-gradient(90deg, ${colors.mid} 0%, ${colors.high} 100%)`;
  }
};

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
    <!-- Número do Pokémon em fade gigante de fundo -->
    <div class="pokemon-number-bg">
      #{{ padWithLeadingZeros(pokemonData.id, 4) }}
    </div>

    <!-- Botão fechar com z-index correto -->
    <button @click="emit('close')" class="close-btn" aria-label="Close">✕</button>

    <!-- Container principal -->
    <div class="modal-content">
      <!-- Header com nome, types, número e botões -->
      <div class="pokemon-header">
        <div class="header-top">
          <div class="name-types-container">
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
            <span class="pokemon-number-display">#{{ padWithLeadingZeros(pokemonData.id, 3) }}</span>
            <button
              class="cry-btn"
              @click="playCry"
              :disabled="audioPlaying"
              :class="{ playing: audioPlaying }"
              :title="audioPlaying ? 'Playing cry...' : 'Play cry'"
            >
              <span class="cry-icon">{{ audioPlaying ? '🔊' : '🔉' }}</span>
            </button>
            <button class="shiny-btn" @click="emit('toggleShiny')" title="Toggle shiny form">
              <v-icon name="bi-stars" fill="white" scale="1.2" />
            </button>
          </div>
        </div>
      </div>

      <!-- Grid principal -->
      <div class="modal-grid">
        <!-- Coluna esquerda - Info -->
        <div class="left-column">
          <!-- Info básica (weight, height, abilities) em uma linha -->
          <div class="basic-info-section">
            <div class="info-item">
              <span class="label">{{ t('pokemon.weight').toUpperCase() }}</span>
              <span class="value">{{ (pokemonData.weight / 10).toFixed(1) }}KG</span>
            </div>
            <div class="info-item">
              <span class="label">{{ t('pokemon.height').toUpperCase() }}</span>
              <span class="value">{{ (pokemonData.height / 10).toFixed(1) }}M</span>
            </div>
            <div class="info-item abilities-inline">
              <span class="label">{{ t('pokemon.abilities').toUpperCase() }}</span>
              <div class="abilities-compact">
                <span v-for="(ability, index) in pokemonData.abilities" :key="ability.ability.name">
                  {{ ability.ability.name.toUpperCase() }}<span v-if="index < pokemonData.abilities.length - 1">, </span>
                </span>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="stats-section">
            <span class="section-title">{{ t('pokemon.stats').toUpperCase() }}</span>
            <div class="stats-list">
              <div v-for="stat in pokemonData.stats" :key="stat.stat.name" class="stat-item">
                <span class="stat-name">{{ stat.stat.name.toUpperCase().replace('-', ' ') }}</span>
                <div class="stat-bar-container">
                  <div class="stat-bar">
                    <div
                      class="stat-bar-fill"
                      :style="{
                        width: (stat.base_stat / 255 * 100) + '%',
                        background: getStatColor(stat.stat.name, stat.base_stat)
                      }"
                    ></div>
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
  max-width: 1200px;
  max-height: 90vh;
  border-radius: 1.5rem;
  padding: 2.5rem;
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
  font-size: clamp(8rem, 15vw, 12rem);
  font-weight: 900;
  color: rgba(255, 255, 255, 0.15);
  text-shadow:
    3px 3px 10px rgba(0,0,0,0.3),
    -1px -1px 4px rgba(255, 255, 255, 0.15);
  z-index: 0;
  pointer-events: none;
  user-select: none;
  letter-spacing: 0.05em;
  line-height: 1;
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
  display: flex;
  flex-direction: column;
  gap: 2rem;
  height: 100%;
}

.pokemon-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.name-types-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.pokemon-name {
  font-family: var(--retro-font);
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  text-transform: uppercase;
  color: white;
  margin: 0;
  text-shadow:
    3px 3px 0px rgba(0,0,0,0.6),
    -1px -1px 0px rgba(255,255,255,0.4);
  letter-spacing: 0.1em;
  white-space: nowrap;
  line-height: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.pokemon-number-display {
  font-family: var(--retro-font);
  font-size: clamp(1rem, 2.5vw, 1.4rem);
  color: white;
  text-shadow: 3px 3px 0px rgba(0,0,0,0.6);
  background: rgba(0, 0, 0, 0.3);
  padding: 0.7rem 1.2rem;
  border-radius: 2rem;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  white-space: nowrap;
  letter-spacing: 0.05em;
}

.cry-btn,
.shiny-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.8rem;
  height: 2.8rem;
  padding: 0;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  color: white;
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

  .cry-icon {
    font-size: 1.2rem;
  }
}

.cry-btn.playing {
  background: rgba(255, 215, 0, 0.4);
  border-color: gold;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
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
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
  flex: 1;
  min-height: 0;
  align-items: start;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.basic-info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 1.2rem;
  border-radius: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;

  &.abilities-inline {
    grid-column: 1 / -1;
  }
}

.label {
  font-family: var(--retro-font);
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.85);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.value {
  font-family: var(--retro-font);
  font-size: 1.1rem;
  color: white;
  text-shadow: 2px 2px 0px rgba(0,0,0,0.6);
}

.abilities-compact {
  font-family: var(--retro-font);
  font-size: 0.8rem;
  color: white;
  text-shadow: 2px 2px 0px rgba(0,0,0,0.6);
  line-height: 1.4;
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  border-radius: 1rem;
  transition: width 0.6s ease, background 0.3s ease;
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
  min-height: 300px;
}

.pokemon-image {
  width: 100%;
  height: auto;
  max-width: 600px;
  filter: drop-shadow(0 20px 50px rgba(0, 0, 0, 0.7));
  animation: float 3s ease-in-out infinite;
  transform-origin: center;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.02);
  }
}

.description-section {
  background: rgba(0, 0, 0, 0.4);
  border-radius: 1.2rem;
  padding: 2rem;
  backdrop-filter: blur(15px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  max-height: 180px;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    margin: 0.5rem 0;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;

    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
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

@media (max-width: 1024px) {
  .modal-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .right-column {
    order: -1;
    min-height: 250px;
  }

  .pokemon-image {
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .gameboy-modal {
    padding: 1.5rem;
    max-height: 95vh;
    width: 95%;
  }

  .close-btn {
    top: 1rem;
    right: 1rem;
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.2rem;
  }

  .pokemon-header {
    margin-bottom: 1rem;
    padding-bottom: 0.8rem;
  }

  .header-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }

  .name-types-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.7rem;
    width: 100%;
  }

  .pokemon-name {
    font-size: clamp(1.3rem, 6vw, 2rem);
    letter-spacing: 0.08em;
    white-space: normal;
    word-break: break-word;
  }

  .pokemon-types {
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .type-badge-modal {
    padding: 0.5rem 1rem;
    font-size: 0.6rem;
    gap: 0.4rem;
  }

  .type-icon-modal {
    width: 1.2rem;
    height: 1.2rem;
  }

  .pokemon-number-btn {
    padding: 0.6rem 1rem;
    align-self: flex-start;

    .cry-icon {
      font-size: 1rem;
    }

    .pokemon-number {
      font-size: 0.9rem;
    }
  }

  .modal-grid {
    gap: 1rem;
  }

  .left-column {
    gap: 1.2rem;
  }

  .basic-info-section {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .right-column {
    min-height: 200px;
  }

  .pokemon-image {
    max-width: 300px;
  }

  .stats-section {
    gap: 0.8rem;
  }

  .stat-item {
    font-size: 0.6rem;
  }

  .stat-bar {
    height: 0.8rem;
  }

  .description-section {
    padding: 1.2rem;
    max-height: 150px;
  }

  .description-text {
    font-size: 0.65rem;
    line-height: 1.7;
  }
}

@media (max-width: 480px) {
  .gameboy-modal {
    padding: 1rem;
    max-height: 98vh;
  }

  .pokemon-name {
    font-size: 1.2rem;
  }

  .basic-info-section {
    grid-template-columns: 1fr;
    gap: 0.8rem;
    padding: 0.8rem;
  }

  .pokemon-image {
    max-width: 250px;
  }

  .label {
    font-size: 0.6rem;
  }

  .value {
    font-size: 0.95rem;
  }

  .abilities-compact {
    font-size: 0.7rem;
  }
}
</style>
