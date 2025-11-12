<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
import { computed, ref, watch } from 'vue';

interface Generation {
  id: number;
  name: string;
  range: [number, number];
  region: string;
  starters: [number, number, number]; // [grass, fire, water]
}

const generations: Generation[] = [
  { id: 1, name: 'Kanto', range: [1, 151], region: 'Kanto', starters: [1, 4, 7] }, // Bulbasaur, Charmander, Squirtle
  { id: 2, name: 'Johto', range: [152, 251], region: 'Johto', starters: [152, 155, 158] }, // Chikorita, Cyndaquil, Totodile
  { id: 3, name: 'Hoenn', range: [252, 386], region: 'Hoenn', starters: [252, 255, 258] }, // Treecko, Torchic, Mudkip
  { id: 4, name: 'Sinnoh', range: [387, 493], region: 'Sinnoh', starters: [387, 390, 393] }, // Turtwig, Chimchar, Piplup
  { id: 5, name: 'Unova', range: [494, 649], region: 'Unova', starters: [495, 498, 501] }, // Snivy, Tepig, Oshawott
  { id: 6, name: 'Kalos', range: [650, 721], region: 'Kalos', starters: [650, 653, 656] }, // Chespin, Fennekin, Froakie
  { id: 7, name: 'Alola', range: [722, 809], region: 'Alola', starters: [722, 725, 728] }, // Rowlet, Litten, Popplio
  { id: 8, name: 'Galar', range: [810, 905], region: 'Galar', starters: [810, 813, 816] }, // Grookey, Scorbunny, Sobble
  { id: 9, name: 'Paldea', range: [906, 1025], region: 'Paldea', starters: [906, 909, 912] } // Sprigatito, Fuecoco, Quaxly
];

const getStarterImageUrl = (pokemonId: number) => {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
};

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

interface Emits {
  (e: 'update:modelValue', value: {
    generation: number;
    types: string[];
    searchQuery: string;
  }): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const emit = defineEmits<Emits>();

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const searchInput = ref(props.modelValue.searchQuery || '');

// Debounce da busca por 500ms
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

const clearFilters = () => {
  localValue.value = {
    generation: 1,
    types: [],
    searchQuery: ''
  };
  searchInput.value = '';
};

const getTypeGradient = (type: string) => {
  return `linear-gradient(135deg, var(--color-${type}) 0%, var(--color-type-${type}) 100%)`;
};

// Pré-carrega ícones de tipo
const typeIcons = import.meta.glob('@/assets/svgs/type/*.svg', { eager: true, import: 'default' }) as Record<string, string>;

const getTypeIcon = (type: string) => {
  const key = `/src/assets/svgs/type/${type}.svg`;
  return typeIcons[key] || '';
};
</script>

<template>
  <div class="generation-filter">
    <div class="filter-section">
      <h3 class="filter-title">🎮 Gerações</h3>
      <div class="generation-grid">
        <button
          v-for="gen in generations"
          :key="gen.id"
          class="generation-btn"
          :class="{ active: localValue.generation === gen.id, loading: loading }"
          @click="localValue = { ...localValue, generation: gen.id }"
          :disabled="loading"
        >
          <div class="gen-header">
            <span class="gen-number">GEN {{ gen.id }}</span>
            <span class="gen-name">{{ gen.name }}</span>
          </div>
          <div class="starters-container">
            <img
              v-for="starterId in gen.starters"
              :key="starterId"
              :src="getStarterImageUrl(starterId)"
              :alt="`Starter ${starterId}`"
              class="starter-image"
              loading="lazy"
            />
          </div>
          <span class="gen-range">#{{ gen.range[0] }}-#{{ gen.range[1] }}</span>
        </button>
      </div>
    </div>

    <div class="filter-section">
      <h3 class="filter-title">⚡ Tipos</h3>
      <div class="type-grid">
        <button
          v-for="type in pokemonTypes"
          :key="type"
          class="type-btn"
          :class="{ active: localValue.types.includes(type) }"
          :style="{ background: getTypeGradient(type) }"
          @click="toggleType(type)"
          :disabled="loading"
        >
          <img 
            v-if="getTypeIcon(type)"
            :src="getTypeIcon(type)" 
            :alt="type"
            class="type-icon"
          />
          <span class="type-name">{{ type }}</span>
        </button>
      </div>
    </div>

    <div class="filter-section">
      <h3 class="filter-title">🔍 Busca</h3>
      <div class="search-container">
        <input
          v-model="searchInput"
          type="text"
          placeholder="Buscar por nome ou número..."
          class="search-input"
          :disabled="loading"
        />
        <div class="search-indicator" v-if="searchInput && loading">
          <span class="spinner"></span>
        </div>
      </div>
      <p class="search-hint">A busca é atualizada automaticamente</p>
    </div>

    <div class="filter-actions">
      <button 
        class="clear-btn"
        @click="clearFilters"
        :disabled="loading"
      >
        🗑️ Limpar Filtros
      </button>
    </div>
  </div>
</template>

<style scoped>
.generation-filter {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideInUp 0.5s ease;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-section {
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.filter-title {
  font-family: var(--retro-font);
  font-size: 0.9rem;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.generation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.8rem;
}

.generation-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.8rem;
  padding: 0.8rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  min-height: 160px;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:hover:not(:disabled)::before {
    width: 300px;
    height: 300px;
  }

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-4px) scale(1.03);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);

    .starter-image {
      transform: scale(1.1) translateY(-3px);
    }
  }

  &.active {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(139, 92, 246, 0.4));
    border-color: rgba(59, 130, 246, 0.8);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5),
                0 0 20px rgba(59, 130, 246, 0.3);
    transform: scale(1.03);

    .starter-image {
      filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
    }
  }

  &.loading {
    animation: pulse 1.5s infinite;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.gen-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  width: 100%;
  z-index: 1;
}

.starters-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.3rem;
  height: 70px;
  position: relative;
  z-index: 1;
  margin: 0.3rem 0;
}

.starter-image {
  width: 50px;
  height: 50px;
  object-fit: contain;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));

  &:nth-child(2) {
    transform: scale(1.15);
    z-index: 2;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.gen-number {
  font-family: var(--retro-font);
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 700;
  position: relative;
  z-index: 1;
}

.gen-name {
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  font-size: 0.9rem;
  position: relative;
  z-index: 1;
}

.gen-range {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  position: relative;
  z-index: 1;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.6rem;
}

.type-btn {
  border: 2px solid transparent;
  border-radius: 0.8rem;
  padding: 0.7rem 0.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.5);
    
    &::before {
      opacity: 0;
    }
  }
  
  &.active {
    transform: scale(1.08);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5),
                inset 0 -2px 10px rgba(255, 255, 255, 0.3);
    border-color: white;
    
    &::before {
      opacity: 0;
    }
    
    .type-icon {
      animation: bounce 0.6s ease;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.type-icon {
  width: 1.5rem;
  height: 1.5rem;
  filter: brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
  transition: transform 0.3s ease;
}

.type-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
  text-transform: capitalize;
  position: relative;
  z-index: 1;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.search-input {
  flex: 1;
  padding: 0.9rem 1.2rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.8);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.search-indicator {
  position: absolute;
  right: 1rem;
  display: flex;
  align-items: center;
}

.spinner {
  width: 1.2rem;
  height: 1.2rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.search-hint {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.5rem;
  font-style: italic;
}

.filter-actions {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.clear-btn {
  padding: 0.8rem 1.5rem;
  border: 2px solid rgba(255, 67, 87, 0.5);
  border-radius: 0.8rem;
  background: rgba(255, 67, 87, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    background: rgba(255, 67, 87, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 67, 87, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@media (max-width: 768px) {
  .generation-filter {
    padding: 1rem;
  }

  .generation-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.6rem;
  }

  .generation-btn {
    min-height: 140px;
    padding: 0.6rem;
  }

  .starters-container {
    height: 55px;
    gap: 0.2rem;
  }

  .starter-image {
    width: 40px;
    height: 40px;

    &:nth-child(2) {
      transform: scale(1.1);
    }
  }

  .gen-number {
    font-size: 0.65rem;
  }

  .gen-name {
    font-size: 0.8rem;
  }

  .gen-range {
    font-size: 0.65rem;
  }

  .type-grid {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }

  .filter-title {
    font-size: 0.8rem;
  }
}
</style>
