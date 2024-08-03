// src/services/pokemonService.ts
import { MainClient, NamedAPIResource, Pokemon } from 'pokenode-ts'

const api = new MainClient()

export const getPokemonByName = async (name: string): Promise<Pokemon> => {
  try {
    return await api.pokemon.getPokemonByName(name)
  } catch (error) {
    console.error(`Failed to fetch Pokémon with name ${name}:`, error)
    throw error
  }
}

export const getPokemonListByNumber = async (num: number): Promise<NamedAPIResource[]> => {
  try {
    const data = await api.pokemon.listPokemons(0, num)
    return data.results
  } catch (error) {
    console.error(`Failed to fetch Pokémon list with number ${num}:`, error)
    throw error
  }
}

export const getMinimalPokemonDetails = async (urls: NamedAPIResource[]): Promise<{ id: number, name: string, image: string, types: string[] }[]> => {
  try {
    const promises = urls.map(async pokemon => {
      const response = await api.pokemon.getPokemonByName(pokemon.name)
      return {
        id: response.id,
        name: response.name,
        types: response.types.map(type => type.type.name),
        image: response.sprites.other?.['official-artwork']?.front_default || 'path/to/fallback/image.png',
      }
    })
    return await Promise.all(promises)
  } catch (error) {
    console.error('Failed to fetch minimal Pokémon details:', error)
    throw error
  }
}
