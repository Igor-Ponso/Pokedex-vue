// /src/services/pokemon.ts
import { api } from '@/api/config';
import { useToast } from 'vue-toastification';

export const fetchPokemonsData = async () => {
  try {
    const pokemonEntriesRequests = [];
    const pokemonListRequests = [];

    for (let i = 1; i <= 151; i++) {
      pokemonEntriesRequests.push(fetchPokemonSpecies(i));
      pokemonListRequests.push(fetchPokemon(i));
    }

    const pokemonEntriesResponses = await Promise.all(pokemonEntriesRequests);
    const pokemonListResponses = await Promise.all(pokemonListRequests);

    return {
      pokemonEntries: pokemonEntriesResponses.map((response) => response.data),
      pokemonList: pokemonListResponses.map((response) => response.data),
    };
  } catch (err: any) {
    useToast().error(`Erro ao consultar os dados - ${err?.response?.status}`);
    throw err;
  }
};

export const fetchPokemonSpecies = (id: number) => {
  return api.get(`/pokemon-species/${id}`);
};

export const fetchPokemon = (id: number) => {
  return api.get(`/pokemon/${id}`);
};
