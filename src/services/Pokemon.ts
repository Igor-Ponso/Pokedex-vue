import { api } from '@/api/config';
import { useAppToast } from '@/composables/useAppToast';
import { usePokemonStore } from '@/stores/Pokemon';

export const fetchPokemonsData = async () => {
  try {
    for (let i = 1; i <= 151; i++) {
      await api.get('/pokemon-species/' + i).then((response) => {
        usePokemonStore().pokemonEntries.push(response.data);
      });

      await api.get('/pokemon/' + i).then((response) => {
        usePokemonStore().pokemonList.push(response.data);
      });
    }
  } catch (err: any) {
  useAppToast().error(`Erro ao consultar os dados - ${err?.response?.status}`);
  }
};

//const pokemons = ref([] as Pokemon[]);
//const pokemons = ref<Pokemon[]>([]); // * Other way for the same thing
