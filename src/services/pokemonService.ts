// src/services/pokemonService.ts
import { MainClient } from 'pokenode-ts'

const api = new MainClient()

export const getPokemonByName = async (name: string) => {
  try {
    const data = await api.pokemon.getPokemonByName(name)
    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}
