// /src/stores/pokemon.ts
import { defineStore } from 'pinia';
import { PokemonEntries } from '@/interfaces/PokemonEntries';
import { Pokemon } from '@/interfaces/Pokemon';
import { fetchPokemonsData } from '@/services/Pokemon';

export const usePokemonStore = defineStore('pokemons', () => {
  const pokemonList = ref<Pokemon[]>([]);
  const pokemonEntries = ref<PokemonEntries[]>([]);

  const fetchPokemonList = async (): Promise<void> => {
    const { pokemonList: fetchedPokemonList, pokemonEntries: fetchedPokemonEntries } =
      await fetchPokemonsData();
    pokemonList.value = fetchedPokemonList;
    pokemonEntries.value = fetchedPokemonEntries;
  };

  return { pokemonList, pokemonEntries, fetchPokemonList };
});
