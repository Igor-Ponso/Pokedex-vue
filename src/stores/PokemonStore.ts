import { Pokemon } from '@/interfaces/Pokemon';
import { PokemonEntries } from '@/interfaces/PokemonEntries';
import { pokemonService } from '@/services/PokemonService';
import { fetchTCGCardByPokedexNumber, fetchTCGCardsByRange } from '@/services/PokemonTCGService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

interface PokemonWithSpecies extends Omit<Pokemon, 'species'> {
  species?: PokemonEntries;
}

export const usePokemonStore = defineStore('pokemon', () => {
  // Estado
  const pokemons = ref<PokemonWithSpecies[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentGeneration = ref(1);
  const searchQuery = ref('');
  const selectedTypes = ref<string[]>([]);
  const favorites = ref<number[]>([]);
  const tcgMode = ref(false); // Modo TCG desativado por padrão (Pokedex mode)

  // Paginação
  const offset = ref(0);
  const limit = ref(20);
  const hasMore = ref(true);

  // AbortController para cancelar requisições pendentes
  let currentAbortController: AbortController | null = null;
  
  // Computed
  const filteredPokemons = computed(() => {
    let filtered = pokemons.value;
    
    // Filtrar por busca
    if (searchQuery.value.trim()) {
      filtered = filtered.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        pokemon.id.toString().includes(searchQuery.value)
      );
    }
    
    // Filtrar por tipos
    if (selectedTypes.value.length > 0) {
      filtered = filtered.filter(pokemon =>
        pokemon.types.some(type => selectedTypes.value.includes(type.type.name))
      );
    }
    
    // Filtrar favoritos
    if (showFavoritesOnly.value) {
      filtered = filtered.filter(pokemon => favorites.value.includes(pokemon.id));
    }
    
    return filtered;
  });
  
  const showFavoritesOnly = computed(() => false); // TODO: Implementar controle de favoritos
  
  // Ações
  const fetchPokemons = async (reset = false) => {
    // Cancelar requisição anterior se existir
    if (currentAbortController) {
      console.log('🚫 Cancelando requisição anterior');
      currentAbortController.abort();
      currentAbortController = null;
    }

    if (loading.value && !reset) return;

    if (reset) {
      offset.value = 0;
      pokemons.value = [];
      hasMore.value = true;
    }

    if (!hasMore.value) return;

    // Criar novo AbortController para esta requisição
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;

    loading.value = true;
    error.value = null;

    try {
      // Verificar se foi abortado antes de começar
      if (signal.aborted) {
        console.log('⚠️ Requisição foi abortada antes de começar');
        return;
      }
      const newPokemons = await pokemonService.getPokemonsByGeneration(
        currentGeneration.value,
        offset.value,
        limit.value
      );
      
      if (reset) {
        pokemons.value = newPokemons as unknown as PokemonWithSpecies[];
      } else {
        pokemons.value.push(...(newPokemons as unknown as PokemonWithSpecies[]));
      }
      
      offset.value += newPokemons.length;
      hasMore.value = newPokemons.length === limit.value;

      // Verificar se foi abortado após buscar pokémons
      if (signal.aborted) {
        console.log('⚠️ Requisição abortada após buscar pokémons');
        return;
      }

      // Buscar TCG cards em batch se modo TCG estiver ativo E for Gen 1
      if (tcgMode.value && newPokemons.length > 0 && newPokemons[0].id <= 151) {
        const pokemonIds = newPokemons.map(p => p.id);
        const start = Math.min(...pokemonIds);
        const end = Math.max(...pokemonIds);

        console.log('🎴 Fetching TCG cards in batch:', { start, end, count: pokemonIds.length });

        // Buscar todos os TCG cards de uma vez
        const tcgCards = await fetchTCGCardsByRange(start, end);

        // Verificar se foi abortado após buscar TCG cards
        if (signal.aborted) {
          console.log('⚠️ Requisição abortada após buscar TCG cards');
          return;
        }

        // Aplicar os cards aos pokémons
        for (const pokemon of newPokemons) {
          const pokemonIndex = pokemons.value.findIndex(p => p.id === pokemon.id);
          if (pokemonIndex === -1) continue;

          const tcgCard = tcgCards.get(pokemon.id);
          if (tcgCard) {
            pokemons.value[pokemonIndex].tcgCard = tcgCard;
          }
        }
      }

      // Verificar se foi abortado antes de buscar species
      if (signal.aborted) {
        console.log('⚠️ Requisição abortada antes de buscar species');
        return;
      }

      // Buscar species para cada pokémon
      for (const pokemon of newPokemons) {
        const pokemonIndex = pokemons.value.findIndex(p => p.id === pokemon.id);
        if (pokemonIndex === -1) continue;

        // Buscar species
        const species = await pokemonService.getPokemonSpeciesById(pokemon.id);
        if (species) {
          pokemons.value[pokemonIndex].species = species;
        }

        // Verificar se foi abortado durante o loop
        if (signal.aborted) {
          console.log('⚠️ Requisição abortada durante busca de species');
          return;
        }
      }
    } catch (err: any) {
      // Ignorar erros de abort
      if (err.name === 'AbortError' || signal.aborted) {
        console.log('ℹ️ Requisição cancelada (esperado)');
        return;
      }
      error.value = err.message || 'Erro ao carregar pokémons';
    } finally {
      loading.value = false;
      currentAbortController = null;
    }
  };
  
  const loadMore = () => {
    if (!loading.value && hasMore.value) {
      fetchPokemons(false);
    }
  };
  
  const searchPokemons = async (query: string) => {
    if (!query.trim()) {
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const searchResults = await pokemonService.searchPokemons(query);

      // Buscar TCG cards em batch se modo TCG estiver ativo E houver Pokemon Gen 1
      if (tcgMode.value && searchResults.length > 0) {
        const gen1Pokemon = searchResults.filter(p => p.id <= 151);
        if (gen1Pokemon.length > 0) {
          const pokemonIds = gen1Pokemon.map(p => p.id);
          const start = Math.min(...pokemonIds);
          const end = Math.max(...pokemonIds);

          console.log('🎴 Fetching TCG cards in batch for search:', { start, end, count: gen1Pokemon.length });

          const tcgCards = await fetchTCGCardsByRange(start, end);

          // Aplicar os cards aos pokémons
          for (const pokemon of searchResults) {
            const tcgCard = tcgCards.get(pokemon.id);
            if (tcgCard) {
              (pokemon as any).tcgCard = tcgCard;
            }
          }
        }
      }

      // Adicionar species aos resultados
      for (const pokemon of searchResults) {
        const pokemonWithSpecies = pokemon as any;

        // Buscar species
        const species = await pokemonService.getPokemonSpeciesById(pokemon.id);
        if (species) {
          pokemonWithSpecies.species = species;
        }
      }

      pokemons.value = searchResults as unknown as PokemonWithSpecies[];
      hasMore.value = false;
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar pokémons';
    } finally {
      loading.value = false;
    }
  };
  
  const setGeneration = async (generation: number) => {
    console.log('🔄 setGeneration called:', generation);
    currentGeneration.value = generation;
    await fetchPokemons(true);
  };
  
  const setSearchQuery = async (query: string) => {
    searchQuery.value = query;
    
    if (query.trim()) {
      await searchPokemons(query);
    } else {
      await fetchPokemons(true);
    }
  };
  
  const setSelectedTypes = (types: string[]) => {
    selectedTypes.value = types;
  };
  
  const toggleFavorite = (pokemonId: number) => {
    const index = favorites.value.indexOf(pokemonId);
    if (index === -1) {
      if (favorites.value.length < 6) {
        favorites.value.push(pokemonId);
      } else {
        // TODO: Mostrar toast de limite máximo
        return;
      }
    } else {
      favorites.value.splice(index, 1);
    }
    
    // Persistir no localStorage
    localStorage.setItem('pokemon-favorites', JSON.stringify(favorites.value));
  };
  
  const isFavorite = (pokemonId: number) => {
    return favorites.value.includes(pokemonId);
  };
  
  const loadFavorites = () => {
    const saved = localStorage.getItem('pokemon-favorites');
    if (saved) {
      try {
        favorites.value = JSON.parse(saved);
      } catch (e) {
        favorites.value = [];
      }
    }
  };
  
  const getPokemonById = (id: number): PokemonWithSpecies | undefined => {
    return pokemons.value.find(p => p.id === id);
  };
  
  const clearCache = () => {
    pokemonService.clearCache();
  };

  const toggleTCGMode = async () => {
    const previousMode = tcgMode.value;
    tcgMode.value = !tcgMode.value;

    console.log('🎴 toggleTCGMode:', { previousMode, newMode: tcgMode.value, currentGen: currentGeneration.value });

    // Persistir no localStorage
    localStorage.setItem('pokemon-tcg-mode', JSON.stringify(tcgMode.value));

    // Recarregar Pokemon quando mudar o modo
    if (tcgMode.value !== previousMode) {
      console.log('🔄 Recarregando Pokemon devido a mudança de modo TCG');
      await fetchPokemons(true);
    }
  };

  const loadTCGMode = () => {
    const saved = localStorage.getItem('pokemon-tcg-mode');
    if (saved) {
      try {
        tcgMode.value = JSON.parse(saved);
      } catch (e) {
        tcgMode.value = false;
      }
    }
  };

  // Inicialização
  const init = async () => {
    loadFavorites();
    loadTCGMode();
    await fetchPokemons(true);
  };

  return {
    // Estado
    pokemons: filteredPokemons,
    loading,
    error,
    currentGeneration,
    searchQuery,
    selectedTypes,
    favorites,
    hasMore,
    tcgMode,

    // Ações
    fetchPokemons,
    loadMore,
    setGeneration,
    setSearchQuery,
    setSelectedTypes,
    toggleFavorite,
    isFavorite,
    getPokemonById,
    clearCache,
    toggleTCGMode,
    init
  };
});