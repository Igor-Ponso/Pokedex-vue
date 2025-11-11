<script setup lang="ts">
import Cards from '@/components/Cards/Cards.vue';
import { Pokemon } from '@/interfaces/Pokemon';
import { usePokemonStore } from '@/stores/PokemonStore';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const pokemonStore = usePokemonStore();
const { favorites } = pokemonStore;

const favoritePokemons = computed(() => {
  return favorites.map(id => pokemonStore.getPokemonById(id)).filter((p: any) => p !== undefined) as unknown as Pokemon[];
});

const emit = defineEmits<{
  (e: 'select-pokemon', pokemon: Pokemon): void;
  (e: 'add-pokemon'): void;
}>();

const handlePokemonClick = (pokemon: Pokemon) => {
  emit('select-pokemon', pokemon);
};

const handleAddPokemon = () => {
  emit('add-pokemon');
};

const removeFavorite = (pokemonId: number) => {
  pokemonStore.toggleFavorite(pokemonId);
};

const isEmpty = computed(() => favoritePokemons.value.length === 0);
const isFull = computed(() => favoritePokemons.value.length >= 6);
</script>

<template>
  <div class="favorite-team">
    <div class="team-header">
      <h2 class="team-title">
        <span class="team-icon">⭐</span>
        {{ t('team.title') }}
        <span class="team-count">({{ favoritePokemons.length }}/6)</span>
      </h2>
      <div class="team-status">
        <span v-if="isEmpty" class="status-empty">{{ t('team.empty') }}</span>
        <span v-else-if="isFull" class="status-full">{{ t('team.full') }}</span>
      </div>
    </div>
    
    <div class="team-grid">
      <!-- Slots vazios com botão para adicionar -->
      <template v-for="i in 6" :key="`empty-${i}`">
        <button
          v-if="i > favoritePokemons.length"
          class="empty-slot"
          @click="handleAddPokemon"
          :aria-label="t('team.addPokemon')"
        >
          <div class="empty-icon">+</div>
          <span class="empty-text">{{ t('team.emptySlot') }}</span>
        </button>
      </template>
      
      <!-- Pokémons favoritos -->
      <Cards
        v-for="pokemon in favoritePokemons"
        :key="pokemon.id"
        :pokemon="pokemon"
        @click="handlePokemonClick(pokemon)"
        class="favorite-pokemon"
      />
    </div>
    
    <div v-if="favoritePokemons.length > 0" class="team-actions">
      <button class="clear-team-btn" @click="pokemonStore.favorites = []">
        {{ t('team.clear') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.favorite-team {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 2rem;
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.team-title {
  font-family: var(--retro-font);
  font-size: 1rem;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.team-icon {
  font-size: 1.2rem;
}

.team-count {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

.team-status {
  display: flex;
  align-items: center;
}

.status-empty,
.status-full {
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.3rem 0.8rem;
  border-radius: 0.5rem;
}

.status-empty {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.4);
}

.status-full {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.4);
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.empty-slot {
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  height: 18.5rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  color: white;
  font-family: var(--primary-font);

  &:hover {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.6);
    border-style: solid;
    transform: scale(1.02);

    .empty-icon {
      transform: rotate(90deg) scale(1.2);
      color: rgba(59, 130, 246, 0.9);
    }

    .empty-text {
      color: rgba(59, 130, 246, 0.9);
    }
  }

  &:active {
    transform: scale(0.98);
  }
}

.empty-icon {
  font-size: 2.5rem;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 300;
  transition: all 0.3s ease;
}

.empty-text {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
}

.favorite-pokemon {
  position: relative;
  
  &::after {
    content: '⭐';
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    font-size: 1rem;
    z-index: 10;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
  }
}

.team-actions {
  display: flex;
  justify-content: center;
}

.clear-team-btn {
  padding: 0.8rem 1.5rem;
  border: 1px solid rgba(255, 67, 87, 0.4);
  border-radius: 0.6rem;
  background: rgba(255, 67, 87, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  
  &:hover {
    background: rgba(255, 67, 87, 0.4);
    transform: translateY(-2px);
  }
}

@media (max-width: 768px) {
  .favorite-team {
    padding: 1rem;
  }
  
  .team-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .team-title {
    font-size: 0.9rem;
  }
  
  .team-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.8rem;
  }
  
  .empty-slot {
    height: 16rem;
  }
}
</style>