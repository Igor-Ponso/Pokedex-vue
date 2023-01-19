import { PokemonEntries } from '@/interfaces/PokemonEntries';
import { reactive } from 'vue';
import { defineStore } from 'pinia';
import { Pokemon } from '@/interfaces/Pokemon';

export const usePokemonStore = defineStore('pokemons', () => {
  const pokemonList = reactive([] as Pokemon[]);
  const pokemonEntries = reactive([] as PokemonEntries[]);

  return { pokemonList, pokemonEntries };
});
