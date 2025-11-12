<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface Generation {
  id: number;
  name: string;
  range: [number, number];
  region: string;
  color: string;
  starters: [number, number, number]; // [grass, fire, water]
}

const generations: Generation[] = [
  { id: 1, name: 'I', range: [1, 151], region: 'Kanto', color: '#FF6B6B', starters: [1, 4, 7] }, // Bulbasaur, Charmander, Squirtle
  { id: 2, name: 'II', range: [152, 251], region: 'Johto', color: '#4ECDC4', starters: [152, 155, 158] }, // Chikorita, Cyndaquil, Totodile
  { id: 3, name: 'III', range: [252, 386], region: 'Hoenn', color: '#45B7D1', starters: [252, 255, 258] }, // Treecko, Torchic, Mudkip
  { id: 4, name: 'IV', range: [387, 493], region: 'Sinnoh', color: '#96CEB4', starters: [387, 390, 393] }, // Turtwig, Chimchar, Piplup
  { id: 5, name: 'V', range: [494, 649], region: 'Unova', color: '#FFEAA7', starters: [495, 498, 501] }, // Snivy, Tepig, Oshawott
  { id: 6, name: 'VI', range: [650, 721], region: 'Kalos', color: '#DFE6E9', starters: [650, 653, 656] }, // Chespin, Fennekin, Froakie
  { id: 7, name: 'VII', range: [722, 809], region: 'Alola', color: '#74B9FF', starters: [722, 725, 728] }, // Rowlet, Litten, Popplio
  { id: 8, name: 'VIII', range: [810, 905], region: 'Galar', color: '#A29BFE', starters: [810, 813, 816] }, // Grookey, Scorbunny, Sobble
  { id: 9, name: 'IX', range: [906, 1025], region: 'Paldea', color: '#FD79A8', starters: [906, 909, 912] } // Sprigatito, Fuecoco, Quaxly
];

const getStarterImageUrl = (pokemonId: number) => {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
};

const getRegionBackground = (region: string) => {
  return new URL(`../../assets/svgs/regions/region_bg_${region.toLowerCase()}.svg`, import.meta.url).href;
};

const noiseOverlay = new URL('../../assets/svgs/regions/noise_overlay.png', import.meta.url).href;

const pokemonTypes = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

interface Props {
  modelValue: {
    generation: number;
    types: string[];
    searchQuery: string;
  };
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const emit = defineEmits<{
  'update:modelValue': [value: {
    generation: number;
    types: string[];
    searchQuery: string;
  }];
}>();

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const searchInput = ref(props.modelValue.searchQuery || '');
const showSearchModal = ref(false);
const showTypesModal = ref(false);

// Debounce da busca
const handleSearchDebounced = useDebounceFn(() => {
  localValue.value = {
    ...localValue.value,
    searchQuery: searchInput.value
  };
}, 500);

watch(searchInput, () => {
  handleSearchDebounced();
});

const toggleType = (type: string) => {
  const types = [...localValue.value.types];
  const index = types.indexOf(type);

  if (index === -1) {
    types.push(type);
  } else {
    types.splice(index, 1);
  }

  localValue.value = {
    ...localValue.value,
    types
  };
};

const selectGeneration = (genId: number) => {
  localValue.value = {
    ...localValue.value,
    generation: genId
  };
};

const typeIcons = import.meta.glob('@/assets/svgs/type/*.svg', { eager: true, import: 'default' }) as Record<string, string>;

const getTypeIcon = (type: string) => {
  const key = `/src/assets/svgs/type/${type}.svg`;
  return typeIcons[key] || '';
};

const selectedGeneration = computed(() =>
  generations.find(g => g.id === localValue.value.generation)
);
</script>

<template>
  <div class="modern-filters">
    <!-- Actions Row -->
    <div class="actions-row">
      <!-- Search Button -->
      <button class="action-btn search-btn" @click="showSearchModal = true">
        <span class="btn-icon">🔍</span>
        <span class="btn-label">Search</span>
        <span v-if="searchInput" class="active-indicator"></span>
      </button>

      <!-- Types Button -->
      <button class="action-btn types-btn" @click="showTypesModal = true">
        <span class="btn-icon">⚡</span>
        <span class="btn-label">Types</span>
        <span v-if="localValue.types.length > 0" class="count-badge">{{ localValue.types.length }}</span>
      </button>
    </div>

    <!-- Generation Selector - Melhorado -->
    <div class="generation-section">
      <div class="generation-grid">
        <button
          v-for="gen in generations"
          :key="gen.id"
          class="gen-card"
          :class="{ active: localValue.generation === gen.id }"
          :style="{
            '--gen-color': gen.color,
            '--gen-bg': `url(${getRegionBackground(gen.region)})`
          }"
          @click="selectGeneration(gen.id)"
          :disabled="loading"
        >
          <!-- Camada 1: SVG pixelado da região -->
          <div class="pixel-bg-layer"></div>
          <!-- Camada 2: Radial branco translúcido -->
          <div class="radial-overlay"></div>
          <!-- Camada 3: Textura de ruído -->
          <div class="noise-layer" :style="{ backgroundImage: `url(${noiseOverlay})` }"></div>
          <!-- Camada 4: Filme linear -->
          <div class="linear-film"></div>

          <div class="starters-container">
            <img
              v-for="(starterId, index) in gen.starters"
              :key="starterId"
              :src="getStarterImageUrl(starterId)"
              :alt="`Starter ${starterId}`"
              class="starter-image"
              :class="`starter-${index}`"
              loading="lazy"
            />
          </div>
          <div class="gen-info">
            <span class="gen-region">{{ gen.region }}</span>
            <span class="gen-range">#{{ gen.range[0] }}-{{ gen.range[1] }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Search Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showSearchModal" class="modal-overlay" @click="showSearchModal = false">
          <div class="modal-content glass" @click.stop>
            <div class="modal-header">
              <h3>Search Pokémon</h3>
              <button class="close-btn" @click="showSearchModal = false">✕</button>
            </div>
            <div class="modal-body">
              <div class="search-input-wrapper">
                <span class="search-icon">🔍</span>
                <input
                  v-model="searchInput"
                  type="text"
                  placeholder="Search by name or number..."
                  class="search-modal-input"
                  autofocus
                  @keyup.esc="showSearchModal = false"
                />
                <button
                  v-if="searchInput"
                  class="clear-search"
                  @click="searchInput = ''"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Types Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showTypesModal" class="modal-overlay" @click="showTypesModal = false">
          <div class="modal-content glass types-modal" @click.stop>
            <div class="modal-header">
              <h3>Select Types</h3>
              <button class="close-btn" @click="showTypesModal = false">✕</button>
            </div>
            <div class="modal-body">
              <div class="types-grid">
                <button
                  v-for="type in pokemonTypes"
                  :key="type"
                  class="type-card"
                  :class="{ selected: localValue.types.includes(type) }"
                  :style="{ '--type-color': `var(--color-${type})` }"
                  @click="toggleType(type)"
                >
                  <img
                    v-if="getTypeIcon(type)"
                    :src="getTypeIcon(type)"
                    :alt="type"
                    class="type-icon"
                  />
                  <span class="type-name">{{ type }}</span>
                  <span v-if="localValue.types.includes(type)" class="check">✓</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modern-filters {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.actions-row {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.action-btn {
  position: relative;
  padding: 1rem 2rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  color: white;
  font-family: var(--primary-font);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.8rem;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
}

.btn-icon {
  font-size: 1.4rem;
}

.btn-label {
  letter-spacing: 0.05em;
}

.active-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 10px #4ade80;
  animation: pulse 2s ease-in-out infinite;
}

.count-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.5rem;
  border-radius: 1rem;
  background: rgba(59, 130, 246, 0.8);
  font-size: 0.75rem;
  font-weight: 700;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Generation Grid - Melhorado */
.generation-section {
  width: 100%;
}

.generation-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  max-width: 100%;
}

.gen-card {
  position: relative;
  padding: 1rem 1.2rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  gap: 1rem;
  overflow: hidden;
  min-height: 100px;

  &:hover:not(:disabled) {
    transform: translateY(-6px);
    border-color: var(--gen-color);
    box-shadow:
      0 12px 32px rgba(0, 0, 0, 0.3),
      0 0 0 3px var(--gen-color),
      0 0 30px var(--gen-color);

    .pixel-bg-layer {
      transform: translateX(8px) scale(1.05);
    }

    .radial-overlay {
      opacity: 0.9;
    }

    .noise-layer {
      opacity: 0.15;
    }

    .starter-image {
      &.starter-0 {
        transform: scale(1.15);
      }
      &.starter-1 {
        transform: translateX(-50%) scale(1.3);
      }
      &.starter-2 {
        transform: scale(1.15);
      }
    }
  }

  &.active {
    border-color: var(--gen-color);
    box-shadow:
      0 0 0 3px var(--gen-color),
      0 0 40px var(--gen-color),
      0 12px 40px rgba(0, 0, 0, 0.4);
    transform: translateY(-2px);

    .pixel-bg-layer {
      transform: scale(1.1);
    }

    .radial-overlay {
      opacity: 1;
    }

    .starter-image {
      filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.8));
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.pixel-bg-layer {
  position: absolute;
  inset: 0;
  background-image: var(--gen-bg);
  background-size: cover;
  background-position: center;
  opacity: 0.6;
  transition: all 0.5s ease;
  z-index: 0;
}

.radial-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 40% 50%, rgba(255, 255, 255, 0.4), transparent 70%);
  opacity: 0.7;
  transition: opacity 0.5s ease;
  z-index: 1;
}

.noise-layer {
  position: absolute;
  inset: 0;
  background-repeat: repeat;
  background-size: 200px 200px;
  opacity: 0.08;
  mix-blend-mode: overlay;
  transition: opacity 0.5s ease;
  z-index: 2;
  pointer-events: none;
}

.linear-film {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(0, 0, 0, 0.1) 100%);
  z-index: 3;
  pointer-events: none;
}

.starters-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 130px;
  height: 75px;
  z-index: 1;
}

.starter-image {
  position: absolute;
  width: 70px;
  height: 70px;
  object-fit: contain;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.4));

  &.starter-0 {
    left: 0;
    z-index: 1;
  }

  &.starter-1 {
    left: 50%;
    transform: translateX(-50%) scale(1.15);
    z-index: 3;
  }

  &.starter-2 {
    right: 0;
    z-index: 2;
  }
}

.gen-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  position: relative;
  z-index: 4;
  flex: 1;
}

.gen-region {
  font-family: var(--primary-font);
  font-size: 1.5rem;
  color: white;
  font-weight: 900;
  filter: drop-shadow(2px 2px 6px rgba(0, 0, 0, 0.9))
          drop-shadow(0 0 8px rgba(0, 0, 0, 0.8));
  letter-spacing: 0.05em;
  line-height: 1.1;
}

.gen-range {
  font-size: 0.9rem;
  color: white;
  font-family: var(--retro-font);
  font-weight: 700;
  filter: drop-shadow(1px 1px 4px rgba(0, 0, 0, 0.9))
          drop-shadow(0 0 6px rgba(0, 0, 0, 0.7));
  letter-spacing: 0.03em;
  opacity: 0.95;
}

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  border-radius: 2rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.glass {
  background: rgba(20, 30, 48, 0.95);
  backdrop-filter: blur(30px);
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    font-family: var(--retro-font);
    font-size: 1.5rem;
    color: white;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }
}

.close-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(239, 68, 68, 0.3);
    transform: rotate(90deg);
  }
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
}

/* Search Modal */
.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1.5rem;
  font-size: 1.5rem;
  z-index: 1;
}

.search-modal-input {
  width: 100%;
  padding: 1.2rem 4rem 1.2rem 4rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  font-size: 1.1rem;
  font-family: var(--primary-font);
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.6);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }
}

.clear-search {
  position: absolute;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;

  &:hover {
    background: rgba(239, 68, 68, 0.4);
  }
}

/* Types Modal */
.types-modal {
  max-width: 700px;
}

.types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.type-card {
  position: relative;
  padding: 1.2rem;
  border: 3px solid transparent;
  border-radius: 1.2rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  &.selected {
    border-color: var(--type-color);
    background: linear-gradient(135deg, var(--type-color) 0%, transparent 100%);
    box-shadow: 0 0 20px var(--type-color), 0 8px 24px rgba(0, 0, 0, 0.5);
  }
}

.type-icon {
  width: 2.5rem;
  height: 2.5rem;
  filter: brightness(0) invert(1) drop-shadow(2px 2px 4px rgba(0,0,0,0.5));
}

.type-name {
  color: white;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: capitalize;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
}

.check {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: #4ade80;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(74, 222, 128, 0.5);
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(-20px);
}

@media (max-width: 1200px) {
  .generation-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
  }
}

@media (max-width: 768px) {
  .generation-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }

  .gen-card {
    min-height: 90px;
    padding: 0.8rem 1rem;
    gap: 0.8rem;
  }

  .starters-container {
    width: 100px;
    height: 60px;
  }

  .starter-image {
    width: 52px;
    height: 52px;

    &.starter-1 {
      transform: translateX(-50%) scale(1.1);
    }
  }

  .gen-region {
    font-size: 1.2rem;
  }

  .gen-range {
    font-size: 0.8rem;
  }

  .types-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .actions-row {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
