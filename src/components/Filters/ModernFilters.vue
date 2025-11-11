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
}

const generations: Generation[] = [
  { id: 1, name: 'I', range: [1, 151], region: 'Kanto', color: '#FF6B6B' },
  { id: 2, name: 'II', range: [152, 251], region: 'Johto', color: '#4ECDC4' },
  { id: 3, name: 'III', range: [252, 386], region: 'Hoenn', color: '#45B7D1' },
  { id: 4, name: 'IV', range: [387, 493], region: 'Sinnoh', color: '#96CEB4' },
  { id: 5, name: 'V', range: [494, 649], region: 'Unova', color: '#FFEAA7' },
  { id: 6, name: 'VI', range: [650, 721], region: 'Kalos', color: '#DFE6E9' },
  { id: 7, name: 'VII', range: [722, 809], region: 'Alola', color: '#74B9FF' },
  { id: 8, name: 'VIII', range: [810, 905], region: 'Galar', color: '#A29BFE' },
  { id: 9, name: 'IX', range: [906, 1025], region: 'Paldea', color: '#FD79A8' }
];

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
            '--gen-color': gen.color
          }"
          @click="selectGeneration(gen.id)"
          :disabled="loading"
        >
          <div class="gen-number" :style="{ background: gen.color }">
            {{ gen.name }}
          </div>
          <div class="gen-details">
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
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  max-width: 100%;
}

.gen-card {
  position: relative;
  padding: 1.2rem;
  border: 3px solid transparent;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 0%, var(--gen-color), transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-6px) scale(1.03);
    border-color: var(--gen-color);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), 0 0 40px var(--gen-color);

    &::before {
      opacity: 0.2;
    }
  }

  &.active {
    background: rgba(255, 255, 255, 0.15);
    border-color: var(--gen-color);
    box-shadow: 0 0 30px var(--gen-color), 0 0 60px var(--gen-color);

    &::before {
      opacity: 0.3;
    }

    .gen-number {
      transform: scale(1.15);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
    }
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.gen-number {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--retro-font);
  font-size: 1.5rem;
  font-weight: 900;
  color: white;
  text-shadow: 3px 3px 6px rgba(0,0,0,0.8);
  box-shadow: 0 6px 20px rgba(0,0,0,0.5), inset 0 2px 6px rgba(255,255,255,0.3);
  transition: all 0.3s ease;
}

.gen-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  position: relative;
  z-index: 1;
}

.gen-region {
  font-family: var(--primary-font);
  font-size: 0.9rem;
  color: white;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
}

.gen-range {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  font-family: var(--retro-font);
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

@media (max-width: 768px) {
  .generation-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 0.8rem;
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
