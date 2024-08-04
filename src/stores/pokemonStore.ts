// src/stores/pokemonStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { NamedAPIResource, Pokemon, PokemonSpecies } from 'pokenode-ts'
import { api } from '@/api/config'

export interface EnhancedPokemon extends Pokemon {
  speciesData?: PokemonSpecies;
  imageUrl?: string;
  shiny?: boolean;
}

export const usePokemonStore = defineStore('pokemon', () => {
  const pokemons = ref<EnhancedPokemon[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedPokemon = ref<string | null>(null)
  const isModalOpen = ref(false)
  const offset = ref(0)
  const limit = 30
  const isLoadingMore = ref(false)

  const getPokemonByName = async (name: string): Promise<EnhancedPokemon> => {
    const pokemon: Pokemon = await api.getPokemonByName(name)
    const species: PokemonSpecies = await api.getPokemonSpeciesByName(pokemon.species.name)
    const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`

    return { ...pokemon, speciesData: species, imageUrl, shiny: false }
  }

  const updatePokemonImage = (pokemon: EnhancedPokemon) => {
    pokemon.imageUrl = pokemon.shiny

      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemon.id}.png`
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`
  }

  const toggleShiny = (pokemon: EnhancedPokemon) => {
    pokemon.shiny = !pokemon.shiny
    updatePokemonImage(pokemon)
  }

  const getPokemonList = async (offset: number, limit: number): Promise<NamedAPIResource[]> => {
    try {
      const data = await api.listPokemons(offset, limit)
      return data.results
    } catch (error) {
      console.error(`Failed to fetch Pokémon list with offset ${offset} and limit ${limit}:`, error)
      throw error
    }
  }

  const fetchPokemons = async () => {
    try {
      if (offset.value === 0) {
        loading.value = true
      } else {
        isLoadingMore.value = true
      }

      const pokemonList = await getPokemonList(offset.value, limit)
      const detailedPokemonPromises = pokemonList.map(pokemon => getPokemonByName(pokemon.name))
      const detailedPokemons = await Promise.all(detailedPokemonPromises)
      pokemons.value.push(...detailedPokemons)
      offset.value += limit
    } catch (err) {
      error.value = 'Failed to fetch Pokémon.'
      console.error(error.value, err)
    } finally {
      loading.value = false
      isLoadingMore.value = false
    }
  }

  const searchPokemon = async (query: string): Promise<EnhancedPokemon[]> => {
    try {
      loading.value = true
      const result = await getPokemonByName(query.toLowerCase())
      return result ? [result] : []
    } catch (err) {
      error.value = 'Failed to search Pokémon.'
      console.error(error.value, err)
      return []
    } finally {
      loading.value = false
    }
  }

  const resetPagination = async () => {
    pokemons.value = []
    offset.value = 0
    await fetchPokemons()
  }

  const showPokemonDetails = (pokemonName: string) => {
    selectedPokemon.value = pokemonName
    isModalOpen.value = true
  }

  return {
    pokemons,
    loading,
    error,
    selectedPokemon,
    isModalOpen,
    fetchPokemons,
    toggleShiny,
    searchPokemon,
    resetPagination,
    showPokemonDetails,
    isLoadingMore,
  }
})
