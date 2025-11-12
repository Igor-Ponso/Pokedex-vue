<script setup lang="ts">
import Cards from '@/components/Cards/Cards.vue';
import FavoriteTeam from '@/components/Favorites/FavoriteTeam.vue';
import ModernFilters from '@/components/Filters/ModernFilters.vue';
import DarkModeToggle from '@/components/UI/DarkModeToggle.vue';
import LanguageSelector from '@/components/UI/LanguageSelector.vue';
import LoadingState from '@/components/UI/LoadingState.vue';
import TCGModeToggle from '@/components/UI/TCGModeToggle.vue';
import { useUIState } from '@/composables/useUIState';
import { useModalStore } from '@/stores/Modal';
import { usePokemonStore } from '@/stores/PokemonStore';
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Modal from './components/Modal/Modal.vue';

const { t } = useI18n();

  const modalStore = useModalStore();
  const { isOpen } = storeToRefs(modalStore);

  const pokemonStore = usePokemonStore();
  const { pokemons, loading, error, hasMore } = storeToRefs(pokemonStore);

  interface Filters {
    generation: number;
    types: string[];
    searchQuery: string;
  }

  const filters = ref<Filters>({
    generation: 1,
    types: [],
    searchQuery: ''
  });

  const uiState = useUIState();
  const { isLoading, isDarkMode, showToast, setLoading } = uiState;

  // Estado para controlar a vista (Pokedex ou Time Favorito)
  const showingFavorites = ref(false);

  const toggleView = (showFavorites: boolean) => {
    showingFavorites.value = showFavorites;
  };

  // Watch para mudanças nos filtros
  watch(
    filters,
    async (newFilters: Filters) => {
      pokemonStore.setGeneration(newFilters.generation);
      pokemonStore.setSelectedTypes(newFilters.types);
      await pokemonStore.setSearchQuery(newFilters.searchQuery);
    },
    { deep: true }
  );

  const handleCardClick = (pokemon: any) => {
    modalStore.isOpen = true;
    modalStore.pokemonData = pokemon;
    modalStore.pokemonId = pokemon.id;
  };

  const handleFavoriteClick = (pokemon: any) => {
    modalStore.isOpen = true;
    modalStore.pokemonData = pokemon;
    modalStore.pokemonId = pokemon.id;
  };

  const handleAddPokemon = () => {
    showingFavorites.value = false;
    showToast(t('team.addPokemon'), 'info', 3000, 'top-center');
  };
  
  // Simple scroll detection
  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
      if (hasMore.value && !loading.value) {
        pokemonStore.loadMore();
      }
    }
  };
  
onMounted(() => {
  pokemonStore.init();
  window.addEventListener('scroll', handleScroll);

  // Mostra toast de boas-vindas
  showToast(t('messages.welcome'), 'success', 5000, 'top-center');
});
</script>

<template>
  <div class="app-container" :class="{ 'dark-mode': isDarkMode }">
    <header class="app-header">
      <div class="header-content">
        <h1>{{ t('app.title') }}</h1>
        <p class="subtitle">{{ t('app.subtitle') }}</p>
        <div class="header-controls">
          <LanguageSelector />
          <TCGModeToggle />
          <DarkModeToggle v-model="isDarkMode" />
        </div>
      </div>
    </header>
    
    <main class="app-main">
      <div class="view-toggle">
        <button
          class="toggle-btn"
          :class="{ active: !showingFavorites }"
          @click="toggleView(false)"
        >
          {{ t('nav.pokedex') }}
        </button>
        <button
          class="toggle-btn"
          :class="{ active: showingFavorites }"
          @click="toggleView(true)"
        >
          {{ t('nav.favoriteTeam') }} ({{ pokemonStore.favorites.length }}/6)
        </button>
      </div>

      <div v-if="!showingFavorites">
        <ModernFilters
          v-model="filters"
          :loading="isLoading"
        />
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <LoadingState
          v-if="isLoading && pokemons.length === 0"
          loading
          :text="t('messages.loading')"
          type="api"
          size="large"
        />

        <div v-else-if="pokemons.length === 0 && !isLoading" class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>{{ t('messages.noPokemon') }}</h3>
          <p>{{ t('messages.tryAdjust') }}</p>
        </div>
        
        <div v-else id="card-area" class="pokemon-grid">
          <template v-for="pokemon in pokemons" :key="pokemon.id">
            <Cards
              :pokemon="pokemon"
              @click="handleCardClick(pokemon)"
            />
          </template>
          
          <!-- Loading no final da lista -->
          <LoadingState
            v-if="isLoading && pokemons.length > 0"
            loading
            :text="t('messages.loadingMore')"
            type="pokemon"
            size="small"
          />
        </div>
      </div>
      
      <FavoriteTeam
        v-else
        @select-pokemon="handleFavoriteClick"
        @add-pokemon="handleAddPokemon"
      />
    </main>

    <Teleport to="#modal">
      <Modal></Modal>
    </Teleport>
    
    <!-- Componentes globais de UI -->
    <LoadingState
      v-if="isLoading && pokemons.length === 0"
      loading
      :text="t('messages.loading')"
      type="initial"
      size="large"
    />
  </div>
</template>

<style lang="stylus" scoped>
  .app-container
    min-height 100vh
    display flex
    flex-direction column
    transition background-color 0.3s ease
    
    &.dark-mode
      background linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)
      color rgba(255, 255, 255, 0.95)
      
      .app-header
        .header-content
          h1
            color rgba(255, 255, 255, 0.95)
            text-shadow 0 0 10px rgba(255, 255, 255, 0.3)
      
      .toggle-btn
        background rgba(255, 255, 255, 0.1)
        border-color rgba(255, 255, 255, 0.2)
        color rgba(255, 255, 255, 0.9)
        
        &.active
          background rgba(59, 130, 246, 0.3)
          border-color rgba(59, 130, 246, 0.5)
          box-shadow 0 4px 12px rgba(59, 130, 246, 0.4)
      
      .pokemon-grid
        // Estilo mais suave para modo escuro
        &::before
          content ''
          position absolute
          top 0
          left 0
          right 0
          bottom 0
          background radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 70%)
          border-radius 1rem
          pointer-events none
    
  .app-header
    padding 2rem 1rem
    text-align center
    position relative

    .header-content
      display flex
      flex-direction column
      align-items center
      gap 0.5rem

      h1
        font-family var(--retro-font)
        font-size clamp(2rem, 5vw, 3rem)
        margin 0
        text-shadow 4px 4px 0px rgba(0,0,0,0.6)

      .subtitle
        font-size 1rem
        opacity 0.9
        margin 0

      .header-controls
        display flex
        align-items center
        gap 1rem
        margin-top 0.5rem
      
  .app-main
    flex 1
    padding 0 1rem 2rem
    max-width 100%
    overflow-x hidden
    box-sizing border-box
    
  .view-toggle
    display flex
    justify-content center
    gap 1rem
    margin-bottom 2rem
    
  .toggle-btn
    padding 0.8rem 1.5rem
    border 1px solid rgba(255, 255, 255, 0.3)
    border-radius 0.6rem
    background rgba(255, 255, 255, 0.1)
    color white
    cursor pointer
    transition all 0.3s ease
    font-weight 600
    font-family var(--primary-font)
    
    &:hover
      background rgba(255, 255, 255, 0.2)
      transform translateY(-2px)
      
    &.active
      background rgba(255, 255, 255, 0.3)
      border-color white
      box-shadow 0 4px 12px rgba(0, 0, 0, 0.3)
      
  .pokemon-grid
    display grid
    grid-template-columns repeat(auto-fill, minmax(280px, 1fr))
    gap 2rem
    justify-items center
    max-width 1400px
    margin 0 auto
    position relative
    
  .error-message
    background rgba(255, 67, 87, 0.2)
    border 1px solid rgba(255, 67, 87, 0.5)
    border-radius 0.8rem
    padding 1rem
    margin-bottom 2rem
    color white
    text-align center
    font-family var(--primary-font)
    
  .empty-state
    display flex
    flex-direction column
    align-items center
    justify-content center
    min-height 300px
    color white
    text-align center
    
    .empty-icon
      font-size 4rem
      margin-bottom 1rem
      
    h3
      font-family var(--retro-font)
      font-size 1.2rem
      margin-bottom 0.5rem
      
    p
      opacity 0.8
      font-size 1rem
    
  @media (max-width: 768px)
    .pokemon-grid
      grid-template-columns repeat(auto-fill, minmax(250px, 1fr))
      gap 1.5rem
      
  @media (max-width: 480px)
    .pokemon-grid
      grid-template-columns repeat(auto-fill, minmax(200px, 1fr))
      gap 1rem
      
    .app-header
      padding 1rem 0.5rem
      
      h1
        font-size 1.8rem
</style>
