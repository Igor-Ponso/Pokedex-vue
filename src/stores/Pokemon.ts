import { PokemonEntries } from '@/interfaces/PokemonEntries';
import { reactive, ref } from 'vue';
import { defineStore } from 'pinia';
import { Pokemon } from '@/interfaces/Pokemon';

export const usePokemonStore = defineStore('pokemons', () => {
  const pokemonList = reactive([] as Pokemon[]);
  const pokemonEntries = ref<PokemonEntries>();

  return { pokemonList, pokemonEntries };
});
