// src/stores/pokemonStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { NamedAPIResource, Pokemon } from 'pokenode-ts'
import { api } from '@/api/config'

export const usePokemonStore = defineStore('pokemon', () => {
  const pokemons = ref<Pokemon[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const selectedPokemon = ref<string | null>(null)
  const isModalOpen = ref(false)

  const getPokemonByName = async (name: string): Promise<Pokemon> => {
    try {
      return api.getPokemonByName(name)
    } catch (error) {
      console.error(`Failed to fetch Pokémon with name ${name}:`, error)
      throw error
    }
  }

  const getPokemonList = async (num: number): Promise<NamedAPIResource[]> => {
    try {
      const data = await api.listPokemons(0, num)
      return data.results
    } catch (error) {
      console.error(`Failed to fetch Pokémon list with number ${num}:`, error)
      throw error
    }
  }

  const fetchPokemons = async (num: number) => {
    try {
      loading.value = true
      const pokemonList = await getPokemonList(num)
      const detailedPokemonPromises = pokemonList.map(pokemon => getPokemonByName(pokemon.name))
      pokemons.value = await Promise.all(detailedPokemonPromises)
    } catch (err) {
      error.value = 'Failed to fetch Pokémon.'
      console.error(error.value, err)
    } finally {
      loading.value = false
    }
  }

  const showPokemonDetails = (pokemonName: string) => {
    selectedPokemon.value = pokemonName
    isModalOpen.value = true
  }

  return { pokemons, loading, error, selectedPokemon, isModalOpen, fetchPokemons, showPokemonDetails }
})
